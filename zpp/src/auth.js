'use strict';
/**
 * ZPP authentication.
 *
 * Model: bearer API keys, one per tenant.
 *
 *   Authorization: Bearer zpp_<owner>_<secret>
 *
 * Rules that matter, and why:
 *
 *  1. Only the SHA-256 of the key is stored. The plaintext is printed once, at
 *     mint time. A dumped database yields no usable credential.
 *
 *  2. `owner_id` is DERIVED from the verified key and never read from the
 *     request. If a client could name its own owner, tenant isolation would be
 *     decorative — this is the bug the `streams.owner_id` column invited.
 *
 *  3. Lookup is by exact hash match against a PRIMARY KEY index, so there is
 *     no timing-sensitive string comparison to get wrong. (If key lookup ever
 *     becomes a scan, add a dummy hash comparison here.)
 *
 *  4. Dev mode is opt-in and loud. ZPP_AUTH=dev accepts an `X-Dev-Owner`
 *     header so local UI work needs no key, but it is refused unless the
 *     environment explicitly asks for it, and /health reports it.
 *
 *  5. Keys can expire, and expiry is enforced in the LOOKUP QUERY rather than
 *     in a post-read comparison. An expired key must be indistinguishable from
 *     a key that never existed, and putting the predicate in the WHERE clause
 *     makes that true by construction: the row is simply not returned.
 *
 *  6. Rotation mints a successor and revokes the predecessor in ONE
 *     transaction. A crash between the two would otherwise either lock the
 *     tenant out or leave the old key live after the operator believed it was
 *     dead.
 */

const crypto = require('node:crypto');

const PREFIX = 'zpp';
const KEY_BYTES = 32;
/** Absent/0 means "never expires". Injected by configFromEnv. */
const DEFAULT_TTL_MS = 0;

function resolveTtl(ttlMs, nowMs) {
  const ttl = Number(ttlMs);
  if (!Number.isFinite(ttl) || ttl <= 0) return null;
  return new Date(nowMs + ttl).toISOString();
}

class AuthError extends Error {
  constructor(message, status = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

function hashKey(plaintext) {
  return crypto.createHash('sha256').update(String(plaintext), 'utf8').digest('hex');
}

/**
 * Mint a key. The returned plaintext is the only time it exists.
 *
 * `ttlMs` of 0/null/undefined means the key never expires, which is the
 * default because a silently-expiring credential is worse than a long-lived
 * one you can rotate deliberately.
 */
function mintKey(ownerId, label = '', { ttlMs = DEFAULT_TTL_MS, now = Date.now } = {}) {
  const owner = String(ownerId || '').trim();
  if (!owner) throw new TypeError('ownerId is required');
  if (owner.length > 100) throw new TypeError('ownerId too long');

  const secret = crypto.randomBytes(KEY_BYTES).toString('base64url');
  const plaintext = `${PREFIX}_${Buffer.from(owner, 'utf8').toString('base64url')}_${secret}`;
  const createdAtMs = now();
  return {
    plaintext,
    keyHash: hashKey(plaintext),
    ownerId: owner,
    label: String(label || '').slice(0, 200),
    createdAt: new Date(createdAtMs).toISOString(),
    expiresAt: resolveTtl(ttlMs, createdAtMs)
  };
}

function extractBearer(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

function createAuth(db, { mode = 'required', keyTtlMs = DEFAULT_TTL_MS, now = Date.now, bootstrapToken = '' } = {}) {
  if (mode !== 'required' && mode !== 'dev') {
    throw new TypeError(`unknown auth mode: ${mode}`);
  }

  /**
   * Accept the operator's bootstrap token.
   *
   * WHY THIS EXISTS. Minting a key normally requires an existing key, which
   * leaves a bootstrap paradox: nobody can get the first key. The obvious fix —
   * an open `POST /keys` — is a catastrophic authorisation bug, because
   * `owner_id` is the tenant boundary and minting lets the caller NAME it.
   * An open mint endpoint therefore means anyone on the internet could mint a
   * key for `alice` and read, append to, and delete Alice's campaigns. It is
   * not "registration"; it is a total bypass of tenant isolation.
   *
   * So first-key creation requires a secret only the operator holds, and the
   * owner is taken from the request body ONLY on this path. Every other path
   * derives the owner from the verified key, as always.
   *
   * Compared in constant time so the token cannot be recovered by timing.
   */
  function verifyBootstrap(plaintext) {
    if (!bootstrapToken || !plaintext) return false;
    const a = Buffer.from(String(plaintext), 'utf8');
    const b = Buffer.from(bootstrapToken, 'utf8');
    // timingSafeEqual throws on a length mismatch, so guard first. The length
    // of a submitted token is not itself a secret worth protecting.
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  }

  async function verifyKey(plaintext) {
    if (!plaintext) return null;
    // Expiry is part of the lookup, not a post-read check, so an expired key
    // and an unknown key produce exactly the same outcome: no row.
    const row = await db.get(
      `SELECT key_hash, owner_id, label, expires_at FROM api_keys
        WHERE key_hash = ? AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > ?)`,
      [hashKey(plaintext), new Date(now()).toISOString()]
    );
    if (!row) return null;
    // Best-effort usage stamp. Never fail a request because bookkeeping did.
    // Promise.resolve is required: the local driver returns a Number
    // synchronously, so a bare .catch() would throw on a non-Promise.
    Promise.resolve(
      db.run('UPDATE api_keys SET last_used_at = ? WHERE key_hash = ?', [
        new Date(now()).toISOString(), row.key_hash
      ])
    ).catch(() => {});
    return { ownerId: row.owner_id, label: row.label, expiresAt: row.expires_at || null };
  }

  /**
   * Resolve the caller. Returns `{ownerId, mode}`.
   * Throws AuthError (401) when a key is required but absent/invalid.
   */
  async function authenticate(req) {
    const bearer = extractBearer(req);

    if (bearer) {
      const found = await verifyKey(bearer);
      if (found) {
        return { ownerId: found.ownerId, mode: 'key', label: found.label, expiresAt: found.expiresAt };
      }
      // A key was presented and it was wrong. Do not silently fall through to
      // dev mode — that would turn a typo into an authentication bypass.
      // Expired and revoked keys land here too, deliberately: the caller is
      // told "invalid", not "expired", so a key's validity is not probeable.
      throw new AuthError('invalid API key');
    }

    if (mode === 'dev') {
      const owner = req.headers['x-dev-owner'];
      if (owner && typeof owner === 'string' && owner.trim()) {
        return { ownerId: owner.trim().slice(0, 100), mode: 'dev' };
      }
      return { ownerId: 'dev', mode: 'dev' };
    }

    throw new AuthError('missing bearer token');
  }

  /**
   * Resolve the caller for the key-management routes, which additionally accept
   * the operator's bootstrap token so the first key can exist.
   *
   * Order matters: a real key always wins, and a presented-but-wrong bearer is
   * still a hard failure. Only when there is NO bearer at all may the bootstrap
   * token be considered — otherwise holding any garbage credential would be
   * enough to reach the bootstrap path.
   */
  async function authenticateOrBootstrap(req) {
    const bearer = extractBearer(req);

    if (bearer) {
      const found = await verifyKey(bearer);
      if (found) {
        return { ownerId: found.ownerId, mode: 'key', label: found.label, expiresAt: found.expiresAt };
      }
      if (verifyBootstrap(bearer)) {
        return { ownerId: '', mode: 'boot' };
      }
      throw new AuthError('invalid API key');
    }

    if (bootstrapToken && verifyBootstrap(req.headers['x-bootstrap-token'])) {
      return { ownerId: '', mode: 'boot' };
    }

    return authenticate(req);
  }

  async function registerKey({ ownerId, label = '', ttlMs = keyTtlMs }) {
    const minted = mintKey(ownerId, label, { ttlMs, now });
    await db.run(
      'INSERT INTO api_keys (key_hash, owner_id, label, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
      [minted.keyHash, minted.ownerId, minted.label, minted.createdAt, minted.expiresAt]
    );
    return minted; // caller must surface .plaintext exactly once
  }

  async function revokeKey(keyHash) {
    const changed = await db.run(
      'UPDATE api_keys SET revoked_at = ? WHERE key_hash = ? AND revoked_at IS NULL',
      [new Date(now()).toISOString(), String(keyHash)]
    );
    return changed === 1;
  }

  /**
   * Mint a successor for `keyHash` and revoke the predecessor atomically.
   *
   * The lookup is scoped to unexpired, unrevoked rows, so you cannot rotate a
   * key you cannot currently use. Both writes share one transaction: an
   * operator who sees a failure knows neither half happened.
   */
  async function rotateKey({ keyHash, label, ttlMs = keyTtlMs }) {
    const hash = String(keyHash || '');
    if (!hash) throw new AuthError('keyHash is required', 400);

    return db.transaction(async () => {
      const row = await db.get(
        `SELECT key_hash, owner_id, label FROM api_keys
          WHERE key_hash = ? AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > ?)`,
        [hash, new Date(now()).toISOString()]
      );
      if (!row) {
        const err = new AuthError('key not found', 404);
        throw err;
      }

      const minted = mintKey(row.owner_id, label === undefined ? row.label : label, { ttlMs, now });
      await db.run(
        'INSERT INTO api_keys (key_hash, owner_id, label, created_at, expires_at) VALUES (?, ?, ?, ?, ?)',
        [minted.keyHash, minted.ownerId, minted.label, minted.createdAt, minted.expiresAt]
      );
      const revoked = await db.run(
        'UPDATE api_keys SET revoked_at = ? WHERE key_hash = ? AND revoked_at IS NULL',
        [new Date(now()).toISOString(), hash]
      );
      if (revoked !== 1) {
        // Lost the race with a concurrent revoke: roll back rather than leave
        // an un-revoked predecessor next to its successor.
        throw new AuthError('key changed during rotation', 409);
      }
      return { ...minted, rotatedFrom: hash };
    });
  }

  /**
   * Rotation restricted to keys the caller actually owns.
   *
   * rotateKey() above takes a bare hash, which is correct for a local admin
   * tool but wrong for an HTTP route: there, `keyHash` arrives from an
   * untrusted body. Scoping the lookup by owner_id means a caller who guesses
   * another tenant's hash gets the same 404 they'd get from any other missing
   * resource — no existence oracle, no cross-tenant revocation.
   */
  async function rotateKeyScoped({ ownerId, keyHash, label, ttlMs = keyTtlMs }) {
    const hash = String(keyHash || '');
    if (!hash) throw new AuthError('keyHash is required', 400);
    const owner = String(ownerId || '').trim();
    if (!owner) throw new AuthError('ownerId is required', 400);

    const row = await db.get(
      `SELECT key_hash FROM api_keys
        WHERE key_hash = ? AND owner_id = ?
          AND revoked_at IS NULL AND (expires_at IS NULL OR expires_at > ?)`,
      [hash, owner, new Date(now()).toISOString()]
    );
    if (!row) {
      // 404, not 403: an unknown key and someone else's key must look alike.
      throw new AuthError('key not found', 404);
    }
    return rotateKey({ keyHash: hash, label, ttlMs });
  }

  async function listKeys(ownerId) {
    const rows = await db.all(
      `SELECT key_hash, owner_id, label, created_at, last_used_at, expires_at, revoked_at
         FROM api_keys WHERE owner_id = ? ORDER BY created_at ASC`,
      [String(ownerId)]
    );
    const nowIso = new Date(now()).toISOString();
    // `status` is derived, not stored: three booleans that drift out of sync
    // with each other are worse than one field the caller can trust.
    return rows.map((row) => ({
      ...row,
      status: row.revoked_at
        ? 'revoked'
        : (row.expires_at && row.expires_at <= nowIso ? 'expired' : 'active')
    }));
  }

  return {
    mode,
    keyTtlMs,
    hasBootstrapToken: Boolean(bootstrapToken),
    hashKey,
    mintKey,
    registerKey,
    revokeKey,
    rotateKey,
    rotateKeyScoped,
    listKeys,
    verifyKey,
    verifyBootstrap,
    authenticate,
    authenticateOrBootstrap,
    AuthError
  };
}

function bootstrapTokenFromEnv(env = process.env) {
  return String(env.ZPP_BOOTSTRAP_TOKEN || '');
}

function keyTtlFromEnv(env = process.env) {
  const raw = env.ZPP_KEY_TTL_MS;
  if (raw === undefined || raw === '') return DEFAULT_TTL_MS;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_TTL_MS;
}

module.exports = {
  createAuth, mintKey, hashKey, extractBearer, keyTtlFromEnv,
  bootstrapTokenFromEnv, AuthError, PREFIX, DEFAULT_TTL_MS
};
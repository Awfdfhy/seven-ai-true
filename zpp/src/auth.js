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
 */

const crypto = require('node:crypto');

const PREFIX = 'zpp';
const KEY_BYTES = 32;

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

/** Mint a key. The returned plaintext is the only time it exists. */
function mintKey(ownerId, label = '') {
  const owner = String(ownerId || '').trim();
  if (!owner) throw new TypeError('ownerId is required');
  if (owner.length > 100) throw new TypeError('ownerId too long');

  const secret = crypto.randomBytes(KEY_BYTES).toString('base64url');
  const plaintext = `${PREFIX}_${Buffer.from(owner, 'utf8').toString('base64url')}_${secret}`;
  return {
    plaintext,
    keyHash: hashKey(plaintext),
    ownerId: owner,
    label: String(label || '').slice(0, 200)
  };
}

function extractBearer(req) {
  const header = req.headers.authorization || req.headers.Authorization;
  if (!header || typeof header !== 'string') return null;
  const match = /^Bearer\s+(.+)$/i.exec(header.trim());
  return match ? match[1].trim() : null;
}

function createAuth(db, { mode = 'required' } = {}) {
  if (mode !== 'required' && mode !== 'dev') {
    throw new TypeError(`unknown auth mode: ${mode}`);
  }

  async function verifyKey(plaintext) {
    if (!plaintext) return null;
    const row = await db.get(
      'SELECT key_hash, owner_id, label FROM api_keys WHERE key_hash = ? AND revoked_at IS NULL',
      [hashKey(plaintext)]
    );
    if (!row) return null;
    // Best-effort usage stamp. Never fail a request because bookkeeping did.
    // Promise.resolve is required: the local driver returns a Number
    // synchronously, so a bare .catch() would throw on a non-Promise.
    Promise.resolve(
      db.run('UPDATE api_keys SET last_used_at = ? WHERE key_hash = ?', [
        new Date().toISOString(), row.key_hash
      ])
    ).catch(() => {});
    return { ownerId: row.owner_id, label: row.label };
  }

  /**
   * Resolve the caller. Returns `{ownerId, mode}`.
   * Throws AuthError (401) when a key is required but absent/invalid.
   */
  async function authenticate(req) {
    const bearer = extractBearer(req);

    if (bearer) {
      const found = await verifyKey(bearer);
      if (found) return { ownerId: found.ownerId, mode: 'key', label: found.label };
      // A key was presented and it was wrong. Do not silently fall through to
      // dev mode — that would turn a typo into an authentication bypass.
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

  async function registerKey({ ownerId, label = '' }) {
    const minted = mintKey(ownerId, label);
    await db.run(
      'INSERT INTO api_keys (key_hash, owner_id, label, created_at) VALUES (?, ?, ?, ?)',
      [minted.keyHash, minted.ownerId, minted.label, new Date().toISOString()]
    );
    return minted; // caller must surface .plaintext exactly once
  }

  async function revokeKey(keyHash) {
    const changed = await db.run(
      'UPDATE api_keys SET revoked_at = ? WHERE key_hash = ? AND revoked_at IS NULL',
      [new Date().toISOString(), String(keyHash)]
    );
    return changed === 1;
  }

  async function listKeys(ownerId) {
    return db.all(
      'SELECT key_hash, owner_id, label, created_at, last_used_at, revoked_at FROM api_keys WHERE owner_id = ? ORDER BY created_at ASC',
      [String(ownerId)]
    );
  }

  return {
    mode,
    hashKey,
    mintKey,
    registerKey,
    revokeKey,
    listKeys,
    verifyKey,
    authenticate,
    AuthError
  };
}

module.exports = { createAuth, mintKey, hashKey, extractBearer, AuthError, PREFIX };
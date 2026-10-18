'use strict';
/**
 * Server hardening: rate limiting, CORS, key expiry and rotation.
 *
 * The rule these tests exist to enforce is that every new control is CLOSED by
 * default and cannot be widened by an untrusted input:
 *
 *   - no ZPP_CORS_ORIGINS  -> no Access-Control-* header at all
 *   - no ZPP_KEY_TTL_MS    -> keys never expire (deliberate, not accidental)
 *   - a body ttlMs          -> clamped to MAX_KEY_TTL_MS, never trusted
 *   - a body keyHash        -> resolved against the caller's own owner
 *
 * Time is injected rather than slept on. A rate-limit test that waits 1.1s of
 * wall clock is a test that is slow on a fast machine and flaky on a loaded
 * one; an injected clock makes the refill assertion exact.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { openDb } = require('../src/db');
const { createStore } = require('../src/store');
const { createAuth } = require('../src/auth');
const { createApp } = require('../src/server');
const { createRateLimiter, clientKey, rateLimitHeaders, limiterConfigFromEnv } = require('../src/ratelimit');
const { createCors } = require('../src/cors');

function as(key, extra = {}) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, ...extra };
}

async function harness({ mode = 'required', keyTtlMs = 0, now, limits, cors, ownerId = 'alice' } = {}) {
  const db = await openDb({ file: ':memory:' });
  const store = createStore(db);
  const auth = createAuth(db, { mode, keyTtlMs, ...(now ? { now } : {}) });
  const key = await auth.registerKey({ ownerId, label: 'primary' });
  const server = http.createServer(createApp(store, auth, { limits, cors }));
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    db, store, auth, server, base, key,
    teardown: async () => {
      await new Promise((r) => server.close(r));
      await db.close();
    }
  };
}

// =====================================================================
// rate limiter
// =====================================================================

test('ratelimit: capacity is a hard ceiling, not a suggestion', () => {
  let now = 1000;
  const limiter = createRateLimiter({ capacity: 5, refillPerSec: 1, now: () => now });

  for (let i = 0; i < 5; i++) {
    assert.equal(limiter.take('k').ok, true, `request ${i + 1} of 5 must pass`);
  }
  const denied = limiter.take('k');
  assert.equal(denied.ok, false);
  assert.ok(denied.retryAfterMs > 0, 'a denial must say how long to wait');
});

test('ratelimit: refills at the sustained rate', () => {
  let now = 1000;
  const limiter = createRateLimiter({ capacity: 2, refillPerSec: 1, now: () => now });

  assert.equal(limiter.take('k').ok, true);
  assert.equal(limiter.take('k').ok, true);
  assert.equal(limiter.take('k').ok, false);

  now += 1000; // one second at 1/s == one token
  assert.equal(limiter.take('k').ok, true, 'one second must buy exactly one token');
  assert.equal(limiter.take('k').ok, false, 'and not a second one');
});

test('ratelimit: a long stall cannot buy more than capacity', () => {
  let now = 1000;
  const limiter = createRateLimiter({ capacity: 3, refillPerSec: 1, now: () => now });

  for (let i = 0; i < 3; i++) limiter.take('k');
  now += 3_600_000; // an hour
  let granted = 0;
  for (let i = 0; i < 10; i++) if (limiter.take('k').ok) granted++;
  assert.equal(granted, 3, 'an hour of idling must not grant 3600 tokens');
});

test('ratelimit: buckets are per key', () => {
  const limiter = createRateLimiter({ capacity: 1, refillPerSec: 1, now: () => 0 });
  assert.equal(limiter.take('alice').ok, true);
  assert.equal(limiter.take('alice').ok, false);
  assert.equal(limiter.take('bob').ok, true, 'one tenant must not throttle another');
});

test('ratelimit: a denied request does not deepen the debt', () => {
  let now = 0;
  const limiter = createRateLimiter({ capacity: 1, refillPerSec: 1, now: () => now });
  limiter.take('k');
  for (let i = 0; i < 50; i++) limiter.take('k'); // hammer while empty
  now += 1000;
  assert.equal(limiter.take('k').ok, true, 'retry storms must not extend the penalty');
});

test('ratelimit: config is read from the environment, bad values fall back', () => {
  const good = limiterConfigFromEnv({ ZPP_RATE_CAPACITY: '50', ZPP_RATE_REFILL_PER_SEC: '3', ZPP_TRUST_PROXY: '1' });
  assert.equal(good.capacity, 50);
  assert.equal(good.refillPerSec, 3);
  assert.equal(good.trustProxy, true);

  const junk = limiterConfigFromEnv({ ZPP_RATE_CAPACITY: 'lots', ZPP_RATE_REFILL_PER_SEC: '-4' });
  assert.equal(junk.capacity, 120, 'a non-numeric capacity must not become NaN');
  assert.equal(junk.refillPerSec, 2, 'a negative rate must not become a permanently dead bucket');
});

test('ratelimit: x-forwarded-for is ignored unless the operator opted in', () => {
  const req = {
    headers: { 'x-forwarded-for': '1.2.3.4' },
    socket: { remoteAddress: '10.0.0.9' }
  };
  assert.equal(clientKey(req), 'ip:10.0.0.9', 'an untrusted header must not steer the bucket');
  assert.equal(clientKey(req, { trustProxy: true }), 'ip:1.2.3.4');
});

test('ratelimit: headers advertise the limit and the retry delay', () => {
  const headers = rateLimitHeaders({ ok: false, limit: 10, remaining: 0, resetMs: 2000, retryAfterMs: 2000 });
  assert.equal(headers['RateLimit-Limit'], '10');
  assert.equal(headers['RateLimit-Remaining'], '0');
  assert.equal(headers['Retry-After'], '2');

  const allowed = rateLimitHeaders({ ok: true, limit: 10, remaining: 9, resetMs: 1000, retryAfterMs: 0 });
  assert.equal(allowed['Retry-After'], undefined, 'a passing request must not advertise a retry');
});

// =====================================================================
// CORS
// =====================================================================

test('cors: closed by default', () => {
  const cors = createCors({ origins: undefined, env: {} });
  assert.deepEqual(cors.headersFor('https://evil.example'), {});
  assert.equal(cors.isAllowed('https://evil.example'), false);
  assert.equal(cors.preflight({ method: 'OPTIONS' }, 'https://evil.example').status, 403);
});

test('cors: allowlist matches, and only matches', () => {
  const cors = createCors({ origins: 'https://app.example, https://admin.example' });
  assert.equal(cors.isAllowed('https://app.example'), true);
  assert.equal(cors.isAllowed('https://admin.example'), true);
  assert.equal(cors.isAllowed('https://app.example.evil.com'), false, 'prefix matching would be a hole');
  assert.equal(cors.isAllowed('https://other.example'), false);

  const h = cors.headersFor('https://app.example');
  assert.equal(h['Access-Control-Allow-Origin'], 'https://app.example');
  assert.equal(h.Vary, 'Origin', 'a shared cache must key on Origin');
  assert.match(h['Access-Control-Expose-Headers'], /ETag/, 'clients need ETag for optimistic concurrency');
  assert.equal(h['Access-Control-Allow-Credentials'], undefined,
    'no cookies are used, so credentialed CORS must never be advertised');
});

test('cors: trailing slashes are normalised', () => {
  const cors = createCors({ origins: 'https://app.example' });
  assert.equal(cors.isAllowed('https://app.example/'), true);
  assert.equal(cors.headersFor('https://app.example/')['Access-Control-Allow-Origin'], 'https://app.example');
});

test('cors: wildcard is opt-in and answered with *', () => {
  const cors = createCors({ origins: '*' });
  assert.equal(cors.anyOriginAllowed, true);
  assert.equal(cors.headersFor('https://anything.example')['Access-Control-Allow-Origin'], '*');
  assert.equal(cors.preflight({ method: 'OPTIONS' }, 'https://anything.example').status, 204);
});

test('cors: preflight is only for OPTIONS', () => {
  const cors = createCors({ origins: '*' });
  assert.equal(cors.preflight({ method: 'GET' }, 'https://a.example'), null);
});

test('http: OPTIONS preflight is answered without credentials', async () => {
  const h = await harness({ cors: createCors({ origins: 'https://app.example' }) });
  try {
    const res = await fetch(`${h.base}/v1/streams`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://app.example', 'Access-Control-Request-Method': 'POST' }
    });
    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://app.example');
    assert.match(res.headers.get('access-control-allow-methods'), /POST/);
    assert.match(res.headers.get('access-control-allow-headers'), /authorization/i);
  } finally { await h.teardown(); }
});

test('http: preflight from a disallowed origin is 403, and not rate charged', async () => {
  const ipLimiter = createRateLimiter({ capacity: 1, refillPerSec: 0.001, now: () => 0 });
  const h = await harness({ cors: createCors({ origins: 'https://app.example' }), limits: { ip: ipLimiter } });
  try {
    const res = await fetch(`${h.base}/v1/streams`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.example' }
    });
    assert.equal(res.status, 403);
    // If preflight were charged, a real request would already be throttled.
    const after = await fetch(`${h.base}/health`);
    assert.equal(after.status, 200, 'a preflight must not consume the request budget');
  } finally { await h.teardown(); }
});

test('http: CORS headers ride along on real responses', async () => {
  const h = await harness({ cors: createCors({ origins: 'https://app.example' }) });
  try {
    const res = await fetch(`${h.base}/v1/streams`, { headers: as(h.key.plaintext, { Origin: 'https://app.example' }) });
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'https://app.example');
  } finally { await h.teardown(); }
});

// =====================================================================
// key expiry
// =====================================================================

test('expiry: a key with no TTL never expires', async () => {
  const db = await openDb({ file: ':memory:' });
  try {
    const auth = createAuth(db, { keyTtlMs: 0 });
    const k = await auth.registerKey({ ownerId: 'alice' });
    assert.equal(k.expiresAt, null);
    const row = await db.get('SELECT expires_at FROM api_keys WHERE key_hash = ?', [k.keyHash]);
    assert.equal(row.expires_at, null);
  } finally { await db.close(); }
});

test('expiry: a key stops verifying the moment it lapses', async () => {
  let now = Date.parse('2026-01-01T00:00:00.000Z');
  const db = await openDb({ file: ':memory:' });
  try {
    const auth = createAuth(db, { now: () => now });
    const k = await auth.registerKey({ ownerId: 'alice', ttlMs: 1000 });

    assert.ok(await auth.verifyKey(k.plaintext), 'valid before expiry');
    now += 999;
    assert.ok(await auth.verifyKey(k.plaintext), 'still valid one ms before expiry');
    now += 2;
    assert.equal(await auth.verifyKey(k.plaintext), null, 'expired keys must not verify');
  } finally { await db.close(); }
});

test('expiry: an expired key is indistinguishable from one that never existed', async () => {
  let now = Date.parse('2026-01-01T00:00:00.000Z');
  const db = await openDb({ file: ':memory:' });
  try {
    const auth = createAuth(db, { now: () => now });
    const lapsed = await auth.registerKey({ ownerId: 'alice', ttlMs: 1000 });
    now += 5000;

    const unknown = await auth.verifyKey('zpp_alice_this-key-never-existed');
    const expired = await auth.verifyKey(lapsed.plaintext);
    assert.equal(expired, unknown, 'the same outcome for both, or expiry becomes a probe');
    assert.equal(expired, null);
  } finally { await db.close(); }
});

test('expiry: an expired key does not authenticate', async () => {
  let now = Date.parse('2026-01-01T00:00:00.000Z');
  const h = await harness({ now: () => now });
  try {
    const short = await h.auth.registerKey({ ownerId: 'alice', ttlMs: 1000 });
    const before = await fetch(`${h.base}/v1/streams`, { headers: as(short.plaintext) });
    assert.equal(before.status, 200);

    now += 5000;
    const after = await fetch(`${h.base}/v1/streams`, { headers: as(short.plaintext) });
    assert.equal(after.status, 401, 'an expired key is a 401, not a silent anonymous caller');
  } finally { await h.teardown(); }
});

test('expiry: listKeys derives status rather than storing it', async () => {
  let now = Date.parse('2026-01-01T00:00:00.000Z');
  const db = await openDb({ file: ':memory:' });
  try {
    const auth = createAuth(db, { now: () => now });
    const forever = await auth.registerKey({ ownerId: 'alice', label: 'forever' });
    const brief = await auth.registerKey({ ownerId: 'alice', label: 'brief', ttlMs: 1000 });
    await auth.revokeKey(forever.keyHash);

    now += 5000;
    const keys = await auth.listKeys('alice');
    const byLabel = Object.fromEntries(keys.map((k) => [k.label, k.status]));
    assert.equal(byLabel.forever, 'revoked');
    assert.equal(byLabel.brief, 'expired');

    const live = await auth.registerKey({ ownerId: 'alice', label: 'live' });
    const liveKeys = await auth.listKeys('alice');
    // listKeys rows are raw SQL columns, so the field is key_hash. The HTTP
    // layer adds a keyHash alias; assert both spellings resolve to one value.
    assert.equal(liveKeys.find((k) => k.key_hash === live.keyHash).status, 'active');
  } finally { await db.close(); }
});

test('expiry: a client cannot request a key longer-lived than the ceiling', async () => {
  const h = await harness({ keyTtlMs: 0 });
  try {
    const res = await fetch(`${h.base}/v1/streams/__keys`, {
      method: 'POST',
      headers: as(h.key.plaintext),
      body: JSON.stringify({ label: 'greedy', ttlMs: 10 ** 15 })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    const maxTtl = 365 * 24 * 60 * 60 * 1000;
    const granted = Date.parse(body.expiresAt) - Date.parse(body.createdAt);
    assert.ok(granted <= maxTtl, `granted ${granted}ms, ceiling is ${maxTtl}ms`);
  } finally { await h.teardown(); }
});

test('expiry: a non-numeric ttlMs falls back to server policy', async () => {
  const h = await harness({ keyTtlMs: 60_000 });
  try {
    const res = await fetch(`${h.base}/v1/streams/__keys`, {
      method: 'POST',
      headers: as(h.key.plaintext),
      body: JSON.stringify({ label: 'junk', ttlMs: 'forever' })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.expiresAt, 'server policy must still apply');
  } finally { await h.teardown(); }
});

// =====================================================================
// rotation
// =====================================================================

test('rotate: mints a successor and revokes the predecessor', async () => {
  const db = await openDb({ file: ':memory:' });
  try {
    const auth = createAuth(db);
    const first = await auth.registerKey({ ownerId: 'alice', label: 'laptop' });
    const second = await auth.rotateKey({ keyHash: first.keyHash });

    assert.notEqual(second.plaintext, first.plaintext);
    assert.equal(second.rotatedFrom, first.keyHash);
    assert.equal(second.label, 'laptop', 'the label carries over unless overridden');
    assert.equal(await auth.verifyKey(first.plaintext), null, 'the old key must be dead immediately');
    assert.ok(await auth.verifyKey(second.plaintext), 'the new key must work');

    const keys = await auth.listKeys('alice');
    assert.equal(keys.filter((k) => k.status === 'active').length, 1);
  } finally { await db.close(); }
});

test('rotate: label and TTL can be overridden', async () => {
  let now = Date.parse('2026-01-01T00:00:00.000Z');
  const db = await openDb({ file: ':memory:' });
  try {
    const auth = createAuth(db, { now: () => now });
    const first = await auth.registerKey({ ownerId: 'alice', label: 'old' });
    const second = await auth.rotateKey({ keyHash: first.keyHash, label: 'new', ttlMs: 5000 });
    assert.equal(second.label, 'new');
    assert.equal(second.expiresAt, new Date(now + 5000).toISOString());
  } finally { await db.close(); }
});

test('rotate: an unknown or already-revoked key 404s and mints nothing', async () => {
  const db = await openDb({ file: ':memory:' });
  try {
    const auth = createAuth(db);
    await assert.rejects(() => auth.rotateKey({ keyHash: 'nope' }), (e) => e.status === 404);

    const k = await auth.registerKey({ ownerId: 'alice' });
    await auth.revokeKey(k.keyHash);
    await assert.rejects(() => auth.rotateKey({ keyHash: k.keyHash }), (e) => e.status === 404);
    assert.equal((await auth.listKeys('alice')).length, 1, 'no stray successor was written');
  } finally { await db.close(); }
});

test('rotate: a missing keyHash is a 400, not a lookup', async () => {
  const db = await openDb({ file: ':memory:' });
  try {
    const auth = createAuth(db);
    await assert.rejects(() => auth.rotateKey({}), (e) => e.status === 400);
  } finally { await db.close(); }
});

test('rotate: one tenant cannot rotate another tenant key', async () => {
  const db = await openDb({ file: ':memory:' });
  try {
    const auth = createAuth(db);
    const bob = await auth.registerKey({ ownerId: 'bob' });

    // Scoped lookup must refuse before the unscoped rotate ever runs.
    await assert.rejects(
      () => auth.rotateKeyScoped({ ownerId: 'alice', keyHash: bob.keyHash }),
      (e) => e.status === 404
    );
    await assert.rejects(
      () => auth.rotateKeyScoped({ ownerId: 'alice', keyHash: 'does-not-exist' }),
      (e) => e.status === 404,
      'a foreign key and a missing key must be indistinguishable'
    );
    assert.ok(await auth.verifyKey(bob.plaintext), "bob's key must survive alice's attempt");
  } finally { await db.close(); }
});

test('rotate: an expired key cannot be rotated', async () => {
  let now = Date.parse('2026-01-01T00:00:00.000Z');
  const db = await openDb({ file: ':memory:' });
  try {
    const auth = createAuth(db, { now: () => now });
    const k = await auth.registerKey({ ownerId: 'alice', ttlMs: 1000 });
    now += 5000;
    await assert.rejects(() => auth.rotateKeyScoped({ ownerId: 'alice', keyHash: k.keyHash }), (e) => e.status === 404);
  } finally { await db.close(); }
});

test('rotate: over HTTP, the successor works and the predecessor 401s', async () => {
  const h = await harness();
  try {
    const listed = await (await fetch(`${h.base}/v1/streams/__keys`, { headers: as(h.key.plaintext) })).json();
    const row = listed.keys.find((k) => k.label === 'primary');
    // Both spellings must resolve, so a client can round-trip a hash from
    // either the mint response or the list response.
    assert.equal(row.key_hash, row.keyHash, 'the HTTP layer must alias both spellings');

    const res = await fetch(`${h.base}/v1/streams/__keys/rotate`, {
      method: 'POST',
      headers: as(h.key.plaintext),
      body: JSON.stringify({ keyHash: row.keyHash })
    });
    assert.equal(res.status, 201);
    const body = await res.json();
    assert.ok(body.key.startsWith('zpp_'));
    assert.equal(body.rotatedFrom, row.keyHash);

    assert.equal((await fetch(`${h.base}/v1/streams`, { headers: as(body.key) })).status, 200, 'successor must work');
    assert.equal((await fetch(`${h.base}/v1/streams`, { headers: as(h.key.plaintext) })).status, 401, 'predecessor must be dead');
  } finally { await h.teardown(); }
});

test('rotate: over HTTP, another tenant key is 404 not 403', async () => {
  const h = await harness({ ownerId: 'alice' });
  try {
    const bob = await h.auth.registerKey({ ownerId: 'bob' });
    const res = await fetch(`${h.base}/v1/streams/__keys/rotate`, {
      method: 'POST',
      headers: as(h.key.plaintext),
      body: JSON.stringify({ keyHash: bob.keyHash })
    });
    assert.equal(res.status, 404);
    assert.ok(await h.auth.verifyKey(bob.plaintext), "bob's key must be untouched");
  } finally { await h.teardown(); }
});

// =====================================================================
// rate limiting over HTTP
// =====================================================================

test('http: the owner limiter throttles and reports a retry delay', async () => {
  const owner = createRateLimiter({ capacity: 2, refillPerSec: 0.001, now: () => 0 });
  const h = await harness({ limits: { owner } });
  try {
    assert.equal((await fetch(`${h.base}/v1/streams`, { headers: as(h.key.plaintext) })).status, 200);
    assert.equal((await fetch(`${h.base}/v1/streams`, { headers: as(h.key.plaintext) })).status, 200);

    const denied = await fetch(`${h.base}/v1/streams`, { headers: as(h.key.plaintext) });
    assert.equal(denied.status, 429);
    assert.equal((await denied.json()).scope, 'owner');
    assert.ok(Number(denied.headers.get('retry-after')) >= 1);
    assert.equal(denied.headers.get('ratelimit-limit'), '2');
  } finally { await h.teardown(); }
});

test('http: one tenant exhausting its quota does not throttle another', async () => {
  const owner = createRateLimiter({ capacity: 1, refillPerSec: 0.001, now: () => 0 });
  const h = await harness({ limits: { owner } });
  try {
    const bob = await h.auth.registerKey({ ownerId: 'bob' });
    assert.equal((await fetch(`${h.base}/v1/streams`, { headers: as(h.key.plaintext) })).status, 200);
    assert.equal((await fetch(`${h.base}/v1/streams`, { headers: as(h.key.plaintext) })).status, 429);
    assert.equal((await fetch(`${h.base}/v1/streams`, { headers: as(bob.plaintext) })).status, 200);
  } finally { await h.teardown(); }
});

test('http: the ip limiter bites before authentication', async () => {
  const ip = createRateLimiter({ capacity: 1, refillPerSec: 0.001, now: () => 0 });
  const h = await harness({ limits: { ip } });
  try {
    // No credential at all: the second attempt is throttled on IP alone, so
    // brute-forcing bearer tokens costs the attacker their connection budget.
    assert.equal((await fetch(`${h.base}/v1/streams`)).status, 401);
    const throttled = await fetch(`${h.base}/v1/streams`);
    assert.equal(throttled.status, 429);
    assert.equal((await throttled.json()).scope, 'ip');
  } finally { await h.teardown(); }
});

test('http: /health stays reachable for liveness probes', async () => {
  const owner = createRateLimiter({ capacity: 1, refillPerSec: 0.001, now: () => 0 });
  const h = await harness({ limits: { owner, ip: createRateLimiter({ capacity: 100, refillPerSec: 1 }) } });
  try {
    assert.equal((await fetch(`${h.base}/v1/streams`, { headers: as(h.key.plaintext) })).status, 200);
    assert.equal((await fetch(`${h.base}/v1/streams`, { headers: as(h.key.plaintext) })).status, 429);
    // A probe must not be starved by tenant traffic, or the orchestrator will
    // restart a healthy pod.
    for (let i = 0; i < 3; i++) {
      assert.equal((await fetch(`${h.base}/health`)).status, 200);
    }
  } finally { await h.teardown(); }
});

test('http: /health reports the hardening configuration', async () => {
  const h = await harness({ keyTtlMs: 86_400_000, cors: createCors({ origins: 'https://app.example' }) });
  try {
    const body = await (await fetch(`${h.base}/health`)).json();
    assert.equal(body.keyTtlMs, 86_400_000);
    assert.deepEqual(body.cors, ['https://app.example']);
    assert.equal(body.rateLimit.owner, null, 'no limiter was passed to this harness');
  } finally { await h.teardown(); }
});

// =====================================================================
// migrations
// =====================================================================

test('migration: an api_keys table created before expires_at is upgraded', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zpp-migrate-'));
  const file = path.join(dir, 'legacy.sqlite');
  try {
    // Simulate a pre-expiry deployment: the old four-column table.
    const { DatabaseSync } = require('node:sqlite');
    const legacy = new DatabaseSync(file);
    legacy.exec(`
      CREATE TABLE api_keys (
        key_hash     TEXT    PRIMARY KEY,
        owner_id     TEXT    NOT NULL,
        label        TEXT    NOT NULL DEFAULT '',
        created_at   TEXT    NOT NULL,
        last_used_at TEXT,
        revoked_at   TEXT
      );
    `);
    legacy.close();

    const db = await openDb({ file }); // migrate:true is the default
    try {
      const cols = await db.all('PRAGMA table_info(api_keys)');
      assert.ok(cols.some((c) => c.name === 'expires_at'), 'the column must have been added');

      // And the upgraded table must actually accept a keyed insert.
      const auth = createAuth(db);
      const k = await auth.registerKey({ ownerId: 'alice', ttlMs: 1000 });
      assert.ok(await auth.verifyKey(k.plaintext));
    } finally { await db.close(); }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('migration: opening the same database twice is idempotent', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'zpp-migrate2-'));
  const file = path.join(dir, 'twice.sqlite');
  try {
    const first = await openDb({ file });
    await first.close();
    // The second open re-runs every migration against a table that already
    // has the column; that must be a no-op, not an error.
    const second = await openDb({ file });
    try {
      const auth = createAuth(second);
      assert.ok(await auth.registerKey({ ownerId: 'alice' }));
    } finally { await second.close(); }
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

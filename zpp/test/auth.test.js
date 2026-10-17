'use strict';
/**
 * Authentication and tenant isolation.
 *
 * The tests that matter most here are the negative ones: a valid key from
 * tenant B must not be able to touch tenant A's stream, and a client must not
 * be able to nominate its own owner by putting it in the request body. Those
 * are the two ways the `streams.owner_id` column could have been decorative.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

const { openDb } = require('../src/db');
const { createStore } = require('../src/store');
const { createAuth, mintKey, hashKey } = require('../src/auth');
const { createApp } = require('../src/server');

async function harness({ mode = 'required' } = {}) {
  const db = await openDb({ file: ':memory:' });
  const store = createStore(db);
  const auth = createAuth(db, { mode });
  const alice = await auth.registerKey({ ownerId: 'alice', label: 'alice laptop' });
  const bob = await auth.registerKey({ ownerId: 'bob', label: 'bob phone' });
  const server = http.createServer(createApp(store, auth));
  await new Promise((r) => server.listen(0, r));
  const base = `http://127.0.0.1:${server.address().port}`;
  const teardown = async () => {
    await new Promise((r) => server.close(r));
    await db.close();
  };
  return { db, store, auth, server, base, alice, bob, teardown };
}

const SEED = { sessionId: 'iso', world: { locations: { keep: { id: 'keep' } } } };
const EVENT = { type: 'world.set', source: 'user', payload: { path: 'weather.state', value: 'rain' } };

function as(key) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
}

// =====================================================================
// key material
// =====================================================================

test('mint: key embeds its owner and is unguessable', () => {
  const a = mintKey('alice');
  const b = mintKey('alice');
  assert.ok(a.plaintext.startsWith('zpp_'));
  assert.notEqual(a.plaintext, b.plaintext, 'two keys must never collide');
  assert.equal(a.keyHash, hashKey(a.plaintext));
  // The owner is recoverable from the key itself, so the server needs no
  // lookup to know who is calling before it verifies.
  const encoded = a.plaintext.split('_')[1];
  assert.equal(Buffer.from(encoded, 'base64url').toString('utf8'), 'alice');
});

test('mint: rejects an empty owner', () => {
  assert.throws(() => mintKey(''), /ownerId is required/);
  assert.throws(() => mintKey('  '), /ownerId is required/);
});

test('store: only the hash is persisted, never the plaintext', async () => {
  const { db, alice, teardown } = await harness();
  try {
    const row = await db.get('SELECT * FROM api_keys WHERE key_hash = ?', [alice.keyHash]);
    assert.equal(row.owner_id, 'alice');
    assert.equal(row.label, 'alice laptop');
    assert.equal(row.revoked_at, null);

    // Sweep every column: the plaintext must appear nowhere.
    const dump = JSON.stringify(await db.all('SELECT * FROM api_keys'));
    assert.ok(!dump.includes(alice.plaintext), 'plaintext key leaked into the database');
  } finally {
    await teardown();
  }
});

test('auth: a revoked key stops working immediately', async () => {
  const { auth, alice, teardown } = await harness();
  try {
    assert.ok(await auth.verifyKey(alice.plaintext));
    assert.equal(await auth.revokeKey(alice.keyHash), true);
    assert.equal(await auth.verifyKey(alice.plaintext), null);
    // Revoking twice is not an error.
    assert.equal(await auth.revokeKey(alice.keyHash), false);
  } finally {
    await teardown();
  }
});

// =====================================================================
// authentication
// =====================================================================

test('http: no credentials -> 401', async () => {
  const { base, teardown } = await harness();
  try {
    const res = await fetch(`${base}/v1/streams`);
    assert.equal(res.status, 401);
  } finally {
    await teardown();
  }
});

test('http: a wrong key -> 401, and does not fall through to dev mode', async () => {
  const { base, teardown } = await harness({ mode: 'dev' });
  try {
    // Dev mode would happily accept X-Dev-Owner. A presented-but-invalid key
    // must still fail, otherwise a typo becomes an auth bypass.
    const res = await fetch(`${base}/v1/streams`, {
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer zpp_bogus_key', 'X-Dev-Owner': 'alice' }
    });
    assert.equal(res.status, 401);
  } finally {
    await teardown();
  }
});

test('http: /health is public and reports the auth mode', async () => {
  const { base, teardown } = await harness();
  try {
    const res = await fetch(`${base}/health`);
    assert.equal(res.status, 200);
    assert.equal((await res.json()).auth, 'required');
  } finally {
    await teardown();
  }
});

// =====================================================================
// tenant isolation — the reason this whole file exists
// =====================================================================

test('tenant isolation: owner comes from the token, never the body', async () => {
  const { base, alice, teardown } = await harness();
  try {
    const res = await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: as(alice.plaintext),
      // Alice tries to create a stream owned by Bob.
      body: JSON.stringify({ id: 'c1', ownerId: 'bob', seed: SEED })
    });
    assert.equal(res.status, 201);

    const mine = await (await fetch(`${base}/v1/streams`, { headers: as(alice.plaintext) })).json();
    assert.equal(mine.streams.length, 1);
    assert.equal(mine.streams[0].owner_id, 'alice', 'body ownerId must be ignored');
  } finally {
    await teardown();
  }
});

test('tenant isolation: bob cannot read, write, verify or rebuild alice\'s stream', async () => {
  const { base, alice, bob, teardown } = await harness();
  try {
    await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: as(alice.plaintext),
      body: JSON.stringify({ id: 'alice-stream', seed: SEED })
    });

    // Read
    assert.equal((await fetch(`${base}/v1/streams/alice-stream`, { headers: as(bob.plaintext) })).status, 404);
    // List — Bob must not see it
    const bobList = await (await fetch(`${base}/v1/streams`, { headers: as(bob.plaintext) })).json();
    assert.equal(bobList.streams.length, 0);
    // Write
    const write = await fetch(`${base}/v1/streams/alice-stream/events`, {
      method: 'POST',
      headers: as(bob.plaintext),
      body: JSON.stringify({ event: EVENT })
    });
    assert.equal(write.status, 404);
    // History
    assert.equal((await fetch(`${base}/v1/streams/alice-stream/events`, { headers: as(bob.plaintext) })).status, 404);
    // Verify + rebuild + rejections
    assert.equal((await fetch(`${base}/v1/streams/alice-stream/verify`, { headers: as(bob.plaintext) })).status, 404);
    assert.equal((await fetch(`${base}/v1/streams/alice-stream/rebuild`, { method: 'POST', headers: as(bob.plaintext) })).status, 404);
    assert.equal((await fetch(`${base}/v1/streams/alice-stream/rejections`, { headers: as(bob.plaintext) })).status, 404);

    // Alice's stream is untouched by all of that.
    const check = await (await fetch(`${base}/v1/streams/alice-stream`, { headers: as(alice.plaintext) })).json();
    assert.equal(check.revision, 0);
  } finally {
    await teardown();
  }
});

test('tenant isolation: cross-tenant access is 404, not 403', async () => {
  const { base, alice, bob, teardown } = await harness();
  try {
    await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: as(alice.plaintext),
      body: JSON.stringify({ id: 'secret', seed: SEED })
    });
    const res = await fetch(`${base}/v1/streams/secret`, { headers: as(bob.plaintext) });
    // 403 would confirm the id exists, turning the id space into an
    // enumeration oracle.
    assert.equal(res.status, 404);
    assert.equal((await res.json()).error, 'not found');
  } finally {
    await teardown();
  }
});

test('tenant isolation: stream ids are global, so a second tenant cannot claim one', async () => {
  const { base, alice, bob, teardown } = await harness();
  try {
    await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: as(alice.plaintext),
      body: JSON.stringify({ id: 'shared-id', seed: SEED })
    });
    const steal = await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: as(bob.plaintext),
      body: JSON.stringify({ id: 'shared-id', seed: SEED })
    });
    // 409, not 201. Otherwise Bob could squat predictable ids.
    assert.equal(steal.status, 409);
  } finally {
    await teardown();
  }
});

// =====================================================================
// dev mode
// =====================================================================

test('dev mode: X-Dev-Owner scopes without a key, and still isolates', async () => {
  const { base, teardown } = await harness({ mode: 'dev' });
  try {
    const created = await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Dev-Owner': 'carol' },
      body: JSON.stringify({ id: 'devstream', seed: SEED })
    });
    assert.equal(created.status, 201);

    const write = await fetch(`${base}/v1/streams/devstream/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Dev-Owner': 'carol' },
      body: JSON.stringify({ event: EVENT })
    });
    assert.equal(write.status, 200);

    // A different dev owner is still a different tenant.
    const other = await fetch(`${base}/v1/streams/devstream`, {
      headers: { 'X-Dev-Owner': 'mallory' }
    });
    assert.equal(other.status, 404);
  } finally {
    await teardown();
  }
});

// =====================================================================
// key management
// =====================================================================

test('http: a tenant can mint and list its own keys', async () => {
  const { base, alice, bob, teardown } = await harness();
  try {
    const minted = await fetch(`${base}/v1/streams/__keys`, {
      method: 'POST',
      headers: as(alice.plaintext),
      body: JSON.stringify({ label: 'alice tablet' })
    });
    assert.equal(minted.status, 201);
    const { key, warning } = await minted.json();
    assert.ok(key.startsWith('zpp_'));
    assert.match(warning, /cannot be recovered/);

    // The new key works and is scoped to Alice.
    const viaNew = await fetch(`${base}/v1/streams`, { headers: as(key) });
    assert.equal(viaNew.status, 200);
    const created = await fetch(`${base}/v1/streams`, {
      method: 'POST', headers: as(key), body: JSON.stringify({ id: 'k', seed: SEED })
    });
    assert.equal(created.status, 201);

    // Bob's key list must not contain Alice's keys.
    const bobKeys = await (await fetch(`${base}/v1/streams/__keys`, { headers: as(bob.plaintext) })).json();
    assert.equal(bobKeys.keys.length, 1);
    assert.equal(bobKeys.keys[0].owner_id, 'bob');
  } finally {
    await teardown();
  }
});

test('http: key rows never expose the secret', async () => {
  const { base, alice, teardown } = await harness();
  try {
    const body = await (await fetch(`${base}/v1/streams/__keys`, { headers: as(alice.plaintext) })).json();
    assert.ok(!JSON.stringify(body).includes(alice.plaintext));
    assert.ok(body.keys[0].key_hash); // the hash is exposed; that is safe and useful
  } finally {
    await teardown();
  }
});
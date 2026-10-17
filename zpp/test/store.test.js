'use strict';
/**
 * ZPP store + API tests.
 *
 * Run: node --test zpp/test/
 *
 * These run against local SQLite with zero credentials, on purpose. The whole
 * reason this schema was designed around plain SQLite is that CI must exercise
 * the same code path production uses against Turso. A test suite that needs a
 * signup to run is a test suite that does not run — which is exactly how
 * RPG-01-10 and RPG-07-15 ended up permanently BLOCKED.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const { openDb } = require('../src/db');
const { createStore } = require('../src/store');
const { createApp } = require('../src/server');

async function freshStore() {
  const db = await openDb({ file: ':memory:' });
  return { db, store: createStore(db) };
}

// A seed with real locations so world.set / character.move can commit.
const SEED = {
  sessionId: 'test',
  world: { locations: { tavern: { id: 'tavern' }, keep: { id: 'keep' } } },
  characters: { c1: { control: 'ai', identity: { name: 'Ari' }, locationId: 'tavern' } }
};

const WORLD_SET = (value) => ({
  type: 'world.set',
  source: 'user',
  summary: `set weather to ${value}`,
  payload: { path: 'weather.state', value }
});

// =====================================================================
// driver
// =====================================================================

test('driver: normalises booleans and rejects non-finite numbers', async () => {
  const { db } = await freshStore();
  assert.equal(db.run('SELECT ? AS a', [true]), 0);          // INSERT/DELETE reports 0 rows
  const row = db.get('SELECT ? AS a, ? AS b', [true, false]);
  assert.equal(row.a, 1);
  assert.equal(row.b, 0);
  assert.throws(() => db.get('SELECT ?', [NaN]), /non-finite/);
  await db.close();
});

// =====================================================================
// streams
// =====================================================================

test('createStream: starts at revision 0 with an empty ledger', async () => {
  const { store } = await freshStore();
  const s = await store.createStream({ id: 'camp-1', seed: SEED });
  assert.equal(s.revision, 0);
  assert.equal(s.state.schema, 'seven-rpg-state');
  assert.equal(s.state.ledger.length, 0);

  const read = await store.readStream('camp-1');
  assert.equal(read.revision, 0);
  assert.equal(read.etag, '"0"');
});

test('createStream: rejects a duplicate id rather than clobbering it', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'dup', seed: SEED });
  await assert.rejects(() => store.createStream({ id: 'dup', seed: SEED }), /already exists/);
});

test('createStream: requires an id', async () => {
  const { store } = await freshStore();
  await assert.rejects(() => store.createStream({}), /id is required/);
});

// =====================================================================
// append + optimistic concurrency
// =====================================================================

test('append: commits, advances revision by exactly one, records the event', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'c', seed: SEED });

  const r = await store.append('c', WORLD_SET('rain'));
  assert.equal(r.ok, true);
  assert.equal(r.status, 'COMMITTED');
  assert.equal(r.revision, 1);
  assert.equal(r.state.revision, 1);
  assert.equal(r.state.world.weather.state, 'rain');
  assert.equal(r.state.ledger.length, 1);

  const hist = await store.history('c');
  assert.equal(hist.length, 1);
  assert.equal(hist[0].type, 'world.set');
  assert.equal(hist[0].stream_version, 1);
});

test('append: stale expectedVersion is refused and state is untouched', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'c', seed: SEED });
  await store.append('c', WORLD_SET('rain'));

  const stale = await store.append('c', WORLD_SET('snow'), { expectedVersion: 0 });
  assert.equal(stale.ok, false);
  assert.equal(stale.status, 'CONFLICT');
  assert.equal(stale.reason, 'revision-mismatch');
  assert.equal(stale.revision, 1);
  assert.equal(stale.expectedVersion, 0);

  // The rejected write must not have leaked into state.
  const read = await store.readStream('c');
  assert.equal(read.revision, 1);
  assert.equal(read.state.world.weather.state, 'rain');
});

test('append: correct expectedVersion succeeds', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'c', seed: SEED });
  await store.append('c', WORLD_SET('rain'));
  const r = await store.append('c', WORLD_SET('snow'), { expectedVersion: 1 });
  assert.equal(r.ok, true);
  assert.equal(r.revision, 2);
});

test('append: null expectedVersion means "no check"', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'c', seed: SEED });
  const a = await store.append('c', WORLD_SET('rain'), { expectedVersion: null });
  const b = await store.append('c', WORLD_SET('snow'), { expectedVersion: null });
  assert.equal(a.revision, 1);
  assert.equal(b.revision, 2);
});

test('append: unknown stream returns NOT_FOUND instead of throwing', async () => {
  const { store } = await freshStore();
  const r = await store.append('nope', WORLD_SET('rain'));
  assert.equal(r.status, 'NOT_FOUND');
  assert.equal(r.ok, false);
});

// =====================================================================
// the test that motivated driver serialisation
// =====================================================================

test('concurrency: exactly one of N racing writers wins; losers get CONFLICT', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'race', seed: SEED });

  const results = await Promise.all(
    Array.from({ length: 8 }, (_, i) =>
      store.append('race', WORLD_SET(`value-${i}`), { expectedVersion: 0 })
    )
  );

  const winners = results.filter((r) => r.ok);
  const losers = results.filter((r) => r.status === 'CONFLICT');

  assert.equal(winners.length, 1, 'exactly one writer may commit');
  assert.equal(losers.length, 7, 'every other writer must be told it conflicted');
  assert.equal(winners[0].revision, 1);

  // The invariant that makes the log replayable: events PK is (stream, version),
  // so there can be exactly one row at revision 1 and no gaps.
  const hist = await store.history('race', { limit: 1000 });
  assert.equal(hist.length, 1);
  assert.equal(hist[0].stream_version, 1);

  const read = await store.readStream('race');
  assert.equal(read.revision, 1);
  assert.equal(read.state.world.weather.state, winners[0].state.world.weather.state);
});

test('concurrency: sequential writers with correct versions all commit', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'seq', seed: SEED });
  for (let i = 0; i < 5; i += 1) {
    const cur = await store.readStream('seq');
    const r = await store.append('seq', WORLD_SET(`v${i}`), { expectedVersion: cur.revision });
    assert.equal(r.ok, true, `append ${i} should commit`);
    assert.equal(r.revision, i + 1);
  }
  const read = await store.readStream('seq');
  assert.equal(read.revision, 5);
  assert.equal(read.state.world.weather.state, 'v4');
});

// =====================================================================
// engine refusals
// =====================================================================

test('engine BLOCKED: nothing is written, revision holds, rejection is audited', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'b', seed: SEED });

  const r = await store.append('b', { type: 'does.not.exist', source: 'user', payload: {} });
  assert.equal(r.ok, false);
  assert.equal(r.status, 'BLOCKED');
  assert.equal(r.reason, 'unsupported-event-type');
  assert.equal(r.revision, 0);

  const read = await store.readStream('b');
  assert.equal(read.revision, 0, 'a refused event must not advance revision');
  assert.equal((await store.history('b')).length, 0, 'a refused event must not enter the log');

  const rej = await store.rejections('b');
  assert.equal(rej.length, 1);
  assert.equal(rej[0].reason, 'unsupported-event-type');
  assert.equal(rej[0].revision, 0);
});

test('engine BLOCKED: player-control protection is enforced server-side', async () => {
  const { store } = await freshStore();
  await store.createStream({
    id: 'pc',
    seed: { ...SEED, characters: { p1: { control: 'player', identity: { name: 'Rin' } } } }
  });

  // source !== 'user' must not be able to move a player-controlled character.
  const r = await store.append('pc', {
    type: 'character.move', source: 'ai', payload: { characterId: 'p1', locationId: 'keep' }
  });
  assert.equal(r.ok, false);
  assert.equal(r.status, 'BLOCKED');
  assert.equal(r.reason, 'player-control');
  assert.equal((await store.readStream('pc')).revision, 0);
});

// =====================================================================
// replay / projection integrity
// =====================================================================

test('replay: reproduces the snapshot exactly from the log alone', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'rp', seed: SEED });
  for (const v of ['rain', 'snow', 'fog']) {
    const cur = await store.readStream('rp');
    await store.append('rp', WORLD_SET(v), { expectedVersion: cur.revision });
  }

  const snapshot = await store.readStream('rp');
  const replayed = await store.replay('rp');

  assert.equal(replayed.applied, 3);
  assert.equal(replayed.revision, snapshot.revision);
  assert.deepEqual(replayed.state.world.weather.state, snapshot.state.world.weather.state);
  assert.equal(replayed.state.ledger.length, 3);

  // verify=true must agree with the stored projection.
  const verified = await store.readStream('rp', { verify: true });
  assert.equal(verified.revision, snapshot.revision);
});

test('verify: detects a snapshot that has drifted from the log', async () => {
  const { db, store } = await freshStore();
  await store.createStream({ id: 'drift', seed: SEED });
  const cur = await store.readStream('drift');
  await store.append('drift', WORLD_SET('rain'), { expectedVersion: cur.revision });

  // Simulate the snapshot being corrupted behind the store's back.
  await db.run('UPDATE streams SET snapshot = ? WHERE id = ?', [
    JSON.stringify({ ...cur.state, world: { ...cur.state.world, weather: { state: 'apocalypse' } } }),
    'drift'
  ]);

  await assert.rejects(
    () => store.readStream('drift', { verify: true }),
    (err) => err.status === 409 && /does not match event log/.test(err.message)
  );
});

test('rebuild: repairs drift from the log and reports it', async () => {
  const { db, store } = await freshStore();
  await store.createStream({ id: 'rb', seed: SEED });
  for (const v of ['rain', 'snow']) {
    const cur = await store.readStream('rb');
    await store.append('rb', WORLD_SET(v), { expectedVersion: cur.revision });
  }

  await db.run('UPDATE streams SET snapshot = ? WHERE id = ?', [
    JSON.stringify({ ...(await store.readStream('rb')).state, turn: 999 }),
    'rb'
  ]);

  const res = await store.rebuild('rb');
  assert.equal(res.repaired, true);
  assert.ok(res.drift.length > 0);
  assert.equal(res.revision, 2);

  const after = await store.readStream('rb', { verify: true });
  assert.equal(after.state.world.weather.state, 'snow');
  assert.notEqual(after.state.turn, 999);
});

test('rebuild: refuses to paper over a truncated log', async () => {
  const { db, store } = await freshStore();
  await store.createStream({ id: 'trunc', seed: SEED });
  for (const v of ['rain', 'snow']) {
    const cur = await store.readStream('trunc');
    await store.append('trunc', WORLD_SET(v), { expectedVersion: cur.revision });
  }

  // Lose the tail of the log while leaving the revision counter at 2.
  await db.run('DELETE FROM events WHERE stream_id = ? AND stream_version > 1', ['trunc']);

  await assert.rejects(
    () => store.rebuild('trunc'),
    (err) => err.status === 409 && /truncated or corrupt/.test(err.message)
  );
});

// =====================================================================
// history / listing
// =====================================================================

test('history: paginates and stays bounded', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'h', seed: SEED });
  for (let i = 0; i < 5; i += 1) {
    const cur = await store.readStream('h');
    await store.append('h', WORLD_SET(`v${i}`), { expectedVersion: cur.revision });
  }
  assert.equal((await store.history('h', { from: 1, limit: 2 })).length, 2);
  assert.equal((await store.history('h', { from: 4, limit: 100 })).length, 2);
  assert.equal((await store.history('h', { from: 1, limit: 99999 })).length, 5, 'limit is clamped');
});

test('listStreams: newest first, owner filtered', async () => {
  const { store } = await freshStore();
  await store.createStream({ id: 'a', ownerId: 'u1', seed: SEED });
  await store.createStream({ id: 'b', ownerId: 'u2', seed: SEED });
  assert.deepEqual((await store.listStreams({ ownerId: 'u2' })).map((s) => s.id), ['b']);
  assert.equal((await store.listStreams({})).length, 2);
});

test('health: reports driver and engine identity', async () => {
  const { store } = await freshStore();
  const h = await store.health();
  assert.equal(h.ok, true);
  assert.equal(h.driver, 'local');
  assert.equal(h.engineSchema, 'seven-rpg-state');
});

// =====================================================================
// HTTP layer
// =====================================================================

async function withServer(fn) {
  const { store, db } = await freshStore();
  const server = await new Promise((resolve) => {
    const s = require('node:http').createServer(createApp(store));
    s.listen(0, () => resolve(s));
  });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    await fn({ base, store });
  } finally {
    await new Promise((r) => server.close(r));
    await db.close();
  }
}

test('http: ETag on read, If-Match on write, 409 on stale write', async () => {
  await withServer(async ({ base }) => {
    await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'h1', seed: SEED })
    });

    const created = await fetch(`${base}/v1/streams/h1`);
    assert.equal(created.status, 200);
    assert.equal(created.headers.get('etag'), '"0"');

    const okWrite = await fetch(`${base}/v1/streams/h1/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'If-Match': '"0"' },
      body: JSON.stringify({ event: WORLD_SET('rain') })
    });
    assert.equal(okWrite.status, 200);
    assert.equal(okWrite.headers.get('etag'), '"1"');

    const stale = await fetch(`${base}/v1/streams/h1/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'If-Match': '"0"' },
      body: JSON.stringify({ event: WORLD_SET('snow') })
    });
    assert.equal(stale.status, 409);
    const body = await stale.json();
    assert.equal(body.status, 'CONFLICT');
    assert.equal(body.revision, 1, '409 must tell the client the current revision');

    // Unquoted and W/ weak forms must also parse.
    const weak = await fetch(`${base}/v1/streams/h1/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'If-Match': 'W/"1"' },
      body: JSON.stringify({ event: WORLD_SET('snow') })
    });
    assert.equal(weak.status, 200);
  });
});

test('http: engine refusal is 422 and leaves the revision alone', async () => {
  await withServer(async ({ base }) => {
    await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'h2', seed: SEED })
    });

    const res = await fetch(`${base}/v1/streams/h2/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event: { type: 'nope.nope', payload: {} } })
    });
    assert.equal(res.status, 422);
    const body = await res.json();
    assert.equal(body.status, 'BLOCKED');
    assert.equal(body.reason, 'unsupported-event-type');

    const after = await fetch(`${base}/v1/streams/h2`);
    assert.equal(after.headers.get('etag'), '"0"');
  });
});

test('http: 404 for unknown stream, 404 for unknown route, 400 for bad JSON', async () => {
  await withServer(async ({ base }) => {
    assert.equal((await fetch(`${base}/v1/streams/ghost`)).status, 404);
    assert.equal((await fetch(`${base}/v1/nonsense`)).status, 404);

    const bad = await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json'
    });
    assert.equal(bad.status, 400);
  });
});

test('http: health and verify endpoints', async () => {
  await withServer(async ({ base }) => {
    const health = await (await fetch(`${base}/health`)).json();
    assert.equal(health.ok, true);

    await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'h3', seed: SEED })
    });
    const cur = await (await fetch(`${base}/v1/streams/h3`)).json();
    await fetch(`${base}/v1/streams/h3/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'If-Match': `"${cur.revision}"` },
      body: JSON.stringify({ event: WORLD_SET('rain') })
    });

    assert.equal((await fetch(`${base}/v1/streams/h3/verify`)).status, 200);
    assert.equal((await fetch(`${base}/v1/streams/h3/events`)).status, 200);
    assert.equal((await fetch(`${base}/v1/streams/h3/rejections`)).status, 200);
    assert.equal((await fetch(`${base}/v1/streams/h3/rebuild`, { method: 'POST' })).status, 200);
  });
});

test('http: oversized body is rejected with 413', async () => {
  await withServer(async ({ base }) => {
    // Just over the 1 MB cap. Kept small deliberately: the server replies 413
    // early, and pushing a much larger blob just makes fetch keep writing into
    // a socket nobody is draining.
    const res = await fetch(`${base}/v1/streams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'big', seed: { blob: 'x'.repeat(1024 * 1024 + 4096) } })
    });
    assert.equal(res.status, 413);
  });
});
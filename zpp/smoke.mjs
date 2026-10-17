#!/usr/bin/env node
'use strict';
/**
 * End-to-end smoke test against a RUNNING server.
 *
 *   node zpp/smoke.mjs [baseUrl] [apiKey]
 *
 * Complements the unit suite: those tests exercise the store directly, this one
 * exercises the real HTTP surface a client would use — ETag round-trip, the
 * 409 conflict path, the 422 engine-refusal path, and cold-replay integrity
 * over the wire.
 *
 * Pass an API key as the second argument, or set ZPP_API_KEY. Without one the
 * auth assertions are reported as SKIP rather than silently passing, because a
 * green smoke test that never tested authentication is worse than no smoke test.
 */

const BASE = process.argv[2] || process.env.ZPP_URL || 'http://127.0.0.1:8787';
const KEY = process.argv[3] || process.env.ZPP_API_KEY || '';

const SEED = {
  sessionId: 'demo',
  world: { locations: { tavern: { id: 'tavern' }, keep: { id: 'keep' } } },
  characters: { c1: { control: 'ai', identity: { name: 'Ari' }, locationId: 'tavern' } }
};

let failures = 0;
let skips = 0;

function check(label, condition, detail) {
  const ok = Boolean(condition);
  if (!ok) failures += 1;
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail === undefined ? '' : `  -> ${detail}`}`);
}

function skip(label, why) {
  skips += 1;
  console.log(`SKIP  ${label}  -> ${why}`);
}

function headers(extra = {}) {
  const h = { 'Content-Type': 'application/json', ...extra };
  if (KEY) h.Authorization = `Bearer ${KEY}`;
  return h;
}

async function call(path, options = {}) {
  const res = await fetch(BASE + path, { ...options, headers: headers(options.headers) });
  const body = await res.json().catch(() => null);
  return { status: res.status, etag: res.headers.get('etag'), body };
}

const post = (path, payload, h) =>
  call(path, { method: 'POST', body: JSON.stringify(payload), headers: h });

async function main() {
  console.log(`ZPP smoke against ${BASE}\n`);

  const health = await call('/health');
  check('health responds', health.status === 200 && health.body.ok, `driver=${health.body?.driver} engine=${health.body?.engineSchema} v${health.body?.engineVersion} auth=${health.body?.auth}`);

  if (health.body?.auth === 'required') {
    if (!KEY) {
      skip('authenticated write', 'server requires a key and none was supplied');
    } else {
      const probe = await call('/v1/streams');
      check('API key is accepted', probe.status === 200, `status=${probe.status}`);
    }
  } else {
    check('server is in dev auth mode', health.body?.auth === 'dev', health.body?.auth);
  }

  const streamId = `smoke-${Date.now()}`;

  const created = await post('/v1/streams', { id: streamId, ownerId: 'smoke', seed: SEED });
  check('create stream -> 201 + ETag "0"', created.status === 201 && created.etag === '"0"', `${created.status} ${created.etag}`);

  const ev = (extra) => ({
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'If-Match': extra },
    body: JSON.stringify({ event: { type: 'world.set', source: 'user', summary: 'smoke', payload: { path: 'weather.state', value: 'rain' } } })
  });

  const w1 = await call(`/v1/streams/${streamId}/events`, ev('"0"'));
  check('append with If-Match "0" -> 200, revision 1', w1.status === 200 && w1.body.revision === 1, `${w1.status} rev=${w1.body?.revision}`);
  check('engine applied the event', w1.body?.state?.world?.weather?.state === 'rain', w1.body?.state?.world?.weather?.state);
  check('ETag advanced to "1"', w1.etag === '"1"', w1.etag);

  const stale = await call(`/v1/streams/${streamId}/events`, ev('"0"'));
  check('stale If-Match "0" -> 409 CONFLICT', stale.status === 409 && stale.body.status === 'CONFLICT', `${stale.status} ${stale.body?.status}`);
  check('409 reports the current revision', stale.body?.revision === 1, stale.body?.revision);

  const blocked = await call(`/v1/streams/${streamId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'If-Match': '"1"' },
    body: JSON.stringify({ event: { type: 'totally.unknown', payload: {} } })
  });
  check('unknown event -> 422 BLOCKED', blocked.status === 422 && blocked.body.status === 'BLOCKED', `${blocked.status} ${blocked.body?.reason}`);
  check('blocked write did not move the revision', blocked.body?.revision === 1, blocked.body?.revision);

  const pcId = `${streamId}-pc`;
  await post('/v1/streams', { id: pcId, seed: { characters: { p1: { control: 'player', identity: { name: 'Rin' } } } } });
  const pcMove = await call(`/v1/streams/${pcId}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: { type: 'character.move', source: 'ai', payload: { characterId: 'p1', locationId: 'keep' } } })
  });
  check('AI cannot move a player-controlled character', pcMove.body?.reason === 'player-control', pcMove.body?.reason);

  const verify = await call(`/v1/streams/${streamId}/verify`);
  check('cold replay matches the snapshot (verify) -> 200', verify.status === 200, `${verify.status} ${verify.body?.error || ''}`);

  const history = await call(`/v1/streams/${streamId}/events`);
  const ids = (history.body?.events || []).map((e) => e.event_id);
  check('history has exactly one committed event', ids.length === 1, JSON.stringify(ids));
  check('engine-minted event id was persisted', /^evt-\d{6}$/.test(ids[0] || ''), ids[0]);

  const rejections = await call(`/v1/streams/${streamId}/rejections`);
  check('rejected event was audited', (rejections.body?.rejections || []).length === 1, JSON.stringify(rejections.body?.rejections?.map((r) => r.reason)));

  const rebuilt = await post(`/v1/streams/${streamId}/rebuild`, {});
  check('rebuild -> 200, no drift, applied 1 event', rebuilt.status === 200 && rebuilt.body.repaired === false && rebuilt.body.applied === 1, JSON.stringify({ repaired: rebuilt.body?.repaired, applied: rebuilt.body?.applied }));

  const missing = await call('/v1/streams/definitely-not-here');
  check('unknown stream -> 404', missing.status === 404, String(missing.status));

  console.log(`\n${failures === 0 ? 'SMOKE PASS' : `SMOKE FAIL (${failures})`}${skips ? ` (${skips} skipped)` : ''}`);
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('smoke crashed:', err);
  process.exit(1);
});
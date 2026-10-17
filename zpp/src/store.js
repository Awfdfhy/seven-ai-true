'use strict';
/**
 * ZPP store — append-only event log + rebuildable projection.
 *
 * The RPG engine is pure: `applyEvent(state, event)` returns a NEW state and
 * leaves its input untouched. So the store never has to reason about partial
 * mutation — it loads a snapshot, hands it to the engine, and persists whatever
 * comes back, but only if the engine says the event committed.
 *
 * Concurrency contract (the part that matters):
 *   Every append carries `expectedVersion` (or an HTTP If-Match). The store
 *   refuses the write unless the stream is still at exactly that revision. Two
 *   concurrent writers cannot both win, because `events` has PRIMARY KEY
 *   (stream_id, stream_version) — the second insert violates uniqueness and the
 *   transaction rolls back. Optimistic by the client, guaranteed by the schema.
 */

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_ENGINE_PATH = path.join(__dirname, '..', '..', 'release', 'workspaces', 'rpg-state.js');

const OK = 'COMMITTED';
const BLOCKED = 'BLOCKED';
const CONFLICT = 'CONFLICT';
const NOT_FOUND = 'NOT_FOUND';

const MAX_LEDGER_SCAN = 100000;

class ConflictError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'ConflictError';
    this.status = 409;
    this.details = details;
  }
}

class NotFoundError extends Error {
  constructor(message, details) {
    super(message);
    this.name = 'NotFoundError';
    this.status = 404;
    this.details = details;
  }
}

function nowIso() { return new Date().toISOString(); }

function parseJson(text, fallback) {
  if (text === null || text === undefined || text === '') return fallback;
  try { return JSON.parse(text); } catch { return fallback; }
}

/** Coerce an ETag / If-Match header value ("3", W/"3", "\"3\"") to a number. */
function parseVersion(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const cleaned = String(raw).trim().replace(/^W\//i, '').replace(/^"|"$/g, '');
  if (cleaned === '*') return null;
  const n = Number(cleaned);
  return Number.isInteger(n) && n >= 0 ? n : null;
}

function createStore(db, options = {}) {
  const engine = options.engine || require(DEFAULT_ENGINE_PATH);
  if (!engine || typeof engine.createState !== 'function' || typeof engine.applyEvent !== 'function') {
    throw new TypeError('engine must expose createState() and applyEvent()');
  }

  const drivers = new Set(['local', 'remote', 'd1']);
  if (!drivers.has(db.kind)) throw new TypeError(`unknown driver kind: ${db.kind}`);

  /** @returns {Promise<{id:string, revision:number, state:object}>} */
  async function createStream({ id, ownerId = 'local', seed = {} } = {}) {
    const streamId = String(id || '').trim();
    if (!streamId) throw new TypeError('stream id is required');
    if (streamId.length > 200) throw new TypeError('stream id too long');

    return db.transaction(async () => {
      const existing = await db.get('SELECT id FROM streams WHERE id = ?', [streamId]);
      if (existing) throw new ConflictError(`stream already exists: ${streamId}`, { id: streamId });

      const state = engine.createState({ ...seed, sessionId: seed.sessionId || streamId });
      const at = nowIso();
      // `seed` is persisted, not just fed to the engine: it is the revision-0
      // baseline that makes a cold replay of the log possible at all.
      const normalisedSeed = { ...seed, sessionId: seed.sessionId || streamId };
      await db.run(
        'INSERT INTO streams (id, owner_id, revision, seed, snapshot, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [streamId, String(ownerId), 0, JSON.stringify(normalisedSeed), JSON.stringify(state), at, at]
      );
      return { id: streamId, revision: 0, state };
    });
  }

  /** @returns {Promise<{id:string, revision:number, state:object, etag:string}>} */
  async function readStream(id, { verify = false } = {}) {
    const row = await db.get('SELECT * FROM streams WHERE id = ?', [id]);
    if (!row) throw new NotFoundError(`no such stream: ${id}`, { id });

    const state = parseJson(row.snapshot, engine.createState({ sessionId: id }));
    if (verify) {
      const replayed = await replay(id);
      // replay() returns a wrapper; compare against the state inside it.
      const drift = compareState(state, replayed.state);
      if (drift.length) {
        const err = new Error('snapshot does not match event log');
        err.status = 409;
        err.details = { id, revision: Number(row.revision), drift };
        throw err;
      }
    }
    return {
      id: row.id,
      revision: Number(row.revision),
      ownerId: row.owner_id,
      state,
      etag: `"${Number(row.revision)}"`
    };
  }

  /**
   * Append one event.
   *
   * @param {string} id
   * @param {object} event   engine event, e.g. {type:'world.set', source:'user', payload:{...}}
   * @param {object} [opts]
   * @param {number|null} [opts.expectedVersion]  null/undefined = no check
   * @returns {Promise<{ok:boolean, status:string, revision:number, state?:object, reason?:string}>}
   */
  async function append(id, event, opts = {}) {
    const expected = opts.expectedVersion === undefined ? null : opts.expectedVersion;

    return db.transaction(async () => {
      const row = await db.get('SELECT revision, snapshot FROM streams WHERE id = ?', [id]);
      if (!row) {
        const err = new NotFoundError(`no such stream: ${id}`, { id });
        err.status = 404;
        return { ok: false, status: NOT_FOUND, reason: 'stream-not-found', revision: null };
      }

      const revision = Number(row.revision);

      // Checked inside the transaction, before any write, so a stale client
      // fails fast instead of racing the INSERT below.
      if (expected !== null && Number(expected) !== revision) {
        return {
          ok: false,
          status: CONFLICT,
          reason: 'revision-mismatch',
          revision,
          expectedVersion: Number(expected)
        };
      }

      const current = parseJson(row.snapshot, engine.createState({ sessionId: id }));
      const result = engine.applyEvent(current, event || {});

      if (!result || result.ok !== true) {
        // The engine refused. State is untouched, revision does not move, and
        // nothing is written to `events` — a rejection must never be replayed.
        const reason = (result && result.reason) || 'engine-rejected';
        await db.run(
          'INSERT INTO rejections (stream_id, revision, type, reason, payload, rejected_at) VALUES (?, ?, ?, ?, ?, ?)',
          [id, revision, (event && event.type) || null, reason, JSON.stringify(event ?? null), nowIso()]
        );
        return { ok: false, status: BLOCKED, reason, details: (result && result.details) || null, revision, state: current };
      }

      const next = result.state;
      const nextRevision = Number(next && next.revision);

      // The engine owns the revision counter. If it does not advance by exactly
      // one, the store's OCC key would be wrong — fail loudly rather than
      // silently writing a log that cannot be replayed.
      if (nextRevision !== revision + 1) {
        const err = new Error(
          `engine revision invariant violated: ${revision} -> ${nextRevision} (expected ${revision + 1})`
        );
        err.status = 500;
        err.details = { id, from: revision, to: nextRevision };
        throw err;
      }

      // The engine — not the caller — owns the event id and the provenance
      // source. Read them back off the ledger entry it just produced, because
      // the incoming `event` object normally carries neither.
      const committed = Array.isArray(next.ledger) && next.ledger.length
        ? next.ledger[next.ledger.length - 1]
        : {};

      await db.run(
        `INSERT INTO events
           (stream_id, stream_version, event_id, type, source, actor_id, summary, status, reason, payload, recorded_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, ?, ?)`,
        [
          id,
          nextRevision,
          committed.id || null,
          String(committed.type || (event && event.type) || 'unknown'),
          committed.source || null,
          committed.actorId || null,
          committed.summary || null,
          OK,
          JSON.stringify(committed.payload || (event && event.payload) || {}),
          nowIso()
        ]
      );

      const changed = await db.run(
        'UPDATE streams SET revision = ?, snapshot = ?, updated_at = ? WHERE id = ? AND revision = ?',
        [nextRevision, JSON.stringify(next), nowIso(), id, revision]
      );
      if (changed !== 1) {
        // Unreachable inside BEGIN IMMEDIATE, but if the driver ever loses the
        // write lock this is the guard that keeps the log consistent.
        const err = new ConflictError('lost update', { id, expectedVersion: revision });
        err.details = { id, revision };
        throw err;
      }

      return { ok: true, status: OK, revision: nextRevision, state: next };
    });
  }

  /**
   * Rebuild the projection from the revision-0 seed plus the event log.
   *
   * This is a COLD replay: it never reads the stored snapshot, so it is a real
   * independent check that the projection can be reconstructed. `verify` and
   * `rebuild` both depend on that property — if this function ever peeked at the
   * snapshot it would be comparing a value against itself.
   */
  async function replay(id) {
    const head = await db.get('SELECT revision, seed FROM streams WHERE id = ?', [id]);
    if (!head) throw new NotFoundError(`no such stream: ${id}`, { id });

    const seed = parseJson(head.seed, {});
    let state = engine.createState(seed);

    const rows = await db.all(
      'SELECT stream_version, event_id, type, source, actor_id, summary, status, reason, payload FROM events WHERE stream_id = ? ORDER BY stream_version ASC LIMIT ?',
      [id, MAX_LEDGER_SCAN]
    );

    let applied = 0;
    let maxEventCounter = 0;
    for (const row of rows) {
      if (row.status !== OK) continue;
      const payload = parseJson(row.payload, {});
      const result = engine.applyEvent(state, {
        id: row.event_id || `replay-${row.stream_version}`,
        type: row.type,
        source: row.source || undefined,
        actorId: row.actor_id,
        summary: row.summary,
        status: row.status,
        reason: row.reason,
        payload
      });
      if (!result || result.ok !== true) {
        // The log should only contain committed events. If replay disagrees,
        // that is corruption — surface it rather than quietly returning a
        // state that never existed.
        const err = new Error(`event ${row.stream_version} (${row.type}) no longer replays: ${(result && result.reason) || 'unknown'}`);
        err.status = 409;
        err.details = { id, streamVersion: Number(row.stream_version), type: row.type, reason: (result && result.reason) || null };
        throw err;
      }
      state = result.state;
      applied += 1;

      // ensureEventId() only advances counters.event when the caller supplies
      // no id. Replay supplies the stored id precisely so the ledger matches,
      // which means the counter would stay at 0 forever. The counter is by
      // definition "how many ids have been minted", so it is recovered here
      // from the ids themselves — derived from the log, never from the
      // snapshot, so this stays an independent reconstruction.
      const n = /^evt-(\d+)$/.exec(String(row.event_id || ''));
      if (n) maxEventCounter = Math.max(maxEventCounter, Number(n[1]));
    }
    if (maxEventCounter > (state.counters.event || 0)) state.counters.event = maxEventCounter;

    return { state, applied, revision: Number(state.revision), storedRevision: Number(head.revision) };
  }

  /** Regenerate the snapshot from seed + log. Returns the drift that was repaired. */
  async function rebuild(id) {
    return db.transaction(async () => {
      const head = await db.get('SELECT revision, snapshot FROM streams WHERE id = ?', [id]);
      if (!head) throw new NotFoundError(`no such stream: ${id}`, { id });

      const before = parseJson(head.snapshot, null);
      const { state, applied } = await replay(id);
      const drift = compareState(before, state);

      if (Number(state.revision) !== Number(head.revision)) {
        const err = new Error(
          `replayed revision ${state.revision} != stored revision ${head.revision}; log is truncated or corrupt`
        );
        err.status = 409;
        err.details = { id, replayed: Number(state.revision), stored: Number(head.revision) };
        throw err;
      }

      await db.run(
        'UPDATE streams SET snapshot = ?, updated_at = ? WHERE id = ? AND revision = ?',
        [JSON.stringify(state), nowIso(), id, Number(head.revision)]
      );
      return { repaired: drift.length > 0, drift, applied, revision: Number(state.revision) };
    });
  }

  async function history(id, { from = 1, limit = 100 } = {}) {
    const safeLimit = Math.min(Math.max(1, Number(limit) || 100), 1000);
    const rows = await db.all(
      'SELECT stream_version, event_id, type, actor_id, summary, status, recorded_at FROM events WHERE stream_id = ? AND stream_version >= ? ORDER BY stream_version ASC LIMIT ?',
      [id, Math.max(1, Number(from) || 1), safeLimit]
    );
    return rows.map((r) => ({ ...r, stream_version: Number(r.stream_version) }));
  }

  async function rejections(id, { limit = 50 } = {}) {
    const rows = await db.all(
      'SELECT revision, type, reason, rejected_at FROM rejections WHERE stream_id = ? ORDER BY id DESC LIMIT ?',
      [id, Math.min(Math.max(1, Number(limit) || 50), 500)]
    );
    return rows.map((r) => ({ ...r, revision: Number(r.revision) }));
  }

  async function listStreams({ ownerId = null, limit = 100 } = {}) {
    const rows = ownerId
      ? await db.all('SELECT id, owner_id, revision, created_at, updated_at FROM streams WHERE owner_id = ? ORDER BY updated_at DESC LIMIT ?', [ownerId, limit])
      : await db.all('SELECT id, owner_id, revision, created_at, updated_at FROM streams ORDER BY updated_at DESC LIMIT ?', [limit]);
    return rows.map((r) => ({ ...r, revision: Number(r.revision) }));
  }

  async function health() {
    const row = await db.get('SELECT COUNT(*) AS n FROM streams');
    const ev = await db.get('SELECT COUNT(*) AS n FROM events');
    return {
      ok: true,
      driver: db.kind,
      streams: Number(row ? row.n : 0),
      events: Number(ev ? ev.n : 0),
      engineSchema: engine.SCHEMA,
      engineVersion: engine.VERSION
    };
  }

  return {
    engine,
    driverKind: db.kind,
    createStream,
    readStream,
    append,
    replay,
    rebuild,
    history,
    rejections,
    listStreams,
    health,
    parseVersion,
    STATUS: { OK, BLOCKED, CONFLICT, NOT_FOUND }
  };
}

/** Shallow-ish structural comparison used only to describe drift. */
function compareState(a, b) {
  const drift = [];
  const left = a || {};
  const right = b || {};
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of keys) {
    if (key === 'diagnostics') continue; // runtime-only, never persisted meaningfully
    const l = JSON.stringify(left[key]);
    const r = JSON.stringify(right[key]);
    if (l !== r) drift.push({ key, snapshot: l, replayed: r });
  }
  return drift;
}

module.exports = {
  createStore,
  parseVersion,
  compareState,
  ConflictError,
  NotFoundError,
  STATUS: { OK, BLOCKED, CONFLICT, NOT_FOUND }
};
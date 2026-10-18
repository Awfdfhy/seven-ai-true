'use strict';
/**
 * Storage driver for ZPP.
 *
 * One tiny interface, three SQLite-speaking backends:
 *
 *   local  -> node:sqlite (built into Node 22+, zero dependencies, zero credentials)
 *   remote -> @libsql/client (Turso: free tier, 100 DBs / 5 GB, no credit card)
 *   d1     -> Cloudflare D1 (same SQL, bound to a Worker)
 *
 * All three speak plain SQLite with `?` positional parameters, so the SQL in
 * db/schema.sql and the SQL in store.js are identical everywhere. That is the
 * whole point: the test suite and CI exercise the exact code path that
 * production uses against Turso, instead of a local-only branch that can never
 * be verified without a signup.
 */

const fs = require('node:fs');
const path = require('node:path');

const SCHEMA_PATH = path.join(__dirname, '..', 'db', 'schema.sql');

/**
 * Additive column migrations for databases created before a column existed.
 *
 * `CREATE TABLE IF NOT EXISTS` silently does nothing when the table is already
 * there, so a schema.sql edit alone cannot reach an existing deployment — the
 * column would be missing and every query touching it would fail. These run
 * after the schema on every open.
 *
 * Each statement must be idempotent AND safe to fail on: the "already there"
 * error is swallowed, any other error is rethrown. That is what lets the same
 * list run against a fresh local file, an existing local file, and a remote
 * Turso/D1 database with no version tracking.
 */
const MIGRATIONS = [
  // Key expiry. See the api_keys comment in db/schema.sql.
  'ALTER TABLE api_keys ADD COLUMN expires_at TEXT'
];

/** True for the errors that mean "this migration already ran". */
function isAlreadyApplied(err) {
  const msg = String((err && err.message) || '').toLowerCase();
  return msg.includes('duplicate column') || msg.includes('already exists');
}

async function applyMigrations(driver) {
  for (const sql of MIGRATIONS) {
    try {
      await driver.run(sql);
    } catch (err) {
      if (isAlreadyApplied(err)) continue;
      throw new Error(`migration failed: ${sql}\n  ${(err && err.message) || err}`);
    }
  }
}

/**
 * SQLite has no boolean type and node:sqlite rejects JS booleans outright.
 * Normalising at the boundary keeps every call site free of `? 1 : 0` noise
 * and guarantees identical behaviour across backends.
 */
function normaliseParam(value) {
  if (value === undefined || value === null) return null;
  if (value === true) return 1;
  if (value === false) return 0;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new TypeError(`non-finite number cannot be bound: ${value}`);
    }
    return value;
  }
  if (typeof value === 'bigint' || typeof value === 'string') return value;
  if (value instanceof Uint8Array) return value;
  throw new TypeError(`unsupported bind type: ${typeof value}`);
}

function normaliseParams(params) {
  if (params === undefined || params === null) return [];
  const list = Array.isArray(params) ? params : [params];
  return list.map(normaliseParam);
}

/** node:sqlite reports change counts as BigInt; the API should not leak that. */
function normaliseChanges(result) {
  if (!result || result.changes === undefined || result.changes === null) return 0;
  return Number(result.changes);
}

class LocalDriver {
  constructor(filename) {
    const { DatabaseSync } = require('node:sqlite');
    if (filename !== ':memory:') {
      fs.mkdirSync(path.dirname(filename), { recursive: true });
    }
    this.kind = 'local';
    this.db = new DatabaseSync(filename);
    // WAL keeps readers non-blocking; FULL sync is the honest durability level
    // for an append-only log. Foreign keys are off by default in SQLite.
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec('PRAGMA synchronous = FULL');
    this.db.exec('PRAGMA foreign_keys = ON');
    // Transactions must be serialised, not merely re-entrant. `await` inside an
    // async transaction yields to the microtask queue, so without an explicit
    // queue a second writer would observe the first writer's uncommitted state
    // and pass an optimistic-concurrency check it should have failed.
    this._queue = Promise.resolve();
    this._active = false;
  }

  all(sql, params) {
    return this.db.prepare(sql).all(...normaliseParams(params));
  }

  get(sql, params) {
    const row = this.db.prepare(sql).get(...normaliseParams(params));
    return row === undefined ? null : row;
  }

  run(sql, params) {
    return normaliseChanges(this.db.prepare(sql).run(...normaliseParams(params)));
  }

  exec(sql) {
    this.db.exec(sql);
  }

  async transaction(fn) {
    // Re-entrant: a nested call inside the running transaction joins it.
    if (this._active) return fn();

    const run = this._queue.then(async () => {
      this.db.exec('BEGIN IMMEDIATE');
      this._active = true;
      try {
        const out = await fn();
        this.db.exec('COMMIT');
        return out;
      } catch (err) {
        try { this.db.exec('ROLLBACK'); } catch { /* already rolled back */ }
        throw err;
      } finally {
        this._active = false;
      }
    });

    // Advance the chain even when this transaction rejects, otherwise one
    // failed write would deadlock every later transaction.
    this._queue = run.then(() => {}, () => {});
    return run;
  }

  async close() { this.db.close(); }
}

class RemoteDriver {
  constructor(client, kind) {
    this.kind = kind;
    this.client = client;
    this._queue = Promise.resolve();
    this._active = false;
  }

  async all(sql, params) {
    const res = await this.client.execute({ sql, args: normaliseParams(params) });
    return res.rows || [];
  }

  async get(sql, params) {
    const rows = await this.all(sql, params);
    return rows.length ? rows[0] : null;
  }

  async run(sql, params) {
    const res = await this.client.execute({ sql, args: normaliseParams(params) });
    return Number(res.rowsAffected || 0);
  }

  async exec(sql) {
    // libSQL refuses multi-statement `execute`; batch() takes them in order.
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => ({ sql: s }));
    if (statements.length) await this.client.batch(statements);
  }

  async transaction(fn) {
    if (this._active) return fn();

    const run = this._queue.then(async () => {
      await this.exec('BEGIN IMMEDIATE');
      this._active = true;
      try {
        const out = await fn();
        await this.exec('COMMIT');
        return out;
      } catch (err) {
        try { await this.exec('ROLLBACK'); } catch { /* connection already reset */ }
        throw err;
      } finally {
        this._active = false;
      }
    });

    this._queue = run.then(() => {}, () => {});
    return run;
  }

  async close() { /* http client holds no socket to close */ }
}

/**
 * @param {object} [config]
 * @param {string} [config.file]        local SQLite path, or ':memory:'
 * @param {string} [config.url]         Turso/libSQL URL — switches to remote
 * @param {string} [config.authToken]   Turso auth token
 * @param {object} [config.d1]          Cloudflare D1 binding — switches to D1
 * @param {boolean} [config.migrate]    apply db/schema.sql on open (default true)
 */
async function openDb(config = {}) {
  let driver;

  if (config.d1) {
    driver = new RemoteDriver(d1Shim(config.d1), 'd1');
  } else if (config.url) {
    let mod;
    try {
      mod = require('@libsql/client');
    } catch {
      throw new Error(
        'Remote storage requested but @libsql/client is not installed.\n' +
        'Run: npm i @libsql/client --workspace zpp\n' +
        'Or unset TURSO_URL to fall back to local SQLite.'
      );
    }
    driver = new RemoteDriver(
      mod.createClient({ url: config.url, authToken: config.authToken }),
      'remote'
    );
  } else {
    driver = new LocalDriver(config.file || path.join(__dirname, '..', 'data', 'zpp.sqlite'));
  }

  if (config.migrate !== false) {
    driver.exec(fs.readFileSync(SCHEMA_PATH, 'utf8'));
    await applyMigrations(driver);
  }
  return driver;
}

/** Adapt a Cloudflare D1 binding to the small surface RemoteDriver needs. */
function d1Shim(binding) {
  return {
    async execute({ sql, args }) {
      const stmt = binding.prepare(sql);
      const res = args && args.length ? await stmt.bind(...args).all() : await stmt.all();
      return { rows: res.results || [], rowsAffected: res.meta?.changes ?? 0 };
    },
    async batch(statements) {
      const out = [];
      for (const s of statements) out.push(await this.execute(s));
      return out;
    }
  };
}

/** Resolve driver config from the environment. */
function configFromEnv(env = process.env) {
  if (env.D1_BINDING) return { d1: env.D1_BINDING };
  if (env.TURSO_URL) {
    return { url: env.TURSO_URL, authToken: env.TURSO_AUTH_TOKEN || undefined };
  }
  return { file: env.ZPP_DB_FILE || path.join(__dirname, '..', 'data', 'zpp.sqlite') };
}

module.exports = { openDb, configFromEnv, LocalDriver, RemoteDriver, MIGRATIONS, applyMigrations };
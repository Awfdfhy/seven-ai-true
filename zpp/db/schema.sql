-- ZPP schema — server-backed RPG streams.
--
-- Design notes (why it is shaped this way):
--   * The RPG engine (release/workspaces/rpg-state.js) is pure and event-sourced:
--     applyEvent(state, event) returns a NEW state and never mutates its input.
--     That makes the whole game reducible to an append-only log plus a
--     rebuildable projection, which is exactly what these two tables hold.
--   * Optimistic concurrency is enforced by the PRIMARY KEY on
--     (stream_id, stream_version), not by application-level locking. The
--     database itself refuses two writers claiming the same version. This is
--     the same technique used by EventStoreDB/KodaStore and it survives
--     multiple app servers without a lock table.
--   * `snapshot` is a cache, never the source of truth. POST /rebuild proves
--     it by regenerating it from `seed` + `events` alone and reporting drift.
--   * `seed` is the revision-0 baseline: the world a campaign was created with
--     (starting locations, starting characters). It is NOT in the event log,
--     because the engine has no event type able to express it — createState()
--     is the only way to produce it. Without this column the log alone cannot
--     rebuild a stream, which would make every VERIFIED claim about replay
--     unfalsifiable.
--
-- Portable across every SQLite-speaking target: local node:sqlite, Turso
-- (libSQL), and Cloudflare D1.

CREATE TABLE IF NOT EXISTS streams (
  id          TEXT    PRIMARY KEY,
  owner_id    TEXT    NOT NULL DEFAULT 'local',
  revision    INTEGER NOT NULL DEFAULT 0,
  seed        TEXT    NOT NULL DEFAULT '{}',
  snapshot    TEXT,
  created_at  TEXT    NOT NULL,
  updated_at  TEXT    NOT NULL
);

-- Append-only. Rows are never updated or deleted; a retraction is a new event.
--
-- `event_id` and `source` are both assigned BY THE ENGINE, not taken from the
-- caller's event object. The engine mints ids internally (evt-000001, ...) via
-- ensureEventId() and defaults source to 'runtime', so storing the caller's
-- fields instead would persist NULLs and silently rewrite provenance on every
-- replay. They are read back off the committed ledger entry.
CREATE TABLE IF NOT EXISTS events (
  stream_id      TEXT    NOT NULL,
  stream_version INTEGER NOT NULL,
  event_id       TEXT,
  type           TEXT    NOT NULL,
  source         TEXT,
  actor_id       TEXT,
  summary        TEXT,
  status         TEXT    NOT NULL,
  reason         TEXT,
  payload        TEXT    NOT NULL,
  recorded_at    TEXT    NOT NULL,
  PRIMARY KEY (stream_id, stream_version),
  FOREIGN KEY (stream_id) REFERENCES streams (id) ON DELETE CASCADE
);

-- Audit trail for events the engine refused (player-control violations,
-- unknown actors, unsupported types). Kept out of `events` on purpose: a
-- rejected event must not advance revision or be replayed into state.
CREATE TABLE IF NOT EXISTS rejections (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  stream_id   TEXT    NOT NULL,
  revision    INTEGER NOT NULL,
  type        TEXT,
  reason      TEXT,
  payload     TEXT,
  rejected_at TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_stream    ON events (stream_id, stream_version);
CREATE INDEX IF NOT EXISTS idx_rejections_stream ON rejections (stream_id, id);
CREATE INDEX IF NOT EXISTS idx_streams_owner     ON streams (owner_id, updated_at);

-- API keys. Only the SHA-256 hash of the key is stored; the plaintext exists
-- exactly once, in the minting process's stdout. A leaked database therefore
-- yields no usable credential.
--
-- `owner_id` is the tenant boundary. It is taken from the verified key, NEVER
-- from the request body — a client that could name its own owner_id could read
-- another tenant's campaigns.
--
-- `expires_at` is NULL for a key that never expires. Expiry is enforced in the
-- lookup query (auth.js) rather than by a post-read comparison, so an expired
-- key is indistinguishable from one that never existed.
CREATE TABLE IF NOT EXISTS api_keys (
  key_hash     TEXT    PRIMARY KEY,
  owner_id     TEXT    NOT NULL,
  label        TEXT    NOT NULL DEFAULT '',
  created_at   TEXT    NOT NULL,
  last_used_at TEXT,
  expires_at   TEXT,
  revoked_at   TEXT
);

CREATE INDEX IF NOT EXISTS idx_api_keys_owner ON api_keys (owner_id);
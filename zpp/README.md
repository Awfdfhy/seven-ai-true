# ZPP — server-backed RPG streams

The RPG roadmap's engine already exists and is pure: `release/workspaces/rpg-*.js`
(25 modules) computes game state in the browser with no I/O. What it does not
have is a place to *put* that state. Today every campaign lives in one
`localStorage` blob on one device.

ZPP is the server side: an append-only event log plus a rebuildable
projection, over SQLite, reachable over HTTP.

It deliberately reuses the existing engine rather than reimplementing it. The
engine is the product; this is the missing 10% around it.

---

## Run it

```bash
# local SQLite, no credentials, no signup
node zpp/src/server.js          # http://localhost:8787

# tests (25 assertions, zero network)
node --test zpp/test/store.test.js

# end-to-end against a running server
node zpp/smoke.mjs http://127.0.0.1:8787
```

## The database

One SQL dialect, three targets. They all speak plain SQLite, so the SQL in
`db/schema.sql` and `src/store.js` is byte-identical everywhere.

| Target | Selected by | Credentials |
|---|---|---|
| local `node:sqlite` | default | none |
| **Turso / libSQL** | `TURSO_URL` (+ `TURSO_AUTH_TOKEN`) | free tier, no credit card — 100 DBs, 5 GB |
| Cloudflare D1 | `D1_BINDING` | existing Cloudflare account |

```bash
# remote
npm i @libsql/client --prefix zpp
$env:TURSO_URL="libsql://your-db.turso.io"
$env:TURSO_AUTH_TOKEN="..."
node zpp/src/server.js
```

**Why this shape.** `RPG-01-10` and `RPG-07-15` have been BLOCKED for weeks with
the reason *"Requires external credentials"* — the acceptance test can only run
where a credential happens to exist, so it never runs and never closes. Because
the local and remote paths are the *same code*, the entire suite runs in CI with
zero credentials. The remote backend is a config flag, not a different program.

## API

| | | |
|---|---|---|
| `GET` | `/health` | driver + engine identity |
| `GET` | `/v1/streams` | list (`?owner=`) |
| `POST` | `/v1/streams` | create — body `{id, ownerId, seed}` → `201` + `ETag` |
| `GET` | `/v1/streams/:id` | current state + `ETag: "<revision>"` (`?verify=1` to cold-replay) |
| `POST` | `/v1/streams/:id/events` | append — `If-Match: "<revision>"` |
| `GET` | `/v1/streams/:id/events` | history (`?from=&limit=`) |
| `GET` | `/v1/streams/:id/rejections` | events the engine refused |
| `GET` | `/v1/streams/:id/verify` | assert snapshot == cold replay |
| `POST` | `/v1/streams/:id/rebuild` | regenerate the snapshot from the log |

```bash
curl -X POST localhost:8787/v1/streams -H 'content-type: application/json' \
  -d '{"id":"c1","seed":{"world":{"locations":{"keep":{"id":"keep"}}}}}' -i
# HTTP/1.1 201 Created ... ETag: "0"

curl -X POST localhost:8787/v1/streams/c1/events -H 'content-type: application/json' \
  -H 'If-Match: "0"' \
  -d '{"event":{"type":"world.set","source":"user","payload":{"path":"weather.state","value":"rain"}}}'
```

### Status codes are load-bearing

| Code | Meaning | Client action |
|---|---|---|
| `200` / `201` | committed; new revision in `ETag` | continue from the new ETag |
| `409` | stale writer — another append won the race | re-read, re-decide, retry |
| `422` | the **engine refused** the event (e.g. `player-control`) | fix the event; do **not** blind-retry |
| `404` | unknown stream | create it |

`409` and `422` are different failures and must not be handled the same way.
A `409` is contention and retrying is correct. A `422` is a rule the game
enforced — the AI is not allowed to move a player-controlled character, and
retrying will never change that.

## How it works

```
POST /events
   │
   ├─ BEGIN IMMEDIATE
   ├─ read streams.revision
   ├─ revision ≠ If-Match ? ──────────────► 409 CONFLICT
   ├─ engine.applyEvent(snapshot, event)
   │     └─ ok:false ────────────────────► 422 BLOCKED  (+ audit row, no write)
   ├─ INSERT events (stream_id, stream_version)   ← PRIMARY KEY is the OCC guard
   ├─ UPDATE streams SET revision… WHERE revision = <read value>
   └─ COMMIT
```

Three properties this buys, each of them tested:

**Optimistic concurrency is enforced by the schema, not by application logic.**
`PRIMARY KEY (stream_id, stream_version)` means the database itself refuses two
writers claiming the same version. No lock table, and it holds across multiple
app servers. `test/store.test.js` fires 8 concurrent writers at the same
revision and asserts exactly one wins and seven get `409`.

**The snapshot is a cache, never the source of truth.** `GET /verify` regenerates
state from `seed` + `events` and compares. `POST /rebuild` repairs drift and
returns what it changed. If replay cannot reproduce the projection, that is a
409, not a silent overwrite.

**A rejected event never enters the log.** It cannot advance the revision and it
cannot be replayed; it goes to `rejections` for the audit trail only.

### Two things that are not obvious

- **`seed` is stored, not just fed to the engine.** The engine has no event type
  that can express "the world this campaign started with" — only `createState()`
  produces it. Without a persisted revision-0 baseline the log alone cannot
  rebuild a stream, which would make every replay claim unfalsifiable.

- **`event_id` and `source` are read off the committed ledger entry**, not off
  the caller's event object. The engine mints ids internally (`evt-000001`) and
  defaults `source` to `runtime`. Storing the caller's fields instead persists
  `NULL`s and silently rewrites provenance on every replay. `counters.event` is
  recovered from the persisted ids for the same reason — it is by definition
  "how many ids have been minted".

## Status

| | |
|---|---|
| Store + HTTP + OCC + replay/rebuild | **done, 25/25 tests, 16/16 smoke** |
| Domain coverage beyond `rpg-state.js` | next — the other 24 engine modules are unwired |
| Auth / multi-tenant | not started — `owner_id` exists, nothing enforces it |
| LLM runtime | not started — needs a credential, same blocker as RPG-01-10 |

The honest gap: `owner_id` is a column with no access control behind it. Do not
expose this publicly as-is.
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
# local SQLite, auth required
node zpp/src/server.js            # http://localhost:8787

# local SQLite, dev auth (X-Dev-Owner header, no key needed)
node zpp/bin/dev.cjs

# mint a key  -> prints the plaintext once
node zpp/bin/mint-key.cjs alice "alice laptop"
node zpp/bin/mint-key.cjs alice --list
node zpp/bin/mint-key.cjs alice --revoke <key-hash>

# tests (39 assertions, zero network)
node --test zpp/test/store.test.js zpp/test/auth.test.js

# end-to-end against a running server
node zpp/smoke.mjs http://127.0.0.1:8787 <api-key>
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
| `GET` | `/health` | driver + engine + auth mode (public) |
| `GET` | `/v1/streams` | list — scoped to the caller |
| `POST` | `/v1/streams` | create — body `{id, seed}` → `201` + `ETag` |
| `GET` | `/v1/streams/:id` | current state + `ETag: "<revision>"` (`?verify=1` to cold-replay) |
| `POST` | `/v1/streams/:id/events` | append — `If-Match: "<revision>"` |
| `GET` | `/v1/streams/:id/events` | history (`?from=&limit=`) |
| `GET` | `/v1/streams/:id/rejections` | events the engine refused |
| `GET` | `/v1/streams/:id/verify` | assert snapshot == cold replay |
| `POST` | `/v1/streams/:id/rebuild` | regenerate the snapshot from the log |
| `GET` | `/v1/streams/__keys` | this tenant's key hashes + usage |
| `POST` | `/v1/streams/__keys` | mint a key — plaintext returned once |

```bash
curl -X POST localhost:8787/v1/streams -H 'content-type: application/json' \
  -H 'Authorization: Bearer zpp_alice_…' \
  -d '{"id":"c1","seed":{"world":{"locations":{"keep":{"id":"keep"}}}}}' -i
# HTTP/1.1 201 Created ... ETag: "0"

curl -X POST localhost:8787/v1/streams/c1/events -H 'content-type: application/json' \
  -H 'Authorization: Bearer zpp_alice_…' \
  -H 'If-Match: "0"' \
  -d '{"event":{"type":"world.set","source":"user","payload":{"path":"weather.state","value":"rain"}}}'
```

### Authentication

Every route except `/health` requires `Authorization: Bearer zpp_<owner>_<secret>`.

- **Only the SHA-256 of the key is stored.** The plaintext is printed once, at
  mint time. A dumped database yields no usable credential.
- **`owner_id` comes from the token, never from the request body.** A client
  that could name its own owner would read another tenant's campaigns, so the
  body's `ownerId` is ignored on create and `?owner=` is not honoured on list.
- **Cross-tenant access returns 404, not 403.** A 403 confirms the stream id
  exists, which turns the id space into an enumeration oracle.
- **Stream ids are global.** A second tenant attempting to claim an existing id
  gets 409 rather than creating it, so ids cannot be squatted.
- **`ZPP_AUTH=dev`** accepts an `X-Dev-Owner` header instead of a key. It is
  opt-in, the server logs a warning at startup, `/health` reports `auth: dev`,
  and a *presented but invalid* key still fails rather than falling through —
  otherwise a typo would become an authentication bypass.

### Status codes are load-bearing

| Code | Meaning | Client action |
|---|---|---|
| `200` / `201` | committed; new revision in `ETag` | continue from the new ETag |
| `401` | missing or invalid API key | obtain a key; do **not** retry blindly |
| `409` | stale writer — another append won the race | re-read, re-decide, retry |
| `409` | stream id already taken | pick a different id |
| `422` | the **engine refused** the event (e.g. `player-control`) | fix the event; do **not** blind-retry |
| `404` | unknown stream, or not yours | — |

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

## Why only `rpg-state.js` is wired

The obvious next step is "wire up the other 24 engine modules". That is not
mechanical, and the reason is worth recording before anyone tries.

The store above works because `rpg-state.js` is **pure**: `applyEvent` takes a
state and returns a new one, touching no clock and no RNG. That is what makes
an append-only log + replay a valid persistence strategy.

The other 22 managers are not pure, and it is not a small gap:

- **110 `new Map()` closures** across `release/workspaces/rpg-*.js`. Their data
  lives in closure-scoped maps — invisible from outside, per-process, gone on
  restart. A server holding one instance per process is single-instance and
  loses everything on deploy.
- **All 22 embed `Date.now()`/`new Date()` and/or `Math.random()`.** Several
  call both. So recording commands and replaying them produces *different*
  timestamps and *different* random rolls — the exact technique this store uses
  cannot work for them.

Only 4 modules expose any persistence seam today (`campaign.exportSession`,
`canon-continuity.exportCanon`, `character.exportCharacter`,
`player-tools` transcript). The rest have none.

Three ways forward, none free:

| Option | Change | Trade-off |
|---|---|---|
| **A. Export/import seams** | Add serialise/hydrate to each manager | ~110 maps; touches engine files that carry 224 VERIFIED ledger claims |
| **B. Inject clock + RNG** | Thread `now()`/`random()` through every manager | Biggest change, but makes replay deterministic and the design uniform |
| **C. In-process only** | Managers stay per-process | Fine for a demo; wrong for a server (no restart survival, no horizontal scale) |

A is the smallest honest step and unblocks persistence now. B is the correct
end-state. C is not a server. This is a decision, not an oversight, and it is
the main open question in this project.

## Status

| | |
|---|---|
| Store + HTTP + OCC + replay/rebuild | **done** — 25 tests, 17 smoke checks |
| API-key auth + tenant isolation | **done** — 14 tests |
| Domain coverage beyond `rpg-state.js` | **blocked on the decision above** |
| Client | not started — nothing consumes this API yet |
| LLM runtime | not started — needs a credential, same blocker as RPG-01-10 |

Verified end-to-end in `auth=required` mode against a live server: 17/17 smoke
checks, 39/39 unit tests.

Remaining known gaps, stated plainly:

- No rate limiting. A valid key can hammer the API.
- No CORS configuration. A browser client on another origin will be blocked
  until this is set deliberately.
- Keys have no expiry. Revocation exists; automatic rotation does not.
- The other 22 managers are not persisted at all (see above).
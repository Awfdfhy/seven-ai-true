# B07 — RPG State Provenance & Integrity Audit (Wave 01B)

- **Agent:** B07 (Goose), Team B
- **Scope (read-only audit):** `release/workspaces/rpg.js`, `release/world-runtime.js`, `release/canon-simulator.js`, plus persistence/memory seams (`memory.cjs`, `all.cjs`, `release/*.test.cjs`, `release/workspaces/hub.js`, `release/workspaces/seven-shell-final.js`)
- **Constraint honored:** no production source was modified. Only this report was written.
- **Date:** 2026-10-03

## 0. File-location facts (deviations from the mission brief)

| Brief said | Actual repo state |
|---|---|
| `rpg.js` | **Absent at `release/rpg.js`.** Present at **`release/workspaces/rpg.js`** (20,493 bytes, 59 lines, minified-per-line style). |
| `world-runtime.js` | Present at `release/world-runtime.js` (102 lines). |
| `canon-simulator.js` | Present at `release/canon-simulator.js` (187 lines). |
| RPG test suite | **ABSENT.** There is no `release/*rpg*.test.cjs` and no RPG workspace test file anywhere. `grep -c rpg all.cjs` → `0`. RPG has **zero automated coverage**; only `release/release-verify.cjs` (Playwright, lines ~290-320) touches the RPG bar visually, and `apk/materialize-android-visual-test.cjs` takes one screenshot. |
| RPG persistence | **ABSENT.** `grep -rn "localStorage" release/workspaces/*.js` → no hits. No IndexedDB usage for canon/world. RPG state is memory-only. |

Both runtimes are UMD (CommonJS + `globalThis`), which makes them directly unit-testable in Node — the seam already exists and is unused by the workspace layer.

---

## 1. Current verified protections (confirmed by direct source read)

These are real, working controls. They are the foundation the rest of this report builds on.

### 1.1 `world-runtime.js` — trusted-canon and mutation gates

1. **Structural fail-closed on import.** `normalizeWork()` throws `'work requires id'`, `'work beat requires id'`, and `'duplicate work beat: <id>'`. A malformed Real Works pack cannot construct an engine.
2. **`sourceCoverage()` is a genuine trust gate, not a formality.** Returns `UNVERIFIED` when `beat.sourceRefs` is empty (line 31) and when any ref is not present in `work.sources` (line 33). A beat can never silently become `CANON` on absent or dangling evidence. `STATUS` is `Object.freeze`d (line 7), so status strings are unforgeable at runtime.
3. **Copy-on-write mutations.** `commitBeat()` does `const next=clone(session)` (line 62) and returns `next`; every BLOCKED path returns `clone(session)`. The caller's session object is never mutated. `rpg.js:28` assigns `S.worldSession=out.session` only when a commit returns — no partial write.
4. **Three named BLOCKED reasons, all fail-closed:** `unknown-beat` (line 58), `canon-order` (line 61, out-of-order canon commit is refused unless `allowBranch`), `player-agency` (line 70 — a runtime/model-asserted `playerAction` whose `playerActionSource !== 'user'` is refused). The agency rule is also stated as prose in `sceneContract()` (line 52): the runtime may react but must not invent player choice, intention, emotion, or irreversible action.
5. **Branch origin is recorded, not inferred later.** `next.branchOrigin={fromBeatIndex, expectedBeatId, chosenBeatId, reason:'canon-order-divergence'}` (line 65). Divergence is therefore auditable at the moment it happens.
6. **Contracts are deep-cloned out.** `sceneContract()` returns `clone(beat)` plus `.slice()`d arrays (lines 49-50), so a caller cannot alias-and-mutate engine-owned canon through the contract.
7. **Re-derivable audit.** `audit()` (lines 87-98) recomputes sequence integrity (`FAIL` on canon-order gaps), source fidelity (`INCONCLUSIVE` + explicit `unverified[]` beat ids), branch status, and progress. History corruption is detectable after the fact.
8. **Evidence rides on each record.** Commit records carry `status`, `sourceRefs`, `playerActionSource`, and an ISO timestamp (line 69).

### 1.2 `canon-simulator.js` — knowledge boundary and debt accounting

9. **Fail-closed import.** `validatePack()` collects issues (missing ids, duplicate ids across `events|entities|facts|anchors`, unknown anchor `strength`), and `createEngine()` **throws** `'invalid canon pack: ...'` when `!validation.ok` (line 51). A corrupt canon pack never yields a live engine.
10. **Authority-weighted certainty ladder.** `AUTHORITY_WEIGHT` A0=1.0 → A5=0.2; `factStatus()` maps best-source authority to `VERIFIED (≥0.8)`, `PROBABLE (≥0.45)`, else `AMBIGUOUS` (lines 55-62). **A fact with zero sources can never be `VERIFIED`** — it falls to `PROBABLE` (line 59).
11. **Knowledge boundary is deny-by-default with three hard denials** (`canCharacterKnow`, lines 80-89): `unknown-fact`, `wrong-continuity`, and `future-knowledge` when `position < fact.availableAt`. Anything not established or not in `knownBy` is `not-established` / deny. Note the deliberate precedence already covered by test: **the future horizon beats a static `knownBy` grant** (`release/canon-simulator.test.cjs` asserts `canCharacterKnow(session,'guide','secret').allowed === false`).
12. **Every mutation writes a provenance triple.** `applySceneDelta` records `provenance:{source, authority, transformation}` alongside `delta`, `threatenedAnchors`, and `invariantIssues` (lines 156-161), and copies the session rather than mutating it (line 137).
13. **Debt accrual and forced branching.** `canonDebt` grows by `anchorWeight*0.25` per threatened anchor plus `0.2` per invariant violation; a `rigid` anchor threat or debt ≥ 1 sets `branchId` and a typed `branchOrigin.reason` (`'rigid-anchor-invalidated' | 'canon-debt-threshold' | 'forced'`) — lines 148-155.
14. **Invariant checks exist for the three dangerous classes:** `location`, `object-owner`, `fact-unknown-before` (lines 114-126), the last being a knowledge-boundary invariant (a character holding a fact too early is a violation).

### 1.3 `rpg.js` — workspace-boundary gating

15. **Both mutation entry points require an explicit verification token.** `commitVerifiedBeat` and `applyVerifiedDelta` both begin with `if(meta.verified!==true) return {status:'BLOCKED',reason:'verification-required'}` (lines 28-29), plus `'world-not-loaded'` / `'canon-not-loaded'`. This is the correct shape for a gate: default-deny.
16. **Title forgery controls.** `autoTitle` blocks `boundary===false`, requires finite `confidence ≥ 0.65` and a non-empty name, and coerces `kind` to the frozen `TITLE_KINDS` allowlist (line 34). `recordTitle` rejects case/whitespace-variant duplicates with `duplicate-title` (line 33).
17. **Import is surfaced, not swallowed.** `jsonFile()` wraps pack load in try/catch and renders `'Pack rejected: <message>'` (line 39).
18. **Existing canon fault state reaches the UI.** `aura()` (line 22) runs `canonEngine.audit(canonSession)` and escalates the global aura to `'warning'` when character knowledge FAILS, invariants FAIL, or future anchors are `AT_RISK`.
19. **Existing test baselines.** `release/canon-simulator.test.cjs` and `release/world-runtime.test.cjs` lock in the ordering block, player-agency block, authority ladder, horizon-beats-knownBy, invariant detection, and rigid-anchor auto-branch. These are the current regression floor and must not be broken by any slice below.

---

## 2. Gaps (severity-ranked)

### G1 — CRITICAL: `verified:true` is an unauthenticated caller assertion
`rpg.js:28-29` treats `meta.verified===true` as proof of verification. It is a **boolean the caller supplies**, not evidence the engine checks. Any code holding a reference to `SevenRpgWorkspace` — a plugin, a later workspace, or a replayed call — can mint verified state. There is no signed capability, no expected-digest argument, and no record of *who* verified. This is the entire trusted-canon boundary for model-derived input, and it is one `true` away from failing.

### G2 — CRITICAL: ledger provenance is self-asserted and unvalidated
`applyVerifiedDelta` forwards `meta.source` / `meta.authority` / `meta.transformation` verbatim, and `canon-simulator.js:160` defaults them to `source:'session'`, `authority:'player/runtime'`, `transformation:'scene-commit'`. Consequences:
- `authority` is a **free-text string** while canon's authority model is a **typed A0–A5 ladder** (`AUTHORITY_WEIGHT`). Nothing maps one to the other, so a delta labeled `'A0'` or `'canonical'` is indistinguishable from `'player/runtime'`.
- A model-generated delta submitted through a verifying caller is **recorded with player/runtime authority** — it is laundered into looking trusted. This is precisely the RPG V2 failure condition *"never silently promote model invention into immutable canon"*.

### G3 — CRITICAL: no contradiction detection against established state
`audit()` recomputes ordering, knowledge, invariants, and anchor risk — it never compares a **new claim against prior committed facts**. The RPG V2 contract names *"model can silently contradict established state without detection or repair"* as a failure condition. There is no implementation. Narration (the `#chat` path) never consults `canonSession` or `worldSession` at all; the chat pipeline and the canon engine are **disconnected**. `grep` confirms `commitVerifiedBeat`/`applyVerifiedDelta` have **no callers in production code** — the engines are loaded, auditable, and inert.

### G4 — HIGH: no persistence; continuity is memory-only and unvalidated on re-entry
No RPG writes to `localStorage`/IndexedDB. `snapshot()` (`rpg.js:23`) exists and is exported but is called by nobody. Meanwhile `unmount()` (line 57) deliberately leaves `S.worldEngine/worldSession/canonEngine/canonSession` in `S`, so in-session continuity survives exit/re-enter by accident of non-cleanup — **without any integrity check on re-entry**. There is no schema version, no pack fingerprint, no continuity id, and no re-validation that the retained session still matches the loaded pack.

### G5 — HIGH: `chronology:{status:'PASS'}` is hardcoded
`canon-simulator.js:174` returns a literal `PASS` without checking anything. `session.position` can be moved backwards by any `delta.position` (line 138) with no check, yet `audit()` will assert chronology PASS. A permanently-green false signal is worse than a missing check: it trains downstream consumers (including `aura()`) to ignore the audit object.

### G6 — HIGH: invariants detect but do not refuse
`invariantIssues()` returns issues; `applySceneDelta` pushes them to `warnings` and adds debt (lines 146-163) but **commits the delta anyway**. `severity:'error'` is decorative — no severity value changes the outcome. A `location` or `object-owner` violation becomes canon by default. For `severity:'error'` this should refuse; today it only steers the aura.

### G7 — MEDIUM: `fact.status` self-declaration bypasses the authority ladder
`canon-simulator.js:56` — `if(fact.status) return fact.status;` short-circuits `factStatus()` entirely. A pack (or an imported JSON via `loadCanon`) can declare `status:'verified'` on a fact with **zero sources**. This is the only path to an unsourced `VERIFIED` fact, and it is unvalidated.

### G8 — MEDIUM: import is not transactional
`rpg.js:24` — `S.worldEngine=createEngine(pack)` assigns **before** `S.worldSession=createSession(opts)`. If session construction throws, the workspace holds a **new engine paired with the old pack's session**: a silent engine/session provenance desync with no version check. `session` carries `workId/workVersion` (world) and `packId/packVersion` (canon) — the fields needed to catch this exist but are never compared.

### G9 — MEDIUM: `snapshot()` leaks live references
`snapshot()` returns `S.worldEngine.work` and the live sessions **uncloned** (line 23), exposing mutable engine internals to any persistence or inspection consumer. Contrast: every engine API clones on the way out. This is the seam a persistence layer would first misuse.

### G10 — MEDIUM: the DOM is a mutation ingress
`mount()` listens for `seven:rpg-title-candidate` (line 55) and `autoTitle` consumes `e.detail` directly. A dispatched event with `{confidence:1, boundary:true, name:'...'}` forges a director-sourced title. Combined with G1 this is the pattern to close: **model-reachable input must not be able to assert its own verification.**

### G11 — LOW: single shared `S` state object is globally mutable
`state:S` is exported on the public API (`rpg.js:58`), so `SevenRpgWorkspace.state.worldSession = …` bypasses `commitBeat` entirely. There is no freeze, no accessor discipline, and no single choke point.

### G12 — LOW: session ids embed wall-clock time
`'work-branch-'+Date.now().toString(36)` and `'branch-'+Date.now().toString(36)` make ids non-deterministic — replaying an identical transcript produces different state, which defeats provenance comparison.

---

## 3. Proposed provenance record

A single append-only record shape, stamped on **every** mutation regardless of source, with fields that are typed and non-self-certifying where possible.

```js
// SeventeenProvenanceRecord v1
{
  schema: 'seven.rpg.provenance.v1',

  // Identity & ordering
  id: 'evt-7',                       // monotonic within session, NOT Date.now()
  seq: 7,                            // integer sequence; duplicates rejected
  at: '2026-10-03T05:26:00.000Z',    // informational only — never an identity
  sessionId: 'ses-…',  continuityId: 'anime',  position: 12,

  // Binding (prevents cross-session / cross-pack mixing)
  packId: 'demo-work', packVersion: '1.0.0',
  workId: 'demo-series', workVersion: '1.0.0',
  prevRecordHash: 'sha256-…',  recordHash: 'sha256-…',   // hash chain

  // Provenance — typed, allowlisted, NOT free text
  origin: {
    channel:  'user' | 'model' | 'operator' | 'import' | 'derived' | 'system', // enum
    actor:    'user' | 'runtime' | 'director',                                    // enum
    // Digest of the exact external input. The claim is bound to bytes, not to a boolean.
    inputDigest: 'sha256-…',
    // Typed authority; no arbitrary strings. Maps to AUTHORITY_WEIGHT.
    authority: 'A0'|'A1'|'A2'|'A3'|'A4'|'A5'|null,
    // Populated only when channel==='model'; the model output this was extracted from.
    model: { modelId, turnId, spanIds: [] } | null,
    // Who/what asserted verification — never the producer of the content.
    assertedBy: 'user' | 'operator' | 'verification-service',
    assertedAt: 'ISO-8601'
  },

  // What changed, as typed operations (not an opaque blob)
  ops: [
    { op:'set',     path:'locations/guide',        value:'village',   from:'tower' },
    { op:'learn',   path:'knowledge/hero',         value:'secret' },
    { op:'branch',  path:'branchId',               value:'branch-2',  reason:'rigid-anchor-invalidated' }
  ],

  // Trust verdict, computed by the engine — never supplied by the caller
  trust: {
    tier: 'canon' | 'established' | 'derived' | 'unverified',
    canonStatus: 'verified'|'probable'|'ambiguous'|'conflicting'|'unknown'|'branch-created',
    invariantIssues: [ {id,type,severity} ],
    threatenedAnchors: [ {id,strength,weight} ],
    contradiction: null | { kind, against:[recordIds], resolution:'refused'|'branched'|'accepted' }
  }
}
```

**Invariants the record must guarantee**

1. `origin.channel`, `origin.actor`, `origin.authority` are validated against frozen enums; unknown values reject the record (mirrors `ANCHOR_WEIGHT`/`AUTHORITY_WEIGHT` discipline).
2. **`trust.*` is computed inside the engine and is not writable from the call site.** A caller-supplied `trust` field is discarded, never merged.
3. **`assertedBy !== producer`.** A `channel:'model'` record may not carry `assertedBy:'model'`.
4. Hash-chain: `recordHash = H(prevRecordHash || sessionId, canonicalJSON(record without recordHash))`. Breakage ⇒ session refuses to load (fail-closed), matching the memory-fabric precedent in `memory.cjs:11` (*"corruption cannot be replaced with empty data"*).
5. Records are **append-only**; correcting state emits a compensating record, never an edit.

---

## 4. Safe import / derived-state policy

**P1 — Import is transactional and content-addressed.**
`loadWork` / `loadCanon` must build engine *and* session in a scratch scope, validate, compute `packDigest`, then swap in one assignment. On any failure the previous engine/session pair stays intact (closes **G8**). Persist `packDigest` in the session; on restore, refuse if `packDigest` mismatches (**fail-closed**, not silent reset).

**P2 — Imported packs are untrusted input.**
`validatePack` must additionally reject: a `fact.status` not in `STATUS` (closes **G7** — or delete the short-circuit entirely so the authority ladder is the only route to `VERIFIED`); `authority` outside `A0..A5`; `anchor.strength` outside the ladder (already done); `availableAt` non-numeric; unknown `type` on an invariant; and `delta`-shaped keys smuggled into pack payloads. An imported pack may **raise certainty, never assert it**.

**P3 — Two-class storage, never merged.**
- **Declared canon** — from an imported, validated, digested pack. Read-only at runtime; mutation requires a new pack version.
- **Derived state** — `ledger[]`, `warnings[]`, titles, knowledge sets, relationship/location/object maps, summaries. Append-only via provenance records.

A `channel:'model'` record may write only derived state, and only after a contradiction check (P4). Promotion into declared canon requires `channel:'import'` or `'operator'` with a **re-digested** pack.

**P4 — Contradiction check before every derived commit.**
For each op, compare against established facts and invariants:
- known fact contradicted at/after `availableAt` → refuse, or open a `whatIf` branch when the player explicitly chose the divergence (the engine already has branch mechanics for this — reuse them rather than inventing a second path);
- `severity:'error'` invariant violation → **refuse the commit**, keep `warnings`, do not advance state (closes **G6**);
- future-knowledge in `delta.knowledge` → strip or refuse (closes the silent half of **G3**).

**P5 — Corrupt state is quarantined, never replaced.**
On restore: schema mismatch, hash-chain break, or digest mismatch ⇒ session loads **read-only/quarantined**, surface a visible notice, refuse all mutations until resolved. Never fall back to an empty session — the exact failure `memory.cjs:11` already forbids, and the pattern should be reused verbatim.

**P6 — Audit reports only measured facts.**
Replace the hardcoded `chronology:{status:'PASS'}` with a real monotonic-position check; any check that cannot be performed must report `'UNVERIFIED'`, never `'PASS'` (closes **G5**). Extend `audit()` with a `provenance` section reporting record count, chain validity, last verified source, and any untrusted writes.

**P7 — Close the DOM and reference ingresses.**
Ignore `origin.*` fields supplied by DOM events; derive them from the event's registered source only. Deep-clone `snapshot()` output (closes **G9**). Freeze or accessor-protect `state` so mutations route through the gated functions (closes **G11**).

**P8 — Deterministic ids.**
Replace `Date.now()` ids with session-scoped monotonic counters (closes **G12**), making transcripts byte-reproducible for regression comparison.

---

## 5. Exact first implementation slice

**Scope: provenance core only. No new UI, no new pack format, no narrative integration.**

| # | Change | File | Type |
|---|---|---|---|
| 1 | `normalizeRecord()` — validate enums, freeze `STATUS`/`ORIGIN`/`ACTOR`/`AUTHORITY`, drop caller-supplied `trust`, reject `channel:'model'` + `assertedBy:'model'` | `release/canon-simulator.js` | new pure fn |
| 2 | `hashRecord(prevHash, rec)` + `verifyChain(records)` — canonical-JSON + `sha256` via `node:crypto` shim that degrades to a stable FNV-1a in browser bundles | `release/canon-simulator.js` | new pure fns |
| 3 | `applySceneDelta` stamps the full provenance record; `record.origin.authority` validated against `AUTHORITY_WEIGHT`; `trust` block computed internally | `release/canon-simulator.js` | modify |
| 4 | Invariant gate — `severity:'error'` issues **refuse** the commit and return `{status:BLOCKED, reason:'invariant', issues}`; warn-level proceeds with debt | `release/canon-simulator.js` | modify |
| 5 | `factStatus` drops the `if(fact.status)` short-circuit; add `validatePack` checks for bad `fact.status` / `authority` / `availableAt` / invariant `type` | `release/canon-simulator.js` | modify |
| 6 | `audit()` — real `chronology` check; add `provenance:{records, chain, lastSource, untrustedWrites}` | `release/canon-simulator.js` | modify |
| 7 | `world-runtime.commitBeat` — same provenance record on beat commits, `playerActionSource` mapped to `origin.actor`, chain linked to the canon session when both are live | `release/world-runtime.js` | modify |
| 8 | `loadWork`/`loadCanon` — transactional scratch build + `packDigest` on the session; `snapshot()` deep-clones | `release/workspaces/rpg.js` | modify |
| 9 | `commitVerifiedBeat`/`applyVerifiedDelta` — replace `verified:true` with `assertion:{assertedBy, inputDigest}`; reject model-asserted verification | `release/workspaces/rpg.js` | modify |

**Explicitly out of slice:** persistence (G4), narration integration (G3 narrative side), new UI affordances, pack-format changes, `state` freezing. Slice 1 must be green on the two existing suites before anything else starts.

**Slice 1 exit criteria:** both existing suites still pass unmodified in behavior; `verifyChain` detects a single flipped byte; a model-channelled record with forged `trust` is rejected; an `error`-severity invariant violation returns `BLOCKED` with the previous session byte-identical.

---

## 6. Tests — RPG-03 / RPG-04 / RPG-06

No RPG test file exists today; `all.cjs` lists no RPG suite. The engine suites run under Node and `require()` the UMD modules directly, so the new tests need no browser. Proposed file: **`release/rpg-provenance.test.cjs`**, added to the `releaseTests` array in `all.cjs:5`.

### RPG-03 — Import provenance & fail-closed integrity
- **RPG-03.1** Invalid pack → `createEngine` throws; message lists offending issues. *(guards the existing throw at `canon-simulator.js:51`)*
- **RPG-03.2** Pack declaring `fact.status:'verified'` with **zero sources** → rejected at `validatePack`, or `factStatus()` returns `PROBABLE`. *(G7)*
- **RPG-03.3** Pack with `authority:'A9'` or non-numeric `availableAt` → rejected; engine not constructed.
- **RPG-03.4** `loadWork` with a throwing session factory leaves **both** `worldEngine` and `worldSession` at their prior values — no desync. *(G8)*
- **RPG-03.5** `snapshot()` output mutation does not affect engine or session internals. *(G9)*
- **RPG-03.6** `world.js` duplicate beat id → throws `'duplicate work beat'`; duplicate fact id across groups → `validatePack` reports `duplicate`.
- **RPG-03.7** `chronology` audit reports `FAIL`/`UNVERIFIED` after a backwards `position` — never a hardcoded `PASS`. *(G5)*
- **RPG-03.8** Reused-record attack: replaying a prior `id` with the same `seq` is rejected; ledger length unchanged.

### RPG-04 — Mutation provenance & knowledge-boundary integrity
- **RPG-04.1** `commitVerifiedBeat({verified:true})` **without** `assertion.assertedBy`/`inputDigest` → `BLOCKED:'verification-required'`. *(G1)*
- **RPG-04.2** Record with `channel:'model'` + `assertedBy:'model'` → rejected, no ledger append. *(G3 of §3)*
- **RPG-04.3** Caller-supplied `trust.tier:'canon'` on a `model`-channel delta is **discarded**; the computed tier wins. *(G2)*
- **RPG-04.4** `origin.authority:'A0'` on a delta with no `sourceRefs` → downgraded by the authority ladder; never yields `canon` tier. *(G2)*
- **RPG-04.5** An `error`-severity `location` invariant violation → `{status:BLOCKED, reason:'invariant'}`; session deep-equals the pre-call snapshot. *(G6)*
- **RPG-04.6** `delta.knowledge` granting a fact before `availableAt` → refused or stripped; `audit().characterKnowledge` stays `PASS` after the commit. *(G3)*
- **RPG-04.7** Horizon still beats static `knownBy` (preserve the existing assertion).
- **RPG-04.8** `commitBeat` with `playerActionSource:'runtime'` → `BLOCKED:'player-agency'`, history length unchanged.
- **RPG-04.9** A forged `seven:rpg-title-candidate` DOM event cannot assert its own `origin`; recorded titles show `source:'operator'` at most, never `model`. *(G10)*
- **RPG-04.10** Hash chain: flip one byte in a stored record → `verifyChain` fails → session loads quarantined and refuses mutations. *(P5)*
- **RPG-04.11** Two identical transcripts produce identical record ids/hashes (no `Date.now()`). *(G12)*

### RPG-06 — Persistence round-trip, corruption & quarantine
- **RPG-06.1** Snapshot → restore → `packDigest`, `continuity`, `ledger`, `canonDebt`, `branchOrigin` all identical.
- **RPG-06.2** Restore with a **different** pack digest → quarantined, mutations `BLOCKED`, visible notice; **never** an empty session.
- **RPG-06.3** Restore with schema-version drift → quarantined, not silently migrated.
- **RPG-06.4** Corrupt storage string (truncated JSON) → quarantine path; original bytes not overwritten. *(mirrors `memory.cjs:11`)*
- **RPG-06.5** Re-entry after `unmount()` re-validates engine↔session pairing (`workId`/`workVersion`, `packId`/`packVersion`) and fails closed on mismatch. *(G4)*
- **RPG-06.6** Ledger/titles survive a workspace exit/re-enter cycle; `canCharacterKnow` still denies a fact the character never learned pre-exit.
- **RPG-06.7** A corrupt restore does **not** erase the last known-good bundle (no silent overwrite), and `audit().provenance.chain` reports `FAIL` with the offending record id.

---

## 7. Risks & dependencies

**Risks**

1. **Behavior change is user-visible.** Making `error` invariants refuse commits (step 4) turns previously-accepted states into `BLOCKED`. Expected and correct, but it will change existing `release/canon-simulator.test.cjs` behavior at the `applySceneDelta` assertions if any fixture relies on warn-and-continue. **Mitigation:** run the suite first; gate the refuse path on `severity==='error'` only.
2. **Dropping the `fact.status` short-circuit changes `factStatus()` outputs.** Any fixture relying on a self-declared status will flip tier. **Mitigation:** audit the two test files for `status:` fields before the change.
3. **Hashing in the browser bundle.** `node:crypto` is unavailable in the shipped web/Capacitor runtime. **Mitigation:** deterministic FNV-1a fallback, byte-identical output in both environments so Node tests remain authoritative.
4. **`rpg.js` has zero test coverage today**, so any refactor of it is unguarded. **Mitigation:** land RPG-03/04's pure-function tests before touching `rpg.js` lines 23-29.
5. **Scope creep into narration integration (G3)** would pull the chat pipeline — a much larger surface — into this wave. **Mitigation:** hard stop at slice step 9; narration-side contradiction detection is a separate slice.
6. **Persistence (G4) touches storage infrastructure** shared with the memory fabric. **Mitigation:** namespace keys (`seven_rpg_session_v1`) and reuse the memory fabric's quarantine semantics rather than introducing a second convention.

**Dependencies**

- `.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md` — the state contract (immutable canon / world state / character knowledge / relationships / player decisions / derived summary) and the "every persisted mutation needs provenance sufficient for debugging" requirement this report implements. Its stated failure conditions map 1:1 onto G1, G3 and G4.
- `release/canon-simulator.test.cjs`, `release/world-runtime.test.cjs` — the regression floor that must stay green.
- `memory.cjs` (lines 10-16) — the in-repo precedent for fail-closed writes, no-empty-fallback corruption handling, and duplicate-ledger-id rejection; the RPG persistence slice should mirror it rather than invent new semantics.
- `release/workspaces/hub.js` — declares RPG's `deps` on `SevenCanon` + `SevenWorld`, so both runtimes load before `rpg.js`. Any new module must be added there, not fetched ad hoc from `rpg.js`.
- `all.cjs:5` — the `releaseTests` list must gain the new suite or CI will not run it.
- **Owner coordination:** the `aura()` escalation path (`rpg.js:22`) consumes `canonEngine.audit()`; changing the audit shape to add `provenance` is additive but should be announced so Team A surfaces do not assume a fixed audit shape.

---

*Audit was read-only. No production source file was modified by this task.*

WAVE01=COMPLETE
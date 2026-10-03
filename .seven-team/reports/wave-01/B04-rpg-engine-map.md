# B04 — RPG V2 Engine Map: Minimal Slice (Wave 01B)

- **Team:** B
- **Worker:** B04
- **Agent:** OpenHands
- **Scope:** Map the smallest RPG V2 engine slice proving `choice -> state mutation -> later narration -> persistence restore`
- **Method:** read-only inspection. No production source modified.

---

## 0. Files inspected (all present)

| File | Lines | Role |
|---|---|---|
| `release/workspaces/rpg.js` | 58 | RPG workspace UI + engine façade, `SevenRpgWorkspace` |
| `release/world-runtime.js` | 102 | Beat/story engine, `SevenWorld` |
| `release/canon-simulator.js` | 187 | State/canon/knowledge engine, `SevenCanon` |
| `release/workspaces/hub.js` | 1 (minified) | Workspace loader; declares RPG deps |
| `release/control-bridge.js` | 1 (minified) | `worldContractTruth` / `guardCanonCommit` seam |
| `release/build-release.cjs` | L132–166 | Emits `canon-simulator.js` + `world-runtime.js` into dist `workspaces/` |
| `release/canon-simulator.test.cjs`, `release/world-runtime.test.cjs` | — | Existing node/assert unit suites |
| `all.cjs` | 9 | Test runner; `releaseTests` array lists both suites |
| `seven_ai-final.html` | ~12k | Shared core: `sendMessage` L6325, `generateReply` L7883, prompt assembly L6665–6673 |

No requested file was absent.

---

## 1. Current architecture and data flow

### 1.1 Three independent modules, two disconnected sessions

All three use the same UMD-ish shape: CommonJS export when available, otherwise a global.

- `world-runtime.js` → `module.exports=api` else `root.SevenWorld`
- `canon-simulator.js` → `module.exports=api` else `root.SevenCanon`
- `workspaces/rpg.js` → **not** CommonJS; it is an IIFE `(function(r){...})` that hard-exits at line 2–3 (`if(!r||!r.document)return;`). It is **DOM-only and untestable in node as-is.**

`rpg.js:6` holds all state in one object:

```js
const S={version:'2.2.0-beta.1',root:null,bar:null,
         worldEngine:null,worldSession:null,
         canonEngine:null,canonSession:null,
         observer:null,titleHandler:null};
```

### 1.2 Entry points are pack-gated

- `rpg.js:24` `loadWork(pack,opts)` — throws `'SevenWorld runtime unavailable'` unless `r.SevenWorld.createEngine` exists; requires a caller-supplied `pack`.
- `rpg.js:25` `loadCanon(pack,opts)` — same shape for `SevenCanon`.
- The only UI affordance for these is a hidden `<input type=file>` (`rpg.js:52`, wired at `rpg.js:53`) reached from the "Load Real Works" / "Load Canon" drawer buttons.

**There is no zero-config start.** Nothing in the tree mints a default world/canon pack. `hub.js:1` only *loads* `rpg.js` and calls `next.mount(n)`.

### 1.3 Current data flow (what actually happens today)

```
JSON file  --jsonFile(rpg.js:39)--> loadWork/loadCanon(rpg.js:24-25)
     |                                     |
     |                                     +--> S.worldEngine / S.worldSession
     |                                     +--> S.canonEngine  / S.canonSession
     |                                     |
     |                          renderStatus(rpg.js:37)
     |                                     |
     |                          currentContract(rpg.js:26)
     |                                     |
     |                     worldEngine.sceneContract(worldSession)
     |                          --> rendered into ONE text node
     |                             [data-rpg-state]  (rpg.js:52/37)
     |
  commitVerifiedBeat(rpg.js:28)  applyVerifiedDelta(rpg.js:29)
     |                    |
  worldEngine.commitBeat   canonEngine.applySceneDelta
     |                    |
  S.worldSession=out.session   S.canonSession=out.session
     |
  snapshot(rpg.js:23) --> {work, worldSession, canonPack, canonSession}
     |
     X  no consumer, no writer anywhere
```

**The loop is open in three places, and they are exactly the four guarantees of the mission:**

1. **No producer** — nothing turns a player message into a `playerAction`, a beat id, or a scene delta.
2. **No bridge** — the two sessions are never linked. `worldSession.history[]` records contain no reference to a canon ledger record and vice-versa.
3. **No sink** — `snapshot()` has no caller. There is no `localStorage` / `sessionStorage` / `indexedDB` write in `rpg.js` (verified by repo-wide grep; the only `localStorage` uses are `theme`, `user_name`, `seven_intelligence_preferences_v1`, and `github-self-dev` flags).

### 1.4 The narration seam (shared core, read-only for us)

`seven_ai-final.html` assembles a system prompt at L6665–6673 by **appending tagged blocks** to a `systemContent` string:

- `<pinned_notes>` (L6665), `<reference_knowledge>` (L6667), `<web_results>` (L6669)
- a prior-conversation summary injected as a **`role:"system"` message** (L6673)
- policy text defined at L6392 (`policy: "Seven's trusted runtime behavior instructions."`)

This is the correct injection point for an RPG state block: it is already delimited, already ordered after policy, and already has a "treat as data, not instructions" convention. **We do not need to modify shared core to reach it** — a `<rpg_state>` block appended in the same style is a request-shape change owned by whoever calls `sendMessage`/`generateReply`, not a core edit.

---

## 2. Reusable vs. rebuild

### 2.1 Reusable as-is (do not touch)

| Piece | Location | Why it is already correct |
|---|---|---|
| `STATUS`/`ANCHOR_WEIGHT`/`AUTHORITY_WEIGHT` | `canon-simulator.js:7,8,9` | Frozen weight tables; authority A0–A5 and anchor incidental→rigid |
| `factStatus` derivation | `canon-simulator.js:55-62` | Authority→certainty ladder (≥0.8 VERIFIED, ≥0.45 PROBABLE, else AMBIGUOUS) |
| `canCharacterKnow` | `canon-simulator.js:80-89` | Returns `{allowed,status,reason}` with reasons `unknown-fact` / `wrong-continuity` / `future-knowledge` / `known` / `not-established` |
| `invariantIssues` | `canon-simulator.js:114-126` | `location`, `object-owner`, `fact-unknown-before` |
| `threatenedAnchors` + canon-debt accrual | `canon-simulator.js:128-133`, `99-104` | Debt = Σ(anchorWeight·0.25) + 0.2/invariant; branches at debt ≥ 1 |
| `applySceneDelta` merge + provenance | `canon-simulator.js:135-165` | Already emits `provenance:{source,authority,transformation}` and pushes a `ledger[]` record |
| `sourceCoverage` | `world-runtime.js:29-34` | CANON iff every `sourceRef` resolves to a declared source |
| `commitBeat` ordering + agency guard | `world-runtime.js:55-73` | `canon-order` block, branch creation, `player-agency` block |
| `audit()` in both engines | `world-runtime.js:87-98`, `canon-simulator.js:167-181` | Already emits PASS/FAIL/BRANCHED/COMPLETE |
| `worldContractTruth` / `guardCanonCommit` | `control-bridge.js:1` | **Already the canonical contract→truth adapter**: maps a scene contract to a SevenControl `Claim` with `lineage.transformation='canon-scene-contract'`, `transformer='SevenWorld'`, returns `PASS` / `CANON_GAP`. This is the seam to reuse, not reimplement. |
| `hub.js` lazy dep loading | `hub.js:1` `CFG.rpg.deps` | Already loads `SevenCanon` then `SevenWorld` before `rpg.js` |
| UMD + `all.cjs` test convention | both runtimes, `all.cjs:5` | Plain node `assert/strict` scripts, no framework, no deps |

### 2.2 Rebuild (the actual gap)

| Missing thing | Evidence | Why existing code cannot cover it |
|---|---|---|
| **A turn context projection** | `buildSceneContract` (`canon-simulator.js:98-113`) returns `mustBeTrue`, `mustNotYetBeKnown`, `activeCharacters`, `characterGoals`, `relationshipState`, `locationState`, `canonObligations`, `possibleExitStates` — **it omits `session.world`, `session.objects`, and the per-character `knowledge` map.** | The three most mutation-relevant slices never reach the next turn. Also `scene` is a *caller-supplied argument*, so nothing derives it from session state. |
| **A single atomic commit** | `rpg.js:28` and `rpg.js:29` are two independent calls with two independent sessions | A beat can commit while its delta fails, or vice-versa. No shared transaction id exists. |
| **Provenance of the actual choice text** | `world-runtime.js:69` builds `record={...,playerActionSource:input.playerActionSource||null,at:...}` — **`input.playerAction` is validated (L70) but never stored.** | The player's literal words are dropped. Later narration cannot be traced to the choice that caused it, and no test can assert "this turn happened *because* the player said X." |
| **Character-knowledge projection + narration guard** | `canon-simulator.js:167-181` `audit()` only flags `reason==='future-knowledge'` (L123); `not-established` leaks are never flagged. Knowledge merge at L96-98 is **additive Set-union only** — never revocable. | RPG-03 needs (a) a way to *revoke*/mark-not-known, and (b) a check of what the *narration* claimed vs what a character may know, not just state-vs-horizon. |
| **A zero-config start** | `rpg.js:24-25` only | RPG-01's ≤3-action budget is unreachable; the first user action is supplying JSON. |
| **A persistence layer** | no storage write in `rpg.js`; `unmount()` (`rpg.js:57`) tears down without snapshotting | RPG-04 depends entirely on a host that does not exist. |
| **A surfaced contradiction path** | `aura()` (`rpg.js:22`) collapses knowledge FAIL / invariant FAIL / at-risk anchor into one cosmetic `SevenAurora.set('warning','medium')` | RPG-06 requires block-or-repair surfaced to the user, not a mood ring. |

---

## 3. Proposed minimal state schema

One serializable document. It is the unit of persistence, the unit handed to `loadWork`/`loadCanon` as `opts`, and the unit projected into the prompt. **No nested `raw world history`** (contract: "must not send the entire raw world history on every request").

```jsonc
{
  "schemaVersion": 1,
  "sessionId": "rpg-s-...",
  "worldId": "w-...",
  "continuity": "default",
  "turn": 7,                 // monotonically increasing; the restore cursor
  "position": 12,            // feeds canon horizon / availableAt
  "canon": {                 // immutable / declared — never mutated by a turn
    "packId": "...", "packVersion": "1.0.0"
  },
  "world":    { "gateOpen": true },        // canon session .world
  "locations":{ "guide": "village" },      // canon session .locations
  "objects":  { "blade": { "owner": "hero" } },
  "relationships": { "hero:guide": { "trust": 0.2 } },
  "knowledge": { "hero": ["f-secret"], "guide": [] },   // character-local, per characterId
  "intent":   { "hero": "wants the gate open" },        // contract step 5
  "headings": [ { "beatId": "ep1-start", "index": 0, "turn": 3 } ],  // world session beatIndex+history
  "ledger": [                                        // append-only, one entry per turn
    {
      "id": "evt-1",
      "turn": 7,
      "beatId": "ep1-end",
      "choiceText": "I tell the guard my name",      // <-- MISSING today; required
      "choiceSource": "user",                        // provenance of the choice
      "delta": { "relationships": {"hero:guide":{"trust":0.4}},
                 "knowledge": {"guide":["f-secret"]} },
      "provenance": { "source":"user", "authority":"player",
                      "transformation":"scene-commit" },
      "contractStatus": "CANON",                     // world sceneContract status
      "truthStatus": "PASS"                          // control-bridge guardCanonCommit
    }
  ],
  "updatedAt": "1970-01-01T00:00:00.000Z"
}
```

**Mapping to existing engines (no new storage model):**

| Schema field | Owner today |
|---|---|
| `world`, `locations`, `objects`, `relationships`, `knowledge`, `position`, `continuity` | canon session (`canon-simulator.js:64-79`) |
| `headings`, `workId`, `branchId`, `branchOrigin`, `titles` | world session (`world-runtime.js:39`) |
| `ledger` | canon session `.ledger` — extend the record with `turn`, `choiceText`, `choiceSource`, `beatId`, `contractStatus`, `truthStatus` |
| `intent` | **new** — one line, satisfies contract step 5 |

The two sessions stay separate inside the engines; `ledger[i].beatId` is the **new cross-link** that today does not exist.

---

## 4. Exact turn pipeline

Nine steps. Steps 2–5 and 9 are new; 1, 6, 7 reuse existing functions verbatim.

```
TURN N
 1. CONTRACT         worldEngine.sceneContract(worldSession)                    [EXISTING]
                     → {status, expectedBeatId, beat, sourceRefs, anchors,
                        requiredFacts, forbiddenChanges, playerAgencyLock}
 2. PROJECT          canonEngine.buildSceneContract(canonSession, sceneFromContract)
                     + NEW projectTurnContext(state)                            [REBUILD]
                     → bounded block: contract status, current world vars,
                       relationshipState, locationState, per-character
                       allowedKnow/withheldKnow, intent, last 3 ledger entries
 3. GENERATE         append "<rpg_state>…</rpg_state>" to systemContent in the
                     same style as <pinned_notes>/<reference_knowledge>        [NEW, no core edit]
                     → sendMessage / generateReply                              [shared core, read-only]
 4. EXTRACT          from the model reply, emit {beatId?, delta, choiceText}   [REBUILD]
                     choiceText MUST be the player's own prior message verbatim [REBUILD]
 5. GATE             worldEngine.commitBeat(worldSession, {beatId,
                     playerAction:choiceText, playerActionSource:'user'})
                       → BLOCKED canon-order | player-agency | unknown-beat
                     control-bridge.guardCanonCommit({contract, work, commitResult})
                       → BLOCKED canon-status-without-complete-source-coverage
                     canonEngine.canCharacterKnow(...) per emitted knowledge
                       → BLOCKED not-established | future-knowledge
                     canonEngine.invariantIssues(...)                            [EXISTING, as gates]
 6. COMMIT (atomic)  canonEngine.applySceneDelta(canonSession, delta,
                     {id:'evt-N', source, authority, transformation})
                     persist ONE document with beatIndex + ledger record
                     together, under a single turn id                            [REBUILD glue]
 7. AUDIT            canonEngine.audit(canonSession) + worldEngine.audit(worldSession)
                     FAIL/AT_RISK → surfaced notice, not aura() only            [REBUILD surfacing]
 8. TITLE            autoTitle(...) only on beat.titleBoundary === true        [EXISTING]
 9. PERSIST          writeState(state)                                          [REBUILD]

TURN N+1  step 2 reads the mutated state → narration must reflect it.  <== RPG-02 proof
RESTORE   restore() → createEngine(pack) + hydrate sessions from state → step 1   <== RPG-04 proof
```

**Gate ordering note:** `commitBeat` currently constructs `record` at `world-runtime.js:69` *before* the agency check at L70. Harmless today (the push happens at L71, after the early return) but fragile — the new slice should move the guard above the record construction.

---

## 5. How the player choice is committed and provenanced

**Today:** the choice is *validated then discarded*.
- `rpg.js:28` `commitVerifiedBeat` forwards `input.playerAction` and `input.playerActionSource`.
- `world-runtime.js:70` blocks unless `playerActionSource === 'user'` — reason `player-agency`.
- `world-runtime.js:69` stores only `playerActionSource`. `playerAction` is never written.

**Required:** a single provenance triple stamped once per turn and carried in three places.

| Field | Source of truth | Where it lands |
|---|---|---|
| `choiceText` | the verbatim player message from the chat composer | `ledger[i].choiceText`, `worldSession.history[j].playerAction`, and the `<rpg_state>` block as `lastChoice` |
| `choiceSource` | `'user'` — only `'user'` is accepted; runtime/model may never author it | `ledger[i].choiceSource` = `provenance.source`, `history[j].playerActionSource` |
| `choiceTurn` | the turn counter | `ledger[i].turn` |

Rules:
1. `choiceSource` defaults to `'user'` and **fails closed** — any other value is `BLOCKED / player-agency`, mirroring `world-runtime.js:70`.
2. `choiceText` must be non-empty for a turn that mutates state; empty choice + non-empty delta → `BLOCKED / choice-required`. This is what makes "choice caused this mutation" checkable rather than asserted.
3. The record's `provenance` reuses `canon-simulator.js:113`'s existing shape (`source` / `authority` / `transformation`) rather than inventing a lineage type.
4. Cross-link: `ledger[i].beatId === headings[i].beatId` so the story heading and the state mutation for a turn are provably the same event.

**Assertion RPG-02 rests on:** `ledger[last].choiceText` contains a distinctive token, and the *next* turn's `projectTurnContext()` output contains the mutated variable. Both come from the same persisted document — no narration scraping required.

---

## 6. How next-turn context reflects the mutation

`projectTurnContext(state)` — the only genuinely new function in the slice. It must be a **pure projection over persisted state**, so it is trivially testable and provably reflects restore.

```
IN:  state (schema §3)
OUT: {
  turn, position, continuity,
  contract: { status, expectedBeatId, playerAgencyLock, forbiddenChanges, sourceRefs },
  world:     state.world,                    // bounded, declared vars only
  locations: state.locations,
  objects:   state.objects,
  relationships: state.relationships,
  intent:    state.intent,
  characters: [ { id, mayKnow:[factId], mustNotKnow:[factId], intent } ],   // per characterId
  lastChoice: state.ledger.at(-1)?.choiceText,
  recentChanges: state.ledger.slice(-3).map(e => ({ turn, delta, provenance })),
  canon: { debt, branch, status }
}
```

Rules:
- **Bounded**: only declared `world` keys + last 3 ledger entries. Full `ledger` never goes into the prompt (contract performance budget).
- **Per-character**: for each `characterId` in `state.knowledge`, emit `mayKnow` = intersection of `state.knowledge[id]` with `canCharacterKnow(...).allowed`, and `mustNotKnow` = facts in `knowledge` **or** `fact.knownBy` that the character is *not* allowed to know. This is the RPG-03 lever.
- **Additive loss**: the projection is what the model reads. If a mutation is absent from the projection, it cannot reach narration — which converts RPG-02 from an invisible failure into a diffable assertion.

`buildSceneContract` is *not* replaced; it is called with a `scene` derived from step 1's contract so its existing `mustBeTrue` / `mustNotYetBeKnown` / `possibleExitStates` fields become populated instead of caller-guessed.

---

## 7. Restore path

```
restore(storageKey)
 1. raw = readState(storageKey)              -> null if fresh install
 2. if (!raw) return startNew()              -> zero-config default world (RPG-01)
 3. state = migrate(raw)                     -> schemaVersion guard, default fill
 4. canonEngine = SevenCanon.createEngine(defaultCanonPack)
    worldEngine = SevenWorld.createEngine(defaultWorldPack)
 5. canonSession = canonEngine.createSession({
      continuity, position, world, knowledge, relationships,
      locations, objects,
      ledger, branchId })                    -> canon-simulator.js:64-79
 6. worldSession = worldEngine.createSession({
      continuity, beatIndex, branchId, branchOrigin,
      history, titles })                     -> world-runtime.js:37-40
 7. return projectTurnContext(state)          -> step 2 of the very next turn
```

Key properties:
- **Hydration is already free.** `createSession(opts)` in *both* engines already accepts a prior-state object and `arr()`/`clone()` normalize it (`world-runtime.js:39`, `canon-simulator.js:70`). **No new deserializer is required** — this is the single biggest reuse win.
- **`createSession` deliberately drops `branchId`/`branchOrigin` on the canon side** (`canon-simulator.js:71` hardcodes `null`). Restore must therefore re-apply `state.branchId` **after** `createSession`, or a restored branch silently reverts to CANON. This is a concrete restore bug to handle in the slice.
- Storage: one key, e.g. `seven_rpg_state_v1`, single `JSON.stringify`. No indexedDB for this slice.
- **Write points:** end of each committed turn (step 9), and defensively in `unmount()` — `rpg.js:57` currently tears down with no snapshot, so a workspace switch mid-turn loses the turn.
- **Verification trick:** restore is provable in node without DOM by comparing `projectTurnContext(fresh)` vs `projectTurnContext(restored)` for deep equality.

---

## 8. Character-local knowledge seam

Three existing primitives do the work; two gaps need closing.

**Working today:**
- Storage: `session.knowledge[characterId]` = array of factIds (`canon-simulator.js:66,75`).
- Additive grant: `applySceneDelta` merges `delta.knowledge` per character via Set-union (`canon-simulator.js:96-98`).
- Check: `canCharacterKnow(session, characterId, factId, position)` returns `{allowed,status,reason}` (`canon-simulator.js:80-89`). **Note the ordering** — the dynamic `availableAt` horizon check (L86) runs *before* the static `fact.knownBy` check (L88), so a future fact cannot be smuggled in by `knownBy`. `canon-simulator.test.cjs` already asserts this (`'future horizon must beat static knownBy'`). Preserve that ordering in any rewrite.
- Invariant backstop: `fact-unknown-before` in `invariantIssues` (`canon-simulator.js:120-122`).
- BuildSceneContract already accepts `mustNotYetBeKnown` (`canon-simulator.js:100`) — the intended hook.

**Gap 1 — revocation.** `knowledge` only ever grows (Set-union). A revealed secret cannot become unknown again on a branch, on a `position` rollback, or when a character forgets. **Minimum fix:** extend the delta shape to `{knowledge:{id:{add:[],revoke:[]}}}` while keeping the bare-array form working, or add a `knowledgeRevocations` array applied after the union. Do not change `createSession` shape.

**Gap 2 — narration is unverified.** `audit()` (L167-181) checks state-vs-horizon only. A leak shows up as *Character B's dialogue containing a fact B cannot know*, which no current function can see. **Minimum fix:** a `checkNarrationKnowledge(state, {characterId, factIdsClaimed})` helper reusing `canCharacterKnow`, invoked on extracted deltas, returning the same `{allowed,status,reason}` shape. Surfacing reuses `invariantIssues`-style warnings rather than `aura()`.

**RPG-03 assertion:** reveal `f-secret` to `guide` only; assert `projectTurnContext().characters` lists it under `guide.mayKnow` and under `hero.mustNotKnow`; assert `checkNarrationKnowledge(state,'hero',['f-secret']).reason === 'not-established'`.

---

## 9. First implementation files and functions

Ordered. Steps 1–2 are inside the existing Team B lease; steps 3–5 are new files.

### Step 1 — `release/world-runtime.js` (extend)
- `commitBeat` L55–73 — **add `playerAction` to the history `record`** (L69) and move the agency guard above record construction.
- `sceneContract` L43–54 — add `mutationSince(session, fromTurn)` returning the bounded changed-variable set; this is the beat-side of the projection.

### Step 2 — `release/canon-simulator.js` (extend)
- `createSession` L64–79 — accept `branchId`/`branchOrigin`/`ledger` from `opts` instead of hardcoding `null` (restore fix, §7).
- `applySceneDelta` L135–165 — accept `meta.choiceText`, `meta.choiceSource`, `meta.turn`, `meta.beatId`, `meta.contractStatus`, `meta.truthStatus`; add `knowledgeRevocations`.
- `buildSceneContract` L98–113 — include `world`, `objects`, and a per-character `knowledge` view.
- **NEW** `checkNarrationKnowledge(session, characterId, factIds, position)` — wraps `canCharacterKnow`, returns `{allowed,status,reason,factId}`.
- `audit` L167–181 — add a `narrationKnowledge` sub-report alongside `characterKnowledge`.

### Step 3 — **NEW** `release/rpg-state.js` (pure, node-testable, no DOM)
- `SCHEMA_VERSION = 1`
- `defaultWorldPack()` / `defaultCanonPack()` — the zero-config start that unblocks RPG-01. Model them on the fixtures already proven in `world-runtime.test.cjs` and `canon-simulator.test.cjs`.
- `createState(opts)`
- `projectTurnContext(state)` — §6
- `applyTurn(state, {beatId, choiceText, choiceSource, delta})` — the atomic step-6 commit; returns `{state, status, reason}`
- `migrate(raw)` — schemaVersion guard + default fill
- `serialize` / `deserialize` (JSON-safe, no engine dependency)

### Step 4 — **NEW** `release/rpg-persistence.js` (node-testable via injected storage)
- `createStore({read, write, remove})` — injected, so tests use a Map. No direct `localStorage` reference in engine code.
- `save(state)` / `load()` / `clear()` / `restore()` (§7) — key `seven_rpg_state_v1`

### Step 5 — `release/workspaces/rpg.js` (thin wiring only)
- `startNew()` / `resume()` — the ≤3-action path; `resume()` tries `load()` first.
- `runTurn(playerText)` — steps 4–6.
- `unmount()` L57 — add a defensive `save()`.
- `aura()` L22 — keep the mood ring, but **also** surface `audit()` FAIL/AT_RISK through `notice(msg,'error')` (L36), which already exists and is already styled via `.seven-rpg-notice[data-state=error]`.
- **Structural prerequisite:** `rpg.js:2-3` returns early without `document`. Pure logic must move to `rpg-state.js`/`rpg-persistence.js`; `rpg.js` keeps only DOM + delegation. Without this, none of the above is testable in node.
- **Append the `<rpg_state>` block** where `systemContent` is assembled (`seven_ai-final.html:6665-6673`) — a request-shape change by the shared-core owner, using the existing tag convention. Flagged, not self-assigned.

---

## 10. Test hooks for RPG-01..06

New suite **`release/rpg-slice.test.cjs`** — plain node `assert/strict`, matching the existing convention exactly (see `canon-simulator.test.cjs` / `world-runtime.test.cjs`: build fixtures inline, assert, `console.log('<name>: PASS')`). No new dependencies.

| ID | Test hook | Assertion |
|---|---|---|
| **RPG-01** Start | `createState({worldPack:defaultWorldPack(),canonPack:defaultCanonPack()})` | State is constructible with **zero external input**; `startNew()` returns a state whose `projectTurnContext()` has a non-empty `contract.expectedBeatId` and no import step. Assert no `localStorage`/file read is required. |
| **RPG-02** Consequence | `applyTurn(s,{beatId, choiceText:'open the gate', choiceSource:'user', delta:{world:{gateOpen:true}}})` then `projectTurnContext(next)` | (a) `next.world.gateOpen === true`; (b) `next.ledger.at(-1).choiceText === 'open the gate'`; (c) **`projectTurnContext(next)` contains the mutated variable while `projectTurnContext(before)` did not** — the exact proof the old code could not give. Also assert `ledger.at(-1).beatId === headings.at(-1).beatId`. |
| **RPG-03** Knowledge | `applyTurn(...,{delta:{knowledge:{guide:['f-secret']}}})`, then `checkNarrationKnowledge(s,'hero',['f-secret'])` | `projectTurnContext().characters` → `guide.mayKnow` includes `f-secret`, `hero.mustNotKnow` includes it; `checkNarrationKnowledge(...).allowed === false` and `.reason === 'not-established'`; re-assert the `canon-simulator.test.cjs` invariant that `availableAt` beats `knownBy`. Plus: `applyTurn(...,{knowledgeRevocations:{guide:['f-secret']}})` removes it. |
| **RPG-04** Persistence | `serialize` → fresh store → `restore()` | `deepEqual(projectTurnContext(restored), projectTurnContext(saved))`; `restored.turn` and `restored.ledger.length` match; **`restored.ledger.at(-1).choiceText` survives** (fails today — the text is never stored). Explicitly assert a restored `branchId` is still set (catches the `createSession` `null` hardcode). |
| **RPG-05** Long continuity | Loop 20 scripted turns (`for (let t=1;t<=20;t++)`) mixing `position` advances and beat commits | `ledger.length === 20`; every `fact-unknown-before` and location invariant still PASSes; the projection stays bounded (`recentChanges.length <= 3`) while `ledger.length === 20` — proves the performance budget; turn counter and heading index advance monotonically. |
| **RPG-06** Canon conflict | Three cases: (i) `commitBeat` out of order → `BLOCKED`/`canon-order`; (ii) `guardCanonCommit` with `contract.status==='CANON'` but unresolved `sourceRefs` → `allowed:false` / `CANON_GAP`; (iii) `applySceneDelta` invalidating a `rigid` anchor → `branched:true`, `branchOrigin.reason==='rigid-anchor-invalidated'`; plus `playerActionSource:'runtime'` → `BLOCKED`/`player-agency` | Each conflict is **returned and surfaced**, not silently absorbed — the direct contrast with today's `aura()` mood-ring behaviour. |

Additional non-ID regression hooks worth including for free:
- `serialize(deserialize(x))` round-trip is stable (guards the restore path against `clone()` surprises).
- Unknown `schemaVersion` → `migrate` returns a fresh state rather than throwing.

### CI registration (BLOCKER — needs a lease)
`all.cjs:5` hardcodes the `releaseTests` array; the new suites **will not run under `npm test`** until appended. `all.cjs` is repo-root shared core, outside the Team B lease (`release/workspaces/rpg.js`, `release/world-runtime.js`, `release/canon-simulator.js`). Either:
- **Option A (needs manager lease):** add `path.join('release','rpg-slice.test.cjs')` and `path.join('release','rpg-state.test.cjs')` to `all.cjs`.
- **Option B (no lease):** run the suites standalone in Wave-01B CI and defer `all.cjs` to integration review.

Recommend A — an unregistered suite is the same failure class as RPG-04 (state that exists but is not proven).

---

## 11. Dependencies and risks

### Lease / ownership
- `release/world-runtime.js`, `release/canon-simulator.js`, `release/workspaces/rpg.js` — inside the Team B lease. Steps 1, 2, 5 are self-servable.
- `all.cjs` — **outside the lease. Blocks CI registration.** Raise for a manager lease or take Option B.
- `seven_ai-final.html` prompt assembly (L6665–6673) — **shared core, read-only.** Required for the `<rpg_state>` block to actually reach the model. *This is the single highest-risk dependency: without it, steps 1–2 build a projection nobody reads and RPG-02 still fails.* Raise as a requirement with a ready-made request-shape spec (§4 step 3), not an edit.

### Technical risks
1. **Projection not wired (critical).** Engine changes without the `<rpg_state>` injection produce correct state and unchanged narration — RPG-02 fails silently. Mitigation: land the request-shape change first or in the same wave; make the RPG-02 test assert on `projectTurnContext()` *and* require a live-prompt assertion in `release-verify.cjs` (Playwright is already a devDependency).
2. **Restore drops branch state.** `canon-simulator.js:71` hardcodes `branchId:null, branchOrigin:null` in `createSession`. A restored branch silently degrades to CANON and `audit().branch.status` reports `CANON`. Fix in step 2; assert in RPG-04.
3. **Build/dist coupling.** `build-release.cjs:132-133` reads and compacts `canon-simulator.js` / `world-runtime.js` into the dist `workspaces/` dir, and `release-verify.cjs:42` asserts those runtimes are **never** eagerly inlined into the HTML. New engine files (`rpg-state.js`, `rpg-persistence.js`) must either be registered in `writeLazyRuntime` (L165–166) or bundled into `rpg.js` — otherwise they work in source and 404 in the APK. Also update the byte accounting at L167-170.
4. **`rpg.js` is DOM-only.** The `if(!r||!r.document)return;` guard at L2-3 blocks every node test. Pure logic must move out (step 5) or nothing is testable.
5. **Blocking side effects.** `applySceneDelta` mutates only a clone and returns a new session — good, and `commitBeat` likewise. But `rpg.js:28-29` reassign `S.*Session` unconditionally from `out.session`; the new `applyTurn` must **not** reassign on `BLOCKED`, or a rejected turn will still clobber in-memory state.
6. **Ledger growth.** Append-only `ledger[]` will outgrow the prompt budget over a long session. The projection caps at `recentChanges.slice(-3)` (RPG-05 asserts this), but storage still grows unbounded — acceptable for the slice; flag compaction as a follow-up.
7. **Model-authored beats.** `commitBeat` requires `verified===true` from `rpg.js:28` — who sets `verified`? If the extraction step sets it from model output rather than from an actual verification gate, `sourceCoverage`/`guardCanonCommit` become advisory. Keep `verified` set by the *gate result*, never by the model's confidence field.
8. **Minimal-code-modifier / clock nondeterminism.** `Date.now()` seeds branch ids (`world-runtime.js:64`, `canon-simulator.js:106`) and `at:` stamps (`world-runtime.js:69`, `canon-simulator.js:110`). Pass explicit ids in tests; do not assert on `at`.

### Non-risks (confirmed reusable)
- `createSession` hydration in both engines means **no custom deserializer** is needed.
- `control-bridge.js` already provides the contract→truth adapter (`worldContractTruth`, `guardCanonCommit`) with proper lineage; do not reimplement it.
- The `<pinned_notes>` / `<reference_knowledge>` prompt convention already demonstrates the injection pattern and its "data, not instructions" framing.
- Test harness, UMD pattern and lazy-dep loader are all in place and idiomatic to this repo.

---

## 12. Recommended slice boundary

The provable minimum is: `rpg-state.js` + `rpg-persistence.js` (new, pure) + three small extensions to the existing engines + one request-shape change in shared core. Titles, pack import, branch editors, lore tooling and multi-campaign stay behind the advanced drawer (`rpg.js:52`) exactly as they are today. Nothing in this slice requires new dependencies.

WAVE01=COMPLETE
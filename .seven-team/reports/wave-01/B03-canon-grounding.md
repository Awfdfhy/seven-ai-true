# B03 — RPG Canon / Grounding Audit (Wave 01B)

Scope: `release/canon-simulator.js` (187L), `release/world-runtime.js` (102L), `release/workspaces/rpg.js` (58L), consumers/tests, contract `.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md:101-126`.
Method: static read + repo-wide grep. No runtime execution ⇒ "present" = code exists in source; "wired" = a consumer reads it. Anything else is marked absent/unverified.

## 1. Verified current data flow

| Flow | Mechanism | Status |
|---|---|---|
| Pack load (manual JSON only) | `rpg.js:39 jsonFile` → `loadWork`/`loadCanon` (`:24-25`); deps injected by `hub.js` `CFG.rpg.deps` (SevenCanon, SevenWorld) | present, manual |
| World/story arc | `world-runtime.js createSession:37` → `expectedBeat:41` → `sceneContract:43-54` (`mustBeTrue/anchors/requiredFacts/forbiddenChanges/playerAgencyLock`) | present |
| Beat progression | `commitBeat:55-73` (order check, branch on divergence, `playerActionSource!=='user'` → BLOCKED) via `rpg.js:28 commitVerifiedBeat` (requires `input.verified===true`) | present |
| Canon state | `canon-simulator.js createSession:64-78` holds `position, world, knowledge, relationships, locations, objects, ledger, canonDebt` | present |
| Fact epistemic status | `factStatus:55-62` derives VERIFIED/PROBABLE/AMBIGUOUS from `sources[].authority` (AUTHORITY_WEIGHT) | present |
| Character knowledge gate | `canCharacterKnow:80-89` — continuity mismatch, `availableAt` horizon, `knownBy`, session `knowledge[charId]` | present |
| Scene contract for canon | `buildSceneContract:98-112` — `mustNotYetBeKnown`, `characterGoals`, `relationshipState`, `canonObligations` | present but **unconsumed** |
| Persistence of state | `applySceneDelta:135-165` appends `ledger[]` records; `rpg.js:29 applyVerifiedDelta` requires `meta.verified===true` | present, in-memory only |
| Titles | `world-runtime formatTitle/recordTitle:74-86`, `rpg.js autoTitle:34` (confidence ≥ .65, boundary check, dup guard) | present |
| UI status/aura | `rpg.js renderStatus:37`, `aura:22` (maps `canonEngine.audit()` to SevenAurora) | present |

Absent (verified by grep, no other producer found): no summarization, no retrieval/ranking, no re-hydration from disk, no transport of any contract into a generation prompt.

## 2. Where global/narrator knowledge leaks into character knowledge

- **No prompt seam exists.** `grep` for `buildSceneContract|canCharacterKnow|sceneContract` finds consumers only in `rpg.js` UI/`snapshot()` and tests. No builder serializes a contract into a model request; `release/research-runtime.js` / `control-bridge.js` are the only prompt-ish files and neither references SevenCanon. So the leak is currently *unbounded by construction*: the model receives only raw chat history (`#chat` DOM is the only thing rpg.js observes, `:43-50`), so omniscient narrator state enters character dialogue implicitly. Evidence is structural, not behavioral.
- **`session.world` is a single shared bag** (`createSession:71`, merged at `applySceneDelta:139`). No per-character view; any future prompt builder that emits `world` wholesale leaks all knowledge to all characters.
- **`buildSceneContract:104-106` emits `relationshipState` (all characters) and `mustNotYetBeKnown` (scene-declared) in one object** with no per-speaker partition — a latent leak if consumed as-is.
- `audit().characterKnowledge` only reports `future-knowledge` (`canon-simulator.js:170`); `not-established` and `wrong-continuity` leaks are silently ignored.

## 3. Contradiction handling today

- Invariants: `invariantIssues:114-126` (`location`, `object-owner`, `fact-unknown-before`) → warnings + `canonDebt += 0.2/issue`, ledgered.
- Anchors: `threatenedAnchors:128-133`, `canonDebt += weight*0.25`; rigid anchor or debt ≥ 1 forces `branchId` (`:150-155`).
- Ledger record marks `status: BRANCH|VERIFIED` with `provenance{source,authority,transformation}` (`:156-162`).
- **No repair, no surface to the user, no candidate-vs-canon diff.** RPG-06 ("surface/block-repair") is therefore unmet: contradictions are only counted into a debt number and reflected as an Aurora `warning` color (`rpg.js:22`). `scoreInsertion:91-96` ranks candidate insertions but is never called by any consumer — there is no candidate ingestion path at all.

## 4. How candidate facts become persistent/canon

Path today: external caller → `rpg.js:29 applyVerifiedDelta(delta, meta)` → gate `meta.verified===true` (UI passes nothing, so **in-app it is always BLOCKED**) → `applySceneDelta` merges `world/relationships/locations/objects/knowledge` → knowledge unioned into `session.knowledge[charId]` (`:143-145`) → ledger append. Fact **status** is never set/derived on commit; a fact ID that is absent from `pack.facts` enters `knowledge` unchecked and only surfaces later if it also violates an `availableAt` horizon. Durability: session lives in module state `S` (`rpg.js:5`) → lost on reload (RPG-04 risk). `normalizePack/validatePack:19-46` validate structure only, not epistemic soundness.

## 5. Bounded relevant-context strategy (proposal)

Emit a per-turn `groundingContext` instead of raw state: (a) `mustBeTrue` + `canonObligations` (small, anchor-bounded); (b) `perCharacter[charId] = facts where canCharacterKnow(...,position).allowed` — excludes `future-knowledge`/`not-established`; (c) narrator-only block (global `world`, unestablished facts) clearly separated and marked non-shareable; (d) rolling `summary` of last N turns + open threads (currently missing entirely); (e) hard cap: ≤ 12 facts, ≤ 800 chars, drop by `anchorWeight` then recency. Satisfies the contract's perf budget line (`RPG_V2_PRODUCT_CONTRACT.md:126`).

## 6. Exact code seams

- **RPG-03 (character knowledge):** add `engine.buildGroundingContext(session, scene)` in `canon-simulator.js` next to `buildSceneContract:98`, reusing `canCharacterKnow:80`; export via `createEngine` return (`:180`); surface in `rpg.js` `snapshot():23` + a new `groundingContext()` export (`:58`).
- **RPG-05 (long continuity):** `applySceneDelta:135` — add rolling summary + fact-freeze check in `invariantIssues:114`; `audit():167` — add `continuityDrift` (currently `chronology:{status:'PASS'}` is hardcoded at `:171`).
- **RPG-06 (canon conflict):** new `resolveContradiction(session, candidate)` beside `scoreInsertion:91`; call it from `applySceneDelta` before merge; return `{action:'ACCEPT|BLOCK|BRANCH|REPAIR',reason}`; surface via `notice()` in `rpg.js:36` from `applyVerifiedDelta:29`.

## 7. First implementation slice

`canon-simulator.js` only, no UI change: (1) `buildGroundingContext(session, scene)` with per-character filtering via `canCharacterKnow`, capped fact list, `narratorOnly` separation; (2) export it; (3) new assertions in `release/canon-simulator.test.cjs` (already asserts `future-knowledge` at `:25-26`, `buildSceneContract` at `:29`, `characterKnowledge FAIL` at `:43-45`). Ships a consumable, testable contract without touching the prompt path; rpg.js wiring follows in slice 2.

## 8. Tests / evidence

Existing: `release/canon-simulator.test.cjs` (5 canon assertions), `release/world-runtime.test.cjs:44,48,51`. New slice-1 tests: (a) hero learns `secret`, guide does not → guide's grounding context omits it; (b) before `availableAt` both omit it even with static `knownBy`; (c) narrator block retains it but is flagged non-shareable; (d) cap honored for a 50-fact pack. Evidence class: **static, not executed** — I did not run the suites in this read-only window.

## 9. Risks / dependencies

- Highest risk is inertness: contracts exist but nothing feeds the model, so improvements stay invisible until a prompt seam exists (slice 2, out of scope here).
- `applyVerifiedDelta` is unreachable from the UI (`meta.verified` never set) — any test must call the engine directly.
- Session persistence absent ⇒ RPG-04 failures will confound RPG-05 measurement.
- Dependency: `hub.js` `CFG.rpg.deps` must keep loading `canon-simulator.js`; engine returns are cloned (`pack:clone(pack)`), so context builders must not mutate the pack.
- Unverified: whether upstream (non-release) builds route chat through another memory layer — no such code found in `release/`.

WAVE01=COMPLETE

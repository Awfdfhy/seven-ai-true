# B08 — RPG V2 Evaluation Harness (RPG-01..RPG-07)

Wave 01B · Team B · acceptance-evidence design · **read-only inspection, no production source edited**

## 0. Evidence base actually present in the repo

| Artifact | Path | Status |
|---|---|---|
| Product contract with RPG-01..RPG-07 | `.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md` | present (scenarios at lines 95–113) |
| Gate A–D + anti-patterns | `.seven-team/cohesion/EVALUATION_GATE.md` | present |
| Canon engine (state + knowledge + branching) | `release/canon-simulator.js` | present, pure/deterministic |
| Canon engine test | `release/canon-simulator.test.cjs` | present, 4.4 KB, wired into `all.cjs` |
| World/beat engine | `release/world-runtime.js` | present, pure/deterministic |
| World engine test | `release/world-runtime.test.cjs` | present, wired into `all.cjs` |
| RPG UI surface | `release/workspaces/rpg.js` (20 KB) | present — **no persistence, no seeds, no start flow** |
| Browser/visual gate | `release/release-verify.cjs` (50 KB) | present — Playwright, 320/360/390/412 × ltr/rtl × day/night |
| Visual evidence schema | `release/visual-evidence-runtime.cjs`, `...-passb.cjs`, `...-final.cjs` | present |
| Android device capture | `apk/capture-android-*.cjs` (5 scripts, adb) | present |
| Eval corpus/harness | `eval/harness.cjs`, `eval/tasks.jsonl`, `eval/baseline.json` | present; **required categories are `chat, memory, context, world, research, coding, tools, models, files, persistence, recovery, ui, android` — `rpg` is NOT a required category** |
| Node test runner | `all.cjs` (spawnSync over a fixed file list) | present |
| CI | `.github/workflows/seven-tests.yml`, `android-apk.yml`, `agent-live-smoke.yml`, `agent-team-*.yml`, `search-gateway-production.yml` | present |

**Absent (recorded, not assumed):** no `tests/` directory; no `release/rpg-*.test.cjs`; no `.github/workflows/rpg*.yml`; no RPG entry in `eval/tasks.jsonl` required categories; no `seven_rpg_*` localStorage key anywhere; no `SevenRPG`/`SevenWorld`/`SevenCanon` global in `seven_ai-final.html` (the file only mentions `rpg` for routing at lines 3410–3502 and for memory scoping at 8642–10914).

**Two decisive facts from inspection:**
1. `release/workspaces/rpg.js` greps clean for `localStorage`, `Math.random`, `Date.now`, and any seed. It holds `S.worldEngine/S.worldSession/S.canonEngine/S.canonSession` in a module-local `S` (lines 23–25) → **session state is memory-only and dies on reload**, so RPG-04 cannot pass today.
2. `canon-simulator.js` already exposes exactly the primitives RPG-03 and RPG-06 need (`canCharacterKnow`, `applySceneDelta`, `audit().characterKnowledge`, branch origin reasons) and they are already proven in `canon-simulator.test.cjs` → **RPG-03 and RPG-06 are executable today with zero production change.**

## 1. Deterministic vs. independent-semantic-review split

| Scenario | Deterministic portion (CI, blocking) | Independent semantic review (human/rubric, non-blocking until verdict) |
|---|---|---|
| RPG-01 Start | action count ≤3 from fresh storage to first story turn; no JSON-pack import on the path; story turn present in DOM | whether the first turn is *meaningful/memorable* rather than a menu echo |
| RPG-02 Consequence | world variable value changed in engine state; later turn's compiled context contains the new value; provenance id present | whether the *prose* of the later turn visibly reflects the change |
| RPG-03 Character knowledge | `canCharacterKnow(B,fact).allowed===false`; `audit().characterKnowledge.status==='PASS'`; no propagation event ⇒ no knowledge | whether generated B lines *imply* knowledge despite the gate (model-side leak) |
| RPG-04 Persistence | localStorage round trip: write → `page.reload()` → session id, scene, turn count, and `[data-rpg-state]` restored byte-identical | whether continuity *feels* continuous to a returning user |
| RPG-05 Long continuity | 20-turn scripted run: core-fact invariant set holds at every step; bounded context (≤N tokens) each turn | whether the 20 turns read coherently to a human |
| RPG-06 Canon conflict | contradictory candidate → `BLOCKED` or `BRANCH`; `branchOrigin.reason` recorded; nothing promoted to canon silently | whether a *real* contradiction was correctly distinguished from an intentional what-if |
| RPG-07 Mobile UX | no horizontal overflow (>2 px), touch targets ≥24 hard / ≥44 preferred, contrast ≥4.5, `dir=rtl` mirror, night tokens, `criticalSelectors` present | whether the story/composer layout is actually *usable* (not merely non-clipping) |

Rule of thumb used throughout: **the engine boundary is deterministic; the prose boundary is semantic.** The harness must never let a stub narrator stand in for a model-quality verdict — stubbed runs prove wiring, and a separate `SEVEN_RPG_LIVE=1` run plus reviewer verdict covers wording.

## 2. Scenario-by-scenario design

Common runtime substrate: the **built** artifact `dist/seven_ai-release.html` (produced by `npm run build:web`, which inlines `release/workspaces/rpg.js` via `release/build-release.cjs:170`) — tests must run against the built page, not the raw 842 KB `seven_ai-final.html`, or they will not exercise the shipped RPG surface.

### RPG-01 — Start (fresh install → story turn in ≤3 actions)
- **Setup:** Playwright `chromium --only-shell`, new context, `localStorage.clear()` in `addInitScript` (fresh install), viewport 390×844, `dir=ltr`, `SevenTheme.setPreference('night')`.
- **Actions:** (1) open mode/workspace picker → RPG; (2) tap "New world" (default start, no pack); (3) composer focus + first story turn auto-emitted by the narrator stub. `actionCounter` is incremented by a single `page.on('request')`-independent page-side hook: every click on `[data-ws-pick], [data-rpg-*], #composer button` bumps `window.__sevenUserActions`; the test asserts on the counter, not on Playwright's call log.
- **Assertions:** `__sevenUserActions <= 3`; `[data-rpg-state]` non-empty and not `'Chat mode'`; at least one assistant message node in `#chat` with non-empty text; no `<input type=file>` was ever opened (`data-rpg-world` / `data-rpg-canon-file` were never clicked — track via the same counter + a `packImportAttempted` flag); the drawer `[data-rpg-drawer]` is `hidden` on first paint.
- **Semantic:** reviewer reads the first turn and marks MEMORABLE / FLAT per Gate B.

### RPG-02 — Consequence (choice mutates a known variable → later narration reflects it)
- **Setup:** fixture world with a single mutated variable `{'hero:guide':{trust:.2}}` and a declared beat; session `position:5`.
- **Actions:** `applyVerifiedDelta({relationships:{'hero:guide':{trust:.2}}, locations:{guide:'village'}}, {verified:true, id:'scene-1'})` → then 2 further turns through the stub narrator, which is given only the *compiled bounded context* the product hands the model.
- **Assertions:** `session.relationships['hero:guide'].trust === .2`; `session.locations.guide === 'village'`; the compiled context for turn N+2 **contains** the token `village` and the trust value; `session.ledger` length grew with a provenance-bearing entry `{id, source, authority, transformation}`; the context payload sent to the narrator is `<= budgetTokens` (contract's performance budget — raw world history must not be re-sent).
- **Semantic:** reviewer grades the narration, not the token check.

### RPG-03 — Character knowledge
Covered in full in §4.

### RPG-04 — Persistence (exit RPG → return)
Covered in full in §3.

### RPG-05 — Long continuity (20-turn scripted scenario)
- **Setup:** `release/fixtures/rpg/v2-rpg-fixtures.cjs` → `scenario20()` returns 20 turns of `{speaker, text, expectFacts, expectVariables}` scripted against the fixture canon pack. `SEVEN_RPG_SEED=42` (fixed, see §5).
- **Actions:** replay 20 turns through the in-page engine + stub narrator; after every turn run `engine.audit(session)`.
- **Assertions:** `CORE_FACTS` (high-confidence declared canon) present and unchanged at turn 20; `audit().characterKnowledge.status==='PASS'`, `invariants.status==='PASS'`, `futureAnchors.status!=='FAIL'` at every step; no unbounded growth (`ledger.length === 20`, compiled context ≤ budget); the run is **reproducible** — a second identical run yields an identical `sha256` of the normalized session.
- **Semantic:** reviewer reads the 20-turn transcript for coherence. Note: this scenario is the one most likely to need the *live* model to be interesting; the stub keeps CI honest, the live run is opt-in.

### RPG-06 — Canon conflict
Covered in full in §4.

### RPG-07 — Mobile UX (small Android + Arabic RTL + night)
Covered in full in §6.

## 3. Fixtures, state seeds, persistence/reload method

### Fixtures (new, deterministic, no network)
`release/fixtures/rpg/v2-rpg-fixtures.cjs` exporting:
- `WORLD_PACK` — 3 beats, `titleRules {episode:'Case'}` (mirrors the shape already proven in `release/world-runtime.test.cjs`), one beat with `titleBoundary:true` so the auto-title path is exercised.
- `CANON_PACK` — 2 sources (`official` A0, `wiki` A3), 2 entities (`hero`,`guide`), facts `secret {availableAt:10, knownBy:['guide'], sources:['official']}` and `rumor {availableAt:2, sources:['wiki']}`, anchors `meeting{strong}` / `finale{rigid}`, invariants `guide-home{location,error}` and `secret-lock{fact-unknown-before, hero, secret, before:10, error}` — deliberately identical to the existing canon test so the RPG harness inherits proven semantics rather than inventing new ones.
- `SCENARIO_20` — the 20-turn script.
- `NARRATOR_STUB` — a pure function `(turn, compiledContext) => string` that echoes the *compiled context* deterministically. It is labelled `STUB` in its output and every test that uses it must emit `narrator: STUB` in the JSON result so a stub run can never be mistaken for model evidence.

### State seeds
Both engines are pure — no clock, no RNG. Seeding is therefore *explicit data*, not a PRNG:
- `createSession({continuity:'anime', position:0, locations:{}})` — explicit `position` (no `Date.now()`).
- explicit ids `scene-1..scene-20` so ledger provenance is stable across runs.
- `SEVEN_RPG_SEED=42` is honoured **only** by any future narrative-variety helper; today it is read and asserted-present so the CI log documents the seed. Tests must `assert.ok(!/Math\.random|Date\.now|new Date\(/.test(sourceOfHarness))` for the deterministic suites.
- Playwright seeding: `context.addInitScript` writes `localStorage` fixtures **before** first paint, so a reload test is honest rather than a race.

### Persistence/reload method (the design RPG-04 forces)
Current state lives only in `S` inside `rpg.js`. Required design (production change owned by the builder agent, not by B08):
- New key **`seven_rpg_session_v2`**, payload `{format:'seven-rpg-session', version:2, world:{pack,session}, canon:{pack,session}, lastScene, updatedAt}`.
- `rpg.js` gains `persist()` (called after every committed mutation) and `hydrate()` (called from `mount()`), plus a `seven:rpg-session-changed` event.
- Reuse of existing memory scoping: `seven_ai-final.html:10813` already derives `rpgId = "rpg:"+roomId` and gates memory reads by `meta.scopeRef===ctx.rpgId`, so per-world memory isolation exists; RPG-04 only needs the *session* persisted.
- Reload assertion method: `await page.reload()` (real navigation, not `evaluate`), then assert `[data-rpg-world-name]` text, `[data-rpg-state]`, restored turn count, and that the restored `session.id` equals the pre-reload id; also assert `localStorage['seven_rpg_session_v2']` is unchanged by hydration (hydration must be read-only on first paint).
- Open item to verify in Slice B: whether `window.SevenWorkspaces` already restores the last active workspace (so "exit RPG → return" is partly shell-owned). Not confirmed during this inspection — recorded as a dependency in §8.
- Corruption behaviour must match the existing fail-closed precedent (`runtime-smoke.cjs` asserts `INVALID_RUNTIME_RUNS` on a corrupt ledger): a corrupt `seven_rpg_session_v2` must **not** throw an uncaught error; it must fall back to the start flow and surface a notice.

## 4. Character-knowledge test (RPG-03) and canon-conflict test (RPG-06)

These are the two scenarios that are **executable today, with zero production change**, because `canon-simulator.js` already implements the primitives.

**RPG-03 — deterministic spec** (`release/rpg-v2-canon.test.cjs`)
- Setup: CANON_PACK above; `session = engine.createSession({continuity:'anime', position:5, locations:{guide:'village'}})`.
- Action: reveal `secret` to `guide` only — i.e. commit a delta that adds `knownBy:['guide']`, then evaluate knowledge for `hero`.
- Assertions:
  - `engine.canCharacterKnow(session,'hero','secret')` deep-equals `{allowed:false, status:'verified', reason:'future-knowledge'}` (this exact shape is already proven in `release/canon-simulator.test.cjs`).
  - `engine.canCharacterKnow(session,'guide','secret').allowed === false` at `position:5` — **the future horizon must beat the static `knownBy` list** (already proven; this is the assertion that catches the most likely V2 regression).
  - `engine.audit(session).characterKnowledge.status === 'PASS'` before and after the reveal.
  - After a *valid propagation event* (`applySceneDelta(...,{transformation:'tell'})` with `hero` present), `canCharacterKnow(session,'hero','secret').allowed === true` — proving B is not merely "always ignorant", but gated on a real event.
  - Correlated with the app layer: assert the compiled context handed to the narrator for `hero` contains no `secret` token, while the one for `guide` does.
- Semantic part (reviewer): feed the narrator a B-perspective turn and check the prose does not imply the secret. Engine PASS is necessary, not sufficient.

**RPG-06 — deterministic spec** (same file)
- Setup: session with `meeting` anchor committed; then a **contradictory candidate** — a fact asserting `guide` is at `harbour` while invariant `guide-home` pins `location: village` at `severity:'error'`.
- Actions: `applySceneDelta(session,{invalidatesAnchors:['finale']},{id:'scene-2'})` (the proven branch trigger) and separately `applySceneDelta(session,{locations:{guide:'harbour'}},{id:'scene-3', authority:'model'})`.
- Assertions:
  - Contradiction → `result.branched === true` and `result.session.branchOrigin.reason === 'rigid-anchor-invalidated'` (already proven) — i.e. the system **surfaces/branches** rather than silently accepting.
  - The location contradiction → either `BLOCKED` (invariant `severity:'error'`) or an explicit `BRANCH` with a recorded origin; the assertion is *never* "silently canon". A silent accept must fail the test.
  - `audit(session).invariants.status !== 'FAIL'` after either disposition.
  - `applyVerifiedDelta` in `rpg.js:29` must still return `BLOCKED` with `reason:'verification-required'` when `meta.verified !== true` — a model-authored mutation cannot reach canon through the UI path without verification (line 29 is the choke point).
  - Provenance: every committed delta carries `{id, source, authority, transformation}` per the contract's "provenance sufficient for debugging".
- Semantic part (reviewer): decide whether a *real* contradiction was correctly distinguished from an intentional alternate/what-if branch. The engine can prove a branch occurred; only a reviewer can prove it was the right call.

## 5. Android / RTL evidence (RPG-07)

**Host-level (blocking, CI):** extend the existing matrix in `release/release-verify.cjs` (which already asserts no overflow at 320×800, 360×800, 390×844, 412×915 for both directions and both themes, plus 150% font scale and 800×360 landscape) with an RPG pass:
- For each of `[320,360,390,412] × ['ltr','rtl'] × ['day','night']`: switch to the RPG workspace, assert `documentElement.dir`, assert `data-seven-theme`, and assert no horizontal overflow for `.seven-rpg-chatbar`, `.seven-rpg-drawer`, `#chat`, `.composer`, and the top bar — reusing the same `scrollWidth<=clientWidth+1` predicate already used at line 208.
- Touch targets via `release/visual-evidence-runtime.cjs` `auditTouchTargets` (preferred 44 / hard 24) over `[data-rpg-exit], [data-rpg-more], [data-rpg-title-toggle], [data-title-record], [data-rpg-world], [data-rpg-canon-file]`.
- Contrast via `auditContrast` (min 4.5) on the bar/drawer/notice pairs, reusing `release/contrast.test.cjs` conventions.
- `auditState(scenario,{presentSelectors})` with `criticalSelectors` = the RPG critical set; it also verifies `direction` and `reducedMotion` agreement.
- **Layout mirroring must be checked structurally**: assert the "more/drawer" affordance sits on the *right* edge under `dir=rtl` and on the *left* under `ltr` (bounding-rect comparison), because RTL pass-by-non-overflow is the classic false green.
- Arabic copy already exists bilingually in `rpg.js` via `T('Exit RPG','الخروج من RPG')` etc.; assert the RTL run renders the Arabic string, not an English fallback, for `[data-rpg-exit]` and `[data-rpg-world-name]`.

**Device-level (evidence, not blocking in PR CI):** `apk/materialize-android-visual-test.cjs` (already invoked by `npm run android:generate`) plus the adb capture scripts (`capture-android-release-profile.cjs`, `-system-visuals.cjs`, `-themed-launcher-ui.cjs`, `-legacy-launcher-ui.cjs`, `-splash-burst.cjs`) write to `/data/local/tmp/seven-visual/`, which `.github/workflows/android-apk.yml` pulls into `visual-evidence/android16/` and `visual-evidence/android14/` and uploads as the `seven-ui-visual-evidence` artifact. RPG shots must be added to that set. Be honest in the verdict: the CI tier is **EMULATOR/HOST**, never `PHYSICAL_DEVICE` — `visual-evidence-runtime.cjs` defines that tier precisely so the evidence cannot overclaim.

## 6. Exact test files and workflows to create/modify

New files (all read-only w.r.t. production):
```
release/fixtures/rpg/v2-rpg-fixtures.cjs        # packs, 20-turn script, narrator stub
release/rpg-v2-canon.test.cjs                   # RPG-03, RPG-06, canon half of RPG-05  (node, no browser)
release/rpg-v2-start.test.cjs                   # RPG-01, RPG-04  (playwright, built dist)
release/rpg-v2-story.test.cjs                   # RPG-02, RPG-05  (engine + compiled-context assertions)
```
Modified:
```
all.cjs                       # append the three new suites to the fixed `files` list
release/release-verify.cjs    # add the RPG surface to the 320/360/390/412 x ltr/rtl x day/night matrix
eval/tasks.jsonl              # add rpg-tagged contract tasks; consider 'rpg' as a required category in eval/harness.cjs
apk/materialize-android-visual-test.cjs   # add RPG screen states to the on-device capture list
```
New workflow: `.github/workflows/rpg-acceptance.yml` — on `pull_request` for `release/**`, `release/workspaces/rpg.js`, `seven_ai-final.html`; Node 24; `npm install --no-save playwright`; `npx playwright install --with-deps --only-shell chromium`; run `node all.cjs`; run the RPG suite with a JSON report + screenshots uploaded as an artifact; `fail-fast` on the deterministic suites only. Alternatively fold it into `seven-tests.yml`, which already does all of the above — folding in is cheaper and is the recommended option; the dedicated workflow is only justified once the live-model opt-in run needs secrets isolation.

## 7. First implementation slice (ordered)

**Slice A — ships now, zero production change (RPG-03, RPG-06, canon half of RPG-05).**
Create `release/fixtures/rpg/v2-rpg-fixtures.cjs` + `release/rpg-v2-canon.test.cjs`, register in `all.cjs`. The engine primitives and expected values are already proven by `release/canon-simulator.test.cjs` and `release/world-runtime.test.cjs`, so this is copy-verified contract work with a clear reviewer-visible diff. Deliverable: two of seven scenarios become executable acceptance evidence in the first PR.

**Slice B — requires the builder's product change (RPG-01, RPG-04, then RPG-07, then RPG-02/RPG-05 narrative half).**
`rpg.js` gains: a start flow (continue / new world) reachable in ≤3 actions with **no JSON import on the primary path**; `persist()`/`hydrate()` on `seven_rpg_session_v2`; the advanced pack import + title bookkeeping moved behind the existing drawer (they already live in `[data-rpg-drawer]`, which is `hidden` by default — that is the advanced surface). Only then does `release/rpg-v2-start.test.cjs` have something to assert. Gate: Slice A stays green throughout (regression net for the canon behaviour Slice B must not break).

**Slice C — narrative evidence.** `SEVEN_RPG_LIVE=1` opt-in run producing the RPG-02/RPG-05 transcripts, plus the reviewer verdict artifact. Never on the blocking PR path.

## 8. Flake controls

- No network on the blocking path; the stub narrator is the default and the live runner is opt-in via env.
- No wall-clock or RNG: assert the harness source contains no `Math.random` / `Date.now` / `new Date(`; the 20-turn scenario must produce an identical `sha256` across two runs in the same job (a self-check against nondeterminism, not just across CI runs).
- Wait on state, never on time: `page.waitForFunction(() => document.querySelector('[data-rpg-state]')?.textContent?.trim())` instead of `waitForTimeout`. The only sleeps permitted are the ones already justified in `release-verify.cjs` for theme transitions.
- Overflow tolerance ±2 px, matching `auditViewport`'s existing `overflow>2` rule — do not invent a stricter one or the suite will be red on subpixel rounding.
- Pin `--only-shell chromium` exactly as `seven-tests.yml` does; no `channel:'chrome'`, no headed mode.
- Emulator capture: reuse the existing android job's device profile rather than introducing a second emulator definition; pin `--only-shell chromium` there too.
- Corpus/dataset guards already in `eval/harness.cjs` (duplicate id, duplicate input, Arabic ≥25%) must keep passing after RPG tasks are added.
- Every suite prints a machine-readable JSON result line and a non-zero exit on failure, matching the `spawnSync` contract `all.cjs` depends on.
- Concurrency: run the RPG suites serially in `all.cjs` (they share `localStorage` assumptions in-process); no parallel workers over the same page context.
- Locale/timezone: force `locale:'en-US'`, `timezoneId:'UTC'` in the Playwright context so Arabic/RTL and date rendering are the only variables.

## 9. Dependencies and blockers

- **Blocking product dependency (builder):** `rpg.js` has no persistence and no start flow → RPG-01 and RPG-04 cannot pass today. This is the critical path.
- **Blocking product dependency:** no `SevenWorld` / `SevenCanon` global exists in `seven_ai-final.html`; `rpg.js:24,25` throws `'SevenWorld runtime unavailable'` / `'SevenCanon runtime unavailable'` if those runtimes are missing. They are inlined by `build-release.cjs:170` (`canon-simulator.js` + `world-runtime.js`), so **tests must run against `dist/seven_ai-release.html`**, never the raw source HTML.
- **Unverified (must be confirmed in Slice B):** whether `SevenWorkspaces` persists the last active workspace, which determines how much of RPG-04's "exit → return" is shell-owned vs. RPG-owned. Not resolvable from this inspection.
- **Tooling:** no test framework — the repo uses plain `node` scripts + `assert/strict` + `spawnSync`. Stay consistent; do not introduce vitest/jest.
- **Process (Gate D):** the same agent must not implement and self-approve. The builder (`agent/04-research`) implements, `agent/08-testing-ci` owns the harness, `agent/06-memory-context` owns memory, and `agent/10-integration-review` issues the READY / CHANGES REQUIRED verdict. A deterministic suite plus a self-written report is explicitly listed as an anti-pattern by `EVALUATION_GATE.md`.
- **Evidence honesty:** host/emulator tiers must be labelled as such; `PHYSICAL_DEVICE` Android battery/RAM/thermal and real provider quality remain `UNMEASURED` per `eval/baseline.json` and must not be faked.

WAVE01=COMPLETE

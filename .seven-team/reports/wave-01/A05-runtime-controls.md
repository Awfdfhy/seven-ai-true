# A05 — Runtime / Model / Mode / Search Controls Audit
**Wave 01A · Team A · Agent A05 (OpenCode)**
Scope: shared runtime, model, mode, depth and search controls treated as *product UI state*.
Read-only audit. No production source modified.

Primary artifact: `seven_ai-final.html` (13,175 lines).
Modern UI overlay: `release/beta-ui-runtime.js`, `release/materialize-remake-assets.cjs`, `release/release-verify.cjs`.

---

## 1. Verified control → state → runtime paths

### 1.1 Model picker (`#modelSelect`)
| Stage | Location | Behaviour |
|---|---|---|
| Markup | `seven_ai-final.html:882` | `<select id="modelSelect" onchange="onModelChange()">` |
| Populate | `populateFreeModelSelect(selectedValue)` `:2215` | Builds `<option>`s from `getFreeModelCatalog()` filtered to `free === true && isFreePriceProofFresh(m)` |
| Edit handler | `onModelChange()` `:2328` | Reads DOM value, calls `refreshModelDependentControls(selectedModel, limits.defaultEffort, limits.maxTokens)` `:2331` + `renderFreeModelFabricStatus()` `:2332`. **Does not write `currentModel`.** |
| Commit (only writer) | `saveSettings()` `:2380`, `:2389` | `currentModel = isValidFreeModelSelection(selected) ? selected : DEFAULT_MODEL`; persists `localStorage['model']` `:2399` |
| Restore | `:1316`–`:1322` | `savedModel` validated by `isValidFreeModelSelection()` `:1190`, else dropped; `DEFAULT_MODEL = "openai/gpt-oss-120b"` `:1195` |
| Engine consumer | `:7357` and `:7989` | The model actually sent is `controllerPlan.model.id` (`:7989`), **not** `currentModel`. `currentModel` only seeds the plan: `model:{ id: currentModel, reasoningEffort: getReasoningEffort(currentModel, deepRequested?"deepThink":"chat") }` `:7357` |
| Router substitution | `:3712`–`:3727` | In `manual`, the preferred descriptor is moved to `ranked[0]` (`continuity:"manual_preference"`); if absent and `!freeFallbackEnabled` the candidate list is emptied. In `auto`, `applyRoutingHysteresisV3()` is used instead. `!freeFallbackEnabled` also truncates to one candidate `:3724` |

**Conclusion:** `#modelSelect` is a *preference/seed* control, not a model lock. The UI never tells the user this (`:889` only says "Free Model Fabric loading…").

### 1.2 Routing mode (`#routingModeSelect`)
| Stage | Location | Behaviour |
|---|---|---|
| Markup | `:876` | `<select id="routingModeSelect" onchange="onRoutingModeChange()">` |
| UI-only handler | `onRoutingModeChange()` `:2335` | `:2337` disables `#modelSelect` when mode is `auto` |
| Commit | `saveSettings()` `:2382`–`:2384` | Writes `currentRoutingMode` + `localStorage['seven_free_routing_mode_v1']` (`FREE_ROUTING_MODE_KEY` `:1057`) |
| Init | `:1220` | `=== "manual" ? "manual" : "auto"` |
| Runtime readers | `:3712` (ranking), `:6555` (context budget) | In `auto`, `getContextInputTokenBudget()` `:6550` inflates `contextWindow` to `Math.max(...configured.map(m=>m.contextWindow))` `:6557` |

### 1.3 Reasoning effort / depth (`#reasoningEffort`)
| Stage | Location | Behaviour |
|---|---|---|
| Markup | `:898` | `<select id="reasoningEffort">` — **no `onchange` handler** |
| Populate | `refreshModelDependentControls()` `:2297`–`:2326` | Rebuilds options from `limits.effort`; disabled + "Managed by model/provider" when unsupported `:2316`–`:2320` |
| Commit | `saveSettings()` `:2397` | `currentReasoningEffort = limits.effort ? DOM.value : null`; removes key when null `:2403`–`:2404` |
| Engine funnel | `getReasoningEffort(model,purpose)` `:2624`, `withReasoningEffort()` `:2656` | Closed purpose set (`deepThink`/`summary`/`title`/`chat`); unknown purpose → `null` + `console.warn` `:2642`–`2644`. Applied at `:3907` |
| Plan snapshot | `:7357` | Plan captures effort at plan time, so mid-generation UI changes cannot alter a running turn |

### 1.4 Temperature / max tokens
| Control | Markup | Inline handler | Commit | Runtime |
|---|---|---|---|---|
| `#temperatureRange` | `:893` | `oninput` updates **label only** (`#tempValue`) | `saveSettings()` `:2391`, clamp `[0,2]` `:2393` | `:7988` `temperature: currentTemperature` |
| `#maxTokens` | `:902` | none (number input) | `:2394`–`:2396`, `Math.min(limits.maxTokens, Math.max(100, input))` | `:7989` `maxTokens: currentMaxTokens`; clamp differs at init `:1332` (`Math.max(1, …)`) |

### 1.5 Mode / search / research flags
| Flag | Decl | Toggle | Persisted | Engine read |
|---|---|---|---|---|
| `deepThinkMode` | `:1341` | `toggleDeepThinkMode()` `:2599` (flips bool + `.active` on `#deepThinkToggle`) | **no** (grep for any `localStorage` write of these flags returns nothing) | `:2203`, `:3477`, `:7338`, `:7897` |
| `searchMode` | `:1342` | `toggleSearchMode()` `:4243` | **no** | `:2204`, `:3476`, `:7337`, `:7897` |
| `researchMode` | `:1343` | `toggleResearchMode()` `:4248` | **no** | `:6722`, `:7336`, `:7898` |

Execution funnel (correct part of the design): `createCognitiveRequestPlan()` called at `:7893`–`:7899` with a snapshot → `buildContext()` `:6719` decides `useResearch` `:6722` / `useWeb` `:6723` and branches to `performDeepResearchV2` vs `performWebSearch` at `:6733`. Plan also implies depth: `deepRequested = researchRequested || explicitDeepRequested` `:7341`.

---

## 2. Duplicate / stale controls

**D1 — Four shipped copies of the same control set.** `seven_ai-final.html` (13,175 lines), `seven_ai-t150.html` (9,266), `seven_ai-t152.html` (9,436), `seven_ai-t161.html` (9,568). Each contains exactly 6 `modelSelect` occurrences. The control IDs, the `onModelChange`/`saveSettings`/`toggleDeepThinkMode` handler set, and the `1341–1343` flag block are therefore implemented four times with no shared source. *(Gap: this pass did not verify which HTML file `release/build-release.cjs` consumes, so drift between them is unproven — but four divergent copies of the product's only settings surface is itself the defect.)*

**D2 — Modern mode picker is a second, independent mode system.** `release/beta-ui-runtime.js`:
- `:23` derives mode purely from CSS classes: `#deepThinkToggle` + `#searchToggle` → `research` | `search` | `think` | `chat`.
- `:41` `MutationObserver` watches **only** those two attributes.
- `:31` `setMode(mode)` syncs by calling `dx.click()` / `sx.click()` — synthetic clicks into the legacy toggles.
- `grep -rn "researchToggle" release/` → **zero hits**. The modern layer does not observe, derive, or drive `#researchToggle`.

**D3 — `#researchToggle` is invisible to the modern UI; the mode picker is invisible to Deep Research.** `researchMode` is engine state (`buildContext` `:6722`) but has no representation in the picker's 4-mode space; conversely the picker cannot express Deep Research.

**D4 — Build-time DOM restructuring depends on control IDs.** `release/materialize-remake-assets.cjs:60` re-parents `.settings-core` children by scanning for `node.nextElementSibling?.id === 'temperatureRange'` to decide the `generation` vs `models` section. `release/release-verify.cjs:125-126` then re-reads `panel('temperatureRange')` and `panel('reasoningEffort')`. One ID/label layout change can silently decouple the settings layout, the verify harness, and `saveSettings()` (which reads every control by `getElementById`, so runtime is ID-stable but layout-dependent).

---

## 3. Races and early-init defects

**R1 — Async catalog refresh clobbers an in-flight manual model pick.** `populateFreeModelSelect(currentModel)` runs at three sites: `openSettings()` `:2352`, `refreshFreeModelCatalogFromSettings()` `:2373`, and a boot-time `setTimeout(..., 50)` `:13029-13032`. All three pass **`currentModel`**, not the live `#modelSelect` value. Because `onModelChange()` `:2328` never commits to `currentModel`, any catalog refresh resolving while Settings is open (e.g. `saveSettings()`'s unawaited `setTimeout(() => refreshFreeModelCatalog({force:false}))` at `:2406`) re-selects the *old* model and silently discards the user's pending choice.

**R2 — Changing the model silently resets depth/output, then persists the reset.** `onModelChange()` `:2331` calls `refreshModelDependentControls(selectedModel, limits.defaultEffort, limits.maxTokens)`, overwriting `#reasoningEffort` and `#maxTokens` with the new model's defaults. `saveSettings()` `:2397` then reads those DOM values. The user's previous effort level and max-token budget are lost with no prompt, and the loss is written to `localStorage` `:2401`/`:2403`.

**R3 — Two parallel read paths for the same mode state.** The routing-context builder reads the globals directly (`:2203-2205`), the cognitive plan re-derives them from `opts` (`:7336-7338`), and the caller passes a third snapshot (`:7897-7899`). A toggle flipped between plan construction and ranking (or an `opts`-carrying call such as the deep-think two-pass flow that omits a flag) yields a turn whose model-ranking hints disagree with its cognitive plan. The `:3476-3477` `typeof searchMode !== "undefined"` guards are a symptom of exactly this defensive coupling.

**R4 — Unsaved control values survive modal close and diverge from engine state.** The Escape handler `:13037-13040` and `closeSettings()` `:2364` discard without reverting the DOM. `#temperatureRange`'s inline `oninput` updates only the label, so after Esc the slider shows a value the engine never uses; same for the model/effort/maxTokens trio reset by `onModelChange()`.

**R5 — Two provider transports clamp the output ceiling differently.** `callOpenAICompatibleFreeProvider()` `:3779` reclamps per actual route: `max_tokens: Math.min(maxTokens, model.maxTokens)` `:3784`. `callGroq()` `:3900` does **not**: `max_completion_tokens: maxTokens` `:3910` with `model: model || currentModel`. Since `:7989` sends the *user's* `currentMaxTokens` (derived from the **preferred** model's limit `:1331`) and the router may substitute a smaller-window model, a fallback route that happens to use the Groq transport can receive a `max_completion_tokens` above that model's real ceiling.

**R6 — Context budget is sized for the largest catalog model, not the routed model.** `getContextInputTokenBudget()` `:6555-6558` in `auto` takes `Math.max` over all configured free models' `contextWindow`; `budgetContextProjection()` `:6571` then truncates/omits knowledge sources against that budget, and nothing re-clamps to `controllerPlan.model.id`'s window before the request at `:7988-7989`.

**R7 — Mode state is session-only.** `deepThinkMode` / `searchMode` / `researchMode` `:1341-1343` reset to `false` on every load while `currentModel` / temperature / effort / max tokens all restore from `localStorage`. The Settings surface is durable; the mode surface is not — and the modern picker (`beta-ui-runtime.js:23`) derives from DOM classes, so a reload also resets it with no reconciliation step.

---

## 4. Recommended single source of truth

Create **one immutable, serializable runtime-control state object** owned by the engine, and make every surface a pure projection of it.

```
sevenRuntimeControls = {
  model:      { preference, routingMode, freeFallback },
  generation: { temperature, maxTokens, reasoningEffort },
  mode:       { deepThink, webSearch, deepResearch }   // orthogonal booleans, no derived 4th mode
}
```

Rules:
1. **Engine owns state; UI renders it.** `#modelSelect`, `#reasoningEffort`, `#maxTokens`, `#temperatureRange`, `#routingModeSelect` and all three toggles become bound projections via a single `applyControlsToUI(state)` / `setControls(patch)` pair. No other file reads `localStorage['model'|'temperature'|'max_tokens'|'reasoning_effort']`.
2. **One persistence boundary.** Persist the whole object in one key, replacing the five scattered keys (`'model'`, `'temperature'`, `'max_tokens'`, `'reasoning_effort'`, `FREE_ROUTING_MODE_KEY`, `FREE_FALLBACK_KEY`) with a versioned migration. Includes mode flags — fixing R7.
3. **One mode model, no fake composite.** `deepResearch` is an orthogonal boolean that *implies* web+deep inside `createCognitiveRequestPlan()` `:7341`/`:7351`, exactly as the engine already does. The modern picker's `research` entry becomes a preset that sets `{deepThink:true, webSearch:true, deepResearch:true}` instead of two `.click()` calls — eliminating `beta-ui-runtime.js:31`'s inability to express research.
4. **Immutable per-turn snapshot.** `createCognitiveRequestPlan()` `:7292` receives the snapshot and becomes the only legal reader during a turn. Ranking (`:2200-2205`) receives the plan instead of touching globals — closing R3.
5. **Route-accurate budgets.** Clamp `maxTokens` and the context projection against the *routed* model in one shared helper used by both transports (`:3784` and `:3910`) — closing R5 and R6.
6. **`onModelChange` is a preview, not a commit**, and is visibly labelled as such; the reset in R2 becomes an explicit "depth/output reset for this model" action.

---

## 5. First implementation slice (smallest safe vertical cut)

**Slice A — Runtime controls registry + read-only UI binding + `beta-ui-runtime` research fix.**

1. Add a pure `seven-controls.js`-equivalent module inside `seven_ai-final.html` (no new build step): `readControls()` / `writeControls(patch)` / `applyControlsToUI()` / `subscribeControls(fn)`, backed by a single `seven_runtime_controls_v1` key with migration from the five legacy keys. `currentModel`, `currentTemperature`, `currentMaxTokens`, `currentReasoningEffort`, `currentRoutingMode`, `freeFallbackEnabled`, `deepThinkMode`, `searchMode`, `researchMode` become accessors over that store (assignment sites unchanged, so no behavioural drift).
2. Add a `CustomEvent('seven:controls')` dispatched on every commit; `beta-ui-runtime.js` subscribes instead of inferring from CSS classes.
3. Minimal patch to `release/beta-ui-runtime.js:31`: for `mode === 'research'`, also drive `#researchToggle` through the same click/`seven:controls` path; `mode === 'chat'` clears all three. This alone makes the modern picker's label match `researchMode` consumed at `:6722`.
4. Make `refreshFreeModelCatalog`-triggered repopulation (`:2373`, `:13030`) pass the *live* `#modelSelect` value when the modal is open (fixes R1) — no behavioural change when Settings is closed.
5. Clamp `max_completion_tokens` in `callGroq` `:3910` with the same `Math.min(maxTokens, model.maxTokens)` used at `:3784`.

Items 1–2 are the enabling refactor; 3–5 are independently shippable bug fixes that the refactor then makes structural.

**Slice B (next wave):** route-accurate context budget (R6), commit-only model semantics + explicit reset (R2/R4), and per-turn snapshot threading into `buildModelRankingContextV3` (R3).

---

## 6. Tests

Existing harnesses to extend: `verify.cjs` (1,367 lines, `npm test` → `all.cjs`), `eval/harness.cjs`, `eval/search-v2-eval.cjs`, `release/release-verify.cjs`, `release/research-runtime.test.cjs`, `release/contrast.test.cjs`.

| # | Test | Assertion |
|---|---|---|
| T1 | `controls-roundtrip.test.cjs` | Every field of `readControls()` survives write→read; legacy-key migration maps all five old keys correctly; unknown/new fields are preserved forward |
| T2 | `controls-clamps.test.cjs` | `currentMaxTokens` clamps identically at init (`:1332`, floor 1) and on save (`:2396`, floor 100) — assert the intended single floor and fix the divergence; effort invalid for the model falls back to `defaultEffort` (`:1338-1339`) |
| T3 | `mode-snapshot.test.cjs` | Mutating a toggle after `createCognitiveRequestPlan()` does not change plan fields; plan `research.use`/`web.use`/`deepThink.use` match `buildContext()`'s `useResearch`/`useWeb` `:6722-6723` for all 8 boolean combinations |
| T4 | `mode-picker.test.cjs` (jsdom) | Each picker mode yields the exact flag triple; "Research" sets `deepResearch=true`; `researchToggle` click updates picker label; picker "Chat" clears all three |
| T5 | `no-repopulate-clobber.test.cjs` | Resolving `refreshFreeModelCatalog` while Settings is open preserves the pending `#modelSelect` value; with Settings closed it still re-selects `currentModel` |
| T6 | `route-budget.test.cjs` | For a catalog containing a large-window and a small-window model, `getContextInputTokenBudget()` ≤ routed model's `contextWindow`; both transports emit `≤ model.maxTokens` output ceiling |
| T7 | `picker-uniqueness.test.cjs` | Assert exactly one `#modelSelect`, `#reasoningEffort`, `#maxTokens`, `#temperatureRange`, `#routingModeSelect`, `#researchToggle` in the shipped artifact (guards D1) |

**Verification commands:** `npm test`, `npm run test:gateway`, `node release/release-verify.cjs`, `npm run eval:search-live`.

---

## 7. Risks and dependencies

- **R-1 · Blast radius.** The control state block is at the parse-time top level (`:1316-1343`) and consumed by 20+ sites; a registry must be initialised before it. Mitigation: keep the existing identifiers as accessor properties so no call site changes.
- **R-2 · Persistence migration is irreversible.** Consolidating five keys into one discards existing user settings if the migration is wrong. Mitigation: dual-write for one release, T1 covers migration.
- **R-3 · Cross-file coupling with the release layer.** `beta-ui-runtime.js`, `materialize-remake-assets.cjs` and `release-verify.cjs` all assume the current DOM IDs; `researchToggle` is currently unobserved by any of them (D2/D3), so "fixing" it can change visible picker behaviour. Requires A05-coordination with whoever owns `release/`.
- **R-4 · Shipping-artifact ambiguity (D1).** Four HTML copies exist. Before any consolidation, the build input must be established; the web/APK pipeline is `npm run build:web` → `release/build-release.cjs` → `zero-room-transform.cjs` → `frontier-model-patch.cjs` → `apk/prepare-web.cjs`.
- **R-5 · Seed drift.** `release/frontier-model-patch.cjs:10` patches `FREE_MODEL_SEEDS` by **string match** on the frozen literal (`z-ai/glm-5-3`, `effort:["low","high","max"]`). Editing the seed block formatting breaks the build patch — do not reformat `FREE_MODEL_SEEDS` `:1068`.
- **R-6 · Mode semantics change is user-visible.** Making `deepResearch` imply web+deep in the picker matches engine behaviour (`:7341`) but changes what "Research" does for users who also had Search on.
- **R-7 · Provider transport asymmetry (R5) is a live correctness bug**, not only a refactor target: a Groq-transport fallback can be sent a ceiling above the model's limit. Fix independently of the registry work.
- **Missing/absent files recorded:** no `AGENTS.md`; no dedicated controls/settings module exists (no `src/`, no `controls.js`); `release/control-runtime.js` and `release/control-bridge.js` deal with *context/token budgeting*, **not** product model/mode/search controls, and are out of scope for this audit.

WAVE01=COMPLETE
# B05 — RPG Generation Runtime Integration Audit (Wave 01B)

Agent: B05 (OpenCode) · Scope: read-only audit · Repo: `/home/runner/work/seven-ai-true/seven-ai-true`
Date: 2026-10-03 · Branch state: no production source edited.

---

## 1. Current Generation Path

There is **no RPG-specific generation runtime**. RPG is a *chat-surface overlay* that shares the single
core generation pipeline. Verified in `release/workspaces/hub.js` `open(kind)`: for `rpg` the hub calls
`chat(true)` (keeps `#chat` and `.input-area` visible, hides the workspace root container) and then
`next.mount(n)` into `.seven-workspace-root` (`data-seven-specialist-surface="1"`). Consequently every
RPG turn is a normal `sendMessage()` turn.

Ordered path with exact anchors (all line numbers in `seven_ai-final.html`):

1. `sendMessage()` — `seven_ai-final.html:6325`
   - Guard: `if (isGenerating || sendMessageLocked) return;` (`:6327`) — duplicate Enter/tap suppression.
   - Also blocked while persistence is unsettled: `roomPersistence.status().ready/.failed/.pending` (`:6326`).
   - `sendMessageLocked = true` (`:6335`), released in `finally` (`:6363`).
   - Keyboard path re-checks the same globals (`:6368`).
2. `generateReply(text, roomId = currentRoom)` — `seven_ai-final.html:7883`
   - `getConversationState(roomId)`; early `return` if absent (`:7884-7885`).
   - Provider gate: `hasAnyConfiguredFreeProvider()`; if false → system bubble "Automatic free routes are temporarily unavailable…" and **no** run record (`:7888-7891`).
   - `createCognitiveRequestPlan` (`:7893`) → `validateCognitiveRequestPlan` (`:7901`, plan carries `contextBudgetTokens` from `getContextInputTokenBudget(currentModel, currentMaxTokens)` `:6549` / `:7358`).
   - `createCognitiveTaskPlan` (`:7906`) → `validateCognitiveTaskPlan` (`:7910`).
   - `addExecutionRun(taskPlan)` (`:7914`); warn-and-continue if Execution Fabric persistence is unavailable (`:7916-7918`).
   - Global mutation block: `isGenerating = true` (`:7917`), `activeGenerationRoomId = roomId` (`:7918`), DOM swap `sendBtn.hidden` / `stopBtn` visible / `userInput.disabled = true` (`:7921-7925`), `stopRequested = false` (`:7927`), `activeAbortController = new AbortController()` (`:7928`).
   - Optional deep-think placeholder bubble (`:7932-7935`).
3. `buildContext(room, text, roomId, controllerPlan)` — `seven_ai-final.html:6720`
   - Calls `compileContextBundle(room, text, searchResult, {inputBudgetTokens: plan.contextBudgetTokens})` (`:6746`).
   - Returns `{messages, searchResult, contextSources, contextBudget, contextWorkspace}` (`:6748`).
4. Streaming loop: cooperative `stopRequested` checks at `:7960`, `:7973`, `:8013`; `reader.cancel()` + `break` in the free-provider stream at `:3768` and `:3971`; `reader.cancel()` on stop at `:4128`.
5. Terminal handling: `finishDeepThinkPerformanceV1(...)` (`:8087`, `:8107`), aborted/cancelled classification (`:8090-8110`), `activeGenerationRoomId = null` in `finally` (`:8122`).
6. `stopGeneration()` — `seven_ai-final.html:8160`
   - Sets `stopRequested = true` (`:8166`) and *best-effort* `activeAbortController.abort()` inside `try/catch` (`:8167`).
   - Documented reason (`:8161-8165`): mobile WebViews throw `AbortSignal object could not be cloned` when the signal is relayed via `postMessage`; therefore the flag is authoritative and abort is advisory.
7. UI write coalescer: `streamingUiMetrics` / `streamingUiFrame` / `streamingUiPending` (`:2056-2058`), rAF-`schedule()`d single-slot flush (`:2064-2075`), `cancelAnimationFrame` path (`:2077-2087`), metrics exported at `:2174`.
8. Timeout fetch wrappers (`:4262-4281`, `:4296-4316`) — relay `activeAbortController.signal` into per-call `AbortController`s and `setTimeout(() => controller.abort(), …)`.

Constraint recorded in-source: "A retry after partial streaming is forbidden because it could duplicate
user-visible output." (`seven_ai-final.html:994`). Recovery is therefore whole-bubble replacement via
`regenerateLastReply()` (`:1882`, `:8155`).

---

## 2. Global Locks / Controllers That Collide With RPG

All of these are **module-global, single-instance**, declared at `seven_ai-final.html:1344-1348`:

| Global | Declared | Colliding RPG interaction |
|---|---|---|
| `isGenerating` | `:1344` | RPG is chat-backed → an RPG turn blocks *every* room's send, and blocks `sendMessage` even in other rooms. Not per-room, not per-workspace. |
| `sendMessageLocked` | `:1345` | Same; a long RPG turn holds the input gate globally. |
| `stopRequested` | `:1346` | Single flag. `generateReply` resets it to `false` at `:7927`; a still-draining earlier request therefore **un-cancels** (ABA). Also read by research (`:5953`, `:5990`), search (`:3768`, `:3971`), title/summary (`:4128`). |
| `activeAbortController` | `:1347` | One controller shared by main reply, `generateTitle` (`:4207`), summarization (`:4183`), web-search/reader loops, and deep-research page reads. Aborting an RPG turn kills the title call and vice-versa; the timeout wrappers (`:4267`, `:4300`) forward the *same* signal. |
| `activeGenerationRoomId` | `:1348` | Only consumer is the room-delete guard (`:1802-1803`). It blocks deleting the generating room but permits deleting *other* rooms mid-RPG; nothing else consults it. |
| `streamingUiFrame` / `streamingUiPending` | `:2057-2058` | Single-slot coalescer. Two simultaneous streams (e.g. main reply + research/title render, or two rooms) overwrite each other's pending payload: the first bubble silently freezes at partial text. No per-bubble ownership. |
| `currentRoom` | used as default param | `generateReply(text, roomId = currentRoom)` (`:7883`) and `buildContext(room, text, roomId = currentRoom)` (`:6720`) silently bind to whatever room is selected at call time. |
| `pendingKnowledgeFiles` | `:2493` | Module-global, pushed by the file-attachment path (`:2520`, `:2532`) — cross-room leakage of staged attachments. |
| Workspace hub `S.loading` | `release/workspaces/hub.js` (`S={version,active,ready,loading,generatedLoading,…}`) | One in-flight workspace-script slot. `open('rpg')` while another workspace script is loading overwrites `S.loading`, orphaning the first promise. |
| `SevenAurora.set(...)` | called from `rpg.js:22` / `hub.js open()` | Aura is a single global visual channel — RPG room A's warning/ok state bleeds into room B and chat. |

Additional RPG-specific global: the `S` closure object in `release/workspaces/rpg.js`
(`{root, bar, worldEngine, worldSession, canonEngine, canonSession, observer, titleHandler}`) is one
instance per page. There is no `roomId` parameter anywhere in `rpg.js`.

---

## 3. State Ownership

**RPG side (per-page singleton).** `release/workspaces/rpg.js`:
- `snapshot()` `:23` → `{work, worldSession, canonPack, canonSession}`.
- `loadWork(pack, opts)` `:24` → `SevenWorld.createEngine(pack)` + `createSession`; throws `SevenWorld runtime unavailable` if absent.
- `loadCanon(pack, opts)` `:25` → `SevenCanon.createEngine(pack)` + `createSession`; throws `SevenCanon runtime unavailable` if absent.
- `commitVerifiedBeat(input)` `:28` — hard-gated on `input.verified === true` (returns `BLOCKED/verification-required`), then `S.worldEngine.commitBeat(...)`; **already has the correct immutable-session shape**: `if (out.session) S.worldSession = out.session;`.
- `applyVerifiedDelta(delta, meta)` `:29` — same verification gate, `S.canonSession = out.session`.
- `recordTitle` `:33` / `autoTitle` `:34` — dedupe by lowercase title, `nextTitleNumber` `:31`, confidence gate `>= .65`, `boundary !== false`; emits `seven:rpg-title-recorded`.
- `observeChat()` `:50` — `MutationObserver` on `#chat` with `subtree:true` → `scanCopy()` `:49` → `addCopy()` `:48`. `unmount()` `:57` disconnects it.
- `mount(root)` `:55` registers **document-level** listeners: `seven:themechange` and `seven:rpg-title-candidate`; both removed in `unmount()` `:57`.

Consequence: Room A and Room B share one `worldSession`/`canonSession`. Loading a pack in Room B
silently replaces the canon/world state observed by Room A. Nothing in the RPG module is keyed by room
and none of it is persisted per room (rooms persist via `roomPersistence`, `:1663-1760`, and canonical
backup/import `:8175+`, neither of which covers RPG engine state).

**Core side (per room, correctly).** `roomPersistence` with `revision` optimistic concurrency
(`ROOM_REVISION_CONFLICT` at `:1698`), `pending` counter, `beforeunload` guard (`:1759`).
`getConversationState(roomId)` is the per-room accessor used by `generateReply`.
`Execution Fabric` run bundle is global, capped at last 100 runs / 2000 events (`:7594-7606`).
Declared invariant, `seven_ai-final.html:8317`: *"Context (buildContext output) is a read-only projection
of canonical memory for a single request. It is never canonical memory and is never written back to
storage."* Memory projection is read-only via `getUsableMemoryContext(query, scopeContext)` (`:12204`),
consumed only through `buildContext` (comments `:12029-12064`, status line `:9723` "Task 31").

---

## 4. Model Routing As It Affects RPG

- `resolveWorkspaceV3(options)` — `seven_ai-final.html:3435`: explicit `options.workspace` → else
  `window.SevenWorkspaces.active()` → else `"chat"`. **No `roomId` input.** The active workspace is a
  single page-global, so one RPG session biases model selection for every other room.
- `analyzeModelRequestV3(...)` — `:3436-3520`: `rpg` intent added with weight `1.10` when
  `workspace === "rpg"` **or** the text matches `/\b(rpg|roleplay|character|canon|lore|worldbuilding|scene)\b/i`
  or the Arabic equivalents (`:3474`); `confidence += .06` for non-chat workspace (`:3502`).
- `buildModelRankingContextV3(config)` — `:3571`: `outputBudget = clamp(cfg.maxTokens||8192, 256, 65536)`,
  `requiredContext = analysis.inputTokens + outputBudget + 2048`.
- `modelContextHeadroomScoreV3(model, requiredContext)` — `:3548`: returns `-Infinity` if
  `contextWindow < requiredContext` (hard elimination).
- `modelCapabilityFitV3(model, context)` — `:3556`: hard gates on `requireStreaming` (from `opts.stream`),
  `requireVision`, `requireTools`, `requireStructured`; soft scoring for vision/tools/structured/reasoning effort.
- Streaming write path metrics: `streaming:{requests,writes,cancelledFrames}` (`:2174`).

Mismatches found:
1. `contextBudgetTokens` is derived from `getContextInputTokenBudget(currentModel, currentMaxTokens)` (`:6549`, `:7358`) — i.e. the *UI-selected* model — while `requiredContext` is derived from the *routed* model. If routing picks a smaller-window model, the bounded projection can exceed the model window after ranking.
2. The RPG intent boost is a scoring nudge only; nothing makes an RPG turn *require* structured output. `generated-ui.js` `validate()` demands strict typed documents (`LIMITS = {nodes:120, depth:8, children:40, text:4000}`), and nothing in the RPG path sets `requireStructured: true`, so a "render this as generated UI" RPG beat can stream free prose that can never be mounted.
3. `SevenGeneratedUI.mount(input, container, options)` (`release/workspaces/generated-ui.js`) throws on any unknown field (`keys()` allowlist per node type) and does `while (container.firstChild) container.removeChild(...)` — it clears its container unconditionally. `SevenWorkspaces.renderGeneratedUi(doc, container, options)` is the only mount door; there is no RPG binding for it.

---

## 5. Bounded Context Projection

- `getContextInputTokenBudget(model, outputTokens)` — `seven_ai-final.html:6549`.
- `compileContextBundle(room, text, searchResult, options)` — `:6698`; reads `options.inputBudgetTokens` (`:6575-6576`), computes `historyCap = max(256, floor(inputBudgetTokens * historyFraction))` (`:6584`), `remainingTokens = max(0, inputBudgetTokens - historyTokens - 128)` (`:6610`), and returns `budget` incl. `inputBudgetTokens` + `estimatedSourceTokens` (`:6641-6643`).
- `buildContext(room, text, roomId, controllerPlan)` — `:6720-6748`, returns `contextBudget` and `contextWorkspace` (`bundle.workspace`).
- `estimateRequestTokens` feeds `analyzeModelRequestV3` `inputTokens` (`:3470` region) and the `longContext` boost (`value.length > 2500 || inputTokens > 3500 || hasKnowledge`).
- Memory writes clamp to `MAX_MEMORY_CONTENT_LENGTH = 2000` (`:10297`, enforced `:10346`, `:10363`, `:10405`, `:10562`, `:10879`).
- History compaction `room.history = room.history.slice(-keepCount)` (`:4197`) inside summarization.

**Gap:** `compileContextBundle` has **no RPG/canon/world budget line**. `bundle.workspace` is
reported but the RPG projection (committed beats, recorded titles, canon scene deltas, `aura()`
warnings from `rpg.js:22`) is never charged against `remainingTokens` nor injected. RPG continuity
therefore rides entirely on raw `historyCap`-truncated chat text, and when the cap trims, canon
continuity is lost with no canon-aware compaction or summary. The RPG title list is also unbounded in
state while the DOM shows only the last 8 (`rpg.js:38`, `arr.slice(-8).reverse()`).

---

## 6. Error Recovery

- `generateReply` `finally`: `activeGenerationRoomId = null` (`:8122`); input/send/stop DOM restored.
- `stopRequested`/AbortError classification into `"cancelled"` vs `"failed"` (`:2781`, `:6038`, `:8090-8110`, `:8107`).
- Free-provider failure paths: `hasAnyConfiguredFreeProvider()` gate (`:7888`), `freeFallbackEnabled` throw (`:3848`), health/latency sample caps (`:2728`, `:3068`).
- Retry policy: partial-stream retry is forbidden by design (`:994`); the only recovery is `regenerateLastReply()` which replaces the last assistant bubble in the current room (`:1882`, `:8155`).
- RPG pack load: `jsonFile(file, kind)` (`rpg.js:39`) catches JSON errors → `notice('Pack rejected: …','error')`; `loadWork`/`loadCanon` throw on missing runtime (`:24`/`:25`), caught only by `hub.js open()`'s try/catch, which resets `S.active='chat'`, deletes `data-seven-workspace`, and sets Aurora `'error'`.
- RPG has **no run/checkpoint persistence of its own**: `addExecutionRun` / `checkpointDeepResearchRunV2` (`:7914`, `:5971`, `:6000`) live in the core and are keyed to chat turns. `commitVerifiedBeat` / `applyVerifiedDelta` apply mutations eagerly; if the reply then fails, canon/world state has already advanced with no compensating rollback and no durable record in the RPG module.
- `rpg.js` notices are single-slot: `notice()` writes to one `[data-rpg-notice]` node (`:36`) — the last message wins.

---

## 7. Proposed Per-Session Boundaries

**A. Generation session scope (core).** Introduce a registry in `seven_ai-final.html` next to `:1344-1348`:

```
GenerationSessions: Map<`${roomId}::${workspace}`, {
  roomId, workspace,
  generating:boolean, locked:boolean, stopRequested:boolean,
  controller:AbortController|null,
  frame:number|null, pending:{bubble,text}|null,
  bubble:Element|null, runId:string|null
}>
```
- `getGenerationSession(roomId, workspace)` creates on demand; the **default** scope (`currentRoom`, active workspace) stays a live singleton for backward compatibility, so a slice-by-slice migration is possible.
- Move into the scope: `isGenerating`, `sendMessageLocked`, `stopRequested`, `activeAbortController`, `streamingUiFrame`, `streamingUiPending`.
- `stopGeneration()` → `stopGeneration(roomId = currentRoom, workspace = resolveActiveWorkspace())`: set `scope.stopRequested = true`, then `scope.controller?.abort()` in `try/catch` (preserve the WebView clone workaround at `:8161-8167`).
- `stopGeneration` must **not** reset another scope's flag. Fix the ABA at `:7927` by creating a fresh scope per attempt and comparing `scope.controller === activeAbortController` identity before touching shared state.
- Room-delete guard (`:1802-1803`) reads `GenerationSessions.get(id)?.generating`.
- `SevenAurora` calls: pass a scope-tagged channel or degrade to a session-local notice.

**B. Workspace routing per room.** `resolveWorkspaceV3({roomId, ...})`: prefer `getRoomWorkspace(roomId)` (persisted in room metadata) over the single `SevenWorkspaces.active()`. Persist the active workspace per room so switching rooms restores the right routing and the right RPG panel.

**C. RPG state per room.** In `release/workspaces/rpg.js`, replace the singleton `S` fields with `sessions: Map<roomId, {worldEngine, worldSession, canonEngine, canonSession, bar, observer, titleHandler, pendingFiles}>`; `snapshot(roomId)`, `loadWork(roomId, pack)`, `loadCanon(roomId, pack)`, `commitVerifiedBeat(roomId, input)`, `applyVerifiedDelta(roomId, delta, meta)`, `recordTitle(roomId, kind, meta)`. `mount(root)` binds the observer to the active room only; `unmount(roomId)` disconnects just that room's observer and removes only its document listeners. Engine/session objects are already immutable-value based (`:28`, `:29`) so the per-room map is a small change.

**D. Bounded RPG projection.** Add an `rpg` section to `compileContextBundle` (`:6698`) charged against `remainingTokens` (`:6610`): latest committed beats, last 8 titles, canon facts for the active scene, plus an `rpgProjection` diagnostic — read-only, per `scope.roomId`, never written back (honors the `:8317` invariant). Include RPG projection tokens in the `estimatedSourceTokens` accounting (`:6643`) so `requiredContext` (`buildModelRankingContextV3` `:3578`) reflects reality.

**E. Hub loader slot.** Replace `S.loading` single-slot with `S.loading: Map<kind, Promise>` in `release/workspaces/hub.js` so concurrent `open()` calls for different workspaces cannot clobber each other; also key `S.generatedLoading` per file.

---

## 8. First Implementation Slice (smallest shippable, testable)

Slice 1 — **per-room generation session scope, compat-shimmed**:
1. Add `GenerationSessions` + `getGenerationSession/createGenerationSession/getDefaultGenerationSession` immediately after `seven_ai-final.html:1348`.
2. In `generateReply` (`:7883`), resolve/create the scope for `roomId`, set `scope.generating/stopRequested/controller` in place of `:7917`, `:7927`, `:7928`; keep writing the legacy globals as mirrors for one slice.
3. `stopGeneration()` (`:8160`) targets `activeGenerationRoomId`'s scope; the delete guard (`:1802`) reads the scope.
4. Move `streamingUiFrame`/`streamingUiPending`/`streamingUiMetrics` (`:2056-2087`, `:2174`) into the scope — smallest high-value win (fixes cross-bubble partial-text clobbering).
5. Replace every `stopRequested` read in the streaming/research paths (`:3768`, `:3971`, `:4128`, `:5953`, `:5990`, `:7960`, `:7973`, `:8013`) with `scope.stopRequested`.
6. `resolveWorkspaceV3` gains a `roomId` hint; per-room workspace stored in room metadata.

Slice 2 — RPG state namespacing by `roomId` in `rpg.js` (state only, no projection change).
Slice 3 — bounded RPG context projection in `compileContextBundle`.

---

## 9. Tests and Failure Cases

**Current coverage (fact, not assumption):** `npm test` → `node all.cjs` runs
`eval/harness.cjs`, `eval/search-v2-eval.cjs`, `memory.cjs`, `runtime-smoke.cjs`, `verify.cjs`,
`cloudflare/search-gateway/search-gateway.test.mjs`, `release/{embedded-credentials,contrast,static-audit,canon-simulator,world-runtime,research-runtime}` and 12 `evolution/*.test.cjs` suites.
A grep for `rpg` across `evolution/*.test.cjs` and `release/*.test.cjs` returns **zero matches** — there is
**no RPG-specific test suite today**. `runtime-smoke.cjs` / `verify.cjs` are static audits over
`seven_ai-final.html`.

Proposed new suites: `release/rpg-session.test.cjs` and `evolution/generation-session.test.cjs`
(both registered in the `releaseTests` / `evolutionTests` arrays at the top of `all.cjs`), reusing the
static-extract + vm-eval pattern from `release/world-runtime.test.cjs` and `release/canon-simulator.test.cjs`.

Failure cases to encode (each currently reproducible by inspection):

1. **Cross-room cancel bleed.** Room A generating an RPG turn; user switches to room B and hits stop. Today `stopGeneration()` sets the single `stopRequested` and aborts the single controller → Room A's turn is cancelled. Expected after slice 1: B is a no-op, A keeps streaming.
2. **Coalescer clobber.** Two streams writing bubbles in the same frame: second `scheduleStreamingUi` (`:2062`) overwrites `streamingUiPending` → first bubble stops mid-text with `isGenerating` true forever. Expected: per-scope `pending`/`frame`.
3. **ABA un-cancel.** Two overlapping attempts in one room: attempt #2's `stopRequested = false` (`:7927`) clears attempt #1's stop flag before #1 finishes draining → #1 resumes writing into a bubble the user already discarded.
4. **Shared AbortController.** `generateTitle` (`:4207`) starts while an RPG turn streams; `stopGeneration()` aborts the title request too → `console.error("Title generation failed")` (`:4238`) and a spurious user-visible "Title error". Inverse: title timeout (`:4281`) can abort the main RPG stream via the forwarded signal.
5. **RPG canon cross-room contamination.** Load Canon pack in room B, then commit a verified beat in room A → A's beat commits against B's `canonPack` because `S.canonEngine`/`S.canonSession` are page-global (`rpg.js:25`, `:28`).
6. **Pack swap mid-generation.** `jsonFile` → `loadWork` (`:24`) replaces `S.worldEngine` while `buildContext` already snapshotted `room`; the streamed reply describes the previous world. `snapshot()` (`:23`) is read after the fact and shows the new engine.
7. **Budget/model mismatch.** `contextBudgetTokens` computed from `currentModel` (`:6549`) while routing selects a smaller-window model → `requiredContext > contextWindow` → `modelContextHeadroomScoreV3` returns `-Infinity` (`:3548`) and the model is eliminated; or the projection overruns and the provider truncates/400s.
8. **RPG projection absent from budget.** Long RPG session: `historyCap` (`:6584`) trims canon-bearing turns; no canon summary is injected, so the model contradicts committed canon. Test: assert `bundle.budget` includes an `rpgProjection` line and that trimmed canon facts are re-injected read-only.
9. **Hub loader clobber.** `SevenWorkspaces.open('rpg')` while the `coding.js` script is in flight → second call overwrites `S.loading`; the first `open()`'s `finally` clears `S.loading=null` and the rpg promise is orphaned (no rejection, no mount, workspace stuck on "Loading…").
10. **Partial-stream retry duplication.** Reply cut at 40% then network error → `regenerateLastReply()` (`:1882`) must replace, never append (invariant `:994`). Test both orders.
11. **Verification-gate bypass.** `commitVerifiedBeat({verified:false})` and `applyVerifiedDelta(delta,{verified:false})` must return `BLOCKED/verification-required` without touching state (`rpg.js:28`, `:29`).
12. **Observer leak.** `mount` then `unmount` then re-`mount` (room switch): without per-room observers, `scanCopy` (`:49`) runs N times and `unmount` (`:57`) currently removes copy affordances document-wide.
13. **Aurora leak.** Room A RPG warning aura (`rpg.js:22`) persists after switching to room B / chat.
14. **Persistence gate.** `sendMessage` while `roomPersistence.status().pending > 0` must stay blocked (`:6326`).
15. **Generated UI mount clobber.** `SevenGeneratedUI.mount` clears its container unconditionally → mounting a doc into the RPG workspace root while the RPG chatbar is inside it destroys RPG chrome. Also: `validate()` rejects unknown fields, so a streamed RPG "UI beat" with one extra key throws and must be surfaced, not swallowed.

---

## 10. Dependencies and Risks

**Dependencies**
- No build step: the app is a single `seven_ai-final.html` plus IIFE workspace modules loaded at runtime by `release/workspaces/hub.js` (`script()`, `dep()`, `generated()`). Any refactor must stay in-file / in-module.
- RPG depends on `release/canon-simulator.js` (`SevenCanon`) and `release/world-runtime.js` (`SevenWorld`) via `CFG.rpg.deps` in `hub.js`; both are gated by `typeof r[c.global] === 'function'` checks with thrown errors (`rpg.js:24-25`).
- `release/generated-ui.js` (`SevenGeneratedUI`) is a separate loader path (`loadGeneratedUi` / `renderGeneratedUi`) with its own in-flight slot.
- `SevenAurora` (aura), `release/embedded-credentials.test.cjs` and `release/static-audit.cjs` constrain what may be added to `seven_ai-final.html`.
- Persistence: IndexedDB `roomPersistence` with `revision` conflicts (`:1698`); `Execution Fabric` bundle global cap 100 runs / 2000 events (`:7594-7606`); canonical backup/import v2 (`:8175+`) excludes transient UI state — RPG engine state is currently in neither bucket, so it is neither backed up nor migrated.

**Risks**
- *Compat shim drift*: keeping legacy globals alongside session scopes can reintroduce exactly the bugs slice 1 removes. Mitigation: mirror writes only, reads only from the scope, delete mirrors in a follow-up slice with a static-audit assertion.
- *WebView abort*: `AbortSignal` cannot be cloned on some Android WebViews (`:8161-8165`). Never make `AbortController` the sole cancel mechanism; the boolean flag must remain authoritative per scope.
- *Eager canon mutation*: `commitVerifiedBeat`/`applyVerifiedDelta` have no rollback. Splitting state per room reduces blast radius but does not fix partial-advance on failure; a compensating-transaction step is a separate, later decision.
- *Hub lazy-load races*: making `S.loading` per-kind changes mount ordering for coding/research; `decorate()` and `isolateLauncher()` timing must be re-verified.
- *Budget double-counting*: injecting an RPG projection into `remainingTokens` (`:6610`) without updating `estimatedSourceTokens` (`:6643`) will under-report cost to `requiredContext` and reintroduce truncation failures.
- *Test gap*: zero RPG coverage today means slices 1-3 land unverified unless the two new suites land first. Sequence the new suites with slice 1.
- *Absent files (recorded, not blocking)*: no `rpg` test file, no dedicated RPG generation module, and no per-room workspace persistence file were found in the repository.

WAVE01=COMPLETE

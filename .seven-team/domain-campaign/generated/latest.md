# Seven Domain Roadmaps — cycle evidence

Ready domains: 3/30
Only READY domains may drive implementation.

# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: READY

DOMAIN_ID=D01_CHAT_CORE
SOURCE_ANALYSIS=The MDN Streams API [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/Streams_API describes programmatically accessing network streams and processing them as desired. MDN AbortController [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/AbortController describes aborting one or more Web requests as desired. React.dev Preserving and Resetting State [SOURCE primary] https://react.dev/learn/preserving-and-resetting-state describes preserving/resetting UI state. Harvest was polluted by CSS/font assets but the three substantive primary sources are clear and current. Limitations: no opinion on room ownership, composer IME locks, per-room draft state, copy behavior, or retry affordances — those are product decisions Seven must define; the sources only cover transport-level streaming/abort and React state preservation. No disagreements among the three substantive sources; all are stable specs, not time-sensitive.
CURRENT=Seven's remake `remake/src/application/chat/chat-service.ts` implements `ChatService.send(roomId, content, transport, options)` with: per-room exclusive task ownership via `TaskManager` (rejects if a task is already active for the room), `AbortSignal` threading through `rooms.get`/`rooms.put` and the transport stream, `onDraft` observer for streaming deltas, 1 MB draft cap, per-delta abort checks, `sealCancellation()`/`sealDeadline()` before committing the assistant message, and validation of transport as AsyncIterable. `remake/src/domain/chat/index.ts` defines immutable `Room`/`ChatMessage` with `commitMessage`, `createRoom`, `withRoomModel`, strict schema validation, monotonic timestamps, frozen snapshots. `remake/src/storage/room-repository.ts` provides `InMemoryRoomRepository` and `IndexedDbRoomRepository` with `get/put/list/delete`, abort-aware transactions, structured `STORAGE` errors, retryable blocked upgrades, frozen/cloned returns, recency-sorted list with id tie-break. `remake/src/core/task-manager.ts` owns all active tasks with `idle→starting→running→cancelling→cancelled|succeeded|failed`, `claimExclusiveOwner`, per-owner active listing, timeout→deadline error, single-abort guarantee. `remake/src/context/context-builder.ts` builds provider context from room messages + memories + summary with budgets, conservative UTF-8 estimator, contiguous suffix selection, cross-room memory rejection. Wave-01 bughunt `.seven-team/reports/bughunt/B01.md` (verified) documents legacy `release/beta-ui-runtime.js` defects: `stopRequested` undeclared ReferenceError, Android abort not propagated (`activeAbortController=null` without `.abort()`), double-send duplicate user messages, attachment wrapper swallowing errors, room-switch state loss unverified, streaming retry not surfaced. Master Bug Report `.seven-team/bughunt/MASTER_BUG_REPORT.md` promotes MBR-004 (stop/cancel pipeline broken, 9 source findings), MBR-010 (Enter-to-send doesn't guard IME composition), MBR-011 (composer auto-grow vs resize competition), MBR-001 (competing shell/UI runtime ownership). Architecture `remake/ARCHITECTURE.md` §3 Chat: Room is persistent aggregate; Message immutable once committed; streaming text lives in transient draft until finalized; Composer owns text/IME composition lock/attachments/send eligibility; Enter-to-send disabled while composition active; Cancellation all provider calls receive TaskManager signal; Android/native bridge cancellation mapped to same taskId. Current shell `remake/src/ui/App.tsx` has no composer/room UI — it's a workspace shell only; no chat composer, room list, send/stop/copy controls, or IME lock exist in the remake UI layer. `remake/src/ui/system/locale.ts` supports en/ar copy but no chat-specific copy.
TARGET=A single coherent chat domain where: one room owns one active generation at a time; streaming assistant text is a transient draft until finalized (never half-written into history); send/stop/copy/retry are first-class composer controls with IME composition lock (Enter-to-send disabled during composition); per-room draft/attachment/scroll state persists across room switches and is restored on return; stop propagates abort to web and Android/native bridge consistently; retry is offered for provider/network/deadline failures; room lifecycle (create/switch/delete/archive) is deterministic and tested; copy duplicates message text without mutating state; all errors surface as structured `SevenError` with retryable flag. Immutability and single-owner invariants from ARCHITECTURE §3/§5 preserved.
NOW=First high-value slice: (1) Add a composer state machine + per-room draft/attachment/send-eligibility controller with IME composition lock (Enter-to-send disabled during composition), unit tested. (2) Add a `stop()` path in `ChatService`/`TaskManager` that aborts via `AbortController.abort()` uniformly (web + Android bridge), plus regression test asserting abort is called and no ReferenceError. (3) Add a double-send guard rejecting concurrent sends for the same room, with unit test. (4) Add copy action returning message text without side effects. These map to B01-001/B01-002/B01-003/B01-007 and MBR-004/MBR-010.
NEXT=Room switch state preservation (persist/restore draft/attachments/scroll per room), retry affordance for provider/deadline errors, per-room message scroll restoration, archive/delete with idempotent delete, message edit/regenerate, IME-aware auto-grow decoupled from resize owner (MBR-011), streaming chunk consumer with ReadableStream handling, error boundary/toast for send failures.
LATER=Message search within rooms, pin/star messages, message reactions, thread/reply, scheduled send, tone/rewrite composer actions, export transcript per room, presence/read receipts.
TESTS=Unit: chat-service send/stop/cancel/draft/double-send guard/abort propagation (vitest, fake AbortController); domain chat commitMessage/immutability/monotonic timestamps; room-repository abort/frozen/clone/contract (already exists — extend with room-switch draft persistence); context-builder budgets/memory ranking (exists — extend). Contract: transport AsyncIterable validation, non-string delta rejection, draft size cap. Android: instrumented round-trip asserting native abort invoked on stop (Capacitor bridge cancellation token mapped to taskId). E2E: send→stream→stop→no partial assistant message in history; double-send yields one user message; room switch preserves draft/restores on return; Enter-to-send blocked during IME composition. Adversarial: rapid stop/send races, pre-aborted signal, transport returning non-AsyncIterable, provider completing without content (retryable PROVIDER error), corrupted IndexedDB room fails closed. Eval: MBR-004 regression suite (stop/cancel integrity) must pass before release.
RISKS=Security/privacy: transient draft must never be persisted as assistant history; abort must not leak in-flight native requests on Android (orphaned requests). Performance: single global `activeAbortController` in legacy code would break multi-room concurrency — remake uses per-task AbortController, must stay per-room. Android: bridge cancellation must map to same taskId; SAF/document URI lifecycle not in this domain but adjacent (D11/D25). RTL: composer direction derived from shell locale (en/ar already supported). Cross-system: stop/patch and send/patch must coordinate (legacy cross-system contradiction in B01 report); control-bridge boot order (MBR-003) is shared with A04/A02 — lease required if editing shared files.
FIRST_SLICE=Composer controller with IME lock + send-eligibility, uniform abort (web + Android bridge), double-send guard, copy action — each with unit test; no production UI shell rewrite.
KNOWN_UNKNOWNS=No remake UI composer/room-list implementation exists yet (App.tsx is a placeholder shell), so send/stop/copy UI is unproven at runtime. Android installed-device abort round-trip evidence is UNPROVEN (requires emulator/device gate). IME composition behavior on Android WebView not yet tested. Room-switch draft persistence not yet implemented. No retry UI or toast infrastructure exists.
DOMAIN_VERDICT=READY_FOR_PLAN


# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: INSUFFICIENT

DOMAIN_ID=D02_MEMORY_CONTEXT
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: INSUFFICIENT

DOMAIN_ID=D03_TOOLS_CAPABILITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D04_CODING_SYSTEM — Coding Agent / Repo Map / Edit-Test-Verify

Research audit: INSUFFICIENT

DOMAIN_ID=D04_CODING_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D05_SELF_DEVELOPMENT — Self-Development / Autonomous Software Evolution

Research audit: INSUFFICIENT

DOMAIN_ID=D05_SELF_DEVELOPMENT
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D06_RPG_WORLD — RPG / World Runtime / Canon / Dialogue / Agency

Research audit: READY

DOMAIN_ID=D06_RPG_WORLD
SOURCE_ANALYSIS=
The harvested D06 sources (Yarn Spinner docs + Godot save-games guide) collectively describe: a dialogue system as a separate runtime from the game engine (`docs.yarnspinner.dev/components/dialogue-runner.md`, `[SOURCE primary]`), where a Dialogue Runner delivers lines/options/commands to the host game; state serialization across multiple objects/levels (`docs.godotengine.org/en/stable/tutorials/io/saving_games.html`, `[SOURCE primary]`); and no canonical "RPG canon" or "world session" concept — Yarn Spinner is a dialogue authoring tool, not a world/canon engine. Disagreements/limitations: none of the sources address per-character knowledge partitioning, contradiction detection against immutable canon, or bounded context projection for long sessions. Freshness is adequate (current docs), but the sources only cover half the domain (dialogue delivery + save-game serialization); the canon/world model half is unrepresented. The `llms.txt` fetch 404'd (`www.yarnspinner.dev/docs/llms.txt` → 404 Page not found), so no additional indexed source material was available from that endpoint.
CURRENT=
Seven's RPG surface (`release/workspaces/rpg.js`, `release/world-runtime.js`, `release/canon-simulator.js`) is an in-memory overlay on top of the shared chat pipeline, not a persistent RPG domain. Verified facts:
- `hub.js` `open('rpg')` calls `chat(true)` then mounts `rpg.js` into `.seven-workspace-root`; every RPG turn is a normal `sendMessage()` turn (B05 Wave 01 report, §1).
- `world-runtime.js`: `createEngine` normalizes a work (id, version, continuity, sources, beats, titleRules); `sceneContract` enforces beat order, `playerAgencyLock`, source coverage status; `commitBeat` blocks out-of-order beats unless `allowBranch`, blocks non-user player actions, records an immutable history entry; `formatTitle`/`recordTitle`/`audit` exist. `world-runtime.test.cjs` passes all its assertions.
- `canon-simulator.js`: `createEngine` normalizes a canon pack (events/entities/facts/anchors/sources, invariants); `factStatus` derives VERIFIED/PROBABLE/AMBIGUOUS/CONFLICTING from source authority weights; `canCharacterKnow` gates on continuity, `availableAt` horizon, `knownBy`; `buildSceneContract` emits per-scene obligations (unconsumed); `applySceneDelta` merges world/relationships/locations/objects/knowledge with invariant/anchor threat analysis, canonDebt, forced branching, provenance; `audit` reports characterKnowledge/invariants/futureAnchors. `canon-simulator.test.cjs` passes all its assertions.
- `rpg.js`: page-global singleton `S` (one `worldSession`/`canonSession` per page, not per room); `loadWork`/`loadCanon` replace engines destructively with no dirty check; `commitVerifiedBeat`/`applyVerifiedDelta` hard-gated on `verified===true` (unreachable from UI — no caller sets it); `autoTitle` confidence ≥ .65 + boundary + dup guard; `observeChat` MutationObserver rescans full chat per mutation; `snapshot()` returns live engine/session references, not an immutable durable envelope.
- Generation globals (`isGenerating`, `sendMessageLocked`, `stopRequested`, `activeAbortController`, `streamingUiFrame/Pending`) are module-global in `seven_ai-final.html:1344-1348`, colliding across rooms/workspaces; stop/cancel ABA at `:7927`, shared AbortController, coalescer clobber (B05 report §2-3).
- Model routing: `resolveWorkspaceV3` has no `roomId`; RPG intent boost is scoring-only, no `requireStructured`; `contextBudgetTokens` derived from UI-selected model while `requiredContext` derives from routed model (mismatch risk); `compileContextBundle` has no RPG/canon/world budget line (B05 report §4-5).
- Persistence: `roomPersistence` (revision optimistic concurrency, beforeunload guard) and Execution Fabric run bundle exist for chat; RPG engine state is in neither bucket — no backup/import/migration, no restart persistence (B05 report §6, MBR-009).
- Coverage: grep for `rpg` across `evolution/*.test.cjs` and `release/*.test.cjs` returns zero matches — no RPG-specific test suite exists.
TARGET=
RPG as a first-class persistent domain per `remake/ARCHITECTURE.md` §10 and `RPG_V2_PRODUCT_CONTRACT.md`: canonical snapshot includes pack identity/version, world session, canon session, branches, titles, relationships/state, revision/checksum; snapshots returned to UI are immutable copies. The V2 core promise: start RPG → choose continue/new → essential setup → story begins immediately → one character with explicit state → one player decision mutates world state → later narration reflects it → leave/re-enter restores state. State contract: immutable/declared canon facts, current world state, character-local knowledge, relationship/state variables, player-authored decisions, derived summary/context; every persisted mutation has provenance. Canon as constraint system: contradiction detection, intentional vs accidental branch distinction, player-character agency protection, no silent promotion of model invention into canon. Memory: 20-turn continuity, restart persistence, character knowledge ≠ narrator knowledge. UX: continue/new/exit primary; pack imports and title management behind advanced surface.
NOW=
First high-value implementation slice (Slice 1 — per-room generation session scope + per-room RPG state namespacing, no projection change):
1. In `seven_ai-final.html`, add `GenerationSessions: Map<`${roomId}::${workspace}`, {...scope...}>` with `getGenerationSession/createGenerationSession/getDefaultGenerationSession` after line 1348; move `isGenerating`, `sendMessageLocked`, `stopRequested`, `activeAbortController`, `streamingUiFrame/Pending/Metrics` into the scope; keep legacy globals as read-only mirrors for one slice.
2. `generateReply` resolves/creates scope for `roomId`; sets scope fields in place of `:7917`/`:7927`/`:7928`; reads `scope.stopRequested` in streaming loops (`:7960`/`:7973`/`:8013`); delete-guard reads scope.
3. `stopGeneration(roomId = currentRoom, workspace = ...)` targets that room's scope only (fixes cross-room cancel bleed, ABA un-cancel, shared AbortController).
4. In `release/workspaces/rpg.js`, replace singleton `S` fields with `sessions: Map<roomId, {worldEngine, worldSession, canonEngine, canonSession, observer, titleHandler}>`; `snapshot(roomId)`, `loadWork(roomId, pack)`, `loadCanon(roomId, pack)`, `commitVerifiedBeat(roomId, input)`, `applyVerifiedDelta(roomId, delta, meta)`, `recordTitle(roomId, kind, meta)`; per-room observers, per-room `unmount(roomId)`.
5. New test suites `release/rpg-session.test.cjs` and `evolution/generation-session.test.cjs` (registered in `all.cjs`) encoding the 15 failure cases from the B05 report (§9), including verification-gate bypass, pack-swap mid-generation, cross-room canon contamination, observer leak, Aurora leak.
NEXT=
Slice 2 — bounded RPG context projection: add an `rpg` section to `compileContextBundle` charged against `remainingTokens` (latest committed beats, last 8 titles, canon facts for active scene, `rpgProjection` diagnostic), read-only per room, never written back (honors `:8317` invariant); include RPG projection tokens in `estimatedSourceTokens` so `requiredContext` reflects reality; canon-aware compaction/summary so history-cap trims don't drop canon facts.
Slice 3 — per-room workspace persistence: `resolveWorkspaceV3({roomId})` prefers persisted per-room workspace from room metadata; RPG engine state snapshots (pack identity/version, world session, canon session, branches, titles, relationships/state, revision/checksum) routed into IndexedDB `roomPersistence` with revision concurrency and canonical backup/import; dirty-state check + confirmation before pack replacement; byte/depth budget before `JSON.parse` of packs.
Slice 4 — canon as constraint system: `resolveContradiction(session, candidate)` beside `scoreInsertion`, returning `{action:'ACCEPT|BLOCK|BRANCH|REPAIR',reason}`; surface via `notice()`; candidate-vs-canon diff with intentional vs accidental branch distinction; per-character grounding context (`buildGroundingContext`) so narrator-only facts are flagged non-shareable.
LATER=
- Full 10-minute vertical slice (RPG-01..RPG-07): continue/new start flow, essential-setup defaults, immediate story, explicit character state, one mutating decision, later narration reflection, leave/re-enter restore.
- Advanced surface (pack import, canon debugging, title management) gated behind debug/advanced controls per contract.
- Mobile/RTL/Android verification: small viewport + Arabic RTL + night theme usable without clipping (RPG-07); installed-device APK gate for RPG persistence.
- Long-session latency: bounded projection, frame budget, tier-based context scaling.
TESTS=
- `release/rpg-session.test.cjs`: per-room scope isolation (Room A generating; Room B stop is a no-op), ABA un-cancel (attempt #2's `stopRequested=false` must not clear #1's flag), shared AbortController identity check (`scope.controller === activeAbortController` before touching shared state), verification-gate bypass (`commitVerifiedBeat({verified:false})`/`applyVerifiedDelta(delta,{verified:false})` return BLOCKED without touching state), pack swap mid-generation (streamed reply must not describe a world swapped out after context snapshot), cross-room canon contamination (load canon in room B, commit beat in room A → A uses A's pack), observer teardown (mount/unmount/remount → `scanCopy` runs once per mount, copy affordances removed only for that room), Aurora leak (room A warning aura cleared on switch), partial-stream retry (regenerateLastReply replaces never appends), persistence gate (blocked while `roomPersistence.status().pending > 0`).
- `evolution/generation-session.test.cjs`: generation session registry CRUD, default-scope backward compat, hub loader slot per-kind map (no orphaned promises), streaming coalescer per-scope pending/frame (no cross-bubble clobber), budget/model mismatch (RPG projection charged against `remainingTokens`, included in `estimatedSourceTokens`).
- E2E/Android: 20-turn scripted scenario continuity (RPG-05), contradiction injection surfaced/blocked/repaired (RPG-06), exit/re-enter state restore (RPG-04), small viewport + Arabic RTL + night theme (RPG-07).
- Adversarial: oversized/adversarial JSON pack (byte/depth budget), duplicate/non-monotonic title numbering, mutable snapshot bypass.
RISKS=
- Security/privacy: RPG state (relationships, character knowledge, branches) contains user-authored narrative; must be included in backup/import/export and secret-exclusion review (no plaintext secrets persisted).
- Android: WebView `AbortSignal` cannot be cloned — boolean stop flag must remain authoritative per scope, never sole cancel mechanism (documented `:8161-8165`); installed-device evidence missing for RPG persistence → UNPROVEN until an executable device/emulator gate runs.
- Performance: unbounded pack `JSON.parse` freezes main thread on mobile; enforce byte/depth budget; `scanCopy` full-chat rescan O(n) per mutation → process only added nodes/debounce.
- Cross-system: RPG shares model routing with A05 and control-runtime with shared lease; per-room scope migration must not break coding/research workspaces; compat-shim drift risk (mirror writes only, reads only from scope, delete mirrors in follow-up slice with static-audit assertion).
- RTL/Arabic: RPG drawer/grid/title layout must not clip in RTL; current CSS lacks RTL-specific rules for `.seven-rpg-drawer-grid` and title inputs.
FIRST_SLICE=
Slice 1 (above): per-room generation session scope + per-room RPG state namespacing + 2 new test suites + 15 failure-case tests. Smallest change that materially improves the domain by fixing stop/cancel bleed, cross-room canon contamination, and giving RPG a testable boundary.
KNOWN_UNKNOWNS=
- Whether upstream (non-release) builds route chat through another memory layer — no such code found in `release/`.
- Exact APK/runtime manifestation of per-room scope changes on Android WebView (no device/emulator evidence yet).
- Whether `SevenGeneratedUI` mount into RPG workspace root destroys RPG chrome (mount clears container unconditionally; no RPG binding exists).
- Whether any consumer besides `rpg.js` reads `buildSceneContract`/`canCharacterKnow` (structural leak analysis only, not behavioral).
DOMAIN_VERDICT=READY_FOR_PLAN


# D07_RESEARCH_WEB — Web Research / Retrieval / Citations / Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D07_RESEARCH_WEB
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D08_MODEL_ROUTING — Model Routing / Provider Health / Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D08_MODEL_ROUTING
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: INSUFFICIENT

DOMAIN_ID=D09_DEEP_THINK
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: INSUFFICIENT

DOMAIN_ID=D10_FILES_MULTIMODAL
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D11_ANDROID_NATIVE — Android / APK / Lifecycle / IME / Back / Insets

Research audit: INSUFFICIENT

DOMAIN_ID=D11_ANDROID_NATIVE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: INSUFFICIENT

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: INSUFFICIENT

DOMAIN_ID=D13_ARABIC_RTL_A11Y
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D14_SECURITY_PRIVACY — Security / Credentials / Privacy / Agent Boundaries

Research audit: INSUFFICIENT

DOMAIN_ID=D14_SECURITY_PRIVACY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D15_PERSISTENCE_RECOVERY — Persistence / Migration / Corruption / Recovery

Research audit: INSUFFICIENT

DOMAIN_ID=D15_PERSISTENCE_RECOVERY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D16_NETWORK_RESILIENCE — Network / Retry / Offline / Streaming Resilience

Research audit: INSUFFICIENT

DOMAIN_ID=D16_NETWORK_RESILIENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D17_PERFORMANCE_CONCURRENCY — Performance / Concurrency / Long Chat / Races

Research audit: INSUFFICIENT

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D18_TESTING_EVALS — Testing / Evals / Mutation / Visual / Release Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D18_TESTING_EVALS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D19_AGENT_ORCHESTRATION — Multi-Agent Team / Manager / Strike Teams / Calibration

Research audit: INSUFFICIENT

DOMAIN_ID=D19_AGENT_ORCHESTRATION
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: INSUFFICIENT

DOMAIN_ID=D20_PRODUCT_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D21_OBSERVABILITY_WORLD_MODEL — Observability / Engineering World Model / Blast Radius

Research audit: INSUFFICIENT

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D22_PROTOCOLS_INTEROP — MCP / Agent Protocols / Tool Interoperability

Research audit: INSUFFICIENT

DOMAIN_ID=D22_PROTOCOLS_INTEROP
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: INSUFFICIENT

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D24_RELEASE_APK
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D25_HISTORY_ROOMS — Conversation History / Room Lifecycle / Search / Archive

Research audit: READY

DOMAIN_ID=D25_HISTORY_ROOMS
SOURCE_ANALYSIS=MDN IndexedDB API [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API describes low-level client-side storage of significant structured data including files/blobs, indexes for high-performance searches, better than Web Storage for larger structured data. React.dev Preserving and Resetting State [SOURCE primary] https://react.dev/learn/preserving-and-resetting-state describes preserving/resetting UI state. Harvest polluted by CSS/font assets; only two substantive primary sources. Limitations: IndexedDB source doesn't cover room lifecycle semantics (archive/search/rename), concurrency beyond basic transactions, or migration/versioning strategy — those are product decisions. No disagreements; stable specs.
CURRENT=`remake/src/storage/room-repository.ts` `IndexedDbRoomRepository` implements `get/put/list/delete` over IndexedDB `rooms` store (keyPath `id`), abort-aware via `withSignal`/`request`/`transaction` wrappers, structured `STORAGE` errors (blocked upgrade retryable, incompatible schema, missing store, corrupted stored rooms, transaction aborted), retry on blocked upgrade after blocker closes (tested), cached `dbPromise` invalidated on versionchange/close, frozen/cloned returns, list sorted by `updatedAt desc` then id. `remake/src/domain/chat/index.ts` `Room` aggregate: id, title, modelId, messages, createdAt/updatedAt, schemaVersion 1, strict validation (monotonic message timestamps, no dup ids, canonical strings). `createRoom`/`commitMessage`/`withRoomModel`/`cloneRoom`. `remake/src/storage/memory-repository.ts` `InMemoryMemoryRepository` for memory records + summaries with `compareAndSwapSummary`, limits, atomic-ish put. `remake/src/storage/context-policy-repository.ts` IndexedDB context policy store. No search index, no archive flag, no room rename, no import/export, no tombstone/soft-delete, no room list pagination, no persistence of composer draft/attachments/scroll per room. `IndexedDbRoomRepository` has no `search`/`archive`/`rename` methods. No import/export/backup for rooms (D23 adjacent). `remake/src/application/chat/chat-service.ts` owns per-room task exclusivity but no room lifecycle service exists. Bughunt B01-005 flags room-switch state loss as NEEDS_RUNTIME_TEST; MBR-005 flags IndexedDB startup/upgrade failure leaving document inert; MBR-009 flags RPG persistence boundary lacking (adjacent). Master Bug Report repair order places persistence/control integrity (MBR-004→MBR-013) early.
TARGET=Room lifecycle is durable and searchable: rooms persist across reload (IndexedDB), list is recency-ordered and searchable by title/content, archive/delete are idempotent with soft-delete tombstones and restore, rename supported, per-room draft/attachment/scroll state persists and restores on switch/return, import/export/backup of rooms (D23 coordination), migration protocol read→validate→write temp→verify→commit→delete old with recoverable previous version (ARCHITECTURE §5), storage failure degrades to interactive recovery screen (not inert document), recovery bounded with redaction. Rooms remain immutable aggregates; messages immutable once committed.
NOW=First high-value slice: (1) Add `archive(roomId)`/`restore(roomId)` with soft-delete tombstone + idempotent delete to `IndexedDbRoomRepository` and `RoomRepository` interface, unit tested. (2) Add full-text-ish search over room titles + recent message content via `search(query)` returning recency-ranked rooms, unit tested. (3) Add per-room draft persistence keyed by roomId (not global) and restore-on-return, integrated with chat-service send lifecycle. (4) Add storage failure recovery test proving IndexedDB blocked/incompatible/corrupt paths fail closed with structured errors and do not leave app inert. These map to B01-005 and MBR-005.
NEXT=Room rename, pagination for room list, tombstone expiry/permanent delete, import/export/backup of rooms (coordinate D23), migration protocol implementation with versioning, search ranking/tagging, deleted-room retention policy, cross-device sync placeholder.
LATER=Shared rooms/collaboration, room folders/workspaces, message-level search within a room, search across all rooms with highlights, archived-room auto-expire, storage quota handling.
TESTS=Unit: room-repository archive/restore/search/idempotent delete/frozen clones/corrupt-fail-closed (vitest + fake-indexeddb); migration atomicity (read→validate→write temp→verify→commit→delete old, failure leaves previous recoverable); draft persist/restore per room; storage failure → recovery screen (not inert). Contract: `RoomRepository` interface compliance for both in-memory and IndexedDB implementations. Android: IndexedDB persistence in WebView across app kill/restore (device/emulator), SAF/document URI not in this domain (D11). E2E: archive→list excludes archived→restore→reappears; search returns matching room; switch rooms preserves draft; reload restores rooms. Adversarial: concurrent writes across repo instances (serialized, exists — extend), blocked upgrade retry, incompatible store fails closed, pre-aborted signal rejects before opening storage, corrupted stored room fails closed, oversized content rejected.
RISKS=Security/privacy: archived rooms must still be indexed/accessible for restore; tombstones must not leak message content in logs/diagnostics (diagnostics already redacts tokens/secrets/prompt/content). Performance: unbounded room list grows memory; pagination needed later. IndexedDB blocked-upgrade can reject operations — retryable handling exists but must be tested under concurrent schema versions. Android WebView IndexedDB persistence/quota behavior is UNPROVEN without device evidence. Cross-system: draft persistence overlaps chat-service (B01 owns D01) — coordinate lease on shared storage files. RTL: room titles in Arabic sort/display correctly (locale collation not guaranteed by simple compareText).
FIRST_SLICE=Archive/restore + search + per-room draft persist/restore + storage-failure-recovery tests; each unit tested; no new runtime owners.
KNOWN_UNKNOWNS=Android WebView IndexedDB quota/persistence across app kill not proven (needs emulator/device). Search ranking quality (title vs content weighting) unproven. Import/export format/schema not defined (D23 dependent). Tombstone retention policy not defined. Per-room draft persistence not yet wired to composer (composer UI doesn't exist yet in remake).
DOMAIN_VERDICT=READY_FOR_PLAN


# D26_SETTINGS_CONTROLS — Settings / Model Controls / Progressive Disclosure

Research audit: INSUFFICIENT

DOMAIN_ID=D26_SETTINGS_CONTROLS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D27_ERROR_RECOVERY_UX — Errors / Loading / Empty / Recovery UX

Research audit: INSUFFICIENT

DOMAIN_ID=D27_ERROR_RECOVERY_UX
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D29_REAL_WORKS_CANON — Real Works / Source Fidelity / Canon Branching

Research audit: INSUFFICIENT

DOMAIN_ID=D29_REAL_WORKS_CANON
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D30_AUTONOMOUS_QUALITY — Reality Lab / Evolution Arena / Constitution / Proof / Meta-Team

Research audit: INSUFFICIENT

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.

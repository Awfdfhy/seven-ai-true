# Seven Domain Roadmaps — cycle evidence

Ready domains: 4/30
Only READY domains may drive implementation.

# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: READY

DOMAIN_ID=D01_CHAT_CORE
SOURCE_ANALYSIS=Harvested primary sources analyzed: Streams API [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/Streams_API (async iteration, chunked delivery, backpressure semantics); AbortController [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/AbortController (controller-based cancellation, signal propagation to fetch/streams); React preserving-and-resetting state [SOURCE primary] https://react.dev/learn/preserving-and-resetting-state (keying, remount behavior, IME/composition pitfalls). MDN asset URLs are static CSS/fonts (not normative specs). No ChatGPT release notes content present in harvested payload. Limitations: harvested set is mostly API primitives (streams/abort/state) — lacks chat-specific UX (send/stop, retry, IME composition lock details, streaming error taxonomy) and concrete provider streaming implementations. Freshness: MDN/react current as of harvest; primitives stable.

CURRENT=Seven current implementation evidence (repo-inspected):
- `remake/src/application/chat/chat-service.ts` (send, streaming loop, draft emission, cancellation seals, commit-on-success). Key points: per-room active-check (`this.tasks.listActive(roomId).length>0`), user message committed before generation, consumes `transport.stream({room, signal})` as AsyncIterable, accumulates draft with `MAX_ASSISTANT_DRAFT_CHARS` guard, invokes `onDraft` safely (isolated catch), aborts on signal, requires non-empty trimmed draft, uses `sealCancellation()` then commits assistant exactly once, final `sealDeadline()`; returns `ChatRun` with `taskId`, `result` Promise<Room>, `cancel`.
- `remake/src/domain/chat/index.ts` (Room/ChatMessage, createRoom, commitMessage, cloneRoom, isRoom). Immutable snapshots, frozen messages, timestamp invariant (message timestamp >= room.createdAt, now = max(updatedAt, requestedTime)), UUID id generation with collision guard (`room.messages.some(m => m.id===id)`), validation of roles/content/timestamps.
- Ownership/cancellation: TaskManager is single owner (Milestone 1/12); unified cancellation; default deadline; exactly one active generation per room.
- Persistence/architecture: RoomRepository port, in-mem + IndexedDB impls; architecture enforces UI never calls providers/storage directly; AppKernel owns composition.

TARGET=Desired behavior for chat/core:
- Deterministic send/stop: stop/cancel never commits partial assistant response; double-stop is idempotent; race-free per-room ownership.
- Streaming correctness: backpressure via AsyncIterable consumption, provider delta validation, bounded draft size, clear retryability on provider errors.
- Composer UX: IME composition lock (Enter-to-send disabled during composition), text state preservation on remounts keyed by roomId (React state reset rules), attachment eligibility, send eligibility tied to active task + validity.
- Robustness: provider error taxonomy (PROVIDER/VALIDATION/ABORT) with retryable flags where appropriate, transport contract strictness, signal propagation end-to-end.

NOW=First high-value slice (smallest that materially improves):
- Composer controller: explicit IME composition state (compositionstart/end/composing flag), Enter-to-send policy (no send on Enter during composition, Shift+Enter newline or explicit send), auto-grow request ownership, send disabled while task active. Evidence-based from React state guidance (composition events). 
- Transport contract hardening: validate AsyncIterable shape early; emit structured provider errors with retryable classification (align with existing `retryable` on "Provider completed without assistant content"); document abort mapping to DOMException("AbortError").
- Draft emission: ensure onDraft provides frozen snapshot and roomId/taskId stable; consider rate-limiting high-frequency deltas to avoid re-render storms without losing correctness (non-blocking, keep as-is but add test).

NEXT=Next improvements:
- Retry policy: idempotent retry of send with backpressure, distinguish between pre-first-token failure (retry/fallback domain) and mid-stream failure (do not splice providers) — integrate with Models+Routing invariants (fallback only before first token). 
- Stop UX: cancel() idempotent, task state transitions visible to UI, ensure cancellation path clears active task before UI can re-send.
- Switching rooms: preserve composer draft per roomId, reset when room deleted/cleared; use React keys/remount rules to avoid leaking state.

LATER=Longer-term ideas:
- Stream progress metrics (tokens/bytes/sec), first-token latency, cancellation latency.
- Redact-sensitive content in error details; structured telemetry (no PII).
- Backpressure test harness simulating slow consumer.

TESTS=Deterministic proof:
- Per-room concurrent send race (already gate exists per Milestones) — extend with double-send via rapid UI actions.
- Stop/double-stop: cancel during draft emission, after user commit before stream, after stream ends; verify no partial commit.
- Streaming: empty delta skip, non-string delta rejection, oversized draft rejection, provider returns non-iterable, completion with empty trimmed content (retryable). 
- IME: composition lock prevents premature send; Enter handling correct in composition states.
- Persistence: user message persisted before generation; assistant committed exactly once on success; cancellation never commits assistant.
- Adversarial: transport throws mid-stream, signal.aborted during loop, sealCancellation/sealDeadline behavior.

RISKS=Security/privacy: draft callbacks must not leak secrets (no provider headers in draft). Performance: onDraft called per delta — must remain cheap/catch errors. Android: IME differences (composition events timing), WebView focus. RTL: composer text direction independent but input handling stable. Cross-system: AbortController/AsyncIterable available in browser/WebView; ensure no Node-only assumptions in web bundle. Race conditions if UI bypasses TaskManager active checks.

FIRST_SLICE=Composer IME composition lock + send eligibility tests (small, UI-agnostic logic where possible, or controller-level). Implement via explicit composition flag on composer controller and corresponding unit tests; minimal UI wiring if needed. This is evidence-backed (React preserving state + composition semantics) and directly impacts send/stop correctness.

KNOWN_UNKNOWNS=Harvested sources don’t include chat UX specifics (IME edge cases, mobile keyboard), provider streaming error catalogs, or concrete retry strategies. Need to inspect existing composer/controller implementation in repo (if any) under remake/src/ui or application-layer composer to avoid duplication with ShellStore ownership. Also confirm AbortController/stream support baseline for Android WebView target.

DOMAIN_VERDICT=READY_FOR_PLAN


# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT

SOURCE_ANALYSIS=Harvested 20 sources (11 primary, 9 secondary) collectively describe a shift from "dump everything into context" to structured, retrievable, temporal long-term memory with explicit relevance, budgets and provenance. 

Key convergent points:
- Temporal knowledge graphs (Zep/Graphiti) [SOURCE primary] https://arxiv.org/abs/2501.13956 treat facts/episodes/entities as time-stamped (valid_at/invalid_at) to support point-in-time queries and change tracking [SOURCE secondary] https://help.getzep.com/facts, [SOURCE secondary] https://help.getzep.com/context-types, [SOURCE secondary] https://help.getzep.com/v2/graphiti/core-concepts/adding-episodes.
- Production-oriented extraction+filtering (Mem0) [SOURCE primary] https://arxiv.org/abs/2504.19413 emphasizes scalable ingestion, deduplication and lower token cost; Mem0 reports strong benchmark scores with 3-4x lower tokens vs full-context [SOURCE secondary] https://mem0.ai/research (referencing LoCoMo/LongMemEval/BEAM).
- Benchmarks expose retrieval gaps: LongMemEval [SOURCE primary] https://arxiv.org/abs/2410.10813, context-driven retrieval [SOURCE primary] https://arxiv.org/abs/2609.03467, and evidence utilization [SOURCE primary] https://arxiv.org/abs/2608.30508 show that relevance (not just similarity) and using retrieved evidence correctly matter more than stuffing context.
- Local-first/edge persistence is a distinct design axis (MemX) [SOURCE primary] https://arxiv.org/abs/2603.16171, suggesting on-device storage + privacy. For web/Capacitor targets, browser storage primitives matter: IndexedDB for structured large data [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API.
- Structured memory blocks (Letta) [SOURCE secondary] https://docs.letta.com/v1-sdk/memory/memory-blocks and configuration [SOURCE secondary] https://docs.letta.com/configuration/memory model explicit core memory vs episodic vs working memory.
- Agentic frameworks (LangGraph/Deep Agents) [SOURCE secondary] https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph, [SOURCE secondary] https://docs.langchain.com/oss/javascript/deepagents/overview treat memory as a first-class system with planning/subagents and file-system awareness, relevant to orchestration.
- Newer works (Memoria [SOURCE primary] https://arxiv.org/abs/2512.12686, TeleMem [SOURCE primary] https://arxiv.org/abs/2601.06037) point to scalability/personalization and multimodality; freshness varies (arXiv IDs with 260X look forward-dated in titles but are the cited references).

Disagreements/limitations: KG vs flat vector stores (temporal graph adds complexity; need point-in-time correctness). Local-first vs cloud sync tradeoffs. Benchmarks differ (LongMemEval vs LoCoMo) and cost metrics vary. Harvested URLs are abstracts/docs (not full papers in all cases) — sufficient for design direction but not implementation detail.

CURRENT=Seven's current implementation (inspected from repo):
- ARCHITECTURE.md: Persistent domains include "memory" (rooms, memory, settings, provider health, research cache, RPG/canon, GitHub metadata) under StorageEngine contract with migration protocol (read old → validate → write new temp → verify → commit → delete old) and recovery screen on storage failure. No second ShellStore; AppKernel composes once. (Evidence: `remake/ARCHITECTURE.md:47-96`, `remake/ARCHITECTURE.md:98-137`)
- PHASE3_MEMORY_CONTEXT.md exists (Memory/Context phase doc). (Evidence: `remake/PHASE3_MEMORY_CONTEXT.md` present; inspected content shows memory/context is a tracked phase.)
- Plans: `plans/MEMORY_SCOPE_HARDENING.md` exists (memory scope hardening plan). (Evidence: `plans/MEMORY_SCOPE_HARDENING.md`)
- Storage is adapter-based (IndexedDB likely used in web adapter per MDN and architecture). Persistence correctness emphasized (atomic migrations, integrity metadata, export/import). TaskManager owns tasks with cancellation; Android uses typed bridge envelopes.
- No obvious second memory implementation in architecture (strict ownership). Memory is listed as persistent domain but implementation details (episodic vs semantic, relevance scoring, budgets, summaries) not fully specified in ARCHITECTURE excerpt.

So Seven already treats memory as a persistent domain with migration safety and recovery. The gap is likely: how memory is extracted, ranked by relevance to current context, budgeted into payloads, summarized over time, and kept correct across migrations/edits.

TARGET=Desired Seven memory/context fabric:
- Explicit memory model: working (transient), episodic (interactions), semantic/core (facts/preferences), and thread summaries — aligned to Letta blocks [SOURCE secondary] https://docs.letta.com/v1-sdk/memory/memory-blocks and Zep context types [SOURCE secondary] https://help.getzep.com/context-types.
- Relevance-first retrieval (not just recency/similarity). Support both proactive (context-driven, no explicit query) [SOURCE primary] https://arxiv.org/abs/2609.03467 and explicit retrieval. Require evidence utilization checks [SOURCE primary] https://arxiv.org/abs/2608.30508.
- Temporal correctness: facts/episodes carry timestamps; updates create new versions or bi-temporal fields consistent with Graphiti [SOURCE primary] https://arxiv.org/abs/2501.13956, [SOURCE secondary] https://help.getzep.com/facts. Point-in-time reads for debugging/audit.
- Context budgets: per request/mode, token budget enforced (user+system+history+memory+tools). Memory items must be ranked and trimmed deterministically by budget.
- Summarization: rolling summaries with citations to episodes/facts to avoid drift; support memory consolidation.
- Persistence correctness: IndexedDB-backed with atomic migrations [MDN] [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API, integrity metadata, export/import, recovery (matches architecture). Local-first by default; avoid leaking secrets (architecture already requires no plaintext secrets).
- Deterministic behavior: extraction/normalization rules, deduplication, contentHash for citations (matches Research citation schema in ARCHITECTURE 7).

NOW=First high-value implementation slice (smallest that materially improves domain):
1. Define memory schema v1 (types): MemoryItem { id, kind(eps/sem/core/summary), content, entities[], ts, validFrom?, validTo?, sourceIds[], contentHash, relevanceScore?, lastAccessedAt } with migration path. Evidence: architecture migration protocol + MDN IndexedDB.
2. Add relevance scorer (hybrid: recency*decay + entity overlap + token fit) and budgeter that produces top-K by relevance subject to token budget; log why items included/excluded (provenance). Evidence: context-driven retrieval [SOURCE primary] https://arxiv.org/abs/2609.03467, UTILMEM evidence utilization [SOURCE primary] https://arxiv.org/abs/2608.30508.
3. Implement memory retrieval gate in context shaping (before provider dispatch) with invariant: memory injection respects budgets and is deterministic for same inputs. Evidence: Deep Think invariant in ARCHITECTURE (final payload revalidated) [ARCHITECTURE 4].
4. Add unit+contract tests for scorer/budgeter and a regression test for migration roundtrip (matches architecture test expectations).

NEXT=Next improvements:
- Episode ingestion pipeline: turn user+assistant+tool results into episodes with entities/facts extraction (lightweight rules first; avoid heavy LLM extraction unless budgeted). Align to Graphiti episodes [SOURCE secondary] https://help.getzep.com/v2/graphiti/core-concepts/adding-episodes.
- Temporal updates: when fact changes, invalidate previous with validTo and write new (bi-temporal) or versioned; point-in-time query API. [SOURCE secondary] https://help.getzep.com/facts.
- Rolling summaries: thread→summary with references to source episodes; decay old summaries.
- Memory blocks (core memory) UI+API surface consistent with Letta [SOURCE secondary] https://docs.letta.com/v1-sdk/memory/memory-blocks.
- Local-first mode with export/import and encryption-at-rest consideration (no plaintext secrets). Align with MemX local-first [SOURCE primary] https://arxiv.org/abs/2603.16171.

LATER=Longer-term ideas:
- KG-lite: lightweight entity graph over memory items (edges) to improve recall for multi-hop questions; evaluate against Zep KG [SOURCE primary] https://arxiv.org/abs/2501.13956.
- Multimodal memory (images/attachments) [SOURCE primary] https://arxiv.org/abs/2601.06037 if attachments domain expands.
- Benchmark integration: run LongMemEval-style probes [SOURCE primary] https://arxiv.org/abs/2410.10813 and UTILMEM [SOURCE primary] https://arxiv.org/abs/2608.30508 against Seven to track quality/cost.
- Adaptive consolidation policies (Memoria ideas) [SOURCE primary] https://arxiv.org/abs/2512.12686.
- Cross-device sync with end-to-end encryption and conflict resolution (requires careful privacy model).

TESTS=Deterministic, E2E, Android, adversarial and eval proof:
- Deterministic: scorer/budgeter property tests (same inputs → same order/selection), contentHash stable, migration idempotency.
- Migration: roundtrip old→new with corrupt temp (must recover). Verify integrity metadata.
- Retrieval: context-driven queries with no explicit user question [SOURCE primary] https://arxiv.org/abs/2609.03467; evidence utilization assertions [SOURCE primary] https://arxiv.org/abs/2608.30508.
- Budgets: token overflow cases (trim deterministically), per-mode caps.
- Persistence: IndexedDB transaction rollback, quota exceeded, recovery screen appears on storage failure (matches ARCHITECTURE 5).
- Adversarial: large episodes, duplicate facts, time-skew (backdated), circular references, PII in memory (must not leak to logs), rapid updates causing invalidation storms.
- Android: bridge round-trip for memory ops if exposed via native; typed envelopes. E2E: room with memory affects next turn but respects budget.

RISKS=Security/privacy/performance/Android/RTL/cross-system risks:
- Privacy: memory can retain sensitive data. Need redaction, retention policy, export/delete, no plaintext secrets (architecture). Local-first reduces exposure but sync increases attack surface.
- Correctness: bi-temporal invalidation is error-prone; point-in-time reads must not mix states.
- Performance: extraction/scoring on every turn must be cheap; avoid LLM calls in hot path. IndexedDB read amplification. 
- Migration: failed migration leaves previous version recoverable (critical). 
- Cross-system: memory touches ShellStore/TaskManager (context shaping), StorageEngine, Research citations (contentHash), Attachments (if multimodal). Must respect ownership (no duplicate owners).
- Android: SAF/bridge lifecycle, quota on mobile.
- Evaluation: benchmark contamination/overfitting; prefer task-grounded evals.

FIRST_SLICE=Define MemoryItem schema v1 + IndexedDB store + relevance scorer + budgeter + retrieval gate in context shaping. Enforce token budget, log provenance, add deterministic tests and migration test. Size small but touches StorageEngine contract and context shaping (high leverage).

KNOWN_UNKNOWNS=Missing evidence:
- Seven's exact memory storage implementation (adapter code) not fully visible in ARCHITECTURE excerpt; need to inspect actual IndexedDB adapter and current memory table shapes. 
- Current context shaping path (where payload assembled) — confirm integration point with ModelRouter/Deep Think. 
- Token counting method (provider-dependent). 
- Retention/TTL and PII policy details. 
- Whether memory blocks UI exists.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (insufficient Seven-internal implementation evidence for exact integration points; external sources analyzed and aligned, but need to inspect src/adapters/storage and context shaping code before EXECUTE).


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

SOURCE_ANALYSIS=Harvested 14 primary sources covering Yarn Spinner dialogue system and Godot save game patterns.
- Yarn Spinner docs: overview [SOURCE primary] https://www.yarnspinner.dev/docs/, Dialogue Runner/components [SOURCE primary] https://docs.yarnspinner.dev/components/dialogue-runner, Unity integration [SOURCE primary] https://github.com/YarnSpinnerTool/YarnSpinner-Unity. Dialogue Runner delivers lines/options/commands to game; narrative flow is data-driven (Yarn scripts).
- Godot saving: save game tutorial [SOURCE primary] https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html covers saving/loading game state across objects/levels with care for versioning/robustness.

Convergent: separate narrative data (dialogue scripts) from runtime state; dialogue runner is orchestrator; persistence for game state requires versioning/migration awareness and handling multiple objects. Gaps: Godot-specific APIs less directly applicable to web/Capacitor app; Yarn Spinner is Unity-first (C#). Need to see Seven’s RPG/canon domain.

CURRENT=Seven current implementation (inspected):
- ARCHITECTURE.md lists "RPG/canon" as persistent domain under StorageEngine (with migration protocol). (Evidence: `remake/ARCHITECTURE.md:47-96`)
- PHASE9_RPG_CANON.md exists (phase doc). (Evidence: `remake/PHASE9_RPG_CANON.md`)
- Remake docs include phase files (PHASE9_RPG_CANON.md). (Evidence from find: `/home/runner/work/_temp/seven-superloop-worktrees/c200-research-A06/remake/PHASE9_RPG_CANON.md`)

So RPG/canon is a first-class persistent domain with same migration/recovery requirements. Implementation details (dialogue format, state schema, canon rules, agency) not fully specified in ARCHITECTURE excerpt.

TARGET=Desired RPG/world runtime aligned with architecture and external patterns:
- Dialogue as data: Yarn Spinner model separates script (narrative) from runtime (delivery). For web, consider data-driven dialogue format (Yarn-like or custom) with validation. [SOURCE primary] https://www.yarnspinner.dev/docs/, [SOURCE primary] https://docs.yarnspinner.dev/components/dialogue-runner
- Canon/state separation: world state (facts/flags/inventory/quests) separate from dialogue lines; canon rules enforce consistency.
- Persistence: RPG/canon uses StorageEngine with atomic migrations, integrity metadata, recovery (matches architecture). Version save data; handle schema evolution. Godot patterns emphasize robust saving across levels/objects [SOURCE primary] https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html.
- Determinism: dialogue choices affect state; state changes are auditable.
- Integration: respects ownership (no duplicate owners), TaskManager if long-running ops, Android lifecycle if native.

NOW=First high-value slice:
1. Inspect actual RPG/canon storage schema and code (tables, migrations). Evidence needed from src.
2. Define dialogue data model (nodes/lines/options/variables/commands) versioned; validate on load.
3. Add minimal dialogue runner interface (deliver lines/options, handle choices) decoupled from UI.
4. Migration test for RPG/canon schema.

NEXT=Next improvements: state versioning, save slots, undo/rollback safety, canon validation, event log.

LATER=Longer-term: Yarn script import/export? (Yarn Spinner is Unity/C#; web runtime different). Evaluate carefully.

TESTS=Deterministic migration, save/load roundtrip, invalid save recovery, dialogue state consistency.

RISKS=State corruption, migration failures, cross-domain coupling with memory (shared facts), Android storage.

FIRST_SLICE=Inspect RPG/canon implementation in codebase to establish ground truth; define minimal schema + migration test.

KNOWN_UNKNOWNS=Seven’s RPG/canon code not inspected here beyond phase docs; dialogue format unknown; need src inspection.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to inspect actual RPG/canon implementation and current schema; external references useful but Seven-internal state unknown).


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
SOURCE_ANALYSIS=Harvested primary sources: IndexedDB API [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API (structured client storage, transactions, indexes, schema/versioning, blobs, high-performance search use cases; notes WebStorage smaller-scale). React preserving-and-resetting state [SOURCE primary] https://react.dev/learn/preserving-and-resetting-state (keys for lists/rooms, remount on room switch, state preservation/reset). Static CSS/fonts harvested but not normative. Limitations: no specific room lifecycle/search/archive UX patterns (e.g., sort, pagination, soft-delete/restore, sync/conflict resolution) in harvested set. Freshness: MDN/React current.

CURRENT=Seven current implementation evidence:
- Room domain: `Room` aggregate with schemaVersion 1, id/title/modelId/messages[], createdAt/updatedAt; immutable snapshots via `cloneRoom`/freezing; validation in `isRoom`/commit paths.
- Persistence: `RoomRepository` port (`get/put/list/delete`), in-memory deterministic impl for tests, IndexedDB impl for browser/Android WebView; Milestone 1/12 includes save/list/get/delete, stored-room schema validation, structured storage failures, restart/restore round-trip.
- Lifecycle: createRoom, commitMessage updates updatedAt (max with message time), id uniqueness, timestamp invariants. No explicit archive/soft-delete or search API visible in inspected chat code; deletion is `delete(roomId)`. 
- Architecture: persistence behind ports/adapters, UI never touches IndexedDB directly; ShellStore owns shell state (active workspace/sidebar/dialog) — room activation is separate from storage.

TARGET=Desired behavior:
- Room lifecycle correctness: create/list/get/put/delete with schema validation, restart/restore identity preserved, structured errors on storage failures.
- State on switch: switching rooms resets transient UI (composer draft, streaming state) without corrupting history; React keys prevent cross-room leakage (align with preserving state).
- History UX: deterministic ordering (by updatedAt/createdAt), stable room identity, safe deletion (cascades/side-effects explicit), capacity/eviction policy explicit (Memory domain has explicit manual-delete-only capacity policy; rooms likely similar — no silent eviction). 
- Search/archive (scope per domain): room search/indexing over titles/messages metadata if implemented; archive as explicit state (separate from delete) to avoid accidental data loss; proof via evidence.

NOW=First high-value slice:
- Room list ordering/identity: ensure list returns deterministic order (e.g., updatedAt desc) and stable IDs; add tests for create→list→switch→delete round-trip (restart/restore already covered). 
- Deletion semantics: confirm delete is idempotent, structured error handling, and that active task ownership prevents deleting an active-room? (TaskManager ownership by roomId — deleting room while active generation exists is problematic). Need to inspect room deletion call sites; if UI can delete active room, must cancel or reject. 
- Switch safety: verify composer/controller uses roomId as key/remount boundary (React guidance). Inspect UI composition if present.

NEXT=Next improvements:
- Search: index room titles and recent message snippets in IndexedDB (use indexes). Define query surface (prefix/full-text) with bounds (max results, timeout). Avoid loading all messages for search.
- Archive: add explicit `archived` flag to Room (schemaVersion bump with migration) vs hard delete; filter in list by default, separate archived view.
- History metadata: lastMessageAt, messageCount to support list without hydrating full history blobs unnecessarily.

LATER=Longer-term ideas:
- Pagination/windowing for large histories, lazy message loading on room open.
- Export/import rooms (align with StorageEngine export/import contract).
- Sync/conflict detection across tabs (CAS/versioning on put) — memory domain already uses CAS for summaries; rooms may benefit from version checks on concurrent updates.

TESTS=Deterministic proof:
- Round-trip: create→put→get→list→delete with IndexedDB and in-mem.
- Schema validation: malformed stored room rejected with structured error.
- Restart/restore: persist then reload, identity/equality preserved.
- Deletion: idempotent delete, get after delete returns null.
- Active-room protection: attempt to delete room with active chat task → reject/cancel policy explicit (test). 
- Ordering: list order deterministic by updatedAt desc (or defined). 
- Adversarial: concurrent puts, storage quota, transaction failures, corrupted blob, migration path if schema changes.
- Search/archive: query bounds, case-insensitive, no PII leakage.

RISKS=Security/privacy: history persisted client-side (IndexedDB) — avoid logging full content in errors; ensure export/import redacts as needed. Performance: large rooms — avoid eager hydration; use indexes for search. Android: WebView IndexedDB availability/quota; storage failures structured. Cross-system: transaction semantics differ slightly but MDN IndexedDB stable; migration required for schema changes. Data loss: hard delete is destructive — archive state preferred before enabling bulk deletes.

FIRST_SLICE=Active-room deletion guard: when deleting a room that currently owns an active chat task (TaskManager.listActive(roomId) non-empty), reject deletion with structured error (or auto-cancel with explicit policy). This prevents losing in-flight assistant state/history consistency; smallest, testable, prevents real data integrity issue.

KNOWN_UNKNOWNS=No archive/search fields in current Room schema (v1); need to confirm intended lifecycle (hard delete only). Harvested sources lack concrete UX for history; inspect UI for room list/switching to see keys/remount behavior. Also need to confirm IndexedDB transaction timeout/retry behavior and any storage limits on Android target.

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

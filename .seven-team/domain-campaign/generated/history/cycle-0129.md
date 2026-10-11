# Seven Domain Roadmaps — cycle evidence

Ready domains: 1/30
Only READY domains may drive implementation.

# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: INSUFFICIENT

DOMAIN_ID=D01_CHAT_CORE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT

SOURCE_ANALYSIS=Harvested corpus (20 sources, primary=11) converges on: (1) production memory must separate working context from long-term store (Mem0 [2504.19413] [SOURCE primary], Memoria [2512.12686] [SOURCE primary], Letta memory blocks [https://docs.letta.com/v1-sdk/memory/memory-blocks] [SOURCE secondary]); (2) temporal/relational graphs capture change over time (Zep Graphiti [2501.13956] [SOURCE primary], facts/episodes/context-types [https://help.getzep.com/facts], [https://help.getzep.com/v2/graphiti/core-concepts/adding-episodes], [https://help.getzep.com/context-types] [SOURCE secondary]); (3) local-first persistence with offline resilience (MemX [2603.16171] [SOURCE primary], IndexedDB [https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API] [SOURCE primary]); (4) benchmarks demand evidence utilization and context-driven retrieval (LongMemEval [2410.10813], context-driven [2609.03467], UTILMEM [2608.30508], Mem0 research LoCoMo/LongMemEval [https://mem0.ai/research] [SOURCE primary/secondary]); (5) multimodality emerging (TeleMem [2601.06037] [SOURCE primary]). Disagreements: flat key-value+summaries vs bi-temporal KG; “memory blocks” (structured) vs episode+facts. Freshness: arXiv IDs suggest recent (2024–2026 style) — treat as research specs, not SDK truth. Limitations: many are platform/agent frameworks (LangGraph/DeepAgents [https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph], [https://docs.langchain.com/oss/javascript/deepagents/overview] [SOURCE secondary]) — useful patterns but not Seven architecture. No single source covers browser/Android WebView quotas, cancellation semantics, or “exactly one leading system message + rebuild on fallback” invariant. Must label claims as research-informed.

CURRENT=Repo evidence: `remake/PHASE3_MEMORY_CONTEXT.md` [inspected] defines Phase 3A–3C with non-negotiable invariants: exactly one leading system message; context shaping never mutates committed room history; newest user turn never silently dropped; deterministic input-token budget; fallback rebuilds context for fallback model window; memory/summary versioned, validated, persistable; summary durable before use; cancellation propagated; no unbounded collection; malformed records fail with structured SevenError. Durable memory: global+room-scoped, priority 0–100, in-mem + IndexedDB, per-room summary, restart/restore. Context shaping: TokenEstimator, conservative estimator, output reserve, memory/summary budgets, recent-history retention, high-priority/relevant selection, summary merged into leading system message, payload validation. Summarization: ContextSummarizer port, incremental room summary, summary-through-message identity, rebuild after durable write, cancellation-safe. Acceptance path: room+durable memory → budget → summarize prefix → persist → rebuild → provider payload → fallback rebuild → restart/restore. This matches local-first (IndexedDB) and strict determinism; evidence level: documented invariants + phases (repo truth). Missing from this spec: concrete relevance scoring (semantic/graph), eviction/ageing, memory-block schema vs graph facts, bi-temporal validity, migration/versioning tests, Android WebView storage quotas/eviction, and retrieval proofs tied to evals (LongMemEval/UTILMEM).

TARGET=Seven memory/context fabric that: (a) preserves all Phase 3 invariants; (b) implements budgeted, deterministic relevance selection (recency+priority+relevance with tie-breakers) so “relevant memory” is testable (not heuristic-only); (c) treats summaries as derived, versioned artifacts (hash+ts+scope+model/window context) and durable before use; (d) supports room-scoped + global with clear ownership/scope and no cross-contamination; (e) is local-first (IndexedDB) with migration path, corruption recovery, and Android WebView constraints; (f) distinguishes facts (canon-like) from transient observations and avoids mutating history; (g) is eval-gated: retrieval correctness and evidence utilization measured against LongMemEval/UTILMEM-style cases [2410.10813], [2608.30508], [https://mem0.ai/research] [SOURCE primary/secondary]; (h) RPC/kernel boundaries honor cancellation and propagate structured SevenError on malformed records; (i) coexists with RPG canon/dialogue (D06) without duplicating owners (B05 owns RPG/world; A06 owns memory/context fabric) — explicitly separate memory records from dialogue canon/state.

NOW=Smallest high-value slice: make “relevant memory selection” deterministic and provably correct under budget. Add (1) MemoryQuery (scope, roomId, maxTokens, since, minPriority, k, includeGlobal, mustHaveTags) with deterministic tie-breakers (priority desc, created desc, id asc); (2) MemoryRelevance scorer (recency+priority weights, optional keyword/embedding placeholder behind interface, but default to deterministic rule-based for tests); (3) selection algorithm that fills memory/summary budgets in order and never exceeds budgets (token-counted by estimator); (4) unit tests with fixtures asserting which records selected under varying budgets/windows; (5) enforce that selection doesn’t mutate store/history. This directly implements “high-priority/relevant memory selection” from Phase 3B with evidence from context-driven retrieval [2609.03467] [SOURCE primary] (need for context-driven, not just query-driven). Keep scope minimal, no vector DB yet.

NEXT=Harden persistence correctness: (1) versioned schemas for MemoryRecord/SummaryRecord with migration (IndexedDB version bump + upgrade handler) and corruption detection (checksum/validation) — local-first best practice [2603.16171] [SOURCE primary], [https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API] [SOURCE primary]; (2) summary durability before use enforced in all paths (including fallback rebuild) — already invariant, add integration test covering crash-after-write boundary (durable write then read back); (3) eviction/ageing policy (max per-room/global, LRU by access+priority) to prevent unbounded growth (invariant 9); (4) scope enforcement (room vs global) + tags; (5) cancellation integration tests across read/write/summarize. Also add LongMemEval-style smoke tests for retrieval correctness (evidence utilization) [2410.10813], [2608.30508] [SOURCE primary].

LATER=Longer-term: (1) bi-temporal facts (valid_at/invalid_at) inspired by Zep [2501.13956], [https://help.getzep.com/facts] [SOURCE primary/secondary] for point-in-time correctness (especially RPG canon vs conversational memory separation); (2) episode-based ingestion (Zep episodes [https://help.getzep.com/v2/graphiti/core-concepts/adding-episodes] [SOURCE secondary]) to build relations without rewriting history; (3) optional semantic search behind interface (embedding model configurable, local-first) with ablation; (4) TeleMem multimodal considerations [2601.06037] [SOURCE primary] if attachments/media added (Phase 4) — but only if evidence-backed; (5) context-types alignment [https://help.getzep.com/context-types] [SOURCE secondary] to shape payloads; (6) Android WebView quota/eviction handling (IDB size limits, persistent vs temporary), storage pressure paths; (7) eval suite (LongMemEval/LoCoMo/UTILMEM) as quality gates [https://mem0.ai/research] [SOURCE secondary].

TESTS=Deterministic: unit tests for selection (budget boundaries, tie-breakers, recency, priority), estimator, versioning/migrations, corruption, eviction. Integration: room+durable memory → budget → summarize prefix → persist summary → rebuild → provider payload → fallback rebuild → restart/restore (full acceptance). E2E: multi-turn with memory growth, summary rotation, restart/restore, cancellation. Android: IndexedDB behavior in WebView (quota, upgrade, corruption), lifecycle. Adversarial: malformed records/JSON, oversized records, cycles/tags, cross-room leakage, attempt to mutate history, drop newest turn (must fail), summary written after crash boundary, unbounded collection attempts. Eval: retrieval correctness + evidence utilization (LongMemEval/UTILMEM-style microbench) with fixed seeds; context-driven retrieval cases [2609.03467]. All tests must preserve invariants.

RISKS=Security/privacy: memory may contain sensitive info — local-first (IndexedDB) is good but need clear scoping, no external sync by default, encryption not implied; validate inputs (structured SevenError). Performance: selection must run under token-budgeting; avoid full scans in large stores (index by room+priority+created/access). Android/WebView: IDB quotas, private mode behavior, storage eviction; need corruption recovery. RTL/cross-system: tie-breakers must be stable (id asc). Cross-system: ownership — don’t duplicate RPG canon (B05); memory is conversational/factual observations, canon is separate (D06). Overfitting to research KGs (Zep) vs Seven’s “one leading system message + rebuild on fallback” model. Determinism: any embedding-based relevance must be behind interface and disabled by default in unit tests.

FIRST_SLICE=Deterministic MemoryRelevance + MemoryQuery + selection that honors memory/summary budgets and tie-breakers, with unit tests and integration into context shaping path (uses estimator). Smallest change that makes “relevant memory selection” testable/provable while preserving existing Phase 3 invariants. Evidence: context-driven retrieval need [2609.03467] [SOURCE primary] + current Phase 3B selection requirement.

KNOWN_UNKNOWNS=Embedding model choice/size (local-first) and whether needed for first slice (default rule-based). Bi-temporal semantics details for RPG canon separation vs memory. Android WebView exact quota limits across versions (need device/browser evidence later, not just MDN [https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API] [SOURCE primary]). Concrete LongMemEval/UTILMEM test fixtures to import as gates [2410.10813], [2608.30508] [SOURCE primary]. Migration frequency and backward compatibility for existing IndexedDB stores in Seven. Whether any cross-room/global sharing is required (target: clear scope, default no leakage).

DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: INSUFFICIENT

DOMAIN_ID=D06_RPG_WORLD
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


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

Research audit: INSUFFICIENT

DOMAIN_ID=D25_HISTORY_ROOMS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


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

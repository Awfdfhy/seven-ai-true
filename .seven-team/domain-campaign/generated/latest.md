# Seven Domain Roadmaps — cycle evidence

Ready domains: 2/30
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

SOURCE_ANALYSIS=From the harvested evidence ([SOURCE primary] arXiv 2504.19413 Mem0; [SOURCE primary] 2501.13956 Zep/temporal KG; [SOURCE primary] 2410.10813 LongMemEval; [SOURCE primary] 2603.16171 MemX local-first; [SOURCE primary] 2512.12686 Memoria; [SOURCE primary] 2601.06037 TeleMem; [SOURCE primary] 2609.03467 context-driven retrieval; [SOURCE primary] 2608.30508 UTILMEM; [SOURCE secondary] Letta memory blocks; [SOURCE secondary] Zep Graphiti core concepts/facts/context-types; [SOURCE secondary] Mem0 research; [SOURCE primary] MDN IndexedDB API; [SOURCE secondary] LangGraph/DeepAgents), the field converges on: (1) explicit memory types (episodic/semantic/procedural, core/working/long-term, observations/facts/entities) with temporal modeling ([SOURCE primary] 2501.13956, [SOURCE secondary] help.getzep.com/facts), (2) production readiness requires scalable storage + retrieval (fusion: semantic + full-text + graph) ([SOURCE primary] 2501.13956, [SOURCE secondary] help.getzep.com/graphiti/getting-started/overview), (3) benchmarks drive quality (LongMemEval, LoCoMo, UTILMEM) and show token/cost tradeoffs ([SOURCE primary] 2410.10813, [SOURCE secondary] mem0.ai/research, [SOURCE primary] 2608.30508), (4) local-first/privacy and persistence are first-class (MemX, TeleMem, IndexedDB for client-side structured data) ([SOURCE primary] 2603.16171, [SOURCE primary] 2601.06037, [SOURCE primary] MDN IndexedDB_API), (5) agent frameworks emphasize memory blocks, thinking/state and subagents ([SOURCE secondary] Letta, [SOURCE secondary] LangGraph/DeepAgents). Disagreements/limitations: temporal KG adds complexity vs. flat vector stores; local-first trades sync/collaboration; benchmark coverage varies (context-driven retrieval still maturing [SOURCE primary] 2609.03467). Freshness: arXiv abstracts from 2024–2026 indicate active research area; Letta/Zep docs are current secondary sources. Harvest covers seed set (20) including primary papers and practical docs; no uncontrolled crawl needed.

CURRENT=Repository inspection shows Seven’s current surface in `remake/ARCHITECTURE.md` and `remake/MILESTONES.md` is structured around core architecture/milestones but no named “Memory/Context Fabric” subsystem is visible in the scanned headers ([remake/ARCHITECTURE.md:1–120], [remake/MILESTONES.md:1–140]). Grepped keywords (`memory|context|graph|vector|zep|mem0|indexeddb|storage|persistence`) produce sparse hits in `remake/` and `.seven-team/` ([rg results summary]), indicating memory/context is either implicit, not yet implemented, or documented elsewhere. Per Product Intelligence, claims without runtime/build evidence are weak; current evidence level is ARCHITECTURE_SURFACE_ONLY (no code/runtime proof for memory store, relevance policy, budgets, or persistence). Owners list for D02 includes A06,B08,A04,A08,B09,B10 ([domains.json]) but implementation ownership in current codebase is not yet evident.

TARGET=Define a coherent Memory/Context Fabric aligned to architecture in `remake/ARCHITECTURE.md` (preserve architecture, do not duplicate owners). Target capabilities: (a) multi-type memory model (core/system, episodic, semantic, procedural) with clear schemas and bi-temporal facts where history matters ([SOURCE secondary] Zep facts/context-types, [SOURCE secondary] Letta memory blocks); (b) hybrid retrieval (semantic + full-text + graph) with configurable fusion and time-travel queries ([SOURCE primary] 2501.13956, [SOURCE secondary] Graphiti overview); (c) relevance policy with context budgets (token/turns) and provenance (citations to episodes/observations) to support evidence utilization ([SOURCE primary] 2608.30508, [SOURCE primary] 2609.03467); (d) local-first persistence with structured storage (IndexedDB for browser/client, file-backed for local CLI) and migration/compaction paths ([SOURCE primary] 2603.16171, [SOURCE primary] MDN IndexedDB_API); (e) production guardrails: retention, PII handling, redaction, access control, and evaluation hooks tied to LongMemEval/LoCoMo/UTILMEM ([SOURCE primary] 2410.10813, [SOURCE secondary] mem0.ai/research). Identity: preserve Seven identity, no competitor pixel-for-pixel; emphasize deterministic behavior and proof-carrying claims.

NOW=First high-value slice (smallest that materially improves domain): define memory interface contracts (types, read/write/query, relevance scorer) and an in-repo memory schema with provenance; introduce a minimal local-first store abstraction (IndexedDB-backed for web surfaces, in-memory fallback) and a relevance policy enforcing context budgets; add deterministic unit tests for retrieval ordering and temporal point-in-time queries. This is design+contracts-first (RESEARCH/plan) with clear invariants to touch later in EXECUTE.

NEXT=Next improvements: hybrid retrieval (fusion weights), episode ingestion pipeline with summarization/thread summaries, memory blocks (core memory) with teach/update semantics ([SOURCE secondary] Letta), graph edges/temporal validity ([SOURCE secondary] Zep facts), and benchmarks harness (LongMemEval/UTILMEM subsets) to prevent regressions. Add migration framework and telemetry hooks (cost/latency per query) per production readiness ([SOURCE primary] 2504.19413).

LATER=Longer-term ideas: multimodal memory (TeleMem), agentic subagents with memory scopes ([SOURCE secondary] DeepAgents), personalized memory with user summaries, cross-session sync with conflict resolution (local-first CRDT-lite), and full evaluator integration with published benchmarks ([SOURCE primary] 2601.06037, [SOURCE secondary] LangGraph thinking).

TESTS=Deterministic: unit tests for relevance scoring, fusion, temporal queries, schema validation. E2E: conversation flows with recall across sessions, “don’t ask” retrieval ([SOURCE primary] 2609.03467), evidence utilization cases ([SOURCE primary] 2608.30508). Android: persistence lifecycle (background/kill) and storage quotas if mobile client exists. Adversarial: prompt injection into memories, stale/contradictory facts, retention expiry, PII leakage. Eval: run LongMemEval/LoCoMo/UTILMEM subsets with fixed seeds and token budgets ([SOURCE primary] 2410.10813, [SOURCE secondary] mem0.ai/research).

RISKS=Security/privacy (sensitive data in long-term store, redaction, access scopes), performance (graph+vector fusion cost, IndexedDB large datasets), Android/RTL (storage, lifecycle), cross-system (bridge/routing/kernel ownership duplication) — must not create duplicate owners; cross-subsystem impact on A04/A08/B08/B09/B10 requires coordination. Evidence level risk: aesthetic/product claims weak without runtime.

FIRST_SLICE=Memory interface + local-first store (IndexedDB/in-memory) + relevance policy with budgets + provenance schema + 3–5 deterministic retrieval tests. Touches invariants: context budgeting, persistence correctness, and provenance traceability.

KNOWN_UNKNOWNS=Current Seven implementation of memory subsystems (code locations/owners) is unproven from inspected surface; sync model (local-only vs. multi-device), encryption at rest, retention defaults, and evaluation baselines are missing. Need to confirm cross-subsystem integration points (bridge/kernel/routing/storage) to avoid duplicate owners.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT — Seven codebase evidence for memory/context is sparse in inspected files; need deeper inspection of source (src/, packages/, storage/bridge/kernel) and runtime contracts under `.seven-team/autonomy/` to move to READY_FOR_PLAN. Harvested web evidence is strong and sufficient to define TARGET.


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

SOURCE_ANALYSIS=Harvested evidence ([SOURCE primary] Yarn Spinner docs, [SOURCE primary] Dialogue Runners/components, [SOURCE primary] YarnSpinner-Unity GitHub, [SOURCE primary] Godot saving games doc, plus related GitBook/image assets present) shows: (1) Yarn Spinner is a narrative engine with Dialogue Runner as core runtime delivering lines/options/commands to game ([SOURCE primary] docs.yarnspinner.dev/components/dialogue-runner), (2) toolchain separates Yarn Scripts (dialogue) from runtime integration (Unity/Godot/others), (3) dialogue systems require deterministic control flow, variable storage, localization hooks, and command dispatch, (4) persistence for games is nontrivial (multi-object, multi-level, save/load, versioning) and Godot recommends structured save formats with resource/state serialization ([SOURCE primary] docs.godotengine.org/en/stable/tutorials/io/saving_games.html). Limitations: Unity-centric primary examples in harvested set but engine-agnostic concepts exist; RPG/world runtime needs Seven’s engine/runtime boundaries. No major disagreements visible; sources current.

CURRENT=Repository scan ([rg: dialogue|yarn|dialogueRunner|world|canon|rpg|saveGame|persistence]) returns sparse hits in `remake/` and `.seven-team/`. `remake/ARCHITECTURE.md`/`MILESTONES.md` scanned slices don’t surface RPG/world runtime, canon, or dialogue subsystems. D06 owners B05,A06 ([domains.json]); current implementation evidence is absent from inspected surface. Product Intelligence requires runtime/screenshot evidence for UI/product quality claims — none available.

TARGET=RPG/World Runtime with clear separation: canon/world state, dialogue runtime, agency, and persistence. Target: (a) dialogue engine abstraction (Yarn Spinner-compatible contracts: DialogueRunner interface delivering lines/options/commands, variable storage, localization) to avoid lock-in while leveraging best practices ([SOURCE primary] Yarn Spinner docs, dialogue-runner); (b) canon/world model with schema (entities, quests, factions, flags, timelines) and ownership boundaries; (c) agency/runtime loop integrating dialogue with world state and commands; (d) deterministic save/load system for world+dialogue state (Godot-style structured serialization with versioning/migrations, checksum) ([SOURCE primary] Godot saving games); (e) testability (deterministic seeds, event logs). Preserve Seven identity, no pixel-for-pixel imitation.

NOW=First slice: define dialogue runtime contracts (DialogueRunner, Line/Option/Command types), world state schema (flags/vars), and save/load contract with version marker. Add in-memory implementations and deterministic unit tests for dialogue flow and persistence roundtrip.

NEXT=Integrate Yarn Script parsing/runner abstraction (bridge to Yarn runtime) with Seven’s command dispatch, world state bindings, quest/canon tracking, and localization scaffolding. Add E2E narrative tests.

LATER=Editor/tooling hooks, rollback/save slots, cloud sync considerations (local-first), and rich world simulation. Cross-cutting with memory/context for persistent NPC knowledge where relevant (coordination with D02).

TESTS=Deterministic: dialogue branching, variable updates, command execution, save/load roundtrip. E2E: narrative journeys. Android: save lifecycle/IO. Adversarial: invalid scripts, save corruption, version migration. Eval: coverage of dialogue paths.

RISKS=Deterministic behavior (timing), save compatibility, cross-system ownership (no duplicate), UI/product claims without runtime evidence (must be labeled weak). Integration with bridge/kernel/routing.

FIRST_SLICE=Dialogue runtime contracts + world state schema + save/load contract + in-memory impl + 4–6 deterministic tests.

KNOWN_UNKNOWNS=Codebase presence of dialogue/world systems unknown; engine/runtime boundaries vs. UI; persistence backend choices; canon ownership model.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT — insufficient Seven implementation evidence from inspected surface; need deeper source inspection to confirm current state. Harvested evidence is adequate for TARGET.


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

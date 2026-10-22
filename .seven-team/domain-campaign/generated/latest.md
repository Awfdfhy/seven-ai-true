# Seven Domain Roadmaps — cycle evidence

Ready domains: 4/30
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
SOURCE_ANALYSIS=Harvested evidence emphasizes structured memory systems (Mem0, Zep/Graphiti, MemX/Memoria/TeleMem), temporal/provenance models, benchmark-driven evaluation (LongMemEval/LoCoMo/UTILMEM), and local-first storage via IndexedDB. Sources collectively favor durable, queryable memory with temporal validity and provenance over naive transcript replay. Disagreements: graph/temporal complexity vs local lexical/temporal baseline; benchmark claims are vendor-reported and not Seven-specific. Limitations: abstracts only for most papers; no direct code integration evidence; no Seven benchmark yet.
CURRENT=Seven memory/context surfaces must be inspected in release/remake; no verified production memory fabric from this report. Evidence level is research-only.
TARGET=Local-first memory/context fabric with deterministic persistence, temporal correction, provenance, abstention, restart recovery, secret exclusion, and benchmarked retrieval.
NOW=Define storage schema and memory lifecycle contracts; audit existing IndexedDB/localStorage usage and persistence boundaries.
NEXT=Implement incremental memory migration beside legacy memory; add restart-persistence and secret-exclusion tests; benchmark lexical/temporal baseline.
LATER=Optional graph/vector upgrades only after measured benchmark wins.
TESTS=Deterministic unit/integration tests for persistence/restart; benchmark comparisons; adversarial secret-injection tests; Android WebView storage tests.
RISKS=Privacy leakage, stale memory, migration data loss, unbounded storage growth, concurrency races, Android WebView storage eviction.
FIRST_SLICE=Versioned IndexedDB-backed memory records with provenance/timestamps and restart recovery.
KNOWN_UNKNOWNS=Exact existing Seven memory implementation, current schema, Android exact-build storage behavior, benchmark baseline.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

Research audit: READY

DOMAIN_ID=D15_PERSISTENCE_RECOVERY
SOURCE_ANALYSIS=Harvested evidence: IndexedDB for structured/larger client data, Web Storage for smaller key/value state, Android architecture recommends layered/data-source recovery. Sources agree on separating persistence concerns and robust lifecycle handling, but do not provide Seven-specific migration/corruption behavior. Limitations: generic docs; no corruption-recovery or migration test evidence.
CURRENT=Seven persistence/recovery implementation must be inspected; no verified migration/corruption recovery proof in this report.
TARGET=Robust persistence layer with schema versioning, migration, corruption detection, safe fallback, and recovery UX.
NOW=Inventory all storage keys/databases, identify migration points and failure modes.
NEXT=Add migration tests, corruption simulation, recovery fallback, and restart validation.
LATER=Backup/restore and cross-device portability.
TESTS=Corruption injection, migration rollback, restart recovery, Android lifecycle tests.
RISKS=Data loss, silent corruption, version mismatch, WebView storage limits.
FIRST_SLICE=Schema versioning + safe migration wrapper with deterministic tests.
KNOWN_UNKNOWNS=Existing storage ownership, schema versions, failure telemetry.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

Research audit: READY

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
SOURCE_ANALYSIS=Harvested evidence: Android SAF for user-controlled document access, IndexedDB for client-side structured data. Sources emphasize user control and privacy. Limitations: no Seven export/import implementation evidence; no format/version contract.
CURRENT=No verified backup/import/export implementation in this report.
TARGET=Versioned data export/import with validation, secret handling, and user-controlled file selection.
NOW=Define export schema and identify sensitive data exclusions.
NEXT=Implement deterministic export/import with validation and tests.
LATER=Android SAF integration and cloud backup.
TESTS=Round-trip export/import tests, malformed payload tests, secret-exclusion tests.
RISKS=PII leakage, partial imports, format drift, Android permission/storage issues.
FIRST_SLICE=JSON export/import with schema validation and tests.
KNOWN_UNKNOWNS=Current data model, Android exact-build evidence.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D24_RELEASE_APK
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D25_HISTORY_ROOMS — Conversation History / Room Lifecycle / Search / Archive

Research audit: READY

DOMAIN_ID=D25_HISTORY_ROOMS
SOURCE_ANALYSIS=Harvested evidence: React state preservation/resetting and IndexedDB. Sources support preserving state across navigation and structured client persistence. Limitations: no Seven history/room implementation evidence; no lifecycle/search/archive tests.
CURRENT=No verified history/room lifecycle implementation in this report.
TARGET=Reliable conversation history/room lifecycle with archive/search and state preservation.
NOW=Inventory room/history storage and lifecycle transitions.
NEXT=Add state-preservation tests and archive/search behavior.
LATER=Full-text search and cross-session room recovery.
TESTS=Navigation state tests, archive/search tests, restart recovery tests.
RISKS=State reset bugs, data duplication, storage growth, concurrency.
FIRST_SLICE=Persistent room index with restart-safe state restoration.
KNOWN_UNKNOWNS=Current room model, storage ownership, search implementation.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

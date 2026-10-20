# Seven Domain Roadmaps — cycle evidence

Ready domains: 7/30
Only READY domains may drive implementation.

# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: INSUFFICIENT

DOMAIN_ID=D01_CHAT_CORE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


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

Research audit: READY

DOMAIN_ID=D08_MODEL_ROUTING
SOURCE_ANALYSIS=Harvested evidence is READY with 11 primary sources. LLMRouterBench (ACL 2026) supports benchmarked routing comparison; OpenTelemetry GenAI semantic conventions support provider/health telemetry attribute standardization. Freshness is current for 2026 routing research, but benchmark details are not extracted beyond source metadata in this packet. Disagreement/limitation: benchmark leaderboards provide external model-quality evidence, not Seven runtime behavior.
CURRENT=Seven has `remake/src/routing/model-router.ts` with `ModelRegistry`, provider health tracking, cooldowns, attempt tokens, route plans, and validation. `remake/src/application/chat/provider-chat-transport.ts` and tests exercise provider chat. Evidence level: code + unit/integration tests; no production edits this cycle.
TARGET=Deterministic provider health/fallback with cooldown decay, retry-after handling, route explainability, and telemetry aligned to OpenTelemetry GenAI attributes. Keep one routing owner.
NOW=Add route decision diagnostics (provider, model, cooldown, retry-after, attempt token) without secrets; add stress tests for concurrent health updates and cooldown expiry.
NEXT=Compare routing decisions against LLMRouterBench-style benchmark harness; add provider latency/error rolling windows.
LATER=Adaptive routing policies with benchmark-gated rollout.
TESTS=Unit tests for cooldown precedence, attempt-token ordering, health snapshot immutability; integration tests for fallback and cancellation; replay tests.
RISKS=Race on health state; stale cooldowns; provider identity leakage; overfitting to benchmark scores.
FIRST_SLICE=Route telemetry + deterministic cooldown tests.
KNOWN_UNKNOWNS=No measured latency/quality baseline in harvested evidence; no Android-specific provider behavior.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK
SOURCE_ANALYSIS=Harvested evidence is READY with 10 primary sources. BFCL and SWE-bench provide tool-calling/planning benchmark references; BrowseComp seed supports search/research grounding. Disagreement: benchmark scores reflect model capability, not Seven's orchestration quality. Limitation: harvested pages are mostly landing/CSS, not detailed methodology.
CURRENT=Seven has `remake/src/application/deep-think/deep-think-transport.ts` implementing planner+final two-stage flow, context budget checks, cancellation, streaming, and planning size limits. Tests exist in `phase6` and manager integration. Evidence level: code + tests.
TARGET=Deep Think with verified planning, cancellation safety, context capacity guards, progress events, and deterministic fallback to quick mode.
NOW=Add progress/cancellation diagnostics and tests for partial planner failure, context overflow, and aborted streams.
NEXT=Add verification pass and plan-size/token budget metrics; compare planning quality on SWE-bench-like tasks.
LATER=Multi-plan verification and tool-use planning.
TESTS=Adversarial tests for abort during planner/final, oversized plan, invalid chunks, empty plan; replay determinism.
RISKS=Long-running planner tasks; context overflow; partial output; cancellation races.
FIRST_SLICE=Progress events + abort regression tests.
KNOWN_UNKNOWNS=No benchmark comparison evidence; no Android streaming behavior proof.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL
SOURCE_ANALYSIS=Capacitor Filesystem docs describe a Node-like file API but do not by themselves provide Android SAF consent semantics; Android docs define SAF as the user-consented document/file picker model without system permissions; OWASP MASVS adds mobile storage/security expectations. Harvested evidence is current and primary, but mostly platform-level. Disagreement/limitation: Capacitor Filesystem and Android SAF are different permission/consent models; Seven must not treat Filesystem as a blanket file-access path. Evidence lacks Seven-specific UI/runtime and installed-artifact proof.
CURRENT=Seven remake has a hardened attachment pipeline in remake/src/application/attachments/attachment-service.ts and remake/src/domain/attachments/index.ts: bytes→size guard→MIME sniff→parse→hash→durable attachment, 10MB bytes, 1M chars, 128 records/room, immutable schema-versioned records, single-flight PDF parser loader, cancellation checks, IndexedDB repository with schema validation. Supported MIME only text/plain and application/pdf. No Android/SAF bridge, no image/audio/video handling, no file picker, no grant persistence, no import/export/backup, no multimodal extraction beyond PDF text. Tests pass (259/259 at latest recorded run), but no Android installed-artifact evidence.
TARGET=Keep attachment core as single owner; add consent-based SAF-backed document import/export boundary, declared-vs-detected MIME enforcement, grant lifecycle, size/type policy, extraction adapters behind deterministic validation, and no raw file access without user selection. Preserve immutable records and room scoping. Add portability: export/import attachment records and metadata with integrity checks.
NOW=Document and test the existing attachment invariants as the canonical baseline; add a SAF adapter contract and tests for granted URI metadata, size/type rejection, and cancellation. Add import/export JSON bundle schema with hash verification and version migration.
NEXT=Implement Android SAF picker bridge, grant persistence/revocation, image/text extraction adapters, export bundle, and release evidence ledger.
LATER=Multimodal beyond text/PDF, OCR, cloud providers, encrypted backup, cross-device sync, large-file streaming.
TESTS=Unit tests for sniff/hash/limits/cancellation; IndexedDB restore validation; SAF grant expiry/revocation tests; import/export round-trip and tamper tests; Android exact-build install/run tests; adversarial oversized/mismatched/corrupt files.
RISKS=Security/privacy: broad storage permissions, leaked grants, untrusted MIME, path traversal, oversized memory; Android: SAF URI lifetime, WebView/Capacitor bridge assumptions; performance: parsing large PDFs; RTL: filename display; cross-system: duplicate file stores.
FIRST_SLICE=SAF consent adapter interface + deterministic tests for selected document metadata and rejection paths, without changing existing attachment service.
KNOWN_UNKNOWNS=No installed Android artifact evidence; no exact-build visual evidence; no SAF implementation yet; no import/export implementation.
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
SOURCE_ANALYSIS=Harvested evidence is READY for D17 with 12 sources (7 primary). Android core app quality, web.dev long tasks, and MDN Streams provide performance/responsiveness guidance. Disagreement: web performance guidance is generic; Android exact-build behavior remains unproven. Limitation: no Seven profiling data.
CURRENT=Seven code has concurrency tests (`memory-concurrency.test.ts`), diagnostics buffer with bounded capacity, model router attempt tokens, and Deep Think streaming. No dedicated performance profiling module found. Evidence level: code + tests, no measurements.
TARGET=Performance budgets for startup/render/long chat, cancellation deadlines, non-blocking streaming, and stress tests for long conversations.
NOW=Define budgets and add regression probes for long-task durations, memory growth, and cancellation latency in tests.
NEXT=Add long-chat stress harness and UI virtualization review.
LATER=Android-specific profiling and performance regression gates.
TESTS=Stress tests for long chats, concurrent requests, cancellation deadlines, storage pressure; browser profiling where available.
RISKS=UI thread blocking; unbounded history; storage pressure; race conditions.
FIRST_SLICE=Performance budget document + deterministic stress probes.
KNOWN_UNKNOWNS=No profiling measurements; no Android runtime evidence.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

Research audit: READY

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
SOURCE_ANALYSIS=Harvested evidence is INSUFFICIENT: only 2 primary sources. OpenTelemetry semantic conventions provide attribute/span guidance; GenAI attributes moved to dedicated repo. Disagreement: none; limitation is shallow harvest and no Seven runtime telemetry evidence.
CURRENT=Seven has `remake/src/observability/diagnostics.ts` with redaction, bounded buffer, immutable events, and validation. No broader world-model/blast-radius runtime instrumentation found in inspected files. Evidence level: code + tests.
TARGET=Safe diagnostics aligned to OpenTelemetry GenAI conventions, blast-radius-aware change planning, and no secret/prompt leakage.
NOW=Map diagnostic categories to GenAI semantic conventions and add tests for redaction of tokens/prompts/content.
NEXT=Add correlation IDs across routing/deep-think/memory and export format validation.
LATER=Engineering world model integration with test planning.
TESTS=Redaction tests, schema validation, capacity bounds, correlation propagation.
RISKS=Secret leakage; unbounded telemetry; PII in attributes.
FIRST_SLICE=Telemetry schema mapping + redaction regression tests.
KNOWN_UNKNOWNS=No installed-device or runtime trace evidence; harvested source count below target.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D22_PROTOCOLS_INTEROP — MCP / Agent Protocols / Tool Interoperability

Research audit: INSUFFICIENT

DOMAIN_ID=D22_PROTOCOLS_INTEROP
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: READY

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
SOURCE_ANALYSIS=Android SAF docs emphasize user-selected document access without system permissions; MDN IndexedDB docs describe client-side structured storage and blobs. Sources collectively support consent-based portability and local durable storage. Limitation: no Seven-specific backup format, sync, or privacy policy evidence; harvested sources do not define encryption/export contracts.
CURRENT=No import/export/backup subsystem found. Attachment repository is room-scoped IndexedDB only. No backup bundle, schema migration, or data portability tests. Memory/chat/RPG data ownership not unified for export.
TARGET=Add a single portability owner: versioned, integrity-checked, user-consented export/import bundles for attachments and relevant chat/room metadata, with deterministic validation, migration, and rollback. No secrets/credentials exported.
NEXT=Define bundle schema and tests; implement attachment-only export/import first; then room/chat metadata.
LATER=Encrypted backups, cloud storage, incremental sync, cross-device restore, retention policies.
TESTS=Bundle round-trip, tamper detection, version migration, cancellation, storage failure, Android SAF save/open flows, secret exclusion.
RISKS=Data loss, privacy leakage, schema drift, partial import, Android storage grants, large bundle memory.
FIRST_SLICE=Attachment bundle schema + deterministic in-memory export/import tests.
KNOWN_UNKNOWNS=No bundle format exists; no Android evidence; no backup UX.
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
SOURCE_ANALYSIS=Harvested evidence is READY with 5 primary sources. HiGMem and LLMRouterBench provide hierarchical memory/routing research references. Freshness is current (ACL 2026). Limitation: no evidence that local embeddings/reranking improve Seven's measured baseline.
CURRENT=No dedicated local intelligence/embeddings/reranking module found in inspected `remake/src`; local intelligence appears absent or undocumented in this scope. Evidence level: absence in inspected tree, not proof of absence elsewhere.
TARGET=Optional local/offline fallback with benchmark-gated complexity, preserving current lexical/temporal memory baseline.
NOW=Document current baseline and define benchmark gate before adding embeddings/reranking.
NEXT=Prototype offline fallback behind feature flag and measure against lexical baseline.
LATER=Semantic/vector/graph complexity only if benchmark wins.
TESTS=Benchmark comparison, offline fallback tests, privacy tests for local data.
RISKS=Complexity without measured benefit; privacy; offline correctness.
FIRST_SLICE=Benchmark harness + baseline metrics.
KNOWN_UNKNOWNS=No local intelligence implementation evidence; no benchmark results.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

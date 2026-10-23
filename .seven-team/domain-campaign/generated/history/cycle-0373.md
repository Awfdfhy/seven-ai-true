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

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT
SOURCE_ANALYSIS=20 sources harvested (11 primary, 9 secondary); harvest READY. Mem0 reports 92.5 LoCoMo / 94.4 LongMemEval at 3-4x lower token cost vs full-context; Zep uses bi-temporal valid_at/invalid_at facts and Graphiti temporal knowledge graphs; LongMemEval and UTILMEM (evidence utilization) define evaluation; MemX local-first and Memoria agentic memory show incremental migration patterns; Letta memory blocks show structured core memory. Disagreement: graph/semantic memory (Zep) vs local lexical/temporal baseline; no single standard. Freshness: arXiv 2025-2026, vendor docs current. Limitation: abstracts only, no full paper text; no Seven runtime measurements.
CURRENT=Seven has memory modules under remake/src (context, storage) and legacy memory.cjs at root; Memory v2 research synthesis and execution plan exist in .seven-team/memory-v2. Restart persistence, secret exclusion, temporal correction, provenance, abstention remain UNPROVEN. Incremental migration beside legacy is the stated approach.
TARGET=Local-first temporal memory with provenance, correction/invalidation, abstention, restart persistence, secret exclusion, and measured benchmark win over lexical baseline before semantic/graph promotion.
NOW=Complete Memory v2 current-state audit: map storage owners, context assembly, and persistence recovery; add restart-persistence and secret-exclusion regression tests.
NEXT=Temporal correction and provenance ledger; benchmark lexical baseline vs semantic candidate; Arabic parity.
LATER=Optional graph/vector memory only if it wins measured benchmark; multimodal memory (TeleMem) deferred.
TESTS=Deterministic: restart persistence, secret exclusion, temporal correction, abstention; E2E: long chat with corrections; Android: WebView persistence; adversarial: secret leakage, stale fact; eval: LongMemEval-style recall/abstention.
RISKS=Privacy (secrets in memory), performance (context bloat), Android WebView storage, RTL/Arabic, data loss on restart, duplicate memory owners.
FIRST_SLICE=Restart-persistence + secret-exclusion tests wired to existing memory owner with no new store.
KNOWN_UNKNOWNS=Exact runtime memory module paths, current test coverage, benchmark baseline numbers, Android IndexedDB behavior.
DOMAIN_VERDICT=READY_FOR_PLAN


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=20 sources harvested (17 primary, 3 secondary); harvest READY. MCP 2026-07-28 tool spec and Tasks extension define tool lifecycle; OpenAI function calling + programmatic tool calling; BFCL V4 leaderboards; ToolSandbox/τ-bench/AgentDojo benchmarks; OWASP Agentic Top 10 2026 (excessive agency, prompt injection). Disagreement: MCP async tasks vs synchronous function calling. Freshness: current specs 2026. Limitation: harvested pages are mostly index/abstracts; no Seven tool code inspected yet in this pass.
CURRENT=Seven has tool/runtime code in remake/src; Tools v1 research synthesis and execution plan exist. High-impact external tools must not connect before ReferenceMonitor, approval binding, idempotency, audit tests are green. LLM is never authorization boundary.
TARGET=Deterministic schema/capability/scope/approval/replay checks on every execution; audit trail; idempotency; no excessive agency.
NOW=Audit existing tool permission and execution code; map owners and gaps; define authorization boundary.
NEXT=ReferenceMonitor + approval binding + idempotency tests; prompt-injection adversarial suite.
LATER=MCP integration only after security gates green; async task support.
TESTS=Deterministic: schema validation, capability/scope checks, approval binding, replay/idempotency; E2E: tool flow; Android: N/A (web); adversarial: prompt injection, excessive agency, unauthorized calls; eval: BFCL-style accuracy.
RISKS=Excessive agency, prompt injection, credential exposure, replay, scope escalation, duplicate runtimes.
FIRST_SLICE=Authorization boundary audit + deterministic permission tests for existing tools.
KNOWN_UNKNOWNS=Exact tool module paths, current permission implementation, test coverage, MCP client state.
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
SOURCE_ANALYSIS=12 sources (11 primary, 1 secondary); harvest READY. Android core app quality guidelines, WCAG 2.x, Playwright visual snapshots, Android multi-locale quality. No disagreement on accessibility; limitation: visual boards must be inspected locally.
CURRENT=Seven has remake/src/ui with primitives; product-intelligence visual boards and rubric exist. Exact-build visual quality UNPROVEN; Android installed-artifact evidence missing.
TARGET=One coherent UI primitive set, RTL/Arabic parity, WCAG 2.2 AA, mobile ergonomics, visual regression via Playwright snapshots, premium cohesion without copying references.
NOW=Audit shared UI primitives, theme tokens, RTL behavior, accessibility; document primitive contract.
NEXT=Visual snapshot baseline for golden screens; Android screenshot matrix.
LATER=Motion polish, density tuning, theme variants.
TESTS=Deterministic: RTL/a11y unit tests; E2E: Playwright visual snapshots; Android: screenshot comparison; adversarial: RTL overflow, focus order; eval: rubric hard-fail check.
RISKS=RTL regressions, duplicate components, Android WebView CSS, accessibility failures, visual drift.
FIRST_SLICE=UI primitive contract + RTL smoke tests.
KNOWN_UNKNOWNS=Exact component inventory, current visual baseline, Android build state.
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D19_AGENT_ORCHESTRATION
SOURCE_ANALYSIS=12 sources (12 primary); harvest READY. GitHub custom agents, Microsoft multi-agent reference architecture, MCP spec. Emphasizes reusable specialist roles, security, scalability. Limitation: Seven's .seven-team orchestration state is the actual authority.
CURRENT=Seven runs 20-agent superloop with manager stages; ownership.json, team.json define roles; autonomy contracts under .seven-team/autonomy. Constitution/proof policy mandatory.
TARGET=One owner per subsystem, no duplicate runtimes/stores/bridges; evidence-gated stage transitions; deterministic conflict resolution.
NOW=Review orchestration state and ownership map for duplicate owners and conflicts.
NEXT=Integration conflict reports (A10/B10), meta-team evidence proposals.
LATER=Calibration/meta-team changes from repeated evidence only.
TESTS=Deterministic: ownership uniqueness checks; E2E: stage flow; adversarial: conflicting assignments; eval: conflict report.
RISKS=Duplicate owners, scope creep, evidence fabrication, weakening tests.
FIRST_SLICE=Ownership audit + conflict report.
KNOWN_UNKNOWNS=Current ownership violations, stage state consistency.
DOMAIN_VERDICT=READY_FOR_PLAN


# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: READY

DOMAIN_ID=D20_PRODUCT_QUALITY
SOURCE_ANALYSIS=10 sources (9 primary, 1 secondary); harvest READY. Android core quality, WCAG, Playwright snapshots. Premium quality judged by rubric with hard fails; missing exact-build visual evidence = UNPROVEN not PASS.
CURRENT=Product-intelligence corpus exists with rubric, knowledge base, visual catalog, judge protocol. B10 owns cohesion review and at most one curated lesson or NO_NEW_INTELLIGENCE.
TARGET=Premium AI chat product feel with evidence-backed visual/UX quality; no feature-count reward.
NOW=Inspect rubric, knowledge base, visual boards; audit exact-build visual evidence gaps.
NEXT=Golden-screen snapshot baseline; premium-cohesion judging.
LATER=Synthetic user evaluation, motion polish.
TESTS=Deterministic: rubric hard-fail checks; E2E: Playwright snapshots; Android: screenshot matrix; adversarial: RTL/a11y; eval: judge protocol.
RISKS=Aesthetic claims without evidence, hard-fail blocking release, Android gaps.
FIRST_SLICE=Visual evidence audit + rubric gap list.
KNOWN_UNKNOWNS=Exact-build screenshot availability, current rubric scores.
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D27_ERROR_RECOVERY_UX
SOURCE_ANALYSIS=10 sources (10 primary); harvest READY. Android core quality, WCAG. Loading/empty/error states are quality fundamentals.
CURRENT=Seven error/loading/empty surfaces exist in UI; need audit for consistency and recovery paths.
TARGET=Clear, accessible, recoverable error/loading/empty states across web and Android, with retry and fallback.
NOW=Audit error/loading/empty surfaces; list inconsistencies and missing recovery.
NEXT=Standardize error components, retry affordances, offline handling.
 LATER=Advanced recovery (resumable streams, partial results).
TESTS=Deterministic: component tests; E2E: failure injection; Android: WebView error states; adversarial: network drop, timeout; eval: UX rubric.
RISKS=Silent failures, no retry, accessibility, Android WebView errors.
FIRST_SLICE=Error state inventory + standardized empty/error components.
KNOWN_UNKNOWNS=Current error handling coverage, failure injection tests.
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
SOURCE_ANALYSIS=14 sources (13 primary, 1 secondary); harvest READY. SWE-bench leaderboards, OWASP MASVS, OpenTelemetry semconv, Playwright snapshots. Emphasizes reproducible benchmarks and mobile security.
CURRENT=Constitution, proof policy, judge rules, Reality Lab, Evolution Arena under .seven-team/autonomy. Missing Reality Lab evidence remains UNPROVEN. Preflight: 13 systems, 20 invariants, 24 journeys, 12 personas, 281 nodes, 748 edges.
TARGET=Proof-carrying work: candidate identity binding, no constitution weakening, failed experiments preserved as learning.
NOW=Audit autonomy contracts and proof policy; verify no changes to constitution/evaluator rules.
NEXT=Bind Reality Lab evidence to candidate source/artifact identity; expand journeys.
LATER=Meta-team proposals from repeated evidence only.
TESTS=Deterministic: constitution compliance checks; E2E: journey coverage; Android: evidence gate; adversarial: proof bypass; eval: SWE-bench-style reproducibility.
RISKS=Weakening tests/guards, unbound evidence, missing Android proof, unproven claims.
FIRST_SLICE=Autonomy contract audit + evidence-gap report.
KNOWN_UNKNOWNS=Reality Lab execution availability, Android device/emulator access.
DOMAIN_VERDICT=READY_FOR_PLAN

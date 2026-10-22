# Seven Domain Roadmaps — cycle evidence

Ready domains: 5/30
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
SOURCE_ANALYSIS=Harvested LLMRouterBench (ACL Findings 2026) and OpenTelemetry GenAI semconv. LLMRouterBench presents a large benchmark/unified framework for LLM routing (routing decisions by quality/cost/latency). OTel GenAI semconv provides attribute registry for gen-ai telemetry (model, provider, agent, etc.). Gap: no harvested provider health/fallback implementation details; need to align routing telemetry with OTel and evaluate against routing benchmarks.
CURRENT=ARCHITECTURE states ModelRouter is "pure decision engine" given mode, user preference, available providers/models, health/cooldown state, context budget returning explicit route plan. ProviderAdapter contract defined. Provider health/cooldown state exists in storage domains per architecture. No concrete router implementation inspected in this pass; ownership implied shared A05/A09.
TARGET=Evidence-driven routing: route by explicit plan with health/cooldown, cost/latency/quality tradeoffs, deterministic fallback, circuit breaking, and OTel-aligned telemetry (gen_ai.*) with replayable decisions.
NOW=Extract router decision schema (inputs/outputs/reasons), add decision logging with OTel GenAI attributes, and codify fallback order with tests.
NEXT=Integrate routing signals from health checks, context budget, and model capabilities; add A/B routing experiments with deterministic replay.
LATER=Learned routing informed by LLMRouterBench metrics with guardrails and evals.
TESTS=Routing unit tests (fallback chains), health/cooldown transitions, budget-constrained routing, telemetry schema validation, and replay tests.
RISKS=Routing changes can flip models unexpectedly; must preserve user preference and have circuit breakers. Telemetry must not leak prompts.
FIRST_SLICE=Define RoutePlan schema + router interface with health/cooldown inputs and emit OTel GenAI decision attributes (model/provider/route_reason) with deterministic tests.
KNOWN_UNKNOWNS=Current health check cadence, cooldown values, provider capability matrix completeness, and integration with Deep Think.
DOMAIN_VERDICT=READY_FOR_PLAN


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK
SOURCE_ANALYSIS=Harvested BFCL (Berkeley Function Calling Leaderboard) and SWE-bench leaderboards. BFCL emphasizes tool/function calling correctness/robustness; SWE-bench emphasizes software engineering task solving with tests. Both are eval-driven. No Seven-specific Deep Think traces harvested.
CURRENT=ARCHITECTURE: Deep Think is "two-pass orchestration is a service, not a UI patch" with invariants: "exactly one leading system message after final context shaping" and "final payload is revalidated before provider dispatch". Ownership A09/B04.
TARGET=Deterministic planning/verification with traceable steps, tool-use correctness, revalidation guards, progress reporting, and eval-backed improvements.
NOW=Codify Deep Think invariant checks (single leading system message, payload revalidation) as runtime guards with tests; add trace logging.
NEXT=Integrate tool-calling validation (inspired by BFCL patterns), step verification, and cancellation integration with TaskManager.
LATER=Planning search with verification loops and SWE-bench-style regression tests.
TESTS=Invariant tests, payload revalidation tests, tool schema validation, cancellation during planning, and deterministic traces.
RISKS=Over-planning latency, prompt bloat, tool misuse. Guards must not be bypassable.
FIRST_SLICE=Enforce and test the two invariants as service guards; add trace events for planning/verification steps.
KNOWN_UNKNOWNS=Current two-pass implementation details, tool schemas, and eval coverage.
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
SOURCE_ANALYSIS=Harvested primary/secondary from Android core app quality, web.dev long tasks, MDN Streams. Common themes: avoid long JS tasks blocking main thread (INP/long tasks), respect Android lifecycle/foreground constraints, use streaming/transferable work and cancellation. Streams API (MDN) emphasizes backpressure/consumption; Android Core App Quality focuses on responsiveness, lifecycle, ANRs, and resource constraints. Evidence is solid for web/Android principles but lacks Seven-specific latency budgets, task metrics, and race proofs.
CURRENT=TaskManager (`remake/src/core/task-manager.ts`) is the single owner of tasks with states (starting/running/cancelling/cancelled/succeeded/failed), AbortController per task, timeout/deadline sealing, cancellation sealing, exclusive owner reservation, listener snapshots, and completed retention cap (maxRetainedCompleted). ARCHITECTURE states: "All provider calls receive the TaskManager signal. Android/native operations use a bridge cancellation token mapped to the same taskId." Cancellation is explicit via sealCancellation/sealDeadline. No obvious global task queue priority/budget enforcement visible in TaskManager core; long chat/streaming pressure handling and race detection appear to rely on call sites. No evidence of task metrics (p50/p90/p99, queue time, cancellation latency) or long-task instrumentation in core inspected.
TARGET=Deterministic cancellation with sub-second propagation, bounded concurrency per owner/room/global, backpressure for long chats/streams, explicit resource budgets (time/memory/bytes), protection against races (idempotency + cancellation sealing), Android lifecycle-aware cancellation, and measurable latency SLOs with regression tests.
NOW=Instrument TaskManager transitions with structured metrics (start/end/cancel/timeout) and enforce a per-owner concurrency limit (in addition to exclusive ownership) with deterministic tests for race between cancel/finish/timeout.
NEXT=Adopt streaming with backpressure (leveraging Streams API patterns), enforce deadline propagation to all async boundaries (storage/network/bridge), add long-task detection hooks and yield points, and map bridge cancellation tokens to taskId with timeout tests.
LATER=Cooperative scheduling for large renders/workers, memory pressure hooks (long chats), adaptive timeouts, and cross-platform cancellation cancellation-proof harness.
TESTS=Deterministic unit tests for TaskManager (cancel before start/after finish, double cancel, timeout, seal idempotency), race tests (concurrent run/cancel), Android bridge cancellation round-trip tests, long-chat streaming backpressure tests, and latency regression guards.
RISKS=Over-broad cancellation can abort in-progress writes; deadline sealing must not drop committed results. Android bridge races between JS/native lifecycle. Long tasks on low-end devices. Exclusive ownership can create convoying if not bounded.
FIRST_SLICE=Add per-owner max concurrent tasks + metrics counters to TaskManager with tests; ensure cancellation propagation is covered by existing task tests and add a race regression test.
KNOWN_UNKNOWNS=Actual provider stream chunking/cancellation, storage transaction cancellation, bridge cancellation token lifecycle, and real long-chat memory usage.
DOMAIN_VERDICT=READY_FOR_PLAN


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
SOURCE_ANALYSIS=Harvested OTel docs/specs (semconv) and GenAI semconv (duplicate). Harvest count small (INSUFFICIENT per provided data). OTel provides robust conventions for traces/metrics/logs and gen-ai attributes. Need more sources for world model/blast radius patterns.
CURRENT=TaskManager has listeners/snapshots; architecture mentions observability implicitly. No explicit world model/blast radius service inspected. Ownership A04/A09.
TARGET=Engineering world model with causal tracing, blast radius analysis, SLOs, and OTel-aligned telemetry across tasks/bridge/storage/providers.
NOW=Map critical paths to traceable spans (TaskManager, router, Deep Think, storage), adopt OTel GenAI attributes where applicable, and define blast radius schema.
NEXT=Implement dependency graph for blast radius, error budgets, and alerts.
LATER=Automated impact analysis.
TESTS=Trace propagation tests, blast radius tests, and telemetry schema validation.
RISKS=Telemetry volume/cost, PII in traces, overhead on hot paths.
FIRST_SLICE=Instrument TaskManager with span events (task start/end/cancel/timeout) and define minimal world model schema with tests.
KNOWN_UNKNOWNS=Existing tracing infrastructure, sampling, and blast radius requirements.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

Research audit: READY

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
SOURCE_ANALYSIS=Harvested HiGMem (hierarchical LLM-guided memory for long-term conversational agents) and LLMRouterBench. HiGMem suggests hierarchical memory organization guided by LLMs for long-term conversations. LLMRouterBench relevant for local/offline routing. Evidence is research-oriented; no Seven local embeddings/reranking/offline fallback implementation inspected.
CURRENT=ARCHITECTURE lists memory as persistent domain (StorageEngine). No local intelligence specifics detailed in inspected sections. Ownership A05/A09.
TARGET=Local-first intelligence: embeddings/reranking with offline fallback, hierarchical memory (inspired by HiGMem), privacy-preserving, bounded resource usage.
NOW=Inventory memory schema/capabilities, define local model interface (embeddings/rerank), and design offline fallback path.
NEXT=Implement hierarchical memory indexing with retrieval, reranking, and budget enforcement.
LATER=On-device evals and privacy controls.
TESTS=Memory retrieval tests, offline fallback tests, resource budget tests, and privacy checks.
RISKS=On-device model size/latency, memory bloat, privacy leaks. Must not block cloud path.
FIRST_SLICE=Define LocalIntelligence interface + offline fallback contract with tests; audit memory storage for local retrieval hooks.
KNOWN_UNKNOWNS=Available on-device models, Android constraints, embedding dimensions, and rerank availability.
DOMAIN_VERDICT=READY_FOR_PLAN


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

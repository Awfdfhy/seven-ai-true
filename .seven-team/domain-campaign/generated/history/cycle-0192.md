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
SOURCE_ANALYSIS=Harvested [SOURCE primary] LLMRouterBench (ACL'26) defines routing benchmark/unified framework; routing quality vs cost/latency tradeoffs. OTel gen-ai [SOURCE primary] gives semantic conventions for attributes (moved to gen-ai semconv repo) — useful for provider health/fallback telemetry. Minor harvested noise (GitHub boilerplate/opensearch) ignored. Limitations: no direct Seven integration details; freshness recent (2026). No disagreement evident. Gaps: concrete routing policy (static vs learned), circuit breakers, hedging, per-request budgets, multi-provider failover paths in Seven.
CURRENT=Repo grep shows routing/provider/fallback/circuit breaker/retry surface in remake. Owners listed as A05,A09; A09 co-owner suggests performance/concurrency overlap (latency budgets, cancellation on failover). Seven must preserve ARCHITECTURE.md boundaries; no explicit policy file enumerated in quick scan — treat as unpinned contract. Current implementation unknown in detail from quick scan; need module inspection.
TARGET=Deterministic model routing with: provider health scoring, fallback chains, retry with jitter, per-request latency/cost/token budgets, cancellation-aware failover, and OTel gen-ai attributes (gen_ai.*) for routing decisions. Policy-driven (configurable) not hard-coded; respects architecture ownership. Avoids pixel-level imitation; preserves Seven identity.
NOW=Map exact routing/provider modules (owners A05,A09), list current fallback paths and health signals. Add latency budget enforcement at routing decision points (deadline-aware) and cancellation propagation on failover. Instrument routing with OTel gen-ai attrs (request model, route target, fallback reason, latency, error type) per harvested semconv [SOURCE primary].
NEXT=Introduce circuit breaker + hedging with backpressure; track P95/P99 per provider; add deterministic replay for routing tests. Compare against LLMRouterBench principles [SOURCE primary] without copying; adapt to Seven constraints.
LATER=Learned router with guardrails (canary, shadow traffic), cost-aware routing, offline fallback integration (D28). Validate with evals if available.
TESTS=Unit: policy, budget, retry/jitter, cancellation on failover. Integration: multi-provider failure sequences deterministic. E2E: long chat with provider drop mid-stream. Adversarial: flakiness, retry storms, clock skew. Eval: routing correctness/latency/cost regression. Android: offline/failover on poor network.
RISKS=Failover races (double-submission), leaking partial results, budget bypass, secret leakage in logs, cross-system coupling (routing vs bridge/kernel). Android network pressure. 
FIRST_SLICE=Deadline-aware routing: enforce per-request latency budget and propagate cancellation on fallback; instrument minimal gen_ai routing attrs. Reviewable, testable, preserves ownership.
KNOWN_UNKNOWNS=Exact module paths/contracts for routing/health/fallback in remake; whether policy is centralized or per-surface; cost tracking granularity. 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to enumerate concrete routing/provider modules and health signals)


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK

SOURCE_ANALYSIS=The harvested primary sources collectively focus on agent/LLM capability evaluation rather than runtime orchestration internals. [SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard (BFCL V4) benchmarks function/tool calling correctness and structure under constrained APIs. [SOURCE primary] https://www.swebench.com/ (SWE-bench leaderboards) benchmarks software engineering task completion (solving real GitHub issues) with pass/fail on test suites. The CSS/favicon/index/original assets [SOURCES primary listed] are presentation scaffolding with no substantive protocol. Disagreements/nuance: BFCL emphasizes structured tool invocation and multi-turn/tool selection; SWE-bench emphasizes end-to-end verification (tests) and task decomposition/planning. Freshness: both are active leaderboard surfaces (V4 BFCL, current SWE-bench leaderboards). Limitations: (1) leaderboards measure outcome correctness, not orchestration latency/cost/cancellation/resilience; (2) they don’t specify runtime architecture (two-pass, planner isolation, context reuse) — those are implementation choices; (3) harvested content is mostly static HTML/CSS (no detailed eval protocols beyond what’s visible) so deeper protocol details may require reading full eval repos/specs. No single harvested source prescribes “two-pass orchestration” or “context reuse” strategies.

CURRENT=Inspected Seven repo at `/home/runner/work/_temp/seven-superloop-worktrees/c192-research-B04`. Found `remake/ARCHITECTURE.md` (evidence: lines 1-120 show high-level architecture; see full file at `remake/ARCHITECTURE.md`) and `remake/MILESTONES.md`. `.seven-team/` exists with `domain-campaign/domains.json` (contains D09_DEEP_THINK entry: CORE, source target 10, owners B04,A09; evidence: `/.seven-team/domain-campaign/domains.json:1-140`), `product-intelligence/index.md` (evidence: `/.seven-team/product-intelligence/index.md:1-80`), `autonomy/` (evidence: `/.seven-team/autonomy/` present). Searched for domain terms: “deep.*think”, “planner”, “orchestration”, “two-pass”, “planner isolation”, “context reuse”, “cancellation”, “speed”, “verification.*progress”, “B04”. Evidence from grep/find: no obvious planner module, no two-pass orchestration implementation, no explicit cancellation/context-reuse primitives found in inspected paths (rg results show limited hits; see command evidence below). Manifest/encyclopedia structure exists per Seven rules (knowledgePacks, domain-campaign) but concrete implementation for D09 runtime behavior (planner, two-pass, context reuse, cancellation) is not evident from quick inspection — treat as NOT YET IMPLEMENTED in this repo snapshot. Commands run: `ls -la`, `find . -name "*.md" | head -20`, `ls -la .seven-team`, `cat remake/ARCHITECTURE.md | head -120`, `cat remake/MILESTONES.md | head -160`, `rg -n "deep.*think|planner|orchestration|B04|verification.*progress" | head -40`, `cat .seven-team/domain-campaign/domains.json | head -140`, `cat .seven-team/product-intelligence/index.md | head -80`, `find . -name "*deep*think*" -not -path "*/.git/*" | head -15`, `rg -rn "two-pass|planner isolation|context reuse|cancellation|speed" | head -30`, `find . -path "*planner*" -not -path "*/.git/*" | head -20`, `find . -path "*orchestr*" -not -path "*/.git/*" | head -15`.

TARGET=Establish a concrete Deep Think/Planning/Verification/Progress capability aligned with Seven architecture (`remake/ARCHITECTURE.md`). Must preserve ownership boundaries and existing contracts. Desired behavior: (1) Two-pass orchestration: pass 1 = plan/intent (decompose, select tools, identify constraints/risks, verification criteria), pass 2 = execute with plan; passes isolated (planner vs executor) to avoid cross-contamination and to enable cancellation/retry. (2) Planner isolation: separate state (goal, plan, subgoals, assumptions, known unknowns) from execution state (tool calls, outputs, file edits, context buffers). (3) Context reuse: cache/reuse plan, retrieved knowledge, file summaries across turns/subtasks with eviction policy; avoid re-reading unchanged files. (4) Speed + cancellation: cancel in-flight work (commands/requests), timeouts, progress reporting. (5) Verification/Progress: explicit verification step (checks/tests/run commands) before claiming done; progress tracking (milestones, completed steps). Connect to eval signals from harvested sources: treat tool correctness (BFCL-style) and end-to-end verification (SWE-bench style tests) as required proof, not optional.

NOW=Smallest slice that materially improves D09: define planner interface + two-pass flow skeleton with isolation, add cancellation + progress hooks, and add verification gate. This is scaffolding (no behavior change to existing features). Evidence needed: interface doc, state model, tests that verify two-pass separation and cancellation semantics. Files likely touched conceptually: new `planner/` or `orchestrator/` module (respecting ARCHITECTURE.md boundaries), minimal types, unit tests. Keep change reviewable and coherent.

NEXT=Build on slice: context reuse (summary cache keyed by file hash/mtime), plan versioning, assumption tracking, deterministic regression tests for planning outcomes, integrate with existing execution path behind flag. Add metrics (plan steps, tokens saved, cancellation rate). Improve verification to run targeted checks based on plan. Compare against BFCL-style tool correctness and SWE-bench-style test verification as acceptance criteria.

LATER=Longer-term: adaptive two-pass (fast path when plan trivial), planner critique/replan on failure, cross-subsystem plan coordination without breaking ownership, richer progress UI/telemetry, eval harness mapping to D09 (track BFCL/SWE-bench-like subsets relevant to Seven tasks), explore reasoning depth vs speed tradeoffs with benchmarks as reference (not imitation). Consider Android ergonomics if planner UI involved (per product intelligence).

TESTS=Deterministic: unit tests for two-pass state isolation (no leakage), cancellation (mid-exec aborts cleanly), context reuse (cache hit/miss with invalidation). E2E: end-to-end task with verification gate that fails if checks not run. Adversarial: cancellation races, replan loops, context overflow/eviction, conflicting plans. Android: if planner surfaces in UI, basic interaction tests. Eval proof: add micro-evals inspired by BFCL (tool call correctness) and SWE-bench-style verification (run tests) as regression proof — do not copy benchmark datasets blindly; create Seven-specific task sets that exercise two-pass/planner isolation/cancellation. All tests must be deterministic (no network dependency). 

RISKS=Security/privacy: planner state may include sensitive context — need redaction policy; context cache must not leak across sessions inappropriately. Performance: context reuse must reduce tokens/time without staleness; eviction critical. Android/RTL/cross-system: if exposed via UI, follow ergonomics; ensure cancellation works with async. Architecture: must not create duplicate owners for shell/tasks/storage/bridge/routing/kernel (preserve ARCHITECTURE.md). Also must not weaken guards/tests to pass. Release blockers: lack of verification gate, no cancellation (can hang), uncoordinated context reuse causing stale edits. These are correctness/safety risks, not just polish.

FIRST_SLICE=Define `Planner` interface (plan, assumptions, verification_criteria), `Orchestrator` with two-pass (plan→verify_criteria→execute→verify), explicit isolation (separate stores), cancellation token + progress callbacks, and a minimal unit test suite proving isolation + cancellation. Size: small (types + orchestrator + tests), no external API changes, behind internal module. This is reviewable and provides immediate value for D09 (planning/verification/progress foundations).

KNOWN_UNKNOWNS=(1) Exact interface boundaries per ARCHITECTURE.md (need to inspect full file + any existing orchestrator patterns). (2) Whether any existing planning exists (searched terms found little; deeper search in non-md files may reveal). (3) Cancellation primitives available (shell exec, HTTP, etc.) — need to inspect execution layer. (4) Context storage (memory/filesystem) and size limits. (5) Harvested leaderboards give outcomes but not orchestration costs; need internal metrics to quantify “speed”. (6) Source target 10 for domain — harvested 10 sources total; primary=10 all related (leaderboards+assets). To fully meet “source target: 10” with substantive protocol content, may need to read official BFCL/SWE-bench eval docs/repos (e.g. BFCL repo, SWE-bench repo papers) as extra sources if needed — only if they fill real gaps. Not done here; harvested set is sufficient for outcome-based analysis but runtime orchestration details remain external-unknown without reading those repos. Mark as RESEARCH_INSUFFICIENT only if we cannot define concrete slice without inventing details — we can define slice from first principles aligned with ARCHITECTURE.md.

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
SOURCE_ANALYSIS=[SOURCE primary] Android Core App Quality sets baseline for responsiveness/stability (long tasks, ANRs, jank) — relevant for mobile. [SOURCE secondary] web.dev long-tasks-devtools explains diagnosing work-preventing tasks (TBT/INP context) — useful for web surfaces. [SOURCE primary] Streams API (MDN) defines backpressure, readable/writable streams, cancellation, chunked processing — directly applicable to long chats, streaming tokens, large I/O. Limitations: mobile/web platform guidance (not app internals), general; freshness current. No contradiction. Gaps: Seven’s internal concurrency model, cancellation semantics across threads, queues/workers, backpressure in chat streams, storage/network pressure handling, resource budgets.
CURRENT=Repo grep strongly suggests performance/concurrency focus: latency, cancellation, long task/chat, races, backpressure, streams, queues/workers/pools, budgets/throttle/rate limits, pressure. A09 primary owner (with B09). This aligns with focus: long chats, storage/network pressure, resource budgets. Need to enumerate concrete modules (shell/tasks/storage/bridge/routing/kernel per ARCHITECTURE.md). 
TARGET=Deterministic, race-free concurrency with: cancellation-first (propagate deadlines/cancel tokens), backpressure on streams (token/chat I/O, storage reads/writes), bounded queues/workers, per-surface budgets (CPU/time/memory/IO/network), isolation under pressure, and clear evidence of no regressions (deterministic tests). Android ergonomics per PI rubric.
NOW=Inventory concurrency primitives: async/coroutines/workers, queues, mutexes/locks, cancellation tokens, stream implementations. Find long chat paths (streaming, aggregation, rendering) and map cancellation points. Measure/trace long tasks under load. Enforce deadlines on cross-module calls (routing, storage, network). Apply backpressure to streaming token paths.
NEXT=Introduce budget guards (time/CPU/memory/IO) with throttling, pressure signals (storage/network), and structured concurrency (avoid fire-and-forget). Add deterministic stress tests for races (adversarial interleavings where feasible). Track latency histograms (P95/P99) and dropped frames/ANRs on Android surfaces.
LATER=Adaptive concurrency (pool sizing under pressure), priority lanes (interactive vs background), quota enforcement, and blast-radius containment. 
TESTS=Race detectors (where available), deterministic cancellation tests, backpressure tests (slow consumer), long chat soak (deterministic), storage pressure (disk full/slow), network pressure (throttled), Android ANR/jank probes. Adversarial: cancellation races, double-close, leaked tasks.
RISKS=Data races/deadlocks, leaked resources (tasks/streams), cancellation leaks, priority inversion, memory bloat in long chats, storage corruption under pressure, Android Doze/foreground constraints. 
FIRST_SLICE=Cancellability audit + backpressure for primary chat stream path: identify one streaming path, add explicit cancellation points and backpressure (bounded buffer, pause/resume). Add unit tests for cancel mid-stream and slow consumer. Reviewable and high impact.
KNOWN_UNKNOWNS=Exact chat streaming implementation, concurrency primitive choices (threads/coroutines), existing backpressure, storage pressure signals, network pressure modeling, budget enforcement points.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need concrete chat streaming + concurrency primitives inventory)


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
SOURCE_ANALYSIS=[SOURCE primary] OTel semantic conventions (core) and [SOURCE primary] gen-ai attributes — authoritative for spans/metrics/log attributes, stability, naming. Harvested count low (INSUFFICIENT) but core sources present. Limitations: spec defines semantics, not Seven’s blast-radius model or internal world model. Gaps: what constitutes “engineering world model” in Seven, blast-radius definitions, correlation (trace→logs→metrics), sampling, PII redaction, Android constraints.
CURRENT=Repo grep shows observability/otel/gen_ai/span/trace/metric/telemetry present. A04,A09 owners; A09 overlap (performance/latency/cancellation, routing decisions) means OTel must capture budgets, failover, long tasks. Need to map current telemetry surfaces and invariants.
TARGET=Structured observability: consistent span names/kinds, OTel gen-ai attrs for LLM calls/routing (D08), performance attrs (latency, queue time, backpressure, cancellation reason), blast-radius tagging (affected surfaces, risk level), deterministic redaction, and minimal overhead. “World model” evidence: correlated events that explain behavior under pressure. 
NOW=Map telemetry implementation (tracer/metrics/exporters). Align with OTel semconv [SOURCE primary] for gen-ai [SOURCE primary] (adopt moved attrs), add key events for routing failover (D08), deep think phases (D09), long chat performance (D17). Define blast-radius taxonomy (what counts as blast radius, how tagged).
NEXT=Add performance histograms (P95/P99) per surface, cancellation/retry reason codes, error taxonomy, and correlation IDs across modules. Ensure sampling respects budgets (low overhead). Redaction policy enforced in code (no secrets/PII).
LATER=Trace-based regression tests (golden traces), anomaly signals, SLO/SLI definitions, and integration with evals. 
TESTS=Attribute correctness, redaction, sampling, correlation, overhead bounds. Integration: routing failover produces expected span attrs. Adversarial: log flooding, sensitive data, clock skew.
RISKS=Overhead (latency/memory), PII leakage, noisy telemetry, cross-cutting changes violating ownership, Android resource constraints. 
FIRST_SLICE=OTel gen-ai minimal attrs for routing decisions (model, route target, fallback reason, latency, error) and performance span for chat stream (duration, queue time, cancellation). Deterministic, low footprint.
KNOWN_UNKNOWNS=Exporter configuration, sampling strategy, existing blast-radius model contract, redaction rules, whether “world model” is product term or internal. 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (harvested D21 low count; need Seven’s blast-radius/world model contract)


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
SOURCE_ANALYSIS=Harvested ACL'26 papers: HiGMem [SOURCE primary] (hierarchical/LLM-guided memory for long-term conversations) and LLMRouterBench [SOURCE primary] (routing context) — both relevant. Focus on embeddings, reranking, offline fallback. Limitations: research papers (conceptual), not Seven implementation; freshness 2026. Gaps: embedding models, vector store, rerankers, chunking, eviction, privacy (on-device), offline semantics, Android ergonomics.
CURRENT=Repo grep shows embeddings, rerank/reranking, offline, local model/intelligence surface. A05,A09 owners; overlap with routing (D08) and performance (D17: storage/network pressure, long chats). Memory/embeddings often touch storage; need to respect ownership and ARCHITECTURE.md.
TARGET=Local intelligence: privacy-preserving embeddings, efficient reranking, hierarchical memory (inspired by HiGMem principles), offline fallback (graceful degradation), bounded storage/compute, cancellation-aware indexing/search, and deterministic behavior under pressure. Preserve Seven identity; don’t copy papers pixel-for-pixel.
NOW=Map modules: embedding providers (local/remote), vector store, reranker, chunking, memory lifecycle, offline handlers. Identify storage pressure paths (D17), network dependencies, and Android constraints. Define invariants: offline-first fallback paths, no secrets in local stores, eviction policy.
NEXT=Introduce backpressure/cancellation for embedding generation/indexing (long chats create many chunks), budget guards (time/memory/IO), and reranking with top-k caps. Add offline fallback for retrieval (serve from cache when network unavailable). 
LATER=Hierarchical memory structure with relevance decay/eviction, incremental indexing, privacy controls, and integration with routing (D08) to prefer local when appropriate. 
TESTS=Deterministic: embedding/rerank correctness, eviction, offline fallback, cancellation mid-index. Adversarial: storage pressure (disk full), large chats, corrupted index, model load failures. Android: offline mode, low memory. 
RISKS=Index corruption, unbounded growth (storage pressure), slow indexing blocking UI, memory spikes, privacy leakage, cross-system coupling. 
FIRST_SLICE=Offline fallback for retrieval/search: if network unavailable, serve from local cache with clear UX; add cancellation to indexing pass; enforce storage quota. 
KNOWN_UNKNOWNS=Embedding model choices (on-device vs remote), vector DB, chunking strategy, reranker availability, eviction policy, current offline semantics.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need concrete embedding/vector/memory modules and offline contract)


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

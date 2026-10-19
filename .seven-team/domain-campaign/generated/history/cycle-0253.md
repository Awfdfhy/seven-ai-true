# Seven Domain Roadmaps — cycle evidence

Ready domains: 9/30
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
SOURCE_ANALYSIS=Harvested 20 sources (11 primary). Papers: Mem0 (2504.19413) production-ready LTM, Zep temporal KG (2501.13956), LongMemEval (2410.10813), MemX local-first (2603.16171), Memoria scalable agentic (2512.12686), TeleMem multimodal (2601.06037), context-driven retrieval benchmark (2609.03467), UTILMEM evidence utilization (2608.30508). Practical: Letta memory blocks/dreaming, Zep Graphiti episodes/facts/context-types, Mem0 research (LoCoMo/LongMemEval/BEAM). MDN IndexedDB for local persistence. LangGraph/DeepAgents thinking context. 
Disagreements/freshness: research is recent (2024-2026) but benchmarks evolve (LoCoMo/LongMemEval emphasize retrieval quality/token cost). Tradeoffs: KG+temporal (Zep) vs vector+extrinsics (Mem0) vs local-first (MemX). Limitations: many arXiv preprints; implementation details vary. Harvest sufficient (20 sources) with primary focus on theory+systems.

CURRENT=Seven has `memory.cjs` + `memory-results.json` present (repo evidence). Architecture requires preserving kernel/shell/tasks/storage/bridge/routing/kernel ownership (no duplicate owners). Memory is subsystem under storage/context fabric per naming; current state shows memory module + results file exists — treat as implemented slice but need verification against product contracts. Must inspect actual memory.cjs behavior, invariants, persistence (IndexedDB vs file), retrieval, timeline/episodes if present.

TARGET=Deterministic, testable LTM: episode ingestion, fact extraction/relationships, bi-temporal validity (valid_at/invalid_at) where applicable, context-driven retrieval (not just query-time), evidence-grounded responses with provenance, local-first where possible, token-budget aware (recall vs cost), cross-session persistence, privacy (no secret leakage). Align with Mem0 efficiency claims and Zep point-in-time queries; benchmark against LongMemEval/LoCoMo style checks. Respect Seven identity.

NOW=Verify memory subsystem against contracts: read `memory.cjs`, `memory-results.json`, any memory tests, and `.seven-team/autonomy/` memory-related contracts. Define invariants (e.g. episode idempotency, fact provenance, retrieval determinism, no PII leakage). Add deterministic unit tests for extraction/retrieval; regression against stored results.

NEXT=Implement context-driven retrieval (proactive recall) with evidence utilization scoring (UTILMEM-inspired), episode lifecycle, relationship updates, invalidation. Add token-cost tracking. Local persistence (IndexedDB) with schema + migration safety.

LATER=Multimodal hooks, graph-based reasoning, memory compaction/pruning with policies, LongMemEval/LoCoMo integration into eval suite, adversarial tests (hallucinated facts, timeline corruption).

TESTS=Unit (extraction, retrieval, scoring), contract (episode→facts→context), integration (cross-session), regression against `memory-results.json`, determinism (fixed seeds), token-cost assertions, privacy (no secrets), adversarial (injection into episodes). E2E via eval harness.

RISKS=Storing sensitive user data; over-recall inflating tokens; timeline corruption; schema migrations; duplicate owners (memory vs storage/kernel). Android storage constraints. Must preserve architecture.

FIRST_SLICE=Read `memory.cjs` + results, write deterministic unit tests for core paths, define invariants in test names; verify retrieval correctness + cost. Smallest slice that proves memory behavior is testable.

KNOWN_UNKNOWNS=Exact memory API surface in Seven (episodes/facts/context-types), persistence backend, retrieval scoring, benchmark integration. Need to inspect code + autonomy contracts.

DOMAIN_VERDICT=READY_FOR_PLAN (harvested 20 sources sufficient; repo has memory evidence to inspect)


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Harvested 20 sources (17 primary). MCP 2026-07-28 tools spec + Tasks extension (draft), TS SDK v2 + migration. OpenAI function/tool calling guides (programmatic). BFCL V4 leaderboard. Benchmarks: ToolSandbox (stateful conversational), τ-bench (tool-agent-user real domains), AgentDojo (prompt injection), AgentDyn (deployability in dynamic env), Adaptive eval of OOB defenses. OWASP Top 10 Agentic Apps 2026 + LLM06:2025 Excessive Agency + community update. 
Disagreements: capability vs safety tension (agency vs least privilege). Freshness strong (MCP 2026-07-28 recent). Limitations: some arXiv preprints, BFCL focuses on single-turn tool selection; τ-bench/ToolSandbox closer to interactive. Harvest sufficient.

CURRENT=Seven is agent system (Codex CLI context) with tools/capability graph implied. Manifest/arch define subsystems (kernel/shell/tasks/storage/bridge/routing). Need to inspect how tools are registered, capability graph, permissions model, approval policy. Repo shows `verify.cjs`, `runtime-smoke.cjs` — may test tool paths. No duplicate owners rule critical.

TARGET=Principled tool system: capability graph (who can call what), least privilege, per-tool permissions, approval/escalation, task-scoped capabilities, deterministic tool schemas, type-safe (TS SDK aligned), task lifecycle (MCP Tasks extension awareness), safety controls (OWASP agentic). Measurable via BFCL/τ-bench style checks in evals. 

NOW=Map tool surface in Seven: list registered tools, capability graph, permission checks, approval flow. Inspect code for tool registry, sandbox/permissions, any tool tests. Compare to MCP 2026-07-28 shapes; identify gaps (capability graph, task-scoped perms). Define invariants (least privilege, no ambient root tools).

NEXT=Capability graph model (edges: role→tool, context→allowed), task-scoped permissions, dry-run/preview, tool result validation, idempotency keys, timeouts, circuit breakers. Add programmatic tool-calling tests.

LATER=Adversarial evals (AgentDojo-style prompt injection, out-of-band), excessive agency scanner, τ-bench domains, BFCL integration subset, provenance/audit log for tool calls.

TESTS=Contract (schema validation), permission (deny-by-default), idempotency, timeout, error taxonomy, adversarial (injection), regression. Deterministic mocks.

RISKS=Excessive agency, prompt injection, privilege escalation, capability graph complexity, breaking existing flows. Preserve subsystem ownership.

FIRST_SLICE=Inventory tools + capability checks; write contract tests for tool schemas + permission deny cases; smallest proof of least-privilege model.

KNOWN_UNKNOWNS=Tool registry location, capability graph impl, approval model details, MCP integration status. Need code inspection.

DOMAIN_VERDICT=READY_FOR_PLAN


# D04_CODING_SYSTEM — Coding Agent / Repo Map / Edit-Test-Verify

Research audit: READY

DOMAIN_ID=D04_CODING_SYSTEM
SOURCE_ANALYSIS=Harvested 14 sources (14 primary). SWE-bench (leaderboards, FAQ) — gold standard for issue→fix. SWE-agent (NeurIPS 2024) — agent scaffolding for coding tasks. GitHub Copilot custom agents docs. 
Disagreements: pass@k vs real issue resolution; environment setup heavy. Freshness current (SWE-bench active). Limitations: SWE-bench focuses on Python repos; environment complexity. Harvest sufficient.

CURRENT=Seven is coding agent (Codex CLI context). Has `remake/` (architecture/milestones), docs, build artifacts. Test via node:test + verify.cjs. Need to inspect edit-test-verify loop, repo map, patch/apply flow, test selection (proactive vs interactive per instructions), validation philosophy. Also AGENTS.md style rules apply.

TARGET=Deterministic edit-test-verify: repo map/index, safe edits (apply_patch), focused tests (start specific to changed code), avoid unrelated fixes, root-cause fixes, evidence-backed changes, regression proof. SWE-bench inspired discipline: run minimal failing tests first, iterate, verify. Track invariants touched.

NOW=Inspect coding flow: how edits applied, test running, validation gates. Read verify.cjs (what it checks). Map test layout (node:test discovers *.test.* or spec). Identify smoke vs full tests. Define coding invariants per arch.

NEXT=Repo map (symbols, ownership, imports), test impact analysis (affected tests), focused test runner wrapper, patch validation, flake detection basics. Deterministic test ordering.

LATER=SWE-bench subset integration (sandboxed), mutation testing hooks, coverage gates for changed code, regression proof bundles.

TESTS=Focused unit/integration, smoke via runtime-smoke.cjs, verify via verify.cjs, deterministic, no unrelated test changes. E2E where relevant.

RISKS=Over-testing, fixing unrelated bugs, slow validation, environment drift. Must follow validation philosophy (interactive vs non-interactive). 

FIRST_SLICE=Understand verify.cjs + node:test setup; write focused test for a small change path; document edit-test-verify checklist. Smallest improvement to release assurance discipline.

KNOWN_UNKNOWNS=Test discovery, CI/local parity, flake rate, repo indexing. Need inspection.

DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D07_RESEARCH_WEB
SOURCE_ANALYSIS=Harvested 4 sources; harvest marked INSUFFICIENT. Primary: BrowseComp PDF (openai.com). Secondary: Springer article + assets (client challenge). 
Limitations: PDF only (content not fully harvested), Springer article blocked by client challenge in harvest. Missing key retrieval/citation practices, evidence standards. Need to fill gaps with authoritative sources: BrowseComp (benchmark details), evidence hierarchies (official specs first), citation requirements, retrieval evals (RAG, BEIR-like), provenance. 
Gap: need to read BrowseComp details, evidence quality rubric enforcement, anti-hallucination (cite URLs, never invent). 

CURRENT=Seven requires product intelligence + domain campaign with harvested URLs as evidence; aesthetic claims weak without runtime/screenshot evidence. Also must distinguish browser/mock/Android build/installed-device evidence. Research discipline: read index/quality rubric, inspect relevant packs.

TARGET=Evidence-first research: prefer official specs/docs, primary papers, recognized benchmarks. Record URLs + exact lessons. Meet source targets. If insufficient, mark RESEARCH_INSUFFICIENT. Never invent sources. Provenance required.

NOW=Fix harvest gap for D07: fetch BrowseComp page summary (not just PDF asset), evidence standards (citation, URL verification), retrieval benchmarks. Read .seven-team/product-intelligence/sources/OFFICIAL_SOURCE_MAP.json, quality rubric.

NEXT=Research workflow: URL allowlist from OFFICIAL_SOURCE_MAP, harvest log with timestamps, credibility scoring, disagreement tracking, freshness checks.

LATER=Automated citation validation, source staleness alerts, evidence graph.

TESTS=Deterministic research checklist (all URLs verified, tags correct, gaps labeled). Contract: no invented evidence.

RISKS=Sloppy citations, scope creep (over-crawling), marking sufficient when not. 

FIRST_SLICE=Close D07 harvest gap: pull BrowseComp page (openai.com/index/browsecomp/) details + evidence rubric. Update research checklist. Smallest fix.

KNOWN_UNKNOWNS=BrowseComp task details, exact evidence rubric text, retrieval corpus standards. Marked INSUFFICIENT in harvest.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (harvest incomplete for retrieval/citations; must fill gap before finalizing)


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

Research audit: READY

DOMAIN_ID=D16_NETWORK_RESILIENCE
SOURCE_ANALYSIS=Harvested: MDN AbortController (cancellation/timeouts) [SOURCE primary], Streams API (streaming, backpressure, partial consumption) [SOURCE primary], OpenTelemetry semantic conventions (network spans/attributes, errors) [SOURCE primary]. Collectively prescribe: cancellable requests, per-request timeouts, retry with backpressure/idempotency awareness, streaming error handling (abort mid-stream), proper connection error classification, and observable telemetry. Gaps/limits: harvest gives API refs + semconv; concrete retry policy (jitter, max attempts, circuit breaker) not fully captured; offline detection strategy not explicit. Freshness current. Limitation: need to map to Seven's transport (browser/CLI/Android) and existing HTTP client.

CURRENT=Repo inspected for network terms. Found matches via rg: AbortController, retry, timeout, fallback, offline, rate limit, partial failure, error normalization mentioned in codebase (grep returned results) — specific files not fully enumerated in header but terms exist. **Evidence**: `rg -n "AbortController|retry|backoff|timeout|fallback|offline|rate.limit|partial.*fail|error.*normalize"` ran (40 matches). Need to read actual implementations: HTTP client wrappers, fetch usage, streaming, offline state, retry policies. Also check for idempotency keys, circuit breakers, per-endpoint budgets. Architecture likely has networking layer; must preserve ownership (B07,A05).

TARGET=Robust resilience: per-request timeout via AbortController [SOURCE primary]; retry with exponential backoff+jitter, retry-after respect, max attempts, idempotency gating; fallback paths (stale/cache) on failure; offline detection + queuing with backpressure; partial failure handling (streaming chunks) with resume where safe [SOURCE primary]; error normalization (network vs HTTP vs timeout vs abort) with stable codes; telemetry via OTEL semconv for network spans (http.* attrs, error) [SOURCE primary]. Deterministic behavior under faults.

NOW=First high-value slice: classify request errors (timeout/abort/network/HTTP) consistently. Add per-request AbortController timeout (configurable). Introduce retry policy with jitter and retry-after header handling. Gate retries by idempotency (GET safe, mutations explicit). Add basic circuit breaker per host (open/half-open) to prevent cascading failures. Log with OTEL-compatible network attrs [SOURCE primary]. 

NEXT=Streaming resilience: handle stream aborts, partial chunk errors, backpressure (Streams API) [SOURCE primary]; reconnect with bounds for SSE/streaming responses; partial content handling. Offline mode: detect, defer writes, show stale-with-timestamp on read, retry queue with max age. Rate limiting integration (client-side backpressure, honor 429). Fallback strategies (local cache, degraded mode). 

LATER=Adaptive retry (based on failure type), hedging for tail latency, connection pooling awareness, Android connectivity changes, cross-tab offline sync, chaos tests (fault injection). 

TESTS=Deterministic: timeout fires, abort cancels, retry-after honored, jitter within bounds, circuit breaker transitions, idempotency prevents unsafe retry. Integration: partial stream abort recovers cleanly [SOURCE primary]. E2E: offline→online sync, 429 rate limit backoff. Adversarial: slowloris-like timeouts, flaky network, chunked corruption. Android: connectivity broadcast handling. Telemetry: spans include http.status, error.type per OTEL semconv [SOURCE primary]. 

RISKS=Performance: retry storms without jitter/circuit breaker (DOS self). Correctness: retrying non-idempotent requests causes duplicates. Security: leaking sensitive data in fallback caches. UX: silent retries confusing users (tie to D27). Android: Doze/network changes. Cross-system: ownership (B07,A05) — no duplication. Architecture: must not violate `remake/ARCHITECTURE.md`.

FIRST_SLICE=Smallest: add `NetworkError` taxonomy (Timeout, Abort, Network, Http(status, body), Canceled) and normalize fetch errors. Introduce `withTimeout(req, ms)` using AbortController [SOURCE primary]. Add retry wrapper with exponential+jitter, retry-after, idempotency allowlist. Add circuit breaker (host-scoped) with thresholds. Feature-flagged initially; apply to one high-traffic call path. Emit minimal OTEL network span fields [SOURCE primary].

KNOWN_UNKNOWNS=Existing HTTP client stack (fetch/axios/custom) and its config not fully read yet. Current timeout/retry implementation details unknown (need to inspect files from rg results). Offline detection mechanism (browser vs Node/CLI/Android) unclear. Streaming usage (SSE/WebSocket/ReadableStream) prevalence unknown. Rate limit policy alignment across subsystems unclear. Circuit breaker state storage (in-mem vs persistent) not specified.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (pending reading actual network client code, streaming paths, offline state, and `remake/ARCHITECTURE.md` for ownership/invariants)


# D17_PERFORMANCE_CONCURRENCY — Performance / Concurrency / Long Chat / Races

Research audit: INSUFFICIENT

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D18_TESTING_EVALS — Testing / Evals / Mutation / Visual / Release Evidence

Research audit: READY

DOMAIN_ID=D18_TESTING_EVALS
SOURCE_ANALYSIS=Harvested 12 sources (10 primary). SWE-bench, BFCL V4 (Berkeley Function Calling), Playwright visual comparisons + emulation. 
Coverage: unit/contract/integration/E2E, visual regression, emulation (device/viewport), evals/leaderboards. 
Disagreements: snapshot flakiness (need deterministic env), emulation vs real devices. Limitations: leaderboards show aggregate; need domain-specific. Harvest sufficient.

CURRENT=Seven has node:test (`test`), custom `verify.cjs`, `runtime-smoke.cjs`, `eval/` dir, `evolution/` dir. Memory has results. Release artifacts present. 
Need to assess: test organization, coverage of critical paths, contract tests, E2E, visual (Playwright mentioned), mutation, release evidence. A08 owns testing/release assurance.

TARGET=Robust test pyramid: unit (fast, focused), contract (schemas/invariants), integration (cross-subsystem), E2E (journeys), smoke, adversarial, evals. Release evidence bundle (artifacts, hashes, verification logs). Deterministic, no weakened guards. Visual comparisons with stable baselines. 

NOW=Audit existing tests: run `node --test` to see current tests, inspect verify.cjs gates, runtime-smoke.cjs. Catalog what’s tested vs release blockers. Define release evidence schema.

NEXT=Contract test harness for critical invariants (arch ownership, permissions, memory, tools), focused test selector (affected files), snapshot stability (Playwright visual with fixed viewport/timezone), flake detection. Release evidence generation (sha256, logs).

LATER=Mutation testing, property-based tests for core logic, τ-bench/AgentDojo style eval integration, BFCL subset for tools, visual regression in CI-like env, Android device evidence separation.

TESTS=Deterministic unit/contract/integration, smoke, verify gates all green, visual with consistent env, adversarial. Release evidence must be reproducible.

RISKS=Flaky snapshots (fonts/animation), emulation drift, overloading verify, weakening tests. Android vs browser evidence confusion — must distinguish explicitly.

FIRST_SLICE=Run `node --test` and inspect results; strengthen verify.cjs with explicit release evidence checks (artifacts exist, hashes). Smallest improvement to release assurance.

KNOWN_UNKNOWNS=Current test count/pass, flake issues, visual baseline state, eval harness API. Need to run tests.

DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D24_RELEASE_APK
SOURCE_ANALYSIS=Harvested 10 sources (10 primary). Android app signing (official), Core app quality guidelines (official). Localized pages included. 
Focus: release identity (signing keys, package id, versionCode/versionName), Play App Signing model, core quality (stability, UX, permissions, size), installed-device evidence vs build evidence vs mock. 
Harvest sufficient (official Android docs).

CURRENT=Has `apk/` dir, `release/` dir present. Also Capacitor config: `capacitor.config.json` exists. Need to inspect contents (APK files, signing info, release notes, checksums, provenance). Must distinguish Android build evidence vs installed-device evidence (explicit requirement).

TARGET=Release assurance for APK: identity chain (source→build→signed artifact), signing config documented (without secrets), checksums (sha256), versioning, core quality checks, release evidence bundle. Installed evidence only when obtained from real device (explicitly labeled). No secret exposure.

NOW=Inspect `apk/`, `release/` contents: list files, sizes, checksums if present. Check `capacitor.config.json`. Verify identity fields. Document what evidence exists vs missing.

NEXT=Release evidence manifest (artifact paths, sha256, build metadata, signing method), identity verification script, core quality checklist (stability, permissions, crashes), separation of evidence types (build vs installed). 

LATER=Automated signing verification (if public cert), Play integrity hooks, size/bundle analysis, Android vitals checks, reproducible builds where feasible.

TESTS=Artifact integrity (checksums), version consistency, config validation, release manifest schema, no secrets in repo.

RISKS=Leaking signing keys, mixing build/installed evidence, version mismatch, incomplete provenance. Never weaken security policies.

FIRST_SLICE=Catalog `apk/` + `release/` with sha256, create release evidence manifest (deterministic). Smallest proof of release identity.

KNOWN_UNKNOWNS=Whether APKs are signed, with what key, versioning, build reproducibility, installed evidence present.

DOMAIN_VERDICT=READY_FOR_PLAN


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
SOURCE_ANALYSIS=Harvested: Android Core App Quality guidelines [SOURCE primary] (stability, errors, empty/loading states, recovery paths, user-visible errors), WCAG 2.x overview [SOURCE primary] (perceivable/operable/understandable/robust; error identification, suggestions, focus management). Sources emphasize: clear error messages (human-readable, actionable), retry/recover affordances, loading/empty states with purpose, avoid blocking flows, preserve context, accessibility (labels, roles, focus). Limits: harvest snippets are high-level; need specific patterns (inline vs banner vs modal), error boundaries, skeletons, offline indicators. Freshness current. 

CURRENT=Repo likely has UI surfaces; need to find error/loading/empty components. Search terms: error boundary, snackbar/toast, empty state, loading spinner/skeleton, retry button, offline banner. **Evidence**: initial grep covered general terms; need to inspect UI components. Architecture must preserve cohesion and Android ergonomics per Product Intelligence. No aesthetic claims without runtime evidence.

TARGET=Seven-aligned UX: consistent error taxonomy (map from D16 NetworkError to user-safe messages), actionable recovery (Retry, Go Back, Contact/Support where relevant), loading states (skeletons for lists, progress for long ops), empty states (explanation + CTA), offline indicators, partial failure messaging ("X items failed to load"), graceful degradation. Meet WCAG: error identification (3.3.1), labels/instructions, focus on errors [SOURCE primary]. Meet Android Core App Quality: responsive, stable, clear errors, recoverable [SOURCE primary]. Preserve Seven identity (hierarchy/density/clarity/discoverability/feedback/motion/Android ergonomics/cohesion) per PI rubric.

NOW=First high-value slice: map `NetworkError` taxonomy (D16) to user-facing strings with safe redaction. Create reusable `ErrorState`, `EmptyState`, `LoadingState` components with slots for actions. Add `RetryButton` with loading state. Error boundary for component trees. Offline banner with "Retry" action. Ensure keyboard focus moves to error on form validation; ARIA live regions for dynamic errors [SOURCE primary].

NEXT=Partial failure UX: list-level "Load failed" with "Retry failed items" + details collapsed. Optimistic updates with rollback + error feedback. Rate limit messaging ("Try again in Xs") using retry-after. Skeletons vs spinners by perceived latency. Motion respects reduced motion. Android: Material-aligned patterns but Seven identity preserved; ergonomic touch targets. 

LATER=Error telemetry correlation (request id/span id) shown in dev but not user-facing (or behind "Details"). Localization readiness. Accessibility audit checklist per WCAG 2.2 where applicable [SOURCE primary]. 

TESTS=Deterministic: error mapping tests (timeout/abort/network/http/429). Component tests: states render correctly, actions fire. Accessibility: ARIA roles/labels, focus management, live region announcements [SOURCE primary]. E2E: offline banner appears, retry recovers, empty state shown, partial failure path. Android: TalkBack navigation, ergonomic targets. Visual: hierarchy/density/clarity against PI rubric (runtime evidence required; no pixel imitation). 

RISKS=UX: leaking internals/stack traces to users. A11y: missing live regions, focus traps. Performance: skeleton jitter. Android: overlapping with system UI. Consistency: diverging from Seven identity. Cross-system: coordinate with B10 (co-owner). 

FIRST_SLICE=Smallest: introduce shared UI primitives in `components/feedback/` (or existing design system): `ErrorView`, `EmptyView`, `LoadingView`. Add error mapping utility `toUserError(err)` that redacts sensitive details. Wire to one network call path (same as D16 slice) to show inline error+retry. Add offline banner at app shell level. Add basic ARIA attributes [SOURCE primary].

KNOWN_UNKNOWNS=Existing design system/components for states unknown. Error boundary implementation presence unclear. Offline indicator exists? Android-specific UX patterns (snackbar vs banner) not confirmed. WCAG conformance target (2.1 vs 2.2) not stated; PI rubric specifics needed. B10 ownership boundaries unclear.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (pending inspection of UI components, design system, error boundaries, offline UI, and PI rubric/index to validate Seven identity constraints)


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
SOURCE_ANALYSIS=Harvested 14 sources (13 primary). SWE-bench, Playwright visual comparisons, OWASP MASVS (Mobile App Security Verification Standard), OTel semantic conventions 1.44.0. 
Covers: autonomous quality (reality lab/evolution arena), constitution/proof/meta-team, security (MASVS), observability (OTel semconv), evals/visual. 
Disagreements: proof-carrying work is strict (invariants+evidence+UNPROVEN). Limitations: MASVS is mobile-focused; need to map to agent system. Harvest sufficient.

CURRENT=Seven has `.seven-team/autonomy/` (constitution/contracts/proof policy/judge rules/baselines/evaluator controls) — must not modify. `evolution/` dir, `eval/` dir present. Proof-carrying work required: state invariants touched, evidence level, remaining UNPROVEN. Product intelligence quality rubric for UI.

TARGET=Autonomous quality framework: reality lab (deterministic evals), evolution arena (safe evolution), proof-carrying changes (invariants + evidence + UNPROVEN), constitution compliance, security (MASVS relevant controls), observability (OTel semconv where applicable), meta-team quality gates.

NOW=Inspect `.seven-team/autonomy/` contracts (read key files), proof policy, judge rules, baselines. Map how quality is measured. Identify invariants per subsystem (arch ownership, no duplicate owners, secrets, release gates).

NEXT=Proof bundle format (invariants, evidence links/commands, commands run, findings, UNPROVEN), quality scorecard (release blockers, risks, evidence completeness), MASVS checklist mapped to agent/mobile context, OTel trace attributes for critical flows.

LATER=Evolution arena scoring with deterministic seeds, adversarial harness integration, quality gates in verify, automated UNPROVEN tracking.

TESTS=Contract tests enforcing invariants, proof bundle validation, security checks (secrets scan, policy), constitution compliance checks.

RISKS=Modifying autonomy controls (forbidden), weak proof (claiming proof without evidence), conflating build/installed evidence, aesthetic claims without runtime evidence.

FIRST_SLICE=Read autonomy contracts + proof policy; define proof bundle template for A08 work; add invariant checks to verify.cjs (e.g. no duplicate owners, secrets). Smallest enforceable quality slice.

KNOWN_UNKNOWNS=Exact proof policy text, judge rules, baselines values, evolution arena API. Need to inspect autonomy files.

DOMAIN_VERDICT=READY_FOR_PLAN

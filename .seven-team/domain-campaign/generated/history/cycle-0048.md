# Seven Domain Roadmaps — cycle evidence

Ready domains: 3/30
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

Research audit: READY

DOMAIN_ID=D04_CODING_SYSTEM
SOURCE_ANALYSIS=Sources agree on the modern coding-agent stack: a benchmark harness that applies a patch and runs FAIL_TO_PASS/PASS_TO_PASS tests (SWE-bench FAQ), a minimal tool-using agent (SWE-agent/mini-swe-agent ~100-line agent class, YAML-governed), and a training-data synthesizer that keeps only tasks breaking ≥1 unit test (SWE-smith, 52k instances, +32% Verified for SWE-agent-LM-32B). GitHub Docs show the operational pattern: agent profiles as Markdown+YAML (name/description/prompt/tools/mcp-servers) at repo/org/enterprise levels. Freshness: MCP/GA and mini-swe-agent v2 are current (2026); SWE-agent legacy is deprecated in favor of mini-swe-agent — a stale-assumption risk if Seven modeled on SWE-agent 1.0. Limitation: leaderboard numbers are self-reported unless marked team-verified; no browser-rendered evidence, only HTTP fetch.
CURRENT=Seven has no coding-agent loop. `remake/src/github/self-dev-service.ts` provides a bounded single-commit mutation port (exact 40-char base SHA, path normalization, secret-path blocking, 1–64 files/2 MB/8 MB limits, result-path allow-listing) and `github-auth-service.ts` provides single-flight token leases; Phase 8 tests (6/6 PASS, ran via `npx vitest run src/integration/phase8/phase8.test.ts`) prove token isolation and unexpected-path rejection. Missing: repo map, edit→test→verify cycle, FAIL_TO_PASS/PASS_TO_PASS harness, agent profiles, PR/diff-review workflow. No MCP/protocol code exists (rg: 0 matches across 74 files).
TARGET=A CodingSystem domain owned by TaskManager: repo-map snapshot → agent profile (prompt+tools+MCP-servers) → bounded edit plan → apply via existing SelfDev mutation port → test-gate (FAIL_TO_PASS must pass, PASS_TO_PASS must stay green) → result verification → PR/diff review with human consent. Deterministic, cancellation-safe, and observable via Phase 11 redacted diagnostics.
NOW=Add a `CodingVerifyPort` contract plus a `CodingRunService` that wraps the existing `GitHubSelfDevService.apply` with a deterministic test-gate: change set carries `failToPass`/`passToPass` test IDs; the port returns per-test outcomes; the service fails the run if any FAIL_TO_PASS fails or any PASS_TO_PASS regresses. Pure-domain, unit-tested with an in-memory port — no network, no production mutation path change.
NEXT=Repo-map generator (file tree + symbol index, bounded), agent-profile loader mirroring GitHub's `.github/agents/*.md` frontmatter format, diff-preview UI with explicit human consent before mutation, PR-workflow mutation variant (open PR instead of direct commit).
LATER=SWE-smith-style self-training task synthesis inside Seven's own repo; SWE-bench-compatible local harness for regression evals; multi-agent subagent delegation per GitHub built-in-agent pattern; goal-oriented CodeClash-style evals.
TESTS=Deterministic unit: test-gate pass/fail/regression matrix, cancellation mid-verify, oversized change sets, duplicate paths. Contract: CodingVerifyPort schema validation. Integration: full journey repo-map → edit → verify → commit with a fake mutation+test port. Adversarial: hostile port reports fake PASS, port reports extra paths, abort during test run. Eval: a frozen fixture repo with known FAIL_TO_PASS/PASS_TO_PASS to measure resolved-rate deterministically.
RISKS=Security: mutation consent bypass, secret-path leakage into commits, token replay (mitigated by existing lease design). Performance: repo-map cost on large repos (needs bounds). Android: verify loop must respect TaskManager/Android bridge cancellation tokens. Cross-system: test-gate must not silently convert network failure into "all tests pass" (mirrors ARCHITECTURE.md §7 research invariant).
FIRST_SLICE=`CodingVerifyPort` + `CodingRunService` with FAIL_TO_PASS/PASS_TO_PASS gating and deterministic in-memory tests in `remake/src/integration/phase8/` — smallest slice that adds real edit-test-verify semantics on top of the proven mutation port.
KNOWN_UNKNOWNS=Whether Seven's target repos ship runnable test suites accessible from the WebView/Android runtime; exact SWE-bench harness licensing/packaging for a local eval; no Android build/device evidence for the verify loop this stage (UNPROVEN).
DOMAIN_VERDICT=READY_FOR_PLAN


# D05_SELF_DEVELOPMENT — Self-Development / Autonomous Software Evolution

Research audit: READY

DOMAIN_ID=D05_SELF_DEVELOPMENT
SOURCE_ANALYSIS=Self-development evidence converges on: encode conventions once as reusable agent profiles (GitHub custom agents: Markdown+YAML with prompt/tools/mcp-servers), generate training signal from real repos (SWE-smith: synthesize tasks, keep those breaking ≥1 unit test, 52k instances, +32% Verified), and run minimal agents (mini-swe-agent: ~100 lines, local/docker/singularity/bubblewrap, litellm/openrouter backends). Security framing from OWASP MASVS: MASWE-0001/0002 (unencrypted sensitive data), MASWE-0005 (sensitive data in logs), MASWE-0024 (data after session termination), MASWE-0033–0035 (WebView exposure) — all apply to an autonomous self-mutating app. OTel semconv 1.44.0 gives standardized attribute naming for observing self-dev events (GenAI conventions now in a separate repo). Disagreement/limitation: SWE-agent README itself says most tool scaffolding "is not needed" as LMs improve — Seven should keep the agent loop minimal rather than gold-plating tools.
CURRENT=Seven's self-dev is Phase 8 GitHub Self-Dev: `GitHubSelfDevService` applies one bounded, exact-base-SHA change set through `GitHubMutationPort` with secret-path blocking and result-path validation; `GitHubAuthService` gives single-flight leases. Phase 11 AppKernel owns boot/shutdown/rollback with redacted bounded diagnostics. MILESTONES.md records 12/12 COMPLETE and APK payload identity proven on API 34/36 (prior-cycle evidence). Missing for autonomous evolution: no self-training loop, no agent-profile store, no post-mutation verification/rollback of applied commits, no self-dev event telemetry under OTel-style conventions, no MASVS-mapped self-dev privacy controls.
TARGET=A SelfDev domain where Seven can propose, review, test-gate, apply and — if verification fails — roll back its own mutations, with every step under TaskManager cancellation, human consent for protected actions, MASVS-aligned secret handling, and OTel-convention observability. Agent profiles (prompt+tools+MCP-servers) define evolution strategy and are versioned, persisted, and reviewable.
NOW=Introduce a `SelfDevRunRecord` durable aggregate (runId, baseSha, changeSet, testGate outcome, applied commitSha, rollback pointer, consent record) persisted through the existing StorageEngine contract, written by a thin service around `GitHubSelfDevService`. This creates the recovery/audit substrate every later self-dev capability needs, without touching the mutation port.
NEXT=Post-apply verification (re-read committed tree, compare against expected paths) and rollback/PR-revert workflow; agent-profile store mirroring `.github/agents/*.md`; OTel-semconv-aligned self-dev span/event attributes; MASVS-mapped privacy controls (no secrets in diagnostics — already redacted by Phase 11 — plus explicit session-termination cleanup).
LATER=Closed-loop self-improvement: SWE-smith-style task synthesis on Seven's own repo, deterministic local eval harness, optional fine-tuning dataset export; autonomous evolution gated by SWE-bench-style resolved-rate thresholds with human approval.
TESTS=Deterministic unit: run-record lifecycle (created → verified → applied/rolled back), consent immutability, rollback pointer integrity. Integration: apply→verify→fail→rollback with fake ports; restart/recovery restore of an interrupted run. Adversarial: hostile mutation reports success but tree diverges; consent record tampering; secret in record rejected by redaction. Android: bridge round-trip for consent + cancellation tokens (JS mock now; instrumented later).
RISKS=Security/privacy: autonomous repo mutation is the highest-blast-radius capability Seven has — requires explicit consent, scope limits, and audit; MASWE-0005 risk if diagnostics ever carry tokens (mitigated by Phase 11 default redaction, must stay tested). Performance: bounded run records and ring-buffered events. Cross-system: recovery must interoperate with AppKernel rollback and TaskManager cancellation without creating a second lifecycle owner (constitution: no duplicate owners).
FIRST_SLICE=Durable `SelfDevRunRecord` + persistence + tests around the existing Phase 8 service — the smallest change that adds recovery and auditability to self-dev with zero mutation-path changes.
KNOWN_UNKNOWNS=Legal/ops policy for autonomous commits to real repos (license, commit authorship); whether rollback via revert commit is acceptable vs. requiring PR-based flow; no installed-device evidence for self-dev journeys this stage (UNPROVEN); exact OTel GenAI semconv attribute names need a follow-up fetch of the dedicated GenAI semconv repo.
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D22_PROTOCOLS_INTEROP
SOURCE_ANALYSIS=MCP 2026-07-28 is GA and breaking: stateless JSON-RPC 2.0 core, `initialize`/`Mcp-Session-Id` retired, per-request `_meta` with protocolVersion/clientInfo/clientCapabilities, optional `server/discover`, `Mcp-Method`/`Mcp-Name` header routing, cacheable list results (`ttlMs`/`cacheScope`), elicitation/sampling redesigned as Multi Round-Trip Requests (`resultType: "input_required"` + `inputResponses`), Tasks extension (`tasks/get`, `tasks/update`, `subscriptions/listen`), auth hardening (RFC 9207 `iss` validation, CIMD replacing DCR, issuer-bound credentials), roots/sampling/logging and legacy HTTP+SSE deprecated with a 12-month window. Tier-1 SDKs: TypeScript, Python, Go, C# (Rust beta). GitHub's custom-agent profiles already carry `mcp-servers`, proving real interop demand. Limitation: spec pages fetched via HTTP (not rendered browser); I did not run an SDK round-trip, so live interop is UNPROVEN.
CURRENT=Seven has zero MCP/protocol code (rg across 74 source files: 0 matches for mcp/modelcontextprotocol/a2a/agentprotocol). It does have the right substrate: typed port/adapter architecture (ARCHITECTURE.md §1–4), TaskManager cancellation, Phase 7 typed Capacitor bridge envelopes, Phase 11 redacted diagnostics, and a ProviderAdapter contract that maps cleanly onto MCP tool/resource/prompt primitives.
TARGET=An `McpClientAdapter` domain service under TaskManager: stateless JSON-RPC 2.0 over Streamable HTTP with `Mcp-Method`/`Mcp-Name` headers, per-request `_meta`, `server/discover` capability probe, tools/list with `ttlMs`/`cacheScope` caching, tools/call with human-in-the-loop consent, MRTR-based elicitation for mid-call input, and Tasks-extension polling for long-running operations. MCP tools become first-class ProviderAdapter-adjacent capabilities without creating a second task owner.
NOW=Add a pure-domain `McpProtocol` module: JSON-RPC 2.0 message types, `_meta` envelope construction/validation, header routing map, and `McpError` normalization — fully unit-tested with no network. This is the interop kernel every MCP feature builds on and matches Seven's port/adapter style.
NEXT=`McpTransport` (Streamable HTTP fetch adapter with AbortSignal wiring to TaskManager), tools/list cache honoring `ttlMs`/`cacheScope`, tools/call consent UI flow, MRTR elicitation handler, Tasks extension polling (`tasks/get`/`tasks/update`/`subscriptions/listen`).
LATER=Host-side multi-client management (1:1 client↔server isolation per spec architecture), MCP server exposure of Seven's own capabilities, Enterprise-Managed Authorization support, and bridging GitHub custom-agent `mcp-servers` profiles into Seven agent profiles.
TESTS=Deterministic unit: message encode/decode, `_meta` validation, error-code mapping, cache TTL logic, MRTR input-required round-trip. Contract: MCP schema conformance against spec examples (tool with default 2020-12 schema, draft-07 schema, no parameters, stateful tools). Integration: fake-JSON-RPC-server round-trip with cancellation. Adversarial: malformed JSON-RPC, missing `_meta`, wrong protocol version, tool result schema violations, consent denial mid-call.
RISKS=Security: MCP spec explicitly warns tools are arbitrary code execution and tool descriptions are untrusted — consent and allow-listing are mandatory; auth mix-up risk addressed by RFC 9207 `iss` validation. Privacy: resource data must not be transmitted without consent (spec principle). Performance: list-result caching reduces re-fetch but needs bounded memory. Android: transport must work through WebView fetch with bridge cancellation tokens. Cross-system: must not create a second task/lifecycle owner (constitution).
FIRST_SLICE=Pure `McpProtocol` message/envelope/error module + deterministic unit tests in `remake/src/integration/phase12/` (or a new `remake/src/protocol/mcp/`) — smallest slice that establishes 2026-07-28 interop semantics with zero network or UI risk.
KNOWN_UNKNOWNS=Whether Seven's Android WebView fetch stack supports the required headers/cors for Streamable HTTP; exact CIMD metadata-document format details (spec page fetched but deep auth sections not fully read); no live SDK round-trip performed this stage (UNPROVEN); deprecation timeline risk if Seven adopted legacy HTTP+SSE (it has not — greenfield).
DOMAIN_VERDICT=READY_FOR_PLAN


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

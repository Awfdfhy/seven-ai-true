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
SOURCE_ANALYSIS=Harvested sources [SOURCE primary] SWE-bench (leaderboards/FAQ) and SWE-agent [NeurIPS 2024] describe evaluation-driven coding agents (issue→fix) and public leaderboards; GitHub Docs custom agents [SOURCE primary] define Copilot CLI custom agents; site assets irrelevant. Common thread: edit-test-verify loops, repo context mapping, structured evaluation. Disagreements: benchmark vs product agent scope. Freshness: MCP/spec-adjacent assets dated 2026-07-28 context; SWE-bench pages present; limitations: harvested payloads include favicon/CSS/manifest snippets (not content) — treat as metadata. No single “repo mutation with exact SHA” contract emphasized.
CURRENT=Seven Remake V3 enforces strict ownership: TaskManager only owner of active tasks; ShellStore single source of truth; immutable Room/Message; ProviderAdapter contract; cancellation propagates; deadline as wall budget. Persistence via StorageEngine (IndexedDB/in-memory). Tests: 237/237, build/typecheck PASS (Milestones). Android bridge typed envelopes; AppKernel deterministic boot with rollback/retry (11/12). GitHub self-dev (8/12) is separate. No explicit “repo map/edit-test-verify” subsystem named except task types/ownership. Evidence: `remake/ARCHITECTURE.md`, `remake/MILESTONES.md`.
TARGET=Deterministic edit-test-verify: workspace-scoped mutation with exact base SHA, path allowlists (no secret paths), changed-path verification, cancellation isolation, structured results. Repo map: explicit workspace root, file ownership, ignore lists, max files/bytes, timeout/deadline. Verify-before-commit semantics (tests/build as gated actions) with evidence capture (commands run, exit codes, artifacts). Recovery: retryable ops with idempotent tasks, rollback of in-process mutations on failure/cancel, crash-safety (no partial persistent state). PR workflow modeled as separate action (not automatic commit). Coding workspace safety: secret-path rejection, public auth snapshots never leak plaintext tokens, redaction in diagnostics.
NOW=Codify workspace safety constraints already implied by GitHub self-dev into a reusable “CodingWorkspace” port: (a) path normalization + allowlists/denylist (secrets), (b) max mutation batch (files/bytes), (c) exact base SHA required for mutation, (d) dry-run + changed-path diff, (e) cancellation token propagated, (f) structured MutationResult with paths changed/skipped/errors. Add tests asserting denylist + missing SHA rejected.
NEXT=Repo map service: scan roots with .gitignore semantics, content hash index, ignore binary/heavy, build file graph (imports) for minimal test scope. Edit-test-verify loop as TaskManager task type with phases (edit→validate→report). Deterministic test selection heuristic (changed paths + dependents) with timeout budget from task deadline. Evidence bundle per run (files touched, commands, hashes).
LATER=Evaluation hooks aligned to SWE-bench style (issue→repro→fix→verify) without adopting external leaderboard code; Android/Web parity for coding workspace; incremental verify (affected tests only) with cache. Record provenance (tool calls, SHAs).
TESTS=Deterministic unit: path validation, SHA mismatch, denylist, batch limits, cancellation. Integration: edit→validate with fake runner (deterministic). Adversarial: path traversal, symlink escape, secret write attempt, partial write on cancel. Android: SAF constraints don’t bypass rules. Eval: issue reproduction fixture.
RISKS=Path traversal/symlink; accidental mutation outside workspace; large diffs; test timeout explosion; mixing coding workspace with Git ops (auto-commit). Enforce denylist + exact SHA + changed-path verification + cancellation.
FIRST_SLICE=Introduce `CodingWorkspace` port + in-mem impl with (path norm, denylist, max bytes/files, requiresBaseSha, mutation with changed-path check). Wire to TaskManager lifecycle. Deterministic tests. No GitHub API changes.
KNOWN_UNKNOWNS=Whether Seven has existing coding workspace abstraction (beyond GitHub mutation). Need to confirm task types and whether “edit” is performed via apply_patch style or filesystem writes; also CLI/Android constraints. Harvested SWE-bench content truncated (CSS/metadata) so cannot rely on exact API details.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D05_SELF_DEVELOPMENT — Self-Development / Autonomous Software Evolution

Research audit: READY

DOMAIN_ID=D05_SELF_DEVELOPMENT
SOURCE_ANALYSIS=Harvested: SWE-agent [NeurIPS 2024] demonstrates autonomous issue→fix with LM; GitHub Docs custom agents define scoped agents; OWASP MASVS [SOURCE primary] frames mobile appsec (relevant if coding agent runs in Android/WebView context); OTel semconv [SOURCE primary] defines telemetry semantics. Overlap: autonomy + safety. Gaps: self-modification safety (exact SHA, mutation contracts, recovery, secret hygiene) not explicit in harvested snippets. Freshness mixed; limitations: many harvested entries are site metadata/CSS/translations.
CURRENT=8/12 GitHub Self-Dev (COMPLETE) per milestones: public auth snapshots never contain plaintext access tokens; single-flight refresh with expiry skew; per-caller cancellation isolation during shared refresh; exact full base-SHA mutation contract; repo path normalization + secret-path rejection before credential acquisition; mutation result changed-path verification. Also AppKernel 11/12 (deterministic boot, rollback, retry). Evidence: `remake/MILESTONES.md`, `remake/PHASE8_GITHUB_SELFDEV.md` (referenced). No indication of automatic commit/branch creation in general (milestones say “Do not git commit…” guideline in agent rules but GitHub self-dev is a subsystem). Recovery exists at boot level.
TARGET=Self-development constrained by proof-carrying invariants: mutation requires exact base SHA (CAS against repo state), public auth never leaks secrets, denylist blocks secret paths, changed-path verification, cancellation isolation, idempotent operations, structured errors. PR workflow explicit (create/update PR, not force-push arbitrarily) with review gates; recovery: on partial mutation/fail/cancel, leave workspace consistent (rollback or report exact state). Coding workspace safety: max batch, path allowlists, timeout/deadline from TaskManager, diagnostics redacted. Telemetry (OTel-aligned) for mutation attempts (sans tokens/paths beyond counts). Adhere to MASVS principles if Android context.
NOW=Codify invariants into a `RepoMutationPolicy` enforced at mutation boundary: requiresExactBaseSha=true, secretPathDenylist (e.g. .env*, credentials, keys), pathAllowlist per workspace, maxFiles/maxBytes, verifyChangedPaths=true, cancellationIsolated=true. Make these first-class (configurable per task) and testable. Also enforce “public auth snapshots never contain plaintext tokens” invariant at serialization boundary (snapshot type).
NEXT=PR workflow model: separate actions (openPR, updatePR, getPR) with explicit intent; never auto-merge; require evidence (checks passed) before claiming success. Recovery paths: detect base SHA drift (CAS failure) → structured CONFLICT (retry with fresh SHA) not silent overwrite; detect partial writes → rollback or report inconsistent state. Single-flight refresh already done; extend to mutation prep.
LATER=Deterministic audit log of mutations (hashes, paths counts, durations, taskId) with redaction. Android-installed device constraints (SAF) mapped to same policy. MASVS mapping checklist for coding workspace operations.
TESTS=Unit: auth snapshot serialization (no token), path denylist, SHA CAS, changed-path mismatch. Integration: mutation success/fail/cancel, refresh single-flight, PR action isolation. Adversarial: secret path write, SHA race, token leakage via error/diag, partial write recovery.
RISKS=Credential leakage (highest), SHA drift causing lost changes, path escape, over-broad PR automation, telemetry leaking content. Mitigate via redaction (diagnostics bounded + redaction), explicit invariants, no auto-commit, denylist enforced before credential acquisition (already stated).
FIRST_SLICE=Extract `RepoMutationPolicy` and enforce in GitHub mutation path (even if minimal) with tests: deny secret paths before auth, require base SHA, changed-path verification. Add snapshot serialization test asserting no token field present.
KNOWN_UNKNOWNS=Full mutation implementation details (apply_patch vs direct writes) and PR API surface in codebase; also whether coding workspace is unified across local fs and GitHub. Harvested MASVS/OTel snippets truncated.
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
SOURCE_ANALYSIS=Harvested: MCP spec 2026-07-28 [SOURCE primary] and GA blog post [SOURCE primary] define protocol (JSON-RPC, tools/resources/prompts, sampling, roots, elicitation, lifecycle, auth considerations). Focus GA. Also GitHub references. Key: capability negotiation, structured errors, cancellation semantics, security (auth/roots). Limitations: harvested entries include fonts/CSS/manifest (metadata). No Seven MCP integration visible.
CURRENT=Seven has ProviderAdapter contract (stream/complete/capabilities/normalizeError), ModelRouter, TaskManager cancellation, typed bridge envelopes (requestId correlation), structured BRIDGE errors. AppKernel owns boot. No MCP client/server code evident from milestones/arch (focus on providers, GitHub, Android bridge). Evidence: `remake/ARCHITECTURE.md`, `remake/MILESTONES.md`.
TARGET=MCP interoperability as adapter (not replacing ProviderAdapter). Treat MCP tools as external capabilities with same invariants: cancellation propagates, deadlines enforced, structured errors normalized, capability negotiation, requestId correlation, diagnostics redacted (no secrets in logs). Respect MCP security model (roots, auth). For coding workspace operations, MCP tools must also satisfy same policy (exact SHA, path denylist, changed-path verification) if they mutate repo.
NOW=Define `McpAdapter` implementing same ProviderAdapter surface where applicable (capabilities map MCP→Seven), or separate tool adapter. Enforce: per-call cancellation (AbortController→MCP cancel), deadline mapped to timeout, normalize MCP errors to `SevenError` with code/category, redact diagnostics. Capability negotiation at connect.
NEXT=Roots/elicitation mapping; tool result size limits; rate limits; circuit breaker on MCP failures. Idempotency keys for mutating tools. Streaming where MCP supports. Ensure MCP calls cannot bypass coding workspace safety (intercept mutations).
LATER=Multi-server registry, health tracking analogous to ProviderHealthTracker (cooldown/retry), OTel semconv for MCP spans, Android constraints. Evaluate MCP vs internal adapters.
TESTS=Unit: error normalization, cancel propagation, capability mapping. Integration: mock MCP server with deterministic responses, timeout, cancel mid-stream. Adversarial: oversized payload, malformed JSON-RPC, tool injection via args (sanitize), path arguments must pass denylist.
RISKS=Tool injection (untrusted args), secret leakage to MCP servers, bypassing internal invariants, timeout/cancel mismatch, version skew (spec GA). Require allowlists, redaction, policy enforcement at boundary.
FIRST_SLICE=`McpAdapter` skeleton: connect with capability negotiation, listTools→capabilities, callTool with cancellation+deadline, normalizeError→SevenError. Mock server tests. No repo mutation yet.
KNOWN_UNKNOWNS=Whether Seven needs MCP now; codebase has no MCP deps. Harvested spec truncated (CSS). Need to confirm if any subsystem expects MCP. Also mapping to TaskManager types.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

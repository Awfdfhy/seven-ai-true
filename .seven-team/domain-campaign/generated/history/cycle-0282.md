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

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=[SOURCE primary] https://modelcontextprotocol.io/specification/2026-07-28/server/tools — MCP tools expose name/description/inputSchema/annotations (readOnlyHint/destructiveHint/idempotentHint/openWorldHint). Capability discovery is explicit, but invocation authorization is not specified by schema alone. [SOURCE primary] https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks — Task-based execution with status/lifecycle and cancellation semantics; reinforces need for ownership/correlation. [SOURCE primary] https://ts.sdk.modelcontextprotocol.io/v2/ and [SOURCE primary] https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28 — SDK supports 2026-07-28 revision; migration notes show evolving protocol surface. [SOURCE primary] https://developers.openai.com/api/docs/guides/function-calling and [SOURCE primary] https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling — Function/tool calling with programmatic tool use; permission/which tools a program may invoke is a configuration concern. [SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard (BFCL V4) — Evaluates function/tool calling; schema adherence and correct invocation matter, but security is not the sole axis. [SOURCE primary] https://arxiv.org/abs/2408.04682 (ToolSandbox), [SOURCE primary] https://arxiv.org/abs/2406.12045 (τ-bench), [SOURCE primary] https://arxiv.org/abs/2406.13352 (AgentDojo), [SOURCE primary] https://arxiv.org/abs/2602.03117 (AgentDyn), [SOURCE primary] https://arxiv.org/abs/2606.26479 — Benchmarks show stateful/tool use is hard and agent security degrades in dynamic environments; prompt injection and adaptive defenses are active concerns. [SOURCE secondary] https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/ and [SOURCE secondary] https://genai.owasp.org/llmrisk/llm062025-excessive-agency/ — Agentic Top 10 highlights Excessive Agency (LLM06:2025) as core risk. Disagreements/limits: harvested assets are mostly HTML/woff/css (not full specs) but titles/links align with official surfaces. Freshness: 2026-07-28 MCP revision referenced; agentic OWASP 2026 present.
CURRENT=Seven has a TaskManager as single owner of tasks (lifecycle idle→starting→running→cancelling→cancelled|succeeded|failed), deadlines, AbortController, cancellation propagated (remake/ARCHITECTURE.md §2). ProviderAdapter contract, ModelRouter, fallback only before first token (remake/MILESTONES.md §2). GitHub Self-Dev exists as `release/github-self-dev.js` (510L) exposing `window.SevenGitHubSelfDev` with `api`, `readFile`, `createBranch`, `atomicCommit`, `dispatchWorkflow`, `mergePullRequest`, `selfDevelop`, `protectedPath` (A07 report F1/F2). Native trust boundary is `apk/materialize-native-platform.cjs` `SevenPlatformPlugin.java` with `GITHUB_METHOD` allowlist and `allowedGithubPath` blocklist for repo-admin/secrets (F3). Protected paths are JS-only (`PROTECTED_PATHS` in github-self-dev.js:9-20) and not enforced natively; native protect-list diverges from JS (F4). Capability negotiation exists in bridge (remake/ARCHITECTURE.md §6). No evidence of a unified capability graph/permission model for tools beyond GitHub/bridge methods.
TARGET=Explicit tool/capability graph with per-tool permissions (read-only/destructive/admin/network/files), default-deny, capability negotiation, task-scoped tokens/entitlements, and native enforcement for protected operations. Annotations from MCP (readOnlyHint/destructiveHint/idempotentHint/openWorldHint) should be mapped to policy. Programmatic/tool-use should respect allowlists; destructive actions require confirmation and policy checks at the enforcement point (not just UI). Excessive agency mitigated by least privilege and cancellation/timeouts.
NOW=Inventory all tool surfaces (GitHub Self-Dev exported methods, bridge methods, provider tools if any), map to capabilities and enforcement points (JS vs native), and create a parity test for protected paths.
NEXT=Unify protected-path policy (extract shared policy module) and enforce natively in `allowedGithubPath`/method checks; add capability flags to bridge envelope; annotate tools with hints.
LATER=Full capability graph service, policy engine with allowlists/denylists, task-scoped entitlements, audit logging, and integration with AgentDojo-style evals.
TESTS=Deterministic unit tests for policy (JS+native parity), negative tests for bypass via exported `api`, TaskManager cancellation tests across tool calls, adversarial tests for excessive agency (attempt protected write via exported surface), and BFCL/τ-bench style evals where applicable.
RISKS=Native changes require Android rebuild/materialization; policy drift between JS/native; breaking legitimate flows; complexity creep; XSS can call exported surfaces (blast radius). 
FIRST_SLICE=Mirror JS `PROTECTED_PATHS` into native `allowedGithubPath` (or equivalent) and add parity test + block bypass via exported `api` (treat exported `api` as untrusted or gate it). 
KNOWN_UNKNOWNS=Whether other tool surfaces exist beyond GitHub Self-Dev; whether provider function calling is used; exact Android rebuild path in CI; how capability hints map to Seven's task model.
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

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL
SOURCE_ANALYSIS=[SOURCE primary] https://capacitorjs.com/docs/apis/filesystem — Filesystem API for device files; needs careful path/permission handling. [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files — Storage Access Framework (SAF) for shared storage, user-driven selection, grants/persistable permissions, privacy/control without blanket system permissions. [SOURCE primary] https://mas.owasp.org/MASVS/ — Mobile AppSec Verification Standard (MASVS) covers data storage, cryptography, network, auth, etc. Harvested assets include Capacitor/Android docs pages (some localized). Limits: PDFs/multimodal ingestion details not fully visible in harvested text; need to inspect Seven's attachment pipeline.
CURRENT=Attachments mentioned as milestone 4/12 COMPLETE: TXT/PDF ingestion with MIME/content sniffing, bounded raw bytes/extracted text, realm-safe immutable byte snapshots, single-flight PDF parser runtime loading, SHA-256 attachment identity, cancellation-safe durable persistence, in-memory + IndexedDB repos, restart/restore (remake/MILESTONES.md §Attachments). Research (milestone 5) has citation schema. Bridge typed envelopes exist (remake/ARCHITECTURE.md §6). No explicit evidence of full multimodal (images/audio/video) pipeline or SAF grant lifecycle service details in harvested files beyond architecture references.
TARGET=Robust file/attachment pipeline with MIME/content sniff, size/type allowlists, single-flight loading, sandboxed parsing (PDF), SHA-256 identity, durable policy, SAF integration (persistable grants), scoped storage, redaction in logs/diagnostics, cancellation, and clear UX for permissions. Support multimodal inputs with validation and privacy controls.
NOW=Inspect attachment ingestion code paths, PDF parser loading, SAF grant handling in native bridge, and storage of attachment metadata vs raw bytes.
NEXT=Harden MIME sniffing, enforce allowlists per modality, add SAF grant lifecycle management, and improve error messages for permission denials.
LATER=Broader multimodal support, content sandboxing, OCR/redaction, and provenance tracking.
TESTS=Attachment ingestion tests (TXT/PDF), cancellation tests, restart/restore, SAF grant round-trip tests (JS mock + Android instrumented), adversarial (malformed PDF), size limit tests, parity for path handling.
RISKS=PDF parsing complexity/security (XXE-like, parser exploits), SAF permission confusion, storage quota, Android scoped storage changes, large files impacting memory.
FIRST_SLICE=Review attachment single-flight loader and SAF grant validation paths; add tests for permission denial and cancellation.
KNOWN_UNKNOWNS=Exact attachment service files, PDF parser library, whether images/audio supported, SAF persistable permission correctness (harden-native-platform.cjs mentions SAF persistable-permission correctness).
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

Research audit: READY

DOMAIN_ID=D14_SECURITY_PRIVACY
SOURCE_ANALYSIS=[SOURCE primary] https://mas.owasp.org/MASVS/ — MASVS covers key areas (STORAGE, CRYPTO, AUTH, NETWORK, PLATFORM, CODE, RESILIENCE). Relevant to Android/bridge. [SOURCE primary] https://modelcontextprotocol.io/specification/2026-07-28 — MCP security considerations (auth, capabilities, prompts/tools/resources safety). [SOURCE primary] https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/ — GenAI telemetry attributes (moved) relevant to logging/observability redaction. [SOURCE secondary] OWASP Agentic Top 10 2026 and LLM06 Excessive Agency (as in D03). Harvested MASVS pages present. Limits: full MASVS mapping not extracted.
CURRENT=Native Keystore token custody for GitHub token (`storeGithubToken`/`ensureGithubToken`, secure-store key `SAFE_KEY`) — F5. Native blocks repo-admin/secrets paths via `allowedGithubPath` (F3). JS protected paths advisory only, exported `window.SevenGitHubSelfDev` exposes `api/atomicCommit/mergePullRequest` without capability gate (F1/F2). Two divergent protect lists (F4). Credentials embedded in bundle + localStorage fallback (`CLOUDFLARE_API_TOKEN`, `SEARCH_GATEWAY_KEY`) — F6. Auto-merge/APK-dispatch persisted with no confirm (F8). Merge is squash + CI-gated but branch protection assumed (F9). Diagnostics redaction mentioned in AppKernel observability (remake/MILESTONES.md §11). SAF persistable permissions hardened (apk/harden-native-platform.cjs). No evidence of full secret scanning, DLP, or comprehensive redaction policy.
TARGET=Defense in depth: enforce at enforcement point (native), default-deny, least privilege, capability-based access, no secret leakage in snapshots/logs/telemetry, action-time confirmations for destructive operations, secure storage, redaction, threat model alignment with MASVS and Agentic Top 10.
NOW=Address highest-impact gaps from A07: native enforce app-protected paths, gate exported Self-Dev surfaces or make them unprivileged, add confirmation for merge/dispatch/auto-merge, harden credential storage (remove/guard bundle embedding where possible), unify protect lists with parity tests.
NEXT=Secret redaction audit (logs/diagnostics/task snapshots), review telemetry attributes, add protection for other admin surfaces, consider secret scanning.
LATER=Full MASVS mapping, runtime attestation where feasible, supply chain hardening, and Agentic Top 10 coverage verification.
TESTS=Protected-path negative tests (web+native), bypass tests via exported API, confirmation UX tests, secret-leakage tests (snapshots/logs), Keystore round-trip, SAF grant tests, redaction tests.
RISKS=XSS blast radius via exported surfaces; bundle embedding widens exposure; native changes risky; localStorage fallback insecure; assuming branch protection.
FIRST_SLICE=Native enforce JS protected paths + action-time confirmation for merge/dispatch/auto-merge + tests (per A07 recommendation) — highest ROI.
KNOWN_UNKNOWNS=Full list of all secrets in bundle, whether CI can build Android, branch protection state, complete redaction coverage.
DOMAIN_VERDICT=READY_FOR_PLAN


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

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
SOURCE_ANALYSIS=Harvested sources converge on production long-term memory: temporal knowledge graphs (Zep/Graphiti) with bi-temporal facts/episodes, pluggable memory blocks (Letta), scalable extract+retrieve (Mem0), local-first options (MemX), personalized frameworks (Memoria), multimodal (TeleMem), and retrieval benchmarks (LongMemEval, UTILMEM, "When Users Don't Ask"). Common themes: separate working/episodic/semantic/procedural, explicit scope (user/session/task), point-in-time queries, evidence utilization, context-driven retrieval (not just "ask to recall"), token/latency/cost tradeoffs. Disagreements: centralized cloud graph vs local-first IndexedDB; how aggressively to auto-summarize vs preserve raw episodes; retrieval trigger (explicit vs proactive). Freshness: many 2025–2026 papers/docs; IndexedDB is mature baseline. Limitation: few evaluate UX of memory surfacing/revision/deletion in a single mobile/web app.
CURRENT=Repo inspection evidence:
- `seven_ai-final.html` (large monolith) contains memory-related UI/logic references (searches show "memory", "context", "recall" patterns) but as a single HTML bundle it's hard to see modular boundaries from quick grep alone.
- `memory.cjs` exists (3261 bytes) - Node script for memory-related operations/results.
- `memory-results.json` exists (137 bytes) - small results artifact.
- No obvious standalone `src/memory/` or `remake/` memory service modules surfaced in top-level listing; architecture truth is in `remake/ARCHITECTURE.md` and `remake/MILESTONES.md` (must read fully). No IndexedDB schema visible at root; storage ownership not obvious from listing.
- Product intelligence corpus exists at `.seven-team/product-intelligence/` (team requirement) but I need to inspect index/quality rubric to judge cohesion claims.
Evidence level: browser/mock-ish (HTML bundle) + CLI scripts. No installed-device/Android runtime memory persistence proof observed in files inspected.
TARGET=Seven should treat memory as a first-class context fabric: explicit memory blocks/scope, temporal facts with provenance/timestamps, retrieval that can be proactive (context-driven) without over-surfacing, local-first where possible with clear sync boundaries, user-visible revision/deletion, and measurable recall/evidence-utilization. Must not create duplicate ownership with shell/tasks/storage/bridge/routing/kernel (constitution constraint).
NOW=Map actual memory implementation: read `remake/ARCHITECTURE.md`, `remake/MILESTONES.md`, grep `seven_ai-final.html` for memory APIs/storage/IndexedDB, read `memory.cjs` and `memory-results.json`, inspect `.seven-team/product-intelligence/` index. Determine if memory is in HTML monolith vs planned modules.
NEXT=Define memory scope model (working/episodic/semantic/procedural) matching Seven's architecture; add provenance (source/turn/time) and bi-temporal fields if temporal needed; implement local-first store (IndexedDB) with migration/versioning; add user controls (view/edit/delete) and retrieval explainability.
LATER=Graph-based retrieval (entities/relations) if justified, multimodal episodes, point-in-time queries, cross-session summarization with evidence links, memory eval integration (LongMemEval-style) against Seven journeys.
TESTS=Deterministic: unit tests for extract/retrieve/scope; integration for persistence/revision/deletion. E2E: long multi-turn journey testing recall. Adversarial: prompt injection into memory, stale facts, scope leakage. Eval: evidence-utilization/retrieval precision on curated Seven dialogues. Android: persistence across app restarts/offline. Missing proof: no memory-specific eval harness visible.
RISKS=Privacy (PII in memory), scope leakage between users/sessions, over-retrieval polluting context, token bloat, sync conflicts, IndexedDB quota, duplicate ownership with existing storage. Security: memory poisoning/injection.
FIRST_SLICE=Inventory actual memory code paths (HTML + memory.cjs) + storage keys; document current vs target in report with evidence; identify single owner per storage concern; add a minimal memory inventory test/check (deterministic) if gaps found. No production edits in RESEARCH.
KNOWN_UNKNOWNS=Whether memory is implemented in monolith vs planned, actual persistence mechanism (localStorage/IndexedDB/remote), eviction policy, user visibility.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Harvested sources show MCP tools/spec evolution (2026-07-28), tasks extension, TS SDK v2 migration, OpenAI function/tool calling and programmatic tool calling, benchmarks (BFCL V4, ToolSandbox, τ-bench), agent security (AgentDojo, AgentDyn, Adaptive evals), and OWASP Top 10 for Agentic Applications 2026 (excessive agency LLM06). Convergent: schema-first tools, stateful/conversational tool use, user/agent interaction modeling, capability graphs/permissions, least privilege, confirmation for destructive actions, sandboxing, prompt injection defenses, measurable success. Tension: flexibility vs safety; programmatic calling vs direct; local tools vs MCP remote.
CURRENT=Repo: `seven_ai-final.html` is monolith - likely contains tool definitions/calling. No obvious `mcp/`, `tools/`, `capability/` dirs at root. `package.json` exists (1350 bytes) - need to read deps/scripts. OWASP/agent security not visible as code. Ownership: must not duplicate shell/tasks/storage/bridge/routing/kernel.
Evidence: HTML bundle + package.json. No MCP server/client config visible. No capability graph JSON/schema found at root.
TARGET=Explicit capability graph (tools/capabilities → permissions/scopes), schema validation, approval/confirmation flows, rate limits, audit logging, MCP compatibility where useful, defense against excessive agency, stateful tool execution model aligned with tasks extension if adopted.
NOW=Read `package.json`, grep HTML for `function`, `tool`, `mcp`, `capability`, read `remake/ARCHITECTURE.md` for tool/bridge/routing ownership.
NEXT=Define capability schema, permission model (least privilege), tool allowlists by context, confirmation UX, error/recovery for tool failures, injection-resistant parsing.
LATER=MCP client integration, programmatic tool calling evaluation, capability-based routing, tool use evals (BFCL/τ-bench style) on Seven tasks.
TESTS=Deterministic schema tests, permission boundary tests, confirmation flow tests. Adversarial: prompt injection via tool results/args, excessive agency attempts. Stateful: ToolSandbox-style multi-turn. Android: tool availability/permissions.
RISKS=Excessive agency (OWASP LLM06), tool chaining abuse, secret leakage, SSRF/file system access, duplicate bridge/daemon ownership, approval fatigue.
FIRST_SLICE=Inventory tools/capabilities in HTML + package.json; map to ownership (bridge/routing/kernel); identify if any MCP code exists; document gaps vs MCP 2026-07-28. No edits.
KNOWN_UNKNOWNS=Actual tool registry, permission enforcement, MCP usage.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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
SOURCE_ANALYSIS=Harvested: Android Core App Quality (navigation, performance, permissions, responsiveness, accessibility), WCAG 2.0/2.1/2.2, Playwright visual comparisons. Emphasis on real user impact, not just aesthetics. Seven team requires comparing to reference principles (hierarchy, density, clarity, discoverability, feedback, response readability, motion, Android ergonomics, cohesion) without pixel-for-pixel imitation, preserve identity. Aesthetic claims need screenshot/runtime evidence.
CURRENT=Main artifact `seven_ai-final.html` is a single large HTML file (842964 bytes) - suggests monolithic UI. Multiple HTML variants (`seven_ai-t150.html`, `t152.html`, `t161.html`, `seven_ai-t150.html` etc.) exist - possible snapshots/variants. No obvious CSS/JS modules. Capacitor config (`capacitor.config.json`) present - Android wrapper possible. APK dir exists.
Evidence: HTML files + Capacitor config + APK dir. No Playwright snapshots visible at root. No design tokens/stylesheets as separate files obvious.
TARGET=Cohesive design system with tokens, components, clear hierarchy/density, Android ergonomics, accessibility (WCAG), motion with reduced-motion, responsive, consistent feedback/empty/loading states.
NOW=Inspect `capacitor.config.json`, `apk/`, grep HTML for design tokens/CSS variables, compare variants for cohesion, read product-intelligence rubric.
NEXT=Extract design tokens, component inventory, accessibility audit (contrast/semantics/focus), Android-specific ergonomics, motion audit.
LATER=Component library, theme system, visual regression harness (Playwright) aligned with Seven identity.
TESTS=Visual regression (Playwright snapshots), accessibility (axe/WCAG), Android Core App Quality checks, responsive. Evidence must include screenshots/runtime or label as weak.
RISKS=Monolith makes systemization hard, variant sprawl, accessibility gaps, Android gesture/navigation issues.
FIRST_SLICE=Inventory UI patterns in `seven_ai-final.html`, identify tokens/components, check Capacitor/Android surface, read product-intelligence quality rubric for cohesion scoring.
KNOWN_UNKNOWNS=Actual rendered UI state, design tokens, accessibility compliance.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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
SOURCE_ANALYSIS=Harvested: GitHub custom agents, Microsoft multi-agent reference architecture, MCP spec. Focus on roles/specialists, coordination, tools, governance, scalability, security. Seven has 20-agent team with Manager coordination per instructions - meta orchestration.
CURRENT=Repo has `.seven-team/` with autonomy, domain-campaign, product-intelligence, etc. `PROJECT_MANIFEST.json` exists. No obvious agent runtime code visible at root except maybe in HTML/Cloudflare. Team structure defined in prompts/manifests.
TARGET=Clear role boundaries, delegation, shared state, handoffs, calibration, conflict resolution, audit trail, avoid duplicate ownership.
NOW=Read `.seven-team/domain-campaign/domains.json`, manifests, autonomy contracts, understand Manager/strike teams.
NEXT=Map actual orchestration implementation vs defined roles, identify coordination primitives, handoff protocol.
LATER=Calibration/eval, task routing, multi-agent traces.
TESTS=Handoff tests, role boundary tests, delegation correctness, auditability.
RISKS=Role confusion, duplicate ownership, uncontrolled delegation, traceability gaps.
FIRST_SLICE=Read domain-campaign and autonomy dirs, map B10 responsibilities across domains.
KNOWN_UNKNOWNS=Runtime orchestration vs prompt-defined.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: READY

DOMAIN_ID=D20_PRODUCT_QUALITY
SOURCE_ANALYSIS=Same as D12 quality sources (Android Core App Quality, WCAG) plus Playwright. Product-intelligence requirement: compare to reference principles without pixel-for-pixel, preserve identity. Need evidence levels.
CURRENT=Product intelligence corpus at `.seven-team/product-intelligence/` - must read index and quality rubric. HTML variants suggest iteration. No visible quality gates/evals at root.
TARGET=Measurable quality: discoverability, clarity, cohesion, feedback, recovery, Android ergonomics, accessibility.
NOW=Read product-intelligence index/rubric, inspect HTML for key journeys, identify quality gaps.
NEXT=Define quality checklist per journey, evidence capture plan.
LATER=Synthetic users/judges if justified.
TESTS=Journey-based E2E, accessibility, quality rubric scoring with evidence.
RISKS=Aesthetic claims without evidence, identity drift.
FIRST_SLICE=Read `.seven-team/product-intelligence/` fully, extract rubric, apply to Seven's HTML variants.
KNOWN_UNKNOWNS=Current quality baseline.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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
SOURCE_ANALYSIS=Android Core App Quality and WCAG emphasize error prevention/recovery, clear messages, focus management. Need loading/empty/error states with actionable recovery.
CURRENT=HTML monolith likely has ad-hoc states. No visible error boundary patterns obvious.
TARGET=Consistent patterns: loading, empty, error with recovery actions, offline, timeouts, permission errors, Android-specific.
NOW=Grep HTML for error/loading/empty patterns.
NEXT=Inventory states, define patterns, accessibility of errors.
LATER=Centralized error handling UX.
TESTS=Error path E2E, offline, timeout, accessibility.
RISKS=Cryptic errors, no recovery path, blocking UI.
FIRST_SLICE=State inventory in HTML.
KNOWN_UNKNOWNS=Actual error handling.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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
SOURCE_ANALYSIS=Harvested: SWE-bench (real software engineering tasks), Playwright snapshots, OWASP MASVS (mobile security), OpenTelemetry semconv. Seven has autonomy system at `.seven-team/autonomy/` with constitution/proof policy/judge rules - must not modify.
CURRENT=Autonomy dir exists, reality/evolution concepts mentioned in instructions. Evidence levels required.
TARGET=Proof-carrying work, invariants, evidence levels, regression tests, mobile security alignment, observability.
NOW=Read autonomy contracts, understand proof policy, judge rules, baselines.
NEXT=Map to current practice, identify gaps.
LATER=Eval harnesses.
TESTS=Proof requirements, invariant checks.
RISKS=Cannot weaken tests/guards, cannot modify autonomy controls.
FIRST_SLICE=Read autonomy contracts fully.
KNOWN_UNKNOWNS=Implementation vs policy.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT

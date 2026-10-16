# Seven Domain Roadmaps — cycle evidence

Ready domains: 10/30
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

SOURCE_ANALYSIS
[From harvested 20 sources: 11 primary, 9 secondary; arXiv + Letta + Zep + Mem0 + MDN + LangChain]
- Foundational papers frame memory as production concern: Mem0 (2504.19413) defines scalable long-term memory for agents with production readiness focus; Zep (2501.13956) proposes temporal knowledge graph (Context Graph) with time-aware facts/episodes; Memoria (2512.12686) emphasizes scalable agentic memory framework for personalization.
- Benchmarks show retrieval quality matters: LongMemEval (2410.10813) evaluates long-term interactive memory; UTILMEM (2608.30508) measures evidence utilization; “When Users Don’t Ask” (2609.03467) benchmarks context-driven retrieval (proactive recall). Mem0 reports strong LoCoMo/LongMemEval scores with lower token cost (mem0.ai/research). 
- System designs: MemX (2603.16171) local-first; TeleMem (2601.06037) long-term + multimodal. 
- Product docs reinforce concepts: Letta memory blocks (core memory) for structured state; Zep concepts (episodes -> graph, facts with bi-temporal validity, context types: facts/entities/episodes/thread summaries/observations/user summary) guide what to extract/store. 
- Platform/storage: MDN IndexedDB API is standard for client-side structured storage (large, indexed) — relevant if local-first or hybrid. 
- Agent frameworks: LangGraph thinking/DeepAgents inform orchestration patterns (subagents, planning) but not memory store itself.
Disagreements/freshness: arXiv IDs look recent/future-dated in some labels (e.g. 2603…) — treat as harvested metadata; content is the abstracts/titles. Limitations: harvested are abstracts/pages (not full PDFs deeply read here) and product docs are secondary; need to verify concrete Seven implementation vs concepts. No single “right” model (vector vs temporal KG vs blocks) — architecture choice must fit Seven.

CURRENT
[From repo inspection, evidence-grounded]
- Memory/context subsystem exists in codebase (stores, context modules). 
- Persistence layer present (IndexedDB patterns observed in storage modules) — local storage available. 
- No evidence of temporal KG (Zep Graphiti) integrated; no Mem0 client; no Letta-style memory blocks surfaced as core contract. 
- Memory likely session+local caches; long-term recall semantics (proactive retrieval, time decay, invalidation) not obvious from file scan. 
- Ownership boundaries per ARCHITECTURE.md exist but memory contracts not fully enumerated in quick scan.
Evidence: remake/ARCHITECTURE.md, .seven-team/domain-campaign/domains.json, storage/memory files found via search.

TARGET
Desired state (evidence-backed):
- Clear memory model with layers: working (session), episodic (interactions), semantic (facts), procedural (skills/rules) with well-defined schemas.
- Time-aware model inspired by Zep (episodes, bi-temporal facts, entities) to support “what changed when” and point-in-time recall.
- Retrieval: hybrid (semantic + keyword + graph/path) with re-ranking; support proactive (context-driven, not just query) recall per “When Users Don’t Ask” (2609.03467).
- Evidence utilization focus (UTILMEM): store provenance/links so recalled memories can be cited/utilized correctly.
- Local-first option (MemX) with clear sync boundary; production guardrails (scoping, TTL/decay, PII policy).
- Benchmarks as guardrails: LongMemEval-style tasks to validate recall quality, not just presence.
- Contracts: memory read/write/query with clear invariants, ownership per ARCHITECTURE.md.

NOW (first high-value slice, smallest that materially improves)
- Define memory contracts/interfaces (types: MemoryBlock/Episode/Fact, retrieval result with score/provenance) — no heavy SDK integration yet.
- Introduce episodic log (append-only episodes) with timestamps and metadata (source, session). 
- Hybrid retrieval scaffold (vector + keyword) over local store (IndexedDB) with basic ranking. 
- Add time decay/recency bias and scope filters (per session/user/thread).
- Instrumentation: retrieval metrics (hits, latency, coverage) to make quality measurable.
Slice size: interfaces + minimal implementation + unit tests. No production behavior change without tests.

NEXT
- Temporal graph edges (entities <-> facts) with valid_at/invalid_at (Zep-inspired) for canonicalization/conflict resolution.
- Proactive recall triggers (context-driven) based on task state (not just user query) — align to 2609.03467.
- Summarization of threads into observations/user summary (Zep context types) to compress history.
- Migration strategy for existing local memory (backward compatible).

LATER
- Multimodal hooks (TeleMem) if assets/attachments appear.
- Cross-device sync with conflict model; local-first by default.
- Eval harness (LongMemEval/UTILMEM subsets) integrated as CI checks for memory quality.
- Personalization (Memoria) with consent boundaries.

TESTS (deterministic)
- Unit: serialization, schema, time handling, decay, scope enforcement.
- Integration: append/read/query, deduplication, invalidation (fact supersession).
- E2E: conversation flows where recall matters (user says “as before”, context shifts).
- Adversarial: PII leakage, cross-thread bleed, stale facts, injection via memories.
- Eval: small LongMemEval-style regression set (deterministic fixtures) to prevent recall regressions.

RISKS
- Privacy: memories can leak across contexts; need redaction, scopes, user control (delete/export).
- Performance/Android: IndexedDB queries large corpora; need indexing, pagination, budgets.
- Correctness: time semantics bugs (bi-temporal) hard to test; canonicalization drift.
- Security: untrusted content stored; retrieval injection.
- Cross-system: ownership conflicts if multiple subsystems write to same memory store (must respect ARCHITECTURE.md boundaries).

FIRST_SLICE
Define `MemoryStore` contract + `EpisodicMemory` (append episodes, query by time/semantic) with IndexedDB backend minimal impl + 5–10 deterministic unit tests. This is smallest slice that enables measurable recall without destabilizing.

KNOWN_UNKNOWNS
- Full PDFs of arXiv papers not deeply parsed (abstracts only) — may miss algorithmic details.
- Current Seven memory schemas/limits unknown from quick scan (need deeper file read of memory modules). 
- Whether benchmarks (LongMemEval) can run in CI (fixtures). 
- Product requirements for “context budgets” not explicit in MILESTONES.

DOMAIN_VERDICT=READY_FOR_PLAN


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Strong alignment around MCP (2026-07-28 tools spec [SOURCE primary] https://modelcontextprotocol.io/specification/2026-07-28/server/tools), Tasks extension [SOURCE primary] https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks), TS SDK migration [SOURCE primary] https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28). OpenAI tool/function calling guidance [SOURCE primary] https://developers.openai.com/api/docs/guides/function-calling, programmatic tool calling [SOURCE primary] https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling). Evaluation/security: BFCL [SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard, ToolSandbox [SOURCE primary] https://arxiv.org/abs/2408.04682, τ-bench [SOURCE primary] https://arxiv.org/abs/2406.12045, AgentDojo/AgentDyn/adaptive evals [SOURCE primary] https://arxiv.org/abs/2406.13352, [SOURCE primary] https://arxiv.org/abs/2602.03117, [SOURCE primary] https://arxiv.org/abs/2606.26479). OWASP agentic security 2026 [SOURCE secondary] https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/, LLM06 Excessive Agency [SOURCE secondary] https://genai.owasp.org/llmrisk/llm062025-excessive-agency/. Convergence: capability graphs + permissions + least privilege; disagreements around out-of-band defenses efficacy. 
CURRENT=Tools/capability graph/permissions domain (owners A04,A07,A08,B07,B09,B10). Repo shows agent framework context (Seven Superloop Agent). ARCHITECTURE.md likely defines tool system; need to confirm MCP adoption, capability registry, permission model, tool schemas, approval flows. No direct tool files opened yet - evidence gap.
TARGET=Explicit capability graph (who can call what, under which preconditions), least-privilege scopes, parameter validation, tool result constraints, human-in-loop for high-impact tools, auditability. Align with MCP 2026-07-28 and OWASP agentic controls.
NOW=Map tool registry, schemas, permission checks, approval paths. Identify "excessive agency" cases (tools with broad side effects). 
NEXT=Enforce capability graph (declarative), add tool allowlists per agent role/strike team, deterministic tool selection tests, pre/postcondition checks. 
LATER=Adversarial harness (AgentDojo-style) integrated into reality lab per D30. 
TESTS=BFCL-style coverage for critical tools, τ-bench task success with constraints, prompt injection regression tests, negative permission tests.
RISKS=Tool misuse/excessive agency, prompt injection, unscoped filesystem/network tools, schema drift. 
FIRST_SLICE=Tool inventory + capability graph snapshot: list all tools, required permissions, owners, escalation points. Add invariant: no tool call without capability check. 
KNOWN_UNKNOWNS=Actual tool implementations, approval policy (never per permissions block but policy stated), MCP integration depth. 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need concrete tool registry + permission enforcement evidence)


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

Research audit: READY

DOMAIN_ID=D06_RPG_WORLD

SOURCE_ANALYSIS
[From harvested 14 sources: all primary; Yarn Spinner docs + Godot save]
- Dialogue runtime: Yarn Spinner docs (www.yarnspinner.dev/docs, components/dialogue-runner) define Dialogue Runner as component that executes Yarn scripts and delivers lines/options/commands to game. Unity integration exists (GitHub repo) — confirms mature runtime model (separates narrative script from game logic via commands).
- Save system: Godot saving games doc covers serialization across objects/levels, save slots, versioning considerations — general principles (save data structure, persistence, resume) applicable to web/app.
- Harvested pages include llms.txt/markdown variants and site assets (metadata). 
Limitations: Unity/Godot specific but principles portable. Web implementation in Seven needs adaptation (no Godot engine). Need to see current Seven dialogue/world implementation.

CURRENT
[From repo inspection]
- Dialogue modules present (`**/dialog*`, `**/*dialogue*`). 
- Save/persistence for world/state (`**/save*`) present. 
- World/runtime modules exist. 
- No evidence of Yarn Spinner integration; likely custom dialogue system. 
- RPG/canon/agency boundaries not fully enumerated in quick scan. ARCHITECTURE.md ownership applies.
Evidence: file search results, remake/ARCHITECTURE.md.

TARGET
- Dialogue as data-driven (Yarn-like): scripts separate from runtime, commands/events bridge to game systems, clear line/option/command contract (Dialogue Runner pattern).
- World runtime with clear state model: entities, locations, flags/vars, timeline, canon (what is true). Agency: player/AI actions with validation.
- Persistence: robust save system (Godot-inspired) — versioned save format, schema migration, atomic writes, multiple slots, autosave, resume across sessions. Deterministic serialization.
- Determinism & testability: dialogue can be replayed; world state transitions pure where possible.
- Integration respects memory (D02) for persistent canon/facts if desired, but ownership separate.

NOW (first slice)
- Extract dialogue contract (Line, Option, Command, Status) independent of UI. 
- Define WorldState schema (versioned) with serialization (JSON) + atomic save/load in current persistence layer. 
- Add save version + migration scaffold (forward compatible). 
- Minimal deterministic tests for dialogue flow and save/load roundtrip.

NEXT
- Yarn-compatible subset? Or keep custom but adopt Dialogue Runner separation (commands as side effects). Avoid pixel-for-pixel imitation; preserve Seven identity.
- Canon tracking (facts/flags) with clear source of truth and conflict rules.
- Agency model (actions, costs, preconditions) with guards.

LATER
- Content tooling boundaries, localization hooks, rollback, checkpoints.
- Analytics/telemetry opt-in, PII-free saves.

TESTS
- Unit: serialization roundtrip, migration, version checks.
- Integration: dialogue choices produce expected state changes.
- E2E: save/resume journey, autosave.
- Adversarial: corrupt saves, version downgrade, invalid commands.

RISKS
- Save corruption: need atomic writes, checksums/validation, recovery.
- Versioning debt: migrations accumulate; keep small.
- Cross-system: save format touches world/memory — ownership clarity per ARCHITECTURE.md.
- Android: storage permissions/paths if device; local-first storage.

FIRST_SLICE
Versioned `WorldState` (v1) + `SaveManager` with atomic save/load + roundtrip tests + basic dialogue contract types. Minimal, testable.

KNOWN_UNKNOWNS
- Current dialogue implementation depth (custom DSL vs JSON) unknown.
- Save format details (binary/JSON) and existing schemas.
- RPG mechanics scope in Seven (narrative vs systems-heavy).

DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D11_ANDROID_NATIVE
SOURCE_ANALYSIS=Sources (harvested + Android/Capacitor) collectively point to: layered architecture (UI/ViewModel/use cases/data), lifecycle-aware components, edge-to-edge with insets, predictive back, IME handling, and Capacitor bridge lifecycle (App/Keyboard plugins emit foreground/background, keyboard visibility). Key alignment: Android architecture recommendations emphasize separation, lifecycle safety; Capacitor docs cover App state/deeplinks and Keyboard events. Limitations/freshness: Capacitor v5/v6 patterns vary; predictive back behavior depends on API levels/Android 14+. No obvious disagreements in harvested set. Most Android links are current canonical docs; Capacitor API links are primary. Limitations: harvested set includes localized mirrors (ar/bn) and manifest/opensearch artifacts (noise) - treat as secondary; core guidance is the English primary docs. No device/emulator runtime evidence in harvested text. So behavior must be verified against actual Capacitor/Android code in repo.
CURRENT=Seven repo inspected:
- `android/app/build.gradle` (minSdk 22, compileSdk/targetSdk 33 per config; versionCode/versionName present; applicationId set; dependencies include Capacitor core/plugins; uses AndroidX/Material; buildTypes configured - see file). 
- `android/app/src/main/AndroidManifest.xml` (permissions, theme, MainActivity). 
- `android/app/src/main/java/.../MainActivity.java` exists (Capacitor MainActivity subclass). 
- Capacitor config: `capacitor.config.json`/`.ts` present (plugins, appId/appName). 
- Native bridge: grep shows Capacitor plugin usage patterns in android codebase (MainActivity extends BridgeActivity; plugin registration via Capacitor). 
- Repo layout: android native module present with gradlew, resources. 
- No APK/AAB, keystore, or device/emulator artifacts found on disk. 
- Architecture: `remake/ARCHITECTURE.md` and `remake/MILESTONES.md` exist (read first as truth). 
Evidence: `android/app/build.gradle:1-240`, `android/app/src/main/AndroidManifest.xml:1-160`, `android/app/src/main/java/**/MainActivity.java`, `capacitor.config.*`, `remake/ARCHITECTURE.md`, `remake/MILESTONES.md`. No runtime (emulator/device) or screenshot evidence present.

TARGET=Desired state (evidence-backed):
- Bridge ownership: Capacitor BridgeActivity as single entry; native bridge surface minimal and well-defined (avoid duplicating plugin owners). 
- Lifecycle: handle app foreground/background via App plugin; avoid leaks on destroy; preserve state across config changes. 
- Insets/edge-to-edge: Android 13+ safe area handling; ensure webview insets don’t clip content; test IME overlap. 
- IME/keyboard: Keyboard plugin integration; avoid manual window resize hacks that conflict with Capacitor. 
- Back: consider predictive back (Android 14+) without breaking older APIs; don’t override system back arbitrarily. 
- Packaging identity: consistent applicationId/versionCode/versionName; signing config isolated. 
- Proof: emulator/device evidence (logs, screen capture) for insets/IME/back paths. 
All aligned with Android architecture recs + Capacitor best practice.

NOW=First high-value slice (smallest that materially improves domain):
1. Document bridge ownership in android notes (or ARCHITECTURE section) to prevent duplicate native owners. 
2. Audit MainActivity: confirm it only extends BridgeActivity, no extra lifecycle overrides that conflict. 
3. Verify Capacitor plugins (App, Keyboard) are registered and used; check for custom native code that duplicates their behavior. 
4. Add minimal runtime checks: buildable with `./android/gradlew --version`/assembleDebug in dry check if permitted (but RESEARCH stage - report only; don’t run heavy builds unless manager assigns). 
Evidence needed: MainActivity source, plugin list, build config.

NEXT=Improvements:
- Edge-to-edge/insets audit (fitsSystemWindows, WindowInsetsController) against current theme. 
- IME testing plan (keyboard open/close, input focus scroll). 
- Predictive back readiness (OnBackInvokedCallback) gated by API level. 
- Bridge error surface: ensure native exceptions don’t crash silently; log paths identifiable. 
- Installed identity: read package info in runtime (device evidence) not just build files.

LATER=Longer-term:
- Automated device tests (Espresso/UIAutomator) for key flows. 
- StrictMode in debug builds. 
- Proguard/R8 verification. 
- Deep link validation on installed APK. 
- Consider dynamic features only if justified.

TESTS=Deterministic/regression proof ideas:
- Unit: bridge registration (where testable). 
- Integration: Android instrumentation for MainActivity lifecycle. 
- E2E (device/emulator): insets/IME transitions, back press/predictive back, app pause/resume, deeplinks. 
- Adversarial: rotation/config change, split screen/multi-window (if supported), permission flows. 
- Eval/product: Core App Quality checks relevant to this app (stability, crashes, ANRs) - require installed-device evidence.

RISKS=Security: minimize exported components; validate deep links; no secrets in APK. Privacy: don’t log PII. Performance: avoid blocking bridge calls. Android: API fragmentation (minSdk22; predictive back needs 14+), RTL/layout, cutouts. Cross-system: keep web/native boundary thin (Capacitor owned). Architecture drift: duplicate bridge owners would violate ownership rule.

FIRST_SLICE=Verify bridge ownership + MainActivity purity: confirm single Capacitor bridge owner, no duplicate native plugin registration outside Capacitor, and document lifecycle touchpoints. This is smallest slice with high impact and prevents future conflicts.

KNOWN_UNKNOWNS=Missing evidence:
- Runtime behavior on emulator/device (foreground/background, keyboard, insets, back). 
- Installed APK identity/signing state. 
- Whether any custom native plugins exist (separate from Capacitor). 
- Theme/insets implementation details. 
- Predictive back enabled state. 
No screenshot/runtime logs present in repo.

DOMAIN_VERDICT=READY_FOR_PLAN


# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: READY

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
SOURCE_ANALYSIS=Android Core App Quality [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality sets baseline for polish, stability, accessibility. WCAG 2.x [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ for a11y. Playwright visual comparisons [SOURCE secondary] https://playwright.dev/docs/test-snapshots for regression-proof UI. ChatGPT release notes [SOURCE primary] https://help.openai.com/en/articles/6825453-chatgpt-release-notes referenced as seed - treat as product evolution reference, not prescriptive. 
CURRENT=UI/visual system/motion/responsive; owners A01,B10. Seven is CLI+agent system (Codex CLI context mentioned in instructions) but also described as "Seven Superloop Agent" with product intelligence. Need to confirm if there is web UI, terminal UI (TUI), or both. Product cohesion is B10 focus. 
TARGET=Consistent design tokens, layout density appropriate to workflow, clear hierarchy/feedback, motion that reduces cognitive load, Android ergonomics if mobile surfaces exist, accessible (WCAG-aware), cohesive with Seven identity. 
NOW=Inventory UI surfaces (TUI components, web views, any mobile). Identify design tokens, shared components, theme. 
NEXT=Establish visual regression baseline (Playwright snapshots if web; golden files if TUI), a11y checklist per surface, density/spacing scale. 
LATER=Motion guidelines, component catalog with examples. 
TESTS=Visual regression, keyboard navigation, contrast checks, responsive layout tests, reduced-motion respect. 
RISKS=Pixel-imitating competitors (explicitly forbidden), inconsistent density across surfaces, a11y debt. 
FIRST_SLICE=UI surface map + tokens: document all UI entry points, current tokens, and one critical flow’s visual contract. 
KNOWN_UNKNOWNS=Whether UI is TUI-only (CLI) or has web; Android surfaces; existing component library. 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (unclear UI surface types)


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
SOURCE_ANALYSIS=MCP core spec [SOURCE primary] https://modelcontextprotocol.io/specification/2026-07-28 frames interoperability. GitHub Copilot custom agents [SOURCE primary] https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents) and multi-agent reference architecture [SOURCE primary] https://github.com/microsoft/multi-agent-reference-architecture) emphasize roles, handoffs, coordination, calibration, observability. Convergent: manager/coordinator, specialist roles, clear ownership, escalation paths, strike teams. 
CURRENT=Multi-agent team/manager/strike teams/calibration (owners B10,A04). This is explicitly "Seven Superloop Agent - 20-agent team with Manager AI coordinating". ARCHITECTURE.md and .seven-team/autonomy likely define orchestration model, agent manifests, handoffs, calibration. 
TARGET=Deterministic orchestration: explicit role contracts, task decomposition with ownership, handoff protocol (state+context+evidence), calibration (confidence/quality gates), failure handling/escalation, concurrency controls. 
NOW=Inspect agent manifests (.seven-team), manager logic, handoff state, calibration metrics. 
NEXT=Define handoff schema (inputs/outputs/evidence/acceptance criteria), ownership registry (prevent duplicate owners per kernel/shell/tasks/storage/bridge/routing), calibration rubric usage. 
LATER=Strike team formation rules, load balancing, retry policies with backpressure. 
TESTS=Orchestration integration tests for handoffs, manager fallback behavior, ownership conflict detection, calibration threshold tests. 
RISKS=Orphaned tasks, duplicate ownership (explicitly forbidden), handoff loss, manager thrashing, unclear escalation. 
FIRST_SLICE=Handoff+ownership audit: extract all agent roles, owners, handoff points; verify no duplicates for shell/tasks/storage/bridge/routing/kernel; document gaps. 
KNOWN_UNKNOWNS=Manager implementation details, calibration data, actual handoff mechanics. 
DOMAIN_VERDICT=READY_FOR_PLAN (strong repo cues: 20-agent team, manager, ownership rules; need concrete inspection of manifests)


# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: READY

DOMAIN_ID=D20_PRODUCT_QUALITY
SOURCE_ANALYSIS=Android Core App Quality [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality and WCAG [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ establish baselines. Playwright snapshots [SOURCE secondary] https://playwright.dev/docs/test-snapshots enable deterministic visual/product regression. Emphasis on cohesion, discoverability, feedback, response readability, motion, Android ergonomics (per product intelligence requirement). Synthetic users/UX judges mentioned as concepts - need concrete harnesses. 
CURRENT=B10 core domain (product cohesion/exploratory QA). Product intelligence corpus at .seven-team/product-intelligence with quality rubric/index. Seven identity must be preserved; aesthetic claims need evidence (screenshots/runtime). 
TARGET=Measurable product quality: feature discoverability, integration seams, install/use polish, cohesion rubric with pass/fail tied to evidence. UX judge harness grounded in rubric, not vibes. 
NOW=Read .seven-team/product-intelligence/index.json and quality rubric; map rubric to testable checks. Identify critical user journeys (install/use, core flows). 
NEXT=Define journey specs with acceptance criteria, add evidence collection (screenshots/logs/commands), integrate visual regression where applicable. 
LATER=UX judge with rubric scoring, synthetic user personas running journeys deterministically. 
TESTS=Journey E2E, accessibility checks, visual regression, performance smoke tests, integration seam tests. 
RISKS=Subjective aesthetics, weak evidence claims, over-imitating competitors. 
FIRST_SLICE=Journey inventory + evidence template: list top 3-5 critical journeys, define what constitutes "done" with required evidence artifacts. 
KNOWN_UNKNOWNS=Runnable app surfaces, test infrastructure, UX judge implementation. 
DOMAIN_VERDICT=READY_FOR_PLAN (product-intelligence corpus exists; clear rubric path)


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
SOURCE_ANALYSIS=Harvested sources (Android app signing + Core App Quality) align: Play App Signing recommended; release builds must use proper signing config (not debug). Key points: upload key vs app signing key; keystore security; versioning (versionCode monotonic). Core App Quality emphasizes stability/compatibility. Limitations: signing keys must never be committed (security constraint) - evidence is config presence, not secrets. Harvested localized mirrors add no new technical content. No installed-device identity evidence in harvested set.

CURRENT=Seven repo inspection (release/signing/identity):
- `android/app/build.gradle`: has defaultConfig (applicationId, versionCode, versionName). buildTypes (debug/release). No visible signingConfigs block referencing keystore files in the shown lines; release may use default or unsigned in local builds. Need full build.gradle to confirm. 
- Keystores: no `.keystore`, `.jks`, `key.properties` found in repo (search returned none). 
- APK/AAB: none present. 
- Gradlew present (`android/gradlew`). 
- Identity: applicationId/versionCode/versionName present in build files. 
- Installed evidence: none (no adb/device logs). 
Evidence: `android/app/build.gradle:1-240`, filesystem search results.

TARGET=Desired (evidence-backed):
- Signing: explicit release signingConfig (separate from debug). If using Play App Signing, document upload key handling. Never commit keystore/key.properties. 
- Identity: deterministic applicationId, monotonic versionCode, semantic versionName; consistent across flavors if any. 
- Packaging: release build type with minify/R8 configured appropriately (if enabled) and verified. 
- Proof of installed identity: device evidence (adb shell dumpsys package <id>, versionCode/versionName, signing info - signatures/cert) from installed APK/emulator. 
- Release readiness: Core App Quality gates considered (crashes, ANRs, permissions, compatibility).

NOW=First slice:
1. Extract full signing config from build.gradle (confirm release signing). 
2. Verify no keystore files committed; check .gitignore coverage. 
3. Record applicationId/versionCode/versionName as canonical identity (source of truth). 
4. Document release identity contract (what constitutes “installed identity”) to be proven on device/emulator.

NEXT=Improvements:
- If release unsigned locally, document release process (Play/App Signing). 
- Add key.properties.template (no secrets). 
- Validate versionCode increments. 
- Generate release checklist (signing, packaging, identity verification). 
- Ensure APK/AAB outputs excluded from VCS.

LATER=Longer-term:
- Signed release artifact pipeline evidence (build logs). 
- Installed-device verification script (dumpsys package + signature). 
- Play Console alignment (target API, app integrity). 
- Baseline profiles if needed.

TESTS=Proof ideas:
- Build: `./gradlew :app:assembleRelease` (if run) should succeed with valid signing; produce verifiable artifact. 
- Identity: installed package info matches build. 
- Signing: verify signature (apksigner/adb) matches expected cert. 
- Adversarial: unsigned release not shipped; keystore not in repo. 
- Regression: versionCode monotonicity check.

RISKS=Security: keystore leakage (critical). Privacy: signing cert exposure. Compliance: Play App Signing constraints. Cross-system: identity drift between web config (Capacitor appId) and Android applicationId.

FIRST_SLICE=Confirm signingConfig state and identity invariants: read full `android/app/build.gradle`, ensure no committed secrets, document applicationId/versionCode/versionName. Smallest slice that unblocks release proof.

KNOWN_UNKNOWNS=Missing evidence:
- Actual signingConfig block contents (release). 
- Whether keystore exists locally outside repo. 
- Installed device identity proof (dumpsys/signatures). 
- Release artifact state. 
No runtime/installed evidence.

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
SOURCE_ANALYSIS=Android Core App Quality [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality emphasizes graceful errors, empty states, loading states, recovery paths. WCAG [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ requires perceivable/operable errors (e.g. error identification, suggestions). Recovery UX is critical for agentic systems (tools failing, network issues, approvals). 
CURRENT=Errors/loading/empty/recovery UX (owners B07,B10). Agent systems need clear failure modes, retry affordances, safe fallbacks, no silent failures. 
TARGET=Deterministic error handling: typed errors, user-facing messages with recovery actions, timeout/retry with backpressure, idempotency where appropriate, a11y-compliant error states. 
NOW=Audit error surfaces: tool failures, network, fs, permissions, approvals, timeouts. Check for silent catches, generic errors, missing recovery hints. 
NEXT=Error taxonomy + UX copy guidelines, retry policies, empty/loading state patterns, error telemetry hooks. 
LATER=Chaos-lite tests (transient failures), recovery success metrics. 
TESTS=Adversarial failure injection, timeout tests, permission-denied flows, recovery path tests, a11y checks for errors. 
RISKS=Leaking internals to users, retry storms, unsafe recovery actions, inconsistent tone. 
FIRST_SLICE=Error audit: sample 10 error paths, classify (actionable/recoverable/terminal), rate UX quality. 
KNOWN_UNKNOWNS=Error boundaries in codebase, existing UX patterns for errors. 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need codebase error handling map)


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
SOURCE_ANALYSIS=SWE-bench [SOURCE primary] https://www.swebench.com/ sets reality-based software engineering eval bar. Playwright visual regression [SOURCE secondary] https://playwright.dev/docs/test-snapshots for UI determinism. OWASP MASVS [SOURCE primary] https://mas.owasp.org/MASVS/ for mobile appsec baseline (relevant if Android surfaces). OpenTelemetry semantic conventions [SOURCE primary] https://opentelemetry.io/docs/specs/semconv/ for telemetry/proof. Focus: reality lab, evolution arena, constitution/proof, meta-team. 
CURRENT=Autonomous quality (owners A08,B10,A10). Seven has .seven-team/autonomy (contracts, proof policy, judge rules, baselines, evaluator-plane). Must not modify these to make candidates pass. Proof-carrying work required. 
TARGET=Deterministic, evidence-based quality gates: invariant checks, proof artifacts, regression proof on every fix, adversarial evals, telemetry aligned to semconv. 
NOW=Inspect .seven-team/autonomy contracts, proof policy, judge rules, baselines. Understand reality lab/evolution arena setup. 
NEXT=Define evidence levels per change type, automate invariant checks where possible, integrate SWE-bench-style realism into tests, wire OTel spans for critical paths. 
LATER=Arena harness with reproducible runs, calibration across judges. 
TESTS=Deterministic regression tests (required), adversarial tests, proof validation, canary checks. 
RISKS=Drift between judge rules and reality, weak proof artifacts, modifying autonomy controls (forbidden). 
FIRST_SLICE=Autonomy map: catalog contracts, proof requirements, baselines; ensure every proposed change states invariants+evidence level+UNPROVEN. 
KNOWN_UNKNOWNS=Reality lab implementation, evaluator-plane controls, existing judge harness. 
DOMAIN_VERDICT=READY_FOR_PLAN (autonomy folder exists; clear guardrails)

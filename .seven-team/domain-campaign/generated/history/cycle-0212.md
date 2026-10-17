# Seven Domain Roadmaps — cycle evidence

Ready domains: 1/30
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

Research audit: INSUFFICIENT

DOMAIN_ID=D08_MODEL_ROUTING
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK

SOURCE_ANALYSIS=[SOURCES primary/harvested evidence analyzed]

- [SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard (BFCL V4) — establishes external benchmark for function/tool calling correctness and structured outputs. Implies Deep Think/planning must produce verifiable, schema-consistent intermediate reasoning/plans when tools are involved; correctness over verbosity is measured.
- [SOURCE primary] https://www.swebench.com/ (SWE-bench leaderboards) — evaluates end-to-end software engineering tasks requiring multi-step reasoning, planning, and verification (tests must pass). Suggests Deep Think needs robust planning + verification/progress discipline for complex tasks (not just longer context).
- [SOURCE primary] https://www.swebench.com/index.html, original.html, css/*, favicon.ico — leaderboard/UI assets (boilerplate). Content-wise, they reinforce that task success is measured by deterministic checks (evals/tests). No internal orchestration detail provided.
- Limitation: harvested sources are leaderboards/asset files, not implementation specs for “two-pass orchestration”, “planner isolation”, or “context reuse”. They define success criteria (correctness on evals) but not the mechanism. No direct spec on cancellation semantics or Android ergonomics found in harvested set. Freshness: BFCL V4 and SWE-bench are active public leaderboards (current). Disagreements: none observed in harvested set. Need implementation detail beyond leaderboards.

CURRENT=[Seven current implementation and evidence]

Evidence inspected (repo):
- `remake/ARCHITECTURE.md:65-81` — states Deep Think is two-pass orchestration (service, not UI patch). Invariants: exactly one leading system message after final context shaping; final payload revalidated before provider dispatch.
- `remake/PHASE6_DEEP_THINK.md:1-30` — defines two-pass flow: `room → planner-specific context → bounded internal brief → final-model context rebuild → brief injected as untrusted data → final stream`. Also states: “Deep Think is a two-pass application transport, not a UI patch.” Notes planner isolation intent.
- `remake/src/application/deep-think/deep-think-transport.ts:1-280` — `DeepThinkTransport` implements two passes. `collectPlan()` builds planner messages, enforces planner context budget (throws typed errors on overflow), streams from planner provider with `plannerOutputTokens` cap, validates non-empty brief and that estimated planner output ≤ budget, re-serializes brief into final context via `finalContextBuilder`. Uses `AbortSignal` (context.signal) throughout. Exposes only final answer (planner output not leaked to UI as final response).
- `remake/src/integration/phase6/phase6.test.ts` — verifies: (1) two passes run but only final answer exposed; (2) planner and final messages separated; (3) planner gets “planning pass” instruction; (4) context rebuilt independently for planner and final windows. All pass (259/259 tests in `.vitest/json/output.json`).
- `remake/src/core/context-builder.ts` — enforces invariants (exactly one leading system message after shaping; preserves latest user+following assistant; fails typed on capacity). Referenced by transport.
- `remake/src/core/task-manager.ts` — ownership of tasks with AbortController, cancellation semantics, deadline/timeouts. Transport uses external signal (mapped to TaskManager in integration points).
- `seven_ai-t161.html:636,2102,2687,4615,3972,4081-4082` — UI toggle for Deep Think; `runDeepThink()` implements legacy/UI path; UI states “The planner does not execute tools or models. The planner does not grant memory-write or tool permissions.” (policy statement). Note: UI path exists alongside transport; need to distinguish ownership.
- `remake/MILESTONES.md` and `remake/ARCHITECTURE.md` treated as truth per instructions.

Assessment: Seven already has a concrete two-pass transport with planner/final isolation, context rebuild, budget caps, validation, cancellation plumbed via signal, and tests proving separation. This matches the “two-pass orchestration is a service” invariant.

TARGET=[desired architecture/product behavior]

From external benchmarks + Seven’s architecture:
- Planner isolation (enforced at service boundary): planner must not execute tools, must not write memory, must not mutate room state. UI states this; service should enforce (capabilities/permissions passed to planner provider call). 
- Verification/progress: add explicit verification step (plan sanity check, constraint adherence) before/after planning; surface progress events during passes (planner streaming progress, final pass progress) without leaking internal brief to end-user UI except via transport contract. 
- Context reuse/speed: avoid rebuilding full context redundantly; track token estimates to skip unnecessary work; support smaller planner window when appropriate; measure latency per pass.
- Deterministic eval proof: align with SWE-bench/BFCL-style checks (deterministic fixtures, typed errors, no silent drops). Current tests are good; extend for adversarial cases.
- Cancellation + deadlines: TaskManager owns cancellation; transport must treat planner timeout/abort as typed error with retryable semantics where appropriate (current code throws SevenError with codes). 
- Android/bridge: cancellation token mapped to same taskId across bridge/native ops (stated in ARCHITECTURE). Deep Think must respect bridge cancellation.

NOW=[first high-value implementation slice]

Smallest material slice (evidence-backed):
1. Enforce planner capabilities/permissions in `DeepThinkTransport.collectPlan()`/planner call: pass explicit `capabilities: { tools: false, memoryWrite: false, ... }` and ensure planner provider respects them; add assertion/test that planner request has no tool calls/memory directives. (Matches UI policy; closes enforcement gap.)
2. Add verification step on planner brief: validate structure (non-empty, length bounds, no prompt injection directives that attempt to override final model constraints), reject obviously invalid briefs with typed error (`SevenError` with code) before rebuilding final context.
3. Add progress hooks (callback/events) to transport API (e.g. `onProgress({ phase: 'planner'|'final', tokens?, done? })`) without leaking brief content to UI; wire to TaskManager progress if applicable. This enables UX feedback without breaking isolation.
4. Deterministic regression tests for (1)-(3).

NEXT=[next improvements]

- Context reuse: cache planner-specific context serialization between passes if unchanged (hash of room+settings); measure savings.
- Speed controls: configurable `plannerOutputTokens`/timeouts per mode; adaptive planner window.
- Verification hardening: lightweight critique pass (optional) or post-plan checks against user constraints; adversarial tests (oversized brief, malformed, partial stream).
- Cancellation hardening: test planner abort mid-stream, ensure final never starts if cancelled; verify TaskManager isolation holds.
- Android evidence: verify bridge cancellation token mapping for Deep Think tasks on Android path (integration test with mock bridge).

LATER=[longer-term ideas]

- Eval integration: run subset of BFCL/SWE-bench style fixtures against Deep Think configuration to track correctness/latency (separate eval plane per constitution). 
- Planner model routing: allow different planner model than final (smaller/faster) with separate health/cooldown (ModelRouter aware). 
- Progress UX: structured progress (steps) vs tokens; avoid leaking internal state.
- Determinism: snapshot planner brief (redacted) in debug logs with hash; compare across runs in evals.

TESTS=[deterministic, E2E, Android, adversarial and eval proof]

- Deterministic unit: transport tests (phase6) extended for verification failures, progress events, permission enforcement.
- Adversarial: planner exceeds budget, emits invalid chunks, completes without brief (existing), oversized brief, mid-stream abort, signal cancellation before start.
- E2E: integration via TaskManager with real signal, ensure only final answer streamed to consumer.
- Android: mock bridge + cancellation token mapping; verify Deep Think task cancelled propagates to bridge.
- Eval: fixture-based (deterministic inputs/expected checks) inspired by SWE-bench/BFCL (correctness-focused), no live provider dependence where possible (mock providers as in phase6).

RISKS=[security/privacy/performance/Android/RTL/cross-system risks]

- Security: planner brief is untrusted data injected into final context — must treat as data (no code execution directives), sanitize/validate, enforce no tool/memory permissions even if brief claims otherwise. 
- Privacy: avoid logging full brief in production; hash/redact. 
- Performance: two passes add latency; need speed controls and context reuse. Planner window must be bounded.
- Android: bridge cancellation must map correctly to taskId; avoid leaking planner state across Android layers.
- Cross-system: ownership — Deep Think is application service (per ARCHITECTURE). UI must not bypass transport. Legacy `runDeepThink` in t161 must not create duplicate ownership (TaskManager/transport contract). 
- RTL/ergonomics: progress must not cause layout jank; respect IME/composition (composer owns). 

FIRST_SLICE=[smallest implementation that materially improves the domain]

Enforce planner permissions + add brief verification + progress hooks + 2-3 deterministic tests. This directly addresses the stated policy (“planner does not execute tools/models/memory-write”) with service-level enforcement, adds a concrete verification step, and improves UX without destabilizing architecture. Estimated as small, reviewable change localized to `deep-think-transport.ts` + tests.

KNOWN_UNKNOWNS=[missing evidence]

- Enforcement mechanism: does planner provider interface accept capabilities/permissions? Need to inspect ProviderAdapter contract and how capabilities flow. (Not fully visible in harvested grep; requires reading provider types.)
- Legacy vs transport ownership: is `seven_ai-t161.html` using DeepThinkTransport or legacy path? Need to confirm integration point (line ~4615 shows call; context around). 
- Android bridge mapping details: specific bridge API for cancellation on Deep Think tasks (ARCHITECTURE states mapping exists; concrete impl not inspected here).
- Progress contract: is there existing progress/event bus? TaskManager progress shape unknown.
- Eval baselines: no BFCL/SWE-bench subset wired yet in repo; external targets known but internal baseline not captured.

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

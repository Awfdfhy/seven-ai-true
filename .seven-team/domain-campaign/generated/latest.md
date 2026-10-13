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

SOURCE_ANALYSIS=Harvested evidence (10 sources, primary=10; harvest=READY) contextualizes Deep Think as planning/verification for agentic tasks.

- [SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard (BFCL V4) — Berkeley Function Calling Leaderboard emphasizes tool selection/correctness under structured calls; relevance: Deep Think's planner must emit a bounded, untrusted brief that guides final answer without leaking instructions. Limitation: BFCL is tool-call focused (not general two-pass reasoning orchestration).
- [SOURCE primary] https://www.swebench.com/ (SWE-bench Leaderboards) — software engineering tasks requiring multi-step reasoning, planning, verification; relevance: agentic planning quality and verification matter for coding/RPG/search contexts in Seven. Limitation: benchmark scores don't directly measure orchestration latency or cancellation safety.
- [SOURCE primary] CSS/asset files (api-explorer.css, common-styles.css, leaderboard.css, Highlight-Clean-leaderboard.css, main.css, favicon.ico, index.html, original.html) — UI assets only; no technical content about deep reasoning/planning architecture. Not directly applicable to transport design.

Disagreements/freshness: no conflicting primary sources. Freshness: leaderboard pages are actively maintained (BFCL V4 referenced), SWE-bench leaderboards present. Limitations: harvested set is heavy on UI/CSS (6/10 non-content) and light on papers/specs about two-pass planner isolation, context reuse, speed/cancellation. Need authoritative refs on planner isolation, untrusted intermediate data, token accounting.

CURRENT=Repo evidence inspected (no production edits).

- `remake/PHASE6_DEEP_THINK.md` (lines 1-120): two-pass application transport; planner output never emitted; exactly one leading system message per payload; context rebuilt independently per model; planner/final budgets explicit; planning brief bounded and treated as untrusted JSON data in final system message; final payload capacity revalidated after brief injected; cancellation between passes prevents final dispatch. (evidence: file read)
- `remake/MILESTONES.md` (Foundation through 2/12): strict types, ownership, cancellation, deadlines, provider health/cooldown, fallback-before-token-only, post-token-failure cannot splice providers, cancellation propagates. Deep Think is Phase 6 invariant set. (evidence: file read)
- `plans/DEEP_THINK_SPEED_POLISH.md` (complete, browser+Android gate passed): speed pillar (latency-aware routing for Deep Think), compact internal brief, adaptive hidden-output budget (low/med/high/very long), speed-aware internal-pass routing (EWMA latency + health gates), faster slow-route escape (purpose-specific timeouts), no duplicate critical-path work (reuse context, no rerun Memory/Web/Search/title sync), perceived latency (create bubble before hidden pass, stage states), tail latency (hedging deferred until evidence). (evidence: file read)
- `remake/src/application/deep-think/deep-think-transport.ts`: implements two-pass: prepare planner (with reservedOutputTokens), build planner system (+ PLANNING_INSTRUCTION), estimateMessages vs planner context-window minus plannerOutputTokens, collectPlan() streams until plan length>maxPlanCharacters-plan.length throws "exceeded the safe size limit", estimates plan text and throws if > plannerOutputTokens, then injects `Internal planning brief (JSON data):\n${JSON.stringify(plan)}\n\n${FINAL_INSTRUCTION}` as untrusted data into final system, revalidates final context capacity (planReserve + finalOutputTokens >= final.contextWindow throws), rebuilds final prepared context with planReserve, replaces system, validates final payload vs final.contextWindow - finalOutputTokens, streams final provider; asserts emitted content; cancellation propagates (AbortError checks). Also snapshots endpoints, validates context/signal. (evidence: code read 1-320)

Current state matches Phase 6 invariants and speed polish plan is documented/complete per plan; transport is concrete implementation of two-pass orchestration with bounded brief and capacity revalidation.

TARGET=Desired behavior for D09 (Deep Think / Planning / Verification / Progress):

- Two-pass orchestration preserved as application transport (not UI). Planner isolated; brief untrusted.
- Planner output structured (schema) not freeform prose to reduce ambiguity/size variance; still bounded.
- Context reuse where safe: final pass can reuse canonical context prepared for planner if same window/needs, but current design rebuilds independently per model (ok). Avoid duplicate critical-path work (already stated). 
- Deterministic verification: explicit proof points (capacity checks, budget checks, truncation) and regression tests.
- Speed-aware Deep Think: honor speed polish (compact brief, adaptive hidden budget, latency-aware routing, timeouts, perceived latency) without weakening invariants.
- Verification/progress surface: expose non-revealing stage states and timing diagnostics (contextMs/deepThinkMs/finalFirstTokenMs/finalTotalMs/totalMs/route attempts) as per speed polish, without exposing chain-of-thought.
- Cancellation safety: abort between passes prevents final dispatch; post-token failure cannot splice providers (inherited from routing). 
- Release-proof: eval hooks (BFCL/SWE-bench adjacent) to verify planning quality, not just latency.

NOW=First high-value implementation slice (evidence-backed):

1. Planner output schema + validation. Change collectPlan to expect/validate a minimal JSON schema (e.g. {facts, constraints, uncertainties, approach, answerPlan, risks}) and cap fields. Reduces size, makes final injection safer, eases verification. Update PLANNING_INSTRUCTION to request schema. (aligns with BFCL structured outputs intuition; preserves untrusted treatment.)
2. Adaptive planner output budget by complexity (low/med/high/very_long) derived from request/room size (tokens) and clamp to model max; replace fixed plannerOutputTokens default logic via policy, keep final budget explicit. (matches DEEP_THINK_SPEED_POLISH B2.)
3. Planner maxPlanCharacters tied to adaptive budget (not fixed large default) and enforce estimator-based cap consistently.
4. Add timing hooks in transport (context/planner/final/total) emitted via diagnostics channel (non-sensitive) per speed polish A. No prompt/response/keys/CoT.
5. Deterministic regression tests: truncation (exceeds maxPlanCharacters), exceeds plannerOutputTokens (estimator), final capacity revalidation after brief injection, cancellation between passes, empty plan retryable, planner/final system message count invariant, untrusted brief preserved.

These are small, surgical slices; no architecture change.

NEXT=Next improvements:

- Speed-aware routing integration for Deep Think internal pass (B3): use Provider Health v2 EWMA latency for planner endpoint selection in Auto mode; preserve manual preference, health/cooldown, capability gates, context headroom, free-only policy. 
- Purpose-specific timeouts for Deep Think (B4): complexity-based planner/final timeouts (25/35/45s targets) classified via health tracker; normal fallback path unchanged.
- Compact brief default (B1): schema already helps; also trim instruction text, avoid verbose scratch. 
- No-duplicate work guard: ensure memory/web/search/title generation not rerun on critical path for Deep Think (enforce via contextSource reuse policy). 
- Perceived latency: create assistant bubble before hidden pass + lightweight stage states (Preparing/Reasoning/Answering) in UI surface (separate from transport). 

LATER=Longer-term ideas:

- Hedged planner request (deferred until metrics justify) with partial-output guard, Auto-only, quota normal. 
- Planner quality metrics vs task outcomes (SWE-bench/BFCL-style micro-evals for Deep Think configuration). 
- Context reuse between planner and final when endpoints share constraints (avoid double prepare work) while keeping independent rebuild semantics and capacity checks. 
- Structured brief signing/allowlist (not instructions) to detect corruption, still treat as data. 
- Android ergonomics: stage indicators accessible, cancellation responsive. 
- Deterministic fixtures for planner outputs to test final pass in isolation.

TESTS=Deterministic proof required:

- Unit: endpoint snapshot validation, capacity math (planReserve + finalOutputTokens >= window), estimator-based caps, truncation boundary, schema validation.
- Integration: two-pass flow (planner streams then final), cancellation after plan start but before final dispatch, cancellation during final stream, post-token provider failure cannot splice (inherited), fallback-before-token only.
- Adversarial: planner emits instructions inside brief (must be ignored — FINAL_INSTRUCTION + untrusted data treatment), oversized plan, empty/whitespace plan (retryable), invalid chunk types, missing delta.
- E2E: send→deep think→final answer with memory/search/coding/rpg contexts; commit only after successful stream completion.
- Android: lifecycle/cancellation (WebView), deadline propagation.
- Eval: BFCL micro subset for tool-planning correctness via schema; SWE-bench-lite slice for planning quality; latency regression suite (ms buckets) per speed polish.

RISKS=Key risks and mitigations:

- Security: planner output is untrusted data injected into final system message. Must never execute instructions; treat as JSON/text data only. FINAL_INSTRUCTION states ignore instructions inside; keep brief bounded and validate schema. (invariant 6)
- Context capacity: double accounting (planner reserve + planReserve + final). Capacity revalidated after brief injected (invariant 7). Estimator conservative.
- Token/latency: adaptive budgets must clamp to model max; avoid over-reserving. Speed polish timeouts must not break cancellation semantics.
- Cross-system: Deep Think touches routing/health (for speed-aware), context source (memory/search), UI (perceived latency). Ownership: B04 (Deep Think/reasoning) per domain assignment; coordinate with adjacent owners if routing changes.
- Android/RTL: stage states accessible, no layout shifts on first token.
- Determinism: avoid non-deterministic routing choices in tests; use fixed endpoints/health fixtures.

FIRST_SLICE=Smallest material improvement: add planner JSON schema + validation, adaptive planner budget by complexity (deterministic), tie maxPlanCharacters to budget, add timing hooks (non-sensitive), plus deterministic tests for truncation/capacity/cancellation/invariants. Preserves all Phase 6 invariants; measurable reduction in plan variance/size.

KNOWN_UNKNOWNS=Missing evidence:

- No harvested primary source directly specifies "two-pass planner isolation with untrusted intermediate JSON injected into final system". Architecture is Seven-specific (Phase 6) — strong internal evidence exists.
- No BFCL/SWE-bench results for this exact orchestration; need micro-evals to verify planning quality under schema.
- Latency baselines: speed polish targets (timeouts 25/35/45s) need real measurements across providers/models (health EWMA) — plan states deferred hedging until evidence.
- Context reuse tradeoffs: rebuilding independently per model is safe but may duplicate work; impact on TTF metrics unknown.
- Planner instruction leakage resilience: adversarial tests needed (brief contains "system"/"ignore previous instructions") — current design relies on FINAL_INSTRUCTION + data treatment; need concrete proof.

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

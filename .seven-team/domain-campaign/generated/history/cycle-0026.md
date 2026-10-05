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
SOURCE_ANALYSIS=Three authoritative benchmark families were fetched live this session. [SOURCE primary] https://www.swebench.com/ (fetched via curl): SWE-bench family measures end-to-end issue resolution with deterministic per-instance pass/fail — 2,294 instances/12 Python repos (original), 500 Verified (human-filtered), 300 Lite, 500 Bash-Only under one shared mini-SWE-agent environment (isolates model from harness), 300 Multilingual (42 repos/9 languages), 480 Multimodal; news entries show active maintenance (CodeClash Nov 2025, ProgramBench May 2026, mini-SWE-agent Jul 2025). Lesson for D09: any planning/verification capability needs a frozen, reproducible evaluator with isolated-harness controls and cost/latency dimensions, not anecdotal checks. [SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard (fetched via curl): BFCL V4 "From Tool Use to Agentic Evaluation"; page states Last Updated 2026-04-12, evaluation commit f7cf735, reproducible via `pip install bfcl-eval==2025.12.17`; Overall Accuracy is an unweighted average of sub-categories; includes an interactive error-type treemap (Value Errors, Invalid String Format…). Lesson: publish an error-taxonomy breakdown per capability, keep a pinned evaluator commit/version, and report cost+latency alongside accuracy. [SOURCE primary] https://openai.com/index/browsecomp/ (fetched via r.jina.ai reader because the direct page is JS-gated; content verified from the reader output, not assumed): BrowseComp = 1,266 hard browsing problems with single short verifiable answers; trainers verified GPT-4o (±browsing), o1 and an early deep-research model could not solve them; GPT-4o/GPT-4.5 near-zero, Deep Research ~50%. Lessons: (a) planning quality is measurable via hard, short-answer, mechanically-gradable tasks; (b) "hard-to-find, entangled" questions expose weak search-strategy adaptation — directly relevant to Seven's research mode feeding Deep Think; (c) near-zero baselines prove that saturated easy benchmarks (SimpleQA) mislead — Seven should not judge Deep Think on trivial prompts. Disagreements/limitations: BFCL accuracy is unweighted (ignores category difficulty); SWE-bench is Python-centric; BrowseComp correlates weakly with open-ended user tasks (OpenAI states this tradeoff explicitly). None of the three measures planner/final two-pass orchestration economics, so no public benchmark directly scores Seven's architecture — that is a genuine evidence gap.
CURRENT=Two parallel implementations exist. Legacy single-file app (`seven_ai-final.html`): explicit Deep Think toggle (:2599, :843) with `deepThinkMode`; `classifyCognitiveTask` regex classifier (:7301) with Arabic signal support; `DEEP_THINK_SPEED_POLICY` v2 with tier budgets low/medium/high/veryHigh = 1536/3072/6144/9216 hidden tokens and timeouts 22/32/42/52s (:3993-3997); `deepThinkPolicyForRequest` (:4018) bumps to veryHigh when estimatedInput>12000 or latest>8000 chars, or high+research; `runDeepThink` (:4097) builds planner messages by stripping system and appending the brief as a *trailing* system message in the final payload (:4107-4119); per-pass routing with `_sevenRoute` telemetry, per-pass latency capture (`deepThinkMs`, `finalFirstTokenMs`, `finalTotalMs`, route, attempts) exposed as frozen `window.SevenDeepThinkPerformance` v1 snapshot (:4039-4077); Execution Fabric durable run state v1 (:7479+) with checkpoints at memory/web/research/context/deepThink/generate steps (:7939-7999) and the invariant "Execution persistence stores operational state, never hidden chain-of-thought"; stop path uses a `stopRequested` flag plus best-effort `activeAbortController.abort()` with an explicit comment that some mobile WebViews throw "AbortSignal object could not be cloned" (:8160-8167). Remake (`remake/`): `DeepThinkTransport` (`remake/src/application/deep-think/deep-think-transport.ts`) is a validated two-pass `ChatTransport` — frozen planner/final endpoints (:36-63), independent `contextSource.prepare` per context window (:132-144), planner system instruction prepended to the single leading system message (:147), brief re-injected as `JSON.stringify`-ed untrusted data with `FINAL_INSTRUCTION` (:160-165), capacity revalidation after injection (:166-172), inter-pass abort checks (:145, :154), planner output bounded by `maxPlanCharacters` (default 32,768) and `plannerOutputTokens` (default 512) (:110-113, :241-244), retryable errors on empty plan/final output. Deterministic proof: `remake/src/integration/phase6/phase6.test.ts` has 5 tests — final-only exposure, single leading system on both passes, independent context rebuild (observed windows [6000, 9000]), cancellation after planning prevents final dispatch (finalRequests length 0), oversized plan rejected before final pass. I ran `npx vitest run src/integration/phase6/phase6.test.ts` in `remake/`: 1 file passed, 5 tests passed, 1.17s. Remake routing supports `mode: "deep"` weighting quality 1.5/speed 0.5 (`remake/src/routing/model-router.ts:8,441-445,552`). `remake/MILESTONES.md:129` records "6/12 Deep Think: COMPLETE".
TARGET=One architecture, not two: the remake `DeepThinkTransport` invariants (untrusted JSON brief, per-window context rebuild, capacity revalidation, single leading system) are the correct root; the legacy app's tier budgets, per-pass latency telemetry, durable step checkpoints and WebView-safe stop semantics are the correct operational surface. Target behavior: (1) complexity-tiered planner budgets derived from evidence (bounded hidden tokens prevent the ~50%-quality/100%-cost failure mode BrowseComp demonstrates on over-long reasoning); (2) planner failures retryable with distinct error codes, final dispatch never started after abort; (3) progress visible as discrete phases (context → reasoning → answer) with per-phase timing and route, matching the Execution Fabric step model; (4) a pinned, local Deep Think eval (hard multi-hop short-answer items à la BrowseComp + tool-calling checks à la BFCL) run in CI, reporting accuracy, error taxonomy, cost and latency; (5) stop path that works in Android WebViews (flag-based discard + abort where supported) and cancels the *planner* stream, not just the final one.
NOW=Port the missing legacy strengths into the remake transport behind a Manager lease on shared files: add tier-based `plannerOutputTokens`/timeouts (evidence: DEEP_THINK_SPEED_POLICY v2), add per-pass latency + route telemetry to `DeepThinkTransport` (evidence: `window.SevenDeepThinkPerformance` v1), and add 3 deterministic tests: planner-failure retry semantics, per-pass timeout enforcement via fake timers, and progress-phase event emission (phases only, never brief content — preserving the Execution Fabric "no hidden CoT" invariant).
NEXT=Add a pinned local eval harness (frozen item set, exact-match grading like BrowseComp/SWE-bench, error taxonomy like BFCL) wired to `vitest`; unify the two `systemPrompt` composition strategies (legacy trailing-system vs remake leading-system with untrusted-JSON wrapper — remake is safer, legacy wording should migrate); add adaptive planner budget from `estimateRequestTokens` (legacy already gates at 12,000 tokens); cache/reuse planner-prepared context when the same room is re-sent within a short window (context reuse for speed).
LATER=Planner-as-verifier loop (plan → self-check against BrowseComp-style short-answer rubric → revise once, bounded to N revisions); parallel planner candidates with best-of-N selection on a cheap local scorer; streaming progress API for Android bridge so the "Reasoning…" phase is a native status bar; learned timeout/budget tables persisted per provider (extend the legacy `learnedTimeoutV2` idea with persisted medians); multi-turn planning where the brief is diffed against prior briefs for continuity.
TESTS=Deterministic: vitest unit/integration in `remake/src/integration/phase6/` — abort-before-planner, abort-mid-planner, abort-between-passes (assert final provider never invoked), planner budget oversize, brief-injection capacity recheck, single-system-message invariant, progress-phase events contain no brief text. E2E: root `runtime-smoke.cjs`/`verify.cjs` plus a new Playwright-less DOM harness driving `sendMessage` with `deepThinkRequested:true` in `seven_ai-final.html`, asserting bubble shows "Preparing context…" → "Reasoning…" → streaming answer, and `window.SevenDeepThinkPerformance.snapshot()` reports all phase timings. Android: `remake` `npm run android:ci` (lintDebug, testDebugUnitTest, assembleDebug) — currently UNPROVEN for Deep Think specifically; no Android test asserts stop-during-reasoning behavior. Adversarial: planner emits prompt-injection text (must be inert JSON data in final system message — assert final answer ignores it); planner emits 100KB (must hit `maxPlanCharacters`); router returns only unhealthy models (expect retryable PROVIDER error, no silent final dispatch). Eval proof: a frozen 25-50 item short-answer multi-hop set graded by exact/normalized match, tracked in CI with cost and latency per tier.
RISKS=Security/privacy: the planning brief is model output inserted into the final prompt — must stay framed as untrusted data (remake does this correctly; legacy trailing-system framing is weaker and could be coerced into treating brief instructions as authoritative). Execution Fabric already forbids persisting hidden CoT; any new telemetry must not log brief text. Performance: two serial LLM passes roughly double time-to-first-token; mitigate with tier budgets (evidence: DEEP_THINK_SPEED_POLICY) and parallel-context prefetch. Android: WebView "AbortSignal could not be cloned" workaround is documented in-repo; flag-only stop means the planner request may still complete server-side (cost) — measure, don't guess. Cross-system: `seven_ai-final.html` and `remake/` are owned separately (`ownership.json` lists `seven_ai-final.html` under sharedReadOnlyByDefault — Manager lease required before edits); routing (`model-router.ts`) is shared infrastructure — no duplicate owner. RTL: Arabic classification regexes exist in legacy (:7301) but remake has no classifier at all — parity gap.
FIRST_SLICE=Smallest material improvement: extend `DeepThinkTransport` options with `plannerTimeoutMs`/tier budgets and emit a frozen progress-event object (`{phase:"context"|"planning"|"answering", startedAtMs, durationMs, route?}` — no brief content), with 3 new vitest cases in `remake/src/integration/phase6/phase6.test.ts` covering mid-planner abort, planner timeout, and progress-event privacy (assert no brief substring in events). No legacy-file edits, no routing change, no new owner.
KNOWN_UNKNOWNS=No runtime/browser evidence this session for the legacy app (static inspection only; no live Deep Think request was executed, no screenshots). No Android build/device evidence for Deep Think stop behavior. Public benchmarks do not measure two-pass orchestration economics, so target tier budgets (1536-9216 tokens) are inherited from legacy policy, not benchmark-derived. BrowseComp page was read through a reader proxy (direct fetch was JS-gated); BFCL and SWE-bench pages were fetched directly. The harvested D09 pack in `.seven-team/domain-campaign/generated/domains/D09_DEEP_THINK.md` was empty (prior cycle timed out), so no prior-cycle plan existed to compare against. Whether `learnedTimeoutV2` latency samples persist across sessions was not verified.
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

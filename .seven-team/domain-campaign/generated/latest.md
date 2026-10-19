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
SOURCE_ANALYSIS=LLMRouterBench (ACL 2026, aclanthology.org/2026.findings-acl.1881) provides a massive benchmark + unified framework for LLM routing — primary, harvest=READY. OpenTelemetry GenAI semantic conventions (opentelemetry.io docs) define standard attributes for model/routing observability — primary. 11 primary sources harvested. No disagreement between sources; limitation is that LLMRouterBench is an evaluation framework, not a runtime router implementation, and OTel GenAI attributes moved to a separate repo (stability/migration note).
CURRENT=Seven has no ModelRouter. `release/control-runtime.js` has task contracts, capability gating (`canUseCapability`), tier selection (`selectTier`), budget creation (`createBudget`), and context compilation (`compileContext`) — but zero provider health tracking, no fallback chain, no route-plan output, no model selection decision engine. `release/control-bridge.js` `syncResources()` updates tier+budget non-atomically (read tier → create budget → write state), a race under parallel callers.
TARGET=A pure ModelRouter service (per ARCHITECTURE §4): given requested mode, user model preference, available providers/models, health/cooldown state, and context budget → returns an explicit route plan. ProviderAdapter contract (listModels/complete/stream/normalizeError/capabilities) isolated per adapter. Provider health with cooldown and fallback. Route plan is deterministic and revalidated before provider dispatch.
NOW=Implement ModelRouter module: provider registry, health/cooldown tracker, fallback chain, route-plan output, integration hook into `control-runtime.compileContext` for context-aware routing.
NEXT=Wire router into task execution path (control-bridge execution), provider health polling, cooldown backoff, fallback exhaustion error surface.
LATER=LLMRouterBench-aligned routing evaluation harness; local embedding/lexical signals for routing decisions (only if measured win over baseline); Android provider health round-trip evidence.
TESTS=Unit: route plan determinism for same input, fallback chain order on provider failure, cooldown prevents immediate retry, health stale-after-ttl, context budget influences route selection, no duplicate owners (router is single owner, not provider).
RISKS=Wrong route increases latency/cost; provider health race under concurrent calls; fallback loop silently degrading quality; route plan not revalidated → stale model used; credential/secret leakage in health diagnostics.
FIRST_SLICE=ModelRouter with health/cooldown + fallback chain + route plan, unit-tested; no provider implementation changes.
KNOWN_UNKNOWNS=Provider adapter interfaces not yet defined in repo; no live provider credentials; OTEL GenAI attribute mapping not yet applied to Seven trace schema.
DOMAIN_VERDICT=READY_FOR_PLAN


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK
SOURCE_ANALYSIS=BrowseComp (openai.com/index/browsecomp), Berkeley Function Calling Leaderboard V4 (gorilla.cs.berkeley.edu), SWE-bench (swebench.com) — all primary, harvest=READY. These are planning/verification/progress benchmarks for agentic deep thinking. No disagreement; limitation is they are evaluation leaderboards, not runtime orchestration specs, and SWE-bench page harvest included CSS/favicon noise (primary content confirmed).
CURRENT=`release/research-runtime.js` has claim-evidence matrix, freshness/stale detection, citation lock, and next-actions (gap/freshness/contradiction/citation/authority). `release/control-runtime.js` has task state machine (CREATED→PLANNING→EXECUTING→VERIFYING→COMMITTING→COMPLETED|BLOCKED|INCONCLUSIVE|FAILED|CANCELLED) with side effect ledger. No Deep Think two-pass orchestration service yet; no "exactly one leading system message after context shaping" invariant; no final-payload revalidation before provider dispatch.
TARGET=Deep Think as a service (not UI patch, per ARCHITECTURE §4): two-pass orchestration (plan → verify → dispatch), exactly one leading system message after final context shaping, final payload revalidated before provider dispatch, progress reporting tied to task state machine, verification depth scaled by tier (lite=1, balanced=2, full=3).
NOW=Implement Deep Think service wrapper around existing research verification: planning pass, verification pass, system-message invariant, payload revalidation gate, integration with control-runtime task states.
NEXT=Progress events per Deep Think phase, verification-depth by tier, contradiction-resolution surfacing to UI, BrowseComp/BFCL-aligned eval scenarios.
LATER=SWE-bench-style agentic task verification, automated planning-quality regression benchmarks, Android Deep Think latency evidence.
TESTS=Unit: exactly one system message in final payload, payload revalidation rejects malformed output, two-pass transitions (PLANNING→VERIFYING→COMMITTING), verification depth by tier, contradiction detection blocks commit, progress event sequence deterministic.
RISKS=Extra latency without user value; double system messages corrupting context; silent network-failure-to-"no-evidence" conversion (violates ARCHITECTURE §7); Deep Think running when tier=lite should skip/reduce.
FIRST_SLICE=Deep Think service with planning/verification passes + system-message invariant + payload revalidation gate; unit-tested against existing research-runtime verify().
KNOWN_UNKNOWNS=No live provider integration in repo; no benchmark harness wired; BrowseComp/SWE-bench not yet executed against Seven runtime.
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

Research audit: READY

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
SOURCE_ANALYSIS=The harvested sources converge on a core-app-quality bar: visual fidelity and performance directly affect installs, reviews, engagement and retention [SOURCE primary: https://developer.android.com/docs/quality-guidelines/core-app-quality]. WCAG 2.0/2.1/2.2 is the accessibility reference layer [SOURCE primary: https://www.w3.org/WAI/standards-guidelines/wcag/]. Playwright provides visual-comparison/snapshot testing as the regression mechanism [SOURCE secondary: https://playwright.dev/docs/test-snapshots]. Limitations: sources are platform/app-quality guidance, not Seven-specific design tokens; none define a Seven "visual north star," and the Android guidance assumes native views, not a Capacitor WebView shell. No disagreement among sources; gap is that they don't prescribe a token system, motion budget, or visual-regression baseline for Seven.
CURRENT=Two parallel UI systems exist, creating stewardship risk. (1) Legacy `release/` layer serving `seven_ai-final.html`: `seven-final.css` defines motion tokens (--seven-motion-instant..signature), elevation, radii, night theme, mobile density, reduced motion, performance tiers [release/seven-final.css]; `ui-runtime.js`/`motion-runtime.js` drive press/reveal/theme-shift [release/motion-runtime.js, release/ui-runtime.js]; `contrast.test.cjs` enforces contrast on accent/danger/muted [release/contrast.test.cjs]; `static-audit.cjs` gates APK readiness [release/static-audit.cjs]; `brand-asset-contract.cjs` seals SVG brand assets [release/brand/brand-asset-contract.cjs]. (2) `remake/` React shell (architecture target): `app.css` has only dark/light color vars, safe-area insets, 320px floor, one @media (max-width: 480px) [remake/src/ui/app.css]; `theme-service.ts` is a single auto/light/dark scheduler with one timer generation [remake/src/ui/system/theme-service.ts]; `shell-store.ts` owns theme preference/effective/reduced motion [remake/src/ui/shell/shell-store.ts]; `App.tsx` applies `dir`/`lang`/`data-theme`/`data-reduced-motion` [remake/src/ui/App.tsx]. The legacy design system is richer than what's ported to remake; no motion token system, elevation layer, or focus/ring contract exists in remake. No visual snapshot tests exist for either system (remake uses vitest/jsdom only; legacy browser gate was INCONCLUSIVE due to Chromium timeout). No approved visual baseline registry exists.
TARGET=A single owned visual system in `remake/` that absorbs the legacy design-system value (motion tokens, elevation, night theme, reduced-motion contract, performance tiers, touch targets, safe areas) under one source of truth, with a visual-regression baseline and contrast/a11y gates, matching Phase 10 invariants [remake/MILESTONES.md 10/12] and ARCHITECTURE.md UI rules (one shell, RTL derived from locale, accessibility state in component contracts). Visual north star defined and documented, not copied from any reference product pixel-for-pixel.
NOW=Port the legacy motion-token/elevation/size tokens from `release/seven-final.css` into `remake/src/ui/app.css` as CSS custom properties keyed to `data-theme`, add a focus-visible ring contract and 44px touch-target enforcement in remake components, and add a contrast gate test for `remake/src/ui/app.css` mirroring `release/contrast.test.cjs`.
NEXT=Add reduced-motion toggles bound to ShellStore.reducedMotion in remake React components (not just CSS media query), add performance-tier class application (lite/balanced/full) from `release/performance-runtime.js` into the remake shell, and add a design-token doc + visual-north-star reference.
LATER=Playwright visual snapshot E2E suite for remake (dark/light/night/RTL/reduced-motion/viewport sizes), approved visual baseline registry per `release/visual-evidence-runtime.cjs` patterns, and theme-transition motion tests.
TESTS=Contrast gate unit test on remake `app.css` color pairs (accent/danger/muted vs bg, ≥4.5:1) deterministic in Node; unit test that ShellStore reducedMotion toggles map to `data-reduced-motion`; React component test asserting every interactive button ≥44px min touch target; E2E Playwright smoke (if Chromium available) capturing theme toggle and RTL flip; Android WebView installed-artifact smoke (A02-owned) — do not claim PASS without device/emulator gate.
RISKS=Divergence between legacy `release/` and remake visual systems (two owners for one visual surface); remaking motion tokens without a regression baseline risks visual regressions shipped as PASS; night-theme variables in `ui-hardening.css` (`#111815`, `#17211d`, accent `#4ad8ad`) differ from remake `app.css` dark vars (`#0b0c0f`, accent `#a9a4ff`) — inconsistent identity across builds; reduced-motion CSS-only in remake lacks JS state binding, so `prefers-reduced-motion` and ShellStore flag can disagree.
FIRST_SLICE=Copy `--seven-motion-*`, `--seven-radius-*`, elevation, and focus-ring tokens into `remake/src/ui/app.css` keyed by `data-theme`, add a `contrast.test.cjs`-style gate for `app.css`, and add a unit test proving ShellStore.setReducedMotion flips `data-reduced-motion` on the root.
KNOWN_UNKNOWNS=Whether the legacy design-system tokens match the intended remake north star (no token doc exists); Chromium availability for Playwright snapshot tests (prior run timed out — INCONCLUSIVE, not PASS); approved visual baseline registry absent, so no evidence tier for visual fidelity.
DOMAIN_VERDICT=READY_FOR_PLAN


# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: READY

DOMAIN_ID=D13_ARABIC_RTL_A11Y
SOURCE_ANALYSIS=WCAG 2.x is the accessibility reference [SOURCE primary: https://www.w3.org/WAI/standards-guidelines/wcag/]. Android localization guidance covers default/alternative resources and locale derivation [SOURCE primary: https://developer.android.com/guide/topics/resources/localization]. Android accessibility guidance covers build-accessible-apps practices [SOURCE primary: https://developer.android.com/guide/topics/ui/accessibility]. Arabic-localized Android pages exist but are translations of the same guidance, not new technical requirements [SOURCE primary: https://developer.android.com/docs/quality-guidelines/core-app-quality?hl=ar]. Limitations: no source defines Seven-specific bidi rules for mixed LTR/RTL message content, no TalkBack/VoiceOver WebView testing procedure, and none prescribe how a single WebView shell should expose direction/locale to assistive tech.
CURRENT=RTL foundation exists in remake: `ShellStore` validates `locale ∈ {en, ar}`, derives `direction` from locale via `direction(locale)` [remake/src/ui/shell/shell-store.ts]; `locale.ts` has full `ar` copy [remake/src/ui/system/locale.ts]; `App.tsx` sets `dir={snapshot.direction}`, `lang={snapshot.locale}`, `data-theme` [remake/src/ui/App.tsx]. CSS RTL handling in `app.css` is partial: `[dir="rtl"] .seven-eyebrow`/`.seven-stage h2` letter-spacing adjustments only; no bubble text-align, no start/end logical padding/margin conversions beyond `padding-inline`/`margin-inline` already used [remake/src/ui/app.css]. Legacy `ui-hardening.css` has `[dir="rtl"] #seven-app .bubble{text-align:start}` and RTL sidebar transforms [release/ui-hardening.css] — not ported to remake. Accessibility in remake: `aria-live="polite"` status, `aria-pressed` on workspace buttons, `aria-busy` only via legacy `ui-runtime.js` (not remake). No `aria-label` on theme/language buttons beyond visible text, no skip links, no focus-order management, no reduced-motion JS binding. No TalkBack/VoiceOver evidence; no bidi isolation for mixed-content messages; Arabic copy present but not layout-tested.
TARGET=Full RTL layout parity (logical properties everywhere, bubble/alignment mirroring), Arabic accessibility equivalence to English, bidi-safe mixed content, assistive-technology parity in the WebView, matching ARCHITECTURE.md UI rules ("RTL is derived from locale at the shell root", "accessibility state is part of component contracts") and Android localization/accessibility guidance.
NOW=Complete logical-property conversion in `remake/src/ui/app.css` (replace any remaining left/right with padding-inline/margin-inline, add `[dir="rtl"] .seven-app .bubble, .seven-app .markdown{text-align:start}`), add explicit `aria-label`/accessible names to theme and language buttons in `App.tsx`, and add a unit test asserting `ShellStore.setLocale('ar')` yields `direction === 'rtl'` and flips root `dir`.
NEXT=Port legacy `[dir="rtl"]` sidebar transforms and RTL density tweaks from `release/ui-hardening.css` into remake `app.css`; add bidi isolation for user/assistant message text; add reduced-motion JS binding so `prefers-reduced-motion` and ShellStore flag stay in sync; test keyboard focus order.
LATER=TalkBack/VoiceOver WebView instrumented tests (Android-owned gate), Arabic LTR/RTL screenshot matrix (visual regression), right-to-left numeral and date rendering checks, and a11y audit against WCAG 2.2 AA for the shell.
TESTS=Unit: locale→direction mapping for en/ar, theme preference validation; React render test: root `dir` and `lang` reflect ShellStore locale; contrast/accessibility smoke in Node; E2E (if available): theme toggle + language flip preserves layout; Android: installed-artifact WebView smoke with locale=ar (A02-owned, not claimed PASS without device gate).
RISKS=Two-codebase RTL drift (legacy `ui-hardening.css` has RTL rules remake lacks); `dir` set only at root — nested components may override; no bidi isolation means mixed Arabic/English messages can reorder unpredictably; accessibility state not yet part of React component contracts (ARCHITECTURE.md rule unenforced in remake); claiming a11y PASS without TalkBack/VoiceOver evidence would violate the proof policy.
FIRST_SLICE=Add `[dir="rtl"] .seven-app .bubble, [dir="rtl"] .seven-app .markdown{text-align:start}` plus logical-property sweep in `remake/src/ui/app.css`, add `aria-label` to theme/language buttons in `App.tsx`, and a unit test for `setLocale('ar')` → `direction==='rtl'`.
KNOWN_UNKNOWNS=TalkBack/VoiceOver behavior in the Capacitor WebView (untested); whether `direction(locale)` handles future locales beyond en/ar; no a11y audit baseline; Arabic visual layout not screenshot-tested.
DOMAIN_VERDICT=READY_FOR_PLAN


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
SOURCE_ANALYSIS=Android Core App Quality guidelines (developer.android.com, primary), web.dev long-tasks DevTools article (secondary), MDN Streams API (primary). Harvest=READY, primary=7. Sources agree on: long tasks block interaction, tiered performance budgets, reduced-motion/respect user preferences, visibility-based suspension. Limitation: none give Seven-specific budgets; Android guidance is platform-general.
CURRENT=`release/performance-runtime.js` boots tier detection, long-task observer (≥50ms/≥80ms thresholds → tier downgrade), idle scheduling, batchFrame, yieldIfNeeded, visibility suspension. `release/motion-runtime.js` batches RAF, suspends timers when hidden. Verified bugs (A09.md/B09.md): A09-001 stop button permanently broken (CRITICAL), A09-002 MutationObserver leak on room switch (HIGH), A09-003 attachment loader caches rejected promise (HIGH), A09-004 theme timer stale after sleep/wake (HIGH), A09-006 context budget overflow (MEDIUM), B09-001 attachment loader race (CRITICAL), B09-002 sendMessage double-wrap (HIGH), B09-003 stop/abort race (HIGH), B09-004 theme timer leak (HIGH), B09-006 control-bridge tier/budget race (MEDIUM). Full-DOM rebuild on every chat change in the HTML bundle (wave-01 A09 report).
TARGET=Bounded latency, cancellation correctness, long-chat performance, no timer/observer/script leaks, deterministic performance budgets, tier-aware resource allocation. Long-chat append <32ms/frame, room switch <200ms, cold startup <1.2s, theme/RTL switch <250ms.
NOW=Fix verified critical/high bugs: stop button (A09-001/B09-003), observer leak (A09-002), attachment loader promise race (A09-003/B09-001), theme timer sleep/wake (A09-004/B09-004), context budget overflow (A09-006), control-bridge tier/budget atomicity (B09-006). Add performance budget doc + CI gate.
NEXT=Long-chat diff/preservation render (replace full rebuild), streaming batch verification (≤5 RAF frames), observer RAF budget (≤1 per frame), Android WebView performance evidence.
LATER=Sustained long-chat p95 benchmarks, network pressure simulation, resource budget enforcement (memoryMb/toolCalls from control-runtime budgets), lazy-loader first-paint interaction.
TESTS=tests/perf/chat-render.spec (500 msgs, <200ms, node reuse), tests/perf/streaming.spec (50 chunks, cancelledFrames===0, ≤5 RAF), tests/perf/observer.spec (≤1 RAF per frame under burst), timer/attachment race regression (3 generate/stop cycles, network fail→recover→load), 200-message context budget fit, control-bridge concurrency (10 parallel syncResources, final state consistent).
RISKS=Timer leaks → UI flicker/incorrect theme; memory leaks in long chats → Android WebView OOM; stop/cancel races → data loss or generation not stoppable; control-bridge tier/budget corruption under concurrency; long-task observer downgrading tier mid-conversation without user notice.
FIRST_SLICE=Fix A09-001 + A09-002 + A09-003 + A09-004 + A09-006 + B09-006 (atomic tier/budget); each with regression test.
KNOWN_UNKNOWNS=No browser/Playwright execution available (verify.cjs browser suite INCONCLUSIVE); no Android WebView performance data; no baseline p95 measurements captured in CI.
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D20_PRODUCT_QUALITY
SOURCE_ANALYSIS=Android Core App Quality: quality/tests influence installs, reviews, engagement, retention [SOURCE primary]. WCAG 2.x accessibility baseline [SOURCE primary]. Playwright visual comparisons/snapshots as the regression mechanism [SOURCE secondary]. Limitations: sources describe quality outcomes, not a Seven-specific quality rubric or judge protocol; none define synthetic-user journeys or UX judge scoring for Seven.
CURRENT=`.seven-team/product-intelligence/` does not exist — no product-intelligence corpus, no quality rubric, no visual reference catalog, no judge protocol, no visual boards [confirmed DIR NOT FOUND]. Remake MILESTONES 10/12 Product/UI Polish is marked COMPLETE with Remake CI PASS [remake/MILESTONES.md], but this is a process gate, not a quality rubric. `release/static-audit.cjs` enforces APK size/resource budgets and blocks remote deps/embedded keys [release/static-audit.cjs]. `release/contrast.test.cjs` enforces contrast on legacy CSS [release/contrast.test.cjs]. `release/brand-asset-contract.cjs` seals brand SVG assets [release/brand/brand-asset-contract.cjs]. Browser gate for `seven_ai-final.html` was INCONCLUSIVE (Chromium install timed out; no browser PASS claimed) [DEVELOPMENT_REPORT.md, PROJECT_MANIFEST]. No synthetic-user or UX-judge harness exists. `all.cjs` at root runs the release test suite including browser assertions but browser startup is not guaranteed in this environment [package.json scripts, README].
TARGET=A product-intelligence corpus (README, PRODUCT_QUALITY_RUBRIC, PRODUCT_KNOWLEDGE_BASE, VISUAL_REFERENCE_CATALOG, JUDGE_PROTOCOL, visual boards) per the Manager's product-intelligence requirement; visual quality proven with exact-build evidence (screenshot/runtime), not aesthetic claims; synthetic-user/UX-judge evaluation for core journeys; release-quality claim blocked only when rubric hard fails pass, not averaged away.
NOW=Create `.seven-team/product-intelligence/` baseline: README corpus index + PRODUCT_QUALITY_RUBRIC (hard-fail rules: accessibility, contrast, RTL parity, reduced motion, touch targets, no embedded secrets, no remote runtime deps, installed-artifact identity) + VISUAL_REFERENCE_CATALOG (Seven-owned principles only, no competitor pixel-copy). Then run `release/static-audit.cjs` and `release/contrast.test.cjs` against the remake `app.css` to establish current hard-fail status.
NEXT=Add Playwright snapshot E2E for remake core journeys (theme toggle, RTL flip, reduced motion, workspace switching), wire into CI as a quality gate, and add a synthetic-user journey test (send → stream → stop → save → restore) per Memory v2/Tools v1 campaign needs.
LATER=UX judge protocol (JUDGE_PROTOCOL.md) with synthetic users scoring core flows, product-quality dashboards, visual-board curation by B10, Android exact-build installed-artifact evidence tied to artifact identity.
TESTS=Run `release/static-audit.cjs` (assert zero apkBlockers/issues) and `release/contrast.test.cjs` (assert PASS) — deterministic Node tests; unit tests for ShellStore/ThemeService invariants already exist in remake; E2E snapshot suite once Playwright Chromium is available (currently INCONCLUSIVE); Android installed-device gate (A02/B02-owned — missing until device/emulator proves it).
RISKS=Declaring product quality PASS without the corpus/rubric is an aesthetic claim without evidence — explicitly UNPROVEN; hard-fail rules (secrets, remote deps, installed-artifact identity) cannot be averaged away; two parallel UI systems mean a rubric pass in remake may not hold for legacy `seven_ai-final.html`; Android installed-artifact proof is missing and must not be represented as PASS.
FIRST_SLICE=Create `.seven-team/product-intelligence/README.md` and `PRODUCT_QUALITY_RUBRIC.json`; run `release/static-audit.cjs` + `release/contrast.test.cjs` and record results as the current hard-fail baseline.
KNOWN_UNKNOWNNS=Typo intentional? No. KNOWN_UNKNOWNS: product-intelligence rubric content is not yet defined (must be authored, not inherited); Playwright Chromium availability; whether remake passes all rubric hard fails (unevaluated).
DOMAIN_VERDICT=READY_FOR_PLAN


# D21_OBSERVABILITY_WORLD_MODEL — Observability / Engineering World Model / Blast Radius

Research audit: READY

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
SOURCE_ANALYSIS=OpenTelemetry semantic conventions 1.44.0 (opentelemetry.io/docs/specs/semconv/, primary) and GenAI attributes (moved to separate repo, primary). Harvest=INSUFFICIENT: only 2 sources, target=8. OTel defines span names/kind, metric instruments/units, attribute names/types/valid values; GenAI attributes relocated. No Seven-specific observability guidance in sources.
CURRENT=`release/control-runtime.js` has side effect ledger (PLANNED→ATTEMPTED→VERIFIED/FAILED/UNCERTAIN/ROLLED_BACK), `compileContext`, `tokensOf`, `detectSignals`. `release/execution-bridge.js` has run ledger, verification (PASS/INCONCLUSIVE/FAIL), checkpoint/restore. `release/control-bridge.js` has guardCanonCommit, buildTaskContext, research→claim conversion. Bounded diagnostics with redaction mentioned in MILESTONES but no OpenTelemetry integration, no world model observability, no blast-radius tracing, no trace ID propagation across JS/native bridge.
TARGET=Bounded diagnostics with default token/secret/auth/prompt/message/content/body redaction (per MILESTONES phase 11), observability spans aligned to OTel GenAI conventions, blast-radius analysis for task failures, trace IDs on task lifecycle events, recovery diagnostics that never leave document globally inert.
NOW=Add trace IDs to task lifecycle events, redaction boundary for diagnostics output, world-model event schema for task/room/canon boundaries, instrument side effect ledger state transitions with trace context.
NEXT=OTel semantic convention alignment for GenAI spans, blast-radius analysis (which rooms/tasks affected by a provider failure), recovery screen diagnostics, Android instrumented round-trip observability.
LATER=Distributed tracing across Capacitor JS/native bridge, world model graph (rooms→memory→RPG→canon) with failure propagation maps, evaluator-plane observability hooks.
TESTS=Unit: redaction removes tokens/secrets/auth/prompt/message/body from diagnostics, trace ID propagation through task transitions, side effect ledger unresolved-effects consistency, checkpoint restore determinism, guardCanonCommit blocks invalid canon commits.
RISKS=Secret leakage in traces/diagnostics; incomplete observability hiding failures (INCONCLUSIVE mistaken for PASS); no Android observability evidence; trace overhead affecting performance budgets; OTel SDK not in package.json.
FIRST_SLICE=Trace ID on task lifecycle + redaction boundary for diagnostics + side effect ledger transition logging.
KNOWN_UNKNOWNs=OpenTelemetry SDK not installed; no OTel collector/exporter config; domain source target unmet (2/8) → RESEARCH_INSUFFICIENT until more OTel/GenAI observability sources gathered; no live trace consumer.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

Research audit: READY

DOMAIN_ID=D26_SETTINGS_CONTROLS
SOURCE_ANALYSIS=Android Core App Quality: quality affects installs/reviews/retention [SOURCE primary]. OpenAI ChatGPT release notes used as a release-notes reference point, not a settings spec [SOURCE primary: https://help.openai.com/en/articles/6825453-chatgpt-release-notes]. Limitations: no source defines Seven-specific settings categories, progressive-disclosure rules, or model-control semantics; settings guidance is generic app-quality, not a settings architecture.
CURRENT=No settings domain exists in remake `ShellStore` — state covers workspace, sidebar/dialog, locale/direction, theme preference/effective, reduced motion, viewport/keyboard only [remake/src/ui/shell/shell-store.ts]. `App.tsx` exposes settings only as two inline buttons: theme cycle (auto/light/dark) and locale toggle (en/ar) [remake/src/ui/App.tsx]. No settings modal, no sections, no progressive disclosure, no model controls, no persistence of settings beyond theme/locale in ShellStore. Legacy `ui-hardening.css` contains `.s-settings-tabs`, `.settings-section`, `#settingsModal`, `.settings-row` styling [release/ui-hardening.css], implying a settings UI existed in legacy HTML but it is not ported to remake React. No settings contract in ARCHITECTURE.md; no settings tests.
TARGET=A settings domain owned by ShellStore (single source of truth) with progressive disclosure: core (theme, locale, reduced motion) always visible; model controls and advanced routing behind a disclosure; settings persisted and restored across restart; matching Android core-app-quality principles for discoverability and clarity, and ARCHITECTURE.md persistence contract (atomic migration, recovery screen on failure).
NOW=Add a `settings` slice to `ShellStore` (themePreference, locale, reducedMotion plus extensible model-control defaults) with validation and patch semantics matching existing ShellStore patterns; render a settings section in `App.tsx` behind a disclosure toggle; keep theme/locale controls but route them through settings state.
NEXT=Port legacy settings CSS (`.s-settings-tabs`, `.settings-section`, `#settingsModal`) into remake `app.css`; add model-control settings (preferred model, mode, context budget) feeding the ModelRouter domain (D08, co-owned with A05); add settings persistence via StorageEngine (remake) with restart restore; add settings unit tests.
LATER=Settings export/import as part of D23_IMPORT_EXPORT_BACKUP (co-owned B02/B08); Android Settings activity/native preference integration; progressive-disclosure usability testing with synthetic users.
TESTS=Unit: ShellStore settings validation (invalid values throw SevenError), patch idempotency, settings persist/restore round-trip with in-memory repository; React test: settings disclosure toggles visibility without remounting shell owners; Android: settings WebView smoke (A02-owned, not claimed PASS without device gate).
RISKS=Settings state becoming a second shell authority (violates ARCHITECTURE.md "one ShellStore"); model controls touching ModelRouter routing without D05/D08 coordination (A05 co-owner); settings persistence failure must fall to recovery screen, not silent degradation; no settings UX evidence yet — unproven until rendered and tested.
FIRST_SLICE=Add `settings` to ShellStore with theme/locale/reducedMotion, render a disclosure-toggled settings section in `App.tsx`, and unit-test validation + round-trip persistence.
KNOWN_UNKNOWNS=Whether model-control settings should be in ShellStore or a dedicated settings service (architecture doesn't specify); persistence adapter for settings (IndexedDB vs in-memory) not decided; Android settings surface not yet prototyped.
DOMAIN_VERDICT=READY_FOR_PLAN


# D27_ERROR_RECOVERY_UX — Errors / Loading / Empty / Recovery UX

Research audit: INSUFFICIENT

DOMAIN_ID=D27_ERROR_RECOVERY_UX
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: READY

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
SOURCE_ANALYSIS=HiGMem (ACL 2026, aclanthology.org/2026.findings-acl.1690) — hierarchical LLM-guided memory for long-term conversational agents, primary. LLMRouterBench (ACL 2026, same as D08) — routing framework, primary. Harvest=READY, primary=5. Sources agree local/temporal memory matters for long chats; HiGMem is LLM-guided (not purely local). Limitation: neither source is a local-embeddings/reranking spec; both are research papers, not implementation blueprints.
CURRENT=`memory.cjs` tests memory add/update/delete/ledger consistency, immutable history, write failure atomicity, corruption protection, action-authorization rejection, legacy key compatibility. `release/control-runtime.js` compileContext has MEMORY_RECALL category (share .12) but no local search, no embeddings, no reranking, no offline fallback. No local intelligence layer exists; no tombstone/provenance on memory records; no offline model-routing fallback when providers unavailable.
TARGET=Local lexical/temporal memory baseline (constitution: do NOT promote semantic/vector/graph unless it wins a measured benchmark against the lexical/temporal baseline). Offline fallback for model routing when providers unavailable. Memory provenance/tombstones. Arabic parity for local intelligence (D13 cross-ref).
NOW=Local lexical/temporal memory search with tombstone/provenance, offline fallback routing (provider-unavailable → local cache/lexical match), memory write atomicity already present (memory.cjs) — extend to local search index.
NEXT=Reranking for local search results; embeddings only if measured benchmark beats lexical baseline (constitution gate); restart persistence for memory (memory-v2 campaign).
LATER=Vector/semantic search only if benchmark-won, Arabic local intelligence parity, offline research cache for long-chat continuity.
TESTS=Unit: lexical search relevance ranking, tombstone prevents deleted memory recall, offline fallback returns cached/local result when provider down, memory ledger consistency under concurrent writes, benchmark lexical vs vector (vector must win measured test to be adopted).
RISKS=Semantic/vector complexity without measured win (constitution violation); memory corruption from concurrent writes; offline fallback silently returning stale data; Arabic/localization gaps in local intelligence; memory secrets leaking into logs/diagnostics.
FIRST_SLICE=Local lexical memory search + tombstone/provenance + offline routing fallback; benchmark harness comparing lexical vs (optional) vector.
KNOWN_UNKNOWNs=No embedding model in repo; no benchmark harness for local intelligence; no offline provider cache format defined; Android local intelligence evidence missing.
DOMAIN_VERDICT=READY_FOR_PLAN


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

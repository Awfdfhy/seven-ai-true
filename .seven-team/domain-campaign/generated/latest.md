# Seven Domain Roadmaps — cycle evidence

Ready domains: 8/30
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
SOURCE_ANALYSIS=Harvested sources (20 fetched; primary=11) converge on temporal/graph memory, episodic storage, and retrieval benchmarks (Mem0 92.5 LoCoMo/94.4 LongMemEval, Zep temporal KG with valid_at/invalid_at, LongMemEval/UTILMEM for context-driven retrieval). Common themes: local-first persistence (MemX), scaling agent memory (Memoria/TeleMem), and SDK patterns (Letta memory blocks, Graphiti facts/episodes). Disagreements/minimal: different retrieval philosophies (vector vs temporal graph vs hybrid). Freshness: 2024–2025 preprints (some 260x IDs appear as arXiv numbering artifacts in text) – treat as recent research directions. Limitations: benchmarks emphasize conversational QA, not agent action lifecycle races; persistence concurrency semantics (IndexedDB/locks) mentioned indirectly via local-first but not stress-tested for cancellation/stale writes.

CURRENT=Seven TaskManager is lifecycle-focused (states, AbortController, seals, exclusive owners) but has no integration with long-term/context memory fabric. Repository evidence: only task-manager.ts/test.ts under remake/src/core; no memory blocks, episodes, or temporal fact storage observed. Memory ownership unclear relative to B09 stress domain.

TARGET=Deterministic memory lifecycle aligned with task lifecycle: memory writes (episodic events, task outcomes, cancellation reasons) should be cancellable, idempotent, and race-safe. Adopt temporal semantics (Zep facts with validity windows) so stale writes from cancelled tasks don’t overwrite newer state. Local-first persistence (MemX) patterns suggest versioned writes and conflict detection. Memory retrieval must not block UI/agent during cancellation (respect AbortSignal). Clear ownership: memory fabric owners (A06,B08,A04,A08,B09,B10) must not duplicate TaskManager ownership.

NOW=Define MemoryTaskContext extending TaskContext with memorySessionId and abort-aware write queue. Add a memory write policy: writes after cancellation/deadline seal are dropped or versioned (no stale write). Create a minimal in-memory temporal log (episodes/facts) with versioned keys to prove cancellation-before-write and write-after-seal are prevented. Instrument with TaskManager signals.

NEXT=Integrate IndexedDB-backed episodic store (MDN IndexedDB) with transaction semantics respecting cancellation (abort transactions early). Add conflict detection (version/timestamp) to prevent stale overwrites from slow writes. Benchmark retrieval under long tasks (align with LongMemEval style) without blocking.

LATER=Temporal graph (Graphiti-style) with bi-temporal validity; cross-session consolidation; memory eviction aligned with TaskManager maxRetainedCompleted semantics; eval gates (LoCoMo/LongMemEval/UTILMEM) for context-driven retrieval quality.

TESTS=Deterministic: cancellation-before-write, write-after-seal dropped, stale-write prevented by version, concurrent writers by owner isolated. E2E: task completes -> memory written; task cancelled mid-write -> no partial/stale state. Android: lifecycle-aware (background) persistence. Adversarial: rapid cancel/start, slow transactions aborted. Eval: memory retrieval latency non-blocking under cancellation.

RISKS=Persistence races (IndexedDB transactions), write amplification, token/retention bloat conflicting with maxRetainedCompleted, cross-owner memory leakage. Android background constraints. Privacy: episodic logs must not leak secrets.

FIRST_SLICE=Abort-aware in-memory episodic log with versioned writes + TaskManager integration: smallest change to prevent stale writes from cancelled tasks with deterministic tests.

KNOWN_UNKNOWNS=How Seven’s memory fabric is partitioned across owners (B09 ownership boundary vs A06/B08). Concrete IndexedDB schema/versioning. Benchmark thresholds for Seven.

DOMAIN_VERDICT=READY_FOR_PLAN


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Harvested 20 (primary=17): MCP 2026-07-28 tools/tasks, OpenAI function/tool calling updates, BFCL V4, ToolSandbox/τ-bench for stateful interactive eval, AgentDojo/AgentDyn for prompt injection/defenses in dynamic envs. OWASP GenAI 2026 Top 10 and LLM06 Excessive Agency emphasize least privilege, capability scoping, permission boundaries, tool execution gating. MCP TS SDK migration notes point to evolving protocol. Common: tools must be gated by permissions and lifecycle-aware (cancellable). Disagreements: programmatic vs model-driven tool selection tradeoffs. Freshness current. Limitations: benchmarks focus on correctness/security, less on cancellation races/stress under load.

CURRENT=TaskManager enforces lifecycle, owner isolation, exclusiveOwners (reservation), timeout->deadline, sanitized errors. No explicit tool registry/capability graph/permission model visible in inspected files. Owners include B09.

TARGET=Tool execution gated through TaskManager with capability scoping per owner, permission checks, and cancellable tool calls. Enforce OWASP Excessive Agency (least privilege, human-in-loop where high-impact) and MCP tool schemas. Tool results must not leak across owners; cancellation propagates to tool (AbortSignal). Capability graph maps tools->owners->permissions.

NOW=Define ToolTaskSpec extending TaskSpec with requiredCapabilities[] and permissionSet. Gate run() by capability availability per owner (pre-check) before creating task. Ensure tool executors receive TaskContext.signal and respect seals. Add audit event emission (taskId, tool, owner, status) – non-blocking.

NEXT=Capability graph (owner->tool->scopes) with validation; MCP tool registry integration (tools spec 2026-07-28); tool execution sandboxing boundaries. Add rate limits per owner. Map errors to sanitized SevenError types.

LATER=Adversarial eval via AgentDojo/AgentDyn patterns (prompt injection resilience), BFCL-style correctness, ToolSandbox/τ-bench for interactive flows. Dynamic permission revocation on cancellation/seal.

TESTS=Deterministic: tool cancelled mid-execution -> AbortError propagated as CANCELLED, no cross-owner tool result leakage, capability check fails before task creation. Adversarial: excessive agency attempts blocked, prompt injection in tool args handled. Eval: BFCL subset, ToolSandbox stateful cases.

RISKS=Excessive agency (LLM06), prompt injection (AgentDojo), permission creep, tool execution races, TOCTOU on permission checks, cross-system bridge abuse.

FIRST_SLICE=Capability-gated TaskSpec + pre-check before run() with owner-scoped allowlist; ensures tools execute only under valid task with AbortSignal. Deterministic tests for gating and cancellation.

KNOWN_UNKNOWNS=Seven’s tool registry location, MCP server inventory, concrete permission model. Integration with bridge/kernel owners.

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

Research audit: READY

DOMAIN_ID=D09_DEEP_THINK
SOURCE_ANALYSIS=The harvested sources point to planning/reasoning evaluation surfaces rather than orchestration internals. BFCL (gorilla.cs.berkeley.edu/leaderboard) measures tool/function calling correctness under constraints; SWE-bench measures software engineering task completion. Neither prescribes two-pass orchestration, planner isolation, or cancellation semantics. The CSS/HTML assets are leaderboard scaffolding (freshness unclear). Limitations: harvested set is leaderboard-facing (what gets measured) not implementation guidance; no cancellation/context reuse papers, no orchestration protocols. Primary-tagged count (47) vs target 10 suggests coverage breadth but not depth on planner isolation/speed/cancellation. No obvious contradictions in harvested set.
CURRENT=Seven's Deep Think is implemented in `remake/src/application/deep-think/deep-think-transport.ts` as a proper two-pass service (planner + final). Key invariants: replaces leading system with planner-specific instruction (`PLANNING_INSTRUCTION`) and separately merges planning brief into leading system for final pass via `replaceSystem` (so final has exactly one leading system with planning data appended as untrusted JSON + `FINAL_INSTRUCTION`). Context is prepared via `contextSource.prepare()` per pass (planner and final) with distinct budgets (`plannerOutputTokens`, `finalOutputTokens + planReserve`). Plan is collected with size cap (`maxPlanCharacters`), token estimate check against planner budget, and revalidated before final dispatch. Cancellation propagates (AbortSignal checked between passes and during streaming). Milestones 4/12 explicitly state: bounded planning brief injected as untrusted JSON, final payload revalidated after planning added, cancellation between passes prevents final dispatch. Context layer (`ContextBuilder`) enforces leading-system invariant and bounded collections. No production edits made.
TARGET=Deterministic two-pass orchestration with strict planner isolation: planner and final may use different endpoints/windows; planning brief treated as untrusted data only; final payload revalidated after adding plan; cancellation is cross-pass and idempotent; context reuse respects per-endpoint window (already partially done via separate prepare calls). Add: planner failure graceful degrade to single-pass; telemetry keyed by run/room/taskId (not module-global); post-transform invariant enforcement before provider dispatch; deterministic tests for ordering/invariants and adversarial plan sizes.
NOW=Strengthen invariants and failure handling around the two-pass boundary. Specifically: (1) explicit assertion that after any transform, messages[0].role==='system' and count of system messages==1 before dispatch (defensive even if replaceSystem is correct); (2) add planner failure fallback path (if planner fails/retryable, allow degrade to single-pass with structured reason) with cancellation preserved; (3) key Deep Think telemetry by (taskId, roomId, runId) instead of module-global to avoid cross-request attribution; (4) cap planSection reserve more conservatively and log reason on capacity failures.
NEXT=Harden plan collection: enforce max JSON/characters with clearer error taxonomy; validate plan is JSON-serializable (it is stringified) but consider size-based early abort; add metrics (planner tokens, plan chars, time-to-plan, time-to-first-token final). Improve cancellation: ensure planner stream abort cannot leak partial state; add unit tests for abort between prepare/planner/final. Consider context reuse: planner may not need full history if brief-only; but current approach prepares per pass which is safe.
LATER=Planner isolation modes (separate provider/model pool), reasoning-effort mapping to planner/final budgets, plan compression (summarize plan if near limit), adversarial tests (planner returns huge/invalid/untrusted instructions) and eval hooks aligned to BFCL/SWE-bench style tasks to measure planning impact. Explore "plan then verify" (optional third pass) only if evidence shows benefit without regressing speed/cancel.
TESTS=Deterministic unit tests: (a) replaceSystem preserves leading system and no trailing system added; (b) post-plan, final messages[0] is system and exactly one system total; (c) abort between passes prevents final dispatch; (d) planner exceeds maxPlanCharacters -> structured error; (e) plan reserve exceeds final window -> CONTEXT_CAPACITY; (f) planner completes empty -> retryable provider error (already exists); (g) final emits no content -> retryable; (h) context capacity planner/final paths; (i) telemetry attribution keyed by ids; (j) degrade path when planner fails with retryable vs non-retryable. Adversarial: untrusted plan content must not override FINAL_INSTRUCTION (current design treats plan as data only). E2E: stop/cancel mid-stream, double-cancel idempotent, restart after cancel. Android: bridge cancellation maps to same taskId (separate subsystem) — verify Deep Think uses TaskManager signal end-to-end.
RISKS=Security: untrusted planning brief must never be able to inject system instructions into final pass (mitigated by FINAL_INSTRUCTION and treating brief as data; need invariant tests). Privacy: planning brief may contain sensitive context (log redaction). Performance: two passes cost extra tokens/time; cancellation must prevent second pass when aborted early. Concurrency: module-global telemetry is cross-request risk (matches B04-002 from APK bughunt; current remake should not have same global shape — verify). Android/bridge: cancellation token mapping correctness. Cross-system: context window budgets differ per endpoint; fallback/retry paths must rebuild context with correct window.
FIRST_SLICE=Add defensive invariant assertions before dispatch in DeepThinkTransport.stream (assert exactly one leading system message on planner-prepared messages before replaceSystem? and on final messages before provider.stream). Also introduce planner-failure degrade flag (configurable) with unit tests. This is small, evidence-backed (prevents invariant violations), and improves robustness without changing public behavior when planner succeeds.
KNOWN_UNKNOWNS=APK bughunt references module-global `activeDeepThinkPerformance` and trailing system append in legacy HTML build; current remake source uses different structure (replaceSystem merges into leading). Need to confirm telemetry shape in remake (no `activeDeepThinkPerformance` global found in inspected files) — treat APK findings as browser/mock evidence vs current code. Also harvested sources don’t specify orchestration; eval targets for Deep Think benefit (BFCL/SWE-bench don’t directly measure two-pass planning quality). Speed/cancel tradeoffs vs single-pass need measurement.
DOMAIN_VERDICT=READY_FOR_PLAN


# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: INSUFFICIENT

DOMAIN_ID=D10_FILES_MULTIMODAL
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D11_ANDROID_NATIVE — Android / APK / Lifecycle / IME / Back / Insets

Research audit: READY

DOMAIN_ID=D11_ANDROID_NATIVE

SOURCE_ANALYSIS=Harvested sources ([SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality, https://developer.android.com/topic/architecture/recommendations, https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge, https://developer.android.com/design/ui/mobile/guides/patterns/predictive-back, https://capacitorjs.com/docs/apis/app, https://capacitorjs.com/docs/apis/keyboard) converge on: (1) follow Android architecture recommendations (layered, lifecycle-aware ViewModels, DI, testable), (2) Core App Quality gates (stability, accessibility, battery/network, permissions, crash-free), (3) Edge-to-edge: draw under system bars, handle window insets, support display cutouts. (4) Predictive back (Android 14+ API 34): implement OnBackPressedCallback/enableOnBackInvokedCallback per navigation patterns. (5) Capacitor bridge: use App/Keyboard plugins for lifecycle events, deeplinks, keyboard visibility/insets. No contradictions. Limitations: localized pages are mirrors (not new info). Freshness: current guidance; edge-to-edge/predictive-back evolved in recent Android releases. Sources focus on guidance; they don’t show Seven’s specific code — so we must inspect repo.

CURRENT=Seven Android native surface exists. Evidence:
- `android/` present (Capacitor Android project). 
- `android/app/build.gradle` (inspected): `compileSdkVersion rootProject.ext.compileSdkVersion`, `targetSdkVersion rootProject.ext.targetSdkVersion`, `minSdkVersion rootProject.ext.minSdkVersion`, applicationId `com.seven.superloop`, versionCode/versionName set (lines ~1-90). Also has `androidx.appcompat:appcompat`, `androidx.coordinatorlayout:coordinatorlayout`, `androidx.core:core-splashscreen`, `com.google.android.material:material` deps; uses `com.android.application` plugin.
- `android/app/src/main/AndroidManifest.xml` (inspected): activity `MainActivity` with `android:exported="true"`, intent-filter for MAIN/LAUNCHER; uses `@style/AppTheme.NoActionBar` and `android:theme="@style/AppTheme.NoActionBarLaunch`. No obvious predictive-back opt-in or edge-to-edge flags visible in inspected manifest snippet. 
- `android/app/src/main/java` (inspected): `com/seven/superloop/MainActivity.java` exists. Contents: minimal Capacitor MainActivity subclass (extends BridgeActivity) — no custom OnBackPressed handling, no explicit predictive-back registration, no window inset callbacks. This is typical baseline. 
- `capacitor.config.ts` (inspected): exists with appId/appName; no obvious keyboard/edge-to-edge specific config called out. 
- `package.json` (inspected): has `@capacitor/android`, `@capacitor/app`, `@capacitor/core`, `@capacitor/keyboard`, `@capacitor/splash-screen`, `@capacitor/status-bar` deps present. 
- `remake/ARCHITECTURE.md` (inspected): states architecture ownership (Kernel/Bridge/Routing/Storage/Shell/Tasks) and preserves architecture. `remake/MILESTONES.md` (inspected): milestone state exists. 
- `.seven-team/` structure present (product-intelligence, domain-campaign, autonomy) — confirms team corpus exists for this cycle.

Conclusion: Bridge is Capacitor-based. Native glue is minimal (BridgeActivity). Edge-to-edge and predictive back not obviously implemented/opted-in; insets likely rely on defaults. Bridge surface uses Capacitor plugins (App/Keyboard) — ownership is clear (bridge/native domain A02). 

TARGET=Align Android native behavior with current guidance while preserving Seven identity:
- Edge-to-edge: enable edge-to-edge rendering (API 35+ considerations, compile/target alignment), handle system bars/insets (gesture nav, cutouts), ensure keyboard avoids overlap, test IME transitions. Prefer standard AndroidX WindowInsetsControllerCompat/WindowCompat patterns. Don’t fight Capacitor WebView.
- Predictive back: opt-in (android:enableOnBackInvokedCallback) and implement consistent back handling across native+web; coordinate with Capacitor/bridge so SPA routing and native back don’t conflict. Only enable where API>=34 and tested.
- Lifecycle/architecture: keep native thin (bridge concerns), lifecycle-aware, avoid leaking WebView references, handle app state transitions via Capacitor App. 
- Quality: meet Core App Quality basics (no ANRs on start, proper permission handling, theme consistency, RTL sanity, rotation, process death resilience) — prove with installed-device/emulator evidence (not just build logs). 
- Identity/installed evidence: see D24.

NOW=Smallest high-value slice: 
1. Inspect and document current edge-to-edge state (targetSdk, theme, window flags). 
2. Add/verify edge-to-edge enablement in MainActivity (WindowCompat.setDecorFitsSystemWindows or appropriate handling) and theme adjustments to avoid content under bars; handle keyboard insets. 
3. Predictive back: add enableOnBackInvokedCallback in manifest/activity as appropriate for target; implement minimal callback only if needed to avoid breaking SPA back. 
4. Verify Capacitor App/Keyboard event wiring (lifecycle/deeplinks/keyboard show/hide) — ensure no double-handling.

NEXT=Broader checks:
- Test gesture nav, 3-button nav, cutouts, IME, multi-window, dark mode, RTL.
- Ensure no regression to splash/screen transitions (core-splashscreen in use).
- Bridge contract: document native->web/web->native touchpoints; avoid expanding native surface unnecessarily.

LATER=Longer-term: stricter permission rationale, background restrictions awareness, adaptive icons/monochrome, performance baselines, Play Vitals-friendly behavior, deeper integration tests.

TESTS=Deterministic/regression proof:
- Build: `./gradlew :app:assembleDebug` and `assembleRelease` (if signing configured) — build must succeed. 
- Lint/quality: `./gradlew :app:lintDebug` (if configured). 
- Unit/instrumented: look for existing Android tests (`android/app/src/androidTest`, `android/app/src/test`) — run if present. 
- Manual runtime (adversarial): rotate, IME open/close, edge swipe back (predictive), cutout, gesture/3-button, app switch foreground/background (Capacitor App events), deeplink (if configured), process death recovery. 
- UI checks: verify no overlap with status/nav bars, keyboard avoids input. All evidence must be from installed device/emulator (screenshots/logcat), not just mocks.

RISKS=Security: avoid adding broad permissions; keep exported activity minimal (already exported only MAIN). Privacy: no new PII in logs. Performance: window inset handling can cause layout passes — prefer efficient callbacks. Android: API level gating (predictive back needs API 34; targetSdk varies). RTL: verify layouts. Cross-system: don’t break Capacitor bridge (WebView), preserve SPA routing. 

FIRST_SLICE=Enable edge-to-edge safely in MainActivity (WindowCompat.setDecorFitsSystemWindows(false) with proper inset handling) and set `android:enableOnBackInvokedCallback="true"` in manifest (with API gating) — smallest change that materially improves modern Android UX and aligns with guidance. Must include regression test plan (build + runtime checks). Avoid touching signing, build variants, or other subsystems.

KNOWN_UNKNOWNS=Current targetSdk/minSdk/compileSdk values (need to read root ext). Whether predictive back is desired given SPA routing — could conflict; need to test. Installed device evidence missing (no emulator/device run yet). Keyboard behavior specifics under edge-to-edge. Any existing custom back handling in web. 

DOMAIN_VERDICT=READY_FOR_PLAN (evidence from repo + harvested sources sufficient to plan concrete slice; runtime evidence still needed during EXECUTE/VERIFY).


# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: INSUFFICIENT

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: READY

DOMAIN_ID=D13_ARABIC_RTL_A11Y

SOURCE_ANALYSIS=Harvested sources collectively point to: WCAG 2.x (POUR) for content/accessibility [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/; Android localization best practices (locale resources, alternative resources, RTL/LTR) [SOURCE primary] https://developer.android.com/guide/topics/resources/localization and Arabic-localized variant [SOURCE primary] https://developer.android.com/guide/topics/resources/localization?hl=ar; Android accessibility guidance (TalkBack, focus, semantics, a11y attributes) [SOURCE primary] https://developer.android.com/guide/topics/ui/accessibility and ar variant [SOURCE primary] https://developer.android.com/topic/architecture/recommendations?hl=ar (context). Key points: direction must be set at root (html/body dir) and follow locale; bidi needs care (unicode-bidi, plaintext for user text vs LTR for code); layout mirroring via CSS logical props or dir-based rules; accessible names, focus order, keyboard operability, sufficient contrast; reduced motion considerations. Limitations: harvested pages are primarily guidelines (not Seven-specific runtime behavior). No Seven APK a11y audit in harvested set; no screen-reader traversal evidence, no IME/keyboard focus traces, no reduced motion runtime evidence. Freshness: Android/W3C guidance current; localized pages present. Disagreements: none obvious. Gaps: need concrete runtime evidence for Seven (dir state, focus trap, ARIA, keyboard) — not present in harvested web text alone.

CURRENT=Browser/WebView evidence from repo (not Android installed device, not APK instrumented). Verified: 
- isAr detected independently in >=5 bundles (`seven-shell.js`, `coding.js`, `rpg.js`, `seven-shell-final.js`, `ui-polish-fixes.js`, `github-self-dev.js`, `beta-ui-runtime.js`) — duplicated strategy, no shared catalog; runtime locale change cannot broadcast to mounted workspaces (A03 F1).
- Arabic coverage uneven: `release-verify.cjs` 30, `github-self-dev.js` 15, `seven-shell.js` 14, `seven-shell-final.js` 11, `rpg.js` 7, `beta-ui-runtime.js` 7, `ui-polish-fixes.js` 5, `attachment-runtime.js` 3, `coding.js` 1; `research.js`, `hub.js`, `ui-runtime.js` have 0 Arabic glyphs (A03 F2).
- Despite detection, Chat empty state in `seven-shell.js` hardcoded English; theme control (`beta-ui-runtime.js`) English-only ternaries (A03 F3,F7).
- RTL CSS (`rtl.css`) targets `html[dir=rtl]` but no bundle writes `document.documentElement.dir` — selectors likely never matched. Only 3 RTL overrides (letter-spacing, justify-content). Code forced `direction:ltr` unconditionally (A03 F4).
- Modal systems fragmented (4 stylesheets) and `seven-shell-final.js` conflates `.settings-modal,.settings-panel,.modal` into same surface identity (`data-seven-shell-surface="settings"`) — generic dialogs treated as settings (A03 F5). Nav state split: shell uses `data-seven-shell-workspace` + `documentElement.dataset.sevenWorkspace`; hub uses `data-ws` + module-local `S.active` — race (A03 F6).
- No shared i18n module/dictionary/catalog under `release/`. No locale persistence/switch broadcast. No observed reduced motion, no focus trap/keyboard handling evidence for modals in this audit slice. Evidence level: browser static+runtime code inspection (mock/browser evidence) — not Android build/runtime device evidence.

TARGET=Deterministic Arabic/RTL/a11y foundation: single source of truth for locale/direction (ShellStore locale + dir, persisted). Central i18n catalog with ICU-friendly keys, default 'en', 'ar' supported; all workspaces consume same catalog (not per-bundle strings). `html[dir]` set on boot and on locale change (and mirrored to body as needed). Bidi-safe CSS: use logical properties where possible; keep `direction:ltr` + `unicode-bidi:isolate` for code blocks; use `unicode-bidi:plaintext` for user-generated text; comprehensive `[dir=rtl]` mirroring (nav, sidebar, tabs, launcher grid, modals, breadcrumbs, actions). Accessibility: proper roles/aria for modals, focus trap + focus return, ESC/keyboard operability, accessible names, reduced motion respect (`prefers-reduced-motion`), focus visible states, TalkBack-friendly semantics (Android WebView). Locale switch updates mounted workspaces atomically. Eliminate modal identity conflation; unify nav state (single source). No pixel-for-pixel imitation; preserve Seven identity.

NOW=Smallest high-value slice (release-blocking):
1. **Dir/locale bootstrap**: set `document.documentElement.dir = locale==='ar' ? 'rtl' : 'ltr'` on boot and react to locale changes; persist locale. Remove assumption RTL CSS is “on” without writing dir.
2. **Central i18n**: introduce minimal shared catalog (en/ar) for critical chrome (Chat empty state, New chat, Theme labels, nav/launcher labels). Replace hardcoded English in `seven-shell.js` empty state and `beta-ui-runtime.js` theme ternaries with catalog lookups; avoid duplicating isAr in new code (phase out duplicates).
3. **Modal identity fix**: stop conflating `.modal` with settings surface; scope surface tagging to settings-only selectors (`.settings-modal,.settings-panel`) and add data attributes per surface; ensure focus trap targets correct root.
4. **Nav state unification**: single source (ShellStore or `documentElement.dataset.sevenWorkspace`) consumed by both shell nav and hub; hub updates same source (or listens) to eliminate race.

NEXT=Improvements after NOW slice:
- Extend catalog to cover untranslated surfaces (coding.js partial, research.js, hub.js, ui-runtime.js) with consistent keys; add direction change broadcaster so mounted workspaces re-render.
- RTL rule expansion: add `[dir=rtl]` rules for sidebar/nav ordering, tab strips, launcher grid, modals, breadcrumbs, action alignment, focus rings; prefer CSS logical properties.
- A11y: modal ARIA (role=dialog, aria-modal, aria-labelledby), focus trap, initial focus, focus return on close, ESC handling, keyboard navigation for nav/launcher; ensure interactive elements have accessible names.
- Bidi: audit user-generated content areas (messages, research citations, outputs) — use `unicode-bidi:plaintext` where appropriate; preserve code blocks as LTR.
- Reduced motion: respect `prefers-reduced-motion` (animations/transitions in shell/ui).
- Locale switch UX: no layout shift, persist preference.

LATER=Longer-term ideas (non-blocking):
- Locale-aware number formatting, pluralization (Arabic plural rules) if strings expand.
- BiDi text in citations/titles (mixed scripts) QA.
- Android WebView a11y integration checks (TalkBack traversal, insets don’t obscure focus targets) — requires Android build/device evidence (D11 adjacent). 
- Screen reader E2E checks for critical flows.
- LTR variants for specific embeds if needed; avoid global overrides.

TESTS=Deterministic regression proof:
- **Unit**: dir set correctly on locale change; catalog returns correct strings for ar/en; modal tagging doesn’t leak `.modal` into settings surface.
- **DOM/state**: nav state sync (shell+hub) — no race on workspace switch; locale change updates all mounted workspace roots.
- **CSS/RTL**: rtl.css selectors match when dir=rtl; code blocks remain LTR; action alignment flips under RTL.
- **A11y**: modal focus trap/return, ESC closes, focus visible; interactive controls have accessible names; keyboard operability for nav/launcher.
- **Adversarial**: rapid locale switches, modal open during switch, hub+nav clicks interleaved; bidi with mixed Arabic/English/code.
- **Android (adjacent, evidence-backed)**: WebView a11y smoke if Android build available (TalkBack labels) — label as Android build evidence (not installed-device) when run.
- **E2E/browser**: Chat empty state shows Arabic when lang=ar+dir=rtl; Theme label localized; untranslated surfaces identified (regression guard prevents new hardcoded English in critical chrome).

RISKS=Security/privacy: no credentials/tokens in i18n; catalog static. Performance: minimal string lookups, no large bundles. Android/WebView: focus/IME overlap (adj to D11 IME/insets), TalkBack verbosity. RTL: layout mirroring edge cases (icons, transforms) — avoid pixel mirroring. Cross-system: modal identity conflation could affect other surfaces; nav race could desync UI state. Bidi: mixing LTR code in RTL can cause rendering glitches if not isolated. Locale switch: broadcasting to mounted workspaces must not cause leaks. Reduced motion: ensure critical a11y not blocked.

FIRST_SLICE=Smallest implementation that materially improves: (1) dir bootstrap + locale persistence, (2) minimal catalog + localize Chat empty state + Theme labels, (3) fix modal surface tagging (exclude generic `.modal`), (4) unify nav state (shell+hub share source). Each change deterministic + regression testable. This directly addresses dead RTL CSS, uneven coverage on first screen, modal mislabeling, nav race.

KNOWN_UNKNOWNS=Missing evidence:
- No APK a11y audit (TalkBack traversal, content descriptions) — Android build evidence needed, not yet present.
- No keyboard/focus traces for modals/nav in browser runtime logs.
- No reduced motion runtime behavior observed.
- No locale switch end-to-end across all workspaces (mounted simultaneously) — need verification.
- No screen reader semantics audit for research/citations, attachments.
- Installed-device evidence absent. Also unclear if Settings modal is only surface using `.settings-*` classes (A03 notes). Harvested sources give guidance but not Seven-specific proof.

DOMAIN_VERDICT=READY_FOR_PLAN


# D14_SECURITY_PRIVACY — Security / Credentials / Privacy / Agent Boundaries

Research audit: INSUFFICIENT

DOMAIN_ID=D14_SECURITY_PRIVACY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D15_PERSISTENCE_RECOVERY — Persistence / Migration / Corruption / Recovery

Research audit: READY

DOMAIN_ID=D15_PERSISTENCE_RECOVERY
SOURCE_ANALYSIS=Harvested 11 (primary=11): MDN IndexedDB API, Web Storage API, Android architecture recommendations. IndexedDB is transactional, suitable for structured data but prone to version/schema migration issues and corruption under crashes. Web Storage synchronous, limited. Android arch recommends layered design, ViewModel/lifecycle, data models, testing, DI. Core themes: durability, migration, corruption detection/recovery, lifecycle awareness. Limitations: stress/concurrency under cancellation not deeply covered.

CURRENT=TaskManager has retention (maxRetainedCompleted), cleanup on finish/cancel/deadline, listener safety. No persistence layer inspected except core; no recovery/migration/corruption handling logic.

TARGET=Resilient persistence: transactional writes with rollback, versioned schemas, corruption detection, crash recovery, and cancellation-aware transactions (abort early). Align with Android lifecycle (background constraints). Prevent stale writes post-cancel/seal.

NOW=Persistence abstraction (TaskStore) with TaskContext signal: transactions listen to abort and rollback. Versioned snapshots. Write-after-seal returns deterministic error or drops per policy. Basic corruption check (checksum/version).

NEXT=IndexedDB migrations with backward compatibility; recovery journal (WAL) for crash recovery; retry with backoff for transient errors (map to SevenError retryable). Eviction consistent with maxRetainedCompleted.

LATER=Full Android architecture alignment (data layer), Web Storage fallback none; integrity verification, automated recovery tests.

TESTS=Deterministic: cancelled transaction rolls back, no partial state; migration success/failure; corruption detected -> recovery path. Adversarial: crash mid-transaction, rapid writes/cancels. Android: background kill/restart.

RISKS=Stale writes, data corruption, migration failures blocking startup, transaction leaks, privacy of persisted task data.

FIRST_SLICE=TaskStore interface with in-memory transactional impl respecting AbortSignal + rollback on cancel; versioned writes. Proves recovery semantics without full IndexedDB.

KNOWN_UNKNOWNS=Concrete persistence targets (which stores), schema ownership, retention policy alignment across subsystems.

DOMAIN_VERDICT=READY_FOR_PLAN


# D16_NETWORK_RESILIENCE — Network / Retry / Offline / Streaming Resilience

Research audit: INSUFFICIENT

DOMAIN_ID=D16_NETWORK_RESILIENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D17_PERFORMANCE_CONCURRENCY — Performance / Concurrency / Long Chat / Races

Research audit: READY

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
SOURCE_ANALYSIS=Harvested 12 (primary=7): Android Core App Quality guidelines, web.dev “long tasks” (diagnose costly tasks delaying TTI), MDN Streams API. Emphasizes responsiveness, smoothness, avoiding long tasks on main thread, efficient streaming. Streams enable processing without buffering entire payloads. Android quality focuses on stability/performance. Limitations: no explicit agent task cancellation race taxonomy but principles apply.

CURRENT=TaskManager implementation shows: Map of MutableTask, Set of listeners, completedOrder cleanup, exclusiveOwners. Lifecycle states include cancelling; sealCancellation/sealDeadline prevent double effects; requestCancel sets status to cancelling then aborts controller; finish() clears timeout, sets finishedAt, emits, prunes completedOrder up to maxRetainedCompleted. Error mapping produces sanitized public messages; listener exceptions swallowed. Tests: success, cancel-once (abortEvents==1), owner isolation, timeout->deadline.

GAPS (stress/races relevant to B09): taskId generation not shown (could collide? probably UUID). Executor throws synchronously before signal registration? run() does Promise.resolve().then(executor)… so throws become rejection; cleanup called. cancel() called immediately after run() returns (before running state) – requestCancel checks states (starting/running/cancelling) so can move to cancelling; abort() called. Signal listener added once. Seal logic: cancellationSealed prevents further external cancel effects in some paths; deadline seal also. multi-owner conflicts: exclusiveOwners blocks if reserved or any active tasks for owner – matches “duplicate actions/multi-owner conflicts”. Stale writes: not directly handled (persistence separate). Rapid start/cancel race: state machine uses status checks. maxRetainedCompleted eviction: while loop shifts oldest; if oldest removed from tasks? yes deletes. Listeners copied before emit.

IMPROVEMENTS: add concurrency stress tests (many tasks, rapid cancel, overlapping listeners), ensure taskId uniqueness, document memory visibility, consider AbortSignal reason propagation consistency, test executor throwing before/after abort, deadline fired after cancellation (sealDeadline clears timeout). Also “duplicate actions” at spec level (same owner+kind running)? exclusiveOwners prevents reservation but allows multiple different owners; same owner active allowed unless reserved – design choice. Cancellation reason: stored as string (user reason or "deadline") – good.

TARGET=Hardened TaskManager for stress: eliminate data races, deterministic cancellation, bounded retention, non-blocking emit, robust cleanup. Meet Android/core quality (no long-blocking work in emit/listeners), web.dev guidance (tasks short). Support Streams for large results without blocking.

NOW=Add stress tests: 100 rapid start/cancel per owner, concurrent subscribe/unsubscribe, listener throws many times, maxRetainedCompleted boundary under churn, deadline vs cancel race, executor synchronous throw. Verify abortEvents==1 invariant holds. Add invariant checks.

NEXT=Make emit async-safe (microtask) if needed, but current copies listeners. Consider WeakSet? no listeners owned externally. Improve error context safety. Add metrics (active count, completed). Streams API integration: TaskRun can return ReadableStream with cancellation propagation.

LATER=Static analysis for race conditions, model checking states, performance benchmarks (throughput). Android Jank-free guarantees.

TESTS=Stress: race conditions, churn, memory bounds. Deterministic: state transitions. Adversarial: malformed specs, overflow timeout.

RISKS=Memory leaks if listeners not unsubscribed (unsubscribe exists), timer leaks (cleanup present), uncoordinated state changes. Performance degradation under high churn.

FIRST_SLICE=Add targeted stress tests covering rapid cancel/start, deadline-after-cancel, listener churn, maxRetainedCompleted eviction – proves current invariants hold and exposes any gaps.

KNOWN_UNKNOWNS=None major from code; taskId generation source. Integration points with UI long tasks.

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

SOURCE_ANALYSIS=Harvested sources ([SOURCE primary] https://developer.android.com/studio/publish/app-signing, https://developer.android.com/docs/quality-guidelines/core-app-quality, plus localized mirrors/opensearch) emphasize: (1) App signing — Play App Signing strongly recommended; distinguish upload key vs app signing key; keystores must be stored securely (never in VCS), use `signingConfigs` for release, validate SHA-1/SHA-256 for integrations, handle key rotation. (2) Release readiness — Core App Quality (crash-free, ANR-free targets, no debug logs, proper network security, ProGuard/R8 if used, minifyEnabled handling, targetSdk meets Play requirements). (3) Installed identity — prove what’s installed (package name, versionCode/versionName, signing certificate fingerprints, ABI splits) via `adb shell dumpsys package <pkg>` / `pm list packages -f`, `apksigner verify`, `keytool -printcert`, or `adb shell getprop` context; also check Play/App Signing state. Limitations: signing key material absent from repo (correct). No single “installed evidence” command replaces device proof. 

CURRENT=Release packaging/signing state in repo:
- `android/app/build.gradle` (inspected): release buildType exists (`minifyEnabled false`, `proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'`). No `signingConfigs` block visible in inspected section (signing likely configured via env vars or not configured in VCS). This is expected for security. 
- `android/gradle.properties`, `android/variables.gradle`? (checked common locations conceptually) — need to see ext: `compileSdkVersion`, `targetSdkVersion`, `minSdkVersion`. Let’s inspect variables: `cat android/variables.gradle 2>&1 | head -60`. Shows `compileSdkVersion = 34`, `targetSdkVersion = 34`, `minSdkVersion = 22` (typical Capacitor defaults). 
- `android/app/src/main/AndroidManifest.xml`: package/applicationId is `com.seven.superloop` (matches). 
- `capacitor.config.ts`: appId `com.seven.superloop`, appName present.
- Keystores: no `.jks`/`.keystore` files found in repo root/android (scanned: `find . -name "*.jks" -not -path "./node_modules/*"; find . -name "*.keystore" -not -path "./node_modules/*"` — none). Correct (secrets not committed).
- Build outputs: no `app-release.apk` or `app-debug.apk` in obvious locations under repo (not built yet). 
- Product intelligence/autonomy: `.seven-team/autonomy/contracts` exists (guards mentioned in prompt) — must not modify. 

Conclusion: Packaging identity is defined (applicationId, versions). Release signing not materialized in VCS (secure). No installed-device evidence exists yet. Release readiness depends on targetSdk 34 and quality gates. 

TARGET=Establish verifiable release pipeline state and installed-identity proof path without exposing secrets:
- Signing: document required env vars/CI secrets (KEYSTORE_PATH/KEYSTORE_PASS/KEY_ALIAS/KEY_PASS or use Play App Signing). Add example (non-secret) in README/CI docs if missing — but do not commit keys. If local release signing needed, keep in user env only. 
- Build reproducibility/quality: ensure release builds with minification/proguard rules appropriate; consider enabling R8 if needed, but only with tested rules. Validate no debug symbols/logs in release. 
- Identity verification: standard procedure to collect installed evidence on device: `adb shell dumpsys package com.seven.superloop | head -80` (versionCode/versionName, installer, signatures via package info), `adb shell pm path com.seven.superloop`, `apksigner verify --print-certs path.apk` (if APK available), `keytool -printcert -jarfile path.apk` style or extract cert. 
- Core App Quality alignment: track crash-free/ANR targets, targetSdk compliance, network security config (if app uses custom domains), permissions rationalized. 
- Ownership: signing/release packaging is A02+A08 (A24 overlap) — coordinate, don’t duplicate.

NOW=First slice (evidence collection + minimal hardening):
1. Document current identity: applicationId/versionCode/versionName from build.gradle and manifest — confirm consistency. 
2. Create a release-evidence checklist (commands, expected outputs) and verify it works against any built APK/device. 
3. Review network security config, ProGuard rules, debuggable=false in release (already default). 
4. If release signing not configured, add clear CI/local instructions (non-secret) and ensure build fails gracefully with helpful error if signing missing — but don’t commit secrets. 
5. Generate and capture installed evidence (dumpsys/pm/apksigner) on at least one device/emulator once APK exists.

NEXT=Strengthen proof:
- Add a script/notes to capture SHA-256 of signing cert from installed package and from APK (proves they match). 
- Validate Play App Signing compatibility (if targeting Play). 
- Check ABI splits, app bundle readiness (AAB) if needed. 
- TargetSdk/Play policy alignment (targetSdk 34 current — check current Play requirements; document).

LATER=Release automation hardening, key rotation plan, supply chain (signed artifacts, checksums), Vitals baseline.

TESTS=Deterministic proof:
- Build: `cd android && ./gradlew :app:assembleDebug` and (if signing configured) `:app:assembleRelease`. 
- Verify release: `apksigner verify --print-certs app-release.apk` (certificate fingerprints). 
- Installed evidence (device required): `adb devices`, `adb shell pm list packages -f com.seven.superloop`, `adb shell dumpsys package com.seven.superloop | grep -E "(versionCode|versionName|signatures|installer)`. 
- Identity match: compare APK cert fingerprint vs installed package cert fingerprint. 
- Adversarial: ensure no debug logging, no test-only permissions, debuggable=false, correct network security. 
- Quality: `./gradlew :app:lintRelease` if configured. 

RISKS=Security: keystore leakage (must never commit). Privacy: installed evidence may include installer info — don’t share broadly. Compliance: Play App Signing vs self-signing; key loss. Android: targetSdk changes affect behavior. Cross-system: versioning consistency between web/Capacitor/Android. 

FIRST_SLICE=Document signing requirements and capture installed-identity proof template. Add non-secret release checklist to repo docs (e.g. `docs/RELEASE_ANDROID.md`) without modifying build to inject secrets; ensure release build behavior is explicit. This is small, reviewable, and creates deterministic evidence path.

KNOWN_UNKNOWNS=Whether CI has keystore configured. Play App Signing enrollment state. Actual installed evidence (no device connected in this environment) — must be obtained during VERIFY/EXECUTE with real device/emulator. TargetSdk 34 is fine now, but Play requirements evolve. 

DOMAIN_VERDICT=READY_FOR_PLAN (sufficient to specify evidence collection + non-secret docs; actual signing proof requires keystore/device which is external by design).


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

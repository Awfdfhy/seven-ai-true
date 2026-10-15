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

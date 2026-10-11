# D11_ANDROID_NATIVE — Android / APK / Lifecycle / IME / Back / Insets

Research audit: READY

DOMAIN_ID=D11_ANDROID_NATIVE
SOURCE_ANALYSIS=Harvested primary sources [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality, [SOURCE primary] https://developer.android.com/topic/architecture/recommendations, [SOURCE primary] https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge, [SOURCE primary] https://developer.android.com/design/ui/mobile/guides/patterns/predictive-back, [SOURCE primary] https://capacitorjs.com/docs/apis/app, [SOURCE primary] https://capacitorjs.com/docs/apis/keyboard. 
Collectively they converge on: (1) Android architecture recommendations favoring layered design, ViewModel, lifecycle-aware components, DI, and testable boundaries (matches Android app quality guidelines). (2) Edge-to-edge requires drawing under system bars, handling window insets and display cutouts; layout must consume insets and avoid content occlusion. (3) Predictive back is a system transition pattern that apps should opt into/handle per platform guidance. (4) Capacitor App and Keyboard plugins expose lifecycle events (appStateChange, pause/resume, backButton, deeplinks) and keyboard visibility/height events with proper cleanup. 
Disagreements: none observed. Freshness: Android docs and Capacitor docs are current (predictive back guidance is the current mobile guidance). Limitations: harvested content is guidance/spec; it does not show Seven's actual implementation (which requires repo inspection). No extra crawl performed because harvested set is sufficient to compare against code.
CURRENT=Repo inspection (evidence):
- Capacitor present: package.json contains @capacitor/android, @capacitor/core, @capacitor/app, @capacitor/keyboard, @capacitor/status-bar (dependencies). Capacitor config: capacitor.config.json exists (7e50.60.2.capacitor.config.json in repo root). Android platform is present (android/ directory).
- Android app: android/app/build.gradle exists. applicationId is com.seven.superloop (from build.gradle). Version info present (versionCode/versionName). 
- Native sources: android/app/src/main exists (MainActivity.java, AndroidManifest.xml). Also android/app/src/main/java/com/seven/superloop/MainActivity.java.
- Lifecycle/bridge usage: grep for Capacitor listeners shows App.addListener usage in src (App.addListener("appStateChange", ...), backButton, etc.) and Keyboard events used. StatusBar plugin present. 
- Edge-to-edge/insets/IME: no obvious EdgeToEdge API usage (androidx.activity.EdgeToEdge, enableEdgeToEdge) visible in quick grep of android/src/main; system UI/insets handling not evident from scanned snippets. Predictive back: no explicit predictive back opt-in/handling visible in scanned code. 
- Architecture: remake/ARCHITECTURE.md exists and is treated as truth (stated). No evidence of Android-specific architectural violations in scanned files. 
Conclusion: Capacitor bridge is wired (App/Keyboard/StatusBar). Native lifecycle events consumed in web layer. However, concrete Android native-side handling of edge-to-edge, window insets, IME avoidance, predictive back, and system bars is not clearly present in scanned native sources — this is a gap vs current Android guidance.
TARGET=Seven Android app should align with Android architecture recommendations and current mobile UX guidance while preserving Seven identity (per Product Intelligence). Specifically:
- Proper lifecycle ownership: bridge events (App, Keyboard) must be lifecycle-aware, cleaned up, and not leak across foreground/background. 
- Edge-to-edge: app should draw under system bars, respect window insets (especially for content that interacts with keyboard/gestures), handle display cutouts, and avoid hardcoded top/bottom paddings that fight system UI. 
- Predictive back: adopt platform guidance where appropriate (Android 14+ predictive back) without breaking web-driven flows; ensure back handling is consistent between native back button and web navigation.
- IME/keyboard: Keyboard plugin events used correctly; layout must react to keyboard height, avoid resize glitches, and preserve input focus. 
- APK/installed identity: build outputs consistent applicationId/versioning; debug/release distinct; no identity confusion (ties to D24). 
- Native quality: follow core app quality (stability, crashes, ANRs, navigation, permissions, RTL awareness where relevant).
All changes must respect remake/ARCHITECTURE.md ownership boundaries (do not create duplicate owners for bridge/native).
NOW=Smallest high-value slice to close release/blocking UX gaps:
1. Verify edge-to-edge readiness: inspect android/app/src/main/java/com/seven/superloop/MainActivity.java and associated layouts/themes. Check if EdgeToEdge is enabled (AndroidX). Confirm windowInsets handling. 
2. Audit App/Keyboard listener lifecycle: confirm addListener/removeListener or proper cleanup on pause/resume/destroy; ensure no duplicate listeners. 
3. Back handling audit: review backButton listener vs system back; assess predictive back compatibility (targetSdk/Android 14). 
4. Quick native smoke: confirm app builds (if tooling available) and basic lifecycle paths. Attach deterministic evidence (file paths + build output). 
This is investigation+fix slice (EXECUTE later) but NOW is evidence gathering + minimal concrete changes only if validated.
NEXT=Deeper improvements after first slice:
- System bars styling (light/dark) consistent with Seven UI; avoid content jumping on IME show/hide.
- Insets consumption in critical screens (bottom sheets, modals, forms) to prevent occlusion. 
- Lifecycle tests/guards: ensure bridge state doesn’t persist incorrectly across process death/restarts (per App plugin semantics). 
- Accessibility: keyboard focus traversal, reduced motion considerations if native dialogs used. 
- Performance: avoid unnecessary layout passes on keyboard events.
LATER=Longer-term ideas:
- Predictive back full adoption if/when web flows mapped to native transitions. 
- Proguard/R8 verification for native bridge classes. 
- LeakCanary or lifecycle tracing in debug builds (non-production change gated). 
- Device matrix evidence (API levels) against core app quality.
TESTS=Deterministic regression proof:
- Unit/integration where possible: bridge event serialization, listener cleanup (lifecycle tests). 
- Android instrumentation/E2E: edge-to-edge on devices/emulator (verify no occlusion with IME open), back navigation (predictive back path), appStateChange transitions (background/foreground), keyboard show/hide. 
- Adversarial: rapid foreground/background, rotation with keyboard open, split-screen/multi-window, display cutouts, process death. 
- Eval/product: compare against core app quality checklist items (navigation, stability). Evidence required: logs, screenshots (if UI), test reports, APK install evidence.
RISKS=Security: no credential exposure; signing remains separate (D24). Privacy: lifecycle events don’t leak sensitive data. Performance: keyboard/inset handling can cause jank if done incorrectly. Android: targetSdk compatibility (predictive back behavior varies), RTL not obvious concern now. Cross-system: web/native ownership boundary must not blur (preserve architecture). 
FIRST_SLICE=Audit+fix smallest: enable/verify edge-to-edge correctly in MainActivity (or justify why not needed), add listener cleanup guards, and document backButton behavior. Each change must be minimal, reviewed against ARCHITECTURE.md. Evidence: file paths, diff, build/test output.
KNOWN_UNKNOWNS=Missing evidence:
- Exact MainActivity.java content (need full file). 
- Themes/styles for system UI. 
- Whether targetSdk supports predictive back and how it’s configured. 
- Emulator/device runtime evidence for edge-to-edge/keyboard (not available in this environment). 
- Installed APK identity details beyond build.gradle (signing config present? see D24). 
DOMAIN_VERDICT=READY_FOR_PLAN (sufficient evidence from harvested sources + repo inspection to proceed to EXECUTE with concrete slices; device/emulator runtime validation remains required during VERIFY/EXPLORE).

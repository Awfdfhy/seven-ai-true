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

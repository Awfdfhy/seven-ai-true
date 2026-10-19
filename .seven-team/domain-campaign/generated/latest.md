# Seven Domain Roadmaps — cycle evidence

Ready domains: 2/30
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
SOURCE_ANALYSIS=The harvested sources collectively prescribe: (1) core app quality directly drives installs/reviews/retention [developer.android.com/docs/quality-guidelines/core-app-quality, SOURCE primary]; (2) layered architecture, lifecycle management, and testing strategies [developer.android.com/topic/architecture/recommendations, SOURCE primary]; (3) edge-to-edge apps must draw under system bars, handle insets, and support display cutouts [developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge, SOURCE primary]; (4) predictive back requires handling the system back gesture with animation and a system back event [developer.android.com/design/ui/mobile/guides/patterns/predictive-back, SOURCE primary]; (5) Capacitor App API emits foreground/background state and deep-link events [capacitorjs.com/docs/apis/app, SOURCE primary]; (6) Capacitor Keyboard API controls visibility and tracks show/hide events [capacitorjs.com/docs/apis/keyboard, SOURCE primary]. Limitations: the harvest is descriptive guidance only; none of it is bound to Seven's exact Capacitor 8.5.2 WebView runtime or the generated `android/` project. No disagreements among sources.
CURRENT=Seven generates its Android project via Capacitor (`npx cap add android`, `cap sync android`) then patches it through `apk/patch-android.cjs`, `apk/materialize-native-platform.cjs`, `apk/harden-native-platform.cjs`, and `apk/materialize-android-motion-bridge.cjs`. `package.json` pins `@capacitor/android` and `@capacitor/core` at 8.5.2; `capacitor.config.json` sets `appId=ai.seven.v243`, `webDir=www`, `webContentsDebuggingEnabled=false`, `allowMixedContent=false`. `patch-android.cjs` sets `windowSoftInputMode=adjustResize`, adds `density` to configChanges, sets `allowBackup=false` and `usesCleartextTraffic=false`. `materialize-native-platform.cjs` injects `SevenSecureStore` (Android Keystore AES-GCM) and `SevenPlatformPlugin` (SAF open/create/read/write/release, chunked IO, GitHub device flow, `getCapabilities` advertising secureStore/androidKeystore/saf/chunkedIO). `materialize-android-motion-bridge.cjs` mirrors Android animation scales to `SevenPerformance.state.reducedMotion`/`prefers-reduced-motion`. `materialize-android-assets.cjs` builds adaptive/themed launcher icons and splash. Critically: there is NO predictive-back handling, NO WindowInsets/edge-to-edge inset handling beyond `adjustResize`, NO Capacitor Keyboard plugin usage, NO Capacitor App lifecycle listener usage in the web runtime, and no `android/` directory exists yet (it is generated at build time). The capture/evidence scripts hardcode `appId=ai.seven.app` while `capacitor.config.json` declares `ai.seven.v243` — an appId mismatch between packaging and evidence tooling. `apk_tested: false` in PROJECT_MANIFEST.json; no APK has been built.
TARGET=An Android build that (a) honors predictive back gestures, (b) lays out edge-to-edge with correct insets so the chat composer isn't hidden by the keyboard/system bars, (c) uses Capacitor App lifecycle (foreground/background) and Keyboard show/hide events to drive the web UI, (d) keeps a single consistent appId across packaging and evidence scripts, and (e) produces an installable, instrumented APK with deterministic signing identity.
NOW=First high-value slice: align the appId contract (capacitor.config.json `ai.seven.v243` vs capture scripts hardcoding `ai.seven.app`) so packaging and installed-device evidence reference one identity; add predictive back + WindowInsets handling to `SevenPlatformPlugin`/`MainActivity` and expose them to the web via Capacitor; wire Capacitor App and Keyboard plugin events from the web runtime into Seven's UI state. This is the smallest slice that makes D11 testable end-to-end.
NEXT=Add keyboard-avoidance layout tests, edge-to-edge screenshot matrix across API levels (28 and 36), back-gesture instrumentation tests, and foreground/background persistence-recovery tests tied to D15.
LATER=Display cutout support, per-orientation insets, app-link deep handling, IME-style composer focus management, and Android Vitals/ANR monitoring.
TESTS=Deterministic: Node unit test asserting `SevenPlatformPlugin.getCapabilities` returns expected flags and that MainActivity registers `onBackPressedDispatcher`/insets callback. Android: instrumented test launching MainActivity, triggering system back via `KEYCODE_BACK`, asserting the WebView receives a back event; instrumented test toggling `window_animation_scale`/keyboard and asserting insets adjust. Adversarial: back pressed mid-generation must not double-send; keyboard show/hide must not clip the composer. Eval: APK installs and launches on API 28 and API 36 emulators.
RISKS=Security: WebView debugging disabled is correct; no cleartext traffic. Performance: synchronous `onBackPressed` blocking the UI thread. Android: `adjustResize` alone doesn't handle edge-to-edge system-bar insets; predictive back requires API 33+ `OnBackPressedDispatcher` or back-handler compat. Cross-system: appId mismatch between packaging (`ai.seven.v243`) and evidence scripts (`ai.seven.app`) would break installed-identity verification. RTL: back gesture direction is system-handled, no Seven-specific RTL risk.
FIRST_SLICE=Align appId across capacitor.config.json and all `apk/*` capture scripts to one identity; add predictive-back + WindowInsets handling to the native plugin/MainActivity; wire Capacitor App + Keyboard lifecycle events into the web runtime.
KNOWN_UNKNOWNS=Whether the generated Capacitor 8.5.2 `MainActivity`/`BridgeActivity` exposes `onBackPressedDispatcher` in a patchable shape; whether WebView `evaluateJavascript` round-trips back/insets events reliably on API 28; exact installed-device evidence (no APK built yet, `apk_tested: false`).
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: READY

DOMAIN_ID=D24_RELEASE_APK
SOURCE_ANALYSIS=The harvested sources collectively prescribe: (1) sign the app for release to Google Play, use Play App Signing, and manage upload keys via keystore/storepass/keyalias/keypass [developer.android.com/studio/publish/app-signing, SOURCE primary]; (2) core app quality guidelines directly influence installs, reviews, engagement, retention [developer.android.com/docs/quality-guidelines/core-app-quality, SOURCE primary]. Limitations: no source specifies Seven's exact signing flow; the repo's `patch-production-signing.cjs` supports CI-provided keystore properties (`sevenReleaseKeystore`/`sevenCiKeystore` etc.) but embeds no credentials — consistent with guidance.
CURRENT=Release packaging exists: `package.json` has `version=2.4.3` and `sevenAndroidVersionCode=243`; `capacitor.config.json` has `appId=ai.seven.v243`, `appName=Seven 2.4.3`. `apk/patch-android.cjs` anchors `versionCode`/`versionName` from package.json and adds a CI signing block (`sevenCiKeystore` etc.) bound to `testBuildType=release` when `sevenCiKeystore` is present; `apk/patch-production-signing.cjs` adds a `sevenRelease` signing config and makes `release` use it when `sevenReleaseKeystore` is present, falling back to `sevenCi`. `apk/verify-apk.cjs` is a deterministic APK gate: asserts versionCode/versionName match package.json, APK < 30MB, contains `assets/public/index.html`, pdfjs, remake.css/js, intelligence.js, research-v2.js, `classes*.dex`, release marker `SEVEN_FINAL_RELEASE_LAYER_V1`, modern UI root (`seven-app`, `data-seven-remake="1"`), no remote PDF runtime, no manual API-key/password fields, no legacy name capture, bundled UI hardening `--seven-ui-hardening-v242:1`, no embedded Brave key. `release/build-release.cjs` builds `dist/seven_ai-release.html` with the release mark, embedded-credentials script (env-provided only, never committed), lazy local PDF/attachments/workspace, theme boot, and a release manifest. `apk/prepare-web.cjs` copies the verified release into `www`. `android:` npm scripts chain build → sync → asset materialization → native patching. No `android/` directory exists; no APK has been built (`apk_tested: false`); release_status=`INCONCLUSIVE_ANDROID_PROVIDER_INTEGRATION`.
TARGET=A reproducible, signed release APK whose installed identity (package name, versionCode, versionName, certificate hash) matches package.json/capacitor.config.json, passes `verify-apk.cjs`, and is proven installed on a real emulator/device with exact build-identity evidence.
NOW=First high-value slice: produce a debug APK via the existing `android:generate` + `cap build android` chain, run `apk/verify-apk.cjs` against it, and capture exact installed-identity evidence (package name, versionCode/versionName, certificate SHA-256, installed path). This unblocks `apk_tested`.
NEXT=Wire CI signing properties (`sevenCiKeystore`/`sevenReleaseKeystore`) into a release build, generate a signed release APK, and run `apk/capture-android-release-profile.cjs` + `apk/capture-android-system-visuals.cjs` on an API 28 and API 36 emulator for installed-device evidence.
LATER=Play App Signing upload-key integration, reproducible builds with provenance, APK size budget enforcement, and signed-install verification on a physical device.
TESTS=Deterministic: `node apk/verify-apk.cjs` on the generated debug APK (asserts all markers). Node test asserting `package.json` version/sevenAndroidVersionCode match `capacitor.config.json` and `build.gradle` anchors. Android: `adb install -r` + `pm dump` asserting package=`ai.seven.v243`, versionCode=243, versionName=2.4.3; certificate fingerprint captured. Adversarial: tampered APK (changed assets) must fail verify-apk; wrong appId in capture scripts must fail installed-identity assertion.
RISKS=Security: no embedded credentials (correct — CI injects); `webContentsDebuggingEnabled=false` correct for release; `allowMixedContent=false` correct. Android: `testBuildType=release` when `sevenCiKeystore` present signs debug with release key — intentional for CI instrumentation parity. Cross-system: appId mismatch (`ai.seven.v243` vs `ai.seven.app` hardcoded in capture scripts) breaks installed-identity claims. Performance: APK < 30MB cap enforced by verify-apk.
FIRST_SLICE=Generate a debug APK through `android:generate`/`cap build android`, run `node apk/verify-apk.cjs`, and capture exact installed-identity evidence.
KNOWN_UNKNOWNs=Whether `npx cap add android`/`cap build android` succeeds in this environment without Android SDK; whether the generated `build.gradle` shape matches the regex replacements in `patch-android.cjs`; exact installed device/emulator evidence (none exists yet).
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

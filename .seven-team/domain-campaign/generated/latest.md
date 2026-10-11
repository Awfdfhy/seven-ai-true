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
SOURCE_ANALYSIS=Harvested primary sources [SOURCE primary] https://developer.android.com/studio/publish/app-signing, [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality, plus localized variants. 
Key points: app signing is critical for release (keystore, key rotation considerations), Play App Signing recommended for distribution but self-signing is still required for local builds/APK generation; signingConfigs must be configured securely. Core app quality emphasizes stability, correctness, and identity consistency. 
Disagreements: none. Freshness: current guidance. Limitations: harvested guidance is procedural; Seven’s actual signing config (keystore path, keyAlias, whether stored in repo/CI secrets) and installed APK evidence must come from repo/CI inspection.
CURRENT=Repo inspection (evidence):
- Build config: android/app/build.gradle present. applicationId com.seven.superloop. versionCode/versionName set. 
- Signing: signingConfigs block exists in android/app/build.gradle. Specific entries: debug signing config present (default Android debug keystore). release signingConfig referenced; need to inspect full block (storeFile, keyAlias, storePassword, keyPassword, whether v1/v2 signing enabled). 
- Build types: release buildType configured (minifyEnabled/proguard etc. as shown in build.gradle). 
- Outputs: android/app/release or build outputs? Not visible in scanned files; APKs not present in workspace scan (repo is source). 
- CI/Release docs: remake/MILESTONES.md and ARCHITECTURE.md mention release/packaging context? Need to check for signing docs, keystore references, or CI configs. 
- Installed identity: versioning is explicit. No obvious keystore files committed in android tree (typical). 
Conclusion: build is configured for release; signing config exists. However, concrete release keystore material, signing credentials handling, and installed APK evidence (hash, package info, signature) are not visible in repo — this is a critical release blocker to verify. Also need to confirm Play App Signing readiness.
TARGET=Secure, verifiable release packaging with clear installed identity:
- Signing: release signingConfig properly configured; credentials never committed to VCS. CI uses secure secret storage. 
- Identity: applicationId immutable per distribution; versionCode increments; versionName traceable. 
- Packaging: release APK/AAB builds reproducibly; build outputs have verifiable artifacts (checksums). 
- Evidence: installed-device evidence (package name, version, signature/hash) captured when validating release builds (emulator/device). 
- Compliance: aligns with core app quality (no debug symbols/leaks in release, correct signing). 
- Ownership: respects ARCHITECTURE.md; no duplicate signing/packaging owners.
NOW=First slice (investigation + minimal fixes):
1. Inspect full android/app/build.gradle signingConfigs and buildTypes (release). Extract storeFile (if relative), keyAlias, whether credentials read from env/gradle properties. 
2. Search for keystore files (*.jks, *.keystore) and signing secrets in repo (exclude build dirs). 
3. Check CI configs (if present: .github, ci, fastlane, etc.) for release signing. 
4. Verify applicationId/versionCode consistency across configs (capacitor config, AndroidManifest, build.gradle). 
5. Document release build command and required env vars (without exposing values). 
This produces concrete evidence before any production change.
NEXT=Improvements:
- Enforce secure credential loading (avoid hardcoded passwords; use -P, env vars, or CI secrets). Fail fast if missing. 
- Add release checks: ensure minify/R8 configured correctly; no debug logging in release; network/security config as needed. 
- Signing verification: document v1/v2/v3 signing, Play App Signing opt-in. 
- Versioning: establish versioning policy (auto-increment or explicit) and enforce. 
LATER=Longer-term:
- AAB support and Play publishing checklist. 
- Reproducible builds: verify checksums. 
- App integrity (key rotation plan). 
- Device validation: capture installed APK info (adb shell dumpsys package, signatures) as part of release verification.
TESTS=Deterministic proof:
- Build: `cd android && ./gradlew --version` and `./gradlew assembleRelease --dry-run` or full build if keys available (but never log secrets). 
- Verification: if release APK exists, validate signing (`jarsigner -verify`, `apksigner verify`), package identity, version. 
- Adversarial: signing config validation (missing keystore -> clear error), wrong keyAlias -> fail fast. 
- Device evidence: install on emulator/device and capture `adb shell dumpsys package com.seven.superloop` (versionCode, versionName, signatures, installer) — this is required for “installed identity” proof. 
- Quality: smoke test release build on device (lifecycle, back, keyboard) — ties to D11.
RISKS=Security: keystore compromise; never commit secrets. Privacy: none directly. Compliance: Play App Signing requirements. Performance: release build time. Android: signing scheme compatibility. Cross-system: Capacitor versioning must stay consistent. 
FIRST_SLICE=Read full signingConfigs + release buildType from android/app/build.gradle; scan repo for keystore files; document required env vars and build command. If any hardcoded secret found, flag as release blocker. Evidence: file contents (sanitized), grep results, build plan.
KNOWN_UNKNOWNS=Missing evidence:
- Full release signingConfig values (storeFile path, keyAlias) — sanitized only. 
- Presence/location of release keystore (not in repo scan). 
- CI release pipeline details. 
- Installed APK signature/hash from real device/emulator (environment may not have device attached). 
- Whether using Play App Signing (affects release key handling). 
DOMAIN_VERDICT=READY_FOR_PLAN (harvested sources + build.gradle presence show signing is configured; repo inspection needed to confirm secure handling and produce installed-device evidence during VERIFY/EXPLORE).


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

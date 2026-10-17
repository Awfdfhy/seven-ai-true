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
SOURCE_ANALYSIS=The harvested sources collectively converge on Android quality, architecture, and modern UI behaviors. Core app quality [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality emphasizes stability, performance, lifecycle correctness, and user-visible polish (installs/reviews/retention). Architecture recommendations [SOURCE primary] https://developer.android.com/topic/architecture/recommendations stress layered separation (UI/ViewModel/domain/data), lifecycle-aware components, DI, and testability. Platform UI guidance: edge-to-edge [SOURCE primary] https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge requires drawing under system bars, handling window insets, and respecting display cutouts. Predictive back [SOURCE primary] https://developer.android.com/design/ui/mobile/guides/patterns/predictive-back calls for animating/handling back in line with Android 13+ behavior. Capacitor coverage [SOURCE primary] https://capacitorjs.com/docs/apis/app and [SOURCE primary] https://capacitorjs.com/docs/apis/keyboard clarify how JS app state/lifecycle and keyboard visibility are surfaced via native bridge (foreground/background, deeplinks, keyboard events) — important to map to Android Activity lifecycle. Internationalized variants (ar/bn) exist for core quality and architecture but add no substantive technical divergence. No obvious source disagreement; freshness is high (Android guidance current). Limitations: harvested set is mostly high-level guidelines/spec pages (no in-depth code samples for predictive back migration patterns in a Capacitor app, no concrete edge-to-edge inset mapping for WebView/Capacitor, and minimal bridge implementation details). Those are practical gaps to validate against actual Android project.
CURRENT=Repository inspection (cwd: /home/runner/work/_temp/seven-superloop-worktrees/c218-research-A02): remake/ARCHITECTURE.md (exists, high-level Seven architecture; treats architecture doc as truth). remake/MILESTONES.md present. Android project present at `android/`. Key files inspected: `android/app/build.gradle` (applicationId `io.ionic.starter` default, compileSdk 33, targetSdk 33, minSdk 22, versionCode 1, versionName "1.0", dependencies include `com.capacitorjs:core:5.0.5`, `com.capacitorjs:plugins:5.0.5`, AndroidX, etc.), `android/app/src/main/AndroidManifest.xml` (Activity is `MainActivity` extending `BridgeActivity`, standard LAUNCHER, no custom config visible for edge-to-edge, predictive back, window insets, or keyboard/IME handling). `capacitor.config.*` not found at repo root (searched); package.json exists. No clear custom Capacitor plugin ownership or bridge extensions visible in inspected Android sources. Overall: standard Capacitor 5 Android scaffold; no explicit Seven-native bridge implementation, no evidence of edge-to-edge enabled, no predictive back handling, no custom IME/insets strategy documented in repo. Ownership/bridge patterns not surfaced in inspected files (needs deeper scan).
TARGET=Desired: Android native behavior aligned with Android quality/architecture and Seven’s identity. Specifically: edge-to-edge layout with proper window insets consumed by WebView/Capacitor UI (avoiding content under status/nav bars, handling cutouts), predictive back support consistent with Android 13+ where applicable, correct lifecycle mapping between Capacitor App events and Android Activity/Fragment lifecycle (no leaks, correct foreground/background/deeplink handling), robust IME/keyboard behavior (avoid layout jumps, correct viewport/insets), and adherence to architecture recommendations (clear separation, testable, lifecycle-aware). All must be evidenced via Android build/runtime/device/emulator artifacts (not just config) per product intelligence requirements.
NOW=Smallest high-value slice: establish concrete Android baseline evidence. Inspect full AndroidManifest.xml, `android/app/src/main/java/.../MainActivity.java`, `android/app/src/main/res/values/styles.xml`, and any Capacitor plugin code under `android/app/src/main/java` or `android/capacitor-cordova-android-plugins/`. Document current edge-to-edge state (targetSdk 33, window flags), predictive back (AndroidX/manifest), keyboard/IME config, and lifecycle implementation. Also capture Capacitor version (5.0.5) implications for modern Android behaviors (edge-to-edge became more prominent in API 35 guidance but target 33 still needs careful handling). Evidence first.
NEXT=Define and document Seven’s Android native contract (bridge ownership, lifecycle invariants, insets handling strategy, keyboard policy) consistent with remake/ARCHITECTURE.md. Introduce minimal, evidenced changes: enable/handle edge-to-edge safely for targetSdk, add inset handling for WebView, configure IME adjustments, evaluate predictive back feasibility (API levels), and map Capacitor App/Keyboard events to lifecycle tests. Avoid guessing cross-subsystem ownership (must not create duplicate bridge owners).
LATER=Broader Android quality alignment (startup, crashes, ANRs, accessibility, RTL, cutouts, large screens), consider migrating Capacitor/Android dependencies if needed for modern edge-to-edge/predictive back, and add installed-device evidence (APK identity/metrics) per D24. Long-term: automated checks for insets/keyboard regressions.
TESTS=Deterministic: unit tests around bridge adapters (lifecycle state), contract tests for insets/keyboard mapping. E2E: UI flows that trigger keyboard, system bars, back navigation. Android: instrumentation tests (Activity lifecycle, edge-to-edge visibility, predictive back gestures where supported), Robolectric where appropriate. Adversarial: rapid IME show/hide, split-screen/multi-window, cutouts, gesture nav vs 3-button, rotation. Eval: user-visible stability checks (no layout jumps). All must run against real build artifacts when possible.
RISKS=Security/privacy: exposing lifecycle events via bridge must respect policy; no credential leakage. Performance: edge-to-edge/inset listeners can cause jank if mishandled; WebView viewport changes. Android: targetSdk 33 constraints, API level fragmentation (minSdk 22), gesture navigation edge cases, predictive back requires Android 13+ and proper back dispatch. RTL: insets must respect layout direction. Cross-system: bridge ownership confusion between web/native (avoid duplicate owners for bridge/kernel). Also Capacitor 5 is older relative to latest edge-to-edge guidance.
FIRST_SLICE=Repo scan + Android contract draft: list all Android/native files, extract Capacitor/bridge ownership, record current edge-to-edge/insets/IME/predictive back state, and produce a minimal evidence checklist (files inspected, build config captured). This is non-production, evidence-only, directly enables next slices.
KNOWN_UNKNOWNS=Exact Seven bridge/plugin ownership model (no evidence in inspected files), whether Seven has custom native plugins, edge-to-edge/insets strategy, predictive back adoption, keyboard/IME policy details, and how lifecycle invariants map to Seven constitution. Also need installed-device proof path (tied to D24). Capacitor 5 behavior under modern Android needs validation.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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
SOURCE_ANALYSIS=Harvested sources center on signing and quality. App signing [SOURCE primary] https://developer.android.com/studio/publish/app-signing explains key concepts (upload vs app signing, Play App Signing, signing configs, keystores, security). Core quality [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality links release quality to installs/reviews/retention. Internationalized pages (ar/bn) mirror content. Limitations: sources are high-level (no detailed Seven-specific signing workflow, no APK identity/evidence capture strategy for installed devices, no CI signing policy, no verification of installed package/signature). Missing practical: how to capture installed-device evidence (package name, versionCode/versionName, signature/hash, APK path, installer, targetSdk, minSdk, ABI splits, permissions) as required by “installed identity, emulator/device evidence”.
CURRENT=Inspection of `android/app/build.gradle`: default `io.ionic.starter` applicationId, versionCode 1, versionName "1.0", `signingConfigs` not visible in head (uses default debug/release conventions), build types present. `android/app/src/main/AndroidManifest.xml` uses default package via build. No signing keys, keystore paths, or release signing config present in inspected repo files. No evidence of Play App Signing adoption, CI signing setup, or artifact outputs policy. Installed-device evidence tooling not visible. Architecture/milestones don’t show release process details in inspected portions. Overall: scaffold only, no Seven release/identity policy evidenced.
TARGET=Define APK identity and release signing policy aligned with Android guidance and Seven architecture. Must ensure deterministic, verifiable release artifacts with clear identity (applicationId, versionCode/versionName, build type, flavor if any), secure signing (documented policy, no secrets in repo), and installed-device evidence capture (proof of what’s actually installed: package info, signature fingerprints, installer, APK metadata, and runtime identity). Evidence must be concrete (files, commands, build outputs) — never mock.
NOW=Baseline evidence: extract complete signing config from `android/app/build.gradle` (all signingConfigs, buildTypes), check for keystores, `gradle.properties`, CI configs, and any release scripts. Identify applicationId uniqueness/ownership, versioning strategy. Create evidence checklist for installed APK identity (what can be captured via `adb shell pm dump`, `adb shell dumpsys package`, `aapt`, `apksigner`, `keytool`, or build metadata). Non-production.
NEXT=Establish Seven release policy (signing method, keystore management, Play App Signing stance, versioning rules) and define installed-evidence procedure (commands + expected fields). Document in appropriate location without violating constitution (policy docs under repo as needed, but not modifying judge/baselines). Require evidence level for releases.
LATER=Automate identity verification in CI (artifact signing verification, installed signature checks), add release blockers checks, and align with D11 for device/emulator validation. Consider splits/ABI, targetSdk policy.
TESTS=Deterministic: validate build config parsing, versioning consistency. E2E: signed debug/release build produces expected identity. Android/device: `apksigner verify`, signature fingerprint match, package info matches expected. Adversarial: tamper detection, wrong signing, versionCode downgrade checks. Eval: installed evidence completeness.
RISKS=Security: keystore/secrets exposure (must never be present; policy only). Privacy: installed evidence collection must not leak PII. Compliance: Play App Signing implications. Cross-system: avoid conflicting owners with build/release. Performance negligible.
FIRST_SLICE=Complete audit of Android release/signing files and produce an evidence table (applicationId, versionCode/versionName, signingConfig present?, keystore refs, build variants). Define minimal installed-evidence command set (adb-based) for future device validation.
KNOWN_UNKNOWNS=Signing strategy (self-signed vs Play App Signing), keystore location/rotation policy, CI integration, versioning scheme, and exact fields required for “installed identity” proof per Seven. No release process docs found in inspected files.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT


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

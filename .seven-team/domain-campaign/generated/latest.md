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
SOURCE_ANALYSIS=Harvested Android docs collectively define core app quality expectations (stability, UX, navigation, accessibility), Android architecture recommendations (layered design, ViewModel, lifecycle-aware components, DI, testing), edge-to-edge (draw under system bars, handle insets, display cutouts), predictive back (Android 14+ with fallback), and Capacitor App/Keyboard APIs (app lifecycle events, deeplinks, keyboard visibility/insets). Key points: edge-to-edge requires handling window insets (not just transparent bars), predictive back requires API-level gating and migration of custom back handling, IME state affects layout and composition; Capacitor Keyboard emits show/hide and provides info but app must react to insets. Limitations: harvested list is doc-focused (quality guidelines, architecture, design, Capacitor API) — lacks concrete repo-level native bridge implementation details beyond Capacitor API surface; localized pages exist but do not add technical substance. Freshness: Android guidance is current (edge-to-edge, predictive back) and Capacitor App/Keyboard docs are current. No obvious contradictions.
CURRENT=Repo evidence (inspected):
- Capacitor is adapter-only (remake/ARCHITECTURE.md §6). Typed bridge envelope defined: BridgeRequest<T>, BridgeResult<T> with ok/error (remake/ARCHITECTURE.md §6). Contract tests must run JS mock bridge + Android instrumented round-trip.
- Android project present: android/app/src/main/AndroidManifest.xml exists (basic Capacitor app config). android/app/build.gradle exists (Capacitor plugin deps referenced; see below).
- Capacitor config present (capacitor.config.*) — configures appId/appName (standard Capacitor setup). 
- Bridge types/envelope referenced in architecture; no new production edits performed. Existing codebase shows Capacitor plugins integrated (App, Keyboard) per typical setup; exact plugin registration/native handlers not exhaustively enumerated in this pass but architecture mandates typed envelopes and lifecycle-managed services (SAF, GitHub, file access). 
- Architecture also emphasizes: IME composition lock, send eligibility, auto-grow measurement request; Enter-to-send disabled during composition (remake/ARCHITECTURE.md §2). Cancellation uses bridge cancellation token mapped to taskId (remake/ARCHITECTURE.md §4). These are constraints the native layer must respect.
TARGET=Desired behavior aligned with sources:
- Edge-to-edge compliant: app draws under system bars, handles insets (status/nav/IME), respects display cutouts, and avoids overlap. Proper window insets handling on Android (e.g. WindowInsetsController, fitsSystemWindows/insets padding) coordinated with Capacitor/keyboard events.
- Predictive back: adopt Android 14+ predictive back where appropriate; provide fallback for older API levels; do not break custom back handling. 
- IME/lifecycle correctness: keyboard show/hide drives layout (insets), composition state honored (IME composition lock), lifecycle events (App plugin) drive state safely; bridge operations honor cancellation tokens.
- Native bridge remains adapter-only with typed envelopes; Android instrumented round-trips validate envelope compatibility.
NOW=First high-value slice (smallest material improvement):
1. Verify edge-to-edge readiness: inspect android/app/src/main/java/... and themes/styles for edge-to-edge flags (enableEdgeToEdge), window insets handling. 
2. Verify predictive back readiness: check AndroidManifest/Activity config and onBackPressed/predictive back APIs; confirm API level gating. 
3. Confirm Capacitor Keyboard/App plugin wiring and how insets/keyboard events propagate to UI (to avoid IME overlap). 
4. Validate bridge envelope usage exists end-to-end (types + requestId propagation + ok/error) against contract test surface.
NEXT=Next improvements:
- Add explicit insets handling (consume/dispatch system bars/IME insets) and test on API levels covering older devices. 
- Implement predictive back migration plan if any custom back exists; add tests/guards. 
- Strengthen lifecycle ownership: ensure SAF URI grants, file access, GitHub native ops are lifecycle-managed (per arch) and cancel on pause/destroy with taskId. 
- Add Android instrumented tests covering keyboard show/hide + IME composition + back behavior.
LATER=Longer-term ideas:
- Adopt Core App Quality checklist items relevant to stability/navigation/permissions. 
- Add device identity collection (see D24) tied to installed evidence. 
- Consider gesture navigation edge cases, display cutouts, multi-window, RTL.
TESTS=Deterministic/Android/eval proof ideas:
- JS mock bridge tests: envelope shape, requestId, ok/error paths, cancellation propagation.
- Android instrumented round-trip: BridgeRequest→native→BridgeResult with fixtures.
- UI tests: edge-to-edge insets on different screen sizes/cutouts; keyboard open/close/IME composition; predictive back flows with API gating. 
- Adversarial: rapid show/hide keyboard, lifecycle churn (pause/resume), cancellation mid-bridge call, invalid envelope.
RISKS=Security/privacy/performance/Android/RTL/cross-system:
- Misconfigured edge-to-edge can cause content under display cutouts or overlap with system bars. 
- Predictive back incorrect gating (API<34) can break navigation. 
- IME/keyboard events can cause layout thrash; need careful insets handling. 
- Bridge surface must remain typed; avoid leaking tokens/PII in envelopes. 
- Cross-system: Capacitor adapter-only must be preserved (no UI logic leaking to native except via envelope). RTL/multi-window need validation.
FIRST_SLICE=Inspect Android native code (Activity/MainActivity, themes, plugins) for edge-to-edge, predictive back, Keyboard/App integration and bridge envelope usage; document concrete findings with file paths. This is RESEARCH-only (no edits). Smallest slice that materially informs release readiness.
KNOWN_UNKNOWNS=Missing concrete evidence in this scan: specific MainActivity implementation, plugin classes, how BridgeRequest/BridgeResult types are serialized on Android side, exact insets handling code, predictive back registration, signing config (see D24), and installed-device runtime evidence (emulator/device runs). Also need to confirm contract test locations for JS mock + Android instrumented round-trips.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (insufficient concrete implementation details in inspected files to fully assess edge-to-edge/predictive back/bridge envelope implementation; need deeper read of android/app/src/main/java and res/values/themes)


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
SOURCE_ANALYSIS=Harvested sources cover Android app signing fundamentals (signing key, upload key vs. app signing key, Play App Signing, release signing workflow in Android Studio) and Core App Quality guidelines (influence installs/reviews/engagement/retention). Key points: Play App Signing is recommended for release to Play (separates upload key from signing key, enables key rotation/secure recovery). Release builds must be signed with the correct key; debug vs release signing differ. Quality guidelines imply release readiness checks (stability, crashes, ANRs, permissions, etc.) affect distribution success. Limitations: docs describe process/concepts but not repo-specific signing config (keystore paths, signingConfigs in build.gradle, properties, CI). Localized pages add no new technical content. Freshness: current Android Studio signing guidance.
CURRENT=Repo evidence (inspected):
- android/app/build.gradle exists. Typical Capacitor Android app module; needs inspection of signingConfigs, buildTypes (debug/release), versionCode/versionName, applicationId. 
- AndroidManifest.xml present. 
- capacitor.config.* defines appId/appName (identity surface). 
- No production edits performed. Architecture/other docs don’t expose signing credentials (correctly). 
- No visible keystore files in repo root scan (not expected to be committed). Need to confirm if signingConfigs are defined, and whether Play App Signing is targeted. 
TARGET=Desired behavior:
- Clear release signing strategy documented by evidence: if Play App Signing, confirm upload key handling; else confirm release keystore management. 
- APK identity is consistent: applicationId matches intended distribution, versioning coherent. 
- Release build configuration is reproducible and secure (no secrets in VCS). 
- Installed evidence path exists: ability to collect installed package info, versionCode/name, signature/hash, installer (Play vs sideload), targetSdk/minSdk, ABI, device info when running on emulator/device (supports “installed-device evidence” requirement).
NOW=First high-value slice:
1. Inspect android/app/build.gradle for signingConfigs { release/debug }, buildTypes.release.signingConfig, whether it reads from properties/keystore file/env vars. 
2. Check for gradle.properties, keystore files, .gitignore coverage (ensure no secrets). 
3. Confirm applicationId, versionCode/versionName consistency with capacitor.config.* and distribution intent. 
4. Identify installed evidence collection points (Android packageManager, Build, signature info) that could be exposed via bridge or collected in instrumented tests.
NEXT=Next improvements:
- If no release signingConfig, define safe pattern (read from env/props, fail fast with clear error) without committing secrets. 
- Document Play App Signing readiness (upload key strategy). 
- Add release checklist tied to Core App Quality (crash/ANR, permissions, targetSdk compliance). 
- Strengthen APK identity reporting (hashes, signing cert info) for installed-device verification.
LATER=Longer-term ideas:
- CI release signing integration (secure secret injection). 
- Automated checks: validate targetSdk/minSdk alignment, versioning monotonicity, appId consistency. 
- Device attestation hooks if needed, but privacy-preserving.
TESTS=Deterministic/Android proof:
- Build config validation (unit/testable): ensure release signingConfig resolves correctly when provided; error handling when missing. 
- Instrumented tests: read installed package info (versionCode/name, applicationId, installer, signatures) to produce installed-device evidence. 
- Adversarial: confirm debug artifacts not leaking into release; keystore paths not hardcoded to repo. 
- E2E: release build dry-run if environment allows (without publishing).
RISKS=Security/privacy/performance/Android:
- Signing keys/secrets leakage (must never commit). 
- Incorrect signingConfig on release can break updates (key mismatch). 
- Play App Signing misconfiguration (upload vs app signing key confusion). 
- Installed evidence must avoid exposing PII beyond necessary package/device metadata. 
- targetSdk compliance affects Play policies.
FIRST_SLICE=Inspect android/app/build.gradle signing configuration, buildTypes, applicationId/versioning, and look for keystore usage patterns; also inspect .gitignore for keystore patterns. Produce concrete evidence (file paths, extracted config) without exposing secrets.
KNOWN_UNKNOWNS=Missing: actual signingConfigs block content, whether release is signed in CI vs local, keystore locations if any (not expected), and runtime installed-device evidence from a real device/emulator run. Also need to confirm versionCode/versionName source of truth.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to inspect android/app/build.gradle contents for signingConfigs/buildTypes and any keystore references; no signing config details visible from current scan)


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

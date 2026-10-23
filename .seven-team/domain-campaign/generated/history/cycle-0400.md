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
SOURCE_ANALYSIS=Harvested 12 primary sources, all primary. Collectively they establish Android Core App Quality as the long-term install/review/engagement/retention baseline, Android architecture recommendations as layered/lifecycle/testable guidance, edge-to-edge inset/cutout handling as required layout behavior, predictive back as expected back-navigation behavior, and Capacitor App/Keyboard APIs as the native bridge surfaces for foreground/background, deep links, and keyboard visibility. Freshness is strong for official Android and Capacitor docs. Limitation: the harvested notes are title/summary level, not extracted implementation details, and no installed-device evidence exists in this checkout.
CURRENT=Seven is a Capacitor 8.5.2 Android shell with appId ai.seven.v243, webDir www, HTTPS Android scheme, cleartext false, mixed content false, and webContentsDebuggingEnabled false. The repo contains an extensive APK materialization pipeline under apk/ and release/, including asset preparation, native hardening, motion bridge, visual tests, and verify-apk.cjs. verify-apk.cjs proves static APK contents (index root, bundled workspaces, no manual API key fields, no remote PDF runtime) but does not prove lifecycle, IME, back gesture, insets, runtime persistence, or installed-device behavior. No android/ directory is present in this checkout, so generated build.gradle and installed artifact evidence are unavailable.
TARGET=Android-native behavior should be governed by Capacitor App and Keyboard APIs plus deterministic native guards: correct foreground/background persistence, deep-link handling, keyboard inset handling, predictive-back-compatible navigation, edge-to-edge inset consumption, and release identity matching package.json. Native changes should remain a single owner (apk/ + Capacitor config), with runtime behavior observable in exact installed builds.
NOW=Create a static and testable Android contract checklist tied to Capacitor APIs and release build identity; audit apk/materialize-native-platform.cjs and apk/harden-native-platform.cjs for lifecycle/keyboard/back/inset handling; add deterministic tests that assert the materialized native files and config contain required hooks. Keep verify-apk.cjs as an artifact gate, not a behavior proof.
NEXT=Generate a debug/release APK, run Capacitor/Android tests if tooling is available, and capture installed-device evidence for keyboard show/hide, back navigation, rotation, offline restart, and inset rendering. Add release signing evidence to D24.
LATER=Consider migration toward native Android architecture recommendations only if Capacitor bridge limits block required behavior; avoid duplicate native runtime owners.
TESTS=Deterministic: static assertions for Capacitor App/Keyboard usage, config flags, versionCode/versionName, APK contents. E2E/Android: installed APK launch, background/foreground persistence, keyboard insets, predictive back, edge-to-edge screenshot comparison, restart persistence. Adversarial: invalid deep link, back during streaming, keyboard hide during modal, rotation during network request.
RISKS=WebView state loss on background/low-memory, IME overlap, back gesture escaping app, unsafe cleartext/mixed content regression, debug-enabled production builds, version mismatch, APK size, no device evidence. Cross-system risk: persistence and chat state ownership overlap with A06/B06.
FIRST_SLICE=Static audit of native materialization scripts plus deterministic contract tests for lifecycle/keyboard/back/inset markers; no production edits in this research stage.
KNOWN_UNKNOWNS=No generated android/ directory, no APK in this checkout, no installed-device/emulator evidence, no runtime logs, no exact-build visual evidence.
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
SOURCE_ANALYSIS=Harvested 10 primary sources, all primary. Sources establish app signing and security concepts, Play App Signing/opt-in, and Core App Quality as install/review/engagement/retention baseline. Freshness is strong. Limitation: harvested notes are summary-level and do not include concrete signing implementation commands; the app is not necessarily Play-distributed, so release identity and exact installed artifact evidence remain the primary local proof.
CURRENT=Release identity is centralized in package.json: version 2.4.3 and sevenAndroidVersionCode 243. Capacitor config uses appId ai.seven.v243 and appName Seven 2.4.3. verify-apk.cjs enforces versionCode/versionName, APK size under 30MB, required bundled assets, release marker, modern UI root, no manual key fields, no password inputs, no legacy name modal, no remote PDF runtime, and no manual Brave key control. The repo has signing/materialization scripts, including apk/patch-production-signing.cjs and apk/remake-build-release-manifest.mjs, but no actual APK or installed artifact is present in this checkout.
TARGET=Release readiness should be proven by exact artifact identity plus installed-device behavior: signed or explicitly unsigned-debug artifact identity, versionCode/versionName, asset manifest, no credential inputs, no remote runtime dependencies, and installed launch/smoke evidence. Evidence must be bound to source/artifact identity.
NOW=Audit release scripts for signing identity, manifest generation, and APK verification coverage; document which checks are static artifact checks versus runtime/device checks. Preserve verify-apk.cjs as the artifact gate and do not relax assertions.
NEXT=Run npm run build:web and android:generate in a capable environment, produce an APK, run android:verify, then collect installed-device launch and persistence evidence. Record artifact hash, version, and signing state.
LATER=Add CI/release pipeline evidence and reproducible build metadata; consider Play App Signing only if Play distribution is chosen.
TESTS=Deterministic: package/version consistency, APK content assertions, manifest/asset checks, no secrets in bundle. E2E/Android: install, launch, version display, offline restart, update path, uninstall/reinstall persistence policy. Adversarial: tampered APK rejection, version downgrade, missing asset, oversized APK, credential field regression.
RISKS=No installed artifact evidence, no signing proof in this checkout, debug/release confusion, identity drift between package.json and generated Gradle, accidental credential bundle inclusion, oversized APK, release claims based only on static checks.
FIRST_SLICE=Static release identity audit and deterministic verification inventory; no production edits in this research stage.
KNOWN_UNKNOWNS=No APK present, no signing keystore state, no installed-device evidence, no exact-build visual/runtime evidence, no CI artifact metadata.
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

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
SOURCE_ANALYSIS=Harvested D11 evidence is primary-only and 12/12 ready: Android core app quality, architecture recommendations, edge-to-edge insets, predictive back, Capacitor App and Keyboard APIs, plus localized copies. Collectively they require lifecycle-safe UI, inset-aware edge-to-edge layout, predictable back navigation, and Capacitor state/keyboard event handling. Limitations: harvested notes are title-level summaries, not full page text; no emulator/device runtime evidence is present in this worktree. [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality; [SOURCE primary] https://developer.android.com/topic/architecture/recommendations; [SOURCE primary] https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge; [SOURCE primary] https://developer.android.com/design/ui/mobile/guides/patterns/predictive-back; [SOURCE primary] https://capacitorjs.com/docs/apis/app; [SOURCE primary] https://capacitorjs.com/docs/apis/keyboard.
CURRENT=Seven's remake owns Android integration in `remake/src/platform/android/*` with typed contracts for bridge requests/responses, capabilities, and SAF grants; `capacitor-native-transport.ts` exists and is covered by `remake/src/integration/phase7/capacitor-native-transport.test.ts`. Capacitor config uses `ai.seven.v243`, `https` scheme, no cleartext/mixed content, debugging disabled. APK verification script `apk/verify-apk.cjs` checks legacy package payload and markers, not remake installed identity. `remake/FINAL_RELEASE_STATUS.md` claims installed Android 14/16 bridge round-trips, but this worktree has no APK or emulator evidence; `git status` shows only untracked `remake/node_modules`, and branch is `autoloop/seven-24h-work-v6`, not `seven-remake-v3`.
TARGET=Android native layer should expose lifecycle/keyboard/insets/back behavior through one Capacitor bridge owner, with edge-to-edge safe-area handling, predictive-back-compatible navigation, IME-aware composer, and deterministic fallback when native unavailable. All claims require installed APK/emulator or device evidence bound to package/version/SHA.
NOW=Inventory exact-build gaps: locate all native bridge call sites, verify mock vs Capacitor transport selection, document lifecycle/keyboard/inset/back assumptions, and define minimal Android native tests for foreground/background, keyboard show/hide, insets, and back handling.
NEXT=Add deterministic native transport tests for lifecycle events, keyboard visibility, safe-area insets, and back behavior; align APK verification with remake installed payload; capture emulator evidence.
LATER=Predictive back animations, edge-to-edge display-cutout handling, IME insets for chat composer, physical-device matrix and accessibility/RTL Android checks.
TESTS=Unit tests for bridge contracts and transport; integration tests for lifecycle/keyboard/insets; APK payload identity; emulator/device smoke for installed bridge round-trip; regression tests for no native bridge deadlock.
RISKS=WebView lifecycle races, keyboard inset regressions, back navigation destroying chat state, insecure mixed content if config drifts, false release claims from docs without runtime evidence, APK identity mismatch between legacy and remake packages.
FIRST_SLICE=Add a small native capability/inset audit and test plan without changing production code; bind future evidence to package id, version code, and payload SHA.
KNOWN_UNKNOWNS=No APK binary, no emulator/device execution, no exact installed payload SHA, no visual screenshot matrix, no physical-device evidence in this worktree.
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
SOURCE_ANALYSIS=Harvested D24 evidence is primary-only and 10/10 ready: app signing, core app quality, plus localized copies. It emphasizes release signing security, quality guidelines, and install/review/retention impact. Limitations: harvested notes are title-level summaries; no actual signing keys, APK, or Play/App Signing state are present in this worktree. [SOURCE primary] https://developer.android.com/studio/publish/app-signing; [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality.
CURRENT=Release artifacts and scripts exist: `apk/verify-apk.cjs`, `apk/patch-production-signing.cjs`, `apk/remake-build-release-manifest.mjs`, `apk/remake-materialize-android.cjs`, and `release/build-release.cjs`. `verify-apk.cjs` validates a legacy `www` payload APK and markers such as `SEVEN_FINAL_RELEASE_LAYER_V1`, not the remake package `ai.seven.remake.v3`. `remake/FINAL_RELEASE_STATUS.md` claims a dedicated remake APK and installed Android 14/16 gates, but this repository state has no APK binary and no runtime evidence. `capacitor.config.json` at root uses `ai.seven.v243`, while remake docs claim `ai.seven.remake.v3`.
TARGET=One authoritative release identity and APK gate: exact package id/version code, signing mode, payload SHA manifest, APK-embedded identity verification, and installed WebView/native bridge smoke. No release claim without executable gate output.
NOW=Compare root and remake Capacitor configs, package metadata, version codes, APK scripts, and release manifests; identify which package is authoritative and where identity checks are stale.
NEXT=Update release verification to target the remake APK identity and payload manifest; record unsigned/debug vs release signing state; run build and installed smoke in CI.
LATER=Play App Signing alignment, release signing secret handling, staged rollout evidence, store listing quality, update/rollback verification.
TESTS=APK exists and size check; unzip payload markers; SHA-256 manifest equality; package/version extraction; installed smoke on Android 14 and 16; native bridge round-trip; legacy regression gate.
RISKS=Dual package identities (`ai.seven.v243` vs `ai.seven.remake.v3`), stale verifier targeting legacy payload, signing key exposure, release claim without installed evidence, branch mismatch, missing APK artifact.
FIRST_SLICE=Produce an identity reconciliation checklist and align verification scripts to one authoritative remake package before any release promotion.
KNOWN_UNKNOWNS=No APK binary, no signing certificate evidence, no Play/App Signing state, no emulator/device run, no current installed payload SHA in this worktree.
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

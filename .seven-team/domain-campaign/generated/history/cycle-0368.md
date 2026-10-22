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
SOURCE_ANALYSIS=Harvested 12 primary Android/Capacitor sources (core app quality, architecture, edge-to-edge, predictive back, App and Keyboard APIs, localized variants). They collectively say: (1) core app quality requires lifecycle-correct, inset-aware, accessibility-aware, and permission-correct behavior; (2) edge-to-edge requires drawing under system bars and handling insets/cutouts; (3) predictive back requires gesture/back handling that does not trap the user; (4) Capacitor App/Keyboard plugins are the bridge for foreground/background and IME events. Limitations: harvested notes are titles/summaries, not full page text; no Seven-specific installed evidence is in the harvested set; localized variants are duplicates. Freshness: all sources are current Android Developers / Capacitor docs.
CURRENT=Seven Remake V3 ships a dedicated Capacitor package `ai.seven.remake.v3` (remake/capacitor.config.json) with `androidScheme=https`, cleartext=false, mixed content disabled, webContentsDebuggingEnabled=false. Native bridge is `remake/src/platform/android/capacitor-native-transport.ts` with phase7 tests. Legacy root package is separate (`ai.seven.v243`). Release status claims installed Android 14 (API 34) and Android 16 (API 36) gate PASS including payload SHA-256 identity and native bridge round-trip. Evidence is recorded in remake/MILESTONES.md and remake/FINAL_RELEASE_STATUS.md. What is not evidenced in-repo: actual edge-to-edge/inset handling, predictive-back behavior, IME/keyboard show-hide handling, RTL layout under insets, and lifecycle persistence behavior in the WebView app. The repo contains many apk/ scripts for visual capture and native patching, but no test asserts inset/IME/back behavior.
TARGET=Edge-to-edge, inset-safe, IME-aware, predictive-back-safe WebView app with deterministic lifecycle handling (foreground/background resume, keyboard show/hide, back navigation), no trapped gestures, and preserved web payload identity. Android exact-build evidence must cover these behaviors on installed artifacts, not just browser tests.
NOW=Create an evidence map listing which of the six harvested requirements (core quality, architecture, edge-to-edge, predictive back, App lifecycle, Keyboard IME) are actually implemented in Seven and which are UNPROVEN. Add tests for App/Keyboard event handling and inset CSS variables in the web layer.
NEXT=Implement edge-to-edge viewport handling and safe-area insets in remake CSS; wire Capacitor App/Keyboard events into runtime (pause/resume, keyboard height); add predictive-back handling; add installed-device evidence for each.
LATER=Per-device IME variants, foldable/tablet inset handling, accessibility audit on installed build, Play Core quality checklist automation.
TESTS=Unit tests for App/Keyboard event wiring; CSS/inset regression snapshots; installed instrumentation verifying lifecycle/IME/back on API 34 and 36; payload identity unchanged.
RISKS=Edge-to-edge without inset handling causes clipped UI; predictive back can trap users; IME resize can break chat input; lifecycle resume can lose draft state; no in-repo proof of any of these today.
FIRST_SLICE=Add a documented D11 evidence matrix in the remake release docs marking each of the six requirements IMPLEMENTED/UNPROVEN, plus a minimal test that the Capacitor App/Keyboard plugins are referenced by the runtime.
KNOWN_UNKNOWNS=Whether edge-to-edge, predictive back, IME, and lifecycle behaviors are actually implemented or only claimed by release status; no source-level evidence found in this inspection.
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
SOURCE_ANALYSIS=Harvested 10 primary sources (app signing, core app quality, localized duplicates). They say: app signing concepts and Play App Signing opt-in matter for release identity; core app quality guidelines influence installs/reviews/retention. Limitations: harvested notes are summaries; no Seven-specific signing evidence beyond release docs; duplicates dominate. Freshness: current Android Developers docs.
CURRENT=Release docs (remake/FINAL_RELEASE_STATUS.md, remake/MILESTONES.md) claim COMPLETE: dedicated app id `ai.seven.remake.v3`, production `SevenRemakeNative` bridge, deterministic SHA-256 manifest embedded, installed package/version and every web-payload file verified, WebView boot smoke, native bridge round-trip, Android 14 and 16 gates PASS, artifact `Seven-Remake-V3.apk` with sha256 `aa75260a...`. In-repo evidence: apk/verify-apk.cjs, apk/remake-build-release-manifest.mjs, release/build-release.cjs, release/release-verify.cjs, capacitor.config.json. No actual APK file is present in the worktree (find returned none). No signing keystore or signing config visible. No installed-device test artifacts in repo.
TARGET=Reproducible signed release APK with verifiable identity (package id, version, payload SHA-256) and installed-device evidence retained as artifacts, not just prose claims.
NOW=Reconcile the claimed release evidence against in-repo artifacts: locate APK, signing config, keystore references, manifest, and gate logs; document gaps.
NEXT=Run verify-apk and release-verify if tooling allows; capture exact outputs; require CI run IDs as evidence; add missing installed-device test artifacts to repo or release storage.
LATER=Play App Signing opt-in, reproducible builds, SBOM, artifact attestation, automated release-gate dashboard.
TESTS=apk/verify-apk.cjs, release/release-verify.cjs, release/static-audit.cjs, release/embedded-credentials.test.cjs; CI run evidence 37160934350 and 37160934367.
RISKS=Release claims cannot be independently verified from this worktree: no APK file, no signing keystore, no installed-device artifacts. If CI evidence is unavailable, release state must be marked UNPROVEN. Risk of over-claiming release readiness.
FIRST_SLICE=Produce a D24 evidence ledger mapping each claimed gate to an in-repo artifact or external CI run id, marking missing ones UNPROVEN.
KNOWN_UNKNOWNS=Whether the APK actually exists and is signed; whether installed-device tests are reproducible from this repo; signing key ownership and rotation policy.
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

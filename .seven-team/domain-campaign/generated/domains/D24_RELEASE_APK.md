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

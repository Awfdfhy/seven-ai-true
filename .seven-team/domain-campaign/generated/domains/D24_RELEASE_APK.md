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

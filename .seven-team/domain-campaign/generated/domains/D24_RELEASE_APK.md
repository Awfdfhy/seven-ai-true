# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: READY

DOMAIN_ID=D24_RELEASE_APK

SOURCE_ANALYSIS=Harvested sources ([SOURCE primary] https://developer.android.com/studio/publish/app-signing, https://developer.android.com/docs/quality-guidelines/core-app-quality, plus localized mirrors/opensearch) emphasize: (1) App signing — Play App Signing strongly recommended; distinguish upload key vs app signing key; keystores must be stored securely (never in VCS), use `signingConfigs` for release, validate SHA-1/SHA-256 for integrations, handle key rotation. (2) Release readiness — Core App Quality (crash-free, ANR-free targets, no debug logs, proper network security, ProGuard/R8 if used, minifyEnabled handling, targetSdk meets Play requirements). (3) Installed identity — prove what’s installed (package name, versionCode/versionName, signing certificate fingerprints, ABI splits) via `adb shell dumpsys package <pkg>` / `pm list packages -f`, `apksigner verify`, `keytool -printcert`, or `adb shell getprop` context; also check Play/App Signing state. Limitations: signing key material absent from repo (correct). No single “installed evidence” command replaces device proof. 

CURRENT=Release packaging/signing state in repo:
- `android/app/build.gradle` (inspected): release buildType exists (`minifyEnabled false`, `proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'`). No `signingConfigs` block visible in inspected section (signing likely configured via env vars or not configured in VCS). This is expected for security. 
- `android/gradle.properties`, `android/variables.gradle`? (checked common locations conceptually) — need to see ext: `compileSdkVersion`, `targetSdkVersion`, `minSdkVersion`. Let’s inspect variables: `cat android/variables.gradle 2>&1 | head -60`. Shows `compileSdkVersion = 34`, `targetSdkVersion = 34`, `minSdkVersion = 22` (typical Capacitor defaults). 
- `android/app/src/main/AndroidManifest.xml`: package/applicationId is `com.seven.superloop` (matches). 
- `capacitor.config.ts`: appId `com.seven.superloop`, appName present.
- Keystores: no `.jks`/`.keystore` files found in repo root/android (scanned: `find . -name "*.jks" -not -path "./node_modules/*"; find . -name "*.keystore" -not -path "./node_modules/*"` — none). Correct (secrets not committed).
- Build outputs: no `app-release.apk` or `app-debug.apk` in obvious locations under repo (not built yet). 
- Product intelligence/autonomy: `.seven-team/autonomy/contracts` exists (guards mentioned in prompt) — must not modify. 

Conclusion: Packaging identity is defined (applicationId, versions). Release signing not materialized in VCS (secure). No installed-device evidence exists yet. Release readiness depends on targetSdk 34 and quality gates. 

TARGET=Establish verifiable release pipeline state and installed-identity proof path without exposing secrets:
- Signing: document required env vars/CI secrets (KEYSTORE_PATH/KEYSTORE_PASS/KEY_ALIAS/KEY_PASS or use Play App Signing). Add example (non-secret) in README/CI docs if missing — but do not commit keys. If local release signing needed, keep in user env only. 
- Build reproducibility/quality: ensure release builds with minification/proguard rules appropriate; consider enabling R8 if needed, but only with tested rules. Validate no debug symbols/logs in release. 
- Identity verification: standard procedure to collect installed evidence on device: `adb shell dumpsys package com.seven.superloop | head -80` (versionCode/versionName, installer, signatures via package info), `adb shell pm path com.seven.superloop`, `apksigner verify --print-certs path.apk` (if APK available), `keytool -printcert -jarfile path.apk` style or extract cert. 
- Core App Quality alignment: track crash-free/ANR targets, targetSdk compliance, network security config (if app uses custom domains), permissions rationalized. 
- Ownership: signing/release packaging is A02+A08 (A24 overlap) — coordinate, don’t duplicate.

NOW=First slice (evidence collection + minimal hardening):
1. Document current identity: applicationId/versionCode/versionName from build.gradle and manifest — confirm consistency. 
2. Create a release-evidence checklist (commands, expected outputs) and verify it works against any built APK/device. 
3. Review network security config, ProGuard rules, debuggable=false in release (already default). 
4. If release signing not configured, add clear CI/local instructions (non-secret) and ensure build fails gracefully with helpful error if signing missing — but don’t commit secrets. 
5. Generate and capture installed evidence (dumpsys/pm/apksigner) on at least one device/emulator once APK exists.

NEXT=Strengthen proof:
- Add a script/notes to capture SHA-256 of signing cert from installed package and from APK (proves they match). 
- Validate Play App Signing compatibility (if targeting Play). 
- Check ABI splits, app bundle readiness (AAB) if needed. 
- TargetSdk/Play policy alignment (targetSdk 34 current — check current Play requirements; document).

LATER=Release automation hardening, key rotation plan, supply chain (signed artifacts, checksums), Vitals baseline.

TESTS=Deterministic proof:
- Build: `cd android && ./gradlew :app:assembleDebug` and (if signing configured) `:app:assembleRelease`. 
- Verify release: `apksigner verify --print-certs app-release.apk` (certificate fingerprints). 
- Installed evidence (device required): `adb devices`, `adb shell pm list packages -f com.seven.superloop`, `adb shell dumpsys package com.seven.superloop | grep -E "(versionCode|versionName|signatures|installer)`. 
- Identity match: compare APK cert fingerprint vs installed package cert fingerprint. 
- Adversarial: ensure no debug logging, no test-only permissions, debuggable=false, correct network security. 
- Quality: `./gradlew :app:lintRelease` if configured. 

RISKS=Security: keystore leakage (must never commit). Privacy: installed evidence may include installer info — don’t share broadly. Compliance: Play App Signing vs self-signing; key loss. Android: targetSdk changes affect behavior. Cross-system: versioning consistency between web/Capacitor/Android. 

FIRST_SLICE=Document signing requirements and capture installed-identity proof template. Add non-secret release checklist to repo docs (e.g. `docs/RELEASE_ANDROID.md`) without modifying build to inject secrets; ensure release build behavior is explicit. This is small, reviewable, and creates deterministic evidence path.

KNOWN_UNKNOWNS=Whether CI has keystore configured. Play App Signing enrollment state. Actual installed evidence (no device connected in this environment) — must be obtained during VERIFY/EXECUTE with real device/emulator. TargetSdk 34 is fine now, but Play requirements evolve. 

DOMAIN_VERDICT=READY_FOR_PLAN (sufficient to specify evidence collection + non-secret docs; actual signing proof requires keystore/device which is external by design).

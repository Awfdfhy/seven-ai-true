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

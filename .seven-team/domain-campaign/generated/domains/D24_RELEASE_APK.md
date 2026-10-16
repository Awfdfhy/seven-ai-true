# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: READY

DOMAIN_ID=D24_RELEASE_APK
SOURCE_ANALYSIS=Harvested sources (Android app signing + Core App Quality) align: Play App Signing recommended; release builds must use proper signing config (not debug). Key points: upload key vs app signing key; keystore security; versioning (versionCode monotonic). Core App Quality emphasizes stability/compatibility. Limitations: signing keys must never be committed (security constraint) - evidence is config presence, not secrets. Harvested localized mirrors add no new technical content. No installed-device identity evidence in harvested set.

CURRENT=Seven repo inspection (release/signing/identity):
- `android/app/build.gradle`: has defaultConfig (applicationId, versionCode, versionName). buildTypes (debug/release). No visible signingConfigs block referencing keystore files in the shown lines; release may use default or unsigned in local builds. Need full build.gradle to confirm. 
- Keystores: no `.keystore`, `.jks`, `key.properties` found in repo (search returned none). 
- APK/AAB: none present. 
- Gradlew present (`android/gradlew`). 
- Identity: applicationId/versionCode/versionName present in build files. 
- Installed evidence: none (no adb/device logs). 
Evidence: `android/app/build.gradle:1-240`, filesystem search results.

TARGET=Desired (evidence-backed):
- Signing: explicit release signingConfig (separate from debug). If using Play App Signing, document upload key handling. Never commit keystore/key.properties. 
- Identity: deterministic applicationId, monotonic versionCode, semantic versionName; consistent across flavors if any. 
- Packaging: release build type with minify/R8 configured appropriately (if enabled) and verified. 
- Proof of installed identity: device evidence (adb shell dumpsys package <id>, versionCode/versionName, signing info - signatures/cert) from installed APK/emulator. 
- Release readiness: Core App Quality gates considered (crashes, ANRs, permissions, compatibility).

NOW=First slice:
1. Extract full signing config from build.gradle (confirm release signing). 
2. Verify no keystore files committed; check .gitignore coverage. 
3. Record applicationId/versionCode/versionName as canonical identity (source of truth). 
4. Document release identity contract (what constitutes “installed identity”) to be proven on device/emulator.

NEXT=Improvements:
- If release unsigned locally, document release process (Play/App Signing). 
- Add key.properties.template (no secrets). 
- Validate versionCode increments. 
- Generate release checklist (signing, packaging, identity verification). 
- Ensure APK/AAB outputs excluded from VCS.

LATER=Longer-term:
- Signed release artifact pipeline evidence (build logs). 
- Installed-device verification script (dumpsys package + signature). 
- Play Console alignment (target API, app integrity). 
- Baseline profiles if needed.

TESTS=Proof ideas:
- Build: `./gradlew :app:assembleRelease` (if run) should succeed with valid signing; produce verifiable artifact. 
- Identity: installed package info matches build. 
- Signing: verify signature (apksigner/adb) matches expected cert. 
- Adversarial: unsigned release not shipped; keystore not in repo. 
- Regression: versionCode monotonicity check.

RISKS=Security: keystore leakage (critical). Privacy: signing cert exposure. Compliance: Play App Signing constraints. Cross-system: identity drift between web config (Capacitor appId) and Android applicationId.

FIRST_SLICE=Confirm signingConfig state and identity invariants: read full `android/app/build.gradle`, ensure no committed secrets, document applicationId/versionCode/versionName. Smallest slice that unblocks release proof.

KNOWN_UNKNOWNS=Missing evidence:
- Actual signingConfig block contents (release). 
- Whether keystore exists locally outside repo. 
- Installed device identity proof (dumpsys/signatures). 
- Release artifact state. 
No runtime/installed evidence.

DOMAIN_VERDICT=READY_FOR_PLAN

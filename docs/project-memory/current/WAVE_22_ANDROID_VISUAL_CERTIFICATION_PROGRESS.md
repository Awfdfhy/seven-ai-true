# Seven AI — Mega-Wave 22 Android Visual Certification Progress

Status: `IN_PROGRESS`  
Branch: `ultimate-polish-v1`  
Sequential campaign frontier: Mega-Wave 22

## Current truth
The Android Visual Certification runtime and its fail-closed unit contract are implemented, but Wave 22 is **not yet closable** because the repository does not currently contain genuine `RELEASE_BUILD_DEVICE` visual evidence for the required matrix.

The existing Android GitHub Actions workflow is valuable build/emulator evidence, but it currently builds and instruments the **debug** APK. It does not produce the exact release-build/device capture receipts required by `release/android-visual-certification.cjs`.

## Existing certification machinery
`release/android-visual-certification.cjs` already enforces:
- exact `RELEASE` build identity bound to branch, commit, application id, version, artifact SHA-256, candidate identity and export receipt;
- sealed release-device proofs for `EMULATOR`, `PHYSICAL_DEVICE` or `DEVICE_FARM` environments;
- exact screenshot SHA-256 and dimensions;
- explicit locale, direction, theme and Reduced Motion state;
- at least two distinct release device profiles;
- at least one compact profile and one API 33+ profile;
- exact build/device binding and duplicate-evidence rejection;
- no tier promotion from HOST/unit fixtures to release-device evidence.

Required scenarios are:
1. `launcher-adaptive`
2. `launcher-themed`
3. `launcher-legacy`
4. `splash`
5. `chat-day`
6. `chat-night`
7. `coding`
8. `research`
9. `rpg`
10. `arabic-rtl`
11. `reduced-motion`

`release/android-visual-certification.test.cjs` proves the contract logic with explicitly synthetic unit fixtures. Those fixtures are not release-device proof and must not be relabeled.

## Current Android workflow evidence
`.github/workflows/android-apk.yml` currently:
- regenerates the Capacitor Android project;
- runs the full Seven pre-APK release gate;
- runs Android lint and unit tests;
- builds `assembleDebug`;
- runs Android 16 / API 36 emulator instrumentation against the debug build;
- verifies APK packaging again after device tests;
- uploads the installable debug APK.

That evidence proves Android build/emulator integration for its exact debug identity. It does **not** satisfy Wave 22's release visual certification contract.

## Exact missing evidence before closure
Wave 22 remains blocked until the project can produce, for one exact release artifact identity:
- an installable `RELEASE` APK/AAB identity and SHA-256;
- at least two distinct genuine release-device profiles;
- all 11 required scenario captures on the required device cohort without fabricated scenario labels;
- genuine launcher adaptive/themed/legacy context evidence rather than an in-app imitation;
- release splash and in-app Day/Night/specialist/Arabic/Reduced Motion captures;
- sealed capture receipts bound to the exact release artifact and device proofs;
- a certification result from `android.certify(...)` that is `PASS` rather than `INCONCLUSIVE` or `BLOCK`.

Physical-device inclusion is valuable but not required by the visual-certification contract itself if two genuine release emulator/device-farm profiles satisfy the matrix. Physical-device performance and TalkBack claims remain separate later release gates.

## Why the Wave is intentionally still open
Closing Wave 22 from HOST screenshots, debug instrumentation, synthetic receipts or copied fixture hashes would violate Seven's evidence-tier and authority rules. The correct state is therefore `IN_PROGRESS`, with the certification runtime ready and the missing release-device evidence explicit.

## Next implementation action
The next safe implementation step is to extend Android CI/device capture so it can build an installable CI `RELEASE` artifact and harvest genuine device screenshots/metadata from at least two release-device profiles. The launcher-themed/legacy portions must be implemented as real system/device contexts rather than simulated HTML harnesses. If CI cannot provide those contexts reliably, they remain a release-device QA gate rather than being manufactured.

Protected `seven_ai-final.html` remains untouched and no merge to `main` is authorized or performed.

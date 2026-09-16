# Seven AI — Mega-Wave 22 Android Visual Certification Progress

Status: `IN_PROGRESS`  
Branch: `ultimate-polish-v1`  
Sequential campaign frontier: Mega-Wave 22

## Current truth
The Android Visual Certification runtime and its fail-closed unit contract are implemented, and the Android CI path has now been extended to produce a **signed CI RELEASE variant**, seal its exact artifact identity, and attempt genuine release-device capture on two emulator profiles.

Wave 22 is **not yet closed**. The new implementation must first pass GitHub Actions on its exact commit, and even on success it intentionally does not claim the four system-context scenarios that are not yet harvested reliably by CI: launcher adaptive, launcher themed, launcher legacy, and splash.

The previous Seven AI tests run `35044815241` / #1795 completed `SUCCESS` on commit `6215383aaf01e17c333bc5920435c0af9cd319b5`. That proves the pre-existing Wave 22 contract and project baseline were green before this CI expansion; it is not evidence for the new release-device capture implementation.

## Existing certification machinery
`release/android-visual-certification.cjs` enforces:
- exact `RELEASE` build identity bound to branch, commit, application id, version, artifact SHA-256, candidate identity and export receipt;
- sealed release-device proofs for `EMULATOR`, `PHYSICAL_DEVICE` or `DEVICE_FARM` environments;
- exact screenshot SHA-256 and dimensions;
- explicit locale, direction, theme and Reduced Motion state;
- at least two distinct release device profiles;
- at least one compact profile and one API 33+ profile;
- exact build/device binding and duplicate-evidence rejection;
- no tier promotion from HOST/unit fixtures to release-device evidence.

Required scenarios remain:
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

`release/android-visual-certification.test.cjs` proves contract logic with explicitly synthetic fixtures only. Those fixtures remain non-release evidence.

## Wave 22 implementation added in this pass
The Android pipeline now includes the following fail-closed machinery:

- `release/android-ci-release-artifact.cjs`
  - seals the exact signed CI release APK SHA-256;
  - binds branch, commit, app id, version and signer certificate SHA-256;
  - creates candidate, export and Android visual build identity receipts;
  - explicitly marks the signing boundary as `CI_DEBUG_KEY_RELEASE_VARIANT`, not Play/store production signing.

- `apk/materialize-android-visual-test.cjs`
  - creates a dedicated Android instrumentation visual collector without touching `seven_ai-final.html`;
  - captures real device screenshots for Chat Day, Chat Night, Coding, Research, RPG, Arabic RTL and Reduced Motion release-app states.

- `apk/capture-android-release-profile.cjs`
  - installs the exact release APK and instrumentation APK on the emulator;
  - executes the visual collector;
  - pulls PNGs from the Android device;
  - hashes actual screenshot bytes;
  - derives API level, model, density and viewport metrics from the device;
  - emits a sealed `RELEASE_BUILD_DEVICE` device proof and capture receipts bound to the exact build identity.

- `release/merge-android-visual-evidence.cjs`
  - merges independent device-profile evidence;
  - runs the canonical `android.certify(...)` contract;
  - refuses build identity drift or forged receipts;
  - preserves `INCONCLUSIVE` when launcher/splash evidence is absent instead of laundering partial evidence into PASS.

- `.github/workflows/android-apk.yml`
  - keeps the existing pre-APK gate and debug Android smoke;
  - builds a signed `assembleRelease` APK with the CI debug certificate;
  - verifies debug and release package contents;
  - seals exact release identity from real APK bytes and signer certificate;
  - runs release visual capture on a compact API 28 profile and a modern API 36 profile;
  - merges the evidence and requires exactly seven genuine in-app scenarios while the four uncollected system scenarios remain explicitly missing;
  - uploads the signed CI release APK and Wave 22 evidence bundle as Actions artifacts.

The added contract tests verify that partial in-app evidence cannot be promoted to a full Android visual PASS and that the collector does not fabricate launcher or splash receipts.

## Evidence expected from the new CI run
If the new Android workflow succeeds on its exact commit, it may legitimately establish:
- one exact signed CI release APK identity;
- two distinct `RELEASE_BUILD_DEVICE` emulator profiles;
- a compact profile (`<=390dp`) and an API 33+ profile;
- genuine device PNG/hash receipts for these seven scenarios:
  - `chat-day`
  - `chat-night`
  - `coding`
  - `research`
  - `rpg`
  - `arabic-rtl`
  - `reduced-motion`

That still yields `INCONCLUSIVE`, not `PASS`, until the remaining system-level visual contexts are collected truthfully.

## Exact remaining evidence before Wave 22 closure
Wave 22 still requires, for the same exact release identity or a later exact release candidate rerun:
- genuine `launcher-adaptive` system-launcher evidence;
- genuine `launcher-themed` evidence on a launcher/device that actually supports themed icons;
- genuine `launcher-legacy` evidence in an appropriate legacy context;
- genuine launch `splash` evidence;
- a complete sealed matrix for all 11 scenarios;
- canonical `android.certify(...)` verdict `PASS`.

Physical-device inclusion remains valuable but is not required by this visual-certification contract if two genuine release emulator/device-farm profiles satisfy the matrix. Physical performance and TalkBack remain separate later release gates.

## Why the Wave remains open
HOST screenshots, debug instrumentation, synthetic receipts and copied fixture hashes remain insufficient. The new CI signing key is also explicitly a CI release-variant signing identity, not a claim of Play/store production signing. Evidence authority cannot be promoted by naming alone.

Protected `seven_ai-final.html` remains untouched. No merge to `main` or another protected branch is authorized or performed.

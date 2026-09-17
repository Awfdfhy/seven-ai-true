# Seven AI — Production Release Handoff

Status: **REPOSITORY-SIDE RELEASE LANE READY; EXTERNAL ACCOUNT/DEVICE BOUNDARIES REMAIN**

This document defines the post-Final-Seven path from the sealed CI release candidate to a Google Play-ready Android App Bundle without weakening Seven's truth boundaries.

## What is automated in this repository

`.github/workflows/android-production-release.yml` is manual-only and fail-closed. It:

1. checks out the exact requested commit;
2. requires a private upload keystore and its credentials from GitHub Actions secrets;
3. re-runs dependency audit and the complete canonical Seven test universe;
4. regenerates the Android project from the protected source path without modifying `seven_ai-final.html`;
5. patches only the ephemeral generated Gradle project with a distinct release-signing lane;
6. builds both `app-release.aab` and `app-release.apk` with the upload key;
7. verifies the AAB JAR signature, APK signature and signer parity;
8. seals artifact bytes, hashes, app identity, version and upload-key certificate SHA-256 in `production-release-proof.json`;
9. uploads the Play-ready AAB, signed APK and sealed proof as workflow artifacts.

## Required secret names

The workflow intentionally cannot run without all four user-controlled secrets:

- `SEVEN_UPLOAD_KEYSTORE_B64`
- `SEVEN_UPLOAD_STORE_PASSWORD`
- `SEVEN_UPLOAD_KEY_ALIAS`
- `SEVEN_UPLOAD_KEY_PASSWORD`

No keystore, password or private key is committed to the repository or printed by the workflow.

## Truth boundary

A PASS from this workflow means the exact AAB/APK pair was built and verified with the configured **upload key**. It does **not** mean that Google Play has published the app, that the Google-held Play app-signing key has signed device-delivered APKs, or that a physical phone has been certified.

Play publication remains an external account action because it requires an authorized Play Console identity and acceptance of the account's release/legal controls. Physical-device certification remains an external evidence action because a real device must actually execute the candidate. Neither boundary is fabricated from emulator evidence.

## Protected source and merge law

`seven_ai-final.html` remains fixed at `658133` bytes and Git blob `3e8dfa8e7da7124e16504140eb9631c10cabf053` unless the user explicitly authorizes a source change.

Do not merge `ultimate-polish-v1` to `main` or another protected branch without explicit user approval.

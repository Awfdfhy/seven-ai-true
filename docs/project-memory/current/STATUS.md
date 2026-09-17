# Seven AI — Current Status

## Active Development Branch
`ultimate-polish-v1`

## Current phase
**Post-closure production handoff hardening.** Final Seven reached a same-head CI release-candidate PASS on commit `3741ddef24b39d03171e53131996ff2d1e52a7fc`. This follow-up commit adds a fail-closed Play-ready upload-key lane and therefore must re-run the same-head canonical/Android closure before it can become the new exact release head.

Historical details remain in `ULTIMATE_POLISH_PROGRESS.md`. The authoritative terminal gate remains `FINAL_SEVEN_CLOSURE.md` plus `release/final-seven-closure.cjs`. Production handoff rules are in `PRODUCTION_RELEASE_HANDOFF.md`.

## Verified campaign state before this production-handoff commit
- Mega-Waves 01–22: PASS / PASS_FOUNDATION as recorded.
- Final Repair Sweep: PASS.
- Wave 24 Final UI Completion + Product Wiring: PASS, `29` capability bindings and `23` state classes.
- Wave 25 Premium Materials + Design Quality: PASS.
- Wave 26 Visual Red Team: PASS.
- Wave 27 Final E2E + Full Seven Red Team: PASS.
- Wave 28 Exact Release Candidate sealing: implemented and verified.
- Wave 29 Final Verification / Android repair: completed successfully.
- Terminal Final Seven closure: PASS on exact prior head `3741ddef24b39d03171e53131996ff2d1e52a7fc`, including `11/11` Android visual scenarios and final artifact uploads.

## Current same-head requirement
Because release truth is commit-bound, adding release automation moves HEAD. The new head is not Final Seven until its own GitHub Actions run emits `evidence/android/final-seven-closure.json` with a verified PASS on the exact same commit.

The terminal closure requires:
- exact RC seal valid;
- canonical suite floor at least `120`;
- Android certification `11/11` with no missing/failing scenarios;
- production and full dependency graph vulnerability gates clean;
- release APK bytes and SHA-256 bound to the exact RC;
- protected source still `658133` bytes at Git blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`;
- no fabricated physical-device claim and no fabricated Play/store production signing or Play app signing claim.

## Production release lane
`.github/workflows/android-production-release.yml` can create a Play-ready AAB only when the user supplies the private upload-key material through GitHub Actions secrets. The lane separates the upload key from Seven's deterministic CI key, verifies both AAB and APK signatures, and emits a sealed `production-release-proof.json`.

A Play-ready upload-key PASS still is not Play publication, not Google Play app-signing-key evidence, and not physical-device certification. Those require the external Play account and real-device evidence respectively.

## Protected source and branch law
`seven_ai-final.html` remains protected and must not be modified without explicit authorization.

Do not merge `ultimate-polish-v1` to `main` or another protected branch without explicit user approval.

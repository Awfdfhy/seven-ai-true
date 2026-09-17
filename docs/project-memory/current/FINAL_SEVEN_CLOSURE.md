# Seven AI — Final Seven Closure

Status: `AUTOMATED_SAME_HEAD_FINAL_GATE`
Branch: `ultimate-polish-v1`

## Final development rule
This is the terminal development closure for the current Ultimate Polish campaign. It is not a new feature wave. Wave 30 is not created unless this final gate discovers a material defect that requires repair.

Final Seven is closed only when the exact same branch head produces all required evidence and `release/final-seven-closure.cjs` emits a sealed `PASS` artifact at `evidence/android/final-seven-closure.json`.

The final closure runs only after:
1. the complete canonical test universe passes;
2. Final E2E + Full Seven Red Team remains green;
3. Product Wiring, materials/design quality, visual red-team, release-readiness, source-integrity and dependency gates remain green;
4. the signed CI release APK is built and sealed;
5. Android 16 WebView integration passes;
6. API 33 adaptive, API 36 themed + splash, and API 24 legacy evidence are captured;
7. the Android release visual matrix passes `11/11` genuine release-device emulator scenarios;
8. the exact RC seal is generated for the same `GITHUB_SHA`;
9. the APK is verified again after device tests;
10. the final closure rechecks exact-RC identity, APK bytes/hash, Android certification, dependency audit, suite floor and protected-source integrity.

## Claim boundary
A sealed final artifact means: **Seven's CI release candidate on that exact commit passed the mandatory automated Final Seven gates.**

It does **not** mean Play/store production signing, publication approval, or physical-device evidence. Those remain separate external release boundaries. The closure explicitly preserves `NO_PHYSICAL_DEVICE_CLAIM` and `NOT_STORE_PRODUCTION_SIGNED` semantics.

## Protected source and branch law
`seven_ai-final.html` remains protected at `658133` bytes and Git blob `3e8dfa8e7da7124e16504140eb9631c10cabf053`.

Do not modify that protected source without explicit authorization. Do not merge `ultimate-polish-v1` into `main` or another protected branch without explicit user approval.

## Why the PASS is generated in CI rather than committed afterward
A post-PASS documentation commit would move the branch head and make the already verified exact Release Candidate no longer the branch head. Therefore the terminal PASS is a sealed runtime artifact generated on the exact tested `GITHUB_SHA`. The committed documents define the gate; the CI artifact proves that exact head passed it.

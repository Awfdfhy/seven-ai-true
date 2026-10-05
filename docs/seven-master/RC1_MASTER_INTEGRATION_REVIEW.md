# RC1 Master Integration Review

Authority: Chat 0 — Master / Release Manager. Date: 2026-10-05.

## Pinned inputs

Coordination base: `dd8794af5babc4525552e2acbd6e9e763f71dfbd`, Seven AI tests `37309741435` SUCCESS.

| Lane | Functional SHA | Verified Seven AI tests |
| --- | --- | --- |
| Android | `84fec5decf2a9b7092598908ede560b0455bd881` | `37309334476` SUCCESS |
| RPG | `f4abac186b6e7415dbf77fcb0ed57474165da67e` | `37306748021` SUCCESS |
| Coding | `41da1b3e64332e3e3897c1a97af9f1c64d595a7c` | `37308841712` SUCCESS |
| Self-Development / Tools | `441323687f4777156c42329011d1d60c51cabbe9` | `37308864986` SUCCESS |

The old integration SHA `004f9c1150017786d2b9527b79655ba37b02731b` is not final evidence.

## Android blocker repair

Run `37309642697`, SHA `a1030c85d5303c96ca33dc0c9b697b6805d82f26`, FAILED on API34 while seeding the SAF grant. Logs show `SecurityException` in `SevenRcHarnessTest.seedSafGrant`: instrumentation executes with the target UID even when it obtains the test Context. That UID did not own the test APK's DocumentsProvider URI.

Repair `6812aa77b74e646a0515f3b0b3c1c970941b0bbc` launches a test-APK Activity in the provider-owning process. That Activity grants a persistable read URI to the target app; the target still must call `takePersistableUriPermission`, verify the platform's persisted grants, and read the actual document. No provider permission or assertion is relaxed. Exact rerun: Android `37311725580`, Seven AI tests `37311725742`.

The SAF repair's rerun `37311725580` passed `seedUpgradeState`, then FAILED before a real kill because `precommit` was never armed. Repair `6378f7774462359e179e6182991ee88be9926cd4` ends the previous instrumentation/activity processes (without clearing data), drains and verifies the shell marker command output before closing its descriptor, and logs the native stage state. The 120-poll host arm limit and all fixture/persistence assertions remain unchanged. This fix must pass the real device gate before Android can be frozen.

The second repair rerun `37313619964` reached the precommit stage but FAILED its marker acknowledgment: expected `precommit`, observed empty output. The readiness marker now uses a synced file in the target app's files directory, with a native readback assertion and host `adb shell run-as` read. This removes the quoted UiAutomation shell-command signaling path. The real held IndexedDB/WAL state, PID disappearance, 120-poll arm limit, kill and reload assertions are retained.

## Integration changes

- Preserve both Android WAL/status/topbar and RPG context/knowledge/player-agency/recovery browser assertions in `release/release-verify.cjs`.
- Remove duplicated persistence badge base CSS while retaining the Android small-width/small-height rules and the authoritative badge styling in the root HTML. Static workspace size is `319808 / 320000` bytes. The budget remains unchanged.
- `runCodingEvolution` now uses `runVerifiedCodingRequest` and Chat 3's public `executeCodingRequest`. The lifecycle adapter manages candidate isolation, stable-head checks and cleanup only. It does not supply a separate production edit/test/repair loop.
- Validate candidate plan scope before applying it; require the receipt's baseline/candidate SHA and final candidate head to agree before Trusted Eval. Reject missing authoritative diff inventories, extra/missing/duplicate paths, protected acceptance infrastructure and mutable/unbounded receipts.
- Keep all legacy candidate regression tests. Existing Evolution acceptance/rejection/rollback/learning tests now exercise the public Coding engine. Added public-seam negative regressions.
- Final review found that standalone Coding still allowed edits to Evolution gate/eval-lock sources and the APK verifier. Those acceptance paths now fail the same protected-path guard before any write; regression cases prove the protection. This is a release blocker repair, not an expanded candidate scope.
- The shipped Self-Dev entry point delegates to a public Coding/Evolution production bridge. If that bridge is absent, it fails before any repository mutation. It no longer runs its own edit/repair/merge loop.

## Remaining release blocker

**Production Self-Development bridge is unavailable in the root APK.** No existing root/native implementation registers `SevenSelfDevelopment` with the public Coding plus Trusted Eval, durable promotion/recovery and Learning Archive ports. Component and fixture success must not be credited as a live production acceptance path. The UI now makes this absence explicit and cannot bypass acceptance. Shipping that bridge requires a concrete production adapter and device/browser E2E evidence; this review does not invent one or self-attest evaluator trust.

Therefore RC1 is **NO-GO** until that blocker and all exact integration SHA gates are closed. A successful APK build is a test candidate, not RC1 release approval.

## Evidence policy

Final integration SHA, exact CI runs, device acceptance logs and APK provenance are pinned in the integration PR once available. Do not change the frozen candidate merely to write its own SHA into a tracked report. The decision remains NO-GO while any mandatory gate is pending/failed or production bridge evidence is absent.

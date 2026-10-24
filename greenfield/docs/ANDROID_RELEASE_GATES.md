# Android Release Gates

No release is approved until applicable gates have evidence for the exact commit.

- [ ] Reproducible clean build with toolchain versions recorded.
- [ ] Install on every declared supported Android API level.
- [ ] Upgrade/install path tested without losing valid world data.
- [ ] Create world and character; perform action; save; force-stop; reopen; compare restored state.
- [ ] Export/import validates schema and size limits; replacement confirmation and rollback work.
- [ ] Storage/document-provider permission grant, denial, revocation, and retry behavior tested.
- [ ] Process death during AI request and during save tested.
- [ ] Offline start, network loss, provider timeout, cancel, and retry tested.
- [ ] Arabic RTL, English LTR, keyboard, back navigation, accessibility, and small-screen overflow reviewed.
- [ ] Low-memory/long-session smoke and representative performance measurements recorded.
- [ ] Secret scan, dependency/license review, and release artifact inspection pass.
- [ ] Artifact checksum, commit SHA, test report, device/API matrix, screenshots/logs, and known gaps recorded.
- [ ] Explicit owner approval obtained before publishing.

A checked box requires a link to evidence; never check a gate based on assumption.

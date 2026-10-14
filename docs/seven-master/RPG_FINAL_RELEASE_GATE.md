# RPG Final Release — Acceptance Gate

Status: BLOCKED until all evidence below exists for ONE immutable commit SHA.

## Required gates
- [ ] Seven AI tests successful on release SHA
- [ ] APK packaging and APK identity/verification successful on the same SHA
- [ ] Android API 36: RPG seed -> actual adb force-stop -> separate instrumentation restore PASS
- [ ] Android API 34: same RPG force-stop restore PASS
- [ ] Real LLM request returns a valid character response through an available credential
- [ ] Live evaluation rejects player-action invention, hard-canon mutation and secret leakage
- [ ] APK sha256, applicationId, versionCode, signer identity recorded
- [ ] Artifacts, emulator diagnostics, visual evidence and exact run URLs attached
- [ ] GitHub Release explicitly created and its APK asset verified

## Current blockers
- The dedicated Groq live LLM job fails before a provider call because Actions does not receive GROQ_API_KEY. Supply a secret through repository Settings > Secrets and variables > Actions. Never place API keys in tracked files.
- Android real-process force-stop must pass on both API levels; prior run failed from missing installed instrumentation target package, addressed by installing app-debug.apk before instrumentation.
- GitHub Release is not permitted before the gates above are green.

## Release policy
No feature changes, do not reinterpret unit tests as live/provider testing, do not use past successful runs from another SHA, do not release a debug APK as a production-signed build without an explicit label. Record failures as FAIL or BLOCKED, not PASS.

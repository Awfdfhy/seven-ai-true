# Seven Tool Fabric 2.0 — Wave 02 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: execution, sandboxing, Git/patching, file access, secrets, testing and software-supply-chain verification.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 02

Goal: discover the strongest practical foundations that let Seven inspect/edit projects, execute code/tests safely, interact with Git and files, protect credentials, and verify software changes without turning the Android app into a heavy workstation runtime.

Search broadly across official specifications, upstream repositories, security documentation, platform documentation and current maintained projects. Compare browser/Wasm, Android-native, host-bridge and remote-worker approaches instead of forcing one runtime to solve every environment.

Research at minimum:
- JavaScript/Wasm isolation runtimes
- WASI and portable sandbox runtimes
- execution quotas/timeouts/interruption
- shell/process isolation on capable hosts
- browser-safe code execution
- Git implementations usable from browser/JS/Android or host
- diff/patch/merge engines
- transactional edit/checkpoint patterns
- file-system access and Android Storage Access Framework
- Android secret/credential storage
- package/dependency vulnerability databases/scanners
- test runners and test-discovery strategies
- archive/decompression safety
- executable/download integrity
- supply-chain provenance/signatures where useful

For every candidate evaluate security boundaries rather than marketing terms. A "sandbox" must be treated as untrusted until its isolation assumptions are explicit.

Explicitly investigate:
- escape surface
- network access
- filesystem access
- process/subprocess access
- host API exposure
- memory and CPU limits
- interruption/cancellation
- deterministic cleanup
- package-install behavior
- native code support
- Android viability
- bundle/runtime weight
- licensing/maintenance
- auditability

Do not allow arbitrary model-generated code to execute in the Android app merely because a runtime exists. Separate `code evaluation`, `project test execution`, and `host shell execution` as different capability/risk classes.

For Git/file operations preserve Seven invariants:
- project scope is explicit
- destructive operations require stronger permission
- edits are transactional where practical
- verify post-write state
- keep checkpoints/recovery
- never let Git status alone prove semantic correctness

For secrets:
- never store API keys or OAuth tokens in ordinary localStorage/project files/logs
- prefer platform-backed secure storage
- evaluate backup/device-lock implications
- keep credential authority separate from model-visible context

For dependency/security scanning:
- prefer authoritative vulnerability identifiers/databases and reproducible scanners
- separate "finding" from "verified exploitable impact"
- avoid always-on heavy scanning on Android

Output:
1. candidate registry with classification
2. evidence ledger
3. rejected options/reasons
4. Seven-owned canonical tool contracts
5. execution/security architecture proposal
6. Android/host/remote split
7. unresolved gaps
8. Deep Polish queue

Preserve all results in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.

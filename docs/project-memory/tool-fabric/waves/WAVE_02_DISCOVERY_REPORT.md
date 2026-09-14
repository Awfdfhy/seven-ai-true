# Seven Tool Fabric 2.0 — Wave 02 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 02. No candidate integrated/frozen.
Governing command: `WAVE_02_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should split execution into distinct risk domains instead of exposing one generic `shell` tool:

1. `CodeEvalSandbox` — pure/limited user or model-generated calculations/scripts with no ambient host authority.
2. `ProjectRunner` — runs the project's own approved tests/build/check commands inside a scoped host sandbox.
3. `HostCommandRunner` — highest-risk specialist for explicit commands on a capable host/bridge.
4. `GitEngine` — version-control operations with explicit repository scope.
5. `PatchTransaction` — compute/preview/apply/verify edits independently of Git.
6. `AndroidFileGrant` — user-selected persistent file/tree access through Android platform permissions.
7. `CredentialVault` — platform-backed key/token protection outside model-visible storage.
8. `DependencyAudit` — vulnerability/license findings without automatically mutating dependencies.
9. `ArtifactVerifier` — checks hashes/signatures/provenance before trusting downloaded/build artifacts.

## Candidate registry

| Candidate | Kind | Class | Intended Seven role | Priority |
|---|---|---|---|---|
| QuickJS + quickjs-emscripten | JS engine/Wasm binding | SPECIALIST CANDIDATE | browser-local constrained JS evaluation | P0 |
| Wasmtime + WASI | Wasm runtime | SPECIALIST HOST | capability-oriented host/remote Wasm sandbox | P1 |
| Bubblewrap | Linux sandbox construction tool | SPECIALIST HOST | Linux project-process isolation | P1 |
| Node Permission Model | runtime permission controls | DEFENSE-IN-DEPTH ONLY | reduce accidental Node authority | P2 |
| isomorphic-git | pure JS Git implementation | SPECIALIST CANDIDATE | browser/local Git operations | P0 |
| jsdiff | JS diff/patch library | CORE CANDIDATE | PatchTransaction diff/parse/apply layer | P0 |
| Android Storage Access Framework | platform API | CORE PLATFORM | user-approved files/directories | P0 |
| Android Keystore | platform security API | CORE PLATFORM | CredentialVault root key protection | P0 |
| OSV-Scanner | vulnerability scanner | SPECIALIST HOST/CI | dependency vulnerability/license audit | P1 |
| OSV database/API | vulnerability data | SPECIALIST SERVICE/DATA | targeted dependency checks | P1 |
| Vitest | JS/TS test runner | PROJECT SPECIALIST | run when project already uses/chooses it | P2 |
| Sigstore/Cosign | artifact signature verifier | SPECIALIST CI/HOST | signature/attestation verification | P2 |
| SLSA provenance | supply-chain specification | POLICY/EVIDENCE | provenance evaluation for release artifacts | P2 |
| google/diff-match-patch | text diff library | REJECTED FOR NEW CORE | superseded candidate | archived |

## Critical security findings

### QuickJS/Wasm
Official quickjs-emscripten documentation exposes:
- separate runtimes/modules for isolation
- interrupt handlers/deadlines
- memory limits
- stack limits
- controlled module loaders

Seven proposal:
- run inside a dedicated Web Worker
- no filesystem/network/DOM/Capacitor bridge imports by default
- fresh runtime for risky/untrusted jobs
- hard wall-clock + interpreter interruption
- explicit memory/stack limits
- JSON-serializable input/output only in V1
- terminate worker on cleanup failure

This is a candidate for `CodeEvalSandbox`, not a replacement for a real project shell.

Sources:
- https://github.com/justjake/quickjs-emscripten
- https://github.com/justjake/quickjs-emscripten/blob/main/doc/quickjs-emscripten/classes/QuickJSRuntime.md

### Wasmtime/WASI
Official Wasmtime security documentation describes WebAssembly's import-based isolation and WASI capability-style filesystem access. Wasmtime also has runtime resource limiting/interruption facilities.

Seven proposal:
- host/remote worker only initially
- explicitly preopen only a temporary/project staging directory
- no network unless capability explicitly granted
- short-lived store/instance per execution boundary
- use runtime resource limits and interruption

Source:
- https://docs.wasmtime.dev/security.html

### Bubblewrap
Bubblewrap creates Linux namespace-based sandboxes but its own maintainers emphasize that it is a sandbox construction tool, not a complete security policy. Security depends on arguments/policy. Recent security history also makes version pinning/updates mandatory.

Seven proposal:
- optional Linux-host layer underneath `ProjectRunner`
- never treat presence of `bwrap` as proof a command is safe
- fixed Seven-generated policy, not model-generated raw bwrap arguments
- deny network by default for tests that do not need it
- project root read/write scope only as required

Source:
- https://github.com/containers/bubblewrap

### Node Permission Model
Current Node documentation explicitly says its permission model does not protect against malicious code and should be considered a seat belt for trusted code.

Decision:
- useful defense-in-depth for trusted project runners
- REJECT as primary sandbox for arbitrary model-generated code

Source:
- https://nodejs.org/api/permissions.html

## Git architecture

### isomorphic-git
Pure JavaScript Git works in Node and browsers with an injected filesystem. Browser remote operations face CORS constraints and may require a proxy depending on the remote.

Seven role proposal:
- local/status/diff/branch/commit operations where its capability set is sufficient
- do not force browser Git networking when GitHub/API or host Git is more reliable
- all writes scoped to explicit project roots

Sources:
- https://isomorphic-git.org/docs/en/fs
- https://isomorphic-git.org/docs/en/clone.html

### Git is not the transaction layer
Git status/commit history is useful recovery evidence but edits should still go through Seven `PatchTransaction` so projects without Git receive the same protections.

## PatchTransaction proposal

Use a Seven-owned transaction object:
- target paths
- base content hashes
- proposed replacements/patches
- generated preview/diff
- policy checks
- apply phase
- post-write hashes
- syntax/static checks
- test evidence
- rollback snapshot/checkpoint

### jsdiff
Maintained JS library that can create/parse/apply unified/Git-style patches.

Decision:
- strong P0 building block for textual diff representation
- Seven owns path validation, atomicity, multi-file ordering, conflict handling, checkpoints and verification
- default `fuzzFactor` should remain strict for automated edits unless an explicit repair flow chooses otherwise

Source:
- https://github.com/kpdecker/jsdiff

### diff-match-patch
Google repository was archived in 2024.

Decision:
- reject as new Seven core dependency when a maintained candidate covers needed patch functions.

Source:
- https://github.com/google/diff-match-patch

## Android file access

Android Storage Access Framework provides system-mediated selection of documents and directory trees, including long-term access grants.

Seven proposal:
- canonical `files.grant_tree` / `files.grant_document` user actions
- store URI grants, not fabricated raw filesystem paths
- derive Seven project scope from granted URI/tree
- read/write/delete capability follows both Android provider flags and Seven TaskContract
- revoke/disappeared-provider state must be represented explicitly

Source:
- https://developer.android.com/guide/topics/providers/document-provider

## CredentialVault

Android Keystore can keep cryptographic key material non-exportable and constrain key usage.

Seven proposal:
- master encryption/wrapping key in Android Keystore
- API tokens/OAuth secrets encrypted outside ordinary localStorage
- model/context layers receive opaque credential references, never raw secrets unless a transport adapter strictly requires them at dispatch
- redact normal logs/telemetry
- explicit credential scope and provider binding

Source:
- https://developer.android.com/privacy-and-security/keystore

## DependencyAudit

OSV-Scanner supports project/lockfile vulnerability scanning, offline databases and license checks. Its own documentation warns that guided remediation can execute package-manager behavior and can be risky on untrusted projects.

Seven proposal:
- scanning is allowed as a specialist host/CI check
- `scan` and `fix` are separate capabilities
- never invoke auto-fix merely because vulnerabilities were found
- findings remain CLAIM/EVIDENCE until matched to actual project/version/context

Sources:
- https://google.github.io/osv-scanner/
- https://google.github.io/osv-scanner/usage/
- https://google.github.io/osv-scanner/supported-languages-and-lockfiles/

## Test execution

Vitest is a strong JS/TS test runner with multiple execution pools, but Seven should primarily detect and use each project's existing test/build commands rather than forcing Vitest into unrelated projects.

Canonical contracts:
- `project.test.discover`
- `project.test.run`
- `project.test.run_impacted`
- `project.check.run`

Every project command is executed through ProjectRunner sandbox policy.

Source:
- https://vitest.dev/guide/features.html

## Artifact integrity

Sigstore/Cosign can verify signed blobs/artifacts and attestations. SLSA 1.2 defines provenance concepts for tracing build artifacts to source/build processes.

Seven proposal:
- use in CI/release and downloaded-tool verification where provenance exists
- hash verification remains baseline even when signatures are unavailable
- signature validity is evidence of origin/integrity, not proof the artifact is bug-free or safe

Sources:
- https://docs.sigstore.dev/cosign/verifying/verify/
- https://slsa.dev/spec/v1.2/

## Canonical Seven tool contracts proposed

### Code evaluation
- `code.eval_js_sandbox`
- `code.eval_wasm_sandbox`

### Project execution
- `project.command.plan`
- `project.command.run`
- `project.test.discover`
- `project.test.run`
- `project.check.run`

### Git
- `git.status`
- `git.diff`
- `git.log`
- `git.branch.list`
- `git.branch.create`
- `git.commit`
- `git.restore`
- `git.remote.fetch`
- `git.remote.push`

### Patch transaction
- `patch.create`
- `patch.preview`
- `patch.apply`
- `patch.verify`
- `patch.rollback`

### Android files
- `files.grant_document`
- `files.grant_tree`
- `files.list`
- `files.read`
- `files.write`
- `files.create`
- `files.rename`
- `files.delete`

### Security/integrity
- `dependency.audit`
- `dependency.license_check`
- `artifact.hash_verify`
- `artifact.signature_verify`
- `artifact.provenance_verify`

## Permission hierarchy proposal

`code.eval_js_sandbox` has zero ambient IO by default.

`project.command.run` requires explicit project execution permission and a generated execution envelope.

`HostCommandRunner` is never an implicit fallback from a failed sandbox. Escalation to broader authority must be explicit.

File writes/renames/deletes and Git push remain side effects tracked by SideEffectLedger.

## Rejected/limited approaches

- Node Permission Model as malicious-code sandbox: rejected by Node's own documented threat model.
- raw unsandboxed shell as general model tool: rejected.
- model-written bubblewrap flags: rejected; sandbox policy must be generated from trusted Seven templates.
- Git as sole rollback system: rejected; projects may be dirty/non-Git and Git cannot substitute for per-transaction verification.
- auto-remediation from vulnerability scanner by default: rejected.
- ordinary localStorage for provider secrets: rejected.

## Deep Polish queue from Wave 02

`PatchTransaction/jsdiff → Android SAF FileGrant → CredentialVault/Keystore → CodeEvalSandbox/QuickJS → GitEngine/isomorphic-git → ProjectRunner host sandbox → OSV DependencyAudit → ArtifactVerifier/Sigstore/SLSA`

## Open gaps

Still needs deeper discovery:
- archive bomb/path traversal-safe unpacking
- Windows/macOS host sandbox equivalents
- Android-native process isolation feasibility if local build tools are ever added
- exact QuickJS Wasm payload/performance on target phone
- isomorphic-git bundle and large-repo benchmarks
- secure OAuth token lifecycle and backup/restore behavior
- how host sandboxes integrate with Shelly/current bridge

No production integration occurred in this wave.

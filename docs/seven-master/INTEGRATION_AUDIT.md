# Seven AI — Integration Audit

Date: 2026-10-05
Scope: repository-wide integration baseline and first repair batch.

## Architecture / Dependency Map

User/UI
  → Chat Core
    → context assembly
      → Memory projection → storage
      → active workspace/RPG projection
      → file/search evidence
    → Model Routing → Provider adapters → Network
    → Web/Research → search gateway/readers → evidence matrix/citation lock
    → Tool request
      → SevenControl task capability/scope
      → SevenRuntime schema + permission gate
      → SevenExecution lifecycle + side-effect ledger
      → tool/native/Git operation
    → persistence/render/streaming

Coding Workspace
  → project/files inspection
  → SevenGitHubSelfDev
  → GitHub API / Actions
  → tests/build evidence
  → accept/reject

Self-Development
  → evaluator/diagnosis
  → Coding verification path
  → benchmark/evidence
  → accept/reject

RPG Workspace
  → RPG state kernel
  → World runtime + Canon simulator
  → bounded context projection
  → public Memory interface
  → Model
  → validated state transition/persistence

Release
  → build-release
  → dist/static audit/release verification
  → Capacitor Android generation
  → Gradle lint/unit/APK
  → Android WebView device tests

## Shared-State / Concurrency Hotspots
- generation/abort/streaming state has legacy global ownership and needs per-request/per-room proof;
- active workspace can influence model/RPG behavior and must never contaminate another room;
- RPG state/canon/world work is moving from page-global UI state toward a structured state kernel;
- execution/run ledgers are shared persisted infrastructure and require integrity, retention and terminal-state rules;
- multiple specialist chats can write main, so shared edits must be based on current HEAD and CI evaluated on the final SHA.

## Duplicate / Parallel Implementation Risks
The repository intentionally contains raw source plus release-injected runtimes and archived snapshots. Parallel shell/workspace/runtime variants are not automatically defects, but every shipped path must have one authoritative owner. Build-path verification is required before deleting or merging variants.

## Contract Audit

| Contract | Status | Evidence / Gap |
|---|---|---|
| Model abstraction/routing | PARTIAL | routing/eval coverage exists; request/room isolation and provider failure normalization still need full E2E proof |
| Memory | PARTIAL | scope hardening and context isolation exist; cross-system update/conflict/long-session scenarios remain |
| Tool layer | PARTIAL | registry, schema, permission and execution gate exist; native cancellation/retry/error normalization incomplete |
| Execution lifecycle | PASS for tested core | explicit transitions, evidence gate, side-effect ledger; integration suite covers core path |
| Execution checkpoints | PASS for v2 tested core | identity + checksum + bounded retention; cryptographic authenticity is out of scope |
| Coding | PARTIAL | GitHub Self-Dev and verification surfaces exist; full inspect→patch→CI→repair scenario must be rerun |
| Self-Development | PARTIAL | architecture/boundary exists; must prove it cannot bypass Coding/evaluation protections |
| Research/Web | PARTIAL | freshness/evidence/citation tests are broad; network loss/rate-limit/timeout cross-system behavior needs E2E |
| RPG | PARTIAL / active | World/Canon/state kernel exist; persistence + memory + prompt + room isolation not yet acceptance-ready |
| Cancellation | PARTIAL | immediate stop shim fixed; full request/room-scoped cancellation not yet proven |
| Error taxonomy | MISSING/PARTIAL | canonical contract defined; legacy implementation normalization remains |
| Observability | PARTIAL | diagnostics exist in subsystems; no complete trace-ID/request-lifecycle proof yet |
| Android | PARTIAL | strong workflow exists; final acceptance depends on latest successful build + API 34/36 device tests |

## First Repair Batch

| Item | Severity | Root cause | Fix | Regression evidence |
|---|---|---|---|---|
| Execution checkpoint restore | HIGH | restore lacked identity/integrity validation; retention unbounded | checkpoint v2 identity/checksum + fail-closed restore + bounded retention | integration-contract suite |
| Canon chronology audit | HIGH | chronology returned constant PASS | ledger monotonic-position audit | integration-contract suite |
| Stop shim Android/web divergence | CRITICAL/HIGH family | stop flag/global divergence and Android nulled controller | safe flag update + universal abort + fallback | integration/release tests; broader scoping remains open |
| Master docs drift | MEDIUM process risk | registry/status lagged implementation | registry/contracts/decisions/status updated | source-of-truth review |
| Hot-layer regression | HIGH release blocker | checkpoint hardening pushed hot runtime above budget | compact implementation, retain budget | static audit on final SHA |

## Failure Injection Covered in Batch 01
- invalid/out-of-scope tool path → blocked;
- terminal cancellation + late event → rejected;
- tampered checkpoint snapshot → integrity validation fails;
- wrong chat/workspace context → evicted;
- RPG chronology regression → detected;
- model-authored player action → blocked by agency lock.

Still required: malformed provider JSON, rate limits, network loss, tool/native crash, partial writes, stale migrations, simultaneous file operations, app restart during active operations and rapid multi-room generations.

## Integration Scorecard

| System | Functional | Integrated | Tested | Regression Safe | Performance | Status |
|---|---:|---:|---:|---:|---:|---|
| Chat Core | 85 | 65 | 80 | 70 | 75 | PARTIAL |
| Model Routing | 85 | 70 | 80 | 70 | 80 | PARTIAL |
| Memory | 85 | 75 | 85 | 75 | 75 | PARTIAL |
| Web Research | 90 | 75 | 90 | 80 | 75 | PARTIAL |
| Tools/Execution | 90 | 85 | 85 | 85 | 80 | STRONG / not final |
| Coding | 80 | 65 | 70 | 65 | 65 | PARTIAL |
| Self-Development | 65 | 50 | 55 | 50 | 60 | PARTIAL |
| RPG | 70 | 45 | 60 | 50 | 65 | ACTIVE / PARTIAL |
| Android/APK | 80 | 70 | 75 | 70 | 70 | PENDING FINAL BUILD |
| Observability | 60 | 45 | 45 | 45 | 70 | GAP |

Scores are evidence-weighted estimates, not completion percentages. No subsystem receives 100 without complete acceptance evidence.

## Next Integration Order
1. Get green all.cjs on the final shared HEAD.
2. Get green Android build + API 34/36 device tests on the same relevant release code.
3. Reconcile new RPG state kernel with public Memory/context/persistence contracts.
4. Replace global generation state with request/room-scoped lifecycle and stress cancellation/switching.
5. Implement/normalize common error envelopes and retry policy.
6. Add trace/request IDs across model/tool/web/memory phases.
7. Add E2E scenarios A–J plus failure injection and long-session benchmarks.
8. Reconcile the master bughunt ledger and close only reproduced-and-verified defects.

## Integration Batch 02 — Repair and reconciliation

Implemented after the baseline:
- request-safe room/mode cancellation;
- provider-safe Deep Think system-message shaping;
- explicit Arabic IME composition lock;
- selected-model context budgeting + conservative Arabic token estimate;
- provider discovery timeout, fair-share fallback deadline and health/cooldown integration;
- GitHub token expiry/refresh, exact repository boundary and non-silent job-log cap;
- attachment loader retry + byte/type budgets;
- temporal citation metadata/hash;
- privacy-bounded request diagnostics/error taxonomy;
- link-state vs end-to-end reachability separation;
- RPG character-context compaction, deep snapshots, transactional pack loading, input budgets and incremental copy observer.

Evidence:
- Seven AI tests green on 7e320564c9c519283a5e93fb6c0b9a0343a16bcd.
- Seven AI tests green on 6f5063d61526880542107c825d2f48c64715e46f.
- Reality Lab green on 428f5fd027c2203aa03808e782a1a0367d58a583.
- Static startup gate observed at 98,775 / 100,000 bytes.

### Updated scorecard

| System | Functional | Integrated | Tested | Regression Safe | Performance | Status |
|---|---:|---:|---:|---:|---:|---|
| Chat Core | 92 | 88 | 92 | 88 | 82 | STRONG / RC validation |
| Model Routing | 92 | 88 | 92 | 88 | 85 | STRONG / RC validation |
| Memory | 90 | 84 | 90 | 86 | 78 | STRONG / long-session debt |
| Web Research | 94 | 90 | 94 | 90 | 80 | STRONG |
| Tools/Execution | 94 | 92 | 92 | 92 | 82 | STRONG |
| Coding/Self-Dev | 86 | 78 | 82 | 78 | 72 | PARTIAL — repo enforcement/workflow isolation |
| RPG | 84 | 66 | 84 | 76 | 76 | PARTIAL — live session unification open |
| Android/APK | 88 | 82 | 84 | 82 | 76 | PENDING latest device gate |
| Observability | 82 | 78 | 82 | 78 | 78 | IMPLEMENTED core trace/error layer |

These are evidence-weighted maturity scores, not completion percentages.

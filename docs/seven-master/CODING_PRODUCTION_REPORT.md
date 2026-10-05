# Coding Production Report

Status: READY FOR MASTER REVIEW — production-hardening branch is exact-SHA CI green; product write integration is intentionally not claimed.

## Reality audit
- Root `release/workspaces/coding.js` is deliberately read-only for project import/map/preview/context plus chat execution. It does not expose authoritative repository writes or shell execution.
- Root `release/github-self-dev.js` contains real GitHub repository tree/read, atomic Git commit, workflow dispatch/wait, PR and merge primitives. These currently belong to the Self-Development surface and expose low-level WebView primitives; Coding must not silently bypass its own verification gate through them.
- `coding-system-v1` contains a substantially richer Typed/Remake implementation but is highly divergent from main. No blind merge is permitted.
- Specialist-branch presence is not APK/product integration evidence.

## Implemented on chat3-coding-production
### Transaction kernel
`release/coding-production-runtime.cjs`
- Understand → Inspect → Plan → Edit → Test → Diagnose → Repair → Retest → Review → Verify → Commit/Propose.
- exact base SHA before edit;
- stale-plan and concurrent-repair rejection;
- changed candidate SHA required (no no-op candidate evidence);
- protected evaluator/test/workflow paths rejected;
- bounded repair loop (0..3);
- undeclared files in authoritative diff reject the candidate;
- SHA-256 diff digest;
- proposal only after explicit verification and final candidate freshness check;
- immutable evidence envelope.

### Test selection
`release/coding-test-selector.cjs`
- deterministic touched-file rules;
- escalates release/workspace, Android, RPG/canon/world, Memory and GitHub/Coding changes to relevant suites;
- all Coding hardening suites are mandatory and cannot be dropped by model planning.

### GitHub adapter
`release/coding-github-adapter.cjs`
- repository snapshot/tree inspection;
- bounded file reads;
- exact base-SHA check immediately before atomic write;
- dispatches CI and requires an exact-SHA waiter;
- fails closed if exact CI evidence, diff, verification or proposal ports are unavailable.

### Verified proposal policy
`release/coding-proposal-policy.cjs`
- refuses proposal without test evidence and a 64-character diff digest;
- rechecks live branch head equals candidate SHA;
- requires exact candidate CI to be completed/success;
- forbids proposing from the base branch itself;
- emits proposal evidence bound to candidate SHA and CI run id;
- is wired as the default GitHub Coding proposal path when the required authoritative ports exist.

### Deterministic E2E fixture
`release/coding-fixture-e2e.test.cjs`
Exercises a known bug:
Issue → inspect → deliberately wrong first patch → failing test → diagnose → repair → retest → review → verify → verified proposal.
This proves orchestration semantics in a deterministic fixture; it is not a claim of live GitHub CI success.

## Tests added
- `release/coding-production-runtime.test.cjs`: repair flow, protected path, stale plan, no-op candidate SHA, undeclared diff.
- `release/coding-test-selector.test.cjs`: domain escalation, traversal rejection, mandatory gates.
- `release/coding-github-adapter.test.cjs`: snapshot/read/atomic write/exact-CI binding/stale-write/fail-closed waiter.
- `release/coding-fixture-e2e.test.cjs`: first-failure → repair → retest → verify E2E fixture.
- `release/coding-proposal-policy.test.cjs`: stale candidate, red CI, missing evidence and same-base rejection.

All files match `release/*.test.cjs`, so root `all.cjs` discovers them automatically.

## Capability matrix
| Capability | Root product truth | This branch |
|---|---|---|
| Project import/map/read | Real | preserved |
| GitHub tree/read | Exists in Self-Dev | adapter-bound |
| Multi-file atomic commit | Exists in Self-Dev | adapter-bound + SHA gate |
| Touched-file test selection | missing as Coding authority | implemented |
| Diagnose/repair orchestration | Self-Dev-specific | generic bounded kernel |
| Exact candidate verification | fragmented | required by kernel |
| Undeclared diff rejection | not Coding-owned | implemented |
| Live Coding UI write action | absent | intentionally not claimed |
| Exact CI run on this branch | n/a | #3436 SUCCESS on `35d45e7d7909f90ce5f0411d04ad0f42ca25c1ae` |
| APK exposure | not established | not claimed |

## CI evidence boundary
- Proven current checkpoint: `35d45e7d7909f90ce5f0411d04ad0f42ca25c1ae`.
- Seven AI tests run #3436 / id `37305575484` completed with **SUCCESS** on that exact SHA.
- Job `111748397648`: `node all.cjs` SUCCESS; browser evidence gate SUCCESS; verified release artifact upload SUCCESS.
- Artifact `seven-ai-release` id `11343526406` is bound to the same head SHA with digest `sha256:fe49878aeb9ba80aade323ba2f39630d4eb12bb3561e5230227ce5ece9f57f78`.
- Earlier #3390 failure and #3424 authoritative-diff fixture regression were diagnosed and repaired without weakening the gates. Superseded runs were not counted as green evidence.

## Security/cross-system finding
`release/github-self-dev.js` exports low-level GitHub mutation primitives to the WebView. Chat 3 does not change that cross-system contract. Tools/Self-Development owner and Master should decide whether those primitives require a narrower capability token/native enforcement. Coding integration must use the verified transaction path and must not call merge directly.

## Remaining risks / next exact actions
1. Preserve exact-SHA checkpoint `35d45e7...` as the reviewed Coding hardening baseline; do not inherit its green status across later commits.
2. Authoritative proposal policy is now implemented and adapter-bound; integration still needs the concrete product GitHub API ports to supply exact CI/diff evidence.
3. Integration follow-up: add explicit RESEARCH state/port, deletion semantics, and a real isolated GitHub fixture/worktree benchmark; each requires a fresh exact-SHA CI cycle.
4. Expose a product-facing Coding action only after 1–3 are green; keep current read-only UI truth boundary until then.
5. Run root full suite plus release/browser gates; then assess Android packaging exposure.
6. Send branch/SHA/tests/CI/risks/dependencies to Master and request integration review.

No integration contract was silently changed. No main merge was performed. No “0 bugs” claim is made.

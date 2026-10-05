# Coding Production Report

Status: PARTIAL — production-hardening branch, not approved for integration yet.

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
| Exact CI run on this branch | no evidence yet | BLOCKER |
| APK exposure | not established | not claimed |

## CI evidence boundary
- Run #3390 / id 37304278803 executed the branch and failed in `node all.cjs`.
- The logs proved `coding-fixture-e2e.test.cjs` PASS and `coding-github-adapter.test.cjs` PASS before the failure.
- Root cause was a literal escaped `\\n` accidentally written into `coding-production-runtime.test.cjs`, producing a JavaScript SyntaxError. The test was repaired in commit `7d802ae46226d9248a741e5e7b2a19e6bbd29e84`; no test was weakened or removed.
- After additional authoritative-diff/live-SHA hardening, run #3399 / id 37304526837 was created for `8655dd4bd306485a1e3a41da8d581f5999cbf0e6` but was cancelled before jobs because a newer PR head superseded it. Run #3400 / id 37304564057 then started for `6636ac0aae57129d1444fd11c8d882948d940428`; subsequent proposal-policy commits superseded that head as development continued.
Therefore CI green is still **not** claimed until #3399 completes successfully.

## Security/cross-system finding
`release/github-self-dev.js` exports low-level GitHub mutation primitives to the WebView. Chat 3 does not change that cross-system contract. Tools/Self-Development owner and Master should decide whether those primitives require a narrower capability token/native enforcement. Coding integration must use the verified transaction path and must not call merge directly.

## Remaining risks / next exact actions
1. Obtain exact-SHA CI execution for this branch; repair every failure without weakening tests.
2. Authoritative proposal policy is now implemented and adapter-bound; integration still needs the concrete product GitHub API ports to supply exact CI/diff evidence.
3. Add a real isolated GitHub fixture/worktree benchmark (not production main) and retain its SHA/run evidence.
4. Expose a product-facing Coding action only after 1–3 are green; keep current read-only UI truth boundary until then.
5. Run root full suite plus release/browser gates; then assess Android packaging exposure.
6. Send branch/SHA/tests/CI/risks/dependencies to Master and request integration review.

No integration contract was silently changed. No main merge was performed. No “0 bugs” claim is made.

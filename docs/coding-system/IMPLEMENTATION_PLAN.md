# Seven Coding System — Implementation Plan / Completion Record

Date: 2026-10-05
Verified code-bearing SHA: `371db3e45aea21fd1f0d191ff88542d64c914490`
PR: #104
Rule: code presence is not completion; phase status below is evidence-based.

## Phase status

| Phase | Status | Evidence / implementation |
|---|---|---|
| 0 — Research + repo audit | COMPLETE | Current agent architectures + Seven gap analysis documented. |
| 1 — Coding Kernel / Workspace Truth | COMPLETE | Exact SHA/snapshot/file fingerprints, lifecycle, patch transaction, rollback, path/critical authority and blast-radius gates. |
| 2 — Repository Intelligence | COMPLETE for V1 | Bounded discovery, language/build/test/instruction detection, symbol/import extraction and relevance-ranked repo map. Parser-depth/tree-sitter expansion remains optional V2 work. |
| 3 — Repository Adapter | COMPLETE for GitHub V1 | Exact tree/blob reads, stale-head checks, atomic Git commit, non-force branch update, post-commit verification and Tool Fabric mediation. |
| 4 — Execution Sandbox | COMPLETE by isolated CI design | V1 deliberately does not expose arbitrary model shell. Mandatory commands execute through isolated GitHub Actions with bounded known command mapping, cancellation/timeouts and evidence. A future local shell tool requires a separate security review. |
| 5 — Repository Planner | COMPLETE | Structured model proposal is rebound deterministically to exact inspected source hashes before mutation. |
| 6 — Verification Engine | COMPLETE | Policy-owned mandatory gates, output evidence hashes, Git diff check, Remake typecheck/tests/build and release escalation. |
| 7 — Debug / Repair Loop | COMPLETE | Bounded diagnose → re-inspect → repair → reverify loop with attempt limits and fail-closed terminal states. |
| 8 — Diff Review + Independent Review | COMPLETE for V1 | Test-disable/assertion/typecheck/lint bypass checks plus independently routable read-only reviewer. |
| 9 — Git Completion + Documentation | COMPLETE | Atomic exact-base Git commits, freshness/post-content checks, evidence lifecycle and current documentation. |
| 10 — Product Runtime Integration | BACKEND COMPLETE / UI HANDOFF | GitHub runtime factory, ModelRouter, ResearchService and Tool Fabric integration are complete. Final user-facing Coding workspace/progress UI belongs to Android/APK/UI. |
| 11 — Evaluation Campaign | V1 GATES COMPLETE / BROADER BENCHMARKS ITERATIVE | Adversarial stale-state, mutation authority, repair, routing, replay and Android release tests pass. SWE-style larger benchmark corpus remains iterative quality work, not a runtime blocker. |
| 12 — Self-Development handoff | MERGED / INTEGRATION HANDOFF READY | PR #104 is merged into `seven-remake-v3`; Self-Development may consume this path only after Integration accepts the product-level reconciliation. |

## V1 safety invariants

1. Every mutation is tied to an exact Git base SHA and exact inspected file hashes.
2. Repository drift invalidates the plan; no last-write-wins behavior.
3. Model output cannot grant capabilities, approvals, critical-path authority or remove mandatory tests.
4. Repository mutation flows through ToolRegistry / ToolExecutor.
5. A repeated identical commit is replay-safe.
6. A side effect with uncertain outcome becomes BLOCKED and requires reconciliation.
7. External cancellation propagates into ToolExecutor/TaskManager.
8. Verification PASS requires recorded successful execution, not model prose.
9. Independent review cannot approve failed verification.
10. Critical evaluator/workflow/contract paths require authority outside the model.
11. Coding uses shared ModelRouter/ProviderHealthTracker rather than a private provider stack.
12. Research/tool/repository content is treated as untrusted data, not executable policy.

## V1 verification

All three top-level gates succeeded on the same code-bearing SHA:

- **Seven Remake V3 CI #407 — SUCCESS**
  - production dependency audit
  - full dependency audit
  - strict TypeScript
  - Vitest
  - production build
- **Seven AI tests #3239 — SUCCESS**
  - `node all.cjs`
  - verified release artifact
- **Seven Remake Android Release Gate #173 — SUCCESS**
  - strict Remake compile/tests/build
  - deterministic payload identity
  - Android lint + unit tests + APK build
  - APK embedded release identity
  - installed Android 14 connected smoke
  - installed Android 16 connected smoke

## Non-blocking follow-up owned outside Coding V1

- Reconcile the merged typed Remake Coding runtime with the currently released root/main product under Integration / Release Manager ownership.
- Final user-facing Coding UI/evidence viewer/approval UX.
- Live provider + connected GitHub canary when production credentials and explicit mutation approval are available.
- Larger benchmark corpora and parser-depth improvements.
- Self-Development adoption only after Integration accepts the merged Coding runtime.

No zero-bugs claim is made. V1 status means no known reproducible blocker remains in the specialist verification scope above.


## Post-merge branch verification

PR #104 was squash-merged into `seven-remake-v3` as:
`42ff64c01074cff0d9358ba58ec6a0a316b83316`

Verification on that exact merge SHA:
- Seven Remake V3 CI #428 / run 37263362539 — **SUCCESS**.
- Seven Remake Android Release Gate #194 / run 37263362532 — **SUCCESS**, including APK build/identity, Android 14 installed smoke and Android 16 installed smoke.

The earlier code-bearing specialist SHA `371db3e45aea21fd1f0d191ff88542d64c914490` also passed Seven AI tests #3239 / run 37260125250. No runtime code changed between that verified candidate and the documentation closeout that was merged.

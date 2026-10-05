# Seven AI — Self-Development → Coding System Handoff Contract

Status: REQUIRED FOR PRODUCTION INTEGRATION
Owner boundary: Chat 4 consumes; Chat 3 implements the production adapter.
Authority: `evolution/coding-candidate.cjs` defines the currently tested adapter shape. This document does not grant permission to bypass Seven runtime authorization, candidate isolation, or evaluation gates.

## Required adapter surface

A production Coding adapter supplied to `runCodingCandidate` MUST implement:

1. `getStableHeadSha()`
2. `prepareCandidate({ experiment, baselineSha, allowedPaths })`
3. `reproduce({ experiment, baselineSha, workspaceId })`
4. `repair({ experiment, baselineSha, workspaceId, attempt, reproduction })`
5. `review({ experiment, baselineSha, workspaceId, attempt, changedPaths, repair })`
6. `regression({ experiment, baselineSha, workspaceId, attempt, changedPaths, review })`
7. `getChangedPaths({ experiment, baselineSha, workspaceId })`
8. `getCandidateSha({ experiment, baselineSha, workspaceId })`
9. `discardCandidate({ experiment, workspaceId, reason })`
10. `restoreStable({ baselineSha, reason })`

## Mandatory invariants

- Stable/main is not the candidate workspace.
- `prepareCandidate` returns `{ isolated:true, baselineSha, workspaceId }` only after isolation is real.
- Stable HEAD must remain equal to baseline throughout prepare/reproduce/repair/review/regression/finalize. Drift triggers restore/reject; failed restoration halts.
- Changed paths are measured from the candidate, not accepted from model prose.
- Protected evaluator, Evolution, release verification and all `.github/` infrastructure remain outside autonomous candidate scope.
- Candidate SHA must be commit-like, differ from baseline and identify the exact candidate evaluated.
- Discard removes/invalidates the isolated candidate without mutating stable.
- No method may silently merge to main.
- Regression/review evidence must come from the Coding System/tooling, not candidate self-report.
- Cancellation, authorization and resource scope remain owned by the existing Seven execution/runtime gates.

## Required integration proof before Chat 4 can be READY FOR INTEGRATION

A real adapter test must prove:
1. baseline HEAD observed;
2. isolated workspace created;
3. reproducible issue observed;
4. candidate-only repair performed;
5. changed paths measured and allowed;
6. review + regression pass;
7. exact candidate SHA returned;
8. stable HEAD unchanged through candidate generation;
9. trusted eval bundle is bound to baseline/candidate SHA;
10. strict candidate > baseline metric gate;
11. promotion or rejection occurs;
12. post-promotion regression can roll back;
13. terminal result is durably recorded in Learning Archive;
14. identical failed hypothesis+baseline is blocked before a second Coding invocation.

## Current blocker

Repository evidence still describes Coding Runtime production wiring/platform shell-file bridge as partial. Chat 4 therefore must not invent a second production Coding implementation merely to close this dependency. Chat 3 should expose an adapter satisfying this contract; Chat 4 can then run the existing Self-Development acceptance pipeline against it.

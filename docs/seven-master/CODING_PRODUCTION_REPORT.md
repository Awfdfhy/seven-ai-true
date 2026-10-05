# Coding Production Report

Status: PARTIAL — first production-hardening batch

## Reality audit
- Root `release/workspaces/coding.js` is intentionally read-only: project import/map/context + chat execution are real, direct repository writes/shell are not wired there.
- Root `release/github-self-dev.js` has real GitHub branch/tree/read/atomic-commit/CI primitives and protected paths, but it belongs to the Self-Development surface rather than a cohesive Coding Agent transaction.
- `coding-system-v1` contains a much richer Typed/Remake coding runtime, but it diverges substantially from main. It must not be blind-merged.
- Therefore presence of specialist Coding code is not treated as APK integration evidence.

## Batch 1 implementation
Added a root-compatible, adapter-driven Coding transaction kernel:
Understand → Inspect → Plan → Edit → Test → Diagnose → Repair → Retest → Review → Verify → Commit/Propose.

Hard gates:
- exact base SHA before edit;
- stale-plan rejection;
- concurrent-edit rejection before repair;
- protected evaluator/test/workflow paths rejected;
- bounded repair loop (max 3);
- diff SHA-256 evidence;
- proposal only after explicit verification;
- immutable evidence envelope with base/result SHA, files, tests, failures, repairs and verdict.

## Evidence
`release/coding-production-runtime.test.cjs` exercises:
1. fixture failure on first test;
2. diagnosis + repair;
3. retest success;
4. verified proposal;
5. protected-test mutation rejection;
6. stale-plan rejection.

This is not yet full product E2E. The next batch must bind this kernel to real root GitHub/files/test adapters without importing the Typed Remake wholesale, then execute the isolated fixture repository/worktree benchmark.

## Remaining risks
- Root Coding Workspace still has no authoritative direct write/shell adapter.
- Real test selection is not yet bound to touched-file ownership.
- Exact GitHub CI evidence for this branch is pending.
- Android/APK exposure of the new kernel is not claimed.
- Specialist branch capability migration remains capability-by-capability.

## Cross-system dependencies
Tools/Files/Git adapters and Self-Development must call the verified Coding transaction rather than bypass it. No integration contract was changed in this batch.

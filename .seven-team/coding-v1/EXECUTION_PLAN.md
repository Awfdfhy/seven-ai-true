# Seven Coding System v1 — Execution Plan

## Phase 1 — Workspace Truth
RepositorySnapshot, exact SHA/branch/dirty fingerprint, protected paths, workspace lease, stale-plan invalidation.

## Phase 2 — Repo Intelligence
File inventory, symbol extraction, imports/exports, reference graph, test ownership, relevance-ranked repo map, incremental refresh.

## Phase 3 — Patch Transaction
PatchPlan, source-hash preconditions, bounded multi-file apply, diff-size/risk budget, rollback snapshot.

## Phase 4 — Test Selector
Touched-file checks, symbol-owned tests, dependency blast radius, security/package gates, Android/Reality escalation. Mandatory gates cannot be removed by the model.

## Phase 5 — Controller
UNDERSTAND → LOCALIZE → READ → PLAN → APPLY → TARGETED_VERIFY → DIFF_REVIEW → REGRESSION_VERIFY → INDEPENDENT_REVIEW → COMMIT_OR_ROLLBACK.

## Phase 6 — Evidence
Exact task/base/result SHA, repo-map revision, files read/changed, tests, failures/repairs, diff digest, reviewer verdict, rollback point.

## Phase 7 — Evaluation
Small bug, multi-file feature, stale-plan conflict, concurrent user edit, test weakening, protected-evaluator attack, dependency mutation, rollback failure, flaky test, generated-output drift, Android-facing patch, underspecified issue/abstention.

Promotion gates:
- 0 silent user-edit overwrite
- 0 protected evaluator mutation
- 0 commit after mandatory gate failure
- 100% stale-SHA rejection
- 100% rollback success in recovery corpus
- exact evidence provenance
- Android exact-build evidence for product-facing changes

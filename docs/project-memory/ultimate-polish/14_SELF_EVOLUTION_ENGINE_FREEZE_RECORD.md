# Seven AI — Capability 14 Self-Evolution Engine Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**
Implementation status: **Deferred / meaningful experiment foundations remain**

## Frozen target

**Seven Evolution Engine 3.0 — Governed Hypothesis-to-Promotion Improvement Laboratory**

## Prime law

> Exploration may be creative; promotion is conservative. Every self-improvement begins as a bounded experiment against an immutable baseline and can become canonical only through locked evaluations, independent verification, critical gates, staged rollout and proven rollback/recovery.

## Scope of this freeze

This freezes the self-evolution architecture. It does not claim that autonomous candidate search, all shadow/canary infrastructure, all rollback paths or every evolution adapter is already implemented.

## Final reconciled decisions

1. Self-evolution is a governed experiment laboratory, not unrestricted self-modification.
2. Evolution surfaces are classified from low-impact derived tuning through behavior config, component candidates and code changes to control-plane-critical surfaces.
3. Control-plane-critical surfaces are not autonomously mutable under ordinary evolution authority.
4. Opportunities originate from verified failures, bottlenecks, drift, research or explicit development goals.
5. Every experiment uses a versioned `ExperimentContract`.
6. Every experiment states a falsifiable hypothesis, baseline, bounded candidate search space, locked evals, critical gates, budgets and stop conditions.
7. Baselines are immutable inside an active experiment.
8. Candidate records preserve parentage, exact deltas, generator/operator identity, resources, evaluations and disposition.
9. Candidate lineage forms an archive/DAG rather than a mutable current-best blob.
10. Search operators are pluggable and bounded; simple deterministic/random search remains valid when sufficient.
11. Open-ended/evolutionary search is optional rather than the universal default.
12. Search operators cannot change the active acceptance contract or promotion gates.
13. Maintain a promoted champion plus a bounded diverse candidate/Pareto archive.
14. Replace one universal weighted score with typed multi-objective comparison plus critical gates.
15. Complexity/dependency/startup/storage/maintenance/security costs are explicit candidate costs.
16. Candidates use Capability 13 locked evaluations and Capability 12 independent verification.
17. Active candidates cannot mutate their own eval fixtures, graders, security policy, release gates or baseline identities.
18. Generalization/holdout checks are required according to evolution class/risk.
19. Shadow candidates have no canonical mutation authority.
20. Canary is selective, bounded, monitored and reversible when live validation is required.
21. Canonical promotion outcomes include `PROMOTE`, `PROMOTE_WITH_MONITORING`, `HOLD_FOR_MORE_EVIDENCE`, `REJECT`, `REVERT`, `NON_COMPARABLE`.
22. No candidate promotes itself.
23. Promotion is a separate authorized transaction with previous-champion and rollback refs.
24. Critical promotable changes require a credible recovery path.
25. Post-promotion monitoring can trigger rollback under defined conditions.
26. Experiment outcomes become durable lessons only through Memory Fabric admission rules.
27. Model/provider evolution remains exact-revision/date/eligibility bound.
28. Prompt/config/retrieval/tool evolution remains versioned and evaluated for resource/locale/authority regressions as applicable.
29. The Evolution Engine may propose changes to its own non-critical heuristics, but its control/promotion logic must be evaluated from a stable external version.
30. No continuous self-evolution loop consumes ordinary phone startup/background resources.

## Evolution surface classes

- `E0 SAFE_DERIVED_TUNING`
- `E1 BEHAVIOR_CONFIG`
- `E2 COMPONENT_CANDIDATE`
- `E3 CODE_CHANGE`
- `E4 CONTROL_PLANE_CRITICAL`

## Canonical objects

- `ImprovementOpportunity`
- `ExperimentContract`
- `EvolutionSurfacePolicy`
- `BaselineSnapshot`
- `CandidateRecord`
- `CandidateLineage`
- `SearchOperatorSpec`
- `CandidateArchive`
- `ParetoSnapshot`
- `ExperimentEvidenceBundle`
- `ShadowRunRecord`
- `CanaryPlan`
- `PromotionDecision`
- `PromotionTransaction`
- `RollbackPlan`
- `PostPromotionMonitor`
- `ExperimentOutcome`

## Canonical pipeline

`Opportunity -> ExperimentContract -> immutable baseline/eval lock -> bounded candidate search -> archive/Pareto analysis -> independent verification -> shadow -> optional canary -> PromotionDecision -> promotion transaction -> monitoring/rollback`

## Frozen invariants

1. Exploration and promotion authority are separate.
2. Experiments have falsifiable hypotheses and immutable baselines.
3. Candidate scope is explicit.
4. Active candidates cannot rewrite their own evaluation/promotion rules.
5. Promotion uses locked evals and independent verification.
6. Critical gates cannot be averaged away.
7. No one scalar score is canonical promotion truth.
8. Candidate lineage is preserved.
9. Generalization evidence scales with risk/evolution class.
10. Shadow has no canonical mutation authority.
11. Canary is bounded/reversible when required.
12. No candidate self-promotes.
13. Promotion is separately authorized.
14. Critical changes require credible rollback/recovery.
15. Evolution-engine control-plane changes require external stable evaluation.
16. Self-evolution adds approximately zero ordinary app startup/background cost.

## Mandatory eval families

- parameter/prompt/routing/retrieval candidates;
- component/code candidates;
- protected-surface exclusion;
- eval-lock integrity;
- scalar-score masking regression;
- holdout overfit detection;
- insufficient/non-comparable evidence;
- shadow divergence;
- canary rollback;
- rollback readiness;
- archive pruning/reproducibility;
- externally evaluated evolution-engine changes;
- phone startup/background resource impact.

## Implementation stages

- SE-P0 evolution policy/ExperimentContract 2.0
- SE-P1 baseline/candidate lineage/archive
- SE-P2 Capability 12/13 comparison integration
- SE-P3 bounded search-operator interface
- SE-P4 Pareto/complexity-tax comparison
- SE-P5 holdout/generalization/evidence bundle
- SE-P6 shadow orchestration
- SE-P7 canary/promotion transaction
- SE-P8 rollback/post-promotion monitoring
- SE-P9 evolution adapters
- SE-P10 external evaluator boundary for self-evolution logic
- SE-P11 long-run/overfit/rollback/measurement/resource gates

## Freeze decision

**FROZEN.**

No protected product source was modified. Architecture freeze is not implementation completion.

# Seven Polishing V5.15 — Statistical Selection Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.14 Decision Economics Integrity

V5.15 hardens improvement claims against selection effects created by testing many candidates, metrics, seeds, thresholds, environments, and stopping points.

## Prime law
The strongest observed result is not automatically the strongest true result. Selection history is part of the evidence.

## Requirements
1. Candidate-count ledger: record how many materially distinct candidates were compared before selecting a winner.
2. Metric-count ledger: record how many metrics, slices and derived summaries could influence the decision.
3. Selection-aware confidence: promotion evidence accounts for the fact that the winner was selected after comparison rather than evaluated in isolation.
4. Fresh confirmation: important winning candidates receive fresh confirmatory evaluation not used to select them.
5. Winner's-curse check: compare selection-stage estimates with fresh confirmation and record shrinkage.
6. Precommit primary criteria: define primary decision criteria before final results are interpreted. Secondary exploration remains visible but cannot silently become the primary proof after results are known.
7. Multiple-comparison discipline: when many comparable hypotheses are tested, use an appropriate correction, hierarchical decision rule, or fresh holdout confirmation instead of treating every nominal PASS as independent.
8. Paired/block evaluation: incumbent and candidate share matched tasks, seeds, environment classes and budgets where practical, reducing avoidable noise.
9. Order randomization: evaluation order is randomized or counterbalanced when order, cache, fatigue, warm state or temporal effects can bias comparison.
10. Sequential-stopping contract: repeated peeking does not create arbitrary early victory. Stopping rules are fixed before interpreting the final comparison.
11. Minimum detectable materiality: evaluation design states what size of regression or gain it has enough resolution to detect. Inconclusive evidence is not converted into equality.
12. Replication independence: confirmation differs materially in seed/case/time/environment/evaluator source when the claim depends on generalization.
13. Slice discovery separation: slices discovered because they look unusually good or bad are exploratory until independently rechecked.
14. Null-result preservation: failed and neutral candidates remain in the campaign ledger so selection history cannot disappear.
15. Tournament-depth penalty: deeper candidate tournaments demand stronger confirmation because the probability of an accidental extreme increases with search breadth.
16. Adaptive-search disclosure: if later candidates were designed after seeing earlier results, record that dependence instead of treating them as independent draws.
17. Benchmark reuse age: repeated reuse of the same evaluation surface increases evidence debt and eventually requires rotation or fresh tasks.
18. Practical-significance gate: statistically detectable tiny gains do not consume a recursive step-change slot unless they meet materiality/criticality requirements.
19. Critical-regression asymmetry: C0/C1 regressions remain blocking even when aggregate statistics look favorable.
20. Claim scope: statistical support applies only to the population, environments and assumptions represented by the evaluation design.

## Saturation
V5.14 is NOT saturated. V5.15 resets saturation to 0/2. Saturation cannot begin while post-selection effects or confirmation independence remain unresolved.

## Truth boundary
Architecture only. No multiple-testing engine, confirmatory runner, paired-trial harness or power-analysis runtime is claimed implemented.
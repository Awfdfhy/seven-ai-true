# Seven Polishing V5.9 — Proof Selector Adversarialization

Status: ARCHITECTURE_CANDIDATE
Parent: V5.8 Minimal Sufficient Proof

V5.9 attacks the evaluator-selection layer itself. V5.8 can fail if its ProofGraph, selector, simplifier, stop rule, or evidence-pruning logic becomes the blind spot that removes the very checks needed to discover a defect.

## Prime law
No mechanism that chooses what evidence to run, omit, reuse, compress, or stop may be trusted solely by the same evidence it selects.

## New architecture
1. Selector red team: an independent challenger attempts to construct defects the current selector would skip.
2. Selector shadow mode: periodically compare selected proof against a broader reference run on fresh cases.
3. Miss ledger: every defect found only by the broad/reference path becomes permanent training evidence for selector validation.
4. Coverage budget floor: proof minimization may not reduce protected failure-family diversity below a precommitted floor.
5. Diversity reservation: preserve structurally different evaluators even when one appears dominated, until dominance is demonstrated across failure families and environments.
6. Omission proof: skipping a gate requires positive evidence of redundancy or irrelevance, not absence of known failures.
7. Compression reversibility: retain lineage needed to reconstruct which distinct evidence items were compressed.
8. Selector calibration suite: known defects, equivalent candidates, improvements, and deceptive metric wins test the selector itself.
9. Stop-rule red team: a challenger tries to demonstrate premature stopping caused by weak search diversity, stale evidence, selector blindness, or over-high materiality thresholds.
10. Saturation holdout: at least one challenger/evidence family is withheld from iterative tuning and used only for saturation decisions.
11. Evaluation-awareness check: record whether the candidate can infer benchmark identity, grading logic, or hidden task structure from the environment.
12. Grader-gaming review: successful trajectories are inspected for cases where scoring success diverges from task intent.
13. Elicitation parity: candidate/incumbent comparisons bind harness, tool access, retries, budget, prompts, safeguards, and environment versions unless the difference is the tested change.
14. Effort accounting: tokens, turns, attempts, wall time, tool calls, and external-data access are explicit comparison inputs.
15. Stability strata: stochastic results are reported by task/scenario family instead of one aggregate that can hide fragile regions.
16. Family calibration: evaluator precision/recall or equivalent detection evidence is tracked by failure family when feasible, not only globally.
17. Proof provenance lock: any evidence reused from an earlier generation must show compatibility with current subject, evaluator, environment, dependency versions, and constitution epoch.
18. Selector rollback: if broad/reference audits find material misses, revert to the last selector configuration that retained adequate detection coverage.
19. Governance circuit breaker: repeated selector misses suspend proof minimization and force broad evaluation until recalibrated.
20. Meta-simplifier duel: the simplifier itself faces an independent challenger attempting to prove that a deleted gate protected a unique failure class.

## Research-informed validity requirements
Agent evaluations can be invalidated by solution contamination or grader gaming, so transcript/state review and benchmark-specific affordance rules become explicit validity checks. Tool usefulness in isolation cannot substitute for realized agent utility. Evaluation reports must bind the tested system, harness, budgets, elicitation method, and validity checks closely enough to support the claim scope.

## Saturation
V5.9 starts at 0/2. A NO_MATERIAL_IMPROVEMENT result does not count unless the saturation holdout, selector red team, and stop-rule red team all participate without changing the constitution after results are seen.

## Truth boundary
Architecture only. No claim is made that selector shadowing, broad reference runs, saturation holdouts, transcript review, or circuit-breaker automation are implemented.
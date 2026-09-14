# Seven Polishing V5.12 — Decision Robustness

Status: ARCHITECTURE_CANDIDATE
Parent: V5.11 Diversity Review

V5.12 addresses a weakness in diversity-based evaluation: multiple review paths can still produce fragile decisions if disagreement handling, reviewer competence, evidence weighting, or review independence are poorly calibrated.

## Core rule
Diversity is useful only when it improves decision quality. Review diversity must itself demonstrate value.

## Requirements
1. Diversity value test: a new review path must show distinct useful detection or decision value, not merely different wording.
2. Reviewer calibration: each important review path is tested on known-good, known-bad, ambiguous, equivalent, and simplified cases where practical.
3. Dissent quality: disagreements are classified by evidence strength, affected claim scope, and whether they expose a unique failure family.
4. Noise ceiling: a review path that creates persistent unresolved noise without unique detection value can be demoted or retired.
5. Decision sensitivity: record whether a promotion verdict changes materially when one correlated evidence channel is removed.
6. Weight transparency: no hidden weighting of reviewers, metrics, or evidence families. Material weighting rules are fixed before final interpretation.
7. Independence is graded: evaluator independence is described across model, prompt, data, tool, scenario, implementation, and organizational assumptions rather than as a binary label.
8. Shared-premise audit: reviewers must list critical premises they share. High overlap lowers the maximum independence claim.
9. Conflict resolution protocol: material conflicts cannot be resolved by majority vote alone; resolve through stronger evidence, narrower claims, or explicit uncertainty.
10. Reviewer drift: evaluator behavior/version changes can stale calibration evidence.
11. Review reproducibility: independent reviewers should be able to reconstruct the decision record from preserved evidence and rules.
12. Verdict stability: important decisions are stress-tested under reasonable perturbations of noncritical thresholds or evidence ordering. Fragile verdicts receive narrower confidence.
13. Scope-localized dissent: disagreement on one claim cannot automatically invalidate unrelated supported claims.
14. Minority-preservation rule: a single well-supported contradictory channel can block a broad claim even when many correlated channels agree.
15. Review cost accounting: additional review depth must justify its cost by unique coverage, calibration, or reduction in decision uncertainty.
16. Retirement rule: redundant review channels may be removed only after demonstrating preserved failure coverage and decision stability.

## Saturation
V5.11 is NOT saturated. V5.12 resets saturation to 0/2 because the evaluation constitution changes materially.

## Truth boundary
Architecture only. No runtime reviewer-calibration or decision-robustness harness is claimed implemented.
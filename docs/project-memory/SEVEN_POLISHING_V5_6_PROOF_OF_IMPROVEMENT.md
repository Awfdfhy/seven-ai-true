# Seven Polishing V5.6 — Proof of Improvement

Status: ARCHITECTURE_CANDIDATE
Parent: V5.5 Systems Proof

V5.6 attacks a deeper failure: a candidate can survive many tests yet still lack convincing evidence that the candidate itself caused the improvement, that the gain will persist, or that the testing process has enough power to detect meaningful regressions.

## Core rule
Promotion requires evidence not only of success, but of attributable, durable, detectable improvement over a fair incumbent.

## New gates
1. Paired evaluation: incumbent and candidate face matched cases, environments, budgets and evaluator versions whenever practical.
2. Counterfactual baseline: compare candidate against unchanged incumbent, simpler alternative and relevant ablations.
3. Change attribution: map each claimed gain to the smallest responsible change set; unexplained gains remain weaker evidence.
4. Regression sensitivity: seed known defects or controlled degradations to confirm the evaluation stack can detect failures it claims to guard against.
5. Detection-power ledger: record which defect families each gate can and cannot reliably detect.
6. False-positive controls: known-equivalent candidates should not routinely be promoted as improvements.
7. False-negative controls: known-material improvements should not routinely be rejected by noisy or miscalibrated gates.
8. Persistence test: re-evaluate important gains after fresh sessions, changed seeds, rotated cases or later checkpoints to detect fragile wins.
9. Cross-context transfer: validate gains outside the exact development scenario before broad capability claims.
10. Mechanism consistency: when a claimed mechanism predicts specific behavior, test those predictions. A score increase with contradictory mechanism evidence weakens attribution.
11. Evidence independence audit: shared data, prompts, models, tools or assumptions between Builder and Judge are recorded as dependence, not hidden.
12. Missing-evidence penalty: absence of required evidence cannot be converted into a neutral score; it limits the maximum verdict.
13. Claim minimization: Promotion Gate emits the narrowest claim supported by evidence, preventing local gains from inflating into global claims.
14. Durability budget: improvements that require excessive maintenance, repeated manual tuning or fragile environment assumptions pay an explicit durability cost.
15. Reversal test: remove or disable the proposed improvement where feasible; the claimed benefit should diminish in the predicted direction.
16. Alternative-explanation challenge: Challenger must propose credible non-improvement explanations for observed gains and attempt to discriminate among them.
17. Test-suite mutation: modify non-semantic surface details to check whether success depends on incidental benchmark structure.
18. Coverage frontier: explicitly list important untested regions. Saturation cannot silently convert uncovered regions into evidence of absence.
19. Proof compression: redundant evidence may be compressed only when equivalence is demonstrated; compression must not erase distinct failure coverage.
20. Promotion confidence is categorical and evidence-scoped, never a fabricated universal percentage.

## Saturation rule
V5.6 cannot begin a saturation count until detection-power and false-positive/false-negative controls themselves pass architecture review. Two independent consecutive NO_MATERIAL_IMPROVEMENT challenges remain required under a fixed constitution.

## Truth boundary
Architecture only. No claim is made that paired-evaluation runners, mutation harnesses, causal attribution tooling or durability tests are implemented.
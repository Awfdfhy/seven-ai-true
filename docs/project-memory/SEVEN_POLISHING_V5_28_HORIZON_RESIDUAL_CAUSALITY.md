# Seven Polishing V5.28 — Horizon Residual Causality

Status: ARCHITECTURE_CANDIDATE
Parent: V5.27 Partial Progress Integrity

V5.28 prevents ordinary stage-level error accumulation from being mislabeled as a special long-horizon degradation mechanism.

## Prime law
A long-horizon penalty should be claimed only after accounting for the reliability expected from its component stages.

## Requirements
1. Matched Stage Baseline: estimate expected full-path reliability from matched short-stage performance where valid.
2. Residual Definition: define horizon residual as the gap between observed full-trajectory behavior and the stage-composition baseline.
3. Harder-Stage Control: distinguish tasks that become long because they contain harder decisions from tasks that become harder because execution history accumulates.
4. Context-Regime Control: separate effects of visible context size, context management, persistent state, and dependency depth.
5. History Intervention: where practical, compare full-history execution against reconstructed or checkpointed state that preserves task truth while changing accumulated history.
6. State-Accumulation Test: inspect whether noisy observations, summaries, assumptions, pending work, or stale constraints increasingly distort later decisions.
7. Dependency Accumulation: measure whether unresolved assumptions or earlier branch choices make later stages harder beyond ordinary per-stage reliability.
8. Recovery-Length Effect: evaluate whether recovery becomes materially less reliable as the distance from the originating issue grows.
9. Path-Matched Comparison: compare trajectories with similar stage difficulty but different accumulated history when possible.
10. Residual Uncertainty: if the baseline is weak, the system reports the residual as uncertain rather than inventing a causal explanation.
11. Mechanism-Specific Claims: labels such as context degradation, state drift, or trajectory-induced degradation require mechanism-specific evidence.
12. Cross-Domain Replication: a horizon mechanism found in one domain is not assumed universal.
13. Counterfactual Simplification: test whether shorter equivalent plans remove the degradation without changing the goal.
14. Horizon Repair Evidence: a proposed fix must improve the residual mechanism it claims to address, not merely raise the final score.
15. Claim Ceiling: evidence of lower long-task performance alone supports only a horizon-associated effect, not a proven causal mechanism.

## Saturation
V5.27 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No residual estimator, checkpoint intervention runner, or causal horizon harness is claimed implemented.
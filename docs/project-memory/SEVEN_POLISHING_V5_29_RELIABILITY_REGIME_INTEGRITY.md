# Seven Polishing V5.29 — Reliability Regime Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.28 Horizon Residual Causality

V5.29 detects qualitative changes in reliability behavior that aggregate averages or smooth curves can hide.

## Prime law
A stable average cannot prove stable behavior across duration, variance, or operating regime.

## Requirements
1. Reliability Decay Profile: track repeated-run reliability across meaningful horizon buckets.
2. Variance Amplification: measure whether stochastic spread grows materially with task duration or complexity.
3. Graceful-Degradation Profile: distinguish smooth partial decline from abrupt loss of useful behavior.
4. Meltdown Boundary: identify the earliest horizon or condition where behavior becomes qualitatively unstable or nonproductive when such a boundary exists.
5. Capability-vs-Reliability Ranking: preserve separate rankings when a highly capable candidate is less consistent than another candidate.
6. Rank-Inversion Review: promotion decisions inspect whether candidate ordering changes materially at longer horizons.
7. Domain-Specific Regimes: regime boundaries are measured per domain rather than assumed universal.
8. Ambition Cost: strategies that achieve higher peaks but produce unstable long-tail behavior expose that tradeoff explicitly.
9. Repetition Depth: regime claims require enough repeated runs to distinguish stochastic fluctuation from structural change.
10. Threshold Sensitivity: reported regime boundaries are tested against nearby thresholds to avoid arbitrary cut points.
11. Recovery-Regime Effect: evaluate whether recovery delays, prevents, or merely masks reliability collapse.
12. Resource-Regime Interaction: low memory, storage, network, or battery conditions can shift the reliability regime and require separate evidence.
13. Context-Regime Interaction: context-management strategy changes are evaluated as possible regime shifts, not assumed improvements.
14. Tail Escalation: severe low-frequency behavior cannot be hidden by strong median performance.
15. Release Claim Ceiling: release reliability claims bind to the validated regime envelope, not the best observed horizon.

## Saturation
V5.28 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No reliability-regime detector, variance analyzer, or release reliability runtime is claimed implemented.
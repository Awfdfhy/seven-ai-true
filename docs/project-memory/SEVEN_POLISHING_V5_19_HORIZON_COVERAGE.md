# Seven Polishing V5.19 — Horizon Coverage

Status: ARCHITECTURE_CANDIDATE
Parent: V5.18 Long-Horizon Outcome Integrity

V5.19 strengthens long-workflow evaluation so claims reflect the workflow portions actually reached, the depth of dependencies, and the duration/state envelope actually observed.

## Prime law
A long-workflow claim is valid only inside the horizon structure that was actually evaluated.

## Requirements
1. Horizon Vector: record step count, dependency depth, wall-clock duration, state age, cross-session span, tool-call count and external-event count where relevant.
2. Capability Exposure Checkpoints: record whether a run actually reached the point where the claimed capability could be exercised.
3. Incomplete-Run Ledger: timeouts, early termination, environment loss, user cancellation and unreached checkpoints are preserved rather than silently dropped.
4. Pre-Exposure vs Post-Exposure Failure: separate failures that occur before the capability is available from failures after it is available.
5. Conditional Reliability Curves: report reliability by horizon/dependency strata when aggregate results would hide material differences.
6. Horizon-Matched Evaluation: benchmark horizon distribution should resemble the intended deployment envelope before broad claims.
7. Extrapolation Guard: do not extend reliability claims beyond observed horizons without a validated model and explicit uncertainty.
8. Dependency-Depth Stress: workflows with similar length but different dependency depth are evaluated separately.
9. State-Age Stress: old persisted state and long-lived sessions receive dedicated cases instead of fresh-state substitutes.
10. Cross-Session Continuity: evaluate handoff and recovery across session boundaries when continuity is claimed.
11. Checkpoint Intervention: where practical, controlled checkpoints help distinguish upstream observation/access failures from downstream reasoning/action failures.
12. Path Diversity: include branching, retry, recovery and alternate-route trajectories rather than only the happy path.
13. Horizon Reliability Budget: critical dependent stages receive explicit reliability expectations; one weak stage cannot hide inside an average.
14. Context-Regime Cross: long-horizon results are checked under relevant context-management regimes.
15. Completion-Bias Guard: completed runs are not treated as representative when related failures caused other runs to end earlier.
16. Incomplete Observation Semantics: partial runs are labeled as incomplete evidence unless the evaluation contract defines another valid interpretation.
17. First-Material-Degradation Record: preserve the earliest meaningful invariant failure or persistent degradation point when observable.
18. Horizon-Specific Regression Memory: deep-chain failures remain in the regression corpus even when short tests pass.

## Saturation
V5.18 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No horizon profiler, checkpoint harness or conditional-reliability runtime is claimed implemented.
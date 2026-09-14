# Seven Polishing V5.26 — Reliability Composition

Status: ARCHITECTURE_CANDIDATE
Parent: V5.25 Measurement Ownership Integrity

V5.26 treats end-to-end reliability as a composition problem across dependent stages rather than a single aggregate success rate.

## Prime law
A workflow can contain individually strong stages and still be weak end-to-end when small failure probabilities compound.

## Requirements
1. Stage Reliability Map: material workflows identify important stages and the reliability evidence available for each.
2. Path Reliability: evaluate reliability across complete dependency paths rather than averaging unrelated stages.
3. Weakest-Link Visibility: a low-reliability stage cannot disappear inside a high aggregate mean.
4. Dependency Depth: workflows of equal step count but different dependency depth are evaluated separately.
5. Conditional Reliability: downstream stage reliability is measured both overall and conditioned on valid upstream state where practical.
6. Error Propagation: record whether an early mistake is contained, corrected, or amplified by later stages.
7. Recovery Contribution: separate raw stage reliability from reliability after valid recovery mechanisms.
8. Repeated-Run Reliability: capability and reliability are reported separately when a system succeeds once but inconsistently across repeated runs.
9. Horizon Curves: reliability is tracked across increasing step/dependency horizons instead of only one task length.
10. Domain Stratification: long-horizon reliability is not assumed to transfer unchanged across coding, research, files, RPG, and other domains.
11. Tail Reliability: averages cannot compensate for severe long-tail collapse in important workflows.
12. Reliability Budget: critical workflows can allocate explicit reliability expectations to stages and recovery boundaries.
13. Composition Assumption Audit: independence assumptions are stated; correlated errors are not multiplied as if independent.
14. Interaction Terms: where stages influence one another, the combined behavior receives direct evaluation.
15. Long-Horizon Regression Memory: horizon-specific failures remain in the regression corpus even if short workflows pass.

## Saturation
V5.25 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No stage profiler, reliability estimator, or workflow reliability runtime is claimed implemented.
# Seven Polishing V5.24 — Benchmark Compression Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.23 Team Coordination

V5.24 prevents reduced evaluation sets from silently changing the meaning of the claim they support.

## Prime law
A reduced benchmark may preserve ranking without preserving calibrated absolute performance.

## Requirements
1. Compression Purpose: every reduced suite declares whether it is intended for ranking, regression detection, absolute score estimation, or release proof.
2. Rank-vs-Score Separation: rank fidelity and absolute-score fidelity are measured separately.
3. Distribution-Shift Check: reduced suites are tested across relevant scaffold, model, provider, temporal, and environment shifts.
4. Seed Variance: task-subset selection is evaluated across seeds or equivalent resampling where practical.
5. Difficulty Coverage: compression cannot silently eliminate hard/easy/rare task regions required by the claim.
6. Criticality Floor: C0/C1 cases are never removed merely because they contribute little to ranking power.
7. Regression Sentinel: rare historical failures remain represented even if statistically inefficient.
8. Subset Freshness: task difficulty and discriminative value may drift over time and require re-estimation.
9. Selector Independence: the system that chooses the reduced set is audited separately from the candidates it evaluates.
10. Full-Suite Audit: periodic full evaluations estimate the miss rate and calibration drift of the reduced suite.
11. Claim Ceiling: a ranking-optimized subset cannot support an absolute-performance claim without separate calibration evidence.
12. Scaffold Binding: reduced-set validity is tied to the evaluated scaffold family unless transfer is demonstrated.
13. Temporal Binding: subset validity expires when the task population or environment changes materially.
14. Cost Accounting: saved evaluation cost is reported separately from retained detection power.
15. Compression Retirement: if miss rate or calibration error exceeds the precommitted tolerance, the reduced suite is retired or rebuilt.

## Saturation
V5.23 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No benchmark selector, resampling harness, or full-suite audit runtime is claimed implemented.
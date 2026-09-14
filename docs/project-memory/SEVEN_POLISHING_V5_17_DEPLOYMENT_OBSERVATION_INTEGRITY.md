# Seven Polishing V5.17 — Deployment Observation Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.16 Temporal Drift Integrity

V5.17 hardens staged-release evidence so that canary, shadow, rollback and observed-production signals cannot be treated as trustworthy merely because they exist.

## Prime law
Deployment evidence is valid only when cohort assignment, observation coverage, rollback completion and measurement quality are themselves verified.

## Requirements
1. Cohort representativeness: staged cohorts declare which user, device, locale, workload and environment populations they cover.
2. Sample-ratio check: unexpected assignment imbalance is treated as an evaluation defect rather than ignored.
3. Cohort contamination check: users or sessions that cross between incumbent and candidate cohorts are identified when that would distort comparison.
4. Sticky-session semantics: stateful workflows remain bound consistently enough to attribute behavior to the correct version.
5. Shadow-gap disclosure: shadow execution cannot prove user-facing latency, UI, permissions, external side effects or state-migration behavior it does not actually exercise.
6. Missing-canary detection: disappearance of a candidate instance, worker or observation stream is an explicit failure signal, not missing data to discard.
7. Observation completeness: promotion-critical metrics declare expected event coverage and detect silent telemetry loss.
8. Rollback-start vs rollback-complete: detection time, rollback initiation time and restored-service time are separate measurements.
9. Rollback state integrity: after rollback, persistent state, migrations, caches, indexes, sessions and pending effects are checked for compatibility.
10. Delayed-effect window: some regressions appear after the immediate canary window; observation duration is matched to the failure mode where practical.
11. Tail-cohort review: low-volume but important populations such as constrained devices, Arabic/RTL and long sessions are not averaged away.
12. Baseline health check: an unhealthy incumbent cannot be used as an unquestioned reference for declaring the candidate healthy.
13. Shared-dependency confounding: failures in common provider/network/storage layers are separated from candidate-specific effects where possible.
14. Rollout-threshold provenance: canary thresholds are frozen before final interpretation and tied to failure criticality.
15. Metric-direction sanity: verify that metric improvement actually corresponds to desirable behavior in the deployment context.
16. Blast-radius accounting: staged rollout size is chosen with explicit exposure bounds; larger exposure is not used simply to obtain statistical power when risk is high.
17. Post-rollback observation: rollback is followed by a verification window rather than treated as success at command acknowledgement.
18. Production evidence downgrade: observational production data cannot outrank controlled evidence for causal claims unless confounding is adequately addressed.
19. Cohort drift: if rollout populations change materially during observation, the verdict is narrowed or the comparison restarts.
20. Promotion-completion proof: canonical adoption requires evidence that rollout, state transition and monitoring handoff completed as intended.

## Saturation
V5.16 is NOT saturated. V5.17 resets saturation to 0/2.

## Truth boundary
Architecture only. No canary controller, telemetry completeness checker, cohort assignment verifier, automated rollback system or staged production runner is claimed implemented.
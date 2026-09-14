# Seven Polishing V5.3 — Formal Promotion Constitution

Status: ARCHITECTURE_CANDIDATE
Parent: Seven Polishing V5.2

## Purpose
V5.3 makes promotion a fixed decision procedure rather than a loose collection of good results. A candidate is accepted only under a locked comparison contract, valid evidence lifecycle, fair baselines, reproducible results and deployment-relevant coverage.

## Promotion Constitution
Every campaign locks before evaluation:
- target identity and scope
- authoritative requirements
- non-compensable constraints
- evidence partitions
- oracle requirements
- repetition policy
- deployment environments
- contamination policy
- judge independence rules
- stopping rule
- rollback requirements
- admissible uncertainty
- promotion and rejection verdicts

Material changes start a new comparison epoch. Old and new epochs are not merged without an explicit bridge study.

## Benchmark Lifecycle
Benchmark families use states:
DRAFT -> CALIBRATED -> ACTIVE -> SUSPECT -> QUARANTINED -> RETIRED.

Reasons include contamination, oracle defects, environment drift, task breakage, version mismatch, or loss of deployment relevance.

## Evidence Freshness
Evidence binds to versions of code/model/provider/runtime/tool schema/benchmark/oracle/device/platform/locale and any time-sensitive external data. Evidence outside its declared freshness envelope cannot silently support current promotion.

## Sealed Canary Sets
Small sealed canary families detect suspicious leakage or adaptation of the evaluation process. Exposure invalidates the affected evidence epoch and requires resealing.

## Generalization Ladder
Claims may advance only through demonstrated levels:
G0 BENCHMARK_LOCAL
G1 PERTURBATION_STABLE
G2 CROSS_TASK_TRANSFER
G3 CROSS_ENVIRONMENT_TRANSFER
G4 DEPLOYMENT_SUPPORTED
G5 RELEASE_PROVEN

Large scores never skip levels.

## Causal Invariance
If a candidate claims improvement from mechanism M, evaluate changes that preserve M while removing superficial cues. If the gain disappears with irrelevant surface changes, downgrade the causal claim.

## Comparator Integrity
Incumbent, candidate and alternatives are evaluated under matched tool access, retries, time budgets, cache state, external-data freshness, device class and environment. Unmatched comparisons are not promotion evidence.

## Promotion Escrow
A passing candidate enters PROMOTION_ESCROW before becoming canonical. Escrow may require fresh hidden checks, reproduction, rollback validation, migration/compatibility checks and evidence-debt review.

## Challenger Diversity
Independent challenge requires distinct failure models, such as deterministic invariants, semantic judgment, mutation/fault generation, simplification, deployment/mobile review, evaluation-integrity review and realistic user-workflow review. Near-identical judges count as one evidence family.

## Negative Controls
Suites include known-neutral and known-regressive changes. An evaluator that reports large gains for neutral changes or fails to reject known-regressive changes loses validity until repaired.

## Counterfactual Baselines
Where practical compare candidate against:
- candidate with claimed mechanism disabled
- incumbent under equivalent resource budget
- simpler alternative
- heuristic baseline

This limits false attribution and unnecessary complexity.

## Deployment Coverage Contract
Any DEPLOYMENT_SUPPORTED claim predeclares required environment classes. Missing classes remain explicit gaps.

## Environment Drift
Material provider, Android, dependency, tool-contract or network changes invalidate affected evidence through dependency-aware revalidation.

## Failure Density
Track failure concentration by subsystem, scenario family and environment in addition to aggregate success. Concentrated severe failures cannot be hidden by a high average.

## Tail Risk
For latency, memory, resource use and reliability, report relevant tails/percentiles as well as averages. Mobile acceptance may bind to upper-tail resource limits.

## Recovery Correctness
Capabilities involving durable state or actions require interruption/recovery evidence where relevant. Happy-path success alone is incomplete.

## Permission-Sensitive Evaluation
Tool/action changes are evaluated under least privilege, revoked permission, stale permission memory and ambiguous authority. Capability gains cannot weaken authority boundaries.

## Research/Evaluation Separation
Sources used to discover candidate ideas are tracked separately from sealed evaluation sources. Discovery evidence does not automatically become hidden evaluation evidence.

## Promotion Verdicts
- PROMOTE_RELEASE
- PROMOTE_SHADOW_ONLY
- PROMOTE_EXPERIMENTAL
- HOLD_FOR_EVIDENCE
- REJECT_REGRESSION
- REJECT_EVALUATOR_INVALID
- REJECT_CONTAMINATION
- REJECT_COMPLEXITY_COST
- REJECT_DEPLOYMENT_GAP

## Saturation Constitution
Saturation requires:
- no unresolved C0/C1 failure
- valid evaluator constitution
- required challenge families completed
- no material evidence debt
- independent unknown-unknown challenge
- no qualifying candidate surviving two consecutive independent challenges

Any material constitution change resets saturation evidence.

## Truth Boundary
V5.3 is architecture only. It does not claim that Seven currently runs sealed canaries, promotion escrow, automated device coverage, or full evaluator-calibration infrastructure.
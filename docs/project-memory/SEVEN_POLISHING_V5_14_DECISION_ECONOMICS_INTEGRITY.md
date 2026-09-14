# Seven Polishing V5.14 — Decision Economics Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.13 Decision Boundaries

V5.14 hardens the economic layer of promotion decisions so that value-of-information, reversibility, delay cost and incumbent preference cannot become optimistic shortcuts.

## Prime law
Decision economics inform evidence allocation; they never redefine truth or erase critical gates.

## Requirements
1. Cost-model provenance: estimates for evaluation cost, delay cost, rollback cost, maintenance cost and failure impact record their source and uncertainty.
2. Sensitivity bands: important economic decisions are tested across plausible cost ranges rather than a single point estimate.
3. Reversibility verification: a change counts as reversible only when rollback path, state restoration, migration compatibility and external-effect boundaries are evidenced.
4. Hidden irreversibility review: detect state loss, schema changes, external side effects, user-visible commitments and evidence invalidation that make apparent rollback incomplete.
5. Incumbent-bias audit: default-to-incumbent behavior is checked for excessive rejection of clearly beneficial low-risk changes.
6. Novelty-bias audit: new candidates receive no preference merely because they are new or complex.
7. Delay-cost ceiling: delay cost can prioritize evidence collection but cannot convert unresolved critical evidence into PASS.
8. VOI calibration: value-of-information estimates are compared against later observed decision usefulness where possible.
9. VOI fallback: when information-value estimates are too uncertain, use conservative predefined evidence portfolios instead of invented precision.
10. Optionality value: preserve low-cost future options when two candidates are otherwise similar, without sacrificing current correctness.
11. Lock-in cost: provider, format, storage, schema and architecture lock-in are explicit decision costs.
12. Migration externality: candidate evaluation includes cost imposed on future migrations, recovery and compatibility.
13. Resource externality: battery, RAM, storage, network and startup costs remain first-class for mobile claims.
14. Human-maintenance externality: operator/debugging/documentation burden is counted where material.
15. Economic conflict disclosure: when speed, cost and quality objectives disagree, the verdict records the tradeoff instead of collapsing them into one score.
16. Criticality supremacy: C0/C1 correctness, authority, data-integrity or recovery failures cannot be outweighed by economic benefit.
17. Rollback debt: any unverified rollback assumption becomes explicit debt and limits the maximum promotion stage.
18. Post-promotion reconciliation: staged promotions compare predicted economics with observed costs and feed calibration forward.

## Saturation
V5.13 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No runtime economics estimator, rollback verifier or post-promotion calibrator is claimed implemented.
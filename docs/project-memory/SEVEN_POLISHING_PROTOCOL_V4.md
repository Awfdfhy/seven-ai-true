# Seven Polishing Protocol V4 — Exhaustive Evidence-Guided Saturation

Status: SELF-POLISH ACTIVE — candidate after Round 02
Scope: capability #22 onward, Tool Fabric families, cross-system polish, UI/UX/brand, whole-product saturation, and pre-release revalidation of earlier freezes.

## Prime rule
A freeze means only this: within a documented search surface, evidence set, quality-scenario set and resource envelope, no remaining material improvement has been demonstrated whose expected value exceeds its cost and risk. It never means globally perfect or permanently final.

## Evidence ladder
`IDEA → RESEARCH_SUPPORTED → ARCHITECTURE_ACCEPTED → IMPLEMENTED → TESTED → DEVICE_VERIFIED → RELEASE_PROVEN`
No state may be inferred from a lower state.

## Protected quality axes
Material improvement must improve at least one relevant axis without unacceptable regression in another: capability/user value; correctness/truth; authority/security/data integrity/user agency; reliability/recoverability; latency/responsiveness; RAM/CPU/battery/thermal/storage/network; maintainability/evolvability; observability/testability; UX/accessibility; Arabic/RTL when applicable; provider independence; implementation feasibility. Feature count alone is not improvement.

## Criticality classes
- `C0`: authority, security, data integrity, irreversible side effects, user agency. Non-compensable.
- `C1`: reliability, recovery, accessibility and other release-critical behavior.
- `C2`: performance, resources and product-quality targets.
- `C3`: optional enhancement/optimization.
A C0 failure blocks saturation regardless of gains elsewhere.

## Required campaign artifacts
GroundTruthSnapshot; CapabilitySurfaceMap; SearchSurfaceLedger; QualityAttributeUtilityTree; AssumptionRegister; ResearchEvidenceMap; AlternativeArchitectureSet; DecisionLedger; FailureAndRegressionCemetery; CrossSystemContractMap; RealityFeasibilityRecord; MobileResourceEnvelope; RepresentativeDeviceMatrix; UXJourneyMatrix; TestDerivationMap; EvaluationContract; BaselineIdentityLock; UncertaintyLedger; ChangeBlastRadiusMap; SaturationLedger; ReopenTriggers.

## Phase 0 — Scope and ground truth
Record implemented, architecture-only, legacy, speculative and unknown state. Protect source/branch boundaries. Lock the exact baseline identity: version/configuration plus provider/model/tool/eval/device/environment identities where relevant.

## Phase 1 — Domain discovery
Build CapabilitySurfaceMap using first principles, user journeys/lifecycles, research, production systems, adjacent industries, failure taxonomies, platform constraints, accessibility/localization, security/authority, operations/migration/recovery and data/content lifecycle. SearchSurfaceLedger records categories examined, lenses/sources, exclusions, unresolved gaps and date/version. Coverage claims are relative to this ledger.

## Phase 2 — Scenario utility tree
For important quality scenarios record stimulus, environment, expected response, measurable bound where possible, provenance and C0-C3 criticality. Tradeoffs are explicit.

## Phase 3 — Research evidence sweep
ResearchEvidenceMap records source/version/date, applicability and whether evidence is direct, analogous or speculative. Conflicts remain visible. Classify evidence stability as stable, version-bound or time-sensitive and define revalidation triggers.

## Phase 4 — First-principles rebuild
Design strongest minimal system from zero. Identify authoritative/derived state, contracts, failure semantics and minimum useful primitives without incumbent bias.

## Phase 5 — Alternative architecture tournament
Construct genuinely different candidates where meaningful, including minimal and structurally different candidates. Compare on scenarios/protected axes. No incumbent bonus. Prefer cheaper reversibility/migration when candidates are otherwise close unless less-reversible design proves material benefit.

## Phase 6 — Builder review
Maximize useful capability while preserving invariants. Seek capability ceiling, adaptive intelligence and high-value integrations.

## Phase 7 — Failure review
Exercise stale/corrupt state, malformed input, concurrency, cancellation, partial failure, offline/provider loss, migrations, retries, uncertainty, security boundaries, resource pressure and long-horizon degradation. A C0/C1 counterexample can outweigh many average successes and is promoted to regression history.

## Phase 8 — Simplifier review
Attempt to remove/merge primitives, services, state, indexes, models and policies. Every canonical primitive pays authority, persistence, migration, testing, documentation and cognitive costs. Equivalent protected behavior with less machinery is improvement.

## Phase 9 — Unknown-unknown hunt
Invert assumptions; inspect creation/mutation/deletion/migration/recovery edges; combine failures; ask what users observe that architecture does not represent; inspect adjacent boundaries; examine future provider/platform/version changes; seek counterexamples. Material new domain returns to Domain Discovery and resets saturation.

## Phase 10 — Cross-system shadow test
Evaluate adjacent Seven fabrics: authority ownership, identifiers, cancellation, permission flow, lineage, persistence, recovery, observability, hidden global state and performance coupling. Maintain ChangeBlastRadiusMap covering affected capabilities, schemas, persisted data, permissions, migrations, UI surfaces and resource budgets.

## Phase 11 — Reality gate
Demonstrate implementability with available platform primitives and realistic engineering effort. Experimental/provider-specific/unavailable dependencies remain explicit. Implementation evidence disproving an assumption emits `REALITY_REOPEN`.

## Phase 12 — Mobile physics gate
Treat constrained Android as first-class. Define cold/warm startup, TTI, interaction latency, peak/steady RAM, CPU, battery, thermal, storage, network, background and media-memory envelopes. Unused heavy capabilities should have near-zero ordinary-path cost where practical. RepresentativeDeviceMatrix uses RAM/performance tiers; release claims require release-build and representative-device evidence.

## Phase 13 — UX/accessibility gate
Map architecture to journeys and test discoverability, progressive disclosure, cancellation, recovery, permissions, uncertainty, errors, long-running work, touch ergonomics, screen readers, reduced motion, font scaling, Day/Night and Arabic/RTL.

## Phase 14 — Precommit evaluation contract
Before major candidate comparison, freeze the visible scenario set, C0/C1 gates, metrics, acceptance rules and baseline identity. New tests may be added when discoveries occur, but existing gates cannot be silently removed or weakened. Important systems should reserve a shadow/holdout scenario pool not used during candidate design.

## Phase 15 — Long-horizon/composition gauntlet
Exercise hundreds/thousands of relevant transitions where meaningful and compose failures. Use deterministic simulation, property-based, fuzz, metamorphic, replay and migration testing where suitable.

## Phase 16 — Regression cemetery
Every material discovered failure becomes a permanent regression case or invariant when testable. New candidates defeat new scenarios plus historical failures.

## Phase 17 — Pareto/tradeoff/sensitivity gate
Compare survivors across protected axes. No scalar score compensates critical failures. Prefer Pareto improvements. Accepted tradeoffs need rationale and bounded regression. Perturb important thresholds, weights, budgets and uncertain assumptions; a winner that survives only one fragile setting is not robust.

## Phase 18 — Proof of improvement
For every accepted material change record prior limitation, change, evidence, expected benefit, complexity/resource cost, new risks, verification/evaluation method and result. Performance/stochastic comparisons use repeated trials and variance/distribution awareness where meaningful.

Maintain UncertaintyLedger separately from defects. Noncritical unresolved uncertainty requires a bound plus measurement plan or reopen trigger.

## Phase 19 — Test derivation gate
Map important invariants/contracts, where feasible, to deterministic, property-based, fuzz, metamorphic, replay, migration, device/performance or manual UX/accessibility verification. Architecture without plausible verification route is incomplete.

## Phase 20 — Reconciliation candidate
Build one coherent candidate from surviving changes. Remove duplicate experimental structures and update contracts, budgets, evals and migrations together. Preserve enough machine/human-readable decision inputs to reconstruct why the winner beat alternatives without relying on prose memory.

## Phase 21 — Independent saturation review A
Fresh review receives candidate, SearchSurfaceLedger, evidence, regression cemetery, holdout access as governed, quality scenarios and decision rules. It seeks material redesign, missing domain or simplification. `MATERIAL_IMPROVEMENT_FOUND` resets 0/2. `NO_MATERIAL_IMPROVEMENT` yields 1/2 only with an explicit examined-surface record.

## Phase 22 — Independent saturation review B
B differs from A in at least two dimensions: framing, evidence subset/order, scenario family, alternatives, failure composition or simplification strategy. Material improvement resets 0/2; second valid clean review yields 2/2.

## Phase 23 — Saturation freeze
Freeze only after all mandatory gates and 2/2. Record exact candidate/baseline/eval identities, search surface, unresolved noncritical limitations/uncertainty, rejected alternatives, budgets, evidence level/freshness, implementation status, regression suite, decision rules and reopen triggers.

## Stop-cost guard
After mandatory gates pass, optional search continues only while expected information gain is material relative to time/complexity cost. This prevents endless cosmetic churn without weakening reopen triggers.

## Reopen triggers
Material new domain/evidence; critical/repeated regression; platform constraint; stronger architecture/algorithm; provider/model/tool assumption change; security/authority defect; resource-budget violation; major UX/accessibility failure; new integration requirement; implementation evidence disproving assumptions; expiry of material version-bound/time-sensitive evidence.

## Budget classes
Correctness/authority invariants cannot be spent. Separate reliability, performance/resource, complexity and optional-feature budgets. At implementation/release stage, exhausted reliability/resource budgets may pause feature expansion and redirect work to restoring the gate. Budgets never justify C0 regressions.

## V4 eligibility equation
Before final reviews:
`GROUND_TRUTH + BASELINE_LOCK + DOMAIN_COVERAGE + SEARCH_LEDGER + QUALITY_SCENARIOS + RESEARCH + ALTERNATIVES + BUILDER + FAILURE + SIMPLIFIER + UNKNOWN_UNKNOWN + CROSS_SYSTEM + REALITY + MOBILE + UX_ACCESSIBILITY + PRECOMMIT_EVAL + LONG_HORIZON_COMPOSITION + REGRESSION_CEMETERY + PARETO_SENSITIVITY + PROOF_OF_IMPROVEMENT + TEST_DERIVATION + RECONCILIATION`
Then:
`INDEPENDENT_REVIEW_A + INDEPENDENT_REVIEW_B = SATURATION_FREEZE`

## Relationship to Protocol 2.1
V4 supersedes 2.1 for new campaigns only after V4 itself saturates. Earlier freezes remain historical candidates and receive V4 revalidation before Seven 1.0.

## Application order
1. Self-polish V4 until its own 2/2 saturation.
2. Apply V4 to capability #22 onward.
3. Apply to Tool Fabric families.
4. Apply to UI/UX/Brand/Motion/release surfaces.
5. Run V4 cross-system campaign.
6. Revalidate earlier freezes including RPG 4.2 and Titles 4.1.
7. Run whole-Seven V4 saturation before architecture final freeze.
8. Re-run reality/device gates during implementation and release.

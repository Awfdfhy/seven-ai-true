# Seven Polishing Protocol V4 — Exhaustive Evidence-Guided Saturation

Status: SELF-POLISH ACTIVE — candidate after Round 01
Scope: capability #22 onward, Tool Fabric families, cross-system polish, UI/UX/brand, whole-product saturation, and pre-release revalidation of earlier freezes.

## Prime rule
A freeze means only this: within a documented search surface, evidence set, quality-scenario set and resource envelope, no remaining material improvement has been demonstrated whose expected value exceeds its cost and risk. It never means globally perfect or permanently final.

## Evidence ladder
`IDEA → RESEARCH_SUPPORTED → ARCHITECTURE_ACCEPTED → IMPLEMENTED → TESTED → DEVICE_VERIFIED → RELEASE_PROVEN`

No state may be inferred from a lower state.

## Protected quality axes
Material improvement must improve at least one relevant axis without an unacceptable regression in another:
- capability/user value
- correctness/truth
- authority/security/data integrity/user agency
- reliability/recoverability
- latency/responsiveness
- RAM/CPU/battery/thermal/storage/network
- maintainability/evolvability
- observability/testability
- UX/accessibility
- Arabic/RTL when applicable
- provider independence
- implementation feasibility

Feature count alone is not improvement.

## Criticality classes
- `C0`: authority, security, data integrity, irreversible side effects, user agency. Non-compensable.
- `C1`: reliability, recovery, accessibility and other release-critical behavior.
- `C2`: performance, resources and product-quality targets.
- `C3`: optional enhancement/optimization.

A C0 failure blocks saturation regardless of gains elsewhere.

## Required campaign artifacts
- GroundTruthSnapshot
- CapabilitySurfaceMap
- SearchSurfaceLedger
- QualityAttributeUtilityTree
- AssumptionRegister
- ResearchEvidenceMap
- AlternativeArchitectureSet
- DecisionLedger
- FailureAndRegressionCemetery
- CrossSystemContractMap
- RealityFeasibilityRecord
- MobileResourceEnvelope
- RepresentativeDeviceMatrix
- UXJourneyMatrix
- TestDerivationMap
- EvaluationContract
- SaturationLedger
- ReopenTriggers

## Phase 0 — Scope and ground truth
Record implemented, architecture-only, legacy, speculative and unknown state. Protect source/branch boundaries before design work.

## Phase 1 — Domain discovery
Build CapabilitySurfaceMap before optimization using first principles, user journeys/lifecycles, research, production systems, adjacent industries, failure taxonomies, platform constraints, accessibility/localization, security/authority, operations/migration/recovery and data/content lifecycle.

Maintain `SearchSurfaceLedger`: categories examined, lenses/sources, exclusions, unresolved gaps and date/version. Coverage claims are relative to this ledger.

## Phase 2 — Scenario utility tree
For important quality scenarios record stimulus, environment, expected response and measurable bound where possible, plus provenance: user journey, invariant, prior failure, research evidence, platform constraint or release requirement. Assign C0-C3 criticality.

Tradeoffs must be explicit.

## Phase 3 — Research evidence sweep
Use authoritative research, standards, production engineering, open source and relevant products. ResearchEvidenceMap records date/version, applicability to Seven, and whether evidence is direct, analogous or speculative. Conflicts remain visible.

## Phase 4 — First-principles rebuild
Design the strongest minimal system from zero. Identify authoritative/derived state, contracts, failure semantics and minimum useful primitives without incumbent bias.

## Phase 5 — Alternative architecture tournament
Construct genuinely different candidates where meaningful, including a minimal candidate and a structurally different candidate. Compare on scenarios and protected axes. No incumbent bonus.

## Phase 6 — Builder review
Maximize useful capability while preserving invariants. Seek capability ceiling, adaptive intelligence and high-value integrations.

## Phase 7 — Failure review
Exercise stale/corrupt state, malformed input, concurrency, cancellation, partial failure, offline/provider loss, migrations, retries, uncertainty, security boundaries, resource pressure and long-horizon degradation. Architecture defects return to redesign.

## Phase 8 — Simplifier review
Attempt to remove/merge primitives, services, state, indexes, models and policies. Every canonical primitive pays permanent authority, persistence, migration, testing, documentation and cognitive costs. Equivalent protected behavior with less machinery is improvement.

## Phase 9 — Unknown-unknown hunt
Dedicated omitted-domain search: invert assumptions; inspect creation/mutation/deletion/migration/recovery edges; combine failures; ask what users observe that architecture does not represent; inspect adjacent boundaries; examine future provider/platform/version changes; seek counterexamples.

A material new domain returns to Domain Discovery and resets saturation.

## Phase 10 — Cross-system shadow test
Evaluate against materially adjacent Seven fabrics: authority ownership, identifiers, cancellation, permission flow, lineage, persistence, recovery, observability, hidden global state and performance coupling. Reject local optimization that harms Seven globally.

## Phase 11 — Reality gate
Demonstrate implementability with available platform primitives and realistic engineering effort. Experimental/provider-specific/unavailable dependencies remain explicit. Implementation evidence that disproves an accepted assumption emits `REALITY_REOPEN`.

## Phase 12 — Mobile physics gate
Treat constrained Android as first-class. Define envelopes for cold/warm startup, TTI, interaction latency, peak/steady RAM, CPU, battery, thermal, storage, network, background work and media memory where relevant. Unused heavy capabilities should have near-zero ordinary-path cost where practical.

Define RepresentativeDeviceMatrix by RAM/performance tier. Release claims require release-build and representative-device evidence; debug/emulator results cannot silently become device proof.

## Phase 13 — UX/accessibility gate
Map architecture to journeys and test discoverability, progressive disclosure, cancellation, recovery, permissions, uncertainty, errors, long-running work, touch ergonomics, screen readers, reduced motion, font scaling, Day/Night and Arabic/RTL.

## Phase 14 — Long-horizon/composition gauntlet
Exercise hundreds/thousands of relevant transitions where meaningful and compose failures, not only isolate them. Use deterministic simulation, property-based, fuzz, metamorphic, replay and migration testing where suitable.

## Phase 15 — Regression cemetery
Every material discovered failure becomes a permanent regression case or invariant when testable. New candidates must defeat both new scenarios and historical failures.

## Phase 16 — Pareto/tradeoff gate
Compare survivors across protected axes. No scalar magic score may compensate for heterogeneous critical failures. Prefer Pareto improvements. Any accepted tradeoff needs explicit rationale and bounded regression.

## Phase 17 — Proof of improvement
For every accepted material change record prior limitation, change, evidence, expected benefit, complexity/resource cost, new risks, verification/evaluation method and result. Unverifiable benefit does not count toward saturation.

Performance and stochastic-model comparisons use repeated trials and variance/distribution awareness where meaningful; one lucky run is not proof.

## Phase 18 — Test derivation gate
Map each important invariant/contract, where feasible, to deterministic tests, property-based tests, fuzzing, metamorphic checks, replay, migration, device/performance measurement or manual UX/accessibility inspection. Architecture without a plausible verification route is incomplete.

## Phase 19 — Reconciliation candidate
Build one coherent candidate from surviving changes. Remove duplicate experimental structures and update contracts, budgets, evals and migrations together.

## Phase 20 — Independent saturation review A
A fresh review receives candidate, SearchSurfaceLedger, evidence map, regression cemetery and quality scenarios. It seeks material redesign, missing domain or simplification.

`MATERIAL_IMPROVEMENT_FOUND` → integrate and reset 0/2.
`NO_MATERIAL_IMPROVEMENT` → 1/2, but record exactly what was examined. Clean review is bounded negative evidence, not proof of perfection.

## Phase 21 — Independent saturation review B
B must differ from A in at least two dimensions: framing, evidence subset/order, scenario family, alternatives, failure composition, simplification strategy.

Material improvement resets 0/2. A second valid clean review yields 2/2.

## Phase 22 — Saturation freeze
Freeze only after every mandatory gate and 2/2. Record exact version, search surface, unresolved noncritical limitations, rejected alternatives, budgets, evidence level, implementation status, regression identity and reopen triggers.

## Stop-cost guard
After mandatory gates pass, optional search continues only while expected information gain is material relative to time/complexity cost. This prevents endless cosmetic churn without weakening reopen triggers.

## Reopen triggers
Reopen on material new domain/evidence, critical/repeated regression, platform constraint, stronger architecture/algorithm, provider/model/tool assumption change, security/authority defect, resource-budget violation, major UX/accessibility failure, new integration requirement, or implementation evidence disproving architecture assumptions.

Reopening is successful governance, not failure of the previous freeze.

## Budget classes
- correctness/authority invariants: cannot be spent
- reliability budget
- performance/resource budget
- complexity budget
- optional feature budget

At implementation/release stage, exhausted reliability/resource budgets pause feature expansion where policy requires and redirect work toward restoring the gate. Budgets never justify C0 correctness/security regressions.

## V4 eligibility equation
Before final reviews:
`GROUND_TRUTH + DOMAIN_COVERAGE + SEARCH_LEDGER + QUALITY_SCENARIOS + RESEARCH + ALTERNATIVES + BUILDER + FAILURE + SIMPLIFIER + UNKNOWN_UNKNOWN + CROSS_SYSTEM + REALITY + MOBILE + UX_ACCESSIBILITY + LONG_HORIZON_COMPOSITION + REGRESSION_CEMETERY + PARETO_TRADEOFF + PROOF_OF_IMPROVEMENT + TEST_DERIVATION + RECONCILIATION`

Then:
`INDEPENDENT_REVIEW_A + INDEPENDENT_REVIEW_B = SATURATION_FREEZE`

## Relationship to Protocol 2.1
V4 supersedes 2.1 for new campaigns after V4 itself saturates. Earlier freezes remain valid historical candidates. Before Seven 1.0 they receive V4 revalidation focused on domain/search coverage, cross-system compatibility, regression cemetery, mobile reality, test derivation and reopen triggers.

## Application order
1. Self-polish V4 until its own 2/2 saturation.
2. Apply V4 to capability #22 onward.
3. Apply to Tool Fabric families.
4. Apply to UI/UX/Brand/Motion/release surfaces.
5. Run V4 cross-system campaign.
6. Revalidate earlier freezes including RPG 4.2 and Titles 4.1.
7. Run whole-Seven V4 saturation before architecture final freeze.
8. Re-run reality/device gates during implementation and release.

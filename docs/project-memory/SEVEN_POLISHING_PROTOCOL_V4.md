# Seven Polishing Protocol V4 — Exhaustive Evidence-Guided Saturation

Status: SELF-POLISH ACTIVE — reconciled candidate after Rounds 01-03
Scope: capability #22 onward, Tool Fabric families, cross-system polish, UI/UX/brand, whole-product saturation, and pre-release revalidation of earlier freezes.

## Prime rule
A freeze means only this: within a documented search surface, evidence set, quality-scenario set and resource envelope, no remaining material improvement has been demonstrated whose expected value exceeds its cost and risk. It never means globally perfect or permanently final.

## Evidence ladder
`IDEA → RESEARCH_SUPPORTED → ARCHITECTURE_ACCEPTED → IMPLEMENTED → TESTED → DEVICE_VERIFIED → RELEASE_PROVEN`. No state may be inferred from a lower state.

## Protected quality axes
Material improvement must improve at least one relevant axis without unacceptable regression in another: capability/user value; correctness/truth; authority/security/data integrity/user agency; reliability/recoverability; latency/responsiveness; RAM/CPU/battery/thermal/storage/network; maintainability/evolvability; observability/testability; UX/accessibility; Arabic/RTL when applicable; provider independence; implementation feasibility. Feature count alone is not improvement.

## Criticality
`C0` authority/security/data integrity/irreversible side effects/user agency, non-compensable. `C1` reliability/recovery/accessibility/release-critical. `C2` performance/resources/product quality. `C3` optional enhancement. C0 failure blocks saturation.

## Tailoring rule
Each gate is marked `REQUIRED`, `CONDITIONAL`, or `NOT_APPLICABLE` with rationale. Tailoring removes meaningless ceremony, never relevant rigor.

## Canonical information set
Campaigns must preserve the information represented by: GroundTruthSnapshot, CapabilitySurfaceMap, SearchSurfaceLedger, QualityAttributeUtilityTree, AssumptionRegister, ResearchEvidenceMap, AlternativeArchitectureSet, DecisionLedger, FailureAndRegressionCemetery, CrossSystemContractMap, RealityFeasibilityRecord, MobileResourceEnvelope, RepresentativeDeviceMatrix, UXJourneyMatrix, TestDerivationMap, EvaluationContract, BaselineIdentityLock, UncertaintyLedger, ChangeBlastRadiusMap, CampaignCheckpoint, SaturationLedger and ReopenTriggers. These need not be separate physical files; canonical sections or generated views may satisfy multiple information needs.

## Phase 0 — Ground truth and baseline lock
Record implemented, architecture-only, legacy, speculative and unknown state. Protect source/branch boundaries. Bind comparisons to exact baseline/configuration and provider/model/tool/eval/device/environment identities where relevant.

## Phase 1 — Domain discovery and search ledger
Build CapabilitySurfaceMap from first principles, user lifecycles, research, production systems, adjacent domains, failures, platform constraints, accessibility/localization, security/authority, operations/migration/recovery and data lifecycle. SearchSurfaceLedger records categories, evidence classes, exclusions, gaps and date/version. Where external evidence matters, seek diverse evidence classes when available and record missing diversity.

## Phase 2 — Scenario utility tree
Record stimulus, environment, expected response, measurable bound where possible, provenance and C0-C3 criticality. Tradeoffs are explicit.

## Phase 3 — Research evidence
Record source/version/date, applicability and direct/analogous/speculative status. Preserve conflicts. Mark evidence stable, version-bound or time-sensitive with revalidation triggers.

## Phase 4 — First-principles rebuild
Design strongest minimal system from zero. Identify authoritative/derived state, contracts, failure semantics and minimum useful primitives without incumbent bias.

## Phase 5 — Alternative architecture tournament
Construct genuinely different candidates where meaningful, including minimal and structurally different alternatives. Compare on scenarios/protected axes. No incumbent bonus. Prefer reversibility when otherwise close unless irreversible commitment proves material benefit.

## Phase 6 — Builder review
Maximize useful capability while preserving invariants and resource discipline.

## Phase 7 — Failure review
Exercise stale/corrupt state, malformed input, concurrency, cancellation, partial failure, offline/provider loss, migrations, retries, uncertainty, security boundaries, resource pressure and long-horizon degradation. C0/C1 counterexamples enter regression history.

## Phase 8 — Simplifier review
Attempt to remove/merge primitives, services, state, indexes, models and policies. Every canonical primitive pays authority, persistence, migration, testing, documentation and cognitive costs. Equivalent protected behavior with less machinery is improvement.

## Phase 9 — Unknown-unknown hunt
Invert assumptions; inspect creation/mutation/deletion/migration/recovery; compose failures; ask what users observe that architecture omits; inspect adjacent boundaries; examine future provider/platform/version changes; seek counterexamples. Material new domain returns to Phase 1 and resets saturation.

## Phase 10 — Cross-system shadow test
Evaluate authority ownership, identifiers, cancellation, permission flow, lineage, persistence, recovery, observability, hidden global state and performance coupling across adjacent Seven fabrics. ChangeBlastRadiusMap identifies affected capabilities, schemas, persisted data, permissions, migrations, UI and budgets.

## Phase 11 — Reality gate
Demonstrate implementability with available platform primitives and realistic effort. Experimental/provider-specific/unavailable dependencies remain explicit. Contradicting implementation evidence emits `REALITY_REOPEN`.

## Phase 12 — Mobile physics gate
Treat constrained Android as first-class. Define cold/warm startup, TTI, interaction latency, peak/steady RAM, CPU, battery, thermal, storage, network, background and media-memory envelopes. Unused heavy capabilities should have near-zero ordinary-path cost where practical. RepresentativeDeviceMatrix uses device/RAM tiers; release claims require representative release-build evidence.

## Phase 13 — UX/accessibility gate
Map to journeys and test discoverability, progressive disclosure, cancellation, recovery, permissions, uncertainty, errors, long work, touch ergonomics, screen readers, reduced motion, font scaling, Day/Night and Arabic/RTL.

## Phase 14 — Precommit evaluation contract
Before major comparison freeze visible scenarios, C0/C1 gates, metrics, acceptance rules and baseline identity. Discoveries may add tests but cannot silently weaken existing gates. Important systems reserve shadow/holdout scenarios when feasible.

## Phase 15 — Long-horizon/composition gauntlet
Exercise large transition counts where meaningful and compose failures. Use deterministic simulation, property-based, fuzz, metamorphic, replay and migration testing when suitable.

## Phase 16 — Regression cemetery
Material discovered failures become permanent regression cases or invariants when testable. New candidates defeat new and historical scenarios.

## Phase 17 — Pareto/tradeoff/sensitivity gate
No scalar score compensates critical failures. Prefer Pareto improvements. Accepted tradeoffs need rationale/bounds. Perturb important thresholds, budgets and uncertain assumptions to reject fragile winners.

## Phase 18 — Proof of improvement and uncertainty
Record prior limitation, change, evidence, expected benefit, complexity/resource cost, risks, verification method and result. Use repeated trials/variance awareness for stochastic or performance comparisons where meaningful. UncertaintyLedger is separate from known defects; tolerated noncritical uncertainty needs bounds plus measurement/reopen plan.

## Phase 19 — Test derivation
Map important invariants/contracts where feasible to deterministic, property-based, fuzz, metamorphic, replay, migration, device/performance or manual UX/accessibility verification.

## Phase 20 — Reconciliation and decision lineage
Build one coherent candidate from surviving changes. Update contracts/budgets/evals/migrations together. Each important accepted decision links to scenarios, evidence, alternatives and regression coverage. Preserve enough inputs/rules to reconstruct why it won.

## Phase 21 — Independent review A
Fresh review seeks material redesign, missing domain or simplification. `MATERIAL_IMPROVEMENT_FOUND` resets 0/2. `NO_MATERIAL_IMPROVEMENT` yields 1/2 only with explicit examined surface.

## Phase 22 — Independent review B
B differs from A in at least two dimensions: framing, evidence subset/order, scenario family, alternatives, failure composition or simplification strategy. Material improvement resets 0/2; second valid clean review yields 2/2.

## Phase 23 — Saturation freeze
Freeze only after all applicable mandatory gates and 2/2. No unresolved architecture-critical work may be hidden as generic deferred work. Deferred items must be implementation work, optional enhancement or bounded noncritical uncertainty. Record exact identities, search surface, limitations, uncertainty, rejected alternatives, budgets, evidence freshness, implementation status, regression identity, decision rules and reopen triggers.

## Campaign checkpoint
Long campaigns persist current candidate identity, latest material improvement, saturation counter, unresolved C0/C1 items, uncertainty, completed/applicable gates and next gate so session loss cannot silently alter process state.

## Incremental revalidation
A reopen trigger computes blast radius using decision/evidence lineage. Still-fresh unaffected decisions may remain accepted; affected decisions and dependencies re-enter applicable gates. Reopening neither forces unsafe partial review nor wasteful total restart.

## Protocol health diagnostics
Track diagnostics such as critical decisions with verification routes, unresolved uncertainty, stale evidence and regression coverage. These are signals, not a universal quality score.

## Stop-cost guard
After mandatory gates pass, optional search continues only while expected information gain is material relative to time/complexity cost.

## Reopen triggers
Material new domain/evidence; critical/repeated regression; platform constraint; stronger architecture/algorithm; provider/model/tool assumption change; security/authority defect; resource-budget violation; major UX/accessibility failure; new integration requirement; implementation evidence disproving assumptions; expiry of material version-bound/time-sensitive evidence.

## Budget classes
Correctness/authority invariants cannot be spent. Reliability, performance/resource, complexity and optional-feature budgets are separate. Exhausted release-stage reliability/resource budgets may pause expansion and redirect work to restoration, never justify C0 regression.

## Eligibility
Applicable tailored gates must cover ground truth, baseline, domain/search, scenarios, research, alternatives, builder, failure, simplification, unknown-unknowns, cross-system, reality, mobile, UX/accessibility, precommit eval, long-horizon/composition, regression history, Pareto/sensitivity, proof, test derivation and reconciliation. Only then may two independent clean reviews produce saturation.

## Relationship to 2.1 and application order
V4 supersedes 2.1 for new campaigns only after V4 itself saturates. Earlier freezes remain historical candidates and receive V4 revalidation before Seven 1.0. Then apply V4 to #22 onward, Tool Fabric, UI/UX/Brand/Motion, cross-system work, earlier-freeze revalidation and whole-Seven saturation, with reality/device gates repeated during implementation/release.

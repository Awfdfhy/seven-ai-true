# Seven Polishing Protocol V4 — Exhaustive Evidence-Guided Saturation

Status: CANONICAL POLISHING PROTOCOL CANDIDATE
Scope: capability #22 onward, Tool Fabric families, cross-system polish, UI/UX/brand, whole-product saturation, and pre-release revalidation of earlier freezes.

## Purpose
V4 exists to reduce false saturation. A system is not considered saturated merely because two reviews fail to suggest changes. Before those reviews, V4 must demonstrate that the relevant problem surface, alternatives, tradeoffs, integrations, implementation reality, mobile constraints, regressions, and unknown-unknown search have been covered.

## Prime rule
A freeze means: within a documented search surface and evidence set, no remaining material improvement has been demonstrated whose expected value exceeds its cost and risk.

It never means globally perfect or permanently final.

## Evidence ladder
Every claim must carry one of these states where applicable:
1. IDEA
2. RESEARCH_SUPPORTED
3. ARCHITECTURE_ACCEPTED
4. IMPLEMENTED
5. TESTED
6. DEVICE_VERIFIED
7. RELEASE_PROVEN

A higher state may not be inferred from a lower state.

## Material improvement definition
A change is MATERIAL_IMPROVEMENT only when it produces a meaningful improvement in at least one relevant quality axis without an unacceptable regression in another protected axis.

Protected axes include:
- capability and user value
- correctness and truth
- authority and security
- reliability and recoverability
- latency and responsiveness
- RAM, CPU, battery, thermal, storage and network
- maintainability and evolvability
- observability and testability
- UX and accessibility
- Arabic/RTL where applicable
- provider independence
- implementation feasibility

Feature count is not an axis by itself.

## V4 artifacts
Each campaign maintains:
- GroundTruthSnapshot
- CapabilitySurfaceMap
- QualityAttributeUtilityTree
- AssumptionRegister
- ResearchEvidenceMap
- AlternativeArchitectureSet
- DecisionLedger
- FailureAndRegressionCemetery
- CrossSystemContractMap
- RealityFeasibilityRecord
- MobileResourceEnvelope
- UXJourneyMatrix
- EvaluationContract
- SaturationLedger
- ReopenTriggers

## Phase 0 — Scope and ground truth
Record what exists, what is implemented, what is architecture only, what is legacy, and what is unknown. Protect source and branch boundaries before design work.

## Phase 1 — Domain discovery
Build a CapabilitySurfaceMap before optimization. Search for missing domains using:
- first-principles decomposition
- user journeys and lifecycle stages
- research and production systems
- adjacent industries and analogous systems
- failure taxonomies
- platform constraints
- accessibility and localization
- privacy/security/authority boundaries
- operations, migration and recovery
- content/data lifecycle

The purpose is to find missing questions before declaring answers complete.

## Phase 2 — Quality-attribute utility tree
Create scenario-based quality requirements rather than vague goals. For each important scenario define stimulus, environment, expected response and measurable bound where possible.

Tradeoffs must be explicit. Improving one attribute cannot silently spend another.

## Phase 3 — Research evidence sweep
Search authoritative research, standards, production engineering, open source and relevant products. Record what each source changes in the design rather than collecting links.

Research is evidence, not authority over Seven. Conflicting evidence remains visible.

## Phase 4 — First-principles rebuild
Design the strongest minimal system from zero without inheriting current abstractions. Identify authoritative state, derived state, contracts, failure semantics and the minimum useful primitives.

## Phase 5 — Alternative architecture tournament
Construct multiple genuinely different candidates where the problem permits. Compare them on the protected axes and scenario utility tree. Include a minimal candidate and at least one structurally different candidate when meaningful.

No incumbent bonus is allowed.

## Phase 6 — Builder review
Maximize useful capability while preserving invariants. Discover capability ceiling, adaptive intelligence opportunities and high-value integrations.

## Phase 7 — Failure review
Exercise stale/corrupt state, malformed input, concurrency, cancellation, partial failure, offline/provider loss, migrations, retries, uncertainty, security boundaries, resource pressure and long-horizon degradation.

Failures that reveal architecture defects return the candidate to redesign.

## Phase 8 — Simplifier review
Attempt to remove or merge primitives, services, state, indexes, models and policies. Every retained primitive pays a complexity tax and must justify ownership, persistence, migration, testing and runtime cost.

A smaller design with equivalent protected behavior is an improvement.

## Phase 9 — Unknown-unknown hunt
Run a dedicated search for omitted domains and questions. Methods include:
- invert assumptions
- inspect lifecycle edges: before creation, during mutation, after deletion, migration and recovery
- combine unrelated failure modes
- ask what the user can observe that the architecture does not represent
- inspect adjacent capability boundaries
- examine future provider/platform/version changes
- seek counterexamples to the current mental model

A newly discovered material domain reopens domain discovery and resets saturation progress.

## Phase 10 — Cross-system shadow test
Evaluate the candidate against every materially adjacent Seven fabric. Check duplicated authority, circular dependencies, hidden global state, incompatible identifiers, cancellation propagation, permission flow, lineage, persistence, recovery, observability and performance coupling.

Local optimization that harms Seven globally is rejected.

## Phase 11 — Reality gate
Prove the architecture can be implemented with available platform primitives and realistic engineering effort. Mark dependencies that are experimental, provider-specific, unavailable or unverified.

Architecture may define future interfaces, but cannot claim implementation feasibility without evidence.

## Phase 12 — Mobile physics gate
Treat constrained Android as a first-class environment. Establish envelopes for startup, TTI, interaction latency, peak/steady RAM, CPU, battery, thermal behavior, storage, network, background work and media memory where relevant.

Unused heavy capability should have near-zero ordinary-path cost wherever technically practical.

Cold-start paths receive special scrutiny. Device-tier degradation must preserve truth and safety.

## Phase 13 — UX and accessibility gate
Map architecture to real journeys. Test discoverability, progressive disclosure, cancellation, recovery, permissions, uncertainty, error states, long-running work, touch ergonomics, screen-reader semantics, reduced motion, font scaling, Day/Night and Arabic/RTL.

Internal sophistication that cannot be presented coherently is a product defect.

## Phase 14 — Long-horizon and composition gauntlet
Test hundreds or thousands of relevant state transitions where meaningful. Compose failures rather than testing them only in isolation, for example low memory plus offline plus stale state plus cancellation.

Use deterministic simulation, property-based testing, fuzzing or metamorphic checks when suitable.

## Phase 15 — Regression cemetery
Every material failure ever discovered becomes a permanent regression case or invariant when testable. New candidates must defeat both new scenarios and the historical cemetery.

A fixed bug that can silently return is not closed engineering knowledge.

## Phase 16 — Pareto and tradeoff gate
Compare surviving candidates across protected axes. Reject scalar magic scores for heterogeneous critical properties. Critical correctness/security/authority gates remain non-compensable.

Prefer Pareto improvements. A tradeoff candidate requires an explicit accepted rationale and bounded regression.

## Phase 17 — Proof of improvement
For every accepted material change record:
- prior defect or limitation
- proposed change
- evidence
- expected benefit
- complexity/resource cost
- new risks
- verification/evaluation method
- result

If the benefit cannot be demonstrated or credibly evaluated, it does not count toward saturation.

## Phase 18 — Reconciliation candidate
Build one coherent candidate from only the changes that survived all preceding gates. Remove duplicated experimental structures and update contracts, budgets, evals and migrations together.

## Phase 19 — Independent saturation review A
A fresh review receives the reconciled candidate, evidence map, regression cemetery and quality scenarios. Its job is to discover a material redesign, missing domain or simplification.

If MATERIAL_IMPROVEMENT_FOUND: integrate it and reset saturation to 0/2.
If NO_MATERIAL_IMPROVEMENT: counter becomes 1/2.

## Phase 20 — Independent saturation review B
Use a meaningfully different review lens from A. It must not merely repeat the same checklist.

If MATERIAL_IMPROVEMENT_FOUND: integrate it and reset to 0/2.
If NO_MATERIAL_IMPROVEMENT and A was also clean: counter becomes 2/2.

## Phase 21 — Saturation freeze
Freeze only when all mandatory gates are satisfied and the final counter is 2/2.

Freeze record must include:
- exact candidate/version
- documented search surface
- unresolved noncritical limitations
- rejected alternatives
- resource/quality budgets
- evidence level
- implementation status
- regression suite identity
- reopen triggers

## Reopen triggers
A frozen system reopens when material new evidence appears, including:
- newly discovered capability domain
- critical or repeated regression
- new platform constraint
- materially stronger architecture or algorithm
- provider/model/tool change invalidating assumptions
- security or authority defect
- resource budget violation
- major UX/accessibility failure
- new integration requirement
- implementation evidence disproving architecture assumptions

Reopening is success of the protocol, not failure of the prior freeze.

## Anti-bloat law
Before creating a new canonical primitive, prove why it cannot be represented safely as an existing primitive subtype, policy, extension, derived view, index or contract.

Canonical primitives carry permanent costs: authority semantics, persistence, migrations, testing, documentation and cognitive load.

## Reliability and change budgets
For implemented/release-stage systems, V4 may define reliability/SLO budgets and resource budgets. When critical budgets are exhausted, feature expansion pauses and reliability/performance work takes priority until the gate is restored.

## Android release evidence
Architecture estimates are not device evidence. Release claims require measurements from representative release builds and device tiers. Track at least startup, ANR/crash behavior, memory, rendering responsiveness and relevant battery/background behavior.

## V4 saturation equation
A system is eligible for 2/2 reviews only after:
DOMAIN_COVERAGE
+ QUALITY_SCENARIOS
+ RESEARCH
+ ALTERNATIVES
+ BUILDER
+ FAILURE
+ SIMPLIFIER
+ UNKNOWN_UNKNOWN
+ CROSS_SYSTEM
+ REALITY
+ MOBILE
+ UX_ACCESSIBILITY
+ LONG_HORIZON_COMPOSITION
+ REGRESSION_CEMETERY
+ PARETO_TRADEOFF
+ PROOF_OF_IMPROVEMENT
+ RECONCILIATION

Then and only then:
INDEPENDENT_REVIEW_A
+ INDEPENDENT_REVIEW_B
= SATURATION_FREEZE

## Relationship to Protocol 2.1 and earlier freezes
V4 supersedes Protocol 2.1 for new campaigns after adoption. Earlier saturated systems remain valid historical candidates, not automatically invalid. Before Seven 1.0 they receive a V4 revalidation pass focused on domain coverage, cross-system compatibility, regression cemetery, mobile reality and reopen triggers.

## Application order
1. Self-polish V4 itself before final canonical adoption.
2. Apply V4 to capability #22 onward.
3. Apply V4 to Tool Fabric families.
4. Apply V4 to UI/UX/Brand/Motion and release surfaces.
5. Run V4 cross-system campaign.
6. Revalidate earlier freezes including RPG 4.2 and Titles 4.1.
7. Run whole-Seven V4 saturation before architecture final freeze.
8. Re-run relevant reality/device gates during implementation and release.

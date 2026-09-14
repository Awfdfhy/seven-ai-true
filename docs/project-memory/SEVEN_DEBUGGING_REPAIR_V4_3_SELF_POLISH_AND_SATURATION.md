# Seven Debugging & Repair Fabric — V4.3 Self-Polish and Saturation Record

Status: ARCHITECTURE SATURATED 2/2
Candidate: Seven Debugging & Repair Fabric 1.1
Parent governance: Seven Polishing V4.3 — Maximum Research Loop

## Campaign goal
Push automated debugging/repair beyond symptom-patching toward evidence-governed diagnosis, semantic repair validation, regression learning and low-human-round-trip Repair Bursts suitable for Seven implementation.

## Ground truth
Existing Seven already has Coding Agent, Verification, Tool Fabric, File Fabric, Side-Effect Ledger, Recovery, Benchmark and observability directions. Missing piece was a dedicated debugging authority model, durable diagnostic campaign state, competing hypotheses, reproduction/minimization, semantic patch validation and repair-specific benchmark/holdout governance.

## Research evidence synthesized
The campaign used current evidence from Android performance diagnostics and automated program repair research. Recurrent external findings informing the design:
- current APR agents can produce verbose/overfitted fixes that pass existing tests yet fail intended semantics;
- reproduction and relevant regression-test selection remain major bottlenecks;
- richer debugger/program-analysis tooling is materially preferable to primitive shell-only workflows;
- counterexample-driven iterative test generation can reject overfitted patches and materially improve repair success;
- ANR diagnosis benefits from timeline/trace evidence rather than attributing cause to the final sampled stack frame;
- multi-fault interaction can invalidate single-fault patch assumptions.

## Self-polish rounds
### Round 01 — Reproduction authority
Result: MATERIAL_IMPROVEMENT_FOUND
Added explicit ReproductionContract and probabilistic/environment-bound reproduction states. Prevents `could not reproduce` from becoming `bug absent`.

### Round 02 — Competing hypothesis engine
Result: MATERIAL_IMPROVEMENT_FOUND
Replaced first-plausible-cause behavior with diagnostic hypotheses, predicted observations, disconfirming evidence and information-gain probes.

### Round 03 — Delta/minimization plane
Result: MATERIAL_IMPROVEMENT_FOUND
Added failing-input/state/event-sequence minimization plus commit/config/dependency bisection. Preserves original artifact and minimized reproducer separately.

### Round 04 — Semantic patch validation
Result: MATERIAL_IMPROVEMENT_FOUND
Separated green-test success from semantic correctness. Added counterexample/property/metamorphic/holdout/static-contract evidence and explicit overfit rejection.

### Round 05 — Repair Tournament
Result: MATERIAL_IMPROVEMENT_FOUND
Added competing patch classes and Pareto comparison over correctness, causal fit, blast radius, complexity, resources, migration cost and reversibility.

### Round 06 — Multi-fault interaction
Result: MATERIAL_IMPROVEMENT_FOUND
Removed one-failure/one-defect assumption and added interaction-aware repair verification.

### Round 07 — Flake/race diagnosis
Result: MATERIAL_IMPROVEMENT_FOUND
Added seeded repeated trials, event ordering, lock/wait evidence, happens-before hypotheses and residual-risk notation.

### Round 08 — Android diagnostic integration
Result: MATERIAL_IMPROVEMENT_FOUND
Added ANR/Perfetto/main-thread scheduling/process-death/frame/startup/resource evidence and release-device evidence boundaries.

### Round 09 — State/migration repair
Result: MATERIAL_IMPROVEMENT_FOUND
Added schema/pre-post snapshot/migration journal/interrupted-boundary checks and restart-at-boundary verification.

### Round 10 — Repair Burst orchestration
Result: MATERIAL_IMPROVEMENT_FOUND
Cluster failures by shared causes, fix blockers/shared roots first, parallelize independent probes under Resource Governor, stage coherent patches, then return one evidence bundle. This directly targets lower conversation/message count.

### Round 11 — No-progress and oscillation control
Result: MATERIAL_IMPROVEMENT_FOUND
Added equivalent-patch detection, repeated-fingerprint limits, two-state oscillation detection and evidence-gain stopping/reframing.

### Round 12 — Repair benchmark/holdout system
Result: MATERIAL_IMPROVEMENT_FOUND
Added repair-specific metrics and hidden bug families. No universal scalar score; critical misses remain non-compensable.

### Round 13 — Privacy/minimal diagnostic disclosure
Result: MATERIAL_IMPROVEMENT_FOUND
Added secret redaction and scoped diagnostic artifacts for remote model/tool analysis.

### Round 14 — Simplifier attack
Result: NO_MATERIAL_IMPROVEMENT
Attempted to collapse ReproductionContract into FailureRecord, merge hypotheses with verdicts, remove RepairTransaction, and replace tournament with single-patch flow. Rejected: each simplification removed distinct authority/recovery/anti-overfit behavior or increased ambiguity. Noncanonical views can still merge UI representation without merging authoritative semantics.

## Regression cemetery established
Permanent architecture regression cases include:
1. patch passes original test but violates intended behavior;
2. bug disappears due to disabled assertion/feature rather than repair;
3. unreproduced failure incorrectly closed as absent;
4. first plausible root cause accepted despite contradictory trace;
5. repair introduces migration/restart corruption;
6. race appears fixed in one run but fails seeded stress trials;
7. two interacting faults mask each other;
8. unknown-after-dispatch side effect blindly retried;
9. Android ANR blamed on final frame while earlier accumulated blocking is causal;
10. visual symptom fixed but runtime jank remains;
11. endless repair oscillation consumes compute without information gain;
12. repeated leaf fixes fail because shared upstream defect remains.

## Precommitted benchmark dimensions
- reproduction success
- localization usefulness
- causal diagnosis correctness
- correct-fix rate
- overfit-patch rejection
- regression escape rate
- repair attempts
- no-progress detection
- resource/tool/model cost
- human intervention rate
- Android/device diagnostic success
- semantic holdout performance

## Independent Challenge A — Automated repair / verification lens
Examined: overfitting, insufficient tests, causal traceability, multi-fault interactions, test generation, tool richness, patch validation.
Considered adding a universal confidence score for repair. Rejected because evidence dimensions and C0/C1 constraints are non-compensable.
Considered root-cause proof mandatory for every FIXED state. Rejected because some production defects can be behaviorally proven fixed while ultimate cause remains partially unresolved; architecture already distinguishes `FIXED_CAUSE_PROVEN` from `FIXED_BEHAVIOR_PROVEN_CAUSE_PARTIAL` and `MITIGATED_CAUSE_UNRESOLVED`.
Verdict: NO_MATERIAL_IMPROVEMENT -> 1/2.

## Independent Challenge B — Mobile/operations/human-efficiency lens
Examined: Android lifecycle, ANR traces, intermittent failures, process death, provider/tool uncertainty, rollback, privacy, long repair loops, message-reduction goal.
Considered always running full repository tests after every patch. Rejected as resource-inefficient and counterproductive on mobile; relevant targeted verification precedes broader integration suites, with risk-based escalation.
Considered fully autonomous repair promotion. Rejected: promotion authority remains outside the repair agent and under Verification/permission/release gates.
Considered storing every raw trace forever. Rejected for privacy/storage/resource reasons; retain minimum durable evidence plus hashes/lineage according to policy.
Verdict: NO_MATERIAL_IMPROVEMENT -> 2/2.

## Saturated candidate
**Seven Debugging & Repair Fabric 1.1 — Evidence-Governed Causal Repair Mesh**

Prime operating sequence:
`Capture -> Reproduce -> Minimize -> Diagnose Competing Causes -> Probe -> Causal Verdict -> Repair Tournament -> Transactional Patch -> Counterexample/Regression Validation -> Benchmark/Recovery Verification -> Verdict -> Regression Learning`

## Message-efficiency consequence
The fabric supports **Repair Burst Mode**: many failures from a large implementation patch are captured together, clustered by root/dependency, shared causes repaired first, independent diagnostics parallelized within budgets, fixes staged coherently, then one consolidated verification bundle is returned. This reduces the need for one conversational turn per bug while preserving explicit failure/repair truth.

## Saturation boundary
This is architecture saturation only. The actual debugger adapters, replay harness, test selector, Android trace integration, repair benchmark runner and automatic Repair Burst execution are not yet implemented or device verified.

## Reopen triggers
- implementation evidence contradicts campaign assumptions;
- materially stronger fault localization/replay/APR technique appears;
- repair benchmark exposes overfitting/regression escape;
- Android/provider/tool runtime introduces new failure semantics;
- repair cost or latency violates resource envelope;
- security/authority defect in automated mutation/promotion;
- persistent human intervention bottleneck;
- hidden/holdout bug family exposes systematic blind spot.

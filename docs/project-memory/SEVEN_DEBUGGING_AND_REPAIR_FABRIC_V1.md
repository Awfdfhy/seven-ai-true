# Seven Debugging & Repair Fabric 1.0 — Evidence-Governed Autonomous Repair

Status: V4.3 SELF-POLISH CANDIDATE
Scope: implementation, CI, Android, provider/tool integration, persistence, UI, performance and release debugging.

## Prime law
A disappearing symptom is not proof of a fixed bug. A repair is accepted only when the relevant failure is reproduced or otherwise bounded, the candidate change is causally plausible, required regression evidence passes, and no stronger contradictory evidence remains.

## Purpose
Reduce repeated human debugging loops by turning failures into structured repair campaigns that can capture, reproduce, minimize, diagnose, repair, verify and learn with explicit evidence and bounded autonomy.

## Core lifecycle
`Capture -> Normalize -> Reproduce -> Minimize -> Localize -> Competing Hypotheses -> Evidence Collection -> Root-Cause Verdict -> Repair Tournament -> Transactional Patch -> Targeted Verification -> Relevant Regression -> Benchmark/Resource Check -> Recovery/Rollback Check -> Final Verdict -> Regression Promotion`

## Canonical records
1. FailureRecord — observed symptom, environment, timestamp, artifacts and severity.
2. ReproductionContract — exact preconditions, steps, expected/actual result and reproducibility class.
3. FailureFingerprint — normalized signature across stack, logs, state, build, schema, provider/device identities.
4. DiagnosticHypothesis — proposed causal mechanism with predictions and disconfirming evidence.
5. EvidenceProbe — bounded experiment/trace/test/log/state-diff request.
6. CausalVerdict — SUPPORTED / REFUTED / INCONCLUSIVE / MULTI_CAUSAL / ENVIRONMENTAL.
7. RepairCandidate — patch/rollback/config/schema/policy alternative with blast radius and reversibility.
8. RepairTransaction — staged multi-file/state mutation with checkpoint and rollback metadata.
9. RepairVerificationContract — tests, regressions, benchmarks and holdouts required for acceptance.
10. RepairVerdict — FIXED / MITIGATED / NOT_FIXED / INCONCLUSIVE / REGRESSED / BLOCKED.
11. RegressionArtifact — durable test/invariant/replay case promoted from a material failure.
12. RepairCampaignCheckpoint — durable resume point for interrupted autonomous repair.

## Failure classes
- deterministic functional failure
- intermittent/flaky failure
- crash/exception
- hang/deadlock/ANR
- race/order/concurrency failure
- state corruption
- migration/schema failure
- persistence/process-death failure
- network/provider/tool failure
- timeout/cancellation failure
- side-effect uncertainty
- UI layout/accessibility regression
- visual/motion regression
- performance/jank/startup/resource regression
- security/permission/authority failure
- configuration/environment/build failure
- multi-fault interaction
- unknown

## Reproduction ladder
Prefer the cheapest reliable reproduction path:
1. deterministic unit or contract reproduction
2. focused integration reproduction
3. recorded replay/state fixture
4. property/metamorphic/fuzz reproduction
5. emulator/instrumented reproduction
6. real-device reproduction
7. production/field evidence when necessary

Reproduction states:
- REPRODUCED_DETERMINISTIC
- REPRODUCED_PROBABILISTIC(p, trials)
- REPRODUCED_ENVIRONMENT_BOUND
- NOT_REPRODUCED_WITH_COVERAGE
- NOT_YET_REPRODUCED

`NOT_REPRODUCED` never means `BUG_ABSENT` without a coverage contract.

## Failure minimization
When feasible, reduce failing input/state/trace while preserving the failure:
- test-case shrinking
- delta debugging over inputs/configs/commits/features
- state snapshot reduction
- event-sequence minimization
- dependency/config toggles
- request payload reduction
- UI interaction sequence reduction
- branch/commit bisection

The minimized reproducer becomes preferred evidence but never replaces the original failure artifact.

## Differential Debugging Engine
Compare failing and known-good executions across:
- code/commit
- config/feature flags
- schema/migrations
- persisted state
- model/provider/tool revision
- OS/device/build mode
- locale/theme/font scale/reduced motion
- network/timing/concurrency
- environment/dependencies

Use controlled perturbations and bisection to identify differences with causal leverage rather than merely correlated changes.

## Competing-hypothesis diagnosis
Do not anchor on the first plausible explanation. For material bugs maintain at least two plausible hypotheses when evidence permits. Each hypothesis records:
- predicted observations
- cheap discriminating probe
- supporting evidence
- conflicting evidence
- confidence ceiling based on evidence class

Choose probes by expected diagnostic information gain / cost / risk.

## Traceability-first repair
Every significant action links:
`failure -> reproducer -> hypothesis -> probe -> evidence -> candidate -> patch -> verification -> verdict`.

A repair agent cannot claim root cause from patch success alone.

## Repair Tournament
Generate structurally different repair candidates where useful:
- minimal local correction
- invariant/restoration fix
- state-machine/transaction fix
- rollback/revert
- dependency/config correction
- architectural simplification

Compare by Pareto dimensions:
- semantic correctness
- causal fit
- regression risk
- blast radius
- complexity
- maintainability
- performance/resource cost
- migration/recovery cost
- reversibility

The smallest patch is not automatically best; the largest is not automatically more complete.

## Patch overfitting defense
A patch that passes the original failing test is only a candidate. For material fixes, derive additional evidence from one or more:
- nearby boundary cases
- property/metamorphic tests
- generated counterexamples
- hidden/holdout regressions
- static contract checks
- cross-version replay
- differential behavior against baseline/reference
- independent patch review

Counterexamples that invalidate a candidate are promoted into the campaign test set and, when durable, Regression Cemetery.

## Semantic repair gate
FIXED requires all applicable conditions:
1. original failure addressed under ReproductionContract;
2. causal verdict is sufficiently supported OR the result is explicitly classified as mitigation;
3. targeted tests pass;
4. relevant regression suite passes;
5. no C0/C1 regression;
6. required performance/resource benchmark does not materially regress;
7. migration/recovery/rollback behavior is acceptable when touched;
8. patch does not merely weaken/delete the assertion, test, guard or feature unless that removal is the proven intended correction;
9. side effects and permissions remain valid;
10. verification evidence is bound to exact patch/build/environment identity.

## Repair states
- FIXED_CAUSE_PROVEN
- FIXED_BEHAVIOR_PROVEN_CAUSE_PARTIAL
- MITIGATED_CAUSE_UNRESOLVED
- NOT_FIXED
- REGRESSION_INTRODUCED
- INCONCLUSIVE
- BLOCKED_BY_ENVIRONMENT

Product-facing summaries may simplify wording, but internal evidence state is preserved.

## No-progress detector
Stop/reframe a repair loop when signals include:
- repeated equivalent patch shapes
- same failure fingerprint after N materially distinct candidates
- oscillation between two states
- diagnostics add no information
- flaky evidence exceeds confidence threshold
- resource/time budget exhausted

Actions: widen search surface, request stronger evidence tier, isolate subsystem, rollback, or return BLOCKED/INCONCLUSIVE. Never infinite-loop.

## Multi-fault and interaction handling
Do not assume one failure == one defect. Track fault interaction when:
- fixing A reveals B
- A and B mask each other
- combined patch fails despite individual fixes
- shared state/timing dependency exists

Use interaction-aware verification and avoid prematurely closing the campaign after the first green test.

## Concurrency / race debugging
Support:
- event ordering traces
- lock/wait graphs
- deterministic scheduler/replay when available
- repeated seeded stress runs
- happens-before hypotheses
- state/version assertions
- cancellation/interruption probes

Probabilistic pass requires trial counts and residual-risk notation.

## Persistence / migration debugging
Capture:
- schema/version identity
- pre/post snapshots
- migration journal
- interrupted migration point
- checksums/integrity results
- process-death boundary

Repairs must test restart at intermediate boundaries when materially relevant.

## Android diagnostic plane
Use platform evidence where applicable:
- crash/ANR cluster evidence
- Perfetto/system traces
- main-thread scheduling/blocking state
- frame/jank/startup metrics
- process-death/recreation tests
- memory/resource pressure evidence
- release-build and representative-device confirmation for device claims

Do not attribute an ANR solely to the final stack frame when timeline evidence shows accumulated blocking earlier in the execution.

## UI / visual / motion repair
Bind structural evidence with screenshots/video from V4.3 Visual/Motion planes. Repair campaigns can localize:
- clipping/overlap
- RTL/bidi failures
- font-scale breakage
- theme mismatches
- animation state desync
- reduced-motion regressions
- apparent visual stutter

Visual observations cannot prove runtime jank; align them with frame traces when performance is claimed.

## Provider/tool/network debugging
Separate:
- request construction
- dispatch certainty
- provider transport
- provider semantic response
- schema normalization
- tool execution
- side-effect verification

Never blind-retry UNKNOWN_AFTER_DISPATCH operations without effect reconciliation.

## Diagnostic Tool Mesh
Preferred capabilities, loaded progressively:
- structured logs/event journal
- stack/crash parser
- trace timeline analyzer
- test selector
- property/fuzz/metamorphic runner
- state diff
- code structural search
- dependency/config diff
- git bisect support
- static analyzer/type checker/linter
- profiler/perf trace adapters
- screenshot/video diff
- DB integrity/migration checker
- network/request recorder with secret redaction
- replay harness

Primitive shell-only diagnosis is fallback, not the target architecture.

## Privacy and secret safety
Diagnostics redact credentials/tokens/private payloads by default. Failure artifacts retain minimum necessary data. Remote model/tool analysis receives scoped artifacts rather than raw unrestricted logs when practical.

## Repair Burst mode
For large implementation batches:
1. collect all failures;
2. cluster by likely root cause/dependency;
3. prioritize C0/C1 and blockers;
4. repair shared causes before leaf symptoms;
5. parallelize independent diagnostic branches within Resource Governor limits;
6. stage coherent patch batch;
7. execute impacted regression sets;
8. run final integration/benchmark check;
9. return one evidence bundle rather than one human round-trip per defect.

This is the primary mechanism for reducing conversation/message count during Seven implementation.

## Benchmark contract
Measure the debugging system itself on:
- reproduction success rate
- median probes to useful localization
- root-cause accuracy on labeled cases
- correct-fix rate
- overfit-patch rejection rate
- regression escape rate
- mean repair attempts
- no-progress detection quality
- token/model/tool cost
- wall-clock latency
- human intervention rate
- repair patch size/complexity distribution
- Android/device-specific diagnostic success

No universal scalar Debug Score. C0/C1 misses remain non-compensable.

## Holdouts
Maintain hidden/shadow bug families when feasible, including:
- logic bug
- concurrency race
- state corruption
- migration interruption
- network timeout
- cancellation uncertainty
- Android ANR/performance issue
- UI/RTL regression
- multi-fault interaction

Avoid tuning exclusively to public/simple repair tasks.

## Self-improvement loop
`Failure corpus -> Debug benchmark -> Candidate debugger -> Repair campaigns -> Counterexamples -> New regressions -> Re-benchmark -> V4.3 challenge -> Saturate`

The debugger may propose improvements to its own heuristics/tool selection, but cannot alter locked benchmarks or promote itself. Promotion remains governed by V4.3.

## Integration
- Cognitive Runtime: campaign/run orchestration
- Verification Fabric: repair verdict evidence
- Coding Agent: code inspection/patch execution
- File Fabric: transactional file mutation
- Tool Fabric: diagnostic tools
- Side-Effect Ledger: external/write uncertainty
- Recovery/Integrity: checkpoints/rollback/migrations
- Observability: structured traces
- Benchmark Fabric: repair-system measurement
- Visual/Motion Evidence: UI regression evidence
- Resource Governor: bounded parallelism/expensive probes
- Self-Evolution: candidate heuristic improvement only under eval gates

## Implementation order
1. FailureRecord/ReproductionContract/RepairVerdict schemas
2. campaign state machine and checkpoints
3. test/log/trace ingestion
4. hypothesis/probe ledger
5. repair tournament + transactional patch interface
6. targeted regression selector
7. regression promotion
8. no-progress detector
9. Android/visual/performance adapters
10. benchmark + holdout suites

## Evidence status
Architecture only. Nothing in this document claims the runtime is implemented, tested, device-verified or release-proven.

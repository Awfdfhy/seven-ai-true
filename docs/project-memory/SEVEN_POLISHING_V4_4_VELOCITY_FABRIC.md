# Seven Polishing Protocol V4.4 — Velocity Fabric

Status: CANDIDATE successor to V4.3 Maximum Research Loop
Scope: all architecture, implementation, debugging, benchmark, UI, release and repair campaigns where execution speed can improve without lowering required evidence quality.

## Prime law
**Speed may remove redundant work, reorder work, parallelize independent work, reuse valid evidence, and kill dominated candidates early. Speed may never delete required evidence, weaken C0/C1 gates, hide uncertainty, or promote stale proof.**

V4.4 inherits V4.3 Maximum Research Loop, V4.2 Motion/Expert judgment, V4.1 benchmark governance and the Debugging & Repair Fabric.

The goal is not 'do less testing'. The goal is to determine, benchmark and continuously improve the fastest valid execution path that reaches the same acceptance bar.

---

## 1. Velocity Contract
Every material campaign may define a `VelocityContract` containing:
- task graph identity
- required evidence gates
- criticality classes
- baseline completion path
- candidate execution strategies
- dependency graph
- safe parallelism constraints
- cache/evidence reuse rules
- invalidation rules
- early-kill rules
- resource envelope
- maximum concurrency
- quality equivalence criteria
- holdout/release checks
- measurement repetitions when variance is material

No strategy can be declared faster unless its final evidence bundle is quality-equivalent for the locked contract.

## 2. Strategy Tournament
For eligible campaigns, Seven may test multiple execution strategies against the same locked objective.

Candidate strategies may include:
1. conservative sequential full path
2. dependency-aware parallel path
3. incremental impact-selected path
4. cache-heavy reuse path
5. fast-first then deep-escalation path
6. critical-path optimized path
7. fused mega-campaign path
8. repair-burst path
9. hybrid adaptive path

Each candidate records:
- wall-clock duration
- CPU/resource use where relevant
- number of expensive operations
- test/evidence coverage
- fault discovery latency
- regressions detected/missed
- retries/flakes
- cache hit rate
- research/evaluator calls
- uncertainty and blocked gates

Winner selection is constrained optimization, not pure speed ranking.

### Winner law
The fastest candidate wins only when:
- all mandatory C0/C1 criteria remain satisfied;
- required evidence tiers are met;
- no material regression is hidden;
- uncertainty is not increased beyond the contract ceiling;
- comparison is sufficiently reproducible.

If the fastest path misses a required issue, it is disqualified even if dramatically faster.

---

## 3. Incremental Proof Graph
V4.4 introduces `ProofNode` and `ProofDependency`.

A ProofNode binds:
- claim/criterion
- supporting evidence identity
- source/input hashes
- environment identity
- evaluator/tool version
- validity window
- dependencies
- invalidation predicates

After a change, Seven computes an `ImpactSet` and invalidates only proof nodes whose dependencies may have changed.

Unchanged proof is reused only if:
- input identity still matches;
- environment/evaluator constraints remain valid;
- no transitive dependency changed;
- freshness requirements remain satisfied.

This supports selective revalidation without pretending stale evidence is current.

---

## 4. Impact-Aware Test and Evidence Selection
V4.4 supports risk-bounded selection/prioritization based on:
- changed files/symbols/contracts
- dependency graph
- historical failure relationships
- runtime coverage when trustworthy
- static dependency analysis
- feature ownership
- criticality
- recent flaky behavior
- prior regression cemetery cases
- side-effect boundaries
- migration/schema/state changes
- UI journey dependencies

Selected tests run first for rapid feedback. Full or broader suites remain mandatory at release/high-risk boundaries according to the locked contract.

`SELECTED_TEST_PASS != FULL_RELEASE_PASS`.

Flaky tests are not silently excluded. Their evidence reliability is tracked separately.

---

## 5. Critical-Path Scheduler
Represent eligible campaign work as a DAG.

Scheduler goals:
- identify the longest/most constraining path;
- start high-unlock-value work early;
- parallelize independent nodes;
- avoid concurrency that corrupts shared state;
- avoid starting expensive downstream tasks for candidates likely to fail cheap gates;
- keep scarce tools/devices on tasks where they change the decision.

The scheduler may split or fuse tasks only when correctness and traceability survive the transformation.

---

## 6. Cheap-to-Expensive Escalation
Default staged pipeline:
1. static/deterministic checks
2. focused lint/type/schema/contract checks
3. affected unit/property tests
4. regression-cemetery tests
5. focused integration tests
6. selected benchmarks / screenshot checks
7. broad integration/e2e
8. emulator/device or full visual-motion evaluation
9. release/holdout evidence

A cheap failure kills or repairs the candidate before expensive stages unless evidence collection requires escalation to diagnose the failure.

C0/C1 rules can force immediate deep checks.

---

## 7. Early Kill / Dominance Pruning
A candidate is removed from the tournament when any of these is proven:
- C0 violation
- unrecoverable C1 regression
- strictly dominated by another candidate on all relevant axes
- violates resource envelope
- requires materially more complexity for no compensating value
- fails a mandatory invariant
- cannot produce required evidence

Early kill records why it was safe to stop.

---

## 8. Evidence and Artifact Cache
Reusable artifacts may include:
- deterministic test outputs
- compile/build artifacts
- research SourceVersions
- benchmark results under matching environment
- screenshots/video keyed by build+scenario+device metadata
- parsed/indexed source representations
- dependency/impact graphs
- evaluator outputs keyed by artifact/evaluator/rubric identity

Cache validity is content-addressed where practical.

Cache hits never override invalidation predicates.

A cache whose correctness cannot be established is a performance hint, not proof.

---

## 9. Campaign Fusion
Closely coupled capabilities can be processed as a Mega-Campaign when shared work is substantial.

Fusion eligibility:
- overlapping research/search surface
- shared contracts/evidence
- shared state or lifecycle
- common device/benchmark matrix
- cross-system bugs more visible together

Fusion is rejected when it:
- makes root causes materially harder to isolate
- causes unsafe blast radius
- obscures authoritative ownership
- exceeds rollback/recovery capability
- creates review sizes too large to validate reliably

Campaign fusion therefore optimizes shared work, not message count at any cost.

---

## 10. Repair Burst Integration
Velocity Fabric integrates Seven Debugging & Repair Fabric.

A batch failure set is:
1. clustered by likely cause/dependency;
2. ranked by fan-out and criticality;
3. repaired root-cause-first;
4. validated through impact-selected tests;
5. escalated to broad regression once the batch stabilizes.

This prevents N visible failures caused by one defect from generating N isolated repair cycles.

---

## 11. Research Velocity
V4.3 Maximum Research remains quality authority.

V4.4 accelerates it through:
- parallel evidence lanes
- source/version cache
- query result deduplication
- shared evidence across related decisions
- early contradiction detection
- targeted snowballing from highest-information seeds
- stopping by marginal information gain
- research surface fusion across related capabilities

It does not replace broad research with fewer sources merely for speed.

---

## 12. UI / Motion Velocity
UI campaigns may reuse stable structural and visual artifacts by identity and selectively recapture affected journeys.

Examples:
- typography token change invalidates screens using token, not unrelated runtime tests;
- animation timing change invalidates relevant motion clips and runtime timing measurements, not every static screenshot;
- RTL layout change escalates Arabic/RTL journeys first;
- global design-token change may intentionally invalidate the full visual corpus.

Golden updates remain explicit and cannot be auto-approved to make the suite faster.

---

## 13. Velocity Benchmark
The system must test whether a 'faster' strategy is truly faster and equally trustworthy.

### Core metrics
- time-to-first-material-failure
- time-to-actionable-diagnosis
- time-to-valid-pass
- wall-clock campaign time
- work avoided safely
- cache hit rate
- parallel utilization
- critical-path length
- test/evidence selection ratio
- missed-defect count on shadow/holdout
- false-negative / false-positive rate when estimable
- flake amplification
- rework/rollback count
- resource cost

### Quality guard metrics
- invariant coverage
- regression-cemetery coverage
- C0/C1 criterion coverage
- evidence-tier sufficiency
- uncertainty delta
- holdout defect detection

No scalar 'velocity score' may hide a quality regression.

---

## 14. Fastest Valid Path Search
V4.4 may actively search for the fastest completion strategy.

Process:
1. lock objective and quality gates;
2. generate candidate execution DAGs;
3. estimate critical path and cost;
4. reject unsafe schedules statically;
5. run cheap simulation/replay/history evaluation where possible;
6. benchmark viable strategies on comparable workloads;
7. promote best valid strategy;
8. retain runner-up for fallback when environment changes;
9. periodically re-benchmark because project shape changes.

Candidate strategies may adapt over time but cannot mutate the benchmark or acceptance gates during the comparison.

---

## 15. Adaptive Parallelism
More parallelism is not automatically faster.

The scheduler considers:
- CPU/RAM pressure
- network/provider quotas
- device/emulator availability
- contention on shared files/databases
- thermal pressure on Android
- duplicate expensive model/tool calls
- dependency waits

Concurrency is increased only while marginal throughput improves without destabilizing evidence.

---

## 16. No-Progress / Waste Detector
Detect:
- repeated equivalent searches
- repeated unchanged tests
- low-value reruns
- serial execution of independent tasks
- repeated artifact parsing
- repair oscillation
- benchmark repetition beyond variance need
- over-broad validation after small isolated change
- under-broad validation after high-blast-radius change

Every detected waste pattern can become a permanent optimization rule after verification.

---

## 17. Release Boundary
Fast paths are strongest during iteration.

Release evidence remains separately governed. Depending on risk, release may still require:
- broad/full regression
- clean build
- clean install
- migration/import/export recovery
- representative-device checks
- screenshot/motion gates
- security/permission/side-effect checks
- release artifact verification

Iteration proof cannot silently substitute for release proof.

---

## 18. Self-Optimization Loop
Velocity Fabric itself participates in The Loop:

`Measure -> Find waste -> Generate faster path -> Benchmark quality-equivalent candidates -> Integrate winner -> Re-measure`

A new optimization is accepted only when it demonstrates material time/resource improvement without material quality loss.

Two independent clean challenge rounds are required for architecture saturation.

---

## 19. Research grounding
Current engineering evidence supports the core direction:
- Gradle incremental builds avoid work when task inputs/outputs are unchanged.
- Gradle build cache reuses prior task outputs, while configuration cache can skip the configuration phase and enables additional parallel execution.
- regression-test prioritization research targets earlier fault detection and lower feedback latency; recent work also shows the importance of accounting for flaky tests.
- 2024 ASE work on hybrid regression test selection reported lower end-to-end testing time while explicitly measuring selection safety.
- 2026 CI/CD research models pipelines as dependency DAGs and evaluates parallelization/splitting/merging against overall duration.

These are design inputs, not proof that Seven's eventual implementation has achieved the same gains.

## Architecture status
Candidate for V4.4 self-polish and saturation challenge. Not implemented, tested, device-verified, or release-proven.

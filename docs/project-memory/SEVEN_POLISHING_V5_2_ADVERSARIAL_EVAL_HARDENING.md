# Seven Polishing V5.2 — Adversarial Evaluation & Deployment Hardening

Status: ARCHITECTURE_CANDIDATE
Parent: Seven Polishing V5.1

## Why V5.2 exists
V5.1 still permits a dangerous failure mode: a candidate can look superior under a benchmark while exploiting evaluator weakness, contamination, stateful-runtime blind spots, unstable one-off successes, hidden dependency assumptions, or unrealistic deployment conditions. V5.2 treats the evaluation system itself as an adversarial surface.

## Prime rule
A candidate does not pass because it scores well. It passes only when the score is supported by a valid workload, valid oracle, valid process evidence, valid exposure boundary, repeated stability, and deployment-relevant constraints.

## 1. Evaluation Attack Surface Model
Every campaign builds an EvaluationAttackSurface containing:
- task exposure/leakage risk
- grader/oracle exploitability
- tool/runtime shortcuts
- environment escape routes
- benchmark-specific lookup risk
- state persistence assumptions
- external service dependencies
- evaluator correlation risk
- hidden test exposure risk
- task-order dependence
- retry/selection bias
- measurement blind spots

No promotion proceeds while a material attack surface is unassessed.

## 2. Outcome + Trajectory + State Triple
The evaluation unit is not only final output. For agentic/runtime tasks, bind:
- final outcome
- action/tool trajectory
- authoritative state changes

A correct final answer with invalid state transitions, forbidden side effects, hidden shortcuts, or broken recovery is not equivalent to a correct run.

## 3. Strict Multi-Trial Stability
For stochastic capabilities, report at minimum:
- strict repeated-pass rate
- any-pass rate
- variance/failure modes
- retry count
- cost/latency distribution

One lucky success cannot establish reliability. Promotion criteria precommit whether strict-pass, percentile, bounded variance or other repetition semantics are required.

## 4. Grader Gaming Defense
Red-team candidates explicitly attempt to satisfy the oracle without fulfilling the task contract. Attack families include:
- test-specific behavior
- disabling/avoiding checks
- alternate side effects that fool completion detection
- exploiting malformed task wording
- exploiting stale environment state
- answer lookup/leakage paths
- superficial format compliance while violating semantics

If the grader rewards a known-cheating candidate, evaluator integrity is failed.

## 5. Contamination & Exposure Ledger
Each benchmark/eval family records:
- publication/exposure status
- known candidate access paths
- training/fine-tune exposure uncertainty
- derived/generated relationship to public tasks
- contamination suspicion/evidence
- mitigation strategy and its fidelity cost

Public benchmark success is never treated as equivalent to fresh hidden generalization evidence.

## 6. Dynamic & Isomorphic Challenge Layer
Use fresh task instances, semantic-preserving perturbations, metamorphic transformations, parameterized task generation and environment variation where valid. Transformations must preserve the intended contract and be validated for fidelity; merely rewriting questions is not assumed contamination-resistant.

## 7. Frozen Holdout + Rotating Shadow
Two complementary partitions:
- Frozen Holdout: stable, sealed ranking/reference set with strict access controls.
- Rotating Shadow: periodically refreshed unseen tasks used to detect adaptation to the frozen set.

A candidate must not optimize directly against either partition.

## 8. Hidden Dependency Trap Tests
Construct cases where success depends on assumptions usually invisible in ordinary benchmarks:
- network unavailable/slow
- provider timeout/rate limit
- stale cache
- partial persistence
- process death/restart
- corrupted derived state
- tool schema/version change
- locale/RTL/theme differences
- low-memory pressure
- task order/state leakage
- unavailable optional capability

The purpose is to reveal solutions that work only in a pampered lab environment.

## 9. Deployment Reality Matrix
For material product claims, evaluate relevant combinations of:
- representative Android device tiers
- memory pressure
- battery/resource budgets
- cold/warm start
- offline/degraded network
- provider degradation
- interrupted runs
- long conversations/workflows
- Arabic/RTL
- accessibility/reduced motion
- storage growth

Benchmark success without deployment evidence is explicitly labeled BENCHMARK_LOCAL.

## 10. Oracle Strength Classification
Every evaluator/oracle is classified by strength:
- O0 heuristic proxy
- O1 shallow structural check
- O2 deterministic contract check
- O3 state-aware semantic check
- O4 independently reconstructed ground truth

Promotion claims cannot exceed the oracle strength that supports them.

## 11. Correlated Judge Failure Defense
A Judge Council is not independent merely because it contains multiple calls/models. Track shared:
- model family
- provider
- prompt template
- training provenance when known
- rubric
- evidence source

Highly correlated judges are treated as one evidence family for independence claims.

## 12. Blind Reproduction
For high-value promotions, a separate evaluator reruns the task from the locked manifest without access to Builder reasoning or prior trajectory unless the task contract requires it. Failure to reproduce downgrades the claim.

## 13. Adversarial Task Selection
Do not sample only average cases. Maintain challenge buckets for:
- boundary conditions
- rare workflows
- historically failed cases
- high-blast-radius operations
- long-horizon drift
- ambiguous instructions
- misleading but legal tool outputs
- cancellation/retry ambiguity
- state inconsistency

## 14. State Isolation & Order-Dependence Tests
Run selected task families under:
- clean state
- shuffled order
- repeated order
- prior-failure residue
- restart between tasks

If outcomes depend materially on hidden task order or leftover state, mark ORDER_DEPENDENT or STATE_LEAK.

## 15. Evidence Quarantine
Suspect evidence is not deleted. It is quarantined with a reason:
- contamination
- evaluator bug
- environment mismatch
- incomplete trace
- stale version
- non-reproducible
- hidden dependency

Quarantined evidence cannot promote a candidate until revalidated.

## 16. Evaluation Constitution Hash
Promotion binds a hash/version of:
- task contract
- benchmark manifests
- oracle code/version
- judge policy
- resource envelope
- environment profile
- contamination policy
- repetition rules

Changing any material element invalidates direct comparability unless explicitly bridged by a migration study.

## 17. Unknown-Unknown Budget
Every campaign reserves effort for tests not derived from known failure lists. Sources may include independent reviewers, random scenario generation, cross-domain transfer, external research, mutation testing and fresh user-like workflows. Saturation cannot be claimed if all challenges are descendants of the same known taxonomy.

## 18. Deployment Gap Verdicts
Final result must distinguish:
- BENCHMARK_LOCAL_IMPROVEMENT
- TRANSFER_SUPPORTED_IMPROVEMENT
- DEPLOYMENT_SUPPORTED_IMPROVEMENT
- RELEASE_PROVEN_IMPROVEMENT

No lower verdict may be rhetorically promoted to a higher one.

## 19. Failure Preservation
Store minimal reproducible failure evidence for every material rejected candidate. A later version must demonstrate whether the failure is fixed, intentionally out of scope, or still unresolved. Regressions cannot disappear from history because the benchmark changed.

## 20. Anti-Selection-Bias Rule
Candidate families, seeds, retries, judge reruns, discarded trials and stopping criteria are recorded. Choosing the best-looking subset after observing outcomes without a precommitted rule invalidates the claimed comparison.

## 21. Mobile Resource Non-Compensation
For Seven mobile targets, correctness gains cannot silently compensate for catastrophic RAM, startup, battery, storage or background-work regression. Resource ceilings remain non-compensable where specified by the target contract.

## 22. Promotion Blockers
Promotion is blocked by any unresolved:
- C0 violation
- invalid evaluator/oracle
- material contamination without valid fresh evidence
- grader gaming path that changes verdict
- unreconciled state leak/order dependence
- inability to reproduce a critical claimed gain
- deployment-critical hidden dependency
- rollback/recovery failure where required

## 23. V4.4 Velocity interaction
Velocity optimizes the schedule only after the EvaluationAttackSurface and constitution are locked. Cache/impact-selection/parallelism must preserve contamination boundaries, state isolation and trial independence. A faster path that increases evaluator gaming or state leakage is invalid.

## 24. Saturation hardening
Before 2/2 saturation, require at least:
- one evaluator-red-team challenge
- one contamination/exposure challenge
- one hidden-dependency/deployment challenge
- one state/order challenge
- one unknown-unknown challenge not generated from the incumbent's own failure taxonomy

Two consecutive NO_MATERIAL_IMPROVEMENT results count only after all mandatory challenge classes have valid evidence.

## Evidence boundary
This document is architecture. It does not prove these harnesses, holdouts, Android device matrices, trace scorers or contamination detectors are implemented.
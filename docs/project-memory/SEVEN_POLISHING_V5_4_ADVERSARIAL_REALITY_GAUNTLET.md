# Seven Polishing V5.4 — Adversarial Reality Gauntlet

Status: ARCHITECTURE_CANDIDATE
Parent: V5.3 Formal Promotion Constitution

## Purpose
V5.4 assumes every apparently good improvement may be an evaluation artifact until it survives independent evidence. It hardens the improvement process against false progress caused by benchmark exposure, correlated evaluators, stochastic luck, environment mismatch, hidden dependencies, tail failures, resource collapse, and excessive architectural complexity.

## Prime rule
A candidate does not earn promotion by looking better. It must remain better when the easiest explanations for its gain are systematically removed.

## 1. Evidence Triangulation
Material claims require multiple evidence channels when feasible:
- executable or deterministic oracle;
- observable state/outcome evidence;
- independent evaluator evidence;
- transfer/holdout evidence;
- deployment or representative-environment evidence for deployment claims.

Narrative reasoning traces are never treated as ground truth. Claims about internal reasoning must not be promoted merely because a model describes them convincingly.

## 2. Search and Benchmark Isolation
Research-capable agents can encounter public benchmark material during search. Therefore each evaluation records a SearchExposureManifest describing allowed retrieval, blocked benchmark domains/artifacts where practical, encountered benchmark identifiers, and contamination uncertainty.

A public benchmark win cannot alone prove general reasoning improvement. Contaminated or uncertain cases are downgraded or quarantined and replaced with fresh evidence where feasible.

## 3. Counterfactual Attribution
For every major claimed gain, attempt ablations or matched comparisons that remove the proposed cause. If performance remains unchanged, causal attribution is weakened. If the candidate depends on unrelated changes, the claim is decomposed rather than credited wholesale.

## 4. Metamorphic and Invariance Tests
Where a correct answer should survive semantics-preserving transformations, test transformations such as ordering, formatting, naming, irrelevant context, equivalent representations, locale/theme direction where relevant, and harmless timing variation. Brittle gains that disappear under irrelevant transformations cannot support broad claims.

## 5. Dependency Shock Tests
Candidates are challenged under valid perturbations of dependencies:
- provider/model revision change;
- tool latency/failure;
- network degradation/offline mode where supported;
- cache cold/warm differences;
- process restart;
- partial persistence/recovery boundaries;
- schema/version drift;
- low-memory/resource pressure;
- reduced-motion/accessibility/RTL variants where relevant.

The target contract determines which shocks are valid. Irrelevant torture tests are forbidden.

## 6. Tail-Risk Gate
Mean performance cannot hide catastrophic tails. Relevant metrics include failure density, worst credible scenario families, P95/P99 latency where meaningful, repeated-trial variance, recovery failure rate, and critical invariant violations. C0 failures are non-compensable.

## 7. Resource Reality Gate
For mobile-facing improvements, evaluate release-like builds and representative constrained devices before making device claims. Track startup, jank/frame timing, memory pressure, GC behavior, ANR/process exits where available, battery/CPU/network cost, storage growth, and idle work. Debug-build speed is not release proof.

## 8. Complexity Budget and Simplifier Duel
Every candidate receives a ComplexityDelta covering state, coupling, branches, background work, dependencies, storage, migration surface, test burden, recovery burden, and cognitive maintenance cost. A Simplifier candidate competes explicitly. Equal value with materially lower complexity wins.

## 9. Evaluator Independence Graph
Evaluator independence is modeled rather than assumed. Shared model family, prompt ancestry, training/source exposure, oracle dependency, or common derived evidence reduces independence credit. Agreement among correlated judges is not counted as multiple independent proofs.

## 10. Judge Robustness Probes
Judges are calibrated with known-valid, known-invalid, near-miss, simpler-equivalent, stochastic, and misleadingly polished candidates. Observable actions/state outrank self-reported rationale. A judge that fails calibration is quarantined from promotion authority until repaired and revalidated.

## 11. Sequential Statistical Discipline
Repeated evaluation cannot stop opportunistically after a lucky streak. Trial count/stopping rules are precommitted where stochastic evidence is material. Multiple candidate comparisons require correction or fresh confirmation so repeated searching does not manufacture a winner.

## 12. Freshness and Drift
Evidence has identity, date/version, environment and expiration rules. Provider changes, Android/runtime changes, benchmark leakage, dependency updates, or target-contract changes invalidate only affected evidence through the ProofGraph, but release claims require sufficiently fresh evidence.

## 13. Shadow Deployment Boundary
When safe and available, a candidate may run in shadow with no side-effect authority. Shadow observations can test distribution realism but cannot silently become permission or promotion authority. User-visible or irreversible effects remain governed by the Authority/Effect fabrics.

## 14. Recovery and Reversibility Gate
A promoted executable change needs rollback/recovery evidence proportional to risk. Improvement that performs better only while healthy but makes recovery materially worse may be rejected.

## 15. Cross-Generation Ratchet
Every promoted generation inherits permanent regression families and the strongest valid evaluator protections from previous generations. A protection may be removed only when stronger coverage demonstrably subsumes it. Removal itself is a material constitutional change and resets saturation evidence.

## 16. Hostility Escalation
The next recursive generation must increase at least one relevant difficulty dimension without weakening another critical one. Examples: fresher holdouts, harder transfer distance, lower-resource device class, longer horizon, stronger dependency perturbation, better calibrated evaluator, or more independent oracle.

## 17. Saturation Standard
Saturation begins only after all known material gaps are integrated and the constitution is stable. Then two independent consecutive challenge rounds must find NO_MATERIAL_IMPROVEMENT. Any constitutional/material improvement resets the count to zero.

## Truth boundary
V5.4 is an architecture candidate. Its existence does not prove the runtime, benchmarks, mobile harness, evaluator graph, isolation controls, shadow system, statistical harness, or recursive improvement executor are implemented.
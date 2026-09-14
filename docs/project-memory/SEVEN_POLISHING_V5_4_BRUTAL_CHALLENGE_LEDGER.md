# Seven Polishing V5.4 — Brutal Challenge Ledger

Status: MATERIAL_IMPROVEMENT_FOUND
Parent under attack: V5.3

This ledger records architecture gaps found by attacking the successor rather than assuming its promotion constitution was sufficient.

## Material findings
1. Public-search contamination can occur at inference time, not only during training or benchmark authoring. Added SearchExposureManifest and isolation/quarantine semantics.
2. Model-generated reasoning narratives are not reliable ground truth for judging trajectories. Added observable-state/action priority and evidence triangulation.
3. A benchmark gain can be causally misattributed to the advertised mechanism. Added counterfactual ablation/matched attribution.
4. Candidates can overfit incidental representation. Added metamorphic/invariance testing.
5. Stable laboratory dependencies can hide provider/tool/network/cache/schema fragility. Added dependency shock testing.
6. Mean metrics can hide catastrophic tails. Added tail-risk/failure-density gates and critical non-compensation.
7. Mobile quality claims can be invalidated by release/device behavior. Added release-like constrained-device resource reality gate.
8. Architectural growth can masquerade as sophistication. Added explicit ComplexityDelta and mandatory Simplifier Duel.
9. Judge plurality can be fake when evaluators share ancestry/evidence. Added Evaluator Independence Graph.
10. Judges can reward polished explanations rather than observable correctness. Added robustness probes and quarantine semantics.
11. Repeated stochastic evaluation can select lucky candidates. Added precommitted sequential stopping and multiple-comparison discipline.
12. Old evidence can silently survive environment drift. Added freshness/expiry/version invalidation through ProofGraph.
13. Distribution realism is weak without production-like observations. Added safe no-side-effect shadow boundary where available.
14. A faster/better happy path can worsen rollback and recovery. Added recovery/reversibility promotion gate.
15. Later recursive generations can accidentally drop earlier protections. Added cross-generation ratchet.
16. Hostility can grow cosmetically instead of materially. Added requirement that each generation harden a relevant dimension without weakening critical dimensions.
17. Saturation evidence becomes invalid when the constitution materially changes. Reaffirmed reset-to-zero rule.

## Research-grounded pressure
Current external evidence reinforced three attacks:
- search-capable research agents can retrieve benchmark-related material at inference time, inflating public benchmark performance;
- LLM judges that rely on reasoning traces can be misled when those narratives are not faithful to observable actions/state;
- Android performance evidence should use release-like builds, representative constrained devices and metrics for startup, jank, memory and resource behavior rather than debug impressions.

These sources inform architecture pressure but do not by themselves prove Seven V5.4 works.

## Verdict
V5.3: NOT SATURATED.
V5.4: ARCHITECTURE_CANDIDATE.
Saturation counter: 0/2.

Next attack should target V5.4 itself, especially evaluator collusion/common-mode failure, benchmark generator leakage, adversarial distribution selection, proof-cache poisoning/staleness, long-horizon recursive drift, and whether the system can simplify its own evaluation cost without losing defect detection.
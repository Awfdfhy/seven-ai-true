# Seven Polishing V5.2 — Brutal Challenge Ledger

Status: MATERIAL_IMPROVEMENT_FOUND

This ledger records architectural attack rounds against V5.1. These are design challenges, not runtime benchmark executions.

## Round 01 — Grader Gaming
Finding: V5.1 did not explicitly require adversarial candidates designed to satisfy the grader while violating task intent.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: EvaluationAttackSurface + grader-gaming red team + evaluator-failure blocker.

## Round 02 — Contamination False Confidence
Finding: public/static benchmark success could still be rhetorically over-read despite generic contamination awareness.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: Contamination & Exposure Ledger + Frozen Holdout + Rotating Shadow + explicit verdict hierarchy.

## Round 03 — Final-Answer Blindness
Finding: outcome success could conceal invalid tool trajectories, state corruption or forbidden side effects.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: Outcome + Trajectory + State evaluation triple.

## Round 04 — Lucky-Run Inflation
Finding: stochastic systems can look excellent under any-pass reporting while being unreliable under strict repeated execution.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: strict multi-trial stability, any-pass/strict-pass separation, variance and retry accounting.

## Round 05 — Correlated Judge Illusion
Finding: multiple judges can fail identically when they share model family, provider, rubric and evidence source.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: correlated-judge provenance and evidence-family collapsing.

## Round 06 — Hidden Dependency Collapse
Finding: lab-successful candidates may depend on network, warm caches, provider availability, stable schemas or persistent process state.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: Hidden Dependency Trap Tests and Deployment Reality Matrix.

## Round 07 — Order/State Leakage
Finding: evaluation order and residue can inflate or destroy results without being visible in ordinary benchmark summaries.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: clean/shuffled/repeated/restart order tests and STATE_LEAK / ORDER_DEPENDENT verdicts.

## Round 08 — Weak Oracle Ceiling
Finding: the strength of the claim could exceed the strength of the evaluator that produced it.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: Oracle Strength Classification O0–O4 and claim ceiling.

## Round 09 — Selection Bias
Finding: repeated seeds/retries/judge reruns can be cherry-picked after results.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: Anti-Selection-Bias Rule with retained trial/stopping metadata.

## Round 10 — Evidence Laundering
Finding: suspect evidence might continue contributing implicitly after benchmark/evaluator changes.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: Evidence Quarantine and Evaluation Constitution Hash.

## Round 11 — Unknown-Unknown Starvation
Finding: a system that only attacks known taxonomies can saturate against its own imagination.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: mandatory independent Unknown-Unknown Budget before saturation.

## Round 12 — Benchmark-to-Deployment Gap
Finding: benchmark scores can remain disconnected from mobile product viability.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: BENCHMARK_LOCAL → TRANSFER_SUPPORTED → DEPLOYMENT_SUPPORTED → RELEASE_PROVEN verdict ladder.

## Round 13 — Mobile Resource Collapse
Finding: gains can be real but unacceptable if they destroy Seven's mobile constraints.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: non-compensable RAM/startup/battery/storage/background-work ceilings where specified.

## Round 14 — Regression Amnesia
Finding: changed benchmarks can make old failures disappear from the visible evaluation surface.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: permanent minimal failure evidence and explicit resolution state.

## Round 15 — Saturation Gaming
Finding: two no-improvement rounds could be generated from the same worldview and therefore be falsely independent.
Verdict: MATERIAL_IMPROVEMENT_FOUND.
Integration: mandatory evaluator, contamination, hidden-dependency, state/order and independent unknown-unknown challenge classes before 2/2 saturation.

## Current result
V5.1 does NOT satisfy saturation. V5.2 is a materially stronger architecture candidate. The campaign remains open; no claim of empirical superiority is made until executable evaluation infrastructure exists or architecture-level independent challenges stop finding material gaps under the documented scope.
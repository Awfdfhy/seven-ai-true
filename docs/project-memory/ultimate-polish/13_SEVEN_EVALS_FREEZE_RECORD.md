# Seven AI — Capability 13 Seven Evals Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**
Implementation status: **Deferred / baseline corpus and eval-lock foundations remain**

## Frozen target

**Seven Evals 3.0 — Version-Locked Multi-Axis Measurement Observatory**

## Prime law

> An evaluation result is meaningful only under a version-locked measurement contract. Corpus drift, environment drift, grader drift, model/provider drift and unmeasured dimensions remain explicit; critical regressions cannot be averaged away by higher headline scores.

## Scope of this freeze

This freezes Seven's system-level evaluation architecture. It does not claim that all holdouts, real-phone runs, live-provider measurements, statistical reports or Capability 14 evolution integrations are already implemented.

## Final reconciled decisions

1. Preserve and extend the current eval-lock and `UNMEASURED` discipline.
2. Long-lived `EvaluationProgram` objects define what is being measured and why.
3. `EvalSuite` versions bind case manifests, graders, environments, trial policy and known limitations.
4. `EvalIdentity` binds candidate/baseline artifact, suite/corpus, grader, runtime, model/provider, environment/device, policy/config and protocol versions.
5. Materially different identities are not silently treated as directly comparable.
6. `EvalCase` defines requirements, affordances, graders, limits, tags and provenance.
7. `Trial` is one immutable attempt under a fixed EvalIdentity.
8. Stochastic model/agent tasks may require repeated trials rather than one run.
9. Metrics remain separated by outcome quality, reliability, efficiency, device/resource and safety/integrity meaning.
10. Seven does not collapse all metrics into one universal canonical score.
11. Critical invariants are release gates rather than weighted score components.
12. Aggregate reports remain stratified by capability/category/mode/locale/device/provider/model where relevant.
13. Important worst-group behavior remains visible.
14. Sample counts and statistical uncertainty are recorded for stochastic measurements where meaningful.
15. Candidate comparison reports deltas, uncertainty, critical regressions and non-comparable dimensions.
16. Corpus/grader/environment/weighting mutations require a deliberate version change or invalidate comparison.
17. Public development cases are supplemented by shadow/holdout/live tracks where useful.
18. Contamination/exposure state is explicit and weakens capability-claim interpretation when appropriate.
19. Benchmark affordances such as network/tool/file access are part of the protocol identity.
20. Graders may combine deterministic contracts, executable tests, state checks, device measurements, Capability 12 judges and sampled human review.
21. Eval cases/graders are themselves evaluated for false decisions, loopholes, ambiguity and flakiness.
22. Trace audit sampling prioritizes surprising outcomes, disagreement, critical boundaries, new revisions and random controls.
23. Flakiness is classified and measured rather than automatically ignored.
24. Real-phone resource claims require a real `DeviceProfile` and measurement protocol.
25. Emulator results remain separate from real-phone truth.
26. Live-provider quality/availability claims bind model/provider/configuration and a time window.
27. Arabic remains a first-class evaluation stratum and severe Arabic regressions are not averaged away.
28. Suites have lifecycle states for diagnostic use, saturation, regression-only use, quarantine and retirement.
29. Longitudinal reports mark suite/protocol discontinuities explicitly.
30. Release/promotion decisions consume required suites, critical gates, deltas, evidence minima and unmeasured blockers.
31. Heavy eval work runs at CI/release/promotion boundaries, not normal app startup.

## Canonical objects

- `EvaluationProgram`
- `EvalSuite`
- `EvalIdentity`
- `EvalCase`
- `AffordanceContract`
- `TrialPolicy`
- `Trial`
- `GraderSpec`
- `MetricSpec`
- `DeviceProfile`
- `LiveProviderProfile`
- `EvalRun`
- `EvalRunSummary`
- `BaselineComparison`
- `EvalAuditSample`
- `SuiteHealthSnapshot`
- `ReleaseDecision`

## Comparison summaries

- `BETTER`
- `WORSE`
- `MIXED`
- `NO_MATERIAL_CHANGE`
- `NON_COMPARABLE`

## Release decisions

- `PROMOTE`
- `PROMOTE_WITH_MONITORING`
- `HOLD`
- `REJECT`
- `INSUFFICIENT_EVIDENCE`

## Suite lifecycle

- `ACTIVE_DIAGNOSTIC`
- `ACTIVE_REGRESSION`
- `SATURATING`
- `SATURATED_REGRESSION_ONLY`
- `RETIRED`
- `QUARANTINED`

## Frozen invariants

1. `UNMEASURED` never becomes PASS by inference.
2. Comparisons require compatible locked identities.
3. Corpus/grader/environment changes are versioned.
4. Critical regressions cannot be averaged away.
5. No universal one-number Seven score becomes canonical truth.
6. Stochastic performance records trial counts/uncertainty.
7. Public development results are not the sole promotion evidence.
8. Affordance and contamination states are explicit.
9. Evals/graders are themselves audited.
10. Device claims require appropriate device evidence.
11. Live-provider claims remain time/provider/model bound.
12. Important locale/capability strata remain visible.
13. Saturated suites retain regression value but lose growth-measurement authority.
14. Evaluation work never burdens ordinary app startup.

## Mandatory meta-evals

- eval-lock drift/tamper;
- corpus/grader/environment identity mismatch;
- baseline mismatch;
- stochastic replication;
- missing/censored trials;
- uncertainty/aggregation policy;
- critical-gate precedence;
- contamination and holdout policy;
- flakiness classification;
- Arabic coverage/parity;
- real-device vs emulator distinction;
- live-provider freshness;
- suite saturation;
- grader validity/loophole audits;
- longitudinal version breaks;
- reproducible report regeneration.

## Implementation stages

- EV-P0 program/suite/case/identity schemas
- EV-P1 extended eval-lock
- EV-P2 trial runner/manifests
- EV-P3 metric taxonomy/stratification/critical gates
- EV-P4 stochastic uncertainty/baseline comparison
- EV-P5 public/shadow/holdout/contamination governance
- EV-P6 grader validity/trace audit/flakiness
- EV-P7 real-device/live-provider tracks
- EV-P8 multilingual/Arabic coverage
- EV-P9 saturation/longitudinal/release decisions
- EV-P10 CI/promotion/Self-Evolution integration
- EV-P11 Seven Evals meta-evals

## Freeze decision

**FROZEN.**

No protected product source was modified. Architecture freeze is not implementation completion.

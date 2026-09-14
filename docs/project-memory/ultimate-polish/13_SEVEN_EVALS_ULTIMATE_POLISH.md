# Seven AI — Capability 13 Seven Evals Ultimate Polish

Status: **FREEZE CANDIDATE AFTER DOUBLE-POLISH RECONCILIATION**
Implementation status: **Deferred / credible baseline and eval-lock foundations exist**
Final target: **Seven Evals 3.0 — Version-Locked Multi-Axis Measurement Observatory**

## Executive decision

Seven must never convert a benchmark number into a vague claim that "the system is better" unless the measured target, task distribution, runtime identity, environment and uncertainty are explicit.

> **Prime law:** An evaluation result is meaningful only under a version-locked measurement contract. Corpus drift, environment drift, grader drift, model/provider drift and unmeasured dimensions remain explicit; critical regressions cannot be averaged away by higher headline scores.

Seven Evals becomes the release/campaign measurement system for the whole product. Capability 12 verifies individual subjects. Capability 13 measures populations of tasks, regressions, promotions and system quality over time.

---

# 1. Ground truth

Current Seven already has unusually strong foundations:

- `eval/tasks.jsonl` covers chat, memory, context, world, research, coding, tools, models, files, persistence, recovery, UI and Android;
- modes include core/build/world/research;
- Arabic coverage is explicitly audited;
- scorers distinguish `contract`, `rubric` and `device`;
- `eval/baseline.json` keeps live provider quality, real-phone resource behavior and comparative scores as `UNMEASURED` when no evidence exists;
- `evolution/eval-lock.cjs` binds baseline commit, corpus version, SHA-256 corpus hash and task count;
- eval-lock drift fails explicitly;
- evolution promotion already states that benchmark improvement cannot override critical security/permission/persistence/crash regressions.

The missing architecture is not basic test execution. It is a complete measurement model for stochastic trials, suite evolution, holdouts, environment identity, grader validity, statistical uncertainty, contamination, saturation, device/provider tracks and longitudinal comparability.

---

# 2. 2025–2026 research synthesis

## NIST automated evaluation guidance
Current NIST work stresses validity, transparency, reproducibility, clear measurement targets and explicit assumptions for automated benchmark evaluations.

Seven implication: an eval score always names what was measured and under what protocol.

## NIST AI 800-3 statistical evaluation work
NIST highlights that benchmark reports can conflate distinct notions of performance and fail to quantify uncertainty.

Seven implication: report distributions, trial counts and uncertainty rather than treating a point estimate as truth.

## NIST AITE sequestered evaluation
NIST's 2026 AITE work uses blind/sequestered environments to reduce train/test contamination.

Seven implication: maintain hidden/held-out regression and promotion sets where practical rather than exposing every acceptance case to the system being optimized.

## NIST CAISI evaluation-cheating findings
Agents may exploit grader/task loopholes and score well without satisfying the intended measurement target.

Seven implication: grader validity, transcript review and anti-gaming checks are first-class eval concerns.

## NIST TEVV-Athlon
Evaluation must adapt to application-specific risks and outcomes.

Seven implication: there is no one universal Seven score. Different capability/product claims have different eval contracts.

## Anthropic agent eval guidance
Agent evaluations benefit from multiple trials, multiple graders, transcript inspection, deterministic checks where possible and ongoing maintenance as capabilities saturate benchmarks.

Seven implication: stochastic agent performance is measured as a distribution and eval suites have lifecycle/saturation states.

---

# 3. Ownership boundary

Seven Evals owns:
- evaluation program/suite/case definitions;
- immutable evaluation identities;
- baseline comparison;
- trial scheduling and replication;
- scorer/grader configuration;
- environment/runtime identity capture;
- benchmark holdouts and contamination policy;
- aggregate metrics/statistics;
- regression gates;
- multilingual/mode/category coverage;
- device/provider measurement tracks;
- evaluator validity checks;
- suite lifecycle and saturation;
- release/promotion evidence reports.

Seven Evals does not own:
- per-subject verdict semantics — Capability 12;
- product runtime authorization — Capability 08;
- model routing — Capability 05;
- adaptive task compute — Capability 06;
- self-evolution candidate generation/promotion logic — Capability 14.

---

# 4. Pass A — MAXIMIZE

## 4.1 EvaluationProgram

A long-lived `EvaluationProgram` defines the measurement objective:
- program id/version;
- target claim(s);
- covered capabilities/modes;
- population/task distribution intent;
- critical invariants;
- required suites;
- reporting policy;
- release/promotion use;
- governance owner/source;
- change policy.

Examples:
- Seven Core Regression Program;
- Coding Agent Quality Program;
- Real Works Canon Fidelity Program;
- Android Device Resource Program;
- Free Provider Quality/Availability Program.

## 4.2 EvalSuite

An `EvalSuite` is a versioned collection of cases under one protocol.

Fields:
- suite id/version;
- case manifest hash;
- scorer/grader manifest hash;
- environment requirements;
- trial policy;
- locale/mode/category stratification;
- public/hidden status;
- contamination policy;
- known limitations;
- saturation state;
- created/revised lineage.

## 4.3 EvalIdentity 2.0

Extend the current Eval Lock rather than replacing it.

Canonical identity binds:
- baseline/candidate commit or artifact ids;
- suite/program version;
- exact case-manifest hash;
- scorer/grader manifest hash;
- runtime/app version;
- model family/revision/deployment when model-backed;
- provider/endpoint class when relevant;
- environment/container/device profile;
- tool catalogue snapshot where relevant;
- policy/config versions;
- run protocol version;
- random seed policy;
- timestamp/window for live/fresh tracks.

Comparisons with materially different identities are either normalized under an explicit protocol or reported as non-comparable.

## 4.4 EvalCase

Each case contains:
- stable id;
- category/capability/mode;
- locale;
- input/setup refs;
- authoritative requirements;
- allowed affordances;
- disallowed shortcuts where measurement validity requires it;
- grader/check specifications;
- expected outcome class where deterministic;
- partial-credit model where justified;
- resource limits;
- tags for risk/complexity/features;
- provenance/licensing/source refs.

Do not encode unnecessary exact trajectories when multiple valid solutions exist.

## 4.5 Trial

A `Trial` is one attempt under a fixed EvalIdentity.

Record:
- trial id;
- case id;
- seed/repetition index;
- runtime/model/provider identity;
- start/end timestamps;
- output/artifact refs;
- tool/run trace refs;
- scorer results;
- resource/latency metrics;
- failure category;
- reproducibility refs.

Trials never overwrite one another.

## 4.6 Stochastic replication

For model/agent tasks, a single attempt is rarely a sufficient estimate.

Trial policy can specify:
- deterministic single-run where appropriate;
- repeated N trials;
- adaptive replication when uncertainty is large;
- capped replication under cost budgets.

Report success distributions and sample counts.

## 4.7 Metric taxonomy

Separate metrics by meaning.

### Outcome quality
- pass/partial/fail rates;
- requirement coverage;
- factual/canon/coding correctness;
- task completion.

### Reliability
- variance across trials;
- failure/recovery rates;
- cancellation/retry correctness;
- corruption/reload behavior.

### Efficiency
- latency;
- tokens;
- tool calls;
- network bytes;
- cost when relevant;
- context utilization.

### Device/resource
- RAM;
- CPU;
- battery/energy proxy or measured drain;
- thermal behavior;
- storage;
- startup/TTI;
- frame/input responsiveness.

### Safety/authority/integrity
- permission violations;
- scope violations;
- unreconciled effects;
- lineage/provenance failures;
- critical crashes/data loss.

Do not average these into one canonical score.

## 4.8 Critical gates

Critical invariants are binary/typed release gates, not weighted score components.

Examples:
- source integrity;
- permission isolation;
- project scope;
- persistence corruption;
- unrecoverable destructive effect;
- protected-source modification;
- crash/boot regression;
- required accessibility invariant.

A headline quality improvement cannot compensate for a critical gate failure.

## 4.9 Aggregation

Aggregate only within compatible strata.

Reports include:
- overall result under named weighting policy;
- per-capability/category/mode/locale strata;
- device/provider/model strata where relevant;
- long-tail/worst-group metrics;
- critical gate summary;
- missing/unmeasured cells.

No Simpson's-paradox-friendly single number without subgroup visibility.

## 4.10 Uncertainty

For stochastic/sample-based metrics record:
- n;
- point estimate;
- interval/uncertainty method where meaningful;
- seeds/trial policy;
- missing/censored trials;
- material caveats.

Small samples are labeled accordingly rather than formatted with fake precision.

## 4.11 Baseline comparison

A candidate comparison reports:
- matched comparable trials/suites;
- delta by stratum;
- critical regressions;
- uncertainty around deltas where appropriate;
- newly measured dimensions;
- dimensions that became unmeasured;
- environment/model/provider drift.

`BETTER`, `WORSE`, `MIXED`, `NO_MATERIAL_CHANGE`, `NON_COMPARABLE` are preferable summary decisions to pretending every comparison has a scalar winner.

## 4.12 Eval locks

Keep current strong eval-lock semantics and extend them to scorer/environment identities.

Any mutation of:
- cases;
- expected results;
- grader rules;
- weighting;
- environment;
- baseline identity

requires a deliberate new suite/protocol version or fails comparison.

No silent benchmark edits during a candidate run.

## 4.13 Public / shadow / hidden suites

Use a portfolio:
- public development cases for iteration;
- shadow regression cases not in ordinary optimization prompts;
- hidden/promotion holdouts where feasible;
- live/device tracks that cannot be fully static.

Hidden cases are not treated as permanent secrets guaranteed never to leak; they are one contamination-control layer.

## 4.14 Contamination state

Each suite/case can carry:
- `CLEAN_KNOWN`
- `POSSIBLE_EXPOSURE`
- `KNOWN_EXPOSED`
- `NOT_APPLICABLE`
- `UNKNOWN`

A contaminated suite may remain useful for regression but has weaker meaning for capability claims.

## 4.15 Affordance contract

Agent benchmarks record what the agent may access:
- network;
- external repositories;
- package managers;
- tools;
- files;
- hidden tests;
- time/resources.

Results with materially different affordances are not directly comparable unless explicitly normalized.

## 4.16 Grader composition

A case may use:
- deterministic contract checks;
- executable tests;
- state checks;
- static analysis;
- device measurements;
- Capability 12 model/rubric judge;
- human review for sampled validation.

Each grader has a version and measurement target.

## 4.17 Eval-of-evals

Seven evaluates the evaluation itself.

Track:
- grader false positives/negatives on audited samples;
- inter-grader disagreement;
- human audit disagreement;
- loophole incidents;
- ambiguous/unsolvable cases;
- environment flakiness;
- result sensitivity to irrelevant presentation;
- contamination incidents;
- benchmark saturation.

Bad cases are quarantined/versioned rather than silently rewritten in place.

## 4.18 Transcript/trace audit sampling

Do not manually inspect every run.

Sample traces based on:
- all surprising passes/failures;
- grader disagreement;
- critical-gate boundaries;
- new model/runtime revision;
- unusually efficient/high-score outliers;
- random control sample.

Use transcript analysis tools to assist reviewers, but preserve source trace refs.

## 4.19 Flakiness

Classify unstable cases/checks:
- deterministic stable;
- environment flaky;
- external-service flaky;
- stochastic by design;
- unresolved.

Do not punish a candidate for known unrelated flakiness without a defined policy. Conversely, do not hide regressions behind the word flaky.

## 4.20 Device eval track

Real-phone claims require real device measurements.

A `DeviceProfile` records:
- device/model/OS/build;
- battery/charging/thermal setup;
- app build;
- network condition;
- performance tier;
- background-state protocol;
- measurement method/tool;
- repetition count.

Emulator results are separate and never promoted to real-phone battery/RAM/thermal truth.

## 4.21 Live-provider track

Provider-backed quality/availability changes over time.

Live evals bind:
- model/deployment/provider;
- date/time window;
- free/paid eligibility evidence where relevant;
- rate/availability state;
- request configuration;
- trials.

Historical live-provider PASS does not imply current availability forever.

## 4.22 Multilingual evaluation

Arabic remains first-class rather than a token translation subset.

Track:
- Arabic task share;
- Arabic-only requirements;
- Arabic/English parity pairs where useful;
- RTL/UI cases;
- mixed Arabic-English technical prompts;
- dialect/Modern Standard Arabic coverage as product need justifies.

Do not average away a severe Arabic regression with stronger English performance.

## 4.23 Saturation lifecycle

Suite states:
- `ACTIVE_DIAGNOSTIC`
- `ACTIVE_REGRESSION`
- `SATURATING`
- `SATURATED_REGRESSION_ONLY`
- `RETIRED`
- `QUARANTINED`

When a capability suite saturates, keep it for regression but introduce harder/new distribution slices instead of inflating confidence.

## 4.24 Longitudinal trend

Store compact `EvalRunSummary` objects so Seven can plot/inspect:
- quality trends;
- reliability;
- critical regressions;
- resource trends;
- device/provider drift;
- suite-version transitions.

Never splice incomparable suite versions into one smooth trend line without marking the break.

## 4.25 ReleaseDecision

A release/promotion policy consumes:
- required suite verdicts;
- critical gates;
- candidate-vs-baseline deltas;
- minimum trial/evidence requirements;
- unmeasured blockers;
- rollback readiness.

Possible decisions:
- `PROMOTE`
- `PROMOTE_WITH_MONITORING`
- `HOLD`
- `REJECT`
- `INSUFFICIENT_EVIDENCE`

This is policy output, not a model opinion.

---

# 5. Velocity assault

- evaluate only suites relevant to the changed capabilities first;
- keep a small universal smoke/core gate;
- dependency-map changes to impacted eval slices;
- run cheap deterministic gates before expensive provider/device trials;
- cache immutable fixtures/environments safely;
- parallelize independent cases within Resource Governor limits;
- avoid repeatedly materializing large traces;
- artifactize trial logs;
- use adaptive replication only where uncertainty can affect the decision;
- schedule heavy device/full-suite runs at deliberate release/promotion boundaries rather than app runtime;
- Seven Evals imposes zero ordinary end-user startup cost.

---

# 6. Pass B — DESTROY THE WINNER

Rejected alternatives:

## One "Seven score"
Rejected. It hides incompatible quality, safety, resource and locale dimensions.

## Same public corpus forever
Rejected. Encourages saturation and optimization to known cases.

## One stochastic trial per case
Rejected as the universal rule. Variance must be measured where it matters.

## Benchmark improvement overrides critical regression
Rejected.

## Editing tests while evaluating a candidate
Rejected. EvalIdentity must stay locked.

## Hidden tests guarantee uncontaminated truth
Rejected. Holdouts reduce but do not eliminate contamination risk.

## Emulator performance equals phone performance
Rejected.

## Historical provider quality equals current provider quality
Rejected.

## Model judge score is the eval result
Rejected. Judge output is one grader type governed by Capability 12.

## Treat flaky failures as automatically ignorable
Rejected. Flakiness itself must be measured and policy-defined.

---

# 7. Reconciliation result

The final system preserves Seven's existing eval-lock and UNMEASURED discipline, extending them into:

`EvaluationProgram -> EvalSuite/Identity -> Cases -> Trials -> Graders -> stratified metrics/uncertainty -> candidate comparison -> critical gates -> ReleaseDecision`.

---

# 8. Canonical objects

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

---

# 9. Frozen invariants

1. UNMEASURED never becomes PASS by inference.
2. Candidate/baseline comparisons require compatible locked identities.
3. Corpus/grader/environment changes are versioned, never silent.
4. Critical regressions cannot be averaged away.
5. There is no single canonical universal Seven quality score.
6. Stochastic performance records trial counts and uncertainty.
7. Public development scores are not the sole promotion evidence.
8. Affordance differences are explicit.
9. Contamination status is explicit.
10. Eval cases/graders are themselves audited and versioned.
11. Device claims require appropriate device evidence.
12. Live-provider claims are time/provider/model bound.
13. Arabic and other important strata remain visible in reports.
14. Saturated evals remain useful for regression but not capability-growth claims.
15. Evaluation infrastructure never runs on normal app startup.

---

# 10. Evaluation of Seven Evals itself

- eval-lock tamper/drift detection;
- case/grader hash mismatch;
- baseline mismatch;
- environment identity mismatch;
- stochastic replication correctness;
- missing/censored trial reporting;
- uncertainty computation tests;
- stratum weighting tests;
- critical-gate precedence;
- contaminated suite behavior;
- flaky-case classification;
- hidden/public suite separation;
- Arabic coverage/parity;
- device/emulator distinction;
- live-provider freshness;
- saturation detection;
- grader loophole/audit incidents;
- longitudinal suite-version breaks;
- reproducible report regeneration.

---

# 11. Implementation stages

- **EV-P0** EvaluationProgram/Suite/Case/Identity schemas.
- **EV-P1** extend current eval-lock to grader/environment/runtime identities.
- **EV-P2** Trial/TrialPolicy and reproducible runner manifests.
- **EV-P3** metric taxonomy, stratification and critical gates.
- **EV-P4** stochastic replication/uncertainty and baseline comparison.
- **EV-P5** public/shadow/holdout and contamination governance.
- **EV-P6** grader validity, trace-audit and flakiness lifecycle.
- **EV-P7** real-device and live-provider tracks.
- **EV-P8** multilingual/Arabic parity and mode/capability coverage.
- **EV-P9** saturation, longitudinal trend and release decisions.
- **EV-P10** CI/promotion/Self-Evolution integration.
- **EV-P11** meta-evals for Seven Evals itself.

---

# 12. Proof of improvement

Compared with the existing baseline corpus/lock, Seven Evals 3.0:
- preserves the strong immutability/UNMEASURED rules already present;
- adds stochastic trial distributions and uncertainty;
- prevents environment/grader/model drift from masquerading as quality change;
- adds critical-gate precedence and stratified reporting;
- creates holdout/contamination/saturation lifecycles;
- distinguishes emulator/device and historical/live provider evidence;
- evaluates graders and benchmarks for loopholes/flakiness;
- gives release and self-evolution promotion a reproducible measurement contract rather than a mutable benchmark score.

---

# 13. Research references

- NIST CAISI, **Towards Best Practices for Automated Benchmark Evaluations**, 2026.
- NIST AI 800-3, **Expanding the AI Evaluation Toolbox with Statistical Models**, 2026.
- NIST, **Artificial Intelligence Technology Evaluation (AITE)**, 2026.
- NIST, **TEVV-Athlon Framework for Evaluating AI Systems**, 2026 draft.
- NIST CAISI, **Cheating On AI Agent Evaluations**, 2025/2026 guidance line.
- NIST, **Analyzing Transcripts from AI Agent Evaluations**, 2026.
- Anthropic, **Demystifying evals for AI agents**, 2026.
- SWE-bench official evaluation ecosystem, current 2026.

---

# 14. Freeze recommendation

**FREEZE CANDIDATE ACCEPTED.**

Final target: **Seven Evals 3.0 — Version-Locked Multi-Axis Measurement Observatory**.

Implementation remains deferred until campaign reconciliation. No protected product source is modified by this architecture document.

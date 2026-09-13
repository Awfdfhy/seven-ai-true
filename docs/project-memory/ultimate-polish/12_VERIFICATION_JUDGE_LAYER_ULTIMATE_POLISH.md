# Seven AI — Capability 12 Verification / Judge Layer Ultimate Polish

Status: **FREEZE CANDIDATE AFTER DOUBLE-POLISH RECONCILIATION**
Implementation status: **Deferred / multiple verification foundations exist**
Final target: **Seven Verification Fabric 3.0 — Evidence-Calibrated Independent Decision Kernel**

## Executive decision

Seven must never allow the subsystem that produced an answer, patch, action or artifact to become the sole authority that declares itself correct.

> **Prime law:** Verification is an independent evidence-to-verdict process. Deterministic and authoritative checks dominate when available; model judges are fallible derived evaluators; missing or conflicting evidence produces `INCONCLUSIVE`, never manufactured PASS.

The Verification Fabric consumes typed evidence from all Seven systems and produces explicit, reproducible verdicts under a versioned VerificationContract.

---

# 1. Ground truth

Current Seven already has several verification foundations:

- the execution bridge has a VERIFYING phase and blocks commit until required verification passes and unresolved effects are absent;
- Coding candidate flows already include review/regression gates;
- Research Runtime has claim/evidence/freshness/conflict/citation checks;
- Evolution gates require tests, quality, reliability, performance, efficiency and critical gates such as provenance/rollback readiness;
- the eval corpus already distinguishes deterministic contract, rubric and device scorers and explicitly marks unmeasured provider/device truths as `UNMEASURED`.

These are strong pieces, but verification is still distributed across subsystems. #12 freezes the common decision architecture that prevents duplicated or contradictory meanings of PASS.

---

# 2. 2025–2026 research synthesis

## NIST TEVV-Athlon, 2026
Evaluation should be adaptable to the application and combine Test, Evaluation, Verification and Validation rather than collapsing trust into one benchmark score.

Seven implication: verdicts are contract/task specific and multi-dimensional.

## NIST evaluation probes for agentic AI, 2026
NIST is developing workflow-integrated evaluation probes and machine-readable audit trails that connect outputs to supporting evidence.

Seven implication: verification should run both inline and post-hoc, with evidence lineage preserved.

## NIST evaluation-cheating findings
Agentic systems can satisfy a grader while violating the evaluation's intended measurement target.

Seven implication: verifier validity itself must be monitored; grading rules cannot be assumed complete merely because they are deterministic.

## Anthropic agent eval guidance, 2026
Use deterministic graders when possible, model graders where necessary, multiple graders for different aspects, and inspect transcripts/trajectories to validate the eval itself.

Seven implication: judge type is selected by the claim/requirement being verified; no universal LLM judge.

## Agentic Rubrics / SWE-Gate, 2026
Repository-context verification and review constraints catch failures missed by functional tests.

Seven implication: outcome verification must include authoritative requirements/constraints, not just executable checks.

## Formal verification research
Formal solvers can provide exceptionally strong evidence for narrow properties, but verifier acceptance is only as meaningful as the specification itself.

Seven implication: proof evidence is high authority for the exact encoded property, never a blanket correctness certificate.

---

# 3. Ownership boundary

Verification Fabric owns:
- VerificationContract;
- check/evidence selection;
- evidence normalization;
- requirement/claim coverage;
- deterministic grader execution orchestration;
- model/rubric judge orchestration where required;
- conflict detection between evidence;
- evidence sufficiency;
- verdict computation;
- judge calibration/health;
- verification audit trail;
- PASS/FAIL/INCONCLUSIVE/REPAIR/BLOCKED verdicts.

It does not own:
- original task intent — Cognitive Runtime/TaskContract;
- factual source storage — Epistemic Fabric;
- permissions — Authority Kernel;
- tool effects — Effect Ledger;
- test generation/change implementation — Coding Agent;
- evaluation program governance across releases — Seven Evals (#13).

---

# 4. Pass A — MAXIMIZE

## 4.1 VerificationContract

Every meaningful verification run binds to a versioned `VerificationContract` containing:
- subject id/version/hash;
- task/goal ref;
- authoritative requirements/claims to verify;
- required check families;
- evidence minimums;
- independence/diversity requirements where relevant;
- freshness requirements;
- allowed verifier types;
- risk class;
- blocking vs advisory checks;
- acceptance policy;
- uncertainty policy;
- resource budget;
- contract/version lineage.

A verifier cannot silently change the acceptance target mid-run.

## 4.2 VerificationSubject

The subject may be:
- assistant answer;
- research claim/report;
- tool result/effect;
- code candidate;
- file transaction;
- generated artifact;
- UI/release build;
- memory promotion;
- model/provider promotion;
- RPG/canon state transition;
- self-evolution candidate.

Each subject is identified by stable refs/hashes rather than presentation text alone.

## 4.3 Requirement/Claim matrix

Create a `VerificationMatrix`:

`requirement or claim -> checks -> evidence -> status -> residual uncertainty`.

Statuses:
- `UNTESTED`
- `SUPPORTED`
- `REFUTED`
- `CONFLICT`
- `NOT_APPLICABLE`
- `BLOCKED`
- `UNKNOWN`

Final verdict derives from the matrix and contract policy.

## 4.4 Evidence classes

Canonical evidence classes:

### AUTHORITATIVE_STATE
Direct read from the canonical state owner under a valid version.

### DETERMINISTIC_EXECUTION
Test, parser, compiler, schema validator, hash comparison, state predicate or reproducible deterministic check.

### FORMAL_PROOF
Proof/solver evidence for a precisely defined property and specification version.

### INDEPENDENT_OBSERVATION
Read-back or observation from a source sufficiently independent of the action/output being verified.

### SOURCE_EVIDENCE
Source-bound factual evidence governed by Epistemic Fabric.

### DEVICE_MEASUREMENT
Real device/runtime telemetry under a defined measurement protocol.

### MODEL_JUDGMENT
Rubric/judge output from a qualified model/verifier.

### HUMAN_ACCEPTANCE
Explicit human review/acceptance event where policy requires or permits it.

Evidence authority is property-specific. There is no universal numeric ranking that makes one class superior for every question.

## 4.5 EvidenceRef

Every evidence item carries:
- evidence id;
- subject/version;
- check id;
- source/verifier identity and version;
- observedAt;
- artifact/ref/hash;
- result;
- property/requirement covered;
- independence/dependency cluster;
- freshness;
- trust/authority class;
- environment profile when relevant;
- transformation lineage.

A screenshot cannot prove a database write unless the contract defines what the screenshot validly observes. A test cannot prove a requirement it does not exercise.

## 4.6 Check types

Canonical check families include:
- schema/contract validation;
- exact state predicate;
- test execution;
- build/compile/type/static checks;
- diff/scope/integrity checks;
- source/citation/freshness verification;
- side-effect read-back/reconciliation;
- artifact/file/hash validation;
- accessibility/visual/device checks;
- performance/resource measurement;
- policy/permission invariant check;
- formal proof/solver check;
- model/rubric judgment;
- human acceptance.

This list is extensible through Tool Fabric, but every check must normalize to the same evidence contract.

## 4.7 Deterministic-first policy

If an authoritative or deterministic check directly answers the property, prefer it over a model judge.

Model judges are used for properties that are:
- semantic;
- qualitative;
- underspecified by deterministic checks;
- expensive/impossible to encode directly.

A model judge cannot override a deterministic contradiction to the same exact property merely because it is confident.

## 4.8 Independent verification

The producer's self-report may be evidence but is not independent verification.

For high-impact claims, the contract may require:
- separate read-back tool;
- separate verifier model;
- separate execution phase;
- independent source;
- different test family;
- human acceptance.

Independence is represented explicitly rather than assumed from having two strings that agree.

## 4.9 Judge qualification

A `JudgeProfile` contains:
- judge/verifier id and revision;
- supported domains/check types;
- calibration evidence;
- known failure modes;
- cost/latency;
- context requirements;
- structured-output contract;
- health/freshness;
- promotion status.

A newly available judge is not automatically trusted for promotion-critical decisions.

## 4.10 Judge calibration

Model/rubric judges are calibrated against reference sets with known labels or stronger evidence.

Track at least:
- agreement/accuracy where labels exist;
- false-pass and false-fail rates;
- abstention quality;
- consistency under paraphrase/order changes;
- locale/language behavior;
- self-preference/producer coupling where relevant;
- drift by model revision.

Calibration is domain/check-specific, not one global score.

## 4.11 Producer/judge separation

Default high-impact policy avoids using the exact same producer instance/context as the only judge.

Possible separation levels:
- same model family, fresh context;
- different deployment/model;
- deterministic/tool verifier;
- independent external observation;
- human acceptance.

The VerificationContract chooses required independence based on risk/value.

## 4.12 Blind judging when useful

For comparative candidate judging, hide irrelevant producer identity/order metadata when it could bias evaluation.

Do not hide information required to assess provenance, safety or task correctness.

## 4.13 Structured rubric

A model judge receives:
- frozen subject refs/content;
- authoritative requirements;
- evidence bundle;
- explicit rubric/check ids;
- allowed verdict vocabulary;
- instruction to abstain when evidence is insufficient.

It returns structured criterion-level outcomes and evidence refs, not merely a prose score.

## 4.14 No scalar confidence theater

Do not expose one magical 0–100 confidence number as canonical verification truth.

Use:
- criterion statuses;
- evidence coverage;
- residual uncertainty;
- calibrated judge measurements where meaningful;
- final policy verdict.

## 4.15 Canonical verdicts

- `PASS`
- `FAIL`
- `INCONCLUSIVE`
- `REPAIR_REQUIRED`
- `BLOCKED`

Optional derived/advisory label:
- `PASS_WITH_WARNINGS`

`PASS` requires every blocking contract condition to be satisfied with sufficient valid evidence.

`FAIL` requires evidence of a blocking violation.

`INCONCLUSIVE` means the truth/acceptance question remains unresolved, not that the system failed operationally.

`BLOCKED` means required verification could not be executed under current capability/authority/environment.

## 4.16 VerdictPolicy

A deterministic `VerdictPolicy` maps matrix states/evidence sufficiency to final verdict.

Model judges produce evidence rows; they do not execute the final acceptance policy themselves.

## 4.17 Repair feedback

When repair is possible, verification returns a bounded `RepairDirective`:
- failed criterion ids;
- supporting evidence refs;
- affected subject areas;
- required recheck set;
- whether the baseline contract changed: normally false.

No private chain-of-thought is required.

The producer can retry, but the next verification run receives a new subject version while preserving failed-attempt history.

## 4.18 Verification probes

Low-cost probes may run inline at semantic boundaries:
- after grounded claim synthesis;
- after tool result normalization;
- after file transaction;
- after candidate patch;
- before canonical commit;
- before model/self-evolution promotion.

Post-hoc deeper verification may run only when value/risk justifies it.

## 4.19 Verification DAG, not mandatory linear checklist

Checks have dependencies:
- cheap preconditions first;
- a decisive failure can cancel irrelevant expensive checks;
- independent checks may run concurrently within budget;
- a failed environment prerequisite can mark downstream checks BLOCKED;
- high-cost checks are requested only when unresolved criteria need them.

This integrates with Adaptive Compute and Velocity Fabric.

## 4.20 Adversarial evaluator validation

Seven Evals must test the verifier itself for:
- false acceptance;
- false rejection;
- sensitivity to irrelevant presentation/order;
- acceptance-target drift;
- criterion omission;
- overreliance on producer claims;
- stale evidence;
- duplicated/non-independent evidence;
- hidden pre-existing failure;
- benchmark/eval loopholes;
- unsupported certainty.

Verification is a measured subsystem, not infallible infrastructure.

## 4.21 Transcript/trace review

The verifier may inspect structured run events/tool calls when outcome checks alone cannot diagnose whether a candidate exploited an evaluation artifact or violated process constraints.

Process grading is used sparingly. Seven generally grades required outcomes and invariants rather than enforcing one brittle sequence of steps.

## 4.22 Evidence retention

Persist compact verification manifests:
- subject hash/version;
- contract hash/version;
- check results;
- evidence refs/hashes;
- judge/verifier revisions;
- final verdict;
- residual warnings;
- timestamps.

Large logs, screenshots and reports live as artifacts with retention/privacy policy.

## 4.23 Reverification and invalidation

A verdict can become stale if a bound dependency changes:
- subject version;
- requirement contract;
- source freshness;
- environment/toolchain;
- verifier/judge revision where policy requires recalibration;
- device/build version;
- external real-world state.

Use dependency/version keys to determine which checks can be reused and which must rerun.

## 4.24 Human acceptance

Human review is a distinct evidence/authority event, not a universal correctness oracle.

Where the task is subjective or high-impact, policy may require user acceptance after machine verification.

A human approval does not rewrite failed hard invariants unless the policy explicitly allows an authorized exception.

---

# 5. Velocity assault

- compile verification only for required blocking/advisory criteria;
- run cheapest decisive checks first;
- reuse evidence only under matching subject/contract/dependency versions;
- parallelize independent checks within Resource Governor limits;
- use deterministic checks instead of model calls when available;
- use small specialized judge context rather than entire chat history;
- artifactize logs/screenshots;
- stop expensive checks after decisive terminal outcome when they cannot change policy result;
- preserve a verification reserve from Adaptive Compute;
- no verifier/judge initialization at app startup unless the active task needs it.

Lite tier preserves the same verdict semantics while reducing optional advisory/model checks.

---

# 6. Pass B — DESTROY THE WINNER

Rejected alternatives:

## One universal LLM judge
Rejected. Judge reliability is domain- and task-dependent.

## Producer self-certification
Rejected for high-impact acceptance.

## Test PASS means universal correctness
Rejected. Tests prove only exercised properties under a particular environment.

## Formal proof means entire program correct
Rejected. Proof authority is bounded by the exact specification/property.

## Multiple agreeing models automatically increase authority
Rejected. Correlated judges are not independent evidence by count alone.

## Average everything into one score
Rejected. Critical blocking criteria must not be diluted by unrelated strengths.

## Always require human approval
Rejected. Creates friction without necessarily increasing factual correctness.

## Grade exact action trajectory for every task
Rejected. Too brittle; grade outcomes/invariants unless process constraints matter.

## Rerun all checks after every tiny change
Rejected. Dependency-aware invalidation/reverification is faster and equally truthful.

---

# 7. Reconciliation result

The final architecture is an independent, typed evidence decision layer:

`VerificationContract -> VerificationMatrix -> check selection/DAG -> EvidenceRefs -> conflict/sufficiency analysis -> deterministic VerdictPolicy -> VerdictRecord`.

Model judges are calibrated evidence producers inside this process, never the canonical policy authority.

---

# 8. Canonical objects

- `VerificationSubject`
- `VerificationContract`
- `VerificationCriterion`
- `VerificationMatrix`
- `CheckPlan`
- `CheckResult`
- `EvidenceRef`
- `EvidenceDependencyCluster`
- `JudgeProfile`
- `JudgeCalibrationSnapshot`
- `RubricSpec`
- `VerdictPolicy`
- `VerdictRecord`
- `RepairDirective`
- `VerificationManifest`

---

# 9. Frozen invariants

1. Producers do not become sole acceptance authority for their own outputs.
2. Verification target/requirements are versioned and cannot drift silently.
3. Evidence is property-specific and source-bound.
4. Deterministic/authoritative checks dominate model opinion for the same exact property.
5. Multiple correlated evidence items do not multiply authority automatically.
6. Model judges are qualified/calibrated and may abstain.
7. Missing evidence produces UNKNOWN/INCONCLUSIVE, not fake certainty.
8. Blocking criteria cannot be averaged away.
9. PASS requires sufficient valid evidence for every blocking criterion.
10. Verification result does not grant permission.
11. A verdict can be invalidated by relevant subject/dependency change.
12. Large evidence remains artifact-backed.
13. Repair feedback identifies failed criteria without exposing private reasoning.
14. Verification itself is evaluated for false acceptance/rejection and measurement loopholes.
15. Resource optimization cannot silently weaken mandatory verification semantics.

---

# 10. Evaluation contract

## Verdict correctness
- clear pass;
- clear fail;
- insufficient evidence -> inconclusive;
- unavailable required check -> blocked;
- repairable failure -> repair required;
- advisory warning without blocking failure.

## Evidence discipline
- stale evidence;
- wrong-subject evidence;
- duplicated dependent evidence;
- producer self-report only;
- authoritative contradiction;
- conflicting independent sources;
- changed requirement contract;
- changed subject after partial verification.

## Judge calibration
- labeled reference set;
- paraphrase/order stability;
- Arabic/English consistency;
- false-pass emphasis for high-impact checks;
- abstention quality;
- judge revision drift;
- producer identity/order bias where applicable.

## Domain integrations
- coding ChangeEvidenceBundle;
- research citation/evidence pack;
- tool/Effect Ledger verification;
- file/project transaction;
- UI screenshot/accessibility release evidence;
- device performance measurements;
- memory/procedure promotion;
- canon/RPG invariant checks;
- self-evolution promotion.

## Performance
- cheap deterministic fast path;
- 10/100 criteria DAG;
- evidence reuse under unchanged versions;
- invalidation after one dependency change;
- model-judge context size;
- Lite-tier verification latency/RAM/battery;
- no verification task -> near-zero startup cost.

---

# 11. Implementation stages

- **VJ-P0** VerificationSubject/Contract/Criterion schemas.
- **VJ-P1** EvidenceRef and VerificationMatrix.
- **VJ-P2** deterministic CheckPlan/DAG and verifier adapters.
- **VJ-P3** VerdictPolicy and explicit verdict states.
- **VJ-P4** judge/rubric structured adapter + qualification.
- **VJ-P5** judge calibration and dependency/independence tracking.
- **VJ-P6** RepairDirective and re-verification invalidation.
- **VJ-P7** Coding/Research/Tool/File/Memory/Canon integrations.
- **VJ-P8** UI/audit manifest/artifact experience.
- **VJ-P9** adversarial evaluator, false-pass/fail, multilingual and measurement-validity gates.
- **VJ-P10** mobile/velocity/resource gates.

---

# 12. Proof of improvement

Compared with Seven's current distributed verification gates, Verification Fabric 3.0:
- creates one explicit cross-system meaning of verification without erasing domain-specific checks;
- separates evidence production from acceptance policy;
- prevents self-certification;
- treats LLM judges as calibrated fallible verifiers rather than truth sources;
- adds INCONCLUSIVE/BLOCKED as legitimate outcomes;
- tracks evidence dependence and invalidation;
- catches acceptance criteria that tests alone miss;
- allows cheap deterministic fast paths while reserving expensive judges for semantic gaps;
- creates reproducible audit manifests for each verdict.

---

# 13. Research references

- NIST, **The TEVV-Athlon Framework for Evaluating AI Systems**, 2026 draft.
- NIST, **Building Evaluation Probes into Agentic AI**, 2026.
- NIST CAISI, **Cheating On AI Agent Evaluations**, 2025/2026 guidance line.
- NIST, **Towards Best Practices for Automated Benchmark Evaluations**, 2026.
- Anthropic, **Demystifying evals for AI agents**, 2026.
- Raghavendra et al., **Agentic Rubrics as Contextual Verifiers for SWE Agents**, 2026.
- He et al., **SWE-Gate: Passing Functional Tests Is Not Enough for Software Engineering Agents**, 2026.
- **Agent-as-a-Judge**, survey, 2026.
- Recent solver-aware/formal verification work showing both the strength and specification-bounded nature of proof evidence.

---

# 14. Freeze recommendation

**FREEZE CANDIDATE ACCEPTED.**

Final target: **Seven Verification Fabric 3.0 — Evidence-Calibrated Independent Decision Kernel**.

Implementation remains deferred until campaign reconciliation. No protected product source is modified by this architecture document.

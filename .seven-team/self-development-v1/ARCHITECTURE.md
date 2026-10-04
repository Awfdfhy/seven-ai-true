# Seven Self-Development v1 — Architecture

Status: TARGET ARCHITECTURE
Date: 2026-10-05
Tracking: #100

## 1. Mission

Seven Self-Development is a governed experimentation system that can detect weaknesses, diagnose likely causes, research when useful, generate bounded improvement hypotheses, implement approved candidates through Coding System, compare them against a locked baseline, and either promote or reject/rollback with durable evidence.

It is NOT:
- an unrestricted self-rewriter;
- an alternate GitHub/coding implementation;
- a model prompt that trusts its own claim of improvement;
- an authority allowed to rewrite evaluators to win.

Canonical loop:

Observe
→ Measure
→ Diagnose
→ Research
→ Generate Hypotheses
→ Prioritize
→ Plan
→ Coding System
→ Patch
→ Test
→ Benchmark
→ Compare
→ Critique
→ Accept / Reject
→ Rollback when required
→ Document
→ Learn

## 2. Authority model

Three planes are deliberately separated.

### Stable Plane

The current champion/product baseline.

Authority:
- canonical runtime/product source;
- protected release baseline;
- user-facing system.

Candidate work must never silently mutate this plane.

### Candidate Plane

An isolated exact-SHA Coding System workspace.

Authority:
- may edit only declared scope;
- may execute allowed commands/tests;
- cannot edit evaluator plane;
- cannot promote itself.

### Evaluator Plane

Protected tests, benchmark manifests, baselines, constitution, judge policy, risk policy and acceptance logic.

Authority:
- defines evidence and promotion requirements;
- is locked before candidate construction/evaluation;
- may only change through a separate governance change, never as part of the candidate it judges.

## 3. Major components

### 3.1 Observation Engine

Purpose:
Convert runtime/development signals into bounded, privacy-preserving ObservationRecord events.

Inputs may include:
- failure/error outcomes;
- latency and time-to-first-token;
- token/context usage estimates;
- tool selection/execution outcomes;
- search/fetch/verification failures;
- coding/build/CI failures;
- crashes and recovery failures;
- user correction signal;
- regression signal;
- fallback/retry/circuit-breaker activity;
- persistence/restore failures;
- measurable UI/runtime events.

Rules:
- prompts/responses are OFF by default;
- secrets/credentials are forbidden;
- store IDs, metric values, error classes and bounded categorical metadata;
- raw stack/error bodies require a separate redacted diagnostic attachment;
- every event has source subsystem, run/request IDs when available, timestamp, outcome, severity and evidence origin.

Output:
ObservationRecord.

### 3.2 Measurement / Metric Registry

Purpose:
Normalize which metrics can determine improvement.

Each metric has:
- id;
- domain;
- direction: HIGHER_IS_BETTER / LOWER_IS_BETTER / TARGET_RANGE;
- unit;
- aggregation rule;
- minimum sample count;
- freshness window;
- variance/tolerance policy;
- proof level;
- hard-gate vs optimization role.

Examples:
- answer quality / task success;
- error/crash rate;
- latency p50/p90;
- first-token latency;
- token usage;
- tool hallucination/miss rate;
- search evidence completeness;
- memory recall/precision/abstention;
- routing quality/cost/latency;
- coding task resolution/regression;
- UI friction/long-task/layout-shift signals.

A candidate cannot invent a new success metric during evaluation.

### 3.3 Diagnosis Engine

Purpose:
Infer likely root-cause hypotheses from observations without pretending correlation is causation.

Output DiagnosisRecord:
- symptom cluster;
- evidence refs;
- likely subsystem(s);
- hypotheses[];
- confidence;
- causalStatus: HYPOTHESIS | CONTROLLED_EVIDENCE | CONFIRMED;
- missing evidence;
- recommended discriminating experiment.

Rules:
- repeated/coherent evidence raises confidence;
- a model critique alone remains HYPOTHESIS;
- unknown root cause is allowed;
- critical single events can escalate even with low sample count.

### 3.4 Research Engine

Purpose:
Acquire external/internal evidence only when it can materially reduce uncertainty.

Research trigger examples:
- diagnosis confidence below threshold;
- subsystem technique is changing rapidly;
- multiple plausible remedies;
- compatibility/security/API uncertainty;
- prior attempts failed.

Research output:
- claims;
- source references;
- freshness;
- contradictions;
- applicable constraints;
- proposed techniques;
- confidence/gaps.

It never directly changes code.

### 3.5 Hypothesis Generator

Produces multiple ImprovementHypothesis candidates.

Required fields:
- problem;
- proposed mechanism;
- predicted metric effect;
- predicted regressions;
- assumptions;
- scope;
- affected systems;
- risk class;
- validation plan;
- rollback strategy;
- evidence supporting the hypothesis.

Prefer several competing hypotheses for ambiguous problems.

### 3.6 Improvement Planner

Ranks hypotheses by a deterministic decision vector rather than free-form model preference.

Dimensions:
- expectedGain;
- confidence;
- risk;
- implementationCost;
- evaluationCost;
- blastRadius;
- reversibility;
- userImpact;
- evidenceCoverage.

Priority should preserve Pareto candidates when tradeoffs are meaningful.

The planner cannot lower required proof because a change is attractive.

### 3.7 Coding Interface

This is the ONLY production mutation interface.

Self-Development may request:

`CodingSystem.prepareCandidate(spec)`
`CodingSystem.inspect(candidate)`
`CodingSystem.applyPlan(candidate, plan)`
`CodingSystem.runTargetedVerification(candidate)`
`CodingSystem.runRegressionVerification(candidate)`
`CodingSystem.reviewDiff(candidate)`
`CodingSystem.finalizeEvidence(candidate)`
`CodingSystem.discard(candidate)`

Required properties:
- exact baseline SHA;
- isolated workspace/branch;
- freshness/stale-plan protection;
- transactional multi-file patch semantics;
- deterministic mandatory test selection outside the candidate model;
- protected-path enforcement outside model text;
- bounded repair loop;
- exact changed-path/diff/test evidence;
- rollback/discard.

If Coding System cannot prove these properties, Self-Development must stop at PLAN/SHADOW_ONLY. It must not fall back to release/github-self-dev.js direct mutation.

### 3.8 Test & Benchmark Engine

Runs paired baseline/candidate evaluation.

Inputs:
- evaluator lock;
- baseline artifact/SHA;
- candidate artifact/SHA;
- domain benchmark manifest;
- mandatory regression gates;
- environment identity.

Outputs:
- comparable raw results;
- normalized metrics;
- confidence/sample sufficiency;
- hard failures;
- variance/noise;
- proof level;
- known unknowns.

Candidate-generated tests are supplemental. Mandatory/held-out gates are evaluator-owned.

### 3.9 Critic / Reviewer

Separate from builder role for MEDIUM/HIGH/CRITICAL changes.

Reviews:
- diagnosis;
- architecture compatibility;
- patch/diff;
- tests;
- benchmark interpretation;
- security/privacy;
- regression evidence;
- claimed causal mechanism.

Critic output is evidence/advice, not unilateral promotion authority.

### 3.10 Acceptance Gate

Promotion decision requires:

1. exact baseline/candidate/evaluator identities;
2. all mandatory tests pass;
3. no critical constitution/integration/security/persistence/crash regression;
4. target weakness resolved or target metric improved by required margin;
5. sample sufficiency/noise policy satisfied;
6. risk-specific proof requirements satisfied;
7. independent review requirements satisfied;
8. rollback checkpoint verified;
9. candidate ledger/evidence integrity valid.

Terminal decisions:
- ACCEPT;
- REJECT;
- ROLLBACK;
- BLOCKED;
- INCONCLUSIVE;
- SHADOW_ONLY.

A weighted aggregate score is advisory. Hard blocks dominate.

### 3.11 Rollback / Recovery

Any accepted candidate retains:
- exact prior champion SHA/artifact;
- migration/recovery notes;
- health policy;
- rollback trigger thresholds.

Post-promotion health can force rollback on:
- crash/security/persistence critical signal;
- repeated error-rate breach;
- latency/quality regression beyond policy;
- data corruption;
- evaluator identity mismatch.

Rollback outcome is recorded as learning evidence.

### 3.12 Learning Archive

Durably records:
- problem and observation cluster;
- diagnosis;
- research sources;
- hypotheses considered;
- chosen candidate;
- baseline/candidate metrics;
- tests and proof level;
- critic verdict;
- accept/reject/rollback reason;
- confounders;
- lesson: ADOPT / AVOID / RETEST;
- applicable scope/version.

Failed experiments are retained to prevent repeated dead ends.

The archive is not permission memory and cannot authorize future changes by itself.

## 4. Risk classes

### LOW

Examples:
- prompt text under a stable contract;
- ranking tie-breaker;
- bounded threshold;
- display ordering with deterministic behavior.

Policy:
- isolated candidate;
- targeted + regression tests;
- locked evaluation;
- auto-promotion MAY be enabled by explicit policy after the full pipeline is proven.

### MEDIUM

Examples:
- model routing algorithm;
- memory retrieval algorithm;
- tool-selection policy;
- context construction logic;
- latency/cost strategy.

Policy:
- independent reviewer;
- domain benchmark + regression suite;
- shadow comparison;
- stronger sample requirements;
- no automatic evaluator/schema changes.

### HIGH

Examples:
- shared integration interface;
- auth/permissions;
- storage schema/migration;
- core execution/task lifecycle;
- GitHub mutation layer;
- rollback/recovery behavior.

Policy:
- manual approval;
- integration + recovery/fault evidence;
- Android/product proof when relevant;
- explicit DECISIONS/INTEGRATION_CONTRACTS updates.

### CRITICAL

Examples:
- evaluator plane;
- constitution/proof policy;
- Self-Development engine itself;
- protected-path policy;
- promotion/rollback authority.

Policy:
- never autonomously self-modified;
- separate governance change;
- independent review;
- adversarial/mutation testing;
- manual approval;
- no same-candidate benchmark changes.

## 5. Scope permissions

Every experiment declares:
- subsystem;
- exact allowedPaths;
- forbidden/protected paths;
- permitted tool capabilities;
- network/research permission;
- maximum candidate files/bytes;
- maximum repair attempts;
- maximum benchmark budget;
- whether migration is permitted;
- approval mode.

Unknown scope fails closed.

## 6. Self-destruction defenses

### Recursive modification
Self-Development/evaluator plane is CRITICAL and outside ordinary autonomous candidate scope.

### Test deletion/weakening
Evaluator-owned mandatory tests cannot be changed by candidate workspace. Test additions by candidate do not replace mandatory tests.

### Evaluator gaming
Eval lock binds corpus hash, baseline version and judge rules before coding begins.

### Success-criteria drift
Metric registry and acceptance policy are versioned and locked before candidate execution.

### Permission bypass
Coding/Tools ReferenceMonitor remains outside the model. Model text cannot create grants.

### Hidden failures
All required gates report PASS/FAIL/BLOCKED/INCONCLUSIVE; missing evidence cannot be silently omitted.

### Protected contracts
Shared contract changes are HIGH; require DECISIONS + INTEGRATION_CONTRACTS + integration tests and manual review.

### Endless rewrite loops
Repair/hypothesis/candidate counts are bounded. Repeated failure terminates with REJECT/BLOCKED and a lesson.

### Reward hacking
Adversarial evaluation includes shortcut, test tamper, evaluator mutation, stale SHA, fabricated evidence, skipped verification and scope escape fixtures.

## 7. Domain optimization adapters

Self-Development core is domain-neutral. Each adapter supplies metrics and bounded change classes.

1. Prompts — held-out task quality and token/latency cost.
2. Context — answer quality, evidence retention, context tokens.
3. Memory — recall/precision/temporal/update/abstention + hard forget/provenance.
4. Model routing — quality/cost/latency/availability/route recall.
5. Tool selection — task completion, tool hallucination/miss, effect safety, latency.
6. Web research — claim-evidence coverage, freshness, contradiction handling, latency.
7. Coding — issue resolution, regression, diff risk, rollback.
8. Latency — p50/p90/TTFT with quality floor.
9. Token/cost efficiency — resource use under invariant quality floor.
10. UI behavior — measurable friction, errors, accessibility, long tasks/layout shifts; visual review where needed.
11. Error handling — recovery success, state preservation.
12. Agent workflows — completion/retry/handoff/error rates.
13. Tests — mutation kill/regression detection/flakiness, not count.
14. Architecture — integration/fault/performance evidence and explicit contracts.

## 8. Comparison protocol

For each experiment:

1. freeze evaluator identity;
2. capture baseline SHA/artifact/environment;
3. run baseline N times where stochastic;
4. build isolated candidate through Coding System;
5. run candidate under same evaluator/environment;
6. compare raw metrics and confidence intervals/tolerances;
7. run hard regressions;
8. independent critique;
9. decision;
10. preserve full evidence bundle.

Do not compare measurements from incompatible corpus/environment/model versions without explicitly marking them non-comparable.

## 9. Integration with Seven today

Reuse rather than replace:
- evolution/eval-lock.cjs for evaluator identity;
- evolution/coordinator.cjs for lifecycle;
- evolution/engine.cjs and durable-engine.cjs for promotion/recovery;
- evolution/ledger.cjs for tamper-evident event chains;
- .seven-team/autonomy/constitution.json and proof-policy.json for hard invariants;
- evolution-arena.json for Champion/Challenger framing;
- causal-learning.json for lesson semantics;
- observatory.json as the seed metric/privacy contract;
- Memory v2 / Tools v1 / Model Intelligence champion baselines.

Replace/deprecate over time:
- release/github-self-dev.js as an independent mutation authority.
It should become a UI/orchestrator over Coding System + Self-Development, not a parallel implementation.

## 10. Minimal canonical records

### ObservationRecord

- schemaVersion
- id
- timestamp
- source
- subsystem
- kind
- outcome
- severity
- runId/requestId (optional)
- metrics
- metadata (strict allowlist)
- evidenceRefs
- fingerprint

### DiagnosisRecord

- id
- observationIds
- symptom
- affectedSubsystems
- hypotheses[]
- confidence
- causalStatus
- missingEvidence
- recommendedExperiment

### ImprovementHypothesis

- id
- diagnosisId
- mechanism
- expectedEffects
- risk
- allowedPaths
- affectedSystems
- validationPlan
- rollbackPlan
- researchEvidence

### EvaluationBundle

- evaluatorIdentity
- baselineIdentity
- candidateIdentity
- environmentIdentity
- rawResults
- normalizedMetrics
- hardGates
- comparison
- proofLevel
- reviewerVerdict
- knownUnknowns

### LearningRecord

- experimentId
- hypothesis
- baseline
- candidate
- observedMetrics
- confounders
- decision
- lesson
- evidenceDigest

## 11. System invariant

Seven never says "this is better" because it generated a plausible patch.

The only valid promotion narrative is:

Baseline identity
→ Candidate identity
→ Locked evaluator
→ Tests/benchmarks
→ Comparable metrics
→ Hard-gate review
→ Independent critique where required
→ Decision
→ Rollback readiness
→ Durable evidence.

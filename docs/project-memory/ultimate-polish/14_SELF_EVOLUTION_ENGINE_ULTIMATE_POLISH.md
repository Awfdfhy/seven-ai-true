# Seven AI — Capability 14 Self-Evolution Engine Ultimate Polish

Status: **FREEZE CANDIDATE AFTER DOUBLE-POLISH RECONCILIATION**
Implementation status: **Deferred / meaningful experiment foundations exist**
Final target: **Seven Evolution Engine 3.0 — Governed Hypothesis-to-Promotion Improvement Laboratory**

## Executive decision

Seven may automate the search for better prompts, routing rules, retrieval policies, tool configurations, UI/runtime parameters and even code candidates, but the system that *proposes* an improvement must never be the sole authority that *accepts* that improvement.

> **Prime law:** Exploration may be creative; promotion is conservative. Every self-improvement begins as a bounded experiment against an immutable baseline and can become canonical only through locked evaluations, independent verification, critical gates, staged rollout and proven rollback/recovery.

Self-evolution is therefore a governed R&D laboratory, not unrestricted self-modification.

---

# 1. Ground truth

Seven already has strong early pieces:

- `evolution/experiment-lab.cjs` requires explicit experiment identity, subsystem, hypothesis, baseline, candidate, allowed paths and metrics;
- protected evaluator/runtime paths are excluded from ordinary experiments;
- changed paths are checked before a candidate becomes eligible;
- coding candidates run in isolated workspaces and stable-state mutations are detected/restored;
- eval locks protect baseline/corpus identity;
- promotion gates already require isolation, regression freedom, provenance, rollback readiness, free-proof and license checks;
- shadow/canary/promotion concepts already exist.

The weak point is the old scalar candidate evaluator, which combines several dimensions into one weighted score. The frozen #12 Verification Fabric and #13 Seven Evals now provide a stronger foundation: explicit critical gates, multi-axis evidence, uncertainty, locked identities and `INCONCLUSIVE`/`INSUFFICIENT_EVIDENCE` states.

#14 should preserve the existing isolation/gate philosophy while replacing simplistic score-based promotion.

---

# 2. Research synthesis

## Darwin Gödel Machine, 2025
Open-ended archives and self-modification can discover meaningful agent improvements across tools, context management and review mechanisms. The work uses empirical validation and safety precautions rather than assuming a self-proposed change is beneficial.

Seven implication: maintain diverse candidate exploration, but separate search/exploration from acceptance authority.

## Automatic prompt optimization research
Prompt/configuration search can be framed as constrained optimization over candidate variants rather than manual intuition.

Seven implication: use multiple search operators where justified, while keeping the objective/eval contract external and locked.

## NIST 2026 evaluation guidance
Agentic evaluations need traceability, validity and resistance to evaluator loopholes.

Seven implication: the evolution system cannot edit or select its own acceptance criteria during an active experiment.

## Seven's own frozen architecture
Capabilities 08, 12 and 13 already imply the central governance rule: authority, verification and evaluation stay outside the mutable candidate surface.

---

# 3. Ownership boundary

Self-Evolution owns:
- opportunity/problem intake;
- experiment hypotheses;
- candidate generation/search;
- experiment isolation;
- candidate lineage/archive;
- multi-objective comparison;
- shadow/canary orchestration;
- rollback-plan requirement;
- promotion proposal;
- post-promotion monitoring;
- learning from accepted/rejected experiments.

It does not own:
- permission authority — Capability 08;
- effect truth — Capability 09;
- code/file mutation primitives — Capabilities 10/11;
- final verification — Capability 12;
- eval definitions/locked measurement policy — Capability 13;
- release signing/branch protection.

---

# 4. Pass A — MAXIMIZE

## 4.1 Evolution surface classes

Not every part of Seven has equal mutability.

### E0 — SAFE_DERIVED_TUNING
Examples: non-security ranking weights, optional thresholds, cache heuristics, presentation defaults.
Can be explored with the lightest governance if bounded and reversible.

### E1 — BEHAVIOR_CONFIG
Prompts, retrieval policies, routing/configuration policies, tool-selection heuristics, compression parameters.
Requires locked evals and regression gates.

### E2 — COMPONENT_CANDIDATE
Replace/add a bounded component, adapter or algorithm behind stable contracts.
Requires shadow/canary plus stronger compatibility/performance checks.

### E3 — CODE_CHANGE
Repository/runtime code candidate.
Must use Coding Agent + Project File Fabric candidate transaction and full verification/promotion gates.

### E4 — CONTROL_PLANE_CRITICAL
Security policy, permission kernel, evaluator definitions, release gates, credential handling, protected source/release trust, canonical promotion logic.
Not autonomously mutable under ordinary evolution. Changes require dedicated stronger human/administrative authority and separate review.

The class is authoritative policy metadata, not something the candidate can self-declare downward.

## 4.2 ImprovementOpportunity

Opportunities may originate from:
- failed eval strata;
- repeated user/task failures;
- verified performance bottlenecks;
- provider/tool drift;
- regression reports;
- architecture backlog;
- explicit user/developer request;
- research findings.

An opportunity carries evidence, affected capability, severity, frequency and current baseline refs.

No automatic experiment is created from one anecdote unless policy allows a diagnostic exploration.

## 4.3 ExperimentContract

Every experiment binds:
- experiment id/version;
- target subsystem/evolution class;
- falsifiable hypothesis;
- baseline artifact/config/runtime identity;
- candidate search space;
- allowed files/config keys/components;
- protected exclusions;
- locked EvaluationProgram/Suite refs;
- verification contract;
- critical gates;
- minimum evidence/trial policy;
- resource budget;
- max candidates/generations;
- time/compute budget;
- rollback/checkpoint requirements;
- shadow/canary policy;
- promotion authority;
- stop conditions.

Changing the acceptance target creates a new experiment version.

## 4.4 Hypothesis discipline

A valid hypothesis states:
- what is changed;
- expected benefit;
- affected task strata;
- expected cost/trade-off;
- falsification evidence.

Example shape:
`Changing X should improve Y on strata S without regressing critical gates G or exceeding resource delta R.`

"Make Seven smarter" is not an experiment hypothesis.

## 4.5 Immutable baseline

Each experiment pins an exact baseline:
- source/config/model/tool catalogue refs as relevant;
- eval identity;
- environment/device profile;
- performance baseline;
- policy versions.

Candidate generation never mutates the baseline.

## 4.6 CandidateRecord

Each candidate records:
- candidate id;
- parent candidate(s);
- experiment id;
- mutation/search operator;
- exact change set/config delta;
- creator model/tool/version;
- generation index;
- random seed when relevant;
- dependency/runtime refs;
- resource cost to generate;
- verification/eval refs;
- disposition.

Candidate lineage forms a DAG/archive, not a mutable "current best" blob.

## 4.7 Search operators

The engine may support several bounded operators:
- deterministic grid/parameter search;
- random search;
- Bayesian/optimizer-guided search where suitable;
- evolutionary mutation/crossover of compatible candidates;
- model-proposed prompt/config/code candidates;
- error-driven repair proposals;
- research-derived variants.

No search operator receives authority to alter the ExperimentContract or promotion gates.

## 4.8 Champion + archive

Maintain:
- immutable baseline champion;
- current promoted champion by component/version;
- bounded diverse candidate archive;
- Pareto set for meaningful trade-offs.

Do not retain every low-value candidate forever.

Archive pruning preserves:
- promoted/rejected exemplars;
- high-diversity stepping stones;
- important failures;
- reproducibility metadata.

## 4.9 Multi-objective comparison

Replace the old universal weighted score with typed objectives and gates.

Candidate comparison considers:
- task quality;
- reliability;
- critical invariants;
- latency;
- token/tool/network cost;
- RAM/CPU/battery/thermal where relevant;
- context size;
- provider/free eligibility;
- maintainability/complexity;
- bundle/storage cost;
- uncertainty.

Use Pareto dominance plus policy thresholds instead of assuming one static set of weights fits every subsystem.

A subsystem-specific utility function may be used only as a derived decision aid after critical gates and uncertainty rules.

## 4.10 Complexity tax

Every candidate pays for added complexity.

Track:
- new dependencies;
- bundle/APK size;
- additional startup work;
- persistent state/schema complexity;
- maintenance burden;
- new failure modes;
- security/permission surface;
- migration cost.

A tiny quality gain can be rejected if it purchases unacceptable permanent complexity.

## 4.11 Candidate evaluation

All candidates use Capability 13 locked EvalIdentity and Capability 12 independent verdicts.

Pipeline:
`Generate -> static admissibility -> cheap gates -> relevant eval slices -> verification -> broader regression if still eligible -> comparison`.

The candidate cannot modify the active eval fixtures, graders or required metrics.

## 4.12 Generalization / anti-overfit

Before promotion, evaluate beyond the exact optimization slice where feasible:
- shadow/holdout cases;
- adjacent task strata;
- multilingual parity;
- alternate seeds/trials;
- different representative projects/content;
- device/provider variants relevant to the change.

Improvement isolated to the development cases is treated cautiously.

## 4.13 Shadow stage

`ELIGIBLE_FOR_SHADOW` means the candidate can run alongside the stable version without controlling canonical user-visible output/state.

Shadow records:
- matched inputs where privacy/policy allows;
- candidate outcome;
- stable outcome;
- latency/resource delta;
- verification/eval differences;
- divergence reasons.

Shadow has no authority to mutate live user state.

## 4.14 Canary stage

For changes whose real behavior needs controlled live validation, canary deployment is:
- explicit and reversible;
- narrow population/scope;
- separately versioned;
- monitored for target metrics and critical incidents;
- equipped with immediate rollback trigger.

Canary is not required for every offline prompt/config change; policy selects it by evolution class/risk.

## 4.15 PromotionDecision

Canonical outcomes:
- `PROMOTE`
- `PROMOTE_WITH_MONITORING`
- `HOLD_FOR_MORE_EVIDENCE`
- `REJECT`
- `REVERT`
- `NON_COMPARABLE`

Promotion requires:
- all mandatory critical gates;
- compatible eval identity;
- independent verification PASS;
- required improvement threshold or justified Pareto improvement;
- rollback/checkpoint proof;
- no unresolved high-severity regression;
- required authority.

No candidate promotes itself.

## 4.16 Promotion transaction

Promotion is a separate canonical transaction:
- candidate id/hash;
- previous champion ref;
- promotion authority/receipt;
- migration plan if needed;
- rollback checkpoint;
- effective version/time;
- post-promotion monitor plan.

For code/runtime changes, promotion uses branch/release processes rather than direct stable mutation.

## 4.17 Rollback/revert

Every promotable E1–E4 change defines a recovery path appropriate to its class.

Rollback proof checks:
- previous version/artifact still available;
- schema/data compatibility or reverse migration plan;
- config/provider dependencies;
- state/effect constraints;
- rollback verification checks.

Rollback is itself verified. A declared rollback capability without a tested path is insufficient for critical promotion.

## 4.18 Post-promotion monitoring

After promotion track:
- regression indicators;
- live quality/latency/resource shifts;
- error rates;
- provider/environment drift;
- user-visible failures where privacy/policy allows;
- rollback triggers.

Monitoring is bounded/event-driven, not a permanent high-cost background process.

## 4.19 Learning from experiments

Store compact `ExperimentOutcome` records:
- hypothesis;
- candidate family;
- eval identity;
- results;
- rejected reasons;
- promotion/revert outcome;
- verified general lesson candidates.

Durable lessons are admitted through Memory Fabric. Raw failed thought traces are not blindly stored.

## 4.20 Evaluation integrity boundary

Active experiment candidates cannot mutate:
- eval corpus/graders/locks;
- verification policy;
- security/permission policy;
- protected release/CI gates;
- baseline/champion refs;
- experiment acceptance criteria.

Changes to those systems are separate human-authorized experiments evaluated externally.

## 4.21 Provider/model evolution

Model/provider changes are treated as candidates with:
- exact deployment/revision identity;
- strict-free eligibility evidence where required;
- quality/reliability/latency/resource tests;
- date-bound live availability;
- fallback behavior;
- privacy/capability constraints.

A newer model is not automatically better or eligible.

## 4.22 Prompt evolution

Prompt changes are first-class versioned artifacts.

Track:
- template/version/hash;
- affected surfaces;
- token delta;
- context/cache impact;
- behavior/eval changes;
- locale effects.

Prompt optimization cannot write hidden instructions into user/project content or bypass authority layers.

## 4.23 Retrieval/context evolution

Changes to ranking/compression/retrieval are evaluated not only on answer score but also:
- retrieval recall/precision where measurable;
- context tokens;
- lost-critical-information rate;
- authority/lineage preservation;
- latency/battery;
- Arabic/long-chat behavior.

## 4.24 Tool evolution

Tool candidate changes must preserve:
- capability contracts;
- schemas;
- authorization semantics;
- idempotency/effect semantics;
- startup/resource budgets.

New tools do not become active merely because discovery found them.

## 4.25 Self-evolution of the evolution engine

The engine may propose improvements to its own non-critical search heuristics, but it cannot alter its own promotion gates/eval protections under ordinary authority.

Any candidate targeting Evolution Engine logic is evaluated from an external stable evaluator/control-plane version.

This prevents a candidate from winning by weakening the referee.

---

# 5. Velocity assault

- no continuous self-improvement loop on a phone;
- evolution runs only when explicitly triggered, scheduled under appropriate conditions, or invoked by development/release workflows;
- cheap admissibility gates before expensive evals;
- evaluate impacted suites before full regressions;
- reuse immutable baseline artifacts;
- parallel candidate evaluation only within Resource Governor budgets;
- aggressive early rejection of critical-gate failures;
- bounded candidate archive;
- lazy-load optimization libraries/operators;
- heavy code/build/device experiments remain host/CI territory;
- ordinary Seven end-user startup cost from Self-Evolution is approximately zero.

---

# 6. Pass B — DESTROY THE WINNER

Rejected alternatives:

## Continuous autonomous self-modification
Rejected. High battery/resource cost and weak governance.

## One weighted score decides promotion
Rejected. It can hide critical regressions and subsystem-specific trade-offs.

## Candidate can improve its own tests
Rejected inside an active experiment because it invalidates measurement identity.

## Best development-set candidate becomes stable immediately
Rejected. Requires independent verification/generalization and staged promotion.

## Keep every candidate forever
Rejected. Archive bloat; preserve diverse/high-value lineage instead.

## Always use open-ended evolutionary search
Rejected. Simple grid/random/deterministic tuning is often cheaper and more reproducible.

## Require canary for every tiny change
Rejected. Promotion policy scales with impact/evolution class.

## Automatic rollback claim without rehearsal/evidence
Rejected for critical changes.

## Allow the Evolution Engine to rewrite its own promotion rules
Rejected under ordinary authority.

---

# 7. Reconciliation result

The final architecture is:

`Opportunity -> ExperimentContract -> immutable baseline/eval lock -> bounded candidate search -> candidate archive/Pareto analysis -> independent verification -> shadow -> optional canary -> PromotionDecision -> promotion transaction -> monitoring/rollback`.

Existing ExperimentLab, eval-lock, candidate isolation and shadow/canary concepts are preserved and strengthened.

---

# 8. Canonical objects

- `ImprovementOpportunity`
- `ExperimentContract`
- `EvolutionSurfacePolicy`
- `BaselineSnapshot`
- `CandidateRecord`
- `CandidateLineage`
- `SearchOperatorSpec`
- `CandidateArchive`
- `ParetoSnapshot`
- `ExperimentEvidenceBundle`
- `ShadowRunRecord`
- `CanaryPlan`
- `PromotionDecision`
- `PromotionTransaction`
- `RollbackPlan`
- `PostPromotionMonitor`
- `ExperimentOutcome`

---

# 9. Frozen invariants

1. Exploration authority and promotion authority are separate.
2. Every experiment has a falsifiable hypothesis and immutable baseline.
3. Candidate scope is explicit and protected surfaces remain excluded by policy.
4. Active candidates cannot rewrite their eval/verification/promotion rules.
5. Promotion uses locked Capability 13 evaluations and Capability 12 verification.
6. Critical gates cannot be averaged away.
7. One universal weighted score is not canonical promotion truth.
8. Candidate lineage is preserved.
9. Generalization/holdout evidence is required according to experiment class/risk.
10. Shadow has no canonical mutation authority.
11. Canary is bounded and reversible when required.
12. No candidate self-promotes.
13. Promotion is a separate authorized transaction.
14. Critical promotable changes require a credible rollback/recovery path.
15. Evolution-engine control-plane changes require external stable evaluation.
16. Self-evolution imposes approximately zero ordinary app startup/background cost.

---

# 10. Evaluation contract

- safe derived-parameter tuning;
- prompt candidate search;
- routing/retrieval policy evolution;
- component replacement;
- isolated code candidate;
- regression hidden by scalar average;
- development-set overfit caught by holdout;
- candidate tries to touch protected evaluator paths;
- eval-lock mutation;
- insufficient evidence;
- non-comparable environment/provider drift;
- shadow divergence;
- canary regression and rollback;
- rollback plan unavailable;
- promotion authorization missing;
- candidate archive pruning/reproducibility;
- self-evolution-engine candidate externally evaluated;
- mobile idle/startup resource impact.

---

# 11. Implementation stages

- **SE-P0** EvolutionSurfacePolicy + ExperimentContract 2.0.
- **SE-P1** immutable baseline/candidate lineage/archive.
- **SE-P2** replace scalar evaluator with Capability 12/13 comparison contracts.
- **SE-P3** search operator interface + bounded candidate generation.
- **SE-P4** Pareto/complexity-tax comparison.
- **SE-P5** holdout/generalization and experiment evidence bundle.
- **SE-P6** shadow orchestration.
- **SE-P7** canary/promotion transaction.
- **SE-P8** rollback/revert/post-promotion monitoring.
- **SE-P9** prompt/model/retrieval/tool/code evolution adapters.
- **SE-P10** evolution-engine external evaluation boundary.
- **SE-P11** long-run, overfit, rollback, measurement-integrity and resource gates.

---

# 12. Proof of improvement

Compared with the current evolution stack, Evolution Engine 3.0:
- preserves strong protected-path, isolated-candidate and eval-lock foundations;
- replaces one weighted score with critical gates + multi-objective/Pareto evidence;
- makes hypotheses falsifiable and experiments reproducible;
- separates candidate creation from promotion authority;
- prevents active candidates from changing their own acceptance tests;
- adds holdout/generalization, shadow, optional canary and post-promotion monitoring;
- requires real rollback evidence for critical changes;
- supports open-ended exploration without making it the default or granting it control-plane authority;
- stays off the mobile hot path.

---

# 13. Research references

- Zhang et al., **Darwin Gödel Machine: Open-Ended Evolution of Self-Improving Agents**, 2025.
- Surveys of automatic prompt optimization / automatic prompt engineering, 2025.
- NIST 2026 agent evaluation probes and automated evaluation validity guidance.
- Existing Seven `experiment-lab.cjs`, `eval-lock.cjs`, coding-candidate isolation and shadow/canary promotion foundations.

---

# 14. Freeze recommendation

**FREEZE CANDIDATE ACCEPTED.**

Final target: **Seven Evolution Engine 3.0 — Governed Hypothesis-to-Promotion Improvement Laboratory**.

Implementation remains deferred until campaign reconciliation. No protected product source is modified by this architecture document.

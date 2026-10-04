# Seven Self-Development v1 — Execution Plan

Status: ACTIVE
Date: 2026-10-05
Tracking: #100

## Dependency truth

Self-Development depends on the authoritative Coding System for production mutation.

Current repo truth on 2026-10-05:
- Coding v1 has RESEARCH_SYNTHESIS.md and EXECUTION_PLAN.md.
- .seven-team/coding-v1/IMPLEMENTATION_EVIDENCE.md is absent.
- release/workspaces/coding.js remains a read-only/import/context UI surface without an authoritative shell/file bridge.
- release/github-self-dev.js can mutate GitHub today, but it is a legacy parallel path and does not satisfy the new Coding System contract.

Therefore Self-Development phases that create production candidates MUST remain fail-closed until Coding System proves exact-SHA isolated mutation + test/verify evidence.

## Phase 1 — Observation & Diagnosis Foundation

Goal:
Create content-minimized structured observations, deterministic weakness aggregation, bounded diagnosis/hypothesis records and risk classification without granting production mutation authority.

Deliverables:
- evolution/self-development-observer.cjs
- evolution/self-development-diagnosis.cjs
- evolution/self-development-foundation.test.cjs
- research/architecture/plan/evidence docs
- master coordination updates

Acceptance:
- rejects prompt/response/secret-like telemetry fields;
- rejects non-finite metrics and unknown unsafe metadata;
- bounded event buffer;
- deterministic fingerprints;
- repeated failures aggregate into stable weakness signatures;
- diagnosis never labels observational evidence as causal proof;
- critical signal can escalate immediately;
- risk policy classifies selfdev/evaluator/shared-contract changes HIGH/CRITICAL;
- no GitHub/code mutation capability exists in these modules;
- existing full test suite remains green.

## Phase 2 — Metric Registry & Paired Evaluator

Goal:
Make baseline/candidate comparison explicit and domain-aware.

Deliverables:
- metric registry with direction/unit/sample/tolerance/proof policy;
- evaluation manifest bound to eval-lock;
- paired baseline/candidate runner;
- hard-gate matrix;
- variance/sample sufficiency logic;
- result states PASS/FAIL/BLOCKED/INCONCLUSIVE.

Tests:
- same evaluator identity required;
- incomparable environment rejected;
- missing metric stays INCONCLUSIVE;
- target improvement cannot override hard regression;
- noisy/insufficient sample cannot promote.

## Phase 3 — Research + Hypothesis Engine

Goal:
Use research selectively to reduce uncertainty and generate several falsifiable remedies.

Deliverables:
- research trigger policy;
- evidence/claim record;
- contradiction/freshness/gap handling;
- multi-hypothesis generation contract;
- prior-failure lookup from learning archive.

Tests:
- research cannot authorize mutation;
- unsupported claim marked uncertain;
- multiple alternatives for ambiguous root cause;
- previously rejected identical hypothesis is not retried without new evidence.

## Phase 4 — Improvement Planner

Goal:
Prioritize by evidence-based multi-objective policy.

Dimensions:
- expected gain;
- confidence;
- risk;
- cost;
- evaluation cost;
- blast radius;
- reversibility;
- user impact.

Deliverables:
- Pareto-aware candidate ranking;
- risk-specific proof plan;
- budget policy;
- change-scope manifest.

Tests:
- HIGH/CRITICAL cannot auto-promote;
- cheap small gain does not suppress necessary hard fix;
- hard-block candidate never wins aggregate score;
- planner cannot lower evaluator requirements.

## Phase 5 — Coding System Integration

BLOCKED until Coding v1 implementation evidence is proven.

Goal:
Replace direct self-dev mutation with a strict Coding System port.

Required Coding interface:
- exact baseline snapshot;
- isolated candidate workspace;
- repo map/source inspection;
- transactional patch;
- deterministic mandatory test selection;
- diff review;
- targeted + regression verification;
- evidence bundle;
- discard/rollback.

Migration:
- release/github-self-dev.js becomes UI/orchestrator only.
- no direct planFiles → model patch → GitHub contents write path for governed self-development.

Tests:
- stale SHA;
- concurrent edit;
- evaluator path attempt;
- test weakening;
- partial multi-file failure;
- rollback;
- candidate evidence binding.

## Phase 6 — Independent Critic & Acceptance Gate

Goal:
Separate builder from reviewer and make promotion policy explicit.

Deliverables:
- reviewer adapter;
- architecture/security/regression review schema;
- risk-specific reviewer requirements;
- acceptance decision engine;
- shadow-only state when review evidence is insufficient.

Tests:
- builder cannot self-certify MEDIUM/HIGH;
- critic disagreement preserved;
- missing reviewer yields BLOCKED/SHADOW_ONLY;
- hard gates dominate critic optimism.

## Phase 7 — Learning Archive & Recovery

Goal:
Retain lessons from success, failure and rollback.

Deliverables:
- tamper-evident LearningRecord chain;
- dedup/retry suppression;
- ADOPT/AVOID/RETEST lessons;
- recovery hooks into durable Evolution Core;
- post-promotion health monitoring.

Tests:
- failed experiment retained;
- corrupted lesson archive detected;
- lesson cannot grant permissions;
- rollback result becomes a negative lesson;
- unfinished run blocks unsafe new run.

## Phase 8 — Domain Optimizers

Introduce one at a time as challengers:

1. Prompt optimizer
2. Context optimizer
3. Memory optimizer
4. Model routing optimizer
5. Tool selection optimizer
6. Research/search optimizer
7. Coding behavior optimizer
8. Latency optimizer
9. Token/cost optimizer
10. Error/recovery optimizer
11. Measurable UI optimizer
12. Workflow optimizer
13. Test-quality optimizer
14. Architecture optimizer

Each adapter must define:
- champion baseline;
- allowed change class;
- metrics;
- held-out gates;
- hard invariants;
- rollback strategy.

## Phase 9 — Adversarial Self-Development Evaluation

Attack corpus:
- evaluator/test deletion;
- test weakening;
- hidden success-criteria change;
- stale baseline SHA;
- fabricated evidence;
- skipped test stage;
- fake reviewer verdict;
- scope escape;
- recursive self-modification;
- infinite repair loop;
- protected contract mutation;
- secrets in telemetry;
- candidate learns held-out test answer;
- candidate edits benchmark instead of product;
- CI false-green;
- rollback failure.

Promotion condition:
0 successful evaluator-plane tampering in the adversarial corpus.

## Phase 10 — Product / Android Integration

Goal:
Expose truthful Self-Development UX without giving UI state authority.

UI states:
- observing;
- diagnosed;
- researching;
- proposing;
- coding;
- testing;
- comparing;
- review-required;
- accepted;
- rejected;
- rolled-back;
- blocked;
- inconclusive.

Android proof:
- exact artifact identity;
- lifecycle/restore;
- background task safety;
- no credentials/prompts in logs;
- controlled GitHub authorization;
- rollback/recovery journey.

## Final Definition of Done

The system is complete only after at least these exact end-to-end fixtures pass:

### Positive fixture
Observe a seeded weakness
→ diagnose correct root-cause family
→ propose bounded improvement
→ Coding System isolated patch
→ baseline/candidate same evaluator
→ target metric improves
→ no hard regression
→ reviewer approves
→ accepted candidate promoted
→ evidence + lesson preserved.

### Negative fixture
Observe a seeded weakness
→ plausible but harmful patch
→ tests or benchmark reveal regression
→ candidate rejected
→ stable champion unchanged
→ rejection evidence + lesson preserved.

### Recovery fixture
Candidate is promoted in controlled canary
→ post-promotion critical health signal
→ exact rollback succeeds
→ ledger remains valid
→ future planner avoids/retests with recorded lesson.

### Attack fixture
Candidate attempts evaluator/test/criteria mutation
→ scope/reference monitor blocks before promotion
→ attempt is recorded
→ stable champion/evaluator remain unchanged.

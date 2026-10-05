# Seven Self-Development v1 — Implementation Evidence

Updated: 2026-10-05
Tracking issue: #100
Phase 1 PR: #102

## Phase 1 — Observation & Diagnosis Foundation

Status: **CI_PROVEN / INDEPENDENT_REVIEW_PENDING**

### Exact candidate identity

- PR base SHA: `b3e3ffa4fe676a838ed658e22fad1576cfe11237`
- tested branch head SHA: `7a5ec226f954e915188174111d46e21740e327c0`
- PR merge candidate observed before CI: `c612a17ea90e69b63341e63f2662a639104d4cb2`
- GitHub Actions workflow: **Seven AI tests #3221**
- workflow run id: `37259817886`
- conclusion: **SUCCESS**

The candidate was rebuilt/reconciled after earlier base drift. PR #101 was closed without merge when its baseline became stale; no stale candidate was promoted.

## Full regression evidence

`node all.cjs`:
- **PASS**
- **34 suites**
- release artifact upload: **PASS**

Relevant exact log evidence:
- `self-development foundation test suite: PASS`
- `all test suites: PASS (34 suites)`
- `static audit: PASS`

Static audit on the exact PR run:
- hot release layer: **99,710 / 100,000 bytes**
- result: PASS
- warning: `release-layer-low-headroom 290`

Phase 1 modifies `evolution/`, `.seven-team/` and coordination documentation, not the hot release runtime. The low-headroom warning is therefore recorded as a shared release risk, not claimed as a Phase 1 regression.

## Phase 1 capabilities proven

The deterministic foundation suite proved:

1. observation records are content-minimized and deterministic;
2. prompt/response/credential-shaped metadata is rejected;
3. secret-like run identifiers and evidence references are rejected;
4. unknown, non-finite and out-of-range metrics fail closed;
5. observation buffer is bounded and snapshots are detached;
6. caller-supplied forged normalization flags cannot bypass revalidation;
7. successful observations do not become weakness clusters;
8. repeated coherent failures aggregate deterministically;
9. diagnosis remains `HYPOTHESIS` even after repeated evidence;
10. a single critical crash can escalate without claiming causal certainty;
11. insufficient non-critical evidence blocks planning;
12. risk policy protects evaluator/Self-Development plane;
13. protected-plane proposals route to `GOVERNANCE_REQUIRED`;
14. telemetry policy tables are not caller-mutable exports;
15. Phase 1 exports no production mutation capability.

## Authority proof

Phase 1 modules do **not** export:
- file write;
- shell execution;
- GitHub API mutation;
- commit/merge;
- patch application;
- promotion authority.

They produce observations, diagnoses and bounded improvement proposals only.

## Known open proof obligations

- Independent reviewer verdict is still required because this is a CRITICAL authority-plane change.
- Production patching is still blocked on the authoritative Coding System contract. The dedicated `.seven-team/coding-v1/IMPLEMENTATION_EVIDENCE.md` was absent at the tested baseline.
- Phase 2 metric registry / paired evaluator is not part of the Phase 1 proof.
- End-to-end Self-Development Definition of Done is not yet satisfied.

## Decision

**Phase 1 implementation evidence is ACCEPTABLE FOR REVIEW, not yet ACCEPTED FOR MERGE.**

No completion claim is made for the full Self-Development System.

## Phase 2 — Metric Registry + Paired Evaluator

Status: **CI_PROVEN / STACKED_REVIEW_PENDING**

### Exact tested identity

- stacked PR: #108
- tested Phase 2 head: `357525adcc5f2864c5cca34a88cc1bd293fc3de3`
- base branch at test: `self-development-v1-phase1`
- GitHub Actions workflow: **Seven AI tests #3254**
- workflow run id: `37260411667`
- conclusion: **SUCCESS**
- `all test suites: PASS (39 suites)`
- release artifact upload: **PASS**
- `self-development paired evaluator test suite: PASS`

### Proven controls

- static metric definitions; callers cannot invent a success metric;
- exact 40-char baseline/candidate SHA identity;
- evaluator lock verified when manifest is created and again when evaluation runs;
- environment identity is bound to the manifest;
- secret-like environment identity is rejected;
- unequal paired run counts become INCONCLUSIVE;
- insufficient samples become INCONCLUSIVE;
- excessive variance becomes INCONCLUSIVE;
- environment mismatch becomes BLOCKED;
- metric not present in locked manifest becomes BLOCKED;
- missing mandatory hard-gate evidence becomes INCONCLUSIVE;
- failed hard gate overrides metric gains;
- hard metric regression overrides quality gains;
- regression beyond tolerance rejects candidate;
- declared target must actually improve;
- manifest tampering becomes BLOCKED;
- deterministic evidence digest is produced for the comparison.

### Authority state

Phase 2 still has no patch, shell, GitHub mutation, merge or promotion authority.
It measures and compares evidence only.

### Open obligations

- stacked PR #108 must not merge before Phase 1 review/merge;
- independent review remains required for authority-plane changes;
- Phase 3 research/hypothesis generation and Phase 4 planning remain separate work;
- production Coding integration remains blocked on the authoritative Coding contract.

## Phase 3 — Selective Research + Hypothesis Engine

Status: **CI_PROVEN / STACKED_REVIEW_PENDING**

### Exact tested identity

- stacked PR: #110
- tested Phase 3 head: `54ab1f8b70c1546c1a12ebd74bfa87a6b1f4c99a`
- base branch: `self-development-v1-phase2`
- GitHub Actions: **Seven AI tests #3281**
- workflow run id: `37260946250`
- conclusion: **SUCCESS**
- `all test suites: PASS (40 suites)`
- `self-development research and hypothesis test suite: PASS`
- release artifact upload: **PASS**

### Proven controls

- high-confidence low-risk internal diagnoses may skip unnecessary web research;
- uncertain, ambiguous, prior-failed, external or HIGH/CRITICAL work triggers research;
- research source identity is HTTPS-only, credential-free and query/hash stripped;
- research summary exposes coverage, gaps, independent hosts, contradictions and staleness;
- hypotheses require known measurable effects and validation metrics;
- CRITICAL protected-plane hypotheses are governance-only;
- caller cannot bypass required research by supplying a fake precomputed decision;
- uncertainty/solution ambiguity/evidence contradiction requires multiple distinct hypotheses;
- duplicate candidates do not count twice;
- previously rejected/rolled-back identical hypotheses are blocked without new evidence;
- new evidence can permit a controlled retest;
- all-required-research-stale blocks planning.

### Authority state

Phase 3 does not perform web requests itself and does not mutate code.
It defines when research is required, validates structured evidence, and constrains hypotheses.

## Phase 4 — Pareto-Aware Improvement Planner

Status: **CI_PROVEN / STACKED_REVIEW_PENDING**

### Exact tested identity

- stacked PR: #111
- tested head: `784fccb99b81411c8f9ec9f29c0f92f30ccfccfa`
- base branch: `self-development-v1-phase3`
- GitHub Actions: **Seven AI tests #3294**
- workflow run id: `37261320461`
- conclusion: **SUCCESS**
- `self-development planner test suite: PASS`
- `all test suites: PASS (41 suites)`
- artifact upload: **PASS**

### Proven controls

- risk derives immutable proof and scope budgets;
- LOW, MEDIUM, HIGH and CRITICAL plans have progressively stronger proof requirements;
- CRITICAL evaluator/Self-Development changes cannot enter ordinary Coding planning;
- HIGH requires manual approval and recovery/security evidence;
- MEDIUM requires independent review;
- scope over-budget fails closed instead of widening authority;
- genuine multi-objective tradeoffs remain on a Pareto frontier;
- strictly dominated candidates are separated;
- hard-failure repairs outrank cheap cosmetic gain when both remain viable;
- governance/blocked candidates cannot win through estimated utility;
- malformed/missing planner assessments fail closed;
- callers cannot downgrade proof requirements through hypothesis fields;
- prioritization is deterministic;
- planner utility is explicitly estimate-only and never acceptance evidence.

## Phase 5 — Coding System Integration

Status: **BLOCKED BY DEPENDENCY**

At this checkpoint:
- `.seven-team/coding-v1/IMPLEMENTATION_EVIDENCE.md` is absent on main;
- no authoritative `CodingSystem.prepareCandidate/applyPlan/runTargetedVerification/discard` runtime was found;
- legacy `release/github-self-dev.js` therefore remains an incompatible parallel mutation path for governed Self-Development.

Self-Development does not fall back to that legacy path.


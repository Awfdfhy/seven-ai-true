# Seven Self-Development v1 — Phase 1 Implementation Evidence

Status: IMPLEMENTED + CI VERIFIED; INDEPENDENT REVIEW STILL REQUIRED
Date: 2026-10-05
Tracking: issue #100
Pull request: #102

## Verified candidate identity

- Candidate head verified by Seven AI tests #3253: `1227380af229e03d53e2b6c779c88bb3453332b6`
- PR base at verification: `ecf20643fd7518ae25902af5d6137e6a7779b9c0`
- Workflow run: `37260383931`
- Workflow: `Seven AI tests`
- Result: **SUCCESS**
- Main command: `node all.cjs`
- Result: **all test suites: PASS (38 suites)**

## Phase 1 implementation

Implemented:
- `evolution/self-development-observer.cjs`
- `evolution/self-development-diagnosis.cjs`
- `evolution/self-development-foundation.test.cjs`

Architecture/research:
- `.seven-team/self-development-v1/RESEARCH_SYNTHESIS.md`
- `.seven-team/self-development-v1/ARCHITECTURE.md`
- `.seven-team/self-development-v1/EXECUTION_PLAN.md`

Shared governance:
- ADR-020 — evidence-gated experiment controller
- ADR-021 — evaluator plane immutable during candidate evaluation
- ADR-022 — content-minimized Self-Development telemetry
- expanded Self-Development integration contract

## Direct Phase 1 test evidence

The exact CI log contains:

- `PASS observation records are content-minimized and deterministic`
- `PASS prompt, response and credential-shaped metadata are structurally rejected`
- `PASS secret-like run identifiers and evidence references fail closed`
- `PASS unknown, non-finite and out-of-range metrics fail closed`
- `PASS observation buffer is bounded and returns detached snapshots`
- `PASS buffer revalidates caller-supplied records instead of trusting forged normalization flags`
- `PASS successful observations do not become weakness clusters`
- `PASS repeated coherent failures aggregate deterministically`
- `PASS diagnosis stays a hypothesis even with repeated evidence`
- `PASS single critical crash can escalate without pretending causal certainty`
- `PASS insufficient non-critical evidence blocks planning`
- `PASS risk policy is conservative and protects evaluator/self-development plane`
- `PASS proposal cannot route protected-plane edits into ordinary Coding System execution`
- `PASS telemetry policy tables are not caller-mutable exports`
- `PASS self-development phase 1 exports no production mutation capability`
- `self-development foundation test suite: PASS`

## Whole-repository evidence

The same run also completed:
- static audit: PASS
- Canon/World/RPG suites: PASS
- integration contracts: PASS
- model registry/observatory: PASS
- release artifact upload: SUCCESS

The CI log ended with:
- `all test suites: PASS (38 suites)`

## Safety properties proven in Phase 1 scope

### Observation privacy boundary
- prompt/response-like metadata is rejected;
- secret-like metadata is rejected;
- secret-like run/evidence identifiers are rejected;
- unknown telemetry keys and metrics fail closed;
- policy tables are module-private;
- callers cannot bypass validation by forging a normalized-record flag.

### Diagnosis boundary
- repeated observation supports a root-cause **hypothesis**, not causal proof;
- non-critical single observations do not create sufficient planning evidence;
- CRITICAL crash signals can escalate without being labeled causally confirmed.

### Mutation boundary
Phase 1 exports no:
- file write;
- shell execution;
- GitHub API mutation;
- patch application;
- merge;
- promotion capability.

A protected evaluator/Self-Development path is classified CRITICAL/GOVERNANCE_REQUIRED rather than ordinary Coding execution.

## Regression / performance note

The verified CI run reported:
- hot release layer: `99,710 / 100,000 bytes`
- warning: `release-layer-low-headroom 290`

Phase 1 adds files under `evolution/` and documentation, not release hot-layer runtime, so this is not attributed as a Phase 1 byte regression. It remains a repository-wide RC constraint and MUST NOT be silenced by raising the budget.

## Remaining acceptance condition

Phase 1 changes the Self-Development/Evolution authority plane and is therefore CRITICAL-risk governance work.

**CI verification is complete, but merge acceptance remains blocked on independent review.**

No automatic merge or autonomous self-approval is claimed.

## Phase 1 verdict

Implementation evidence: **PASS**
Repository regression suite: **PASS**
Self-development specific suite: **PASS**
Production mutation authority added: **NO**
Independent review: **PENDING**

Decision: **READY_FOR_INDEPENDENT_REVIEW**, not autonomously accepted.

---

# Phase 2 — Metric Registry + Locked Paired Evaluator

Status: IMPLEMENTED + CI VERIFIED; STACKED ON PHASE 1
Date: 2026-10-05
Pull request: #108

## Verified candidate identity

- Candidate head: `d6028b1cbaba530596b54ba2462536c517f8ec59`
- Phase 1 base: `78d0b9ad35d4d03d264d33a88e33d747a11aef76`
- Workflow run: `37263361857`
- Seven AI tests run: `#3318`
- Result: **SUCCESS**
- `node all.cjs`: **all test suites: PASS (39 suites)**
- `self-development paired evaluator test suite: PASS`
- release artifact upload: SUCCESS

## Implemented

- `evolution/self-development-metrics.cjs`
- `evolution/self-development-paired-eval.cjs`
- `evolution/self-development-paired-eval.test.cjs`

## Evidence properties proven

### Locked criteria
- unknown/invented metrics are rejected;
- target metrics must be declared before evaluation;
- manifest digest binds evaluator identity, identities, environment, metrics, targets and hard gates;
- manifest tampering is BLOCKED;
- evaluator lock drift is BLOCKED.

### Exact identity
- baseline and candidate require exact 40-char SHAs;
- symbolic refs such as `main` are rejected;
- candidate identity must differ from baseline;
- optional artifact digest must be a full SHA-256 digest.

### Comparable runs
- every run is bound to the exact `manifestDigest`;
- every run is bound to the exact `environmentDigest`;
- unknown environment fields fail closed;
- secret-like environment values are rejected;
- partial metric evidence is INCONCLUSIVE;
- invalid metric values are BLOCKED;
- unequal baseline/candidate run counts are INCONCLUSIVE to prevent cherry-picking.

### Statistical / metric discipline
- metrics have explicit HIGHER_IS_BETTER / LOWER_IS_BETTER direction;
- minimum sample count is enforced;
- excessive variance becomes INCONCLUSIVE;
- minimum improvement and regression tolerance are metric-specific;
- hard constraints such as crash/test regressions override quality gains.

### Acceptance behavior
- missing hard-gate evidence => INCONCLUSIVE;
- failed hard gate => FAIL;
- target metric not improved => FAIL;
- non-hard regression beyond tolerance => FAIL;
- hard metric violation => FAIL even when target quality improves;
- valid paired improvement with all hard gates passing => PASS.

## Phase 2 verdict

Implementation evidence: **PASS**
Whole-repository regression: **PASS**
Paired evaluator suite: **PASS**
Production mutation authority added: **NO**
Independent authority-plane review: **PENDING**

Decision: **READY_FOR_STACKED_REVIEW**, not autonomously promoted.

---

# Phase 3 — Selective Research + Grounded Hypothesis Engine

Status: IMPLEMENTED + CI VERIFIED; STACKED REVIEW PENDING
Date: 2026-10-05
Pull request: #110

## Exact verification

- Hardened Phase 3 head: `6cca3fa70183fe3bc5092f22d8144aae3c03713e`
- Phase 2 base: `84e379993e5b3d5744118a2be5f0ec86f443900e`
- Workflow run: `37263759584`
- Seven AI tests: `#3324`
- Result: **SUCCESS**
- `node all.cjs`: **all test suites: PASS (40 suites)**
- `self-development research and hypothesis test suite: PASS`
- release artifact upload: SUCCESS

## Controls proven

- high-confidence/low-risk internal diagnosis may skip unnecessary research;
- uncertain, ambiguous, external, prior-failed, HIGH and CRITICAL work triggers research;
- source URLs are HTTPS-only, credential-free and canonicalized without query/hash storage;
- research summarizes coverage, gaps, contradictions, freshness, source types and independent hosts;
- hypothesis effects must use known registered metrics;
- uncertain/contradictory/ambiguous cases require multiple distinct hypotheses;
- duplicate hypotheses do not count twice;
- prior REJECT/ROLLBACK cannot be retried merely by inventing a new evidence reference;
- retry evidence must be grounded in current validated research/diagnostic evidence;
- HIGH planning requires at least 2 independent research hosts;
- CRITICAL planning requires at least 3 independent research hosts;
- all-required-research-stale blocks planning;
- CRITICAL protected-plane hypotheses remain GOVERNANCE_REQUIRED.

Authority added: **NO network mutation, NO code mutation, NO shell/GitHub write, NO promotion.**

Decision: **PHASE_3_CI_PROVEN / REVIEW_PENDING**.

---

# Phase 4 — Revalidating Pareto-Aware Improvement Planner

Status: IMPLEMENTED + CI VERIFIED; STACKED REVIEW PENDING
Date: 2026-10-05
Pull request: #111

## Exact verification

- Hardened Phase 4 head: `9783f6065fc6982c65eacbfbbb7ca926aaf5577b`
- Phase 3 base: `12c0f0020d00be761272715168bb4696a6cce255`
- Workflow run: `37264308101`
- Seven AI tests: `#3338`
- Result: **SUCCESS**
- `node all.cjs`: **all test suites: PASS (41 suites)**
- `self-development planner test suite: PASS`
- release artifact upload: SUCCESS

## Controls proven

- raw hypotheses are not accepted by the orchestration planner;
- Phase 3 `validateHypothesisSet` is re-run inside planning;
- fake precomputed `READY_FOR_PLANNING` objects cannot bypass diagnosis/research validation;
- a single-candidate handoff can be re-authorized by ID only after Phase 3 revalidation;
- direct risk/proof derivation is explicitly `orchestrationAuthorized=false`;
- orchestration candidates carry a Phase 3 validation digest;
- LOW/MEDIUM/HIGH/CRITICAL proof profiles are derived from risk, not caller-supplied proof plans;
- CRITICAL candidates are governance-only;
- file/scope budgets fail closed;
- Pareto frontier preserves real cost/gain tradeoffs;
- hard-failure repair receives deterministic priority;
- planner estimates remain non-evidence; evaluator decides acceptance.

Decision: **PHASE_4_CI_PROVEN / REVIEW_PENDING**.

---

# Phase 6 — Trusted Review + Acceptance Gate

Status: IMPLEMENTED + CI VERIFIED; STACKED REVIEW PENDING
Date: 2026-10-05
Pull request: #112
Phase 5 live Coding integration: deliberately BLOCKED on root/main.

## Exact verification

- Hardened Phase 6 head: `984835d3a38bbf920170ac999e6fdf34b5a0329d`
- Phase 4 base: `5fca0be9da9d01cdf86d827b1a27afb57cb1a940`
- Workflow run: `37264635585`
- Seven AI tests: `#3347`
- Result: **SUCCESS**
- `node all.cjs`: **all test suites: PASS (42 suites)**
- `self-development review and acceptance test suite: PASS`
- release artifact upload: SUCCESS

## Controls proven

- acceptance requires an orchestration-authorized Phase 4 plan;
- Phase 3 hypothesis validation is re-run again at acceptance handoff;
- planning validation/scope digests are checked;
- evaluation manifest is reconstructed and bound to the current evaluator lock;
- evaluation result must bind exact manifest, baseline, candidate, environment and metric set;
- evidence-digest tampering is BLOCKED;
- evaluator failure cannot be rescued by reviewer optimism;
- proof JSON is not authority: trusted `proofVerifier` must validate it;
- review JSON is not authority: trusted `reviewVerifier` must validate it;
- MEDIUM self-review cannot satisfy independent review;
- valid-looking independent review without authority verification is ignored/blocked;
- HIGH requires independent review plus separately trusted manual approval;
- builder cannot satisfy HIGH manual approval itself;
- required evaluator-owned hard gates must exist in the manifest and pass;
- CRITICAL changes stay `BLOCKED_GOVERNANCE` even with L8 proof and approvals;
- successful normal-path result is only `ELIGIBLE_FOR_SHADOW`, never direct merge/promotion.

## Authority model

Phase 6 formalizes **data != authority**.
A model can emit a structurally valid proof/review/approval object, but that object cannot authorize progress unless a trusted runtime verifier independently attests it.

Production mutation authority added: **NO**.

Decision: **PHASE_6_CI_PROVEN / REVIEW_PENDING**.

---

# Phase 7 — Tamper-Evident Learning Archive

Status: IMPLEMENTED + CI VERIFIED; STACKED REVIEW PENDING
Date: 2026-10-05
Pull request: #117

## Exact verification

- Phase 7 code head: `deb4ae244d87c898e937d5c8c0c0034e8e2371e3`
- Phase 6 base: `08f653d627b41ac6e2c69b7c47f468b26675d238`
- Workflow run: `37264979259`
- Seven AI tests: `#3353`
- Result: **SUCCESS**
- `node all.cjs`: **all test suites: PASS (43 suites)**
- `self-development learning archive test suite: PASS`
- release artifact upload: SUCCESS

## Controls proven

- learning records bind experiment, diagnosis, hypothesis fingerprint, exact baseline/candidate SHA and evaluator evidence digests;
- accepted/rejected/rolled-back/blocked/inconclusive terminal outcomes are retained;
- ACCEPT -> ADOPT, REJECT/ROLLBACK cannot claim ADOPT, BLOCKED/INCONCLUSIVE -> RETEST;
- only registered metrics can enter metric summaries;
- permission/approval/capability fields are structurally rejected;
- secret-like identifiers/evidence refs are rejected;
- archive reuses the existing Evolution SHA-256 hash chain;
- schema validation still rejects authority-smuggling even if an attacker recomputes the generic ledger hash;
- unexpected event types cannot be inserted into the learning archive;
- duplicate experiment IDs cannot overwrite terminal history;
- failed/rolled-back hypothesis history is directly queryable for Phase 3 retry suppression;
- snapshot/restore validates checksum, chain and head identity;
- unfinished experiments block starting a different experiment;
- corrupt archive blocks new experiment start.

Production mutation authority added: **NO**.

Decision: **PHASE_7_CI_PROVEN / REVIEW_PENDING**.


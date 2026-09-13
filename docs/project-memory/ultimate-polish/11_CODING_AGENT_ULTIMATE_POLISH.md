# Seven AI — Capability 11 Coding Agent Ultimate Polish

Status: **FREEZE CANDIDATE AFTER DOUBLE-POLISH RECONCILIATION**
Implementation status: **Deferred / strong partial foundations exist**
Final target: **Seven Coding Agent 3.0 — Transactional Evidence-Gated Software Engineering Loop**

## Executive decision

Seven's Coding Agent must not be a chat model with a shell and file-write tool.

> **Prime law:** The model may investigate, propose and iterate, but a software change becomes accepted only through an isolated, version-bound change transaction whose requirements, diff, tests, review constraints and evidence all survive independent verification.

The final system is a **Trustworthy Change Pipeline** built on capabilities 01–10 rather than a parallel coding runtime.

---

# 1. Ground truth

Current Seven already contains valuable coding foundations:

- the Coding workspace exposes a real project map and clearly states that direct device writes/shell commands remain disabled until the platform bridge is authoritative;
- `codingMap()` fingerprints project files and rejects unsafe path forms;
- `evolution/coding-candidate.cjs` uses isolated candidate workspaces, stable baseline SHAs, explicit allowed paths, reproduce/repair/review/regression stages and restoration if stable state changes;
- changed paths are checked against the experiment scope before candidate acceptance;
- execution/runtime foundations already expose Stop/Retry/verification and effect tracking concepts;
- the implementation matrix correctly marks the real platform file/shell bridge as partial.

This means the architecture should **converge and strengthen existing pieces**, not invent a second coding agent.

---

# 2. 2025–2026 research synthesis

## SWE-bench ecosystem
Real repository tasks require reproducible environments and regression-aware execution. SWE-bench Verified remains a useful task-level signal, but benchmark success is not identical to production acceptance.

## SWE-Gate, 2026
Recent results show that functional tests alone can overestimate acceptance: patches may pass functional tests while violating review-derived constraints.

Seven implication: acceptance must evaluate the full task/change contract, not just test green/red.

## Agentic Rubrics, 2026
Context-grounded repository-specific verification can provide useful granular signals beyond raw execution and can flag concerns tests miss.

Seven implication: derive explicit verification criteria from authoritative requirements and repository context, but treat model-produced rubrics as derived proposals that must remain source-bound.

## OpenAI Codex operational guidance, 2026
Practical coding agents pair bounded execution environments, approval policy, constrained network/file access and agent-native telemetry. Codex also surfaces terminal/test evidence for user review.

Seven implication: execution capability is separate from acceptance authority, and evidence must remain inspectable.

## Anthropic coding-agent/eval guidance, 2025–2026
Sandboxing reduces permission friction while preserving boundaries. Agent eval guidance emphasizes deterministic outcome checks where available, plus transcript/process review when task completion cannot be captured by one test signal.

Seven implication: deterministic verification is primary; model/judge review supplements rather than replaces executable evidence.

---

# 3. Ownership boundary

Coding Agent owns:
- software-task decomposition;
- repository investigation strategy;
- change planning;
- reproduction strategy;
- patch proposal;
- targeted test selection;
- repair-loop orchestration;
- code-review preparation;
- change evidence assembly;
- candidate promotion request.

Coding Agent does **not** own:
- raw file authority — Capability 10;
- permission authority — Capability 08;
- real-world effect certainty — Capability 09;
- general tool execution contracts — Capability 07;
- final independent success verdict — Capability 12;
- model routing budgets — Capabilities 05/06;
- canonical run lifecycle — Capability 01.

---

# 4. Pass A — MAXIMIZE

## 4.1 ChangeContract

Every coding task becomes a typed `ChangeContract` derived from the authoritative user/task request.

Fields:
- task/run id;
- baseline project identity/version;
- goal;
- explicit requirements;
- explicit non-goals;
- allowed project roots/paths;
- protected paths;
- expected artifact/change type;
- required behavior/examples;
- compatibility constraints;
- review constraints;
- verification obligations;
- risk class;
- budgets;
- acceptance authority ref.

The contract is frozen enough to detect scope drift but may be versioned when the user intentionally changes the request.

## 4.2 RequirementLedger

Requirements are separated from implementation ideas.

Canonical requirement entries can be:
- MUST
- MUST_NOT
- SHOULD
- ACCEPTANCE_CHECK
- UNKNOWN / NEEDS_DISCOVERY

Each entry carries source lineage.

A model-generated interpretation is derived and cannot silently rewrite the original requirement.

## 4.3 BaselineProof

Before mutation, establish the baseline:
- project/root identity;
- baseline revision/manifest hash;
- relevant file version tokens;
- environment/toolchain profile;
- existing test/build state relevant to the task;
- reproduction evidence for bug-fix tasks when practical;
- known pre-existing failures.

Seven must not attribute an existing failure to its own patch merely because it appears after editing.

## 4.4 Reproduce-before-repair policy

For defects where a reproducible behavior is available and affordable:

`Inspect -> Reproduce -> Localize -> Change -> Verify reproduction resolved`.

If reliable reproduction is impossible, record `REPRODUCTION_UNAVAILABLE` with evidence and use an alternate verification plan. Do not fake a reproduction.

## 4.5 Repository investigation

Use hierarchical, task-driven inspection:

1. project manifest/instructions;
2. exact files/symbols named by the task;
3. lexical/symbol/reference search;
4. dependency/import neighborhood;
5. tests/config/build files;
6. optional semantic/code-structure retrieval;
7. broader scan only when evidence requires it.

Do not load the whole repository into context.

## 4.6 Project instruction files

Repository guidance such as project docs or agent instruction files is treated as project-scoped context with provenance.

Instruction precedence is explicit. Repository content cannot override system/security/permission rules.

## 4.7 ChangePlan

Before non-trivial mutation create a compact plan:
- files/symbols expected to change;
- why each change is needed;
- dependency/order constraints;
- tests/checks expected;
- rollback/checkpoint strategy;
- uncertainty/open questions.

The plan is progressive. Seven is not forced to precompute a giant DAG before learning from the repository.

## 4.8 CandidateWorkspace

All mutable coding work happens in an isolated candidate workspace/change transaction.

Properties:
- immutable baseline reference;
- candidate id;
- ProjectTransaction ref;
- allowed-path scope;
- environment profile;
- sandbox/execution profile;
- no stable-branch mutation during investigation/repair;
- discardable without damaging the baseline.

The current `coding-candidate.cjs` isolation pattern becomes a first-class canonical contract rather than a specialist-only convention.

## 4.9 PatchTransaction

Coding changes compile into Capability 10 `ProjectTransaction` / `PatchSpec` primitives.

Each patch binds:
- FileVersionToken/base hash;
- exact changed ranges or structural target where relevant;
- resulting candidate hash;
- reason/requirement refs;
- generated vs user-authored distinction when relevant.

No direct bypass around File Fabric.

## 4.10 Structural editing specialists

Text patching is the baseline.

AST/tree-sitter/structural edit tools are selectively invoked when they materially improve correctness for:
- repetitive symbol changes;
- imports/references;
- syntax-aware refactors;
- language-aware navigation.

They are lazy specialists, not APK-startup dependencies.

## 4.11 Toolchain/environment contract

A `DevEnvironmentProfile` records:
- runtime/language versions;
- package manager/build system;
- repository-defined commands;
- test framework;
- available sandbox/host capabilities;
- network policy;
- environment variables by opaque reference, not secret value;
- platform limitations.

An environment mismatch is explicit evidence, not hidden noise.

## 4.12 Command execution

Commands run only through a qualified Tool Fabric binding under Tool Security Kernel authority.

The Coding Agent does not own a universal unrestricted shell.

Execution records:
- exact command/tool contract;
- working project/candidate id;
- environment profile;
- exit/result state;
- stdout/stderr artifact refs;
- duration/resource use;
- cancellation state.

## 4.13 Verification ladder

Use the cheapest checks that can falsify the candidate, then escalate as needed.

Typical ladder:
1. syntax/parse/format check when relevant;
2. static/type/lint checks selected by project convention;
3. focused reproduction/unit tests;
4. affected-neighborhood tests;
5. build/package checks;
6. broader regression suite when risk/change scope warrants;
7. requirement/review-constraint evaluation;
8. optional security/performance/UI specialists when task-relevant.

Not every task must run every layer.

## 4.14 Test selection

Test selection uses changed paths/symbols plus dependency/project knowledge.

A `TestSelectionRecord` stores:
- selected checks;
- selection rationale codes;
- coverage relation to requirements/changed components;
- omitted broader checks and why;
- escalation triggers.

A learned selector may assist, but a deterministic dependency/path heuristic remains the baseline.

## 4.15 Test integrity

Tests are evidence, not permission to game the benchmark.

Seven distinguishes:
- product/source changes;
- legitimate test additions/updates required by the task;
- test-environment changes;
- generated fixtures;
- suspicious acceptance weakening.

Changes that weaken or remove relevant acceptance checks require explicit review/authority and cannot silently manufacture PASS.

## 4.16 ReviewConstraintSet

Functional correctness is not sufficient.

`ReviewConstraintSet` can include:
- explicit user requirements;
- repository conventions;
- API/backward-compatibility requirements;
- architectural boundaries;
- accessibility/performance constraints when relevant;
- prohibited scope changes;
- migration/documentation obligations.

Each constraint has lineage and a verification method/status.

## 4.17 Diff semantic review

Before acceptance, inspect the candidate diff as a change object:
- changed paths;
- unexpected files;
- requirements addressed;
- public/API behavior changes;
- dependency/config changes;
- generated artifacts;
- deletion/rename effects;
- comments/docs/tests consistency;
- unnecessary complexity.

This is not purely model review: deterministic diff/scope metadata is authoritative, with semantic review layered on top.

## 4.18 Minimality as a preference, not a law

Prefer the smallest coherent change that fully satisfies the ChangeContract.

Do not force minimal diffs when a broader refactor is genuinely required. Conversely, do not perform opportunistic cleanup unrelated to the task.

## 4.19 Auto Repair Loop 3.0

Canonical loop:

`Inspect -> Baseline/Reproduce -> Plan -> Stage -> Cheap Checks -> Focused Tests -> Diagnose -> Repair -> Recheck -> Review Constraints -> Regression -> Verify`

Loop controls:
- max attempts from Adaptive Compute;
- no-progress detection;
- repeated-diff detection;
- error-cluster detection;
- scope-expansion gate;
- budget reservation for final verification;
- stop on environment blocker rather than inventing progress.

## 4.20 Repair memory

Within a run, Seven may keep derived `RepairObservation` records:
- failure signature;
- attempted change;
- evidence;
- result;
- next hypothesis.

They help avoid repeating failed edits but do not become durable canonical lessons until Memory Fabric admission/verification rules allow it.

## 4.21 Multi-candidate work

Multiple candidates/agents are selective, not default.

Use them only when Adaptive Compute predicts value for:
- ambiguous root cause;
- architecture alternatives;
- difficult repair after repeated no-progress;
- high-value review diversity.

Candidates remain isolated and must pass the same verification contract. Majority vote is not truth.

## 4.22 Subagents

Subagents receive:
- a narrow subtask;
- explicit Context Capsule;
- Capability 08 sublease;
- file scope;
- compute budget;
- return schema.

They may propose findings/patches but cannot promote changes independently.

## 4.23 Cancellation / Continue / Retry

Stop is a real control signal.

Cancellation:
- stops new planning/work;
- propagates to compatible command/tool activity;
- preserves candidate workspace and evidence where safe;
- records uncertain external effects through Capability 09;
- never reports clean cancellation if underlying state is uncertain.

Continue resumes from an explicit checkpoint/candidate state.

Retry creates a new attempt with lineage rather than erasing the previous failure.

## 4.24 EvidenceBundle

A coding run produces a compact `ChangeEvidenceBundle`:
- ChangeContract version;
- baseline identity;
- candidate identity;
- changed files/diff refs;
- requirement coverage matrix;
- reproduction result;
- test/check records;
- review-constraint results;
- build/package results;
- command-log artifact refs;
- unresolved warnings;
- environment limitations;
- resource/performance notes where relevant;
- provenance hashes.

This bundle is the handoff to Capability 12 Verification/Judge.

## 4.25 Promotion is separate from generation

Candidate creation does not change stable/canonical project state.

Promotion requires:
- candidate still based on expected baseline or an explicit rebase/reconciliation;
- authorization still valid;
- required verification result;
- no unresolved critical effect/file conflict;
- requested acceptance policy satisfied.

Promotion itself is a File/Project transaction and SideEffectLedger event where appropriate.

## 4.26 Human review surface

The UI should make review efficient rather than force raw log reading.

Primary surfaces:
- task/requirements card;
- changed-file/diff view;
- test/check matrix;
- warnings/blockers;
- evidence links;
- environment/sandbox badge;
- Stop/Continue/Retry;
- candidate vs baseline identity;
- promotion/acceptance action when authorized.

Raw terminal output remains available as collapsible evidence, not the main UX.

## 4.27 Mobile/host split

Seven's Android app stays thin.

On-device suitable work:
- project browse/search;
- lightweight patches;
- syntax/text checks;
- diff/review;
- context assembly;
- small deterministic tooling.

Heavy builds, full test suites, language servers, large repositories and strong sandboxes may run through a qualified host/cloud/local companion when available.

The canonical contracts remain the same across environments.

---

# 5. Velocity assault

- repository inspection is progressive, not full-scan-first;
- reuse valid project-map and symbol indexes by FileVersionToken;
- preserve prompt/model cache locality through stable context segments;
- patch rather than resend whole files;
- run cheap falsifiers before expensive full regression;
- parallelize independent checks only when resource budget allows;
- stream command/test events without flooding the chat context;
- artifactize long logs;
- stop irrelevant work immediately after decisive failure;
- keep final verification reserve protected;
- heavy analyzers/language servers lazy-load;
- no coding-agent startup work when Coding workspace is unused.

Lite tier uses smaller indexes, fewer optional analyzers and lower concurrency, but preserves baseline/change/conflict/verification truth.

---

# 6. Pass B — DESTROY THE WINNER

Rejected alternatives:

## "Model + shell + edit tool" as the architecture
Rejected. Execution access is not trustworthy change management.

## Full repository injected into context
Rejected. Wasteful, slow and prone to context dilution.

## Always write first, then test
Rejected. Baseline/reproduction often provides decisive information before mutation.

## Passing tests = PASS
Rejected. Requirements, review constraints, scope and regressions also matter.

## Semantic judge replaces tests
Rejected. Executable deterministic evidence remains primary where available.

## Run the full test suite after every tiny patch
Rejected. Use targeted escalation and final risk-based regression.

## Agent edits stable branch directly
Rejected. Candidate workspace + promotion boundary is safer and more recoverable.

## Automatic broad scope expansion when stuck
Rejected. Scope changes need explicit plan/authority handling.

## Permanent multi-agent swarm
Rejected for latency/cost/context complexity. Use selectively.

## Coding-specific file implementation
Rejected. All mutations go through Capability 10.

## Generic unrestricted terminal on mobile
Rejected. Execution uses qualified environment/tool bindings.

---

# 7. Reconciliation result

The final architecture is:

`ChangeContract -> BaselineProof -> progressive investigation -> CandidateWorkspace -> PatchTransaction -> verification ladder -> ReviewConstraintSet -> ChangeEvidenceBundle -> independent Judge -> promotion`.

Existing Seven candidate-isolation and repair/regression foundations are preserved and promoted into canonical contracts.

---

# 8. Canonical objects

- `ChangeContract`
- `RequirementLedger`
- `BaselineProof`
- `DevEnvironmentProfile`
- `ChangePlan`
- `CandidateWorkspace`
- `PatchTransactionRef`
- `TestSelectionRecord`
- `CheckResult`
- `ReviewConstraintSet`
- `RequirementCoverageMatrix`
- `RepairObservation`
- `CodeDiffArtifact`
- `CommandEvidenceArtifact`
- `ChangeEvidenceBundle`
- `PromotionRequest`

---

# 9. Frozen invariants

1. Coding Agent does not bypass File Fabric or Security Kernel.
2. A stable project baseline is not mutated during candidate investigation/repair.
3. Candidate identity and baseline identity remain explicit.
4. Requirements are source-bound and versioned.
5. A model interpretation cannot silently rewrite the task.
6. Bug fixes reproduce first when practical; unavailable reproduction is explicit.
7. Repository context is retrieved progressively.
8. Stale file bases cause conflict/rebase, not overwrite.
9. Passing tests alone never guarantees final PASS.
10. Model review alone never replaces deterministic checks where those exist.
11. Test modifications cannot silently weaken acceptance criteria.
12. Auto-repair is bounded and detects no-progress.
13. Child agents have narrow subleases and cannot promote changes.
14. Long logs are artifacts, not permanent prompt payload.
15. Cancellation is real and preserves uncertainty/evidence.
16. Candidate promotion is a separate verified/authorized operation.
17. The agent never fabricates command, build or test success.
18. Heavy coding infrastructure is lazy/host-capable and does not bloat mobile startup.

---

# 10. Evaluation contract

## Task classes
- small localized edit;
- repository bug repair;
- multi-file feature;
- refactor;
- migration/config change;
- test addition;
- UI change;
- build failure;
- documentation/API synchronization;
- incomplete/ambiguous task.

## Correctness
- reproduction resolves;
- focused tests pass;
- regression does not introduce new failure;
- requirement coverage complete;
- review constraints satisfied;
- changed-path scope respected;
- baseline/candidate identity intact.

## Robustness
- pre-existing failing tests;
- stale file during edit;
- environment mismatch;
- missing dependency/tool;
- cancelled command;
- test timeout;
- partial project transaction;
- repeated repair with no progress;
- conflicting repository instructions;
- large log/output.

## Agent discipline
- avoids unnecessary unrelated edits;
- does not weaken acceptance tests silently;
- uses targeted inspection before broad scan;
- does not claim command/test execution without evidence;
- stops/blocks when platform execution is unavailable.

## Benchmarks
- SWE-bench-style real issue repair;
- multilingual repositories/tasks;
- UI/multimodal cases where relevant;
- Seven-owned regression corpus;
- review-constraint acceptance cases inspired by SWE-Gate;
- long-horizon project tasks beyond patch-only benchmarks.

## Mobile/performance
- Coding workspace cold load;
- project map 100/10k/100k files;
- context tokens per task;
- time to first useful investigation result;
- patch/test iteration latency;
- cancellation latency;
- RAM/battery impact on Lite/Balanced/Full;
- no Coding use -> near-zero startup cost.

---

# 11. Implementation stages

- **CA-P0** ChangeContract / RequirementLedger / BaselineProof.
- **CA-P1** CandidateWorkspace integration with Project File Fabric.
- **CA-P2** progressive repository investigator and instruction/context resolver.
- **CA-P3** patch transaction + structural specialist adapters.
- **CA-P4** DevEnvironmentProfile + qualified command runner.
- **CA-P5** verification ladder + TestSelectionRecord.
- **CA-P6** bounded Auto Repair Loop 3.0.
- **CA-P7** ReviewConstraintSet + semantic diff review.
- **CA-P8** ChangeEvidenceBundle + Capability 12 handoff.
- **CA-P9** promotion/rebase/cancellation/recovery.
- **CA-P10** mobile/host split and workspace UX.
- **CA-P11** SWE-style, review-constraint, failure-injection, long-run and phone-performance gates.

---

# 12. Proof of improvement

Compared with Seven's current partial coding stack, Coding Agent 3.0:
- turns existing isolation/repair/regression pieces into one authoritative change pipeline;
- separates requirements, baseline, candidate and acceptance authority;
- adds reproducibility and pre-existing-failure awareness;
- prevents stale/direct stable edits through File Fabric transactions;
- replaces test-only acceptance with requirement + review-constraint + regression evidence;
- makes command/test success artifact-backed;
- bounds auto-repair and multi-agent escalation;
- keeps heavy tooling off the mobile hot path;
- creates a clean evidence contract for an independent Judge rather than self-certifying.

---

# 13. Research references

- SWE-bench official benchmark and Verified evaluation harness, current 2026.
- He et al., **SWE-Gate: Passing Functional Tests Is Not Enough for Software Engineering Agents**, 2026.
- Raghavendra et al., **Agentic Rubrics as Contextual Verifiers for SWE Agents**, 2026.
- OpenAI, **Running Codex safely at OpenAI**, 2026.
- OpenAI, **Introducing Codex**, evidence through terminal logs/test outputs.
- OpenAI, **Building a safe, effective sandbox to enable Codex on Windows**, 2026.
- Anthropic, **Beyond permission prompts: making Claude Code more secure and autonomous**, 2025.
- Anthropic, **Demystifying evals for AI agents**, 2025/2026 publication line.
- Anthropic, **Agentic coding and persistent returns to expertise**, 2026.

---

# 14. Freeze recommendation

**FREEZE CANDIDATE ACCEPTED.**

Final target: **Seven Coding Agent 3.0 — Transactional Evidence-Gated Software Engineering Loop**.

Implementation remains deferred until campaign reconciliation. No protected product source is modified by this architecture document.

# Seven Coding System — Implementation Plan

Date: 2026-10-05
Execution strategy: small verifiable batches. No phase is promoted merely because code exists.

## Phase 0 — Research and repository audit

Status: COMPLETE for baseline.

Acceptance:
- master coordination docs read;
- current Tool Fabric inspected;
- legacy coding/self-dev/evolution code inspected;
- current external agent architectures researched;
- architecture decisions recorded.

## Phase 1 — Coding Kernel / Workspace Truth

Status: IN PROGRESS, Batch 1 implementation created.

Deliverables:
- lifecycle state machine;
- RepositorySnapshot exact SHA + fingerprints;
- safe path rules;
- PatchPlan exact-source preconditions;
- transactional candidate + rollback;
- deterministic verification selector;
- unit/adversarial tests.

Promotion gates:
- TypeScript strict compile;
- coding unit tests;
- existing Remake tests;
- Remake typecheck/build;
- no integration contract change.

## Phase 2 — Repository Intelligence

Deliverables:
- inventory adapter;
- language/package/build detection;
- symbol index using parsers/tree-sitter where practical;
- import/export/reference graph;
- test ownership map;
- instruction discovery;
- relevance-ranked repo map with token budget;
- incremental invalidation after edits.

Critical evals:
- large repo localization;
- renamed/moved files;
- ambiguous symbols;
- generated/vendor exclusion;
- repo-map staleness.

## Phase 3 — Files/Worktree Adapter

Deliverables:
- isolated worktree per run;
- exact base-SHA checkout;
- scoped read/list/search/write operations through Tool Fabric;
- candidate application followed by actual-fingerprint verification;
- checkpoint/rollback;
- concurrent edit detection.

Critical evals:
- user edit during plan;
- user edit during apply;
- symlink/path traversal;
- stale SHA;
- rollback after partial platform failure.

## Phase 4 — Sandbox Command Runtime

Deliverables:
- command tool registered in Tool Fabric;
- read-only / workspace-write execution modes;
- network deny by default and explicit expansion;
- timeout/cancel/resource bounds;
- output truncation with retained evidence digest;
- secret redaction;
- command policy for destructive/external operations.

Critical evals:
- escape attempts;
- dangerous shell syntax;
- package install/network escalation;
- cancellation during child process;
- uncertain effect after crash.

## Phase 5 — Repository Planner

Deliverables:
- normalize task + acceptance criteria;
- inspect/research budget;
- structured plan schema;
- base snapshot binding;
- expected file hashes;
- impact/risk estimate;
- plan review for complex/high-risk work.

Critical evals:
- underspecified task -> BLOCKED/clarification evidence;
- plan refers to non-existent symbol;
- plan becomes stale;
- excessive blast radius.

## Phase 6 — Verification Engine

Deliverables:
- deterministic rule registry;
- touched-file tests;
- test ownership/dependency escalation;
- lint/type/build gates;
- actual command-result evidence;
- flaky-test classification and controlled reruns;
- Android/release escalation.

Critical evals:
- model attempts to omit tests;
- only targeted tests green but regression broken;
- changed build config;
- test command exits zero without expected artifact.

## Phase 7 — Debug / Repair Loop

Deliverables:
- failure classifier;
- minimal failure context extraction;
- re-inspection before each repair;
- bounded repair attempts;
- repeated-failure detection;
- rollback or BLOCKED terminal state.

Critical evals:
- same patch repeated;
- failure changes after repair;
- external dependency failure;
- non-deterministic/flaky failure.

## Phase 8 — Diff Verification + Independent Review

Deliverables:
- canonical git diff parser;
- intended-path comparison;
- contract/evaluator/test weakening detectors;
- reviewer agent with read-only authority;
- severity-ranked findings;
- repair loop on reviewer rejection.

Critical evals:
- hidden unrelated change;
- deleted assertion;
- disabled security gate;
- added credential;
- reviewer attempts mutation.

## Phase 9 — Git Completion + Documentation

Deliverables:
- atomic commit from exact candidate;
- remote head freshness check;
- branch/PR support;
- generated documentation/update notes;
- final CodingEvidenceBundle;
- clean workspace assertion.

Critical evals:
- remote branch moved;
- commit contains unverified file;
- dirty workspace after completion;
- documentation contradicts evidence.

## Phase 10 — Product Integration

Deliverables:
- Coding mode/workspace UI;
- progress stages and evidence viewer;
- approval prompts only where policy requires;
- stop/cancel/recover;
- model routing by coding subtask;
- mobile-safe presentation.

## Phase 11 — Evaluation Campaign

Suites:
- Seven repository bug-fix corpus;
- multi-file feature corpus;
- SWE-bench style issue corpus;
- concurrent-edit/SWE-Touch-inspired corpus;
- adversarial safety corpus;
- long-horizon tasks;
- Android/product reality tasks.

Required zero-tolerance failures:
- overwrite an unacknowledged concurrent user edit;
- mutate forbidden path;
- mutate critical evaluator/contract without external authority;
- mark COMPLETE after mandatory gate failure;
- claim a command/test was run without execution evidence;
- leave a partial transaction without rollback/effect-unknown evidence.

## Phase 12 — Self-Development handoff

Only after Coding is production-verified may Self-Development use it for autonomous Seven changes. Self-Development receives no bypass around Coding or Tool contracts.

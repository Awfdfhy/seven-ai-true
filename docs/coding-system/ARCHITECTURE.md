# Seven Coding System Architecture V1

Date: 2026-10-05
Target product base: `seven-remake-v3`
Integration contract: unchanged; Coding consumes Files + Tools and supplies repository inspection, planning, targeted edits, test/build invocation, diagnosis, verification reports, and Git-aware change tracking.

## 1. Layered architecture

### A. Coding Orchestrator

Owns the explicit lifecycle and stop conditions:

`UNDERSTAND -> INSPECT -> RESEARCH -> PLAN -> EDIT -> TEST -> DEBUG -> VERIFY -> REVIEW -> DOCUMENT`

It does not directly read arbitrary files, execute shell commands, or grant permissions. Those actions go through Tools/adapters.

### B. Workspace Truth Service

Creates `RepositorySnapshot`:
- repository identity;
- branch/ref;
- exact 40-character Git head SHA;
- normalized repository-relative paths;
- SHA-256 per-file fingerprints;
- deterministic whole-snapshot fingerprint;
- capture timestamp.

A plan is valid only for the snapshot it was created from.

### C. Repository Intelligence

Planned components:
- filesystem inventory;
- language detection;
- symbol extraction;
- import/export graph;
- references/call relationships;
- test ownership map;
- build/package graph;
- repository instruction discovery (`AGENTS.md`, project rules, package scripts);
- token-budgeted relevance ranking.

The repo map is a locator. Before editing, exact source is read again from Workspace Truth.

### D. Research Bridge

Uses Seven Research/Web tools for facts that cannot be safely inferred from the repository: library/API changes, official docs, compatibility behavior, CVEs, framework migrations. Web evidence is tagged as untrusted data and cannot directly authorize commands or edits.

### E. Planner

Produces a structured `PatchPlan` bound to:
- task ID;
- exact base SHA;
- exact snapshot fingerprint;
- expected source hashes;
- explicit files and operations;
- acceptance criteria;
- predicted blast radius;
- required verification class.

Plan generation is read-only.

### F. Patch Transaction Engine

Validates all operations before yielding a candidate:
- safe canonical paths;
- no duplicate targets;
- critical path authorization outside the model;
- exact source hashes;
- unambiguous exact-edit anchors;
- file and byte budgets;
- all-or-nothing candidate construction;
- rollback snapshot created from the source state.

The initial implementation is pure/in-memory. The next adapter applies the validated candidate to a sandbox/worktree, then immediately verifies the actual filesystem state against the candidate fingerprint.

### G. Sandbox / Command Runtime

Will consume Seven Tool Fabric rather than bypass it.

Required properties:
- workspace-root confinement;
- network deny by default, allowlist/escalation when needed;
- command risk policy;
- bounded execution time and output;
- cancellation propagation;
- secret redaction;
- no shell authority in Plan/Research mode;
- explicit effect boundary and `effect_unknown` semantics;
- one isolated worktree/workspace per coding run.

### H. Deterministic Verification Policy

`TestSelector` maps changed paths and dependency blast radius to required commands. The model may propose supplemental tests but cannot delete mandatory gates.

Verification tiers:
1. syntax/type/lint for touched languages;
2. focused owned tests;
3. dependency-neighbor tests;
4. full subsystem regression;
5. product build;
6. Android/release/reality gates when the change reaches those surfaces.

### I. Debug / Repair Controller

Consumes structured failures, classifies them, re-inspects relevant files, and creates a new plan bound to the current workspace fingerprint. Repair loops are bounded by attempts, changed-file budget, elapsed execution budget and repeated-failure fingerprint.

No blind retry after uncertain external effects.

### J. Verify + Diff Review

Verification is distinct from tests.

Required checks include:
- actual workspace fingerprint matches intended candidate;
- all mandatory commands have terminal success evidence;
- diff contains only intended paths;
- no protected/critical file changed without authority;
- no test/evaluator weakening hidden in the diff;
- no generated/binary drift unless explicitly intended;
- integration contracts preserved;
- acceptance criteria mapped to evidence.

### K. Independent Reviewer

Read-only reviewer with separate context receives task intent, plan, actual diff, test evidence and relevant source. It can PASS, request repair, or BLOCK. It cannot mutate files or relax mandatory verification.

### L. Git Adapter

Responsibilities:
- worktree/branch creation from exact base SHA;
- status/diff reads;
- atomic candidate commit;
- commit SHA capture;
- PR creation/update when requested;
- stale remote-head detection;
- never force-push by default.

### M. Evidence Ledger

Every run produces a `CodingEvidenceBundle` containing:
- run/task IDs;
- base SHA + final candidate/commit SHA;
- snapshot and candidate fingerprints;
- files inspected and changed;
- plan identity;
- tool invocations relevant to mutation;
- commands/tests and exit status;
- failure/repair history;
- diff digest;
- reviewer verdict;
- documentation updates;
- rollback/checkpoint identity;
- terminal state `PASS | FAIL | BLOCKED | INCONCLUSIVE`.

## 2. Trust boundaries

### Model may
- reason about task intent;
- choose what to inspect from allowed read tools;
- request research;
- propose plans/patches;
- propose supplemental tests;
- diagnose failures;
- write documentation content.

### Model may not
- grant itself capabilities;
- change critical path authority;
- suppress mandatory tests;
- claim shell/file success without tool evidence;
- treat stale workspace state as current;
- mark itself COMPLETE without verifier/reviewer gates;
- modify evaluation locks or integration contracts silently.

## 3. State and concurrency model

A coding run is bound to one `baseSha` and one evolving candidate workspace. Any external edit creates drift. Drift invalidates plans touching affected files and forces re-inspection. Silent last-write-wins behavior is prohibited.

Long tasks should use isolated worktrees or remote sandboxes. Parallel sub-agents receive read-only snapshots unless explicitly assigned disjoint writable scopes. Merging parallel edits is a separate transaction and must re-run verification.

## 4. Integration with existing Seven subsystems

### Tools
Coding uses the existing ToolRegistry, grants, ReferenceMonitor, executor, replay/effect ledger and TaskManager. New coding tools must be ordinary registered tools with scoped capabilities.

### Files
File operations must route through a Files/workspace adapter with path normalization and snapshot fingerprint verification. The Coding Runtime never invents filesystem authority.

### Research
Research results are evidence with provenance, never instructions that can override coding policy.

### Memory
Long-term memory may retain stable project conventions and previous decisions, but repository files and current Git state remain authoritative for code truth.

### Self-Development
Self-Development consumes Coding only after Coding has passed product gates. It must use the same snapshot, transaction, verification and evidence contracts rather than a privileged shortcut.

## 5. Initial implementation boundary (Batch 1)

Implemented now:
- lifecycle state machine;
- exact-SHA `RepositorySnapshot`;
- SHA-256 file/snapshot fingerprints;
- safe path normalization;
- stale-head / stale-snapshot / stale-file rejection;
- transactional in-memory patch candidate;
- exact unique patch anchors;
- critical-path external authority gate;
- blast-radius budgets;
- rollback snapshot;
- deterministic Seven verification-plan selection.

Not yet claimed complete:
- real repository indexing;
- real file/worktree adapter;
- real shell sandbox adapter;
- dependency graph;
- Git diff parser;
- test execution records;
- debug-loop classifier;
- independent reviewer runtime;
- final evidence bundle;
- product/UI wiring;
- Android/reality validation.

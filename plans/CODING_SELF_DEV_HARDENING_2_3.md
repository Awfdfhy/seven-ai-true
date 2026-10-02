# Seven AI 2.3 — Coding + Self-Development Hardening

Date: 2026-10-02
Status: ACTIVE
Parent: ../SEVEN_POLISH_ROADMAP.md

## Objective

Make every repository mutation inspectable, stale-safe, atomic at the transaction boundary, testable, resumable, and recoverable.

Target pipeline:

Understand → Snapshot → Plan → Diff → Validate → Apply Transaction → Verify → Review → Commit/PR → CI exact SHA → Merge

No model output, retrieved text, web page, or stale workspace may directly become repository authority.

## Phase A — Mutation Transaction Foundation (FIRST)

### A1. Canonical file snapshot
Each target carries:
- path
- base SHA/fingerprint
- base content fingerprint
- expected repository/branch
- capturedAt

### A2. Stale-target detection
Before mutation:
- re-read current target metadata/content;
- compare expected SHA/fingerprint;
- if any target changed, fail the entire transaction as STALE;
- never silently rebase an AI-generated patch onto changed content.

### A3. Atomic multi-file transaction
A transaction contains all intended file operations:
- update
- create
- delete

Validation happens for every operation before any remote write is authorized.

If the backing Git provider supports atomic tree/commit creation, use one tree + one commit.
If only per-file mutation exists, the runtime must not claim atomicity; it must use a staging branch/transaction strategy and fail closed.

### A4. Rollback
Record:
- pre-transaction head SHA
- created mutation SHA
- changed paths
- verification state

Rollback means restoring repository state through a new explicit commit/ref operation, never deleting audit history.

### A5. Protected paths
Fail closed for:
- credentials/secrets
- signing material
- CI security controls
- protected release files
unless an explicit higher-trust user action authorizes that exact path/action.

No secret value may enter plans, diffs, logs, checkpoints, or model context.

## Phase B — Patch/Diff correctness

- exact hunk/context validation
- duplicate-path rejection
- path traversal rejection
- binary/unsupported-file truth
- line-ending preservation where practical
- deterministic diff preview
- stale patch rejection
- max file/transaction budgets

## Phase C — Verification gate

Before commit:
- syntax/static checks where available
- project tests
- generated artifact checks
- changed-file policy

States:
- PASS
- FAIL
- BLOCKED
- NEEDS_REVIEW

No commit/merge claim without exact evidence.

## Phase D — GitHub exact-SHA workflow

- branch head captured before work
- commit created from verified base
- CI bound to exact resulting SHA
- stale branch recheck before merge
- merge only exact tested SHA
- no duplicate commit on resume

## Phase E — Checkpoint + resume

Persist operational metadata only:
- transaction ID
- repo/branch
- base SHA
- operation fingerprints
- stage
- test/CI refs
- resulting SHA

Never persist:
- GitHub tokens
- API keys
- hidden reasoning
- arbitrary secret-bearing file bodies

## Phase F — Mobile review

On phone:
- changed-file summary first
- expandable unified diff
- risk badges
- stale/conflict state
- test/CI state
- Apply / Rollback / Open PR actions with clear consequences

## First implementation slice

1. add deterministic Coding Transaction v1 runtime;
2. safe relative-path validation;
3. content fingerprints;
4. immutable base snapshot;
5. duplicate-path and protected-path checks;
6. preflight stale detection;
7. all-or-nothing transaction planning;
8. rollback descriptor;
9. safe diagnostics;
10. regression tests.

This first slice is local/deterministic and adds no new network mutation path. It becomes the gate that existing/future GitHub actions must pass through.

## Acceptance criteria — Slice 1

- changed base content rejects transaction as STALE;
- one stale file rejects the whole multi-file transaction;
- duplicate/unsafe paths reject the transaction;
- protected paths reject by default;
- valid create/update/delete operations produce deterministic transaction metadata;
- rollback descriptor points to the pre-transaction state;
- no secret-like content is exposed in diagnostics;
- no repository write occurs during preflight;
- browser CI passes;
- Android API 36 gate passes after merge.

## Later release acceptance

2.3 is complete only when:
- the normal Coding/Self-Development path uses the transaction gate;
- repository writes are exact-SHA/stale-safe;
- multi-file mutation has an explicit atomicity strategy;
- tests are tied to exact SHA;
- resume cannot duplicate commits;
- rollback is explicit and auditable;
- mobile diff review is usable;
- browser and Android release gates pass.

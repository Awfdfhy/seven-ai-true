# Seven AI — Capability 11 Coding Agent Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**
Implementation status: **Deferred / strong partial foundations remain**

## Frozen target

**Seven Coding Agent 3.0 — Transactional Evidence-Gated Software Engineering Loop**

## Prime law

> The model may investigate, propose and iterate, but a software change becomes accepted only through an isolated, version-bound change transaction whose requirements, diff, tests, review constraints and evidence all survive independent verification.

## Scope of this freeze

This freezes the Coding Agent architecture. It does not claim that the final host shell/file bridge, every language specialist, every benchmark, or Capability 12 independent Judge is already implemented.

## Final reconciled decisions

1. Coding Agent is built on Capabilities 01–10 rather than duplicating their state, permissions, tools or file primitives.
2. Every task begins from a versioned `ChangeContract` and source-bound `RequirementLedger`.
3. Baseline project identity and relevant environment state are captured before mutation.
4. Bug fixes reproduce the target behavior before repair when practical; unavailable reproduction is explicit.
5. Repository investigation is progressive and task-driven rather than full-repository prompt injection.
6. Project instruction files remain project-scoped context and cannot override system/security authority.
7. Non-trivial edits use a progressive `ChangePlan`.
8. Mutable work happens inside an isolated `CandidateWorkspace` bound to an immutable baseline identity.
9. Candidate work cannot silently mutate stable project state.
10. File mutations compile into Capability 10 ProjectTransaction/PatchSpec primitives.
11. Existing-file text/code changes prefer patch-first editing when practical.
12. Structural code tools are lazy specialists, not baseline mobile dependencies.
13. `DevEnvironmentProfile` makes runtime/toolchain assumptions explicit.
14. Command execution uses qualified Tool Fabric bindings and Tool Security authority rather than an unrestricted universal shell.
15. Command/test output remains evidence with artifact references.
16. Verification uses an escalation ladder from cheap falsifiers to focused tests to broader regression when warranted.
17. Test selection is recorded in `TestSelectionRecord` with deterministic dependency/path heuristics as a baseline.
18. Passing functional tests alone cannot produce final PASS.
19. `ReviewConstraintSet` captures authoritative requirements and repository-level acceptance constraints.
20. Test changes cannot silently weaken relevant acceptance criteria.
21. Diff review combines deterministic scope/change metadata with semantic review.
22. Prefer the smallest coherent change that fully satisfies the task, without forbidding justified broader refactors.
23. Auto Repair Loop is bounded by compute budget, no-progress detection and final verification reserve.
24. Run-local repair observations do not become durable canonical lessons without Memory Fabric admission/verification.
25. Multi-candidate and subagent paths are selective rather than always-on.
26. Subagents receive narrow context, file scope, authority and compute leases and cannot promote changes.
27. Stop/Continue/Retry have real state semantics and preserve evidence/history.
28. Every candidate produces a compact `ChangeEvidenceBundle` for Capability 12.
29. Candidate generation and stable promotion are separate operations.
30. Promotion requires valid baseline/reconciliation, authorization, required verification and no unresolved critical conflicts/effects.
31. Mobile UI emphasizes requirements, diff, checks, warnings and evidence rather than raw terminal output.
32. Long logs are artifactized and remain expandable.
33. Heavy builds/tests/language tooling may execute through qualified host/cloud/local companion environments while the Android app remains thin.
34. No Coding Agent work runs at startup when the coding surface is unused.

## Canonical pipeline

`ChangeContract -> BaselineProof -> progressive investigation -> CandidateWorkspace -> PatchTransaction -> verification ladder -> ReviewConstraintSet -> ChangeEvidenceBundle -> independent Judge -> promotion`

## Canonical objects

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

## Auto Repair Loop 3.0

`Inspect -> Baseline/Reproduce -> Plan -> Stage -> Cheap Checks -> Focused Tests -> Diagnose -> Repair -> Recheck -> Review Constraints -> Regression -> Verify`

## Frozen invariants

1. Coding Agent never bypasses File Fabric or Security Kernel.
2. Baseline and candidate identities remain explicit.
3. Requirements are source-bound and versioned.
4. A model interpretation cannot silently rewrite the task.
5. Stale file bases conflict rather than overwrite.
6. Passing tests alone never guarantees final PASS.
7. Model review does not replace deterministic evidence where available.
8. Acceptance checks cannot be silently weakened to manufacture success.
9. Repair loops are bounded and detect no-progress.
10. Child agents cannot independently promote stable changes.
11. Cancellation is real and evidence-preserving.
12. Candidate promotion is separate from candidate generation.
13. Command/build/test success is never fabricated.
14. Heavy coding infrastructure remains lazy and does not burden mobile startup.

## Mandatory eval families

- localized edits;
- repository bug repair;
- multi-file feature/refactor/migration;
- pre-existing failing tests;
- stale file during edit;
- environment mismatch;
- unavailable dependency/tool;
- cancelled/timeout checks;
- bounded repair/no-progress;
- review-constraint compliance;
- changed-path scope;
- test-integrity checks;
- multilingual repository tasks;
- SWE-style repository repair;
- long-horizon project tasks;
- Lite/Balanced/Full mobile performance.

## Implementation stages

- CA-P0 ChangeContract/requirements/baseline
- CA-P1 CandidateWorkspace + File Fabric
- CA-P2 progressive investigator
- CA-P3 patch/structural edit specialists
- CA-P4 environment + qualified command runner
- CA-P5 verification ladder/test selection
- CA-P6 bounded Auto Repair Loop 3.0
- CA-P7 review constraints/diff review
- CA-P8 evidence bundle/Judge handoff
- CA-P9 promotion/rebase/cancellation/recovery
- CA-P10 mobile/host split and UX
- CA-P11 SWE/review/failure-injection/long-run/mobile gates

## Freeze decision

**FROZEN.**

No protected product source was modified. Architecture freeze is not implementation completion.

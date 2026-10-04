# Seven Coding System v1 — Research Synthesis

Status: PREPARED NEXT CAMPAIGN

Target loop:
Understand → bind exact repo SHA → repo map → localize → inspect source → plan → transactional edit → targeted tests → diff review → regression tests → independent review → commit/PR or rollback.

Evidence:
- Aider repo map: symbol/signature map plus dependency-graph ranking under a token budget.
- OpenAI Codex safety: coding agents need sandbox boundaries, approvals, telemetry and auditability.
- OpenAI Symphony: agent-friendly repositories, continuous orchestration, automated tests and guardrails.
- SWE-bench Verified: reliable repository-level issue evaluation.
- SWE-Bench Pro Verified: anti-leak / anti-reward-hacking benchmark hygiene.
- SWE-Touch: shared-workspace counter-edits expose failures when agents do not re-read changed code.

Seven principles:
1. Exact-SHA workspace identity; stale plans never apply silently.
2. Repo map is localization evidence, not source truth.
3. Blast-radius analysis before mutation.
4. Transactional multi-file edits with rollback.
5. Deterministic mandatory test selection outside the model.
6. Diff review after tests; green tests never excuse forbidden changes.
7. Detect user/other-agent edits and reconcile instead of overwrite.
8. Evidence bundle: base/result SHA, files read/changed, commands, tests, diff digest, reviewer verdict, rollback point.
9. Protect evaluators/tests/security gates from candidate mutation.
10. Bounded repair loops; unresolved failure rolls back rather than commits.

Current Seven truth:
Legacy GitHub self-development and evolution foundations exist, but Remake still lacks one cohesive modern Coding Runtime with repo-map indexing, freshness monitoring, transactional patching, deterministic test selection and exact-SHA evidence.

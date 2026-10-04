# Seven AI — Current Status

Last coordination update: 2026-10-05

## Current Position

The multi-chat development structure is active.

### Completed / current champion baselines
- Chat Core — existing/iterative
- Model Routing — Model Intelligence v3 merged; measured latency v2 exists
- Memory — Memory v2 baseline complete with exact Android/Reality Lab evidence
- Files — existing/iterative
- Web Research — existing/iterative
- Deep Think — existing/iterative
- Tools — Tools v1 implementation merged; final product closure evidence tracked separately

## Primary Dependency

**Coding System v1 remains the gating dependency for production Self-Development.**

Verified repository truth:
- `.seven-team/coding-v1/RESEARCH_SYNTHESIS.md` exists.
- `.seven-team/coding-v1/EXECUTION_PLAN.md` exists.
- `.seven-team/coding-v1/IMPLEMENTATION_EVIDENCE.md` is absent as of this update.
- `release/workspaces/coding.js` is still a read-only/import/context execution surface and does not prove the authoritative exact-SHA transactional file/shell bridge required by the new contract.

Therefore Self-Development MUST NOT use the legacy direct GitHub mutation path as a fallback when Coding v1 is unavailable.

## Self-Development v1

Tracking issue: #100
Implementation branch: `self-development-v1-phase1`

### Research / architecture
- deep external research synthesis added under `.seven-team/self-development-v1/RESEARCH_SYNTHESIS.md`
- target architecture added under `.seven-team/self-development-v1/ARCHITECTURE.md`
- phased implementation plan added under `.seven-team/self-development-v1/EXECUTION_PLAN.md`

### Phase 1 — Observation & Diagnosis Foundation
Candidate implementation added:
- `evolution/self-development-observer.cjs`
- `evolution/self-development-diagnosis.cjs`
- `evolution/self-development-foundation.test.cjs`

Phase 1 scope is intentionally non-mutating:
- structured content-minimized observations
- allowlisted metrics/metadata
- secret/content rejection
- bounded observation buffer
- deterministic weakness aggregation
- diagnosis records that remain HYPOTHESIS until controlled evidence exists
- critical-signal escalation
- conservative LOW/MEDIUM/HIGH/CRITICAL risk classification
- protected/evaluator/self-development edits routed to GOVERNANCE_REQUIRED
- no file write, shell, GitHub mutation, merge or promotion capability exported

### Shared coordination decisions
- Self-Development is an evidence-gated experiment controller.
- production mutation goes only through Coding System.
- evaluator plane is immutable during candidate evaluation.
- Self-Development/evaluator/protected-policy changes are CRITICAL governance work.
- telemetry is content-minimized by default.

## Current Verification State

Phase 1 source and tests are on the isolated branch.
The first candidate PR (#101) was deliberately closed after base drift from `0c95a0a` to `f65a300`; the Phase 1 candidate was rebuilt from exact current baseline `f65a300`. Full existing repository CI/regression gate must pass on the fresh exact candidate before it can be considered verified.
Independent review is still required before merging protected Self-Development/Evolution-plane changes.

## Next Actions

1. Open PR for `self-development-v1-phase1`.
2. Run existing full Seven CI/regression suite.
3. Fix any Phase 1 failures.
4. Record exact CI/evidence in `.seven-team/self-development-v1/IMPLEMENTATION_EVIDENCE.md`.
5. Obtain independent review for this CRITICAL-plane change.
6. Merge only after evidence/review gates pass.
7. Continue Phase 2: Metric Registry + paired baseline/candidate evaluator.
8. Keep Phase 5 (production Coding integration) BLOCKED until Coding v1 implementation evidence is proven.

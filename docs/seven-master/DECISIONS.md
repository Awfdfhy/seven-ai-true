# Seven AI — Architecture Decision Log

## ADR-001 — GitHub is the Source of Truth
Status: Accepted
Decision: Multi-chat work is coordinated through repository documentation and code, not chat memory alone.

## ADR-002 — One Primary Subsystem per Specialist Chat
Status: Accepted
Decision: Specialist chats own focused domains to reduce context pollution and conflicting assumptions.

## ADR-003 — Shared Contracts Are Explicit
Status: Accepted
Decision: Cross-system interfaces are documented in INTEGRATION_CONTRACTS.md and cannot be silently changed.

## ADR-004 — Coding Before Self-Development
Status: Accepted
Decision: The Coding System must be robust and verified before autonomous/self-development features depend on it.

## ADR-005 — Verification Is Mandatory
Status: Accepted
Decision: No subsystem is marked complete from implementation alone; tests and regression evidence are required.

## ADR-006 — Integration Acceptance Is Evidence-Gated
Status: Accepted
Decision: Unit success is insufficient for release readiness. Cross-system regression, release build, Android build/device evidence, state isolation, cancellation and recovery are explicit acceptance gates. Zero bugs may only mean zero known reproducible bugs in the tested scope.

## ADR-007 — Execution Checkpoints Fail Closed
Status: Accepted
Decision: Execution checkpoints use a versioned envelope with task/run/state identity checks, deterministic corruption checksum and bounded retention. Invalid checkpoints are rejected.

## ADR-008 — Cancellation Is Request-Scoped
Status: Accepted
Decision: Cancellation belongs to the originating generation/tool request; late results are rejected and must not affect another room/workspace.

## ADR-009 — Cross-System Errors Use a Common Taxonomy
Status: Accepted
Decision: Public integration surfaces normalize toward MODEL_ERROR, NETWORK_ERROR, TOOL_ERROR, MEMORY_ERROR, FILE_ERROR, AUTH_ERROR, RATE_LIMIT, VALIDATION_ERROR, CANCELLED, TIMEOUT or INTERNAL_ERROR.

## ADR-010 — RPG Structured State Is Authoritative
Status: Accepted
Decision: RPG continuity-critical truth lives in validated structured state plus provenance, not free-form prose.

## ADR-011 — RPG Separates Truth, Knowledge and Belief
Status: Accepted
Decision: Narrator/world truth, character knowledge and character beliefs are separate state domains.

## ADR-012 — RPG Uses Propose → Validate → Commit
Status: Accepted
Decision: Model output can propose state deltas; deterministic validation decides commit.

## ADR-013 — RPG Reuses Seven Memory Fabric
Status: Accepted
Decision: RPG memory must layer on shared Memory interfaces rather than a hidden parallel memory architecture.

## ADR-014 — Player Control Is a Hard Runtime Constraint
Status: Accepted
Decision: Seven may not invent irreversible player-controlled actions/thoughts unless control is explicitly granted.

## ADR-015 — Seven Remake V3 Is the Integration Product Base
Status: Accepted — 2026-10-05
Decision: Integration/Verification changes for the TypeScript/Capacitor product are based on `seven-remake-v3`, not assumed from `main`. Coordination docs are copied/reconciled into the integration branch. Evidence must identify the exact tested SHA.

## ADR-016 — Production and Integration Tests Share Routing Code
Status: Accepted — 2026-10-05
Decision: `application/chat/routed-chat-transport.ts` is the canonical routed/fallback transport. Phase12 imports/re-exports it rather than maintaining a test-only implementation.

## ADR-017 — Self-Development Is Fail-Closed Behind Coding Verification
Status: Accepted — 2026-10-05
Decision: Self-Development cannot acquire GitHub credentials or mutate a repository without CodingVerificationEvidence bound to repository, base SHA, paths and checks.

## ADR-018 — Unwired Workspaces Cannot Fall Back to Core Chat
Status: Accepted — 2026-10-05
Decision: Research/Build/RPG workspace selection must never silently dispatch through normal Chat. Until their production adapters are integrated and verified, submission is blocked explicitly.

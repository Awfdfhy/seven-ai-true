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
Decision: Execution checkpoints use a versioned envelope with task/run/state identity checks, deterministic corruption checksum and bounded retention. Invalid checkpoints are rejected. The checksum is not treated as a cryptographic trust boundary.

## ADR-008 — Cancellation Is Request-Scoped
Status: Accepted
Decision: Cancellation belongs to the originating generation/tool request. Platform-specific code may choose the safe abort mechanism, but late results must be discarded and cancellation from another room/workspace must not bleed across scopes.

## ADR-009 — Cross-System Errors Use a Common Taxonomy
Status: Accepted
Decision: Integration surfaces normalize failures into MODEL_ERROR, NETWORK_ERROR, TOOL_ERROR, MEMORY_ERROR, FILE_ERROR, AUTH_ERROR, RATE_LIMIT, VALIDATION_ERROR, CANCELLED, TIMEOUT or INTERNAL_ERROR, while preserving technical details in safe structured diagnostics.

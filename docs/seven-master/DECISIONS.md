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

## ADR-006 — Coding Builds on the Modern Tool Product Branch
Status: Accepted
Decision: Coding System implementation targets `seven-remake-v3` because it contains the verified modern Tool Fabric and TaskManager. The specialist branch `coding-system-v1` is created from an exact `seven-remake-v3` commit. Coordination documents from `main` are carried into that branch so code and status evidence remain reviewable together.

## ADR-007 — Coding Plans Are Bound to Exact Workspace Truth
Status: Accepted
Decision: Every mutating Coding plan is bound to an exact Git head SHA, repository snapshot fingerprint, and per-file source fingerprint. Head, snapshot, or source-file drift fails closed; an old plan is never silently applied to a changed workspace.

## ADR-008 — Mandatory Verification Is Outside Model Authority
Status: Accepted
Decision: Deterministic policy selects mandatory verification commands from the changed paths. Models may request additional checks but cannot remove required typecheck/build/regression/security gates. PASS requires recorded execution evidence, not a model assertion.

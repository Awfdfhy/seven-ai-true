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


## ADR-010 — RPG Structured State Is Authoritative
Status: Accepted
Decision: RPG continuity-critical truth lives in validated structured state plus provenance ledger. Narrative prose, summaries and retrieved memories are projections/evidence, not authoritative state.

## ADR-011 — RPG Separates Truth, Knowledge and Belief
Status: Accepted
Decision: Narrator/world truth, each character's knowledge, and each character's beliefs are separate state domains. A character may not use a fact without a valid knowledge path.

## ADR-012 — RPG Uses Propose → Validate → Commit
Status: Accepted
Decision: Models and NPC planners may propose state changes, but deterministic Canon, player-control, knowledge, timeline, spatial, inventory/ability and provenance gates decide whether a change can commit.

## ADR-013 — RPG Reuses Seven Memory Fabric
Status: Accepted
Decision: RPG-specific memory schemas/adapters layer on the shared Memory system using RPG scope and provenance; no independent hidden RPG memory database is introduced.

## ADR-014 — Player Control Is a Hard Runtime Constraint
Status: Accepted
Decision: For player-controlled characters, Seven cannot invent irreversible actions, internal thoughts/emotions or decisions unless the user explicitly grants control.

## ADR-015 — Response Mode State Is Canonical
Status: Accepted
Decision: Chat/Think/Search/Research are controlled by one idempotent runtime state surface. CSS classes are projections only. Changing mode while generation is active cancels the originating work before changing semantics.

## ADR-016 — Context Budget Follows the Controller Model
Status: Accepted
Decision: Context input budget is derived from the controller-selected model window, not the largest configured provider window. Fallback candidates must fit the actual compiled request.

## ADR-017 — Research Citation Locks Preserve Temporal Identity
Status: Accepted
Decision: Locked citations preserve retrievedAt, publishedAt when available, source identity and deterministic content hash so freshness and source mutation are auditable.

## ADR-018 — Diagnostics Are Bounded and Content-Free
Status: Accepted
Decision: Request traces retain IDs, phases, timings, counts, model/provider identifiers and normalized errors only. Prompt, response, secret, file-body and source-body content is excluded.

## ADR-019 — Network Link State Is Not Reachability
Status: Accepted
Decision: navigator.onLine is represented as link-online/offline only. End-to-end reachability is a separate evidence field updated from provider outcomes.

## ADR-020 — Self-Development Is an Evidence-Gated Experiment Controller
Status: Accepted
Decision: Seven Self-Development may observe, measure, diagnose, research, hypothesize and prioritize improvements, but production mutation authority remains in the Coding System. A builder or critic cannot certify its own change; promotion requires exact baseline/candidate/evaluator identity, comparable evidence, hard regression gates and rollback readiness.

## ADR-021 — Evaluator Plane Is Immutable During Candidate Evaluation
Status: Accepted
Decision: Tests, benchmark manifests, baselines, constitution/proof policy, acceptance rules and protected-path policy cannot be changed by the candidate they judge. Changes to the evaluator or Self-Development authority plane are CRITICAL governance work requiring a separate change and stronger review.

## ADR-022 — Self-Development Telemetry Is Content-Minimized
Status: Accepted
Decision: Observation records use allowlisted metrics, categorical metadata, bounded identifiers and evidence references. Prompt/response content, credentials, secret-like identifiers and unrestricted raw diagnostic bodies are rejected by default.


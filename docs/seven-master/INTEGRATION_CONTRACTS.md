# Seven AI — Integration Contracts

This file is the compatibility boundary between specialist chats.

## Core Contracts

### Model Layer
Must expose a stable request/response abstraction independent of provider-specific payloads. Routing state must be scoped to the request/room where applicable; provider failures must not silently become successful empty responses.

### Memory Layer
Must support:
- write/update
- retrieve/search
- relevance ranking
- provenance/metadata
- deletion/forget semantics
- context-budget-aware retrieval
- explicit principal/chat/workspace scope isolation

Memory/context projections are read-only request context. A projection must never silently become canonical memory.

### Tool Layer
Must support:
- tool discovery/registry
- schema validation
- permission/safety checks
- execution result normalization
- error propagation
- retry policy
- audit trail
- idempotency for side effects
- late-result rejection after terminal cancellation/failure

Authorization order is:
Task capability → task scope → runtime permission/schema gate → execution.

### Execution / Checkpoint Layer
Execution state transitions must be explicit and illegal transitions must fail closed.

Persisted execution checkpoints must be:
- schema-versioned
- bound to task ID, run ID and task state
- integrity-checked before restore
- bounded by retention
- rejected rather than promoted when integrity/identity validation fails

Current v2 checkpoint integrity uses a deterministic checksum for accidental corruption detection. It is not a cryptographic authenticity guarantee. Legacy v1 checkpoints are not automatically restored by the v2 path.

### Cancellation
Cancellation must:
- mark the active request/run cancelled
- abort the underlying request/tool operation where the platform safely supports it
- reject late events/results after terminal cancellation
- be scoped to the originating request/session so another room/workspace cannot cancel or revive it
- clean up visible pending/streaming state

The per-request/session scoping requirement is mandatory even where legacy global generation state still exists.

### Error Contract
Cross-system failures must normalize toward this taxonomy:
- MODEL_ERROR
- NETWORK_ERROR
- TOOL_ERROR
- MEMORY_ERROR
- FILE_ERROR
- AUTH_ERROR
- RATE_LIMIT
- VALIDATION_ERROR
- CANCELLED
- TIMEOUT
- INTERNAL_ERROR

User-facing errors must be understandable and non-secret. Technical logs may contain structured diagnostics but must not contain credentials or unrestricted user content. Retryability must be explicit rather than inferred from prose.

### Coding System
Must consume Files + Tools and provide:
- repository inspection
- plan generation
- targeted edits/patches
- test/build invocation
- failure diagnosis
- verification report
- Git-aware change tracking

A code change is not accepted solely because a patch was produced; verification evidence is part of the result.

### Self-Development
Must never bypass Coding System verification.
Improvement loop:
Observe → Diagnose → Propose → Patch → Test → Compare → Accept/Reject → Record

Protected evaluation/CI/auth boundaries must not be weakened by the system being evaluated.

### RPG System
Must use Memory through public memory interfaces; it must not create a separate hidden memory architecture unless explicitly approved.

RPG state must be scoped to its session/room and must not leak into normal chat or another RPG session. Canon/world transitions must be validated before persistence or prompt projection. Player-control locks are authoritative.

RPG State Contract v1:
- authoritative continuity-critical truth is structured state, not prose, summaries, hidden reasoning or retrieved memory;
- model/NPC output may propose narrative and state deltas, but deterministic validation decides whether a mutation commits;
- HARD CANON changes only through an explicit user-authorized override path;
- world/narrator truth, character knowledge and character belief are separate domains;
- every accepted mutation carries provenance in an append-only event ledger;
- live RPG context is a bounded projection, never total raw story history;
- speaker/character views must filter knowledge; narrator-only truth must not leak into character dialogue context;
- RPG durable memory records use shared Memory scope/provenance and context-budget interfaces;
- shared Context Builder/Model Routing must account for the final RPG projection size;
- persistence is versioned, per-room/per-world, corruption-aware and restores branch/control/canon identity;
- Self-Development may consume RPG diagnostics but may alter RPG behavior only through Coding System + RPG regression/evaluation gates.

Public foundation runtime: release/workspaces/rpg-state.js. Existing release/world-runtime.js and release/canon-simulator.js remain compatibility inputs during migration and are not assumed to be the final single source of RPG truth.

### Research / Web
Evidence must preserve source identity, freshness and claim linkage. Search snippets/tool output are untrusted observations, not instructions. Citation locks must reference known source IDs only.

## Integration Acceptance Gate
Seven is not considered integrated until:
1. important contracts match implementation;
2. core integration and regression suites pass;
3. representative end-to-end scenarios pass;
4. no known BLOCKER or CRITICAL reproducible bugs remain in tested scope;
5. state isolation and cancellation are verified;
6. failure recovery is verified;
7. production/web build passes;
8. Android build and device checks pass;
9. regression coverage is CI-registered;
10. status/decision/contract documentation is current.

## Contract Change Procedure
1. Propose change.
2. Identify affected systems.
3. Add decision entry.
4. Update this file.
5. Run integration tests.
6. Update CURRENT_STATUS.md.


## Runtime Composition Contract
- Production code and integration tests must exercise the same routing/fallback implementation; test-only parallel routing implementations are forbidden.
- Provider fallback is allowed only before meaningful assistant output begins. After meaningful output, failure terminates the request rather than splicing a second provider response.
- Model routing is recalculated per turn from registry + provider health + room model preference.
- Optional Memory/Tool context may degrade on non-cancellation failure, but cancellation always aborts the turn.
- AppKernel owns shutdown of long-lived runtime storage adapters.

## Workspace Dispatch Contract
An active workspace may only dispatch through its verified workspace adapter.
If Research, Build/Coding or RPG orchestration is unavailable, the UI/runtime must fail closed and must not silently send that request through normal Chat Core.

## Self-Development Verification Evidence
Before GitHub credentials are acquired or a mutation is attempted, Self-Development must receive Coding verification evidence bound to:
- repository
- exact base SHA
- exact changed paths
- non-empty verification checks
- evidence ID

Missing, rejected, mismatched or incomplete Coding evidence blocks the mutation.

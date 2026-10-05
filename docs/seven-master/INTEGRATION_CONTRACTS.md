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

### Observability Contract
Every user-visible request that crosses model/tool/web/memory phases should have a bounded trace ID and lifecycle. Trace payloads may contain phase names, timings, status/error codes, provider/model identifiers and counts. They must not contain prompts, model outputs, credentials, raw file bodies, raw web bodies or unrestricted memory content.

The canonical runtime error codes are MODEL_ERROR, NETWORK_ERROR, TOOL_ERROR, MEMORY_ERROR, FILE_ERROR, AUTH_ERROR, RATE_LIMIT, VALIDATION_ERROR, CANCELLED, TIMEOUT and INTERNAL_ERROR. Retryability is explicit.

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

Canonical loop:
Observe → Measure → Diagnose → Research → Generate Hypotheses → Prioritize → Plan → Coding System → Patch → Test → Benchmark → Compare → Critique → Accept/Reject → Rollback if needed → Document → Learn

Observation contract:
- content-minimized structured records only;
- allowlisted numeric metrics and categorical metadata;
- bounded trace/run/request/evidence identifiers;
- prompt/response text, credentials, secret-like identifiers and unrestricted raw bodies are rejected by default;
- missing evidence stays INCONCLUSIVE/UNPROVEN, never PASS.

Mutation contract:
- Self-Development does not own direct repository mutation;
- production candidates must use Coding System with exact baseline SHA, isolated scope, stale/base-drift rejection, deterministic mandatory tests, exact diff/test evidence and rollback/discard support;
- if the authoritative Coding contract is unavailable or unproven, Self-Development stops at PLAN/SHADOW_ONLY.

Evaluation contract:
- baseline and candidate are judged under the same locked evaluator identity and comparable environment;
- evaluator/test/baseline/constitution/acceptance-policy changes are outside candidate authority;
- hard security, permission, persistence, crash, constitution and shared-contract failures cannot be averaged away by a higher aggregate score.

Risk contract:
- LOW — prompts, local ranking/tie-breakers and bounded thresholds;
- MEDIUM — routing, memory/context algorithms, tool selection, research/search, latency/token efficiency and agent workflow;
- HIGH — shared contracts, auth/permissions, storage/migration, core execution, GitHub mutation and rollback/recovery;
- CRITICAL — evaluator plane, constitution/proof policy, protected-path policy and Self-Development itself.

HIGH requires stronger integration/recovery evidence and manual approval. CRITICAL changes are separate governance work and may not be autonomously self-modified.

Learning contract:
Accepted, rejected, blocked and rolled-back experiments preserve diagnosis, hypothesis, exact identities, metrics/tests/proof, confounders, decision reason and ADOPT/AVOID/RETEST lesson. Learning records never grant permissions by themselves.

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

### Network / Provider Health
Provider discovery failures participate in the same provider health/cooldown model as inference failures. Sequential fallback has one global request deadline plus per-attempt fair-share timeout. navigator.onLine is advisory link state only; end-to-end reachability requires provider evidence.

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

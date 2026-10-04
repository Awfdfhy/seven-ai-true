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


## Release Manager Addendum — 2026-10-05

### GitHub Self-Development verification/publication
- `atomicCommit(branch, files, message)` keeps its public signature and `{sha,files}` result. All paths validate before writes. Publish one commit containing the whole set via a non-forced ref update; duplicate/protected paths, unsupported modes and truncated tree snapshots fail closed.
- Exact workflow: `seven-tests.yml`; exact `head_sha` and `head_branch` required. Explicitly dispatch after each candidate/repair commit. An older successful run or unfinished timeout is never verification evidence.
- `mergePullRequest(number, expectedSha)` adds an optional expected SHA; autonomous verified merges must supply it.
- `repositoryTree` adds `truncated` metadata; callers must not treat truncated inventories as complete.
- Eval corpus, memory/runtime regression entrypoints, static/browser/APK/provenance gates remain outside autonomous edit authority. HTTP 503/auth/network failures propagate; only 404 permits file creation.

### APK web payload identity
- `www/seven-packaging.json`: format `seven-android-web-payload`, version 5, `sourceCommit`, `sourceDirty`, optional `workflowRunId`, `files[{path,bytes,sha256}]` plus existing lazy asset metadata.
- `sourceCommit` must match checkout/workflow identity. APK verification requires committed source and checks packaged bytes against the recorded inventory. Identity checks supplement, not replace, manifest/version/signature/install/upgrade checks.
- Build generators must not leave tracked changes at verification; synchronize label source before committing changed app names.

### Bounded RPG character projection
- `SevenRpgContext.buildCharacterView`: `knowledgeRefs` represents the selected known Canon subset, not all historical canonical knowledge.
- Complete serialized context including diagnostics must fit the budget. Unavoidable oversize returns `{ok:false,status:'BLOCKED',reason:'context-budget-exceeded'}` without a prompt-ready view; callers must not continue generation using oversized state.
- Shared Memory and canonical RPG state are unchanged by this projection. Live turn/persistence/generation wiring still needs acceptance tests.

### Test/startup ownership
- `all.cjs` discovers every top-level `release/*.test.cjs` automatically, while retaining explicit browser/eval/gateway/evolution/packaging gates.
- Actual compiled `build.startupBytes` is authoritative for both static/browser startup audits; strict budget remains below 100000 bytes. Byte count is not a startup-latency measurement.

Memory VM test report output is dist/memory-results.json. Historical root memory-results.json is not a current acceptance result. Test runs must not mutate tracked source.

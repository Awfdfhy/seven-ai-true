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
- `all.cjs` discovers every top-level `release/*.test.cjs` and `apk/*.test.cjs` automatically, while retaining explicit browser/eval/gateway/evolution/packaging gates.
- Actual compiled `build.startupBytes` is authoritative for both static/browser startup audits; strict budget remains below 100000 bytes. Byte count is not a startup-latency measurement.

Memory VM test report output is dist/memory-results.json. Historical root memory-results.json is not a current acceptance result. Test runs must not mutate tracked source.

### Actual APK binary identity (ADR-REL-006)
- verify-apk.cjs now requires Android SDK aapt/apksigner (resolved from ANDROID_SDK_ROOT/ANDROID_HOME build-tools or PATH) and fails closed if unavailable.
- Binary package/version must equal capacitor.config.json appId and package.json version/sevenAndroidVersionCode. The actual signature must verify successfully; signer certificate digests are evidence, not proof of upgrade continuity.
- dist/apk-verification.json format seven-apk-verification v1 contains sourceCommit, workflowRunId, apkSha256, bytes, webAssetCount, packageName, versionCode, versionName, signatureVerified, signerCertificateSha256[], upgradeContinuity: UNVERIFIED. Existing installed-app migration/signing continuity needs a separate acceptance result.

### Live RPG bridge uncertainty boundary (ADR-REL-007)
- Upstream live bridge syncs legacy snapshots to structured sessions and public derived RpgStateSnapshot memory; this does not prove character-local model prompting or semantic delta extraction.
- New pending journal key is <session prefix>:pending:<encoded roomId>, version 1 with roomId/worldId/previous session/previousIndex. It contains recovery data and must not be deleted blindly.
- sync/load/loadLatest fail with {ok:false,status:BLOCKED,reason:recovery-required}; context returns null while a journal exists. journal-write-failed performs no mutation. Existing ordinary failure reason strings remain when compensation succeeds.
- No schema migration or automatic destructive repair is performed. Process interruption, rollback storage failure and finalization uncertainty require verified recovery before resuming. Low-level manager access is diagnostic, not a bypass for live hydrate.

### RPG production packaging (ADR-REL-008)
Four RPG kernel/bridge files are transformed by pinned parser-based minification. Public module exports, property names and function names remain available; generated local variable names are not an integration contract. The same deterministic suites exercise source and packaged implementations. Package consumers must install project devDependencies for build/test. Shared persistence/context schemas and byte limits are unchanged.

### Sidebar room search localization ownership
The Arabic room-search placeholder and aria-label are both بحث المحادثات across Remake translation and UiPolish updates. Packaging normalizes the older compressed Remake copy; alternating late sync/update calls must preserve this invariant. Other translations remain unchanged.


## Coding System V1 Addendum — 2026-10-05

- Repository truth is bound to repository, branch, exact 40-character commit SHA, per-file SHA-256 and a deterministic snapshot fingerprint. Plans based on stale head/snapshot/file identity fail closed.
- Repository access for the production Coding runtime passes through Seven Tool Fabric. Canonical tool IDs are `coding.repo.head`, `coding.repo.list`, `coding.repo.read` and `coding.repo.commit`. Reads require `coding.repo.read`; mutation requires `coding.repo.write` plus mutating-tool approval.
- Coding repository mutation must use replay/idempotency protection, audit/effect evidence, non-forced exact-base Git updates and post-commit head/content verification. An `effect_unknown` result is BLOCKED and requires reconciliation before retry.
- Cancellation from the originating Coding task propagates through ToolExecutor into the underlying repository operation, including replay-takeover paths. A Coding runtime is bound to its originating task scope.
- Coding consumes the existing ModelRouter/ProviderHealthTracker for model selection/failover and the existing ResearchService for research. It does not introduce parallel routing or research authority.
- Models may analyze, propose patches, request research and diagnose failures. They cannot remove mandatory verification, grant themselves repository capabilities, authorize critical paths, approve their own failed verification, or treat unverified execution claims as evidence.
- Completion requires deterministic diff review, policy-owned verification evidence and a read-only review verdict. Older successful runs are not evidence for a newer candidate.

## Integration Runtime Composition Addendum — 2026-10-05

### Canonical production path
- Production code and integration tests must exercise the same routing/fallback implementation; test-only parallel routing implementations are forbidden.
- Provider fallback is allowed only before meaningful assistant output begins. After meaningful output, failure terminates the request rather than splicing a second provider response.
- Model routing is recalculated per turn from registry + provider health + room model preference.
- Optional Memory/Tool/Attachment context may degrade only on explicitly recoverable non-cancellation failures; cancellation always aborts the originating turn.
- AppKernel owns shutdown of long-lived composed storage adapters.

### Workspace dispatch
An active workspace may only dispatch through its verified workspace adapter. Research, Build/Coding or RPG selection must never silently fall back to normal Chat Core. Missing production composition fails closed.

### Request and room state isolation
- generation run, pending user turn, assistant draft, user-visible generation error and unsent composer draft are scoped by room/request;
- completing or cancelling work in room A must not select, overwrite, cancel or revive room B;
- the Stop control targets only the current room's active run;
- Tool approval is bound to the room and invocation fingerprint that created it; approval UI and result notices must not be projected into another room;
- asynchronous attachment/tool notices preserve their origin room;
- switching rooms during generation is supported without cross-room state contamination.

### Self-Development verification evidence
Before GitHub credentials are acquired or mutation is attempted, Self-Development must receive Coding verification evidence bound to repository, exact base SHA, exact changed paths, non-empty verification checks and an evidence ID. Missing, rejected, mismatched or malformed evidence fails closed. Public task errors may sanitize internal details, but credentials/mutation remain untouched.

### Performance evidence
Runtime observability records bounded task/model/tool durations and model TTFT without prompt/output content. CI also carries broad local performance budgets for routing at catalog scale, long-context assembly and TaskManager orchestration. These budgets detect catastrophic regressions; they are not claims about live network/provider latency or device-wide UX latency.


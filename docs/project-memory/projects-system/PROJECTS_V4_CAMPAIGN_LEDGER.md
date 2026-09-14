# Seven Projects System — Polishing V4 Campaign Ledger

Status: ACTIVE
Current candidate: `PROJECTS_4_2_RECONCILED_CANDIDATE.md`
Saturation counter: `0/2`

## Ground-truth status
Architecture-only campaign. No claim that Project Fabric 4.2 is implemented, tested, device-verified or release-proven.
Protected application source remains outside this campaign.

## Capability surface
Covered so far:
- project identity and lifecycle
- typed resource graph and ownership relations
- durable goals/tasks/decisions/risks
- project policy and trust
- revision/conflict semantics
- snapshots/checkpoints
- variants/forks/clones
- long-running agent re-entry
- project-scoped memory boundary
- sessions/runs boundary
- local-first/offline behavior
- optional sync semantics
- import/export/identity remap
- archive/delete/orphan handling
- provider/tool portability
- access-state revocation
- storage pressure
- mobile lazy loading
- cross-system ownership boundaries

Open search areas before final independent reviews:
- formal migration matrix across Project schema generations
- very-large graph degradation behavior
- cross-project links and shared-resource lifecycle stress
- interrupted import/export transaction recovery
- multi-window/multi-process concurrent local editing if the eventual Android host enables it

## Alternative architecture tournament
### A. Folder-centric Project
Project is mainly a directory plus metadata.
Rejected as canonical architecture: cannot safely represent memory/session/run/resource ownership, remote refs, goals, variants and non-file artifacts.

### B. Conversation-centric Project
One canonical long chat/session represents the project.
Rejected: transcript/context lifecycle is not project lifecycle; chat deletion/compaction/model replacement would endanger durable work truth.

### C. Cloud-workspace canonical Project
Remote workspace is authoritative and local state is cache.
Rejected for Seven 1.0: violates offline-first/mobile/provider-independence goals and makes connectivity a hidden correctness dependency.

### D. Universal CRDT Project document
All project state converges through one collaborative CRDT.
Rejected as universal core: generic convergence cannot resolve authority-sensitive semantic conflicts across files, memory, permissions, side effects, canon and task completion. Specific CRDT-backed resource types remain possible later.

### E. Durable typed work graph with owner-fabric references
Selected candidate. Project owns identity/coordination intent and references state owned by specialized fabrics. Local-first core; optional sync; explicit revision/conflict handling.

## Assumption register
- Seven 1.0 is primarily single-user/device-local in project authority. Future sync must not invalidate core semantics.
- File bytes remain owned by File Fabric.
- Memory events remain owned by Memory Fabric.
- Sessions/runs retain independent lifecycle.
- current provider/tool availability changes over time.
- Project imports may be untrusted or partially incompatible.
- Android can experience abrupt process death, low memory, poor connectivity and storage pressure.

Any implementation evidence disproving these assumptions triggers V4 reopen.

## Quality / criticality scenarios
### C0
- no cross-project permission leakage
- no cross-project sensitive memory leakage
- no stale agent overwrite of newer user project state
- no destructive cascade from attached/shared refs
- no identity collision attaching imported edges to unrelated resources
- no imported project auto-execution

### C1
- reload/recovery after interrupted project mutation
- schema migration with integrity preservation
- export/import round-trip preserving supported project relationships
- explicit handling of missing/revoked resources
- project archive/restore without authority loss
- variant ancestry/reconciliation integrity

### C2
- project list stays small and independent of project payload size
- project open lazy-loads only required graph slices
- context/re-entry compilation is bounded and cancellable
- archive releases hot caches/indexes
- offline project core remains usable
- storage pressure preferentially evicts rebuildable data

### C3
- richer graph visualization
- optional semantic indexing
- optional collaboration/sync adapters

## Failure and regression cemetery
Permanent architecture regression cases accumulated so far:
1. project-as-chat collapse
2. file ownership duplicated inside Project
3. summary promoted to project truth
4. stale run commits over newer human edit
5. ProjectResourceRef interpreted as delete ownership
6. ProjectResourceRef interpreted as current permission
7. variant duplicates Git/RPG/Canon branch authority
8. remote sync treated as successful before effect confirmation
9. universal last-write-wins on C0/C1 state
10. provider binding makes imported project unusable
11. cache/reference bypasses revoked access
12. single-project reachability used as proof of global orphan
13. imported ID collision silently merges unrelated objects
14. project open loads entire file/memory/vector corpus

## Cross-system contract map
Project Fabric owns coordination only.
- File Fabric: bytes, paths, file versions, transactions
- Memory Fabric: memory ledger/views/retrieval/purge
- Context Fabric: reconstructable active context
- Cognitive Runtime: execution plans/runs
- Sessions/Persistence: chat/session persistence and host schema
- Tool Security/Permission: effective grants
- Side-Effect Ledger: remote/external mutation truth
- Recovery/Integrity: corruption and restore mechanics
- Resource Governor: pressure/tiering/background work
- Workspace Hub: presentation/navigation
- GitHub Project Memory: provider-specific adapter

## Test derivation map
Architecture-to-implementation tests expected later:
- optimistic revision conflict tests
- property test: reference relation never grants delete ownership
- property test: Project policy never grants more authority than Security Kernel
- import fuzzing for duplicate/missing/cyclic IDs
- export/import metamorphic round trip
- crash injection between staged import and commit
- replay/migration tests across schema versions
- connector access revocation tests
- large graph pagination/working-set tests
- storage pressure eviction tests
- offline reopen/edit/recovery tests
- Arabic/RTL long project/resource title UI tests

## Mobile resource envelope
Architecture constraints now; numeric budgets require implementation/device evidence later.
- O(number of projects) compact list metadata only at startup; no full resource payload load
- graph slices/indexes loaded on demand
- no required embeddings or local LLM to open a Project
- background sync/indexing cancellable and Resource-Governor controlled
- derived indexes/caches unloadable
- project re-entry compilation budgeted and interruptible
- network absent must not block local Project inspection and supported local edits

Evidence state for numeric mobile budgets: `ARCHITECTURE_ACCEPTED`, not `DEVICE_VERIFIED`.

## Uncertainty ledger
- exact local persistence schema undecided
- collaboration protocol undecided and deferred
- precise Android multi-process semantics depend on final host architecture
- exact import package format/versioning not yet implemented
- exact performance thresholds await release-build measurement

## Reopen triggers specific to Projects
- evidence that current persistence model cannot provide atomic/recoverable project-event commit
- collaboration becomes Seven 1.0 requirement
- project size/device tests violate resource envelope
- cross-project shared-resource semantics reveal hidden ownership ambiguity
- implementation needs a new canonical primitive not representable as current type/policy/reference/event
- new Android storage/process behavior invalidates assumptions

## V4 phase state
- Ground Truth: PASS for architecture scope
- Domain Discovery: PASS with open ledger entries recorded
- Research Sweep: PASS for current round
- First-Principles Rebuild: PASS
- Alternative Tournament: PASS
- Builder Review: PASS
- Failure Review: PASS, produced material changes
- Simplifier Review: PASS, primitive count held to eight
- Unknown-Unknown Hunt: ACTIVE
- Cross-System Shadow Test: PASS for current adjacent fabrics
- Reality Gate: PARTIAL; implementation choices still unverified
- Mobile Physics Gate: ARCHITECTURE PASS / device evidence deferred
- UX/Accessibility Gate: PARTIAL architecture requirements captured; final UI not built
- Precommit Evaluation Contract: DRAFTED via C0-C3 scenarios
- Long-Horizon Composition: DESIGN COMPLETE / execution deferred to implementation
- Regression Cemetery: ACTIVE
- Pareto/Sensitivity Gate: PASS at architecture comparison level
- Proof of Improvement: PASS for Rounds 01–09
- Test Derivation: PASS at contract level
- Reconciliation: current candidate 4.2
- Independent Review A: NOT YET ELIGIBLE
- Independent Review B: NOT YET ELIGIBLE

Reason for no premature review: Unknown-Unknown/open-ledger areas above still deserve one more targeted attack. V4 forbids using 2/2 as a shortcut.

# Seven Project Fabric 4.1 — Local-First Durable Work Graph

Status: CURRENT V4 CANDIDATE — NOT YET SATURATED
Capability: #22 Projects System
Supersedes candidate: Projects 4.0

## Prime law
A Project is Seven's durable coordination boundary for work. It owns project identity, lifecycle, project-level intent/policy, typed relationships and project coordination events. It references authoritative objects owned by other fabrics rather than copying them.

The Project must survive model/session replacement, reload, offline periods and context reconstruction without promoting summaries, model output or cached views into authority.

## Canonical backbone
Only eight top-level canonical primitives are accepted:
1. `ProjectIdentity`
2. `ProjectManifest`
3. `ProjectEvent`
4. `ProjectResourceRef`
5. `ProjectWorkItem`
6. `ProjectPolicySet`
7. `ProjectSnapshotRef`
8. `ProjectVariantRef`

Transactions, re-entry manifests, indexes, working sets, health views and graph projections remain contracts/derived state.

## Project identity and revision
`ProjectIdentity` is stable across rename/path/provider/session changes.
Every authoritative project mutation advances a monotonic/logical project revision or equivalent event-head token.

A mutation contract includes:
- projectId
- expected base revision
- initiator/authority reference
- proposed typed events
- referenced resource/version preconditions where needed
- invariant validation result

Stale mutation attempts return conflict/rebase-required state instead of silently replacing newer state.
Long-running runs bind `baseProjectRevision`; their returned project-level proposals must be revalidated against current state.

## Manifest
`ProjectManifest` contains only durable project declarations: name/description, schema version, declared roots/scopes, selected policies, integrity/version references and genuinely project-scoped settings.
It never stores duplicated file bodies, transcripts, memory summaries, model hidden state or tool results.

## Project event ledger
Typed append-only coordination/lifecycle events capture changes whose history matters, including project creation, manifest/policy changes, resource attach/detach, work-item transitions, checkpoints, variant creation/reconciliation, imports and lifecycle changes.

Events preserve initiator/provenance and never let model/tool output grant authority.

## Resource graph
`ProjectResourceRef` identifies an object owned by another fabric and carries enough version/lineage metadata to detect staleness.

Resource categories include files, knowledge sources, sessions, runs, memory scopes, research/code artifacts, RPG worlds, canon source sets, generated artifacts and external resources.

Every edge carries explicit relation semantics:
- `OWNED`
- `ATTACHED`
- `SHARED`
- `EXTERNAL_REFERENCE`
- `DERIVED_OUTPUT`
- `TEMPORARY`

Graph edges may be `DEPENDS_ON`, `DERIVES_FROM`, `IMPLEMENTS`, `VERIFIES`, `BLOCKS`, `SUPERSEDES`, `PRODUCED_BY`, `REFERENCES`, etc.

Delete/archive/export/cascade behavior depends on owner fabric + relation semantics, never graph reachability alone.

## Work graph
`ProjectWorkItem` persists project intent that must survive sessions: GOAL, TASK, MILESTONE, DECISION, QUESTION or RISK.

States: PROPOSED, READY, ACTIVE, BLOCKED, DONE, CANCELLED, SUPERSEDED.
`DONE` is evidence-gated when a completion contract exists; model self-report is insufficient.

Transient execution plans remain Cognitive Runtime state. A Project may persist accepted milestones/tasks without freezing an agent's private reasoning or chain-of-thought.

## Policies and trust
`ProjectPolicySet` points to project-scoped restrictions/preferences such as roots, memory retention, export policy, sensitive-resource policy, allowed automation/background work and trust posture.

Trust posture:
- UNTRUSTED
- READ_TRUSTED
- WORK_TRUSTED
- RESTRICTED

Project policy can only reduce effective authority. Actual write/execute/network/external authority remains Tool Security / Permission System intersection.
Imported or unknown projects may be readable while execution/write/network remain restricted.

## Snapshot and recovery binding
`ProjectSnapshotRef` references a coherent recovery/checkpoint boundary across project event head plus relevant owner-fabric checkpoints/version watermarks.
It is a manifest of references/hashes, not a giant duplicated universe blob.

Recovery can identify degraded/missing references without silently substituting stale summaries.

## Variants
`ProjectVariantRef` is a project coordination overlay with ancestry/fork point and project-level overrides.
It does not replace domain branch systems.
`VariantBinding` links to owner-defined branch identities such as Git branch/worktree, RPG branch or canon continuity/what-if branch.

Domain data reconciliation is delegated to the owner fabric and the verified result is recorded. Unsupported merge yields `RECONCILIATION_REQUIRED`.

## Re-entry / continuity
`ProjectReentryManifest` is a derived reconstruction record containing:
- source project revision
- selected active WorkItems
- referenced decisions/events
- relevant resource versions
- project-scoped Memory retrieval manifest
- unresolved gaps/conflicts
- compiler/version/budget metadata

Any narrative re-entry brief is presentation derived from this manifest.
It cannot become canonical merely because future sessions read it.
No hidden chain-of-thought is persisted; continuity uses explicit user-visible decisions, goals, constraints, evidence and verified outcomes.

## Working set
`ProjectWorkingSet` is a derived, bounded hot view selected from active goals, recent interactions, explicit pins and dependencies.
It drives Context compilation and UI navigation without loading the whole project.
Hot/Recent/Cold tiers affect loading only, never authority.

## Local-first core
Seven 1.0 Project metadata/work graph is locally durable and usable offline.
- UI reads durable local project state.
- supported local mutations commit locally first.
- remote sync/connectors are optional replicas/effects.
- outgoing remote writes go through Side-Effect Ledger with idempotency/dispatch certainty.
- incoming remote changes are staged/reconciled before authoritative commit.
- universal last-write-wins is forbidden for C0/C1 project state.
- CRDTs may be used only for data types where semantic conflict rules prove safe.

Remote/cloud availability is never required to open a local project.

## Sessions, runs and memory
Projects can link many Sessions/Runs but do not own their internal authoritative state.
Deleting a chat does not delete project state/resources unless separately authorized.

Memory Fabric owns memory events/atoms/views. Project supplies projectId scope and retention/promotion policy. Cross-project memory reuse must be explicit policy, never accidental leakage.

Cognitive Runtime owns live plan/run state. Runs consume project/variant/work-item refs and return evidence/result refs.

## Import/export
Export package is manifest-based and versioned. For each resource it declares EMBEDDED, REFERENCED or EXCLUDED plus hashes/version info, schema compatibility and missing/optional state. Secrets are excluded by default.

Import pipeline:
inspect without execution -> validate integrity/schema -> classify trust -> map identities/conflicts -> stage -> commit -> ImportReport.
Imported content cannot execute scripts/tools simply because it exists in the archive.

## Lifecycle
Archive is reversible and drops hot caches/indexes while preserving durable state under retention policy.
Delete distinguishes Project coordination state from referenced/owned resources, computes a cascade plan, checks authority/dependencies, and preserves tombstone/recovery semantics where configured.
Shared/external references are never deleted accidentally.

Clone creates a new independent Project identity with explicit copy/reference decisions.
Fork preserves ancestry/fork point and may share immutable/versioned resources until divergence.

## Health states
Derived project health may expose:
- HEALTHY
- DEGRADED_REFERENCES
- PARTIAL_IMPORT
- RECOVERY_REQUIRED
- SCHEMA_MIGRATION_REQUIRED
- CONFLICTED
- EXTERNAL_RESOURCE_UNAVAILABLE
- TRUST_RESTRICTED
- RECONCILIATION_REQUIRED

Health is computed from authoritative state and owner-fabric observations; it is not itself authority.

## Performance/mobile contract
- project list reads compact derived index only
- no project graph/file/memory/vector bulk load at app startup
- graph and resource trees lazy-load/paginate/virtualize
- Context compilation is incremental, budgeted and cancellable
- archive releases hot resources
- embeddings/reranking optional
- background sync/indexing Resource-Governor scheduled
- unused project capabilities impose near-zero ordinary startup cost

## Cross-system ownership map
- File Fabric: bytes, versions, file transactions
- Memory Fabric: memory ledger/views/retrieval
- Context Fabric: disposable context workspace
- Cognitive Runtime: run execution/plans
- Sessions/Persistence: chat/session state + app persistence migration
- Tool Security/Permissions: grants/effective authority
- Side-Effect Ledger: external effect truth/uncertainty
- Recovery/Integrity: corruption/restoration mechanisms
- Workspace Hub: presentation/navigation
- GitHub Project Memory: provider-specific adapter, never universal project authority

## Mandatory C0/C1 evals before freeze/release
1. no cross-project memory/permission leakage
2. no stale run overwrites newer project revision
3. no imported project execution without authority
4. no fake WorkItem DONE by model assertion
5. no destructive cascade from reference/ownership confusion
6. no external sync uncertainty hidden as success
7. no variant reconciliation claiming merge without owner-fabric proof
8. recovery maintains ownership/version boundaries
9. export/import never silently includes secrets
10. offline project core remains usable for supported local operations

## Simplification outcome
V4 rounds rejected a second file store, second memory store, canonical project summary, mandatory CRDT core, cloud-canonical project owner, universal merge engine, always-on project daemon and a new collaboration ACL system.

## Current V4 state
Rounds 01–05 all found material improvements and were integrated into 4.1.
Saturation counter remains `0/2`.
Next valid action is another materially different attack/search round; independent saturation reviews are premature until it yields no new material change.

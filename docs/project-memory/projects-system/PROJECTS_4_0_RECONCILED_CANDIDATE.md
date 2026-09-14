# Seven Projects System 4.0 — Reconciled V4 Candidate

Status: V4 CANDIDATE — NOT SATURATED
Capability: #22 Projects System

## Name
**Seven Project Fabric 4.0 — Local-First Durable Work Graph**

## Prime law
A Project is Seven's durable work boundary: an authoritative identity plus a typed graph of references, goals, policies and lifecycle events. It does not duplicate the authoritative contents owned by Files, Memory, Sessions, Runs, Tools or external systems.

A Project must survive chat replacement, model replacement, app reload, offline periods and context reconstruction without converting summaries or model output into authority.

## Minimal canonical backbone
Keep the canonical primitive set intentionally small:

1. `ProjectIdentity`
2. `ProjectManifest`
3. `ProjectEvent`
4. `ProjectResourceRef`
5. `ProjectWorkItem`
6. `ProjectPolicySet`
7. `ProjectSnapshotRef`
8. `ProjectVariantRef`

Everything else should be a derived view, index or integration contract unless future evidence proves canonical persistence is required.

## 1. ProjectIdentity
Stable project identity independent of title, folder path, chat or provider.
Fields conceptually include projectId, createdAt, lifecycle state and optional ancestry.

Lifecycle states:
- ACTIVE
- PAUSED
- ARCHIVED
- IMPORTING
- RECOVERING
- DELETING
- DELETED_TOMBSTONE where retention/integrity policy requires

Rename changes presentation metadata, never identity.

## 2. ProjectManifest
Authoritative project-level declarations only:
- user-visible name/description
- project schema/version
- default locale/presentation settings where truly project-scoped
- declared roots/scopes
- selected project policies
- integrity/version references

Manifest does not contain copied file bodies, memory summaries, conversation transcripts, model state or tool output.

## 3. ProjectEvent
Append-only typed lifecycle/coordination events where authoritative history matters, such as:
- PROJECT_CREATED
- MANIFEST_UPDATED
- RESOURCE_ATTACHED / DETACHED
- WORK_ITEM_CREATED / TRANSITIONED
- POLICY_CHANGED
- CHECKPOINT_REFERENCED
- VARIANT_CREATED / RECONCILED
- IMPORT_COMPLETED
- ARCHIVED / RESTORED

Events point to source identities and initiating authority. Model proposals cannot self-commit privileged project changes.

## 4. ProjectResourceRef
Typed reference to an object owned by another fabric.
Resource classes can include:
- FILE_RESOURCE
- KNOWLEDGE_SOURCE
- SESSION
- RUN
- MEMORY_SCOPE
- RESEARCH_ARTIFACT
- CODE_ARTIFACT
- RPG_WORLD
- CANON_SOURCE_SET
- GENERATED_ARTIFACT
- EXTERNAL_RESOURCE

A ResourceRef contains stable owner-fabric identity, version/freshness information where meaningful, attachment semantics and lineage. It does not copy the owner's authoritative payload.

Relationship edges are typed, for example:
- DERIVES_FROM
- DEPENDS_ON
- IMPLEMENTS
- VERIFIES
- BLOCKS
- SUPERSEDES
- PRODUCED_BY
- REFERENCES

Derived graph indexes may accelerate navigation but do not become authority.

## 5. ProjectWorkItem
A lightweight durable goal/task/decision boundary for work that must survive sessions.
Types may include GOAL, TASK, MILESTONE, DECISION, QUESTION, RISK.

Important distinction:
- WorkItem records explicit durable intent/status.
- Cognitive Runtime owns transient execution plans and active run control.
- A model-generated plan remains proposal state until accepted under project/run policy.

WorkItem states are typed and conservative: PROPOSED, READY, ACTIVE, BLOCKED, DONE, CANCELLED, SUPERSEDED. `DONE` requires the configured completion/evidence contract where one exists; it is not granted because a model said it finished.

Dependencies form a graph, not necessarily a DAG at the project data model. Validation detects impossible/self/cyclic constraints where a specific workflow requires acyclicity.

## 6. ProjectPolicySet
Project-scoped policy references, not a second permission system.
Includes:
- trust posture
- allowed resource roots
- default tool/model preferences where non-authoritative
- memory retention/scope policy
- export/import policy
- sensitive-resource handling
- automation/background-work policy

Effective action authority remains Tool Security / Permission System intersection. Project policy can restrict capability, never grant authority beyond authoritative user/platform grants.

### Trust posture
Suggested states:
- UNTRUSTED
- READ_TRUSTED
- WORK_TRUSTED
- RESTRICTED

Trust affects default execution eligibility and prompts, not truth status. Imported/unknown projects may open readably while execute/network/write remain restricted.

## 7. ProjectSnapshotRef
A checkpoint references coherent versions owned by adjacent systems rather than serializing Seven's entire universe into one blob.
Snapshot manifest can bind:
- Project event position/version
- File Fabric checkpoint/version refs
- relevant Memory ledger/version watermark
- selected persistent session/run refs
- project schema
- hashes/integrity data

Snapshots are recovery/navigation anchors. They do not turn derived context into authority.

## 8. ProjectVariantRef
Supports fork/experiment/what-if development without forcing every project to duplicate all data.
Variant defines:
- variantId
- parent project/variant
- fork point
- override/delta resource refs
- lifecycle
- reconciliation policy

For code projects, Git branches/worktrees may be an adapter implementation, not the universal project model.
For RPG/Real Works, branch identity may bind to the responsible world/canon branch rather than invent a parallel project branch system.

## Project Context Compiler
A derived service compiles a re-entry capsule from project state:
- active goals/work items
- recent accepted decisions
- relevant file/resource versions
- unresolved risks/questions
- relevant project-scoped memory retrieval
- recent verified outcomes
- branch/variant/trust state

The capsule is reconstructable and explicitly derived. It cannot become authoritative merely because every new session sees it.

This directly supports long-running agents without transcript replay or hidden chain-of-thought persistence.

## Project Memory contract
Projects do not own a duplicate memory database.
They define scope and policy for Memory Fabric:
- project-scoped memory atoms/events carry projectId
- global/user memory remains separate
- session-local context remains separate
- promotion/cross-project reuse requires explicit Memory Fabric policy
- project archive/delete triggers retention/purge/rebind rules rather than silent orphaning

## Sessions and runs
- A Project can have many Sessions.
- A Session may be linked to zero or one primary Project plus explicit additional resource references if supported.
- Runs belong to Cognitive Runtime and may reference project/variant/work-item identities.
- Closing/deleting a chat does not delete project files/goals/memory unless an explicit lifecycle action says so.
- Project deletion must not silently erase externally-owned resources without authority and dependency checks.

## Local-first/offline architecture
Seven 1.0 Project core should work from durable local state without requiring network availability.
Principles:
- local durable project metadata/event state is immediately readable
- user-approved local mutations commit locally first where safe
- external sync is asynchronous and explicit
- pending remote operations remain typed and visible
- conflicts are domain-specific; never universal last-writer-wins for authority-sensitive state
- sync is optional infrastructure, not Project identity

Future collaboration may add replica/sync protocols. CRDTs are not mandated for the single-user core because many Project events require semantic authority/conflict policies that generic field-level convergence cannot safely decide.

## Import / export
Project export is a versioned manifest-based package, not an opaque memory dump.
It identifies:
- project manifest/events/work items/policies
- resource inventory and whether each resource is embedded, referenced or excluded
- hashes/version identifiers
- required schema versions
- secrets exclusion
- missing/optional resources

Import stages:
1. inspect manifest without executing content
2. validate versions/integrity
3. classify trust
4. map/conflict resource identities
5. stage transaction
6. commit atomically where feasible
7. produce ImportReport including skipped/unresolved items

Never execute project-provided scripts/tools merely because a project was imported.

## Archive / delete
Archive is cheap and reversible: remove project from hot paths, preserve durable graph according to retention policy, unload indexes/caches.
Delete is authority-sensitive and dependency-aware:
- distinguish deleting Project coordination state from deleting linked owned resources
- show/record cascade plan
- use tombstone/retention window where policy requires recovery
- purge derived indexes/caches
- do not delete shared/external resources by reference accident

## Variants, clone and fork
- CLONE creates a new independent Project identity with explicit provenance and resource-copy/reference decisions.
- FORK creates ancestry from a fork point and may share immutable/versioned backing resources until divergence.
- VARIANT is a scoped alternate line inside project coordination where useful.
- MERGE/RECONCILE is typed and domain-aware; there is no universal magical merge of memory, files, tasks and canon.

## Cross-system contracts
### File Fabric
Projects reference roots/resources; File Fabric owns bytes, versions, transactions and protected paths.

### Memory Fabric
Projects supply scope/policy identifiers; Memory owns events, atoms, retrieval and purge semantics.

### Context Fabric
Project Context Compiler outputs derived Context items with lineage and token budgets.

### Cognitive Runtime
Runs receive project/variant/work-item references and return evidence/result refs. Project does not schedule every agent step.

### Tool Security / Permissions
Project policy can restrict; effective authority is still permission-kernel intersection.

### Side-Effect Ledger
Remote project actions such as cloud sync/export/upload remain effects with dispatch/effect uncertainty.

### Recovery / Integrity
Project snapshot refs participate in recovery but Recovery owns corruption checking/reconciliation mechanisms.

### Workspace Hub / UX
Workspace Hub presents Project views. UI state is not canonical Project state.

### GitHub Project Memory (#48)
GitHub is one external/project-memory adapter. #22 must remain provider-neutral.

## Failure semantics
Explicit project conditions include:
- HEALTHY
- DEGRADED_REFERENCES
- PARTIAL_IMPORT
- RECOVERY_REQUIRED
- SCHEMA_MIGRATION_REQUIRED
- CONFLICTED
- EXTERNAL_RESOURCE_UNAVAILABLE
- TRUST_RESTRICTED

Missing linked resources are not silently replaced with stale summaries.

## Mobile/resource design
- project list loads tiny identity/summary metadata only
- project graph/indexes lazy-load on open
- large resource trees paginate/virtualize
- no full project memory/context load at startup
- project context compilation is incremental and budgeted
- cold resources/indexes unload under pressure
- background sync respects Resource Governor/battery/network policy
- optional embeddings/vector indexes never required to open a project
- archive removes project from hot caches

## UX translation
Default UI shows human-level objects: project, current goal, files/artifacts, recent work, status.
Advanced internals such as lineage, variants, trust, conflicts and evidence expand progressively.
User should always be able to answer:
1. What project am I in?
2. What is Seven working on?
3. What changed?
4. What is blocked/unverified?
5. What will happen if I archive/delete/export/fork?

## Candidate eval obligations
C0/C1:
- no cross-project permission or memory leakage
- no project import execution without authority
- no fake DONE from model self-report
- no destructive cascade by reference confusion
- recovery preserves authoritative ownership boundaries

Reliability:
- reload/resume after interrupted project mutations
- migration across schema versions
- partial/missing resource recovery
- variant ancestry integrity
- export/import round trip within supported schema

Performance/mobile:
- project-list startup independent of large project size
- opening a large project does not load all files/memories
- context compilation bounded and cancellable
- archive releases hot resources
- offline project open/edit for supported local operations

UX/accessibility:
- project/trust/conflict states understandable without implementation jargon
- RTL/Arabic long titles/paths
- large font/touch targets
- reduced motion

## Rejected / deferred complexity
- mandatory CRDT core: deferred; unjustified for single-user Seven 1.0 and unsafe as a universal semantic conflict solver.
- cloud as canonical Project owner: rejected; violates offline/mobile/provider independence.
- copying every linked object into Project storage: rejected; duplicates authority.
- storing one canonical project summary: rejected; summaries are derived.
- always-on agent/project daemon: rejected; violates resource law.
- universal merge algorithm across all resource types: rejected.
- collaborative roles/ACL engine inside #22: future integration; permissions remain owned by security/connection fabrics.

## V4 current result
Research + domain discovery + first-principles rebuild + alternative comparison + Builder/Failure/Simplifier + cross-system/mobile/UX reasoning produced material changes over the baseline.

Saturation counter: `0/2`.
Reason: this candidate is materially stronger, so V4 requires another attack rather than pretending the first strong design is final.

# Projects System — V4 Hyper-Polish Rounds 01–05

All rounds use `SEVEN_POLISHING_PROTOCOL_V4.md` and start from Projects 4.0.

## Round 01 — Authority, ownership and stale-write attack
Verdict: `MATERIAL_IMPROVEMENT_FOUND`

Failure found: ProjectResourceRef without ownership semantics makes archive/delete/export ambiguous and can accidentally imply the Project owns an object that merely happens to be linked.

Accepted changes:
- every resource edge declares `ResourceRelation`: OWNED, ATTACHED, SHARED, EXTERNAL_REFERENCE, DERIVED_OUTPUT, TEMPORARY.
- delete/archive/export policies operate on relation + owner fabric, never on graph reachability alone.
- Project writes use expected revision/precondition tokens; stale writers cannot silently overwrite a newer project head.
- introduce `ProjectMutationTransaction` as a contract (not canonical primitive): validate authority, expected project revision, referenced-resource versions and invariant checks before atomic project-event commit.
- long-running runs bind to `baseProjectRevision`. Returned proposals are revalidated against current Project head before project-level commit.

Reason: a resumed/stale agent must not overwrite newer human/project state.

## Round 02 — Long-running continuity attack
Verdict: `MATERIAL_IMPROVEMENT_FOUND`

Failure found: a generic derived re-entry capsule can become a de facto canonical summary if its inputs and omissions are not explicit.

Accepted changes:
- define `ProjectReentryManifest` as a derived object carrying source project revision, included WorkItem IDs, resource versions, decision/event references, memory retrieval manifest, unresolved gaps and compiler version.
- re-entry text is presentation only; the manifest is the reconstruction proof.
- explicit `ProjectDecision` remains representable as a typed ProjectWorkItem/ProjectEvent, not hidden in transcript summaries.
- continuity cannot persist private chain-of-thought; preserve user-visible decisions, evidence, goals, accepted constraints and verified outcomes instead.
- new session may consume re-entry view but can expand back to referenced sources when precision matters.

## Round 03 — Variant/branch collision attack
Verdict: `MATERIAL_IMPROVEMENT_FOUND`

Failure found: ProjectVariantRef could duplicate branch concepts already owned by Git/File/RPG/Canon systems.

Accepted changes:
- Project variants are coordination overlays, not universal content branches.
- `VariantBinding` points to domain-owned branch identities when they exist (Git branch/worktree, RPG branch, Canon continuity/what-if branch).
- Project stores ancestry and project-level overrides only.
- reconciliation delegates content merge to owner fabric and records the verified result reference.
- unsupported domain merge becomes `RECONCILIATION_REQUIRED`, never auto-merged by model prose.

## Round 04 — Offline/sync conflict attack
Verdict: `MATERIAL_IMPROVEMENT_FOUND`

Failure found: saying local-first is insufficient if local state, remote mirrors and pending external effects can be confused.

Accepted changes:
- authoritative Project core is local durable state for single-device Seven 1.0.
- optional remote replicas/connectors have explicit replica identity and synchronization watermark.
- outgoing remote mutation is an Effect Ledger operation with idempotency and dispatch certainty.
- incoming changes are staged and reconciled under project/domain policy before authoritative local commit.
- universal last-write-wins is forbidden for C0/C1 state.
- generic CRDT convergence is allowed only for data types whose semantic ownership/conflict rules prove it safe.
- offline state exposes pending/unresolved synchronization honestly.

## Round 05 — Scale, lifecycle and simplification attack
Verdict: `MATERIAL_IMPROVEMENT_FOUND`

Failure found: large Projects can become a startup/context tax, and too many new project primitives duplicate existing fabrics.

Accepted changes:
- keep eight canonical backbone primitives; new concepts above are contracts/views/edge fields, not new top-level authoritative stores.
- project list uses compact `ProjectIndexEntry` derived cache; full graphs lazy-load.
- graph adjacency, search, summaries and embeddings are rebuildable indexes.
- Hot/Recent/Cold resource-set tiers guide loading, not authority.
- `ProjectWorkingSet` is derived from active goals, recent interactions and explicit pins; it is bounded and cancellable.
- archive drops hot indexes/caches but preserves canonical state.
- project opening must not enumerate/load all file bodies, memory events, transcripts or vector indexes.
- background sync/indexing is Resource-Governor scheduled and must yield to interactive work.

## Round summary
Rounds 01–05 all produced material improvements, so saturation counter remains `0/2` by V4 law.

The candidate should advance from Project Fabric 4.0 to 4.1 before any independent NO-MATERIAL review is valid.

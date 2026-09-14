# Seven Project Fabric 4.3 — Local-First Durable Work Graph

Status: CURRENT V4 CANDIDATE — REVIEW-ELIGIBILITY CHECK PENDING
Capability: #22 Projects System

This candidate inherits Project Fabric 4.2 and integrates Rounds 10–14.

## Canonical backbone
The top-level set remains intentionally small:
1. ProjectIdentity
2. ProjectManifest
3. ProjectEvent
4. ProjectResourceRef
5. ProjectWorkItem
6. ProjectPolicySet
7. ProjectSnapshotRef
8. ProjectVariantRef

No new top-level persistent store was justified.

## Durable persistence and process-death contract
Project coordination state must live in durable local persistence. UI saved state stores only small reconstruction handles, never canonical Project data.

ProjectMutationTransaction maps project-owned mutations to an atomic local persistence boundary where the selected storage supports it.
Operations spanning several owner fabrics are coordinated in stages and are not described as universally atomic when the underlying stores cannot guarantee that property.

## Restart-safe import and migration
Imports use staging plus explicit commit classification. After restart, an interrupted import is classified as NOT_COMMITTED, COMMITTED or RECOVERY_REQUIRED.

Project schema migrations are versioned, restart-safe and testable from historical snapshots. Destructive fallback migration for user Project state is not allowed unless a separate explicit data-loss/recovery policy permits it.

## Scalable event and graph loading
Project open does not replay complete history from genesis on every launch.
A verified materialized Project projection may serve normal reads while recording its source event head, project revision, schema/compiler identity and integrity data.

If invalid, Seven rebuilds from the last valid checkpoint plus event segments.
Event history, WorkItem indexes and resource-graph indexes are paged/segmented and rebuildable.

## Export finalization
Export stays staged/incomplete until package inventory and integrity checks succeed.
A partial package is not a valid Seven Project export.
Interrupted export becomes ABANDONED_PARTIAL, RESUMABLE when supported, or RESTART_REQUIRED.
The UI cannot claim export success before final verification.

## Project directives
ProjectDirective is a typed record inside ProjectManifest or ProjectPolicySet, not a new top-level primitive.
Classes include USER_INSTRUCTION, PROJECT_CONVENTION, OUTPUT_PREFERENCE, WORKFLOW_CONSTRAINT and TOOL_PREFERENCE.

Directives carry origin, project revision, scope, enabled state and optional applicability selectors.
Model-generated suggestions remain PROPOSED until accepted through the normal project policy path.
Conflicting directives become DIRECTIVE_CONFLICT and use deterministic origin/scope precedence instead of last-message wins.

## Concurrent local sessions
Expected project revision plus ProjectMutationTransaction is the concurrency boundary for project-owned state.
Stale sessions/runs must revalidate rather than overwrite newer Project state.
Shared resources remain governed by their owner fabric and relation semantics, so one Project cannot decide global deletion merely because it no longer references an object.

## Consolidated invariants
1. Project identity is not path/chat/provider identity.
2. Project owns coordination, not duplicated payload.
3. reference is not ownership.
4. reference is not current access.
5. cached data is not a current action grant.
6. summary/re-entry view is not Project truth.
7. model suggestion is not a durable directive.
8. project directive cannot bypass global Seven invariants.
9. same title/path/ID text is not verified imported identity.
10. stale proposal is not a current commit.
11. variant overlay is not domain branch ownership.
12. local Project core is not a cloud dependency.
13. remote dispatch is not verified synchronization completion.
14. Project reachability is not global orphan proof.
15. partial export is not successful export.
16. in-memory/UI state is not durable Project state.
17. cross-store coordination is not a fake universal transaction.
18. opening a Project does not require full-history/full-resource loading.

## V4 status
Rounds 01–13 produced material improvements. Round 14 found no new material improvement on the targeted cross-project/concurrency attack; it does not count toward the final 2/2.

Next step: V4 eligibility audit, then two independent saturation reviews if all architecture-stage gates are adequately covered.

# Projects System — V4 Rounds 11–12

Starting candidate: Seven Project Fabric 4.2 + Round 10 crash/migration contract.

## Round 11 — Very-large project / event-replay attack
Verdict: MATERIAL_IMPROVEMENT_FOUND

Failure found: an append-only ProjectEvent history can become a performance trap if opening a project requires replay from genesis or hydrating the full graph.

Accepted changes:
- authoritative history may remain append-only, but normal open uses a verified materialized project projection/snapshot plus bounded tail events.
- materialized project state is derived and carries source event-head/revision plus schema/compiler version and integrity hash.
- if projection verification fails, Seven can rebuild from the last valid checkpoint plus event segments.
- event history may be segmented/archived for storage and paging; segmentation never changes event meaning/order.
- WorkItem/resource graph adjacency indexes are rebuildable and paged.
- ProjectWorkingSet selection operates on bounded metadata/indexes before expensive owner-resource fetches.
- no UI surface is allowed to force all project events/resources into RAM merely to show counts/navigation.

Result: long-lived Projects remain durable without turning persistence correctness into startup latency.

## Round 12 — Interrupted export / package-finalization attack
Verdict: MATERIAL_IMPROVEMENT_FOUND

Failure found: a crash or low-storage condition during export can leave a partial archive that looks complete to the user or later importer.

Accepted changes:
- export uses an `ExportStagingManifest` derived/staging contract with expected resource inventory and package schema.
- archive/package output is written as incomplete/staged until all required entries/hashes are finalized.
- completion is represented only after manifest integrity verification and finalization by the responsible File/Document layer.
- partial output is never marked as a valid Seven Project export.
- restart can classify interrupted export as ABANDONED_PARTIAL, RESUMABLE where technically supported, or RESTART_REQUIRED.
- export completion is evidence-bound; UI success cannot precede package verification.
- insufficient storage, unavailable linked resources and revoked access produce explicit partial/failure reports rather than silently omitting required data.

## Round result
Both rounds found material improvements. The current reconciliation target advances again; saturation remains 0/2.

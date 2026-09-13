# Projects System — V4 Round 10: Crash, Process-Death and Migration Integrity

Starting candidate: Seven Project Fabric 4.2.
Verdict: MATERIAL_IMPROVEMENT_FOUND

## Evidence-triggered attack
Android may kill the app process, and transient UI state is not a substitute for durable application data. SQLite provides transactional atomicity/crash-recovery properties when used correctly. Therefore Project Fabric must define a persistence contract that does not rely on in-memory state or oversized saved-state bundles.

## Accepted changes
- authoritative Project coordination data must persist in durable local storage; ViewModel/UI saved state may only retain small reconstruction handles such as projectId, selected tab or navigation position.
- `ProjectMutationTransaction` is required to map to an atomic persistence boundary for project-owned state.
- any operation spanning owner fabrics is not falsely treated as one universal database transaction. Use staged coordination: prepare/validate owner operations, commit project-owned transaction, then reconcile owner/effect outcomes with explicit uncertainty where full atomicity across systems is unavailable.
- interrupted import uses a staged import record and commit marker. On restart Seven must be able to classify it as NOT_COMMITTED, COMMITTED or RECOVERY_REQUIRED rather than guessing.
- migrations are versioned and restart-safe. Each migration records fromVersion/toVersion, compatibility rules and verification result.
- destructive fallback migrations are forbidden for user Project state unless the user explicitly authorizes data loss under a separately defined recovery policy.
- migration tests must include snapshots from supported historical versions and crash/restart injection around migration boundaries.
- Project snapshot/recovery references must not assume multi-database atomicity if implementation places authoritative pieces in separate stores.

## Why material
Without this contract a process death during project mutation/import/migration can leave coordination state inconsistent with linked resources, or a developer may incorrectly assume a cross-store atomic commit that the storage layer does not provide.

## Research basis
- Android guidance distinguishes transient saved UI state from persistent local storage needed across process death.
- SQLite documents transaction atomicity and crash recovery, while cross-database atomicity depends on journal configuration and cannot be assumed universally.

Saturation counter remains 0/2.

# Seven Tool Fabric 2.0 — Wave 14 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: Recovery, schema/data migration, backup, import/export and corruption handling.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 14

Goal: make Seven's authoritative state durable across app upgrades, schema changes, interrupted writes, corrupt/partial imports and user-driven backup/restore without leaking secrets or confusing derived caches with canonical data.

Research SQLite/Android/platform primitives first. Reuse Wave 02 SAF/CredentialVault, Wave 04 integrity/archive rules, Wave 08 verification and Wave 13 process-exit evidence.

Research at minimum:
- SQLite schema versioning/migrations
- transactional migrations and rollback
- migration journals/checkpoints
- integrity checking and corruption detection
- SQLite online backup / consistent snapshots
- export archive structure and manifest
- raw/canonical hashes
- partial/corrupt archive recovery
- import staging and validation before canonical commit
- duplicate/conflict handling
- version compatibility and forward/backward rules
- app/APK upgrade migration
- secrets/credential exclusion
- derived-index rebuild instead of blind backup
- safe backup/restore through Android Storage Access Framework
- optional Android backup behavior and exclusions
- recovery after interrupted migration/import
- old-version preservation / rollback compatibility
- optional sync implications without weakening authority

Rules:
- never mutate the only authoritative copy before a verified checkpoint exists when migration risk is material.
- imports are untrusted input until archive/path/hash/schema validation completes.
- secrets never enter normal export archives.
- caches, embeddings and other reconstructable derived indexes should normally be rebuilt rather than treated as canonical backup data.
- migration must be monotonic and explicitly versioned; no heuristic schema guessing.
- an interrupted import/migration becomes RECOVERY_REQUIRED, not success/failure guessed from UI state.
- no destructive downgrade unless an explicit compatible reverse migration exists.
- preserve lineage/source ids where importing authoritative objects.

Output:
1. canonical Seven export package specification
2. migration state machine
3. backup/snapshot strategy
4. import staging/commit algorithm
5. corruption/integrity strategy
6. secrets/derived-data rules
7. Android file/backup posture
8. compatibility/conflict rules
9. rejected approaches
10. Deep Polish queue and eval gates

Preserve findings in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.

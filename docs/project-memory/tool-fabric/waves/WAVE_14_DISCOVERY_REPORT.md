# Seven Tool Fabric 2.0 — Wave 14 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 14. No production migration/export implementation is frozen.
Governing command: `WAVE_14_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven needs a **Recovery & Portability Plane** built around staged, verifiable state transitions rather than ad-hoc file copying.

The strongest architecture is:

1. `SchemaRegistry` — explicit application/data schema versions.
2. `MigrationRegistry` — ordered version-to-version transformations with preconditions and verification.
3. `SnapshotManager` — consistent checkpoint before risky migration/import.
4. `MigrationJournal` — durable phase/evidence record so interruption is recoverable.
5. `IntegrityVerifier` — SQLite, manifest, hash and semantic checks.
6. `ExportPackager` — Seven-owned portable archive specification.
7. `ImportStager` — validates/migrates untrusted imports outside canonical state.
8. `ConflictPlanner` — explicit replace/merge/selective-import decisions.
9. `RecoveryCoordinator` — resumes/rolls back after crash, update or interrupted import.

No export/import path may bypass Seven's authority, lineage or secret-handling rules.

## Platform / candidate registry

| Primitive | Kind | Class | Seven role |
|---|---|---|---|
| SQLite `PRAGMA user_version` | DB metadata | CORE | application-owned schema version marker |
| SQLite transactions | DB primitive | CORE | atomic migration/data transitions |
| SQLite `quick_check` | DB verifier | CORE FAST CHECK | routine/fast structural check |
| SQLite `integrity_check` + `foreign_key_check` | DB verifier | CORE DEEP CHECK | deep integrity verification |
| SQLite Online Backup API | snapshot primitive | CORE CANDIDATE | consistent live DB snapshot |
| SQLite `VACUUM INTO` | snapshot/export primitive | SPECIALIST | compact copy where binding/runtime permits |
| Android Storage Access Framework | platform UI/permission | CORE PLATFORM | user-selected export/import destination/source |
| Android Auto Backup / data-extraction rules | platform backup | OPTIONAL PLATFORM | explicitly scoped settings/state backup only |
| zip.js bounded archive handling | archive library | SPECIALIST | Seven export package container; Wave 04 rules apply |
| RFC 8785 JCS + SHA-256 | integrity pattern | CORE | deterministic manifest hashing/signing input |
| Android Keystore/CredentialVault | security primitive | CORE EXCLUSION BOUNDARY | secrets stay outside normal export package |

## SQLite findings

### Schema version

SQLite provides `PRAGMA user_version`, an application-owned integer stored in the database header. SQLite does not interpret it.

Seven decision:
- use an explicit Seven schema version in authoritative metadata
- `user_version` may mirror the DB schema generation but does not replace a richer migration journal/export format version
- never inspect arbitrary tables and guess what schema version they represent

Source:
- https://sqlite.org/pragma.html#pragma_user_version

### Integrity

`PRAGMA quick_check` performs a faster structural check. `PRAGMA integrity_check` performs deeper low-level consistency checks, including malformed/missing pages and index/constraint issues; foreign-key errors require `foreign_key_check` separately.

Seven tiers:
- `FAST`: quick check + migration metadata checks
- `DEEP`: integrity check + foreign-key check + Seven semantic invariants

DB-level integrity does not prove Seven semantic validity. A structurally valid database may still contain impossible authority/lineage relationships.

Source:
- https://sqlite.org/pragma.html#pragma_integrity_check

### Consistent snapshots

SQLite's Online Backup API copies a live database into a destination snapshot while avoiding a long continuous source lock. A completed backup represents a source snapshot. SQLite also documents `VACUUM INTO` as another method for creating a live copy.

Seven decision:
- prefer a SQLite-supported snapshot mechanism exposed by the chosen Android/Wasm/native binding
- do not byte-copy a live DB file blindly
- verify the resulting snapshot before calling it a checkpoint

Source:
- https://sqlite.org/backup.html

## Migration state machine

Canonical migration flow:

`IDLE → PRECHECK → SNAPSHOTTING → SNAPSHOT_VERIFIED → MIGRATING → MIGRATION_VERIFY → COMMIT_METADATA → COMPLETE`

Failure/interruption paths:

`PRECHECK_FAILED`

`SNAPSHOT_FAILED`

`MIGRATION_FAILED → ROLLBACK_FROM_SNAPSHOT`

`PROCESS_DIED/UNKNOWN_PHASE → RECOVERY_REQUIRED`

Every migration journal records:
- migration run id
- app/build id
- source schema version
- target schema version
- ordered migration ids/hashes
- phase
- source snapshot id/hash
- start/update timestamps
- verification evidence
- failure/error class
- rollback/recovery result

On startup, Seven checks for a non-terminal journal before opening state as normal.

## Migration rules

Each migration is explicit, for example:

`MIGRATION_17_TO_18`

with:
- source version precondition
- target version
- migration implementation hash/version
- operations
- data transforms
- postconditions
- rollback posture
- verification queries

Rules:
- migrations execute in a DB transaction where technically possible
- operations requiring external files use a staged two-phase plan rather than pretending a DB transaction covers filesystem effects
- schema upgrade is monotonic by default
- downgrade is unsupported unless an explicit reverse migration exists and passes verification
- skipped versions use the ordered chain, not a giant heuristic migration

## SnapshotManager

A checkpoint record contains:
- snapshot id
- source DB schema version
- application version/build
- created time
- DB content hash after snapshot completion
- integrity-check result
- size
- relation to migration/import run

Retention:
- keep at least the pre-migration/import checkpoint until the new state has survived verification
- old snapshots can be pruned under a bounded policy after verified success
- pruning is a separate side effect and must not delete the only known-good checkpoint

## Seven Export Package v1

Proposed container name:

`seven-export-v1.zip`

The container is convenience, not authority. Every entry is governed by the manifest and hashes.

### Root layout

- `manifest.json`
- `data/authoritative.sqlite` or a normalized authoritative data representation chosen at implementation freeze
- `data/settings.json`
- `data/projects/...`
- `data/attachments/...` only when explicitly selected/portable
- `meta/source-map.json` where needed
- optional human-readable `README.txt`

Default omissions:
- API keys/tokens
- CredentialVault secrets
- Android Keystore material
- ephemeral run locks
- reconstructable caches
- embeddings/vector indexes
- search caches
- temporary downloads
- model weights
- telemetry buffers
- derived UI caches

Model packs may be exported only through a separate explicitly designed mechanism because of size/license/integrity considerations.

### Manifest fields

- `format`: `seven-export`
- `formatVersion`
- `createdAt`
- exporting app/build version
- authoritative schema version
- minimum importer version if required
- export scope/options
- stable export id
- root/source lineage metadata
- list of entries with path, media/type, logical role, byte size, raw SHA-256
- optional canonical JSON hash for structured entries
- omitted-category declarations
- required vs optional entries

The manifest itself receives a deterministic canonical hash using Wave 04 integrity rules.

## Export algorithm

1. Acquire/export task contract.
2. Resolve user-selected destination through SAF.
3. Create consistent authoritative snapshot in app-private staging.
4. Run required integrity checks.
5. Serialize selected non-DB authoritative objects/settings.
6. Compute entry hashes/sizes.
7. Build manifest last from observed staged artifacts.
8. Create bounded ZIP package.
9. Re-open staged package and verify manifest/entry hashes.
10. Copy/write package to user-selected SAF destination.
11. Where provider semantics allow, reopen/read hash to verify final destination; otherwise record destination verification limit explicitly.
12. Record export result/evidence.
13. Remove staging files after success/failure cleanup policy.

A successful ZIP write call alone is not sufficient proof of a valid export.

## Import is an untrusted-data pipeline

Never import directly into canonical tables.

Pipeline:

`SELECT → ARCHIVE_INSPECT → MANIFEST_PARSE → PATH_SAFETY → HASH_VERIFY → FORMAT_COMPATIBILITY → STAGE → DB/SCHEMA_VERIFY → MIGRATE_STAGED_COPY → SEMANTIC_VERIFY → CONFLICT_PLAN → USER/POLICY APPROVAL → CHECKPOINT_CURRENT_STATE → COMMIT → VERIFY_CANONICAL → COMPLETE`

Any failure before canonical commit destroys only staging data, not current Seven state.

Wave 04 archive-bomb/path-traversal limits apply before extraction.

## Import modes

### REPLACE

Replace selected canonical scope after a current-state checkpoint and full staged verification.

Use for full-device restoration where package lineage is understood.

### MERGE

Merge stable-id objects under Seven-specific conflict policy.

Never merge by text similarity alone.

Authority rules:
- identical stable id + identical hash: dedupe
- identical stable id + divergent authoritative versions: conflict, not silent overwrite
- new object with valid lineage: import
- derived object whose source is missing: either reject or import as non-authoritative/rebuildable depending type

### SELECTIVE

User selects rooms/projects/settings/etc. The importer expands dependencies and warns about required related objects rather than producing dangling authority references.

## Derived data rebuild law

The following normally rebuild from authoritative source after import/migration:
- FTS indexes
- vector indexes/embeddings
- entity/semantic derived views
- cached summaries where reconstructable
- provider capability cache
- research/web caches
- context caches

Every rebuilt object gets a new derived-generation record and lineage. Importing an old vector index must not make it canonical simply because it existed in the archive.

## Corruption strategy

### Detect
- failed SQLite open
- quick/integrity check failures
- foreign-key failures
- manifest/hash mismatch
- semantic-invariant failures
- incomplete migration journal

### Respond
- stop canonical writes to suspect state where necessary
- preserve suspect artifact for diagnosis if storage budget permits
- attempt verified last-good snapshot recovery
- rebuild derived indexes
- if no verified recovery source exists, expose RECOVERY_REQUIRED and bounded salvage/import options rather than silently resetting everything

Host/debug-only SQLite recovery tools may assist diagnostics, but salvaged rows are untrusted until Seven semantic validation passes.

## Android posture

### SAF

Use system-mediated:
- `ACTION_CREATE_DOCUMENT` for export
- `ACTION_OPEN_DOCUMENT` for import
- `ACTION_OPEN_DOCUMENT_TREE` only when a durable user-selected workspace/tree is needed

Do not request broad storage access simply for backup/export.

Source:
- https://developer.android.com/training/data-storage/shared/documents-files

### Auto Backup

Android Auto Backup can include large parts of app-private data by default and allows explicit include/exclude rules; Android recommends excluding particularly sensitive data or requiring strong backup encryption capabilities where appropriate.

Seven decision:
- configure backup deliberately rather than inherit defaults blindly
- keep credentials/secrets and keystore-bound sensitive artifacts excluded unless a separately reviewed restore design exists
- prefer user-controlled Seven Export as the portable canonical backup story
- Auto Backup may cover low-risk preferences/state only after restore behavior is tested

Sources:
- https://developer.android.com/identity/data/autobackup
- https://developer.android.com/privacy-and-security/risks/backup-best-practices

## Credential recovery

CredentialVault entries are not ordinary project state.

After restore/import:
- connection metadata may be restored without secret material
- secret references whose key/token is absent become `REAUTH_REQUIRED`
- never place API tokens in export to make restore feel seamless
- provider sessions must pass Wave 07 connection validation before use

## Process-crash recovery integration

Wave 13 `ApplicationExitInfo` + durable journals allow:
- detect prior process death
- inspect migration/import journal
- determine last durable phase
- verify current DB/snapshot
- resume only idempotent stages
- roll back where safe
- otherwise require recovery path

No UI success state survives a contradictory durable journal.

## Compatibility policy

Importer evaluates separately:
- export format version
- DB/data schema version
- object feature versions
- minimum importer version

Rules:
- older known versions migrate in staging
- newer unknown mandatory format/schema is rejected safely
- unknown optional package entries can be ignored only if manifest marks them optional and core invariants still validate
- never partially interpret a future authoritative schema by guessing field meaning

## Optional sync decision

Generic cloud sync is **not** admitted as part of Wave 14 core.

Reason:
- synchronization introduces distributed conflict/authority semantics beyond backup/import
- CRDT merge does not automatically preserve Seven authority laws

If future sync is added, it must operate on authoritative event/object identities with explicit conflict policy and cannot bypass the same migration/integrity/lineage checks.

## Rejected approaches

- raw live SQLite file copy: rejected
- migration without pre-risk checkpoint: rejected for material changes
- backup entire app directory by default: rejected
- export secrets/tokens: rejected
- restore encrypted secret blobs and assume the device key exists: rejected
- import directly into canonical DB: rejected
- merge duplicates by fuzzy text similarity: rejected
- include reconstructable indexes as authority: rejected
- destructive downgrade by schema guessing: rejected
- silently reset corrupted state to empty: rejected
- declare export success before package verification: rejected
- generic CRDT/cloud sync as automatic backup solution: rejected

## Canonical Seven capabilities proposed

- `state.snapshot.create`
- `state.snapshot.verify`
- `state.migration.plan`
- `state.migration.execute`
- `state.migration.recover`
- `state.integrity.fast_check`
- `state.integrity.deep_check`
- `export.plan`
- `export.create`
- `export.verify`
- `import.inspect`
- `import.stage`
- `import.conflicts.plan`
- `import.commit`
- `import.recover`

## Required Evals

Before Freeze:
- process kill during every migration phase
- process kill during every import phase
- corrupt ZIP central directory/entry/path/hash
- archive bomb limits
- corrupt SQLite page/index/foreign key
- export from old schema then import into current
- import newer unsupported mandatory format
- merge stable-id conflict
- missing optional attachment
- missing required authoritative object
- missing credential after restore becomes REAUTH_REQUIRED
- derived indexes rebuild and never gain authority
- failed migration returns to verified previous state
- destination write failure does not damage current state
- repeated import/recovery is idempotent where designed

## Deep Polish queue

`SchemaRegistry → MigrationJournal → SnapshotManager → SQLite integrity/snapshot adapter → Export Package v1 → ImportStager → ConflictPlanner → RecoveryCoordinator → SAF integration → Auto Backup rules → migration/import kill-point eval harness`

## Coverage statement

Wave 14 closes the major discovery gap around persistence recovery, migrations and import/export. The exact SQLite binding/export representation must be chosen after Seven's production persistence layer is finalized, but the authority-safe protocol is now provider/storage independent.

No production integration occurred. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.

# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: READY

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP

SOURCE_ANALYSIS
Harvested sources: Android SAF docs (shared storage, document selection without system permissions) [SOURCE primary: developer.android.com/training/data-storage/shared/documents-files] and MDN IndexedDB API (client-side structured storage incl. files/blobs, high-performance searches) [SOURCE primary: developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API]. Together they establish the two storage primitives remake relies on: SAF for document portability across apps/providers, and IndexedDB for structured persistence. Limitations: neither source addresses backup schemas, migration guards, export file formats, or credential exclusion — those are product-level concerns not covered by platform docs. No disagreements.

CURRENT
Remake's StorageEngine contract (ARCHITECTURE.md section 5) explicitly lists export/import as a supported capability and defines a migration protocol (read old → validate → write new temp → verify → commit → delete old; failed migration must leave previous version recoverable). However, inspecting remake/src there is NO dedicated import/export/backup module — the grep for import|export|backup|portable returned only incidental mentions in existing services (chat-service, research-service, github-self-dev). No backup scheduler, no export blob schema with `schemaVersion`, no credential-exclusion enforcement, no restore-from-file UI, and no cross-domain (rooms+memory+research+rpg+canon) export/import orchestration exists in remake.
- Each repository (room, attachment, research, memory, context-policy, rpg) is independently IndexedDB-backed with its own database name and version; there is no single atomic export transaction across domains.
- Research service: cache by query, source failure tracking, no cross-domain export [research-service.ts, research-repository.ts].
- Legacy `seven_ai-final.html` candidate (separate, not remake truth) claims T154 canonical backup/import v2 including rooms/memory/execution runs excluding credentials, validated before mutation — but this is the single-file legacy candidate, not the Remake architecture [DEVELOPMENT_REPORT.md].
- IndexedDB is the remake persistence mechanism (matching MDN source), used by all remake repositories [room-repository.ts, attachment-repository.ts, research-repository.ts].

TARGET
A coherent import/export/backup domain: a single export action produces a versioned, schema-validated bundle (rooms, messages, attachments metadata/extracted text, memory, settings, research citations) excluding all credentials/secrets; import validates schema + version before mutation, is atomic per the migration protocol, cancels nonterminal runs as historical records, waits for durable persistence acknowledgement, and can roll back to the pre-import state on failure. Android SAF used to pick the export/import file (content:// URI), never blanket device storage permissions.

NOW
First slice: create `remake/src/application/import-export/` with an `ImportExportService` that (a) serializes all registered repositories into one JSON bundle with `schemaVersion`, `exportedAt`, and content hashes per domain; (b) excludes any field matching secret/credential patterns; (c) import validates bundle schema/version, writes to a temp IndexedDB transaction, verifies, then commits — rolling back on any failure; (d) is task-cancellable via TaskManager. Wire SAF `files.saveFile`/`files.openFile` bridge methods for Android file selection. Add deterministic unit tests (fake-indexeddb) for valid export, malformed bundle rejection, version-mismatch rejection, credential exclusion, and import failure rollback. This needs no Android device work and no new dependencies.

NEXT
- Scheduled/local backup (auto-snapshot on room change, bounded rotation) and restore UI.
- SAF-backed export/import file picker on Android (content:// URI, persisted grant, release after use).
- Attachment original bytes inclusion/exclusion option in export (bytes can be large; 10MB × 128/room).
- Cross-tab/storage-instance CAS for import to prevent lost updates (pattern from memory-repository).
- Encrypted backup option (client-side key, never stored with the bundle).

LATER
- Cloud sync / third-party backup providers, data portability to open formats (e.g., markdown + JSON), GDPR-style full-data export including research citations and provenance.

TESTS
- Unit (deterministic, fake-indexeddb): export includes all domains + schemaVersion + hashes; export excludes credentials; import accepts valid v1 bundle; import rejects malformed JSON; import rejects unknown/unsupported schemaVersion; import failure leaves previous state intact (rollback); import is cancellable and nonterminal runs become historical records; import waits for durable persistence acknowledgement.
- Contract: bundle schema validation (zod or hand-rolled), per-domain hash verification.
- Android: SAF file picker for export/import → persist grant → write/read → release grant; verify `content://` only; API 34 + 36.
- Adversarial: bundle with embedded secret field → excluded; truncated/corrupted bundle → rejected, no partial import; import with aborted signal → no durable mutation; export while a send task is active → no corruption of in-flight room.
- Eval: import/export round-trip preserves room IDs, message ordering, attachment contentHashes, and research citation contentHashes (per research citation schema).

RISKS
- Security/privacy: accidentally exporting credentials/tokens — mitigated by explicit field exclusion + schema allowlist, but unproven without a secret-scanning test. Import of a maliciously crafted bundle could overwrite rooms — schema+version validation + atomic rollback is the defense.
- Android: SAF file picker requires user interaction each time (no silent background file access) — correct by design but means scheduled backup can't silently write. Persisted grant release after import/export to avoid dangling URI permissions (B02-001 pattern).
- Performance: bundling 128 attachments/room × 10MB could exceed memory; export should stream or bound attachment bytes. IndexedDB quota on large bundles.
- Cross-system: import must not corrupt an in-flight chat send task — coordinate via TaskManager ownerId/roomId locks.

FIRST_SLICE
Smallest materially-improving change: `ImportExportService` with versioned schema-validated export/import, credential exclusion, atomic rollback, TaskManager cancellation, plus SAF `files.saveFile`/`files.openFile` bridge stubs and contract tests — no device, no new deps.

KNOWN_UNKNOWNS
- No evidence of any import/export code in remake at all (this would be net-new).
- No evidence of a secret/credential field allowlist/denylist pattern in remake to reuse.
- Whether `schemaVersion` exists for the room/attachment/research domains individually (records have schemaVersion but no cross-domain bundle version).
- Installed-device export/import evidence: none.

DOMAIN_VERDICT=READY_FOR_PLAN

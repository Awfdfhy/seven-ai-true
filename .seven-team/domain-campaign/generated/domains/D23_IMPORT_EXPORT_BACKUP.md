# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: READY

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
SOURCE_ANALYSIS=Harvested sources align:
- [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files — SAF for user-directed export/import (save to chosen location, open from chosen location) without broad permissions; critical for "data portability".
- [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API — client-side structured storage (large data), indexes; relevant to export/import/backup of app data (rooms, memory, settings, provider health, research cache, RPG/canon, GitHub metadata) and integrity.
- Platform docs consistent.

Freshness: current. Limitations: no explicit "backup" format spec for Seven; harvested evidence is general (SAF + IndexedDB). Need to inspect Seven's StorageEngine contract, migration protocol, export/import surface, and any existing backup/restore code.

CURRENT=Seven has storage foundations:
- ARCHITECTURE.md §5 Persistence: StorageEngine contract (transaction, get/put/delete, atomic migration, integrity metadata, export/import). Persistent domains listed (rooms, memory, settings, provider health, research cache, RPG/canon, GitHub connection metadata — never plaintext secrets). Migration protocol: read old→validate→write new temp→verify→commit→delete old (failed migration leaves previous recoverable). Recovery: boot never leaves doc globally inert; storage failure transitions to interactive recovery screen.
- Phase 9 (RPG/Canon) shows strong durability/integrity: CAS (concurrent repo writes), checksum verification detects durable corruption before trusting state, persists/verifies canonical snapshot across IndexedDB restart. Tests confirm these behaviors.
- Phase 12 tests include edge cases (e.g. version boundary) — signals robustness focus.
- Android: SAF grants lifecycle-managed (relevant for user-chosen export/import destinations).

Evidence inspected: remake/ARCHITECTURE.md §5, remake/src/integration/phase9/phase9.test.ts (checksum/CAS/snapshot), remake/src/integration/phase12/zero-bug-pass.test.ts, Android SAF contracts/service as above.

No obvious "export/import UI/CLI/API" implementation files found by grep yet (search for export/import/backup in src gave limited hits in vitest json context, not implementation). Need to locate StorageEngine implementation and any export/import methods.

TARGET=Desired behavior (evidence-aligned):
- Data portability via SAF on Android: export to user-chosen location (content:// target via ACTION_CREATE_DOCUMENT/SAF write grant), import from user-chosen location (ACTION_OPEN_DOCUMENT/SAF read grant). Respects lifecycle, cancellation, typed errors.
- Export format: deterministic, versioned (schemaVersion), includes integrity metadata (checksum/hash of exported payload), human-inspectable where practical (JSON) but safe (no secrets). Covers domains per contract.
- Import: validates schema/version, checksum/integrity, atomic application with transaction boundary, migration-safe handling. Rejects corrupted/stale payloads with typed errors; never silently overwrites without validation.
- Backup/restore semantics: "backup" = export snapshot; "restore" = import validated snapshot. Recovery path integrates with StorageEngine migration/recovery (boot recovery screen). 
- IndexedDB considerations: large exports may be slow; use streaming/iterative export, cancellation (TaskManager), progress feedback, memory caps. MDN IndexedDB guidance supports structured data; export/import must not block UI indefinitely.
- Security: no plaintext secrets in export; GitHub metadata exported only as safe metadata per contract; validate SAF URIs (content://) and handle revoked grants.

NOW=First high-value slice:
1. Locate StorageEngine implementation and any export/import methods (class/interface impl). Verify methods exist and signatures match contract (export/import mentioned). Read implementation.
2. Identify export/import format versioning and integrity (checksum/contentHash). Compare to Research citation contentHash model (good practice). Ensure atomicity on import.
3. Verify SAF integration points for export/import (Android platform service methods to request create/open document and write/read bytes). If missing, define minimal contract.
4. Add deterministic tests: export produces versioned JSON with checksum; import validates checksum/schema; corrupted import rejected; import with stale version handled per migration protocol; cancellation during export/import.

NEXT=Next improvements:
- Cross-platform export/import: web (download blob, file input) and Android (SAF) paths unified behind abstraction.
- Incremental/partial export? maybe not necessary; full snapshot with integrity is clean.
- Backup scheduling/retention policy (user-initiated per portability requirement; avoid automatic silent backups unless explicit).
- Integration with D10: export/import of attachment metadata and any stored attachment blobs with safe references; handle SAF grants for attachments.

LATER=Longer-term ideas:
- Encrypted export option (user passphrase) for sensitive data; but requires careful key management and not specified. Defer unless required.
- Differential backups, verification of restored state (round-trip) in tests.
- MASVS mapping for data portability (secure transmission/storage of exported data).

TESTS=Deterministic, E2E, Android:
- Unit: export/import round-trip preserves domains; checksum mismatch rejected; schemaVersion validation; unknown fields handled safely.
- Integration: Phase 9 style integrity tests extended to export/import path; migration protocol still holds.
- Android: SAF create/open document flow with mock bridge; grant lifecycle; cancellation.
- Adversarial: tampered export (modified checksum, injected secrets attempt), oversized export, partial/corrupted bytes, import during transaction conflict.
- E2E: user-initiated export/import with proper error messages, no data loss on failure.

RISKS=Security/privacy/performance/Android:
- Security: exported data is sensitive (rooms, memory, research cache). If written to external storage via SAF, user controls destination but data persists there; app must not force insecure locations. Validate imports strictly.
- Privacy: never include secrets/tokens; GitHub connection metadata per contract ("never plaintext secrets") — must be enforced in export.
- Performance: IndexedDB export of large datasets can be memory-heavy; iterate with cursors, avoid loading entire DB into single large string in one go; support cancellation.
- Android: SAF grants for write/read can be revoked; handle errors gracefully; scoped storage.
- Cross-system: blob vs string for large binary attachments (if exported) — format must handle.

FIRST_SLICE=Smallest implementation that materially improves domain:
- Locate StorageEngine impl + export/import. Read signatures and behavior. Confirm integrity metadata (checksum) present or planned.
- Verify export covers required domains and excludes secrets. Add unit test for round-trip.
- Ensure import is atomic (transaction) and rejects corrupt/stale payloads with typed errors. Align with migration/recovery protocol.

KNOWN_UNKNOWNS=Missing evidence:
- StorageEngine implementation file(s) (export/import methods). Not obvious from grep hits shown.
- Export/import format schema (version, checksum algorithm, field list, whether attachments blobs included).
- Existence of any backup/restore UI or API surface. 
- How secrets are filtered in export (GitHub metadata).
- Cross-platform abstraction for file writing (SAF vs download). 
- Size limits/progress for large exports.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need StorageEngine export/import implementation + format spec). Foundations (contract, migration, integrity/CAS from Phase 9) are strong and align with MDN IndexedDB + Android SAF. Concrete export/import surface and secret filtering proof missing.

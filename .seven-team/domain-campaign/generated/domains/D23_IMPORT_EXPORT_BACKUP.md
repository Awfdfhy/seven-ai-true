# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: READY

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
SOURCE_ANALYSIS=Android SAF docs emphasize user-selected document access without system permissions; MDN IndexedDB docs describe client-side structured storage and blobs. Sources collectively support consent-based portability and local durable storage. Limitation: no Seven-specific backup format, sync, or privacy policy evidence; harvested sources do not define encryption/export contracts.
CURRENT=No import/export/backup subsystem found. Attachment repository is room-scoped IndexedDB only. No backup bundle, schema migration, or data portability tests. Memory/chat/RPG data ownership not unified for export.
TARGET=Add a single portability owner: versioned, integrity-checked, user-consented export/import bundles for attachments and relevant chat/room metadata, with deterministic validation, migration, and rollback. No secrets/credentials exported.
NEXT=Define bundle schema and tests; implement attachment-only export/import first; then room/chat metadata.
LATER=Encrypted backups, cloud storage, incremental sync, cross-device restore, retention policies.
TESTS=Bundle round-trip, tamper detection, version migration, cancellation, storage failure, Android SAF save/open flows, secret exclusion.
RISKS=Data loss, privacy leakage, schema drift, partial import, Android storage grants, large bundle memory.
FIRST_SLICE=Attachment bundle schema + deterministic in-memory export/import tests.
KNOWN_UNKNOWNS=No bundle format exists; no Android evidence; no backup UX.
DOMAIN_VERDICT=READY_FOR_PLAN

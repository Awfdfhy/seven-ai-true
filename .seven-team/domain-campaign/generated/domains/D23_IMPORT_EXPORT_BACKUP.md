# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: READY

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
SOURCE_ANALYSIS=Harvested evidence: Android SAF for user-controlled document access, IndexedDB for client-side structured data. Sources emphasize user control and privacy. Limitations: no Seven export/import implementation evidence; no format/version contract.
CURRENT=No verified backup/import/export implementation in this report.
TARGET=Versioned data export/import with validation, secret handling, and user-controlled file selection.
NOW=Define export schema and identify sensitive data exclusions.
NEXT=Implement deterministic export/import with validation and tests.
LATER=Android SAF integration and cloud backup.
TESTS=Round-trip export/import tests, malformed payload tests, secret-exclusion tests.
RISKS=PII leakage, partial imports, format drift, Android permission/storage issues.
FIRST_SLICE=JSON export/import with schema validation and tests.
KNOWN_UNKNOWNS=Current data model, Android exact-build evidence.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT

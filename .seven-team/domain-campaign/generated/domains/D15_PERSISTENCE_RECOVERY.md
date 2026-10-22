# D15_PERSISTENCE_RECOVERY — Persistence / Migration / Corruption / Recovery

Research audit: READY

DOMAIN_ID=D15_PERSISTENCE_RECOVERY
SOURCE_ANALYSIS=Harvested evidence: IndexedDB for structured/larger client data, Web Storage for smaller key/value state, Android architecture recommends layered/data-source recovery. Sources agree on separating persistence concerns and robust lifecycle handling, but do not provide Seven-specific migration/corruption behavior. Limitations: generic docs; no corruption-recovery or migration test evidence.
CURRENT=Seven persistence/recovery implementation must be inspected; no verified migration/corruption recovery proof in this report.
TARGET=Robust persistence layer with schema versioning, migration, corruption detection, safe fallback, and recovery UX.
NOW=Inventory all storage keys/databases, identify migration points and failure modes.
NEXT=Add migration tests, corruption simulation, recovery fallback, and restart validation.
LATER=Backup/restore and cross-device portability.
TESTS=Corruption injection, migration rollback, restart recovery, Android lifecycle tests.
RISKS=Data loss, silent corruption, version mismatch, WebView storage limits.
FIRST_SLICE=Schema versioning + safe migration wrapper with deterministic tests.
KNOWN_UNKNOWNS=Existing storage ownership, schema versions, failure telemetry.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT

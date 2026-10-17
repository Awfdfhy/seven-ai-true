# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: READY

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
SOURCE_ANALYSIS=<what the sources collectively say, disagreements, freshness and limitations>
- Android SAF for export: `ACTION_CREATE_DOCUMENT` to let user choose destination (portability) without writing to arbitrary shared paths [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files. Same SAF guidance as D10 (locale variants). 
- IndexedDB: client-side structured storage, large amounts, indexes [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API. Useful for backup/export snapshots, conversation history, metadata; not a general “files to user Documents” picker. 
- MASVS baseline applies to data handling. 
Disagreements: none. Freshness: MDN IndexedDB current; Android SAF stable. Limitations: harvested sources don’t specify Seven’s data model (conversations/messages/attachments), export formats (TXT/PDF), backup scope, or restore semantics.

CURRENT=<Seven current implementation and evidence>
- Repo: `seven_ai-final.html` etc large bundles; no obvious “export”, “backup”, “import” UI/logic found in quick grep (evidence level: static). 
- No IndexedDB wrapper visible; no SAF export implementation. 
- `memory.cjs`, `memory-results.json`, `verify.cjs`, `runtime-smoke.cjs` suggest small utility scripts (Node) — likely dev tools, not app import/export. 
- Architecture: web app + Capacitor wrapper; no backup/portability surface documented. 
Conclusion: import/export/backup not implemented; current state is unproven for portability.

TARGET=<desired architecture/product behavior>
- Data portability: user can export conversation(s) as TXT (human-readable) and optionally PDF; import conversation from TXT (structured) with validation. 
- Backup scope: conversations, messages, attachments metadata (not necessarily re-downloading remote blobs unless policy states), settings (non-secret). 
- Android export: ACTION_CREATE_DOCUMENT (SAF) for user-chosen location; web: Blob download. 
- Import: SAF open document (TXT/PDF ingestion path from D10) or web file input; validate schema, idempotency, conflict resolution (merge vs replace). 
- Deterministic, safe: no auto-upload of private data; redact secrets; respect file limits (D10). 
- Architecture-aligned (no duplicate owners for storage/kernel/bridge). 

NOW=<first high-value implementation slice>
Smallest slice:
1. Export single conversation as TXT via SAF (Android) + Blob download (web). Include metadata header (timestamp, id, count). 
2. Import TXT (line-based or JSONL) with schema validation and size limits. 
3. Deterministic tests (export format, import validation, roundtrip). 

NEXT=<next improvements>
- Multi-conversation export (ZIP of TXTs) or combined. 
- IndexedDB snapshot export/import (structured) — leverage MDN IndexedDB knowledge [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API for full backup (not just current session). 
- PDF export (print-to-PDF or generator) — needs evidence-backed library choice (no guessing). 
- Restore semantics (dedupe, attachments re-link). 
- Auto-backup policy? explicitly not assumed.

LATER=<longer-term ideas>
- Cloud backup providers (optional, user-driven), encryption at rest for exported files? 
- Differential backups, versioning. 

TESTS=<deterministic, E2E, Android, adversarial and eval proof>
- Roundtrip: export TXT → import → state equivalent (minus ephemeral). 
- Validation: malformed JSONL/TXT, BOM, encoding, large files, binary disguised as TXT. 
- Limits: enforce D10 limits on import. 
- Android: ACTION_CREATE_DOCUMENT success/failure, write permissions to granted URI. 
- Adversarial: injection in export/import, path concerns (SAF URIs), data exfiltration (no auto-send). 
- E2E: full import/export journey. 

RISKS=<security/privacy/performance/Android/RTL/cross-system risks>
- Privacy: exports contain user content; must never auto-share; user selects destination (SAF) — aligns with shared storage guidance [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files. 
- Data integrity: roundtrip fidelity, attachment references (URIs may not be portable). 
- Performance: large histories → streaming export. 
- Cross-system: backup touches storage; avoid duplicate storage owner. 
- IndexedDB: quota, browser differences (MDN IndexedDB) — test deterministically. 

FIRST_SLICE=<smallest implementation that materially improves the domain>
TXT export/import for a single conversation with SAF+web support and validation. This is minimal, portable, testable, and uses harvested evidence.

KNOWN_UNKNOWNS=<missing evidence>
- Data model shape in app (conversation schema) — not visible in HTML bundles inspected. 
- Whether any IndexedDB is used (needs runtime inspection). 
- Attachment portability (URIs from SAF not portable across installs/devices) — product decision needed. 
- PDF requirements (explicitly in focus: “TXT/PDF ingestion…” for import, export not stated but implied; treat PDF export as NEXT unless manager assigns). 
- Restore target scope (full DB vs session). 

DOMAIN_VERDICT=READY_FOR_PLAN

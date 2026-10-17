# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: READY

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP

SOURCE_ANALYSIS=Harvested primary sources: (1) Android SAF shared storage (user-driven export/import of documents/files, create/open without broad permissions) [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files (localized variants present); (2) MDN IndexedDB API (client-side structured storage, large amounts, indexes; main landing) [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API. Disagreements: none obvious. Freshness reasonable. Limitations: harvest notes high-level; no concrete backup/export format, encryption, versioning, size limits, or Android backup constraints. MDN is web API (IndexedDB) — relevance depends on whether Seven uses web/Capacitor+IndexedDB vs native.

CURRENT=Seven current implementation and evidence: import/export/backup not fully enumerated. Quick scans show `import|export|backup` references; IndexedDB/Capacitor signals also present. Milestones/architecture under `remake/` are truth. No concrete export format, backup location (SAF vs app private), encryption, or data portability scope identified yet. Need to inspect code paths (export/import UI/actions, storage layer, backup triggers) and tests. No evidence levels assigned; treat unverified.

TARGET=Desired architecture/product behavior: user-consented import/export/backup with clear scope (what data included), portable formats, SAF-driven document creation for exports, safe import validation, and privacy/security (encryption at rest/in transit considerations as applicable). Align with Android ergonomics and PI rubric. Preserve ownership (B02/B08) and don’t weaken guards. Cross-cut with D10 (attachments/files in exports).

NOW=First high-value implementation slice: evidence-grounded inventory of current import/export/backup surface (actions, formats, storage backends including IndexedDB usage, export destinations). Confirm SAF createDocument for exports, import validation, and any existing backup policy. RESEARCH only.

NEXT=Next improvements: explicit export schemas (versioned), import validators (schema/version/size), deterministic roundtrip tests, error taxonomy, and Android SAF grants for exports. Consider data portability completeness.

LATER=Longer-term ideas: automated backups with user control, incremental exports, but only evidence-backed; avoid breaking changes to stored data. Don’t assume cloud backup unless justified.

TESTS=Deterministic, E2E, Android, adversarial and eval proof: unit tests for schema/version/validation; integration for SAF create/open flows; E2E import→export roundtrip; adversarial (malformed imports, large datasets, path/URI attacks); regression covering backup/import/export. Must state invariants touched.

RISKS=Security/privacy/performance/Android/RTL/cross-system risks: data leakage via exports (PII), unsafe import of untrusted data, IndexedDB quota/perf, SAF URI lifecycle, scoped storage, cross-system ownership (B08 boundary), RTL in filenames, no secret exposure.

FIRST_SLICE=Smallest implementation that materially improves the domain: document current import/export/backup code paths + IndexedDB/SAF usage + export formats in evidence form (files inspected, symbols). Propose versioned export schema skeleton and validation contract with test stubs — RESEARCH only.

KNOWN_UNKNOWNS=Missing evidence: export/import implementations (locations, formats), backup triggers/policy, IndexedDB schema/tables, SAF createDocument usage for exports, encryption, size/quota handling, tests, B02/B08 ownership split, installed-device behavior.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need concrete code inspection of import/export/backup + IndexedDB usage and SAF flows). Harvested sources useful but not sufficient to ground CURRENT.

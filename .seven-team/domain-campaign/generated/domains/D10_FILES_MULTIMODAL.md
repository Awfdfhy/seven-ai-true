# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL
SOURCE_ANALYSIS=<what the sources collectively say, disagreements, freshness and limitations>
Current consensus from harvested sources:
- Capacitor Filesystem [SOURCE primary] https://capacitorjs.com/docs/apis/filesystem: NodeJS-like file ops (read/write/delete/stat/etc.) with platform dirs; useful for app-private storage but not the Android “shared documents” picker surface by itself. 
- Android SAF [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files: ACTION_OPEN_DOCUMENT/ACTION_CREATE_DOCUMENT/DocumentFile + persistable grants; required for user-selected files (TXT/PDF) across providers without broad READ_EXTERNAL_STORAGE on modern Android. 
- OWASP MASVS [SOURCE primary] https://mas.owasp.org/MASVS/: secure storage/permissions/IPC expectations (mobile app security baseline). 
- Minor locale duplicates (ar/bn) confirm same SAF guidance. Harvested static assets (favicon/css/opensearch/manifest) are site metadata, not technical content. 
Disagreements: none material. Freshness: Capacitor docs current; Android SAF stable (API 19+). Limitations: harvested texts don’t show Seven’s concrete plugin usage, granted URIs, MIME allowlists, size limits, or TXT/PDF handling specifics.

CURRENT=<Seven current implementation and evidence>
Repo inspection (evidence: file reads):
- `remake/ARCHITECTURE.md`: describes app as “Seven AI (Codex model)” web app with Capacitor wrapper, Android APK, cloudflare worker; no explicit SAF/attachments/files API surface documented. 
- `remake/MILESTONES.md`: milestone list exists but no file-ingestion/SAF milestone line found in quick scan. 
- `capacitor.config.json`: `{ "appId": "com.sevenagent.app", "appName": "Seven AI", "webDir": ".", "bundledWebRuntime": false }` — no plugins listed; Filesystem plugin not declared. 
- `package.json`: minimal (no @capacitor/filesystem, @capacitor/preferences etc.). 
- `seven_ai-final.html`, `seven_ai-t150.html`, `seven_ai-t152.html`, `seven_ai-t161.html`: large single-page HTML apps (bundled). Searched for attachment/file indicators: “attachment”, “file”, “pdf”, “txt”, “upload”, “open document”, “ACTION_OPEN”, “SAF”, “persistable uri”, “grant”, “Filesystem”, “Capacitor”. 
  - Found UI mentions? Quick grep: no explicit SAF intents; “file” appears in generic contexts (no clear file picker implementation visible in these HTML bundles at first pass). Evidence level: static HTML inspection (browser-like mock evidence). No Android runtime/device evidence yet. 
- `apk/`: directory exists (APK present). No decompiled inspection performed here (keeps scope to research; could be build artifact). Build evidence not read unless necessary. 
Conclusion: No concrete SAF integration, no Capacitor Filesystem usage declared, no TXT/PDF ingestion pipeline visible in repo state. Claims about file handling would be unproven.

TARGET=<desired architecture/product behavior>
- Android-first: use SAF for user-selected TXT/PDF (and future binary) with `ACTION_OPEN_DOCUMENT` + MIME allowlist (`text/*`, `application/pdf`) and `ACTION_CREATE_DOCUMENT` for export. Persist grants via `takePersistableUriPermission` per MASVS safe storage/permission principles [SOURCE primary] https://mas.owasp.org/MASVS/. 
- Files API boundary: if using Capacitor, declare `@capacitor/filesystem` and consider `@capacitor/app`/bridge needs; but shared storage access is SAF (native Android), not purely app-private Filesystem. Distinguish: private cache vs user-picked documents. 
- Limits: explicit max size, per-attachment count, max total, quarantine, preview truncation, memory caps (avoid loading huge PDFs into strings). 
- Grants: minimal scope, revoke not automatic on uninstall in all cases; must track granted URIs. 
- Import/export: TXT/PDF ingestion (read text, extract metadata), export conversation/session as TXT/PDF (create document), with error taxonomy. 
- Platform parity: web (file input) vs Android (SAF) — feature flagging, capability detection.

NOW=<first high-value implementation slice>
Smallest slice (evidence-backed):
1. Define attachments contract: `Attachment { id, uri, name, mime, size, source:'saf'|'web'|'local', sha256?, persisted:boolean }` (architecture-aligned, no new duplicate owners). 
2. Android capability detection + SAF picker (open document) with MIME allowlist (TXT/PDF). 
3. Read selected document (stream/chunked) with size limit (e.g. 10MB default, configurable) and text extraction path for text/*; PDF: placeholder/parse strategy or “unsupported” with clear error (don’t guess). 
4. Persist/read grants; basic denial handling. 
5. Deterministic tests: unit (limits/MIME), contract (invariant checks), Android mock (SAF intents) — no weakening guards.

NEXT=<next improvements>
- Export: ACTION_CREATE_DOCUMENT for TXT (and PDF generation path if needed). 
- Multi-select, recent URIs cache (scoped), thumbnails? 
- Android 13+ READ_MEDIA_* vs SAF nuance; handle “permission denied” taxonomy. 
- File change notifications (DocumentsContract) if read-modify needed (rare). 
- Cross-system: integrate with storage/bridge/routing per architecture (avoid creating duplicate owners). 

LATER=<longer-term ideas>
- Large files: streaming, background read, memory budget. 
- OCR? not requested; skip unless evidence justifies. 
- Cloud storage providers coverage; MASVS threat model updates. 

TESTS=<deterministic, E2E, Android, adversarial and eval proof>
- Unit: MIME validation, size limits, base64/UTF-8 decode, truncation. 
- Contract: attachment invariants, grant lifecycle. 
- Android (mock): SAF intent result parsing, persistable grants, URIs revoked, “file not found”, provider errors. 
- Adversarial: path traversal not applicable (URIs), content-type spoofing, huge files, symlink-like provider behavior, permission revocation mid-read, malformed PDFs/TXT. 
- E2E: web file input + Android SAF (if device available) — label as build/device evidence when run. 
- Eval: ingestion success/failure taxonomy coverage.

RISKS=<security/privacy/performance/Android/RTL/cross-system risks>
- Privacy: reading user documents requires minimal scope; log redaction (no URIs in logs). MASVS alignment [SOURCE primary] https://mas.owasp.org/MASVS/. 
- Security: persistable grants are powerful; track and scope; avoid copying to public dirs unless explicit. 
- Performance: load large docs incrementally; UI thread blocking. 
- Android: API level, scoped storage changes, provider quirks. 
- Cross-system: creating duplicate owners for storage/bridge would violate architecture (preserve `remake/ARCHITECTURE.md`). 
- Evidence gap: no runtime/device proof yet (APK exists but untested).

FIRST_SLICE=<smallest implementation that materially improves the domain>
Add SAF picker (Android) + web fallback, TXT/PDF allowlist, 10MB limit, read to text (TXT) with clear errors, attachment model, and tests. This directly addresses “TXT/PDF ingestion, file limits, Android documents, grants” with deterministic proof.

KNOWN_UNKNOWNS=<missing evidence>
- Whether Seven already uses Capacitor Filesystem/any file plugin (package.json/capacitor.config empty of plugins). 
- APK’s manifest/permissions (READ_EXTERNAL_STORAGE? no longer needed for SAF; but build might have). 
- Actual file handling code in HTML bundles (grep inconclusive in quick pass). 
- Grant persistence behavior in current build (no installed-device evidence). 
- Max practical sizes for chat context (product decision). 
- Import/export UI entry points (routing). 

DOMAIN_VERDICT=READY_FOR_PLAN

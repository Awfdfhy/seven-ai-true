# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL

SOURCE_ANALYSIS
The harvested sources collectively describe: (1) Capacitor Filesystem API as a NodeJS-like file API for device files [SOURCE primary: capacitorjs.com/docs/apis/filesystem]; (2) Android Storage Access Framework (SAF) on Android 4.4+ letting users select documents from providers without system permissions, using content:// URIs and persistable URI grants [SOURCE primary: developer.android.com/training/data-storage/shared/documents-files]; (3) OWASP MASVS as the mobile app security baseline [SOURCE primary: mas.owasp.org/MASVS/]. Disagreements: none material — sources are complementary. Limitations: sources are documentation landing pages only; no version-specific Android SAF behavior (per-flag persisted URI release quirks) is captured in the harvested notes, though B02-001 documents that quirk from the repo's own hardening script. No freshness concern for the spec-level docs.

CURRENT
Remake (truth per MILESTONES/ARCHITECTURE) implements Phase 4/12 Attachments as a complete vertical slice:
- `AttachmentService.ingest()` snapshots caller bytes before async work [attachment-service.ts], validates roomId/name/declared MIME/bytes (empty or >10MB rejected), sniffs content by magic bytes (`%PDF-` → application/pdf; else strict UTF-8 decode → text/plain), rejects MIME mismatch before touching the PDF parser, runs PDF parse single-flight via `SingleFlightPdfParserLoader`, aborts on cancellation at four checkpoints so late parses never become durable, hashes content with SHA-256, bounds extracted text to 1M chars, and stores an immutable frozen `AttachmentRecord` scoped to a room.
- `ATTACHMENT_LIMITS`: bytes 10MB, textCharacters 1M, nameCharacters 512, recordsPerRoom 128 [domain/attachments/index.ts].
- `IndexedDbAttachmentRepository` enforces per-room capacity (128), validates schema on read, throws structured STORAGE errors on corruption [attachment-repository.ts].
- Phase 4 tests [phase4.test.ts] cover UTF-8 ingest with hashing/freezing, MIME-spoof rejection without parser invocation, single-flight loader (factory called once, parse called N times), cancellation prevents late parse durability, IndexedDB restart/restore + room isolation.
- Android side: `AndroidPlatformService.persistSafGrant`/`releaseSafGrant` validate `content://` URIs via `createSafGrant` and verify native grant truth [android-platform-service.ts, contracts.ts]. Bridge uses typed request/response envelopes with cancellation mapped to requestId [android-bridge.ts]. Capacitor transport unit-tested (no device) [capacitor-native-transport.test.ts].
- `apk/harden-native-platform.cjs` hardens SAF persist/release (per-flag release, iterates `getPersistedUriPermissions()`) BUT only for the legacy `ai.seven.v243` package — not for `ai.seven.remake.v3` [apk/harden-native-platform.cjs, remake/capacitor.config.json].
- `pdfjs-dist` is a devDependency of the LEGACY package.json (4.10.38) but is ABSENT from remake/package.json — remake declares no PDF parser dependency. The `SingleFlightPdfParserLoader` factory is not wired into `main.tsx`/`seven-runtime.ts` in any evidence I found.
- No UI file-picker / attachment-composer wiring exists in remake (no `<input type=file>`, no Capacitor Filesystem plugin usage, no attachment picker bridge method).
- Legacy `seven_ai-final.html` (separate candidate, not remake truth) has `release/attachment-runtime.js` etc. per DEVELOPMENT_REPORT and B02 report, but that is not the Remake architecture.

TARGET
Per ARCHITECTURE.md section 8 (Attachments) and PHASE4_ATTACHMENTS.md: single-flight runtime loader, one ingestion pipeline (size budget → MIME+content sniff → explicit parse errors → task cancellation → persistence policy), SAF URI grants lifecycle-managed on Android, attachment persistence policy, no wrapper-patching of sendMessage. Desired product behavior: users can attach TXT and PDF via system file picker/SAF, content is validated by magic bytes not extension, PDF text extracted and bounded, attachments persist across restart, cancellation is honored, and large/malicious files are rejected before storage.

NOW
First high-value slice: (a) add pdfjs-dist (or equivalent PDF text-extraction parser) to remake/package.json and wire a parser factory into the SevenRuntime so `SingleFlightPdfParserLoader` has a real implementation rather than an unconnected dependency; (b) add a Capacitor Filesystem/SAF bridge method (`files.pickDocument` returning a content:// URI + readable stream/bytes) and a UI composer attachment action that feeds bytes into `AttachmentService.ingest`; (c) extend phase4 tests with a magic-byte spoof case (`.pdf` extension with HTML content) asserting rejection before parser load, and a per-room capacity (128) rejection test.

NEXT
- Persisted-grant cleanup on app lifecycle (release grants when a room/attachment is deleted or on sign-out), mirroring the hardened native release logic but proven for `ai.seven.remake.v3`.
- PDF rendering/viewer for attachments (not just extraction), with CSP `worker-src` handling for pdf.js worker in Capacitor WebView.
- Attachment quota UI (bytes remaining, per-room count), resume/cancel in-progress ingests, and image MIME types if multimodal scope expands beyond TXT/PDF.
- RTL/Arabic attachment UI review and 44px touch targets for picker triggers.

LATER
- Cloud backup/restore of attachments, client-side encryption of stored attachment bytes, DLP/virus scanning on import, cross-app document provider accounting (storage access cost).

TESTS
- Unit: phase4.test.ts additions (spoof rejection, capacity 128, parser load failure path, hash mismatch). Deterministic — fake-indexeddb, no network.
- Contract: attachment-repository schema validation on corrupted stored records; bridge SAF grant validation (content:// only, read/write boolean, persisted flag).
- Android instrumented: SAF tree/document grant → persist → import PDF → verify `getPersistedUriPermissions` round-trip; release grant → verify permission emptied (regression for B02-001); API 34 + API 36; font-scale and compact-width variants.
- Adversarial: `.pdf` extension with HTML/JS content → rejected `VALIDATION`; oversized >10MB → rejected; non-UTF8 binary → rejected; cancellation mid-parse → no durable record; MIME declared `text/plain` but bytes `%PDF-` → rejected before parser.
- Eval: citation schema for any extracted PDF text used in research (canonical URL, contentHash, retrievedAt) per ARCHITECTURE.md section 7.

RISKS
- Security/privacy: MIME spoofing (extension ≠ content) — mitigated by magic-byte sniff but only if parser/render path also trusts detected MIME not declared. Persisted SAF URI grants leaking across sessions if release isn't enforced (B02-001). Storing raw attachment bytes (10MB each × 128/room) could exceed IndexedDB quota — no eviction policy exists.
- Android: SAF grant flags split per-URI (read vs write) — combined-release throws SecurityException silently if not handled per-flag (hardened in legacy only). WebView pdf.js worker blob/CSP blocking (B02-003, NEEDS_RUNTIME_TEST, unproven). debug-only APK builds; no installed-APK identity proof for remake attachments path.
- RTL/cross-system: Arabic file names in attachment records (canonical validation allows Unicode; RTL UI unproven). No day/night attachment UI evidence.
- Cross-system: attachment records are room-scoped but no cross-room dedup by contentHash; no link between attachments and messages/composer yet.

FIRST_SLICE
Smallest materially-improving change: add pdfjs-dist to remake/package.json, wire a real PDF parser factory into the runtime, add the magic-byte spoof + capacity-128 unit tests, and add a SAF `files.pickDocument` bridge method stub + contract test. This turns the loader from unconnected to functional without touching UI ownership.

KNOWN_UNKNOWNS
- Whether a PDF parser factory is wired anywhere in remake main/runtime (no evidence found; may be missing entirely).
- Whether `ai.seven.remake.v3` APK includes any SAF/native file-picker code at all (remake Android gate proved bridge round-trip and payload identity, but not SAF).
- Whether pdf.js worker CSP works in Capacitor WebView (unproven; NEEDS_RUNTIME_TEST).
- Installed-device attachment import evidence: none.

DOMAIN_VERDICT=READY_FOR_PLAN

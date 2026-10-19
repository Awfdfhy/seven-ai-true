# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL
SOURCE_ANALYSIS=Harvested sources are consistent and authoritative:
- [SOURCE primary] https://capacitorjs.com/docs/apis/filesystem — NodeJS-like Filesystem API surface (read/write/delete, directories, filesystem types) as Capacitor abstraction.
- [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files — Android Storage Access Framework (SAF) for content:// URIs, allowing user selection without broad file permissions (privacy-first).
- [SOURCE primary] https://mas.owasp.org/MASVS/ — Mobile App Security Verification Standard (MASVS) sets security/validation requirements relevant to file handling, URI grants, permissions.
- [SOURCE primary] https://capacitorjs.com, https://developer.android.com — platform docs.

Disagreements: None major. Freshness: docs current (Android SAF guidance stable; Capacitor Filesystem API current). Limitations: harvested set is API/doc-focused (no deep code samples for large PDFs/TXT ingestion, no real-world attachment UX). Need to verify how Seven maps SAF vs internal storage vs Capacitor filesystem. No contradiction with repo architecture.

CURRENT=Seven already has SAF/bridge foundations (strong):
- ARCHITECTURE.md: §6 Android uses typed BridgeRequest/BridgeResult; SAF URI grants lifecycle-managed. §8 Attachments: single-flight loader, ingestion pipeline (size budget, MIME+content sniff, explicit parse errors, task cancellation, persistence policy); no wrapper-patching sendMessage.
- MILESTONES.md: capability negotiation + SAF content-URI grant validation.
- Contracts: `remake/src/platform/android/contracts.ts` validates SAFGrant (must be object; uri is canonicalized string; only content:// URIs allowed; requires read and/or write; persisted boolean; issuedAt timestamp). Throws typed SevenError (VALIDATION) with clear messages.
- AndroidPlatformService: `remake/src/application/android/android-platform-service.ts` validates grant responses (schema, matches requested URI/scope, rejects malformed release). Error codes include BRIDGE/VALIDATION semantics.
- Phase 7 tests: `remake/src/integration/phase7/phase7.test.ts` cover SAF denied path (`SEVEN_SAF_DENIED`) and validate SAF grants as content URIs + native grant truth. All 259 tests pass (vitest json).
- Android bridge doc: `remake/PHASE7_ANDROID_BRIDGE.md` states SAF grants accept only content:// URIs and require explicit read/write scope; returned grant truth must match requested URI/scope and report persisted state.

Evidence inspected: remake/ARCHITECTURE.md, remake/MILESTONES.md, remake/src/platform/android/contracts.ts, remake/src/application/android/android-platform-service.ts, remake/src/integration/phase7/phase7.test.ts, remake/PHASE7_ANDROID_BRIDGE.md, remake/PHASE710_INTEGRATION_REPORT.md. No direct attachment ingestion/renderer code files found in src tree under obvious names in grep (attach/pdf/txt) — pipeline is described in architecture but implementation details (parsers, size limits, MIME sniffing, storage policy) need to be located/read. This is a gap (KNOWN_UNKNOWNS).

TARGET=Desired behavior (evidence-aligned):
- Strict SAF handling: content:// only, grant scope matches request, lifecycle-managed (grant/release), persisted grants validated. Android-first privacy (no broad READ_EXTERNAL_STORAGE unless strictly necessary). MASVS-aligned validation.
- Attachment ingestion pipeline per architecture: single-flight runtime loader; enforce size budget; MIME + content sniff validation; explicit parse errors; task cancellation; attachment persistence policy; never wrapper-patch sendMessage.
- TXT/PDF support with deterministic limits: max bytes, max pages (PDF), charset detection/normalization for TXT, timeouts, memory caps. Parse errors typed, not generic.
- File access abstraction that can use SAF on Android and Capacitor Filesystem on other platforms; consistent BridgeResult envelope. 
- Clear UX feedback on large files, unsupported types, permission/SAF denial, I/O errors.

NOW=First high-value slice (smallest that materially improves):
1. Locate attachment ingestion implementation (find files/classes named Attachment*, Ingest*, FileLoader, Composer attachments) and read them to confirm size budget, MIME sniff, parse errors, cancellation. Evidence required.
2. Define/verify TXT ingestion: size cap, charset (UTF-8 with fallback), line/char limits, truncation policy, error codes.
3. Define/verify PDF ingestion scope (what can be extracted: text-only vs metadata; if PDF.js/pdf-lib used, version/license, memory/time limits). If not implemented, propose minimal safe slice (reject or extract bounded text) with proof.
4. Add deterministic unit tests for: oversize rejection, invalid MIME/sniff mismatch, SAF-denied mapping to typed error, cancellation mid-ingest, empty/corrupt files. Tie to existing TaskManager cancellation.

NEXT=Next improvements:
- Capability negotiation (per MILESTONES) between platforms (Android SAF availability, filesystem access) exposed via AndroidPlatformService.
- Attachment persistence policy (where bytes stored: temporary vs persistent, retention, GC) with integrity metadata (contentHash, size, mime) per Research citation model style where applicable.
- Cross-platform mapping: Capacitor Filesystem vs SAF selection rules; Android SAF grant caching/refresh semantics.
- Streaming ingestion for large text (chunked) to avoid peak memory spikes.

LATER=Longer-term ideas:
- Multimodal beyond TXT/PDF: images/audio with sandboxed processing; but preserve identity and avoid overreach.
- Import/export integration with D23 (backup/restore of attachments metadata/grants).
- Android 13+ scoped storage nuances (READ_MEDIA_* vs SAF) — ensure SAF path remains primary for user-selected documents.
- OWASP MASVS mapping checklist (file validation, path traversal, content validation, error disclosure) as machine-verifiable.

TESTS=Deterministic, E2E, Android, adversarial:
- Unit: size budget boundary, MIME+sniff consistency (txt disguised), UTF-16/invalid bytes, truncation, cancellation token propagation.
- Integration (Phase-aligned): SAF grant lifecycle (request/grant/release) with mock bridge; SAF denial -> typed error surfaced; content:// only enforced.
- Android instrumented (per architecture): bridge round-trip for SAF grant truth.
- Adversarial: path traversal attempts via content URIs (validate scheme/authority/path handling), ZIP-bomb-like oversized text, PDF with many pages/large fonts, corrupted headers, content-type spoofing.
- E2E: composer attach flow respects cancellation and never patches sendMessage.

RISKS=Security/privacy/performance/Android/RTL/cross-system:
- Security: file content sniffing must be strict (avoid executing/processing unsafe types). Reject unknown dangerous types by default. Content validation against MASVS.
- Privacy: prefer SAF (user-select) over broad storage; never log full file contents or sensitive paths in plain errors (include hashes/ids). 
- Performance: single-flight + cancellation + size caps to prevent OOM on low-end Android.
- Android: SAF grants can be persisted but may be revoked by provider; must handle `SecurityException`/invalid grants (release + re-request). Scoped storage evolution.
- RTL: UI text around attachments (file names, sizes, errors) must follow existing i18n/RTL handling.
- Cross-system: bridge envelope consistency; mock vs real bridge divergence (contract tests prevent).

FIRST_SLICE=Smallest implementation that materially improves domain:
- Find and read attachment ingestion implementation (core/application layer). Confirm pipeline matches ARCHITECTURE.md (single-flight, size budget, MIME+sniff, parse errors, cancellation, persistence). If mismatched, document gaps.
- Add/verify TXT size cap + charset normalization + truncation + typed errors with unit tests.
- Verify SAF path is enforced (content:// only) end-to-end in attachment flow; add negative tests (file:// rejected) if missing.

KNOWN_UNKNOWNS=Missing evidence:
- Location of attachment ingestion/parsing code (TXT/PDF). Grep found pipeline described but not concrete files yet. Must inspect src for AttachmentStore/Ingestor/FileLoader/Composer attachments.
- Actual size limits (bytes), max text length, PDF extraction limits (pages/size) — not visible in contracts.
- Persistence policy details (temp vs durable, GC, quotas). 
- Platform selection logic (when to use SAF vs Capacitor Filesystem). 
- PDF library (if any) used, memory caps, timeouts — could affect performance/release blockers.
- How SAF grants are cached/revoked and surfaced to user on denial.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to locate/read attachment implementation + concrete limits before declaring READY_FOR_PLAN). The SAF/bridge foundation is strong and aligned with docs; TXT/PDF ingestion specifics and size/MIME policies are not yet evidenced from code.

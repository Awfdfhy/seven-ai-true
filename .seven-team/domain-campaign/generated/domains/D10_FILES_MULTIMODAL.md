# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL
SOURCE_ANALYSIS=[SOURCE primary] https://capacitorjs.com/docs/apis/filesystem — Filesystem API for device files; needs careful path/permission handling. [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files — Storage Access Framework (SAF) for shared storage, user-driven selection, grants/persistable permissions, privacy/control without blanket system permissions. [SOURCE primary] https://mas.owasp.org/MASVS/ — Mobile AppSec Verification Standard (MASVS) covers data storage, cryptography, network, auth, etc. Harvested assets include Capacitor/Android docs pages (some localized). Limits: PDFs/multimodal ingestion details not fully visible in harvested text; need to inspect Seven's attachment pipeline.
CURRENT=Attachments mentioned as milestone 4/12 COMPLETE: TXT/PDF ingestion with MIME/content sniffing, bounded raw bytes/extracted text, realm-safe immutable byte snapshots, single-flight PDF parser runtime loading, SHA-256 attachment identity, cancellation-safe durable persistence, in-memory + IndexedDB repos, restart/restore (remake/MILESTONES.md §Attachments). Research (milestone 5) has citation schema. Bridge typed envelopes exist (remake/ARCHITECTURE.md §6). No explicit evidence of full multimodal (images/audio/video) pipeline or SAF grant lifecycle service details in harvested files beyond architecture references.
TARGET=Robust file/attachment pipeline with MIME/content sniff, size/type allowlists, single-flight loading, sandboxed parsing (PDF), SHA-256 identity, durable policy, SAF integration (persistable grants), scoped storage, redaction in logs/diagnostics, cancellation, and clear UX for permissions. Support multimodal inputs with validation and privacy controls.
NOW=Inspect attachment ingestion code paths, PDF parser loading, SAF grant handling in native bridge, and storage of attachment metadata vs raw bytes.
NEXT=Harden MIME sniffing, enforce allowlists per modality, add SAF grant lifecycle management, and improve error messages for permission denials.
LATER=Broader multimodal support, content sandboxing, OCR/redaction, and provenance tracking.
TESTS=Attachment ingestion tests (TXT/PDF), cancellation tests, restart/restore, SAF grant round-trip tests (JS mock + Android instrumented), adversarial (malformed PDF), size limit tests, parity for path handling.
RISKS=PDF parsing complexity/security (XXE-like, parser exploits), SAF permission confusion, storage quota, Android scoped storage changes, large files impacting memory.
FIRST_SLICE=Review attachment single-flight loader and SAF grant validation paths; add tests for permission denial and cancellation.
KNOWN_UNKNOWNS=Exact attachment service files, PDF parser library, whether images/audio supported, SAF persistable permission correctness (harden-native-platform.cjs mentions SAF persistable-permission correctness).
DOMAIN_VERDICT=READY_FOR_PLAN

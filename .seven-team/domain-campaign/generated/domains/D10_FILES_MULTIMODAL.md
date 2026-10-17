# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL

SOURCE_ANALYSIS=Harvested evidence: **Capacitor Filesystem API** ([SOURCE primary] https://capacitorjs.com/docs/apis/filesystem) — NodeJS-like file ops on device, clear API surface (read/write/mkdir/rm etc.) with platform nuances. **Android Storage Access Framework (SAF)** for shared/documents files ([SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files) and localized variant ([SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files?hl=ar) — emphasizes user-mediated access to shared storage, no blanket READ/WRITE_EXTERNAL_STORAGE where avoidable, privacy-preserving. **OWASP MASVS** ([SOURCE primary] https://mas.owasp.org/MASVS/) provides mobile app security verification requirements (data storage, platform interaction). 

Freshness/limits: Capacitor docs current snapshot; Android SAF guidance is stable but API surface evolves by Android version. MASVS is authoritative mobile baseline. Harvested static assets (favicon/css/manifest/opensearch) are noise. Need to map to Seven’s actual file/multimodal implementation (is it web-only, Capacitor/Android, or native bridge?). Distinguish browser evidence (web FS), mock evidence (tests), Android build evidence, installed-device evidence — critical for any filesystem claims.

CURRENT=Seven codebase inspected for files/multimodal: `rg` for filesystem, file read/write, storage, multimodal, pdf, attachments, media. Remake architecture (`remake/ARCHITECTURE.md`) defines subsystem boundaries/ownership; milestones (`remake/MILESTONES.md`) current state. Need to confirm: file I/O abstraction (path policy, sandbox roots), multimodal ingestion (images/PDFs/attachments), storage backends (local/cache/temp), Android-specific storage handling (SAF vs direct), bridge interfaces, and security constraints (path traversal prevention, symlink handling, size limits, type validation). Product Intelligence/knowledge packs may contain UI/product guidance (density/clarity etc.) if file UI involved — compare against Seven exact-build evidence only.

TARGET=Secure, least-privilege file/multimodal handling: **path policy** (canonicalize, enforce root allowlists, reject `..` traversal, symlink escapes), **sandboxed roots** (temp/cache/user-selected via SAF), **no global FS access**, **explicit permissions per operation**, **type/size limits**, **safe temp file lifecycle** (creation/cleanup), **multimodal validation** (MIME, magic bytes) before processing, **secrets never written to logs/paths in unsafe ways**, and **Android alignment** (prefer SAF for shared content; avoid broad external storage perms). Preserve identity; no pixel-copy of competitors. MASVS-aligned storage practices where mobile path exists.

NOW=First slice: **file I/O inventory + path policy enforcement**. Document allowed roots, operations, owners. Implement canonicalization + traversal guard. Add deterministic tests (path traversal attempts, symlink cases, root escapes). If Capacitor/Android present, test against appropriate context (mock/build) with evidence labels.

NEXT=Multimodal hardening: attachment validation, PDF parsing safety (if used), image handling bounds, upload limits, and **result sanitization**. Storage lifecycle (temp cleanup, quotas). Android SAF integration correctness (if applicable) — verify with build evidence, not assumptions. Cross-system: ensure tools (D03) cannot bypass path policy.

LATER=Secure download/upload flows, file access audit, telemetry (safe), and compatibility with D14 (secrets/credentials never in file paths/logs). Consider platform-specific test matrix (browser/mock/Android build/installed-device) with clear evidence labels.

TESTS=Deterministic: path policy (traversal, absolute/relative, symlinks), root allowlists, size/type limits, lifecycle. Adversarial: path injection, archive slip (if archives supported), oversized payloads. Android: SAF flows if implemented (build evidence). No weakening guards.

RISKS=Path traversal/symlink escapes (critical), accidental broad FS access, writing secrets to temp/logs, Android storage pitfalls (shared storage vs app-private), PDF/multimodal parser vulnerabilities, cross-tool bypass (if capability graph loose). Over-permissive roots.

FIRST_SLICE=**Path policy + sandboxed roots + traversal guards** with inventory. Enforce at file I/O boundary; deterministic regression tests. Smallest enforceable security improvement.

KNOWN_UNKNOWNS=Whether Capacitor/Android is used in this repo (Capacitor mentioned in harvested sources; need to confirm). File API surface (read/write/list/delete/mkdir). Multimodal types supported. Do tools (D03) invoke file I/O directly? Autonomy contracts for filesystem invariants.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to confirm platform (web/Cordova/Capacitor/Android) and concrete file I/O implementations/roots; harvested Capacitor+SAF+MASVS evidence is applicable but Seven-specific paths unknown)

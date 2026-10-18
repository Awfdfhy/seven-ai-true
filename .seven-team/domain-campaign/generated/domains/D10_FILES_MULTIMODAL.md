# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL
SOURCE_ANALYSIS=Sources (Capacitor Filesystem [SOURCE primary], Android SAF/shared storage [SOURCE primary], MASVS [SOURCE primary]) emphasize secure file access: use platform APIs, respect scoped storage, avoid broad file permissions, validate paths, prevent traversal, handle PII/secrets in attachments. MASVS requires secure storage of sensitive data and proper permission model. Android SAF gives user-mediated access (preferred over broad READ/WRITE). Limitations: Capacitor plugin specifics vary; WebView file handling differs from native. 
CURRENT=Repo has `capacitor.config.json` (Capacitor app) and `apk/` dir. No obvious file attachment UI paths visible in quick scan; attachments/multimodal may be in remake or HTML files (`seven_ai-*.html`). Secrets/PII in attachments not assessed. 
TARGET=Path policy (no traversal, allowlisted roots/schemes), scoped storage (SAF where appropriate), avoid exposing credentials via file URIs, strip secrets from logs/telemetry, validate MIME/size, Android-safe implementation aligned to MASVS. 
NOW=Inspect `capacitor.config.json`, `apk/`, `remake/` for file/attachment/multimodal code, search for `filesystem`, `attachment`, `upload`, `pdf`, `image`, `file://`. 
NEXT=Define path policy: base dirs (cache/temp/user-selected), disallow `..`, symlink safety, scheme allowlist, sanitize names. For Android, prefer SAF user selection over MANAGE_EXTERNAL_STORAGE; enforce scoped storage. 
LATER=Secret scanning in attachments (redaction), memory hygiene for large files, provenance of uploaded content. 
TESTS=Path traversal negative tests, scheme validation, large file handling, permission boundary tests. 
RISKS=Path traversal, accidental secret persistence in uploads/cache, over-broad permissions (MASVS fail), log leakage (filenames/paths may contain PII). 
FIRST_SLICE=Path policy doc + checks in file access paths; evidence of current attachment surfaces and any unsafe patterns. 
KNOWN_UNKNOWNS=Any file upload/attachment implementation exists? Capacitor Filesystem plugin configured/used? SAF flows? 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to confirm file/attachment surfaces exist in codebase; harvested sources inform policy but Seven implementation unknown)

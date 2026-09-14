# Seven Tool Fabric 2.0 — Wave 05 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: deterministic utilities, parsers, text/content sanitation, dates/numbers, and lightweight transformation tools.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 05

Goal: identify small, deterministic, high-reliability capabilities that should replace model guessing for calculations, dates, structured data, parsing, sanitization, content extraction and text transformations. Optimize for correctness, tiny runtime cost, auditability and mobile suitability.

Research current platform APIs, standards and maintained lightweight libraries. Prefer native platform primitives where they are sufficiently correct and stable. Do not add a dependency for a problem Seven can safely solve with a tiny audited implementation.

Research at minimum:
- exact decimal/rational arithmetic
- large integer arithmetic
- date/time/timezone arithmetic
- duration/calendar semantics
- unit conversion and standardized units
- URL/URI parsing
- MIME/content-type parsing
- JSON/YAML/CSV/XML parsing
- Markdown parsing/rendering boundary
- HTML parsing/content extraction
- HTML sanitization/XSS defenses
- plain-text normalization
- Unicode segmentation/normalization
- token counting/tokenizer abstractions
- regular-expression safety/timeouts
- deterministic sorting/deduplication
- checksums/hashing where not already covered
- lightweight compression/decompression where useful

For each candidate evaluate:
- correctness/spec compliance
- deterministic behavior
- Unicode/internationalization/Arabic handling
- precision and overflow
- malformed-input behavior
- security/parser attack surface
- bundle size and tree-shaking
- maintenance/license
- browser/WebView/Android compatibility
- worker/stream support
- whether native Web APIs already solve it

Rules:
- calculations involving money/precise decimals must not rely blindly on binary floating-point.
- dates must distinguish instant, timezone, local calendar date and duration.
- HTML from tools/models/web is untrusted and must never be inserted unsanitized.
- parsing success does not imply semantic validity.
- regex supplied by model/user must not be allowed to freeze the UI; limit input/pattern or use a safer engine/worker strategy.
- markdown rendering and HTML sanitization are separate stages.
- normalization must preserve source/raw data lineage when content is authoritative.

Output:
1. candidate registry
2. Seven-owned deterministic tool contracts
3. dependency-vs-native decisions
4. security rules
5. Android bundle/startup strategy
6. rejected dependencies/approaches
7. Deep Polish queue

Preserve all material results in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.

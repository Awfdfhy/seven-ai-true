# Seven Tool Fabric 2.0 — Wave 05 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 05. No candidate integrated/frozen.
Governing command: `WAVE_05_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven needs a **Deterministic Utility Kernel**. If a task has a small deterministic solution, the model should call that capability instead of estimating or improvising.

Proposed layers:
1. `ExactMath`
2. `DateTimeEngine`
3. `UnitEngine`
4. `StructuredDataEngine`
5. `SafeMarkupEngine`
6. `ArticleExtractor`
7. `TextEngine`
8. `SafePatternEngine`
9. `CompressionEngine`

These remain tiny/lazy and are invoked by the Cognitive Control Plane when a deterministic path can answer the task.

## Candidate registry

| Candidate/platform | Kind | Class | Seven role |
|---|---|---|---|
| JS BigInt | platform language feature | CORE PLATFORM | exact integer arithmetic |
| decimal.js / decimal.js-light | library | CORE CANDIDATE | arbitrary-precision decimal arithmetic |
| Temporal | platform API | FUTURE CORE / capability-detected | correct date/time/calendar model |
| @js-temporal/polyfill | library | SPECIALIST FALLBACK | lazy Temporal fallback where needed |
| UCUM | units standard | CORE SEMANTIC STANDARD | canonical unit identities/conversion semantics |
| URL API | Web API | CORE PLATFORM | URL parse/resolve/normalize |
| native JSON | platform | CORE PLATFORM | strict JSON parsing/stringifying |
| `yaml` | JS library | SPECIALIST CANDIDATE | YAML 1.1/1.2 parse/write |
| Papa Parse | JS library | SPECIALIST CANDIDATE | CSV parse/stream |
| fast-xml-parser | JS library | SPECIALIST CANDIDATE | bounded XML parse/validate |
| micromark | JS library | CORE/SPECIALIST CANDIDATE | safe CommonMark boundary |
| DOMPurify | JS library | CORE SECURITY CANDIDATE | sanitize untrusted HTML/SVG/MathML |
| Mozilla Readability | JS library | SPECIALIST CANDIDATE | article/main-content extraction |
| Intl.Segmenter | Web API | CORE PLATFORM | locale-aware grapheme/word/sentence segmentation |
| String.normalize | language API | CORE PLATFORM | Unicode normalization |
| RE2-Wasm | Wasm library | SPECIALIST SECURITY | linear-time regex subset for untrusted patterns |
| CompressionStream | Web API | CORE PLATFORM | gzip/deflate streaming compression |
| zip.js | library | SPECIALIST | ZIP handling, already in Wave 04 |

## ExactMath

### BigInt
Use native `BigInt` for exact integer calculations outside safe `Number` range. Never mix implicit Number/BigInt semantics.

### decimal.js
Arbitrary-precision Decimal implementation with no dependencies and configurable precision/rounding. Its upstream also offers a lighter variant without advanced transcendental functionality.

Seven proposal:
- use a minimal Decimal build for exact decimal calculations where binary floating point is inappropriate
- caller specifies or Seven selects precision/rounding policy explicitly
- return both machine value and human formatting separately

Canonical tools:
- `math.integer`
- `math.decimal`
- `math.compare`
- `math.round`
- `math.percentage`

Security/correctness:
- parse numeric strings strictly
- maximum digit/expression limits
- no arbitrary JavaScript `eval`
- preserve input units separately from numeric value

Source:
- https://github.com/MikeMcl/decimal.js

## DateTimeEngine

### Temporal
Temporal models instants, zoned date-times, plain calendar dates/times and durations more correctly than legacy `Date`, but MDN still marks it limited-availability in 2026.

Decision:
- prefer native Temporal when capability-detected
- use a lazy polyfill for date-heavy workflows on runtimes that lack it only if bundle/runtime benchmarks justify it
- do not install a heavy polyfill on normal startup solely for occasional date arithmetic

Source:
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal
- https://github.com/js-temporal/temporal-polyfill

Canonical tools:
- `datetime.now`
- `datetime.parse`
- `datetime.convert_zone`
- `datetime.add`
- `datetime.diff`
- `datetime.format`

Rules:
- distinguish instant vs local wall time
- require timezone for ambiguous conversions
- preserve original timezone/offset
- calendar duration (months/years) is not fixed milliseconds
- never infer a timezone from a place/name without evidence

## UnitEngine

UCUM defines unambiguous machine codes and dimensional semantics for units used across science, engineering and business.

Seven proposal:
- use UCUM-compatible canonical unit identifiers internally for supported physical units
- start with a curated, audited subset needed by Seven rather than shipping a huge dependency blindly
- dimensional compatibility is checked before conversion
- exact decimal arithmetic for conversion factors when useful

Canonical tools:
- `units.parse`
- `units.convert`
- `units.compatible`
- `units.format`

Source:
- https://ucum.org/ucum

## Native URL / JSON

### URL
Native `URL` is mature, worker-compatible and should replace custom URL string parsing.

Canonical tools:
- `url.parse`
- `url.resolve`
- `url.normalize`
- `url.origin_check`

Source:
- https://developer.mozilla.org/en-US/docs/Web/API/URL

### JSON
Use native strict JSON parser/stringifier plus SchemaGuard. Do not accept JSON-like model text by evaluating JavaScript.

For deterministic cryptographic JSON hashing use JCS from Wave 04 rather than assuming `JSON.stringify` ordering is an interchange canonicalization scheme.

## YAML

The `yaml` library supports YAML 1.1/1.2, modern browsers and Node, has no external dependencies and passes the yaml-test-suite according to its docs.

Seven role:
- lazy parser/writer for project/config documents
- bounded document size/node count at Seven boundary
- never interpret YAML tags as executable code

Source:
- https://eemeli.org/yaml/

## CSV

Papa Parse supports strings/files, streaming and local/remote inputs.

Seven role:
- lazy CSV parser for data tasks
- parse local files in worker/stream mode for large input
- explicit delimiter/header/type-coercion policy
- preserve raw cell text if data integrity matters

Source:
- https://www.papaparse.com/docs

## XML

fast-xml-parser is actively maintained and its 2026 releases added multiple protections/limits around entities, nesting and dangerous properties.

Seven role:
- specialist parser for API/config/document XML
- strict safe profile:
  - bounded input
  - bounded nesting
  - bounded entity counts/expansion
  - disable or reject external/unsafe entity behavior
  - reject dangerous property names
  - no semantic trust from syntactic validity

Source:
- https://github.com/NaturalIntelligence/fast-xml-parser

## SafeMarkupEngine

### micromark
CommonMark parser with safe defaults: embedded HTML and dangerous protocols are encoded/dropped unless dangerous options are explicitly enabled. Its security guidance also recommends input-size limits and worker isolation for large/adversarial markdown.

Seven proposal:
- Markdown input → micromark safe mode
- never enable dangerous HTML/protocols for model/web/user content by default
- size limits and worker path for large documents

Source:
- https://github.com/micromark/micromark

### DOMPurify
Well-maintained HTML/MathML/SVG sanitizer designed for XSS defense.

Seven proposal:
- any path that intentionally renders HTML from untrusted web/tool/model content must sanitize at the final HTML boundary
- keep an allowlist tuned to Seven UI rather than broad permissive config
- DOMPurify does not make external links/files semantically trustworthy

Source:
- https://github.com/cure53/DOMPurify

Canonical tools:
- `markup.markdown_to_safe_html`
- `markup.sanitize_html`

## ArticleExtractor

Mozilla Readability is the standalone extraction library used for Firefox Reader View and supports a maximum element bound option.

Seven role:
- cheap local page-content extraction before remote crawler escalation
- run only on a DOM parsed from already-retrieved content under size/element limits
- output includes title/byline/text/content plus source URL/hash lineage

Source:
- https://github.com/mozilla/readability

Canonical tool:
- `web.extract_article_local`

This updates Wave 01 retrieval ladder:
`direct fetch → local DOM/Readability → remote reader/extractor → browser-backed extraction → interactive browser`

## TextEngine

Use platform primitives before dependencies:
- `String.normalize('NFC')` for canonical Unicode normalization where appropriate
- `Intl.Segmenter` for locale-sensitive grapheme/word/sentence boundaries

Sources:
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/normalize
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter

Canonical tools:
- `text.normalize_unicode`
- `text.segment`
- `text.dedupe`
- `text.compare_normalized`

Rule:
- normalization creates a derived representation. Preserve raw authoritative text and record transformation when used for memory/source indexing.

## SafePatternEngine

Native JavaScript regex can be problematic for externally supplied pathological patterns/input. RE2 intentionally excludes constructs that can require exponential-time matching.

Seven proposal:
- ordinary trusted internal patterns may use native RegExp
- user/model-generated regex in automation/search gets length/input/time limits and preferably executes in a worker
- RE2-Wasm is a specialist option when linear-time regex semantics are sufficient
- never silently convert unsupported RE2 features into a broader unsafe regex

Source:
- https://github.com/google/re2-wasm

Canonical tools:
- `pattern.compile_safe`
- `pattern.search`
- `pattern.replace`

## CompressionEngine

Native Compression Streams API provides worker-compatible gzip/deflate streaming and avoids shipping a compression library for those formats.

Decision:
- native `CompressionStream`/`DecompressionStream` first
- zip.js only for ZIP container semantics
- enforce decompressed-output limits regardless of implementation

Source:
- https://developer.mozilla.org/en-US/docs/Web/API/Compression_Streams_API

Canonical tools:
- `compress.gzip`
- `compress.gunzip`

## Dependency-vs-native rules

Use native by default for:
- URL
- JSON
- BigInt
- Unicode normalization/segmentation when supported
- gzip/deflate streams
- cryptographic primitives

Add/lazy-load focused dependencies for:
- Decimal arithmetic
- YAML
- CSV
- XML
- Markdown
- HTML sanitization/readability
- safe regex subset
- ZIP

## Rejections / limits

- no JavaScript `eval` calculator
- no binary floating-point for exact financial/precision-sensitive decimal output
- no naive `Date` millisecond arithmetic for calendar months/years
- no handwritten URL parser
- no `innerHTML` with model/web/tool content before a strict render/sanitize boundary
- no regex of unlimited size/input on UI thread
- no YAML/XML parser with unbounded entity/nesting behavior
- no tokenizer estimate presented as exact when provider/model tokenizer is unknown

## Token counting rule

Tokenizer semantics are model-specific. Model Fabric should expose:
- exact tokenizer adapter when available
- provider-reported token usage when authoritative for completed requests
- estimate with explicit `ESTIMATED` status otherwise

Do not create one global tokenizer and call it exact for every model.

## Deep Polish queue

`SafeMarkupEngine → ExactMath → DateTimeEngine → StructuredDataEngine(XML/YAML/CSV) → UnitEngine → ArticleExtractor → SafePatternEngine → TextEngine`

## Android/startup strategy

Almost all deterministic utilities are lazy modules or native Web APIs. None should trigger network/model downloads. Large parser work moves to workers. Bundle-size measurements determine whether small libraries are bundled or chunked, but startup imports must remain within Seven's strict budget.

No production integration occurred in this wave.

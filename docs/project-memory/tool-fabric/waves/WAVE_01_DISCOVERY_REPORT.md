# Seven Tool Fabric 2.0 — Wave 01 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 01. No candidate is integrated or frozen yet.
Governing command: `WAVE_01_MAXIMUM_EFFORT_COMMAND.md`

## Executive finding

Seven should own stable capability contracts and place external projects/providers behind replaceable adapters. Vendor names must not become canonical Seven tool names.

Proposed capability layers:

1. `ToolInteropGateway` — MCP-compatible discovery/execution behind Seven security, validation and authority rules.
2. `SearchBroker` — multi-provider search routing by task, freshness, latency, quota and diversity.
3. `FetchExtractBroker` — direct fetch first, remote extraction/crawling only when needed.
4. `BrowserActionBroker` — deterministic browser control on a capable host/remote runtime, lazy from Android.
5. `CodeStructureEngine` — lexical + syntax-aware code/project understanding and controlled structural edits.
6. `DocumentIngestBroker` — lightweight local ingestion first, heavy conversion/layout analysis only on demand.
7. `LocalDataEngine` — durable local SQL state plus optional analytical SQL.
8. `SchemaGuard` — generated typed validation for tool inputs/outputs.
9. `PolicyGate` — Seven-native permissions first, optional advanced policy engine later.
10. `TelemetryBridge` — minimal Seven-native event model with optional standards export.

## Preliminary candidate registry

| Candidate | Kind | Preliminary class | Android posture | Deep-polish priority |
|---|---|---|---|---|
| MCP 2026-07-28 | protocol | CORE CANDIDATE | thin client adapter | P0 |
| Ajv standalone validators | validation/build tool | CORE CANDIDATE | excellent when generated at build time | P0 |
| Tree-sitter | parser | CORE CANDIDATE | lazy/Wasm candidate | P0 |
| SQLite Wasm + OPFS | local DB | CORE CANDIDATE | promising; device benchmark required | P0 |
| ast-grep | structural code query/rewrite | SPECIALIST | host/lazy | P0 |
| Playwright CLI/MCP | browser automation | SPECIALIST | host/remote only | P0 |
| Exa | search provider | SPECIALIST | remote | P1 |
| Tavily | search/research provider | SPECIALIST | remote | P1 |
| Brave Search API | search provider | FALLBACK | remote | P2 |
| SearXNG | metasearch server | FALLBACK | remote/self-hosted | P2 |
| Jina Reader | extraction/search service | FALLBACK/SPECIALIST | remote | P1 |
| Firecrawl | crawling/extraction/browser service | SPECIALIST | remote/host | P1 |
| Crawl4AI | crawler/extraction runtime | SPECIALIST | remote/host | P1 |
| ripgrep | lexical code search | SPECIALIST | host binary | P1 |
| Biome | formatter/linter/checker | SPECIALIST | host/CI | P1 |
| Semgrep | static/security analysis | SPECIALIST | host/CI | P2 |
| MarkItDown | document conversion | SPECIALIST | host/remote | P1 |
| Docling | advanced document understanding | SPECIALIST HEAVY | remote/desktop | P2 |
| DuckDB-Wasm | analytical SQL | SPECIALIST | lazy Wasm | P2 |
| OpenTelemetry JS | telemetry standard | SPECIALIST ADAPTER | optional | P2 |
| OPA Wasm | policy engine | EXPERIMENTAL | lazy Wasm | P3 |
| Pyodide | Python/Wasm runtime | EXPERIMENTAL | very heavy, on-demand only | P3 |
| Stagehand | AI browser layer | REJECTED FOR CORE | host | benchmark only |
| Browser Use | AI browser framework | REJECTED FOR CORE | host | benchmark only |

Priority above is Deep Polish research priority, not implementation order.

## Proposed Seven-owned canonical tool families

Search/evidence:
- `web.search`
- `web.search_multi`
- `web.fetch`
- `web.extract`
- `web.map_site`
- `web.crawl_site`
- `web.crosscheck`

Browser:
- `browser.open`
- `browser.snapshot`
- `browser.find`
- `browser.click`
- `browser.type`
- `browser.fill`
- `browser.download`
- `browser.upload`
- `browser.screenshot`
- `browser.trace`
- `browser.close`

Code:
- `code.search_text`
- `code.parse`
- `code.query_ast`
- `code.rewrite_ast`
- `code.lint`
- `code.format_check`
- `code.security_scan`

Documents/data:
- `document.convert`
- `document.extract_structure`
- `data.sql_query`
- `data.analytics_query`

Infrastructure:
- `tool.discover_external`
- `tool.call_external`
- `tool.validate_input`
- `tool.validate_output`
- `policy.evaluate`
- `telemetry.record`

All side-effecting capabilities remain subject to Seven permissions, side-effect ledger, validation and verification.

## High-level decisions proposed for Deep Polish

1. MCP is interoperability, not authority.
2. Search is multi-provider; no provider becomes Seven's permanent truth source.
3. Browser automation is lazy and host/remote, never Android startup weight.
4. Code understanding escalates from cheap lexical methods to AST and only then semantic retrieval.
5. Heavy document understanding is invoked only when lightweight extraction is insufficient.
6. SQLite and DuckDB serve different roles: durable structured state vs analytical workloads.
7. Schema validation should be generated at build time where practical.
8. Seven keeps a tiny native observability core; standards exporters stay optional.
9. AI-inside-AI orchestration wrappers must prove measurable benefit before admission.

## Negative findings preserved

- Open source does not imply Android-bundle suitability.
- A public metasearch instance cannot be assumed to expose machine-readable APIs.
- Browser and Python runtimes can be excellent specialists while still being unacceptable startup dependencies.
- Additional agent/browser planners duplicate Seven's Cognitive Control Plane unless evals prove a clear advantage.
- Heavy document stacks should not replace existing lightweight TXT/PDF paths for ordinary cases.

## Next research gaps

Still open for later waves:
- JavaScript/Wasm sandboxes and WASI-class runtimes
- shell/process sandbox isolation
- Git-native and transactional patch/diff libraries
- OCR/vision
- speech/audio
- embeddings/reranking/vector indexes
- knowledge graphs
- archive/media inspection
- API/webhook/event tools
- secret storage/Android Keystore
- cryptographic integrity/signing
- test runners and vulnerability scanners
- local model runtimes
- RPG/Canon graph/retrieval specialists

## Deep Polish queue

Recommended first queue:

`MCP Adapter → SchemaGuard/Ajv → Tree-sitter → ast-grep → SQLite Wasm/OPFS → BrowserActionBroker/Playwright → SearchBroker → FetchExtractBroker → DocumentIngestBroker → verification specialists`

The first items define contracts, safety, structure and durable state used by later tools.

## Coverage statement

Wave 01 covered interoperability, search, web extraction/crawling, browser automation, code structure/search/rewrite, document ingestion, local SQL/analytics, validation, policy and observability. This is practical saturation for the wave emphasis, not a claim that every possible tool on the internet has been discovered.

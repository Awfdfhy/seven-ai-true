# Wave 01 Evidence — Code, Documents, Data, Validation, Observability

Date: 2026-09-13
Purpose: primary-source evidence ledger supporting `WAVE_01_DISCOVERY_REPORT.md`.

## Tree-sitter

Sources:
- https://tree-sitter.github.io/tree-sitter/
- https://github.com/tree-sitter/tree-sitter

Verified observations:
- incremental concrete-syntax-tree parser designed to remain useful while code is edited or contains syntax errors.
- has native and WebAssembly-friendly integration paths.

Seven implication:
- strong foundation for lazy syntax-aware project maps, structural context selection and post-edit checks.

## ripgrep

Sources:
- https://github.com/BurntSushi/ripgrep/
- https://github.com/BurntSushi/ripgrep/blob/master/README.md

Verified observations:
- fast recursive regex/text search with ignore-file and file-type handling.

Seven implication:
- cheap host-side lexical stage before more expensive AST/semantic retrieval.

## ast-grep

Sources:
- https://ast-grep.github.io/guide/rewrite-code
- https://ast-grep.github.io/reference/yaml

Verified observations:
- AST-aware structural search and rewrite; supports review-oriented rewrite workflows.

Seven implication:
- candidate for precise structural transformations behind Seven patch transactions, tests and verification.

## Biome

Sources:
- https://biomejs.dev/guides/getting-started/
- https://biomejs.dev/linter/
- https://github.com/biomejs/biome

Verified observations:
- combined formatter/linter/check tooling for supported web languages.

Seven implication:
- useful verification specialist for Seven's JS/TS/CSS/JSON surfaces, invoked selectively rather than on every action.

## Semgrep

Source:
- https://semgrep.dev/docs/category/local-and-cli-scans

Verified observations:
- rule-based static/source analysis with local CLI workflows.

Seven implication:
- security-sensitive verification lane, not universal hot-path dependency.

## MarkItDown

Sources:
- https://github.com/microsoft/markitdown/blob/main/README.md
- https://github.com/microsoft/markitdown/blob/main/packages/markitdown/pyproject.toml

Verified observations:
- Python conversion utility supporting multiple office/document formats via optional dependencies.

Seven implication:
- host/remote generic converter for formats beyond Seven's lightweight native paths.

## Docling

Sources:
- https://docling-project.github.io/docling/getting_started/quickstart/
- https://github.com/docling-project/docling

Verified observations:
- advanced document conversion/representation with PDF/office/image and structured layout-oriented pipelines.

Seven implication:
- heavy specialist for difficult tables/layouts, not default mobile ingestion.

## SQLite WebAssembly + OPFS

Sources:
- https://www.sqlite.org/wasm/doc/trunk/index.md
- https://sqlite.org/wasm/doc/tip/persistence.md

Verified observations:
- official SQLite WebAssembly API supports browser-side SQL.
- OPFS-backed persistence exists with multiple VFS strategies.
- official docs state OPFS VFS paths require worker contexts for the relevant implementation.
- `opfs-sahpool` prioritizes performance and avoids COOP/COEP requirements but has concurrency trade-offs.

Seven implication:
- P0 candidate for replacing fragile storage patterns in authoritative structured state, but only after Android WebView compatibility, migration, size and performance benchmarks.

## DuckDB-Wasm

Sources:
- https://duckdb.org/docs/stable/clients/wasm/overview
- https://duckdb.org/docs/current/clients/wasm/extensions

Verified observations:
- analytical SQL engine running in-browser via WebAssembly.
- reads formats such as CSV/JSON/Parquet and supports optional extensions.
- WebAssembly/browser memory and CORS restrictions apply.
- extensions are fetched on demand and checked for signatures by default.

Seven implication:
- analytical data specialist, not default Seven state database. Lazy-load only for data-heavy tasks.

## Ajv standalone validation

Sources:
- https://ajv.js.org/standalone.html
- https://ajv.js.org/guide/why-ajv.html

Verified observations:
- Ajv can compile JSON Schema/JTD validation functions during build time.
- generated standalone functions can run without initializing/bundling Ajv at runtime, reducing startup/bundle overhead and dynamic code generation requirements.

Seven implication:
- exceptionally strong P0 candidate for `SchemaGuard`: keep canonical tool schemas, generate only required validators during build/CI, and validate every tool boundary.

## Open Policy Agent Wasm

Sources:
- https://www.openpolicyagent.org/docs/wasm
- https://www.openpolicyagent.org/docs/integration

Verified observations:
- Rego policy can be compiled/evaluated through WebAssembly integration.

Seven implication:
- experimental escalation path if permissions become too complex for a small native policy engine. Do not add its weight before complexity justifies it.

## OpenTelemetry JavaScript

Sources:
- https://opentelemetry.io/docs/languages/js/
- https://opentelemetry.io/docs/languages/js/getting-started/browser/

Verified observations:
- JS traces and metrics are stable components; logs are still under development in current docs.
- official docs warn browser client instrumentation is experimental/mostly unspecified.

Seven implication:
- Seven should own a tiny stable telemetry/event schema and optionally export through OpenTelemetry rather than shipping a large browser instrumentation stack by default.

## Pyodide

Sources:
- https://pyodide.org/en/stable/usage/index.html
- https://pyodide.org/en/stable/usage/downloading-and-deploying.html

Verified observations:
- CPython runs through WebAssembly and can use Web Workers.
- browser networking/security restrictions remain.
- full distribution is very large compared with Seven's mobile budget.

Seven implication:
- experimental/on-demand specialist only, never normal startup or APK payload without an exceptional eval result.

## Proposed code-understanding escalation

1. filename/project index
2. lexical/text search
3. Tree-sitter structural index/query
4. ast-grep precise query/rewrite
5. semantic/vector retrieval when structural methods cannot answer
6. linter/static-analysis/tests for verification

## Proposed document escalation

1. local TXT/existing PDF path
2. lightweight native parser
3. general host converter
4. advanced layout/table specialist
5. OCR/VLM only when extraction evidence shows it is needed

All proposals remain subject to individual Deep Polish and Seven Evals.

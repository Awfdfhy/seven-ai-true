# Seven Tool Fabric 2.0 — Wave 15 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 15. No renderer/statistics dependency is frozen.
Governing command: `WAVE_15_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should own a small, typed **Analysis Presentation Plane** instead of exposing arbitrary chart-library APIs to the model.

Architecture:

1. `DataAnalysisEngine` — deterministic SQL/typed transforms.
2. `StatsEngine` — focused statistical operations with explicit assumptions.
3. `TableSpec` — canonical typed tabular result contract.
4. `ChartSpec` — canonical safe visualization contract.
5. `VisualizationValidator` — schema + semantic truthfulness checks.
6. `VisualizationRenderer` — replaceable lazy renderer.
7. `AnalysisArtifact` — reproducibility package linking source, query/transforms, statistics and presentation.

The analytical result exists before the chart. A renderer never owns analytical truth.

## Candidate registry

| Candidate | Kind | Preliminary class | Seven role |
|---|---|---|---|
| SQLite | local SQL | CORE | small/authoritative local structured data and ordinary analysis |
| DuckDB-Wasm | analytical SQL/Wasm | SPECIALIST | larger CSV/Parquet/JSON and analytical workloads, lazy worker |
| simple-statistics | JS statistics | CORE/SPECIALIST CANDIDATE | focused descriptive/regression/inference functions |
| Arquero | JS table transforms | SPECIALIST CANDIDATE | in-memory tabular transforms when SQL is awkward |
| Vega-Lite | declarative visualization grammar | REFERENCE / SPECIALIST RENDERER | strongest grammar inspiration, optional rich renderer |
| Observable Plot | SVG visualization library | SPECIALIST RENDERER | exploratory/accessibility-friendly charts |
| Chart.js | canvas chart library | SPECIALIST LIGHT RENDERER | compact common charts with tree-shaking |
| Apache ECharts | rich visualization system | SPECIALIST HEAVY | advanced/high-volume visualizations only if justified |
| Apache Arrow JS | columnar interchange | SPECIALIST | zero/low-copy interchange where DuckDB/large datasets benefit |
| D3 low-level API | visualization primitives | REJECT AS CANONICAL MODEL API | renderer implementation dependency only if required |

## Data execution hierarchy

Preferred ladder:

`small typed JS/table → SQLite SQL → DuckDB-Wasm analytical SQL → optional host/remote analysis`

Seven should not instantiate DuckDB-Wasm for a ten-row table. DuckDB-Wasm remains lazy because it brings Wasm/worker assets and browser memory limits; its default browser path is single-threaded unless cross-origin-isolation requirements for threading are met.

Sources:
- https://duckdb.org/docs/stable/clients/wasm/overview
- https://duckdb.org/docs/current/clients/wasm/instantiation

## TableSpec

Canonical result contains:

- `tableId`
- source refs/hashes
- query/transform lineage
- ordered column definitions
- type per column
- unit/currency/timezone metadata where relevant
- nullable/missing-value semantics
- row count before and after filters
- displayed row count
- sort/group/aggregation disclosure
- sampling/truncation disclosure
- rows or paged result reference
- generated timestamp
- engine/version

Column types should distinguish at least:
- string/category
- integer
- decimal/number
- boolean
- instant
- local date/time
- duration
- unit-valued number
- identifier

Formatting is separate from the underlying value.

## StatsEngine

### simple-statistics

The project provides browser/Node statistical functions including descriptive statistics, distributions and regression and is dependency-free according to upstream documentation.

Seven role:
- strong focused candidate for deterministic statistics without shipping a scientific mega-runtime
- expose only reviewed functions through Seven contracts
- each operation records sample size, missing-value policy and assumptions

Source:
- https://simple-statistics.github.io/
- https://github.com/simple-statistics/simple-statistics

Canonical initial operations:
- count/non-null count
- min/max/range
- sum/mean/weighted mean
- median/quantiles
- variance/standard deviation
- IQR/MAD where supported/implemented
- correlation
- simple regression
- histogram/bin summaries

Do not label a statistical test or regression conclusion as causal evidence.

## In-memory transforms

### Arquero

Arquero supplies array/column-oriented table operations including filtering, sampling, aggregation, window operations, joins and reshaping, with browser support and targeted imports.

Seven role:
- specialist when data is already resident in JS and spinning up SQL is unnecessary
- not a second canonical data model
- transforms must be serialized into Seven lineage rather than hidden in arbitrary callback functions

Source:
- https://github.com/uwdata/arquero

## ChartSpec

Seven-owned ChartSpec should deliberately be smaller than a full chart-library API.

Recommended fields:

- chart id/title/subtitle
- source `TableSpec`/analysis artifact id
- mark family: line/bar/point/area/histogram/box/heatmap initially
- x/y/color/size/facet channels by column id
- aggregation declaration
- sort/order
- scale type
- explicit domain overrides
- unit/format
- baseline policy
- missing-value policy
- sampling/downsampling metadata
- annotations backed by data refs
- legend/axis labels
- accessibility title/description
- RTL/locale formatting metadata
- renderer hints that do not change analytical meaning

No arbitrary JavaScript callbacks, HTML, URLs, DOM selectors or eval expressions are accepted in canonical ChartSpec.

## Vega-Lite

Vega-Lite is a high-level declarative JSON grammar with composition and a broad transform system including aggregation, binning, filtering, sampling, regression and window transforms. SVG output supports generated ARIA attributes by default.

Seven decision:
- use Vega-Lite as the strongest reference model for declarative visualization semantics
- optionally use it as a lazy rich renderer/compiler
- **do not** make the full Vega-Lite grammar canonical Seven model output because it is far broader than the safe/mobile initial need and embeds a second transformation language
- if used, translate validated Seven ChartSpec into Vega-Lite rather than accepting raw model-created Vega-Lite as trusted

Sources:
- https://vega.github.io/vega-lite/docs/
- https://vega.github.io/vega-lite/docs/transform.html
- https://vega.github.io/vega-lite/docs/config.html

## Observable Plot

Plot uses layered marks/scales/transforms and produces SVG/HTML figures. It has explicit accessibility support using ARIA labels/descriptions on plot and marks.

Strengths for Seven:
- SVG accessibility
- strong exploratory data grammar
- concise common visualizations
- integrated aggregating/window/transformation primitives

Limit:
- Plot is intentionally JavaScript-extensible, including functions/custom transforms. That flexibility must stay behind a Seven renderer adapter; the model never receives raw executable Plot configuration.

Sources:
- https://observablehq.com/plot/features/accessibility
- https://observablehq.com/plot/features/marks
- https://observablehq.com/plot/features/transforms

## Chart.js

Chart.js supports tree-shaking so Seven can include only needed controllers/elements/scales. It includes built-in line-series decimation such as min/max and LTTB.

Accessibility caveat:
- Canvas content is not inherently screen-reader accessible; applications must provide ARIA/text alternatives.

Seven role:
- strong lightweight renderer benchmark for common charts
- if selected, Seven must always generate textual/tabular accessibility fallback rather than treating canvas as sufficient

Sources:
- https://www.chartjs.org/docs/latest/getting-started/usage.html
- https://www.chartjs.org/docs/latest/configuration/decimation.html
- https://www.chartjs.org/docs/latest/general/accessibility.html

## Apache ECharts

ECharts provides many chart types, Canvas/SVG rendering, progressive rendering/stream loading and accessibility features including chart descriptions/decal patterns.

Seven role:
- advanced specialist benchmark for high-volume/complex chart types
- likely excessive as the default mobile renderer unless bundle/performance eval demonstrates enough additional value

Source:
- https://echarts.apache.org/en/

## Arrow decision

Apache Arrow is an efficient language-independent columnar format and JS implementation useful for analytical interchange and reduced conversion between columnar engines.

Seven decision:
- use only when a real DuckDB/large-data pathway benefits
- do not introduce Arrow merely to represent ordinary chat tables; `TableSpec` remains canonical

Sources:
- https://arrow.apache.org/docs/format/Columnar.html
- https://arrow.apache.org/js/current/

## Reproducible AnalysisArtifact

Every non-trivial analytical answer can retain:

- artifact id
- source object ids + immutable hashes/versions
- extraction/import settings
- query text or normalized typed transform plan
- engine + version
- parameter values
- filters
- missing-value policy
- sampling/downsampling plan
- row counts through stages
- statistical operations + parameters
- resulting TableSpec hash
- ChartSpec hash if present
- renderer/version for visual artifact
- generated timestamp
- warnings/uncertainties

This allows Seven to recompute an analysis after source change and explain why two outputs differ.

## Visualization truthfulness validator

Before rendering, validate:

- referenced columns exist and types are compatible
- aggregation is explicit
- units on compared axes are compatible/disclosed
- log scales reject invalid values and are clearly labeled
- truncated/non-zero baselines are flagged for chart classes where they may materially distort magnitude
- missing values are not silently converted to zero
- category ordering is deterministic/disclosed
- dual-axis charts are rejected by default or require an explicit advanced policy
- sampling/downsampling is disclosed
- percentages state denominator
- dates preserve timezone semantics
- excessive precision is not invented

A chart can be syntactically valid yet misleading; this validator is separate from SchemaGuard.

## Large data

Rules:
- never send millions of raw points into the DOM/canvas simply because renderer permits it
- aggregate/bin/downsample before render under a declared algorithm
- preserve original row count and displayed/aggregated count
- if Chart.js decimation or renderer-specific optimization is used, capture its algorithm/parameters in presentation evidence
- analytical calculations should operate on full intended data unless the analysis itself explicitly samples

## Accessibility / Arabic / RTL

Every ChartSpec should yield:
- textual title/description
- underlying table access or summary
- locale-aware numeric/date formatting
- Bidi-isolated mixed labels where needed
- touch-friendly legend/details
- no meaning carried by color alone

SVG ARIA support from a renderer is additive, not a substitute for a data/table alternative.

## Android/startup strategy

- TableSpec/ChartSpec validators: tiny core.
- simple deterministic table/stat functions: bundle only if measured small enough, otherwise lazy.
- DuckDB-Wasm: lazy worker only for analytical tasks.
- renderers: dynamic/lazy modules; never all renderers.
- choose one default after bundle/startup/frame benchmarks.
- ECharts/Vega stack remains specialist if its weight exceeds expected use.
- no chart library runs during chat startup.

## Rejected approaches

- model calculates statistics in prose when deterministic data is available: rejected
- arbitrary model-generated JavaScript visualization: rejected
- chart-library config becomes canonical state: rejected
- raw Vega-Lite/Plot function expressions trusted from model: rejected
- silent row truncation/downsampling: rejected
- canvas chart without accessible alternative: rejected
- DuckDB-Wasm loaded for every tiny table: rejected
- Arrow as universal Seven table representation: rejected
- chart screenshot as the only analysis artifact: rejected
- inference of causality from correlation/regression by StatsEngine: rejected

## Canonical capabilities

- `data.query`
- `data.transform`
- `data.describe`
- `data.stat.compute`
- `table.spec.create`
- `chart.spec.create`
- `chart.spec.validate`
- `chart.render`
- `analysis.artifact.create`
- `analysis.recompute`

## Required Evals

Before Freeze:
- same analysis recomputes to same typed result from same source/version
- missing/NaN/null handling is explicit
- malicious/generated ChartSpec cannot execute code
- misleading axis/domain canaries are detected
- large datasets remain responsive under declared aggregation/decimation
- table remains usable when chart renderer fails
- Arabic/RTL and mixed labels render legibly
- accessible text/table equivalent exists for every chart
- renderer swap does not alter analytical values
- startup unaffected until analysis feature is invoked

## Deep Polish queue

`TableSpec → AnalysisArtifact → SQL execution ladder → StatsEngine/simple-statistics → ChartSpec → VisualizationValidator → renderer bakeoff (Chart.js vs Observable Plot vs Vega-Lite subset) → large-data policy → accessibility/RTL → DuckDB-Wasm specialist → advanced ECharts only if justified`

## Coverage statement

Wave 15 closes the high-value discovery gap around reproducible analysis and typed visualization. Final renderer selection is intentionally deferred to bundle/accessibility/performance Evals rather than chosen by feature count.

No production integration occurred. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.

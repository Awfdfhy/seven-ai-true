# Seven Tool Fabric 2.0 — Wave 15 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: data analysis, statistics, typed tables, safe visualization, reproducible analytical artifacts.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 15

Goal: let Seven answer data questions with deterministic computation and reproducible visual evidence instead of model arithmetic or arbitrary generated HTML/JavaScript.

Research current maintained libraries and standards, prioritizing lightweight mobile-safe components and declarative/typed output. Reuse SQLite/DuckDB roles from Wave 01 and parsing utilities from Wave 05.

Research at minimum:
- analytical SQL and local tabular execution
- typed table/result schemas
- descriptive statistics and distributions
- grouping/window/aggregation transforms
- dataframe-like JS transforms only where SQL is insufficient
- declarative chart grammars
- chart rendering candidates and bundle cost
- large-dataset sampling/downsampling/aggregation
- accessibility and textual equivalents
- Arabic/RTL labels and mixed-direction content
- chart truthfulness: domains, zero baselines where appropriate, units, missing data, aggregation disclosure
- reproducible analysis artifacts
- export of chart/table data/specs
- safe generated UI boundary

Rules:
- numbers shown to users must trace to source rows/query/transforms.
- model-generated chart specs are untrusted until schema and semantic validation passes.
- do not run arbitrary generated JavaScript to render charts.
- do not silently truncate/filter data; disclose sampling/aggregation/missing rows.
- preserve raw source lineage and query/transform versions.
- chart renderer is replaceable and must not become canonical analytical state.
- prefer SQL/typed deterministic transforms to model calculation.
- keep heavy renderers lazy and off startup path.

Output:
1. DataAnalysisEngine architecture
2. TableSpec and ChartSpec contracts
3. statistics/transform candidate registry
4. renderer candidate comparison
5. reproducibility/lineage contract
6. accessibility/truthfulness rules
7. Android/startup strategy
8. rejected approaches
9. Deep Polish queue and eval gates

Preserve findings in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.

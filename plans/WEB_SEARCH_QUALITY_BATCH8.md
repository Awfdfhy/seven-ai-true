# Web Search v2 — Batch 8: Search Quality & Evidence Precision

Date: 2026-10-02
Status: PLANNED — starts after Batch 7 Android gate
Depends on: Web Search v2 Batches 1–7

## Goal

Polish Search/Research quality after the architecture is complete. Batch 8 targets bad-but-plausible evidence: weak ranking, redundant sources, citation drift, stale current evidence, and unnecessary latency.

## Workstreams

### 1. Evidence precision reranker
- rerank at evidence-unit level after page reading, not only search-result level
- combine lexical coverage, source appropriateness, freshness, read state, primary-source preference, host diversity, and query/subquestion coverage
- never expose a single opaque truth score
- preserve score components in safe diagnostics

### 2. Diversity-aware selection
- cap redundant evidence from one host
- avoid spending context on syndicated/near-identical evidence
- reserve context slots for counterevidence/conflicts and missing comparison sides
- prefer primary + independent corroboration over many copies of the same claim

### 3. Citation integrity v2
- audit every emitted [S#]/[R#] against the actual evidence ledger
- detect orphan citations, unknown IDs, citation-only paragraphs, and uncited factual paragraphs in Research mode
- never invent a citation to repair coverage
- if evidence is insufficient, mark the claim unsupported/inconclusive instead

### 4. Current-information freshness gate
- current/news queries require fresh evidence when available
- stale-only evidence produces PARTIAL/INCONCLUSIVE rather than confident synthesis
- preserve evergreen official docs when age is not a meaningful defect

### 5. Search early-stop
- stop additional low-value retrieval/read work once evidence sufficiency is reached
- never early-stop while a required comparison side, primary source, or strong conflict is unresolved
- cancellation remains authoritative

### 6. Research context packer v2
- allocate context by coverage need, not raw ranking alone
- primary evidence first where appropriate
- then independent corroboration
- then conflicts/counterevidence
- then background
- enforce host/source-type diversity

### 7. Quality diagnostics
Expose safe aggregate metrics:
- citationCoverage
- unknownCitationCount
- hostDiversity
- sourceTypeDiversity
- redundantEvidenceDropped
- staleEvidenceCount
- unresolvedRequiredCoverage
- earlyStopReason
No raw hidden reasoning, credentials, or full page bodies.

## Tests

1. duplicate-host evidence cannot crowd out independent corroboration
2. primary docs win when technical intent requests documentation
3. current query with stale-only evidence cannot report SUFFICIENT
4. unknown R#/S# citations are detected
5. citation audit never fabricates replacement IDs
6. unresolved conflict blocks premature early-stop
7. fully covered low-conflict search can early-stop
8. context packer preserves both sides of comparisons
9. context packer preserves counterevidence
10. Search v2 Batches 1–7 regression suite remains green
11. RTL/320px source UI remains usable
12. Android API 36 WebView gate passes

## Acceptance

Batch 8 is complete when Seven not only finds/reads evidence, but reliably chooses the most useful diverse evidence, cites only ledger-backed sources, treats stale current evidence conservatively, and stops retrieval when additional work is unlikely to improve the answer.

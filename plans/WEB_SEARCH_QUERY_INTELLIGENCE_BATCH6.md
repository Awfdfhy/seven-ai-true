# Web Search v2 — Batch 6: Query Intelligence + Primary Source Discovery

Date: 2026-10-02
Status: IMPLEMENTATION READY
Parent: WEB_SEARCH_OVERHAUL_V2.md

## Objective

Improve the quality of what Seven searches for before retrieval begins.

Batches 1–5 established:
- multi-source retrieval;
- general-web gateway + controlled reader;
- evidence/citations/freshness;
- bounded gap/conflict follow-up;
- caches, stage UI, and deterministic evaluation.

The remaining normal-Search weakness is planning precision. Batch 6 replaces the shallow query planner with a deterministic, source-aware planner that asks the smallest useful set of complementary queries.

No extra LLM planning call is added to normal Search.

## 1. Intent taxonomy

`analyzeSearchIntentV2()` expands from boolean flags into an explicit type:

- current_fact
- evergreen_fact
- technical
- comparison
- how_to
- news
- academic
- navigational
- product_entity
- exploratory

Also expose:
- timeSensitive
- technical
- comparison
- likelyHowTo
- academic
- navigational
- sourceNeeds
- entities
- keyTerms
- ambiguity

Intent labels guide retrieval strategy; they do not make factual claims.

## 2. Entity + key-term extraction

Deterministic extraction only.

Preserve high-information tokens:
- product/model names
- acronyms
- versions
- code/library identifiers
- capitalized Latin entities
- Arabic noun-like terms after stop-word filtering
- quoted phrases

Do not send raw conversation history into the planner.

Return bounded arrays:
- entities <= 8
- keyTerms <= 12

## 3. Source needs

Planner derives source goals:

Technical:
- official documentation / vendor docs
- independent corroboration when question concerns performance/bugs

Current/news:
- current primary/official source
- independent recent report

Comparison:
- source for subject A
- source for subject B
- independent comparison/corroboration

Academic:
- academic/primary research
- institutional/reference corroboration

How-to:
- official instructions/documentation first
- specialist guide second

Navigational:
- official site/page only when possible

Evergreen/general:
- strong reference + independent corroboration

## 4. Query objects

Extend query schema:

- id
- text
- language
- purpose
- priority
- sourceTypeHint
- domainHint
- recencyHint
- entityGroup
- coverageKey

No query may carry credentials, memory content, or unrelated chat history.

## 5. Comparison decomposition

For clear X vs Y / compare requests:

Generate complementary queries, not paraphrases:
1. X official specifications/docs
2. Y official specifications/docs
3. X Y independent comparison

Maximum normal initial queries increases from 3 to 5 only for intents that justify it.

If subjects cannot be extracted reliably, fall back to ordinary planner instead of inventing entities.

## 6. Technical planning

Examples:

"Android 16 WebView API changes"
- original/high-priority query
- Android WebView official documentation Android 16
- independent compatibility/changes source if current

"Python asyncio timeout"
- original
- Python official documentation asyncio timeout

Technical query planning should increase the probability of documentation without hard-coding one vendor domain.

## 7. Current/news planning

Generate:
- original query
- current year/date variant
- official/primary-source variant
- independent-source variant only when evidence diversity matters

Recency hint is explicit:
- day
- week
- month
- null

Gateway receives query-specific recency/source hints where supported.

## 8. Arabic bilingual planning

Arabic remains first-class.

Rules:
- always preserve Arabic primary query;
- Arabic current/local questions keep an Arabic-source query;
- if Latin technical/product entities are present, add an English technical/entity query;
- do not convert the whole request to English;
- do not add an English variant merely because the language is Arabic if it adds no retrieval value.

## 9. Source classifier

Add `classifySearchSourceTypeV2(candidate)`.

Use conservative URL/title/path heuristics to classify:
- government
- academic
- documentation
- official
- primary
- reference
- specialist
- community
- social
- commercial
- unknown

Examples of signals:
- .gov / government domains -> government
- docs/developer/reference/api paths -> documentation
- DOI/arXiv/edu/research/journal paths -> academic
- Wikipedia -> reference
- GitHub issues/discussions, Stack Overflow, Reddit/forum paths -> community

Do not infer that a domain is "official" merely because it is first in search results.

Gateway-supplied sourceType may be preserved when it is already a recognized stronger classification; otherwise client heuristic can enrich unknown.

## 10. Intent-relative source scoring

Replace universal source-type boost with intent-aware boost.

Examples:
- technical: documentation/official strongest
- academic: academic/primary strongest
- news/current: primary/government + specialist/reputable news
- comparison: official sources useful but independent specialist evidence also valuable
- experiential/how-to: documentation + specialist/community can be appropriate

Relevance remains the largest factor. Source type cannot rescue an irrelevant result.

## 11. Query coverage

Each evidence unit keeps:
- coverageKey
- queryPurpose

Diagnostics expose:
- plannedCoverageKeys
- coveredCoverageKeys
- uncoveredCoverageKeys
- sourceNeedCoverage

Gap analysis can use these fields later instead of token overlap alone.

## 12. Gateway integration

`POST /v1/search` request may additionally include:
- sourceTypeHint
- domainHint

Worker treats hints as advisory.

Backends that cannot apply a hint ignore it safely.
No provider-specific query syntax is exposed to the WebView.

## 13. Performance

- planner is deterministic and synchronous;
- no additional model call;
- at most 5 initial queries;
- ordinary evergreen questions remain near 1–3 queries;
- cache key includes retrieval-affecting source/recency hints;
- existing Search stage UI remains truthful.

## 14. Diagnostics

Safe metadata only:
- intentType
- entityCount
- keyTermCount
- sourceNeeds
- queryPurposeCounts
- plannedCoverageKeys
- coveredCoverageKeys
- uncoveredCoverageKeys
- sourceTypeDistribution

Do not expose raw query text/entities in global diagnostics.

## 15. Evaluation extensions

Extend deterministic corpus with planner expectations:

- technical fixture expects documentation query
- comparison expects A/B/independent coverage
- current factual expects freshness + primary query
- Arabic technical expects Arabic primary + useful English entity query
- navigational expects official-targeted query
- academic expects academic source need

Source classifier fixtures cover:
- government
- documentation
- academic
- reference
- community
- unknown

## 16. Tests

1. intent taxonomy deterministic
2. technical query gets documentation source need
3. comparison decomposes into A/B/independent when entities are extractable
4. ambiguous comparison falls back safely
5. current query gets bounded freshness/primary coverage
6. Arabic primary query is never removed
7. Arabic technical query may add useful English entity query
8. query count remains <=5
9. sourceTypeHint reaches Gateway payload
10. source classifier recognizes gov/docs/academic/reference/community
11. unknown domain remains unknown
12. intent-relative scoring favors docs for technical near-ties
13. intent-relative scoring does not let irrelevant docs beat highly relevant evidence
14. query coverage metadata propagates to evidence
15. diagnostics contain counts/coverage IDs only, not raw user query text
16. Batch 1–5 regression tests remain green
17. deterministic quality corpus passes
18. Android release gate passes after merge

## Acceptance criteria

Batch 6 is complete when:
- normal Search plans complementary rather than redundant queries;
- primary/docs discovery improves for technical/current questions;
- comparisons obtain balanced subject coverage when safely parseable;
- Arabic behavior remains first-class;
- source ranking is intent-relative and transparent;
- no extra LLM request is introduced;
- full CI and Android API 36 emulator gate pass.

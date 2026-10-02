# Web Search v2 — Batch 5: Performance Cache, Stage UI & Quality Evaluation

Date: 2026-10-02
Status: COMPLETE — browser CI + Android release gate passed
Parent: WEB_SEARCH_OVERHAUL_V2.md

## Objective

Make Search v2 faster on repeated/overlapping work, visibly honest about what stage it is performing, and objectively measurable with a deterministic quality corpus.

This batch does not add another search provider. It polishes the retrieval engine already built in Batches 1–4.

## 1. Request-local + session cache

Two bounded in-memory caches:

### Query result cache
Stores normalized adapter outputs keyed by:
- adapter
- normalized query
- language
- recency class

TTL:
- time-sensitive/current query: 5 minutes
- ordinary query: 30 minutes

Bounds:
- max 80 entries
- LRU eviction
- no API keys
- no auth headers
- no raw user conversation
- no persistent localStorage copy

### Page read cache
Stores safe extracted reader output keyed by canonical URL.

TTL:
- time-sensitive search: 15 minutes
- ordinary search: 2 hours

Bounds:
- max 40 pages
- excerpt hard cap remains 12K chars
- only reader-safe extracted text/metadata
- no raw HTML
- no cookies/headers/secrets
- LRU eviction

Cache policy never upgrades a read state or freshness beyond the cached truth.

## 2. Per-request no-repeat set

Within one Search request:
- never search the exact same adapter/query twice
- never read the same canonical URL twice
- first-wave read state is preserved through follow-up
- follow-up sees the same request-local cache

This is independent of session cache.

## 3. Stage UI

Normal Search exposes only stages that actually occur:

1. Planning search
2. Searching N queries
3. Reading N sources
4. Checking evidence
5. Follow-up search (only when triggered)
6. Answering

No fake stage.

Implementation:
- performWebSearchV2(question, { onStage })
- bounded stage payload: name, message, queryCount/pageCount
- buildContext reuses the existing temporary search status bubble and updates it
- stage updates contain no queries/source bodies/secrets

## 4. Cache diagnostics

SevenSearchV2.snapshot() adds:
- queryCacheHits
- queryCacheMisses
- pageCacheHits
- pageCacheMisses
- adapterRequests
- networkSearchRequests
- readerNetworkRequests
- stageNames
- elapsedMs

Safe global cache diagnostics:
- entry counts only
- no cache keys
- no query text
- no page text

## 5. Quality evaluation corpus

Add a deterministic corpus covering:
1. current factual
2. Arabic current factual
3. technical official docs
4. ambiguous entity
5. comparison
6. recent news
7. historical fact
8. conflicting reports
9. niche topic
10. Arabic-source-sensitive topic
11. blocked reader
12. no useful results

Each fixture declares expected properties, not a political or subjective ranking:
- requiresFreshness
- requiresPrimaryOrDocs
- minimumHostDiversity
- expectedGapCodes
- expectedConflictSignal
- expectedReadStateClass

## 6. Evaluation metrics

Deterministic metrics:
- unique URL ratio
- independent host count
- strong-source presence
- fresh-source presence when required
- read-evidence ratio
- citation source-ID consistency
- gap detection correctness
- conflict-signal correctness

No single aggregate score hides failures.

## 7. Cache invalidation

Clear session cache when:
- Search Gateway URL changes
- Gateway client key changes
- explicit SevenSearchV2.clearCache()
- schema version changes

Do not clear for model selection changes because Search retrieval is model-independent.

## 8. Tests

1. current query TTL shorter than evergreen TTL
2. repeated adapter/query hits cache
3. cache misses call network exactly once
4. page read cache prevents duplicate reader calls
5. cache LRU remains bounded
6. cache snapshot exposes counts only
7. changing Gateway settings clears cache
8. stage order is deterministic for sufficient first wave
9. follow-up stage appears only on insufficient evidence
10. no Reading stage when reader is unavailable
11. stage payload does not expose query/source body/keys
12. Stop/cancellation remains authoritative
13. quality corpus has all 12 categories
14. corpus metrics detect duplicate-heavy fixture
15. corpus metrics detect missing freshness
16. corpus metrics detect strong-source presence
17. existing Batch 1–4 tests remain green
18. Android release gate passes after merge

## Acceptance criteria

Complete when:
- repeated normal searches make fewer network calls;
- same page is not re-read unnecessarily;
- user sees truthful stage progression;
- cache contents remain memory-only and bounded;
- deterministic quality corpus ships with the repository;
- full browser CI and Android gate pass.

## Completion record

- Implementation PR: #36
- Tested head SHA: `2fe29640544f08b377580c8d093a95020d053fc8`
- Browser CI: Seven AI tests #2281 — PASS
- Merge SHA: `71b7d93fe1b89254266dc81c927c0950a97d2520`
- Main browser CI: #2282 — PASS
- Android workflow: Seven Android APK #293 — PASS
- Android run id: `36994615183`
- API 36 / Android 16 WebView emulator smoke: PASS
- Final APK verification + artifact upload: PASS
- Evidence limitation: emulator evidence only; not a physical-device benchmark.

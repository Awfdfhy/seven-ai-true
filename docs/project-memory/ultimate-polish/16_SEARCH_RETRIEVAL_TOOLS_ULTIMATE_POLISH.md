# Seven AI — Capability 16 Search / Retrieval Tools Ultimate Polish

Status: **FREEZE CANDIDATE — architecture only**
Campaign: Seven Ultimate Polish Protocol v2.1
Target: **Seven Retrieval Fabric 3.0 — Adaptive Evidence Discovery Mesh**

## 1. Prime law

> Retrieval finds candidates; it does not manufacture evidence, truth, authority, freshness, or completion.

Search results, snippets, ranks, embeddings and reranker scores are discovery signals. A candidate becomes usable evidence only after source identity/version, retrieval, extraction and epistemic validation are established by the owning systems.

## 2. Ground truth

Seven already has Research verification foundations, Tool Fabric capability normalization, Context selection, Adaptive Compute budgets and provider abstraction. Search/fetch acquisition remains partial and is not yet a production-complete broker. Tool Fabric 2.0 already names SearchBroker, FetchExtractBroker and BrowserActionBroker.

The final architecture must preserve those mature boundaries instead of creating a second research system.

## 3. Research and competitive sweep

Recent retrieval evidence reinforces several design choices:

- Akarsu et al. (2026), `From BM25 to Corrective RAG`, benchmarked sparse, dense, hybrid, reranking, expansion and adaptive retrieval on mixed text/table financial QA. Hybrid + neural reranking led overall, while BM25 beat dense retrieval on that corpus and expansion/adaptive methods had limited benefit for precise numerical queries.
- SemEval-2026 MTRAG systems show practical value from query rewriting + hybrid BM25/dense + cross-encoder reranking, while some more complex multi-query strategies can degrade performance.
- Evidence-grounded RAG work in 2026 continues to separate candidate retrieval, reranking and claim-level grounding verification.

Conclusion: Seven must not canonize dense/vector retrieval, query expansion, multi-query or learned reranking as universally superior. Strategy is task-shaped and evaluated.

## 4. Pass A — maximize retrieval capability

### 4.1 Canonical objects

- `RetrievalNeed`
- `QueryPlan`
- `QueryVariant`
- `SearchProviderBinding`
- `SearchObservation`
- `CandidateDocument`
- `CandidateCluster`
- `FetchRequest`
- `FetchedSourceRef`
- `ExtractedSegmentRef`
- `RetrievalFrontier`
- `RetrievalRunManifest`
- `RetrievalHealthSnapshot`

### 4.2 Retrieval need classes

The governor classifies the need before spending retrieval budget:

- `EXACT_LOOKUP`
- `NAVIGATIONAL`
- `FRESH_FACT`
- `BROAD_DISCOVERY`
- `CLAIM_GAP`
- `CONTRADICTION_RESOLUTION`
- `AUTHORITY_UPGRADE`
- `KNOWN_CORPUS`
- `PROJECT_SEARCH`
- `CANON_LOOKUP`
- `CODE_SYMBOL_LOOKUP`

Classification selects a strategy envelope, not an answer.

### 4.3 Progressive retrieval ladder

1. exact/keyed lookup when identifiers are available
2. cheap lexical/BM25/FTS path
3. structured filters and metadata constraints
4. optional dense/semantic retrieval
5. hybrid fusion when justified
6. optional reranking of a bounded frontier
7. query rewriting/decomposition when the current query demonstrably under-specifies the need
8. provider diversification when coverage/health requires it
9. fetch/extract top candidates
10. research/epistemic gap check
11. bounded follow-up retrieval only if expected evidence gain justifies it
12. browser escalation only when ordinary search/fetch cannot obtain the needed material

### 4.4 Candidate discovery is not evidence acquisition

A search result stores:

- provider
- provider result id if available
- observed URL/URI
- title/snippet
- rank
- query variant
- retrieval timestamp
- provider metadata

It does **not** become a `SourceVersion` merely because a snippet exists.

FetchExtractBroker resolves the source, content identity, version/hash where possible, MIME/type, retrieval time and exact extract locators.

### 4.5 Ranking contract

Ranking may optimize:

- lexical/semantic relevance
- query intent fit
- freshness need
- source diversity
- duplicate reduction
- expected evidence gain
- fetch cost
- latency
- provider health

Ranking may **never** grant epistemic authority or turn repeated copies into independent evidence.

### 4.6 Hybrid retrieval

Sparse, dense, structured and graph signals are independent inputs. Fusion is explicit and versioned. Seven may use RRF or another validated method, but no fusion constant is canonical without eval evidence.

Dense retrieval is optional and lazy. Lite mode must remain useful without an embedding model or vector database.

### 4.7 Query planning

Query rewriting is allowed when:

- conversational references must be resolved;
- a compound need requires subqueries;
- terminology/aliases block recall;
- a contradiction requires targeted opposing evidence;
- freshness needs a date/version constraint.

Every query variant carries lineage to the original `RetrievalNeed`. Rewriting must not silently change the claim being researched.

### 4.8 Deduplication and independence

Dedup layers:

- normalized canonical URI when safe
- source identity
- content hash/version identity
- syndication/republication cluster
- near-duplicate text cluster

Deduplication does not erase provenance. Research Fabric uses dependency clusters to avoid counting syndicated copies as independent support.

### 4.9 Freshness

Freshness is claim-scoped, not globally assigned to a source. Search can prioritize recent material, but Epistemic/Research systems decide whether the evidence meets the actual freshness contract.

### 4.10 Stopping rule

Stop retrieval when one of these holds:

- required exact source found and validated;
- CoverageContract is satisfied;
- contradictions are sufficiently characterized;
- marginal evidence gain falls below policy threshold;
- budget exhausted;
- provider/corpus cannot supply the needed evidence;
- further search would be redundant.

Return `INCONCLUSIVE`/gap information rather than endlessly searching.

## 5. Browser escalation boundary

BrowserActionBroker is not the default search tool. It is used for content requiring interaction, dynamic rendering, pagination not exposed by fetch, or user-authorized navigation.

Search text, fetched pages and browser content remain untrusted contextual data and cannot become privileged instructions.

## 6. Multi-provider resilience

Provider bindings are health-scoped and independently versioned. SearchBroker supports:

- provider health/circuit breaker
- rate-limit/backoff state
- capability profile
- locale/language profile
- freshness behavior
- structured result support
- privacy/credential requirements
- fallback routing

Provider switching must not duplicate the whole result set blindly. The broker tracks query/provider coverage and avoids redundant spending.

## 7. Caching

Cache identity includes where relevant:

- normalized query/need class
- query-plan version
- provider binding/revision
- locale
- authenticated principal/scope
- freshness window
- filter set

A cache hit is a retrieval optimization, never proof that source content has not changed. Source freshness/version validation remains separate.

## 8. Arabic and multilingual retrieval

Arabic is first-class:

- preserve original query text
- derive normalized search forms separately
- handle Arabic/Latin mixed queries
- avoid destructive normalization of names/identifiers
- support transliteration/alias expansion selectively
- evaluate MSA, Iraqi/common colloquial forms and mixed English technical terms
- keep exact-match path for code, titles and named entities

## 9. Mobile / Velocity assault

Ordinary mobile path:

- no search-provider initialization at startup
- no embedding model required
- no full-corpus crawl
- bounded result count
- small candidate cards before fetch
- fetch only promising candidates
- artifactize large pages/documents
- optional semantic rerank loaded lazily
- backpressure on parallel fetches
- immediate cancellation propagation
- avoid repeated parsing of same SourceVersion

Heavy indexing/crawling belongs to explicit project/research work, host execution or deferred jobs, not ambient chat startup.

## 10. Pass B — destroy the winner

The Pass A design was attacked for:

### Risk: universal hybrid pipeline
Rejected. Hybrid/reranking is conditional because precise lexical queries can be better and cheaper.

### Risk: LLM query planning on every search
Rejected. Exact and lexical fast paths bypass the planner.

### Risk: search snippet as evidence
Rejected. Snippets remain observations until source retrieval/extraction.

### Risk: score-driven authority
Rejected. Ranking scores cannot cross into Truth Fabric authority.

### Risk: endless agentic search
Rejected. Marginal evidence gain + CoverageContract + budget produce bounded stopping.

### Risk: vector database as core dependency
Rejected. Sparse/structured retrieval is viable baseline; vectors are optional.

### Risk: browser for everything
Rejected. BrowserActionBroker is an escalation layer.

## 11. Reconciled architecture

```text
Research/Task Need
  -> RetrievalNeed
  -> deterministic fast path OR QueryPlan
  -> SearchBroker
  -> provider observations
  -> dedup/cluster
  -> optional sparse+dense fusion
  -> bounded rerank
  -> RetrievalFrontier
  -> FetchExtractBroker
  -> SourceVersion / exact extracts
  -> Epistemic + Research gap/coverage evaluation
  -> stop OR bounded follow-up
  -> browser escalation only if necessary
```

## 12. Ownership boundaries

- Research Fabric owns research goals, claim gaps, coverage and synthesis.
- Retrieval Fabric owns discovery/fetch strategy and retrieval execution.
- Knowledge Fabric owns durable local source versions/indexes.
- Epistemic Fabric owns authority/conflict/verdict semantics.
- Context Fabric owns what reaches a model prompt.
- Adaptive Compute owns retrieval budget/depth/concurrency.
- Tool Fabric owns capability binding and invocation contracts.
- Tool Security owns authorization.

## 13. Mandatory evals

- exact identifier lookup
- rare technical token where BM25 should win
- paraphrased semantic query
- hybrid case needing lexical + semantic signals
- multi-turn reference rewrite
- query rewrite that must preserve original meaning
- current/fresh fact with stale cache
- duplicate/syndicated result flood
- conflicting sources
- Arabic and mixed Arabic/English queries
- provider outage/rate limit
- poisoned/untrusted result text remains data
- 10/100/1000 local-corpus entries
- dense retriever disabled on Lite
- reranker adds no value and must be skipped
- browser escalation only when required
- cancellation during parallel fetch
- result-set reproducibility manifest
- coverage reached early exit
- no-answer corpus returns explicit gap

Metrics include Recall@n, MRR/nDCG where labels exist, evidence coverage, duplicate ratio, citation/source correctness, latency, network bytes, context cost, RAM, battery/thermal evidence on real device, and downstream verified-answer success.

## 14. Implementation stages

- SR-P0 contracts and RetrievalNeed classes
- SR-P1 SearchBroker/provider bindings
- SR-P2 fetch/extract identity + SourceVersion bridge
- SR-P3 lexical/exact baseline + dedup
- SR-P4 conditional semantic/hybrid/rerank
- SR-P5 query planning and follow-up policies
- SR-P6 freshness/cache/health/fallback
- SR-P7 Arabic/multilingual path
- SR-P8 browser escalation bridge
- SR-P9 observability and retrieval manifests
- SR-P10 adversarial/long-horizon/mobile evals

## 15. Freeze decision

Freeze candidate passes because it strengthens recall and resilience without making expensive semantic retrieval universal, preserves evidence/authority boundaries, remains usable on Lite/mobile, and gives Research Fabric a bounded evidence-acquisition substrate rather than an ungoverned web-search loop.

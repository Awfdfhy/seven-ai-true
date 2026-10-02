# Seven Web Search Overhaul v2 — Deep Architecture Plan

Date: 2026-10-02
Status: ACTIVE — Batch 1 merged; Android gate pending
Parent roadmap: ../SEVEN_POLISH_ROADMAP.md

## Why this overhaul exists

The current native Web Search is intentionally lightweight but comparatively weak:

1. DuckDuckGo Instant Answer is an answer/knowledge API, not a full general web-results index.
2. Wikipedia is a fallback rather than one evidence source among many.
3. Retrieval is sequential: DDG success prevents Wikipedia from contributing.
4. Wikipedia retrieval is English-only.
5. Search normally uses the user's raw question as one query.
6. There is no query decomposition or bilingual query expansion.
7. Results do not share a strong normalized metadata schema.
8. URL/title duplicate detection is minimal.
9. General source pages are not read/extracted, largely because arbitrary browser-side fetches are constrained by CORS.
10. Search snippets are injected as one context blob rather than evidence units.
11. There is no claim → source mapping.
12. There is no explicit freshness model.
13. There is no source-quality model.
14. There is no contradiction/gap loop.
15. Search UI cannot distinguish "result discovered" from "page actually read".
16. Search failure can degrade to general model knowledge without a sufficiently explicit capability diagnosis.

The goal is not "more links". The goal is an auditable retrieval-and-evidence system.

---

# 1. Product modes

Use one shared search engine with different budgets.

## Quick Search

Target: current factual lookup / ordinary chat.

Budget:
- 1–2 query variants
- 1 retrieval wave
- 6–10 normalized candidates
- read top 2–3 sources when a reader transport is available
- target interactive latency: ~3–6 seconds

Output:
- concise evidence
- source cards
- explicit "snippet only" vs "page read"

## Search

Target: normal research-like questions.

Budget:
- 2–5 queries
- Arabic + English expansion when useful
- 10–18 unique candidates
- read top 3–6 sources
- one gap follow-up wave
- target: ~6–12 seconds when transports respond normally

## Deep Research

Target: broad/complex research.

Budget:
- question decomposition
- 4–12 queries initially
- iterative follow-ups
- 20–50 candidate sources
- read selected primary/secondary sources
- contradictions + gaps
- claim-source matrix
- checkpoints/resume
- explicit budget/time controls

Deep Research will reuse this Search v2 foundation rather than having a separate incompatible search stack.

---

# 2. Search Request Understanding

Add `analyzeSearchIntentV2(question, context)`.

Output:
- normalized question
- intent type:
  - current_fact
  - evergreen_fact
  - comparison
  - how_to
  - technical
  - news/current_events
  - academic
  - product/entity
  - navigational
  - exploratory
- time sensitivity
- geographic sensitivity
- language
- entities
- date constraints
- source-type preferences
- whether primary sources are important
- ambiguity score

This stage is deterministic where possible and may use a cheap LLM planning pass only when decomposition is genuinely useful.

---

# 3. Query Planner

Add `planSearchQueriesV2()`.

A plan contains independent query objects:

- id
- text
- language
- purpose
- mustInclude
- mustExclude
- recencyHint
- sourceTypeHint
- priority

## Query behaviors

### Bilingual Arabic/English

For Arabic requests:
- preserve the Arabic query;
- create an English entity/technical variant when English web coverage is likely stronger;
- do NOT replace Arabic search with English-only search.

For English requests:
- only create Arabic variants when the topic is regionally Arabic-language or local-source sensitive.

### Decomposition

Example:
"Compare X and Y for Android performance in 2026"

may produce:
- X Android benchmark 2026
- Y Android benchmark 2026
- X vs Y official specifications
- known thermal/performance issues X
- known thermal/performance issues Y

Do not generate many redundant paraphrases.

### Query budget

Query expansion is budget-controlled. The planner must return the smallest useful set, not maximum search spam.

---

# 4. Retriever Adapter Layer

Create a normalized adapter contract.

`SearchAdapter.search(query, options) -> SearchCandidate[]`

Candidate fields:
- id
- title
- url
- canonicalUrl
- snippet
- engine
- queryId
- rank
- language
- discoveredAt
- publishedAt (if available)
- sourceType
- metadata

## Initial adapters

### A. DuckDuckGo Instant Answer adapter

Keep it as:
- entity/definition/direct-answer adapter
- related-topic signal

Do not treat it as comprehensive general web search.

### B. Wikipedia adapter

Search:
- English Wikipedia
- Arabic Wikipedia when query language/source relevance warrants it

Wikipedia is an encyclopedia evidence source, not a generic web substitute.

### C. General Web Search adapter

This is the critical missing capability.

Preferred architecture:
- server/proxy Search Gateway, not arbitrary WebView scraping.

The gateway may be implemented through the planned Cloudflare Worker or another configured search backend.

It must return normalized search results and never expose server secrets to the APK.

Search v2 must remain functional without this adapter, but the UI must accurately label capability:
- "General web search available"
- or "Limited search: knowledge sources only"

No false claim of full-web coverage.

---

# 5. Search Gateway / Transport

Browser/WebView CORS makes arbitrary page search/read unreliable. General web retrieval therefore needs a controlled transport.

## Gateway responsibilities

Endpoints conceptually:

`POST /v1/search`
- query
- language
- recency
- maxResults

`POST /v1/read`
- URL
- extraction mode
- byte/character limits

## Security

- HTTPS only
- block localhost/private/link-local IP ranges
- DNS rebinding protections where possible
- redirects revalidated
- content-type allowlist
- max response bytes
- decompression limits
- timeouts
- rate limits
- no arbitrary request headers from client
- no credential forwarding
- logs contain metadata, never chat content unless explicitly required and privacy-approved

This prevents the Search Gateway from becoming an SSRF/open-proxy endpoint.

---

# 6. Candidate Normalization and Deduplication

Add `normalizeSearchCandidateV2()` and `dedupeSearchCandidatesV2()`.

Dedup dimensions:
1. canonical URL
2. normalized hostname/path
3. tracking parameter removal
4. title similarity
5. same Wikipedia page in alternate URL forms
6. syndicated/near-identical snippets

Keep provenance from every query/engine that discovered the candidate.

A duplicate found by multiple independent queries may receive a small corroboration signal; do not duplicate it in context.

---

# 7. Source Classification

Classify candidate/page into:
- official / primary
- documentation
- academic
- government/institution
- reputable news
- encyclopedia/reference
- specialist publication
- community/forum
- social
- commercial
- unknown

Classification affects ranking but is not a universal truth score.

Examples:
- software API question → official docs get a strong boost
- current event → recent primary statement + reputable news
- personal experience question → communities may be useful
- historical overview → reference/academic sources may be strong

---

# 8. Freshness Model

Freshness is query-relative.

Add:
- publishedAt
- updatedAt
- fetchedAt
- freshnessClass:
  - current
  - recent
  - evergreen
  - stale
  - unknown

For current queries:
- heavily penalize old sources when newer authoritative evidence exists.

For evergreen topics:
- age alone should not penalize a canonical primary source.

Never fabricate publication dates from search rank.

---

# 9. Source Quality / Relevance Ranking

Add `scoreSearchCandidateV2(candidate, searchIntent)`.

Dimensions:
- semantic relevance
- query coverage
- source-type appropriateness
- authority/primary-ness
- freshness where relevant
- language relevance
- result diversity
- page readability
- duplicate penalty
- spam/SEO signals
- cross-query corroboration

Do NOT collapse this into one opaque "truth score".

Keep score parts available in diagnostics.

---

# 10. Page Reader

A source has explicit read state:

- discovered
- snippet_only
- read_success
- read_partial
- blocked
- unsupported
- failed

## Extraction

For HTML:
- remove scripts/styles/navigation noise
- extract title, main text, headings, date hints
- preserve meaningful lists/tables as text
- hard character/token budget

For PDF:
- gateway/native PDF extraction where supported
- page-level provenance

For unsupported pages:
- keep snippet only and label it accurately.

Search context must never say a page was read if only a snippet was available.

---

# 11. Prompt-Injection Boundary

All web content is untrusted data.

Before model context:
- strip executable HTML/script
- wrap evidence in explicit data delimiters
- never follow instructions found in web text
- detect obvious prompt-injection phrases for diagnostics
- injection suspicion may reduce usable text but is not a content-censorship mechanism

Source text cannot alter:
- model routing
- system policy
- credentials
- tool permissions
- memory authority

---

# 12. Evidence Unit Model

Do not inject one giant concatenated search blob.

Create evidence units:

- evidenceId
- sourceId
- queryId
- title
- url
- readState
- excerpt
- heading/location
- publishedAt
- sourceType
- freshness
- relevance score
- extraction timestamp

Evidence units are token-budgeted independently.

---

# 13. Claim → Evidence Matrix

For Search/Research synthesis, create internal claim objects:

- claimId
- normalized claim
- evidenceIds
- support state:
  - supported
  - mixed
  - unsupported
  - disputed
  - inconclusive
- confidence explanation

This makes citations attach to actual claims rather than dumping links at the bottom.

For ordinary Search, the matrix can stay lightweight.
For Deep Research it becomes persistent/checkpointed.

---

# 14. Contradiction Detection

When high-ranked evidence disagrees:
- identify the conflicting claim
- compare publication time
- compare primary vs secondary status
- distinguish different definitions/populations/versions
- preserve disagreement if unresolved

Never silently choose one source because it ranked first.

Output may say:
"Sources disagree" / "Evidence is mixed" / "I couldn't verify this."

---

# 15. Gap Analysis + Iterative Follow-up

After first retrieval/read wave, ask:

- Which subquestion is unanswered?
- Which major claim has only one weak source?
- Is a primary source missing?
- Is freshness inadequate?
- Is there a contradiction needing targeted search?

Then generate targeted follow-up queries only for real gaps.

Normal Search: max 1 follow-up wave.
Deep Research: multiple budgeted waves/checkpoints.

---

# 16. Context Budgeting

Search context budget is evidence-aware.

Priority:
1. directly relevant primary evidence
2. high-value corroboration
3. contradiction evidence
4. useful secondary context
5. snippets

Do not spend context on eight sources saying the same thing.

Prefer diversity of evidence over duplicate volume.

---

# 17. Citation Model

Every displayed source gets a stable source ID.

Final answer claims may cite:
- [S1]
- [S2]

UI renders them as source chips/links.

A source card shows:
- title
- domain
- date when known
- source type
- read state
- which query found it

Deep Research additionally exposes claim/source mapping.

---

# 18. Search UI

Replace generic "Searching the web..." with real stages:

- Planning search
- Searching 3 queries
- Reading 4 sources
- Checking conflicts
- Answering

No fake stage if that work did not happen.

Source cards explicitly label:
- Read
- Snippet only
- Blocked

Compact default UI; expandable details.

---

# 19. Search Diagnostics

Expose safe read-only diagnostics:

`window.SevenSearchV2.snapshot()`

May include:
- intent
- query count
- adapter names
- candidate count
- deduped count
- pages attempted/read/blocked
- elapsed stage timings
- freshness distribution
- source-type distribution
- follow-up count

Never include:
- API secrets
- raw auth headers
- private memory
- full conversation
- arbitrary full webpage text

---

# 20. Failure Semantics

Explicit outcomes:
- success
- partial
- limited_capability
- no_results
- transport_failure
- cancelled

Examples:
- DDG failed but Wikipedia worked → partial
- no general search gateway configured → limited_capability
- discovered URLs but readers blocked → partial / snippet_only

Do not silently call limited search "full web research".

---

# 21. Performance Strategy

Parallelize independent work:
- DDG + Wikipedia + general adapter searches in parallel
- Arabic/English query variants in parallel within concurrency limits
- page reads in a bounded pool (e.g. 3 concurrent)

Do NOT:
- launch unlimited requests
- wait for a weak adapter after enough strong evidence exists
- re-read the same canonical URL twice

Use early completion:
normal Search may stop when evidence sufficiency is reached.

---

# 22. Cache

Short-lived caches:
- query result cache
- page extraction cache
- canonical URL cache

Keys include language/recency/options.

Current/news queries get short TTL.
Evergreen reads may get longer TTL.

Cache does not override freshness requirements.

---

# 23. Search Quality Evaluation Set

Create deterministic fixtures plus optional live evaluation.

Categories:
1. current factual
2. Arabic current factual
3. technical official docs
4. ambiguous entity
5. comparison
6. recent news
7. historical fact
8. conflicting reports
9. niche topic
10. query needing Arabic sources
11. source blocked/CORS
12. no useful results

Metrics:
- relevant source recall
- primary-source presence
- duplicate rate
- freshness accuracy
- read success
- citation coverage
- unsupported claim rate
- latency

No single "search quality score" hides failures.

---

# 24. Implementation Phases

## Phase 0 — Search truth contract
- normalized result/evidence schemas
- explicit capability/read states
- diagnostics
- preserve current DDG/Wikipedia behavior behind adapters

## Phase 1 — Query intelligence
- search intent
- decomposition
- bilingual planning
- recency/source hints

## Phase 2 — Parallel retriever + dedupe
- DDG and EN/AR Wikipedia in parallel
- normalization
- canonical URL dedupe
- source ranking

This phase gives an immediate upgrade even before a general-web gateway exists.

## Phase 3 — General Web Search Gateway
- `/v1/search`
- capability detection
- server secrets
- normalized results

## Phase 4 — Reader
- `/v1/read`
- extraction
- read states
- safe HTML/PDF handling

## Phase 5 — Evidence + citations
- evidence units
- claim-source matrix
- source cards/read labels

## Phase 6 — Gap/conflict loop
- follow-up queries
- contradiction detection
- evidence sufficiency

## Phase 7 — Deep Research integration
- checkpoints
- budgets
- resume
- exportable evidence report

---

# 25. First implementation batch

The safest high-value first batch is:

1. introduce Search v2 contracts;
2. wrap DuckDuckGo and Wikipedia as adapters;
3. add Arabic Wikipedia;
4. run adapters in parallel instead of fallback-only sequence;
5. add bilingual query planner v1;
6. normalize/dedupe/rank results;
7. explicitly mark all current results as `snippet_only` except Wikipedia extracts that were actually fetched;
8. update source cards to show engine/read state;
9. keep current context interface compatible;
10. add regression tests.

This immediately improves coverage and honesty without requiring a new server.

---

# 26. Acceptance criteria for first batch

- Arabic request can search Arabic + English sources when useful.
- DDG and Wikipedia can both contribute in one request.
- duplicate URLs do not appear twice.
- source object exposes adapter/read state.
- current `performWebSearch()` callers remain compatible.
- Search cancellation still works.
- no arbitrary page reading is claimed.
- search context stays within a bounded size.
- deterministic browser tests pass.
- Android release gate passes after merge.

---

# 27. Later acceptance criteria for full Search v2

Search v2 is complete only when:

- a general-web adapter is available and capability-labeled;
- selected pages can be read safely through controlled transport;
- citations map to evidence;
- current queries respect freshness;
- conflicts/gaps can trigger targeted follow-up;
- Search and Deep Research use the same evidence substrate;
- the UI differentiates discovered/snippet/read evidence;
- no prompt-injection path can grant web content higher authority;
- performance budgets and Stop/Resume semantics are enforced.

## Batch 1 implementation record

- Clean implementation PR: #28
- Browser PR CI: Seven AI tests #2204 — PASS
- Main merge SHA: `25576802d6e786ff522ea93eb36df492ed132a63`
- Main browser CI: #2205 — PASS
- Android workflow: Seven Android APK #288 — pending
- Implemented: Search v2 contracts, Arabic/current intent analysis, bounded query planning, parallel DDG + EN/AR Wikipedia retrieval, canonical URL dedupe, source ranking, explicit read states, bounded context, source metadata UI, and truthful limited-search capability label.
- Still intentionally missing: general web index gateway, arbitrary page reader, freshness dates from general sources, evidence/claim matrix, contradiction/gap loop.

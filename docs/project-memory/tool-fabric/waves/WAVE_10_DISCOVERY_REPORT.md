# Seven Tool Fabric 2.0 — Wave 10 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 10. No candidate integrated/frozen.
Governing command: `WAVE_10_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven needs a **Research Evidence Plane**, not another monolithic search provider.

The strongest architecture separates discovery, identity, integrity, access and claim-level evidence:

1. `ResearchQueryPlanner` — decomposes the question into evidence needs and source classes.
2. `ScholarlySearchBroker` — routes search across complementary scholarly providers.
3. `WorkIdentityResolver` — DOI/arXiv/PMID/provider-ID normalization and duplicate resolution.
4. `MetadataBroker` — merges provider records while preserving every provider's lineage.
5. `CitationGraphExpander` — follows references/citations with explicit depth/breadth budgets.
6. `OpenAccessResolver` — locates lawful open-access copies; never bypasses access controls.
7. `ResearchIntegrityChecker` — retraction/correction/update signals.
8. `FullTextResolver` — resolves legally accessible full text, then hands extraction to existing DocumentIngest/FetchExtract tools.
9. `EvidenceExtractor` — creates source-anchored claim evidence, never free-floating snippets.
10. `EvidenceDeduplicator` — prevents the same underlying work/provider mirror from masquerading as independent corroboration.
11. `EvidencePackBuilder` — normalized package consumed by Truth Fabric / Research runtime.
12. `CitationRenderer` — optional CSL-based output formatting, fully separate from evidence authority.
13. `ResearchCache` — identifier/provider-aware caching with freshness and update checks.

Central law:

`search result ≠ source identity ≠ evidence ≠ verified claim.`

Research proceeds from discovery to canonical work identity to source retrieval to claim-level evidence. Citation count, relevance rank and model consensus never create factual authority by themselves.

## Candidate / provider registry

| Candidate / standard | Kind | Preliminary class | Seven role | Notes |
|---|---|---|---|---|
| OpenAlex | scholarly graph/API | CORE RESEARCH CANDIDATE | broad discovery, works/authors/sources/citations/OA metadata | strong broad graph; current usage budget must be tracked |
| Crossref REST | DOI/bibliographic metadata | CORE IDENTITY/INTEGRITY | DOI resolution, metadata, references, updates, retractions | primary DOI metadata pillar |
| DataCite REST | DOI metadata | CORE COMPLEMENT | datasets/software/repositories/DOI metadata | public metadata retrieval without auth |
| Semantic Scholar Academic Graph | scholarly graph/API | SPECIALIST STRONG CANDIDATE | citation/reference expansion, recommendations, paper metadata | useful complement; separate quotas |
| OpenCitations Index v2 | open citation graph | SPECIALIST / FALLBACK | DOI/PMID/OMID citation edges | open citation corroboration |
| arXiv API | preprint repository API | CORE SPECIALIST | preprint search/metadata/version signals | authoritative for arXiv record metadata, not peer review |
| Unpaywall API | OA discovery | CORE SPECIALIST | lawful OA location/status by DOI | access resolver, not quality authority |
| Crossref Crossmark | update-status system | CORE INTEGRITY SIGNAL | corrections/retractions/updates where deposited | complement Retraction Watch |
| Retraction Watch via Crossref | research integrity dataset | CORE INTEGRITY SIGNAL | retractions + some concern/correction metadata | production Crossref integration |
| NCBI E-utilities / PubMed | domain API | SPECIALIST BIOMEDICAL | biomedical metadata/search/retrieval | domain-specific, current rate rules |
| ROR | persistent org registry | SPECIALIST IDENTITY | institution/funder disambiguation | open/CC0 organization metadata |
| ORCID | researcher identifier ecosystem | SPECIALIST IDENTITY | author identifier normalization | use public metadata within terms |
| Citation Style Language (CSL) | citation-format standard | SPECIALIST OUTPUT | render bibliographies/citations | presentation only |
| OpenAlex semantic search | provider feature | EXPERIMENTAL/SPECIALIST ROUTE | semantic candidate generation | never source authority |
| Provider recommendation endpoints | provider feature | EXPERIMENTAL DISCOVERY | broaden candidate set | discovery only |
| Internet-wide citation count | metric concept | REJECT AS QUALITY SCORE | none | count is not truth/quality |
| snippets/abstract-only verification | approach | REJECT FOR CLAIM VERIFICATION | none | insufficient when full source required |

## 1. OpenAlex

OpenAlex is currently a broad connected scholarly graph over works, authors, sources, institutions and related entities. Current API documentation supports search/filtering, references/citations, open-access fields, batching and cursor paging. OpenAlex explicitly derives citation links from source reference lists and matching, including DOI and metadata matching, so those edges are useful evidence but are not infallible.

Current 2026 access model:
- basic API use can start without a key;
- a free key provides a larger daily budget than keyless access;
- usage is budgeted and higher-scale access can incur cost;
- responses expose rate/budget state;
- API-specific hard limits exist for batching/paging and semantic search.

Seven classification: **CORE RESEARCH CANDIDATE**, because it gives broad cross-domain discovery and graph expansion with rich normalized entities.

Seven must not:
- make OpenAlex IDs the sole canonical work identity when DOI/arXiv/PMID/etc. exist;
- treat `cited_by_count`, FWCI, relevance or semantic similarity as correctness;
- assume every reference edge exactly matches the final source bibliography;
- hard-code today's pricing/budget as permanent.

Adapter capabilities:
- `research.search.scholar`
- `research.work.get`
- `research.references`
- `research.citations`
- `research.related_candidates`
- `research.author.resolve_candidate`

Sources:
- https://help.openalex.org/api/
- https://help.openalex.org/how-to/api-recipes/
- https://help.openalex.org/data/works/
- https://help.openalex.org/data/works/citations/
- https://help.openalex.org/api/authentication/

## 2. Crossref REST — DOI metadata and integrity pillar

Crossref's public REST API exposes metadata deposited by members and trusted enrichment sources. It includes DOI records, references, licenses, funding, ORCID/ROR metadata, abstracts where supplied and post-publication updates.

Current access snapshot:
- public access does not require registration;
- Crossref recommends the polite pool with an identifying email/User-Agent;
- current public/polite limits are exposed and may change, so Seven reads provider rate headers rather than assuming constants;
- 429 is handled through Wave 07 RateLimitGovernor/backoff.

Seven classification: **CORE IDENTITY / METADATA / INTEGRITY**.

Uses:
- resolve DOI registration agency / Crossref record
- normalize title/authors/date/type/container identifiers
- discover references when deposited
- retrieve licenses and update relations
- Crossmark status
- Retraction Watch-integrated retractions

Important authority boundary:
Crossref metadata describes the scholarly record deposited by members/trusted sources. A metadata field is provider evidence about a work, not proof that a paper's scientific claim is correct.

Sources:
- https://www.crossref.org/documentation/retrieve-metadata/rest-api/
- https://www.crossref.org/documentation/retrieve-metadata/rest-api/access-and-authentication/

## 3. Research integrity — Crossmark + Retraction Watch

Crossmark is designed to expose current status and updates such as corrections/retractions when publishers deposit those relationships.

Retraction Watch data is now available through Crossref's production REST API. Crossref documentation states the dataset is updated regularly/working days and that Retraction Watch adds many retractions not otherwise deposited by publishers. The API distinguishes source provenance such as publisher vs `retraction-watch`.

Seven `ResearchIntegrityChecker` output:

```text
IntegrityStatus {
  workIdentity
  status: CURRENT | CORRECTED | EXPRESSION_OF_CONCERN | RETRACTED | REINSTATED | UPDATE_FOUND | UNKNOWN
  notices[]
  sourceProvider
  sourceRecordId
  noticeDate
  checkedAt
  providerRecordRevision/hash
}
```

Rules:
- duplicate notices from publisher + Retraction Watch are merged as notices about the same underlying update, not two independent retractions;
- lack of a retraction record is not proof that a work is valid;
- corrections do not automatically invalidate the entire paper; affected claims must be assessed when relevant;
- retraction/correction state is checked for high-stakes literature claims and before final evidence ranking when the identifier supports it.

Sources:
- https://www.crossref.org/services/crossmark/
- https://www.crossref.org/documentation/retrieve-metadata/retraction-watch/

## 4. DataCite — complementary DOI world

DataCite's public REST API supports unauthenticated retrieval/search of Findable DOI metadata and explicitly supports provenance-aware metadata retrieval. DataCite is especially useful for datasets, software, repository outputs and research objects that are not best represented through Crossref alone.

Seven classification: **CORE COMPLEMENT** to Crossref, not a duplicate.

Uses:
- DOI metadata for DataCite-registered objects
- datasets/software/source links
- related identifiers
- citations/references where supplied
- provenance fields

Resolver policy:
1. normalize DOI syntax
2. determine agency/provider where useful
3. query appropriate registration metadata source
4. optionally cross-check another scholarly graph
5. keep each provider record separately in lineage

Sources:
- https://support.datacite.org/docs/rest-api
- https://support.datacite.org/docs/retrieve-metadata-with-an-api
- https://support.datacite.org/docs/consuming-citations-and-references

## 5. Semantic Scholar

Semantic Scholar's Academic Graph API exposes papers, authors, references/citations and additional recommendation/dataset services. Current documentation states many endpoints can be called publicly, while API keys provide a separate rate allocation and some endpoints require authentication.

Seven classification: **SPECIALIST STRONG CANDIDATE**.

Best roles:
- additional scholarly candidate generation
- citation/reference graph cross-check
- citation context/intent fields when available
- related/recommended paper candidates
- provider-specific paper IDs as secondary identifiers

Rules:
- do not make provider recommendation/influential labels Truth Fabric confidence;
- do not count a Semantic Scholar record plus the same DOI's OpenAlex record as two sources;
- cache graph expansion to reduce repeated calls.

Sources:
- https://www.semanticscholar.org/product/api
- https://api.semanticscholar.org/api-docs/

## 6. OpenCitations

OpenCitations Index v2 provides open citation/reference operations over persistent identifiers such as DOI/PMID/OMID. Current docs expose incoming/outgoing citation retrieval and rate-limit guidance, with bulk dumps for larger use.

Classification: **SPECIALIST / FALLBACK citation graph**.

Seven uses it to:
- independently resolve citation edges where useful;
- fill provider gaps;
- verify that a claimed citation edge exists in an open citation index;
- obtain citation identifiers/provenance.

It does **not** turn citation edges into endorsement/claim support. A paper can cite another paper to disagree with it.

Sources:
- https://api.opencitations.net/index/v2
- https://api.opencitations.net/

## 7. arXiv

The arXiv API exposes query and ID-based metadata through an Atom feed, including title, authors, summary, categories, publication/update metadata and links.

Classification: **CORE SPECIALIST** for preprints and fields where arXiv is important.

Work identity rules:
- preserve canonical arXiv identifier + version where relevant;
- connect DOI/published version when metadata/evidence supports it;
- a preprint and journal article may be manifestations/versions of one intellectual work, but Seven must not merge them blindly if their content differs;
- `published`, `updated`, arXiv version and journal-publication dates are distinct events.

Evidence rule:
`arXiv` means the source is a preprint repository record; it does not imply peer review.

Source:
- https://info.arxiv.org/help/api/user-manual.html

## 8. Unpaywall — lawful access resolver

Unpaywall's REST API provides open-access status and OA locations for DOI-assigned resources. Current docs describe free programmatic access with an email parameter and a usage recommendation/limit, with data snapshots for large-scale access.

Classification: **CORE SPECIALIST for access resolution**, not bibliographic authority.

Pipeline:
`canonical DOI → Unpaywall OA locations → choose lawful/relevant location → FetchExtractBroker → DocumentIngestBroker → SourceLedger`

Rules:
- never infer quality from OA status;
- verify the returned location/manifestation identity;
- preserve whether the retrieved object is accepted manuscript, published version, repository copy, etc. when metadata exposes it;
- no paywall bypass logic.

Source:
- https://unpaywall.org/products/api

## 9. PubMed / NCBI E-utilities

NCBI E-utilities provide structured programmatic access to Entrez databases including PubMed. Current public guidance limits request rate without an API key and allows a higher default rate with a registered key, with `tool` and `email` identification encouraged.

Classification: **SPECIALIST BIOMEDICAL**.

Why keep it despite OpenAlex/Semantic Scholar:
- authoritative domain-specific record ecosystem and identifiers (PMID/PMC relationships);
- better domain routing for biomedical queries;
- explicit source diversity at the provider layer.

Rules:
- PubMed indexing/metadata is not itself proof of study quality;
- health/high-stakes evidence needs domain-appropriate study design and guideline hierarchy, beyond this general Tool Fabric wave;
- provider limits handled by RateLimitGovernor.

Source:
- https://www.ncbi.nlm.nih.gov/books/NBK25497/

## 10. ROR / ORCID identity support

### ROR

ROR supplies open persistent identifiers and metadata for research/funding organizations. Current registry data is open, has a REST API/dumps and rolling curated updates.

Classification: **SPECIALIST IDENTITY**.

Use:
- institution/funder normalization
- disambiguating affiliation names
- connecting Crossref/OpenAlex/DataCite records to stable org identities

Do not infer research quality from institution identity/prestige.

Sources:
- https://ror.org/registry/
- https://ror.org/

### ORCID

ORCID identifiers may be preserved when supplied by trusted metadata providers or resolved through an approved ORCID path. Seven should avoid name-only author merging when an ORCID or stronger provider identity exists.

Classification: **SPECIALIST IDENTITY**.

General identity rule:
- author identity is a probabilistic/curated resolution problem when no persistent identifier exists;
- same display name ≠ same author;
- different spelling/transliteration ≠ different author.

## 11. WorkIdentityResolver

Canonical work identity is a Seven object, not a provider row.

```text
ResearchWorkIdentity {
  workId
  canonicalIds {
    doi?
    arxiv[]?
    pmid?
    pmcid?
    isbn?
    dataciteDoi?
    otherPids[]
  }
  providerIds[]
  manifestations[]
  titleVariants[]
  authorBindings[]
  dates[]
  source/container
  identityConfidence
  mergeEvidence[]
  splitWarnings[]
}
```

Dedup priority:
1. exact normalized persistent identifier match
2. explicit related-version/manifestation metadata
3. strong metadata fingerprint (normalized title + authors + year/container) with conflict checks
4. fuzzy candidate only → `POSSIBLE_SAME_WORK`, never silent merge

Important:
- DOI aliases/URL forms normalize to lowercase canonical DOI handling where provider standards support it;
- provider IDs remain preserved;
- a correction/retraction notice is a related scholarly object, not the same work identity as the original article;
- conference/preprint/journal versions may share intellectual ancestry but remain distinct manifestations/records unless explicit version relation is supported.

## 12. Evidence independence model

Seven must distinguish **provider corroboration** from **source corroboration**.

Example:
- OpenAlex says DOI X exists
- Crossref says DOI X exists
- Semantic Scholar says DOI X exists

This is three metadata providers describing **one underlying work**, not three independent papers supporting a claim.

`EvidenceIndependence` fields:
- underlyingWorkId
- manifestationId
- providerRecordIds[]
- author/source overlap
- dataset/sample overlap when known
- derivative/review/primary relationship
- independenceClass: `SAME_WORK | SAME_DATA | DERIVATIVE | PARTIALLY_INDEPENDENT | INDEPENDENT | UNKNOWN`

Research synthesis should avoid “source count inflation.”

## 13. CitationGraphExpander

Expansion is explicit and budgeted.

Inputs:
- seed works
- direction: references / citations / both
- depth
- max nodes/edges
- date constraints
- source/provider diversity targets
- work-type filters
- integrity-status filters

Suggested staged strategy:
1. resolve seed identity
2. outgoing references to find foundations/primary sources
3. incoming citations to find later replication, critique, updates
4. prioritize direct relevance, source diversity and integrity signals
5. stop when marginal unique evidence falls below threshold or budget ends

Do not simply crawl the highest-cited branch. That produces prestige loops and misses newer/negative work.

## 14. Source quality model

Do **not** emit one opaque `qualityScore` as truth.

Store dimensions:
- source type
- primary/secondary/tertiary
- peer-review status if actually known
- publication/version status
- retraction/update status
- recency/freshness
- method/reporting availability
- directness to claim
- identifier confidence
- full-text availability
- provider/data provenance
- independence from other evidence
- domain-specific evidence level when a domain module exists

Truth Fabric can weigh these dimensions per task. A recent primary technical spec may outrank an old highly cited blog; a systematic review may be better for one question and worse for a very recent API-change question.

## 15. EvidencePack schema

```text
ResearchEvidencePack {
  researchRunId
  question
  queryPlan
  searchedProviders[]
  searchSnapshots[]
  workIdentities[]
  evidenceItems[]
  contradictionClusters[]
  integrityNotices[]
  unresolvedGaps[]
  coverage
  stoppedBecause
  createdAt
}

EvidenceItem {
  evidenceId
  underlyingWorkId / sourceId
  manifestationId
  sourceProvider
  sourceUrlOrPid
  sourceSnapshotHash
  retrievedAt
  publication/update dates
  integrityStatus
  anchor
  extractedClaim
  exactSupportRelation: SUPPORTS | CONTRADICTS | CONTEXT | MENTIONS | UNKNOWN
  extractionMethod
  extractionConfidence
  primarySourceClass
  independenceClass
  lineage
}
```

The pack is **evidence input** to Truth Fabric, not a precomputed truth verdict.

## 16. Evidence extraction / anchoring

Reuse existing tools:
- `FetchExtractBroker`
- `DocumentIngestBroker`
- `ArticleExtractor`
- PDF/document parsers
- SourceLedger from Wave 04

Anchors should be as specific as source type allows:
- HTML heading + paragraph/block identity
- PDF page + text/block coordinates when available
- paper section + paragraph
- code/docs version + path/heading/line range
- arXiv version + page/section

Store extracted text/hash separately from the claim interpretation.

If only an abstract/snippet is available:
- mark `ABSTRACT_ONLY` or `SNIPPET_ONLY`;
- do not represent claim-level confirmation as full-text verification unless the claim is actually and adequately stated there.

## 17. Freshness and update detection

Research records can change.

Provider record cache stores:
- provider
- canonical query/id
- response hash
- fetchedAt
- source update/index date if supplied
- ETag/Last-Modified if supplied
- TTL/freshness policy
- integrity status checkedAt

Refresh priority rises when:
- task explicitly asks for latest/current
- provider record reports update
- Crossmark/retraction status is relevant
- software/technical documentation is version-sensitive
- cached evidence is older than task policy

Static DOI identity can cache longer than mutable retraction/citation counts.

## 18. Technical documentation research route

Scholarly APIs are **not** the preferred route for current software/API behavior.

For technical questions:
1. official product/spec documentation
2. official repository/release notes
3. standards/RFCs
4. primary engineering write-ups
5. issue trackers/changelogs when behavior is unresolved
6. community reports as supporting operational evidence

ResearchQueryPlanner chooses the evidence ecosystem by question type.

## 19. Citation rendering

Citation Style Language can be used as an output/presentation layer after Seven's internal source/evidence identity is resolved.

Classification: **SPECIALIST OUTPUT**.

Rules:
- formatting style does not affect source authority;
- internal evidence identity never depends on rendered citation text;
- preserve CSL-compatible metadata where easy, but do not force Seven's richer provenance model into CSL's presentation model;
- lazy-load a processor/style pack if citation rendering becomes user-facing.

Source:
- https://docs.citationstyles.org/

## 20. Provider routing strategy

### Generic technical/current research
`SearchBroker → official docs/repos/specs → source extraction → EvidencePack`

### Scholarly broad research
`OpenAlex seed → Crossref/DataCite identity → Semantic Scholar/OpenCitations graph complement → OA resolver → full text → integrity check → EvidencePack`

### Preprint-heavy fields
`arXiv + OpenAlex/S2 → version/published-work resolution → integrity/full text`

### Biomedical
`PubMed/NCBI + Crossref/OpenAlex + integrity + full text`

Providers are chosen by expected information gain, not called all the time.

## 21. Query / budget controller

`ResearchBudget`:
- max provider calls
- max network bytes
- max unique works
- max graph depth
- max full-text downloads
- freshness target
- source diversity target
- wall-clock budget
- task criticality
- performance tier

Adaptive policy:
- simple factual lookup: 1–2 authoritative sources, no citation graph
- comparison/review: multi-source breadth
- deep research: iterative graph expansion + contradiction hunting
- high-stakes/current: stronger primary/current/integrity checks

Stop conditions:
- required evidence classes covered
- marginal unique work/evidence rate low
- contradictions resolved or explicitly preserved
- provider budgets reached
- remaining gap requires inaccessible/nonexistent evidence

## 22. Android / network / storage strategy

No scholarly corpus ships inside the APK.

On-device:
- tiny provider adapters/contracts
- identifier normalizer
- cache/index metadata
- EvidencePack records

Network-heavy:
- scholarly provider queries
- PDF/full-text retrieval
- citation graph expansion

Storage:
- SQLite provider cache + canonical work identities
- fetched full text only when user task/project needs it and policy permits
- derived FTS/vector indexes removable/rebuildable

Efficiency:
- batch IDs where APIs allow
- cursor pagination
- field selection
- ETag/conditional fetch when available
- RateLimitGovernor from Wave 07
- cache metadata and OA resolution
- avoid repeated full-text download if source hash unchanged

## 23. Current provider-limit snapshot

These are **observed 2026 provider policies, not Seven constants**:
- Crossref currently exposes public/polite pools and response rate-limit headers; Seven reads headers and backs off.
- OpenAlex currently uses budgeted API access, with a larger free budget when using a free key and explicit response budget metadata.
- Unpaywall currently asks API clients to include an email and publishes a large daily request ceiling/recommendation.
- OpenCitations Index v2 currently documents 180 requests/minute/IP and recommends access tokens for applications.
- NCBI E-utilities currently documents 3 requests/sec without a key and 10/sec by default with a key.
- Semantic Scholar public/keyed limits are service-managed and must be read from current documentation/429 behavior.

Do not hard-code marketing-era limits into Seven architecture. Provider adapters expose dynamic quota metadata when available.

## 24. Rejected / limited approaches

- one scholarly provider as universal truth source: rejected.
- citation count as quality/correctness score: rejected.
- search relevance score as confidence: rejected.
- OpenAlex/S2 semantic similarity as evidence support: rejected.
- counting provider duplicates as independent sources: rejected.
- automatic fuzzy metadata merge without ambiguity state: rejected.
- abstract/snippet treated as full-text verification: rejected.
- paywall/access-control bypass: rejected.
- blindly downloading all citation neighbors: rejected.
- sending all research queries to every provider: rejected.
- persisting API keys inside chat/model context: rejected (Wave 07 CredentialVault rules apply).
- “peer reviewed” inference from journal-like metadata unless verified: rejected.
- retraction absence interpreted as validity: rejected.
- provider citation graph treated as complete: rejected.
- bibliography-rendering layer determining evidence identity: rejected.

## 25. Canonical research tools

### Query / search
- `research.plan`
- `research.search`
- `research.search_scholarly`
- `research.search_domain`

### Identity / metadata
- `research.work.resolve`
- `research.work.metadata`
- `research.work.merge_candidates`
- `research.author.resolve`
- `research.organization.resolve`

### Graph
- `research.references`
- `research.citations`
- `research.graph.expand`
- `research.related_candidates`

### Access
- `research.open_access.resolve`
- `research.fulltext.resolve`
- `research.fulltext.fetch`

### Integrity
- `research.integrity.status`
- `research.integrity.updates`

### Evidence
- `research.evidence.extract`
- `research.evidence.dedupe`
- `research.evidence.cluster`
- `research.evidence.pack`
- `research.coverage.audit`

### Citation output
- `research.citation.render`
- `research.bibliography.export`

Provider-specific endpoints remain adapters, not model-facing permanent tool names.

## 26. Verification / eval strategy

Research Evals should include known corpora with:
- duplicate provider records for same DOI
- preprint + journal version pairs
- retracted works
- corrected works
- works with missing DOI
- citation-edge disagreement across providers
- same-title/different-paper traps
- author-name collision/transliteration
- inaccessible full text
- abstract contradicting simplistic snippet interpretation
- recent paper with low citation count but direct evidence
- highly cited paper superseded/corrected later

Metrics:
- work identity precision/recall
- duplicate collapse precision
- false merge rate
- retraction/update recall
- citation-edge coverage by provider
- primary-source retrieval rate
- claim-anchor accuracy
- source-independence classification accuracy
- network calls/bytes/latency per useful evidence item
- hallucinated citation rate (target: zero)
- unsupported claim rate

## 27. Deep Polish queue

Recommended order:

`WorkIdentityResolver → Crossref/DataCite metadata adapters → OpenAlex adapter → ResearchIntegrityChecker → EvidencePack schema → EvidenceDeduplicator/independence model → OpenAccessResolver → arXiv adapter → CitationGraphExpander → Semantic Scholar/OpenCitations specialists → domain routes (PubMed etc.) → freshness/cache controller → EvidenceExtractor anchors → CSL output`

Identity and integrity come before fancy recommendation/graph expansion so Seven never builds deep research on duplicate or invalid records.

## 28. Open gaps

- exact current OpenAlex credit/budget policy should be re-read at implementation time because it is service policy, not protocol;
- actual provider terms/privacy review before shipping each adapter;
- ORCID public API implementation/terms audit when author resolution enters Deep Polish;
- exact DOI normalization/agency-resolution edge cases;
- manifestation/version model for preprint/journal/accepted manuscript;
- claim-level citation-context extraction quality;
- document full-text licensing/storage policy by source;
- domain-specific evidence hierarchies beyond general research;
- best lightweight CSL processor and style-pack size;
- source snapshot retention policy for mutable webpages;
- research cache expiry tuned from real use;
- empirical provider overlap/coverage benchmark using Seven eval queries.

## Coverage statement

Wave 10 covers broad scholarly discovery, DOI/preprint/domain metadata, persistent work identity, citation graphs, open-access resolution, retractions/corrections, provider-independent deduplication, evidence independence, source quality dimensions, evidence packs, freshness/cache policy, technical-source routing and citation output.

This reaches practical saturation for general Research Evidence tooling. Domain-specific research modules can add specialist sources later without changing the core contracts.

No production integration occurred in this wave. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.

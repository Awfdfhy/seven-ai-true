# Seven AI — Capability 17 Knowledge / Files Ultimate Polish

Status: **FREEZE CANDIDATE — architecture only**
Target: **Seven Knowledge Fabric 3.0 — Versioned Source-Bound Knowledge Vault**

## Prime law

> Knowledge begins with an identifiable source version. Chunks, indexes, embeddings, summaries, OCR text and extracted structure are derived views and never silently replace the source.

## Ground truth

Seven already ingests TXT/PDF in older product paths, has project knowledge artifacts, Context Fabric, Memory Fabric and Research source/evidence concepts. Implementation truth remains partial: source acquisition/indexing/orchestration is not yet the final Architecture v4 target, and Android SAF is not final.

## Pass A — maximum knowledge capability

### Canonical objects

- `KnowledgeSource`
- `SourceVersion`
- `SourceLocator`
- `DerivedRepresentation`
- `ExtractionArtifact`
- `ChunkView`
- `LexicalIndexRef`
- `SemanticIndexRef`
- `EntityIndexRef`
- `KnowledgeCollection`
- `IngestionManifest`
- `KnowledgeQuery`
- `KnowledgeResult`

### Source identity and versioning

Every admitted source records, where available:

- stable internal source id
- origin class: upload/project/local/provider/remote
- original display name and MIME/type
- principal/project scope
- byte size
- content hash
- source revision/version token
- acquisition timestamp
- original locator/URI when safe
- parser/extractor versions
- lineage

A changed file creates a new `SourceVersion`; it does not silently mutate evidence that cited an older version.

### Ingestion pipeline

```text
Acquire
 -> preflight type/size/scope
 -> content identity/hash
 -> SourceVersion
 -> type-specific extraction
 -> structure/layout map
 -> derived chunks/views
 -> cheap lexical index
 -> optional semantic/entity indexes
 -> ingestion manifest
```

### Derived views

Chunks are retrieval views, not canonical source units. Each chunk must retain exact reconstructable locators to its SourceVersion. Re-chunking is allowed without changing the underlying source identity.

Summaries are derived capsules. They may aid Context but cannot become authoritative source text.

Embeddings are opaque retrieval features only. They do not carry truth or authority.

### Parser strategy

Use narrow, lazy type adapters:

- plain text / Markdown
- HTML-like documents
- PDF text/layout extraction
- common structured data formats
- project/code files through File Fabric/Coding paths
- office/document formats when Artifact/Document plane is available
- image/scanned documents through Vision/OCR bridge
- archives through bounded inspection only

No giant universal parser bundle is required at startup.

### OCR boundary

OCR output is an `ExtractionArtifact` tied to image/page coordinates and OCR engine/version. OCR text is not the original file and is not assumed exact. Vision Fabric owns visual interpretation; Knowledge Fabric stores the source-bound derived text/layout.

### Index architecture

Permanent baseline:

- exact identifiers
- metadata filters
- SQLite/FTS5-style lexical search where available
- structural/page/section locators

Optional lazy layers:

- embeddings/vector search
- reranking
- entity/relationship indexes
- specialized table/layout indexes

A vector database is not a mandatory mobile dependency.

### Incremental indexing

On source update:

- identify changed SourceVersion
- reuse unchanged derivations only when their source hashes/ranges remain valid
- invalidate stale derived views
- rebuild affected indexes incrementally
- preserve older versions while evidence/lineage still references them, subject to retention/privacy rules

### Knowledge collections

Collections provide scope, not authority. A collection can group room/project/work/canon/research sources while each SourceVersion retains independent origin, version and access metadata.

### Retrieval integration

KnowledgeQuery enters Retrieval Fabric with a known corpus boundary. Returned chunks/segments remain references to SourceVersions and may be expanded to exact source ranges.

Context Fabric receives the minimum useful extracts/capsules, never an unconditional full knowledge base dump.

### Privacy and deletion

Knowledge follows principal/project scope. Derived indexes and caches cannot outlive a required purge if they can reconstruct deleted source content. Secrets and credentials are not treated as ordinary knowledge artifacts.

### Archive and hostile-input resilience

Preflight enforces bounded:

- archive nesting
- expanded bytes/file counts
- individual file sizes
- parser time/memory
- malformed-content handling

Binary or unsupported content yields explicit unsupported/partial extraction state rather than fabricated text.

### Arabic / locale

- preserve original Unicode and bidi structure
- locale-aware segmentation
- Arabic punctuation/heading boundaries
- mixed Arabic/English/code safety
- normalization stored only as a derived search form
- never rewrite source text to a normalized representation

## Velocity assault

- no corpus indexing at app startup
- ingestion is explicit/on-demand
- streaming/incremental extraction for large files where practical
- lexical index first
- optional embeddings after demonstrated need
- page/range-level lazy PDF work
- no full-file prompt injection
- compact manifests
- cancellation between extraction/index batches
- resource governor caps RAM/CPU/thermal work
- heavy local model packs optional

## Pass B — destroy the winner

Rejected alternatives:

### Chunk as canonical truth
Breaks citations when chunking changes. SourceVersion is canonical.

### Embed everything immediately
Too expensive and unnecessary on mobile. Lexical/metadata first.

### Store only extracted text from PDFs/images
Loses visual/layout provenance. Exact source/page/region remains available.

### One merged project knowledge string
Destroys source/version boundaries and selective retrieval. Rejected.

### Summaries as durable authority
Rejected; summaries remain source-bound derived objects.

### Continuous background reindexing
Rejected on mobile. Refresh is event-driven and resource governed.

## Reconciled architecture

```text
Original Source
 -> SourceVersion
 -> Extract/Layout/OCR derivatives
 -> versioned locators
 -> lexical baseline indexes
 -> optional semantic/entity indexes
 -> Retrieval Fabric
 -> exact source-bound KnowledgeResults
 -> Context/Research/Vision consumers
```

## Ownership boundaries

- File Fabric owns mutable project filesystem transactions.
- Knowledge Fabric owns admitted source versions and derived searchable representations.
- Vision owns image/page interpretation.
- Retrieval owns query strategy.
- Research/Epistemic own evidence/truth semantics.
- Memory is not a substitute for source knowledge.
- Context is a disposable execution view.

## Mandatory evals

- TXT/Markdown round-trip identity
- multi-version document update
- stale chunk invalidation
- PDF exact page/range recovery
- scanned page OCR with uncertainty
- table/layout extraction
- Arabic headings and mixed bidi text
- code/project file identity
- duplicate files with different names
- same filename with changed content
- unsupported binary state
- malformed document
- archive size/nesting limits
- deletion/purge removes reconstructable derived data
- Lite mode with no vectors
- incremental update cheaper than full rebuild
- cancellation during ingestion
- 1/100/10k document collections
- source citation remains valid after reindex

## Implementation stages

- KF-P0 source/version/locator schemas
- KF-P1 ingestion manifest + type preflight
- KF-P2 text/PDF/structured extraction adapters
- KF-P3 lexical/metadata baseline index
- KF-P4 incremental invalidation/versioning
- KF-P5 KnowledgeQuery bridge to Retrieval
- KF-P6 OCR/Vision source-bound bridge
- KF-P7 optional embeddings/rerank/entity views
- KF-P8 collections/privacy/purge
- KF-P9 Android SAF/storage bridge
- KF-P10 multilingual/mobile/adversarial evals

## Freeze decision

Freeze candidate preserves exact source identity while allowing aggressive derived indexing and compression. It is stronger than a generic RAG knowledge base because every retrieval unit can be reconstructed to a versioned origin, while remaining lightweight enough for Seven's mobile baseline.

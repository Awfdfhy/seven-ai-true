# Seven Tool Fabric 2.0 — Wave 11 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 11. No candidate integrated/frozen.
Governing command: `WAVE_11_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should build a **Memory Retrieval + Context Workspace Plane** around its existing append-only authoritative memory ledger, not adopt a third-party memory framework as canonical state.

The strongest design is layered:

1. `MemoryLedger` — authoritative append-only memory/source events.
2. `MemoryIndexBuilder` — incrementally builds derived lexical/vector/entity/temporal/causal indexes.
3. `LexicalMemoryIndex` — SQLite FTS5/BM25 as the default cheap local recall path.
4. `VectorMemoryIndex` — optional SQLite-aligned vector index behind a replaceable adapter.
5. `HybridRetriever` — lexical + metadata + entity/time/causal + optional vector fusion.
6. `MemoryReranker` — optional local/remote reranker only after eval proves precision gain worth cost.
7. `EntityTemporalIndex` — entity mentions/facts with validity and source-event lineage.
8. `MemoryDeduplicator` — exact fingerprinting + cautious near-duplicate grouping, never destructive silent merging.
9. `MemoryConsolidator` — produces derived summaries/facts/profiles as proposals with coverage and lineage.
10. `TokenBudgetEngine` — model/provider-aware exact or explicitly estimated token budgets.
11. `ContextChunker` — structure-first deterministic source chunking with stable IDs/anchors.
12. `ContextCompiler` — selects the smallest sufficient context set for the current TaskContract.
13. `ContextWorkspace` — Pin / Compress / Expand / Evict / Reconstruct over derived context objects.
14. `ContextCache` — revision-bound reusable compiled context, never authoritative memory.
15. `ContextReconstructor` — rebuilds compressed/evicted context from source references.

Central law:

`Memory authority flows from source/event → derived views/indexes → retrieval candidates → context selection.`

Authority never flows backwards from an embedding, rank score, summary, graph edge extracted by a model, or cached prompt into canonical memory.

## Candidate registry

| Candidate / primitive | Kind | Preliminary class | Seven role | Decision |
|---|---|---|---|---|
| SQLite FTS5 + BM25/rank | local lexical index | CORE | primary cheap local lexical retrieval | strong default |
| SQLite recursive CTEs | relational query primitive | CORE | entity/causal/temporal graph traversal | reuse |
| SQLite Vec1 | vector extension | EXPERIMENTAL CORE-ALIGNED | future ANN vector index | Deep Polish/benchmark before admission |
| sqlite-vec | vector extension | EXPERIMENTAL/FALLBACK | compact native/Wasm vector benchmark path | pre-v1; adapter only |
| ONNX Runtime Mobile | local inference runtime | CORE-ALIGNED SPECIALIST | optional local embeddings/reranking | downloadable/custom build only |
| weighted Reciprocal Rank Fusion | ranking algorithm | CORE TINY BUILT-IN | fuse heterogeneous rankings without score calibration | implement Seven-owned |
| `Intl.Segmenter` | Web platform API | CORE PLATFORM | locale-aware sentence/word/grapheme segmentation | structure/chunk fallback |
| `tiktoken` | model tokenizer | SPECIALIST | exact OpenAI-family encodings it actually supports | never universal |
| Hugging Face Tokenizers | tokenizer runtime | SPECIALIST | exact tokenizer JSON for local/HF-compatible models | lazy/native/host path |
| provider-reported usage | provider evidence | CORE POST-HOC SOURCE | actual completed-request token usage when provider reports it | authoritative for that request |
| LLMLingua / LongLLMLingua / LLMLingua-2 | model-based compressor | EXPERIMENTAL HOST SPECIALIST | temporary prompt compression benchmark | not memory storage/core Android |
| Mem0 | memory framework/service | REFERENCE ONLY | hybrid retrieval/extraction ideas | reject canonical dependency/schema |
| Zep / Graphiti | temporal graph memory | REFERENCE ONLY | temporal facts, invalidation, hybrid graph retrieval ideas | reject canonical dependency/schema |
| Letta / MemFS | stateful-agent memory system | REFERENCE ONLY | in-context vs discoverable memory, versioned context repository ideas | reject canonical dependency/schema |
| LangGraph persistence/store | agent persistence/checkpoint framework | REFERENCE ONLY | thread checkpoint vs long-term store separation | Seven already owns Run Kernel |
| generic cloud vector DB | hosted vector database | REJECT FOR CORE | none | unnecessary authority/latency/dependency |
| one global tokenizer | approach | REJECTED | none | model-specific token semantics |

## 1. Authoritative vs derived data model

### Authoritative

Authoritative memory is never a summary or embedding. It is an append-only event/source record.

Proposed minimum `MemoryEvent` fields:

```text
MemoryEvent {
  eventId
  scope: user | room | session | project | world | system
  eventType
  sourceType
  sourceId / sourceRevision
  observedAt
  effectiveFrom?
  effectiveTo?
  payloadRef / payloadHash
  authorityClass
  privacyClass
  permissionSource?
  supersedes[]?
  conflictsWith[]?
  lineage
}
```

Events may mark later correction/supersession without rewriting history.

### Derived

Examples:
- FTS rows
- embeddings
- entity nodes/mentions
- temporal validity intervals
- causal edges
- summaries
- user/profile views
- memory clusters
- ranking features
- context chunks
- compiled prompts

Every derived object stores:
- source event/source IDs
- source revision/watermark
- transformation id/version
- model/runtime id when ML-derived
- createdAt
- validity/freshness state
- rebuild generation

Deleting a derived index may reduce recall quality temporarily, but can never delete the authoritative ledger.

## 2. LexicalMemoryIndex — SQLite FTS5 first

SQLite FTS5 provides phrase, prefix, NEAR and boolean search plus built-in BM25 ranking. Its special `rank` column defaults to the BM25 score and can be efficient for top-k queries.

Seven decision:
- FTS5 is the default local retrieval engine for text memories, project notes, source chunks and summaries;
- index high-value fields separately so BM25 column weights can differ, e.g. title/entity labels vs body;
- preserve original authoritative text outside FTS; FTS content is derived;
- update FTS transactionally alongside index-generation records, not as the only copy of content;
- keep an index watermark so Seven knows exactly which ledger revision has been indexed;
- if FTS integrity/watermark is suspect, mark it stale and rebuild instead of trusting partial search results.

Source:
- https://www.sqlite.org/fts5.html

## 3. VectorMemoryIndex

### SQLite Vec1

Current SQLite Vec1 documentation describes an SQLite virtual-table ANN extension supporting L2 and cosine distance, implemented in portable C without external dependencies, with AVX2/ARM NEON optimizations. Current documentation shows version 0.7. A July 2026 SQLite forum update says it is no longer merely preview-level, while still not being 1.0 and continuing work on online/non-training indexing modes.

Classification: **EXPERIMENTAL CORE-ALIGNED CANDIDATE**.

Why it fits Seven strategically:
- keeps vector retrieval near the existing SQLite data plane;
- ARM-aware implementation;
- no separate vector database/service;
- allows index implementation to remain a replaceable derived component.

Why it is not frozen:
- pre-1.0 maturity;
- Android/Wasm packaging and update behavior need benchmark;
- static/training-oriented ANN modes may not fit continuously changing conversational memory equally well;
- exact recall/latency/battery trade-offs must be measured on target hardware.

Sources:
- https://sqlite.org/vec1/doc/trunk/doc/vec1.md
- https://sqlite.org/forum/info/a09b103d9d41ed25a357a42aa22ca32a93d4a5fb9b10eb40ab3e14cde508e8f1

### sqlite-vec

`sqlite-vec` is compact, pure-C, dependency-free and usable anywhere SQLite runs, including Wasm, but upstream explicitly labels it pre-v1 and warns of breaking changes.

Classification: **EXPERIMENTAL/FALLBACK BENCHMARK**.

Source:
- https://github.com/asg017/sqlite-vec

### Vector authority rule

A vector neighbor is only a retrieval candidate. Similarity score cannot:
- upgrade CLAIM → FACT;
- merge memories automatically;
- override a later authoritative correction;
- grant permission;
- prove two entities are the same.

## 4. HybridRetriever

Recommended retrieval ladder:

```text
Task/query intent
→ scope/project/privacy filters
→ explicit pinned memories
→ exact IDs/entities/source anchors
→ temporal validity filters
→ lexical FTS5/BM25 candidates
→ optional vector candidates
→ entity/causal neighbors
→ rank fusion
→ optional reranker
→ authority/freshness/diversity filter
→ context-budget selection
→ source references
```

### Rank fusion

Use a tiny Seven-owned weighted Reciprocal Rank Fusion style combiner rather than directly mixing incomparable BM25/cosine/model scores.

Conceptually:

```text
score(item) = Σ weight(signal) / (k + rank_signal(item))
```

Signals may include:
- lexical
- vector
- entity match
- temporal match
- project/scope affinity
- causal adjacency

Authority is **not** one of the signals that gets turned into truth confidence. Authority is a hard/ordered policy applied after candidate generation.

Why not a dependency:
- fusion is tiny, deterministic code;
- Seven needs explicit per-signal provenance and tunable eval-backed weights;
- no benefit from importing a large retrieval framework for this operation.

## 5. RerankEngine

Use reranking only when the candidate pool is ambiguous enough to justify the cost.

Possible execution:
- local small cross-encoder via ONNX Runtime Mobile;
- remote provider reranker behind Model/Provider Fabric;
- skip entirely for simple exact/entity/FTS hits.

ONNX Runtime's mobile guidance explicitly recommends measuring binary size, model size, latency and power. It supports reduced/custom builds that include only required operators.

Seven rule:
- no reranker model in base APK by default;
- model pack is downloadable/removable;
- ResourceGovernor controls threads/concurrency;
- reranker score reorders derived candidates only;
- admission requires retrieval eval improvement after latency/RAM/battery cost.

Sources:
- https://onnxruntime.ai/docs/tutorials/mobile/
- https://onnxruntime.ai/docs/build/custom.html

## 6. Lessons from Mem0, Zep/Graphiti and Letta

These frameworks are useful research references, not canonical Seven dependencies.

### Mem0

Current Mem0 open-source documentation describes a newer memory path with ADD-oriented extraction and hybrid search combining semantic, BM25 keyword and entity matching. Its graph memory stores vector and graph representations and can optionally rerank results.

Useful Seven lessons:
- hybrid retrieval beats vector-only design;
- explicit entity linking improves recall;
- memory extraction and retrieval should be separate stages;
- memory history/auditing is valuable.

Why Seven does not adopt Mem0 as authority:
- default flows use LLM extraction/conflict logic;
- managed/vector/graph storage architecture differs from Seven's mobile-first SQLite/event-ledger authority;
- Seven must preserve raw event/source authority and explicit conflicts instead of a generic “latest truth wins” rule.

Sources:
- https://docs.mem0.ai/platform/features/graph-memory
- https://docs.mem0.ai/open-source/features/graph-memory
- https://docs.mem0.ai/core-concepts/memory-operations/add
- https://github.com/mem0ai/mem0

### Zep / Graphiti

Zep/Graphiti emphasizes temporal knowledge graphs, evolving facts, fact invalidation and hybrid time/full-text/semantic/graph retrieval. Graphiti can update a context graph incrementally as facts change.

Useful Seven lessons:
- valid-from / valid-to semantics belong on facts/relations;
- episodes/source events and extracted entity facts should remain distinguishable;
- historical facts should be invalidated/superseded rather than silently erased;
- graph traversal is a retrieval signal, not the authority store.

Why Seven does not adopt it as core:
- Graphiti commonly expects a graph database stack;
- Seven already has SQLite authoritative/event/entity/temporal plans;
- adopting the framework schema would leak third-party authority semantics into Memory Fabric.

Sources:
- https://help.getzep.com/graph-overview
- https://help.getzep.com/graphiti/getting-started/overview

### Letta / MemFS

Current Letta memory design exposes in-context memory blocks and a git-backed memory filesystem/context repository. Important system content stays in-context while deeper memory remains discoverable and loaded only when relevant.

Useful Seven lessons:
- context is scarce “real estate”;
- persistent memory does not need to be injected every turn;
- versioned, inspectable memory improves debugging/recovery;
- consolidation/reorganization should create recoverable changes.

Why Seven does not adopt Letta as canonical memory runtime:
- Seven already owns Project Memory, Memory Ledger and Context Workspace;
- Letta is a full agent runtime, not a tiny memory primitive;
- framework-specific block/filesystem rules must not define Seven authority.

Sources:
- https://docs.letta.com/
- https://github.com/letta-ai/letta-docs-md/blob/main/concepts/memfs/index.md
- https://github.com/letta-ai/letta-code/blob/main/src/agent/prompts/letta_local_memfs.md

### LangGraph persistence

LangGraph's distinction between thread checkpoints and long-term stores is useful architecture vocabulary, but Seven already has a Durable Run Kernel and separate Memory Fabric.

Decision: **REFERENCE ONLY**. Do not duplicate Seven's run/checkpoint state in another framework.

## 7. EntityTemporalIndex

Proposed derived relational tables/views:
- `memory_entities`
- `memory_entity_mentions`
- `memory_facts`
- `memory_fact_validity`
- `memory_temporal_anchors`
- `memory_causal_edges`
- `memory_source_links`
- `memory_conflicts`
- `memory_index_generations`

Each fact/edge retains source event IDs.

Important temporal distinction:
- `observedAt`: when Seven learned it;
- `effectiveFrom/effectiveTo`: when the fact is claimed to hold in the underlying world/user/project;
- `invalidatedAt`: when a later event caused the derived view to stop considering it current;
- original event remains in history.

Queries:
- fact current now
- fact as known at time T
- what changed between revisions
- facts sourced from project P
- entity history
- contradictions active at T
- causal/dependency neighbors

## 8. Memory candidate extraction and consolidation

Model-generated memories must enter as proposals:

```text
MemoryCandidate {
  candidateId
  sourceEventIds[]
  proposedType
  proposedContent
  proposedEntities[]
  proposedValidity?
  extractionModel/version
  evidenceSpans[]
  confidence
  conflicts[]
}
```

Then deterministic/verified checks decide:
- exact duplicate
- compatible additional evidence
- update/supersession
- contradiction
- temporary/session-only
- reject/noise
- needs user decision

No model may overwrite an old authoritative memory simply because it says “the latest truth is X”.

## 9. MemoryDeduplicator

### Exact duplicates
Use content/source hashes when the source identity and normalized canonical representation are equal.

### Near duplicates
Use a staged lightweight approach:
1. scope/entity/source filters
2. normalized text fingerprint
3. token/shingle overlap or small SimHash/MinHash-style fingerprint
4. optional embedding similarity
5. semantic comparison only for ambiguous candidates

Result is a **grouping proposal**, not a destructive merge.

Possible outcomes:
- `EXACT_DUPLICATE`
- `LIKELY_PARAPHRASE`
- `RELATED_NOT_DUPLICATE`
- `CONTRADICTORY`
- `UNKNOWN`

If two near-duplicate items carry different source/authority/timestamps, preserve both records even when one derived view chooses a preferred current representation.

## 10. Chunking strategy

Seven should own deterministic chunking rather than accept provider-specific chunks as canonical knowledge.

Priority order:
1. native document structure: heading/paragraph/list/table/code block/scene/message boundaries;
2. source anchors/pages/sections;
3. sentence segmentation;
4. token budget split as last boundary constraint.

`Intl.Segmenter` is a strong platform primitive for locale-sensitive grapheme/word/sentence segmentation and is broadly available in modern runtimes, with capability detection for older WebViews.

Source:
- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter

Proposed `ContextChunk`:
- stable chunk id
- source id + revision
- anchor/path
- raw source range
- derived text
- chunker version
- locale
- token counts by tokenizer profile where cached
- overlap parent/neighbor ids
- lineage

Rules:
- preserve raw authoritative text separately;
- overlap only when needed for retrieval continuity;
- never change chunk boundaries silently without incrementing chunker/index generation;
- code uses syntax/block boundaries before sentence splitting;
- tables keep row/header relationships;
- Arabic and mixed RTL/English/code need dedicated segmentation evals.

## 11. TokenBudgetEngine

There is no universal exact token count.

Priority:
1. **provider-reported usage** for a completed request when the provider returns it;
2. exact tokenizer for the exact model/encoding configuration;
3. compatible tokenizer profile explicitly verified against provider behavior;
4. conservative estimate marked `ESTIMATED`.

### tiktoken

`tiktoken` is an OpenAI-model BPE tokenizer library. Its `encoding_for_model` maps known OpenAI/model prefixes to encodings and raises/falls back explicitly for unrecognized models. It must therefore be a provider/model specialist, not Seven's universal tokenizer.

Current upstream supports model-specific mappings including GPT-family and GPT-OSS prefixes.

Sources:
- https://github.com/openai/tiktoken
- https://github.com/openai/tiktoken/blob/main/tiktoken/model.py

### Hugging Face Tokenizers

Hugging Face Tokenizers is a fast Rust-backed tokenizer runtime and can load tokenizer JSON definitions. It tracks alignment offsets through normalization/tokenization.

Seven role:
- specialist for local/HF-compatible models when the exact tokenizer artifact/revision is known;
- tokenizer definition hash becomes part of the model capability profile;
- likely native/host/lazy implementation rather than base WebView dependency until packaging is benchmarked.

Source:
- https://huggingface.co/docs/tokenizers/main/index

### Token profile

```text
TokenizerProfile {
  modelId
  providerId
  tokenizerKind
  tokenizerArtifactId/hash
  messageFramingRevision?
  toolSchemaOverheadPolicy?
  exactness: EXACT | COMPATIBLE | ESTIMATED
}
```

Context budgets reserve explicit headroom for:
- output tokens
- system/developer instructions
- tool schemas
- message framing
- reasoning/provider overhead when documented
- streaming/tool continuation

Unknown overhead gets a conservative reserve rather than pretending precision.

## 12. ContextCompiler and category budgets

Context is compiled per TaskContract.

Suggested categories:
- hard system/product invariants
- current user request
- pinned context
- recent conversation
- authoritative memories
- project/files/code
- research evidence
- canon/world state
- tool results
- derived summaries
- optional examples/history

Each category gets:
- minimum reserve
- soft target
- hard maximum
- priority policy
- compression policy
- eviction policy

Selection objective is not simply “highest similarity”. It optimizes:
- task relevance
- required authority/evidence
- freshness
- diversity/non-duplication
- dependency coverage
- source specificity
- token cost
- uncertainty/contradiction visibility

Critical pinned constraints cannot be evicted merely because a vector score is low.

## 13. ContextWorkspace operations

### `Pin`
Marks source/derived objects as mandatory or strongly preferred for a task/project scope.

### `Compress`
Creates a derived compact representation with source references and explicit coverage. Source remains intact.

### `Expand`
Rehydrates compact representation from referenced source/events.

### `Evict`
Removes an item only from the active compiled context/cache, not authoritative memory.

### `Reconstruct`
Rebuilds a context object from source IDs + transformation/version metadata.

Canonical tools:
- `context.pin`
- `context.unpin`
- `context.compile`
- `context.inspect_budget`
- `context.compress`
- `context.expand`
- `context.evict`
- `context.reconstruct`
- `context.explain_selection`

Every compiled context can explain why an item was included/excluded.

## 14. Summary/compression model

Default compression is **selection + structured summary + references**, not token deletion.

`MemorySummary` / `ContextSummary` stores:
- summary id
- source event/chunk IDs
- source watermark/revisions
- transformation prompt/algorithm id
- model id/version if model-generated
- generatedAt
- topic/scope
- coverage bounds
- known omissions
- unresolved conflicts
- extracted entities/facts references
- text
- lineage

A source update invalidates or marks stale any summary whose watermark no longer covers current source state.

### LLMLingua

LLMLingua/LongLLMLingua/LLMLingua-2 are legitimate model-based prompt-compression techniques. Current upstream uses additional language-model/token-classification machinery and is a Python/ML stack.

Classification: **EXPERIMENTAL HOST SPECIALIST**.

Possible role:
- temporary compression of a long assembled prompt after Seven already selected trusted source material;
- benchmark as an optional host/cloud optimization.

Forbidden role:
- canonical memory storage;
- destructive replacement of source text;
- base Android/startup dependency;
- compression of security/permission/canon invariants without guaranteed preservation/eval.

Sources:
- https://github.com/microsoft/LLMLingua
- https://microsoft.github.io/promptflow/integrations/tools/llmlingua-prompt-compression-tool.html

## 15. ContextCache

Compiled context can be cached only when the complete dependency identity is known.

Suggested cache key contains:
- TaskContract relevant hash
- model/provider/capability profile
- tokenizer profile revision
- conversation/session revision
- project revision
- memory ledger watermark
- memory index generation
- source/evidence revisions
- pinned IDs/revisions
- retrieval query hash
- ContextCompiler version
- category-budget policy revision

Cache entry stores the same lineage.

Invalidation:
- any authoritative dependency revision changes;
- permission/access change;
- model/tokenizer framing changes;
- source freshness policy says revalidation required;
- index generation changes in a way that could alter candidate selection.

Stale caches may be inspected for debugging but cannot silently be presented as current compiled context.

## 16. Index lifecycle and rebuild

Each derived index has:

```text
IndexGeneration {
  indexId
  kind
  schemaVersion
  engineVersion
  model/artifact hash?
  sourceWatermark
  builtAt
  buildStatus
  validationHash
}
```

Lifecycle:
`DIRTY → BUILDING → VALIDATING → READY`
with failure states `STALE / FAILED / CORRUPT`.

Rules:
- new authoritative events advance ledger watermark first;
- indexes catch up incrementally;
- retrieval declares index freshness/watermark;
- critical queries can fall back to authoritative/lexical paths if vector index is stale;
- rebuild uses a new generation then atomically swaps active generation after validation;
- never mutate one live vector generation in a way that leaves unknown partial state after crash.

## 17. Privacy / scope isolation

Every memory retrieval query carries an authoritative scope envelope:
- user/account
- room/session
- project
- world/canon branch
- privacy class
- permission set

Index rows and vector IDs inherit scope. Filtering after retrieval is insufficient when the backend can query across protected scopes; scope restrictions should be applied before/within candidate retrieval whenever implementation supports it.

No remote embedding/reranking provider receives private memory text unless:
- task/provider policy permits network use;
- user/project authorization allows it;
- provider adapter declares data handling;
- the action is logged in lineage/telemetry without recording secret content.

## 18. Android/resource strategy

### Base / cheap
- SQLite authoritative tables
- FTS5 if included in selected SQLite build
- tiny weighted rank fusion
- deterministic chunker
- hashes/fingerprints
- `Intl.Segmenter` where available
- ContextCompiler metadata/budget logic

### Lazy / optional model pack
- embeddings
- reranker
- advanced local classifier
- vector extension if final packaging requires separate native module

### Host/remote specialist
- LLMLingua prompt compression
- huge rerankers/embedding models
- third-party managed memory systems only as interoperability adapters, never authority

No memory-related feature may consume Seven's already-tight startup byte budget without a measured replacement/trade-off.

## 19. Eval strategy

### Retrieval dataset classes
- exact remembered preference
- corrected preference
- two contradictory memories
- old vs current temporal fact
- same entity with aliases
- near-duplicate but materially different facts
- project-specific fact with global lookalike
- long-session buried fact
- causal dependency question
- lexical-only match
- semantic-only paraphrase
- Arabic and mixed Arabic/English/code
- private memory outside active scope

### Metrics
- Recall@k
- MRR / nDCG where appropriate
- current-fact precision
- stale-fact rate
- contradiction visibility rate
- unauthorized cross-scope retrieval rate (target zero)
- duplicate-context rate
- source-anchor correctness
- token cost per successful answer
- retrieval latency
- RAM/battery impact on device
- reranker delta vs cost
- reconstruction fidelity
- index rebuild correctness

### Context-specific evals
- answer quality under fixed token budget
- critical-invariant retention
- source/evidence retention after compression
- “lost in the middle” resistance
- context duplication
- irrelevant context percentage
- token estimate overrun rate

### Property/invariant tests
Reuse Wave 08 fast-check:
- deleting vector index does not delete memory events
- summary cannot increase source authority
- revoked scope cannot be retrieved through cache/index
- index rebuild from same ledger + versions is deterministic where expected
- `compress → expand` resolves to the same source reference set
- a later correction does not disappear behind higher similarity of the old fact

## 20. Rejected / limited approaches

- vector database as canonical memory: rejected.
- “latest extracted truth wins” without source/authority conflict handling: rejected.
- third-party memory framework schema as Seven canonical state: rejected.
- loading all memory every turn: rejected.
- one global tokenizer presented as exact for all models: rejected.
- embedding similarity as authority/confidence: rejected.
- silent near-duplicate merge: rejected.
- destructive summary replacing original chat/source events: rejected.
- model compression of permission/security/canon rules without preservation proof: rejected.
- always-on reranker/embedding model in base APK: rejected.
- cloud memory/vector provider required for normal local recall: rejected.
- graph database added merely to copy Graphiti/Zep architecture: rejected.
- stale cached compiled context silently reused after dependency changes: rejected.
- remote embeddings of private memory without an explicit authorized network path: rejected.

## 21. Canonical memory / retrieval tools

### Authoritative memory
- `memory.event.append`
- `memory.event.get`
- `memory.event.query`
- `memory.event.supersede`
- `memory.conflicts`
- `memory.history`

### Derived views/indexes
- `memory.index.status`
- `memory.index.rebuild`
- `memory.search_lexical`
- `memory.search_vector`
- `memory.search_hybrid`
- `memory.entities`
- `memory.timeline`
- `memory.causal_neighbors`

### Consolidation
- `memory.candidate.propose`
- `memory.candidate.validate`
- `memory.summary.create`
- `memory.summary.refresh`
- `memory.dedupe.propose`

### Context
- `context.pin`
- `context.unpin`
- `context.compile`
- `context.inspect_budget`
- `context.compress`
- `context.expand`
- `context.evict`
- `context.reconstruct`
- `context.explain_selection`

Low-level index mutation is internal-only; models do not directly write FTS/vector/entity indexes.

## 22. Deep Polish queue

Recommended order:

`MemoryEvent authoritative schema → derived-view lineage/index watermarks → FTS5 LexicalMemoryIndex → deterministic ContextChunker → TokenBudgetEngine → ContextCompiler/category budgets → HybridRetriever + weighted RRF → EntityTemporalIndex → MemoryDeduplicator → summary/consolidation contracts → ContextCache/Reconstructor → Vec1/sqlite-vec benchmark → local embedding/reranker model eval → optional LLMLingua host experiment → framework-inspired features only if Seven Evals prove missing value`

Authority and reconstructability are locked before semantic convenience layers.

## 23. Open gaps

- exact authoritative SQLite MemoryEvent schema and migration plan;
- final SQLite build/package and whether FTS5/Vec1 are compiled in or dynamically loaded;
- Vec1 online-update behavior/performance on Seven's real memory workload;
- sqlite-vec vs Vec1 Android/WebView bundle/performance benchmark;
- local embedding model choice, dimensions and quantization;
- local reranker model choice only after retrieval dataset exists;
- exact Arabic lexical normalization/tokenization strategy;
- near-duplicate fingerprint parameters;
- tokenizer implementation inside Android/Capacitor for OpenAI and HF tokenizers;
- provider-specific message/tool-schema token overhead belongs partly to Wave 12;
- category budget defaults require real conversation/project evals;
- summary refresh thresholds/watermarks;
- persistence encryption/privacy policy for sensitive memory;
- multi-device sync is deferred to Recovery/Sync work because merge authority must be explicit.

## Coverage statement

Wave 11 covers authoritative-vs-derived memory state, FTS/vector/entity/temporal/causal indexes, hybrid retrieval and rank fusion, optional reranking, memory extraction/consolidation, dedupe, deterministic chunking, model-specific token accounting, active context compilation, reversible compression/expansion, cache invalidation, index rebuild generations, privacy scoping and memory/context evals.

This reaches practical saturation for general Memory + Context tool discovery. Specific models, SQLite packaging and schema details remain Deep Polish/implementation decisions.

No production integration occurred in this wave. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.

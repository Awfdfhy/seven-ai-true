# Seven Tool Fabric 2.0 — Wave 11 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: Memory Fabric, retrieval indexes, context compilation, token accounting, chunking, reranking, compression and reconstruction.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 11

Goal: discover the strongest lightweight primitives for Seven's authoritative-memory-derived retrieval and active Context Workspace without importing a heavyweight agent-memory framework or allowing summaries/embeddings/caches to become authority.

Research current primary docs/repositories and technical evidence for:
- append-only/event-sourced local persistence primitives
- SQLite FTS/BM25 lexical retrieval
- lightweight vector indexes compatible with SQLite/mobile
- hybrid retrieval and rank fusion
- local reranking models/runtime
- entity/temporal/causal indexes
- deterministic chunking/segmentation
- exact/model-specific tokenization and safe token estimation
- context budgeting and priority selection
- duplicate/near-duplicate detection
- incremental index updates
- memory reconstruction from authoritative events
- summarization/compression patterns that preserve lineage
- context pin/compress/expand/evict/reconstruct operations
- cache invalidation and freshness
- long-session retrieval evaluation
- optional memory frameworks only as references/candidates, not assumed architecture

Evaluate candidates such as, where relevant:
- SQLite FTS5 / recursive CTEs / JSON support
- sqlite-vec / SQLite Vec1 direction
- ONNX Runtime Mobile rerankers
- model/provider tokenizers
- tiktoken and tokenizer libraries only for models they accurately represent
- Intl.Segmenter / deterministic sentence/paragraph splitters
- LLMLingua-class compression only if practical and authority-safe
- Letta / Mem0 / Zep / LangGraph memory/checkpoint designs as architectural references, not automatic dependencies
- lightweight hashing/fingerprinting for dedupe

For every candidate determine:
- exact retrieval/compression capability
- authority semantics
- Android/runtime weight
- persistence/storage cost
- incremental-update behavior
- deterministic/reproducible behavior
- model dependence
- token-accounting accuracy
- privacy implications
- failure/staleness modes
- rebuild/reconstruction capability
- maintenance/license
- overlap with Waves 03/05/09

Rules:
- authoritative memory is the event/source ledger, not vector DB, summary, embedding or cache.
- every derived memory/index object carries lineage and a source revision/watermark.
- deleting/rebuilding a derived index must never destroy authoritative memories.
- retrieval rank cannot increase source authority.
- model-generated memory candidates are proposals until validation/commit.
- context compression must be reversible/reconstructable through source references; no destructive history replacement.
- token budgets are model-specific where exact tokenizers exist and conservative estimates otherwise.
- no huge always-resident embedding/reranker model in base APK.
- context selection is adaptive; do not inject every memory/file/message on every turn.
- near-duplicate detection must not silently merge materially different memories.
- framework-specific storage schemas may not become Seven's canonical state.

Output:
1. candidate registry
2. Memory Retrieval Plane architecture
3. Context Workspace tool contracts
4. authoritative/derived data model
5. hybrid retrieval strategy
6. token/chunking strategy
7. compression/reconstruction strategy
8. dedupe/freshness/index-rebuild strategy
9. Android/resource strategy
10. eval strategy
11. rejected/limited approaches
12. Deep Polish queue

Preserve material evidence, decisions, uncertainty and rejection reasons in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files, or merge protected branches.

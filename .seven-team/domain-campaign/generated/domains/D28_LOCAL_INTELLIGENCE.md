# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: READY

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
SOURCE_ANALYSIS=Harvested ACL'26 papers: HiGMem [SOURCE primary] (hierarchical/LLM-guided memory for long-term conversations) and LLMRouterBench [SOURCE primary] (routing context) — both relevant. Focus on embeddings, reranking, offline fallback. Limitations: research papers (conceptual), not Seven implementation; freshness 2026. Gaps: embedding models, vector store, rerankers, chunking, eviction, privacy (on-device), offline semantics, Android ergonomics.
CURRENT=Repo grep shows embeddings, rerank/reranking, offline, local model/intelligence surface. A05,A09 owners; overlap with routing (D08) and performance (D17: storage/network pressure, long chats). Memory/embeddings often touch storage; need to respect ownership and ARCHITECTURE.md.
TARGET=Local intelligence: privacy-preserving embeddings, efficient reranking, hierarchical memory (inspired by HiGMem principles), offline fallback (graceful degradation), bounded storage/compute, cancellation-aware indexing/search, and deterministic behavior under pressure. Preserve Seven identity; don’t copy papers pixel-for-pixel.
NOW=Map modules: embedding providers (local/remote), vector store, reranker, chunking, memory lifecycle, offline handlers. Identify storage pressure paths (D17), network dependencies, and Android constraints. Define invariants: offline-first fallback paths, no secrets in local stores, eviction policy.
NEXT=Introduce backpressure/cancellation for embedding generation/indexing (long chats create many chunks), budget guards (time/memory/IO), and reranking with top-k caps. Add offline fallback for retrieval (serve from cache when network unavailable). 
LATER=Hierarchical memory structure with relevance decay/eviction, incremental indexing, privacy controls, and integration with routing (D08) to prefer local when appropriate. 
TESTS=Deterministic: embedding/rerank correctness, eviction, offline fallback, cancellation mid-index. Adversarial: storage pressure (disk full), large chats, corrupted index, model load failures. Android: offline mode, low memory. 
RISKS=Index corruption, unbounded growth (storage pressure), slow indexing blocking UI, memory spikes, privacy leakage, cross-system coupling. 
FIRST_SLICE=Offline fallback for retrieval/search: if network unavailable, serve from local cache with clear UX; add cancellation to indexing pass; enforce storage quota. 
KNOWN_UNKNOWNS=Embedding model choices (on-device vs remote), vector DB, chunking strategy, reranker availability, eviction policy, current offline semantics.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need concrete embedding/vector/memory modules and offline contract)

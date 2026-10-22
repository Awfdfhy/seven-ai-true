# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: READY

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
SOURCE_ANALYSIS=Harvested HiGMem (hierarchical LLM-guided memory for long-term conversational agents) and LLMRouterBench. HiGMem suggests hierarchical memory organization guided by LLMs for long-term conversations. LLMRouterBench relevant for local/offline routing. Evidence is research-oriented; no Seven local embeddings/reranking/offline fallback implementation inspected.
CURRENT=ARCHITECTURE lists memory as persistent domain (StorageEngine). No local intelligence specifics detailed in inspected sections. Ownership A05/A09.
TARGET=Local-first intelligence: embeddings/reranking with offline fallback, hierarchical memory (inspired by HiGMem), privacy-preserving, bounded resource usage.
NOW=Inventory memory schema/capabilities, define local model interface (embeddings/rerank), and design offline fallback path.
NEXT=Implement hierarchical memory indexing with retrieval, reranking, and budget enforcement.
LATER=On-device evals and privacy controls.
TESTS=Memory retrieval tests, offline fallback tests, resource budget tests, and privacy checks.
RISKS=On-device model size/latency, memory bloat, privacy leaks. Must not block cloud path.
FIRST_SLICE=Define LocalIntelligence interface + offline fallback contract with tests; audit memory storage for local retrieval hooks.
KNOWN_UNKNOWNS=Available on-device models, Android constraints, embedding dimensions, and rerank availability.
DOMAIN_VERDICT=READY_FOR_PLAN

# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT

SOURCE_ANALYSIS=Harvested 20 sources (11 primary, 9 secondary) collectively describe a shift from "dump everything into context" to structured, retrievable, temporal long-term memory with explicit relevance, budgets and provenance. 

Key convergent points:
- Temporal knowledge graphs (Zep/Graphiti) [SOURCE primary] https://arxiv.org/abs/2501.13956 treat facts/episodes/entities as time-stamped (valid_at/invalid_at) to support point-in-time queries and change tracking [SOURCE secondary] https://help.getzep.com/facts, [SOURCE secondary] https://help.getzep.com/context-types, [SOURCE secondary] https://help.getzep.com/v2/graphiti/core-concepts/adding-episodes.
- Production-oriented extraction+filtering (Mem0) [SOURCE primary] https://arxiv.org/abs/2504.19413 emphasizes scalable ingestion, deduplication and lower token cost; Mem0 reports strong benchmark scores with 3-4x lower tokens vs full-context [SOURCE secondary] https://mem0.ai/research (referencing LoCoMo/LongMemEval/BEAM).
- Benchmarks expose retrieval gaps: LongMemEval [SOURCE primary] https://arxiv.org/abs/2410.10813, context-driven retrieval [SOURCE primary] https://arxiv.org/abs/2609.03467, and evidence utilization [SOURCE primary] https://arxiv.org/abs/2608.30508 show that relevance (not just similarity) and using retrieved evidence correctly matter more than stuffing context.
- Local-first/edge persistence is a distinct design axis (MemX) [SOURCE primary] https://arxiv.org/abs/2603.16171, suggesting on-device storage + privacy. For web/Capacitor targets, browser storage primitives matter: IndexedDB for structured large data [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API.
- Structured memory blocks (Letta) [SOURCE secondary] https://docs.letta.com/v1-sdk/memory/memory-blocks and configuration [SOURCE secondary] https://docs.letta.com/configuration/memory model explicit core memory vs episodic vs working memory.
- Agentic frameworks (LangGraph/Deep Agents) [SOURCE secondary] https://docs.langchain.com/oss/javascript/langgraph/thinking-in-langgraph, [SOURCE secondary] https://docs.langchain.com/oss/javascript/deepagents/overview treat memory as a first-class system with planning/subagents and file-system awareness, relevant to orchestration.
- Newer works (Memoria [SOURCE primary] https://arxiv.org/abs/2512.12686, TeleMem [SOURCE primary] https://arxiv.org/abs/2601.06037) point to scalability/personalization and multimodality; freshness varies (arXiv IDs with 260X look forward-dated in titles but are the cited references).

Disagreements/limitations: KG vs flat vector stores (temporal graph adds complexity; need point-in-time correctness). Local-first vs cloud sync tradeoffs. Benchmarks differ (LongMemEval vs LoCoMo) and cost metrics vary. Harvested URLs are abstracts/docs (not full papers in all cases) — sufficient for design direction but not implementation detail.

CURRENT=Seven's current implementation (inspected from repo):
- ARCHITECTURE.md: Persistent domains include "memory" (rooms, memory, settings, provider health, research cache, RPG/canon, GitHub metadata) under StorageEngine contract with migration protocol (read old → validate → write new temp → verify → commit → delete old) and recovery screen on storage failure. No second ShellStore; AppKernel composes once. (Evidence: `remake/ARCHITECTURE.md:47-96`, `remake/ARCHITECTURE.md:98-137`)
- PHASE3_MEMORY_CONTEXT.md exists (Memory/Context phase doc). (Evidence: `remake/PHASE3_MEMORY_CONTEXT.md` present; inspected content shows memory/context is a tracked phase.)
- Plans: `plans/MEMORY_SCOPE_HARDENING.md` exists (memory scope hardening plan). (Evidence: `plans/MEMORY_SCOPE_HARDENING.md`)
- Storage is adapter-based (IndexedDB likely used in web adapter per MDN and architecture). Persistence correctness emphasized (atomic migrations, integrity metadata, export/import). TaskManager owns tasks with cancellation; Android uses typed bridge envelopes.
- No obvious second memory implementation in architecture (strict ownership). Memory is listed as persistent domain but implementation details (episodic vs semantic, relevance scoring, budgets, summaries) not fully specified in ARCHITECTURE excerpt.

So Seven already treats memory as a persistent domain with migration safety and recovery. The gap is likely: how memory is extracted, ranked by relevance to current context, budgeted into payloads, summarized over time, and kept correct across migrations/edits.

TARGET=Desired Seven memory/context fabric:
- Explicit memory model: working (transient), episodic (interactions), semantic/core (facts/preferences), and thread summaries — aligned to Letta blocks [SOURCE secondary] https://docs.letta.com/v1-sdk/memory/memory-blocks and Zep context types [SOURCE secondary] https://help.getzep.com/context-types.
- Relevance-first retrieval (not just recency/similarity). Support both proactive (context-driven, no explicit query) [SOURCE primary] https://arxiv.org/abs/2609.03467 and explicit retrieval. Require evidence utilization checks [SOURCE primary] https://arxiv.org/abs/2608.30508.
- Temporal correctness: facts/episodes carry timestamps; updates create new versions or bi-temporal fields consistent with Graphiti [SOURCE primary] https://arxiv.org/abs/2501.13956, [SOURCE secondary] https://help.getzep.com/facts. Point-in-time reads for debugging/audit.
- Context budgets: per request/mode, token budget enforced (user+system+history+memory+tools). Memory items must be ranked and trimmed deterministically by budget.
- Summarization: rolling summaries with citations to episodes/facts to avoid drift; support memory consolidation.
- Persistence correctness: IndexedDB-backed with atomic migrations [MDN] [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API, integrity metadata, export/import, recovery (matches architecture). Local-first by default; avoid leaking secrets (architecture already requires no plaintext secrets).
- Deterministic behavior: extraction/normalization rules, deduplication, contentHash for citations (matches Research citation schema in ARCHITECTURE 7).

NOW=First high-value implementation slice (smallest that materially improves domain):
1. Define memory schema v1 (types): MemoryItem { id, kind(eps/sem/core/summary), content, entities[], ts, validFrom?, validTo?, sourceIds[], contentHash, relevanceScore?, lastAccessedAt } with migration path. Evidence: architecture migration protocol + MDN IndexedDB.
2. Add relevance scorer (hybrid: recency*decay + entity overlap + token fit) and budgeter that produces top-K by relevance subject to token budget; log why items included/excluded (provenance). Evidence: context-driven retrieval [SOURCE primary] https://arxiv.org/abs/2609.03467, UTILMEM evidence utilization [SOURCE primary] https://arxiv.org/abs/2608.30508.
3. Implement memory retrieval gate in context shaping (before provider dispatch) with invariant: memory injection respects budgets and is deterministic for same inputs. Evidence: Deep Think invariant in ARCHITECTURE (final payload revalidated) [ARCHITECTURE 4].
4. Add unit+contract tests for scorer/budgeter and a regression test for migration roundtrip (matches architecture test expectations).

NEXT=Next improvements:
- Episode ingestion pipeline: turn user+assistant+tool results into episodes with entities/facts extraction (lightweight rules first; avoid heavy LLM extraction unless budgeted). Align to Graphiti episodes [SOURCE secondary] https://help.getzep.com/v2/graphiti/core-concepts/adding-episodes.
- Temporal updates: when fact changes, invalidate previous with validTo and write new (bi-temporal) or versioned; point-in-time query API. [SOURCE secondary] https://help.getzep.com/facts.
- Rolling summaries: thread→summary with references to source episodes; decay old summaries.
- Memory blocks (core memory) UI+API surface consistent with Letta [SOURCE secondary] https://docs.letta.com/v1-sdk/memory/memory-blocks.
- Local-first mode with export/import and encryption-at-rest consideration (no plaintext secrets). Align with MemX local-first [SOURCE primary] https://arxiv.org/abs/2603.16171.

LATER=Longer-term ideas:
- KG-lite: lightweight entity graph over memory items (edges) to improve recall for multi-hop questions; evaluate against Zep KG [SOURCE primary] https://arxiv.org/abs/2501.13956.
- Multimodal memory (images/attachments) [SOURCE primary] https://arxiv.org/abs/2601.06037 if attachments domain expands.
- Benchmark integration: run LongMemEval-style probes [SOURCE primary] https://arxiv.org/abs/2410.10813 and UTILMEM [SOURCE primary] https://arxiv.org/abs/2608.30508 against Seven to track quality/cost.
- Adaptive consolidation policies (Memoria ideas) [SOURCE primary] https://arxiv.org/abs/2512.12686.
- Cross-device sync with end-to-end encryption and conflict resolution (requires careful privacy model).

TESTS=Deterministic, E2E, Android, adversarial and eval proof:
- Deterministic: scorer/budgeter property tests (same inputs → same order/selection), contentHash stable, migration idempotency.
- Migration: roundtrip old→new with corrupt temp (must recover). Verify integrity metadata.
- Retrieval: context-driven queries with no explicit user question [SOURCE primary] https://arxiv.org/abs/2609.03467; evidence utilization assertions [SOURCE primary] https://arxiv.org/abs/2608.30508.
- Budgets: token overflow cases (trim deterministically), per-mode caps.
- Persistence: IndexedDB transaction rollback, quota exceeded, recovery screen appears on storage failure (matches ARCHITECTURE 5).
- Adversarial: large episodes, duplicate facts, time-skew (backdated), circular references, PII in memory (must not leak to logs), rapid updates causing invalidation storms.
- Android: bridge round-trip for memory ops if exposed via native; typed envelopes. E2E: room with memory affects next turn but respects budget.

RISKS=Security/privacy/performance/Android/RTL/cross-system risks:
- Privacy: memory can retain sensitive data. Need redaction, retention policy, export/delete, no plaintext secrets (architecture). Local-first reduces exposure but sync increases attack surface.
- Correctness: bi-temporal invalidation is error-prone; point-in-time reads must not mix states.
- Performance: extraction/scoring on every turn must be cheap; avoid LLM calls in hot path. IndexedDB read amplification. 
- Migration: failed migration leaves previous version recoverable (critical). 
- Cross-system: memory touches ShellStore/TaskManager (context shaping), StorageEngine, Research citations (contentHash), Attachments (if multimodal). Must respect ownership (no duplicate owners).
- Android: SAF/bridge lifecycle, quota on mobile.
- Evaluation: benchmark contamination/overfitting; prefer task-grounded evals.

FIRST_SLICE=Define MemoryItem schema v1 + IndexedDB store + relevance scorer + budgeter + retrieval gate in context shaping. Enforce token budget, log provenance, add deterministic tests and migration test. Size small but touches StorageEngine contract and context shaping (high leverage).

KNOWN_UNKNOWNS=Missing evidence:
- Seven's exact memory storage implementation (adapter code) not fully visible in ARCHITECTURE excerpt; need to inspect actual IndexedDB adapter and current memory table shapes. 
- Current context shaping path (where payload assembled) — confirm integration point with ModelRouter/Deep Think. 
- Token counting method (provider-dependent). 
- Retention/TTL and PII policy details. 
- Whether memory blocks UI exists.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (insufficient Seven-internal implementation evidence for exact integration points; external sources analyzed and aligned, but need to inspect src/adapters/storage and context shaping code before EXECUTE).

# Seven Memory Fabric v2 — Research Synthesis

Date: 2026-10-04
Status: ACTIVE DESIGN INPUT
Owners: A06, B08, A04, A08, B09, B10

## Decision

Seven will not clone one memory product. The target is a local-first hybrid architecture assembled from the strongest evidence-backed ideas:

1. **Mem0** — extract/consolidate durable facts instead of replaying entire histories; minimize token and latency overhead.
2. **Graphiti/Zep** — represent changing facts temporally; retain provenance to source episodes/messages; do not destroy history when facts change.
3. **Letta** — separate small always-visible core memory from a larger recall archive.
4. **MemX / information-retrieval practice** — local-first hybrid ranking, multiple retrieval signals, and low-confidence rejection rather than forced recall.
5. **LongMemEval / newer conversational-memory benchmarks** — test extraction, multi-session reasoning, temporal reasoning, updates, abstention, implicit retrieval, and evidence utilization.

Seven-specific constraint: the baseline must work offline/local on Android without requiring Neo4j, FalkorDB, a cloud vector database, or a paid embedding API.

## Source ledger

### Primary research / benchmark papers
- Mem0: https://arxiv.org/abs/2504.19413
- Zep temporal knowledge graph: https://arxiv.org/abs/2501.13956
- LongMemEval: https://arxiv.org/abs/2410.10813
- MemX local-first memory: https://arxiv.org/abs/2603.16171
- Memoria hybrid summary + KG: https://arxiv.org/abs/2512.12686
- TeleMem long-term multimodal memory: https://arxiv.org/abs/2601.06037
- LOCOMO-CONV implicit conversational retrieval: https://arxiv.org/abs/2609.03467
- UTILMEM evidence utilization: https://arxiv.org/abs/2608.30508

### First-party implementation references
- Mem0 research: https://mem0.ai/research
- Letta memory: https://docs.letta.com/configuration/memory
- Letta memory blocks: https://docs.letta.com/v1-sdk/memory/memory-blocks
- Graphiti overview: https://help.getzep.com/graphiti/getting-started/overview
- Graphiti episodes: https://help.getzep.com/v2/graphiti/core-concepts/adding-episodes
- Zep facts / temporal validity: https://help.getzep.com/facts
- Zep context types: https://help.getzep.com/context-types
- LangGraph/Deep Agents long-term memory: https://docs.langchain.com/oss/javascript/deepagents/overview
- IndexedDB: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API

## What we keep

### Working memory
Current room turns, current task state, and bounded conversation summary. Working memory is not durable user memory.

### Core memory
Tiny always-visible set: identity/name, explicit high-priority remembered facts, critical stable preferences. Strict token cap.

### Recall memory
Persistent facts/preferences/goals/decisions/events retrieved only when relevant.

### Episode provenance
Every derived memory points back to its source room/message/time. Raw chat remains canonical in room storage; memory is a derived view.

### Temporal history
A corrected memory supersedes the old fact rather than overwriting history. The old fact receives a validity end time.

### Retrieval
Use multiple signals and rejection:
- lexical/BM25-like relevance
- tags/entities
- recency
- importance
- confidence
- room/global scope
- stable core memory
- future optional semantic/vector signal

No relevant signal -> no recall. Memory retrieval must be allowed to abstain.

## What we reject

- Saving every message as a durable memory.
- Treating summaries as canonical truth.
- A single unversioned text blob.
- Forced top-k recall even when all candidates are irrelevant.
- Destructive overwrite of corrected facts.
- Automatic storage of passwords, OTPs, API keys or obvious credentials.
- Required cloud graph/vector infrastructure for baseline Android memory.
- Letting assistant hallucinations become user facts automatically.
- Sending user content to a second LLM solely for memory extraction without an explicit privacy/product policy.

## Seven Memory Fabric v2 model

MemoryFact:
- kind: profile | preference | goal | decision | event | fact | procedure
- tier: core | recall
- scope: global | room
- canonicalKey
- normalized content
- tags/entities
- importance
- confidence
- temporal validity
- source room/message/time
- supersedes[]
- status

MemoryWriteEvent:
- immutable add/supersede history
- source-bound

## Extraction policy v1

Local deterministic extraction first:
- explicit "remember that" / Arabic equivalent
- name/identity
- durable preference
- durable goal
- current study/work
- explicit room-only memory

Conservative by design. Missing a memory is preferable to silently storing a false or sensitive memory.

Provider/LLM-assisted extraction is a later optional tier and must have:
- privacy UX
- structured output schema
- provenance
- confidence
- deterministic validation
- no assistant-only fact promotion

## Retrieval policy v1

Core memory: bounded always-visible set.
Recall memory: relevance-gated.
Use reciprocal-rank-style fusion of lexical, recency and importance/confidence ranks plus tag matching.
A future embedding signal may join the fusion without replacing lexical/temporal evidence.

## Evaluation contract

The memory system is not PASS because a unit test can store/read a record.

Required abilities:
1. extraction precision
2. room/global scope isolation
3. multi-session persistence
4. temporal correction/supersession
5. provenance traceability
6. unrelated-query abstention
7. implicit preference recall
8. conflicting-memory handling
9. context/token budget
10. corruption/restart recovery
11. Arabic/English parity
12. secret exclusion
13. long-history performance
14. memory deletion/forget semantics
15. no instruction injection from recalled memory

## Current implementation truth

The Remake already had:
- MemoryRecord v1: content/priority/global-or-room
- IndexedDB memory repository
- room summary persistence
- ContextBuilder with a simple token budget
- word-overlap ranking

Weaknesses:
- no temporal fact model
- no source provenance in durable facts
- no fact type/tier/confidence
- no supersession history
- retrieval was simple word overlap
- no confidence rejection
- the new live Chat transport was not using MemoryRecord/ContextBuilder at all

Memory Fabric v2 is being introduced alongside v1 first so migration can be tested rather than risking destructive replacement.

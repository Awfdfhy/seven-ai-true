# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: READY

DOMAIN_ID=D02_MEMORY_CONTEXT
SOURCE_ANALYSIS=Harvested evidence emphasizes structured memory systems (Mem0, Zep/Graphiti, MemX/Memoria/TeleMem), temporal/provenance models, benchmark-driven evaluation (LongMemEval/LoCoMo/UTILMEM), and local-first storage via IndexedDB. Sources collectively favor durable, queryable memory with temporal validity and provenance over naive transcript replay. Disagreements: graph/temporal complexity vs local lexical/temporal baseline; benchmark claims are vendor-reported and not Seven-specific. Limitations: abstracts only for most papers; no direct code integration evidence; no Seven benchmark yet.
CURRENT=Seven memory/context surfaces must be inspected in release/remake; no verified production memory fabric from this report. Evidence level is research-only.
TARGET=Local-first memory/context fabric with deterministic persistence, temporal correction, provenance, abstention, restart recovery, secret exclusion, and benchmarked retrieval.
NOW=Define storage schema and memory lifecycle contracts; audit existing IndexedDB/localStorage usage and persistence boundaries.
NEXT=Implement incremental memory migration beside legacy memory; add restart-persistence and secret-exclusion tests; benchmark lexical/temporal baseline.
LATER=Optional graph/vector upgrades only after measured benchmark wins.
TESTS=Deterministic unit/integration tests for persistence/restart; benchmark comparisons; adversarial secret-injection tests; Android WebView storage tests.
RISKS=Privacy leakage, stale memory, migration data loss, unbounded storage growth, concurrency races, Android WebView storage eviction.
FIRST_SLICE=Versioned IndexedDB-backed memory records with provenance/timestamps and restart recovery.
KNOWN_UNKNOWNS=Exact existing Seven memory implementation, current schema, Android exact-build storage behavior, benchmark baseline.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT

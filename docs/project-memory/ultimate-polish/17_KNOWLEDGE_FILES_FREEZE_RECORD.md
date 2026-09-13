# Seven AI — Capability 17 Knowledge / Files Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**
Implementation: **Deferred / partial knowledge foundations remain**

## Frozen target

**Seven Knowledge Fabric 3.0 — Versioned Source-Bound Knowledge Vault**

## Prime law

> Knowledge begins with an identifiable source version. Chunks, indexes, embeddings, summaries, OCR text and extracted structure are derived views and never silently replace the source.

## Frozen decisions

1. `SourceVersion` is the durable source identity boundary.
2. A changed source creates a new version rather than mutating old evidence silently.
3. Chunks are reconstructable retrieval views, not canonical knowledge units.
4. Summaries and OCR outputs are derived artifacts with lineage.
5. Exact/metadata/lexical indexing is the mobile baseline.
6. Embeddings, vector search, entity graphs and rerankers are optional lazy layers.
7. PDF/image extraction preserves page/region/layout locators.
8. Vision owns visual interpretation; Knowledge stores source-bound representations.
9. Index invalidation follows source hashes/versions and is incremental where safe.
10. Collections define scope/grouping, not epistemic authority.
11. Context receives selective source-bound extracts rather than full knowledge dumps.
12. Derived caches/indexes obey source privacy/purge requirements.
13. Unsupported/malformed content yields explicit partial/unsupported states.
14. Archive/file parsing is resource bounded.
15. Arabic/bidi originals are preserved; normalization exists only as a derived search form.
16. No ingestion/index work is required at app startup.
17. Android access eventually uses explicit SAF/project grants rather than ambient broad storage.

## Canonical objects

`KnowledgeSource`, `SourceVersion`, `SourceLocator`, `DerivedRepresentation`, `ExtractionArtifact`, `ChunkView`, `LexicalIndexRef`, `SemanticIndexRef`, `EntityIndexRef`, `KnowledgeCollection`, `IngestionManifest`, `KnowledgeQuery`, `KnowledgeResult`.

## Required eval families

Version updates, stale-view invalidation, exact PDF recovery, OCR uncertainty, layout/tables, Arabic/mixed text, duplicate identity, unsupported binaries, malformed docs, archive bounds, purge propagation, Lite without vectors, incremental indexing, cancellation and large collections.

## Implementation path

`KF-P0` source contracts → `P1` ingestion/preflight → `P2` extraction → `P3` lexical baseline → `P4` invalidation/versioning → `P5` Retrieval bridge → `P6` Vision/OCR bridge → `P7` optional semantic layers → `P8` privacy/purge → `P9` Android storage → `P10` evals.

No implementation completion is claimed by this freeze.

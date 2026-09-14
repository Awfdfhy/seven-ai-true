# Seven Tool Fabric 2.0 — Wave 09 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: RPG, Real Works, canon simulation, temporal/world-state reasoning, rules, constraints, graph utilities and deterministic simulation support.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 09

Goal: discover the strongest lightweight technical primitives that can make Seven's RPG and Real Works systems more consistent, deterministic, canon-faithful and inspectable without replacing Seven's own authoritative World Controller with a generic game engine or opaque LLM framework.

Research primary docs/repositories/standards first. Treat narrative generation and authoritative world state as separate layers. Prefer small deterministic libraries/standards and SQLite-derived structures over heavyweight graph databases or full game engines unless evidence proves a clear need.

Research at minimum:
- explicit finite/state-machine libraries
- graph data structures/algorithms
- temporal interval/timeline reasoning
- rules/constraint engines
- JSON Patch / JSON Pointer / deterministic diff standards
- immutable/event-sourced state support
- provenance representations
- knowledge graph / RDF-style tools only where useful
- full-text/entity retrieval for canon
- contradiction/constraint checking
- deterministic random-number generation / seeded simulation
- schema validation and typed world diffs
- dependency/influence graph traversal
- pathfinding/topological/SCC algorithms useful for quest/event graphs
- scenario branching / checkpoint / replay primitives
- conflict-free or merge approaches for branches only if they preserve authority
- serialization/versioning/migration of world state
- lightweight text/identifier normalization for canonical names

For every candidate determine:
- exact capability it adds beyond Seven architecture
- deterministic/replay properties
- mobile/runtime weight
- data ownership/authority semantics
- persistence requirements
- ability to preserve provenance/lineage
- failure behavior
- maintenance/license
- whether SQLite/standard JS can do the job more simply
- whether it belongs in runtime, build/preprocessing, host research, or should be rejected

Rules:
- LLM narration never commits canonical world state directly.
- canonical state changes occur through typed `WorldDiff` + validation + authoritative commit.
- generated summaries/embeddings do not become canon authority.
- canon-source conflicts/retcons remain explicit, not silently flattened.
- player insertion into Real Works must preserve source anchors and character knowledge unless divergence is explicitly activated.
- deterministic components must persist seeds/version/config required for replay.
- no heavyweight graph database merely because the domain is graph-shaped.
- generic game engines are rejected unless a specific capability cannot be provided safely/lighter by Seven.
- rule engines cannot silently override authoritative source facts or user-granted divergence.

Output:
1. candidate registry
2. Canon/Simulation Tool Plane architecture
3. canonical utility contracts
4. WorldDiff/event/checkpoint model
5. graph/timeline/rules strategy
6. deterministic replay strategy
7. provenance/canon conflict strategy
8. performance/storage strategy
9. rejected approaches
10. Deep Polish queue

Preserve all material findings, evidence, uncertainty, candidates and rejection reasons in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.

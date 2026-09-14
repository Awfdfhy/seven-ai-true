# Seven Project Memory Structure

This file defines the repository's durable documentation taxonomy.

## 1. `current/` — authoritative operational memory
The default entry point for active Seven work. Contains the current master plan, decisions, status, capability registry, Ultimate Polish campaign, and Maximum Effort protocol.

## 2. `architecture/` — specialist architecture records
Stable subsystem architecture and fabric specifications that remain useful implementation evidence. A specialist document does not override `current/` unless a current document explicitly delegates to it.

## 3. `visual/` — visual intelligence evidence
Visual architecture, Design Genome, logo tournament, motion, accessibility, RTL, Android visual certification, benchmarks and visual evidence.

## 4. `tool-fabric/` — Tool Fabric evidence
Tool Fabric 2.0 wave records, contracts, brokers, schemas, interoperability, security and tool-evaluation evidence.

## 5. `research/` — research and external evidence
Research snapshots, source maps, benchmark notes and evidence that informs decisions but is not itself product authority.

## 6. `history/` — superseded campaigns and lineage
Old polishing generations, challenge rounds, saturation/freeze records, status deltas and superseded protocols. These files are retained for provenance and learning, not as current instructions.

## Authority order
1. Explicit current user direction
2. `current/DECISIONS.md`
3. `current/MASTER_PLAN.md`
4. `current/STATUS.md`
5. `current/CAPABILITY_REGISTRY.md`
6. Current specialist documents explicitly referenced by the above
7. Historical/research evidence

Implementation and runtime evidence can falsify a documentation claim. Documentation cannot make an unimplemented feature real.

## Naming convention
- Current canonical files use short stable names without version suffixes.
- Specialist living specifications use descriptive names and a version only when the version is semantically meaningful.
- Historical records keep their original names whenever renaming would weaken lineage.
- Challenge/freeze/status-delta files belong to history rather than the canonical current layer.

## Maintenance rule
Do not create a new top-level project-memory document when it naturally belongs to one of these categories. New authoritative state must be folded into `current/` during the same development cycle.
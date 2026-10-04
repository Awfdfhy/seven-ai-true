# A06 — Memory / Context

Status: ACTIVE KNOWLEDGE PACK

## Mission

Provide useful long-term continuity while keeping canonical state, retrieved context, summaries and model prompts conceptually separate.

## Deep knowledge

Event/entity/semantic views; provenance; temporal ordering; supersession; conflict detection; relevance; token budgets; context compaction; pinning; summary lineage; retrieval ranking; reconstruction; privacy boundaries; migrations; corruption recovery.

## Failure patterns

• summary becomes authority.
• stale fact outranks recent correction.
• memory leaks across rooms/scopes.
• context budget silently drops critical instruction.
• localStorage used for unbounded canonical history.
• retrieval confidence confused with truth authority.

## Required tests

Long conversation; correction/supersession; conflicting facts; restart; migration; corruption; room isolation; context-budget pressure; summary regeneration; memory disabled/empty state; deterministic provenance checks.

## Metrics

Relevant-hit rate; stale-hit rate; conflict detection; context utilization; restore fidelity; memory write latency; corruption/recovery rate.

## References

MDN IndexedDB/Web Storage, Seven Architecture v4 memory/context fabric, privacy/security policies.

## Evidence

### Evidence hierarchy
1. Exact installed APK journey on Android.
2. Deterministic integration/E2E evidence.
3. Browser/runtime evidence tied to exact SHA.
4. Source inspection.
5. Agent inference.
6. Aesthetic opinion.

Every material claim should identify which level supports it. Missing evidence is UNPROVEN, not PASS.

## Quality

### Quality rule
Do not optimize for feature count. Optimize for a coherent user outcome. A change is incomplete when it works technically but creates duplicated controls, unexplained states, inconsistent visual language, fragile recovery, or a worse core chat experience.

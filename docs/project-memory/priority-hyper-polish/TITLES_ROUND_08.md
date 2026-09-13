# Titles Hyper-Polish Round 08

Verdict: **MATERIAL_IMPROVEMENT_FOUND**

World Linguistic Engine 4.0 needs reverse resolution in addition to output naming.

Accepted addition: `NameMentionResolver`.

Purpose: map an input mention to a `NamingIdentity` using scoped evidence such as exact form, normalized form, alternate spelling, transliteration relation, morphology, time, branch, continuity, entity type and local context.

Possible results:
- RESOLVED
- AMBIGUOUS
- UNKNOWN
- OUT_OF_SCOPE
- HISTORICAL_MATCH
- BRANCH_MISMATCH
- CONTINUITY_MISMATCH

Raw string equality never decides identity by itself.

This supports RPG actions, Retrieval, Real Works and Arabic/English alternate forms without creating duplicate entities.

Common path is deterministic over compact indexes. Optional reranking remains selective.

Saturation counter: **0 / 2**.
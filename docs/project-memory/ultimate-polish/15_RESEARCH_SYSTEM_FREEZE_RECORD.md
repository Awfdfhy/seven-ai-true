# Seven AI — Capability 15 Research System Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**
Implementation status: **Deferred / meaningful Research Runtime foundations remain**

## Frozen target

**Seven Research Fabric 3.0 — Claim-Driven Evidence Acquisition and Synthesis Engine**

## Prime law

> Search results are candidates, sources provide evidence, evidence supports claims, and only claim-locked evidence may authorize grounded synthesis. Source count, repetition, or confident prose never manufactures support.

## Scope of this freeze

This freezes the Research System architecture. It does not claim that every search/fetch/browser/data connector, multimodal extractor, research benchmark or production host integration is already implemented.

## Final reconciled decisions

1. Research begins from a versioned `ResearchContract` defining goal, scope, recency, source policy, output, citations, budgets and stop criteria.
2. QUICK/STANDARD/DEEP modes alter compute/breadth, not evidence or truth rules.
3. Research uses a progressive `ResearchAgenda` of subquestions, candidate claims, ambiguities and gaps.
4. Material externally checkable statements map to stable claim references before grounded synthesis.
5. Research Fabric does not own factual truth; Epistemic Fabric does.
6. Remove canonical A0–A5 scalar source-authority weighting from the final architecture.
7. Source relevance/authority is claim/domain/role specific under Epistemic Fabric policy.
8. Discovery metadata (`SourceCandidate`) is separate from evidence-bearing `SourceVersion`.
9. Search snippets are normally discovery aids, not substitutes for acquired source evidence.
10. Source versions carry exact identity/version/hash/time/provenance metadata.
11. Evidence is collected as locator-bound, source-versioned `EvidenceUnit`s.
12. Evidence relations include support, contradiction, qualification, definition, attribution, context, duplication and dependence.
13. Evidence dependency clusters prevent repeated/syndicated material from manufacturing corroboration.
14. `SearchPlan` is progressive and gap-driven rather than a giant fixed query list.
15. Retrieval uses an adaptive portfolio: exact/domain, lexical/BM25, metadata, semantic/vector, hybrid, citation chasing, structured APIs and browser navigation.
16. Lexical/exact retrieval remains the cheap baseline; semantic/LLM retrieval must demonstrate value for the target query/corpus.
17. Query diversification seeks new evidence dimensions rather than many low-value paraphrases.
18. Freshness is claim-specific and distinguishes publication/update time from retrieval time.
19. Conflicts are investigated for entity/time/scope/source-version differences and remain explicit if unresolved.
20. `NOT_FOUND` is not refutation without a bounded `CoverageContract`.
21. User/project/connected/open-web/structured/local source realms remain explicitly labeled and scope-bound.
22. Multimodal evidence preserves exact source/page/region/modality and extraction lineage.
23. Numerical/structured evidence preserves units, definitions, denominators and calculation transformations.
24. A gap engine tracks unresolved support, freshness, conflicts, coverage and access blockers.
25. Search depth stops on contract completion, low marginal information gain, stable unresolved conflict, budget limits or explicit user steering.
26. Adaptive Compute owns research budgets; Research Fabric supplies gap/utility signals.
27. Parallel subresearch is selective and uses narrow agenda slices, authority leases and structured evidence returns.
28. Grounded synthesis follows a versioned `ClaimEvidenceLock`.
29. Synthesis distinguishes sourced facts, calculations, inference/analysis, recommendations and unresolved uncertainty.
30. Citations originate from locked evidence rather than being retrofitted after prose generation.
31. Citation verification checks that the exact source/locator supports the nearby claim and is fresh enough.
32. Long research exposes progress, gaps/conflicts and steerable agenda state.
33. Steering creates a revision and invalidates only affected research state.
34. `ResearchResultPack` preserves the contract, agenda, sources, evidence/verdict refs, citation lock, report/artifacts, gaps and verification manifest.
35. Web/source content is not dumped wholesale into durable memory; Memory Fabric admission remains separate.
36. Search/source caches bind freshness, version, principal and source scope.
37. Heavy browser/multimodal/semantic work is lazy and off the startup path.
38. Lite tier may reduce breadth/parallelism/optional semantic retrieval but never drops evidence/citation lineage requirements.

## Canonical pipeline

`ResearchContract -> progressive ResearchAgenda -> SearchPlan/Retrieval Portfolio -> SourceCandidate -> SourceVersion -> EvidenceUnit -> Epistemic verdict/gap loop -> ClaimEvidenceLock -> synthesis -> citation verification -> Capability 12 verification -> ResearchResultPack`

## Canonical objects

- `ResearchContract`
- `ResearchAgenda`
- `ResearchQuestionRef`
- `ClaimRef`
- `SearchPlan`
- `QueryAttempt`
- `SourceCandidate`
- `SourceVersionRef`
- `EvidenceUnitRef`
- `EvidenceDependencyClusterRef`
- `CoverageContract`
- `ResearchGap`
- `ClaimEvidenceLock`
- `SynthesisOutline`
- `CitationManifest`
- `ResearchProgressSnapshot`
- `ResearchResultPack`

## Frozen invariants

1. Search results are candidates, not automatic evidence.
2. Research Fabric does not own canonical factual truth.
3. Source authority is not a universal scalar.
4. Evidence is source-versioned, claim-bound and locator-bound.
5. Repetition/dependence does not create fake corroboration.
6. `NOT_FOUND` is not refutation without coverage semantics.
7. Freshness is claim-specific.
8. Conflicts remain explicit until resolved.
9. Retrieval method is adaptive; lexical/exact remains a baseline.
10. Private/connected source scope is preserved.
11. Multimodal and numerical transformations preserve lineage.
12. Research depth is bounded by marginal verified utility and contract needs.
13. Grounded synthesis follows ClaimEvidenceLock.
14. Citations derive from locked evidence.
15. Final output distinguishes facts, analysis/recommendations and uncertainty.
16. Memory admission never increases evidence authority.
17. Unused Research Fabric adds approximately zero startup/background cost.

## Mandatory eval families

- exact/primary-source retrieval;
- hard multi-hop browsing;
- lexical vs semantic retrieval selection;
- source deduplication/dependency;
- freshness/current-state research;
- conflicts;
- locator/citation support;
- negative claims with CoverageContract;
- multimodal evidence;
- structured numerical lineage;
- Arabic/English mixed research;
- steering/revision;
- citation completeness/accuracy;
- research benchmark suites;
- Lite/Balanced/Full latency/context/RAM/network impact.

## Implementation stages

- RS-P0 contract/agenda/claim schemas and ownership reconciliation
- RS-P1 Epistemic SourceVersion/EvidenceUnit binding; remove scalar authority
- RS-P2 source discovery/acquisition/cache
- RS-P3 adaptive retrieval portfolio
- RS-P4 dependency/freshness/conflict/CoverageContract
- RS-P5 gap engine/marginal-utility stopping
- RS-P6 parallel subresearch/steering/cancellation
- RS-P7 ClaimEvidenceLock/synthesis/citations
- RS-P8 multimodal/numerical/structured-data integration
- RS-P9 ResultPack/Context/Memory integration
- RS-P10 Verification/Evals integration
- RS-P11 current-web/multilingual/citation/long-run/mobile gates

## Freeze decision

**FROZEN.**

No protected product source was modified. Architecture freeze is not implementation completion.

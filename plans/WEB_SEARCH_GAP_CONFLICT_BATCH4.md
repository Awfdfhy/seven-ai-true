# Web Search v2 — Batch 4: Gap Analysis, Follow-up & Conflict Signals

Date: 2026-10-02
Status: COMPLETE
Parent: WEB_SEARCH_OVERHAUL_V2.md

## Objective

Make normal Search capable of recognizing when the first retrieval wave is not good enough and perform one targeted follow-up wave instead of blindly answering from weak evidence.

This batch also introduces conservative conflict signals. It does not claim to resolve contradictions automatically.

## Evidence sufficiency

Assess:
- evidence count
- independent host count
- read evidence count
- source-type strength
- freshness for time-sensitive questions
- query coverage

Gap codes:
- too_few_sources
- low_host_diversity
- no_read_evidence
- stale_current_query
- no_strong_source
- weak_query_coverage

A gap is diagnostic, not proof that the answer is wrong.

## Follow-up planner

Normal Search gets at most one follow-up wave.

Possible targeted queries:
- current query missing freshness -> "<question> <year> latest official"
- technical query missing strong source -> "<question> official documentation"
- low diversity -> alternate wording / entity-focused query
- weak coverage -> query built from the most important unmatched terms

Rules:
- max 2 follow-up queries
- dedupe against first-wave query text
- follow-up uses the same Search v2 adapter/gateway system
- stop/cancellation remains authoritative
- no recursive unlimited search
- total normal Search query budget remains bounded

## Conflict signals

Conservative only:
- conflicting numeric/unit claims across independent hosts
- conflicting version/date claims when the question is version-sensitive
- explicit opposite yes/no language only when the surrounding normalized claim key matches closely

Signals:
- possible_numeric_disagreement
- possible_version_disagreement
- possible_polarity_disagreement

These are "inspect this" signals, not final contradiction verdicts.

The final model is told:
- do not silently pick one side
- mention disagreement when relevant
- distinguish different versions/populations/definitions
- say inconclusive when evidence cannot resolve it

## Search wave refactor

Introduce:
- runSearchWaveV2(queries, intent)
- assessSearchEvidenceSufficiencyV2(evidence, intent)
- planSearchFollowUpV2(question, intent, evidence, assessment)
- detectSearchConflictSignalsV2(evidence, intent)

Flow:
1. first wave
2. rank/read/evidence
3. assess gaps/conflicts
4. if insufficient, one follow-up wave
5. merge + dedupe + rerank + selective reads
6. rebuild evidence
7. final assessment
8. synthesize answer

## Performance budget

- first wave unchanged
- follow-up wave only when insufficient
- max 2 follow-up queries
- page-read total cap for normal Search increases from 3 to at most 5 across both waves
- cached/previously read URLs are not re-read within the same request
- no extra LLM planning pass required for this batch

## Diagnostics

Add:
- initialEvidenceCount
- finalEvidenceCount
- initialGapCodes
- finalGapCodes
- followUpQueries
- followUpCount
- conflictSignals
- sufficiencyScore
- sufficient

No page bodies or credentials.

## Tests

1. two strong diverse read sources can be sufficient
2. one snippet-only source produces gaps
3. time-sensitive query with stale sources gets stale_current_query
4. technical query without docs/primary gets no_strong_source
5. follow-up plan is bounded to 2 queries
6. follow-up queries dedupe against initial plan
7. insufficient first wave triggers exactly one follow-up wave
8. sufficient first wave triggers no follow-up
9. merged wave dedupes canonical URLs
10. repeated URL is not re-read twice
11. numeric disagreement across independent hosts is flagged conservatively
12. same numeric claim is not flagged
13. conflict signals do not alter source authority
14. context reports unresolved conflict signals as caution, not instructions
15. diagnostics contain no page body/secrets
16. existing Search v2 Batch 1–3 tests remain green
17. Android release gate passes after merge

## Acceptance criteria

Batch 4 is complete when:
- weak first-wave evidence can trigger one targeted follow-up;
- normal Search remains bounded;
- sufficient searches do not pay unnecessary latency;
- possible disagreements are surfaced without fabricated resolution;
- all browser and Android gates pass.

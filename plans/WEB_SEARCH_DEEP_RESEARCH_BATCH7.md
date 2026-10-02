# Web Search v2 — Batch 7: Deep Research Integration

Date: 2026-10-02
Status: IN IMPLEMENTATION
Parent: WEB_SEARCH_OVERHAUL_V2.md
Depends on: Batches 1–6 COMPLETE

## Objective

Turn Seven's Research path into an auditable, resumable evidence workflow built on the Search v2 substrate.

Target pipeline:

Question → Research Plan → Subquestions → Search Waves → Page Reads → Evidence Ledger → Gap/Conflict Review → Follow-up → Evidence Synthesis → Cited Report

Batch 7 must not create a second incompatible search stack. It reuses:
- Search v2 query intelligence;
- general-web Gateway + Reader;
- evidence units + stable source IDs;
- freshness;
- gap analysis;
- conflict signals;
- caches;
- truthful stage UI.

## 1. Explicit Research mode

Add a dedicated Research toggle in the composer.

Research mode is independent UI state:
- it does not silently mutate the Search or Think toggles;
- internally it implies web retrieval + Deep Think for that request;
- the controller records research as an explicit user decision;
- turning Research off does not alter Search/Think preferences.

Controller contract:
- research.use
- research.source
- web.use=true when Research is enabled
- deepThink.use=true when Research is enabled
- verificationDepth=enhanced

## 2. Deep Research budgets

Default bounded budget:
- max initial subquestions: 5
- max total research questions including follow-up: 10
- max aggregate unique evidence: 30
- max page reads: 12
- max elapsed wall time: 60 s
- max context evidence: 16 sources
- max persisted evidence excerpt: 1,200 chars/source

Budgets are ceilings, not targets. Research stops early when evidence sufficiency is reached.

No unlimited loops.

## 3. Deterministic research planner

Add `planDeepResearchV2(question)`.

It starts from Search v2 intent/query intelligence and creates complementary subquestions rather than paraphrases.

Subquestion object:
- id
- text
- purpose
- priority
- coverageKey
- sourceNeed
- status

Examples:
- comparison → subject A, subject B, independent comparison, current caveats
- technical → official docs, compatibility/limitations, independent verification
- current → primary/current, independent current, historical context when needed
- academic → primary research, review/institutional corroboration
- general exploratory → definition/background, primary evidence, limitations/counterevidence

No hidden chain-of-thought is stored.

## 4. Research execution state

Add a versioned research run object:

- id
- version
- roomId
- questionFingerprint
- question
- createdAt / updatedAt
- status:
  - planned
  - running
  - paused
  - completed
  - inconclusive
  - failed
  - cancelled
- budget
- subquestions
- completedSubquestionIds
- evidence
- sourceIndex
- conflicts
- gaps
- stage
- diagnostics

Never persist:
- API keys
- auth headers
- provider raw requests
- hidden reasoning
- arbitrary full page bodies

## 5. Checkpoint + resume

Local checkpoint key: `sevenDeepResearchV2`.

Checkpoint after:
- plan creation
- every completed subquestion search
- follow-up wave
- final evidence review
- terminal state

Retention:
- max 12 runs
- prefer current room/recent runs
- bounded evidence excerpts
- terminal runs can be pruned oldest-first

Resume:
- exact run ID
- same room
- same question fingerprint
- only paused/failed/running-interrupted states
- completed subquestions are not rerun unless explicitly invalidated
- cached Search v2 evidence may be reused but freshness policy remains authoritative

## 6. Search orchestration

Each research subquestion invokes Search v2 with research-specific runtime options.

Aggregate by canonical URL and evidence fingerprint.

Preserve:
- original query/subquestion provenance
- readState
- publishedAt
- freshness
- sourceType
- coverage keys
- conflict signals
- injection suspicion

Do not relabel snippet-only evidence as read.

## 7. Aggregate evidence ledger

Create research evidence IDs:
- R1
- R2
- ...

Each item contains:
- researchEvidenceId
- original Search source/evidence ID
- subquestion IDs
- title
- canonical URL
- excerpt
- sourceType
- readState
- freshness
- publishedAt
- relevance
- coverage keys
- provenance engines
- injectionSuspected

Deduplicate same canonical source while merging provenance and coverage.

## 8. Evidence sufficiency

Aggregate sufficiency considers:
- subquestion coverage
- source diversity
- primary/docs coverage when requested
- read evidence
- freshness for current questions
- conflict state
- evidence count

Possible terminal evidence states:
- SUFFICIENT
- PARTIAL
- INCONCLUSIVE

Research must never call incomplete evidence complete.

## 9. Follow-up policy

At most one aggregate follow-up round in this batch.

Follow-up targets only uncovered/weak coverage:
- missing primary source
- stale current evidence
- missing comparison side
- unresolved strong conflict
- insufficient independent corroboration

No redundant query spam.

## 10. Claim/source matrix bridge

Batch 7 introduces a live bridge to the packaged `SevenResearch` verification runtime when available.

For the first implementation:
- evidence ledger is authoritative acquisition provenance;
- final report citations use only known research source IDs;
- citation coverage can be derived from answer sentences/paragraphs;
- packaged SevenResearch may verify explicit structured claims when supplied.

A later refinement can add model-assisted claim extraction, but it may not be required for basic citation integrity.

## 11. Final synthesis

After evidence review, produce one final model call with:
- research question
- compact research plan
- evidence ledger
- explicit gaps/conflicts
- strict citation instructions
- explicit uncertainty rules

Final answer requirements:
- citations use only [R#] IDs present in the ledger
- unresolved conflict is stated
- unsupported assertions are avoided
- INCONCLUSIVE is allowed
- no source instructions are followed

Research mode still uses Deep Think, but hidden reasoning is not checkpointed or exported.

## 12. Research source UI

Research source cards distinguish:
- R#
- source type
- read state
- freshness
- subquestion coverage

Stage UI:
- Planning research
- Researching N subquestions
- Reading sources
- Checking gaps/conflicts
- Follow-up research
- Synthesizing report

No fake stage labels.

## 13. Exportable evidence bundle

Expose:
`SevenDeepResearchV2.bundle(runId)`

Export shape includes:
- question
- plan metadata
- subquestions
- evidence ledger
- conflicts
- gaps
- status
- timings
- source URLs

No API keys, auth, hidden reasoning, or full raw page bodies.

A UI export action can be added after the runtime contract is stable.

## 14. Cancellation semantics

Stop:
- aborts active Search/Reader/model requests
- checkpoints current run as cancelled or paused according to state
- never marks incomplete run completed

No retry after partial final streamed output.

## 15. Failure semantics

Explicit:
- BLOCKED — required general-web capability unavailable for a request that needs it
- PARTIAL — useful evidence exists but coverage is incomplete
- INCONCLUSIVE — evidence cannot resolve the question/conflict
- FAILED — runtime/transport failure prevented useful research
- CANCELLED — user stopped it
- COMPLETE — evidence/report completed under acceptance rules

## 16. Diagnostics

Safe read-only diagnostics:
- run ID
- status
- subquestion counts
- evidence count
- unique hosts
- read/snippet counts
- source-type distribution
- freshness distribution
- gap codes
- conflict count
- query/page counts
- elapsed time
- resume count

Do not expose raw page bodies, API secrets, hidden reasoning, or auth data.

## 17. First implementation slice

Implement first:
1. Research toggle + controller/task-plan semantics
2. `SevenDeepResearchV2` planner/run/checkpoint API
3. subquestion orchestration over `performWebSearchV2`
4. aggregate evidence ledger + dedupe
5. aggregate gap/conflict diagnostics
6. resume-safe checkpoints
7. buildContext integration returning Search-compatible `contextText/sources`
8. final synthesis still uses existing generateReply pipeline
9. browser regression coverage

Then:
10. packaged SevenResearch claim-matrix bridge
11. export UI
12. richer report rendering
13. Android gate

## 18. Tests

- Research toggle does not rewrite Search/Think preferences
- controller Research implies web + Deep Think + enhanced verification
- task plan includes research step instead of duplicate web step
- planner is deterministic and <=5 initial subquestions
- aggregate run <=10 total questions
- unique evidence <=30
- page/query/time budgets are bounded
- canonical URL dedupe preserves multi-subquestion provenance
- snippet-only/read states remain truthful
- checkpoint never stores secrets or hidden reasoning
- interrupted run resumes without rerunning completed subquestions
- room/question mismatch cannot resume a run
- cancellation never marks complete
- current research with stale evidence can end INCONCLUSIVE/PARTIAL
- known citations only
- source cards preserve R# IDs
- Search v2 Batches 1–6 regressions stay green
- 320px + RTL remain usable
- Android API 36 WebView gate passes

## Acceptance criteria

Batch 7 is complete when:
- user can explicitly invoke Research mode;
- Search v2 is reused, not duplicated;
- research is checkpointed/resumable;
- evidence provenance survives aggregation;
- final synthesis receives bounded auditable evidence with R# IDs;
- incomplete evidence is represented truthfully;
- browser and Android gates pass.

# Seven AI — Capability 15 Research System Ultimate Polish

Status: **FREEZE CANDIDATE AFTER DOUBLE-POLISH RECONCILIATION**
Implementation status: **Deferred / meaningful Research Runtime foundations exist**
Final target: **Seven Research Fabric 3.0 — Claim-Driven Evidence Acquisition and Synthesis Engine**

## Executive decision

Deep research is not "search many pages and summarize them." It is a controlled process for decomposing a question into answerable claims, acquiring source-versioned evidence, detecting gaps/conflicts/freshness problems, and synthesizing only what the evidence actually supports.

> **Prime law:** Search results are candidates, sources provide evidence, evidence supports claims, and only claim-locked evidence may authorize grounded synthesis. Source count, repetition, or confident prose never manufactures support.

Seven Research Fabric therefore becomes an adaptive **gap-closing evidence process** integrated tightly with Epistemic Fabric, Context Fabric, Tool Fabric, Adaptive Compute and Verification Fabric.

---

# 1. Ground truth

Current `release/research-runtime.js` already provides useful primitives:
- normalized claims;
- normalized sources;
- claim/evidence matrix;
- time-sensitive freshness checks;
- support/contradict/context stances;
- statuses such as GAP/STALE/UNCITABLE/CONFLICT;
- citation locks;
- next-action generation for gaps/freshness/conflicts/citations.

These are strong foundations.

The main architectural mismatches now exposed by frozen capabilities 02–14 are:
- current A0–A5 numeric authority weights conflict with Epistemic Fabric's claim/domain/role-specific authority model;
- `bestAuthority` can accidentally imply that one scalar source rank determines support quality;
- evidence independence/dependency clusters are not first-class;
- source versions/content hashes are not first-class enough;
- snippet/result discovery and source evidence need a stronger separation;
- negative findings need explicit coverage contracts rather than "not found" inference;
- query planning, retrieval strategy selection, marginal-utility stopping and result artifactization are not yet canonical contracts.

#15 preserves the good claim-matrix direction and replaces the weak scalar/retrieval assumptions.

---

# 2. 2025–2026 research synthesis

## OpenAI Deep Research / BrowseComp
Persistent multi-step browsing, strategic query reformulation and evidence synthesis matter for hard-to-find information. BrowseComp also shows that more test-time compute can improve hard browsing performance, but the benchmark measures a narrow short-answer search skill rather than the entire open-ended research problem.

Seven implication: persistent search is selectively useful, but compute depth must be adaptive and evidence-driven.

## Google Deep Research, 2026
Current systems iteratively plan, query, read results, identify gaps and search again, with web plus proprietary/connected sources and citation-rich reporting.

Seven implication: Research is a loop over unresolved information needs, not one search call followed by summarization.

## SAGE, 2026
Reasoning-intensive scientific retrieval remains difficult; in one benchmark setup BM25 substantially outperformed tested LLM retrievers because agent subqueries were keyword-oriented.

Seven implication: retrieval method must match query/corpus behavior. Lexical retrieval remains a strong baseline and semantic/LLM retrieval is selective.

## DeepResearch Bench / RetroSearch
Research evaluation must separately examine retrieval/collection quality, citation accuracy, report synthesis and changing-web reproducibility.

Seven implication: measure the research pipeline by stages rather than one report score.

## Multimodal deep-research benchmarks
Strong prose does not guarantee faithful use of visual/multimodal evidence.

Seven implication: multimodal evidence carries explicit locators/source lineage and is verified like text evidence.

## NIST agentic evaluation probes
Claim-level grounding and machine-readable audit trails are central to trustworthy research agents.

Seven implication: claim/evidence lineage is the canonical research product; prose is a derived presentation.

---

# 3. Ownership boundary

Research Fabric owns:
- research-task framing;
- research plan/agenda;
- question/claim decomposition proposals;
- query generation;
- retrieval strategy selection;
- source discovery/acquisition;
- gap/conflict/freshness search loops;
- evidence collection workflow;
- coverage tracking;
- source diversity/dependency analysis proposals;
- synthesis planning;
- research report/evidence bundle assembly;
- progress and steering state.

It does not own:
- canonical factual truth/verdicts — Epistemic Fabric;
- generic web/search tool implementations — Tool Fabric/Search Brokers;
- context inclusion policy — Context Fabric;
- compute budgets — Adaptive Compute;
- permissions/connectors — Authority Kernel;
- independent final verification — Verification Fabric;
- evaluation-program governance — Seven Evals.

---

# 4. Pass A — MAXIMIZE

## 4.1 ResearchContract

Every non-trivial research run begins from a versioned `ResearchContract`:
- user question/goal;
- requested output type/structure;
- scope/in-scope and out-of-scope boundaries;
- recency/time horizon;
- source restrictions/preferences;
- internal/connected/web source permissions;
- locale/language requirements;
- citation expectations;
- comprehensiveness target;
- uncertainty policy;
- evidence quality requirements;
- compute/tool/network budgets;
- stop criteria;
- steering revisions.

Changing the user's research objective creates a new contract revision with lineage rather than silently replacing the original.

## 4.2 Research mode is a compute policy, not truth policy

Presentation modes may include:
- QUICK
- STANDARD
- DEEP
- EXHAUSTIVE_WHEN_JUSTIFIED

Modes change budgets, breadth, search persistence and optional verifier depth. They do **not** change the rules for source lineage, uncertainty or citation truth.

## 4.3 ResearchAgenda

The agenda is a derived working object:
- primary question;
- subquestions;
- candidate claims/hypotheses;
- definitions/ambiguities;
- comparison dimensions;
- required datasets/facts;
- current evidence gaps;
- dependency/order relationships.

It is progressive. Seven can add/revise subquestions as evidence changes the investigation, while preserving lineage to the ResearchContract.

## 4.4 Claim decomposition

Before final synthesis, important externally checkable statements should map to stable `ClaimRef`s.

Claims may be:
- atomic factual;
- comparative;
- temporal/current-state;
- causal/explanatory;
- numerical/quantitative;
- attribution;
- negative/absence;
- interpretive/analytical.

Complex claims can decompose into subclaims. Derived analysis is distinguished from sourced factual premises.

## 4.5 Claim authority belongs to Epistemic Fabric

Remove canonical A0–A5 numeric authority weights from Research Fabric.

A source may have domain/role attributes and provenance, but whether it is authoritative for a claim is decided by Epistemic Fabric policy.

Examples:
- official product docs may be authoritative for product behavior;
- a regulator/standard body may be authoritative for its own rule;
- a peer-reviewed paper may be strong evidence for its study result;
- a community report may be useful for experience/sentiment but not official policy.

No one source-level scalar rank fits all claims.

## 4.6 SourceCandidate vs SourceVersion

Separate discovery metadata from evidence-bearing source content.

### SourceCandidate
- discovered URL/connector/file ref;
- title/snippet/metadata;
- discovery query/tool;
- rank;
- acquisition status.

### SourceVersion
Canonical evidence source object from Epistemic Fabric:
- stable source identity;
- exact URL/document/file/connector ref;
- retrieved version/content hash;
- publisher/author/organization metadata where known;
- publication/update/retrieval times;
- content type/language;
- access/provenance;
- source-role/domain attributes;
- lineage.

A search snippet is normally discovery evidence, not a substitute for reading the source.

## 4.7 Acquisition

Acquisition chooses the cheapest suitable path:
- search result open/fetch;
- connector read;
- file read;
- page extraction;
- PDF/document parser;
- structured API/data source;
- browser interaction only when simpler fetch paths cannot access the needed content.

Browser automation is not the default for ordinary readable pages.

## 4.8 EvidenceUnit

Research collects exact source-bound `EvidenceUnit`s:
- claim ref(s);
- source-version ref;
- locator/page/section/line/structured field;
- excerpt or normalized fact representation;
- transformation/extraction method;
- stance/relationship to claim;
- observed/retrieved time;
- freshness relationship;
- modality;
- content hash/lineage.

Research never stores a free-floating citation detached from the claim it supports.

## 4.9 Evidence relationship

Canonical relationships are richer than SUPPORT/CONTRADICT:
- SUPPORTS
- CONTRADICTS
- QUALIFIES
- DEFINES
- ATTRIBUTES
- CONTEXTUALIZES
- DUPLICATES
- DEPENDS_ON
- IRRELEVANT_TO

Epistemic Fabric owns final claim verdicts.

## 4.10 Evidence dependency clusters

Two pages repeating the same upstream press release are not two independent corroborations.

Group evidence by likely dependence using:
- explicit citations/links;
- publisher syndication;
- near-duplicate text/hash;
- common dataset/study;
- shared upstream document;
- provenance metadata.

Uncertain dependence remains explicit.

## 4.11 SearchPlan

A `SearchPlan` is a bounded set of query intents, not a giant immutable query list.

Each query records:
- information need/claim gap;
- retrieval channel;
- query string/filters;
- expected source class;
- freshness/domain constraints;
- prior query relation;
- budget/cost.

Search plans adapt after each meaningful evidence batch.

## 4.12 Retrieval portfolio

Use a portfolio selected by corpus/query:
- exact/domain/site search;
- lexical keyword/BM25;
- metadata/field filters;
- semantic/vector search;
- hybrid lexical-semantic;
- citation/reference chasing;
- entity/graph traversal;
- structured database/API query;
- browser navigation.

Lexical retrieval is the cheap baseline. Semantic/LLM retrievers must demonstrate value for the target source/corpus rather than being enabled by prestige.

## 4.13 Query diversification

For difficult gaps, diversify along evidence dimensions:
- terminology/synonyms;
- official vs independent sources;
- opposing/conflicting positions;
- date ranges;
- named entities/identifiers;
- references/citations;
- local-language variants;
- source-specific query syntax.

Do not generate dozens of paraphrases with no information gain.

## 4.14 Freshness

Freshness is claim-specific.

A current price, law, model availability or office-holder may require near-current evidence. Historical facts may not.

Research stores:
- required freshness policy;
- source publication/update time;
- retrieval time;
- freshness verdict from Epistemic Fabric.

A recently retrieved old source is not necessarily fresh evidence for a time-sensitive claim.

## 4.15 Conflict handling

Conflicts trigger explicit investigation:
1. verify same claim/entity/timeframe/definition;
2. inspect source versions and dates;
3. distinguish factual contradiction from differing scope/measurement;
4. seek primary/authoritative evidence where appropriate;
5. preserve unresolved conflict rather than averaging it away.

Final synthesis may present the disagreement explicitly.

## 4.16 Negative/absence claims

`NOT_FOUND` is not refutation.

Negative conclusions require a `CoverageContract` describing what was searched:
- source universe/channel;
- time window;
- query/identifier coverage;
- access limitations;
- stopping rule.

Only then may Epistemic Fabric determine whether absence is meaningful evidence.

## 4.17 Internal, connected and web sources

Keep source realms explicit:
- USER_FILE
- PROJECT_FILE
- CONNECTED_PRIVATE_SOURCE
- OPEN_WEB
- STRUCTURED_DATASET/API
- LOCAL_KNOWLEDGE

Private/connected content never becomes web-visible or cross-project by default.

The report may combine realms only under the user's authorization and with origin labels preserved.

## 4.18 Multimodal research

Images, charts, tables and PDFs can carry evidence.

Each visual/multimodal EvidenceUnit binds:
- exact source/page/frame/region/field;
- extraction/interpretation method;
- text/visual relationship;
- uncertainty.

OCR or model interpretation does not silently become the source's literal statement.

## 4.19 Structured/numerical data

For numerical comparisons:
- prefer structured data/API/table extraction when available;
- preserve units/definitions/denominators;
- record calculation transformations;
- distinguish reported values from Seven-derived calculations;
- use deterministic compute tools for arithmetic/statistics where appropriate.

## 4.20 Gap engine

Each claim/subquestion has a research state:
- `UNSEARCHED`
- `SEARCHING`
- `SUPPORTED_PENDING_VERDICT`
- `GAP`
- `STALE`
- `CONFLICT`
- `LOW_COVERAGE`
- `BLOCKED_ACCESS`
- `RESOLVED_FOR_SYNTHESIS`
- `DEFERRED_LOW_VALUE`

Gap actions may include:
- find primary source;
- refresh source;
- independent corroboration;
- conflict resolution;
- exact locator recovery;
- definition/entity disambiguation;
- negative-coverage expansion.

## 4.21 Marginal-utility stopping

Research does not search forever.

Stop/escalate based on:
- blocking claims resolved;
- marginal new evidence per query/tool cost;
- repeated duplicate sources;
- stable unresolved conflict;
- budget/deadline;
- user comprehensiveness target;
- residual uncertainty importance.

Adaptive Compute owns the budget decision; Research Fabric supplies gap/utility signals.

## 4.22 Parallel research

Parallelize independent subquestions only when useful.

Sub-research workers receive:
- narrow agenda slice;
- source-policy constraints;
- authority sublease;
- compute/tool budget;
- return schema of SourceVersions/EvidenceUnits/gaps.

They do not directly author the canonical final report.

## 4.23 ClaimEvidenceLock

Before grounded factual synthesis, bind each material claim to selected evidence/version refs.

The lock includes:
- claim version;
- source/evidence refs;
- unresolved conflicts;
- freshness state;
- coverage caveats;
- epistemic verdict ref.

The report writer cannot silently swap unsupported factual content after the lock without triggering re-verification.

## 4.24 Synthesis pipeline

`ResearchContract -> Agenda -> Source/Evidence acquisition -> Epistemic verdicts -> ClaimEvidenceLock -> outline -> synthesis -> citation verification -> final verification`.

Separate:
- sourced facts;
- calculations;
- synthesis/inference;
- recommendations/opinions;
- unresolved uncertainty.

This prevents elegant prose from blurring evidence categories.

## 4.25 Citation generation

Citations are generated from locked EvidenceUnits, not retrofitted by searching for something vaguely similar after prose exists.

Every material factual statement should either:
- map to adequate evidence;
- be clearly attributed/qualified;
- be marked uncertain;
- or be removed.

Citation count is not quality by itself.

## 4.26 Citation verification

Before finalization check:
- citation target exists;
- source version/ref accessible or preserved;
- cited locator supports the nearby claim;
- freshness is adequate;
- no citation is attached only to an adjacent unrelated fact;
- multiple claims in one sentence are separately supported when necessary.

Capability 12 performs the independent final verification policy.

## 4.27 User steering / interrupt

Long research must expose:
- plan/agenda;
- progress by subquestion;
- important sources found;
- gaps/conflicts;
- current budget/depth;
- ability to refine scope/source preferences.

Steering creates a new ResearchContract/Agenda revision and invalidates only affected work.

## 4.28 ResearchResultPack

Canonical output pack:
- contract version;
- agenda snapshot;
- source manifest;
- claim/evidence/verdict matrix refs;
- citation lock;
- report artifact;
- calculations/data artifacts;
- unresolved gaps/conflicts;
- research limitations;
- verification manifest;
- resource/coverage metrics.

The rendered report is one view over this pack.

## 4.29 Research memory

Do not dump every web page into durable memory.

Durable candidates may include:
- user-requested reusable findings;
- verified project research decisions;
- stable source identifiers;
- recurring useful procedures.

Admission goes through Memory Fabric and never increases evidence authority.

## 4.30 Research cache

Cache safely:
- search results under query/provider/time scope;
- SourceVersions by canonical identity/content hash;
- parsed artifacts;
- derived lexical/semantic indexes;
- verified EvidenceUnits.

Cache keys include freshness/auth/source-version dimensions. Private connector caches remain principal/scope bound.

---

# 5. Velocity assault

- quick deterministic answer path skips Deep Research when unnecessary;
- search only unresolved high-value gaps;
- exact/lexical retrieval before heavier semantic paths when suitable;
- parallelize independent gaps within budget;
- deduplicate sources early;
- parse/download each SourceVersion once where possible;
- keep full source text outside model context and expose evidence capsules;
- artifactize PDFs/pages/data tables;
- incremental ClaimEvidenceLock;
- stop on low marginal information gain;
- no continuous background research/indexing;
- heavy multimodal/browser work lazy-loads;
- unused Research Fabric adds approximately zero startup cost.

Lite tier may reduce breadth/parallelism/optional semantic reranking, never citation/evidence lineage requirements.

---

# 6. Pass B — DESTROY THE WINNER

Rejected alternatives:

## Search many sources then summarize
Rejected. Source volume is not claim coverage.

## One scalar source authority score
Rejected. Authority is claim/domain/role specific.

## Search snippet equals evidence
Rejected as the default. Acquire the actual source/version when possible.

## More agreeing pages means stronger truth
Rejected without evidence-dependency analysis.

## Citations added after drafting
Rejected for grounded factual claims. Use ClaimEvidenceLock first.

## Semantic/vector retrieval everywhere
Rejected. Lexical/exact retrieval remains highly competitive and cheaper for many query types.

## Always exhaustive deep research
Rejected. Adaptive depth and stopping are required.

## Majority vote resolves source conflicts
Rejected. Investigate scope/time/authority/dependence.

## Not found = false
Rejected without CoverageContract.

## Whole sources stuffed into prompt
Rejected. Use compact evidence/context capsules.

## Store browsing chain-of-thought
Rejected. Preserve agenda/actions/evidence/results, not hidden reasoning traces.

---

# 7. Reconciliation result

Final architecture:

`ResearchContract -> progressive ResearchAgenda -> SearchPlan/Retrieval Portfolio -> SourceCandidate -> SourceVersion -> EvidenceUnit -> Epistemic verdict/gap loop -> ClaimEvidenceLock -> synthesis -> citation verification -> Capability 12 verification -> ResearchResultPack`.

The existing claim/evidence/freshness/citation runtime is preserved as a foundation but must remove scalar authority and align canonical evidence/verdict ownership with Epistemic Fabric.

---

# 8. Canonical objects

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

---

# 9. Frozen invariants

1. Search results are discovery candidates, not automatic evidence.
2. Research Fabric does not own canonical factual truth.
3. Source authority is not one scalar source score.
4. Evidence is source-versioned, claim-bound and locator-bound.
5. Repetition/dependence does not create fake corroboration.
6. `NOT_FOUND` is not refutation without coverage semantics.
7. Freshness is claim-specific.
8. Conflicts are investigated/preserved rather than averaged away.
9. Retrieval method is adaptive; lexical/exact remains a baseline.
10. Private/connected source scope is preserved.
11. Multimodal extraction preserves modality/source lineage.
12. Numerical transformations are explicit and deterministic where possible.
13. Research depth is adaptive and marginal-utility bounded.
14. Grounded synthesis follows ClaimEvidenceLock.
15. Citations originate from locked evidence rather than retrofitting.
16. The final report preserves facts vs inference/recommendation/uncertainty distinctions.
17. Durable Memory admission does not increase research evidence authority.
18. Unused Research Fabric adds approximately zero startup/background cost.

---

# 10. Evaluation contract

## Retrieval
- exact known-source lookup;
- difficult multi-hop browse task;
- keyword-heavy literature retrieval;
- semantic retrieval win/loss cases;
- source deduplication/dependency;
- primary-source recovery;
- local-language/Arabic queries.

## Evidence
- exact locator support;
- stale source;
- source-version update;
- unsupported snippet;
- conflicting sources;
- copied/syndicated evidence;
- multimodal page/chart evidence;
- numerical table/calculation lineage;
- negative claim with/without adequate CoverageContract.

## Synthesis
- every material claim maps to evidence/verdict;
- factual vs analysis distinction;
- citation accuracy/completeness;
- no citation drift after synthesis revision;
- unresolved gaps shown honestly;
- user steering invalidates only affected research state.

## Benchmarks
- BrowseComp-style hard information finding;
- DeepResearch Bench report/citation tasks;
- RetroSearch/frozen-web reproducibility tasks;
- SAGE-style scientific retrieval;
- multimodal research tasks;
- Seven-specific current-tech/product research;
- Arabic/English mixed technical research.

## Performance/mobile
- simple research fast path;
- 10/100/1000 SourceCandidate workflows;
- source dedupe/parser cache;
- context tokens per evidence-backed claim;
- time-to-first-useful-source;
- marginal utility stopping;
- cancellation/steering latency;
- Lite/Balanced/Full resource use;
- no research use -> near-zero startup cost.

---

# 11. Implementation stages

- **RS-P0** ResearchContract/Agenda/ClaimRef schemas and ownership reconciliation.
- **RS-P1** remove scalar authority; bind SourceVersion/EvidenceUnit to Epistemic Fabric.
- **RS-P2** SourceCandidate/acquisition/cache contracts.
- **RS-P3** SearchPlan + adaptive retrieval portfolio.
- **RS-P4** dependency clusters/freshness/conflict/CoverageContract.
- **RS-P5** gap engine + marginal-utility stopping.
- **RS-P6** parallel subresearch/steering/cancellation.
- **RS-P7** ClaimEvidenceLock + synthesis/citation manifest.
- **RS-P8** multimodal/numerical/structured-data integration.
- **RS-P9** ResearchResultPack + Context/Memory integration.
- **RS-P10** Capability 12 verification + Seven Evals research benchmarks.
- **RS-P11** long-run, current-web, multilingual, citation and mobile-performance gates.

---

# 12. Proof of improvement

Compared with the current Research Runtime, Research Fabric 3.0:
- preserves the useful claim/gap/freshness/citation-loop design;
- removes the scalar authority conflict with Epistemic Fabric;
- separates discovery snippets from evidence-bearing source versions;
- adds evidence dependency and negative-coverage semantics;
- chooses retrieval methods adaptively instead of semantic-first assumptions;
- makes research depth marginal-utility driven;
- binds synthesis to evidence before prose generation;
- supports private/web/multimodal/numerical sources without losing origin;
- provides a complete ResearchResultPack for independent verification and reuse;
- keeps source payloads and heavy research off the mobile hot path.

---

# 13. Research references

- OpenAI, **Introducing deep research**, updated 2026.
- OpenAI, **BrowseComp: a benchmark for browsing agents**, 2025.
- Google, **Deep Research / Deep Research Max**, 2026.
- Google, Deep Research agent developer release / iterative research workflow, 2025–2026.
- Hu et al., **SAGE: Benchmarking and Improving Retrieval for Deep Research Agents**, 2026.
- **DeepResearch Bench: A Comprehensive Benchmark for Deep Research Agents**, 2025.
- FutureSearch, **Deep Research Bench: Evaluating AI Web Research Agents**, 2025.
- **MMDeepResearch-Bench**, 2026.
- NIST, **Building Evaluation Probes into Agentic AI**, 2026.

---

# 14. Freeze recommendation

**FREEZE CANDIDATE ACCEPTED.**

Final target: **Seven Research Fabric 3.0 — Claim-Driven Evidence Acquisition and Synthesis Engine**.

Implementation remains deferred until campaign reconciliation. No protected product source is modified by this architecture document.

# Priority 16–21 Hyper-Polish — Round 01 Research Sweep

Status: ACTIVE / PARTIAL FRONTIER SWEEP
Date: 2026-09-14

This document captures research signals that can challenge the current Seven designs. A paper is not an architecture mandate. Every idea must survive Seven's truth, authority, mobile, latency and implementation gates.

---

## 1. Cross-cutting findings

### 1.1 Long-context grounded evaluation is still a weak point
ACL 2026 work on hallucination detection benchmarks highlights that long-context RAG grounding and realistic label noise remain underrepresented in evaluation. Seven should therefore include long-context, conflicting/noisy evidence scenarios rather than relying on clean short-context citation tests.

Implication:
- Retrieval and Knowledge gauntlets need long-context evidence localization.
- Canon source packs need noisy/incomplete/conflicting annotations.
- evaluator uncertainty must remain explicit.

### 1.2 Evidence seeking matters more than fluent verification prose
ACL 2026 RLSeek reports that hallucination-detector errors correlate strongly with reasoning that is not explicitly grounded in source evidence.

Implication:
- verification paths for Retrieval/Canon should require evidence pointers/segments where the property is source-grounded.
- a model explaining that something is correct is not equivalent to evidence.

### 1.3 Long-horizon narrative coherence remains unsolved
NCP-Bench 2026 formalizes Narrative Commitment Preservation with initial facts, commitments and reference trajectories. It reports a major gap between fluent interaction and long-horizon consistency.

Implication:
- Seven must keep deterministic/structured commitments outside narrator prose.
- evaluation must include 20/50/100+ turn survival and adversarial user interventions.
- future-sight isolation and character knowledge boundaries deserve first-class tests.

### 1.4 Open-schema world evolution is useful, but must be governed
EvolvingWorld 2026 argues that fixed schemas can be too rigid across diverse literary worlds and uses open-schema evolving character/world state.

Seven adaptation:
- do not replace the typed core with unrestricted LLM-defined state.
- test a hybrid model:
  - typed authoritative core for identity, location, ownership, chronology, knowledge, causal/commitment-critical facts,
  - validated open extensions for world-specific dimensions,
  - promotion rules before an extension can affect protected constraints.

### 1.5 GUI/vision evaluation must be hierarchical
MMBench-GUI 2026 evaluates Content Understanding, Element Grounding, Task Automation and Task Collaboration and reports precise visual grounding as a critical determinant.

Seven adaptation:
- Vision score must not collapse OCR/understanding/grounding/action outcome into one number.
- stale coordinates and layout shifts become mandatory tests.
- Vision produces observations/grounding; action/effect truth remains outside Vision.

### 1.6 Smartphone perception is temporal and multimodal
OmniGUI evaluates smartphone agents from interleaved screenshots, audio/video and action history rather than only static screenshots.

Seven adaptation:
- Vision architecture should not assume every perception source is one immutable image.
- Observation identity needs time/frame/source context.
- dynamic media support should remain optional/lazy on mobile rather than always-on.

### 1.7 RAG pipeline complexity must justify itself
LongEval-RAG 2026 system results suggest stable rule-based evidence units plus targeted reranking can outperform more complex chunking approaches in some settings, and different evaluation methods can prefer different systems.

Seven adaptation:
- exact/lexical and stable rule-based segmentation remain serious baselines.
- semantic complexity is selective, not default.
- evaluation is multi-metric and gold/evidence oriented, not only LLM-judge oriented.

---

## 2. Capability #16 — Retrieval research hypotheses

Challenge current architecture with:
1. query-type-conditioned retrieval portfolios rather than one hybrid recipe,
2. explicit evidence coverage objective in addition to relevance,
3. source-dependency/syndication clustering before diversity claims,
4. sentence/evidence-unit late selection after stable coarse retrieval,
5. citation-constrained generation paths for high-grounding tasks,
6. long-context noisy-evidence stress tests,
7. deterministic exact/lexical champion baseline on Lite,
8. learned/semantic reranking only when measured marginal gain justifies cost.

Questions for Round 01:
- Do we need a canonical RetrievalNeed object separate from SearchQuery?
- Should coverage target claims/nuggets rather than document count?
- Should contradiction-seeking be a separate retrieval mode?
- How should retrieval expose unknown/under-covered dimensions to Research Fabric?

---

## 3. Capability #17 — Knowledge research hypotheses

Round 01 should test whether Knowledge needs a stronger separation among:
- SourceAsset,
- SourceVersion,
- ExtractionVersion,
- StructuralMap,
- EvidenceUnit,
- RetrievalIndex,
- DerivedSummary.

Key hypotheses:
- document layout/region identity must survive extraction for tables/figures and citations,
- chunk identity should not be mistaken for source identity,
- index version changes must not invalidate source truth,
- stale derived objects need dependency-aware invalidation,
- multimodal document assets require a source graph rather than a text-only file record,
- deletion must remove reconstructable derived copies while preserving allowed audit receipts.

---

## 4. Capability #18 — Vision research hypotheses

Candidate hierarchy:
`SourceFrame -> Regions -> OCR/Layout/Objects -> GroundedObservation -> SemanticObservation`

Each level should expose uncertainty and source coordinates/regions where meaningful.

Round 01 challenges:
- separate OCR correctness from semantic correctness,
- detect stale grounding after layout/frame changes,
- represent repeated/ambiguous controls,
- support page/document and GUI coordinate systems without conflating them,
- keep dynamic media temporal identity explicit,
- evaluate Arabic/RTL UI grounding separately,
- use specialized local/cheap modules before expensive multimodal inference when practical.

Rejected direction unless evidence reverses decision:
- one opaque vision model output becoming authoritative UI/document state.

---

## 5. Capability #19 — RPG research hypotheses

Round 01 will compare three state philosophies:
A. fixed typed schema,
B. open schema,
C. hybrid typed core + validated open extensions.

Current leading hypothesis: C.

Typed core candidates:
- entity identity,
- time/chronology,
- location,
- ownership/inventory,
- relationships with typed provenance,
- character knowledge,
- active commitments/invariants,
- irreversible/branching events,
- causal dependencies,
- unresolved promises/events.

Open extensions can represent world-specific traits such as:
- social rank,
- magic systems,
- faction-specific status,
- custom resource systems,
- setting-specific psychological/social variables.

But extensions must not silently become protected canonical state.

Evaluation must separate:
- world correctness,
- character consistency,
- narrative quality,
- entertainment,
- causal coherence,
- knowledge isolation.

---

## 6. Capability #20 — Real Works research hypotheses

NCP-style commitments are useful but insufficient alone for Real Works because Seven also needs source/continuity truth.

Round 01 candidate decomposition:
- CanonSourceGraph
- ContinuityGraph
- CanonClaimGraph
- NarrativeCommitmentSet
- ProtectedAnchorSet
- CharacterKnowledgeHorizon
- ReferenceTrajectory / partial-order constraints
- BranchGraph
- ReentryConditions
- CoverageContract

Key challenge:
Do not force every work into a single total timeline. Support partial orders and local constraints where canon only establishes relative ordering.

Branch semantics should track structural consequences:
- invalidated prerequisites,
- threatened anchors,
- unreachable future nodes,
- newly reachable alternatives,
- re-entry conditions.

A scalar `canonDebt` is insufficient as canonical state.

---

## 7. Capability #21 — Titles / linguistic research hypotheses

The initial sweep did not reveal one dominant benchmark specifically for fictional-world naming that should dictate Seven's architecture. Therefore Round 01 should construct a composite evaluation from computational-linguistic properties rather than inventing a fake universal benchmark.

Candidate representation:
- NamingDomain
- NamingGrammar
- MorphologyRules
- RegisterRules
- Orthography/PunctuationRules
- NumberingRules
- LocalizationProfile
- TransliterationProfile
- Forbidden/ReservedPatterns
- CollisionIndex
- ProvenanceClass

Important separation:
- official title/name records are evidence/source objects,
- generated names are grammar-constrained creative outputs,
- generated similarity must not masquerade as canon authenticity.

Round 01 should test Arabic morphology, RTL presentation, transliteration stability, official/localized/generated identity and collision behavior.

---

## 8. Research sources seeded for this round

- ACL 2026: Rethinking Evaluation for LLM Hallucination Detection / TRIVIA+
- ACL 2026: RLSeek: Evidence-Grounded Reasoning for RAG Hallucination Detection
- 2026: Candidate-Constrained Retrieval-Augmented Generation for LongEval-RAG
- ICML 2026: NCP-Bench / Can LLM Agents Stick to the Script?
- 2026: EvolvingWorld: An Open-Schema Framework for Co-Evolving Role-Play Agents and World Model
- CVPR 2026: MMBench-GUI
- 2026: OmniGUI smartphone multimodal GUI benchmark

These are research inputs, not authority sources for Seven architecture.

---

## 9. Round 01 research gaps still open

The following need deeper dedicated sweeps before Round 01 candidate reconciliation:
- temporal/causal knowledge graph maintenance under branches,
- efficient persistent event sourcing on browser/Android,
- document structural extraction and incremental multimodal indexing,
- Arabic/RTL OCR and GUI grounding benchmarks,
- morphology/transliteration/localization evaluation for fictional naming,
- branch re-entry/counterfactual planning methods,
- long-horizon multi-agent knowledge isolation,
- compact on-device retrieval/reranking options.

Round 01 must not declare saturation while these gaps remain materially relevant.

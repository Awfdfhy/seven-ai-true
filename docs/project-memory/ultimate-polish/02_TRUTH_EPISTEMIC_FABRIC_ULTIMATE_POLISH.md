# Seven AI — Truth / Epistemic Fabric Ultimate Polish

> **Campaign Item:** 02 — Truth / Epistemic Fabric
> **Protocol:** `SEVEN_ULTIMATE_POLISH_PROTOCOL.md` v2.1
> **Method:** Full-strength Pass A -> Velocity Assault -> full-strength Pass B -> Velocity Regression Assault -> Reconciliation
> **Result:** **ARCHITECTURE FREEZE CANDIDATE**
> **Implementation truth:** PARTIAL / FOUNDATION EXISTS. This document does not claim that the final architecture below is implemented, wired, benchmarked, or production-verified.
> **Protected-source rule:** This polish does not require modifying `seven_ai-final.html`.

---

# Maximum Effort Command — Truth / Epistemic Fabric

Build the strongest practical truth architecture for Seven without pretending that an AI can own objective truth. Seven must own provenance, evidence binding, claim identity, temporal scope, authority policy, conflict state, derivation lineage, uncertainty, verification and abstention semantics. Models and tools may propose claims, relations and verdict evidence, but they never grant truth or authority by declaration.

The fabric must distinguish at minimum:
- what a source says,
- what evidence directly shows,
- what Seven infers,
- what remains unknown,
- what sources disagree about,
- what changed over time,
- what is merely reported versus established about the world,
- what is faithful to supplied evidence versus independently factual,
- and what evidence belongs to which exact source/version/fragment.

The final system must remain lightweight on Android, incremental, cacheable, reconstructable, auditable and compatible with Research, Memory, Context, Tool Fabric, Canon/Real Works, Coding, Verification, Cognitive Runtime and future multimodal evidence.

---

# 1. Ground Truth Audit

## Existing strong foundations

Seven already has meaningful truth infrastructure:

### `hardening/truth-fabric.cjs`
- explicit epistemic kinds: `FACT / CLAIM / INFERENCE / ASSUMPTION / UNKNOWN / CONFLICT`
- source IDs
- authority classes A0–A5
- timestamps
- content hashes
- source independence groups
- support/contradiction references
- derivation lineage
- freshness checks
- authority non-amplification for derived claims
- explicit `grantsAuthority() === false`

### `release/research-runtime.js`
- claim/evidence matrix
- support / contradict / context stances
- source freshness
- citation locators
- gap / stale / uncitable / conflict states
- citation lock
- next-action generation for gaps, freshness, conflicts and weak authority

### `release/control-bridge.js`
- research rows are projected into truth claims
- unresolved research evidence can become `INCONCLUSIVE`
- canon commits can be blocked when declared canon lacks source coverage

### Architecture v4 invariants
- authoritative state is explicit
- derived state cannot increase authority through repetition, summarization or model confidence
- provenance/evidence/trust/confidence/authority are intended to remain distinct
- `PASS` requires evidence
- `INCONCLUSIVE` is legitimate

These are strong foundations worth preserving.

---

# 2. Material Defects in the Current Model

## Defect A — `FACT` is caller-assignable

`createClaim()` accepts `kind: FACT`. Therefore a caller can label a proposition FACT before a verification policy has earned that verdict.

**Required correction:** `FACT` becomes a derived compatibility/presentation verdict, never a canonical author-supplied claim type.

## Defect B — claim type and truth verdict are conflated

`INFERENCE` and `ASSUMPTION` describe how a statement was produced. `FACT`, `UNKNOWN` and `CONFLICT` describe epistemic status. One enum currently mixes different dimensions.

**Required correction:** separate:
- claim/assertion mode,
- evidence relations,
- derived verdict.

## Defect C — textual difference is treated as contradiction

`mergeClaims()` treats different normalized text as conflict. Paraphrases may be semantically identical; two different claims may simply discuss different propositions.

**Required correction:** conflict belongs between proposition identities/relations, not raw text strings.

## Defect D — authority is a single global scalar

A source can be authoritative for one proposition and weak for another. A GitHub file fetch may be excellent evidence about the bytes returned by GitHub, but not evidence that a statement inside the file is factually true about the outside world. A user is authoritative about a stated preference, but not automatically about an external scientific claim.

**Required correction:** authority becomes claim-role/scope aware. A0–A5 may remain a coarse prior/class, never a universal truth score.

## Defect E — weakest-source aggregation is too crude

Adding one weak source can lower the current claim authority because all source authorities are combined through a minimum. Conversely, counting many correlated sources can falsely look like corroboration elsewhere.

**Required correction:** evaluate evidence edges independently; model source dependence explicitly; do not let weak evidence poison stronger evidence and do not let duplicates amplify authority.

## Defect F — freshness is pooled at claim level

Freshness currently inspects source timestamps without binding temporal validity to the exact evidence relation. A fresh source does not refresh unrelated evidence, and an older source can remain correct for a historical claim.

**Required correction:** bitemporal/claim-scoped time semantics.

## Defect G — source attribution can drift

Research can know that a claim is supported somewhere while prose later attributes it to the wrong source. This is cross-source conflation.

**Required correction:** claim-to-evidence-to-source binding is explicit and locked before factual prose in modes that require grounding.

## Defect H — confidence would be dangerous if collapsed to one number

Model self-confidence, source authority, evidence coverage, freshness, independence, factuality and faithfulness are different dimensions.

**Required correction:** no canonical one-number truth confidence. Use an evidence/verdict vector and explicit uncertainty reasons. Numeric scores may exist as derived ranking aids only.

## Defect I — source independence is asserted, not proven

`independentGroup` can be supplied directly. Syndicated copies, mirrored reports and multiple tools reading the same upstream record can be mistaken for independent corroboration.

**Required correction:** represent evidence dependency/origin clusters and allow `INDEPENDENCE_UNKNOWN`.

## Defect J — absence is not automatically negative evidence

Not finding a fact is not evidence that it is false unless the queried source/domain has a justified completeness/closed-world assumption.

**Required correction:** negative-evidence semantics require an explicit coverage/closure contract.

---

# 3. Research & Competitive Evidence Sweep

The final design borrows concepts, not heavy runtime dependencies.

## W3C PROV
W3C PROV provides stable primitives for provenance using Entities, Activities and Agents, derivation, attribution, version/specialization and provenance bundles. Seven should map to these concepts for interoperability/export while keeping a much lighter internal schema on-device.

Key lesson: provenance is not only a URL; it is a graph of what was used, transformed, generated, by whom/what, and when.

## 2025–2026 uncertainty/factuality research

Recent RAG/fact-checking work materially changes the design assumptions:

- **FRANQ (ACL Findings 2026):** factuality and faithfulness to retrieved evidence are different variables and should not be conflated.
- **Why Uncertainty Estimation Methods Fall Short in RAG (ACL Findings 2025):** common uncertainty estimators do not reliably measure correctness after retrieved evidence is injected.
- **QuCo-RAG (ACL Findings 2026):** internal model confidence signals can be unreliable; external/corpus-grounded evidence can provide stronger retrieval/verification triggers.
- **Rethinking Uncertainty Evaluation in LLMs (2026):** calibration alone does not prove coherent probabilistic belief.
- **ProvenanceGuard (2026):** source-aware claim verification identifies cross-source conflation that pooled-evidence verification misses.
- **FactLens (ACL Findings 2025):** fine-grained/atomic claim verification improves visibility into partially wrong complex statements.
- **Explaining Sources of Uncertainty in Automated Fact-Checking (ACL 2026):** useful uncertainty explanations should connect to evidence agreements/conflicts rather than present an unexplained score.
- **Provenance Before Prose / claim-locked reporting (2026):** evidence-bearing claims can be bound before prose generation to reduce value/source drift and can also lower unnecessary generation cost.

**Architecture conclusion:** Seven needs a claim-evidence provenance graph with deterministic policy-derived verdicts and explicit uncertainty dimensions, not model confidence painted green.

---

# 4. Pass A — MAXIMIZE

Pass A produced **Candidate A: Epistemic Evidence Graph**.

Core proposal:
1. Atomic/versioned Claim nodes.
2. Exact SourceVersion records.
3. EvidenceUnit fragments with locators/hashes.
4. Typed support/refutation/qualification/attribution relations.
5. Explicit derivation/provenance graph.
6. Scope-aware authority profiles.
7. Temporal validity model.
8. Evidence dependence clusters.
9. Policy-derived verdict snapshots.
10. Claim/evidence lock before grounded prose.
11. Incremental materialized views and indexes.
12. Explicit abstention/conflict rather than forced resolution.

Candidate A was substantially stronger than the current flat claim object, but the second pass attacked its complexity and hidden failure modes.

---

# 5. Velocity & Smoothness Assault on Candidate A

Truth must not become a graph database tax on every chat token.

## Fast-path rule

A simple non-factual/creative interaction should not load the full epistemic stack. Truth Fabric activates progressively when a request/result contains externally checkable, state-sensitive, canon-sensitive, action-sensitive or otherwise verification-relevant claims.

## Hot-path architecture

- append compact semantic epistemic events, not verbose full snapshots
- maintain materialized per-claim views incrementally
- index by claim key, entity, relation/predicate, source root, time and content hash
- deduplicate evidence by source-version + locator + content hash
- keep large evidence payloads/artifacts outside compact verdict objects
- compile a small `TruthCapsule` for context rather than injecting the whole provenance graph
- recompute only claims affected by changed source/evidence/policy/time bucket
- cache verdicts using claim revision + evidence-set hash + policy version + temporal evaluation bucket
- perform deterministic exact checks first
- invoke semantic/NLI/model judges only for ambiguous relations, paraphrase resolution or complex inference
- batch compatible semantic checks when useful
- lazy-load multimodal/OCR/specialist verifiers
- never load W3C RDF/OWL machinery merely to use PROV ideas internally

## Context efficiency

The model usually needs:
- atomic claim text,
- verdict,
- top evidence refs,
- key conflict/uncertainty reasons,
- temporal scope,
- citation/source IDs.

It does **not** normally need every historical provenance edge.

---

# 6. Pass B — DESTROY THE WINNER

## Attack 1 — Atomic claim decomposition can change meaning

**Failure:** an LLM can split a complex statement incorrectly, lose qualifiers or invent entailments.

**Resolution:** preserve the original parent assertion. Atomic children are derived objects with explicit `DERIVED_FROM_DECOMPOSITION` lineage and semantic-coverage metadata. High-risk canonical verdicts cannot rely on an unverified decomposition alone.

## Attack 2 — Proposition identity can become fake certainty

**Failure:** semantic dedup may merge similar-but-different claims or fail on paraphrases.

**Resolution:** claim identity has two layers:
- exact immutable assertion identity,
- derived proposition-equivalence groups.

Equivalence is revisable derived state, not canonical identity.

## Attack 3 — Source authority becomes false precision

**Failure:** multiplying authority/freshness/directness into one score produces impressive decimals that hide policy assumptions.

**Resolution:** canonical authority/evidence quality remains a typed ordinal/vector profile. Numeric fusion is allowed only as a derived ranking heuristic with policy/version lineage.

## Attack 4 — Correlated sources fake consensus

**Failure:** ten articles may copy one press release.

**Resolution:** maintain `EvidenceOrigin` / dependency clusters. Independence can be `PROVEN_INDEPENDENT`, `DEPENDENT`, or `UNKNOWN`. Unknown never counts as proven corroboration.

## Attack 5 — Newer does not mean truer

**Failure:** a newer page can describe a different time period or be a lower-quality copy.

**Resolution:** separate valid time from observation/publication/retrieval/capture time. Supersession requires identity/scope compatibility plus explicit correction/version semantics, not timestamp alone.

## Attack 6 — Provenance graph explodes

**Failure:** storing every transformation as fully expanded objects can make long-running Seven heavy.

**Resolution:** append-only compact event IDs, content-addressed payloads, incremental views, bounded hot indexes, background compaction that preserves reconstructability, and lazy provenance expansion.

## Attack 7 — Truth Fabric tries to judge opinions/norms

**Failure:** not every proposition has a world-truth verdict.

**Resolution:** claims declare epistemic domain/mode. Preferences, instructions, normative statements, predictions and creative assertions use appropriate semantics; unsupported `FACT` projection is forbidden.

## Attack 8 — Reported truth vs world truth is conflated

**Failure:** proving “Source X said Y” does not prove Y.

**Resolution:** distinguish `ATTRIBUTION` claims from `WORLD` claims. Direct evidence may establish attribution while world-factuality remains unknown/refuted.

## Attack 9 — Evidence extraction may be wrong

**Failure:** OCR, summarization, translation, table extraction and model extraction can corrupt evidence.

**Resolution:** raw/source evidence and transformed evidence are separate. Every transform records transformation type/version/tool/model/hash and can never increase authority. High-risk verdicts may require re-expansion to the raw locator.

## Attack 10 — Citation lock can freeze stale evidence

**Failure:** locking citations too early can preserve an obsolete source set.

**Resolution:** evidence locks are immutable snapshots with freshness/policy timestamps, not eternal truth. A later source event creates a new lock/verdict revision.

## Attack 11 — Negative evidence is abused

**Failure:** “not found” becomes “false.”

**Resolution:** `ABSENCE` evidence contributes to refutation only under an explicit coverage contract that says the source/search space is sufficiently complete for that proposition.

## Attack 12 — Model judges secretly become truth authorities

**Failure:** NLI/LLM verifiers may label support/refutation confidently and incorrectly.

**Resolution:** verifier output is a derived relation proposal with verifier identity/version and uncertainty. Deterministic source facts and exact structural checks dominate where available. Model verdicts never create source authority.

---

# 7. Reconciliation — Final Architecture

# **Seven Epistemic Fabric 3.0 — Provenance-Locked Claim Graph**

Architecture target, not implementation-version claim.

## Prime law

> **Seven never stores “truth because a model said so.” It stores assertions, exact evidence, provenance and policy-derived verdicts.**

A displayed FACT is a projection of a verified claim state under a known policy/time/evidence set. It is not a primitive that callers may assign.

---

# 8. Canonical Object Model

Keep the canonical core small.

## A. `ClaimRecord`
Immutable/revisioned assertion identity.

Fields include:
- `claimId`
- `revision`
- `originalText`
- `normalizedForm` (derived)
- `claimMode`
  - `WORLD`
  - `ATTRIBUTION`
  - `OBSERVATION`
  - `PREFERENCE_SELF_REPORT`
  - `PREDICTION`
  - `NORMATIVE`
  - `INSTRUCTION`
  - `CREATIVE`
- `productionMode`
  - `DIRECT_ASSERTION`
  - `INFERENCE`
  - `ASSUMPTION`
  - `DECOMPOSED`
  - `TRANSFORMED`
- `subject/entity refs`
- `scope/domain`
- `validTime`
- `parentClaimRefs`
- `lineage`

The caller may declare production mode, never final factual verdict.

## B. `SourceRecord` / `SourceVersion`
Identity is separated from version.

Fields include:
- stable source ID
- source version ID
- URI/provider/tool identity
- principal/account scope where applicable
- content hash
- publication/update metadata
- captured/retrieved times
- source type
- declared author/publisher metadata (untrusted unless independently verified)
- source-root/dependency hints
- integrity/authenticity evidence
- invalidation/retraction/correction relations

## C. `EvidenceUnit`
The smallest evidence-bearing unit Seven can point back to.

Fields include:
- `evidenceId`
- `sourceVersionId`
- exact locator/range/row/cell/frame/timecode/etc.
- content/artifact hash
- raw vs transformed status
- transformation chain
- extraction method
- modality
- capture time
- coverage metadata
- lineage

## D. `EpistemicEdge`
Typed relationship between a claim and evidence/claim/source.

Core relations:
- `SUPPORTS`
- `REFUTES`
- `QUALIFIES`
- `CONTEXT_FOR`
- `ATTRIBUTES_TO`
- `DERIVED_FROM`
- `DUPLICATES`
- `SAME_ORIGIN`
- `DEPENDS_ON`
- `SUPERSEDES`
- `CORRECTS`
- `INVALIDATES`
- `EQUIVALENT_TO` (derived/revisable)

Every semantic edge has creator/verifier identity and lineage. Model-created edges are derived proposals until accepted by policy/verification.

## E. `VerdictSnapshot`
A derived immutable verdict over a specific graph state.

Key identity:
`claimRevision + evidenceSetHash + policyVersion + evaluationTime`

It contains:
- `supportState`
  - `SUPPORTED`
  - `REFUTED`
  - `MIXED`
  - `INSUFFICIENT`
- `freshnessState`
- `attributionState`
- `faithfulnessState`
- `independenceState`
- `provenanceState`
- `coverageState`
- `authorityBand`
- explicit `uncertaintyReasons[]`
- selected evidence refs
- conflict refs
- policy/version lineage

No mandatory canonical scalar confidence.

---

# 9. Compatibility Epistemic Projection

For existing Seven surfaces that expect the legacy words:

- `FACT` = policy-qualified supported world/attribution claim with sufficient evidence, provenance, freshness/scope and no blocking conflict.
- `CLAIM` = assertion whose final factual state is not yet established or does not require FACT projection.
- `INFERENCE` = production mode, surfaced when relevant.
- `ASSUMPTION` = production mode, never silently upgraded.
- `UNKNOWN` = insufficient/invalid/out-of-scope evidence.
- `CONFLICT` = unresolved material evidence/proposition conflict.

This preserves UI/API compatibility while removing caller-assigned FACT authority internally.

---

# 10. Evidence Quality and Authority Model

Authority is not truth and not generic trust.

Each evidence relation may carry a profile such as:
- source authority class A0–A5 (coarse prior)
- claim-domain relevance
- directness: primary/direct vs secondary/reported
- integrity/authenticity status
- provenance completeness
- freshness/temporal fit
- independence/dependency status
- extraction fidelity
- coverage/completeness

The verdict engine applies domain/task policy. It must never increase authority through summarization, corroboration count, repeated citations, model confidence or transformation.

### Important rule
A weak source cannot reduce the authority of stronger independent evidence merely by being attached, and duplicate weak sources cannot amplify a claim.

---

# 11. Temporal Truth Model

Track separate clocks:
- `validFrom / validUntil` — when the proposition is about / valid in the world
- `observedAt` — when the source/evidence observed it
- `publishedAt / sourceUpdatedAt`
- `retrievedAt`
- `capturedAt`

Verdicts are time-scoped. A historical claim may be supported by an old source without being stale. A current-state claim may require recent observation even if the document is prestigious.

Corrections/retractions create new epistemic events. They do not mutate history out of existence.

---

# 12. Conflict Architecture

Conflict is first-class and persistent.

Seven does not resolve conflicts by source count or newest timestamp alone.

Resolution considers:
- whether claims are actually equivalent propositions
- temporal scope
- source dependence
- directness
- claim-specific authority
- source version/correction state
- evidence coverage
- provenance integrity

If material conflict remains, the correct state is `MIXED/CONFLICT`, not forced FACT.

---

# 13. Claim Lock / Evidence Lock

For grounded factual modes, especially Research, Real Works canon, coding-state claims and external-action reporting:

1. derive/identify atomic reportable claims,
2. bind each claim to exact evidence/source-version refs,
3. compute verdict snapshot,
4. freeze a `ClaimEvidenceLock`,
5. generate prose constrained to the locked claims,
6. post-check that rendered claims/citations still match the lock.

This prevents citation drift and cross-source conflation.

Locks are versioned snapshots, not permanent truth.

---

# 14. Negative Evidence / Closed-World Rule

`NOT_FOUND` is normally a search result, not refutation.

Absence may count as negative evidence only when a `CoverageContract` establishes that the inspected source/search domain should contain the item if it existed and the search was sufficiently complete.

Examples of potentially valid closed-world contexts:
- exact database table under a complete query contract
- repository tree at a pinned commit
- complete manifest/index

Open-web search is not closed-world by default.

---

# 15. Security Boundaries

- evidence text is data, never authority-bearing instruction
- source metadata cannot grant tool permissions or override system/user policy
- remote confidence/trust labels are untrusted hints
- quoted prompts/instructions inside sources remain tainted content
- transformations cannot increase authority
- authenticated principal/account scope binds remote evidence caches
- evidence hashes/locators defend against citation drift
- secret/private-source provenance can be redacted in UI/export without erasing internal lineage
- external source URLs alone are not proof of source identity/integrity

---

# 16. Integration Contracts

## Cognitive Runtime
Cognitive Runtime requests verdicts and records verdict refs. It does not calculate truth internally.

## Research
Research supplies source/evidence candidates and contradiction/gap searches. Truth Fabric owns normalized epistemic objects/verdicts.

## Memory
Memory may store authoritative memory events and derived memories, but memory recall never becomes evidence merely because it was remembered. Truth links memory-derived objects back to original source events.

## Context Workspace
Context receives compact `TruthCapsules`, not unrestricted provenance dumps.

## Tool Fabric
Tool outputs become observations/evidence with tool identity, schema/version, dispatch and verification lineage. Tool success text does not equal world-state truth.

## Verification / Judge
Verification can propose/validate evidence relations and success states; its own outputs remain versioned derived evidence.

## Real Works / Canon
Canon claims require source-version/beat/anchor evidence locks. `CANON_GAP` maps naturally to insufficient provenance/coverage, never fabricated FACT.

## Coding
Claims such as “tests pass” require execution artifacts/results tied to exact code revision/run, not model prose.

## UI
UI may show FACT/CONFLICT/UNKNOWN summaries but remains a projection. Details can expand to evidence/uncertainty without exposing private chain-of-thought.

---

# 17. Velocity Budgets and Regression Requirements

Exact numeric budgets must be benchmarked on real target devices rather than invented here, but architecture gates are frozen:

- no full Truth Fabric initialization for creative/simple non-factual paths
- creating a basic claim/source/evidence object must be deterministic and local
- adding evidence should update only affected materialized views
- verdict recomputation should avoid global graph scans
- expensive semantic equivalence/NLI is lazy and batchable
- large evidence bodies remain outside compact hot state
- long histories must not make ordinary claim lookup grow without bound
- cancellation of background verification must be responsive
- persistent caches are invalidation/version scoped
- lite tier may reduce optional semantic enrichment but not provenance integrity or mandatory safety/action verification

Required benchmarks:
- claim creation
- evidence attach
- verdict recompute
- conflict update
- source correction/retraction propagation
- cold vs warm Truth Fabric activation
- 1k / 10k / larger evidence graph lookup/update
- memory/storage growth
- TruthCapsule compile latency
- long-session degradation

---

# 18. Verification Contract

A verdict cannot claim more than its evidence proves.

Before a verdict is eligible for `FACT` projection, verify where applicable:
- claim identity/scope
- evidence locator exists
- exact source version is known
- source/evidence integrity checks
- evidence relation is valid
- temporal fit
- required authority/directness policy
- conflict state
- independence requirements
- attribution correctness
- transformation lineage
- required coverage

If any mandatory dimension is unresolved, preserve uncertainty.

---

# 19. Eval Contract

Create Truth Fabric evals for:
- caller attempting to self-declare FACT
- paraphrase vs contradiction
- partially true compound claims
- source says X vs X is true
- stale current-state evidence
- valid historical evidence
- correction/retraction
- syndicated-source fake consensus
- unknown independence
- malicious source metadata
- prompt injection inside evidence
- OCR/translation/extraction corruption
- conflicting primary sources
- weak-source attachment to strong evidence
- duplicated citations
- unsupported negative claims
- closed-world negative evidence
- citation/source swap
- claim decomposition semantic drift
- factuality vs faithfulness disagreement
- model verifier overconfidence
- multimodal evidence lineage
- policy-version changes
- cache invalidation
- long-graph performance

Metrics should include:
- claim-level support/refutation correctness
- source attribution accuracy
- conflict detection recall/precision
- unsupported FACT rate
- abstention correctness
- correction propagation
- provenance completeness
- citation-lock integrity
- latency/RAM/storage cost

---

# 20. Implementation Stages

Implementation remains deferred until interacting systems are individually polished and then reconciled.

- `TF-P0` — schema split: ClaimRecord / SourceVersion / EvidenceUnit / Edge / VerdictSnapshot
- `TF-P1` — compact epistemic event ledger + materialized claim views
- `TF-P2` — temporal model + source version/correction/invalidation semantics
- `TF-P3` — evidence relations + dependency/independence clusters
- `TF-P4` — deterministic verdict policy engine + compatibility projection
- `TF-P5` — claim/evidence lock + TruthCapsule/context projection
- `TF-P6` — semantic equivalence/decomposition/verifier adapter layer
- `TF-P7` — Research/Memory/Tool/Canon/Coding integration
- `TF-P8` — adversarial/security/performance/Android eval gates

Note: this campaign also uses `Tool Fabric` initials elsewhere. During implementation, prefer an unambiguous package prefix such as `EF-*` for Epistemic Fabric if task IDs could collide.

---

# 21. Proof of Improvement

Compared with current Truth Fabric, the reconciled architecture:

- removes caller-assigned FACT status
- separates assertion production from truth verdict
- prevents text-difference conflict errors
- prevents source-count/duplicate consensus inflation
- prevents a weak attached source from poisoning strong evidence by a global minimum
- distinguishes reported attribution from world factuality
- distinguishes factuality from faithfulness
- binds claims to exact source versions/evidence fragments
- models correction/retraction/time explicitly
- treats uncertainty as explainable dimensions rather than decorative confidence
- handles open-world negative evidence correctly
- scales through incremental views and lazy semantic work
- maps to established provenance principles without importing heavyweight semantic-web runtime costs

New complexity is justified because it directly closes current correctness failures. Complexity that does not improve authority, provenance, verification or measured speed was rejected.

---

# 22. Final Red-Team Result

No remaining material architectural flaw was found that justifies another foundational redesign before cross-system polish.

Known residual risks remain implementation/evaluation problems rather than missing architectural primitives:
- imperfect semantic equivalence/decomposition
- imperfect source-dependency discovery
- domain-specific authority policy quality
- model-based evidence relation errors
- multimodal extraction quality
- performance on very large graphs

The architecture represents these uncertainties instead of assuming them solved.

---

# Freeze Candidate

## **Seven Epistemic Fabric 3.0 — Provenance-Locked Claim Graph**

**Individual-system status:** READY FOR ARCHITECTURE FREEZE RECORD.

**Implementation status:** NOT COMPLETE. Existing Truth Fabric remains the current implementation foundation until the later implementation campaign.

**Next Ultimate Polish item:** #03 Memory Fabric, after #02 freeze record is created.

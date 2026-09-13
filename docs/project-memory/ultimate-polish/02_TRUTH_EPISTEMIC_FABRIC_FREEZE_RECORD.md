# Seven AI — Truth / Epistemic Fabric Freeze Record

> **Campaign item:** #02 Truth / Epistemic Fabric
> **Status:** ARCHITECTURE FROZEN FOR CAMPAIGN / IMPLEMENTATION DEFERRED
> **Source polish record:** `02_TRUTH_EPISTEMIC_FABRIC_ULTIMATE_POLISH.md`
> **Final target:** **Seven Epistemic Fabric 3.0 — Provenance-Locked Claim Graph**
> **Important:** This freezes the individual-system architecture decision. It is not an implementation-complete claim and may be amended later only through documented cross-system reconciliation with proof of improvement.

## Prime Law
Seven does not store truth because a model/tool/source says something. Seven stores assertions, evidence, provenance and policy-derived verdicts. `FACT` is a derived compatibility/presentation projection, not a caller-assignable canonical primitive.

## Accepted Decisions
- Split assertion production mode from epistemic verdict.
- Canonical core objects: ClaimRecord, SourceVersion, EvidenceUnit, EpistemicEdge, VerdictSnapshot.
- Preserve exact original assertions; semantic equivalence/decomposition are derived/revisable.
- Versioned source identity and exact evidence locators/hashes.
- Typed support/refute/qualify/attribute/derive/dependency/correction/invalidation relations.
- Scope-aware authority profile rather than universal scalar trust.
- A0–A5 retained only as coarse authority prior/class where useful.
- No canonical single-number truth confidence.
- Separate factuality, faithfulness, attribution, freshness, independence, provenance and coverage dimensions.
- Model/tool verifier outputs remain derived proposals/evidence, never self-granting authority.
- Evidence-origin/dependency clusters prevent duplicate/syndicated evidence from faking consensus.
- Independence can remain UNKNOWN and must not be counted as proven independence.
- Separate world truth from attribution truth.
- Bitemporal/claim-scoped time model: validity, observation, publication/update, retrieval and capture are distinct.
- Corrections/retractions/invalidations append history rather than rewriting it away.
- ClaimEvidenceLock binds reportable grounded claims to exact evidence/source versions before prose where appropriate.
- Negative evidence requires explicit CoverageContract/closed-world justification.
- Compact epistemic event ledger + incremental materialized claim views.
- TruthCapsule provides small context projections instead of dumping provenance graphs into model context.
- Heavy semantic equivalence/NLI/multimodal verification is lazy and optional according to risk/ambiguity.
- W3C PROV concepts inform interoperability/export, but no heavyweight RDF/OWL runtime is required in the base Android path.

## Rejected / Avoided Decisions
- Caller-defined canonical FACT.
- One enum mixing production mode and verdict status.
- Treating different text strings as automatic contradiction.
- Global weakest-source authority aggregation.
- Source-count majority voting.
- Treating model self-confidence as factual confidence.
- Treating citations as provenance by themselves.
- Assuming all distinct URLs are independent sources.
- Assuming newer evidence automatically supersedes older evidence.
- Treating NOT_FOUND as false by default.
- Letting extraction/summary/OCR/translation transformations increase authority.
- Letting a model judge become a truth authority.
- Full provenance-graph loading/scanning on every interaction.
- Mandatory semantic-web runtime dependencies on mobile.

## Frozen Invariants
1. No caller can create authoritative FACT merely by setting a field.
2. Every factual verdict is tied to a specific claim revision, evidence set, policy version and evaluation time.
3. Derived transformations never increase authority.
4. Source attribution and world factuality are distinct.
5. Faithfulness to retrieved evidence and independent factuality are distinct.
6. Evidence provenance identifies exact source version and locator where technically available.
7. Duplicate/correlated evidence cannot silently amplify authority.
8. Unknown independence is not counted as proven independence.
9. Conflict may remain unresolved; Seven never manufactures consensus.
10. Historical truth and current-state truth use explicit temporal scope.
11. Negative evidence requires an explicit coverage/closure justification.
12. Remote/source/model metadata cannot grant permissions or authority.
13. Truth caches/materialized views are derived and invalidation/version scoped.
14. FACT/UNKNOWN/CONFLICT UI labels are projections, never alternate canonical state stores.
15. Cross-system reconciliation may change this architecture only with documented proof of improvement.

## Compatibility Projection
Legacy Seven-facing states remain available as derived projections:
- FACT
- CLAIM
- INFERENCE
- ASSUMPTION
- UNKNOWN
- CONFLICT

Internally, production mode and verdict remain separate.

## Implementation Stages
Implementation is intentionally deferred until interacting systems are polished/reconciled:
- `EF-P0`: canonical schemas + compatibility bridge
- `EF-P1`: compact epistemic event ledger + materialized views
- `EF-P2`: source versions + temporal/correction/invalidation model
- `EF-P3`: evidence edges + origin/dependency/independence clusters
- `EF-P4`: deterministic policy/verdict engine + legacy projection
- `EF-P5`: ClaimEvidenceLock + TruthCapsule
- `EF-P6`: semantic equivalence/decomposition/verifier adapters
- `EF-P7`: Research/Memory/Tool/Canon/Coding integration
- `EF-P8`: adversarial/security/performance/Android eval gates

## Mandatory Eval Families Before Implementation Freeze
- fake caller FACT
- paraphrase vs contradiction
- compound/partially true claim decomposition
- attribution truth vs world truth
- factuality vs faithfulness disagreement
- stale current-state vs valid historical evidence
- correction/retraction propagation
- duplicate/syndicated fake consensus
- unknown source independence
- citation/source swap
- source metadata prompt injection
- transformed-evidence corruption
- model-verifier overconfidence
- weak evidence attached to strong evidence
- open-world NOT_FOUND
- closed-world negative evidence
- cache invalidation/policy version changes
- long-graph latency/RAM/storage growth

## Campaign Handoff
#02 is closed for individual architecture polish.

Next item: **#03 Memory Fabric**.

After the individual campaign, #02 must participate in cross-system authority/ownership reconciliation, whole-Seven Velocity analysis, final red-team, and implementation sequencing.

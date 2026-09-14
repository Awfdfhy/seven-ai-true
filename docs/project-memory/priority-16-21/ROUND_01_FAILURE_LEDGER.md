# Priority 16–21 Hyper-Polish — Round 01 Failure Ledger

Status: ACTIVE
Purpose: enumerate architectural failure classes before proposing the Round 01 candidate. A failure remains open until the architecture has an explicit prevention, detection, recovery or truthful-degradation strategy.

Severity classes:
- C = Critical: can falsify truth/canon/authority or corrupt durable state.
- H = High: major correctness/consistency/reliability failure.
- M = Medium: material quality/performance/UX degradation.
- L = Low: local imperfection that does not compromise core truth.

---

## #16 Search / Retrieval

| ID | Sev | Failure class | Required architectural response | State |
|---|---|---|---|---|
| RET-01 | C | Search snippet treated as evidence | Candidate/evidence boundary + fetch/extraction provenance | OPEN |
| RET-02 | C | Wrong source version cited after page changes | SourceVersion binding | OPEN |
| RET-03 | H | High-similarity distractor outranks exact relevant evidence | Query-type routing + exact/lexical baseline + rerank | OPEN |
| RET-04 | H | Syndicated duplicates falsely appear as independent evidence | dependency/duplication clustering | OPEN |
| RET-05 | H | Fresh and stale claims mixed without claim-scoped freshness | freshness constraints per RetrievalNeed/claim | OPEN |
| RET-06 | H | Contradictory source intentionally hidden by relevance ranking | contradiction-seeking/follow-up mode | OPEN |
| RET-07 | H | Recall improved but evidence precision collapses | multi-axis coverage/precision evaluation | OPEN |
| RET-08 | M | Semantic retrieval cost imposed on simple exact query | deterministic fast path | OPEN |
| RET-09 | M | Query expansion drifts from user intent | expansion lineage + bounded variants | OPEN |
| RET-10 | H | Arabic/English entity aliases split evidence incorrectly | multilingual entity/alias handling | OPEN |
| RET-11 | H | No-result retrieval is interpreted as refutation | explicit coverage semantics | OPEN |
| RET-12 | M | Large catalog/corpus exhausts mobile RAM | lazy indexes/bounded candidate stages | OPEN |

---

## #17 Knowledge / Files

| ID | Sev | Failure class | Required architectural response | State |
|---|---|---|---|---|
| KNO-01 | C | Chunk/summary silently becomes authoritative source | source/derived type boundary | OPEN |
| KNO-02 | C | Old extraction survives new source version unnoticed | dependency-aware invalidation | OPEN |
| KNO-03 | H | Table/chart structure lost in flat text extraction | structural regions/multimodal source map | OPEN |
| KNO-04 | H | Citation cannot reconstruct exact source range | stable locators + extraction-version lineage | OPEN |
| KNO-05 | H | Same document duplicated under aliases | content/version identity + duplicate graph | OPEN |
| KNO-06 | H | File deletion leaves reconstructable semantic copies | purge graph/receipts | OPEN |
| KNO-07 | H | OCR uncertainty disappears after indexing | uncertainty propagation | OPEN |
| KNO-08 | M | Reindexing blocks ordinary app startup | asynchronous/lazy incremental indexing | OPEN |
| KNO-09 | H | Conflicting project documents are merged as one truth | document-level source identity + Epistemic claims | OPEN |
| KNO-10 | M | Index model/version changes break stable references | index identity separate from source identity | OPEN |
| KNO-11 | H | Malicious document instructions gain prompt authority | contextual data/instruction separation | OPEN |
| KNO-12 | M | Huge document ingestion causes thermal/RAM pressure | streaming/bounded extraction | OPEN |

---

## #18 Vision

| ID | Sev | Failure class | Required architectural response | State |
|---|---|---|---|---|
| VIS-01 | C | Observation detached from source pixels/page/frame | SourceFrame + region provenance | OPEN |
| VIS-02 | H | OCR error treated as certain text | calibrated observation state | OPEN |
| VIS-03 | H | Old coordinates used after layout shift | frame identity + grounding freshness | OPEN |
| VIS-04 | H | Repeated controls cause ambiguous target | candidate regions + ambiguity state | OPEN |
| VIS-05 | H | Semantic understanding score hides bad grounding | hierarchical metrics | OPEN |
| VIS-06 | H | Image and embedded text disagree with no conflict state | multimodal conflict representation | OPEN |
| VIS-07 | M | Expensive multimodal model called for trivial OCR | staged cheap-specialist path | OPEN |
| VIS-08 | H | Arabic/RTL control ordering mis-grounded | RTL-specific tests/geometry rules | OPEN |
| VIS-09 | M | Dynamic/video observation flattened to timeless image | temporal observation identity | OPEN |
| VIS-10 | C | Vision output grants permission to act | authority separation from action layer | OPEN |
| VIS-11 | H | Cropped/occluded context causes false certainty | coverage/visibility state | OPEN |
| VIS-12 | M | Large screenshots/doc pages consume unbounded memory | tiling/downscale/ROI strategy with provenance | OPEN |

---

## #19 RPG Engine

| ID | Sev | Failure class | Required architectural response | State |
|---|---|---|---|---|
| RPG-01 | C | Narrator prose silently rewrites committed world state | typed commit boundary | OPEN |
| RPG-02 | C | Character knows future/hidden information | per-character knowledge ledger | OPEN |
| RPG-03 | H | Entity location/inventory contradiction | typed core invariants | OPEN |
| RPG-04 | H | Relationship/personality change appears without causal evidence | event-linked state transitions | OPEN |
| RPG-05 | H | Delayed consequence forgotten after many turns | unresolved event/causal dependency tracking | OPEN |
| RPG-06 | H | Branch identity lost after save/load/retry | branch lineage + replay identity | OPEN |
| RPG-07 | H | Random outcomes cannot be replayed/debugged | recorded RNG seed/result | OPEN |
| RPG-08 | H | Fixed schema cannot express setting-specific state | validated open extensions | OPEN |
| RPG-09 | C | Open schema creates new authoritative fields without governance | typed-core/open-extension promotion boundary | OPEN |
| RPG-10 | H | NPC goals conflict but runtime picks arbitrary outcome without state reasoning | explicit goals/constraints + proposal/commit split | OPEN |
| RPG-11 | M | Long sessions cause context explosion | reconstructable state capsules + event retrieval | OPEN |
| RPG-12 | H | Beautiful narration masks contradiction | state correctness metric separate from style | OPEN |
| RPG-13 | H | Retry duplicates irreversible fictional event in ledger | logical event identity/idempotent commit | OPEN |
| RPG-14 | M | Large simulation state blocks mobile UI | incremental state updates/lazy views | OPEN |

---

## #20 Real Works / Canon

| ID | Sev | Failure class | Required architectural response | State |
|---|---|---|---|---|
| CAN-01 | C | Unsupported detail invented to fill source gap | `CANON_GAP` | OPEN |
| CAN-02 | C | Conflicting continuities merged into one truth | ContinuityGraph + scoped claims | OPEN |
| CAN-03 | C | Fan/secondary claim promoted over primary canon without evidence policy | Epistemic authority/claim roles | OPEN |
| CAN-04 | H | Total-order timeline imposed where canon only gives partial order | partial-order constraints | OPEN |
| CAN-05 | C | Player invalidates future event but system still calls session canon | structural branch derivation | OPEN |
| CAN-06 | H | Scalar canon score hides which obligations failed | explicit anchor/commitment violation graph | OPEN |
| CAN-07 | H | Character gains future knowledge from canon database | CharacterKnowledgeHorizon | OPEN |
| CAN-08 | H | Branch cascade makes later events unreachable but runtime keeps scheduling them | prerequisite/reachability propagation | OPEN |
| CAN-09 | H | Re-entry declared merely because story resembles canon again | explicit ReentryConditions | OPEN |
| CAN-10 | H | Source revision/retcon leaves stale CanonGraph | source-version dependencies + revalidation | OPEN |
| CAN-11 | H | Adaptation and original source conflict without provenance | source/continuity scoped claims | OPEN |
| CAN-12 | M | Canon ingestion requires huge up-front graph build | progressive/lazy graph construction | OPEN |
| CAN-13 | C | Model confidence substitutes for source coverage | CoverageContract + evidence locks | OPEN |
| CAN-14 | H | Duplicate evidence appears to strengthen canon support | source-dependency clusters | OPEN |

---

## #21 Titles / World Linguistic Engine

| ID | Sev | Failure class | Required architectural response | State |
|---|---|---|---|---|
| TTL-01 | C | Generated title is presented as official | provenance class mandatory | OPEN |
| TTL-02 | H | Naming style copied too literally from source examples | abstract grammar + originality checks | OPEN |
| TTL-03 | H | Morphology wrong for language/world grammar | morphology rules/evaluation | OPEN |
| TTL-04 | H | Arabic localization loses meaning/register | locale-specific evaluation | OPEN |
| TTL-05 | H | Transliteration creates inconsistent entity identity | stable transliteration/alias map | OPEN |
| TTL-06 | M | Generated title collides with existing canon/user title | collision index | OPEN |
| TTL-07 | H | Wrong naming domain grammar used (artifact vs episode vs organization) | NamingDomain-specific grammar | OPEN |
| TTL-08 | M | Numbering/punctuation conventions drift over long project | versioned style profile | OPEN |
| TTL-09 | H | Canon source title and localized title treated as same origin | source/localization provenance | OPEN |
| TTL-10 | M | Heavy generative pass required for trivial deterministic label | deterministic formatter fast path | OPEN |
| TTL-11 | H | World-style score hides semantic nonsense | semantic-fit and style-fit split | OPEN |
| TTL-12 | H | Naming engine mutates canon/world state | read-only linguistic boundary | OPEN |

---

# Cross-System Failures

| ID | Sev | Failure class | Required response | State |
|---|---|---|---|---|
| X-01 | C | Search result becomes Canon claim without SourceVersion/EvidenceUnit | enforced handoff contract | OPEN |
| X-02 | C | OCR uncertainty disappears before canon ingestion | uncertainty lineage across Vision -> Knowledge -> Canon | OPEN |
| X-03 | C | RPG branch does not invalidate canon trajectory constraints | shared branch/constraint handshake | OPEN |
| X-04 | H | Title generator uses wrong continuity/branch | branch/continuity context binding | OPEN |
| X-05 | H | Source update invalidates Knowledge but not active Canon/RPG views | dependency invalidation events | OPEN |
| X-06 | C | Retrieved malicious instruction influences narrator/controller authority | data/instruction isolation end-to-end | OPEN |
| X-07 | H | Same entity has different IDs across Retrieval/Knowledge/Canon/RPG/Titles | identity/alias mapping contract | OPEN |
| X-08 | H | Multilingual aliases produce split branches/facts/titles | language-neutral canonical entity ID | OPEN |
| X-09 | H | Long-running session keeps stale evidence snapshot silently | session evidence snapshot/version policy | OPEN |
| X-10 | M | Six strong systems together exceed mobile budget | cluster-level resource budget + lazy activation | OPEN |

---

# Round 01 priority attacks

Highest-priority unresolved architecture questions:
1. Hybrid typed-core + governed open extensions for RPG.
2. Partial-order Canon trajectory plus explicit reachability/re-entry semantics.
3. End-to-end uncertainty/provenance propagation from Vision/Search into Canon.
4. Source revision invalidation across Knowledge -> Canon -> active RPG session.
5. Entity identity unification across all six systems without creating one giant shared mutable database.
6. Long-horizon state reconstruction that remains lightweight on Android.
7. Retrieval CoverageContract and contradiction-seeking mode.
8. World Linguistic Engine evaluation without fake universal style scores.

No Round 01 candidate should freeze while Critical rows lack explicit treatment.

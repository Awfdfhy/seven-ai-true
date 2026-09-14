# Priority 16–21 Hyper-Polish — Round 01 Gauntlet Matrix

Status: ACTIVE DESIGN
Purpose: define the evaluation pressure that every Round 01 candidate must survive. These are architecture/eval contracts, not claims that the current implementation already passes them.

---

## Scoring doctrine

No single aggregate score can erase a critical failure.

Each gauntlet records:
- correctness outcome,
- evidence/provenance integrity,
- uncertainty honesty,
- long-horizon survival where relevant,
- latency/resources,
- recovery/replay behavior,
- UX truthfulness.

Critical truth/canon/authority failures are hard gates.

---

# G1 — Retrieval Precision Under Distractors

Input: a corpus containing one exact answer, several semantically similar wrong passages, duplicate syndicated versions and irrelevant high-keyword-density passages.

Test:
- exact/lexical baseline,
- semantic path,
- hybrid path,
- reranked path.

Pass properties:
- correct evidence survives,
- duplicate sources do not count as independent corroboration,
- query expansion does not drift,
- selected evidence has SourceVersion identity,
- no snippet-only evidence promotion.

Metrics:
- evidence precision,
- claim/nugget recall,
- dependency-adjusted source diversity,
- latency/network/RAM.

---

# G2 — Retrieval Contradiction Hunt

Input: sources that disagree on a claim, including one newer correction.

Pass properties:
- system detects contradictory evidence when the task requires truth resolution,
- freshness is claim-scoped,
- newest is not automatically authoritative,
- absence of evidence is not treated as refutation,
- unresolved conflict remains explicit.

---

# G3 — Long-Context Noisy Evidence

Input: large mixed corpus with relevant evidence, irrelevant context and realistically noisy annotations/extractions.

Pass properties:
- evidence location remains recoverable,
- hallucination/grounding evaluation does not assume clean labels,
- context size does not force whole-corpus model ingestion,
- Lite path remains operational.

---

# G4 — Source Version Mutation

Input: SourceVersion V1 is indexed and used by Canon; source later becomes V2 with a material correction.

Pass properties:
- V1 evidence remains historically identifiable,
- V2 does not silently overwrite provenance,
- stale derived indexes/summaries are detected,
- Canon dependencies become revalidation candidates,
- active RPG session policy for historical snapshot vs refreshed canon is explicit.

---

# G5 — Multimodal Document Fidelity

Input: PDF containing body text, table, figure, footnotes and page-specific annotations.

Pass properties:
- structural regions survive extraction,
- evidence can point to precise source region/page,
- OCR uncertainty survives downstream,
- table semantics are not flattened into unsupported prose,
- re-extraction does not change source identity.

---

# G6 — Knowledge Purge and Rebuild

Input: source imported, chunked, embedded, summarized, then deleted under a policy requiring removal of reconstructable derivatives.

Pass properties:
- derivatives are discoverable from dependency graph,
- purge removes required reconstructable copies,
- permitted audit receipt does not retain forbidden content,
- indexes can rebuild cleanly from surviving sources.

---

# G7 — Vision Grounding After Layout Shift

Input: screenshot/frame A contains repeated controls. Frame B moves elements and changes scale/orientation.

Pass properties:
- coordinates from A are stale in B,
- candidate ambiguity is explicit,
- new grounding binds to B,
- semantic understanding does not override bad grounding,
- action authority remains external to Vision.

Metrics separated by:
- content understanding,
- element localization,
- grounding confidence/calibration,
- latency.

---

# G8 — Arabic / RTL Vision

Input: Arabic RTL UI with mixed Arabic/English labels, icons and repeated buttons.

Pass properties:
- reading order is correct,
- OCR regions are source-bound,
- mirrored layout does not invert semantic target identity,
- alias/entity resolution remains stable.

---

# G9 — Dynamic Visual Observation

Input: sequence of frames or transient mobile UI state where a control appears/disappears.

Pass properties:
- observations carry temporal/frame identity,
- stale visual claims expire appropriately,
- system does not pretend a control still exists based on old frame,
- dynamic media support remains lazy and bounded.

---

# G10 — RPG 100-Turn State Survival

Initial state includes:
- locations,
- inventory,
- relationships,
- private knowledge,
- unresolved promises,
- custom world-specific extension fields.

During 100 turns introduce:
- movement,
- transfers,
- delayed consequences,
- misleading player claims,
- NPC conflicts,
- save/load,
- retry.

Pass properties:
- typed core state remains contradiction-free,
- private knowledge does not leak,
- open extensions remain governed,
- delayed events persist,
- replay lineage remains intact,
- prose cannot rewrite committed state.

---

# G11 — RPG Open-Schema Challenge

Run the same kernel across worlds requiring very different state dimensions.

Pass properties:
- typed core remains stable,
- world-specific fields can extend without schema explosion,
- extension fields have provenance/validation,
- extension cannot silently create new authority class,
- unused extensions have near-zero global cost.

Candidate comparison:
A fixed schema vs B unrestricted open schema vs C typed core + governed extensions.

---

# G12 — Character Knowledge Firewall

Construct a mystery scenario where different NPCs have different evidence.

Adversarial player attempts to make NPCs reveal facts they cannot know.

Pass properties:
- knowledge horizon enforced,
- inference vs known fact separated where material,
- narrator can describe uncertainty without leaking hidden canon,
- branch does not automatically grant omniscience.

---

# G13 — Canon Exact Trajectory

Run a source-complete work with no disruptive player intervention.

Pass properties:
- reference commitments/order preserved,
- official facts remain source-linked,
- character knowledge remains time-correct,
- no invented filler is labeled canon without support.

---

# G14 — Harmless Player Insertion

Player performs actions not present in canon but compatible with protected future commitments.

Pass properties:
- session can remain canon-compatible where logically valid,
- inserted events remain distinct from official source events,
- later canon prerequisites are rechecked rather than assumed.

---

# G15 — Irreversible Canon Divergence

Player performs an action that destroys a prerequisite for a protected future event.

Pass properties:
- `BRANCH_REQUIRED` occurs,
- invalidated future nodes are identified structurally,
- branch reason points to violated prerequisites/commitments,
- system does not merely increase a scalar debt and continue canon labeling.

---

# G16 — Canon Re-entry

After a branch, later events create a state resembling the original trajectory.

Pass properties:
- resemblance alone is insufficient,
- explicit re-entry conditions are evaluated,
- historical divergence remains in lineage,
- re-entry can be partial/local rather than erasing branch identity.

---

# G17 — Continuity Conflict

Provide multiple legitimate continuities/adaptations with conflicting facts.

Pass properties:
- continuity-scoped truth remains separate,
- cross-continuity comparison is possible without merging facts,
- user/session continuity selection is explicit,
- generated prose cannot silently switch continuity.

---

# G18 — CANON_GAP

A scene requires information not established by available sources.

Pass properties:
- targeted retrieval/research may be requested,
- missing evidence stays `CANON_GAP`,
- model confidence cannot promote the missing fact,
- user sees useful uncertainty rather than a fake exact answer.

---

# G19 — Visual Canon Ingestion

Canon evidence exists only in a scanned/image-rich source.

Flow:
`Vision -> Knowledge -> Epistemic -> Canon`

Pass properties:
- OCR/layout uncertainty survives all handoffs,
- source region is reconstructable,
- Canon cannot upgrade uncertain perception without evidence,
- corrected OCR invalidates dependent claims where necessary.

---

# G20 — World Linguistic Provenance

Provide:
- official source title,
- official localized title,
- user-defined nickname,
- Seven-generated episode title,
- in-world generated artifact name.

Pass properties:
- provenance classes never collapse,
- generated output is never presented as official,
- continuity/branch context is bound where needed.

---

# G21 — Linguistic Generalization

Give a known world style but request titles/names for unseen content categories.

Pass properties:
- output follows abstract grammar/register rather than copying existing titles,
- semantic fit remains correct,
- morphology/orthography are valid,
- collisions are detected,
- style fit is measured separately from originality and semantic fit.

---

# G22 — Arabic Localization / Transliteration

Input contains mixed original-script names and Arabic localized forms.

Pass properties:
- canonical entity ID remains language-neutral,
- transliteration aliases are stable/versionable,
- Arabic morphology/register is evaluated separately,
- RTL formatting does not alter stored identity,
- official localization and Seven-generated localization remain distinct.

---

# G23 — Source Poisoning Across the Full Chain

A retrieved source contains imperative text attempting to override system/controller behavior.

Flow:
`Search -> Knowledge -> Canon/RPG`

Pass properties:
- source content remains data,
- no instruction-authority escalation,
- canon extraction only captures source claims/evidence,
- narrator/controller authority remains governed elsewhere.

---

# G24 — Whole-Cluster Mobile Pressure

Device state:
- low memory,
- warm/thermal pressure,
- limited network,
- long RPG session,
- canon source pack loaded,
- knowledge index present.

Pass properties:
- unused Vision/retrieval heavy modules unload or remain lazy,
- app interaction remains responsive,
- Lite degradation is truthful,
- critical world/canon state is not discarded,
- optional reranking/visual intelligence can reduce before correctness floors.

---

# G25 — Crash / Resume Mid-Session

Crash occurs after player action proposal but before or during world/canon commit.

Pass properties:
- system can distinguish proposed vs committed state,
- duplicate replay does not create duplicate logical event,
- branch/canon state remains recoverable,
- unresolved commit state is explicit.

---

# G26 — Entity Identity Across Six Systems

One entity has:
- source spelling,
- translated spelling,
- transliteration,
- alias/nickname,
- OCR typo in one source.

Pass properties:
- one canonical entity can reference multiple source-bound mentions,
- OCR typo is not silently normalized without lineage,
- retrieval can find aliases,
- canon facts bind to entity identity with evidence,
- RPG and Titles consume the canonical entity ID without owning it.

---

# Round 01 hard acceptance gates

A candidate cannot be reconciled as Round 01 winner if it lacks explicit architecture for:
1. SourceVersion/evidence provenance end-to-end.
2. OCR/visual uncertainty propagation.
3. typed RPG core plus strategy for world-specific state.
4. character knowledge isolation.
5. branch prerequisite/reachability tracking.
6. `CANON_GAP` and source conflict.
7. re-entry semantics.
8. official vs generated linguistic provenance.
9. cross-language entity identity.
10. mobile cluster-level lazy/resource behavior.

Round 01 may tighten these gates. It may not silently weaken them to obtain a PASS.

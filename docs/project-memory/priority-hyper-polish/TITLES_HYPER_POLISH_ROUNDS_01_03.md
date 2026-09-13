# Titles Hyper-Polish — Rounds 01–03

Status: **PRE-IMPLEMENTATION CHALLENGER WORK**
Baseline under attack: World Linguistic Engine 3.0

# Round 01 — Naming Identity / Authority

Verdict: **MATERIAL_IMPROVEMENT_FOUND**

## Failure
A single title string cannot safely represent identity, language, localization, status, ownership and history at once.

## Accepted design
Introduce `NamingIdentity` as the language-independent referent for one naming concept. It binds:
- target entity/content/event/form/organization
- naming class
- world/continuity/branch scope
- semantic role
- origin/provenance
- source evidence or creation event
- lifecycle/validity interval

`NameForm` becomes a language/register-specific realization of a NamingIdentity rather than the identity itself.

Possible form states include:
- OFFICIAL
- OFFICIAL_LOCALIZED
- USER_DEFINED
- IN_WORLD_ATTESTED
- GENERATED_CANDIDATE
- GENERATED_ACCEPTED
- WORKING_PLACEHOLDER
- UNKNOWN_STATUS

Repeated generation, repetition or popularity never upgrades official status.

### Core law
A name can become widely used without becoming canon-official, and can become official without being universally known in-world.

Officiality, social adoption and character knowledge are separate.

---

# Round 02 — World Linguistic Grammar 4.0

Verdict: **MATERIAL_IMPROVEMENT_FOUND**

## Failure
One vague WorldLanguageProfile can imitate surface style while missing morphology, domain structure and register.

## Accepted design
A derived `NamingGrammarProfile` is composed from smaller rule packs:

### NamingDomainGrammar
Separate rules where useful for:
- personal names
- place names
- organizations/factions
- powers/forms
- artifacts/items
- quests/missions
- episodes/chapters/arcs
- honorifics/epithets
- games/side stories/specials

### MorphologyProfile
Language-aware inflection, derivation and compounding where relevant.

### PhonotacticProfile
Optional abstract sound/orthographic tendencies for invented names. It stores patterns, not copied catalogues.

### RegisterProfile
World-defined ceremonial, formal, military, colloquial, bureaucratic, comic, archaic or other registers.

### StructuralTitlePattern
Semantic slots, grammatical ordering, punctuation, numbering and series conventions.

### ForbiddenPatternSet
Rejects invalid morphology, misleading officiality, duplicate-like names, wrong punctuation/register and world-pack forbidden structures.

Generation becomes:
`NamingIntent -> semantic constraints -> domain grammar -> morphology/register -> candidate set -> validation -> status/provenance`.

No model is asked merely to "sound like" a franchise.

---

# Round 03 — Social / Earned / Perspective-Aware Titles

Verdict: **MATERIAL_IMPROVEMENT_FOUND**

## Failure
An earned title should not appear everywhere because a hidden numeric meter crossed a threshold.

## Accepted design
Add derived `NamingClaim` and `NamingAdoptionView`.

A social title or alias may originate from:
- witnessed deed
- public record
- faction decree
- rumor chain
- self-identification
- rival/opposition label
- chronicle usage
- ceremonial grant
- inherited office
- user assignment where allowed

Adoption is scoped by:
- person
- group/faction
- region/community
- institution
- language/register
- time
- branch

RPG Information Propagation determines who has encountered the name. Titles cannot become universal knowledge by magic.

This allows one entity to carry different simultaneous names, such as a formal honorific, local nickname, faction rank, secret alias or historical epithet, while preserving which communities actually use each one.

### Earned-title law
Titles are caused by events and adoption, not granted by an unexplained scalar. Reputation summaries may rank candidates, but lineage must identify why the title exists.

---

# Round 01–03 status

All three rounds found material architecture improvements.

Saturation counter: **0 / 2**.
# Seven World Linguistic Engine 4.0 — Provenance-Governed Temporal Naming Graph

Status: **PRE-IMPLEMENTATION / SATURATION TEST TARGET**
Incorporates accepted Titles Hyper-Polish Rounds 01–07.

## Prime law

> Names are governed linguistic identities, not decorative strings. Models may propose wording; referent identity, provenance, language forms, social adoption, temporal validity and branch scope remain explicit.

## Minimal canonical model

Four core record families:
1. `NamingIdentity`
2. `NameForm`
3. `NamingGrammarProfile`
4. `NamingManifest`

Everything else is a policy, derived view, index, validation result or integration contract. Titles never creates a second world/canon database.

## NamingIdentity

Language-independent identity for one naming concept. It binds targetRef, naming class, semantic role, world/continuity/branch scope, origin, source/event lineage and lifecycle refs.

Supported domains include people, epithets/honorifics/offices, locations, organizations, artifacts, powers/forms, quests, achievements, events, episodes/chapters/arcs/seasons, side stories/specials/What-Ifs, games/subprojects and world-pack extensions.

## NameForm

Language/register/script realization of a NamingIdentity. It carries surface form, locale, script, status, register, provenance, validity scope and linguistic/display metadata.

Status classes:
- OFFICIAL
- OFFICIAL_LOCALIZED
- USER_DEFINED
- IN_WORLD_ATTESTED
- GENERATED_CANDIDATE
- GENERATED_ACCEPTED
- WORKING_PLACEHOLDER
- UNKNOWN_STATUS

Popularity never upgrades officiality.

## NamingGrammarProfile

Versioned, composable rules:
- domain grammar
- morphology
- optional phonotactics/orthography
- register
- structural title patterns
- series conventions
- forbidden patterns
- collision/normalization policy

Profiles encode abstract linguistic structure, not copied title catalogues.

## NamingIntent and generation

Generation starts from typed semantic constraints derived from authoritative RPG/Canon/content state.

Common path:
`NamingIntent -> deterministic grammar candidates -> validation -> optional model expansion -> validation/ranking -> selection -> NameForm proposal`

The model cannot invent plot/world facts just to improve a title.

## NamingManifest

Generated/selected forms can record intent hash, grammar version, semantic/source refs, generation path, provider/model revision if used, validation/collision results, localization strategy, selection origin and branch/time metadata. This is reproducibility without hidden chain-of-thought.

## Social and earned titles

`NamingClaim` explains why an in-world label exists. `NamingAdoptionView` reconstructs who uses it across individuals, factions, regions, institutions, language/register, time and branch.

Titles may originate from witnessed deeds, records, decrees, transmitted claims, self-identification, ceremonies, offices, chronicles or user assignment where allowed.

RPG Perspective/Information Propagation owns who actually knows the name. No global title appears merely because one score changed.

## Contextual name resolution

`NameResolutionContext` selects the appropriate existing form for a viewer/speaker/audience using perspective/discovery, language, relationship/social role, faction/region, register, time, branch, continuity, UI surface and reveal policy.

It may return a resolved form, composed form, unresolved descriptor, explicit ambiguity or blocked reveal.

Controller knowledge never forces a hidden name into character-facing output.

## Name composition

`NameCompositionPolicy` handles language-specific combinations such as office + name, rank + family name, name + epithet or dynastic ordinal. It can only compose world-supported components.

## Temporal / branch naming

Historical and current names coexist through event/source-bound validity. Renaming never rewrites the past.

Source-canon names remain continuity scoped. Branch-created aliases/epithets remain branch scoped and never become official source canon by simulation alone.

## ContentNamingGraph

Derived content relations include PART_OF, SEQUEL_TO, PREQUEL_TO, SPINOFF_OF, SIDE_STORY_OF, SPECIAL_OF, ADAPTATION_OF, VARIANT_OF, WHAT_IF_OF, INTERLUDE_WITHIN and COMPANION_TO.

Titles reads this graph to preserve numbering/nesting conventions but does not own chronology.

## Localization and Arabic

`LocalizedNameForm` records strategy: OFFICIAL_LOCALIZATION, TRANSLITERATION, SEMANTIC_TRANSLATION, HYBRID, IN_WORLD_LOCALIZATION, USER_PREFERRED or UNKNOWN.

Arabic support treats identity, script form, transliteration, morphology, diacritization and bidi display as separable concerns. Alternate spellings can map to one NamingIdentity. A model guess never becomes official pronunciation/diacritization automatically.

## Form / Visual / Real Works bridges

RPG `FormRef` and CharacterVisualState may supply semantic context for form-specific names, but Titles does not create transformations.

Real Works supplies official source identity, continuity/adaptation, official localization evidence and CANON_GAP. Titles supplies naming structure and linguistic realization only.

Generated media never proves a canon name.

## Collision / ambiguity / originality

Validation distinguishes alternate forms of one identity, identical strings for different identities, transliteration-equivalent forms, historical variants, intentionally reused offices/titles, near-duplicate generated candidates and official/generated confusion risk.

Exact/normalized/phonetic/morphological/lightweight similarity indexes are sufficient for the common path. No mandatory vector database.

Originality checks reduce accidental imitation but are not legal adjudication.

## Lifecycle

Rename/grant/revocation/adoption is source- or event-bound. Derived lifecycle views may be PROPOSED, ACTIVE, HISTORICAL, REVOKED, DISPUTED or UNKNOWN. Historical usage is never erased by current status.

## Performance

- no model call for ordinary lookup/resolution
- lazy grammar loading per world/domain/language
- no global naming model at startup
- no full canon corpus in naming prompts
- no background naming for every entity
- optional model creativity only where it earns value
- Lite mode remains fully functional without naming-model inference

## Evaluation

Independent axes:
- semantic fit
- grammar/morphology
- world/register fit
- originality/non-copying
- collision correctness
- provenance/status correctness
- contextual resolution/reveal safety
- temporal/branch correctness
- localization quality
- Arabic/transliteration/diacritization where gold exists
- content-series convention correctness
- latency/resource cost

Unseen-content tests are mandatory so memorized official titles cannot masquerade as naming skill.

## Implementation staging

TITLE4-P0 schemas/indexes; P1 deterministic grammar; P2 manifest/collision/originality; P3 contextual resolver/composition; P4 social adoption bridge; P5 temporal/branch lifecycle; P6 content graph; P7 localization/Arabic; P8 Real Works bridge; P9 optional model candidate generation; P10 multilingual/mobile/long-horizon evals.

Implementation remains deferred during architecture-only Hyper-Polish.

## Reconciliation status

Rounds 01–07 found material improvement.

Saturation counter: **0 / 2**.
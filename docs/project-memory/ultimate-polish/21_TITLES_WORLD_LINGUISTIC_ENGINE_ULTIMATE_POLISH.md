# Seven AI — Capability 21 Titles / World Linguistic Engine Ultimate Polish

Status: **FREEZE CANDIDATE — architecture only**
Target: **Seven World Linguistic Engine 3.0 — Evidence-Grounded Naming Grammar**

## 1. Prime law

> A title is a typed linguistic artifact of a world, medium and moment. Seven generates from an explicit naming grammar and evidence profile, not from a generic fantasy-name prompt or copied title list.

## 2. Ground truth

`world-runtime.js` currently provides deterministic labels and `formatTitle()` for episode/chapter/arc/sideStory/special/whatIf/filler/game. `rpg.js` exposes a working Titles UI that records generated names into the world session. This is a good functional foundation but the current architecture is mostly label + number + user-supplied name.

## 3. Final capability scope

The engine supports typed naming for, when appropriate:

- episodes
- chapters
- volumes
- arcs
- seasons
- side stories
- specials
- OVAs/bonus material
- fillers
- what-if branches
- games
- DLC/expansion-like content
- quests
- missions
- achievements
- locations
- organizations
- factions
- events
- powers/abilities
- forms
- artifacts/items
- books/documents inside the world
- vehicles/ships
- projects/operations in worlds where applicable

Taxonomy is world/medium-specific. Seven does not force every world to expose every type.

## 4. Canonical objects

- `NamingDomain`
- `TitleKind`
- `WorldLanguageProfile`
- `NamingGrammar`
- `NamingConstraintSet`
- `NamingEvidenceRef`
- `NamingRequest`
- `NamingCandidate`
- `NamingDecision`
- `TitleIdentity`
- `LocalizationVariant`
- `CollisionRecord`
- `NamingManifest`

## 5. Title identity states

Every title/label is explicitly classified:

- `OFFICIAL`
- `OFFICIAL_LOCALIZED`
- `USER_DEFINED`
- `SEVEN_GENERATED`
- `IN_WORLD_GENERATED`
- `WORKING_PLACEHOLDER`
- `UNKNOWN_STATUS`

Generated names are never presented as official canon unless source evidence says they are.

## 6. World Language Profile

A profile contains evidence-grounded tendencies such as:

- primary languages/scripts
- historical/cultural register
- formality
- orthography/punctuation
- morphology/compound patterns
- preferred title length bands
- semantic density
- literal vs metaphorical tendency
- numbering/season/episode conventions
- recurring structural patterns
- taboo/avoided constructions
- naming domains with separate grammars
- localization rules

This is a derived profile with source lineage, not a claim that style can be reduced to one vector.

## 7. Naming grammar

A `NamingGrammar` composes typed rules:

- required semantic fields
- allowed syntactic patterns
- inflection/morphology
- prefix/suffix/compound rules
- phonotactic constraints where relevant
- character/organization/location-specific conventions
- punctuation/capitalization
- numbering format
- medium-specific wrappers
- localization transforms

Rules can be deterministic, stochastic with replay seed, or model-assisted. Generated candidates must remain valid under the same constraints.

## 8. Evidence-grounded style without copying

Seven may infer high-level naming characteristics from canon/source evidence, but must not reproduce long copyrighted text or mechanically remix a list of existing titles.

For copyrighted fictional works:

- retain official names needed for factual identity;
- derive abstract naming constraints;
- generate novel candidates for new user-created/branch content;
- check near-duplicate/collision against known official/generated names;
- preserve status labels so generated content is never confused with official material.

## 9. Semantic binding

A name must fit what it names. `NamingRequest` can bind:

- subject/entity/event
- scene/arc themes
- narrative function
- emotional register if explicitly part of the creative request
- chronology/era
- faction/culture
- spoiler constraints
- medium/title kind
- continuity/branch

The naming engine cannot invent authoritative world events merely to justify a cool title.

## 10. Candidate generation pipeline

```text
NamingRequest
 -> domain/kind resolution
 -> WorldLanguageProfile
 -> NamingConstraintSet
 -> deterministic templates/rules where sufficient
 -> optional model-assisted candidate generation
 -> morphology/orthography validation
 -> semantic-fit validation
 -> collision/near-duplicate check
 -> localization checks
 -> diversity/repetition check
 -> ranked candidate set OR deterministic selection
 -> NamingDecision + manifest
```

## 11. Candidate scoring is non-authoritative

Candidate ranking may use:

- semantic fit
- grammar validity
- world-profile fit
- memorability/readability
- novelty/collision distance
- length/UI fit
- localization quality

No single scalar is canonical. Hard grammar/status/collision constraints filter before softer preference ranking.

## 12. Determinism and replay

When reproducibility matters, the same:

- profile version
- grammar version
- request
- constraints
- seed
- model revision if used

produces a traceable `NamingManifest`. Creative mode may deliberately request variation.

## 13. Localization

Localized names are separate variants linked to the same `TitleIdentity`.

Rules include:

- translation vs transliteration policy
- script direction
- Arabic definite article/spacing considerations where appropriate
- capitalization that applies only to scripts that use it
- pronunciation/readability constraints
- retained proper nouns
- official localization precedence when source-supported

Do not translate an official title and then silently label the translation official unless an official localized form exists.

## 14. Arabic / RTL

Arabic is first-class:

- proper bidi isolation for mixed names/numbers
- Arabic punctuation/quote conventions where chosen
- morphology-aware generated forms
- avoid naive Latin title-case rules
- optional diacritics policy
- Arabic/English paired labels when the world/product requires them
- stable internal ids independent of display direction

## 15. Collision system

Check against:

- official canon names in active continuity
- generated names in current project/world/branch
- aliases/localizations
- near-duplicates after safe normalization
- confusing homographs when relevant

Collision warnings distinguish hard identity conflict from merely similar style.

## 16. RPG / Real Works integration

- RPG state supplies subject/event/context.
- Canon Engine supplies official identities/status and source-supported conventions.
- Titles engine never edits world/canon state except through a separate explicit record action.
- Branch-generated titles are tagged to that branch.
- Official and Seven-generated content remain visibly distinguishable.

## 17. Velocity assault

- profiles/grammars are compact cached derived data
- deterministic rules first
- model generation only when needed
- no full canon corpus in prompt
- collision index lightweight/lexical first
- lazy semantic similarity only for difficult collision checks
- no background candidate generation
- batch candidate validation locally where possible

## 18. Pass B — destroy the winner

### Generic title templates only
Rejected: cannot preserve world linguistic identity.

### Fine-tuned style imitation as mandatory core
Rejected: heavy, brittle and copyright-risky; abstract evidence-grounded grammar is stronger product architecture.

### Copy/remix existing title list
Rejected.

### One universal title score
Rejected. Hard constraints and typed properties matter more.

### English-first localization then Arabic patch
Rejected. Locale/script behavior is structural.

### Title engine allowed to invent canon facts
Rejected. Semantic inputs come from authoritative world/canon state.

## 19. Mandatory evals

- official/generated status separation
- episode vs quest vs location grammars
- deterministic replay
- variation under changed seed
- collision with official name
- near-duplicate generated collision
- branch-local title
- adaptation-specific official localization
- Arabic-only naming
- mixed Arabic/English numbering
- long title UI constraint
- spoiler-safe naming
- semantic mismatch rejection
- repeated-pattern fatigue across 100 titles
- world profile update/versioning
- no-copy/novel candidate checks

## 20. Implementation stages

- WLE-P0 identity/kind/status schemas
- WLE-P1 language-profile + evidence lineage
- WLE-P2 deterministic naming grammar
- WLE-P3 candidate validation/collision
- WLE-P4 optional model-assisted generation
- WLE-P5 localization/Arabic
- WLE-P6 RPG/Canon integration
- WLE-P7 manifest/replay
- WLE-P8 UI/typed title surfaces
- WLE-P9 large-world/copyright-safe/locale evals

## 21. Freeze decision

Freeze candidate upgrades Titles from formatting into a compact, evidence-grounded linguistic subsystem. It can name nearly every world artifact consistently without confusing generated language with official canon or requiring heavyweight style imitation.

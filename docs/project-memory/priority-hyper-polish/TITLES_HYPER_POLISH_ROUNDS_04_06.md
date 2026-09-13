# Titles Hyper-Polish — Rounds 04–06

Status: **PRE-IMPLEMENTATION CHALLENGER WORK**

# Round 04 — Content / Series Naming Graph

Verdict: **MATERIAL_IMPROVEMENT_FOUND**

## Failure
Episodes, chapters, arcs, seasons, side stories, specials, OVAs, What-Ifs, games and DLC-like content are related objects. A flat title generator cannot reliably preserve hierarchy, numbering conventions, adaptations or related naming patterns.

## Accepted design
Introduce a derived `ContentNamingGraph` over existing content/canon objects.

Relations may include:
- PART_OF
- SEQUEL_TO
- PREQUEL_TO
- SPINOFF_OF
- SIDE_STORY_OF
- SPECIAL_OF
- ADAPTATION_OF
- VARIANT_OF
- WHAT_IF_OF
- INTERLUDE_WITHIN
- COMPANION_TO

Titles reads these relations but does not own chronology or canon truth.

`SeriesConventionProfile` handles:
- episode/chapter numbering
- season/volume labels
- subtitles
- punctuation conventions
- numeral conventions
- special/side-story markers
- language-specific series formatting

A generated content title binds a semantic subject to authoritative RPG/Canon/content state so wording cannot silently invent an event that never happened.

---

# Round 05 — Localization / Arabic / Script Identity

Verdict: **MATERIAL_IMPROVEMENT_FOUND**

## Failure
Localization cannot safely be modeled as `translate(title)`.

Arabic proper names and titles may require choices about script, morphology, transliteration, diacritization, register and mixed-direction display. Multiple legitimate surface forms can refer to the same underlying identity.

## Accepted design
`LocalizedNameForm` binds:
- NamingIdentity
- locale/language/script
- localization strategy
- source/generation provenance
- grammatical features where material
- transliteration scheme where used
- diacritization state
- pronunciation hint where supported
- bidi/RTL-safe display metadata

Localization strategies:
- OFFICIAL_LOCALIZATION
- TRANSLITERATION
- SEMANTIC_TRANSLATION
- HYBRID
- IN_WORLD_LOCALIZATION
- USER_PREFERRED
- UNKNOWN

Arabic rules include:
- identity is independent of the Arabic surface string;
- an undiacritized spelling is not assumed to determine one pronunciation;
- morphology/compounding/honorific construction are rule-driven when used by the language/world pack;
- mixed Arabic/Latin title UI remains bidi-safe;
- alternate transliterations are modeled as related forms rather than separate entities when evidence supports that relation.

Localization never silently changes officiality.

---

# Round 06 — Temporal / Branch / Collision / Complexity Destroyer

Verdict: **MATERIAL_IMPROVEMENT_FOUND**

## Failures attacked
- historical names disappear after renaming;
- character forms need form-specific epithets without replacing character identity;
- source canon and branch-created names can collide;
- two unrelated things may legitimately share a surface string;
- generated names can become too close to known official names;
- many naming features risk becoming separate authority stores.

## Accepted design

### Temporal naming
`NamingUsageInterval` is a derived/event-bound view. An entity can have historical and current names without rewriting prior dialogue, records or chronology.

### Branch naming
Generated/adopted mutable naming facts are branch-scoped. Source-canon names stay in source/continuity scope. Branch events may add aliases or epithets without rewriting official canon.

### Form-aware naming
Forms and transformations can have form-specific NamingIdentities or aliases bound to `FormRef`. Titles never owns transformation truth.

### Collision classes
Validation distinguishes:
- same identity + alternate form
- same surface + different identity
- near-duplicate generated candidate
- official/generated confusion risk
- transliteration-equivalent variants
- intentionally inherited/reused office/title
- suspiciously close reference requiring rejection or review

### Originality guard
The engine stores abstract grammar and structure, not an official-title catalogue used as a template. Candidate checks can use exact/normalized/phonetic/string-similarity and known-name indexes where available. These checks reduce accidental imitation but are not treated as legal adjudication.

### Complexity destroyer
Rejected as independent authority stores:
- alias database
- localization database
- honorific database
- episode-title database
- RPG-earned-title authority

They survive as typed NamingIdentity/NameForm records or reconstructable views/indexes over existing world/source/content identities.

---

# Round 04–06 status

Rounds 01–06 all found material improvement.

The strongest surviving architecture now centers on:
1. `NamingIdentity`
2. `NameForm`
3. composable `NamingGrammarProfile`
4. reproducible `NamingManifest`
5. derived social, temporal, localization, content and collision views

No new world authority store is introduced.

Saturation counter after the latest material change: **0 / 2**.

Next: reconcile into World Linguistic Engine 4.0 and attack it with independent saturation challengers.
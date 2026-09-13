# Seven Titles / World Linguistic Engine — Hyper-Polish Reopen and Research

Status: **HYPER_POLISH ACTIVE / PRE-IMPLEMENTATION**
Scope: Capability 21 — Titles / World Linguistic Engine
Baseline: **Seven World Linguistic Engine 3.0 — Evidence-Grounded Naming Grammar**
Parent protocol: `SEVEN_PRIORITY_16_21_HYPER_POLISH_PROTOCOL.md`

## Why reopen

Titles 3.0 already had typed naming categories, source-aware official/generated distinction, world-specific naming grammar, collision checks, localization variants and Arabic/RTL awareness.

RPG 4.2 exposed a larger domain: names can be consequences of world history, social adoption, forms, factions, regions, branches, canon continuities and player-caused events. Titles 3.0 was strong at generating names, but under-specified as a temporal and social naming system.

Saturation counter resets to **0 / 2**.

## Research signals

The research sweep used current and established work in multilingual proper-name modeling, Arabic morphology and proper-noun handling, controllable generation, procedural naming and game-world social naming.

Important signals:
- multilingual proper-name systems benefit from separating language-independent identity from language-specific lexical realizations;
- Arabic proper nouns require explicit handling for script, morphology, transliteration and diacritization rather than assuming one translation operation;
- controllable generation is stronger when semantic and structural constraints are explicit;
- world naming is more convincing when names encode culture, function, history and register through reusable grammar rather than copied examples;
- earned social titles should come from events and information spread, not from one unexplained global score.

Research references include:
- Maurel, `Prolexbase: a Multilingual Relational Lexical Database of Proper Names`.
- Bondok et al., `Proper Noun Diacritization for Arabic Wikipedia`, WikiNLP 2025.
- Khairallah et al., `Computational Morphology and Lexicography Modeling of Modern Standard Arabic Nominals`, EACL 2024.
- Peng et al., `Towards Controllable Story Generation`.
- 2026 survey literature on controllable long-form story generation and consistency.

## Prime redesign hypothesis

> A name is not a string. It is a typed, scoped linguistic identity with provenance, language-specific forms, temporal validity and social usage.

Titles owns naming identity and linguistic realization. It does not own world truth, canon truth, reputation truth, transformation truth or content chronology.

## Authority separation

The redesign will keep separate:
- officiality
- source support
- generated status
- user acceptance
- in-world adoption
- character knowledge
- current vs historical use
- branch vs source-canon scope

A label may be famous without being official, official without being universally known, and generated without being canon.

## Mobile rule

Common-path naming must remain deterministic and compact. Model generation is optional and selective. No large naming model, embedding index or world-wide background naming process may become mandatory.

## Reopen verdict

`MATERIAL_IMPROVEMENT_FOUND`

The baseline is legitimately reopened for dedicated Titles Hyper-Polish.
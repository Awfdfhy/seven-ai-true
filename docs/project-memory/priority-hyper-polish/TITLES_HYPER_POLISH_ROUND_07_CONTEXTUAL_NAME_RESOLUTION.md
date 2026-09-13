# Titles Hyper-Polish — Round 07: Contextual Name Resolution

Status: **PRE-IMPLEMENTATION CHALLENGER ROUND**
Verdict: **MATERIAL_IMPROVEMENT_FOUND**

## Failure discovered

Even with NamingIdentity and multiple NameForms, Seven still needs a governed rule for deciding which form is actually appropriate in a specific scene, UI surface, document or dialogue turn.

Using a globally preferred name can leak secrets, future identities, private aliases, old names, faction-specific labels or canon revelations.

## Accepted architecture

Introduce derived `NameResolutionContext`.

Inputs may include:
- target NamingIdentity
- viewer/speaker/audience
- PerspectiveState / DiscoveryState
- language/locale/script
- relationship/social role
- institution/faction/region
- scene register
- world time
- branch
- canon continuity/adaptation
- content/UI surface
- spoiler/reveal policy
- user localization preference

The resolver selects among valid NameForms. It does not create truth.

## Perspective-aware naming

A character may use only names/forms reachable through its perspective, social role or explicit world rules.

Examples of valid divergence:
- formal public name vs private nickname
- rank/honorific vs personal name
- secret alias vs revealed identity
- regional exonym vs local endonym
- historical former name vs current name
- faction-specific epithet

A narrator/controller may know a hidden identity while a character-facing view still renders the unknown person as an unresolved descriptor or known alias.

## Reveal gating

Names can carry revelation sensitivity:
- PUBLIC
- DISCOVERED
- CHARACTER_SCOPED
- CONTROLLER_ONLY
- CANON_FUTURE
- SECRET

These are presentation/access labels, not replacements for RPG Perspective or Real Works canon authority.

The Titles engine asks those systems what is knowable and chooses an allowed form.

## Name composition

Add derived `NameCompositionPolicy` for ordered combinations such as:
- personal name + office
- office + personal name
- rank + family name
- name + epithet
- dynastic ordinal
- faction honorific + name

Composition is language/register specific and cannot invent an office, rank or epithet that world state does not support.

## Resolution ambiguity

If a surface name can refer to multiple NamingIdentities, the resolver preserves ambiguity until context disambiguates it. Raw string equality does not merge identities.

## Mobile / complexity result

This remains a lightweight deterministic resolver over indexed NameForms and perspective/state references. No model call is required for ordinary selection.

## Round result

`MATERIAL_IMPROVEMENT_FOUND`

Saturation counter resets/remains **0 / 2**.

This is the last accepted material change before reconciliation into World Linguistic Engine 4.0.
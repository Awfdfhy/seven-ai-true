# Relationship UI System

## Principle
Seven relationships are multidimensional state. Do not reduce them to hearts or one romance meter.

## Runtime dimensions
Current RPG state defines:
trust, affection, respect, fear, loyalty, attraction, suspicion, rivalry, resentment, dependency, familiarity.

The current architecture also records attributable relationship changes/events. The v1 pair key is symmetric, so the UI must **not imply directional certainty** until the underlying model is directional.

## Default story view
No permanent relationship meter.
When a relationship is contextually important, allow:
- subtle semantic cue on character quick card
- recent change indicator
- "Relationship" entry point

## Relationship focus panel
Recommended structure:
1. Pair identity
2. Plain-language summary generated from existing dimensions only
3. 3–5 most salient dimensions
4. Recent change timeline with reason/provenance
5. Shared events / current tensions
6. link to knowledge overlap when safe

## Visual model
Use a **balanced spectrum / semantic bars**, not hearts:
- dimensions are independent
- positive and adversarial dimensions may coexist
- color is secondary to label + position + text
- numbers are hidden by default; raw values may exist in advanced/debug view

## Graph view
Desktop only as an optional overview.
- selecting a character focuses direct edges
- edge label names the dominant relationship dimension
- hidden/unknown links stay hidden
- mobile substitutes a focused relationship list
- avoid force-directed animation by default

## Relationship change
A meaningful change may surface as a small post-turn consequence line:
"Trust increased after the joint mission"
only if that reason/event is present in runtime data.

No fabricated explanations.

## Spoiler safety
Never reveal:
- hidden attraction/suspicion/fear the player has no right to inspect
- NPC beliefs that are not exposed to the current perspective
- unknown relationship edges
Debug omniscience is separate.

## Accessibility
Every bar/graph edge needs a text equivalent.
Do not encode positive/negative state with red/green alone.

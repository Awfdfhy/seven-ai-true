# SKILL_PROGRESSION_UI

## Direction
**Arcane Systems × category clusters**, bounded for 320px.

## Current contract
Abilities expose name, owners, limitations, costs, weaknesses, cooldown turns, last-used turn, power scale, forbidden and tags. A universal level/XP/skill-point/class schema is not guaranteed.

## Ability surface
- Group by explicit tags/owner only.
- Row/card includes name, cost, cooldown readiness and one-line limitation.
- “Unavailable” includes reason.
- Full weaknesses/limitations open in detail sheet.

## Skill-tree modes
Choose representation from actual data:
1. Linear mastery — when sequence/order exists.
2. Category clusters — when tags/categories exist but edges do not.
3. Branching tree — only when prerequisite edges exist.
4. Constellation — decorative enhancement only after graph usability is proven.

**Never infer prerequisite edges.**

## Progression adapter
The same visual component may render different progress dimensions when data exists:
- character growth
- story/chapter progression
- world progression
- relationship progression
- conventional level/XP

The label must name the actual progression type; never call story progression “Level”.

## 320px tree rule
No free-pan canvas as the only navigation. Provide category tabs/accordion + linear node reading order. Nodes remain at least 44px interactive size, with readable Arabic labels.

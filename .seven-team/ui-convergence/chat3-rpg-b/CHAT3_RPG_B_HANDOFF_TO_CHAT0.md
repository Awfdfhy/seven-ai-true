# CHAT3_RPG_B_HANDOFF_TO_CHAT0

## Completed in this research pass
- 250-reference structured database: 60 battle, 50 progression, 50 inventory, 50 map, 40 kingdom.
- 120 concept combinations.
- Battle, inventory/equipment, skill/progression, map/world, kingdom/faction systems.
- Anti-pattern catalog.
- Top 50 -> Top 15 -> Golden 6 funnel.
- Six visual directions scored for mobile/RTL/Seven identity.
- Independent R08 review.
- Runtime-contract audit against current `rpg-state.js`.

## Recommendation requiring Chat 0 selection
Choose **Tactical Minimal + Royal Strategy + contextual Living World** as canonical RPG-B direction.

## Shared-surface escalation
Do not let Chat 3 independently create:
- character identity/portrait ownership,
- relationship controls,
- journal/canon/lore UI,
- duplicate RPG navigation.

Those intersect Chat 2 ownership and require Integrator coordination.

## Production implementation gate
After Chat 0 selects direction, R07 should implement only existing-data surfaces and coordinate shared RPG DOM/CSS ownership. Required proof:
1. before/after screenshots,
2. 320/360/390/420,
3. portrait/landscape,
4. Arabic RTL,
5. day/night,
6. large text,
7. DOM + visual regression,
8. R08 re-review.

## Known contract blockers (do not fake)
- initiative / ordered turn list
- universal HP/MP/resources
- level/XP/class/skill points
- skill prerequisite edges
- crafting recipes
- shop stock/prices/currency semantics
- geographic map coordinates/adjacency

If these do not exist in runtime, UI sections must collapse rather than synthesize data.

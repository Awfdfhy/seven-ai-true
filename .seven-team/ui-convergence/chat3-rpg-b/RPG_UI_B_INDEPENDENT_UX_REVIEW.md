# RPG_UI_B_INDEPENDENT_UX_REVIEW — R08

Reviewer mode: independent, no implementation authority.

## Verdict
**NOT READY** for RPG UI B completion. Research/design system is ready for Chat 0 direction selection; production implementation and screenshot evidence remain gated.

## Blocking findings
- B0: no universal battle initiative/HP/MP schema verified; a traditional combat HUD would fabricate state.
- B0: no explicit skill-tree prerequisite graph verified.
- B0: no universal level/XP/class/skill-point contract verified.
- B0: no crafting recipe/shop price/stock contract verified.
- B1: map coordinates/adjacency are not guaranteed; geographic rendering needs a graph/list fallback.
- B1: overlap with Chat 2 exists around character identity/relationship/world context controls; shared elements require Chat 0 coordination.
- B1: production changes require before/after Android visual evidence per wave rules.

## What is safe now
- Contextual ability list from existing ability records.
- Item list/detail/equipped markers from existing item records.
- Faction overview from existing faction/world records.
- World Pulse/event list from activeEvents/timeline when present.
- Current location label from scene/character location when present.
- Responsive shells that hide absent sections.

## Review checklist for R07 implementation
Clarity <=2s; one-hand reach; no invented values; no horizontal overflow at 320; Arabic labels remain readable; logical properties; minimum target size; no color-only meaning; story remains visually dominant; all missing fields collapse cleanly.

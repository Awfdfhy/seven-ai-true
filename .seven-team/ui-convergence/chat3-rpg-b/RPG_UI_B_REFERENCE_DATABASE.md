# RPG_UI_B_REFERENCE_DATABASE

Owner: Chat 3 — RPG UI B Lead  
Research lanes: R05 Battle/Skills, R06 Inventory/Progression  
Implementation lane: R07 Map/Kingdom/World  
Independent reviewer: R08

## Evidence basis
This database contains **250 structured UI references**: 60 battle/HUD/turn-order, 50 skills/progression/class, 50 inventory/equipment/loot/crafting, 50 map/exploration/travel, and 40 kingdom/faction/strategy/economy.

The source set intentionally mixes tactical RPG, CRPG, action RPG, mobile RPG, deckbuilding, and strategy interfaces. Rows are *pattern studies*, not instructions to clone a game. Repeated source pages refer to distinct UI surfaces/screens from the same game.

## Runtime boundary
Verified existing Seven RPG state supports:
- `items`, `abilities`, `factions`, `quests`
- `world.locations`, `world.kingdoms`, `world.factions`, `world.politics`, `world.economy`, `world.wars`, `world.activeEvents`, `world.resources`
- scene, timeline and character state

Do **not** present HP/MP, initiative, XP, levels, skill points, crafting recipes, prices, or route times unless the runtime/session actually supplies them.

## Selection funnel
- Top 50: high Seven suitability + mobile-adaptable patterns.
- Top 15: patterns that remain understandable on 320–420px.
- Golden 6: see `GOLDEN_RPG_B_REFERENCES.md`.

## Research conclusions
1. Context beats permanence: combat/state UI should appear when decisions require it.
2. Text-backed states beat icon walls.
3. Mobile inventories need list/detail or 2-column hybrid behavior.
4. Trees must collapse by category or stage; no free-pan desktop graph as primary phone UX.
5. Maps need a strong “you are here” anchor and limited priority overlays.
6. Kingdom UI should be event/relationship led, not metric-card led.
7. Every strategic number needs a label and semantic grouping; never rely on color alone.

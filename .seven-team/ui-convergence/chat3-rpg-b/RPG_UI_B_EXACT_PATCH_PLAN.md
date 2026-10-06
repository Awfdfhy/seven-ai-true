# RPG_UI_B_EXACT_PATCH_PLAN

This is the exact implementation sequence after Chat 0 approves the visual direction.

## Phase 1 — adapter
Preferred production file: `release/workspaces/rpg-ui-b-adapter.js`.
- pure read-only projection
- no DOM
- no storage
- no mutation API
- unit tests first

## Phase 2 — shared RPG host (B07/I01)
Edit `release/workspaces/rpg.js`:
- mount one `RpgSystemsTrigger` inside existing RPG context surface
- mount one canonical `BottomSheet/InspectorPanel`
- do not create a second modal implementation
- consume adapter projection only
- preserve Chat 2 ownership for characters/relationships/journal/canon/lore

## Phase 3 — styles
Do not add a new global token namespace.
Use `ui-foundation.css` semantic tokens and logical properties.
RPG-only selectors may live in canonical RPG stylesheet ownership selected by I01.
Delete replaced RPG-local duplicate rules rather than override them.

## Phase 4 — conditional modules
Implement in order:
1. Abilities
2. Items/equipped state
3. World Pulse/current location
4. Factions/kingdom state
5. Battle context only from explicit scene conflict data

Defer:
- initiative queue
- HP/MP bars
- level/XP/class
- skill prerequisite tree
- crafting
- shop/economy transactions
- geographic map

until an explicit runtime contract exists.

## Phase 5 — tests/evidence
- adapter unit tests
- DOM interaction tests
- viewport matrix
- Android 14
- Android 16
- before/after screenshots
- R08 independent review

## Deletion requirement
Any existing duplicated RPG system control replaced by this sheet must be removed in the same integration change; no parallel surface.

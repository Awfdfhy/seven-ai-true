# RPG_UI_B_COMPONENT_CONTRACT

## Canonical components requested from B07/I01
All use existing Seven primitive tokens/components.

### RpgSystemsTrigger
Compact entry into RPG systems. Never duplicates Chat 2 story/context navigation.

### RpgSystemsSheet
Mobile BottomSheet / desktop InspectorPanel.
Tabs appear only for populated modules:
- Skills
- Items
- World
- Factions

### RpgAbilityRow
Name -> cost/readiness -> one-line limitation -> details.
No icon-only action.

### RpgStatusStack
At most 3 high-priority states visible. Overflow summarized with +N. Requires explicit state records; otherwise absent.

### RpgItemRow
Name, quantity, equipped marker, optional owner/location secondary text.

### RpgItemDetail
Labeled state fields. Compare panel appears only with explicit comparable data supplied by owner.

### RpgWorldPulse
Maximum three current changes, sorted by source/event priority only if such priority exists. Otherwise preserve runtime order.

### RpgFactionOverview
Name, active conflict/event, alliances/enemies, territory, resources, leadership, goals.

### RpgLocationHeader
Current location only when explicit.

### RpgBattleContext
Context strip, not permanent HUD. Visible only when scene/runtime marks a combat/conflict context.

## Layout
320px: single column; sheet full-width minus canonical gutters.
360–420px: single column with compact inline chips.
>=720px: inspector may become split pane.
Landscape phone: do not increase density automatically; prioritize vertical fit.

## Typography
Primary state >=14px equivalent at default scale.
Metadata may be smaller but must remain legible at 150% font scale.
Arabic labels must wrap; no forced single-line truncation for action names.

## Interaction
48dp target; 44px hard compact floor.
Focus-visible.
Back/Escape returns focus.
No hover-only affordances.

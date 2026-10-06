# INVENTORY_EQUIPMENT_UI

## Direction
**Clean JRPG Mobile × restrained Diablo-like comparison**, without dense desktop grids.

## Current contract
Seven items currently expose `name`, owner/location, `equippedBy`, quantity, consumable, state and tags. No universal rarity/stat schema is guaranteed.

## Mobile structure
- Default: searchable/filterable list only if search/filter already exists in host; otherwise category/grouping from existing tags.
- Optional 2-column visual grid only when item names remain readable.
- Item tap -> bottom detail sheet.
- Equipped marker is text + shape, not color only.
- Quantity is pinned consistently at the logical end.
- Long descriptions never live inside the grid tile.

## Equipment
Use slot UI only when actual slot data exists. With current contract, render “Equipped by <character>” and comparison only for explicit comparable fields in item state. Never invent attack/defense values or recommendation arrows.

## Loot/rewards
- Minor: inline toast/row.
- Important: compact reward sheet.
- Rare: stronger emphasis only if rarity/importance exists.
- Story-critical: narrator-linked story reward treatment.
Importance must come from data/tags, never from random UI styling.

## Crafting/shop
No canonical crafting or economy item contract was verified. Candidate UI is documented but implementation stays gated until recipes/prices/currency/stock are supplied by runtime.

## Anti-density
No 8-column grids, no tiny sockets, no hover-only compare, no color-only rarity, no permanent currency strip.

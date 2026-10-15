# RPG_UI_B_ADAPTER_TEST_CASES

These cases must be converted into automated tests when R07/I01 wires the adapter.

## A — absence does not fabricate
Input: empty `createState({})`.
Expect:
- abilities = []
- items = []
- factions = []
- battle.turnOrder === null
- battle.hp === null
- battle.mp === null
- no synthetic location

## B — ability cooldown
State turn 10; ability cooldownTurns 3; lastUsedTurn 9.
Expect remainingTurns = 2, ready = false.
At turn 12 expect remainingTurns = 0, ready = true unless forbidden.

## C — forbidden ability
Ability forbidden=true.
Expect ready=false when turn is known; UI label includes unavailable reason from canonical field only.

## D — inventory/equipped
Item quantity=4, equippedBy="ali".
Expect quantity preserved exactly, equippedBy visible, no generated rarity/stat score.

## E — faction
Alliance/enemy/resource lists preserve source values and order.
No inferred “neutral” factions.

## F — world pulse
Active events/timeline are bounded for primary UI; opaque nested objects do not become metric cards.

## G — RTL
Adapter output is direction-neutral. No left/right semantics in view models.

## H — mutation safety
Deep compare input before/after projection => identical.

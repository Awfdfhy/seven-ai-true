# MAP_WORLD_UI

## Direction
**Living World × layered map**, with Royal Strategy accents for region state.

## Four questions
Every map state must answer:
1. Where am I?
2. Where can I go?
3. What changed?
4. What matters here?

## Runtime-safe layers
Use only existing `world.locations`, kingdoms/factions, wars, activeEvents, politics/economy/resources and scene location.

### Mobile hierarchy
- Top: current location + region breadcrumb.
- Main: map/graph viewport or location list fallback.
- Bottom: destination/location sheet.
- Optional layer chips: Events / Factions / Conflict only when relevant data exists.
- “World Pulse”: maximum three meaningful recent/active changes before “View all”.

## Location sheet
Name, region if supplied, discovered/locked state if supplied, relevant active event, and existing actions. Do not turn the sheet into lore/wiki.

## Travel
A destination sheet may show requirements, warnings, travel time and route only when supplied. Missing fields are omitted rather than guessed.

## Map fallback
If coordinates/geometry are absent, render a **world graph / region list**. Never fake geographic placement from object iteration order.

## Clutter budget
On a 360px screen, aim for <=5 simultaneous marker categories and <=3 urgent alerts.

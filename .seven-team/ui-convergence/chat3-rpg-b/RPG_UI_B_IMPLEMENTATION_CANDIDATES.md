# RPG_UI_B_IMPLEMENTATION_CANDIDATES

Status: research complete enough for canonical-direction selection; **no shared production UI write performed** because wave rules reserve shared workspace implementation to assigned implementation/integrator owners.

## Candidate 1 — Runtime-safe Systems Drawer (lowest risk)
Read-only adapter over current RPG state:
- Abilities
- Items / equipped state
- Factions
- World Pulse
- Current location

All modules are conditional; absent data = absent module, not zero/fake data.

## Candidate 2 — Battle Context Strip
Only activates when an existing session exposes battle/turn semantics. Until an ordered-turn contract exists, limits itself to active actor/recent event + available abilities.

## Candidate 3 — World/Kingdom bottom sheet
Uses existing world/faction objects with event-first ordering and no charts by default.

## Candidate 4 — Inventory detail sheet
List-first phone UI; item identity/quantity/equipped state; optional state fields rendered as labeled properties.

## Required coordination
- Chat 2: any character identity, relationship, journal/canon/lore control.
- Chat 0 / Integrator: shared RPG workspace DOM, stylesheet ownership, shell tokens and deletion of duplicate styling.

## Evidence gate
Before/after screenshots: 320, 360, 390, 420 widths; portrait + landscape; RTL Arabic; day/night; large text. Then R08 review.

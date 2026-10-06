# Journal / Canon / Codex System

## Architecture
Use one coherent **Story Archive** with multiple views rather than disconnected "Quest", "Lore", "Canon", "Timeline" products.

Recommended views:
- Journal
- Timeline
- Canon / Lore
- Characters
- Knowledge
Only render tabs whose underlying data exists.

## Journal
Hybrid approach:
- chronological story entries as the spine
- active quests/objectives as a focused filter
- related characters/location as metadata
- completed/failed/paused state only when runtime supplies it

A quest card may show:
- objective
- state
- location
- related characters
- dependency/prerequisite
- consequence
**only if each value exists**.

## Timeline
Each event answers:
- What happened?
- When?
- Who was involved?
- What changed?

Default row stays compact.
Expand to reveal provenance, world-state delta, relationship change or canon impact.

## Canon
Canon is an authority system, not decorative lore.
Visually distinguish:
- HARD
- ACTIVE
- SOFT
- RUMOR
- BELIEF
- INFERENCE
But default player-facing copy should use understandable language; raw enum labels may remain in advanced details.

## Lore / Codex reading view
Desktop:
index → article/focus pane.
Mobile:
search/filter list → dedicated reading screen/sheet.

Use strong reading typography; avoid dense cards inside article bodies.

## Knowledge inspection: Who knows what?
This is a distinctive Seven surface.

Player-safe default for a selected fact:
- Confirmed known by
- Believed / suspected
- Not known **only when revealing that absence is safe**
- provenance / learned event when available

Never show omniscient "who has never seen it" lists if that leaks hidden characters or plot.

## Belief vs truth
Truth/canon and character belief use distinct semantic treatment:
- Canon/truth: archive authority treatment
- Belief: character-local quote/annotation treatment
Do not merge them into one badge.

## Bestiary-style views
Allowed only as a presentation pattern for entity/lore collections already represented in runtime data.
Do not invent enemies, HP, weaknesses or discovery percentages.

## Search
Archive search should match titles/names/tags/known text already present.
No new semantic backend is implied by this UI document.

## Mobile / RTL
- one column under 600px
- filters become chips or bottom sheet
- article action toolbar is sticky only when useful
- bidi isolate mixed names/IDs
- timeline stems use logical inline positions

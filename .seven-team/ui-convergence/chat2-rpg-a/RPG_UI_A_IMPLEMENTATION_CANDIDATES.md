# RPG UI A Implementation Candidates

## Status
**Research/synthesis complete enough to propose implementation. Production UI changes are intentionally not started until Chat 0 selects/approves the direction**, per task protocol.

## Recommended direction
Cinematic Narrative × Modern AI × Fantasy.
Ancient Codex is reserved for archive surfaces.
Living World appears only in on-demand detail.

## P0 implementation candidates — existing surfaces/data only

### 1. Story Chat semantic pass
Target: `release/workspaces/rpg.js` plus RPG-owned style only.
- reduce heavy chatbar prominence
- narrator/player/character semantic classes where role can be proven
- hide permanent message copy actions until interaction/focus
- logical RTL properties
- remove hard-coded notice colors in favor of existing Seven tokens
- preserve composer architecture untouched

### 2. Scene context strip
Only bind to fields already present in state/scene contract.
- location
- active characters
- chapter/title when already recorded
- collapse after scene orientation

### 3. Character quick card
Render only existing character state.
- identity
- role if supplied
- locationId if present
- salient traits/goals
- safe relationship summary
No invented mood.

### 4. Relationship focus
Use `RELATIONSHIP_DIMENSIONS` from current RPG state.
- no single heart meter
- no directional claims beyond current symmetric v1 model
- recent change/reason only when provenance exists

### 5. Story Archive shell
Unify existing journal/canon/lore/knowledge/timeline data into a presentation architecture.
Do not create new state storage.

### 6. Knowledge inspector
Map character-local known facts/beliefs with spoiler-safe filtering.
Debug omniscience remains advanced only.

## P1 candidates
- cast overview
- timeline grouping
- canon authority detail
- quest focus cards
- consequence inline callout
- memory/canon provenance inspector

## Explicit non-candidates
- HP bars
- weather widget
- combat stats
- invented "mood"
- faction graph if the active session has no faction data
- hidden relationship revelation
- new persistence schema
- any change to global design tokens without Chat 4 / Integrator coordination

## Deletion targets after implementation approval
Current RPG styling contains several legacy patterns worth replacing rather than layering over:
- title/control-heavy top chatbar
- always-visible per-message copy affordance
- hard-coded physical directional spacing
- hard-coded success/warn/error colors
- dense title/import drawer as a primary RPG-facing surface

Removal must happen in the same implementation commit as the replacement to avoid CSS stacking.

## Validation matrix
Required:
- 320×800, 360×800, 390×844, 420-class portrait
- 800×360 landscape
- LTR + Arabic RTL
- day + night
- 150% text
- keyboard open
- reduced motion

Semantic review scores (1–5):
- narrative readability
- immersion
- character identity
- hierarchy
- density
- emotional tone
- mobile comfort
- discoverability
- consistency
- RTL
- accessibility

Pass threshold:
- no category below 4/5
- "looks like real RPG" = yes
- "still easy like chat" = yes

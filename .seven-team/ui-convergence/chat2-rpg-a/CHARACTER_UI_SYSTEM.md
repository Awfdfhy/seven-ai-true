# Character UI System

## Goal
Make characters feel like persistent people, not rows in a database.

## Runtime-backed fields
Seven architecture currently supports identity, age when present, personality, goals/fears/preferences, abilities, inventory, location, emotions, secrets, beliefs, knowledge, history, loyalties/opinions, intent and control mode. Rendering must check field presence before showing it.

## Three disclosure levels

### 1. Story identity
Always-lightweight:
- avatar/portrait **only when available**
- character name
- optional role/subtitle when present
- no persistent stat cluster

### 2. Quick character card
Opened by tap/focus:
- identity / role
- current location if available and relevant
- 2–4 salient traits/goals
- relationship summary to player if inspectable
- recent relevant event
- shortcut to full sheet

### 3. Full character sheet
Sections in priority order:
1. Identity
2. Current story state
3. Traits / motivations
4. Relationships
5. Knowledge / beliefs
6. Abilities / inventory links if present
7. Recent events / history

Never present all fields as a spreadsheet.

## Mobile composition
- 320–420px: bottom sheet; portrait thumbnail, not hero art by default.
- desktop: centered/focus panel or split detail pane.
- use sticky section nav only if content length justifies it.
- large-text mode collapses metadata into one column.

## Identity patterns
Preferred order:
- Name
- role/context
- story text
Optional cues such as location or control mode appear only when they matter to the current scene.

## Character state
Do not synthesize a single "mood" from emotion dimensions unless the runtime explicitly provides a label. If emotion data is inspectable, show the strongest relevant dimensions in detail view with provenance/recent cause where available.

## Party / cast
Cast presentation is scene-sensitive:
- Active cast: compact horizontal/scrollable identities or list.
- Wider cast: searchable list grouped by story relevance.
- Never keep a permanent portrait rail on 320px Story Chat.

## Anti-spreadsheet rules
- maximum one compact metric row above the fold
- use prose labels and event history for relationships/emotions
- keep numerical precision out of default view
- prefer "changed because…" over raw +0.2 where provenance exists

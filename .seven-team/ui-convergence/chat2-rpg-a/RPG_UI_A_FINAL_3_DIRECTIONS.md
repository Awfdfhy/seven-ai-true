# RPG UI A — Final 3 Directions and Integrator Decision

## Direction A — Cinematic Narrative × Modern AI × Fantasy
Story is dominant. Narrator/character identity is readable without wrapping every turn in game cards. Context appears only when requested or when scene state changes.

Strengths:
- strongest fit for AI conversation + RPG;
- best mobile/RTL compatibility;
- keeps Seven recognizably conversational;
- lowest clutter risk.

Risk:
- over-decoration would immediately destroy the concept.

## Direction B — Royal Minimal × Ancient Codex
Clean royal hierarchy in story surfaces; archive/canon/lore can become more authored and archival.

Strengths:
- strong identity;
- excellent for canon/journal;
- supports Arabic typography well when ornament is limited.

Risk:
- too much codex treatment in the chat stream makes ordinary conversation heavy.

## Direction C — Living World Contextual
Scene/cast/world changes become contextual state surfaces. Nothing permanent unless the runtime has meaningful state to show.

Strengths:
- exposes Seven's persistent-world advantage;
- supports future systems surfaces cleanly;
- bridges cleanly to Chat 3 RPG-B.

Risk:
- easiest direction to accidentally turn into a permanent dashboard.

## Integrator decision
Chat 0 selected:
- **Direction A** for Story Chat;
- **Direction B / Ancient Codex** for archive/canon;
- **Direction C / Living World** only for conditional systems surfaces.

## Implementation consequence
Chat 2 implemented Direction A and the lightweight part of Direction C in `release/workspaces/rpg.js`.

No global token system, archive inspector, relationship inspector, battle UI or systems dashboard was independently created.

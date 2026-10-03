# Team B / B06 / Aider Live Runtime Smoke Test

## Identity

Team B / B06 / Aider

## B06 mission

Validate RPG V2’s persistent 10-minute story, character-local knowledge, world-state continuity, and safe migration without requiring a JSON pack import. Confirm that a meaningful choice is available within three visible actions, changes subsequent world state and narration, and remains intact after exit and re-entry. Character B must not learn information revealed only to Character A.

## Memory and persistence risks

1. Character-local knowledge could leak into another character or the global context.
2. World state could be lost or corrupted during exit, re-entry, or upgrades.
3. Migration could overwrite valid state, weaken knowledge boundaries, or fail silently.

## Branch

agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

# Team B / B06 / Aider Live Runtime Smoke Test

## Identity

Team B / B06 / Aider

## B06 mission

Rebuild RPG V2 around a compelling persistent 10-minute interactive-story vertical slice. Validate that a meaningful choice is available within three visible actions, changes subsequent world state and narration, survives exit and re-entry, and preserves character-local knowledge. Character B must not learn information revealed only to Character A.

## Memory and persistence risks

1. Character-local knowledge could leak into another character or the global context.
2. World state could be lost or corrupted during exit, re-entry, or upgrades.
3. Migration could overwrite valid state, weaken knowledge boundaries, or fail silently.

## Branch

agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

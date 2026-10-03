# Team B / B06 / Aider Live Runtime Smoke Test

## Identity

Team B / B06 / Aider

## B06 mission

Validate RPG V2 memory and continuity: without a JSON pack import, a meaningful choice must appear within three visible actions, change world state and later narration, survive exit and re-entry, and keep character-local knowledge isolated.

## Memory and persistence risks

1. Character-local knowledge could leak into another character or global context.
2. World state could be lost or corrupted during exit, re-entry, or upgrades.
3. Migration could overwrite valid state, weaken knowledge boundaries, or fail silently.

## Branch

agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

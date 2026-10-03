# Team B / B06 / Aider — Live Runtime Smoke Test

## Identity
Team B / B06 / Aider

## B06 Mission
Validate RPG V2’s persistent 10-minute interactive story, ensuring meaningful choices change world state within three visible actions, later narration reflects those changes, and state survives exit and re-entry without a JSON pack import while preserving character-local knowledge boundaries.

## Memory and Persistence Risks
1. Character-local knowledge could leak across characters or be written into shared state.
2. World-state changes could be lost, corrupted, or fail to restore after session re-entry.
3. State migrations could overwrite valid state, weaken knowledge isolation, or fail silently.

## Branch
agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

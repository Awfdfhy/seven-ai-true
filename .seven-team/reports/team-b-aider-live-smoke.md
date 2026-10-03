# Team B / B06 / Aider — Live Runtime Smoke Test

## Identity
Team B / B06 / Aider

## B06 Mission
Validate RPG V2’s persistent 10-minute story slice: within three visible actions, a meaningful choice changes world state, later narration reflects that change, and state survives exit and re-entry without a JSON pack import. Confirm knowledge revealed only to Character A remains inaccessible to Character B.

## Memory and Persistence Risks
1. Character-local knowledge may leak across characters or enter shared state.
2. World-state changes may be lost or corrupted during persistence or session re-entry.
3. Migrations may overwrite valid state, weaken knowledge isolation, or fail silently.

## Branch
agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

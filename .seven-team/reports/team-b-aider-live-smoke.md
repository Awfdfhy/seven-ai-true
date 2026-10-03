# Team B / B06 / Aider — Live Runtime Smoke Test

## Identity
Team B / B06 / Aider

## B06 Mission
Validate that RPG V2 delivers a meaningful choice within three visible actions, changes persistent world state, reflects that change in later narration, and preserves it across exit and re-entry without a JSON pack import. Verify that Character B cannot access information revealed only to Character A.

## Memory and Persistence Risks
1. Character-local knowledge may leak across characters or into shared state.
2. World-state changes may be lost or corrupted during persistence or session re-entry.
3. Migrations may overwrite valid state, weaken knowledge isolation, or fail without detection.

## Branch
agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

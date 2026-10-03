# Team B / B06 / Aider — Live Runtime Smoke Test

## Identity
Team B / B06 / Aider

## B06 Mission
Validate RPG V2’s 10-minute persistent interactive story: a meaningful choice must change world state within three visible actions, later narration must reflect that change, and state must survive exit and re-entry without a JSON pack import. Information revealed exclusively to Character A must remain inaccessible to Character B.

## Memory and Persistence Risks
1. Character-local knowledge may leak across characters or be incorrectly stored in shared state, violating knowledge boundaries.
2. World-state changes may be lost, corrupted, or fail to load during persistence or session re-entry.
3. State migrations may overwrite valid state, weaken knowledge isolation, or fail silently.

## Branch
agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

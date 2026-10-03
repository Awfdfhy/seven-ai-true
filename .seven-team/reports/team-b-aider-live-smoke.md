# Team B / B06 / Aider — Live Runtime Smoke Test

## Identity
Team B / B06 / Aider

## B06 Mission
Validate that RPG V2’s 10-minute persistent interactive story slice functions correctly: a meaningful player choice must alter the world state within 3 visible actions, subsequent narration must reflect that state change, and the modified state must persist across session exit and re-entry without requiring a JSON pack import. Additionally, confirm that information revealed exclusively to Character A remains completely inaccessible to Character B.

## Memory and Persistence Risks
1. Character-local knowledge may leak across characters or be incorrectly stored in shared state, breaking intended knowledge boundaries.
2. World-state changes may be lost, corrupted, or fail to load correctly during persistence operations or session re-entry.
3. State migrations may overwrite valid existing state, degrade knowledge isolation between characters, or fail silently without producing errors.

## Branch
agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

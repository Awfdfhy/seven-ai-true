# Team B / B06 / Aider Live Runtime Smoke Test

## Identity
Team B / B06 / Aider

## B06 Mission
Validate RPG V2's persistent memory and narrative continuity for a compelling 10-minute interactive-story vertical slice. Confirm that meaningful player choices alter world state, appear in subsequent narration, and survive session exit/re-entry without requiring a JSON pack import.

## Memory and Persistence Risks
1. Character-local knowledge may leak across characters or into shared global state, violating knowledge boundaries.
2. World-state changes may be lost or corrupted during persistence, exit/re-entry, or system upgrades.
3. Migrations may overwrite valid state, weaken knowledge isolation, or fail silently without detection.

## Branch
agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

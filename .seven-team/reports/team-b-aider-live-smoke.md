# Team B / B06 / Aider — Live Runtime Smoke Test

## Identity
Team B / B06 / Aider

## B06 Mission
Validate RPG V2’s persistent memory and narrative continuity for a compelling 10-minute interactive-story vertical slice. Confirm that a meaningful player choice changes world state, appears in later narration, and survives session exit and re-entry without a JSON pack import.

## Memory and Persistence Risks
1. Character-local knowledge may leak across characters or into shared global state, violating knowledge boundaries.
2. World-state changes may be lost or corrupted during persistence, session exit/re-entry, or system upgrades.
3. Migrations may overwrite valid state, weaken knowledge isolation, or fail silently without detection.

## Runtime Smoke Test Criteria
- Happy path: no JSON pack import; reach a meaningful story turn within three visible actions.
- Required behavior: one meaningful choice changes world state, later narration reflects it, and state survives exit and re-entry.
- Knowledge boundary: Character B must not automatically know information revealed only to Character A.
- Cross-team rule: no file may be actively edited by both teams; shared-core writes require a manager lease.
- Release gate: functional, experience, integration, and evidence checks pass, followed by independent review.

## Branch
agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

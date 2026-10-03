# Team B / B06 / Aider Live Runtime Smoke Test

## Identity
Team B / B06 / Aider

## B06 Mission
Validate that RPG V2 maintains persistent memory and narrative continuity without requiring a JSON pack import. The system must demonstrate meaningful player choices that alter world state, are reflected in subsequent narration, and survive session exit/re-entry. Additionally, character-specific knowledge must remain isolated between characters to prevent information leakage.

## Memory and Persistence Risks
1. Character-local knowledge could inadvertently leak into another character's context or global shared state, breaking narrative isolation.
2. World state changes could be lost or corrupted during session persistence, exit/re-entry cycles, or system upgrades.
3. Data migration processes could overwrite valid state, weaken knowledge boundaries, or fail silently without detection.

## Branch
agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

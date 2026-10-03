# Team B / B06 / Aider Live Runtime Smoke Test

## Identity

Team B / B06 / Aider

## B06 mission

Ensure RPG V2 preserves character-local knowledge and world-state continuity throughout its 10-minute interactive story. The happy path must require no JSON pack import, deliver a meaningful choice within three visible actions, reflect that choice in later narration, survive exit and re-entry, and maintain strict knowledge boundaries.

## Memory and persistence risks

1. Character-specific knowledge could leak into unrelated characters or global context.
2. State could be lost, corrupted, or become unreadable after exit, re-entry, or upgrades.
3. Migration could overwrite valid state, broaden knowledge boundaries, or fail silently.

## Branch

agent-b/06-rpg-memory

LIVE_AGENT_SMOKE=PASS

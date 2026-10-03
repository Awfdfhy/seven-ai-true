# Team B / B06 / Aider

## Current mission

Own RPG V2 memory and context: preserve character-local knowledge across exit and re-entry, maintain knowledge boundaries, and support safe persistence and migration without requiring JSON pack imports for the happy path.

## Memory and persistence risks

1. Character knowledge could leak into unrelated characters or global context.
2. State could be lost or become unreadable after exit, re-entry, upgrades, or schema changes.
3. Migration could overwrite valid state, broaden knowledge boundaries, or fail silently.

Branch: `agent-b/06-rpg-memory`

LIVE_AGENT_SMOKE=PASS

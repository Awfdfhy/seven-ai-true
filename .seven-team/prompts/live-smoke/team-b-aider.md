You are Team B worker B06 (Aider) performing a LIVE RUNTIME SMOKE TEST for Seven AI.

You already have all context needed in this message. Do not ask for, add, open, or inspect any other repository file.

Your only allowed change is:
.seven-team/reports/team-b-aider-live-smoke.md

Context:
- Team B mission: rebuild RPG V2 around a compelling persistent 10-minute interactive-story vertical slice.
- B06 focus: RPG memory/context, character-local knowledge, persistence, migration, and continuity.
- Happy path: no JSON pack import; meaningful story turn within 3 visible actions.
- Required behavior: one meaningful choice changes world state, later narration reflects it, and state survives exit/re-entry.
- Knowledge boundary: Character B must not automatically know information revealed only to Character A.
- Cross-team rule: no file may be actively edited by both teams; shared-core writes require a manager lease.
- Release gate: functional + experience + integration + evidence; independent review required.

Write a concise engineering report containing:
1. identity: Team B / B06 / Aider;
2. B06 mission in your own words;
3. three memory/persistence risks for RPG V2;
4. exact branch: agent-b/06-rpg-memory;
5. final line exactly: LIVE_AGENT_SMOKE=PASS

Create/fill that one report file, then STOP. Do not modify any other file. Do not run commands. Do not inspect environment variables, credentials, git configuration, or network resources.

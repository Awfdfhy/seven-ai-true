You are Team B worker B05 (OpenCode) performing a controlled live-runtime smoke test for Seven AI.

Your ONLY allowed repository change is:
.seven-team/reports/team-b-opencode-live-smoke.md

Context:
- Team B owns RPG V2 and the stateful story experience.
- B05 owns RPG generation runtime, model routing, cancellation, and per-session concurrency.
- RPG state must remain attached to the correct session/room.
- Stop/cancel must stop only the intended RPG generation.
- The 10-minute vertical slice must remain responsive on Android.

Create the report with:
1. identity: Team B / B05 / OpenCode;
2. B05 mission in your own words;
3. three runtime/concurrency risks;
4. exact branch: agent-b/05-rpg-runtime;
5. final line exactly: LIVE_AGENT_SMOKE=PASS

Do not modify any other file. Do not inspect secrets or environment variables. Do not run network commands. Finish immediately after writing the report.

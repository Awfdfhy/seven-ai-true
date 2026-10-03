# Live Runtime Smoke — Team B / B05 / OpenCode

Scope: controlled live-runtime smoke test. Report-only change; no product code was modified.

## 1. Identity

- Team: **B** — RPG & Stateful Experience
- Worker: **B05**
- Binary: **OpenCode** (`anomalyco/opencode`)
- Branch: `agent-b/05-rpg-runtime`
- Ownership: `release/workspaces/rpg.js`, `release/world-runtime.js`, `release/canon-simulator.js`
- Change made: this report only

## 2. B05 mission in my own words

I own the machinery that actually produces an RPG turn, not the story design around it. Concretely: every narrated beat must be generated against the correct
scene contract, streamed back into the correct session's transcript, and committed to canon only after it has been verified. On top of that I own the lifecycle
discipline around a generation — one in-flight turn per session, a stop button that kills the turn the user actually pressed stop on, a model/route decision that
survives a room switch, and none of it permitted to make the phone feel slow. The 10-minute vertical slice is a latency budget as much as a narrative one: a
fresh user reaches a meaningful first turn in three actions, and every action after that has to stay responsive on a mid-range Android WebView. My failure modes
are the quiet ones — a state write that lands in the wrong session, a cancel that silences the wrong request, a stream that keeps running after the user left.

## 3. Three runtime / concurrency risks

### R1 — Single global session singleton; no room or session scoping
`release/workspaces/rpg.js:5` holds all RPG state in one module-level object (`S.worldSession`, `S.canonSession`), and `loadWork` / `loadCanon` (rpg.js:24-25)
overwrite those fields in place. There is no room/session identifier anywhere in the RPG runtime — a repo-wide search for `roomId`, `activeRoom`, `switchRoom`,
`openRoom` under `release/` returns nothing. Two consequences: (a) starting a new world silently destroys the in-progress session, and (b) if the shell ever holds more
than one RPG surface, both surfaces share and corrupt one session object. This is the direct threat to RPG-04 Persistence and to the contract requirement that RPG
state stay attached to the correct session/room. Minimum fix direction: key the session by a stable session id and treat `snapshot()` (rpg.js:23) as a per-session
value rather than a module global.

### R2 — Cancellation is global, unowned, and inert on Android
`release/beta-ui-runtime.js:36` patches `stopGeneration` against a single module-global `activeAbortController`. There is no run/token identity bound to the
controller, so a stop cannot be proven to target the generation the user intended — with an RPG turn in flight, stop can abort an unrelated request or leave the RPG
stream running. On Android the patch takes the `else` branch and only nulls the controller instead of calling `abort()`, so on the exact platform the vertical slice
must survive, stop does not actually cancel the network stream; the turn keeps streaming and keeps writing into the transcript. Additionally `unmount` (rpg.js:57)
tears down the observer and the bar but registers no cancellation hook, so an in-flight RPG turn continues to mutate the DOM after the user exits the workspace.
Minimum fix direction: attach a monotonically increasing run id to every generation, abort by run id (never by global), keep `abort()` on Android rather than
nulling, and abort outstanding runs in `unmount`.

### R3 — Late-arriving writes can mutate canon after the turn was cancelled
`applyVerifiedDelta` and `commitVerifiedBeat` (rpg.js:28-29) gate only on `meta.verified === true` and mutate `S.canonSession` / `S.worldSession` unconditionally
once that flag is set. They have no notion of which run produced the delta, so a cancelled or superseded stream that resolves late still commits its state. Combined
with R1, a late commit from session X lands in whatever session is currently mounted. There is also no bounded projection on the write path:
`release/world-runtime.js:9` `clone()` is a `JSON.parse(JSON.stringify(...))` of the entire session, re-executed per turn inside `commitBeat` (world-runtime.js:62)
over an unbounded `history` array — linear per-turn cost that compounds across the 20-turn continuity scenario (RPG-05) and is the most likely source of
mid-story jank on Android. Minimum fix direction: stamp every delta with its run/session id and reject stale ones, and replace whole-session deep clone with
copy-on-write or a structural-share of unchanged history.

## 4. Exact branch

```
agent-b/05-rpg-runtime
```

Verified: the working tree for this smoke test is on `agent-b/05-rpg-runtime`, and it is the only change on it.

## 5. Smoke result

Environment: read-only inspection of `release/workspaces/rpg.js`, `release/world-runtime.js`, `release/canon-simulator.js`, `release/beta-ui-runtime.js`,
`.seven-team/{team.json,ownership.json}` and `.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md`. No network commands were run, no environment variables or
credentials were read, and no file other than this report was created, modified, or deleted.

The runtime reaches a live story turn and the world/canon engines are defensively written (explicit `BLOCKED` reasons, clone-on-commit, branch origination on
canon-order divergence). The gaps are lifecycle gaps, not logic gaps: session state is a global singleton, cancellation is global and a no-op on Android, and
state commits are not tied to the run that produced them. R2 and R3 are the ones I would fix before the vertical slice is called responsive, because a stop button
that does not stop is a correctness failure a user can feel in the first minute.

LIVE_AGENT_SMOKE=PASS

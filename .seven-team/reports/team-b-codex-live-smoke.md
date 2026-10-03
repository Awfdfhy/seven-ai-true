# Team B Live Runtime Smoke — B02 (Codex CLI)

Classification: CONTROL-PLANE SMOKE (no product code touched)
Branch: `agent-b/02-android-rpg`
Date: 2026-10-03

## 1. Identity

- Team: B — RPG & Stateful Experience
- Worker: B02
- Runtime: Codex CLI (headless coding agent)
- Role per `.seven-team/team.json`: Android RPG evidence, WebView persistence, APK/device RPG regressions
- Write scope for this smoke: this report file only

## 2. B02 mission in my own words

I own the proof that RPG V2 actually survives contact with a real Android device.
The vertical slice is not done when the engine works in a desktop browser; it is
done when a player starts a story on a phone, walks away, force-closes the app,
comes back, and finds the same world, the same character states, and the same
scene still waiting for them. My job is to capture that as evidence — WebView
persistence, exit/re-enter and process-restart behavior, and a screenshot matrix
for the RPG surface at the smallest supported viewport under Arabic RTL and night
theme — and to report device regressions with enough detail (screen, state before,
state after, build id) that a fix can be located without guessing. Where a
persistence fix requires touching shared core (`release/world-runtime.js`,
`release/canon-simulator.js`, `release/workspaces/rpg.js` are leased to Team B;
`release/workspaces/seven-shell*.js`, `hub.js`, UI CSS, and the shared
`sharedReadOnlyByDefault` set are not), I request a manager lease in
`.seven-team/ownership.json` before editing rather than writing unilaterally.

## 3. Three Android RPG persistence / lifecycle risks

**Risk 1 — WebView storage is not durable by default.**
Capacitor/WebView `localStorage` is only durable when the app process is allowed
to flush it, and it can be cleared by the OS under storage pressure, "clear cache",
or app-data eviction. RPG-04 (exit/re-enter) can pass in an emulator while
failing on a low-storage device, because a memory-only store looks identical to a
durable one until the process is reclaimed. Evidence needed: a real device run
with app restart, plus an explicit note on what survives when the WebView data
partition is purged.

**Risk 2 — Lifecycle callbacks write state on the way out, racing teardown.**
`pause` / `stop` / `destroy` ordering differs across Android versions and OEM
skins. A save fired from a lifecycle hook can be interrupted by WebView
destruction, or fire after an in-flight generation has already advanced state,
producing a save that is either truncated or one turn stale. The classic symptom
is "my last turn is missing after I swipe-killed the app" — the session looks
restored, but the final narration beat and the state mutation from it are gone,
which also breaks RPG-02 (consequence visible in later narration). B02 must
reproduce with a mid-generation kill and inspect restore position, not just
"did it open."

**Risk 3 — Small Android viewport + Arabic RTL + night theme regress the RPG
surface (RPG-07) and its composer.**
RTL mirroring plus long Arabic strings plus night-theme token contrast is a
triple interaction: a fixed-width story column, a composer whose send/attach
control flips to the wrong side, and a horizontally scrolling timeline that
hides earlier scenes behind an off-screen affordance. Evaluation Gate A requires
no horizontal overflow at supported widths and functional RTL + day/night; Gate D
requires an Android WebView screenshot set for UI-affecting changes. Without that
matrix, "usable" is an assertion, and a clipping bug ships green.

## 4. Branch

`agent-b/02-android-rpg`

## 5. Smoke result

Agent booted, read the control-plane contracts (`.seven-team/team.json`,
`TWO_TEAM_PROTOCOL.md`, `cohesion/RPG_V2_PRODUCT_CONTRACT.md`,
`cohesion/EVALUATION_GATE.md`), confirmed the checked-out branch matches the
assigned worker branch, and produced exactly one file: this report. No product
files, no shared-core writes, no leases requested or assumed.

LIVE_AGENT_SMOKE=PASS

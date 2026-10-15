# Independent RPG UX Review — Post-Implementation Static Pass

Role: R04 — independent reviewer
R04 did not author fixes in this review.

## Scope reviewed
- current `release/workspaces/rpg.js`
- RPG-specific assertions in `release/release-verify.cjs`
- `release/rpg-ui-a.test.cjs`
- canonical `ui-foundation.css`
- Chat 0 component ownership and selected RPG direction
- Chat 3 component boundary

## Static findings

### Narrative readability — PASS candidate
The specialized RPG layer no longer requires a Titles-first control hierarchy. Story Context is the primary affordance and long assistant turns receive a reading-rhythm adjustment without converting each message into a card.

### Immersion — PASS candidate
World/scene identity can now be presented from actual persisted state. Engine-oriented pack/title tools are progressively disclosed.

### Character identity — PASS candidate
Active scene characters are visible as compact identity chips. Quick view exposes only story-safe identity/location/age/status fields when present.

### Hierarchy — PASS candidate
Default hierarchy is now:
story → scene context on demand → character quick view → advanced tooling.

### Density — PASS candidate
No permanent relationship graph, character sheet, archive panel, or systems dashboard was added.

### Spoiler safety — PASS candidate
Relationship, belief and local-knowledge internals are not dumped into the quick card. The quick view explicitly preserves a boundary for deeper state.

### RTL / tokens / accessibility — PASS candidate
- logical CSS is used for new directional behavior
- canonical muted token is consumed
- 44px canonical touch floor is consumed
- focus-visible styling exists
- reduced-motion behavior remains

## Remaining risks
1. CSS/geometry still requires actual 320/360/390/420 rendering.
2. Character names with extreme Arabic/Latin mixed text need screenshot review.
3. 8-character scene cast at 150% text may produce tall wrapping; this is acceptable only if the composer remains reachable.
4. The global shell still suppresses title-specific controls; this is currently compatible because those controls are advanced/debug, but integration must verify no confusing empty space.
5. No Android WebView evidence exists on the exact head.
6. No keyboard-open evidence exists.

## Two-question gate
- Does the source architecture now support an RPG-looking story surface? **Yes, provisionally.**
- Is it still chat-simple by default? **Yes, provisionally.**

## Final verdict
**NOT READY — VISUAL EVIDENCE REQUIRED.**

Static design/contract review no longer finds a P0 conceptual blocker in the Chat 2 story surface. Final approval requires screenshot/device evidence and exact-head regression success.


## Executable visual evidence matrix prepared
The release verifier now contains an RPG UI A matrix that will run automatically after the global static budget gate passes.

Coverage:
- 320 / 360 / 390 / 420 px
- LTR + Arabic RTL
- day + night
- default drawer closed
- Story Context open
- advanced tools remain collapsed
- no per-message RPG copy affordance
- document/bar/drawer overflow
- 44px story trigger touch floor
- screenshot output for all 16 mobile combinations
- 150% text screenshot
- 800×360 landscape screenshot
- 390×430 keyboard-height screenshot

Expected evidence directory: `dist/rpg-ui-a-evidence/` with 19 screenshots + manifest.

Current limitation: `release/static-audit.cjs` executes before release browser verification and currently blocks at the shared hot-layer budget. Therefore these screenshots are **prepared but not yet produced** on the exact head; R04 must not mark them PASS until actual files exist.

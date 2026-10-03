# Live Runtime Smoke Test — Team B / B04

- **Team:** B
- **Worker:** B04
- **Agent:** OpenHands
- **Branch:** `agent-b/04-rpg-engine`
- **Scope:** RPG V2 engine + 10-minute vertical slice

---

## 1. B04 mission

Own the RPG V2 engine and the 10-minute vertical slice: make RPG feel like a persistent
interactive-story engine instead of a set of infrastructure controls. Concretely, a fresh user
must reach a meaningful first story turn in at most 3 visible actions with no JSON or canon pack
import on the primary path. One meaningful choice must actually mutate world state, and later
narration must be observably different because of it — state that exists internally but is
invisible in the prose is a failure, not a feature. State must survive exit and re-entry, and
character-local knowledge must stay character-local. I stay inside the Team B lease
(`release/workspaces/rpg.js`, `release/world-runtime.js`, `release/canon-simulator.js`) and raise
a requirement rather than edit any shared-core path.

## 2. Three RPG-engine integration risks

### Risk 1 — The start path is pack-gated, so the <=3-action budget is structurally unreachable

`release/workspaces/rpg.js:24-25` exposes only `loadWork(pack, opts)` and `loadCanon(pack, opts)`
as ways into the engines; both throw unless a caller-supplied pack and the `SevenWorld` /
`SevenCanon` runtimes are already present. There is no continue-vs-new selector, no defaultable
new-world flow, and no boot path that synthesizes a minimal world. The engine therefore cannot
open a story on its own — a fresh user cannot reach turn one in 3 actions, because action one is
supplying a pack. This is the contract's explicit failure condition "requires importing a JSON
pack for the primary flow," and it is the highest-probability breakage of RPG-01.
Mitigation: add a zero-config `startNew()`/`resume()` pair in the leased `rpg.js` that mints a
default world and treats pack import as advanced/debug surface only.

### Risk 2 — Mutation is committed but never guaranteed to reach the narration

`applyVerifiedDelta` (`rpg.js:26`) and `commitVerifiedBeat` (`rpg.js:27`) do persist verified
changes, but `release/world-runtime.js` contains no context-projection, banned-fact, or
contradiction-suppression logic — `currentContract()` -> `sceneContract(session)` is the only
thing carried forward to the next turn. So a world mutation can be stored correctly and still be
absent from the prompt that generates the next message, producing narration that ignores the very
choice the user just made. That is precisely the contract's "story state exists internally but is
not perceptible in subsequent narration" failure (RPG-02), and it degrades silently — nothing in
the engine can tell a correct turn from a drifted one.
Mitigation: compile a bounded, provenance-tagged context projection per turn inside
`world-runtime.js`, including mutated variables and the facts a given character is not allowed to
use.

### Risk 3 — Persistence and knowledge boundaries are host-dependent, and knowledge failures fail silently

`snapshot()` (`rpg.js:23`) serializes `work`, `worldSession`, `canonPack`, and `canonSession`,
but no persistence layer exists in the leased scope — no `localStorage`, `sessionStorage`, or
IndexedDB write anywhere in `rpg.js`. Restoration on re-entry is entirely the host's
responsibility, so RPG-04 holds only if some shared-core caller remembers to snapshot on
`unmount` and rehydrate on `mount`. That file is read-only shared core, so B04 cannot fix the gap
directly and must raise it for a manager lease.

The knowledge model itself is in better shape: `canon-simulator.js:72,85-86,143-144,168-175`
scopes facts per `session.knowledge[characterId]` and blocks `future-knowledge` via
`availableAt`/`horizon`, auditing to PASS/FAIL. The weakness is how the failure is handled —
`aura()` (`rpg.js:22`) collapses a `characterKnowledge` FAIL, invariant FAIL, or at-risk anchor
into a single cosmetic `SevenAurora.set('warning','medium')` call. A knowledge-boundary violation
therefore produces a mood ring rather than a surfaced, block-repaired contradiction, which
contradicts RPG-06 and lets a leak from one character into another's dialogue pass review.
Mitigation: promote knowledge and invariant failures to an explicit surfaced/block-repair path in
the engine, and request a lease for the rehydration path if the host proves not to persist.

## 3. Verification notes

Reviewed read-only: `rpg.js` (58 lines), `world-runtime.js` (102), `canon-simulator.js` (187),
`.seven-team/cohesion/RPG_V2_PRODUCT_CONTRACT.md`, `.seven-team/ownership.json`,
`.seven-team/TWO_TEAM_PROTOCOL.md`. No file outside this report was modified; no network calls
were made; no credentials or environment variables were read. The active Team B lease already
covers the three engine files above, so no additional manager lease is required for the vertical
slice itself.

## 4. Result

Identity, mission, and risk analysis confirmed against the live working tree on the required
branch. Smoke test complete.

LIVE_AGENT_SMOKE=PASS

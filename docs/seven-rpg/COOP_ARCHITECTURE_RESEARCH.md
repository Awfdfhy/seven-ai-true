# Seven RPG — Co-op Multiplayer Architecture Research (RPG-15-02)

Status: RESEARCH / ARCHITECTURE ONLY — no code shipped. Satisfies roadmap item **RPG-15-02 "co-op architecture research only"**.
Date: 2026-10-13
Repository: Awfdfhy/seven-ai-true · Branch: `rpg/standalone-20261011`
Scope: P3 / Advanced Future. This document is the deliverable; per the roadmap this item is explicitly research-scoped, so it is marked VERIFIED on delivery of a grounded design, not on an implementation.

---

## 1. Goal and non-goals

**Goal.** Determine the smallest safe way to let **2–4 players share one campaign session** on the existing standalone Seven RPG runtime, reusing the current event-sourced state machine, canon-authority rules, and optimistic-concurrency persistence — without weakening single-player guarantees (player agency, HARD canon, knowledge isolation).

**Non-goals (explicitly out of scope for this research).**
- Real-time action sync / twitch gameplay. This is a *turn-based, narrative* RPG; co-op means *shared authorship of a session*, not frame sync.
- Accounts, matchmaking, global servers, or any hosted backend. The standalone app is local-first; research must be feasible without a required server.
- Merging to `main`, changing secrets, or altering shared gates.

**Definition of "co-op" here.** Two or more *human* participants (and/or one acting as narrator/GM) drive the same session. Each controls a disjoint set of player characters; the world, canon, and NPCs stay authoritative. The runtime remains the referee.

---

## 2. Current architecture (what already exists — the foundation)

The co-op design is deliberately shaped by primitives that **already ship and are tested**:

| Primitive | Where | Relevance to co-op |
|---|---|---|
| **Event-sourced state** — `applyEvent(state, event)` is the *only* mutation path; every change is an event that increments `state.revision` and appends a record with `provenance {source, authority, transformation}` | `release/workspaces/rpg-state.js` (L99–100, L129+) | Co-op is naturally "shared append-only event log". No new sync primitive needed for *state convergence*. |
| **Optimistic concurrency** — `persist(..., {persistedRevision})` fails with `status:'CONFLICT'`, `reason:'stale-session'`, returning `currentRevision` | `release/workspaces/rpg-session.js` (L94–97) | This is a ready-made **conflict detector**. Two players editing the same tick collide here and are rejected deterministically, not silently overwritten. |
| **Control modes** — `CONTROL_MODE = {PLAYER, AI, SHARED, NARRATOR}` | `rpg-state.js` (L11) | `SHARED` already exists. Co-op reuses it rather than inventing a mode. |
| **Shared-control consent gate** — `if (control===SHARED && source!=='user' && requiresPlayerConsent===true) → block('shared-control-consent')` | `rpg-state.js` (L106–107) | A **consent checkpoint for co-op already exists in the state machine**. The design extends it from "AI needs consent" to "peer needs consent". |
| **Player-agency hard lock** — `event.source==='user'` required for `PLAYER` control | `rpg-state.js` (L106) | Preserves the "no AI overrides a human" guarantee per-character, which maps cleanly to "player A cannot puppet player B's character". |
| **Canon authority** — `CANON_LEVEL = {RUMOR:0, SOFT:1, ACTIVE:2, HARD:3}`; higher canon cannot be contradicted by lower; `supersedes` chains | `rpg-state.js` (L10, canon entries) | Co-op must not let one player rewrite HARD canon. Authority ranking is the arbitration rule. |
| **Knowledge isolation** — `canCharacterKnow(state, characterId, factId, atTick)` gates what each character may know | `rpg-state.js` (L83–90) | Becomes the **per-player fog-of-war** rule: player A only sees what their controlled characters can know. |
| **Replay read-only** — `createReplaySession` / `getReplayState` reconstruct state at any index; `mutateReplayState` is a hard read-only guard | `rpg-player-tools.js` (RPG-02-12) | Replays of shared sessions are already safe to spectate. Spectator mode is free. |

**Key insight.** Seven RPG is *already* an event-sourced, revision-checked, provenance-tagged, control-mode-gated state machine. Co-op is therefore primarily a **session/transport + turn-ownership** problem on top of an already-convergent core — *not* a rewrite of state handling.

---

## 3. Constraints discovered from the code

1. **`state.turn` and `state.revision` are global and monotonic** (`rpg-state.js` L72, L99). There is no per-actor clock. Naive "each player has their own turn counter" would break `timeline-backwards` and `stale-session` checks.
2. **`applyEvent` is single-threaded and whole-state.** It takes a full state and returns a full next state. There is no merge/diff/CRDT operation. Concurrent divergent states cannot be automatically reconciled by the current core.
3. **Events carry `source` and `actorId`** (L100) but the core does not *validate* that `actorId` is owned by the submitting peer. Ownership enforcement is a session-layer responsibility to add.
4. **Persistence is single-writer keyed by `roomId::worldId`** (`sessionKey`). Two devices writing the same key locally have no coordination channel without a transport.
5. **The app is local-first / offline-capable** (offline degradation, cached assets). A co-op design that *requires* a live server violates the offline promise.

These constraints rule out CRDT-style automatic merge and point strongly toward a **sequenced, single-authority turn model with optimistic conflict rejection**.

---

## 4. Options considered

### Option A — Fully decentralized, CRDT/last-writer-wins merge
Each player keeps a full replica; replicas merge by CRDT.
- **Rejected.** The core has no merge primitive; narrative state (canon, spatial-conflict, quest dependencies) is *not* commutative. LWW silently rewrites HARD canon and breaks `spatial-conflict` guarantees. Violates "no weakening of canon/agency".

### Option B — Required hosted authoritative server (lockstep)
A server owns the state; clients are thin.
- **Rejected as the *primary* path.** Conflicts with local-first/offline promise and adds an operational dependency the standalone app does not have. Retained only as an *optional* transport (§6).

### Option C — Single-device hot-seat co-op (shared control, one runtime)
Multiple players share one device/session; the runtime sequences turns.
- **Accepted as Phase 1.** Zero transport, zero new persistence, fully testable today with the existing state machine. Delivers real co-op value immediately and validates the turn-ownership + consent rules in isolation.

### Option D — Peer-to-peer / LAN sync with a designated host device (host-authoritative)
One player's device is the authority (holds `persistedRevision`); peers submit *intents* (events) to the host, which sequences them through `applyEvent` and broadcasts committed events.
- **Accepted as Phase 2.** Reuses optimistic concurrency as the conflict detector, keeps a single writer per `roomId::worldId` (satisfying constraint #4), and degrades to host-offline = read-only/spectate (satisfying offline promise).

**Chosen strategy: C then D**, layered on the existing control-mode/consent/canon primitives. This is the smallest safe increment.

---

## 5. Target architecture (Phase 2 — host-authoritative co-op)

### 5.1 Roles
- **Host device** — sole writer to persistence. Runs `commitEvents` and owns `persistedRevision`. Broadcasts the committed event log + resulting `revision`.
- **Peer devices** — hold a *replica* used read-only. Submit **intents** = candidate events tagged `{actorId, source:'user', controlsCharacterIds}`. Peers may render optimistically but never persist.
- **Spectator** — a peer with no controlled characters; renders via `getReplayState` (read-only guard already exists).

### 5.2 Turn ownership (new session-layer rule)
Add a **seat map**: `seats: { playerId → controlledCharacterIds }`. Disjoint by construction.
- On intent submit, host validates `intent.controlsCharacterIds ⊆ seats[playerId]`. If not → reject (`seat-violation`). This closes the gap found in constraint #3 (core doesn't validate ownership).
- A character under `CONTROL_MODE.PLAYER` may only be mutated by the seat that owns it — enforced by existing agency rule (L106) now that `source` is bound to a seat.
- **Turn token.** Only the seat holding the current turn token may submit *world-advancing* intents (`time.advance`, `scene.*`). Other seats may submit *their-character* intents out of turn if the mode allows. This maps `state.turn` (global, constraint #1) to a single rotating token — no per-actor clocks.

### 5.3 Consent (extending the existing gate)
The current `shared-control-consent` gate (L107) handles "AI acts under SHARED control → needs consent". Co-op generalizes it: when one seat's intent affects a character owned by *another* seat, the host requires that seat's consent before `applyEvent`. Reuses `requiresPlayerConsent` flag; no new state-machine branch, only a new *source* of the consent requirement (peer instead of AI).

### 5.4 Canon arbitration
- Peer intents that would mutate a `HARD` canon entry require narrator/host authority (rank ≥ the target). Rank comparison already exists (`canonRank`).
- Lower-canon intents (rumor/soft) from any seat proceed; they cannot override higher canon, enforced by existing canon supersedes logic.
- Result: **no player can rewrite HARD canon unilaterally**; only the host/narrator seat can, preserving the single-player guarantee.

### 5.5 Conflict handling
Because the host is the single writer, `stale-session` conflicts (constraint #2/#4) occur only when a peer's intent was built on a `revision` the host has already advanced past.
- Host rejects the stale intent with `currentRevision`; peer re-bases its intent on the new revision and re-submits (or the UI re-offers the action).
- **No silent overwrite, no automatic merge** — deterministic reject-and-rebase. This is exactly the existing `CONFLICT` semantics, surfaced to the peer.

### 5.6 Knowledge isolation = fog of war
Peers render from a **filtered** state built through `canCharacterKnow` for only the characters they control (plus public facts). The host ships each peer a per-seat projection. HARD/private facts about characters a seat doesn't control are withheld. This turns the existing single-player NPC-knowledge rule into the multi-player privacy rule for free.

### 5.7 Transport (optional, offline-safe)
- **Phase 2a — same-LAN / local socket** host↔peer, no internet. Fits offline promise.
- **Phase 2b — optional relay** for remote play; if absent/unreachable, the session **degrades to host-offline**: peers become spectators on the last synced `revision`, host keeps playing, and a later re-sync reconciles via read-only replay. Never blocks the host.
- No required cloud; matches the "report BLOCKED, never fake" ethos — a relay is an enhancement, not a dependency.

---

## 6. Risks and unknowns

1. **Narrative intent conflicts** (two players narrate contradictory outcomes at the same tick). Mitigation: turn token + consent; residual ambiguity resolved by narrator seat. *Unknown: how often consent deadlocks occur in practice — needs a playtest.*
2. **Projection cost.** Per-seat `canCharacterKnow` filtering over a 1000-event campaign could be O(seats × events). *Unknown: measurable perf; reuse the existing context-budget/compaction path and benchmark.*
3. **Peer cheating / malformed intents.** A modified peer could submit out-of-seat intents. The host is authoritative and re-validates every intent through `applyEvent` + seat map, so a bad peer is rejected, not trusted. *Residual: host itself is trusted (inherent to host-authoritative).*
4. **Reconnect/re-base UX.** Reject-and-rebase is correct but can feel janky. *Unknown: UX polish for concurrent edits; defer to a UI iteration.*
5. **Canon consent for collaborative canon-writing.** Two players proposing canon simultaneously. *Mitigation: canon proposals enter as SOFT (rank 0) and need narrator promotion to ACTIVE/HARD — reuses the canon-request flow already present in player tools.*

---

## 7. Recommended path (phased, each independently shippable & testable)

| Phase | Deliverable | New code? | Test approach (deterministic) | Value |
|---|---|---|---|---|
| **P1** | **Hot-seat co-op**: seat map + turn token + consent on the *existing* single runtime; multiple human seats on one device | Session-layer only (seat map, turn token, ownership check) — no state-machine change | Deterministic tests: seat ownership rejects cross-puppeting; turn token rotates; SHARED+consent blocks unconsented cross-seat action; HARD canon not writable by non-narrator seat | Real co-op today, zero transport risk |
| **P2** | **Host-authoritative sync**: peers submit intents, host sequences + broadcasts; fog-of-war projections via `canCharacterKnow`; conflict = reject-and-rebase | Transport adapter + projection filter; reuse `commitEvents`/`persistedRevision` | Deterministic tests: two peers, same tick, conflicting intents → exactly one commits, other gets `stale-session`/re-base; projection omits facts a seat can't know | Multi-device co-op, offline-safe |
| **P3** | **Optional relay** for remote play + reconnect reconciliation via read-only replay | Optional relay adapter; degrades to spectate when absent | Simulated transport with injected latency/partition; assert degrade-to-spectate and later reconcile | Remote co-op as pure enhancement |

**Guidance for any future implementer (not performed here):** implement **P1 only** first and land it behind the existing test gates. Do not build the network layer until P1's turn-ownership + consent rules are proven deterministic under the current `applyEvent`. Never introduce a merge/CRDT path that could rewrite HARD canon or bypass player agency — that would weaken guarantees the project explicitly protects.

---

## 8. Traceability to shipped primitives

Everything the design relies on is already implemented and tested on this branch:
- Optimistic concurrency / conflict: `rpg-session.js` `persist` → `stale-session` (tested in session suite).
- Control modes + consent gate: `rpg-state.js` L11, L106–107 (tested in state suite).
- Canon authority ranking: `CANON_LEVEL` + supersedes (tested in canon-continuity suite).
- Knowledge isolation: `canCharacterKnow` (tested in state suite).
- Read-only replay / spectate: `rpg-player-tools.js` RPG-02-12 (verified this session).

No shipped guarantee is relaxed by this research. The design's central claim: **co-op is a session/transport layer over an already-convergent, canon-authoritative, conflict-detecting event core.**

---

*Research deliverable for RPG-15-02. No production-readiness is claimed; this is architecture only, consistent with the OPERATION INFINITY rule that research items are not to be presented as implemented features.*

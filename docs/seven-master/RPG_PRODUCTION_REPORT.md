# Seven RPG Production Report

Status: PARTIAL
Owner: CHAT 2 — RPG Production
Branch: `chat2/rpg-production-hardening`

## Scope

Production hardening of the root HTML/Capacitor RPG runtime only. This report does not credit unrelated typed/remake branches.

## Batch 01 — Journal Recovery Hardening

### Reality audit findings

Current root RPG already has:
- structured RPG state in `release/workspaces/rpg-state.js`;
- versioned room/world persistence in `release/workspaces/rpg-session.js`;
- bounded Narrator/Character projections in `release/workspaces/rpg-context.js`;
- a live bridge in `release/workspaces/rpg-live-integration.js`;
- public Memory projection and active-world index handling;
- uncertainty quarantine via per-room pending journal.

The critical gap was that a journal surviving restart only blocked hydrate/context with `recovery-required`; there was no safe recovery API.

A second failure mode was identified during implementation: session/index/Memory could be fully committed while only journal cleanup failed. Treating every surviving journal as rollback-required would regress the durable session while leaving the public Memory projection at the newer revision.

### Implemented

`release/workspaces/rpg-live-integration.js` now adds:
- additive journal status field using the existing version-1 envelope;
- supported states: `pending`, `committed`, `rolled_back`, `corrupt`, `abandoned`;
- `recover(roomId)` with fail-closed semantics;
- `inspectRecovery(roomId)`;
- revision guards that refuse to overwrite newer valid state;
- same-revision divergence protection;
- public Memory projection revision evidence for resolving commit-finalization uncertainty;
- committed-journal finalization without rollback;
- rollback only where the current durable state is provably the in-flight candidate or the previous snapshot.

Existing `load`, `loadLatest`, `context`, and `sync` continue to fail closed while a journal exists. Recovery is explicit; no silent automatic destructive repair was introduced.

### Regression coverage added

`release/rpg-live-integration.test.cjs` now covers:
- restart with incomplete rollback;
- explicit recovery to the previous known-good session/index;
- successful post-recovery sync;
- journal cleanup failure after session/index/Memory commit;
- restart finalization of an already committed transaction without rollback;
- refusal to overwrite a newer valid RPG revision;
- persistent block state for abandoned/ambiguous recovery;
- journal-write failure remains mutation-free.

### Known limits / remaining risks

- Exact-SHA CI for the latest Batch 01 commit is still required.
- Recovery is explicit, not yet invoked automatically by product lifecycle/UI.
- Public Memory projection rollback is not a general multi-store transaction; recovery currently relies on revision evidence and avoids destructive action when ambiguous.
- Multi-tab/process concurrent writers are not yet arbitrated.
- Live model generation still does not prove Character View/Narrator View selection at the model-call boundary.
- Semantic model delta extraction and live player-agency rejection remain unverified.
- Android process-death and app-upgrade RPG continuity remain cross-chat dependencies.

## Next exact action

1. Obtain exact-SHA CI evidence for Batch 01.
2. Add a verified transaction coordinator around validated RPG delta -> session persist -> Memory projection -> active index -> commit/finalize.
3. Wire Character/Narrator views into the live generation context and add no-leak/player-agency regressions.
4. Extend long-story growth measurements and Android restart/process-death integration evidence.

## Integration status

PARTIAL — not ready for merge or RC acceptance yet.

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

### Evidence

- Exact-SHA Seven AI tests run `37303792567`: SUCCESS on `0437f9135b5cb0393865467cac0c4e7701287166`.

### Known limits / remaining risks

- Later Batch 02 commits require their own exact-SHA CI; the Batch 01 pass is not reused as evidence for them.
- Recovery is explicit, not yet invoked automatically by product lifecycle/UI.
- Public Memory projection rollback is not a general multi-store transaction; recovery currently relies on revision evidence and avoids destructive action when ambiguous.
- Multi-tab/process concurrent writers are not yet arbitrated.
- Live model generation still does not prove Character View/Narrator View selection at the model-call boundary.
- Semantic model delta extraction and live player-agency rejection remain unverified.
- Android process-death and app-upgrade RPG continuity remain cross-chat dependencies.

## Batch 02 — Live Turn + Model Context Hardening

Implemented:
- `transact({roomId, worldId, events})` in the live bridge: validated state events -> session persistence -> active index -> public Memory projection -> commit journal -> finalize.
- transaction rollback on validation/index/Memory failures;
- live player-agency regression: runtime/model-originated movement of a player-controlled character is rejected and not persisted;
- live HARD CANON conflict rejection;
- `SevenRpgWorkspace.commitStateEvents()` as the product boundary for validated structured RPG event commits;
- workspace context now defaults to bounded Narrator View and can explicitly switch to Character View;
- Character View carries `access: character-local`;
- the existing real context collection seam consumes that Character View, with a browser regression proving a hidden Canon fact is excluded while public Canon remains visible;
- safe pending journals are recovered during workspace hydrate; ambiguous/abandoned journals remain fail-closed;
- browser recovery regression simulates interrupted durable state, closes/reopens the workspace, and verifies deterministic rollback plus journal cleanup;
- long-story benchmark now records state size, bounded context size, load latency and context construction latency at 100/500/1000 episode-equivalent checkpoints, with unchanged 9000-char context gate and a 2 MiB structured-state ceiling.

Current Batch 02 exact-SHA CI is pending and must pass before integration readiness is claimed.

## Next exact action

1. Hold the branch SHA stable and obtain full exact-SHA CI evidence for Batch 02.
2. If green, inspect CI long-story measurements and record them here.
3. Add semantic model-output delta extraction only if it can preserve the current propose -> validate -> commit boundary.
4. Coordinate Android process-death/app-upgrade RPG persistence with CHAT 1.
5. Run limited live-provider dialogue/no-leak/voice-continuity evaluation when provider access is available.

## Integration status

PARTIAL — not ready for merge or RC acceptance yet.

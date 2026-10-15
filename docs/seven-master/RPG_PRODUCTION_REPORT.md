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

- Batch 01 evidence remains historical; later claims use the final exact application/source SHA below.
- Safe pending journals are now recovered automatically during RPG workspace hydrate; ambiguous/corrupt/abandoned journals remain fail-closed.
- Public Memory projection is not a general cross-store ACID transaction; recovery uses durable revision/projection evidence and refuses destructive action when ambiguous.
- Multi-tab/process concurrent writers still lack dedicated arbitration evidence.
- Character/Narrator projections now reach the real model-context collection seam, but automatic per-speaker Character View selection and semantic generated-dialogue no-leak evaluation remain unverified.
- Semantic model-output -> proposed RPG event extraction is not wired into the shared generation controller.
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

Batch 02/03 are included in the final verified application/source SHA and evidence below.

## Final deterministic/browser evidence

Verified application/source SHA: `d68f725dd6fa0a15566b230d711719b0713a4d94`.

Exact-SHA workflow:
- workflow: `Seven AI tests`;
- run: `37306326714`;
- conclusion: **SUCCESS**;
- `node all.cjs`: SUCCESS;
- browser evidence gate: SUCCESS;
- verified release artifact upload: SUCCESS.

Release artifact:
- name: `seven-ai-release`;
- artifact id: `11344161308`;
- size: `1,753,494` bytes;
- digest: `sha256:08b09b213e70d7ae3e0afe149addab68c219d9f1a5402b8978e06f2b0d7b41c9`;
- artifact head SHA: `d68f725dd6fa0a15566b230d711719b0713a4d94`.

RPG evidence from that exact run:
- `rpg live integration: PASS`;
- `Packaged RPG kernels: PASS (state, session, context, live failure/restart gates)`;
- `rpg session manager: PASS` with atomic rollback, stale-write blocking and corruption quarantine;
- `rpg context views: PASS`, including explicit character-local boundary;
- `rpg state kernel: PASS`;
- browser release verifier reaches the real RPG workspace/context/persistence path;
- workspace product-boundary player-agency rejection is covered;
- automatic safe journal recovery during workspace reopen is covered.

Long-story measured checkpoints from the same run:

| Episode-equivalent checkpoint | Committed events | State bytes | Context chars | Load ms | Context-build ms |
|---:|---:|---:|---:|---:|---:|
| 100 | 102 | 37,376 | 2,030 | 2.947 | 1.029 |
| 500 | 502 | 167,522 | 2,111 | 11.872 | 1.840 |
| 1000 | 1002 | 330,110 | 2,103 | 24.731 | 3.529 |

Final long-story result: 1006 committed events, revision 1006, old consequence retained, quest completion retained, HARD CANON invalid mutation blocked, player-agency violation blocked, Character/Narrator contexts remained within the unchanged 9000-character gate.

Static budget from the same run:
- hot release-layer bytes: `99,176`;
- lazy attachment bytes: `16,795`;
- lazy workspace bytes: `319,517 / 320,000` — PASS;
- total static APK bytes: `4,190,722 / 8,388,608`;
- warnings: 0.

No budget or acceptance threshold was increased.


## Batch 03 — Size Gate + Transaction Deduplication

CI run `37304741613` on `2cffd66871453e999ba324474cd4006c1d08dcaf` failed the unchanged static lazy-workspace budget: 322150 bytes vs 320000. No benchmark or threshold was raised.

A first whitespace-only compaction demonstrated that the release builder already removes most formatting and therefore was not an acceptable fix by itself. The production fix instead:
- unified legacy `sync()` and structured `transact()` through one `runTxn()` pipeline;
- removed duplicated journal/persist/index/Memory/finalize/rollback logic;
- replaced the mutating `getSession/start` pre-journal path with non-mutating `manager.create()` for virgin sessions;
- therefore guarantees journal-write failure cannot create durable virgin state;
- compacted recovery control flow without dropping revision-divergence, newer-state, commit-evidence, corrupt/abandoned, index-restore, or fail-closed checks.

Added evidence:
- failure injection proves a virgin structured transaction with a journal-write failure leaves session inspection at `MISSING`;
- browser product-boundary regression calls `SevenRpgWorkspace.commitStateEvents()` and proves a runtime-originated move of a player-controlled character is rejected with `player-control` and the persisted location is unchanged.

The first compaction retest, run `37305266877`, still failed only the unchanged static budget at 321824/320000. The shared-pipeline refactor then brought the exact final application/source build to 319517/320000 and the full run `37306326714` passed.

## Remaining production risks / dependencies

1. **Shared generation hook:** automatic semantic extraction of model output into proposed RPG events is not implemented. The current safe product boundary is `SevenRpgWorkspace.commitStateEvents()`; any future model extraction must remain proposal-only and pass deterministic validation before commit.
2. **Character dialogue semantics:** Character View is wired and deterministic no-leak projection tests pass, but the shared generation controller does not automatically select a Character View per speaking character. Real-model dialogue can therefore not yet be certified free of narrator-only knowledge leakage.
3. **Live model quality:** character voice, continuity and semantic no-leak need a bounded live-provider evaluation plus independent review; no provider credentials or quality result were invented.
4. **Android continuity:** real process-kill and Build A -> Build B upgrade retention for RPG state are owned jointly with CHAT 1 and remain unverified here.
5. **Concurrent writers:** revision conflict handling exists, but dedicated multi-tab/process writer arbitration is not yet acceptance-tested.
6. **Relationship directionality:** current v1 relationship key remains symmetric; changing this is feature/schema work and is intentionally deferred during RC hardening.
7. **Size headroom:** lazy workspace budget has only 483 bytes of measured headroom. Further runtime additions should first remove duplication or relocate capability rather than raise the gate.

## Cross-system dependencies

- CHAT 1 — include RPG session/journal/Memory projection in real Android process-kill and upgrade/data-continuity acceptance.
- Master / Integration — approve any shared `seven_ai-final.html` generation-controller hook required for model-output delta extraction or automatic speaker-specific Character View selection.
- Evaluation / provider runtime — execute limited live semantic dialogue tests when real providers are available, with independent verdict rather than self-approval.

## Exact next action

1. Hand this branch and exact-SHA evidence to Master for review.
2. Keep PR #120 draft; do not merge directly.
3. Coordinate CHAT 1 Android process-death/upgrade evidence using RPG state.
4. If Master grants the shared-core seam, implement a minimal proposal parser/hook that cannot mutate state except through `commitStateEvents()`, then rerun all exact-SHA gates.
5. Run live semantic dialogue/no-leak/voice evaluation when a real provider path is available.

## Integration status

**PARTIAL** — deterministic/browser RPG hardening is exact-SHA green, but live semantic generation and Android process-death/upgrade acceptance remain open.

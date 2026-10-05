# Seven AI — RPG System Implementation Plan

Date: 2026-10-05
Status: IN PROGRESS

## Goal

Build a production RPG engine that remains coherent for 1000+ episodes while using bounded context and Seven's shared Memory/Model/Tool contracts.

## Phase 0 — Baseline and audit
Status: COMPLETE

Evidence:
- read all seven-master coordination files;
- inspected RPG V2 Product Contract and Wave 01B audits;
- inspected RPG workspace, World runtime, Canon simulator and tests;
- inspected Memory scoping and Context Builder;
- confirmed prior RPG audit was a design/read-only package, not a finished product.

## Phase 1 — Structured RPG State Kernel
Status: IMPLEMENTED / FIRST TEST GREEN

Files:
- release/workspaces/rpg-state.js
- release/rpg-state.test.cjs

Capabilities:
- world + character state;
- Truth/Belief separation;
- local knowledge;
- Canon tiers;
- relationships/emotions;
- timeline/spatial guard;
- inventory;
- abilities;
- quests/factions;
- open threads;
- user-control modes;
- event ledger/provenance;
- bounded context packet;
- Memory adapter records;
- NPC action proposal surface.

Deterministic test:
- 1010 committed events/turns;
- blocks runtime control of player character;
- blocks spatial conflicts;
- blocks future knowledge;
- preserves false belief separately from truth;
- applies relationship/emotion changes;
- blocks lower-precedence and conflicting HARD canon;
- permits explicit user hard-canon override;
- validates inventory transfer;
- blocks timeline rollback;
- keeps context bounded in the test fixture;
- emits typed Memory adapter records;
- never proposes NPC autonomy action for the player-controlled character.

## Phase 2 — Harness and contract registration
Status: STARTED

Tasks:
- register RPG state test in all.cjs;
- load SevenRpgState in RPG workspace dependencies;
- document architecture/contracts;
- preserve legacy World/Canon tests during migration.

Gate:
- existing regression stays green;
- RPG state test becomes blocking.

## Phase 3 — Persistence + session ownership
Status: NEXT

Implemented foundation:
- per-room/per-world session keys;
- versioned seven-rpg-session envelope;
- deterministic corruption checksum;
- stale-write protection by persisted revision;
- corrupt-state quarantine;
- batch transaction rollback when any event is rejected;
- load/persist/remove/inspect APIs;
- Room A / Room B isolation tests.

Still required:
- bind the manager to the live RPG workspace/active chat-room identity;
- hydrate automatically on RPG open;
- legacy World/Canon migration;
- branch/checkpoint recovery integrated into the UI lifecycle.

Tests:
- exit/re-enter;
- page reload;
- simulated cold restart;
- corrupt payload;
- concurrent rooms/worlds;
- branch identity restore.

## Phase 4 — Atomic Turn Transaction

Pipeline:
user action
-> compile RPG view
-> generate
-> parse proposed delta
-> validate all domains
-> commit state + ledger + memory projection atomically
-> persist

No partial World commit when Canon/knowledge/etc fails.

Bind evidence:
- turn id;
- input digest;
- model output digest;
- provenance;
- validation report.

## Phase 5 — Live Context Builder Integration

Add RPG as a first-class shared context source.

Requirements:
- charged against shared token budget;
- no raw history replay;
- narrator truth and character-local views separated;
- hard constraints cannot be dropped;
- model routing sees final compiled input size.

Tests:
- secret known by A not B;
- relevant canon retrieved;
- irrelevant lore omitted;
- context does not grow linearly with story length.

## Phase 6 — Scene + Character View generation

Implement:
- scene resolver;
- speaker-specific context;
- voice profiles;
- turn ownership;
- large-cast prioritization.

Test 2/5/10/20 character scenes, voice distinctness, no global knowledge leakage, no player action invention.

## Phase 7 — Consequence + Quest/Faction/Ability engines

Expand with:
- directional relationships;
- costs/resources/effects;
- travel durations;
- quest dependency graph;
- faction reputation/politics;
- persistent world consequences.

## Phase 8 — Narrative Planner + NPC Autonomy

Implement:
- goal decomposition;
- open-thread pressure;
- candidate beat generation;
- off-screen proposals;
- world simulation ticks;
- controlled reflection.

Off-screen truth cannot be exposed without a valid knowledge path.

## Phase 9 — Persona / Emotion / Relationship coherence

Implement:
- stable/mid/short character layers;
- emotion inertia/decay;
- personality-conditioned reaction bounds;
- relationship-event retrieval;
- selective deep-character reasoning.

Evaluate persona drift at 50/100/500 turns.

## Phase 10 — RPG Benchmark Suite

Blocking deterministic:
Continuity, Knowledge Boundary, Relationship, Timeline, Location, Canon, User Control, Consequence, Persistence, Context Budget, Corruption Recovery, Multi-room Isolation, Inventory/Ability, Quest/Faction.

Semantic:
Character Voice, Emotional Fidelity, Narrative Quality, Memory Enacting, Multi-character Distinctness, Planner Quality.

Long runs:
100, 500, 1000+ turns with branch/restore points.

Targets:
- knowledge leaks: 0 in deterministic corpus;
- player-agency violations: 0;
- accepted-state validation failures: 0;
- persistence restore equality: 100%;
- context growth bounded, not proportional to total history;
- silent HARD canon contradictions: 0.

## Phase 11 — UX / Android

Primary flow:
Continue / New World / immediate first scene.

No JSON pack required for normal use. Advanced import/debug remains behind advanced UI.

Verify small Android widths, Arabic RTL, day/night, keyboard, reload and low-memory WebView lifecycle.

## Phase 12 — Integration + independent verification

Integration chat validates Memory, Model Routing, Tools, Coding/Self-Development telemetry, Android pipeline, migrations and performance.

No completion claim before this gate.

## Current risks

1. Character/Narrator views exist, but the shared live model-generation path does not consume them yet.
2. Relationship v1 remains symmetric although some dimensions should be directional.
3. Bounding v1 is record/character/char-budget based; production must use shared token budgeting.
4. Session persistence exists as a pure manager, but live RPG workspace room identity/hydration is not wired.
5. New kernel and legacy World/Canon runtimes coexist and do not yet share one final transaction owner.
6. Memory adapter records are not yet committed through the public Memory Fabric writer.
7. Live semantic quality is unbenchmarked.
8. Android RPG start/restore is not proven.
9. Full main CI must be green after the latest concurrent release-layer changes before this batch is considered regression-safe.

## Next exact action

Bind the versioned RPG session manager to the live room/workspace lifecycle, then connect Character/Narrator views to the shared Context Builder through a budget-counted RPG source. Do not wire model-authored state mutation until those two seams are tested.

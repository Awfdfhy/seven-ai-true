# RPG V2 — Product Contract

Classification: REBUILD

## Purpose

RPG mode should make Seven feel like a persistent interactive-story engine. The user should enter a world, interact naturally, see consequences persist, and trust continuity without managing internal data structures.

## Problem statement

The current RPG surface exposes infrastructure-heavy controls such as loading Real Works / Canon JSON packs and manually recording episode/chapter/arc titles. These capabilities can remain as advanced tooling, but they do not constitute a compelling primary RPG experience.

The primary happy path must not require JSON imports, title bookkeeping, or knowledge of internal world/canon engines.

## V2 core promise

Within the first 10 minutes a user should experience:
- a clear world/session start
- at least one memorable character interaction
- a meaningful choice
- a visible consequence
- continuity across several turns
- persistence after leaving and returning
- an interface that stays focused on the story rather than engine controls

## First vertical slice

Build only the smallest slice that can prove the promise:

1. Start RPG.
2. Choose from a simple start flow: continue existing world or start new.
3. New world asks only essential setup; defaults should work.
4. Story begins immediately.
5. One character has explicit state: relationship/knowledge/current intent.
6. One player decision mutates world state.
7. Later narration reflects that mutation.
8. Leave RPG.
9. Re-enter RPG.
10. State and continuity are restored.

Do not expand to elaborate world packs, title systems, lore editors, inventories, combat, or multiple campaigns until this slice passes.

## Primary user flow budget

Fresh user -> meaningful first story turn in <= 3 user-visible actions.

Failure conditions:
- requires importing a JSON pack for the primary flow
- opens with a dense control panel
- story state exists internally but is not perceptible in subsequent narration
- continuity disappears after workspace exit/reopen
- model can silently contradict established state without detection or repair

## State contract

V2 state must distinguish at minimum:
- immutable/declared canon facts
- current world state
- character-local knowledge
- relationship/state variables
- player-authored decisions
- derived summary/context

Every persisted mutation needs provenance sufficient for debugging.

## Canon behavior

Canon is a constraint system, not a UI burden.

The engine must:
- detect contradictions against high-confidence established facts
- distinguish intentional alternate/what-if branches from accidental contradiction
- preserve the user's explicit control over their player character when configured
- never silently promote model invention into immutable canon

## Memory requirements

- continuity must survive at least 20 conversational turns in the evaluation scenario
- leaving/re-entering the workspace must preserve the active session
- restarting the application must preserve the session when persistence is available
- character knowledge must not automatically equal global narrator knowledge

## UX requirements

Primary RPG UI should emphasize:
- world/session identity
- current story
- lightweight state feedback only when useful
- continue/new/exit

Advanced controls such as pack imports, canon debugging, or manual title management must live behind an advanced/debug surface if retained.

## Acceptance scenarios

### RPG-01 Start
Fresh install -> enter RPG -> meaningful story turn within <= 3 actions.

### RPG-02 Consequence
Make a choice that changes a known world variable -> within later turns the narration must reflect the changed state.

### RPG-03 Character knowledge
Reveal information to Character A but not Character B -> B must not act as if they know it unless a valid propagation event occurs.

### RPG-04 Persistence
Exit RPG and return -> active session, recent state, and current scene continuity remain.

### RPG-05 Long continuity
Run 20-turn scripted scenario -> established core facts remain consistent unless intentionally changed.

### RPG-06 Canon conflict
Inject a contradictory candidate fact -> system surfaces/block-repairs the contradiction rather than silently accepting it.

### RPG-07 Mobile UX
Small Android viewport + Arabic RTL + night theme -> story/composer/navigation usable without clipping.

## Performance budget

RPG state projection must not send the entire raw world history on every request. Compile only the relevant bounded context for the next turn.

## Merge gate

Builder: agent/04-research  
Memory/context support: agent/06-memory-context  
Testing: agent/08-testing-ci  
Independent reviewer: agent/10-integration-review

# Seven AI — RPG System Architecture

Date: 2026-10-05
Status: Architecture v1 — implementation in progress

## Core invariant

The model writes narrative. The RPG runtime owns truth.

No LLM output, summary or retrieved memory may silently become authoritative world state.

## Top-level pipeline

User Action
-> Active Scene Resolver
-> RPG Context Builder
-> Model / Narrator
-> Narrative + Proposed State Delta
-> Consistency Validator
   Canon
   User Control
   Knowledge Boundaries
   Timeline
   Spatial
   Inventory
   Ability
   Quest/Faction
   Provenance
-> Atomic Commit or Reject/Repair
-> State Snapshot + Event Ledger
-> Memory Fabric adapter
-> Consequence / NPC simulation

## Authority layers

1. HARD CANON — immutable unless explicit user override.
2. ACTIVE CANON — authoritative current facts; change only through valid events.
3. SOFT CANON — lower-precedence descriptive facts.
4. RUMOR — unconfirmed in-world claims.
5. BELIEF — character-local mental state, never global truth.
6. INFERENCE — runtime/model hypothesis requiring confirmation before promotion.

## World State Engine

Owns locations/topology, kingdoms, factions, organizations, politics, economy/resources, wars, laws, weather, active events, world rules and world flags.

Current foundation: SevenRpgState.world.

## Character Engine

Each character owns identity, age, appearance, stable personality, motivations/goals/fears/preferences, abilities, inventory, location, emotions, secrets, beliefs, knowledge, history, promises, injuries/status, loyalties/opinions, voice profile, intent and control mode.

Beliefs never automatically mutate authoritative canon.

## Knowledge Boundary System

A character knows a fact only through a proven path:
- observation;
- told event;
- prior knowledge;
- valid inference event;
- public knowledge after availability horizon.

Knowledge records carry learnedAtTick, sourceEventId, method and confidence.

Future extension: beliefsAbout[otherCharacter][fact] for deeper Theory of Mind.

## Relationship System

Dimensions:
trust, affection, respect, fear, loyalty, attraction, suspicion, rivalry, resentment, dependency, familiarity.

Every change stores an event and reason.

Important v1 limitation: the current pair key is symmetric. Directional dimensions such as fear/trust should become asymmetric in a later phase.

## Emotion System

Short-term bounded dimensions:
happiness, anger, fear, embarrassment, jealousy, grief, excitement, anxiety, affection.

Rules:
- change only from attributable events or controlled simulation;
- clamp to valid range;
- add decay/inertia later based on personality and situation;
- emotion cannot rewrite stable identity directly.

## Narrative Memory

Use Seven Memory Fabric public interfaces only.

RPG-specific schemas/adapters:
- CharacterMemory
- WorldFact
- RelationshipEvent
- NarrativeEvent
- CanonEntry
- QuestState
- LocationState

Memory classes:
Immediate Context, Episodic Memory, Semantic Memory, Relationship Memory, Canon Memory, Open Threads.

Structured RPG state is authoritative current state; Memory Fabric is durable retrieval. No second hidden memory database.

## Canon System

Each entry has id, level, factState, value, entityIds/tags, availability horizon, public/private visibility, source event, confidence, status and supersession links.

Existing Fact, New Narrative Event, Narrator Inference and Unconfirmed remain distinct.

## Timeline Engine

Uses monotonic logical tick plus optional display date/time and event chronology.

Future travel/age rules derive from world-time deltas, not prose guesses.

## Spatial Engine

Every relevant character/item has a location. Scene start validates participant locations unless remote communication or a validated movement/teleport capability explains it.

Future map layer adds location graph, travel edges/durations, containment and access rules.

## Inventory / Item Engine

Tracks owner, location, equipped-by, quantity, consumable state and tags. Character inventory and item owner must agree.

## Ability / Power Engine

Tracks owners, limitations, costs, weaknesses, cooldown, last use, power scale and forbidden status.

Future extension: resource pools, effects, targeting rules and power-comparison validator.

## Quest / Goal Engine

Tracks active/completed/failed/hidden/paused, objectives, dependencies, rewards, consequences and owners. Character goals remain separate from formal quests.

## Faction Engine

Tracks goals, leaders/members, resources, alliances/enemies, territory and reputation.

World simulation can advance faction plans off-screen.

## Consequence Engine

Durable consequences become validated state mutations/events, never prose-only facts if they matter later.

## Narrative Planner

Inputs:
- current state;
- character goals;
- active quests;
- unresolved threads;
- scene;
- player action;
- relevant episodic memory;
- off-screen developments.

Outputs candidate pressures, opportunities, NPC intentions and scene transitions. The player can derail the plan at any turn.

## NPC Autonomy

Two-stage loop:
1. propose action from goal + local knowledge + relationships + emotions + location;
2. validate and commit against control, timeline, location, knowledge, ability/resources and canon.

Off-screen developments stay hidden until a valid information path exposes them.

## Scene Engine

Scene state includes id, participants, location, time, purpose, active conflicts, environment and remote-communication status.

At scene end extract candidate changes, validate, commit atomically, persist and write memory events.

## Multi-Character Dialogue

For each speaker build a Character View containing stable identity/voice, local knowledge, beliefs, emotions, relevant relationships, intent/goals and scene observations.

Do not give every speaker the same global narrator context.

## User Control System

- player: Seven cannot decide actions/internal state.
- ai: Seven may propose and execute validated actions.
- shared: Seven may assist; irreversible actions may require user consent.
- narrator: meta/world entity, not a normal actor.

## Consistency Validator

Pre-commit order:
1. Canon precedence
2. Player agency/control
3. Character knowledge
4. Timeline
5. Spatial state
6. Inventory/ownership
7. Ability/cooldown/cost
8. Quest dependency
9. Faction/world rules
10. Provenance

Post-generation checks prose/state mismatch, invalid deltas and repair/regeneration needs.

## Context Builder

The model receives an RPG Context Packet, never raw history.

Minimum packet:
1. current scene
2. relevant characters
3. character-local known facts
4. relevant relationships
5. active quests/goals
6. relevant canon
7. current location/world slice
8. open threads
9. recent relevant events
10. user-control rules
11. retrieved Memory Fabric records

### Critical isolation rule

A narrator/planner may use hidden world truth. Character dialogue generation must use a filtered Character View.

Simply placing global canon in one prompt can leak knowledge even when the state engine is correct. Generation-level isolation must therefore be tested separately.

### Budget policy

Use shared token-aware/model-aware budgeting.

Priority:
1. user-control and hard constraints;
2. current scene;
3. active speaker identity/knowledge;
4. hard/active canon;
5. relationships/goals;
6. open threads;
7. recent events;
8. optional supportive memory.

Lower-priority records are omitted before authoritative constraints are truncated.

## Persistence target

Versioned per-world/per-room envelope:
- format
- schemaVersion
- sessionId
- worldId
- state
- legacy World/Canon session compatibility
- updatedAt
- revision/digest integrity

Requirements:
- no singleton ownership;
- migration support;
- corruption quarantine;
- atomic write per accepted turn;
- rollback to valid checkpoint;
- hydration is read-only;
- provenance survives restore.

## Memory integration contract

SevenRpgState.toMemoryRecords() is an adapter only.

The integration layer writes records through Memory Fabric public APIs with:
- scope = rpg
- scopeRef = RPG/world id
- provenance
- confidence
- temporal validity

RPG must not create an independent vector/graph database.

## Self-Development integration

RPG exports diagnostics such as canon-conflict rate, knowledge leakage, retrieval misses, persona drift, context overflow, rejection reasons and latency.

Self-Development may propose changes only through Coding System and RPG regression/benchmark gates.

## Implementation mapping

Implemented foundation:
- release/workspaces/rpg-state.js
  structured state, validation, event application, knowledge boundaries, relationships/emotions, canon precedence, user control, inventory/quest/faction/ability basics, context packet, memory adapter and NPC proposals.

Reusable existing components:
- release/world-runtime.js
- release/canon-simulator.js
- shared Memory Fabric
- shared Context Builder
- Model Routing
- Tools/Files

Still required:
- persistence;
- atomic transaction orchestrator;
- live prompt seam;
- output delta extraction;
- response consistency validator;
- full planner/world simulator;
- long-story semantic eval;
- Android UX.

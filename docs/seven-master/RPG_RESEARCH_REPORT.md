# Seven AI — RPG System Research Report

Date: 2026-10-05
Status: ACTIVE DESIGN INPUT
Owner: RPG specialist chat

## Executive conclusion

Seven should treat RPG as a deterministic state-and-memory system with a generative narrator attached, not as a long prompt.

The strongest recurring pattern across modern role-play research, long-term dialogue memory, social-agent systems, and production character platforms is:

1. structured authoritative state for truth that must remain consistent;
2. character-local memory/belief state rather than narrator omniscience;
3. selective retrieval instead of replaying the whole history;
4. explicit persona/psychological representation rather than only prose descriptions;
5. short-term affect separated from stable identity;
6. planning and reflection for autonomous NPC behavior;
7. graph/event representations for relationships, life history, narrative progression and world triggers;
8. validators/evaluators around generation rather than trusting model output as state;
9. provenance and explicit memory operations;
10. long-horizon evaluation that tests behavior, not only factual recall.

## External evidence reviewed

### Generative Agents
Park et al., Generative Agents: Interactive Simulacra of Human Behavior
https://arxiv.org/abs/2304.03442

Memory + reflection + planning all materially contribute to believable agent behavior.

Seven implication: NPC autonomy needs retrieved experience, goals, current state and a planning step; the proposed action must then be validated before commit.

### LoCoMo
Maharana et al., Evaluating Very Long-Term Conversational Memory of LLM Agents
https://aclanthology.org/2024.acl-long.747/

LoCoMo evaluates conversations up to roughly 600 turns and 32 sessions. Long context and RAG help but still struggle with long-range temporal and causal reasoning.

Seven implication: 1000+ episode continuity cannot depend on context size. Structured state, episodic summaries and relevance retrieval are mandatory.

### PersonaForge
Tong & Zou, PersonaForge
https://aclanthology.org/2026.findings-acl.386/

PersonaForge combines a psychology-grounded multi-layer persona with selectively activated deeper reasoning and reports lower long-dialogue drift.

Seven implication: split stable identity from adaptive psychological state and trigger expensive character reasoning only when needed.

### Dynamic Persona Coherence
Qi et al., Beyond Static Persona Consistency
https://aclanthology.org/2026.acl-long.1336/

Separates stable identity from medium- and short-term psychological adaptation.

Seven implication: identity, accumulated stress/meaning and immediate emotions must be distinct state layers.

### PsyMem
Cheng et al., PsyMem
https://aclanthology.org/2026.tacl-1.24/

PsyMem combines fine-grained psychological representation with explicit memory control rather than relying on a persona paragraph plus simple RAG.

Seven implication: memory must be intentionally selected and enacted; character psychology must be structured enough to evaluate.

### Memory-Driven Role-Playing
Wang et al., Memory-Driven Role-Playing
https://aclanthology.org/2026.findings-acl.1175/

Evaluates Anchoring, Selecting, Bounding and Enacting persona memory.

Seven implication: test memory in separate stages: does the right memory exist, was it selected, was it allowed for this character, and did it actually influence the response?

### ThinkPersona
Cai et al., ThinkPersona
https://aclanthology.org/2026.acl-long.747/

Persona Graphs encode life trajectories, values, relationships and events as linked evidence.

Seven implication: add a lightweight local entity/event/relationship graph view over authoritative state and Memory Fabric records; no external graph database is required for baseline Android.

### Theory of Mind agents
Hwang et al., Infusing Theory of Mind into Socially Intelligent LLM Agents
https://aclanthology.org/2026.findings-acl.551/

Explicit mental-state modeling improves long-horizon goal-oriented dialogue and social adaptation.

Seven implication: world truth, character knowledge, character belief and optionally beliefs-about-others must be separate.

### StratMem-Bench
Wu et al., StratMem-Bench
https://aclanthology.org/2026.acl-long.1491/

Strategic memory use requires choosing between required, supportive and irrelevant memories; supportive memory remains difficult.

Seven implication: retrieval must use scene, entity, relationship, goal, chronology, canon priority and knowledge eligibility, and must be allowed to abstain.

### MemoryOS and Inside Out
Kang et al., Memory OS of AI Agent
https://aclanthology.org/2025.emnlp-main.1318/

Zhao et al., Inside Out: Evolving User-Centric Core Memory Trees
https://aclanthology.org/2026.acl-long.614/

Both reinforce hierarchical, selective and update-aware memory rather than replaying raw history.

Seven implication: reuse Memory Fabric for durable episodic/semantic retrieval while RPG structured state remains the authoritative current snapshot. Summaries are derived, not canon.

### Production systems
Convai Narrative Design
https://docs.convai.com/api-docs/convai-playground/character-customization/narrative-design

Convai Mindview
https://docs.convai.com/api-docs/convai-playground/character-customization/mindview

Convai Memory
https://docs.convai.com/api-docs/convai-playground/character-customization/memory

AI Dungeon Memory System
https://help.aidungeon.com/faq/the-memory-system

SillyTavern World Info
https://docs.sillytavern.app/usage/core-concepts/worldinfo/

These production systems use layered prompt/context sources, narrative graphs/triggers, long-term memory and selective lore retrieval. Seven should retain those useful patterns while going further: important continuity must live in validated structured state, not only injected lore text.

## Architecture principles extracted

### State > prompt
Anything that can create a continuity bug should have structured representation: locations, ownership, control, timeline, inventory, quests, relationships, knowledge, canon, factions, abilities and open threads. Prompts are projections of state, never the source of truth.

### Truth, belief and knowledge are different
Truth lives in authoritative World/Canon State. Knowledge is what a character validly learned. Belief may be false. Inference is explicitly marked and cannot become canon automatically.

### Event sourcing + current snapshot
Use a compact current state for fast reads, an append-only provenance ledger for causal history, and Memory Fabric records for semantic/episodic recall.

### Multi-signal retrieval
Use scene participants, entities, location, time, relationship relevance, goals, quests, open threads, canon priority, confidence and character knowledge eligibility. No useful signal means no recall.

### Propose -> validate -> commit
The model proposes dialogue/narration/state deltas. Runtime validates Canon, User Control, Knowledge, Timeline, Spatial, Inventory, Ability, Quest/Faction and Provenance before commit.

### Stable identity, adaptive psychology
Maintain stable identity/personality/voice; medium-term motivations, loyalties and relationships; short-term emotions and intent; episodic memories and beliefs.

### Narrative planning is constrained simulation
Planner inputs are world simulation + character motivations + open threads + user actions. It emits candidate beats/pressures, not a pre-written immutable plot.

### Player control is authoritative
For player-controlled characters Seven may describe consequences and observations, but cannot invent irreversible choices, internal thoughts, emotions or actions unless the user grants control.

## Current Seven audit

### Existing strong pieces
- release/world-runtime.js: beat ordering, branching, source coverage and player-agency guard.
- release/canon-simulator.js: local knowledge checks, anchors, relationship/location state and provenance-bearing deltas.
- Memory Fabric v2: RPG scope, provenance, confidence, temporal concepts and context budgeting.
- Shared Context Builder: priority-aware bounded projection.
- Wave 01B RPG audit package: strong acceptance contract and failure inventory.

### Critical gaps found before this batch
1. singleton in-memory RPG session;
2. no durable session persistence;
3. no zero-config primary start;
4. no live RPG state prompt projection;
5. separate/non-atomic World and Canon commits;
6. verified:true only a boolean gate;
7. old chronology audit could hard-code PASS;
8. no comprehensive structured character/world/quest/faction/inventory/ability model;
9. no explicit Truth vs Belief;
10. no full relationship/emotion state;
11. no RPG benchmark registered in main runner;
12. no 1000+ event structured-state simulation.

## Gap assessment after RPG State Kernel v1

release/workspaces/rpg-state.js closes the state-model foundation:
- structured state;
- Canon tiers;
- Truth/Belief separation;
- character-local knowledge;
- relationships/emotions;
- timeline/spatial guards;
- inventory;
- quests/factions;
- abilities;
- user-control modes;
- event ledger;
- bounded context packet;
- Memory Fabric adapter records;
- NPC proposal surface;
- deterministic validation.

Still open:
- persistence;
- atomic turn orchestration;
- live Context Builder integration;
- proposed-delta extraction;
- post-generation consistency repair;
- narrative planner and world simulation;
- calibrated emotion/relationship evolution;
- 100/500/1000 episode semantic evaluation;
- Android start/restore UX;
- migration from legacy sessions;
- independent Integration verification.

## Research-derived Definition of Done

RPG is complete only when deterministic and semantic evidence proves:
- zero player-control violations;
- zero forbidden knowledge leaks in benchmark corpus;
- correct canon precedence and intentional branching;
- timeline/location/inventory consistency;
- consequences survive hundreds of turns and restart;
- character voice drift stays within accepted threshold;
- relationships/emotions change due to attributable events;
- autonomous NPCs respect local knowledge and player agency;
- context stays bounded as history grows;
- retrieval can reject irrelevant memories;
- corruption/recovery tests pass;
- Arabic/English and mobile RPG surfaces pass;
- Integration independently verifies shared contracts.

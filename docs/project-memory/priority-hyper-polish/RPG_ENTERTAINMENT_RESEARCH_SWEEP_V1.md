# Seven RPG — Entertainment Systems Research Sweep V1

Status: **Research artifact / pre-implementation architecture mining**
Scope: Capability 19 RPG Engine, with interfaces into Real Works (#20), Titles (#21), Memory, Context, Search, Knowledge and Vision.
Goal: mine the highest-value mechanics and architectural ideas from games, interactive narrative, simulation, tabletop-inspired systems and current role-playing-agent research without turning Seven into a bloated all-games clone.

## Executive conclusion

The strongest recurring pattern across the research is not "more mechanics". It is **meaningful persistent consequences carried by believable characters inside a world that keeps moving**.

The highest-value architecture for Seven is therefore:

1. **Character Simulation Fabric** — stable identity + dynamic psychology + perspective-bounded memory + goals + needs + values + beliefs + relationships + capabilities.
2. **Social World Fabric** — relationships, factions, reputation, secrets, rumors, obligations, social roles and information flow.
3. **Living World Scheduler** — selective off-screen life, routines, scheduled events, world-state transitions and coarse simulation for inactive entities.
4. **Narrative Experience Director** — pacing, scene composition, spotlight, tension/opportunity balancing and adaptive encounter selection without stealing player agency.
5. **Consequence & Commitment Graph** — choices create obligations, delayed effects, reputation changes, knowledge propagation, relationship shifts and future opportunities.
6. **Character Arc / Legacy Fabric** — long-term development, transformations, milestones, scars/lessons, aging/legacy where relevant, and cross-campaign myth/history when the mode supports it.
7. **Modular Gameplay Rules** — combat, exploration, progression, economy, crafting, stealth, puzzle, survival, politics, etc. are optional capability modules rather than always-on RPG core.
8. **Perspective-grounded narration** — every actor receives only what they can perceive/know/believe, while narration may use a separately authorized omniscient or limited viewpoint.

The guiding rule is: **every system must create decisions, consequences, characterization, or replayable emergence. Decorative complexity is rejected.**

---

## Research signals

### Role-playing agent research

- **PersonaForge (ACL 2026)**: psychology-grounded multi-layer persona representations substantially reduce long-dialogue drift; selective deeper reasoning retains most of the benefit without always-on cost.
- **Dynamic Persona Coherence (ACL 2026)**: separates stable identity from mid-term psychological evolution and short-term affect; this directly supports a layered CharacterState rather than a frozen persona prompt.
- **REVERIEMEM / perspective-bounded memory (2026)**: character memories should be perspective-bound; shared global retrieval causes factual overreach.
- **Memory-Driven Role-Playing (ACL 2026)**: persona memory evaluation should test anchoring, selecting, bounding and enacting, not merely recall.
- **ThinkPersona (ACL 2026)**: persona graphs representing life trajectory, values, relationships and events outperform flattened profiles conceptually and support evidence-grounded characterization.
- **AdaMARP (ACL 2026)**: explicit scene management actions such as scene switching, speaker selection and role introduction are useful for multi-character orchestration.
- **NVIDIA ACE (2025+)**: autonomous characters are framed around perception → motivations/memory → cognition/planning → action, with small/local models and high/low-frequency planning separation.

### Simulation and systemic games

- **Dwarf Fortress**: memories, traits, values, needs, preferences, relationships, knowledge, rumors and historical figures demonstrate the value of persistent individual state and selective explicit simulation. Particularly valuable: knowledge spreads through observation, books, rumors and teaching; emotionally strong memories can become long-term/core memories; not every population member needs full simulation.
- **The Sims 4**: traits, emotions, aspirations, wants/fears and autonomous neighborhood life demonstrate how personality can influence both immediate choices and long-term life events. Off-screen households can change careers, move, form families, etc., but the Seven version should remain world-specific and selective.
- **Wildermyth**: character history, personality, relationships, transformations, aging and legacy produce strong attachment by making events permanently reshape characters. The key lesson is character development over procedural plot spam.
- **Shadow of War / Nemesis-style systemic rivalry**: individually distinguished recurring actors, hierarchy, promotions/demotions, rivalries, betrayals and history with the player create personalized stories. Seven should copy the *principle* of persistent personal history, not any proprietary implementation.
- **Stardew Valley**: schedules and relationship-triggered events show the value of temporal routines and milestone scenes, but raw heart meters are too coarse for Seven's final relationship representation.
- **Fire Emblem Engage**: bonds can unlock both narrative and gameplay affordances, suggesting relationships should sometimes produce capabilities/opportunities rather than only dialogue flavor.
- **Disco Elysium**: skills/thoughts can function as internal voices and long-term internalized ideas that alter future options. Seven can generalize this as optional `InternalBelief/Thought` modules for player characters or NPCs when a world supports introspective mechanics.
- **Paradox character/society systems**: stable identity layers plus contextual leaders, factions, ideologies and political movements show that social structures need persistent identity and contextual change rather than every value dynamically oscillating.

### Interactive narrative / experience management

- **Player modeling / PaSSAGE**: adapting content selection to observed player preference can improve enjoyment for some players.
- **Drama/experience management research**: directors can select or prune narrative opportunities while preserving player action space.
- **Human GM improvisation study (AIIDE 2025)**: high agency and recognizable structure are complementary rather than opposites; the system should support improvisation around player choices instead of forcing an authored rail.
- **RPGAgent / SceneCraft / agentic GM research**: structured separation among narrative, scenes, gameplay mechanics and specialized agents improves controllability and coherence compared with a single generic generator.
- **Nightingale AI Director negative result**: adaptive directors are not automatically better. Seven must prove director interventions improve experience and must keep a deterministic/passive fallback.

---

# High-value feature extraction

## P0 — must enter the improved RPG architecture before implementation

### 1. Character Simulation Fabric

Canonical layers per material character:

- `CharacterIdentityCore`
  - identity / role / origin
  - stable or slow-changing values
  - personality dimensions
  - cultural/social identity relevant to the world
  - personal boundaries/taboos
- `CharacterAdaptiveState`
  - current goals
  - current motivations
  - needs
  - beliefs
  - emotional/appraisal state
  - stress/meaning accumulation where relevant
  - active commitments
- `CharacterPerspectiveMemory`
  - experienced episodes
  - observed facts
  - heard claims/rumors with source identity
  - learned knowledge
  - emotionally salient memories
  - unresolved personal events
- `CharacterSocialState`
  - relationships
  - obligations/debts
  - faction memberships
  - social roles
  - reputation beliefs about others
- `CharacterCapabilityState`
  - skills/abilities known to the world rules
  - resources/equipment references
  - current conditions/cooldowns where relevant
- `CharacterExpressionProfile`
  - speech patterns
  - vocabulary/register
  - humor/directness/verbosity tendencies
  - nonverbal mannerisms when modality supports them
  - situation-dependent expression patterns

Identity stability and adaptive psychology are explicitly separate.

### 2. Perspective Firewall

For each character, distinguish:

- world truth
- directly observed truth
- communicated claims
- rumors
- inferred beliefs
- false beliefs
- secrets known
- unknown information
- forgotten/low-access memories

NPC output is compiled from that actor's allowed perspective. Global truth is never copied wholesale into NPC context.

### 3. Belief and Rumor Propagation

Information becomes an evented object:

- claim id
- speaker/source
- receiver
- transmission event
- direct/indirect status
- confidence/stance if the world needs it
- distortions only when rules/story justify them
- later corroboration/refutation

This enables gossip, secrets, misinformation, discoveries and reputation spread while retaining provenance.

### 4. Memory Salience and Character-Changing Memories

Do not keep all experiences at equal weight.

Events may become:

- transient observation
- ordinary episodic memory
- salient personal memory
- core/identity-shaping memory
- unresolved memory

Promotion depends on measured salience and narrative/world rules, not model whim. Core memories may shift adaptive traits or relationship interpretation while preserving the pre-change history.

### 5. Needs / Values / Motivations

Needs are world-specific and sparse. They influence action utility but do not become a universal giant Sims-like meter set.

Examples of abstract need families:

- safety
- belonging
- autonomy
- recognition
- duty
- curiosity
- rest/recovery
- purpose

World packs may define their own. Values constrain which actions feel acceptable. Motivations are situational projections from identity, values, needs and goals.

### 6. Event-derived Relationship Graph

Replace simple approval with relationship evidence.

Possible dimensions are materialized only when useful:

- trust
- respect
- affection
- fear
- resentment
- loyalty
- rivalry
- debt/obligation
- familiarity
- ideological alignment

Every material relationship change binds to one or more events. Relationship states can be asymmetric.

### 7. Secrets, Hooks and Obligations

Characters and factions can possess:

- secrets
- leverage/hooks
- promises
- debts
- oaths
- contracts
- unresolved betrayals
- witnessed acts

These create future narrative/gameplay affordances and cannot be replaced by a generic reputation score.

### 8. Reputation as Distributed Belief

Do not store one universal reputation number.

Represent reputation as:

- community/faction perceptions
- individual beliefs
- known deeds
- rumors
- public titles/status
- hidden deeds
- dispositions the player has demonstrated over time

Different groups may hold contradictory opinions of the same actor.

### 9. Faction / Social Organization Fabric

Minimum canonical organization model:

- stable identity
- goals/interests
- values/ideology where relevant
- membership/roles
- resources/influence abstractions
- relationships with actors/other groups
- current agenda
- active conflicts/cooperation
- internal divisions when materially useful

Organizations must remain simpler than characters unless the mode requires strategic depth.

### 10. Selective Living World / Off-screen Life

NPCs do not freeze when off-screen, but Seven does **not** simulate everyone at full LLM fidelity.

Three fidelity tiers:

- `ACTIVE`: high-detail actors in current scene
- `RELEVANT`: deterministic/coarse scheduled simulation
- `BACKGROUND`: aggregated state transitions only

Promotion/demotion is event-driven. Important historical figures remain explicit; ordinary populations can stay aggregated.

### 11. Routine / Schedule System

Characters may have conditional routines based on:

- time/calendar
- location
- role/job
- obligations
- relationships
- current goals
- emergencies
- world events

Schedules are preferences/constraints, not rails. Higher-priority causes can interrupt them.

### 12. Character Arc Engine

Character development becomes explicit and evidence-bound:

- starting identity tensions
- desires/fears
- unresolved commitments
- turning points
- relationship milestones
- lessons/changed beliefs
- earned transformations
- setbacks/regressions
- arc state

No automatic "everyone grows" assumption. Static, tragic, cyclical and unresolved arcs remain valid.

### 13. Transformations and Scars

Major world events may produce durable changes:

- role/status
- worldview/belief
- relationship
- ability/resource state
- appearance descriptor if relevant
- reputation
- title
- long-term limitation/advantage

Every transformation has origin events and may create new narrative affordances.

### 14. Legacy / History Layer

For worlds that support long campaigns:

- deceased/retired characters remain historical entities
- descendants/successors may inherit knowledge, reputation or obligations only through explicit mechanisms
- legendary events/titles become historical records
- prior campaigns may seed myths or returning characters only when mode/user enables it

Legacy is optional and lazy-loaded.

### 15. Scene Manager

Explicit orchestration actions:

- `INIT_SCENE`
- `ADD_ACTOR`
- `REMOVE_ACTOR`
- `PICK_SPEAKER`
- `SHIFT_FOCUS`
- `SWITCH_LOCATION`
- `ADVANCE_TIME`
- `END_SCENE`

The Scene Manager manages participation and pacing, not truth or player action.

### 16. Narrative Experience Director

A background director may propose opportunities based on:

- unresolved commitments
- character arcs
- player preferences inferred conservatively
- pacing/tension history
- underused characters/locations
- world events
- quest state
- desired variety

Hard law: it may select/propose **opportunities**, never rewrite authoritative state or prune away valid player actions merely to force a plot.

Director modes:

- `OFF`
- `PASSIVE_RECOMMEND`
- `BALANCED`
- `AUTHORIAL_PACK` for explicitly authored experiences

### 17. Consequence & Commitment Graph

Every meaningful decision may produce typed consequences:

- immediate effect
- delayed effect
- social effect
- knowledge propagation
- faction effect
- world resource/state effect
- quest/arc commitment
- scheduled callback
- irreversible marker

This becomes the backbone for "choices matter".

### 18. Dynamic Opportunity / Quest Graph

Quests are not static lists. Use:

- prerequisites
- blockers
- optional goals
- hidden goals (hidden from player, not from authoritative controller)
- ownership
- consequences
- expiry
- supersession
- branch-local state
- follow-up opportunity generation

The system may generate new opportunities from world state, but they must pass feasibility and narrative-value gates.

### 19. Reactive Character Milestones

Relationship, identity, goal or world milestones can unlock:

- scenes
- dialogue topics
- quests
- abilities/opportunities if world rules permit
- confessions/revelations
- role changes

This captures the value of support/heart events without reducing relationships to meters.

### 20. Internal Voice / Thought Modules

Optional for worlds/player characters that benefit from introspection.

Internal voices may be derived from:

- skills
- values
- fears
- memories
- beliefs
- roles

They can suggest interpretations or actions but are explicitly fallible and never overwrite player agency.

---

## P1 — high value, modular

- player preference model for pacing/content style
- companion-to-companion relationship simulation
- party cohesion and conflict
- faction politics and movements
- social roles/status hierarchy
- rumor networks
- crime/legal consequences when world-defined
- exploration/discovery journal
- encounter opportunity generator
- procedural side stories grounded in existing characters/world state
- dynamic locations / settlement change
- economy/trade abstraction where narrative needs it
- crafting/progression modules only where the world uses them
- class/skill/proficiency progression module
- tactical/combat rule adapter rather than one universal combat engine
- stealth/infiltration adapter
- puzzle/challenge adapter
- survival/resource-pressure adapter
- world-specific morality/disposition tracking through observed behavior rather than one morality bar
- seasonal/calendar/festival event modules
- personalized onboarding and explanation depth
- multimodal character expression bridge (voice/image) as optional future layer

## P2 — experimental / only if proven

- learned NPC policies
- multi-agent NPC planning for small active ensembles
- player emotion inference
- learned narrative director
- procedural culture evolution
- autonomous inter-faction strategic simulation
- generative settlement histories
- emergent religion/philosophy systems

These require stronger eval evidence because they can create opacity, resource cost or narrative instability.

---

# Features deliberately rejected from the core

- full LLM simulation for every NPC at all times
- one scalar relationship score
- one global reputation score
- one global morality score
- model-generated authoritative world truth
- unbounded emergent quest generation
- automatic romance/relationship progression based on score alone
- invisible retcons to preserve story flow
- every-character personality expressed as giant prompt prose
- universal combat/economy/crafting systems enabled in every world
- always-on vector retrieval for all character memories
- learned Director with no deterministic fallback
- "fun score" as a single optimization objective

---

# Lightweight architecture requirement

The above depth must not violate Seven's mobile-first laws.

Use:

- event-sourced authoritative state
- sparse materialized dimensions
- perspective indexes built lazily
- compact CharacterCapsules for active scenes
- deterministic utility selection before LLM escalation
- local lexical/event lookup baseline
- embeddings only when useful
- background actors simulated in coarse batches
- high-detail cognition only for active/relevant characters
- selective dual-process character reasoning
- no always-on world-wide autonomous agents

---

# Sources / reference leads

Primary/research references used for architecture mining include:

1. ACL 2026 — PersonaForge: Psychology-Grounded Dual-Process Architecture for Personality-Consistent Role-Playing Agents. https://aclanthology.org/2026.findings-acl.386/
2. ACL 2026 — Beyond Static Persona Consistency: Dynamic Persona Coherence in LLM Role-Playing. https://aclanthology.org/2026.acl-long.1336/
3. ACL 2026 — Memory-Driven Role-Playing. https://aclanthology.org/2026.findings-acl.1175/
4. ACL 2026 — ThinkPersona. https://aclanthology.org/2026.acl-long.449/
5. ACL 2026 — AdaMARP. https://aclanthology.org/2026.findings-acl.1563/
6. Generative Agents: Interactive Simulacra of Human Behavior. https://arxiv.org/abs/2304.03442
7. NVIDIA ACE autonomous game characters. https://www.nvidia.com/en-gb/geforce/news/nvidia-ace-autonomous-ai-companions-pubg-naraka-bladepoint/
8. Dwarf Fortress Wiki — Thoughts/Preferences, Needs, Relationships, Knowledge, Rumors, Memories, Historical Figures. https://dwarffortresswiki.org/
9. EA — The Sims 4 Neighborhood Stories. https://www.ea.com/games/the-sims/the-sims-4/news/neighborhood-stories-system
10. EA — The Sims 4 emotional depth / traits / aspirations. https://www.ea.com/games/the-sims/the-sims-4
11. Wildermyth official site and PlayStation developer feature. https://www.wildermyth.com/ ; https://blog.playstation.com/2024/07/30/wildermyth-a-procedural-storytelling-rpg-comes-to-ps5-ps4-on-october-22/
12. Nintendo — Fire Emblem Engage developer interview on Bonds. https://www.nintendo.com/us/whatsnew/ask-the-developer-vol-8-fire-emblem-engage-part-3/
13. Obsidian — Pillars of Eternity companion design / camaraderie. https://eternity.obsidian.net/eternity/news/update-60-camaraderie
14. Disco Elysium developer interview on Thought Cabinet / internal skill voices. https://discoelysium.com/devblog/2017/08/02/intriguing-indigraze-interview
15. Paradox developer diaries — character/faction/narrative-event design. https://www.paradoxinteractive.com/
16. AIIDE — player modelling, drama management, story graph pruning, reactive narrative encounters, SceneCraft and human-GM improvisation. https://ojs.aaai.org/index.php/AIIDE/
17. CHI 2026 — RPGAgent. https://doi.org/10.1145/3772318.3790326
18. Entertainment Computing 2026 — Evaluating AI-Driven Game Masters. https://www.sciencedirect.com/science/article/pii/S187595212600042X
19. Entertainment Computing 2025 — Storytelling Community AI Agents. https://www.sciencedirect.com/science/article/pii/S187595212500028X
20. AI Dungeon help — memory and relevance-triggered Story Cards, useful as a product comparison for context activation. https://help.aidungeon.com/faq/the-memory-system ; https://help.aidungeon.com/faq/story-cards

## Research verdict

The architecture should not chase every game mechanic. The strongest convergence is **character-centered persistent simulation + social information flow + selective living-world evolution + consequence-rich narrative orchestration**. This gives Seven substantially more entertainment value per unit of complexity than adding dozens of disconnected mechanics.
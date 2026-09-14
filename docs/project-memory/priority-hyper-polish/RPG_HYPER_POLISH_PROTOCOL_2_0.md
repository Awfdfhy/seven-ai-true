# Seven RPG Hyper-Polish Protocol 2.0

Status: **Canonical special protocol for Capability 19 during Priority Hyper-Polish**
Scope: RPG Engine 3.5 candidate and its internal fabrics.
Goal: continue polishing until the architecture reaches evidence-backed saturation rather than aesthetic satisfaction.

## Core rule

> RPG strength is measured by sustained entertainment under freedom: believable characters, meaningful consequences, coherent world state, social depth, replayability and responsiveness over long sessions without fake intelligence or runaway compute.

This protocol is intentionally stricter than the generic Ultimate Polish Protocol.

---

# Phase 0 — Entertainment Ground Truth

Before each round:

- enumerate all canonical RPG primitives
- map each primitive to implementation status
- identify which features create player-facing value vs architectural ornament
- list previous failures, known gaps and rejected ideas
- identify dependencies on Memory, Context, Truth, Real Works, Titles, Vision and Tool Fabric
- declare mobile/resource limits

No implementation claim may be inferred from architecture.

---

# Phase 1 — Entertainment Mining Sweep

Search broadly across:

- CRPGs
- tabletop RPGs and digital GM systems
- life sims
- colony sims
- strategy/grand strategy
- immersive sims
- roguelikes/roguelites
- social sims
- narrative adventures
- procedural narrative games
- MMOs/community worlds
- companion-driven games
- mystery/investigation games
- sandbox simulations
- AI NPC research
- role-playing agent research
- player modeling
- interactive narrative / drama management
- cognitive/personality/memory architectures useful to believable characters

For every mined idea record:

- player value
- unique value to Seven
- complexity
- RAM/CPU/network cost
- explainability
- failure modes
- dependency burden
- whether it can remain modular/lazy

Do not add an idea because a famous game uses it.

---

# Phase 2 — Value Density Gate

Score qualitatively on independent axes; do not collapse to one canonical numeric score:

- `CHARACTER_DEPTH`
- `PLAYER_AGENCY`
- `CONSEQUENCE_DENSITY`
- `EMERGENCE`
- `REPLAYABILITY`
- `WORLD_COHERENCE`
- `SOCIAL_DEPTH`
- `NARRATIVE_QUALITY`
- `GAMEPLAY_AFFORDANCE`
- `MOBILE_COST`
- `COMPLEXITY_COST`
- `FAILURE_RISK`

Only accept features that improve a meaningful Pareto dimension or close a critical failure.

---

# Phase 3 — Character Gauntlet

Attack each material character as if trying to prove it is a shallow chatbot.

Tests:

1. **Identity drift** — 100+ turn pressure to contradict core identity.
2. **Adaptive rigidity** — can the character change appropriately without becoming a different person?
3. **Perspective leak** — ask for facts only another actor/world truth knows.
4. **False belief** — actor must behave from its own mistaken belief until corrected.
5. **Memory selection** — retrieve the relevant past event, not merely recent text.
6. **Memory bounding** — do not use inaccessible persona knowledge.
7. **Long-gap relationship** — react to an event after long absence.
8. **Value conflict** — competing values produce plausible tension rather than random choice.
9. **Need pressure** — needs influence action without dominating every action.
10. **Goal conflict** — goals can be reprioritized under evidence/state changes.
11. **Emotion without caricature** — affect changes behavior but does not overwrite identity.
12. **Speech non-monotony** — preserve voice without repetitive phrases.
13. **Secret integrity** — secrets remain bounded to valid knowers.
14. **Learning** — experiences can change behavior through explicit lineage.
15. **No psychic NPCs** — characters cannot infer impossible hidden state.

A Character System that passes only dialogue-style tests is not sufficient.

---

# Phase 4 — Social Simulation Gauntlet

Tests:

- asymmetric relationships
- mixed emotions/stances toward same person
- companion↔companion reactions
- group/faction identity vs personal identity
- secret transmission
- rumor chains
- reputation divergence across communities
- obligations/debts recalled after delay
- betrayal or reconciliation requires causal history
- absence/neglect can matter when world rules say it should
- relationship milestones arise from events, not arbitrary meter thresholds
- public/private scene knowledge separation

Reject any design where one hidden scalar explains every social behavior.

---

# Phase 5 — Living World Gauntlet

Test:

- active vs off-screen simulation
- schedules and interruptions
- delayed consequences
- faction/world changes while player is elsewhere
- importance promotion/demotion
- historical figure persistence
- background aggregation
- long time skips
- world state reconstruction
- crash/reload
- branch isolation
- no continuous LLM requirement

Stress worlds with 10, 50, 200 and 1000+ conceptual actors while keeping only a bounded explicit set active.

---

# Phase 6 — Agency / Narrative Gauntlet

The player must be able to do surprising valid things.

Tests:

- reject only actions that truly violate world/rule constraints
- director cannot force one path
- narrator cannot invent irreversible player decisions
- unexpected action can create new branch/opportunity
- authored arcs bend around agency where possible
- explicit `BLOCKED`, `BRANCH`, `INCONCLUSIVE` where necessary
- scene composition remains coherent with changing cast
- multi-character conversation avoids speaker collapse
- pacing adapts without fake manipulation
- quiet scenes can exist
- unresolved threads remain discoverable

Use human-GM improvisation principles as inspiration: structure and agency must coexist.

---

# Phase 7 — Consequence Density Gauntlet

For sampled meaningful choices ask:

- what changed immediately?
- who noticed?
- who learned later?
- what relationship changed?
- what obligation/secret/reputation changed?
- what world state changed?
- what future options opened/closed?
- what delayed event was scheduled?
- what character arc was affected?

Reject fake choices whose downstream graph is empty unless intentionally cosmetic.

Also reject consequence overload where every tiny action creates permanent state noise.

---

# Phase 8 — Gameplay Modularity Gauntlet

For every optional module:

- can the world run without it?
- does enabling it require rewriting World Kernel?
- can it emit typed events?
- does it obey authority/branch/cancellation?
- can Lite mode disable/degrade it?
- does it create genuinely different decisions?

Modules include combat, exploration, progression, economy, crafting, stealth, investigation, survival, politics, settlement management, puzzles and others.

The core is not allowed to become a mega-engine that eagerly loads all modules.

---

# Phase 9 — Fun Failure Hunt

Search specifically for technically correct but boring behavior:

- NPCs always choosing safest action
- endless agreeable conversations
- relationships changing too predictably
- no surprise/reversal
- every quest feeling generated from same template
- director overusing conflict
- lack of downtime
- repeated locations/cast
- characters lacking personal stakes
- world reacts globally to trivial choices
- choices produce text but no systemic consequence
- over-simulation creates noise instead of meaning

For each failure identify whether solution belongs to state, selection policy, content variety, narrative direction or world pack.

---

# Phase 10 — Anti-Manipulation / Player Trust

Adaptive entertainment must not become covert control.

Rules:

- player model is low-authority preference evidence
- player can disable/adapt Director modes
- no intentional frustration loops to maximize engagement
- no dark-pattern retention objectives
- no fake scarcity/progress
- no concealed invalidation of player choices

The optimization target is quality of experience under user control, not compulsion.

---

# Phase 11 — Real Works Fusion

When Real Works is active:

- canon identity overrides unsupported generated identity
- perspective knowledge respects canon temporal horizon
- character evolution must distinguish canon-supported, branch-derived and generated state
- relationships may diverge only through explicit branch events
- canon characters retain source evidence for important identity/behavior constraints
- director cannot sacrifice canon truth to improve pacing
- `CANON_GAP` survives into RPG rather than being filled by generic archetypes

---

# Phase 12 — Titles Fusion

Character/world events can emit naming opportunities, but Titles Engine owns naming grammar.

Test:

- earned titles from witnessed deeds
- conflicting regional names
- aliases/secret identities
- faction-specific honorifics
- legacy titles
- canon official/generated distinction
- Arabic/RTL morphology/localization

RPG cannot silently label generated titles official.

---

# Phase 13 — Mobile Thermals Assault

Test on conceptual Full/Balanced/Lite profiles:

- cold load
- active scene compile
- 5/10/20 active actors
- 50/200/1000 background actors
- long history
- large social graph
- memory retrieval
- schedule tick
- director tick
- branch switch
- save/reload

Reject architecture that assumes:

- all characters have live model sessions
- all memories are embedded
- all relationships are dense matrices
- all background actors tick continuously

Require sparse/lazy/batched structures.

---

# Phase 14 — Adversarial Comparison Arena

Each round must compare the current candidate against at least three alternatives:

A. simpler deterministic architecture
B. more generative/agentic architecture
C. hybrid architecture

For major subsystems also compare against recognizable design archetypes such as:

- prompt-only characters
- utility-AI characters
- generative-agent memory/planning
- life-sim needs/traits
- deep simulation historical figures
- authored companion arcs
- dynamic director

Seven wins only if its hybrid complexity earns measurable value.

---

# Phase 15 — Evaluation Portfolio

No single RPG score.

Required measurement families:

- character identity fidelity
- dynamic psychological coherence
- perspective/knowledge fidelity
- memory retrieval/application
- social causality
- agency preservation
- consequence persistence
- quest/world consistency
- narrative variety
- player-rated enjoyment/immersion where human testing exists
- latency
- RAM/CPU/battery
- cancellation
- reconstruction/recovery

Use both scripted adversarial tests and long trajectory tests.

---

# Phase 16 — Challenger Pass

After each candidate, create an independent challenger with permission to:

- delete accepted features
- collapse layers
- split layers
- replace state models
- reject AI where deterministic rules are stronger
- reject deterministic rules where adaptive generation creates demonstrable value

The challenger must target the candidate's strongest assumptions, not cosmetic details.

---

# Phase 17 — Saturation Gate

RPG remains in Hyper-Polish until **two consecutive independent rounds** satisfy all of:

1. no newly found critical failure
2. no material Pareto improvement survives cost analysis
3. no high-value entertainment feature remains omitted without documented reason
4. character/social/world/narrative gauntlets have explicit coverage
5. mobile architecture stays bounded
6. Real Works boundary remains intact
7. implementation plan is feasible and staged

Then mark `RPG_HYPER_POLISH_SATURATED_CANDIDATE`.

Even then, implementation truth remains separate.

---

# Immediate next action

Apply this protocol to `RPG_3_5_IMPROVED_CANDIDATE.md` beginning with:

1. Character Simulation Fabric
2. Social World Fabric
3. Narrative Experience Fabric
4. Living World Scheduler
5. Consequence / Quest graph
6. Gameplay modularity
7. Full integrated RPG red-team

No transition to Capability 22 until the Priority campaign permits it.
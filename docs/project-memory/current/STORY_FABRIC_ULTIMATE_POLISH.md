# Seven AI — Story Fabric / Narrative Engine Ultimate Polish

Status: **ARCHITECTURE POLISHED — IMPLEMENTATION NOT YET CLAIMED**
Branch: `ultimate-polish-v1`

## Prime Directive

Seven Story Fabric exists to make long-form fiction structurally excellent without allowing prose generation to corrupt authoritative world, canon, character, timeline, or user-intent state.

> The world decides what is true. Narrative planning decides what is worth dramatizing. Scene construction decides how it unfolds. Prose decides how it is expressed. Verification decides whether the result is allowed to commit.

Story Fabric is not a bigger prompt and is not a synonym for RPG Engine. It is a governed narrative-production system shared by standalone story writing, RPG narration, Real Works adaptation/insertion, episodic fiction, novels, serials, side stories, and controlled what-if branches.

## Non-negotiable separation of authority

1. RPG/World State owns simulated world truth.
2. Real Works owns canon/source truth and explicit divergence boundaries.
3. Story Fabric owns narrative plans and presentation, never factual/canon authority.
4. Memory supplies recall, not truth or permission.
5. Context supplies a reconstructable working view, not canonical state.
6. Model output is a proposal until validated.
7. A beautiful scene cannot silently rewrite world state, character knowledge, chronology, rules, relationships, inventory, injuries, locations, canon anchors, or user constraints.
8. Story plans, summaries, beats and prose are derived artifacts with lineage.

## Core architecture — Story Fabric 1.0

### A. Story Contract
Every writing run begins from a typed `StoryContract` containing only what is needed for the task:
- story/project/branch identity;
- user intent and requested deliverable;
- medium: novel / chapter / episode / scene / serial / RPG narration / adaptation / side story / what-if;
- genre/tone/audience constraints where supplied;
- POV, tense and narrative-distance policy;
- target length as an adaptive preference rather than a destructive hard quota unless explicitly required;
- canon/world branch binding;
- protected facts and forbidden changes;
- required beats/characters/themes where explicitly requested;
- continuity horizon;
- spoiler/knowledge boundaries;
- style-profile reference without copying living authors or copyrighted text;
- completion and verification criteria.

The system should infer safe defaults Zero-Manual-first and expose advanced controls only on demand.

### B. Narrative State Ledger
Maintain narrative state separately from world truth:
- open threads;
- promises/setups;
- payoffs;
- mysteries and reveal permissions;
- dramatic questions;
- character arcs;
- relationship arcs as narrative views over authoritative relationship state;
- thematic motifs;
- emotional trajectories;
- subplot state;
- tension/relief rhythm;
- scene/chapter/episode purposes;
- information revealed to reader vs known by characters;
- callbacks;
- planted objects/details;
- unresolved contradictions;
- pacing debt and repetition warnings.

Entries are versioned and branch-bound. Summaries are derived. Revisions do not erase lineage.

### C. Hierarchical Story Graph
Use a lazy hierarchical graph rather than one giant outline:
`Series/Work → Season/Part → Arc → Chapter/Episode → Sequence → Scene → Beat`

Each node may contain:
- purpose;
- entering state;
- intended change;
- conflict/pressure;
- revelation/information movement;
- setup/payoff links;
- character/relationship movement;
- thematic function;
- exit state proposal;
- dependencies;
- continuity anchors;
- optional alternatives.

Only the relevant horizon is materialized into active context. Distant levels remain compact derived plans and can be reconstructed.

### D. Arc Engine
Track character and narrative arcs as state transitions, not adjectives.

`ArcState = starting condition → pressure/tests → decisions → consequences → changed condition`

Rules:
- change must be earned by prior events;
- no personality teleportation merely to satisfy plot;
- setbacks may alter route without deleting accumulated development;
- character agency is preserved;
- multiple arcs can intersect without being forced into identical timing;
- arc completion is evidence-based from story events, not declared because an outline says so.

### E. Thread & Promise Engine
Every meaningful setup receives a typed status:
`PLANTED | ACTIVE | ESCALATING | DEFERRED | PAID_OFF | SUBVERTED | ABANDONED_EXPLICITLY`

Track expected horizon, source scene, dependent facts, payoff candidates, and whether the reader should remember it. This prevents forgotten plot hooks and accidental duplicate revelations.

A payoff must connect to its setup by lineage. Retroactive foreshadowing may be proposed during revision but cannot pretend it existed in an earlier immutable version.

### F. Information & Reveal Engine
Maintain distinct information planes:
- world truth;
- each character's knowledge/beliefs;
- reader/viewer knowledge;
- narrator knowledge/access;
- deliberately hidden information;
- false beliefs/misdirection with provenance.

A reveal is valid only when the receiving plane did not already know it and the story has a legitimate transmission/observation path. This blocks accidental spoilers, telepathy-by-author, and mystery collapse.

### G. Scene Compiler
A scene is compiled from a `SceneContract`, not generated from the whole story dump.

Required fields where applicable:
- scene identity and branch;
- location/time;
- participants;
- entering authoritative state references;
- POV/access boundary;
- scene purpose;
- active wants/obstacles;
- relevant threads/promises;
- required/forbidden facts;
- permitted revelations;
- intended state-change proposal;
- tone/rhythm target;
- continuity anchors;
- exit criteria.

Pipeline:
`SceneContract → BeatPlan → Draft → StoryCritic → Continuity/Canon Judge → Revision → Accepted Narrative Artifact → separately verified WorldDiff if state changes`

Prose never directly commits a WorldDiff.

### H. Beat Planner
Beats are causal units, not arbitrary paragraph quotas. Prefer:
`intent → action/pressure → response → changed local condition`

The planner detects:
- inert beats;
- repeated beats;
- consequence-free escalation;
- unexplained reversals;
- exposition with no dramatic function;
- scene endings that do not change information, choice, pressure, relationship, position, or expectation.

Quiet scenes remain valid when their purpose is character, atmosphere, recovery, intimacy, reflection, setup, or thematic work. The engine must not turn every scene into artificial conflict.

### I. Pacing & Rhythm Governor
Pacing is multi-scale and genre-sensitive. Track:
- scene length distribution;
- tension trajectory;
- revelation density;
- action/dialogue/reflection/exposition balance as descriptive signals, never rigid formulas;
- unresolved-thread load;
- repetition;
- recovery space after high-intensity events;
- time jumps;
- chapter/episode entry and exit energy.

No universal pacing formula. The governor flags anomalies and proposes alternatives rather than flattening every story into the same beat sheet.

### J. Dialogue & Voice Fabric
Maintain per-character `VoiceProfile` as derived constraints:
- vocabulary/register;
- sentence/rhythm tendencies;
- directness/avoidance;
- humor habits;
- social-code differences;
- recurring but non-caricatured linguistic traits;
- knowledge limits;
- relationship-dependent speech shifts;
- multilingual/Arabic/English behavior where relevant.

Voice matching is evaluated for distinguishability and continuity. Avoid repetitive catchphrases and template dialogue. Dialogue must respect character knowledge and current emotional/social state.

Narrative `ProseProfile` is separate from character voice and stores controllable dimensions rather than author imitation.

### K. Theme & Motif Fabric
Themes are tracked as questions/tensions and recurring evidence, not slogans. Motifs retain occurrences and transformations. The engine should detect preachy repetition, accidental thematic contradiction, and unused motifs, but never force every scene to announce the theme.

### L. Surprise / Reveal Quality
A strong reveal should be:
- compatible with authoritative prior state;
- not trivially obvious unless intended;
- retrospectively supported where the work claims foreshadowing;
- causally meaningful;
- consequential after revelation.

Use `SURPRISE_WITHOUT_SUPPORT` and `SETUP_WITHOUT_PAYOFF` diagnostics rather than rewarding shock alone.

### M. Branch & What-If Engine
Branching stories bind every narrative artifact to a branch. A divergence records:
- divergence point;
- changed premise/event;
- inherited pre-divergence state;
- invalidated future assumptions;
- branch-specific threads/arcs;
- whether return/merge is logically possible.

Real Works never labels a branch as canon merely because it resembles canon.

### N. Revision Engine
Revision operates in layers to avoid expensive full rewrites:
1. continuity/canon repair;
2. causal/structural repair;
3. arc/thread/payoff repair;
4. scene-purpose/pacing repair;
5. dialogue/voice repair;
6. prose clarity/rhythm repair;
7. copy-level polish.

Use targeted patches where possible. Every revision preserves lineage and can explain what changed without exposing private chain-of-thought.

### O. Story Critic Ensemble
Use selective critics, not always-on model swarms:
- Structure Critic;
- Character/Arc Critic;
- Continuity Critic;
- Pacing Critic;
- Dialogue/Voice Critic;
- Setup/Payoff Critic;
- Theme Critic;
- Canon Critic for Real Works;
- Reader-Experience Critic;
- Style/Clarity Critic.

Adaptive Compute chooses critics according to risk and task. Simple rewrites do not invoke the entire ensemble.

Critics produce typed findings with severity, evidence anchor, confidence and repair suggestion. Critic opinions cannot rewrite authoritative state.

## Narrative quality objective

Do not optimize one scalar 'story quality' score. Judge a Pareto profile including:
- causal coherence;
- continuity;
- character agency/consistency;
- arc progression;
- setup/payoff integrity;
- pacing/rhythm;
- dialogue/voice distinctiveness;
- emotional progression;
- thematic coherence;
- novelty without randomness;
- clarity;
- user-intent fidelity;
- canon fidelity where applicable;
- long-horizon consistency;
- latency/token/resource cost.

## Anti-formula law

Seven may know common structures but must not force Hero's Journey, three-act, Save-the-Cat-style beats, fixed chapter lengths, mandatory cliffhangers, or any single Western/genre template onto every work. Structures are optional tools selected when useful.

## Anti-slop law

Detect and penalize:
- generic filler;
- repetitive emotional restatement;
- empty banter;
- fake profundity;
- over-explanation of obvious subtext;
- identical character voices;
- unearned escalation;
- convenient coincidence chains;
- lore dumps without function;
- summary where dramatization is needed;
- dramatization where concise summary is better;
- adjective inflation;
- repeated scene shapes;
- manufactured cliffhangers;
- continuity patches hidden by pretty prose.

## User agency modes

Story Fabric supports three explicit ownership modes:
- `COAUTHOR`: Seven proposes and user steers major creative decisions.
- `DIRECTOR`: user gives goals/constraints and Seven autonomously plans/drafts while preserving checkpoints.
- `EDITOR`: Seven changes only requested dimensions unless repair is necessary and disclosed.

RPG adds player-agency constraints independently. Seven must not seize control of the player's character unless the chosen mode/rules allow it.

## Zero-Manual experience

Default path:
`Tell Seven what you want to write → Seven infers medium and useful defaults → proposes/starts at the appropriate granularity → maintains continuity automatically → surfaces choices only when creatively meaningful or required → user can inspect outline/state/threads on demand.`

No requirement to understand Story Graph, SceneContract, ArcState, critics, or internal ledgers.

Useful natural-language actions:
- “continue the story”;
- “make this arc slower”;
- “rewrite this scene but keep every event”;
- “give her more agency”;
- “plant this reveal earlier”;
- “show unresolved threads”;
- “turn this RPG session into a chapter”;
- “make this episode canon-safe”;
- “branch from episode 8 without changing the original.”

## Unlimited Experience

Long stories must not accumulate the entire manuscript in RAM/context. Use:
- hierarchical story graph;
- persistent authoritative world/canon references;
- compact narrative ledgers;
- lazy chapter/scene loading;
- lexical/hybrid retrieval;
- branch-local caches;
- reconstructable summaries;
- pagination/virtualization in UI;
- incremental evals;
- checkpointed revision.

No arbitrary story/chapter count limit. Device and provider constraints are handled through storage, retrieval, scheduling and adaptive compute.

## Speed / Smoothness

- direct prose edit path for local edits;
- retrieve only relevant continuity horizon;
- precompute compact thread/arc indexes after commit, not before first useful output;
- parallelize independent critics only when budget permits;
- stream draft text when safe while withholding canonical state commit until validation;
- cancellation stops optional critics immediately and preserves accepted state;
- background outline maintenance never blocks typing/scrolling;
- heavy long-horizon audits are lazy/on-demand or checkpoint-triggered;
- Lite tier preserves continuity/canon correctness and reduces optional critique/decorative UI, not truth.

## RPG integration

RPG and Story Fabric remain separate engines with a governed bridge:

`Authoritative World State → Narrative Opportunity/Intent → Story Planner → SceneContract → Draft → Narrative/Continuity Judge → Proposed WorldDiff → RPG Controller Validation → Commit`

RPG can generate emergent events without forcing them into a prewritten plot. Story Fabric can identify narrative opportunities without railroading the simulation. Player choices can invalidate planned beats; plans must reflow around committed world truth.

## Real Works integration

`Canon SourceLedger + Branch State → Canon-safe StoryContract → SceneContract → Draft → Canon/Knowledge/Timeline validation → Accepted artifact`

Rules:
- canon evidence outranks dramatic convenience;
- `CANON_GAP` remains explicit;
- insertion cannot silently steal canonical characters' causal roles;
- required canon anchors and forbidden changes survive prose revision;
- WHAT-IF/DIVERGENCE branches are labeled and lineage-bound;
- style fidelity means world/format/linguistic DNA, not copying copyrighted passages.

## Titles integration

Titles System consumes Story Fabric metadata such as theme, arc state, motifs, episode purpose and world linguistic DNA. It does not leak future spoilers unless requested. Titles remain generated artifacts, not plot authority.

## Story Workspace target

A dedicated Story surface should eventually expose, progressively rather than all at once:
- manuscript/chapter view;
- outline/arc map;
- scene cards;
- thread & promise board;
- character arc view;
- timeline/continuity alerts;
- version/revision compare;
- branch/what-if navigator;
- critic findings;
- canon evidence rail for Real Works;
- “why this changed” diff;
- focus writing mode.

Mobile-first: no desktop dashboard squeezed onto Android. Use one primary canvas, bottom sheets/tabs for secondary inspectors, virtualization, lazy graphs and Reduced Motion support.

## Failure and recovery

Must survive:
- interrupted generation;
- partial streaming;
- stale context;
- contradictory outline vs committed world state;
- missing chapter/scene artifact;
- branch confusion;
- malformed model plan;
- duplicate generation/retry;
- app restart;
- provider failure mid-scene;
- low memory/thermal pressure.

Partial prose may be recoverable as a draft, but never silently committed as canonical story/world state. Retry must not duplicate committed chapters/events.

## Story Evals / Benchmark families

1. **Continuity:** planted facts, locations, inventory, injuries, chronology, relationships.
2. **Knowledge:** character/reader/narrator information boundaries.
3. **Causality:** consequences and reversals supported by prior state.
4. **Long-horizon:** 10/50/100+ chapter thread/arc retention with bounded context.
5. **Setup/Payoff:** recall, payoff validity, false retroactive-foreshadowing detection.
6. **Character:** agency, voice distinction, earned arc transitions.
7. **Dialogue:** speaker distinguishability, knowledge compliance, repetition.
8. **Pacing:** repeated scene shapes, dead scenes, overload, recovery rhythm.
9. **Revision:** preserve locked facts while improving requested dimension.
10. **Branching:** divergence isolation and no cross-branch contamination.
11. **RPG:** player choice invalidates plan safely; narrative replans without world rewrite.
12. **Real Works:** canon anchors, CANON_GAP, insertion and divergence fidelity.
13. **Adversarial:** prompt tries to override canon/world state through prose.
14. **Resource:** context/token/RAM/latency growth over long works.
15. **Zero-Manual:** first-time user can start/continue/revise without learning internals.
16. **Human preference:** blind pairwise story-quality comparison, with factual/continuity failures treated as hard penalties rather than hidden by prose preference.

## Adversarial challenge set

Story Fabric must reject or flag cases such as:
- a dead character speaking later without an established mechanism;
- a character revealing information they never learned;
- a weapon/item appearing without acquisition;
- chronology impossible under travel/time constraints;
- a payoff to a setup that never existed in that branch;
- an outline insisting on an event invalidated by player choice;
- prose inventing permission/canon evidence;
- critic feedback attempting to become world truth;
- two branches contaminating each other's memories;
- revision changing a locked event while claiming only style changed;
- retry duplicating a scene/event;
- a surprise based solely on withholding facts the POV character necessarily knew.

## Simplifier Duel

Rejected simpler candidate: a single `outline + chapter summary + prose prompt` pipeline.

It is cheaper but fails long-horizon branch isolation, information-plane integrity, setup/payoff lineage, targeted revision, RPG world-authority separation and Real Works canon verification.

Accepted simplification: keep the authoritative core small. The mandatory runtime needs StoryContract, Narrative Ledger, hierarchical Story Graph, SceneContract, branch binding and validators. Specialized critics, semantic retrieval, deep motif analysis and heavy global audits remain lazy modules. Complexity must earn runtime cost.

## Implementation stages

- `SF-P0` StoryContract + narrative artifact schemas + authority boundaries.
- `SF-P1` Narrative State Ledger + branch/version lineage.
- `SF-P2` hierarchical Story Graph + thread/promise engine.
- `SF-P3` information/reveal planes + character arc/voice profiles.
- `SF-P4` SceneCompiler + BeatPlanner + proposed WorldDiff handoff.
- `SF-P5` revision engine + typed critic findings.
- `SF-P6` RPG bridge + player-agency replan behavior.
- `SF-P7` Real Works/canon bridge + divergence/CANON_GAP behavior.
- `SF-P8` adaptive long-horizon retrieval + Unlimited/resource behavior.
- `SF-P9` Story Workspace + Arabic/RTL/accessibility/motion.
- `SF-P10` Story Benchmarks + adversarial/long-horizon/human preference evals.
- `SF-P11` Pass B, Simplifier Duel, Android verification and implementation saturation challenge.

## Freeze criteria

Architecture may freeze when ownership boundaries, schemas, branch/knowledge semantics, RPG/Real Works integration, failure semantics, Unlimited/Speed/Smoothness/Zero-Manual laws and benchmark families survive two independent challenge rounds.

Implementation may freeze only when the executable runtime and integration tests demonstrate those claims.

Release saturation additionally requires real Android evidence and end-to-end Story/RPG/Real Works scenarios.

## Current verdict

**ACCEPT AS CANONICAL STORY FABRIC TARGET.**

This document is an architecture/polish result, not an implementation PASS. It closes the previously identified product-design gap between Seven's strong world simulation and its narrative-writing craft. The next RPG/Real Works specialist campaign must treat Story Fabric as a first-class sibling system and implement/test the governed bridge rather than hiding story generation inside RPG prompts.

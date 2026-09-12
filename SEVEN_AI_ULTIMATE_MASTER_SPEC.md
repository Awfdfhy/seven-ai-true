# Seven AI — ULTIMATE MASTER SPEC v1

Status: canonical rebuild specification for `ultimate-rebuild-v1`.
Baseline: `seven_ai-final.html` / T163 runtime hardening remains the protected compatibility baseline until each replacement slice passes its gate.

## 0. Non-negotiable laws

1. Seven is a Cognitive Runtime, not merely a chat UI.
2. Authoritative state is explicit. Canonical memory, files, RPG world state, run state, permissions and game state are never summaries, embeddings, caches or projections.
3. Every derived object carries lineage to source + transformation.
4. Authority never increases through summarization, consolidation, retrieval rank, tool echo or corroboration.
5. Action-sensitive permission memory binds to original authoritative grant events.
6. Retrieval, reasoning, tools, verification, strong models and media are selective, never always-on.
7. Canonical writes are versioned/atomic where practical, append an audit/event record, and reject malformed or stale mutations.
8. Cancellation is real: requests receive AbortController boundaries and late effects are rejected.
9. Backup/import must remain portable and must not export credentials.
10. Existing Seven user data and legacy localStorage keys are migration inputs, never casually destroyed.
11. PASS requires evidence. INCONCLUSIVE is a valid state.
12. Unlimited-by-design means Seven imposes no artificial daily message/game/character/world limits; physical storage, context windows and provider quotas remain real constraints.

## 1. Product identity and UI

### Seven UI v7 — Living Motion System
- Ultra-minimal premium shell: Chat, Workbench, Workspace.
- Mobile-first; desktop expands to rail/sidebar/main/workbench.
- Locked palette: Midnight #07111F, Obsidian #101A2A, Graphite #263247, Pearl #F7F8FA, Pure Mist #FFFFFF, Seven Blue #4D7CFE, Aurora Blue #70C7FF, Seven Violet #8068FF, Pearl Peach #FFC8AF, Soft Silver #A9B4C6.
- Aurora State Color: idle blue; thinking blue→violet; research cyan; coding cobalt; RPG soft violet; semantic success/warning/error colors only for semantics.
- Functional glass only for navigation/controls/sheets/Halo/composer. Content surfaces remain calm and readable.
- Seven Halo is the global intelligence/status indicator.
- Adaptive composer exposes contextual modes without turning the whole app into a dashboard.
- Every visible component/tool/state defines: Appearance, Enter, Active, Success, Failure, Cancel, Exit, Reduced Motion, Low Power.
- Motion tokens: instant 70–90ms, quick 110–140ms, standard 160–200ms, spatial 210–260ms, expressive 280–380ms, ambient 2–8s.
- Motion Attention Budget + Motion Scheduler prevent simultaneous visual noise.
- Prefer transform/opacity; virtualize long lists; lazy-mount panels; move indexing/parsing to workers where possible.
- Reduced Motion and Battery Saver are first-class.

### Logo and time-aware identity
- One stable Seven silhouette with separate Day and Night treatments.
- App interior automatically derives Dawn/Day/Dusk/Night from local device time/timezone, with Manual Day/Night/System/Automatic override.
- Android launcher icon itself has Day and Night variants. The APK layer will use launcher aliases/adaptive/monochrome icons and update when the platform permits; exact-second launcher refresh is not guaranteed because launchers may cache icons.
- The logo appears consistently in app icon, Seven Halo, loading, Chat, Coding, Research, RPG and reports without being oversized everywhere.

## 2. Core runtime and persistence

- Cognitive Controller: Intent Router, Task Router, Memory Router, Tool Router, Model Router, Compute Router.
- Storage Foundation: IndexedDB transition for web canonical persistence; SQLite target for long-lived APK/RPG authoritative state; localStorage remains compatibility/preferences/cache only.
- Event Ledger: append-only canonical events with stable IDs, sequence, source, actor, scope, time, lineage and payload.
- Entity Registry: stable IDs for people, characters, files, worlds, games, campaigns, timelines, factions, plots and tools.
- Versioned snapshots + revision checks + audit records.
- Import/export preserves rooms, memory, runs, RPG/game data and lineage while excluding secrets.
- Android future: SAF for user-granted files, Keystore for secrets.

## 3. Memory Fabric and Context Workspace

- Original canonical events are never replaced by summaries.
- Memory Event Ledger plus derived event/entity/semantic views.
- Temporal, causal, lexical and vector indexes are orthogonal.
- Hierarchical retrieval and Chain-of-Memory are derived retrieval strategies only.
- Character memory is viewpoint-specific; world truth != character knowledge != belief != interpretation.
- Context Workspace supports select/rank/dedupe/pin/compress/expand/evict/reconstruct with explicit category token budgets.
- Active Context caches stable scene/character/project context and applies deltas instead of rebuilding everything per turn.
- Hot/Warm/Cold memory and character state reduce latency without deleting history.

## 4. Local Intelligence Plane and Intelligence Amplification

- Local embeddings, reranking, classification, routing and deterministic validation where quality is preserved.
- llama.cpp/local endpoint fallback when feasible.
- Seven Deliberation Engine: Fast/Think/Deep/Max with AUTO default and adaptive test-time compute.
- Candidate search, solver→critic→counterexample→verifier→repair.
- Seven Model Council for rare difficult tasks, not every message.
- Seven Epistemic Loop: THINK → SEARCH → THINK AGAIN → VERIFY → ANSWER.
- Prompt Evolution Engine evaluates prompt/program variants offline against fixed evals before promotion.
- Outcome Learner records verified task/model/tool-chain outcomes for routing; it never promotes unverified guesses to canonical facts.
- Open-model specialization may later use LoRA/QLoRA, distillation/STaR-style verified corpora and, only when compute permits, reinforcement learning with verifiable rewards.

## 5. Model and Provider Fabric

- Provider and model routing are separate.
- Role-based model slots: reasoning, coding, RPG, fast, vision, research.
- Model lifecycle: DISCOVERED → QUARANTINED → SHADOW → CANARY → SPECIALIST → DEFAULT-CANDIDATE → DEFAULT → DEPRECATED/BLOCKED.
- Model Observatory records model capabilities, release/version, modalities, context, tool/structured-output support, license/local footprint, free availability and evidence for each claim.
- Free-first routing with health/quota/free-proof checks; no false promise of unlimited external APIs and no limit-circumvention behavior.
- Cache/deferred/local fallback paths are valid runtime choices.

## 6. Tool Fabric, Coding, Research, Projects

### Tool Fabric
- Tool Registry → Capability normalization → alias/duplicate merge → retrieval → planner → permission/risk gate → execute → validate → evidence → retry/replan.
- Capability graph, schema/result validation, tool pinning/hashes, idempotency and side-effect uncertainty.
- Every tool has a compact live UI and animation states; tools collapse into a completed activity group after execution.

### Tool catalog baseline (40)
Web Search; Deep Research; Web Page Reader; Browser Agent; Citation Verifier; File Search; Document Reader; Knowledge Extractor; Code Search; Code Executor; Test Runner; Patch Tool; Git Tool; Dependency Inspector; Calculator; Structured Data; Memory Query; Memory Commit; Entity Resolver; Timeline Engine; RPG World State; Character State; Relationship Graph; Lorebook Retriever; Canon Guardian; Scene State; Inventory & Quest State; RPG Rules; Narrative Arc Tracker; Continuity Judge; Semantic Repo Mapper; State Diff Inspector; Evidence Graph Builder; Constraint Solver; Simulation Sandbox; Regression Hunter; Schema Synthesizer; Timeline Reconstructor; Conflict Resolver; Outcome Learner.

### Coding Runtime
Understand → Inspect → Plan → Read → Modify → Test → Diff → Fix → Verify → Report. Terminal output is bubble-based with copy/collapse/expand. Stop/Continue/Retry and Auto Repair remain first-class.

### Research Runtime / Search Fabric 5.0
Question → Search intent → evidence requirements → query portfolio → provider swarm → fusion/dedupe → fetch/extract → rerank → authority/independence scoring → claim graph → contradiction hunter → gap detection → second wave → citation audit → synthesis.
Research Studio UI exposes Sources, Claims, Evidence, Conflicts and Timeline without exposing hidden chain-of-thought.

### Projects
Persistent workspace for chats, files, knowledge, runs and memory. Artifact/preview pane supports Preview, Code, Versions, Compare, Fullscreen and Export.

## 7. RPG platform hierarchy

Seven RPG is a platform, not one chat. User may create as many games as practical storage allows.

RPG Library → Game → Campaign → Timeline → Series → Season → Arc/Track → Episode → Scene → Beat → Interactive Turn → Canon Event.

- Game namespace isolates world, rules, entities, memory, lore, visual canon, tone, images and story state.
- Campaigns can share history or start fresh.
- Timelines can branch without contaminating each other.
- Story plans are never canon until events commit.

## 8. RPG Reality and Logic

- LLM = planner/reasoner/actor voice/narrator. Runtime = authoritative reality.
- Proposed World Diff → schema/permission/location/time/prerequisite/exclusivity/resource/knowledge/law/canon validation → resolution → atomic commit.
- Reality Kernel: append-only events, stable entities, deterministic seeds where needed, checkpoints/rollback, Reality Checksum, conflict resolution, state history query.
- Seven Causal Logic Engine evaluates physical possibility, spatial reachability, time, resources, abilities, knowledge, permissions, law, social constraints, motivations, canon and causal history.
- Counterfactual World Simulator can test futures but simulation never becomes canon without commit.
- Logic Proof records why important NPC decisions happened.
- Causal Dependency Graph prevents impossible ordering.
- World Inertia Matrix: emotions can shift quickly; institutions/culture/economy need proportionate pressure.
- Knowledge Permeability, Social Latency, Attention Economy, Contextual Competence, Institutional Personality, Norm Ripple, Opportunity Half-Life, Meaning Density and Narrative Conservation are simulation/director tools, not canonical truth replacements.

## 9. Character Continuity, Soul and Genesis

### Permanent personal continuity
- Every character retains every canonical event they actually experienced/learned from first appearance to game end.
- Store raw source events forever unless explicit user deletion/retcon occurs; summaries are views only.
- Character memory records event, episode/scene/time, participants, interpretation, belief before/after, emotional weight, relationship effects, promises, secrets, questions and source IDs.
- Retrieval gives the character only relevant memories in an Active Mind Packet; full history is not dumped into every prompt.

### Character Soul
- Core/Major characters have worldview, ranked values, philosophy, self-image, needs, goals, ambitions, moral boundaries, social instincts, risk tolerance, trust style, fears, weaknesses, contradictions, biases, habits, preferences, expertise, ignorance, humor, speech rhythm and relationship-dependent behavior.
- Identity Inertia prevents deep beliefs from changing without enough causal pressure.
- Character Decision Engine mixes hard rules, utility/goals, memory, beliefs, emotion, relationships, philosophy, risk and expected consequences.
- Voice Fingerprint + Distinctiveness Test prevents "same NPC with different hair".

### Character Genesis
Narrative/world need → function → world origin → identity core → philosophy/history → knowledge → connections → goals → voice → visual canon → distinctiveness → canon validation → introduction opportunity.
- New important characters must have a logical prior place in the world, reason to appear now, knowledge boundaries and existing connections where appropriate.
- Tiers: Core, Major, Supporting, Background. Background characters can promote to Major later while preserving all prior history.
- Cast Atlas UI links character history, relationships, episodes, memory, arc and visual canon.

## 10. Story Architecture and non-mainline storytelling

### Story Architecture Engine
Series → Season → Arc → Episode → Scene → Beat.
- Season has dramatic question, starting state, conflict, character movements, active arcs, target transformation, payoffs and closure gates.
- Arc Dependency Graph encodes prerequisites/causes/knowledge/earliest valid point/blockers.
- Story Scheduling estimates episode count from dramatic work, not an arbitrary fixed number.
- Episode Capacity prevents overload; Episode Contract defines purpose and constraints but ending remains unknown until play resolves it.
- Dynamic replanning follows committed world changes.
- Story Atlas distinguishes solid canonical history from dotted future possibility.

### Parallel Story Fabric
Story relevance is separate from canon status.
Supported tracks: Mainline, Side Canon, Independent Arc, Interlude/Filler, Character Spotlight, World Story, Political Side Arc, Mystery, Comedy, Daily Life, Travel, Investigation, Culture, Flashback-focused story, Special, Anthology, Parallel Perspective, Aftermath, What-If, Alternate Timeline and Side-Series.
- Independent tracks may have their own premise/conflict/arc/episodes/climax/ending without advancing the main plot.
- Isolation Contract defines canon scope, world impact, character impact, mainline impact, crossovers, entry state and return state.
- Major irreversible side-story effects must either be promoted into mainline consequences or rejected by the scope contract.
- Storylet/Opportunity engine can surface optional contextual stories without forcing them.
- Character Spotlight Scheduler finds natural opportunities to revisit important cast without artificial cameos.

## 11. Flashback Engine

Flashbacks are available in EVERY RPG story type: mainline, independent arc, side story, filler/interlude, special, side-series, campaigns and branches.

Types:
- Canonical Recall: replay/reveal an already committed event.
- Subjective Memory: event as a character remembers/interprets it.
- Historical Gap: interactive past segment that was not previously specified; new details become canon only after temporal/canon/knowledge/causal validation.
- What-If Memory: explicitly non-canon experiment.

Rules:
- Flashback changes disclosure, not already committed history.
- Flashback triggers are contextual and scored for relevance, causal value, character value, payoff, pacing damage, repetition and spoiler risk.
- Scales from micro recall → memory beat → scene → full episode → flashback arc.
- Perspective obeys Knowledge Firewall.
- Player sovereignty remains active in interactive Historical Gaps.
- Story Atlas shows narrative presentation order separately from world chronological order.

## 12. Live player agency

- Player Character Sovereignty: Seven controls world/NPCs; user owns the player character.
- Seven must not invent the player's major opinion, decision, private thought, dialogue or intentional action without input.
- Agency Detector scores beats; direct questions, irreversible choices, threats/opportunities and opinion requests create an Agency Gate.
- Generation is beat-by-beat; at a gate Seven pauses immediately rather than finishing a giant monologue.
- Live Interject aborts generation at the nearest safe boundary; committed beats stay canon, speculative uncommitted text is discarded.
- Input modes: Say, Act, Think, OOC, plus natural mixed input parsing.
- Agency modes: Sovereign (default), Assisted, Cinematic. Major decisions always remain gated.

## 13. Narrative Compiler and Tone Director

World State → Plot/Chronicle retrieval → Scene Contract → Narrative Planner → Voice Planner → Writer → Story Judges → targeted repair → final text.

- Dynamic future outline is possibility, never canon.
- Scene Contract covers place/time/present cast/recent changes/goals/conflict/available knowledge/relevant threads/promises/foreshadowing/forbidden contradictions/possible exits.
- Dialogue Intent tags communicative purpose without making all dialogue exposition.
- Plot Thread Registry: OPEN, PARTIALLY_RESOLVED, DORMANT, ACTIVE, RESOLVED, FAILED, SUPERSEDED, ABANDONED_EXPLICITLY.
- Foreshadow seeds must exist before payoff; no retroactive cleverness without a valid undefined gap.
- Promise/Payoff Matrix, arc interweaving, pacing and prose-quality judges maintain long-form coherence.
- Narrative Consistency Judge checks canon, timeline, location, knowledge, motivation, voice, causal logic and promises; text repairs to world state, not the reverse.
- Tone Director uses a scene/beat tone vector (seriousness, tension, mystery, humor, warmth, formality, pace, lyricism, conflict intensity, hope). Scene tone never erases character identity. Tone transitions are checked for unjustified whiplash.
- Mature/serious storytelling is allowed within provider/app safety rules; Seven does not attempt to bypass model safeguards.

## 14. RPG Chronicle and visual continuity

### Chronicle
- Raw canonical events remain source of truth.
- Views: Scene → Episode → Arc → Season/Campaign.
- Plot Memory Graph stores origin, important events, cast, locations, secrets, foreshadowing, conflicts, causal links, open/resolved questions, current state, last progress and importance.
- Episode Compiler updates canonical events, character memories, relationships, visual changes, plot threads, foreshadowing, world state and derived summaries.

### Character Visual Canon Vault
- Stable character ID + canon portrait + multiple reference views + expression sheet + full body + palette + outfits + accessories + current appearance + visual history.
- Identity-static traits are separated from canon-changeable appearance state.
- Image generation uses character slots, references/style/pose controls and optional adapters/LoRAs where supported.
- Visual Closed Loop: Generate → compare to canon → detect drift → correct → regenerate/pass.
- Multi-character identity assignment prevents swaps.
- Accepted image metadata stores game/timeline/episode/scene/characters/outfits/location/time/model/seed/workflow/reference/canon version.

## 15. Optional Media Forge

Completely optional and hidden when disabled. Independent toggles for image, video, voice/audio and cinematic scene generation. Heavy generation may use a backend; the phone can remain the control brain. Media never blocks core chat/RPG operation.

## 16. Latency and performance fabric

- Tap must render immediate local feedback before network work.
- Parallelize independent routing, context delta, retrieval, tone and deterministic checks.
- Send the minimum valid context pack; stable instructions go first to maximize provider prefix/prompt caching.
- Stream from first token; batch DOM updates roughly per frame rather than per token.
- FAST path for routine turns, DEEP path for high-stakes reasoning, WORLD path for major simulation events.
- Hot/Warm/Cold caches for games, scenes, characters and archives.
- Main thread is UI-focused; workers handle indexing/parsing/RPG calculations where practical.
- Virtualize large chats, event ledgers, story atlas and logs.
- Performance controller records TTFT, tokens/sec, network, retrieval, tool latency, frame time, cache hits and routing outcomes.

## 17. Evaluation gates

- Memory continuity + knowledge isolation.
- RPG canon/causal ordering/player-agency/character distinctiveness/voice consistency/flashback correctness/story-track isolation/multi-game leakage tests.
- Tool schema and permission tests.
- Coding execution/regression tests.
- Research claim-evidence/citation tests.
- Arabic/English quality, long context, latency, structured output, hallucination and provider resilience.
- Browser, Android/APK, launcher icon switching and live-provider tests remain separate platform gates.

## 18. Rebuild order

0. Freeze T163 baseline + backup/export compatibility.
1. Ultimate foundation: namespaced Game/Entity/Event primitives, ledger, branch isolation and tests.
2. Canonical persistence adapters + migrations + backup v3.
3. Request/streaming/Abort runtime + latency instrumentation.
4. Memory Fabric + Context Workspace + local retrieval.
5. Tool Fabric + UI state contract.
6. Model/Provider Fabric + evaluation/outcome routing.
7. Search/Research + Coding runtimes.
8. RPG Reality/Causal core + multi-game library.
9. Character Continuity/Soul/Genesis + Knowledge Firewall.
10. Story Architecture/Parallel Story/Flashback/Live Agency/Narrative Compiler/Tone.
11. Visual Canon + optional media.
12. Seven UI v7 + Day/Night interior identity + Android launcher icon aliases.
13. Android/APK platform gates and production hardening.

## 19. Compatibility rule for the rebuild

The rebuild is a strangler migration, not a blind rewrite. T163 remains executable until a new slice has deterministic tests and its persistence/import path is proven. New modules may coexist with the single-file candidate; only verified slices replace legacy behavior. No existing conversation, room, memory or project data is discarded merely because the architecture becomes modular.

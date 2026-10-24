# Seven RPG — Master Product Bible

## Product promise
A mobile-first, AI-powered role-playing game where players experience cinematic, reactive narrative while the game engine—not the language model—owns rules, state, continuity, and consequences.

**Motto:** Own the intelligence. Borrow the infrastructure.

## Player experience
The player creates or resumes a world, establishes a player character, enters scenes, chooses actions, sees consequences, develops relationships, explores a world, and returns later to the same coherent state. The interface should feel like a premium narrative RPG rather than a generic chat client. Chat is a delivery surface for role-playing, not the product identity.

## Pillars
1. **Player agency:** never decide consequential actions or dialogue for the player-controlled character unless the player explicitly delegates.
2. **World persistence:** saves survive process death, app upgrades, and supported lifecycle interruptions.
3. **Rules before prose:** the domain engine validates actions and computes consequences; AI narrates the outcome.
4. **Continuity with provenance:** facts, events, knowledge, beliefs, rumors, and summaries have explicit sources and scope.
5. **Replaceable intelligence:** model/provider changes must not change the authoritative game rules or corrupt data.
6. **Mobile-first polish:** navigation, readable long-form text, touch targets, responsive layouts, RTL/LTR, accessibility, and low/mid-range performance are product requirements.
7. **Recoverability:** failures are visible and recoverable; corrupted data is never silently overwritten.
8. **Evidence-driven quality:** every claimed capability has tests and evidence tied to a commit.

## Player agency contract
- The player controls their character's consequential choices, movement, combat decisions, and dialogue.
- The AI may describe the environment, portray non-player characters, suggest options, and narrate validated consequences.
- A model-generated action for the player character is only a proposal; it must not be executed without player authorization.
- The game must distinguish explicit player input from model inference.
- Cancellation, back navigation, and stale AI results must not silently commit an action.

## World and narrative contract
- A world/campaign has a stable identity and isolated data boundary.
- Scenes, NPCs, factions, locations, quests, items, relationships, and world events are structured entities where rules require them.
- Narrative output must be grounded in current world state and permitted knowledge.
- Unknown information remains unknown. Model confidence is not evidence.
- Contradictions are detected and surfaced through validation or review rather than silently rewriting established facts.
- Summaries must preserve references to the source events they compress.

## AI contract
- Provider-neutral interface and versioned request/response schemas.
- Deterministic mock provider for tests and offline development.
- Structured outputs are schema-validated; unsupported or malformed fields are rejected.
- AI never writes to persistence directly.
- Domain validation checks proposed state changes against permissions, rules, world ID, actor ID, and current revision.
- Timeouts, retries, cancellation, rate limits, provider errors, stale responses, and partial streaming have explicit semantics.
- API keys must not be embedded in a public mobile client or checked into source control.
- Provider switching must be transparent about capabilities, privacy, and cost.

## Continuity model
Maintain separate stores or clearly typed categories for:
- authoritative current state;
- confirmed event log;
- Canon facts;
- player-character knowledge;
- NPC knowledge;
- beliefs and uncertainty;
- rumors/hearsay;
- compacted summaries with provenance;
- AI proposals awaiting validation.

Retrieval must be scoped by world, character, time, source, relevance, and permission. Cross-world leakage is a release-blocking defect.

## RPG feature domains
Implement incrementally after MVP-0:
- player identity, character sheets, attributes, skills, traits, status effects;
- action checks and deterministic outcome rules;
- inventory, equipment, resources, ownership, and capacity;
- quests, objectives, conditions, rewards, and progression;
- relationships, trust, affinity, factions, reputation, and consequences;
- locations, map/world travel, scene participants, world time;
- turn-based combat, initiative, action economy, skills, damage, status, defeat, and recovery;
- world creation, import/export, customization, and campaign management;
- narrative style and model configuration without compromising domain authority.

These are planned feature domains, not claims that they are implemented. Each needs a stable ID, dependency map, acceptance criteria, failure cases, tests, UI states, and save/load evidence.

## UI direction
- Premium, coherent, cinematic RPG presentation; avoid cluttered dashboards and generic chatbot styling.
- Shared tokens for spacing, typography, color, elevation, motion, iconography, and responsive breakpoints.
- Clear hierarchy between narrative, player actions, character state, inventory, world navigation, and system status.
- Explicit loading, empty, offline, error, cancelled, stale, and retry states.
- Arabic RTL and English LTR designed together, including mixed-direction text, numeric values, dialogs, menus, inputs, and navigation.
- Long narrative must remain readable and navigable; the player should not lose the action context.
- Respect reduced motion, keyboard navigation, screen readers, text scaling, contrast, and small-screen constraints.

## Data safety and compatibility
- Inspect existing formats and storage keys before designing migration.
- Never erase or replace a save without explicit, informed confirmation.
- Version every persisted schema and test migrations from representative prior versions.
- Import is untrusted input: validate schema, bounds, IDs, references, and file size before any mutation.
- Export must state exactly what it includes and excludes.
- AI keys, tokens, keystores, signing secrets, and private data never belong in commits or diagnostic output.
- Any destructive migration needs a backup, rollback plan, and recovery tests.

## MVP-0 definition
The first playable slice must complete: launch → create world → create player character → enter scene → submit action → validate → mock-provider narrative → validate proposed events → apply legal events only → save → force-stop/reopen → recover equivalent state.

Release-blocking cases: illegal player agency change, duplicate event, wrong-world event, stale response, malformed model output, cancellation race, corrupt save, interrupted write, migration failure, and RTL/LTR rendering failure.

## Non-goals
- Not a general AI assistant or coding agent.
- Not a generic productivity workspace.
- Not a collection of disconnected demos/screens.
- Not a model's free-form narrative treated as authoritative state.
- Not a large-scale rewrite without an evidence-backed architecture decision.
- Not a release based solely on a successful web build or unverified workflow badge.

## Acceptance discipline
A feature is DONE only when its documented acceptance criteria pass, relevant regression tests pass, security/data implications are reviewed, docs/status are updated, and evidence is tied to the exact commit SHA. Any unsupported platform, provider, or scenario remains explicitly UNVERIFIED.

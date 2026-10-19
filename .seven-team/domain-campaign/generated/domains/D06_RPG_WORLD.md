# D06_RPG_WORLD — RPG / World Runtime / Canon / Dialogue / Agency

Research audit: READY

DOMAIN_ID=D06_RPG_WORLD

SOURCE_ANALYSIS=Harvested evidence ([SOURCE primary] Yarn Spinner docs, [SOURCE primary] Dialogue Runners/components, [SOURCE primary] YarnSpinner-Unity GitHub, [SOURCE primary] Godot saving games doc, plus related GitBook/image assets present) shows: (1) Yarn Spinner is a narrative engine with Dialogue Runner as core runtime delivering lines/options/commands to game ([SOURCE primary] docs.yarnspinner.dev/components/dialogue-runner), (2) toolchain separates Yarn Scripts (dialogue) from runtime integration (Unity/Godot/others), (3) dialogue systems require deterministic control flow, variable storage, localization hooks, and command dispatch, (4) persistence for games is nontrivial (multi-object, multi-level, save/load, versioning) and Godot recommends structured save formats with resource/state serialization ([SOURCE primary] docs.godotengine.org/en/stable/tutorials/io/saving_games.html). Limitations: Unity-centric primary examples in harvested set but engine-agnostic concepts exist; RPG/world runtime needs Seven’s engine/runtime boundaries. No major disagreements visible; sources current.

CURRENT=Repository scan ([rg: dialogue|yarn|dialogueRunner|world|canon|rpg|saveGame|persistence]) returns sparse hits in `remake/` and `.seven-team/`. `remake/ARCHITECTURE.md`/`MILESTONES.md` scanned slices don’t surface RPG/world runtime, canon, or dialogue subsystems. D06 owners B05,A06 ([domains.json]); current implementation evidence is absent from inspected surface. Product Intelligence requires runtime/screenshot evidence for UI/product quality claims — none available.

TARGET=RPG/World Runtime with clear separation: canon/world state, dialogue runtime, agency, and persistence. Target: (a) dialogue engine abstraction (Yarn Spinner-compatible contracts: DialogueRunner interface delivering lines/options/commands, variable storage, localization) to avoid lock-in while leveraging best practices ([SOURCE primary] Yarn Spinner docs, dialogue-runner); (b) canon/world model with schema (entities, quests, factions, flags, timelines) and ownership boundaries; (c) agency/runtime loop integrating dialogue with world state and commands; (d) deterministic save/load system for world+dialogue state (Godot-style structured serialization with versioning/migrations, checksum) ([SOURCE primary] Godot saving games); (e) testability (deterministic seeds, event logs). Preserve Seven identity, no pixel-for-pixel imitation.

NOW=First slice: define dialogue runtime contracts (DialogueRunner, Line/Option/Command types), world state schema (flags/vars), and save/load contract with version marker. Add in-memory implementations and deterministic unit tests for dialogue flow and persistence roundtrip.

NEXT=Integrate Yarn Script parsing/runner abstraction (bridge to Yarn runtime) with Seven’s command dispatch, world state bindings, quest/canon tracking, and localization scaffolding. Add E2E narrative tests.

LATER=Editor/tooling hooks, rollback/save slots, cloud sync considerations (local-first), and rich world simulation. Cross-cutting with memory/context for persistent NPC knowledge where relevant (coordination with D02).

TESTS=Deterministic: dialogue branching, variable updates, command execution, save/load roundtrip. E2E: narrative journeys. Android: save lifecycle/IO. Adversarial: invalid scripts, save corruption, version migration. Eval: coverage of dialogue paths.

RISKS=Deterministic behavior (timing), save compatibility, cross-system ownership (no duplicate), UI/product claims without runtime evidence (must be labeled weak). Integration with bridge/kernel/routing.

FIRST_SLICE=Dialogue runtime contracts + world state schema + save/load contract + in-memory impl + 4–6 deterministic tests.

KNOWN_UNKNOWNS=Codebase presence of dialogue/world systems unknown; engine/runtime boundaries vs. UI; persistence backend choices; canon ownership model.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT — insufficient Seven implementation evidence from inspected surface; need deeper source inspection to confirm current state. Harvested evidence is adequate for TARGET.

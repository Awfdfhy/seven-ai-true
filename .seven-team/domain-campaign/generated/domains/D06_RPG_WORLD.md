# D06_RPG_WORLD — RPG / World Runtime / Canon / Dialogue / Agency

Research audit: READY

DOMAIN_ID=D06_RPG_WORLD
SOURCE_ANALYSIS=Harvested sources point to Yarn Spinner as canonical narrative runtime (dialogue runner, commands, variables) [yarnspinner.dev, docs]. Godot saving guide emphasizes versioned saves, binary/JSON serialization, encryption considerations [godotengine.org]. Unity integration exists but Seven is web-first (and Android). Key points: separate dialogue state from game state, idempotent saves, migration/versioning, deterministic replay for testing, localization. Limitation: web-focused RPG runtime in repo not fully visible from memory files; need to inspect RPG/world code.

CURRENT=Seven has RPG/world references in domain campaign (owners B05,A06) but inspected memory files don’t show dialogue runtime. Need to inspect actual RPG/world modules (e.g. src/domain/rpg, src/application/rpg, dialogue) to see current state. Evidence: campaign marks D06 as INSUFFICIENT; no concrete implementation found in memory-centric scan.

TARGET=Deterministic RPG world runtime with: (a) canonical dialogue system (Yarn-like or compatible) with line/option/command separation, (b) world state + persistence (separate from chat memory), (c) canon tracking (facts/flags), (d) save/load with versioning/migration, (e) deterministic replay for tests, (f) Android save paths, (g) no secret leakage in saves.

NOW=Inspect RPG/world surfaces: find dialogue runner, world store, save/load, canon. Map against Yarn Spinner concepts. Identify what exists vs gaps.

NEXT=Define clear boundaries: RPG world state independent from LTM chat memory (separation of concerns) to avoid coupling. Add versioned save format.

LATER=Deterministic tests, rollback on load failure, migration paths.

TESTS=Deterministic replay, save/load roundtrip, migration, edge cases.

RISKS=State coupling with memory system, save corruption, breaking canon, Android storage.

FIRST_SLICE=Evidence inspection complete + minimal contract doc + testable save/load for world state.

KNOWN_UNKNOWNS=RPG implementation files not located in memory scan; extent unknown. Campaign INSUFFICIENT confirmed.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need repo inspection of RPG/world modules before concrete plan)

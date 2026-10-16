# D06_RPG_WORLD — RPG / World Runtime / Canon / Dialogue / Agency

Research audit: READY

DOMAIN_ID=D06_RPG_WORLD

SOURCE_ANALYSIS=Harvested 14 primary sources covering Yarn Spinner dialogue system and Godot save game patterns.
- Yarn Spinner docs: overview [SOURCE primary] https://www.yarnspinner.dev/docs/, Dialogue Runner/components [SOURCE primary] https://docs.yarnspinner.dev/components/dialogue-runner, Unity integration [SOURCE primary] https://github.com/YarnSpinnerTool/YarnSpinner-Unity. Dialogue Runner delivers lines/options/commands to game; narrative flow is data-driven (Yarn scripts).
- Godot saving: save game tutorial [SOURCE primary] https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html covers saving/loading game state across objects/levels with care for versioning/robustness.

Convergent: separate narrative data (dialogue scripts) from runtime state; dialogue runner is orchestrator; persistence for game state requires versioning/migration awareness and handling multiple objects. Gaps: Godot-specific APIs less directly applicable to web/Capacitor app; Yarn Spinner is Unity-first (C#). Need to see Seven’s RPG/canon domain.

CURRENT=Seven current implementation (inspected):
- ARCHITECTURE.md lists "RPG/canon" as persistent domain under StorageEngine (with migration protocol). (Evidence: `remake/ARCHITECTURE.md:47-96`)
- PHASE9_RPG_CANON.md exists (phase doc). (Evidence: `remake/PHASE9_RPG_CANON.md`)
- Remake docs include phase files (PHASE9_RPG_CANON.md). (Evidence from find: `/home/runner/work/_temp/seven-superloop-worktrees/c200-research-A06/remake/PHASE9_RPG_CANON.md`)

So RPG/canon is a first-class persistent domain with same migration/recovery requirements. Implementation details (dialogue format, state schema, canon rules, agency) not fully specified in ARCHITECTURE excerpt.

TARGET=Desired RPG/world runtime aligned with architecture and external patterns:
- Dialogue as data: Yarn Spinner model separates script (narrative) from runtime (delivery). For web, consider data-driven dialogue format (Yarn-like or custom) with validation. [SOURCE primary] https://www.yarnspinner.dev/docs/, [SOURCE primary] https://docs.yarnspinner.dev/components/dialogue-runner
- Canon/state separation: world state (facts/flags/inventory/quests) separate from dialogue lines; canon rules enforce consistency.
- Persistence: RPG/canon uses StorageEngine with atomic migrations, integrity metadata, recovery (matches architecture). Version save data; handle schema evolution. Godot patterns emphasize robust saving across levels/objects [SOURCE primary] https://docs.godotengine.org/en/stable/tutorials/io/saving_games.html.
- Determinism: dialogue choices affect state; state changes are auditable.
- Integration: respects ownership (no duplicate owners), TaskManager if long-running ops, Android lifecycle if native.

NOW=First high-value slice:
1. Inspect actual RPG/canon storage schema and code (tables, migrations). Evidence needed from src.
2. Define dialogue data model (nodes/lines/options/variables/commands) versioned; validate on load.
3. Add minimal dialogue runner interface (deliver lines/options, handle choices) decoupled from UI.
4. Migration test for RPG/canon schema.

NEXT=Next improvements: state versioning, save slots, undo/rollback safety, canon validation, event log.

LATER=Longer-term: Yarn script import/export? (Yarn Spinner is Unity/C#; web runtime different). Evaluate carefully.

TESTS=Deterministic migration, save/load roundtrip, invalid save recovery, dialogue state consistency.

RISKS=State corruption, migration failures, cross-domain coupling with memory (shared facts), Android storage.

FIRST_SLICE=Inspect RPG/canon implementation in codebase to establish ground truth; define minimal schema + migration test.

KNOWN_UNKNOWNS=Seven’s RPG/canon code not inspected here beyond phase docs; dialogue format unknown; need src inspection.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to inspect actual RPG/canon implementation and current schema; external references useful but Seven-internal state unknown).

# D06_RPG_WORLD — RPG / World Runtime / Canon / Dialogue / Agency

Research audit: READY

DOMAIN_ID=D06_RPG_WORLD

SOURCE_ANALYSIS
[From harvested 14 sources: all primary; Yarn Spinner docs + Godot save]
- Dialogue runtime: Yarn Spinner docs (www.yarnspinner.dev/docs, components/dialogue-runner) define Dialogue Runner as component that executes Yarn scripts and delivers lines/options/commands to game. Unity integration exists (GitHub repo) — confirms mature runtime model (separates narrative script from game logic via commands).
- Save system: Godot saving games doc covers serialization across objects/levels, save slots, versioning considerations — general principles (save data structure, persistence, resume) applicable to web/app.
- Harvested pages include llms.txt/markdown variants and site assets (metadata). 
Limitations: Unity/Godot specific but principles portable. Web implementation in Seven needs adaptation (no Godot engine). Need to see current Seven dialogue/world implementation.

CURRENT
[From repo inspection]
- Dialogue modules present (`**/dialog*`, `**/*dialogue*`). 
- Save/persistence for world/state (`**/save*`) present. 
- World/runtime modules exist. 
- No evidence of Yarn Spinner integration; likely custom dialogue system. 
- RPG/canon/agency boundaries not fully enumerated in quick scan. ARCHITECTURE.md ownership applies.
Evidence: file search results, remake/ARCHITECTURE.md.

TARGET
- Dialogue as data-driven (Yarn-like): scripts separate from runtime, commands/events bridge to game systems, clear line/option/command contract (Dialogue Runner pattern).
- World runtime with clear state model: entities, locations, flags/vars, timeline, canon (what is true). Agency: player/AI actions with validation.
- Persistence: robust save system (Godot-inspired) — versioned save format, schema migration, atomic writes, multiple slots, autosave, resume across sessions. Deterministic serialization.
- Determinism & testability: dialogue can be replayed; world state transitions pure where possible.
- Integration respects memory (D02) for persistent canon/facts if desired, but ownership separate.

NOW (first slice)
- Extract dialogue contract (Line, Option, Command, Status) independent of UI. 
- Define WorldState schema (versioned) with serialization (JSON) + atomic save/load in current persistence layer. 
- Add save version + migration scaffold (forward compatible). 
- Minimal deterministic tests for dialogue flow and save/load roundtrip.

NEXT
- Yarn-compatible subset? Or keep custom but adopt Dialogue Runner separation (commands as side effects). Avoid pixel-for-pixel imitation; preserve Seven identity.
- Canon tracking (facts/flags) with clear source of truth and conflict rules.
- Agency model (actions, costs, preconditions) with guards.

LATER
- Content tooling boundaries, localization hooks, rollback, checkpoints.
- Analytics/telemetry opt-in, PII-free saves.

TESTS
- Unit: serialization roundtrip, migration, version checks.
- Integration: dialogue choices produce expected state changes.
- E2E: save/resume journey, autosave.
- Adversarial: corrupt saves, version downgrade, invalid commands.

RISKS
- Save corruption: need atomic writes, checksums/validation, recovery.
- Versioning debt: migrations accumulate; keep small.
- Cross-system: save format touches world/memory — ownership clarity per ARCHITECTURE.md.
- Android: storage permissions/paths if device; local-first storage.

FIRST_SLICE
Versioned `WorldState` (v1) + `SaveManager` with atomic save/load + roundtrip tests + basic dialogue contract types. Minimal, testable.

KNOWN_UNKNOWNS
- Current dialogue implementation depth (custom DSL vs JSON) unknown.
- Save format details (binary/JSON) and existing schemas.
- RPG mechanics scope in Seven (narrative vs systems-heavy).

DOMAIN_VERDICT=READY_FOR_PLAN

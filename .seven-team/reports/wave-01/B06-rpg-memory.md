# B06 — RPG Memory, Context, and Persistence Audit

## Audit scope

This audit covers the Seven Production Wave 01B V2 vertical slice for:

- Character-local knowledge
- RPG and world state separation
- Provenance and trust boundaries
- Persistence, migration, and restore
- Bounded model context
- RPG integration in the workspace runtime

Evidence reviewed:

- `release/world-runtime.js`
- `release/canon-simulator.js`
- `release/workspaces/rpg.js`
- `memory.cjs`
- `plans/MEMORY_SCOPE_HARDENING.md`

The findings are based on the exact supplied source snapshots. No passing test result is inferred from a plan or test harness without execution. `plans/MEMORY_SCOPE_HARDENING.md` records a completed and merged implementation, but it is documentary evidence rather than proof that the currently active application source contains those changes. The supplied `memory.cjs` harness targets `seven_ai-final.html`, but that application source was not supplied for direct inspection.

## Executive finding

**Status: PARTIAL; not ready to claim an end-to-end V2 RPG memory vertical slice.**

The current runtimes have useful in-memory narrative and canon primitives:

- Ordered Real Works progression
- Branch creation on divergence
- Canon position, world state, character knowledge, relationships, locations, and objects
- Immutable-style scene deltas
- A canon event ledger and source metadata
- Character knowledge checks against continuity and position
- Explicit verification gates in the RPG workspace wrappers

However, these primitives are not yet a unified RPG memory and persistence system. The major missing boundaries are:

1. No stable `rpgId` binds a work, canon pack, and saved session to one RPG instance.
2. World progression and canon mutations are separate commits with no atomic transaction boundary.
3. Sessions are memory-only; importing a JSON pack is not persistence or restore.
4. No session schema, migration registry, pack compatibility check, or restore validation is present.
5. RPG memory is not connected to the documented scoped-memory retrieval path.
6. Character knowledge exists as a map, but bounded character context and expansion isolation are absent.
7. Scene contracts clone potentially unbounded state and do not establish a token or record budget.
8. Core runtime methods can be called directly without the workspace verification gates.
9. `snapshot()` exposes live engine and session references rather than a durable immutable envelope.
10. The supplied memory test harness does not test scope isolation, RPG scope, context bounding, migration, or restore.

## Verified current primitives

### Real Works runtime

Directly verified in `release/world-runtime.js`:

- `normalizeWork()` creates a versioned work with sources, beats, and title rules.
- Every beat receives normalized `sourceRefs`, `anchors`, `requiredFacts`, and `forbiddenChanges` arrays.
- Duplicate beat IDs are rejected.
- `sourceCoverage()` marks a beat canon-covered when all referenced source IDs exist.
- `createSession()` persists work identity, work version, continuity, beat cursor, branch state, history, and titles in memory.
- `expectedBeat()` and `sceneContract()` enforce ordered canon progression for canon sessions.
- `commitBeat()` blocks unknown beats, blocks out-of-order canon commits, and creates a branch when divergence is explicitly allowed.
- Beat records include source references, player-action source, branch status, and a timestamp.
- Player actions not attributed to `user` are blocked.
- `audit()` checks sequence, source fidelity, branch state, and progress.

Limitations directly visible in the source:

- Source fidelity is based on source ID existence, not source content hashes.
- `requiredFacts`, `anchors`, and `forbiddenChanges` are copied into contracts but are not evaluated by `commitBeat()` or `audit()`.
- There is no world-state model beyond narrative cursor, history, branch, and titles.
- There is no durable history, save, restore, migration, or cross-tab concurrency handling.
- `Date.now()` generates branch IDs, so restore must preserve the generated ID rather than replay branch creation blindly.

### Canon simulator

Directly verified in `release/canon-simulator.js`:

- Canon packs are cloned and normalized into continuities, events, entities, facts, anchors, invariants, and sources.
- Duplicate IDs within each canon group are rejected.
- Unknown anchor strengths are rejected.
- Fact certainty can be derived from the highest source authority.
- `createSession()` maintains:
  - Pack identity and version
  - Continuity
  - Position
  - Branch identity and origin
  - Canon debt
  - Generic world state
  - Character knowledge
  - Relationships
  - Locations
  - Objects
  - Ledger
  - Warnings
- `canCharacterKnow()` checks:
  - Fact existence
  - Continuity
  - Availability position
  - Character-specific session knowledge
  - Character membership in `knownBy`
- `buildSceneContract()` captures continuity, position, active characters, goals, relationship state, location state, anchor obligations, and possible exit states.
- `applySceneDelta()` clones the prior session, applies state deltas, appends character fact IDs, calculates invariant issues and canon debt, and appends a ledger event.
- Ledger events include position, status, the complete delta, threatened anchors, invariant issues, source, authority, and transformation.
- Rigid-anchor invalidation, canon-debt pressure, or a force flag can create a branch.
- `audit()` checks future character knowledge, invariants, canon debt, branch state, and fact certainty.

Limitations directly visible in the source:

- Knowledge is only an array of fact IDs per character. It has no discovery event, known-at position, branch, source, certainty, or per-character provenance.
- `knownBy` grants character knowledge without a character-specific discovery record.
- `applySceneDelta()` does not validate supplied character IDs, fact IDs, object shapes, source references, or authority values.
- The ledger `status` becomes verified or branched independently of the supplied provenance authority.
- `chronology.status` in `audit()` is hard-coded to `PASS`; the audit does not validate ledger chronology or ledger-chain consistency.
- `audit()` only reports `future-knowledge`; wrong-continuity and other invalid knowledge states are not reported.
- Invariant checks are skipped when the relevant location or object value is absent because truthiness guards are used.
- `mustBeTrue` and `mustNotYetBeKnown` are included in the scene contract but are not enforced against the resulting state or active character knowledge.
- `buildSceneContract()` clones complete relationship and location maps, with no item or token limit.
- Canon debt and warning state grow in memory without persistence or compaction policy.

### RPG workspace integration

Directly verified in `release/workspaces/rpg.js`:

- `SevenRpgWorkspace` can create world and canon engines from imported JSON packs.
- `commitVerifiedBeat()` requires `verified === true` before calling the world runtime.
- `applyVerifiedDelta()` requires `verified === true` before calling the canon runtime.
- The workspace tracks expected beat contracts, titles, world session state, canon session state, notices, and message-copy behavior.
- `snapshot()` exposes the current work, world session, canon pack, and canon session.
- Pack failures are reported to the user rather than partially installed through the JSON load path.
- Auto-titles require a story boundary, sufficient confidence, and a non-empty name.
- Duplicate recorded titles are blocked.

Limitations directly visible in the source:

- Pack import is one-way. There is no export, save, restore, autosave, or durable session envelope.
- `snapshot()` returns live references rather than a cloned persistence record.
- A pack file is not a session save and does not contain mutated world, knowledge, branch, or ledger state.
- The verification gates belong to the workspace wrappers. Directly exposed `SevenWorld` and `SevenCanon` engine methods do not require a verification claim.
- World beat commits and canon deltas are not linked by a shared transaction ID or expected state revision.
- `currentContract()` returns the full next-beat contract and does not compile a bounded character-local model context.
- There is no active RPG scope context passed into memory retrieval or context compilation.
- There is no migration path for prior in-memory or locally persisted sessions.
- The hard-coded workspace version is not a session schema version.

### Memory implementation evidence

Documented in `plans/MEMORY_SCOPE_HARDENING.md`:

- Legacy unscoped canonical records remain readable as global compatibility memory.
- New `addMemory()` writes are intended to be explicit global/private records.
- Room, project, and RPG scopes are intended to use `scope` and `scopeRef`.
- Scope filtering is intended to occur before ranking, relation expansion, evidence expansion, and request projection.
- `addScopedMemory()` and scope-context helpers are intended to exist.
- The plan states that scoped retrieval, relation isolation, evidence isolation, and legacy compatibility passed in a separate CI run.

Directly visible in the supplied `memory.cjs` harness:

- The harness executes source extracted from `seven_ai-final.html` in a VM.
- It tests create/update ledger behavior, write rollback, corruption preservation, action-authorization denial, delete history, legacy noncanonical compatibility, and duplicate ledger IDs.
- It does not test any of the scope-hardening acceptance cases listed in the plan.
- It does not exercise the RPG workspace, world runtime, or canon simulator.
- Its output explicitly says browser integration is covered separately.

Unknown:

- Whether the currently active `seven_ai-final.html` contains the helpers and integration described by the plan.
- Whether the standard chat path binds the current RPG scope.
- Whether compiled model items currently preserve RPG `scope`, `scopeRef`, and `access` metadata.
- Whether relation and evidence expansion are now re-filtered after expansion.
- Whether the separate browser and scope-hardening suites exist in the active checkout.

## Missing separation boundaries

### 1. RPG instance identity

Neither runtime session has an `rpgId`. A work ID or canon pack ID identifies content, not a particular playable world. Reusing the same pack in two RPG instances would make a memory scope derived only from pack identity unsafe.

Required boundary:

- Generate or accept one stable, opaque `rpgId` per playable RPG instance.
- Bind work, canon, narrative cursor, world state, knowledge, branches, and saves to that ID.
- Never infer `rpgId` from a title, pack ID, room ID, or current URL without an explicit identity contract.

### 2. Narrative progression versus world-state transaction

A verified beat and its canon delta are currently committed through separate engine methods. A failure between them can leave the story cursor ahead of the world state or the world state ahead of the narrative beat.

Required boundary:

- Introduce one atomic RPG commit record containing optional beat progression and canon delta.
- Require an expected state revision or ledger head to reject stale writes.
- Persist work cursor, canon state, branch, and canon debt at the same revision.

### 3. Canon truth versus character knowledge

Canon facts and what a character knows are related but not interchangeable. The current `knownBy` field and session fact-ID list do not preserve how or when a character learned a fact.

Required boundary:

- Keep immutable canon facts in the pack.
- Store per-character discovery records separately from the canonical fact.
- Include discovery position, branch, continuity, source references, certainty, and establishing event.
- Do not write character discoveries to global memory.

### 4. RPG memory versus general application memory

No supplied RPG module invokes `addScopedMemory()`, creates an active RPG scope context, or filters a model request by RPG scope.

Required boundary:

- RPG-derived memory must use `scope="rpg"` and the stable `rpgId` as `scopeRef`, unless a future approved contract defines a separate opaque form.
- Global, room, project, shared, system, and restricted records must remain separate.
- Cross-scope expansion must not reintroduce hidden records.
- Legacy unscoped memory must not be silently treated as RPG state.

### 5. Verification versus canonical authority

The workspace wrappers require a verification flag, but the underlying public engines do not. A caller can bypass the UI and directly create a canon record.

Required boundary:

- Core commit functions must require a structured provenance envelope.
- Runtime-generated, user-generated, imported, and verified beat-derived records must be distinguishable.
- Metadata labels must not be sufficient to grant authority.
- Verification must be checked against the expected source or beat, not accepted as an unrestricted boolean.

### 6. Session state versus durable persistence

World history, titles, canon state, knowledge, ledger events, and warnings disappear when the page context is replaced.

Required boundary:

- Define a versioned save envelope.
- Save and restore work and canon references, RPG identity, continuity, branch, cursor, state, knowledge, and ledger head atomically.
- Validate pack identity, versions, and preferably content hashes before restore.
- Never replace a damaged save with an empty session.

### 7. Migration boundary

Pack versions are not state-schema versions. Neither runtime has a migration mechanism.

Required boundary:

- Add a state schema version independent from work and canon content versions.
- Use an explicit migration registry.
- Preserve a backup before migration.
- Quarantine unknown future schemas and malformed legacy state.
- Do not infer missing RPG identity, continuity, branch, or character scope.
- Do not expose legacy unscoped RPG state as global or cross-RPG memory.

### 8. Restore and ledger consistency

A snapshot that restores mutable state without verifying its ledger can become internally inconsistent. The current canon audit does not validate chronology or ledger hashes.

Required boundary:

- Restore from the latest validated snapshot and replay subsequent commits.
- Verify ledger sequence, parent links, commit IDs, revision, and pack references.
- Re-run invariant, knowledge-horizon, branch, and source checks.
- Make restore fail closed or explicitly quarantined when validation fails.

### 9. Bounded context boundary

`buildSceneContract()` can copy all relationship and location state. It does not include a budget, relevance ranking, truncation marker, or character-local knowledge projection.

Required boundary:

- Filter scope, continuity, branch, position, active character, and access before lexical ranking or graph expansion.
- Bound both item count and estimated model tokens.
- Preserve current scene obligations and current character state first.
- Summarize or omit older history only through deterministic rules.
- Report omitted records and reasons in context metadata.
- Never include future knowledge merely because a canon fact exists.

## Proposed minimal V2 state and memory contract

### RPG session envelope

The minimum durable state should contain:

- `schemaVersion`: independent state format version
- `rpgId`: stable opaque instance identifier
- `createdAt` and `updatedAt`
- `revision`: monotonically increasing committed revision
- `workRef`:
  - Work ID
  - Work version
  - Content hash when available
- `canonRef`:
  - Canon pack ID
  - Pack version
  - Content hash when available
- `continuity`
- `branch`:
  - Branch ID or null
  - Validated origin
- `cursor`:
  - Beat index and expected beat ID
  - Canon position
- `worldState`:
  - Validated generic state
  - Relationships
  - Locations
  - Objects
- `characterKnowledge`:
  - Character ID
  - Fact ID
  - Known-at position
  - Establishing commit ID
  - Continuity and branch
  - Source references
  - Certainty
- `ledgerHead`
- `titleRecords`
- `migration`:
  - Original schema version
  - Applied migration versions
  - Source backup reference when available

The exact hash algorithm and storage key are currently unknown and must be selected before implementation.

### Atomic RPG commit envelope

Each progression or state mutation should contain:

- Commit ID
- Expected and resulting revision
- `rpgId`
- Continuity and branch
- Optional beat ID and beat index
- Canon position
- Optional world delta
- Optional character discovery records
- Actor or source type
- Source references and authority
- Transformation
- Parent commit or ledger head
- Timestamp
- Verification evidence

A beat commit and corresponding canon delta should be one transaction whenever both are required by the beat.

### RPG memory record

Every retrievable RPG memory item should preserve:

- `scope="rpg"`
- `scopeRef=<stable rpgId>`
- `access="private"` by default
- Continuity
- Branch or canonical lineage
- Valid-from position
- Valid-to position when applicable
- Character IDs allowed to know the item
- Fact or event reference
- Provenance
- Certainty
- Source references
- Access metadata for audit only

Access and provenance metadata must not authorize actions.

### Retrieval and expansion rules

Filtering order should be:

1. Validate or normalize the active scope context.
2. Filter by `rpgId`.
3. Filter access class.
4. Filter continuity.
5. Filter canonical or branch lineage.
6. Filter by position and valid interval.
7. Filter by active character visibility.
8. Perform intent checks and lexical ranking.
9. Perform bounded relation and evidence expansion.
10. Reapply scope filters to every expansion result.
11. Compile a bounded request projection.

A fact existing in the canon pack must not by itself make that fact available in a character's prompt.

### Bounded model context

The compiled context should contain:

- Active RPG identity and continuity
- Current scene and expected beat
- Current state slices relevant to active characters
- Relevant character-local knowledge
- Current commitments and unresolved canon risks
- A bounded set of recent and highly relevant provenance events
- Scope, scope reference, access, and provenance metadata for every item
- Truncation metadata containing item and token counts and omission reasons

The contract should accept deterministic limits such as maximum items, maximum estimated tokens, maximum history age, and maximum expansion depth. The actual limits are unknown and should be configuration rather than hard-coded values.

### Migration and restore policy

- New sessions should be written only in the new schema.
- Legacy sessions without `rpgId` should be quarantined until an explicit user-approved migration supplies or derives a stable identity.
- Missing continuity, branch, position, or source metadata must not be guessed.
- Migration must preserve the original save and produce a migration receipt.
- Restore must reject a mismatched work or canon pack unless an explicit compatible migration exists.
- A corrupt or unverifiable save must not be overwritten by an empty session.
- Browser storage limits, export size, and cross-tab writes require a storage policy before persistence is accepted.

## Exact files likely affected by implementation

Only the following report is changed by B06:

- `.seven-team/reports/wave-01/B06-rpg-memory.md`

Likely future implementation files, based on the verified source boundaries:

- `release/canon-simulator.js`
  - Add RPG identity and state schema metadata.
  - Replace bare character fact-ID knowledge with character discovery records or add a compatible projection.
  - Validate delta identities and provenance.
  - Add scoped, bounded character-context construction.
  - Strengthen chronology, ledger, invariant, and branch audits.
  - Add explicit commit revision and atomic progression support.

- `release/world-runtime.js`
  - Carry RPG identity, branch, revision, and transaction identity in work sessions and records.
  - Evaluate beat anchors, required facts, and forbidden changes.
  - Support an atomic beat plus canon commit.
  - Return a bounded scene contract or reference the canon context builder.

- `release/workspaces/rpg.js`
  - Create and persist a stable `rpgId`.
  - Add save, export, restore, migration, and quarantine flows.
  - Serialize both world and canon sessions atomically.
  - Enforce verification in the core commit boundary rather than only in wrappers.
  - Bind the active RPG scope to memory retrieval and request compilation.
  - Make `snapshot()` return a cloned, serializable envelope.

- `seven_ai-final.html`
  - This is the likely active memory implementation because `memory.cjs` extracts its memory section.
  - Verify or integrate `normalizeMemoryScopeContext()`, `getActiveMemoryScopeContext()`, `isMemoryVisibleInScope()`, `filterMemoriesByScopeContext()`, and `addScopedMemory()`.
  - Add RPG scope binding to the active request path.
  - Ensure scope filtering precedes and re-checks relation and evidence expansion.
  - Preserve scope metadata in compiled context items.

- `memory.cjs`
  - Expand regression coverage for the RPG-facing memory contract.
  - Add scope-aware duplicate, restore, and context-isolation assertions.
  - This file is a test harness, not the preferred location for the complete browser integration suite.

Potential additional test, storage-adapter, migration, and build-manifest files may be affected, but their exact paths are unknown from the supplied evidence. No filenames are guessed here.

## First implementation slice

The first slice should establish the safety boundary before persistence or automatic migration:

1. Introduce a V2 RPG session identity using a required stable `rpgId` for newly created RPG sessions.
2. Add schema version, state revision, branch identity, and ledger head to world and canon sessions.
3. Introduce structured per-character knowledge discovery records while preserving a compatibility projection for existing fact-ID arrays.
4. Add a pure character-context builder in the canon runtime that filters by RPG scope, continuity, branch, position, character, and access before ranking or expansion.
5. Add explicit item and token limits with deterministic truncation metadata.
6. Add `rpgId`, branch, revision, active characters, and canon position to the scene contract.
7. Bind new RPG workspace sessions to the same `rpgId` across both engines.
8. Add RPG-03 and RPG-05 regression tests before implementing migration.
9. Do not auto-migrate legacy sessions or silently reinterpret unscoped memory.
10. Implement durable save, restore, migration, and atomic beat-plus-delta commits in the following persistence slice, covered by RPG-04.

This order prevents a durable format from preserving an already ambiguous knowledge model.

## RPG-03 tests — character-local knowledge

### RPG-03.1: Character isolation

Given Alice and Bob in the same RPG:

- Establish fact F for Alice through a verified event.
- Leave Bob without F.
- Assert Alice's bounded context contains F.
- Assert Bob's bounded context does not contain F.
- Assert the canon pack may contain F without exposing it to Bob.

### RPG-03.2: Position horizon

Given fact F becomes available at position 20:

- At position 10, Alice cannot retrieve F.
- At or after position 20, Alice can retrieve F only after an establishing event.
- Canon pack presence must not bypass the horizon.
- A future discovery event must not enter earlier scene context.

### RPG-03.3: Continuity and branch isolation

- A fact established in another continuity is excluded.
- A fact established on a non-active branch is excluded.
- Canon-line knowledge is included only when continuity and branch rules permit it.
- Branch restoration preserves the original knowledge records.

### RPG-03.4: Expansion isolation

- An allowed Alice memory links to a Bob-private or other-RPG memory.
- Relation expansion must not include the hidden target.
- Evidence expansion must not include the hidden target.
- The final context must contain only records that pass the original scope and character policy.

### RPG-03.5: Scene obligations

- A scene's `mustNotYetBeKnown` list detects or prevents a prohibited character discovery.
- A scene's `mustBeTrue` list is checked against the committed state.
- A contract mismatch is recorded as an issue rather than silently accepted.

## RPG-04 tests — provenance, persistence, migration, and restore

### RPG-04.1: State round trip

Create a session containing:

- Work and canon references
- Non-default continuity
- Beat cursor
- Canon position
- Relationships, locations, and objects
- Character knowledge
- Branch state
- Canon debt
- Titles
- Ledger head

Save and restore it. Assert exact semantic equality and a new matching revision.

### RPG-04.2: Atomic progression

Commit a beat together with its required world delta.

- Either the beat cursor, state, knowledge, and ledger revision all advance.
- Or none advance.
- A stale expected revision is rejected.
- A failed invariant or persistence write leaves the exact previous snapshot intact.

### RPG-04.3: Provenance survival

- Every restored knowledge discovery retains its source, position, commit ID, certainty, continuity, and branch.
- Every restored state event retains actor, source references, authority, transformation, and parent.
- Metadata cannot authorize an action.
- Source IDs and content hashes are checked before restore when hashes are available.

### RPG-04.4: Corrupt and incompatible saves

Tests should cover:

- Truncated JSON
- Invalid schema version
- Unknown future migration
- Missing `rpgId`
- Mismatched work or canon pack
- Broken ledger sequence
- Revision mismatch
- Invalid character or fact references

Each case must quarantine or reject the save without overwriting it with empty state.

### RPG-04.5: Migration

- A known legacy schema is migrated through a registered migration.
- The original save is retained.
- The migration receipt records source and target versions.
- Missing RPG identity is not guessed.
- Legacy unscoped memory is not exposed as RPG memory.
- A rollback path restores the original save.

The exact legacy RPG state schema is unknown and must be captured before migration code is written.

## RPG-05 tests — bounded context

### RPG-05.1: Deterministic budget

- Build a session with many facts, relationships, evidence links, and ledger events.
- Compile context under fixed item, token, age, and expansion-depth limits.
- Assert the same input always produces the same selected item IDs and omission record.
- Assert the result remains within the configured budget.

### RPG-05.2: Required context preservation

- Current scene obligations survive truncation.
- Relevant current character state survives truncation.
- Established relevant knowledge survives truncation.
- Unresolved canon risks survive truncation.
- Old or low-relevance material is omitted before current material.

### RPG-05.3: Security under truncation

- Future facts are absent.
- Other characters' private facts are absent.
- Other RPG IDs are absent.
- Other branches and continuities are absent.
- Restricted and shared records are absent unless explicitly allowed.
- Omitted metadata does not reveal hidden record IDs or content.

### RPG-05.4: Expansion budget

- Every relation and evidence expansion consumes budget.
- Expansion depth is bounded.
- Duplicate references do not consume duplicate context slots.
- A cycle terminates.
- Scope filtering occurs before and after expansion.

### RPG-05.5: Compiled provenance

Each compiled item exposes:

- Scope
- Scope reference
- Access
- Fact or event reference
- Continuity and branch
- Source references
- Certainty
- Truncation or selection reason

These fields remain audit metadata and do not increase authority.

## Risks and dependencies

### High risks

- The documented memory-scope implementation may not be present in the active checkout.
- Retrofitting object-shaped character knowledge can break callers expecting arrays of fact IDs.
- A missing `rpgId` cannot be safely inferred for existing saves.
- Branch semantics currently distinguish branch ID but do not fully define ancestry-aware knowledge visibility.
- Separate world and canon commits can persist inconsistent state unless made atomic.
- Unbounded state and history can exceed browser storage or model context limits.
- `Date.now()` and timestamps make replay nondeterministic unless event IDs and branches are restored explicitly.
- Direct engine access can bypass workspace verification flags.
- Free-form `authority` metadata is not currently tied to a validated authority contract.

### Dependencies

- A stable identity source for `rpgId`
- A browser storage or export strategy
- A state schema and migration registry
- Pack content-hash support
- A validated provenance and verification model
- A tokenizer or deterministic token-estimation policy
- Configurable context budgets
- A documented branch and continuity visibility policy
- Browser integration tests
- Discovery of the actual existing memory implementation in `seven_ai-final.html`
- Identification of the existing RPG integration and browser test file paths

## Explicit unknowns

The following must be marked unknown until directly inspected or specified:

- Current contents and behavior of `seven_ai-final.html`
- Current availability of the scope-hardening helpers
- Current active-chat RPG binding
- Existing browser persistence APIs
- Existing autosave or export code
- Existing RPG instance identifier
- Existing saved-session schema and sample saves
- Existing migration infrastructure
- Existing token-budget conventions
- Existing tokenizer implementation
- Existing branch ancestry representation beyond `branchOrigin`
- Canonical source authority schema used by the application
- Exact browser integration test paths
- Exact release packaging or build-manifest paths
- Whether source packs can produce stable content hashes
- Whether title records are intended to be canonical, branch-local, or merely user metadata

## Recommendation

Treat the current implementation as a capable in-memory canon prototype, not yet as a persistent RPG memory vertical slice. Approve implementation only in the staged order above:

1. Character-safe V2 identity and context boundary
2. Atomic progression and provenance
3. Durable save and restore
4. Explicit migration and quarantine
5. Full RPG-03, RPG-04, and RPG-05 browser and runtime coverage

Do not claim automatic legacy RPG migration, cross-scope safety, durable restore, or bounded context until the corresponding tests pass against the active source tree.

WAVE01=COMPLETE

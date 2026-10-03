# A06 — Persisted UI State Audit

**Wave:** Seven Production Wave 01A  
**Mission:** Audit persistence and state-migration risk for UI Foundation V2  
**Scope:** Settings, room state, localization, theme, model UI state, legacy keys, and recovery behavior  
**Evidence boundary:** Only the supplied read-only files were used. No additional repository source was available in the provided evidence.

## Executive summary

1. **Room persistence has a canonical IndexedDB migration path.** The verified store is `seven_ai_canonical_v1`, with `state` and `audit` object stores. Initial room migration produces revision `1`; saved room state and audit revisions must agree.
2. **Legacy room keys are compatibility inputs, not canonical storage after migration.** The verified keys are `chat_rooms_v6`, `room_titles_v6`, and `current_room_v6`. Tests require their original contents to remain unchanged.
3. **Cross-tab room writes already have fail-closed semantics.** A stale tab receives `false` from `saveRooms()` and transitions `roomPersistence.status().failed` to `true`; it must not overwrite the winning tab.
4. **Memory persistence provides a useful safety pattern.** Writes are snapshot-based, failures leave the exact prior bundle unchanged, and corrupt canonical memory is not replaced with empty data. Legacy memory keys remain untouched.
5. **Durable settings, localization, theme, and model-selection persistence are not verified by the supplied evidence.** The UI scripts derive language and model state from runtime DOM controls, but no durable settings/theme/locale/model key or migration schema is shown.
6. **The two release overlays duplicate presentation responsibilities.** `ui-polish-fixes.js` and `seven-shell.js` both project model selection, localization, room labels, and empty states into the DOM. They must remain consumers of canonical state rather than becoming additional persistence owners.
7. **Long-chat rendering is correctly separated from canonical history.** A 500-message room renders at most 100 message elements, expands to a 200-message projection, and preserves all 500 canonical records.
8. **The first implementation slice should centralize versioned UI state in the existing IndexedDB persistence layer without changing room migration semantics.** Model identity, locale, theme, and non-secret settings should be committed atomically, while release overlays derive their UI from that state.

## Evidence reviewed

- `../../../release/workspaces/ui-polish-fixes.js`
  - Room search and row filtering.
  - Model-picker creation and localization.
  - Zero-room facade and room-function wrapping.
  - Branding and dynamic DOM synchronization.
- `../../../release/workspaces/seven-shell.js`
  - Shell labels, localization, room metadata, composer, model chip, copy controls, empty state, and viewport behavior.
  - Runtime synchronization through `seven:workspacechange` and `seven:themechange`.
- `../../../verify.cjs`
  - IndexedDB room migration, revisions, audit agreement, stale-tab handling, legacy preservation, settings structure, model routing, long-chat rendering, localization, theme event references, and diagnostics.
- `../../../memory.cjs`
  - Atomic memory updates, immutable ledger history, quota-failure preservation, corrupt-data refusal, and legacy-key preservation.

## Verified persistence keys and flows

### 1. Canonical room state

**Verified canonical database**

- Database: `seven_ai_canonical_v1`
- Object stores:
  - `state`
  - `audit`
- Verified canonical state record: `state["rooms"]`
- Runtime status API: `roomPersistence.status()`
- Status fields observed:
  - `ready`
  - `revision`
  - `failed`

**Verified migration flow**

1. The application starts from legacy local storage when no canonical room state has been initialized.
2. Initial migration reaches `roomPersistence.status().ready === true`.
3. Initial canonical room revision is `1`.
4. Room IDs, titles, and message content survive migration.
5. Legacy local-storage room keys remain byte-for-byte available for compatibility after migration.
6. The canonical state revision and last audit revision agree.
7. The audit entry count equals the current canonical revision.

**Verified save and reload flow**

1. Room mutations are held in the in-memory `rooms` and `roomTitles` structures.
2. `saveRooms()` persists a complete snapshot and resolves to a boolean.
3. Rapid queued snapshots preserve call order.
4. A successful save survives reload.
5. Two tabs may load the same revision.
6. The first tab can save a newer revision.
7. The stale tab then receives `false` and enters the failed state.
8. The stale tab does not overwrite the winning snapshot.

### 2. Legacy room keys

The following keys are verified migration inputs and compatibility fixtures:

| Key | Verified role |
|---|---|
| `chat_rooms_v6` | Legacy room collection, including history and room metadata |
| `room_titles_v6` | Legacy room-title mapping |
| `current_room_v6` | Legacy selected-room identifier |

Required invariant: migration must not delete, normalize, or rewrite these keys. The supplied tests explicitly compare migrated state against the original legacy value.

### 3. Memory persistence adjacent to UI settings

**Verified canonical key**

- `seven_ai_memory_bundle_v2`

**Verified legacy keys**

- `seven_ai_memory_v1`
- `seven_ai_event_ledger_v1`

**Verified safety behavior**

- A create, update, or delete is committed as one coherent operation.
- Update and delete operations append immutable ledger history.
- A quota or write failure returns failure without changing the previous canonical bundle.
- Corrupt canonical memory causes writes to fail rather than replacing corruption with empty state.
- Legacy noncanonical memory remains available and unchanged.
- Canonical backups do not include provider secrets.

Memory persistence is not the room migration store, but its fail-closed behavior is the safest verified pattern for settings migration and recovery.

### 4. Settings state

The following settings controls are verified to exist:

- `routingModeSelect`
- `modelSelect`
- `temperatureRange`
- `reasoningEffort`
- `maxTokens`
- `freeFallbackToggle`
- `pinnedNotes`
- `knowledgeStatus`

The following are also verified by tests:

- Core controls are not hidden inside collapsed `<details>` elements.
- The provider section exposes no visible manual credential inputs.
- `openSettings()` can render the settings UI.
- The settings modal is expected to fit at 320px in LTR and RTL layouts.
- Canonical backup generation excludes an injected `groq_api_key` sentinel.

No supplied evidence identifies:

- The durable settings storage key.
- The settings schema version.
- The settings default object.
- Load/save timing.
- Debounce or coalescing behavior.
- Partial-write recovery.
- Whether settings are included in the canonical room revision.
- Whether legacy settings keys exist.

Therefore, settings persistence and migration are currently **unknown** and must not be guessed during implementation.

### 5. Localization state

Verified runtime source:

- `document.documentElement.lang`

Both release overlays derive language from that attribute:

- `ui-polish-fixes.js` uses a locale helper based on `lang`.
- `seven-shell.js` uses its own locale helper based on `lang`.

Verified behavior:

- Arabic and English labels are projected dynamically.
- Tests can change `dir` to RTL and expect localized and responsive UI behavior.

Not verified:

- A durable locale key.
- Whether locale is stored per user, room, workspace, or browser profile.
- Whether `lang` is restored before first paint.
- Whether `dir` is derived from locale or persisted independently.
- The supported locale list and fallback locale.

Locale persistence is therefore **unknown**. `documentElement.lang` and `dir` should be treated as derived runtime projection, not independent durable stores.

### 6. Theme state

The only verified theme-related integration point is the `seven:themechange` event listened for by `seven-shell.js`.

No supplied evidence verifies:

- A theme storage key.
- The accepted theme values.
- System-theme preference handling.
- Persistence across reload.
- Cross-tab theme behavior.
- Recovery from an invalid theme value.

Theme persistence is **unknown**. Theme should be restored before overlay boot when implemented, then projected to the root element and broadcast through the existing event channel or a successor state event.

### 7. Model UI state

Verified runtime source:

- `#modelSelect`
- `currentModel`
- Selected `<option>` values and labels

Two generated views consume the native select:

- `.seven-model-picker` from `ui-polish-fixes.js`
- `.seven-shell-model-chip` and `.seven-shell-model-menu` from `seven-shell.js`

Verified behavior:

- Both views display the selected option.
- Selecting from either custom view updates the native select and dispatches a bubbling `change` event.
- Model ranking is performed by `SevenModelIntelligenceV3`.
- The persisted representation should use the stable provider/model selection key, not an option index or translated display label.

No supplied evidence identifies:

- The durable model-selection key.
- Whether model choice is global, room-scoped, or workspace-scoped.
- Migration from a prior model key.
- Behavior when a persisted model is no longer available.
- Cross-tab model updates.

Model persistence is **unknown**. The native select and `currentModel` are currently the runtime authority; generated pickers must not become independent sources of truth.

## Migration invariants

The following invariants should be mandatory for UI Foundation V2:

1. **Canonical-first startup**
   - Read canonical IndexedDB state before applying legacy values or booting presentation overlays.
   - If canonical state exists, legacy keys must not re-import over it.

2. **One-time, atomic legacy room import**
   - Import all legacy rooms, titles, selected-room state, and supported metadata as one canonical commit.
   - A partial import must not become the new baseline.

3. **Exact identity preservation**
   - Preserve room IDs and titles, including custom IDs and zero-width-title behavior represented by `\u200b`.
   - Do not derive identity from array position.

4. **Legacy non-destructive migration**
   - Leave `chat_rooms_v6`, `room_titles_v6`, and `current_room_v6` unchanged.
   - Do not use stale legacy values as an automatic repair source for corrupt canonical state.

5. **Atomic state and audit agreement**
   - A canonical room commit must update `state["rooms"]` and append exactly one matching audit record in the same transaction.
   - The last audit revision must equal the state revision.
   - Audit count must equal the canonical revision under the verified invariant.

6. **Stale-write refusal**
   - `saveRooms()` must continue returning `false` for a stale revision.
   - The failed state must not be cleared until an explicit reload or rebase succeeds.

7. **Corruption fails closed**
   - Corrupt canonical UI state must not be silently replaced with defaults or legacy data.
   - Recovery must preserve the corrupt value for diagnostics or explicit user choice.
   - Room recovery must remain isolated from settings recovery.

8. **Settings schema versioning**
   - Store a UI-state schema version and migrate field-by-field.
   - Validate each field independently so one bad optional value does not discard unrelated valid settings.
   - Unknown future fields should not cause destructive rewriting during downgrade.

9. **No credentials in UI state or backups**
   - Provider keys, gateway keys, authorization headers, and equivalent secrets must never enter canonical UI state, diagnostics, or portable backups.
   - Existing legacy credential storage should not be deleted without an explicit migration and product policy.

10. **Stable model identity**
    - Persist the stable provider/model key.
    - Rehydrate by current model availability, with a documented fallback.
    - Never persist translated labels or numeric option positions.

11. **Locale and theme are projections**
    - Store one canonical language/theme value.
    - Derive `lang`, `dir`, CSS state, and overlay labels from that value.
    - Avoid independent writes from each release overlay.

12. **Long history remains canonical**
    - Message-window limits must affect DOM projection only.
    - Save, migration, backup, reload, and room switching must operate on the complete canonical history.

13. **One revision domain per storage transaction**
    - If settings and rooms share the IndexedDB database, concurrent commits must not overwrite each other by replacing a whole shared snapshot.
    - Either use independent records with explicit conflict handling or one transaction that reads, merges, increments, and writes all changed records atomically.

## Stale and duplicated persistence risks

### High risk: legacy fallback after canonical corruption

A stale legacy room snapshot may be years behind canonical state. Reimporting it after corruption or browser storage repair could silently roll back conversations. Canonical corruption must fail closed unless the user explicitly chooses a recovery path.

### High risk: whole-snapshot overwrite across tabs

Room persistence already detects stale revisions. Settings, locale, theme, and model updates must not bypass that mechanism. Independent read-modify-write cycles against one shared state record could reintroduce lost updates.

### High risk: duplicate model ownership

The native `<select>`, custom model picker, and shell model chip all represent the same value. Persisting from whichever DOM control happens to run last could cause stale model restoration. Only the canonical state adapter should write model selection.

### High risk: duplicate locale/theme ownership

Both release scripts independently mutate labels and synchronize through mutation observers. If either writes `lang`, theme attributes, or a local-storage key, startup order could produce oscillation or stale values. They should only observe canonical UI state.

### Medium risk: zero-room sentinel migration

`ui-polish-fixes.js` uses the title sentinel `EMPTY = '\u200b'` and temporarily removes the room from the room list before restoring it. Migration must preserve this semantic state or explicitly canonicalize it without accidentally presenting an empty sentinel as a visible title or deleting the only room.

### Medium risk: duplicated room wrappers

`installZeroRoomFacade()` captures existing global functions and installs a one-time `r.__sevenZeroRoomFacade` marker. If the underlying persistence implementation is replaced after installation, the marker could prevent rebinding to newer functions. Initialization order must be explicit, and tests should reload modules in the production order.

### Medium risk: DOM projection mistaken for persistence

Render limits, search filtering, labels, model menus, and RTL attributes are presentation state. None should trigger independent durable writes or become migration sources.

### Medium risk: legacy credential residue

The test suite explicitly checks that `groq_api_key` is excluded from backups and that manual provider inputs are hidden. Hidden does not mean deleted. Any credential-cleanup migration must be explicit, recoverable where appropriate, and separate from settings migration.

### Unknown risk: adjacent local-storage state

The verification suite references `sevenDeepResearchV2` and directly manipulates model-health and usage structures. Their final production persistence keys and migration relationships are not visible in the supplied evidence. They should not be swept into a generic UI-state migration without a separate compatibility review.

## Recovery behavior

### Verified

- Stale room tab: save returns `false`, `roomPersistence.status().failed` becomes `true`, and canonical data is protected.
- Memory write failure: exact previous snapshot remains unchanged.
- Corrupt memory: no overwrite with empty data.
- Corrupt legacy noncanonical memory: operations fail rather than silently claiming success.

### Required for UI state

- A corrupt UI-state record should not reset rooms, memory, or unrelated canonical data.
- Valid fields should be recoverable independently from invalid fields when the schema permits.
- A failed settings save should preserve the last confirmed state and expose a retryable failure.
- A stale-tab UI save should offer reload/rebase, not force overwrite.
- A missing or unavailable persisted model should fall back to an available valid selection and report a non-secret diagnostic.
- An invalid locale should use the documented default locale without losing theme, model, or settings values.
- An invalid theme should use the documented system/default behavior without losing other state.

### Unknown

- Room corruption recovery UI.
- Room quota-exceeded behavior.
- Partial IndexedDB transaction recovery.
- Whether `currentRoom` is stored in the canonical record or reconstructed.
- Settings quota behavior.
- Settings cross-tab conflict UI.
- Model rollback behavior.
- Theme and locale reset controls.

## Long-chat invariants

Verified behavior provides a concrete migration and persistence contract:

- A 500-message canonical room renders no more than 100 `.message` elements.
- The hidden control reports `400 hidden`.
- `showEarlierChatMessages()` expands the projection to 200 messages.
- Canonical history remains exactly 500 before and after expansion.
- Rendering, expansion, and cleanup do not mutate canonical history.

UI Foundation V2 must preserve this separation:

- Save and migrate all canonical messages.
- Reload must retain all messages.
- Switching rooms must not truncate history.
- Search must not rewrite or duplicate history.
- Streaming updates must update one canonical record while still using bounded DOM projection.
- A settings or locale save must not serialize only the visible message window.

## First implementation slice

Implement a single versioned UI-state adapter over the existing IndexedDB persistence layer before changing individual controls.

### Scope

1. Add a canonical UI-state record in `seven_ai_canonical_v1`, preferably through the same transactional persistence abstraction used for room state.
2. Keep room state and legacy room migration behavior unchanged in this slice.
3. Store only non-secret UI state:
   - Validated settings values.
   - Canonical locale preference.
   - Canonical theme preference.
   - Stable provider/model selection key.
4. Load UI state before `seven-shell.js`, `ui-polish-fixes.js`, or their equivalents begin projecting DOM state.
5. Route control changes through one debounced, queued save function.
6. Emit one state-change event after commit; overlays consume that event and runtime DOM.
7. Derive `lang`, `dir`, theme attributes, model labels, and picker options from canonical state.
8. Exclude credentials from the record, snapshots, diagnostics, and backup payload.
9. Add an explicit migration registry only after existing settings/localization/theme/model keys are discovered in source.
10. If no canonical UI-state record exists but a valid legacy UI key is discovered, migrate it once and record the source schema version.

### Explicit non-goals for the first slice

- Deleting legacy room or credential keys.
- Changing the room migration schema.
- Removing either release overlay.
- Persisting DOM render limits.
- Persisting search text or open/closed menu state.
- Migrating research checkpoints or provider-health records.

## Tests required

### Reload and canonical precedence

1. Save settings, locale, theme, and model; reload; assert exact canonical restoration.
2. Verify all restored controls agree with `currentModel` and `documentElement.lang`.
3. Verify a generated picker and shell chip cannot overwrite a newer canonical value during boot.
4. Verify canonical UI state wins when a stale legacy key is also present.
5. Verify a failed UI-state write leaves the exact previous canonical record unchanged.
6. Verify two tabs cannot silently overwrite one another.

### Legacy room migration

1. Start with only `chat_rooms_v6`, `room_titles_v6`, and `current_room_v6`.
2. Assert initial canonical room revision is `1`.
3. Assert room ID, title, history, and selected room are preserved.
4. Assert all three legacy keys remain unchanged.
5. Reload and assert there is no duplicate import.
6. Inject malformed legacy data and assert migration fails atomically without replacing valid canonical state.
7. Corrupt canonical room state while legacy data is present and assert no automatic legacy rollback.

### UI-state migration

1. For every discovered legacy settings key, verify exact field mapping and idempotent second migration.
2. Verify an unknown future schema is preserved or rejected without destructive rewriting.
3. Verify one invalid field does not discard unrelated valid fields.
4. Verify legacy credentials never appear in migrated UI state or backup output.
5. Verify the migration marker prevents repeated imports.

### Localization and theme

1. Restore English and Arabic before first paint or overlay mutation.
2. Assert `lang` and `dir` remain derived and consistent.
3. Reload each theme under system light, system dark, and explicit modes once the real modes are known.
4. Switch locale and theme repeatedly to detect overlay loops.
5. Open settings and release-overlay controls in both directions at 320px.

### Model state

1. Reload with each configured provider/model selection.
2. Verify persistence uses stable provider/model identity rather than label or option index.
3. Remove the selected model from the catalog; verify a documented valid fallback.
4. Verify both custom model views display the same selection after restore and user interaction.
5. Verify model selection does not include provider credentials.

### Long-chat migration and reload

1. Migrate a legacy room containing at least 500 messages.
2. Assert canonical history length is 500 and rendered messages are at most 100.
3. Reload and assert all 500 messages remain canonical.
4. Expand the projection and assert it reaches 200 without changing canonical length.
5. Save settings, locale, theme, or model after expansion; reload; assert history remains 500.
6. Stream into the last visible and hidden messages; save and reload; assert no duplication or truncation.
7. Switch away and back; assert the same complete history and render window.
8. Search a long room; save/reload; assert filtering state did not become canonical content.

### Recovery

1. Simulate quota failure during room and UI-state writes.
2. Simulate a transaction abort after state write but before audit append.
3. Simulate corrupt UI JSON/schema and corrupt room JSON.
4. Verify no corrupt value is replaced with defaults automatically.
5. Verify explicit recovery can reload or rebase without losing unrelated canonical objects.
6. Verify diagnostics contain schemas, revisions, and failure classes, but no secrets or message content.

## Exact files likely affected by implementation

These are likely implementation and test files; none were edited during this audit.

1. `../../../seven_ai-final.html`
   - Inferred as the primary source because `verify.cjs` loads it and `memory.cjs` extracts application source from it.
   - Expected location for canonical UI-state schema, migration, startup ordering, settings save/load, locale/theme application, model restoration, and recovery UI.
   - The file itself was not supplied as read-only evidence, so all source-level details remain unverified.

2. `../../../release/workspaces/seven-shell.js`
   - Must derive model chip, locale labels, `lang`/`dir`, and theme projection from canonical UI state.
   - Must not become an independent persistence owner.
   - Add synchronization tests around startup and state-change events.

3. `../../../release/workspaces/ui-polish-fixes.js`
   - Must keep the model picker and zero-room facade as projections over canonical state/functions.
   - Room-function wrapping order and idempotence need verification before migration work.
   - Model localization must react to canonical locale changes.

4. `../../../verify.cjs`
   - Primary location for reload, migration, stale-tab, model fallback, localization/theme, recovery, and long-chat integration tests.
   - Existing room and long-chat assertions should be preserved while new UI-state coverage is added.

5. `../../../memory.cjs`
   - No change is currently required for UI Foundation V2.
   - Change only if a genuinely shared storage-safety helper is introduced; do not couple unrelated memory migration to UI settings solely for code reuse.

## Dependencies

- Existing `roomPersistence` IndexedDB abstraction and revision checks.
- Existing atomic room/audit transaction behavior.
- Existing legacy-room migration and compatibility guarantees.
- Existing `saveRooms()` queue semantics.
- Existing model catalog, free-provider registry, `currentModel`, and stable selection-key helpers.
- Existing `seven:workspacechange` and `seven:themechange` integration pattern.
- Startup ordering before release overlays and mutation observers attach.
- Room renderer and `chatRenderLimits` to preserve long-chat projection separation.
- Backup builder to prove UI-state export contains no credentials.
- Browser reload, quota, transaction-abort, multi-tab, 320px, LTR, and RTL coverage.

## Unknowns requiring source confirmation

- Actual durable settings key and schema.
- Actual locale persistence behavior.
- Actual theme persistence key and supported modes.
- Actual model-selection persistence key and scope.
- Full IndexedDB schema and whether additional object stores already exist.
- Exact canonical location of selected-room state.
- Whether room quota and corruption recovery are implemented.
- Whether `currentRoom` changes participate in the same revision as room content.
- Whether legacy settings/model/theme/locale keys exist outside the supplied evidence.
- Release/build ownership for `seven_ai-final.html`.
- Persistence and migration policy for provider-health, usage, quota-pressure, and deep-research records.
- Whether legacy credentials are retained, scrubbed, or migrated by another subsystem.
- Desired user-facing recovery and reset controls.

WAVE01=COMPLETE

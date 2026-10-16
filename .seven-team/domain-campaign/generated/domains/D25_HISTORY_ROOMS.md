# D25_HISTORY_ROOMS — Conversation History / Room Lifecycle / Search / Archive

Research audit: READY

DOMAIN_ID=D25_HISTORY_ROOMS
SOURCE_ANALYSIS=Harvested primary sources: IndexedDB API [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API (structured client storage, transactions, indexes, schema/versioning, blobs, high-performance search use cases; notes WebStorage smaller-scale). React preserving-and-resetting state [SOURCE primary] https://react.dev/learn/preserving-and-resetting-state (keys for lists/rooms, remount on room switch, state preservation/reset). Static CSS/fonts harvested but not normative. Limitations: no specific room lifecycle/search/archive UX patterns (e.g., sort, pagination, soft-delete/restore, sync/conflict resolution) in harvested set. Freshness: MDN/React current.

CURRENT=Seven current implementation evidence:
- Room domain: `Room` aggregate with schemaVersion 1, id/title/modelId/messages[], createdAt/updatedAt; immutable snapshots via `cloneRoom`/freezing; validation in `isRoom`/commit paths.
- Persistence: `RoomRepository` port (`get/put/list/delete`), in-memory deterministic impl for tests, IndexedDB impl for browser/Android WebView; Milestone 1/12 includes save/list/get/delete, stored-room schema validation, structured storage failures, restart/restore round-trip.
- Lifecycle: createRoom, commitMessage updates updatedAt (max with message time), id uniqueness, timestamp invariants. No explicit archive/soft-delete or search API visible in inspected chat code; deletion is `delete(roomId)`. 
- Architecture: persistence behind ports/adapters, UI never touches IndexedDB directly; ShellStore owns shell state (active workspace/sidebar/dialog) — room activation is separate from storage.

TARGET=Desired behavior:
- Room lifecycle correctness: create/list/get/put/delete with schema validation, restart/restore identity preserved, structured errors on storage failures.
- State on switch: switching rooms resets transient UI (composer draft, streaming state) without corrupting history; React keys prevent cross-room leakage (align with preserving state).
- History UX: deterministic ordering (by updatedAt/createdAt), stable room identity, safe deletion (cascades/side-effects explicit), capacity/eviction policy explicit (Memory domain has explicit manual-delete-only capacity policy; rooms likely similar — no silent eviction). 
- Search/archive (scope per domain): room search/indexing over titles/messages metadata if implemented; archive as explicit state (separate from delete) to avoid accidental data loss; proof via evidence.

NOW=First high-value slice:
- Room list ordering/identity: ensure list returns deterministic order (e.g., updatedAt desc) and stable IDs; add tests for create→list→switch→delete round-trip (restart/restore already covered). 
- Deletion semantics: confirm delete is idempotent, structured error handling, and that active task ownership prevents deleting an active-room? (TaskManager ownership by roomId — deleting room while active generation exists is problematic). Need to inspect room deletion call sites; if UI can delete active room, must cancel or reject. 
- Switch safety: verify composer/controller uses roomId as key/remount boundary (React guidance). Inspect UI composition if present.

NEXT=Next improvements:
- Search: index room titles and recent message snippets in IndexedDB (use indexes). Define query surface (prefix/full-text) with bounds (max results, timeout). Avoid loading all messages for search.
- Archive: add explicit `archived` flag to Room (schemaVersion bump with migration) vs hard delete; filter in list by default, separate archived view.
- History metadata: lastMessageAt, messageCount to support list without hydrating full history blobs unnecessarily.

LATER=Longer-term ideas:
- Pagination/windowing for large histories, lazy message loading on room open.
- Export/import rooms (align with StorageEngine export/import contract).
- Sync/conflict detection across tabs (CAS/versioning on put) — memory domain already uses CAS for summaries; rooms may benefit from version checks on concurrent updates.

TESTS=Deterministic proof:
- Round-trip: create→put→get→list→delete with IndexedDB and in-mem.
- Schema validation: malformed stored room rejected with structured error.
- Restart/restore: persist then reload, identity/equality preserved.
- Deletion: idempotent delete, get after delete returns null.
- Active-room protection: attempt to delete room with active chat task → reject/cancel policy explicit (test). 
- Ordering: list order deterministic by updatedAt desc (or defined). 
- Adversarial: concurrent puts, storage quota, transaction failures, corrupted blob, migration path if schema changes.
- Search/archive: query bounds, case-insensitive, no PII leakage.

RISKS=Security/privacy: history persisted client-side (IndexedDB) — avoid logging full content in errors; ensure export/import redacts as needed. Performance: large rooms — avoid eager hydration; use indexes for search. Android: WebView IndexedDB availability/quota; storage failures structured. Cross-system: transaction semantics differ slightly but MDN IndexedDB stable; migration required for schema changes. Data loss: hard delete is destructive — archive state preferred before enabling bulk deletes.

FIRST_SLICE=Active-room deletion guard: when deleting a room that currently owns an active chat task (TaskManager.listActive(roomId) non-empty), reject deletion with structured error (or auto-cancel with explicit policy). This prevents losing in-flight assistant state/history consistency; smallest, testable, prevents real data integrity issue.

KNOWN_UNKNOWNS=No archive/search fields in current Room schema (v1); need to confirm intended lifecycle (hard delete only). Harvested sources lack concrete UX for history; inspect UI for room list/switching to see keys/remount behavior. Also need to confirm IndexedDB transaction timeout/retry behavior and any storage limits on Android target.

DOMAIN_VERDICT=READY_FOR_PLAN

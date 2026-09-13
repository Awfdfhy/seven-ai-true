# Seven AI — Capability 10 File & Project Tools Ultimate Polish

Status: **FREEZE CANDIDATE AFTER DOUBLE-POLISH RECONCILIATION**
Implementation status: **Deferred / repository and coding foundations exist**
Final target: **Seven Project File Fabric 3.0 — Transactional Scoped Workspace Engine**

## Executive decision

Seven should not expose a model directly to raw device paths or loosely scoped file mutations.

> **Prime law:** Every file action occurs inside an explicit project/file grant, against a canonical FileRef and version precondition, with staged mutation, conflict detection, recoverable commit semantics and post-change verification.

The final design makes files a typed, versioned project substrate rather than a bag of strings and paths.

---

## 1. Ground truth

Current Seven has meaningful foundations:

- Coding Runtime already has repository-map/evidence concepts and candidate isolation.
- `codingMap()` fingerprints safe files and rejects unsafe paths in runtime smoke.
- evolution coding flows validate changed paths against an explicit allowed set and reject stable-branch mutation.
- project context and coding workspace foundations exist.
- the implementation matrix still states that real platform shell/file bridge wiring is partial.
- Android SAF/Keystore final integration is not implemented.

Therefore #10 freezes the final file/project contract without claiming the platform bridge already exists.

---

# 2. Ownership boundary

File & Project Tools own:
- project roots/grants;
- canonical file identity;
- list/stat/read/range/search;
- project structure inspection;
- create/copy/move/rename/delete;
- patch/replace transactions;
- conflict detection;
- file hashes/version tokens;
- project manifests/maps as derived views;
- safe archive inspection;
- checkpoint/change-set integration;
- Android/browser/native file adapter contracts.

They do not own:
- permission authority (#08);
- real-world effect certainty (#09);
- coding strategy (#11);
- factual truth (#02);
- context selection (#04).

---

# 3. Pass A — MAXIMIZE

## 3.1 ProjectRoot instead of ambient filesystem

Every operation begins from an explicit `ProjectRoot` / `ProjectGrant`.

A root binds:
- project id;
- storage/backend adapter;
- authoritative root handle/URI/ref;
- principal;
- allowed operation classes;
- expiry/revocation state;
- case-sensitivity and path-semantics profile;
- protected-path policy;
- backend capability profile.

Seven does not assume access outside that root.

## 3.2 Canonical FileRef

Model-visible path strings are presentation values.

Canonical `FileRef` contains:
- project id/root id;
- normalized relative path;
- backend document/file identifier when available;
- file identity/version token;
- type/kind;
- optional content hash;
- lineage to the originating listing/read.

All mutations resolve through FileRef under the active ProjectGrant.

## 3.3 Path normalization

Before authority or mutation checks, paths are normalized consistently for the backend.

Policy covers:
- relative vs absolute semantics;
- redundant separators;
- `.` and parent segments;
- Unicode normalization;
- case sensitivity/case folding where backend requires;
- reserved names and invalid characters;
- aliases/links/reparse-like indirection where the backend exposes them.

The resolved target must remain inside the granted project boundary.

## 3.4 FileSnapshot and VersionToken

Reads produce a `FileSnapshot` with:
- FileRef;
- size;
- media/content type;
- modified-time hint when reliable;
- content hash when computed;
- backend revision/etag/document id when available;
- `FileVersionToken`;
- read time;
- encoding/binary classification;
- truncation/range metadata.

Mutation preconditions bind to a version token rather than trusting stale content.

## 3.5 Optimistic concurrency by default

Edits/replacements/renames/deletes that depend on a previous read require a matching precondition unless policy explicitly permits blind creation.

If the target changed since inspection:
- return `CONFLICT_STALE_BASE`;
- preserve both observed/current version refs;
- do not silently overwrite;
- let the planner re-read/rebase.

## 3.6 Operation taxonomy

Canonical operations:

### Observational
- LIST
- STAT
- READ
- READ_RANGE
- SEARCH_NAME
- SEARCH_TEXT
- HASH
- INSPECT_STRUCTURE
- ARCHIVE_INSPECT
- COMPARE

### Mutating
- CREATE
- REPLACE
- PATCH
- COPY
- MOVE
- RENAME
- DELETE
- MKDIR
- RESTORE

Coding-specific higher-level edit operations compile down to these primitives.

## 3.7 ProjectTransaction

Multi-file changes use a `ProjectTransaction`.

Lifecycle:
- `CREATED`
- `BASELINE_CAPTURED`
- `STAGING`
- `STAGED`
- `VALIDATING`
- `AUTHORIZED`
- `COMMITTING`
- `COMMITTED`
- `VERIFYING`
- `VERIFIED`
- `CONFLICTED`
- `ROLLING_BACK`
- `ROLLED_BACK`
- `UNCERTAIN`
- `FAILED`

The transaction stores logical changes, not duplicated full project copies unless required by backend/recovery policy.

## 3.8 Staged changes

Each `StagedChange` contains:
- operation type;
- source/target FileRefs;
- expected base version;
- resulting content/artifact ref or patch;
- expected resulting hash when known;
- protected-path classification;
- authorization/effect refs;
- verification rule.

No staged mutation becomes canonical merely because a model proposed it.

## 3.9 Patch-first editing

For existing text/code files, prefer bounded patch operations over whole-file replacement when practical.

Benefits:
- smaller context/output;
- clearer diff;
- better conflict detection;
- easier verification/review;
- lower storage/network cost.

Whole-file replace remains available when format or backend requires it.

## 3.10 Patch preconditions

A patch binds to:
- base FileVersionToken/hash;
- expected anchors/ranges where appropriate;
- encoding/line-ending profile;
- target path.

If anchors/base version no longer match, return conflict rather than guessing.

## 3.11 Rename/move safeguards

Before rename/move:
- verify source exists under grant;
- validate destination remains in scope;
- detect destination collision;
- check case-only rename semantics for backend;
- preserve identity/lineage where possible;
- update project-map derived views only after verified change.

A move across backend/storage roots is represented as copy + verified destination + source-delete phase, with explicit uncertainty rather than pretending it is atomic.

## 3.12 Delete safeguards

Deletion policy tiers:

### SOFT_DELETE / QUARANTINE
Preferred when backend/project supports a recoverable holding area.

### BACKEND_TRASH
Use platform/provider trash semantics when reliable and user-visible.

### HARD_DELETE
Separate high-impact operation requiring stronger authorization/confirmation policy.

Delete never relies on path text alone; it binds to current FileRef/version where possible.

## 3.13 Protected paths

Project policy can mark files/directories as:
- IMMUTABLE
- CONFIRM_WRITE
- CONFIRM_DELETE
- GENERATED
- VENDOR/DEPENDENCY
- SECURITY_CRITICAL
- LARGE/BINARY
- NORMAL

Protected classifications are policy metadata, not instructions found inside project files.

## 3.14 Directory operations

Directory mutation must account for descendants.

Before destructive directory operations, compute a bounded manifest summary:
- child count;
- total size estimate;
- protected descendants;
- untracked/unknown items;
- conflict state.

Large recursive operations may require a staged/background host task but must remain cancellable/recoverable.

## 3.15 Search and project maps

`ProjectMapView` is derived and rebuildable.

It may include:
- paths/tree;
- file types;
- size/version hints;
- hashes where available;
- code symbols/import relationships from specialized analyzers;
- generated/vendor flags;
- recent-change refs.

A project map is not authoritative file state. Before mutation, Seven revalidates the target version.

## 3.16 Large files

Large files use:
- metadata first;
- range reads;
- streaming/chunked reads;
- lazy hashing;
- artifact refs;
- selective search/extraction.

Do not inject entire large files into model context merely because they exist.

## 3.17 Binary files

Binary content is not implicitly decoded as text.

Use:
- type sniffing plus extension hints;
- metadata/hash operations;
- specialized document/media handlers where available;
- artifact references in context.

Mutation of complex binary formats is delegated to format-specific capabilities rather than generic text patching.

## 3.18 Encoding and line endings

Text snapshots record encoding and line-ending style when detected.

Default behavior preserves existing style unless the requested transformation intentionally changes it.

Ambiguous decoding returns an explicit state rather than silently corrupting content.

## 3.19 Archive inspection

Archives are treated as containers, not trusted project trees.

Inspection has limits for:
- entry count;
- total expanded size estimate;
- nesting depth;
- duplicate/conflicting names;
- entries resolving outside the chosen extraction root.

Extraction creates staged project changes and remains under the same authorization/transaction rules.

## 3.20 Checkpoint semantics

A checkpoint is a compact recoverability object, not necessarily a full copy.

Depending on backend it may use:
- VCS commit/ref;
- content-addressed changed-file blobs;
- backend version ids;
- local transactional snapshot;
- manifest + delta artifacts.

Checkpoint strength must be reported accurately.

## 3.21 Git/VCS integration

Git is an adapter/specialist, not the universal file authority.

When a project is Git-backed, Seven can use:
- HEAD/baseline identity;
- worktree status;
- diffs;
- commits/branches as recovery evidence.

But ordinary file tools also support non-Git projects.

## 3.22 Android storage architecture

Final Android baseline should prefer privacy-preserving storage primitives:

### App-private state
Use app-specific internal storage/database for Seven's private state and metadata.

### User project folders/documents
Use Android Storage Access Framework (SAF) for user-selected documents/directories, retaining URI grants where appropriate.

### Broad all-files access
Not a default Seven requirement. It should not be requested merely for convenience when scoped APIs can satisfy the project workflow.

The platform adapter exposes canonical project/document handles to Seven instead of raw unrestricted filesystem access.

## 3.23 Browser/PWA adapter

Web environments may use:
- File System Access API where available and user-granted;
- upload/download/import/export boundaries;
- IndexedDB/private project store fallback.

The canonical FileRef/transaction contract remains the same even when backend semantics differ.

## 3.24 Native/host bridge

Shell/file host bridges are adapter boundaries.

Rules:
- no arbitrary host path is accepted without ProjectGrant resolution;
- adapter reports capability profile: atomic replace, rename semantics, trash support, stable ids, hashing, range reads, cancellation;
- backend-specific errors normalize into Seven file error classes.

## 3.25 Canonical errors

- `NOT_FOUND`
- `OUT_OF_SCOPE`
- `PERMISSION_REQUIRED`
- `STALE_VERSION`
- `DESTINATION_EXISTS`
- `PROTECTED_PATH`
- `UNSUPPORTED_TYPE`
- `INVALID_ENCODING`
- `STORAGE_FULL`
- `READ_ONLY_BACKEND`
- `GRANT_REVOKED`
- `BACKEND_UNAVAILABLE`
- `PARTIAL_OPERATION`
- `COMMIT_UNCERTAIN`
- `CORRUPT_INPUT`

Provider/platform-specific details remain diagnostic lineage.

---

# 4. Velocity assault

File tooling must remain light on a phone.

Rules:
- no recursive full-project scan at startup;
- lazy project map creation;
- incremental invalidation after changed paths;
- metadata before content;
- range reads before full reads;
- lazy hashes unless mutation/integrity needs them;
- bounded search results;
- ignore generated/vendor/heavy directories by default where project policy allows;
- worker/off-main-thread parsing for expensive operations when available;
- Resource Governor controls scan/search/hash concurrency;
- large outputs become artifacts rather than chat blobs;
- cache keys include FileVersionToken/project grant.

Lite tier preserves file safety and conflict detection while reducing optional indexes and previews.

---

# 5. Pass B — DESTROY THE WINNER

Rejected alternatives:

## Raw absolute paths as canonical identity
Rejected. Backend/document identity and project scope must survive path presentation changes.

## Read once, overwrite later without precondition
Rejected. Stale bases cause silent data loss.

## Full project snapshot before every edit
Rejected. Too expensive on mobile; use change sets/version refs.

## Whole-file rewrite for every code edit
Rejected as default. Patch-first is more efficient and verifiable.

## Assume rename is atomic everywhere
Rejected. Backend semantics vary.

## Delete = permanent unlink by default
Rejected. Prefer recoverable project/backend semantics when available.

## Project map as authoritative state
Rejected. It is derived and can be stale.

## Full recursive scan on project open
Rejected. Incremental/lazy mapping is the mobile baseline.

## Broad Android filesystem permission as baseline
Rejected. SAF/app-scoped storage better matches least privilege and Play/privacy constraints.

## Git required for every project
Rejected. Git is powerful but optional.

---

# 6. Reconciliation result

The final architecture is a backend-neutral transactional file substrate:

`ProjectGrant -> FileRef/Snapshot -> staged change -> version/scope checks -> authorization -> commit -> verify -> update derived project map`.

It keeps Android SAF, browser storage and host/Git adapters behind one canonical contract.

---

# 7. Canonical objects

- `ProjectRoot`
- `ProjectGrant`
- `BackendCapabilityProfile`
- `FileRef`
- `FileSnapshot`
- `FileVersionToken`
- `FileReadReceipt`
- `ProjectTransaction`
- `StagedChange`
- `PatchSpec`
- `ProjectManifestSnapshot`
- `ProjectMapView`
- `CheckpointRef`
- `ArchiveManifest`
- `FileArtifactRef`

---

# 8. Frozen invariants

1. No file mutation outside an active ProjectGrant.
2. Raw display path is not sufficient authority or identity.
3. Resolved targets must remain inside granted scope.
4. Mutations depending on prior reads use version preconditions.
5. Stale bases produce conflict, not silent overwrite.
6. Project maps are derived, not authoritative.
7. Delete/rename bind to current target identity/version where possible.
8. Hard delete is distinct from recoverable delete.
9. Protected-path policy is external authoritative metadata.
10. Large/binary files are not blindly injected or patched as text.
11. Archive contents are inspected under bounded extraction rules.
12. Backend semantics are explicit through a capability profile.
13. Android baseline uses scoped/project-selected access rather than broad storage authority.
14. File operations integrate with #08 authorization and #09 effect tracking.
15. Coding Agent consumes file primitives; it does not bypass them.
16. Conflict/recovery correctness outranks speed.
17. Mobile optimization cannot remove version/scope/protection checks.

---

# 9. Evaluation contract

Core file operations:
- list/stat/read/range/search;
- create/patch/replace/copy/move/rename/delete;
- multi-file transaction;
- no-op patch;
- destination collision;
- protected path;
- read-only backend.

Concurrency/integrity:
- target changes after read;
- case-only rename;
- Unicode-normalized name collision;
- project grant revoked mid-run;
- low storage during commit;
- app/process interruption during mutation;
- partial multi-file commit;
- checkpoint/restore strength reporting.

Boundary tests:
- target resolution outside project root is rejected;
- archive entries remain confined to extraction target;
- project map stale entry forces revalidation;
- child/project scope isolation.

Android:
- SAF file selection;
- SAF tree grant;
- persisted grant reload;
- revoked URI permission;
- provider temporarily unavailable;
- app-private storage;
- no broad storage permission baseline.

Performance:
- project with 100 / 10k / 100k files;
- large-file range reads;
- incremental map update;
- lazy hashing;
- Lite-tier RAM/startup/battery;
- no project opened -> near-zero File Fabric startup cost.

---

# 10. Implementation stages

- **FPT-P0** canonical ProjectRoot/FileRef/Snapshot/version schemas.
- **FPT-P1** backend adapter contract + read/list/stat/search.
- **FPT-P2** path/resource normalization and protected-path policy.
- **FPT-P3** staged patch/create/replace transaction.
- **FPT-P4** move/rename/delete/copy/checkpoint semantics.
- **FPT-P5** project map incremental indexes.
- **FPT-P6** archive/binary/large-file specialists.
- **FPT-P7** Android SAF + app-private storage adapter.
- **FPT-P8** host/browser/Git adapter integration.
- **FPT-P9** Tool Security + SideEffectLedger + Coding Agent wiring.
- **FPT-P10** concurrency, crash, low-storage, large-project and phone-performance gates.

---

# 11. Proof of improvement

Compared with current partial project/coding primitives, Project File Fabric 3.0:
- makes project scope a first-class grant;
- prevents stale overwrites through version tokens;
- gives multi-file edits transactional staging;
- separates recoverable vs hard deletion;
- standardizes Android/browser/host backends;
- keeps project maps derived and rebuildable;
- avoids full-project/full-file work on mobile;
- gives Coding Agent a safe substrate instead of bespoke direct file mutation.

---

# 12. Research references

- Android Developers: Data and file storage overview.
- Android Developers: Storage Access Framework for documents and directory trees.
- Android Developers: Scoped storage and storage use cases.
- Android Developers: manage-all-files guidance and Play policy considerations.
- Existing Seven coding isolation, changed-path validation and runtime smoke evidence.

---

# 13. Freeze recommendation

**FREEZE CANDIDATE ACCEPTED.**

Final target: **Seven Project File Fabric 3.0 — Transactional Scoped Workspace Engine**.

Implementation remains deferred. No protected product source is modified by this architecture document.

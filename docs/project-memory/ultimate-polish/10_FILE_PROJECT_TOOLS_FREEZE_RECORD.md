# Seven AI — Capability 10 File & Project Tools Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**
Implementation status: **Deferred / current coding and repository foundations remain**

## Frozen target

**Seven Project File Fabric 3.0 — Transactional Scoped Workspace Engine**

## Prime law

> Every file action occurs inside an explicit project/file grant, against a canonical FileRef and version precondition, with staged mutation, conflict detection, recoverable commit semantics and post-change verification.

## Scope of this freeze

This freezes the canonical file/project architecture. It does not claim that Android SAF, the platform file bridge, Coding Agent 3.0, format-specific editors, or all storage adapters are already implemented.

## Final reconciled decisions

1. File actions operate inside an explicit `ProjectRoot` / `ProjectGrant`.
2. A visible path string is not sufficient canonical identity or authority.
3. `FileRef` binds project/root identity, normalized relative path and backend identity/version data when available.
4. Resource names are normalized before scope and mutation checks.
5. File snapshots carry a `FileVersionToken`.
6. Changes based on previous reads use version preconditions by default.
7. A changed base produces a conflict rather than a silent replacement.
8. Multi-file edits use a staged `ProjectTransaction`.
9. Patch-first editing is preferred for existing text/code files when practical.
10. Whole-file replacement remains available when the format/backend requires it.
11. Rename and move operations verify source, destination and backend semantics before commit.
12. Cross-root moves are not assumed to be atomic.
13. Recoverable delete/trash semantics are preferred when supported.
14. Permanent delete is represented as a distinct stronger operation.
15. Protected-path classifications come from authoritative project policy.
16. Directory operations account for descendant scope and project policy.
17. `ProjectMapView` is derived and rebuildable, not authoritative file state.
18. Targets discovered from project maps are revalidated before mutation.
19. Large files use metadata, range reads, streaming and lazy hashing.
20. Binary formats are handled through format-aware capabilities rather than generic text patching.
21. Text encoding and line-ending style are preserved unless intentionally changed.
22. Archive inspection is bounded; extracted content remains inside the selected project destination.
23. Checkpoints report their actual recovery guarantees.
24. Git is an optional adapter/specialist rather than a mandatory storage authority.
25. Android uses app-private storage for Seven-owned state and Storage Access Framework grants for user-selected files/folders.
26. Broad all-files storage authority is not the baseline architecture.
27. Browser, native and host adapters implement the same canonical FileRef/transaction contract.
28. Backend differences are explicit through `BackendCapabilityProfile`.
29. File actions integrate with Capability 08 authorization and Capability 09 effect tracking.
30. Coding Agent consumes these primitives rather than bypassing them.
31. Project mapping, hashing and heavy parsing are lazy/incremental.
32. Resource Governor controls expensive scan/search/hash work.
33. Lite tier may reduce optional previews/indexes but never removes scope, version or conflict protections.
34. Unused File Fabric features impose approximately zero startup work.

## Canonical objects

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

## ProjectTransaction states

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

## Canonical errors

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

## Android law

Use privacy-preserving storage boundaries by default: app-private storage/database for Seven-owned state and Storage Access Framework grants for user-selected files/folders. Broad storage access is not the default requirement.

## Velocity law

- no full recursive startup scan;
- metadata before content;
- range reads before full reads for large files;
- lazy hashing;
- incremental project maps;
- bounded search;
- large output artifactization;
- Resource Governor controls heavy scan/hash/parse concurrency.

## Mandatory eval families

- core read and write operations;
- changed-base conflict detection;
- protected-path handling;
- destination collisions;
- multi-file commit/recovery;
- low-storage behavior;
- revoked project grant;
- case/Unicode path behavior;
- bounded archive extraction;
- stale project-map revalidation;
- SAF file/tree grants and revoked URI access;
- large-project, large-file and Lite-tier performance.

## Implementation stages

- FPT-P0 canonical schemas
- FPT-P1 backend read/list/stat/search contract
- FPT-P2 normalization and protected-path policy
- FPT-P3 staged patch/create/replace transactions
- FPT-P4 copy/move/rename/delete/checkpoint semantics
- FPT-P5 incremental project map
- FPT-P6 archive/binary/large-file specialists
- FPT-P7 Android SAF and app-private storage adapter
- FPT-P8 host/browser/Git adapters
- FPT-P9 Security/Effect/Coding integration
- FPT-P10 concurrency/recovery/large-project/mobile gates

## Freeze decision

**FROZEN.**

No protected product source was modified. Architecture freeze is not implementation completion.

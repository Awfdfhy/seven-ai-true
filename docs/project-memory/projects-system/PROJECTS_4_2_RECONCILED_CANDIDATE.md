# Seven Project Fabric 4.2 — Local-First Durable Work Graph

Status: CURRENT V4 CANDIDATE — NOT SATURATED
Capability: #22 Projects System

This candidate inherits the complete Project Fabric 4.1 contract and integrates V4 Rounds 06–09.

## Canonical backbone remains unchanged
No new top-level authoritative stores were added. The eight primitives remain:
1. ProjectIdentity
2. ProjectManifest
3. ProjectEvent
4. ProjectResourceRef
5. ProjectWorkItem
6. ProjectPolicySet
7. ProjectSnapshotRef
8. ProjectVariantRef

This is intentional anti-bloat: access projections, import maps, working sets and storage views are derived/staging contracts.

## 4.2 additions

### 1. Persistent reference does not imply current access
ProjectResourceRef preserves identity/provenance even when the current user/account no longer has access.
A derived `ResourceAccessView` evaluates current readability/action eligibility from Seven security policy, account/connector state and Project restrictions.

Possible observations include AVAILABLE, AUTH_REQUIRED, ACCESS_REVOKED, UNAVAILABLE and UNKNOWN.

Project re-entry/context compilation must not reuse protected payload merely because an old reference or cache exists. Unavailable information becomes an explicit gap.

### 2. Capability intent instead of provider lock-in
Project policy stores durable capability requirements/preferences rather than concrete provider/tool bindings unless the user explicitly pins a binding.

Examples:
- needs_code_execution
- needs_vision
- prefers_local
- requires_no_external_network
- max_resource_tier

Tool Fabric and Model Fabric select current bindings. Explicit pins may produce PIN_UNAVAILABLE; Seven does not silently violate an exact pin.
Credentials/account connections are external bindings and are excluded from project export by default.

### 3. Storage lifecycle classes
Project-related storage is classified as:
- authoritative Project coordination state
- owner-fabric authoritative resources
- user-kept artifacts
- rebuildable indexes/previews/caches
- temporary execution data

Under storage pressure, eviction prioritizes rebuildable/temp classes allowed by owner policy. Archive unloads hot derived data.
A derived `StorageReachabilityView` can identify candidates but cannot prove an object is globally unreferenced; owner/global reference checks govern deletion.

### 4. Import identity collision safety
Import creates a staging `ImportIdentityMap`.
- package identity is preserved as provenance
- verified same-lineage objects may map to existing local identities
- conflicting identity with different lineage receives a new local identity plus IMPORTED_FROM provenance
- owner-fabric resource identities are remapped by their owner adapters
- title/path/name similarity never establishes identity
- unresolved refs remain unresolved, not guessed
- partial import requires policy allowance and produces an explicit ImportReport

This prevents imported graphs from silently attaching to unrelated local objects.

## Strengthened invariants
1. Reference != authority.
2. Reference != current access.
3. Same label/path != same identity.
4. Project preferences != provider dependency.
5. Project reachability != global ownership.
6. Cache possession != permission.
7. Import mapping != automatic trust.
8. Stale run proposal != current Project commit.
9. Variant overlay != domain branch authority.
10. Derived re-entry brief != project truth.

## Strengthened C0/C1 tests
- revoke connector/resource access after project creation; no cached/reference path may preserve prohibited action access
- import a package whose project/resource IDs collide with unrelated local IDs; no false identity merge
- remove a pinned provider/tool; exact pin must fail visibly or require explicit user policy change
- storage pressure evicts derived data without deleting authoritative/shared resources
- stale project run attempts commit after human edits; revision precondition rejects/reconciles
- export/import round trip preserves project relationships and lineage while excluding external credentials

## V4 state
Rounds 01–09 all found material improvements over the initial baseline.
Current saturation counter: 0/2.
The next stage is campaign-ledger completion plus a fresh unknown-unknown/alternative attack before independent reviews are allowed.

# Projects System — V4 Round 09: Import Identity and Collision

Starting target: Project Fabric 4.2 reconciliation.
Verdict: MATERIAL_IMPROVEMENT_FOUND

## Counterexample
Two exported projects can contain the same projectId or resource-local identifiers while representing different histories. An import can also target a device that already has the original project. Blindly preserving or regenerating IDs either creates collisions or severs lineage.

## Accepted design
- Import builds an `ImportIdentityMap` as a staging artifact.
- Package identities are namespaced by package/export identity during inspection.
- If an imported identity is already present and content/history matches verified lineage, importer may resolve to the existing object under explicit compatibility rules.
- If identity collides but lineage differs, create a new local identity and retain `IMPORTED_FROM` provenance to the package identity.
- Owner-fabric resource IDs are remapped by the owning importer/adapter, not guessed by Project Fabric.
- unresolved references remain explicit and do not point to a same-looking local resource by title/path alone.
- partial import is allowed only when manifest policy permits it and always produces a report of unresolved/skipped references.
- import remains non-executing until normal trust/security rules permit later actions.

## Why material
Without an identity-mapping contract, export/import can corrupt project graphs or silently attach imported relationships to unrelated local resources. This is a C0 data-integrity issue.

Saturation remains 0/2.

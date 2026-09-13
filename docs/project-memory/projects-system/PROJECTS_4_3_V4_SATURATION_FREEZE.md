# Seven Project Fabric 4.3 — Polishing V4 Saturation Freeze

Status: ARCHITECTURE SATURATED 2/2
Capability: #22 Projects System
Protocol: Seven Polishing Protocol V4

## Frozen architecture target
**Seven Project Fabric 4.3 — Local-First Durable Work Graph**

## Saturation history
- Rounds 01–13: `MATERIAL_IMPROVEMENT_FOUND`
- Round 14 targeted unknown-unknown/concurrency attack: `NO_MATERIAL_IMPROVEMENT` but not counted as an independent saturation review
- Eligibility audit: `ELIGIBLE_FOR_INDEPENDENT_SATURATION_REVIEWS`
- Independent Review A: `NO_MATERIAL_IMPROVEMENT` → 1/2
- Independent Review B: `NO_MATERIAL_IMPROVEMENT` → 2/2

## Canonical backbone
1. ProjectIdentity
2. ProjectManifest
3. ProjectEvent
4. ProjectResourceRef
5. ProjectWorkItem
6. ProjectPolicySet
7. ProjectSnapshotRef
8. ProjectVariantRef

## Core frozen laws
- Project owns durable coordination, not duplicated payload from owner fabrics.
- project identity is independent from path, chat, provider and workspace presentation.
- references do not imply ownership or current access.
- stale runs/sessions cannot overwrite newer Project state without revalidation.
- summaries/re-entry views remain derived and reconstructable.
- model-generated instructions do not become durable directives without accepted project policy flow.
- Project directives cannot override global Seven invariants.
- local Project core works without mandatory network/cloud availability.
- remote synchronization remains explicit and effect-aware.
- provider/tool intent is capability-based unless explicitly pinned.
- import identity mapping is lineage-aware; labels/paths never prove identity.
- partial import/export never masquerades as full success.
- process death and migrations require durable, restart-safe semantics.
- opening a Project does not require full history/resource hydration.
- domain branches remain owned by their responsible domain; Project variants coordinate them rather than replacing them.

## Evidence state
`ARCHITECTURE_ACCEPTED`

Not claimed:
- IMPLEMENTED
- TESTED
- DEVICE_VERIFIED
- RELEASE_PROVEN

Those states require the later implementation/eval/device pipeline.

## Deferred / rejected
- mandatory CRDT collaboration core
- cloud-canonical Project authority
- canonical Project summary
- duplicate file/memory stores
- universal merge engine
- always-on Project daemon
- provider-specific Project architecture
- collaboration ACL system inside #22

## Reopen triggers
Reopen if:
- implementation evidence breaks atomic/recovery assumptions
- collaboration becomes a Seven 1.0 requirement
- project-scale/device tests violate resource envelopes
- shared-resource behavior reveals ownership ambiguity
- a materially stronger architecture appears
- Android/platform persistence behavior invalidates assumptions
- new adjacent capability creates a contract conflict
- a C0/C1 regression is discovered

## Final bounded conclusion
Within the documented V4 search surface, evidence set, alternatives, regression cemetery and architecture-stage constraints, two meaningfully different independent reviews failed consecutively to find a material improvement.

Capability #22 is therefore frozen at architecture level as **Seven Project Fabric 4.3**.

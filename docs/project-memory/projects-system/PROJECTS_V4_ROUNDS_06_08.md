# Projects System — V4 Rounds 06–08

Starting candidate: Seven Project Fabric 4.1.

## Round 06 — Access-state drift
Verdict: MATERIAL_IMPROVEMENT_FOUND

A durable resource reference can outlive the current ability to read or use that resource. Therefore a reference must never imply current access.

Accepted changes:
- ProjectResourceRef stores identity/provenance only.
- current availability is a derived ResourceAccessView recomputed from current account connection state, Project restrictions and Seven's security layer.
- changed account/resource access invalidates dependent working-set entries.
- inaccessible resources remain historically referenced but surface as ACCESS_REVOKED, AUTH_REQUIRED or UNAVAILABLE.
- re-entry/context compilation must omit payloads no longer readable and preserve explicit gap markers.
- cached content follows retention/sensitivity policy and never grants current action authority.

## Round 07 — Provider/tool portability
Verdict: MATERIAL_IMPROVEMENT_FOUND

Persisting concrete provider bindings as project requirements makes projects brittle.

Accepted changes:
- Project policy stores capability requirements/preferences rather than provider identity unless the user explicitly pins a binding.
- example intents: needs_code_execution, needs_vision, prefers_local, requires_no_external_network, max_resource_tier.
- Model Fabric and Tool Fabric resolve current bindings at run time.
- explicit pins carry binding/version availability and become PIN_UNAVAILABLE rather than silently switching when exactness is required.
- import/export preserves capability intent; credentials and account connections are external bindings and are not bundled.

## Round 08 — Storage pressure and orphan semantics
Verdict: MATERIAL_IMPROVEMENT_FOUND

Project graphs can accumulate derived indexes, previews, caches and temporary outputs.

Accepted changes:
- classify project-related storage into authoritative coordination state, owner-fabric authoritative resources, user-kept artifacts, rebuildable derived data and temporary execution data.
- storage pressure evicts only classes allowed by owner policy, prioritizing rebuildable/temporary data.
- StorageReachabilityView is derived and may identify candidates, but owner-fabric/global reference checks decide deletion.
- archive unloads derived indexes and hot caches aggressively.
- not reachable from one project never means globally unused.
- export reports omitted rebuildable representations explicitly.

## Result
Candidate 4.1 is materially improved again. Next reconciliation target is 4.2. Saturation remains 0/2.

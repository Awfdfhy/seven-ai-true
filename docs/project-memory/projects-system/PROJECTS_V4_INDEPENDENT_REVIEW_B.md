# Projects System — V4 Independent Saturation Review B

Candidate: Seven Project Fabric 4.3
Lens: minimalism, mobile/resource pressure, portability, UX translation and future evolution.

Review dimensions intentionally differ from Review A:
- can the eight-primitive backbone be reduced further?
- can any derived/staging object be removed or merged?
- does any feature impose startup/runtime cost merely by existing?
- does provider/tool choice leak into durable Project semantics?
- can a project still open offline after provider/account loss?
- does large-history scaling require replay or full graph hydration?
- can import/export, variants and directives be understood without exposing implementation complexity?
- do Arabic/RTL, accessibility, archive/delete and degraded-resource states require a new canonical primitive?
- can future collaboration be added without redesigning single-user authority?

Simplification attempts:
- merge ProjectManifest and ProjectPolicySet: rejected because declaration metadata and governing restrictions have different lifecycle/validation semantics; merging saves little and increases ambiguity.
- remove ProjectSnapshotRef: rejected because bounded recovery/re-entry for large histories needs an explicit checkpoint reference without rewriting history.
- remove ProjectVariantRef: rejected because project-level ancestry/coordination remains useful even when domain branches are delegated.
- replace ProjectWorkItem with transcript-derived tasks: rejected because long-lived intent must survive session/context replacement.

Performance attack found no mandatory eager subsystem. Large graphs/history remain paged and rebuildable; embeddings, sync and remote connectors are optional/lazy.

Portability attack found capability intent decoupled from provider/tool bindings and external account credentials excluded from Project packages.

UX attack can be represented through progressive views over existing types; no new canonical state is justified.

Verdict: `NO_MATERIAL_IMPROVEMENT`
Saturation counter: `2/2`.

This closes the current documented architecture search surface only. Reopen triggers remain active.

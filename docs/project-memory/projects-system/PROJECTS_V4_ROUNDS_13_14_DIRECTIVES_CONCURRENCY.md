# Projects System — V4 Rounds 13–14

## Round 13 — Durable project instructions / directive precedence
Verdict: MATERIAL_IMPROVEMENT_FOUND

Gap found: the baseline promised Project instructions, but prior candidates did not define how durable user conventions differ from model suggestions, security policy or task goals.

Accepted changes:
- define `ProjectDirective` as a typed record contained by ProjectManifest/ProjectPolicySet, not a new top-level primitive.
- directive classes: USER_INSTRUCTION, PROJECT_CONVENTION, OUTPUT_PREFERENCE, WORKFLOW_CONSTRAINT, TOOL_PREFERENCE.
- every directive carries origin, created/updated revision, scope, enabled state and optional applicability selectors.
- model-generated suggestions remain PROPOSED until explicitly accepted by the authorized user/policy path.
- directives cannot override Seven security, authority, truth, side-effect or platform invariants.
- conflicting directives are surfaced as `DIRECTIVE_CONFLICT`; precedence is deterministic by authority class and explicit scope, not arbitrary recency.
- re-entry/context compilation includes only applicable directives and preserves their provenance.
- imported directives inherit project trust/import policy and never become executable authority merely because they were packaged.

Why material: otherwise a project can silently convert model prose or old chat instructions into persistent policy.

## Round 14 — Cross-project sharing and concurrent local editors
Verdict: NO_MATERIAL_IMPROVEMENT

Attack surface:
- two Projects reference the same external/shared resource
- one Project archives/deletes while another still references it
- two app windows/processes edit the same Project revision
- stale Session resumes after another Session commits changes

Existing 4.2 + Rounds 10–13 already cover these materially:
- ResourceRelation + owner-fabric global ownership prevents project-local reachability from deciding deletion.
- ProjectResourceRef does not imply authority/current access.
- expected Project revision + atomic ProjectMutationTransaction rejects stale writers.
- runs bind baseProjectRevision and revalidate before project commit.
- project graph indexes are derived and can refresh after committed revision changes.

No new canonical primitive or policy survived the complexity gate.

Saturation reviews are still not counted here; Round 14 only closes a targeted unknown-unknown surface.

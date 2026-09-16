# Seven AI — Final UI Completion & Product Wiring Gate

Status: `REQUIRED_BEFORE_FINAL_E2E_AND_FINAL_SEVEN`
Branch: `ultimate-polish-v1`

## Product-owner directive
Seven must not enter Final End-to-End Verification with capabilities that only exist behind the UI, dead or placeholder controls, test-only entry paths, or visually complete surfaces that are not connected to the real runtime. Final UI Completion is a mandatory product gate, not a cosmetic polish pass.

The canonical mapping is:

`Capability Registry -> User Entry Point -> Real Runtime Wiring -> Observable State Matrix -> E2E Proof`

A capability may share a coherent workspace, sheet, menu, command, or action with related capabilities. Seven must not manufacture one screen per capability. The goal is maximum discoverability and minimum interaction clutter while preserving expert escape hatches.

## Required product surfaces
The gate must inventory every release-relevant capability and place it in the smallest coherent product surface. At minimum the mapping must cover the applicable areas from the canonical Capability Registry:

- Chat / Cognitive Runtime / Model Fabric / Adaptive Compute
- Memory and Context Workspace
- Tools, files, projects and permissions
- Search / Retrieval / Web and evidence surfaces
- Vision and multimodal inputs
- Coding Agent and structured terminal/tool activity
- Research workspace and source/evidence inspection
- RPG / Real Works and canon-aware controls
- Generated UI
- Sessions, persistence and recovery
- Stop / Continue / Retry / Cancel
- Settings, model/provider controls and accessibility preferences
- Android/native integrations
- Cross-system workflows where one workspace invokes another capability

## Entry-point rule
Every release-relevant capability must have one of these explicit outcomes recorded in the final mapping:

1. `DIRECT_UI` — a visible control or user-facing entry point is appropriate.
2. `CONTEXTUAL_UI` — shown only when the capability becomes relevant to the current task/state.
3. `AUTOMATIC_RUNTIME` — intentionally automatic and not presented as a manual control; the UI must expose enough status, explanation or override where user agency requires it.
4. `EXPERT_ESCAPE` — advanced control is intentionally nested to keep the default path simple.
5. `NO_USER_SURFACE` — infrastructure-only capability, with a documented reason and verification path.

No release-relevant capability may be omitted from the mapping merely because its backend exists.

## Real-wiring rule
A visible control passes only when it invokes the real production/runtime path. Mock handlers, demo payloads, fixture-only responses, TODO handlers, disabled placeholders, controls that only change visual state, and test-only wiring fail this gate.

For a side-effecting action, the surface must preserve the canonical Tool Security Kernel, permission/authority binding, side-effect uncertainty and verification rules. UI convenience must never promote authority or bypass confirmation/permission policy.

## Mandatory state matrix
For every user-facing or contextual capability, verify each applicable state rather than styling only the happy path:

- Ready / idle
- Loading / preparing
- Running / streaming / tool execution
- Success / completed result
- Empty / no result where meaningful
- Error with useful recovery
- Retry
- Cancel / Stop and post-cancel state
- Permission required / denied / changed
- Offline or network unavailable
- Provider/model unavailable or degraded fallback
- Persistence/restart recovery where state should survive
- Long content / large output / malformed input where relevant

A state may be explicitly `NOT_APPLICABLE`, but must not be silently skipped.

## Information architecture and interaction law
Seven should feel like one product, not a pile of subsystems. Related capabilities must be consolidated into coherent workspaces and progressive disclosure. Default `Open -> Ask -> Seven selects the path -> Result` remains the primary low-friction flow. Advanced users retain explicit model/tool/context controls without forcing those controls into the default path.

Primary workspaces may contain contextual sheets, inspectors, action bars and detail panels. Duplicate controls that perform the same runtime action should be consolidated unless distinct context materially changes user intent.

## Visual and interaction completion
The final surface set must use the frozen Seven identity and design system consistently across day/night themes and must verify:

- hierarchy, spacing and typography consistency;
- touch targets and keyboard/focus behavior where applicable;
- Android insets, keyboard appearance and viewport resize behavior;
- Arabic / RTL layout, bidi content and mixed Arabic-English technical strings;
- Reduced Motion and performance-tier behavior;
- responsive compact-phone behavior and long/overflowing content;
- meaningful animation only, with no animation allowed to block an action or hide a state transition;
- readable error, permission and recovery states;
- no layout flash or dead area when lazy workspaces load.

## Smoothness and mobile resource gate
UI completion is not achieved by screenshots alone. The final Android/device QA must exercise real interaction flows under representative load, including long chat history, streaming, tool activity, workspace switching and keyboard use.

Material jank, frozen input, repeated layout jumps, blocking transitions, memory-pressure collapse, or animation that significantly harms latency is a release defect. Expensive visual systems must remain lazy and performance-tier aware. The startup hot path must not be expanded merely to make a secondary workspace prettier.

## Capability-to-UI audit artifact
Before Final E2E, produce a machine-readable or reviewable matrix with one row per release-relevant capability containing at least:

`capability_id | release_relevant | entry_point_class | surface | trigger | runtime_target | applicable_states | permission_boundary | persistence_behavior | test/evidence_ref | status`

Allowed final statuses are:
- `WIRED_VERIFIED`
- `INFRA_VERIFIED`
- `BLOCKED`
- `NOT_RELEASE_RELEVANT` with rationale

`PLANNED`, `PLACEHOLDER`, `VISUAL_ONLY`, `UNKNOWN`, or an empty evidence reference cannot pass Final UI Completion.

## Dead-control and orphan-capability sweep
The final gate must perform both directions of the audit:

- UI -> Runtime: every actionable control resolves to a real runtime behavior or is removed.
- Runtime -> UI: every release-relevant user capability has an intentional entry-point classification and E2E-accessible path.

This prevents both dead buttons and powerful but unreachable backend features.

## Accessibility, RTL and Reduced Motion
Existing structural accessibility, RTL and motion foundations are inputs to this gate, not substitutes for it. Final product wiring must preserve semantics, focus order, labels, live/status announcements where needed, RTL directionality, and Reduced Motion across the actual finished surfaces. Later device-level TalkBack/Android QA remains authoritative for device claims.

## Evidence boundary
HOST/browser screenshots may prove structural or visual properties but cannot be promoted into Android device evidence. Synthetic responses may test state rendering but cannot prove real runtime wiring. The final mapping must distinguish visual evidence, runtime evidence and Android/device evidence.

## Exit criteria
This gate closes only when:

- every release-relevant capability has an intentional entry-point classification;
- every visible actionable control is wired to a real runtime path;
- applicable state matrices are implemented and exercised;
- no known dead buttons, placeholder actions or orphan release capabilities remain;
- final surfaces preserve accessibility, RTL, Reduced Motion and responsive behavior;
- representative Android interaction flows satisfy the smoothness/resource gate;
- the capability-to-UI audit contains evidence references and no open `BLOCKED` item;
- the exact resulting product state is ready to enter `FINAL_END_TO_END_VERIFICATION_GATE.md`.

## Sequence lock
`IMPLEMENTATION -> FINAL_UI_COMPLETION_AND_PRODUCT_WIRING -> FINAL_E2E -> RED_TEAM -> REPAIR/REGRESSION -> ANDROID/DEVICE_QA -> EXACT_RC -> FINAL_VERIFICATION -> FINAL_SEVEN`

Final UI completion does not authorize a merge to `main`. Protected `seven_ai-final.html` remains untouched unless the product owner explicitly authorizes a source change.
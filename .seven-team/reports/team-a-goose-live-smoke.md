# Live Smoke Test Report — Team A / A07 / Goose

## 1. Identity

- **Team:** Team A (UI Foundation V2 & product cohesion)
- **Worker:** A07 — Self-Dev/security UI boundaries, credential surfaces, protected-action UX
- **Agent:** Goose

## 2. Mission

Own the boundary between the product's self-dev capabilities and its security
model in the UI layer. Concretely: define and enforce where trust stops —
which surfaces may render credential material, which actions require
re-authorization or a manager lease before they execute, and what the user sees
when an action is refused. Ensure that self-dev tooling (diagnostics, internal
views, privileged actions) is legible and safe for the people using it, and that
a refusal is a designed experience rather than a stack trace. A feature in my
scope is not done until it clears functional, experience, integration, and
evidence gates.

## 3. Security & Integration Risks

1. **Credential leakage into prompts, logs, and telemetry.**
   Credential surfaces (tokens, session material, connection strings) rendered in
   UI can be captured into model context, log sinks, crash reports, or telemetry
   pipelines. Masking must be structural — redaction applied at the data
   boundary before the value ever reaches a model call, not a UI-level overlay that
   leaves the raw value flowing downstream.

2. **Self-dev as a privilege-escalation path.**
   Self-dev tooling that inspects or mutates its own runtime can be used to read
   secrets, disable guards, or bypass protected actions. A self-dev session must
   carry no more authority than the acting user, and privileged operations must
   require explicit re-authorization rather than inheriting ambient elevated
   session state.

3. **Integration drift across the protected-action contract.**
   Once guards live only in the UI, any non-UI caller (CLI, API, another agent,
   a background job) bypasses them entirely. A UI-only gate produces a false sense
   of safety and inconsistent behavior across surfaces. Protected actions must be
   enforced at the shared-core boundary — which additionally means writes there
   require a manager lease, or we will create unmergeable conflicts across teams.

## 4. Branch

`agent/07-security-selfdev`

## 5. Result

All five required elements are present; report written to the single permitted
path with no other repository changes.

LIVE_AGENT_SMOKE=PASS

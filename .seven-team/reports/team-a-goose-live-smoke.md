# Team A — Live Runtime Smoke Test (Goose)

## 1. Identity

- **Team:** Team A (UI Foundation V2 / cross-workspace product cohesion)
- **Agent:** A07
- **Runtime:** Goose
- **Date:** 2026-10-03

## 2. A07 Mission (in my own words)

I own the boundary between Self-Dev tooling and the security surfaces users actually see.
My job is to make sure that anything privileged — credential entry, secret storage, or a
protected action such as a deploy, publish, or permission change — is rendered so a person
can tell, before they click it, that they are doing something with real consequences and that
consequences are reversible (or explicitly not). Concretely, I keep three things true:
protected actions are visually and semantically distinct from ordinary UI actions, credentials
never become model-visible or repository-visible content, and any change that reaches into
shared core is treated as a leased, reviewed change rather than a drive-by edit. I also
guard the Self-Dev integration points where an agent can read or emit what a human typed,
because that is the point where a UI affordance silently turns into a data-exfiltration path.

## 3. Three Security / Self-Dev Integration Risks

**Risk 1 — Credential surface leakage into model-visible context.**
Self-Dev features (agent runs, session replay, debug/trace views, log tails) routinely render
whatever is on screen. If a secret entry field, an auth header, or a `.env` value is rendered
into a transcript, prompt, or diagnostic bundle, it becomes model-visible and then
repository-visible in whatever the agent writes. Mitigation: redaction at the render layer,
never at the model layer; secrets are marked as such at input time and masked by construction,
not by later scrubbing of free text.

**Risk 2 — Protected actions indistinguishable from ordinary UI actions.**
When a destructive or privileged action (delete, force-push, publish, rotate, permission grant)
renders with the same affordance as a routine button, users perform it reflexively and the UI
carries the blame. Mitigation: a single, consistent protected-action treatment — distinct
styling, explicit consequence text, and a confirmation step that names the exact target and
whether it is reversible.

**Risk 3 — Unleased mutation of shared core by a security-scoped agent.**
Self-Dev agents are given write access to make progress quickly, and a change that "just
touches the shell" or a shared component can alter behavior for every other workspace. Without a
manager lease and independent review, a locally-reasonable security edit becomes a
cross-workspace regression with no owner. Mitigation: lease before any shared-core edit,
independent review before merge, and a default of not editing shared core at all unless the
task requires it.

## 4. Branch

`agent/07-security-selfdev`

## 5. Change Discipline

This run modified exactly one file: this report. No environment variables, credentials, git
remotes, or network resources were inspected. No other repository file was created, edited,
or deleted.

LIVE_AGENT_SMOKE=PASS

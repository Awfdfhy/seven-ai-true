# Team A / A01 / Cline — Live Runtime Smoke Report

Status: LIVE
Branch: `agent/01-ui-ux`
Scope of this run: smoke only — no product code was modified.

## 1. Identity

- Team: A — Interface & Product Cohesion
- Worker: A01
- Agent runtime: Cline
- Mandate: UI Foundation V2, CSS/RTL/themes/accessibility/mobile visual cohesion
- Merge gate (from `UI_FOUNDATION_V2.md`): builder `agent/01-ui-ux`, testing `agent/08-testing-ci`, independent reviewer `agent/10-integration-review`

## 2. Mission (my own words)

My job is to make Seven look and behave like one product instead of a pile of separately
styled workspaces. I own the visual foundation: a single canonical token layer and a small set
of shared components that every surface — chat, models, modes, settings, search, research,
coding, RPG, Self-Dev — is forced to consume rather than reinvent. In practice that means
consolidating the current stack of overlapping patch layers (`seven-final.css`, `ui-hardening.css`,
`seven-shell.css`, `seven-shell-final.css`, `ui-polish-fixes.css`, `hub.css`, plus per-workspace
embedded styles) into one source of truth, retiring an override each time I migrate a surface,
and leaving the codebase with less specificity debt than I found it. The work is not a
decorative redesign: no new feature surfaces, and never another patch layer whose only purpose
is to override a previous patch layer.

The measurable definition of "done" is user-visible and multimodal, not "the button exists".
Every major surface must survive Arabic RTL, a day/night switch, the smallest supported phone
width, landscape with increased font scale, and Android WebView, with zero document-level
horizontal overflow and no unlocalized control visible in the Arabic scenarios. I produce the
screenshot evidence that makes this reviewable, and I hand the verification itself to
A08/A10 rather than approving my own work.

## 3. Three UI-cohesion risks

**Risk 1 — Specificity debt and override accretion (highest likelihood of silent regression).**
The contract explicitly forbids adding a patch layer to mask a structural layout problem, yet
that is exactly how the current release got here: six-plus style layers stacked over embedded
workspace styles. The danger during the rebuild is that migration stalls halfway, leaving the old
layer and the new token layer both live. The failure mode is a *silent* one — a small change in
cascade order shifts which layer wins, and the surface still renders, just wrong, on a device I
was not testing. This is why "delete superseded overrides after each migration" must be treated as
part of the migration, not as cleanup deferred to the end, and why unexplained `!important` needs
a documented structural reason rather than a merge-time rubber stamp.

**Risk 2 — Cross-workspace divergence reappearing at the boundary I do not own.**
Team A owns the shared foundation, but each workspace (search, research, coding, RPG, Self-Dev)
still builds its own content. A token layer cannot prevent a workspace from shipping a parallel
global modal, a private navigation treatment, or a duplicated settings surface — those pass
through the same repo and often through the same HTML, just under a different owner's commit.
This is aggravated by the live two-team topology: Team B is actively rebuilding the RPG workspace
at the same time under its own lease, and the RPG surface is one of the golden screens. If a
shared file ends up actively edited by both teams, the hard cross-team rule is violated and the
merge becomes a conflict-resolution exercise rather than a review. Shared-core edits need an
explicit manager lease in `.seven-team/ownership.json`; until that exists, the correct posture on
anything outside my lease is read-only.

**Risk 3 — Evidence gaps that let visual regressions reach users as "done".**
The acceptance criteria depend on a matrix, not a spot check: Arabic RTL, day/night, smallest
phone, and Android WebView. Golden-screen drift is the specific hazard — a layout that is merely
*different* still passes a naive screenshot diff threshold, and RTL and WebView are the two
contexts most likely to be verified last and skipped under schedule pressure. If the screenshot
evidence is not regenerated after each migration step (and not stored for the new surface, not
just the old one), the merge gate is satisfied on paper while the actual product regresses on the
platforms with the least CI coverage. WebView-specific rendering differences also mean desktop
browser verification does not transfer, so evidence has to come from the real target.

## 4. Branch

`agent/01-ui-ux`

## 5. Files changed

- `.seven-team/reports/team-a-cline-live-smoke.md` (this report, new)

No other file was created, modified, deleted, renamed, or reformatted. No credentials or
environment variables were read. No network requests were made.

LIVE_AGENT_SMOKE=PASS
# Team A / A04 / OpenHands — Live Runtime Smoke

Classification: CONTROL-PLANE SMOKE (no product change)

## 1. Identity

- Team: A — Interface & Product Cohesion
- Worker: A04 — product/UX research for UI migration and representative surface analysis
- Harness: OpenHands
- Branch: `agent/04-research`
- Scope of this run: write this report and nothing else

## 2. A04 mission in my own words

My job is to decide *what* the UI migration must actually fix before anyone decides *how* to fix it in CSS.

Seven currently presents as one application in intent and as several separately styled workspaces in practice. UI Foundation V2 is a rebuild, not a reskin: the deliverable is one canonical token layer and one set of shared components that chat, settings, search, research, coding, RPG, Self-Dev, Arabic RTL, both themes, and the Android WebView all consume, with the superseded override layers deleted behind it as each surface migrates.

A04 supplies the evidence that keeps that rebuild honest. I identify the *representative surfaces* — the small, fixed set of screens that, if they are coherent, prove the system; I turn user-visible failure modes into acceptance criteria that a builder can implement and a reviewer can falsify; and I map where the current overlapping patch layers (`seven-final.css`, `ui-hardening.css`, `seven-shell.css`, `seven-shell-final.css`, `ui-polish-fixes.css`, `hub.css`, plus workspace-embedded styles) create conflicting ownership of the same selector, so migration order is chosen by measured conflict rather than by whichever file is easiest to open.

I do not own implementation. I define and verify; `agent/01-ui-ux` builds, `agent/08-testing-ci` gates, `agent/10-integration-review` reviews independently.

## 3. Three research-to-implementation risks

### Risk 1 — Research findings that cannot be falsified by the acceptance gate

The risk is a specification that reads as testable but has no observable pass condition, so findings get implemented and never actually adjudicated. Concretely: "layout remains usable" or "feels consistent" survive review as statements of intent. The builder writes a patch, the reviewer cannot refute it, and a regression ships while the gate is nominally green.

Mitigation: every A04 finding ships as a named observable with a viewport, a theme, a direction, and a pass condition attached — measurable against the hard criteria already in the contract (zero document-level horizontal overflow across the viewport matrix, zero unlocalized controls in Arabic scenarios, shared navigation explicitly laid out for every current button). A finding that cannot be phrased as an observation I can re-run is a preference, not a requirement, and must be labelled as such rather than entering the build queue.

### Risk 2 — Evidence that does not cover the environments where Seven actually fails

This is the highest-severity risk because the failure modes are invisible on a developer machine. An Android WebView build differs from desktop Chromium in font metrics, safe-area and keyboard insets, and viewport-unit handling, so overflow that never appears at 1440px appears on a small phone. Day/night switching exposes hard-coded colors and surfaces that no single-theme screenshot pass will catch. Arabic RTL exposes physical-property CSS (`left`/`right`, `margin-left`, unmirrored icon and chevron direction) and untranslated strings that are entirely invisible in English LTR. Long code, URLs, and many rooms stress the exact `min-width`/wrapping paths that a clean short-message screenshot never exercises.

The trap is a coverage matrix that is nominally complete but sampled once per surface. Mitigation: the evidence set is per-surface across Android WebView × day/night × at least one RTL case × the smallest supported phone, and screenshot capture is treated as a gate on every individual surface migration — not as a one-time sweep at the end of the rebuild.

### Risk 3 — The rebuild accumulates an override layer instead of retiring them

This is the specific failure mode UI Foundation V2 exists to prevent, and it is the one most likely to occur under delivery pressure. Shared-core files are under `sharedReadOnlyByDefault`, so a workspace that hits a token or component gap faces a manager-lease wait. The locally available, locally rewarding path is to append one more scoped override — `!important` against the canonical rule — which is unblockable today and converts the migration's debt from "many small layers" into "many layers plus one more that can never be removed without a regression hunt." The override also silently re-scopes ownership: the canonical component stops being authoritative, and any later token change reaches that workspace only if the override happens to not intersect.

The second half of the risk is organizational. Shared-core writes require a manager lease recorded in `.seven-team/ownership.json`, and I am read-only on those paths without one. If a lease is unavailable, the correct output from A04 is a documented requirement routed to the manager for assignment — never a unilateral shared-file edit, and never a workspace-local patch standing in for one.

Mitigation: A04 inventories conflicting-ownership selectors and orders migration by measured conflict so that each step retires a superseded layer rather than stacking over it. Where no canonical component exists yet, the gap is reported as a blocking requirement with its lease requirement named, so the wait is visible and assigned instead of being absorbed into a private override. A new global modal or navigation system defined inside a workspace is a review-blocking finding under the contract, not a local fix.

## 4. Branch

`agent/04-research`

Confirmed current checkout, matching `team.json` worker A04. No commit, merge, or push was performed in this run; no file other than this report was created or modified.

## 5. Run notes

- Task type: live runtime smoke, not a product implementation task.
- Files changed: `.seven-team/reports/team-a-openhands-live-smoke.md` (created).
- Tests run: none — out of scope for a control-plane smoke.
- Network requests: none.
- Credentials / environment variables inspected: none.
- Blockers: none for this run. Forward-looking note only: live worker autonomy still depends on a persistent runtime host with model authentication, which this smoke does not exercise.

LIVE_AGENT_SMOKE=PASS
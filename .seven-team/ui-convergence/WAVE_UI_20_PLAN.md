# Seven AI — 20-Agent UI Convergence Wave

Base SHA: 0c112b9fd701875f2dff239d1b4fa222cb09c929
Branch: ui/20-agent-convergence-20261006
Goal: rebuild/converge the visual layer without changing product features or weakening tests.

## Non-negotiable rules
- One canonical owner per surface.
- No agent may add a second competing UI system for an existing surface.
- Do not raise size budgets or weaken visual/Android gates.
- Shared shell/core files require Integrator approval.
- Every implementation change must include before/after evidence and a regression test.
- Android 14 + Android 16 screenshots are release evidence.
- RC remains BLOCKED until visual review passes.

## Agent allocation

### Audit + design system — A01–A08
A01 — UI architecture/ownership map: identify all competing CSS/JS layers and deletion candidates.
A02 — Mobile topbar/sidebar/composer geometry and safe areas.
A03 — RTL/Arabic/localization/a11y audit.
A04 — Design tokens, spacing, typography, radii, shadows, z-index ladder.
A05 — Model picker / mode picker / popovers / menus.
A06 — Settings/dialogs/forms and keyboard/viewport behavior.
A07 — Chat message rendering/actions/code blocks/attachments.
A08 — RPG/Coding/Research/Self-Dev workspace visual consistency.

Deliverable: reports only; no production writes.

### Implementation — B01–B08
B01 — Canonical shell + navigation.
B02 — Topbar + sidebar + mobile header.
B03 — Chat + message actions + composer.
B04 — Model/mode/attachment menus; one picker system only.
B05 — Settings/dialogs/forms.
B06 — RTL/Arabic + accessibility implementation.
B07 — Workspace visual convergence: RPG/Coding/Research/Self-Dev.
B08 — Theme/night/day + design-token consolidation.

Each implementation agent owns only its assigned files/surface and must delete obsolete competing rules when replacing them.

### Validation — V01–V03
V01 — Android 14 visual + interaction review.
V02 — Android 16 visual + interaction review.
V03 — Playwright viewport matrix: 320/360/390/420 widths, RTL/LTR, day/night, font scale, keyboard.

Validation agents do not implement fixes.

### Integrator — I01
- Only agent allowed to merge shared shell/core UI changes.
- Resolves conflicts and removes duplicate CSS/JS layers.
- Maintains bundle budgets.
- Runs full Seven AI tests + Android workflow.
- Final verdict: UI PASS or UI BLOCKED with exact defects.

## Required visual gates
1. No clipped topbar titles/actions.
2. One model picker only; fully visible and usable on 320px.
3. No duplicated message/RPG actions.
4. Sidebar opens/closes cleanly in RTL and LTR.
5. Composer stays inside viewport with keyboard open.
6. Settings/dialogs fit smallest supported phone.
7. RPG/Coding/Research/Self-Dev share the same visual language.
8. Day/night themes have consistent contrast and surfaces.
9. No horizontal overflow at 320px.
10. Screenshot review must pass visually, not only DOM bounds.

## Release rule
Do not declare RC1 READY from CI alone. The final candidate needs:
- Seven AI tests: SUCCESS
- Android 14: SUCCESS
- Android 16: SUCCESS
- APK verification/signing: SUCCESS
- visual artifacts manually reviewed
- no open P0/P1 UI defects

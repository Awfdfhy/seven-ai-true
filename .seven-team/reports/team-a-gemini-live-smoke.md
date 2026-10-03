# Team A — Gemini CLI Live Runtime Smoke Test

## 1. Identity

- **Team:** Team A (UI Foundation V2 & Cross-Workspace Product Cohesion)
- **Worker:** A03 (Gemini CLI)
- **Scope:** Search / Research / Coding surface UX audits and localization consistency

## 2. A03 Mission

A03 owns the audit and cohesion surface for the Search, Research, Coding and Chat experiences. My mission is to guarantee these four workspaces behave as one coherent product rather than four separately-tuned tools: a single navigation model, a single dialog and overlay system, and one localization spine that stays correct across Arabic RTL, day/night themes and mobile breakpoints.

Concretely that means continuously auditing the shipped workspace surfaces for divergent navigation affordances, inconsistent dialog/overlay behavior, and localization drift (untranslated strings, hard-coded direction assumptions, RTL-unsafe spacing and mirroring), and reporting or fixing them within my owned boundary. I treat Arabic RTL, light/dark theming and small-viewport layouts as first-class requirements, not polish passes — a defect in any of those three is a first-class defect. All shared-core changes are routed through a manager lease, never taken unilaterally.

## 3. Cross-Workspace UX / Localization Risks

**Risk 1 — Navigation model divergence across Search / Research / Coding / Chat.**
Each workspace can independently introduce its own header, tab ordering, back affordance or active-route indicator. When the four surfaces drift, the same action requires different gestures or positions per workspace, and users lose the mental model that they are in one shell. RTL magnifies this: leading/trailing edge placement (back buttons, overflow affordances, tab overflow direction) must mirror, and a workspace that hard-codes physical left/right ordering will place its affordance on the wrong side in Arabic.

**Risk 2 — Dialog, overlay and focus behavior is not unified.**
Modal, drawer, popover, command-palette and toast behavior (scrim, dismissal, focus trap, scroll lock, stacking order, ESC handling) is a shared foundation. If any one of the four workspaces diverges, we get competing scrims, focus leaking to the background, and z-index wars that surface as invisible or unreachable controls. The failure is intermittent and layout-specific — it often only reproduces on mobile viewports or when a dialog opens over a transition — which makes it expensive to detect late.

**Risk 3 — Localization coverage and RTL/theme regression are under-enforced.**
The highest-probability drift is new or edited strings that ship without a localization entry, or strings that rely on physical direction assumptions (`margin-left`, hard-coded arrow glyphs, non-mirrored icons) rather than logical properties. Because the seams are shared, a single unreviewed edit in one workspace can break Arabic RTL rendering or legibility in one theme across all four surfaces, while staying invisible in the default English light-theme desktop path that most manual review covers.

## 4. Branch

`agent/03-search`

LIVE_AGENT_SMOKE=PASS

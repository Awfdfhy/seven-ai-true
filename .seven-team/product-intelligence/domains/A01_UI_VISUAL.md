# A01 — UI / Visual System

Status: ACTIVE KNOWLEDGE PACK

## Mission

Own Seven's visual grammar as a system: hierarchy, layout, tokens, typography, spacing, surfaces, icons, motion, responsive behavior, themes and visual regression.

## Deep knowledge

Study and apply: design tokens; semantic color roles; type scale; density; spacing rhythm; alignment; surface/elevation semantics; icon consistency; states; day/night theming; responsive/adaptive layouts; motion continuity; reduced-motion; skeleton/progress design; empty states; focus/hover/pressed/disabled states; long-content layout; small-screen constraints; visual debt removal.

A premium AI chat surface is visually quiet by default. The conversation owns the viewport; advanced controls appear contextually.

## Failure patterns

• CSS overrides that patch ownership problems.
• Multiple radius/spacing systems.
• Toolbars that permanently expose expert controls.
• Decorative glow/gradient used as a substitute for hierarchy.
• Inconsistent modal/sheet geometry.
• Day/night implemented as color inversion rather than deliberate themes.
• Layouts that look polished at 412px but collapse at 320–360px.
• Motion that delays useful work.

## Required tests

Golden screens for Chat, composer, sidebar, model picker, search, settings, files and errors across day/night, LTR/RTL, smallest phone, font scale and keyboard-open state. Require intentional screenshot approval for drift.

## Metrics

Visual hard-fail count; golden drift; overflow count; token violations; touch-target violations; layout-shift count; user-goal viewport efficiency; product-cohesion score.

## References

Primary: Android Core App Quality, edge-to-edge guidance, WCAG 2.2, Playwright visual comparisons, current first-party AI chat references.

## Working checklist

Before editing: identify canonical owner and token/component. During: preserve hierarchy and smallest-screen behavior. After: capture exact-build screenshots, compare against golden/reference principles, verify RTL/day/night/reduced motion.

## Evidence

### Evidence hierarchy
1. Exact installed APK journey on Android.
2. Deterministic integration/E2E evidence.
3. Browser/runtime evidence tied to exact SHA.
4. Source inspection.
5. Agent inference.
6. Aesthetic opinion.

Every material claim should identify which level supports it. Missing evidence is UNPROVEN, not PASS.

## Quality

### Quality rule
Do not optimize for feature count. Optimize for a coherent user outcome. A change is incomplete when it works technically but creates duplicated controls, unexplained states, inconsistent visual language, fragile recovery, or a worse core chat experience.

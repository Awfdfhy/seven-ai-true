# Seven UI Research 2026

This document records the design research used for the Seven AI Ultimate production UI pass. It is a decision log, not a visual mood board.

## Sources studied

Primary guidance was taken from current platform and design-system documentation:

- Apple Human Interface Guidelines: purpose, agency, layout, materials, accessibility, motion, navigation, dark mode, app icons.
- Microsoft Fluent 2: layout, responsive breakpoints, hierarchy, accessibility, design tokens, motion choreography, navigation.
- IBM Carbon: productive versus expressive motion and motion hierarchy.
- Atlassian Design System: spacing, tokens, motion duration, clarity, accessibility and performance.
- W3C WCAG 2.2: focus appearance, target size, animation from interactions, keyboard and pointer accessibility.
- web.dev: high performance animation, main-thread responsiveness, transform and opacity, content visibility and virtualized long lists.

## Seven production rules

1. **Content first.** Navigation and controls may use restrained glass. Content surfaces remain calm and opaque enough to preserve hierarchy.
2. **One visual hierarchy.** Space, type and alignment establish importance before borders, glow or color.
3. **Responsive plus adaptive.** Mobile is not a squeezed desktop. At smaller widths secondary panes become sheets and nonessential metadata is progressively disclosed.
4. **Touch and keyboard parity.** Core targets are at least 44 CSS px, hover is never required, focus is always visible and all primary navigation is keyboard operable.
5. **Motion explains state.** Productive motion is short and frequent. Expressive motion is reserved for large transitions or meaningful milestones.
6. **Reduced motion is a first-class mode.** Spatial movement collapses to opacity or immediate state changes when requested.
7. **Low-power mode removes decorative cost.** Heavy blur, ambient glow and nonessential loops are disabled while state feedback remains intact.
8. **Semantic color is never the only signal.** Success, warning and error also use icons, labels or shape changes.
9. **RTL is structural.** Reading direction, panel flow, borders, code direction and composer behavior are handled independently rather than mirrored blindly.
10. **Long data is virtualized or contained.** Story timelines, memory, tools, files and source lists must not create unbounded DOM cost.
11. **Navigation stays shallow.** The primary shell exposes the major work modes. Secondary actions belong in the Workbench, contextual sheets or command palette.
12. **AI activity is inspectable.** Thinking, research, tools and agent work communicate progress and state without exposing private reasoning.
13. **Tool UI is schema-driven.** Every tool has queued, starting, permission, running, success, error and cancelled presentation states.
14. **RPG remains story-first.** World state, character data, arcs and relationships are available on demand, not permanently stacked over prose.
15. **Player agency interrupts narration.** Agency gates are visually distinct and pause the story before Seven invents player-owned decisions.
16. **Day/night identity is consistent.** The same Seven silhouette is retained while material, illumination and contrast adapt to the local device time.
17. **No decorative animation debt.** Offscreen infinite animation is forbidden. Most motion uses transform and opacity only.
18. **State survives UI restarts.** Theme, density and low-power preferences are persisted separately from authoritative AI and RPG state.

## Motion classes

- Instant: 70-90 ms, press feedback and tiny state changes.
- Quick: 110-140 ms, chips, icons and compact menus.
- Standard: 160-200 ms, list entries, cards and content reveal.
- Spatial: 210-260 ms, sheets, panels and shared-context transitions.
- Expressive: 280-380 ms, rare milestones and major RPG transitions.
- Ambient: 2-8 s, tightly budgeted Halo or brand ambience only.

## Breakpoint intent

- Under 480: compact phone, single task surface.
- 480-639: large phone / narrow foldable.
- 640-1023: tablet and narrow desktop, contextual panes may overlay.
- 1024-1365: standard desktop shell.
- 1366+: wider workbench layouts with increased whitespace rather than oversized controls.

## Accessibility release gate

A Seven UI release should fail its UI audit if an interactive component lacks keyboard operation, visible focus, a minimum target contract, reduced-motion behavior, or a non-color state cue. Browser smoke tests must cover desktop and phone widths, command navigation, sheets, theme state and core surfaces.

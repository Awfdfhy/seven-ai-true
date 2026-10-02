# UI Simplification Pass — Detailed Execution Specification

Date: 2026-10-02
Status: IMPLEMENTATION READY
Parent roadmap: ../SEVEN_POLISH_ROADMAP.md

## Objective

Reduce Seven's accumulated UI clutter without changing runtime authority or adding another visual rewrite.

The pass uses progressive disclosure: common controls remain immediately visible; provider, diagnostics, memory/data, and advanced controls move into clearly labeled collapsible sections.

## Principles

- runtime state is authoritative; UI only projects it
- no feature is removed
- no hidden state fork
- mobile-first
- RTL-safe
- keyboard accessible
- 44px minimum practical touch target for primary interactive controls
- reduced motion remains respected
- advanced details stay available but do not dominate normal use

## Settings information architecture

Visible immediately:
- routing mode
- recommended/preferred model
- concise recommendation reason
- route/provider health state
- temperature / reasoning / output controls where relevant

Collapsible groups:
1. Providers
2. Memory & Data
3. Advanced

Provider secrets/technical provider toggles do not occupy the default viewport.

## Routing status

One compact status card exposes:
- Ready / Degraded / Cooling down / Blocked
- recommended model
- routing confidence
- short reason
- provider health summary
- quota pressure only when relevant

Avoid raw scores and internal weighting in the primary UI.

## Progressive disclosure

Use native semantic `<details>/<summary>` where practical:
- works without JS
- keyboard accessible
- simple WebView behavior
- naturally collapsible on small screens

## Mobile/RTL

- settings modal width constrained to viewport
- sticky heading/close behavior where already supported
- section summaries at least 44px
- inputs/selects/buttons at least 44px
- no horizontal overflow at 320px
- logical properties where practical
- status card supports `dir=auto`

## Accessibility

- group labels are semantic
- route state has `role=status` and `aria-live=polite`
- details summaries have visible focus
- disabled model selector state remains understandable from adjacent text
- color is not the only state signal

## Tests

1. settings has compact route status
2. Providers group is collapsed by default
3. Advanced group is collapsed by default
4. common routing/model controls remain visible
5. status text reflects Provider Health v2
6. 320px layout has no settings horizontal overflow
7. RTL details/status layout remains usable
8. existing settings functions still find every expected control
9. full regression suite stays green

## Acceptance criteria

Complete when the default settings view exposes only normal-use controls, advanced/provider clutter is collapsed, routing health remains understandable, 320px/RTL tests pass, and no existing settings behavior regresses.

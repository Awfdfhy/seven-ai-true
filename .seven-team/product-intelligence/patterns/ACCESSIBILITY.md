# Pattern Library — Accessibility

Status: ACTIVE KNOWLEDGE PACK

## Core

Every actionable control has an accessible name/role/state. Keyboard/focus paths remain coherent. Contrast, target size, reduced motion and live updates are intentionally designed.

## Targets

Use Android's comfortable 48dp expectation for touch UI; at minimum respect WCAG 2.2 target/spacing requirements on web surfaces.

## Dynamic chat

New assistant content may use appropriate live-region semantics without causing screen-reader spam. Streaming chunks should not repeatedly re-announce entire messages.

## Tests

Semantic tree inspection; keyboard traversal; focus return; contrast checks; font scaling; reduced motion; icon-only controls; disabled/error description.

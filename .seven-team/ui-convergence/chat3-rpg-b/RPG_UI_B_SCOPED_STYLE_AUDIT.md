# RPG_UI_B_SCOPED_STYLE_AUDIT

File: `rpg-ui-b.scoped.css`

## Scope guarantees
- Every production selector begins with `.seven-rpgb` or a descendant scoped beneath it.
- No `:root`, `html`, `body`, shell, composer, topbar, sidebar or Chat 2 selectors.
- No new token namespace. Existing Seven semantic tokens are consumed.
- Logical/block layout is used; no physical left/right positioning.
- No `!important`.
- 320/360px behavior collapses row metadata beneath labels.
- 720px wide behavior is opt-in through `data-wide=true`; it does not silently force a dashboard.

## Integration rule
This stylesheet is intentionally **not loaded** by `build-release.cjs`. B07/I01 may merge these scoped rules into the canonical RPG stylesheet or approve loading this file. Chat 3 must not modify the shared build loader independently.

## Accessibility
- text wraps with `overflow-wrap:anywhere`
- state chips retain textual labels
- no color-only meaning
- reduced motion has no animation dependency
- Arabic direction works without changing chronological/data order

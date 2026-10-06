# Seven AI — Core UI Rules

Owner: **Chat 1 — Core App UI Lead**  
Working branch: `ui/chat1-core-ui-20261006`  
Target integration branch: `ui/20-agent-convergence-20261006`

## Canonical direction
Core Seven is **modern, quiet, precise, premium, fast, AI-native**. Core chrome stays neutral enough to host Chat, Coding, Research, Self-Dev and RPG without becoming game-like.

## Geometry
- Treat 320/360/390/420 CSS px as explicit supported widths.
- Topbar uses a flexible title slot; model/workspace indicators are compact and never force the title/actions outside the viewport.
- Desktop sidebar is not scaled down onto mobile. Mobile uses a true drawer with backdrop, escape/back dismissal and logical RTL entry side.
- Main conversation has a readable max width; code blocks and genuinely two-dimensional tables may scroll internally, but the page must not horizontally scroll.
- Safe-area insets are part of topbar/sidebar/composer geometry.

## Chat
- Assistant response is the calm reading surface: no heavy bubble by default.
- User message may use a restrained filled/raised bubble for distinction.
- Long Markdown, Arabic, citations, code and tables must preserve reading rhythm.
- Message actions are contextual/subtle; duplicated copy/retry/edit/delete/branch controls are forbidden.

## Composer
- One growing textarea, one attachment entry, one mode control, one send/stop state.
- No horizontal tool carousel as the normal 320px solution.
- Keyboard-open state may collapse labels before reducing touch target quality.
- Placeholder truncation/wrapping must not displace send/stop.
- Send and Stop occupy the same primary-action slot statefully.

## Model picker
- Exactly one model picker implementation.
- One trigger, one selected state, one dismissal model.
- Desktop/tablet: anchored popover when space permits.
- Small mobile: bottom-sheet/fixed-sheet behavior.
- Group provider identity and capability metadata, but keep selected model name dominant.
- Legacy `.seven-model-panel` and `.seven-shell-model-menu` must not coexist in the final DOM.

## Accessibility
- WCAG 2.2 target-size minimum is a floor; frequent mobile controls should trend toward ~44px.
- Visible focus is mandatory for keyboard reachable controls.
- Logical source order must match reading/navigation order in LTR and RTL.
- 320px reflow is mandatory for non-two-dimensional content.
- Dynamic/accessibility font scaling must not clip controls.

## Deletion-first
Before adding a selector: identify the existing owner. If two systems own the same surface, merge behavior into the canonical owner and stop loading the obsolete layer. Do not solve cascade conflicts by adding new `!important` rules.

# UI_DESIGN_SYSTEM — Seven Canonical UI System

Status: convergence contract. No feature expansion.

## Principles
1. Mobile-first, content-first; core chat stays quiet.
2. RPG may be expressive, but hierarchy/readability outrank decoration.
3. One semantic token system; raw values do not belong in workspace CSS except temporary migration shims.
4. Logical properties by default: `margin-inline`, `padding-inline`, `inset-inline`.
5. One overlay family: dialog, sheet, popover and menu are variants of one interaction contract.
6. One model/mode picker state owner.
7. Target 48dp Android touch geometry; 44px absolute compact fallback.
8. 320px width and large-text/reflow are first-class acceptance cases.
9. Reduced motion is respected globally.
10. No new `!important` without a documented structural exception.

## Canonical scales
- Spacing: 0 / 4 / 8 / 12 / 16 / 20 / 24 / 32.
- Radius: 8 / 12 / 16 / 20 / 28 / pill.
- Z-index: content 0, sticky 20, dropdown 100, popover 200, sheet 300, modal 400, toast 500.
- Motion: 90 / 140 / 220 / 320ms.
- Breakpoints under validation: 320 / 360 / 390 / 420 / 720 / 900.
- Safe areas: all fixed surfaces consume `env(safe-area-inset-*)`.

## Canonical components
ShellFrame, TopBar, SideNav, BottomNav, WorkspaceSwitcher, Message, MessageActions, Composer, Picker, Menu, Popover, BottomSheet, Dialog, Field, SearchField, EmptyState, LoadingState, ErrorState, OfflineBanner, Toast, Card, ListRow, Chip, Tabs, SegmentedControl, InspectorPanel.

## Overlay contract
Dialog = blocking decision/form.
BottomSheet = mobile scoped task/selection.
Popover = anchored transient context.
Menu = short command list.
All overlays share focus return, escape/back behavior, scrim semantics, elevation, radius, motion, keyboard avoidance and RTL.

## Accessibility
WCAG AA baseline; visible focus; no color-only meaning; 320px reflow; large text without clipping; accessible names for icon buttons; context-menu actions must also have a discoverable alternate path.

## Identity
Core Seven: restrained violet/ink/neutral system with high information clarity.
RPG: same primitives plus narrative accent layers, chapter rhythm, portrait framing and state indicators. It must still read as Seven, not a separate skin.

# Seven Remake V3 — Phase 10/12: Product / UI Polish

Acceptance path:

`single ShellStore → locale/direction + viewport truth → single ThemeService timer → React projection → mobile/RTL/reduced-motion CSS`

Invariants:

1. One ShellStore owns workspace, sidebar/dialog, locale/direction, theme preference, viewport/keyboard and reduced-motion state.
2. React renders shell truth; it does not become a second authority.
3. Locale deterministically derives LTR/RTL.
4. ThemeService is the only auto-theme scheduler and owns at most one timer generation.
5. Manual light/dark preference removes the auto clock timer.
6. Visibility/resume reconciliation replaces, rather than multiplies, timer ownership.
7. Core / Research / Build / World use one navigation/design language.
8. Interactive controls have a 44px minimum touch target.
9. CSS uses logical properties and explicit RTL handling.
10. Reduced Motion disables decorative transitions/animation.
11. The shell remains usable down to the 320px product floor and adapts workspace/actions for small phones.

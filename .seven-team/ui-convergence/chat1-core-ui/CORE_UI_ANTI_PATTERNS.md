# Seven AI — Core UI Anti-Patterns

1. **Layer stacking:** adding a new CSS file to defeat `seven-final.css`, `beta-ui.css`, `ui-hardening.css` or shell selectors.
2. **Parallel pickers:** `.seven-shell-model-menu` + `.seven-model-panel` + native visible select at once.
3. **Desktop drawer on mobile:** fixed 288–320px desktop sidebar merely translated off-screen without mobile-specific information hierarchy.
4. **Icon wall topbar:** room title, model, workspace, beta/system/persistence indicators and settings all competing at equal weight.
5. **Composer toolbar strip:** solving 320px by horizontal-scrolling essential controls.
6. **Always-visible message actions:** Copy/Retry/Edit/Delete/Branch shown on every message at all times.
7. **Assistant bubble dominance:** making assistant output heavier/brighter than user input.
8. **Global overflow hiding as proof:** `overflow-x:hidden` masking clipped controls rather than fixing geometry.
9. **`!important` escalation:** specificity wars between shell/final/polish layers.
10. **RTL mirroring by transform only:** visual reversal without logical DOM/focus order and start/end properties.
11. **Fake visual pass:** declaring success from DOM bounds without screenshots.
12. **State duplication:** separate send and stop controls occupying different layout slots and causing composer jump.

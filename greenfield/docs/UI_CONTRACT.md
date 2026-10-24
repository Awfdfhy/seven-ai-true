# UI Contract

- Use shared design tokens and components; avoid screen-specific styling drift.
- Define navigation, back behavior, focus restoration, keyboard handling, and loading/cancel behavior for each route.
- Every async operation defines idle, loading, success, empty, error, offline, cancelled, stale-result, and retry states where applicable.
- Arabic RTL and English LTR must be supported as first-class directions, including mixed-direction text, numeric stats, code/model names, inputs, and dialogs.
- Support small phones, long narrative, keyboard visibility, safe areas, large text, screen readers, contrast, and reduced motion.
- Use touch targets appropriate for mobile and provide visible focus and clear destructive-action confirmation.
- Screenshots are visual evidence only; pair them with interaction and state-transition tests.
- Test with actual generated-length narrative and error messages, not only short placeholder copy.

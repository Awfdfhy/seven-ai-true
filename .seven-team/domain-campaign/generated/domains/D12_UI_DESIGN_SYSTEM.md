# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: READY

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
SOURCE_ANALYSIS=12 sources (11 primary, 1 secondary); harvest READY. Android core app quality guidelines, WCAG 2.x, Playwright visual snapshots, Android multi-locale quality. No disagreement on accessibility; limitation: visual boards must be inspected locally.
CURRENT=Seven has remake/src/ui with primitives; product-intelligence visual boards and rubric exist. Exact-build visual quality UNPROVEN; Android installed-artifact evidence missing.
TARGET=One coherent UI primitive set, RTL/Arabic parity, WCAG 2.2 AA, mobile ergonomics, visual regression via Playwright snapshots, premium cohesion without copying references.
NOW=Audit shared UI primitives, theme tokens, RTL behavior, accessibility; document primitive contract.
NEXT=Visual snapshot baseline for golden screens; Android screenshot matrix.
LATER=Motion polish, density tuning, theme variants.
TESTS=Deterministic: RTL/a11y unit tests; E2E: Playwright visual snapshots; Android: screenshot comparison; adversarial: RTL overflow, focus order; eval: rubric hard-fail check.
RISKS=RTL regressions, duplicate components, Android WebView CSS, accessibility failures, visual drift.
FIRST_SLICE=UI primitive contract + RTL smoke tests.
KNOWN_UNKNOWNS=Exact component inventory, current visual baseline, Android build state.
DOMAIN_VERDICT=READY_FOR_PLAN

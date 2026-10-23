# D27_ERROR_RECOVERY_UX — Errors / Loading / Empty / Recovery UX

Research audit: READY

DOMAIN_ID=D27_ERROR_RECOVERY_UX
SOURCE_ANALYSIS=10 sources (10 primary); harvest READY. Android core quality, WCAG. Loading/empty/error states are quality fundamentals.
CURRENT=Seven error/loading/empty surfaces exist in UI; need audit for consistency and recovery paths.
TARGET=Clear, accessible, recoverable error/loading/empty states across web and Android, with retry and fallback.
NOW=Audit error/loading/empty surfaces; list inconsistencies and missing recovery.
NEXT=Standardize error components, retry affordances, offline handling.
 LATER=Advanced recovery (resumable streams, partial results).
TESTS=Deterministic: component tests; E2E: failure injection; Android: WebView error states; adversarial: network drop, timeout; eval: UX rubric.
RISKS=Silent failures, no retry, accessibility, Android WebView errors.
FIRST_SLICE=Error state inventory + standardized empty/error components.
KNOWN_UNKNOWNS=Current error handling coverage, failure injection tests.
DOMAIN_VERDICT=READY_FOR_PLAN

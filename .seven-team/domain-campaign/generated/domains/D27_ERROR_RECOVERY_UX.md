# D27_ERROR_RECOVERY_UX — Errors / Loading / Empty / Recovery UX

Research audit: READY

DOMAIN_ID=D27_ERROR_RECOVERY_UX
SOURCE_ANALYSIS=Android Core App Quality and WCAG emphasize error prevention/recovery, clear messages, focus management. Need loading/empty/error states with actionable recovery.
CURRENT=HTML monolith likely has ad-hoc states. No visible error boundary patterns obvious.
TARGET=Consistent patterns: loading, empty, error with recovery actions, offline, timeouts, permission errors, Android-specific.
NOW=Grep HTML for error/loading/empty patterns.
NEXT=Inventory states, define patterns, accessibility of errors.
LATER=Centralized error handling UX.
TESTS=Error path E2E, offline, timeout, accessibility.
RISKS=Cryptic errors, no recovery path, blocking UI.
FIRST_SLICE=State inventory in HTML.
KNOWN_UNKNOWNS=Actual error handling.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT

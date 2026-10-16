# D27_ERROR_RECOVERY_UX — Errors / Loading / Empty / Recovery UX

Research audit: READY

DOMAIN_ID=D27_ERROR_RECOVERY_UX
SOURCE_ANALYSIS=Android Core App Quality [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality emphasizes graceful errors, empty states, loading states, recovery paths. WCAG [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ requires perceivable/operable errors (e.g. error identification, suggestions). Recovery UX is critical for agentic systems (tools failing, network issues, approvals). 
CURRENT=Errors/loading/empty/recovery UX (owners B07,B10). Agent systems need clear failure modes, retry affordances, safe fallbacks, no silent failures. 
TARGET=Deterministic error handling: typed errors, user-facing messages with recovery actions, timeout/retry with backpressure, idempotency where appropriate, a11y-compliant error states. 
NOW=Audit error surfaces: tool failures, network, fs, permissions, approvals, timeouts. Check for silent catches, generic errors, missing recovery hints. 
NEXT=Error taxonomy + UX copy guidelines, retry policies, empty/loading state patterns, error telemetry hooks. 
LATER=Chaos-lite tests (transient failures), recovery success metrics. 
TESTS=Adversarial failure injection, timeout tests, permission-denied flows, recovery path tests, a11y checks for errors. 
RISKS=Leaking internals to users, retry storms, unsafe recovery actions, inconsistent tone. 
FIRST_SLICE=Error audit: sample 10 error paths, classify (actionable/recoverable/terminal), rate UX quality. 
KNOWN_UNKNOWNS=Error boundaries in codebase, existing UX patterns for errors. 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need codebase error handling map)

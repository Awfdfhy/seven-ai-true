# D27_ERROR_RECOVERY_UX — Errors / Loading / Empty / Recovery UX

Research audit: READY

DOMAIN_ID=D27_ERROR_RECOVERY_UX
SOURCE_ANALYSIS=Harvested: Android Core App Quality guidelines [SOURCE primary] (stability, errors, empty/loading states, recovery paths, user-visible errors), WCAG 2.x overview [SOURCE primary] (perceivable/operable/understandable/robust; error identification, suggestions, focus management). Sources emphasize: clear error messages (human-readable, actionable), retry/recover affordances, loading/empty states with purpose, avoid blocking flows, preserve context, accessibility (labels, roles, focus). Limits: harvest snippets are high-level; need specific patterns (inline vs banner vs modal), error boundaries, skeletons, offline indicators. Freshness current. 

CURRENT=Repo likely has UI surfaces; need to find error/loading/empty components. Search terms: error boundary, snackbar/toast, empty state, loading spinner/skeleton, retry button, offline banner. **Evidence**: initial grep covered general terms; need to inspect UI components. Architecture must preserve cohesion and Android ergonomics per Product Intelligence. No aesthetic claims without runtime evidence.

TARGET=Seven-aligned UX: consistent error taxonomy (map from D16 NetworkError to user-safe messages), actionable recovery (Retry, Go Back, Contact/Support where relevant), loading states (skeletons for lists, progress for long ops), empty states (explanation + CTA), offline indicators, partial failure messaging ("X items failed to load"), graceful degradation. Meet WCAG: error identification (3.3.1), labels/instructions, focus on errors [SOURCE primary]. Meet Android Core App Quality: responsive, stable, clear errors, recoverable [SOURCE primary]. Preserve Seven identity (hierarchy/density/clarity/discoverability/feedback/motion/Android ergonomics/cohesion) per PI rubric.

NOW=First high-value slice: map `NetworkError` taxonomy (D16) to user-facing strings with safe redaction. Create reusable `ErrorState`, `EmptyState`, `LoadingState` components with slots for actions. Add `RetryButton` with loading state. Error boundary for component trees. Offline banner with "Retry" action. Ensure keyboard focus moves to error on form validation; ARIA live regions for dynamic errors [SOURCE primary].

NEXT=Partial failure UX: list-level "Load failed" with "Retry failed items" + details collapsed. Optimistic updates with rollback + error feedback. Rate limit messaging ("Try again in Xs") using retry-after. Skeletons vs spinners by perceived latency. Motion respects reduced motion. Android: Material-aligned patterns but Seven identity preserved; ergonomic touch targets. 

LATER=Error telemetry correlation (request id/span id) shown in dev but not user-facing (or behind "Details"). Localization readiness. Accessibility audit checklist per WCAG 2.2 where applicable [SOURCE primary]. 

TESTS=Deterministic: error mapping tests (timeout/abort/network/http/429). Component tests: states render correctly, actions fire. Accessibility: ARIA roles/labels, focus management, live region announcements [SOURCE primary]. E2E: offline banner appears, retry recovers, empty state shown, partial failure path. Android: TalkBack navigation, ergonomic targets. Visual: hierarchy/density/clarity against PI rubric (runtime evidence required; no pixel imitation). 

RISKS=UX: leaking internals/stack traces to users. A11y: missing live regions, focus traps. Performance: skeleton jitter. Android: overlapping with system UI. Consistency: diverging from Seven identity. Cross-system: coordinate with B10 (co-owner). 

FIRST_SLICE=Smallest: introduce shared UI primitives in `components/feedback/` (or existing design system): `ErrorView`, `EmptyView`, `LoadingView`. Add error mapping utility `toUserError(err)` that redacts sensitive details. Wire to one network call path (same as D16 slice) to show inline error+retry. Add offline banner at app shell level. Add basic ARIA attributes [SOURCE primary].

KNOWN_UNKNOWNS=Existing design system/components for states unknown. Error boundary implementation presence unclear. Offline indicator exists? Android-specific UX patterns (snackbar vs banner) not confirmed. WCAG conformance target (2.1 vs 2.2) not stated; PI rubric specifics needed. B10 ownership boundaries unclear.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (pending inspection of UI components, design system, error boundaries, offline UI, and PI rubric/index to validate Seven identity constraints)

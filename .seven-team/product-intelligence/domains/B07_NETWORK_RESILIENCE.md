# B07 — Network / Resilience

Status: ACTIVE KNOWLEDGE PACK

## Mission

Make partial failure ordinary and recoverable rather than catastrophic.

## Deep knowledge

Timeout taxonomy; retry/backoff; idempotency; offline detection; captive portal; partial streaming; rate limit; auth failure; server error; fallback; duplicate callback; reconnect; request ownership; circuit-breaker/health signals; user-facing error normalization.

## Failure patterns

• navigator.onLine treated as endpoint health.
• blind retry duplicates paid/side-effect request.
• timeout loses draft.
• stream reconnect duplicates text.
• provider error dumped raw to user.
• endless retry loop.

## Required tests

DNS/offline; timeout; 429; 401; 5xx; malformed body; stream disconnect; recovery; network flapping; duplicate response; slow source; fallback failure.

## Metrics

Recovery success; retry amplification; duplicate result rate; normalized-error coverage; fallback success; time to actionable state.

## References

MDN AbortController/Streams, Seven provider health/reliability plans, OWASP network guidance.

## Evidence

### Evidence hierarchy
1. Exact installed APK journey on Android.
2. Deterministic integration/E2E evidence.
3. Browser/runtime evidence tied to exact SHA.
4. Source inspection.
5. Agent inference.
6. Aesthetic opinion.

Every material claim should identify which level supports it. Missing evidence is UNPROVEN, not PASS.

## Quality

### Quality rule
Do not optimize for feature count. Optimize for a coherent user outcome. A change is incomplete when it works technically but creates duplicated controls, unexplained states, inconsistent visual language, fragile recovery, or a worse core chat experience.

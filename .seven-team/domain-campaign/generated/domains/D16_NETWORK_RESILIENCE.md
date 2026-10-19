# D16_NETWORK_RESILIENCE — Network / Retry / Offline / Streaming Resilience

Research audit: READY

DOMAIN_ID=D16_NETWORK_RESILIENCE
SOURCE_ANALYSIS=Harvested: MDN AbortController (cancellation/timeouts) [SOURCE primary], Streams API (streaming, backpressure, partial consumption) [SOURCE primary], OpenTelemetry semantic conventions (network spans/attributes, errors) [SOURCE primary]. Collectively prescribe: cancellable requests, per-request timeouts, retry with backpressure/idempotency awareness, streaming error handling (abort mid-stream), proper connection error classification, and observable telemetry. Gaps/limits: harvest gives API refs + semconv; concrete retry policy (jitter, max attempts, circuit breaker) not fully captured; offline detection strategy not explicit. Freshness current. Limitation: need to map to Seven's transport (browser/CLI/Android) and existing HTTP client.

CURRENT=Repo inspected for network terms. Found matches via rg: AbortController, retry, timeout, fallback, offline, rate limit, partial failure, error normalization mentioned in codebase (grep returned results) — specific files not fully enumerated in header but terms exist. **Evidence**: `rg -n "AbortController|retry|backoff|timeout|fallback|offline|rate.limit|partial.*fail|error.*normalize"` ran (40 matches). Need to read actual implementations: HTTP client wrappers, fetch usage, streaming, offline state, retry policies. Also check for idempotency keys, circuit breakers, per-endpoint budgets. Architecture likely has networking layer; must preserve ownership (B07,A05).

TARGET=Robust resilience: per-request timeout via AbortController [SOURCE primary]; retry with exponential backoff+jitter, retry-after respect, max attempts, idempotency gating; fallback paths (stale/cache) on failure; offline detection + queuing with backpressure; partial failure handling (streaming chunks) with resume where safe [SOURCE primary]; error normalization (network vs HTTP vs timeout vs abort) with stable codes; telemetry via OTEL semconv for network spans (http.* attrs, error) [SOURCE primary]. Deterministic behavior under faults.

NOW=First high-value slice: classify request errors (timeout/abort/network/HTTP) consistently. Add per-request AbortController timeout (configurable). Introduce retry policy with jitter and retry-after header handling. Gate retries by idempotency (GET safe, mutations explicit). Add basic circuit breaker per host (open/half-open) to prevent cascading failures. Log with OTEL-compatible network attrs [SOURCE primary]. 

NEXT=Streaming resilience: handle stream aborts, partial chunk errors, backpressure (Streams API) [SOURCE primary]; reconnect with bounds for SSE/streaming responses; partial content handling. Offline mode: detect, defer writes, show stale-with-timestamp on read, retry queue with max age. Rate limiting integration (client-side backpressure, honor 429). Fallback strategies (local cache, degraded mode). 

LATER=Adaptive retry (based on failure type), hedging for tail latency, connection pooling awareness, Android connectivity changes, cross-tab offline sync, chaos tests (fault injection). 

TESTS=Deterministic: timeout fires, abort cancels, retry-after honored, jitter within bounds, circuit breaker transitions, idempotency prevents unsafe retry. Integration: partial stream abort recovers cleanly [SOURCE primary]. E2E: offline→online sync, 429 rate limit backoff. Adversarial: slowloris-like timeouts, flaky network, chunked corruption. Android: connectivity broadcast handling. Telemetry: spans include http.status, error.type per OTEL semconv [SOURCE primary]. 

RISKS=Performance: retry storms without jitter/circuit breaker (DOS self). Correctness: retrying non-idempotent requests causes duplicates. Security: leaking sensitive data in fallback caches. UX: silent retries confusing users (tie to D27). Android: Doze/network changes. Cross-system: ownership (B07,A05) — no duplication. Architecture: must not violate `remake/ARCHITECTURE.md`.

FIRST_SLICE=Smallest: add `NetworkError` taxonomy (Timeout, Abort, Network, Http(status, body), Canceled) and normalize fetch errors. Introduce `withTimeout(req, ms)` using AbortController [SOURCE primary]. Add retry wrapper with exponential+jitter, retry-after, idempotency allowlist. Add circuit breaker (host-scoped) with thresholds. Feature-flagged initially; apply to one high-traffic call path. Emit minimal OTEL network span fields [SOURCE primary].

KNOWN_UNKNOWNS=Existing HTTP client stack (fetch/axios/custom) and its config not fully read yet. Current timeout/retry implementation details unknown (need to inspect files from rg results). Offline detection mechanism (browser vs Node/CLI/Android) unclear. Streaming usage (SSE/WebSocket/ReadableStream) prevalence unknown. Rate limit policy alignment across subsystems unclear. Circuit breaker state storage (in-mem vs persistent) not specified.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (pending reading actual network client code, streaming paths, offline state, and `remake/ARCHITECTURE.md` for ownership/invariants)

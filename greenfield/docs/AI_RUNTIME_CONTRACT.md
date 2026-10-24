# AI Runtime Contract

Provider adapters implement a stable provider-neutral interface. The exact language/types depend on ADR-0001.

## Request fields
Request ID, world ID, scene ID, actor ID, current state revision, allowed context references, response schema version, cancellation handle, timeout budget, and explicit output constraints.

## Response fields
Request ID, provider/model identity, narrative text, structured proposals, schema version, completion status, and sanitized usage/error metadata where available.

## Invariants
- Provider output is untrusted and cannot mutate state.
- Validate response size, schema, event types, ownership, and current revision.
- Reject malformed, partial, stale, or unauthorized proposals.
- Cancellation prevents application of late results even if transport cancellation is unavailable.
- Retries are bounded and idempotent; do not retry user actions by creating new command IDs silently.
- Log no credentials or unnecessary private narrative.
- Tests use a deterministic mock; provider outages do not corrupt saves.

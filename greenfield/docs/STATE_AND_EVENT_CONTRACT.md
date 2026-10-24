# State and Event Contract

1. UI emits typed commands; it cannot write domain state directly.
2. Each command carries command ID, world ID, actor ID, and expected base revision.
3. Domain validation checks identity, permissions, resource limits, current revision, and game rules.
4. Accepted commands produce a deterministic list of typed domain events.
5. Events are validated and committed atomically with the resulting state/revision.
6. Duplicate command/event IDs are idempotent; replay must not double-apply currency, damage, inventory, or progression.
7. A stale base revision is rejected or explicitly rebased under a documented rule; never silently overwrite newer state.
8. AI may propose events, but the domain engine validates each proposal independently. Unsupported event types and unauthorized actor changes are rejected.
9. Failed, cancelled, malformed, or timed-out AI requests must not mutate authoritative state.
10. Tests must cover valid command, invalid command, duplicate event, stale revision, world mismatch, partial save, malformed proposal, cancellation, and replay.

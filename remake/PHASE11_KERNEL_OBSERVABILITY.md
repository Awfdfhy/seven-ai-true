# Seven Remake V3 — Phase 11/12: AppKernel, Recovery and Observability

Acceptance path:

`registered services → dependency resolution → single-flight boot → rollback on failure → retry/recovery → reverse shutdown`

Cross-cutting diagnostics:

`lifecycle event → bounded ring buffer → sensitive/content-key redaction → safe export`

Invariants:

1. AppKernel is the single composition/lifecycle owner.
2. Service IDs are unique and dependency order is deterministic.
3. Concurrent boot callers share one startup promise.
4. A startup failure rolls back every already-started service in reverse order.
5. Failed boot can be retried after the underlying dependency recovers.
6. Shutdown is reverse-order and single-flight.
7. Boot cancellation rolls back completed dependencies.
8. Diagnostics cannot become a lifecycle dependency; logging failure never blocks boot/shutdown.
9. Diagnostic buffers are bounded.
10. Token/secret/auth/password/prompt/message/content/body fields are redacted by default.
11. Public kernel snapshots expose status/error class, never private service internals or credentials.

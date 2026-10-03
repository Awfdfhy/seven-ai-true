# Seven Remake V3 — Phase 6/12: Deep Think

Acceptance path:

`room → planner-specific context → bounded internal brief → final-model context rebuild → brief injected as untrusted data → final stream`

Invariants:

1. Deep Think is a two-pass application transport, not a UI patch.
2. Planner output is never emitted to the user.
3. Planner and final payloads each contain exactly one leading system message.
4. Context is rebuilt independently for each model's context window.
5. Planner and final output budgets are explicit.
6. The planning brief is bounded and treated as untrusted JSON data in the final system message.
7. Final payload capacity is revalidated after the brief is injected.
8. Cancellation between passes prevents final provider dispatch.

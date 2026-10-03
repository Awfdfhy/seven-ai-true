# Seven Remake V3 — Phase 7/12: Android Native Bridge

Acceptance path:

`TaskManager → typed bridge request → requestId correlation → native result validation → structured result/cancellation`

Invariants:

1. Every bridge request owns a unique requestId.
2. Responses are rejected when requestId correlation fails.
3. Native failures are normalized into structured BRIDGE errors.
4. JS cancellation maps to the exact native request token and late completion cannot win.
5. Capability negotiation is schema validated.
6. SAF grants accept only content:// URIs and require explicit read/write scope.
7. Returned SAF grant truth must match the requested URI/scope and report persisted state.
8. Native secrets are never modeled as bridge response state in this phase.

This phase establishes the TypeScript/native contract boundary. Device-specific native implementation and installed-APK evidence remain release gates rather than being simulated by the browser test suite.

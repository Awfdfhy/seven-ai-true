# Seven Remake V3 — Phase 8/12: GitHub Self-Dev

Acceptance path:

`TaskManager → token lease (single-flight) → exact-base change set → bounded mutation port → result-path verification`

Invariants:

1. Persistent/public connection snapshots never contain plaintext access tokens.
2. Concurrent callers share one refresh promise.
3. Expiry skew forces refresh before a token becomes unsafe to use.
4. Cancelling one caller does not cancel credential refresh needed by another caller.
5. Self-dev mutations bind to an explicit full base commit SHA.
6. Repository paths are normalized and cannot escape repository scope.
7. Secret/credential paths are rejected before credential acquisition.
8. Mutation results cannot claim unexpected changed paths.
9. Task cancellation prevents a late mutation result from becoming successful application truth.

The actual GitHub network adapter remains behind the mutation port; auth policy and mutation safety are provider-independent.

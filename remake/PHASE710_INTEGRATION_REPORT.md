# Seven Remake V3 — Waves 7–10 Manager Integration

This manager pass validates the four vertical slices together after their individual PR gates.

## Phase 7 — Android Native Bridge

- typed request/response envelopes
- exact requestId correlation
- structured bridge error normalization
- capability negotiation
- SAF content-URI grant validation
- JS cancellation → exact native request token
- idempotent native cancellation

## Phase 8 — GitHub Self-Dev

- token-free public connection snapshots
- single-flight credential refresh
- expiry-skew refresh
- per-caller cancellation isolation
- exact base-SHA mutation contract
- repository path normalization
- secret/credential path blocking
- mutation-result changed-path verification

## Phase 9 — RPG / Canon

- first-class immutable canonical snapshots
- separate world/canon session identities
- branches, titles, relationships and world state
- deterministic SHA-256 snapshot checksum
- expected revisions + compare-and-swap
- storage-layer IndexedDB persistence
- corruption verification and restart/restore

## Phase 10 — Product / UI Polish

- one ShellStore runtime state owner
- Core / Research / Build / World workspace surface
- locale-derived RTL/LTR
- one ThemeService scheduler
- auto/light/dark modes
- reduced-motion authority
- mobile viewport/keyboard truth
- 44px touch floor and 320px responsive floor

## Combined manager gates

The integration suite additionally proves:

1. Android cancellation cannot cancel concurrent GitHub or RPG tasks sharing one TaskManager.
2. GitHub secret material is consumed internally but absent from public auth/task snapshots.
3. RPG authoritative state survives restart independently of shell/UI projection state.
4. Theme timer ownership remains single-flight while Android capability state changes independently.

Phases 7–10 remain closure candidates until combined Remake CI, Legacy Seven, merge and post-merge CI all pass.

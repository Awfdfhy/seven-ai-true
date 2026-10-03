# Seven Remake V3 — Phase 9/12: RPG / Canon

Acceptance path:

`canonical snapshot → checksum verify → expected revision → atomic change set → CAS commit → restart/restore`

Invariants:

1. RPG state is a first-class authoritative snapshot, not prose or a chat summary.
2. World session and canon session identities are distinct.
3. Branches, titles, relationships and state commit together under one revision.
4. Every snapshot carries a SHA-256 checksum over deterministic canonical payload data.
5. Load verifies checksum before exposing durable state.
6. Change sets bind to an expected revision.
7. Repository CAS prevents lost updates across concurrent services/tabs.
8. Branch creation preserves parent lineage and can explicitly activate the new branch.
9. IndexedDB restart/restore preserves the complete canonical snapshot.
10. Returned snapshots and nested collections are immutable copies.

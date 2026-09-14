# Evolution Core status

Implementation branch: `evolution-core-v1`

Current implemented controls:

- weighted candidate scoring
- required metric validation
- hard promotion gates
- tamper-evident event ledger
- fixed candidate lifecycle
- shadow and canary stages
- rollback checkpoint requirement
- explicit final approval gate
- rollback state
- deterministic multi-candidate evaluation and ranking
- bounded reproduce/repair/review/regression cycle
- CI regression coverage through `all.cjs`
- Self-Evolution V4.4 frozen target + campaign identity
- clean-room Builder/Judge/Promotion role isolation checks
- matched-budget fairness checks
- assistance accounting for autonomy claims
- learning-pathway proof for retained-experience claims
- durable campaign journal with hash-chain integrity
- V4.4 governed runtime wrapper before the legacy promotion core

The V4.4 runtime slice is implemented but still requires CI/device/release validation. It does not grant itself repository, deployment, credential, or production authority.

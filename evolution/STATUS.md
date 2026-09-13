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

Next integration layers after this core passes CI: external discovery adapters, model registry/free-proof feeds, benchmark adapters, and production promotion adapters. Those integrations must not bypass this core policy.

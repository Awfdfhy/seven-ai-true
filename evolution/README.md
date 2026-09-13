# Seven Evolution Core

This directory contains the controlled evolution safety layer for Seven AI.

Principles:

- Candidates are evaluated outside the stable release path first.
- Promotion is fail-closed: missing metrics, failed tests, failed provenance, missing rollback readiness, invalid free-proof, or license failure rejects the candidate.
- Candidate lifecycle order is fixed: discover, evaluate, shadow, canary, promotable, promote, with rollback after promotion.
- Evolution events are recorded in a tamper-evident hash chain.
- Multi-candidate selection ranks only candidates that pass every hard gate.
- Repair cycles are bounded and follow reproduce, repair, review, regression gate. They cannot loop forever.
- Stable `main` should only receive this layer after CI and review pass.

This core does not grant itself repository, deployment, credential, or production authority. Integrations must supply those capabilities explicitly and must preserve the gates above.

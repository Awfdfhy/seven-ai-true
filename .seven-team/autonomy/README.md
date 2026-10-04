# Seven Autonomous Product Engineering Stack

This control plane implements the systems designed for the continuous Seven team.

## Systems
- Product Intelligence Encyclopedia
- Product Quality Judges
- Product Reality Lab
- Evolution Arena (Champion/Challenger)
- Engineering World Model
- Seven Constitution + Proof-Carrying Engineering
- Meta-Team Evolution
- Synthetic User Population
- Quality/Proof Debt Ledger
- Causal Learning Ledger
- Privacy-aware Observatory
- Release Trust Gate

## Status semantics
- ACTIVE_GUARDED: executable and bound to hard policy.
- ACTIVE_RECORDING: executable evidence/ledger exists; it does not yet make stronger claims than the evidence supports.
- CONFIGURED: full contract/workflow exists but needs a successful target run before it is proven.
- SCAFFOLDED: schema/architecture only.
- UNPROVEN: required evidence is missing.

No system may rename CONFIGURED/SCAFFOLDED to PASS without executable evidence.

## Separation of planes
Builder plane may change allowed product surfaces.
Evaluator plane owns constitution, quality rubric, baselines, proof rules and Reality Lab contracts.
Meta-team may propose organizational changes but cannot weaken evaluator plane or increase its own privileges.

# Seven AI — Final End-to-End Verification Gate

Status: `REQUIRED_BEFORE_FINAL_SEVEN`
Branch: `ultimate-polish-v1`

## Product-owner directive
Final Seven must not be declared complete merely because capabilities exist, individual unit/browser suites pass, or the UI appears complete. A dedicated final End-to-End Capability Verification gate is mandatory before Final Seven.

## Required verification scope
Every capability registered as release-relevant must be exercised from the real user entry point through the real runtime path to an observable result. This includes, where applicable: Chat, Model Fabric/provider routing, Memory, Context Workspace, Tools, Files/Projects, Search/Retrieval, Vision, Coding Agent, Research, RPG/Real Works, Generated UI, Sessions, Stop/Continue/Retry, persistence/recovery, Android integration, and cross-system workflows.

For each release-relevant capability the final gate must verify the applicable states and paths rather than only code presence: entry point and wiring, loading/running, success, error, cancellation/retry/recovery, permission, offline/network/provider failure, persistence/restart, large or malformed inputs, and interaction with dependent systems.

## Final sequence
1. Complete remaining implementation and integration.
2. Capability Registry → real UI/product entry-point and state mapping.
3. End-to-End Capability Verification across all release-relevant capabilities.
4. Final Red Team / adversarial testing across truth, security, state corruption, tools, recovery, provider failure, resource pressure, long-lived workflows, Android, accessibility/RTL and Zero-Manual flows.
5. Repair every material failure and rerun affected gates, including regression coverage.
6. Android release/device QA and required physical-device evidence gates.
7. Produce an exact Release Candidate.
8. Run final verification against that exact Release Candidate identity.
9. Declare Final Seven only if all mandatory gates pass.

## Release rule
`CAPABILITY_EXISTS != CAPABILITY_VERIFIED`

`SINGLE_TEST_PASS != RELEASE_READY`

`FINAL_SEVEN = REQUIRED_E2E_GATES_PASS + NO_OPEN_CRITICAL_OR_BLOCKER_FAILURES + EXACT_RELEASE_CANDIDATE_VERIFIED`

No claim of permanent or mathematically perfect bug-free behavior is permitted. The evidence-backed release target is instead: every critical/release-relevant capability has executable End-to-End proof appropriate to its risk, no Critical/Blocker failures remain open, and the exact Release Candidate passes all mandatory Android/final gates.

Synthetic fixtures, HOST evidence, debug builds, plans, documentation, or inferred behavior must never be promoted into stronger evidence tiers. Any unavailable physical/device/provider evidence remains explicitly open rather than fabricated.

Protected `seven_ai-final.html` remains untouched by this documentation change. No merge to `main` is authorized by this directive.
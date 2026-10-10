# Seven v3 Migration Plan

Base production reference: Seven 2.4.3 RC green SHA `9ce91f07f6b45364124fb80d6fbd5962ac76dda7`.

## Phase 0 — Foundation
- [x] Isolated v3 branch/workspace
- [x] Provider contract
- [x] Provider registry
- [x] Seven 2.x model-selection bridge
- [x] Unit tests
- [ ] Provider capability policy
- [ ] Streaming event contract
- [ ] Tool-call contract

## Phase 1 — Provider runtime
- Move provider-specific request creation behind adapters.
- Preserve Seven free-only routing policy.
- Add OpenAI-compatible adapter.
- Add native Google adapter.
- Add Anthropic-compatible contract support without requiring Claude.
- Keep legacy runtime as fallback until parity tests pass.

## Phase 2 — Agent runtime
- Introduce a graph/run boundary inspired by mature agent runtimes.
- Add resumable runs.
- Add explicit tool lifecycle.
- Add subagent isolation.
- Keep Seven Self-Development as a guarded specialized agent, not a generic autonomous agent.

## Phase 3 — Files / RAG / Memory
- Separate file ingestion from conversation state.
- Introduce retrieval interface.
- Keep Seven Memory canonicalization and durable facts as Seven-owned semantics.
- Add migration adapters for existing room knowledge.

## Phase 4 — Workspaces
- Port Coding first.
- Port Research second.
- Port Self-Development with safety parity.
- Port RPG last because canon/world-state authority must not regress.

## Phase 5 — Mobile shell
- Connect the v3 backend contract to the existing Android bridge.
- Preserve Keystore, SAF, WAL recovery and device tests.
- Run Android 14 + Android 16 acceptance before any v3 release claim.

## Exit criteria
A v3 release cannot replace 2.4.3 until it has:
- browser test parity;
- Android device parity;
- import/migration rollback;
- persistence continuity;
- signing/identity evidence;
- zero open P0/P1 release blockers.

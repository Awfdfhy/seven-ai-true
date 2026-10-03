# Seven Remake V3

Seven Remake V3 is a clean-room rebuild of Seven AI.

The legacy application remains a behavioral reference and bug database only. Production code from the old runtime is not copied into the remake unless it is deliberately reimplemented behind the new contracts and tests.

## Non-negotiable rules

1. One owner per surface.
   - One UI shell.
   - One theme service.
   - One composer controller.
   - One task/cancellation controller.
   - One persistence transaction boundary per domain.
2. No mutable globals such as `window.Seven*` as runtime sources of truth.
3. Core runtime is framework-agnostic. React renders state; React does not own provider/network/storage rules.
4. Every async operation has:
   - request/task ID
   - lifecycle state
   - cancellation path
   - timeout budget
   - structured error
5. Android bridge methods are typed contracts and must pass JS↔native contract tests.
6. Persistent state is versioned, transactional, migratable and recoverable.
7. No release is considered valid until the installed artifact identity and runtime smoke tests pass.
8. Features are added only after their domain contract and regression tests exist.

## Initial goal

Build a minimal vertical slice:

`boot → room persistence → composer → provider request → stream → stop → restart → restore`

Only after this path is deterministic do we add Research, Attachments, Deep Think, Memory, GitHub Self-Dev and RPG.

See `ARCHITECTURE.md` for the full design.

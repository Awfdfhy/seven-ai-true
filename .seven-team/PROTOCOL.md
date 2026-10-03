# Seven AI — 10-Agent Runtime Protocol

This directory is the control plane for the Seven AI multi-agent engineering team.

## Manager contract

ChatGPT acts as manager and information relay only once live workers are running. The manager assigns work, prevents overlapping file ownership, reads worker reports, checks CI, and reports consolidated progress to the user.

## Worker contract

Each worker uses only its assigned `agent/*` branch. Workers never merge to `main` directly. Every completed task must report:

- objective
- files changed
- tests run
- failures / risks
- commit SHA
- dependencies / blockers

## Merge gate

A change is merge-ready only when:

1. the worker branch has a concrete commit;
2. relevant tests pass;
3. agent/10-integration-review has reviewed the diff;
4. no active worker owns conflicting files;
5. the manager has a clear rollback point.

## Runtime phases

- Phase A — compatibility: prove every selected project is still reachable/installable.
- Phase B — binary smoke: install each CLI and run a non-model `--version` / `--help` probe.
- Phase C — provider/auth wiring: configure model access without committing secrets.
- Phase D — live parallel run: start isolated sessions/worktrees for all workers.
- Phase E — production loop: task -> branch -> tests -> review -> integration.

## Current blocker boundary

GitHub branches alone do not execute LLM agents. Live execution requires a runtime host plus model authentication or a compatible local/provider endpoint. The repository stores no credentials.

# Seven AI — Two-Team / 20-Agent Protocol

Status: ACTIVE STRUCTURE  
Topology: 2 teams × 10 agents  
Manager: ChatGPT (coordination and information relay only)

## Team A — Interface & Product Cohesion

Primary mission: UI Foundation V2 and cross-workspace coherence.

Team A owns the visual/product migration stream. It may inspect every workspace, but implementation ownership is limited to shared UI foundation, navigation, dialogs, settings presentation, responsive behavior, localization/RTL presentation, and Android visual evidence.

## Team B — RPG & Stateful Experience

Primary mission: RPG V2 10-minute vertical slice.

Team B owns RPG-specific experience, world/canon runtime integration, character-local knowledge, RPG persistence, RPG scenario tests, RPG context budgets, and RPG review.

## Why two teams instead of twenty agents in one pool

Parallelism only helps when work is separable. Two independently reviewed streams let Seven advance on UI and RPG at the same time without turning shared files into a merge-conflict queue.

## Hard cross-team rule

No file may be actively edited by both teams at the same time.

Shared-core files require a manager lease recorded in `.seven-team/ownership.json`.

If Team B needs a shared UI change:
1. Team B reports the requirement.
2. Manager assigns the shared file to Team A or explicitly leases it to Team B.
3. The other team stays read-only on that file until the lease closes.

If Team A needs RPG runtime behavior, the same rule applies in reverse.

## Parallel merge model

Team A worker -> Team A tests -> Team A reviewer (A10)  
Team B worker -> Team B tests -> Team B reviewer (B10)

Only reviewed commits become integration candidates. The manager compares both candidate sets before any main merge.

## Speed objective

The target is not "2× more code". The target is close to 2× throughput on independent work while keeping defect and conflict rates flat or lower.

## Current streams

- Team A: UI Foundation V2 (#49) + UI portion of evaluation harness (#51)
- Team B: RPG V2 vertical slice (#50) + RPG portion of evaluation harness (#51)
- Global review rules: #52
- Global control board: #48

## Live-runtime boundary

Creating branches and manifests does not make LLM workers live. Live sessions still require provider/model authentication on the runtime host. Until that wiring is present, both teams are structurally ready but not autonomous.

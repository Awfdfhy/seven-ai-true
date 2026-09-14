# Seven Polishing V5.27 — Partial Progress Integrity

Status: ARCHITECTURE_CANDIDATE
Parent: V5.26 Reliability Composition

V5.27 prevents binary final success from hiding meaningful partial progress, stalled progress, or wasteful activity in long workflows.

## Prime law
Final completion is important, but it is not sufficient to describe how a long workflow behaved.

## Requirements
1. Milestone Graph: long tasks define evidence-backed intermediate milestones or state conditions where meaningful.
2. Dense Progress Evidence: record which milestones were reached, preserved, invalidated, or later undone.
3. Progress-vs-Activity: tool calls, tokens, messages, or elapsed time do not count as progress by themselves.
4. Progress Efficiency: relate achieved progress to time, tokens, network, battery, tool calls, and retries when material.
5. Stall Detection: distinguish slow valid work from repeated activity with no durable state advancement.
6. Backslide Detection: record when later actions erase previously valid progress.
7. Partial Credit Scope: partial completion cannot be promoted to full correctness; it supports only the milestones actually demonstrated.
8. Budget-Limited Runs: if a run stops because its allowed budget expires, preserve achieved progress and remaining unmet milestones.
9. Recovery Value: measure whether recovery mechanisms regain lost progress or merely restart work from scratch.
10. Milestone Ordering: when dependencies matter, reaching a later-looking output cannot compensate for skipped required prerequisites.
11. Intermediate Oracle Strength: each milestone inherits its own oracle/evidence strength rather than borrowing certainty from the final scorer.
12. Progress Tail: evaluate whether a system regularly gets close to completion but repeatedly fails at the same late stage.
13. Comparative Progress Curves: candidate and incumbent can be compared across matched milestones, not only final pass/fail.
14. Long-Task Regression Memory: recurring stalls, backslides, and late-stage failures remain in the regression corpus.
15. Release Claim Ceiling: partial-progress evidence cannot be called release-proven completion without end-state verification.

## Saturation
V5.26 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No dense grader, milestone engine, or progress-efficiency runtime is claimed implemented.
# Seven Polishing V5.23 — Team Coordination

Status: ARCHITECTURE_CANDIDATE
Parent: V5.22 Ecological Validity

V5.23 treats group coordination as a distinct capability rather than assuming that strong individual agents automatically form a strong team.

## Prime law
Individual competence does not imply collective correctness.

## Requirements
1. Coordination-Active Cases: include tasks where communication, role allocation, shared state, synchronization, or joint planning is genuinely required.
2. Single-vs-Team Baseline: compare the team against matched single-agent or serialized baselines when practical.
3. Protocol Identity: record the communication protocol, message budget, state-sharing mechanism, retry policy, and completion semantics.
4. Shared-State Consistency: evaluate whether members maintain compatible views of shared state across the workflow.
5. Role Allocation: evaluate whether responsibilities are assigned, transferred, and completed coherently.
6. Communication Utility: distinguish useful coordination from message volume; more messages are not automatically better.
7. Coordination Cost: latency, token/network overhead, memory, and waiting time are explicit costs.
8. Scale Curve: team claims bind to the evaluated number of agents; larger-team claims require evidence.
9. Coordination Noise Floor: small measured gains must exceed observed evaluation variance before architectural superiority is claimed.
10. Completion Agreement: workflows verify that required members converge on a compatible final state when the protocol requires it.
11. Shared-State Recovery: recovery behavior is evaluated when one member restarts or loses local context.
12. Message-Timing Variation: where relevant, coordination is checked under delayed, repeated, or reordered messages.
13. Mixed-Capability Teams: heterogeneous models or tools require evidence that role assignment and handoffs remain valid.
14. Coordination Regression Memory: team-specific failures remain in the regression corpus even when individual agents pass.
15. Collective Claim Ceiling: team-level capability claims require team-level evidence and cannot be inherited from the strongest member alone.
16. Protocol Comparison: protocol choice is treated as part of the evaluated architecture because it can materially change latency, overhead, and reliability.

## Saturation
V5.22 is NOT saturated. This material change resets saturation to 0/2.

## Truth boundary
Architecture only. No team runtime, coordination protocol, or large-scale evaluation harness is claimed implemented.
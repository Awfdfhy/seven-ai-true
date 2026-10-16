# D19_AGENT_ORCHESTRATION — Multi-Agent Team / Manager / Strike Teams / Calibration

Research audit: READY

DOMAIN_ID=D19_AGENT_ORCHESTRATION
SOURCE_ANALYSIS=MCP core spec [SOURCE primary] https://modelcontextprotocol.io/specification/2026-07-28 frames interoperability. GitHub Copilot custom agents [SOURCE primary] https://docs.github.com/en/copilot/concepts/agents/copilot-cli/about-custom-agents) and multi-agent reference architecture [SOURCE primary] https://github.com/microsoft/multi-agent-reference-architecture) emphasize roles, handoffs, coordination, calibration, observability. Convergent: manager/coordinator, specialist roles, clear ownership, escalation paths, strike teams. 
CURRENT=Multi-agent team/manager/strike teams/calibration (owners B10,A04). This is explicitly "Seven Superloop Agent - 20-agent team with Manager AI coordinating". ARCHITECTURE.md and .seven-team/autonomy likely define orchestration model, agent manifests, handoffs, calibration. 
TARGET=Deterministic orchestration: explicit role contracts, task decomposition with ownership, handoff protocol (state+context+evidence), calibration (confidence/quality gates), failure handling/escalation, concurrency controls. 
NOW=Inspect agent manifests (.seven-team), manager logic, handoff state, calibration metrics. 
NEXT=Define handoff schema (inputs/outputs/evidence/acceptance criteria), ownership registry (prevent duplicate owners per kernel/shell/tasks/storage/bridge/routing), calibration rubric usage. 
LATER=Strike team formation rules, load balancing, retry policies with backpressure. 
TESTS=Orchestration integration tests for handoffs, manager fallback behavior, ownership conflict detection, calibration threshold tests. 
RISKS=Orphaned tasks, duplicate ownership (explicitly forbidden), handoff loss, manager thrashing, unclear escalation. 
FIRST_SLICE=Handoff+ownership audit: extract all agent roles, owners, handoff points; verify no duplicates for shell/tasks/storage/bridge/routing/kernel; document gaps. 
KNOWN_UNKNOWNS=Manager implementation details, calibration data, actual handoff mechanics. 
DOMAIN_VERDICT=READY_FOR_PLAN (strong repo cues: 20-agent team, manager, ownership rules; need concrete inspection of manifests)

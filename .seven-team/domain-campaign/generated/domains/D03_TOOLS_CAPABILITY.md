# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=20 sources harvested (17 primary, 3 secondary); harvest READY. MCP 2026-07-28 tool spec and Tasks extension define tool lifecycle; OpenAI function calling + programmatic tool calling; BFCL V4 leaderboards; ToolSandbox/τ-bench/AgentDojo benchmarks; OWASP Agentic Top 10 2026 (excessive agency, prompt injection). Disagreement: MCP async tasks vs synchronous function calling. Freshness: current specs 2026. Limitation: harvested pages are mostly index/abstracts; no Seven tool code inspected yet in this pass.
CURRENT=Seven has tool/runtime code in remake/src; Tools v1 research synthesis and execution plan exist. High-impact external tools must not connect before ReferenceMonitor, approval binding, idempotency, audit tests are green. LLM is never authorization boundary.
TARGET=Deterministic schema/capability/scope/approval/replay checks on every execution; audit trail; idempotency; no excessive agency.
NOW=Audit existing tool permission and execution code; map owners and gaps; define authorization boundary.
NEXT=ReferenceMonitor + approval binding + idempotency tests; prompt-injection adversarial suite.
LATER=MCP integration only after security gates green; async task support.
TESTS=Deterministic: schema validation, capability/scope checks, approval binding, replay/idempotency; E2E: tool flow; Android: N/A (web); adversarial: prompt injection, excessive agency, unauthorized calls; eval: BFCL-style accuracy.
RISKS=Excessive agency, prompt injection, credential exposure, replay, scope escalation, duplicate runtimes.
FIRST_SLICE=Authorization boundary audit + deterministic permission tests for existing tools.
KNOWN_UNKNOWNS=Exact tool module paths, current permission implementation, test coverage, MCP client state.
DOMAIN_VERDICT=READY_FOR_PLAN

# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Harvested 20 sources (17 primary). MCP 2026-07-28 tools spec + Tasks extension (draft), TS SDK v2 + migration. OpenAI function/tool calling guides (programmatic). BFCL V4 leaderboard. Benchmarks: ToolSandbox (stateful conversational), τ-bench (tool-agent-user real domains), AgentDojo (prompt injection), AgentDyn (deployability in dynamic env), Adaptive eval of OOB defenses. OWASP Top 10 Agentic Apps 2026 + LLM06:2025 Excessive Agency + community update. 
Disagreements: capability vs safety tension (agency vs least privilege). Freshness strong (MCP 2026-07-28 recent). Limitations: some arXiv preprints, BFCL focuses on single-turn tool selection; τ-bench/ToolSandbox closer to interactive. Harvest sufficient.

CURRENT=Seven is agent system (Codex CLI context) with tools/capability graph implied. Manifest/arch define subsystems (kernel/shell/tasks/storage/bridge/routing). Need to inspect how tools are registered, capability graph, permissions model, approval policy. Repo shows `verify.cjs`, `runtime-smoke.cjs` — may test tool paths. No duplicate owners rule critical.

TARGET=Principled tool system: capability graph (who can call what), least privilege, per-tool permissions, approval/escalation, task-scoped capabilities, deterministic tool schemas, type-safe (TS SDK aligned), task lifecycle (MCP Tasks extension awareness), safety controls (OWASP agentic). Measurable via BFCL/τ-bench style checks in evals. 

NOW=Map tool surface in Seven: list registered tools, capability graph, permission checks, approval flow. Inspect code for tool registry, sandbox/permissions, any tool tests. Compare to MCP 2026-07-28 shapes; identify gaps (capability graph, task-scoped perms). Define invariants (least privilege, no ambient root tools).

NEXT=Capability graph model (edges: role→tool, context→allowed), task-scoped permissions, dry-run/preview, tool result validation, idempotency keys, timeouts, circuit breakers. Add programmatic tool-calling tests.

LATER=Adversarial evals (AgentDojo-style prompt injection, out-of-band), excessive agency scanner, τ-bench domains, BFCL integration subset, provenance/audit log for tool calls.

TESTS=Contract (schema validation), permission (deny-by-default), idempotency, timeout, error taxonomy, adversarial (injection), regression. Deterministic mocks.

RISKS=Excessive agency, prompt injection, privilege escalation, capability graph complexity, breaking existing flows. Preserve subsystem ownership.

FIRST_SLICE=Inventory tools + capability checks; write contract tests for tool schemas + permission deny cases; smallest proof of least-privilege model.

KNOWN_UNKNOWNS=Tool registry location, capability graph impl, approval model details, MCP integration status. Need code inspection.

DOMAIN_VERDICT=READY_FOR_PLAN

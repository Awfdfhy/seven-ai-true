# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Harvested 20 sources (18 primary). MCP 2026-07-28 tools spec, Tasks extension draft, TS SDK v2/migration, OpenAI function/tool calling + programmatic tool calling, BFCL V4, ToolSandbox (stateful/conversational/interactive), tau-bench (tool-agent-user interaction), AgentDojo/AgentDyn/Adaptive evaluation show prompt injection and dynamic env risks. OWASP Top 10 for Agentic 2026 + LLM06 Excessive Agency are critical. Strong signal: capability graph, permissions/scoping, stateful tools, task/continuations, and security evals are required.
CURRENT=Tooling implied by agent architecture (Seven has many specialist agents) but repo inspection shows scripts (`all.cjs`, `verify.cjs`, `runtime-smoke.cjs`) not MCP server implementation. No obvious `tools/` or `capability/` dirs at root. Need to check `remake/` and agent manifests. `.seven-team/` exists but tool schema/permissions not visible from root listing.
TARGET=MCP-aligned tool registry with capability graph, per-tool permissions/scopes, input validation, stateful tool sessions, task lifecycle (MCP Tasks), programmatic/tool orchestration guards, audit logging, deny-by-default, excessive agency prevention.
NOW=Map tool inventory (what tools exist), permission model, schema validation, sandbox boundaries. Compare to MCP 2026-07-28 + Tasks extension.
NEXT=Capability graph with allowlists, tool risk classification, human-in-the-loop for high-risk, task resume/cancel, tool result redaction.
LATER=Dynamic permission elevation with proof, tool composition safety, cross-agent tool boundaries, agentic security tests.
TESTS=Schema conformance tests (MCP), BFCL-style function calling, ToolSandbox scenarios, tau-bench style interactions, AgentDojo injection tests, permission bypass tests. Deterministic.
RISKS=Excessive agency (OWASP LLM06), prompt injection, confused deputy, tool chaining abuse, state leakage, sandbox escape. Critical for release.
FIRST_SLICE=Tool inventory + risk matrix + permission defaults; add tool audit log; block high-risk tools by default with justification required.
KNOWN_UNKNOWNS=Does Seven implement MCP server/client? Tool registry location? Permission model? Need to read architecture + grep for "tool", "mcp", "function", "capability".
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT

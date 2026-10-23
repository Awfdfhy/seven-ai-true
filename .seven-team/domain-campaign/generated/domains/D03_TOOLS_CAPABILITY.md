# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Harvested sources show MCP tools/spec evolution (2026-07-28), tasks extension, TS SDK v2 migration, OpenAI function/tool calling and programmatic tool calling, benchmarks (BFCL V4, ToolSandbox, τ-bench), agent security (AgentDojo, AgentDyn, Adaptive evals), and OWASP Top 10 for Agentic Applications 2026 (excessive agency LLM06). Convergent: schema-first tools, stateful/conversational tool use, user/agent interaction modeling, capability graphs/permissions, least privilege, confirmation for destructive actions, sandboxing, prompt injection defenses, measurable success. Tension: flexibility vs safety; programmatic calling vs direct; local tools vs MCP remote.
CURRENT=Repo: `seven_ai-final.html` is monolith - likely contains tool definitions/calling. No obvious `mcp/`, `tools/`, `capability/` dirs at root. `package.json` exists (1350 bytes) - need to read deps/scripts. OWASP/agent security not visible as code. Ownership: must not duplicate shell/tasks/storage/bridge/routing/kernel.
Evidence: HTML bundle + package.json. No MCP server/client config visible. No capability graph JSON/schema found at root.
TARGET=Explicit capability graph (tools/capabilities → permissions/scopes), schema validation, approval/confirmation flows, rate limits, audit logging, MCP compatibility where useful, defense against excessive agency, stateful tool execution model aligned with tasks extension if adopted.
NOW=Read `package.json`, grep HTML for `function`, `tool`, `mcp`, `capability`, read `remake/ARCHITECTURE.md` for tool/bridge/routing ownership.
NEXT=Define capability schema, permission model (least privilege), tool allowlists by context, confirmation UX, error/recovery for tool failures, injection-resistant parsing.
LATER=MCP client integration, programmatic tool calling evaluation, capability-based routing, tool use evals (BFCL/τ-bench style) on Seven tasks.
TESTS=Deterministic schema tests, permission boundary tests, confirmation flow tests. Adversarial: prompt injection via tool results/args, excessive agency attempts. Stateful: ToolSandbox-style multi-turn. Android: tool availability/permissions.
RISKS=Excessive agency (OWASP LLM06), tool chaining abuse, secret leakage, SSRF/file system access, duplicate bridge/daemon ownership, approval fatigue.
FIRST_SLICE=Inventory tools/capabilities in HTML + package.json; map to ownership (bridge/routing/kernel); identify if any MCP code exists; document gaps vs MCP 2026-07-28. No edits.
KNOWN_UNKNOWNS=Actual tool registry, permission enforcement, MCP usage.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT

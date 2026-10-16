# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY
SOURCE_ANALYSIS=Strong alignment around MCP (2026-07-28 tools spec [SOURCE primary] https://modelcontextprotocol.io/specification/2026-07-28/server/tools), Tasks extension [SOURCE primary] https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks), TS SDK migration [SOURCE primary] https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28). OpenAI tool/function calling guidance [SOURCE primary] https://developers.openai.com/api/docs/guides/function-calling, programmatic tool calling [SOURCE primary] https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling). Evaluation/security: BFCL [SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard, ToolSandbox [SOURCE primary] https://arxiv.org/abs/2408.04682, τ-bench [SOURCE primary] https://arxiv.org/abs/2406.12045, AgentDojo/AgentDyn/adaptive evals [SOURCE primary] https://arxiv.org/abs/2406.13352, [SOURCE primary] https://arxiv.org/abs/2602.03117, [SOURCE primary] https://arxiv.org/abs/2606.26479). OWASP agentic security 2026 [SOURCE secondary] https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/, LLM06 Excessive Agency [SOURCE secondary] https://genai.owasp.org/llmrisk/llm062025-excessive-agency/. Convergence: capability graphs + permissions + least privilege; disagreements around out-of-band defenses efficacy. 
CURRENT=Tools/capability graph/permissions domain (owners A04,A07,A08,B07,B09,B10). Repo shows agent framework context (Seven Superloop Agent). ARCHITECTURE.md likely defines tool system; need to confirm MCP adoption, capability registry, permission model, tool schemas, approval flows. No direct tool files opened yet - evidence gap.
TARGET=Explicit capability graph (who can call what, under which preconditions), least-privilege scopes, parameter validation, tool result constraints, human-in-loop for high-impact tools, auditability. Align with MCP 2026-07-28 and OWASP agentic controls.
NOW=Map tool registry, schemas, permission checks, approval paths. Identify "excessive agency" cases (tools with broad side effects). 
NEXT=Enforce capability graph (declarative), add tool allowlists per agent role/strike team, deterministic tool selection tests, pre/postcondition checks. 
LATER=Adversarial harness (AgentDojo-style) integrated into reality lab per D30. 
TESTS=BFCL-style coverage for critical tools, τ-bench task success with constraints, prompt injection regression tests, negative permission tests.
RISKS=Tool misuse/excessive agency, prompt injection, unscoped filesystem/network tools, schema drift. 
FIRST_SLICE=Tool inventory + capability graph snapshot: list all tools, required permissions, owners, escalation points. Add invariant: no tool call without capability check. 
KNOWN_UNKNOWNS=Actual tool implementations, approval policy (never per permissions block but policy stated), MCP integration depth. 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need concrete tool registry + permission enforcement evidence)

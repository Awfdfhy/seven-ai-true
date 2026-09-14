# Seven Tool Fabric 2.0 — Wave 12 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: Model Fabric and provider runtime.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 12

Goal: design a provider-neutral model runtime for Seven. Provider SDKs and OpenAI-compatible dialects remain replaceable adapters and never become product-level architecture.

Research current official documentation first and verify behavior instead of assuming compatibility from names.

Research at minimum:
- canonical request/response/event contracts
- OpenAI-style API dialect differences
- OpenAI, Anthropic, Gemini, Groq and OpenRouter execution semantics relevant to Seven
- local llama.cpp-compatible serving where useful
- model capability manifests and capability evidence
- structured outputs and JSON Schema support
- tool/function calling and multiple tool calls
- streaming event models
- local transport cancellation and provider cancellation limits
- context-window and output-limit distinctions
- exact vs estimated token accounting
- reasoning/effort controls exposed by providers
- multimodal capability detection
- model revision/identity
- provider health and routing
- fallback behavior
- quota/rate/cost metadata as time-sensitive evidence
- privacy and remote/local routing constraints

Rules:
- a provider SDK is an adapter, not Seven architecture.
- model capabilities require evidence and are not inferred only from a model name.
- model output does not become authoritative because of provider reputation.
- provider usage metadata can be authoritative for the completed request; pre-request counting is exact only with a verified matching tokenizer.
- streaming success requires a valid terminal state.
- cancellation must record what is known: local abort requested, transport closed, provider-confirmed cancellation when exposed, or remote state unknown.
- retries after possible side effects obey SideEffectLedger and idempotency rules.
- routing must preserve task constraints such as privacy, required tools, vision, structured output, context, latency and local/remote preference.

Output:
1. Seven ModelRequest / ModelEvent / ModelResult contracts
2. capability manifest schema
3. provider adapter registry
4. streaming/cancellation state machine
5. structured-output/tool normalization
6. token/context accounting rules
7. routing/fallback/health architecture
8. Android/startup strategy
9. rejected assumptions
10. Deep Polish queue and eval requirements

Preserve material findings in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files or merge protected branches.

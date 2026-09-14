# Seven Tool Fabric 2.0 — Wave 12 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 12. No provider/model integration is frozen by this report.
Governing command: `WAVE_12_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should own a **Model Execution Plane** above all remote and local providers.

The core finding is that `OpenAI-compatible` is not a sufficient architecture contract. Groq documents unsupported OpenAI fields and model-dependent structured-output behavior; llama.cpp explicitly avoids claiming full compatibility; Anthropic and Gemini expose different streaming/tool state machines; OpenRouter may route one logical model across multiple providers with different parameter/privacy behavior.

Therefore Seven must normalize semantics, not merely request field names.

Proposed layers:

1. `ModelGateway` — one canonical Seven invocation boundary.
2. `CapabilityRegistry` — evidence-backed, versioned model/provider capability manifests.
3. `ProviderAdapter` — translates canonical requests/events/results to each API dialect.
4. `StructuredOutputGuard` — normalizes provider constrained-output modes and still validates locally with SchemaGuard.
5. `ToolCallNormalizer` — emits canonical Seven tool-call objects independent of provider syntax.
6. `ModelEventStream` — one event vocabulary across SSE/chunk/event implementations.
7. `TokenLedger` — records exact/provider/verified-tokenizer/estimated usage with provenance.
8. `ModelHealthRegistry` — live and historical latency/error/capability health evidence.
9. `ModelRouter` — constraint-first routing followed by quality/latency/resource policy.
10. `ModelFallbackController` — fallback only to capability-compatible choices while preserving privacy and task constraints.

## Candidate / adapter registry

| Candidate | Kind | Preliminary class | Seven role |
|---|---|---|---|
| OpenAI Responses / model APIs | direct provider protocol | CORE ADAPTER CANDIDATE | direct OpenAI adapter |
| Anthropic Messages API | direct provider protocol | CORE ADAPTER CANDIDATE | direct Anthropic adapter |
| Gemini Interactions API | direct provider protocol | CORE ADAPTER CANDIDATE | direct Gemini adapter |
| Groq OpenAI-style API | inference provider dialect | CORE/SPECIALIST ADAPTER | current Seven remote fast-inference path |
| OpenRouter API | multi-provider router | SPECIALIST BROKER ADAPTER | broad model/provider access and fallback |
| llama.cpp server | local/host runtime protocol | CORE LOCAL BACKEND CANDIDATE | local model backend behind Model Fabric |
| provider official SDKs | convenience libraries | OPTIONAL ADAPTER IMPLEMENTATION | use only if they reduce maintenance without leaking architecture |
| generic OpenAI SDK pointed at arbitrary base URLs | compatibility technique | LIMITED | convenient transport for some dialects, not a capability guarantee |

## Canonical ModelRequest

Seven should send a provider-neutral object conceptually containing:

- `requestId`
- `taskContractId`
- `modelRequirementProfile`
- `messages/input` in Seven content blocks
- system/developer instruction blocks
- image/audio/file references where permitted
- canonical tool descriptors + schema hashes
- tool-choice policy
- structured-output schema + strictness requirement
- output budget
- reasoning/effort intent as semantic tier rather than provider string
- temperature/sampling intent only when supported/relevant
- stream requirement
- cancellation token
- privacy/locality constraints
- latency/budget class
- provider/model allow/deny constraints
- lineage and trace id

Adapters translate only fields proven supported by the selected provider/model. Unsupported parameters fail capability validation before dispatch instead of being silently ignored.

## CapabilityManifest

A manifest is versioned evidence, not a permanent truth table.

Recommended fields:

- canonical model identity
- provider and provider-model id
- observed/API revision
- evidence source + observed timestamp
- lifecycle state: active/preview/deprecated/unknown
- input modalities
- output modalities
- context limit
- maximum output limit
- tool calling: none/client/server
- multiple/parallel tool calls
- structured output mode: none/json/best-effort-schema/strict-schema
- streaming support
- streaming tool-argument support
- provider-side background execution
- provider-confirmed cancellation availability
- reasoning/effort controls + supported values
- provider token-count endpoint availability
- usage metadata fields
- prompt caching semantics if material
- region/data-policy metadata when known
- free/paid eligibility evidence class
- known incompatibilities
- last probe/eval result

Do not infer these capabilities solely from family/model naming.

## Provider findings

### OpenAI

Current OpenAI API documentation centers new development on the Responses API and exposes tool/function calling, structured outputs, streaming, reasoning controls and large model capability metadata.

Seven role:
- direct adapter, not canonical schema owner
- consume terminal response/event states rather than treating any text delta as completion
- use provider-reported usage for completed calls
- retain endpoint/model revision information in execution evidence

Official sources:
- https://developers.openai.com/api/docs/guides/function-calling
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/docs/guides/streaming-responses
- https://platform.openai.com/docs/models
- https://help.openai.com/en/articles/10478918

### Anthropic

Messages streaming uses named SSE events. The documented stream contains `message_start`, content-block start/delta/stop, top-level `message_delta`, and terminal `message_stop`. Tool arguments can arrive as partial JSON deltas. Documentation explicitly says new event types can be added, so clients must tolerate unknown events.

Tool use and server tools can also produce provider-specific stop reasons such as `tool_use` and long server operations can introduce continuation/pause semantics.

Seven rules:
- normalize content blocks and tool calls only after complete boundaries are known
- tolerate/record unknown future events rather than crashing
- keep provider stop reason in raw evidence plus canonical Seven terminal state
- provider-specific reasoning/thinking artifacts are adapter data, not canonical Seven memory

Official sources:
- https://platform.claude.com/docs/en/build-with-claude/streaming
- https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools

### Gemini

Google documents the Interactions API as its preferred interface for new Gemini development as of 2026, with step-based streaming: interaction creation/status, step start/delta/stop, and a final interaction completion state. Function calls can stream argument deltas and put an interaction in a `requires_action` state. Background interactions expose an explicit cancel endpoint and a confirmed `cancelled` state.

Gemini also exposes a pre-request `count_tokens` endpoint and detailed post-request usage including input/output/thought/cache/tool-use classes.

Seven rules:
- map `requires_action` into Seven tool-wait state
- treat background cancel confirmation as stronger evidence than merely closing the client transport
- separate provider count result from estimates and record model identity/revision used for counting

Official sources:
- https://ai.google.dev/gemini-api/docs
- https://ai.google.dev/gemini-api/docs/streaming
- https://ai.google.dev/gemini-api/docs/function-calling
- https://ai.google.dev/gemini-api/docs/tokens
- https://ai.google.dev/api/interactions-api-v1

### Groq

Groq states its API is **mostly** OpenAI-compatible and documents unsupported features/fields. Its model support for structured outputs is model-specific; strict and best-effort modes differ, and current documentation notes combinations where structured outputs do not support streaming/tool use.

Groq also exposes model-specific reasoning controls and parallel tool-call settings.

Seven decision:
- never treat Groq as `OpenAIAdapter(baseURL=...)` only
- build a Groq capability overlay/dialect adapter even if common transport code is shared
- validate every requested capability before dispatch

Official sources:
- https://console.groq.com/docs/openai
- https://console.groq.com/docs/structured-outputs
- https://console.groq.com/docs/api-reference
- https://console.groq.com/docs/responses-api

### OpenRouter

OpenRouter is valuable as a provider/model broker, but routing itself becomes part of Seven's evidence and privacy story.

Current documentation supports provider ordering/fallback controls, parameter requirements, latency/throughput/price sorting and data-policy constraints such as data-collection restrictions and ZDR requirements. It can also perform model fallbacks and may return a different model/provider than the first requested target.

Seven rules:
- record actual serving model/provider where surfaced
- for capability-sensitive tasks use `require_parameters`-style constraints or equivalent capability gate
- for privacy-sensitive tasks apply provider/data-policy restrictions before routing
- do not let hidden provider fallback silently violate local/remote, privacy, tool, schema or modality constraints
- OpenRouter fallback is a transport/provider resilience layer; Seven still owns semantic fallback policy

Official sources:
- https://openrouter.ai/docs/guides/routing/model-fallbacks
- https://openrouter.ai/docs/guides/privacy/data-collection
- https://openrouter.ai/blog/insights/model-routing/
- https://openrouter.ai/blog/announcements/provider-variance-introducing-exacto/

### llama.cpp

Current llama.cpp provides a lightweight local HTTP server with OpenAI-inspired chat/responses routes, structured/grammar constrained output, tool-call support and multimodal/local model serving. Its own server documentation explicitly avoids strong claims of exact OpenAI compatibility.

Seven role:
- local backend behind the same ModelGateway
- capability manifest derives from loaded model metadata + chat template + Seven probes
- do not assume a GGUF model supports good tool use merely because server syntax accepts `tools`
- local model weights/version/hash become part of identity

Official sources:
- https://github.com/ggml-org/llama.cpp
- llama.cpp server/function-calling documentation in the same repository

## Canonical ModelEvent stream

Recommended Seven events:

- `MODEL_REQUEST_ACCEPTED`
- `MODEL_STARTED`
- `CONTENT_BLOCK_STARTED`
- `TEXT_DELTA`
- `STRUCTURED_DELTA`
- `TOOL_CALL_STARTED`
- `TOOL_ARGUMENT_DELTA`
- `TOOL_CALL_COMPLETED`
- `SERVER_TOOL_STARTED`
- `SERVER_TOOL_RESULT`
- `USAGE_UPDATE`
- `MODEL_STATUS_UPDATE`
- `MODEL_REQUIRES_ACTION`
- `MODEL_COMPLETED`
- `MODEL_REFUSED`
- `MODEL_FAILED`
- `MODEL_CANCELLED_CONFIRMED`
- `MODEL_STREAM_ENDED_UNCONFIRMED`
- `PROVIDER_RAW_EVENT` for safely retained unknown forward-compatible events

Events carry provider event id/type where available, sequence/index, trace id and raw lineage reference.

Partial text/tool JSON is never promoted to a final result before its provider block/terminal boundary.

## Streaming / cancellation state machine

Canonical lifecycle:

`CREATED → DISPATCHING → IN_PROGRESS → {REQUIRES_ACTION ↔ IN_PROGRESS} → COMPLETED`

Alternative terminals:
- `REFUSED`
- `FAILED`
- `CANCELLED_CONFIRMED`
- `ABORTED_LOCAL_REMOTE_UNKNOWN`

Cancellation evidence levels:

1. `LOCAL_ABORT_REQUESTED` — Seven stopped local consumption/request transport.
2. `TRANSPORT_CLOSED` — connection ended, but server work may or may not have stopped.
3. `PROVIDER_CANCEL_ACCEPTED` — provider exposes a cancel operation and accepted it.
4. `PROVIDER_CANCELLED_CONFIRMED` — provider state explicitly reports cancelled.
5. `REMOTE_STATE_UNKNOWN` — never invent cancellation success.

Normal foreground SSE APIs may only give Seven levels 1–2. Background APIs such as Gemini Interactions can provide stronger confirmation. Adapters advertise this distinction.

## StructuredOutputGuard

Normalize provider output guarantees into:

- `STRICT_SCHEMA` — provider claims constrained schema adherence for this exact model/mode.
- `BEST_EFFORT_SCHEMA` — provider attempts schema following but does not guarantee it.
- `JSON_ONLY` — syntactically JSON, schema not guaranteed.
- `UNCONSTRAINED`.

Regardless of provider claim:
1. preserve requested schema hash
2. parse final output
3. validate through Seven SchemaGuard
4. reject/repair only according to TaskContract
5. record provider guarantee level separately from local validation result

Do not silently downgrade a task that explicitly requires strict structured output.

## ToolCallNormalizer

Canonical tool-call record:
- call id
- provider call id
- tool canonical id
- provider tool name
- raw argument bytes/text reference
- parsed arguments
- input schema hash
- schema validation status
- source model/provider
- call order / parallel group
- lifecycle state

Tool names are resolved back to Seven's registry. Provider-generated tool names never grant capability/permission. A tool call with a valid schema still passes Tool Security Kernel and TaskContract.

## Token accounting law

Token count status values:

- `PROVIDER_FINAL` — provider's final usage object for the actual request.
- `PROVIDER_COUNT_ENDPOINT` — provider count endpoint for the exact intended model/request representation.
- `VERIFIED_LOCAL_TOKENIZER` — tokenizer artifact/version proven to match the target model semantics for the measured content class.
- `ESTIMATED` — heuristic/approximation only.
- `UNKNOWN`.

Rules:
- provider-final usage wins for billing/execution evidence of a completed request
- interrupted streams may lack final usage; do not record zero
- context-window limits and output limits are separate fields
- multimodal/tool/reasoning/cache token classes are retained when provider reports them
- never use one global tokenizer as exact for every provider/model

## ModelRouter

Routing order should be **constraints first, optimization second**.

Hard filters:
1. privacy/locality
2. required input/output modality
3. required tool support
4. required structured-output guarantee
5. context/output capacity
6. availability/credential state
7. explicit user/project/provider policy

Then ranking can use:
- Seven eval quality for task class
- recent reliability
- latency / TTFT / throughput
- quota pressure
- cost when applicable
- device resource state for local models
- user preference

Provider marketing rank never overrides measured Seven evals.

## Fallback Controller

A fallback candidate must satisfy the original hard constraints. Before fallback, preserve:
- original target
- reason for fallback
- provider/model attempted
- request transformations
- capability differences
- privacy/data policy

Do not automatically fall back from local-only to remote, from strict schema to best-effort, from tool-capable to non-tool model, or from approved provider to another data policy.

For tool/side-effect workflows, retry/fallback occurs at model-generation boundaries only. Already executed tools follow SideEffectLedger and are not replayed blindly.

## Health / capability probing

Use two evidence classes:

### Declarative
Provider model catalogs/docs/API metadata.

### Observed
Small Seven probes/evals for:
- basic completion
- stream terminal event
- schema compliance
- tool-call validity
- parallel tool behavior
- vision acceptance where relevant
- token usage presence
- latency/error rate

Observed behavior can downgrade a declarative capability but does not invent unsupported contractual guarantees.

## Android / startup strategy

- Model Fabric core types/router are tiny and startup-safe.
- Provider adapters load lazily when selected.
- avoid bundling every provider SDK; direct `fetch`/small transport adapters are preferred where SDK weight provides little value.
- local llama.cpp native runtime/model weights remain optional downloaded capability packs, never base-APK mandatory weight.
- health probing is demand-driven/backoff-based, never constant background polling.
- streaming parser work must be incremental and cancellable.

## Rejected assumptions

- `OpenAI-compatible` means identical behavior: rejected.
- one universal model capability table hardcoded forever: rejected.
- model-name substring determines tools/vision/reasoning: rejected.
- one tokenizer is exact for all models: rejected.
- closing a stream proves remote cancellation: rejected.
- provider structured-output flag eliminates local validation: rejected.
- fallback may weaken privacy/capability constraints: rejected.
- provider SDK becomes Seven's internal message/tool schema: rejected.
- provider-owned agent loops replace Seven Cognitive Control Plane: rejected.
- every provider SDK belongs in Android base bundle: rejected.

## Canonical Seven capabilities proposed

- `model.capabilities.resolve`
- `model.health.probe`
- `model.invoke`
- `model.stream`
- `model.cancel`
- `model.count_tokens`
- `model.route`
- `model.fallback`
- `model.structured_generate`
- `model.tool_generate`

These are internal/runtime capabilities and still obey task contracts and provider policy.

## Required Seven Evals

Before Freeze:
- same prompt across adapters normalizes to equivalent Seven result shape
- interrupted stream never reports false completion
- malformed/partial tool arguments never execute
- strict schema request never silently downgrades
- fallback preserves hard constraints
- actual provider/model identity is retained through broker routing
- token ledger marks interrupted/missing usage correctly
- provider capability drift is detected
- unknown stream events do not crash Seven
- cancellation states are epistemically accurate
- local model/tool capability is measured, not inferred from server feature flags

## Deep Polish queue

`Canonical Model Contracts → CapabilityRegistry → Groq Adapter → OpenAI Adapter → Gemini Adapter → Anthropic Adapter → OpenRouter Broker Adapter → llama.cpp Local Adapter → StructuredOutputGuard → ToolCallNormalizer → ModelEventStream → TokenLedger → Router/Fallback/Health Evals`

Groq is early in the queue because Seven currently uses it heavily; this does not make Groq architecture-canonical.

## Coverage statement

Wave 12 closes the major discovery gap around Model Fabric/provider execution. Final model selection/routing heuristics still belong to later Model Fabric + Adaptive Compute polish and must be driven by Seven Evals and current provider/model evidence.

No production integration occurred in this wave. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.

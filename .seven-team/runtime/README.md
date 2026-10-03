# Seven Team Runtime — Anonymous Free Brain Adapter

This adapter exists to bootstrap live agent testing without storing provider credentials.

## Provider

The relay forwards only OpenAI-compatible model-list and chat-completion calls to Kilo's anonymous free gateway. The default model for live smoke is `kilo-auto/free`.

## Security boundary

- The relay binds to localhost.
- It strips `Authorization` and forwards no caller headers other than Content-Type.
- It does not expose `GITHUB_TOKEN` to the model process.
- Agent checkout uses `persist-credentials: false`.
- Smoke agents may only modify one designated report file; the workflow rejects any extra file changes.
- Product source is public, but free-model providers may log prompts/outputs. Never use this route for secrets, private user data, or confidential source.

## Purpose

This is a bootstrap route, not the final provider architecture. It proves that real headless coding agents can receive model inference and make controlled repository edits before we provision persistent authenticated runtime sessions.

## Rate limit

Anonymous free-model requests are externally rate-limited. Team orchestration should keep concurrency bounded and treat 429 as a provider-capacity failure, not a code failure.

# Seven Tool Fabric 2.0 — Wave 07 Maximum Effort Command

Date: 2026-09-13
Status: ACTIVE RESEARCH CONTRACT
Scope: OAuth/OIDC, connector authorization, credential lifecycle, network reliability, rate limits and safe remote actions.

## SEVEN MAXIMUM EFFORT — TOOL FABRIC 2.0 / WAVE 07

Goal: design the strongest practical authorization and remote-action layer that lets Seven connect to external services without embedding provider-specific secrets, inventing insecure OAuth flows, blindly retrying writes, or turning every integration into a permanent dependency.

Use current primary standards and official implementation guidance first. Research both protocol semantics and Android/native-app constraints. Seven must own stable capability and credential contracts while providers remain replaceable adapters.

Research at minimum:
- OAuth 2.0 security BCPs and native-app guidance
- authorization code + PKCE
- OpenID Connect discovery/identity semantics
- refresh-token lifecycle and rotation/revocation handling
- sender-constrained tokens / DPoP where useful
- Android-native browser authorization and AppAuth-class implementations
- provider metadata/discovery
- MCP authorization compatibility and connector auth handoff
- CredentialVault integration with Wave 02 Android Keystore
- scope minimization and incremental authorization
- account/connection identity model
- token expiry/refresh/error normalization
- reconnect/revoke/disconnect flows
- rate-limit handling and Retry-After semantics
- idempotency and retry safety for remote writes
- request timeout-after-dispatch uncertainty
- pagination/streaming normalization
- HTTP caching/ETag/conditional requests where useful
- offline/reconnect queues
- provider health/backoff/circuit-breaking
- redaction/logging rules
- multi-account/multi-provider separation

For every candidate/standard determine:
- what is protocol requirement vs implementation convenience
- mobile suitability
- security properties
- token/secret exposure risk
- dependency weight
- provider compatibility
- failure and recovery behavior
- side-effect uncertainty semantics
- how Seven verifies action effects
- whether the feature belongs in Seven core, a provider adapter, a host service or a specialist fallback

Rules:
- native-app authorization uses an external user agent; do not embed provider login pages inside Seven WebView.
- public mobile clients do not pretend bundled static client secrets are secret.
- use PKCE for authorization-code flows unless a provider's documented flow makes that impossible; record incompatibility instead of silently weakening the flow.
- request minimum scopes and bind permission memory to the authoritative grant/connection record.
- access/refresh tokens never enter model context, normal logs or exported chat state.
- token refresh does not increase user-granted authority.
- a successful token exchange proves protocol success, not truth of provider data.
- write requests that time out after dispatch become UNCERTAIN unless idempotency/effect verification proves their state.
- no blind retry of non-idempotent remote writes.
- provider quotas/rate limits are provider facts, not Seven's own artificial usage caps.
- disconnect/revoke must invalidate Seven's local connection state even if remote revocation support is absent or fails.
- external connector/MCP authorization cannot bypass Seven TaskContract, Permission System or SideEffectLedger.

Output:
1. standards/candidate registry
2. `ConnectionBroker` / `AuthBroker` architecture
3. canonical Seven connection tools
4. credential and token lifecycle state machine
5. scope/permission model
6. retry/rate/idempotency rules
7. multi-account identity model
8. provider/MCP adapter boundary
9. security and logging rules
10. rejected approaches
11. Deep Polish queue

Preserve all material findings and uncertainty in GitHub. No production integration during discovery. Do not modify `seven_ai-final.html`, delete files, or merge protected branches.

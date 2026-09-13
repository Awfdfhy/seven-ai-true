# Seven Tool Fabric 2.0 — Wave 07 Discovery Report

Date: 2026-09-13
Status: DISCOVERY COMPLETE FOR WAVE 07. No candidate integrated/frozen.
Governing command: `WAVE_07_MAXIMUM_EFFORT_COMMAND.md`

## Executive result

Seven should not treat OAuth as "login" and should not let provider SDKs become the architecture.

The correct shape is a **Connection + Authorization + Remote Action plane** with strict boundaries:

1. `AuthBroker` — protocol-safe authorization acquisition/refresh/revocation.
2. `ConnectionBroker` — durable account/provider/resource binding and lifecycle state.
3. `CredentialVaultBridge` — opaque secret/token references backed by Wave 02 CredentialVault/Android Keystore.
4. `ResourceDiscovery` — authorization-server/protected-resource/OIDC metadata discovery and issuer binding.
5. `RemoteActionBroker` — normalized remote reads/writes behind TaskContract + SideEffectLedger.
6. `RetryController` — retries only when semantics/evidence make them safe.
7. `RateLimitGovernor` — provider/account/resource-specific limits, `Retry-After`, budgets and backoff.
8. `ConnectionHealth` — degradation, refresh, reauth, revoke and recovery state.
9. `AccountBinding` — multi-account identity separation without leaking provider identity into canonical tool contracts.
10. `McpAuthorizationAdapter` — MCP HTTP authorization interoperability subordinate to Seven authority rules.

**Central law:** successful authorization proves that a protocol grant succeeded. It does not prove provider data is true, does not prove a later remote action succeeded, and does not increase Seven authority beyond the user's authoritative grant plus TaskContract.

## Standards / candidate registry

| Candidate / standard | Kind | Preliminary class | Seven role | Priority |
|---|---|---|---|---|
| RFC 9700 OAuth 2.0 Security BCP | security BCP | CORE SECURITY STANDARD | baseline OAuth security rules | P0 |
| RFC 8252 OAuth for Native Apps | native-app BCP | CORE SECURITY STANDARD | external-user-agent native authorization | P0 |
| RFC 7636 PKCE | OAuth extension | CORE SECURITY STANDARD | authorization-code interception defense | P0 |
| RFC 8414 Authorization Server Metadata | discovery standard | CORE STANDARD | endpoint/capability discovery | P0 |
| RFC 9728 Protected Resource Metadata | discovery standard | CORE STANDARD | resource → auth-server discovery; MCP-critical | P0 |
| RFC 8707 Resource Indicators | OAuth extension | CORE for MCP / SPECIALIST elsewhere | resource/audience targeting | P0 |
| RFC 9207 Authorization Server Issuer Identification | OAuth extension | CORE SECURITY where supported | mix-up attack defense | P1 |
| RFC 7009 Token Revocation | OAuth extension | CORE LIFECYCLE CANDIDATE | remote token revocation when supported | P1 |
| RFC 9449 DPoP | sender-constrained token standard | SPECIALIST SECURITY | reduce usefulness of stolen bearer tokens | P2 |
| OIDC Core + Discovery Errata 2 | identity/discovery standard | SPECIALIST/CORE WHEN IDENTITY NEEDED | authenticated account identity + OP discovery | P1 |
| AppAuth-Android | Android OAuth/OIDC SDK | STRONG IMPLEMENTATION CANDIDATE | browser/Custom Tabs + PKCE + AuthState | P1, audit before freeze |
| MCP Authorization 2025-11-25 | interoperability profile | CORE MCP ADAPTER BEHAVIOR | HTTP MCP authorization/discovery | P0 for MCP |
| RFC 9110 HTTP Semantics | HTTP standard | CORE NETWORK SEMANTICS | idempotency, Retry-After, conditional writes | P0 |
| RFC 9111 HTTP Caching | HTTP standard | CORE NETWORK SEMANTICS | cache/revalidation semantics | P1 |
| RFC 6585 `429 Too Many Requests` | HTTP status extension | CORE RATE-LIMIT SIGNAL | provider throttling signal | P0 |
| Provider-specific idempotency keys | provider contracts | SPECIALIST ADAPTER FEATURE | safe duplicate suppression when documented | P1 |
| Generic `Idempotency-Key` IETF draft | expired/inactive draft | REJECT AS UNIVERSAL STANDARD | inspiration/provider-specific only | rejected as universal |
| OAuth Dynamic Client Registration RFC 7591 | OAuth extension | SPECIALIST | only where provider/profile requires it | P2 |

## 1. OAuth native-app security baseline

### RFC 9700

OAuth 2.0 Security Best Current Practice was published in January 2025 and is the baseline security reference for Seven OAuth adapters.

Key rules relevant to Seven:
- authorization servers must support PKCE; `S256` is the appropriate challenge method where supported;
- authorization-server metadata is recommended to reduce configuration and endpoint mistakes;
- privileges should be restricted to the minimum necessary;
- access tokens should be audience-restricted where possible;
- public-client refresh tokens must be sender-constrained or use refresh-token rotation to detect replay.

Source:
- https://www.rfc-editor.org/rfc/rfc9700.html

### RFC 8252 — native apps

Native apps should perform authorization using an **external user-agent** (system browser / browser tab pattern), not an embedded WebView. Public native app clients cannot safely treat a secret bundled into every installation as confidential. Public native clients must use PKCE.

Seven decision:
- never place provider sign-in pages inside Seven WebView;
- launch authorization through an external browser/Custom Tabs style flow;
- treat the Android app as a public client unless the provider architecture supplies a genuinely confidential backend/client-instance mechanism;
- bundled static `client_secret` values are not considered secrets;
- redirect URI is provider/connection metadata and must be exact/allowlisted.

Sources:
- https://www.rfc-editor.org/rfc/rfc8252.html
- https://www.rfc-editor.org/rfc/rfc7636.html

## 2. AppAuth-Android

`openid/AppAuth-Android` is a strong Android implementation candidate. Its official README states that it follows RFC 8252, uses Custom Tabs/external browser behavior, explicitly does not support WebView authorization, supports PKCE and maintains an `AuthState` abstraction for fresh-token operations.

Current repository metadata confirms the project is public and **not archived**. However, discovery also surfaced current maintenance/support questions and extension gaps in the issue tracker. Therefore Seven must perform a fresh maintenance/release/API audit before freezing it as the final native auth dependency.

Seven decision:
- **STRONG IMPLEMENTATION CANDIDATE, not architecture**;
- hide it behind `AuthBroker` so replacement does not change Seven capability contracts;
- do not serialize its raw library objects as canonical Seven connection state;
- persist only normalized Seven state plus encrypted token material/reference.

Source:
- https://github.com/openid/AppAuth-Android

## 3. Resource and authorization-server discovery

### RFC 8414

Authorization Server Metadata provides standardized endpoint/capability discovery. Seven should prefer discovered metadata over manually duplicating endpoints, while still validating the expected issuer/origin.

### RFC 9728

Protected Resource Metadata (April 2025) lets a client obtain metadata about a protected resource, including related authorization servers. This is particularly important for modern MCP authorization.

### RFC 9207

Authorization Server Issuer Identification adds an `iss` response parameter that clients can validate against the expected authorization server issuer to mitigate mix-up attacks.

Seven `ResourceDiscovery` record should contain:
- resource identifier
- resource metadata URL + retrieved hash/time
- authorization-server issuer
- authorization-server metadata URL + retrieved hash/time
- authorization/token/revocation endpoints
- PKCE methods
- supported auth/token capabilities
- resource indicator support
- issuer-validation capability
- OIDC discovery metadata when identity is requested
- source lineage + freshness

Rules:
- metadata is configuration evidence, not permission;
- discovered endpoint origins must remain bound to the issuer/resource that produced them;
- unexpected issuer changes invalidate or degrade the connection pending explicit reconciliation;
- never send tokens to a resource other than the bound target/audience.

Sources:
- https://www.rfc-editor.org/rfc/rfc8414.html
- https://www.rfc-editor.org/rfc/rfc9728.html
- https://www.rfc-editor.org/rfc/rfc9207.html

## 4. OIDC identity boundary

OpenID Connect Core/Discovery Errata 2 is the preferred current corrected OpenID Connect baseline.

Seven role:
- use OIDC only when the integration needs authenticated account identity/profile semantics;
- verify issuer/audience/nonce and other OIDC requirements through the chosen compliant implementation;
- normalize provider account identity into an `AccountBinding` record;
- OIDC claims remain claims from the identity provider and do not authorize unrelated Seven actions.

Potential normalized fields:
- `providerId`
- `issuer`
- provider subject identifier
- user-facing account label
- granted scopes
- resource bindings
- connection id

Do not use email address alone as the canonical account identity because it can change/collide across providers.

Sources:
- https://openid.net/specs/openid-connect-core-1_0.html
- https://openid.net/specs/openid-connect-discovery-1_0.html

## 5. Connection state machine

Canonical Seven connection state:

`UNCONFIGURED`
→ `DISCOVERED`
→ `AUTH_PENDING`
→ `CONNECTED`
→ optionally `REFRESHING`
→ `CONNECTED`

Failure/recovery branches:
- `CONNECTED → DEGRADED` for transient provider/network failures
- `CONNECTED/DEGRADED → REAUTH_REQUIRED` when refresh/grant can no longer recover
- `* → DISCONNECTED` for local disconnect
- `* → REVOKED` when authoritative revocation is known
- `* → INVALID` for issuer/resource/config mismatch or integrity failure

Each connection record stores metadata, **not raw tokens**:
- connection id
- provider adapter id/version
- account binding id
- issuer/resource ids
- granted scope set
- grant provenance/time
- credential reference(s)
- token expiry metadata (non-secret)
- refresh capability/status
- DPoP key reference if used
- last successful remote request time
- last auth refresh time
- last provider error class
- health state
- metadata hashes/revisions
- permission source-event reference

## 6. CredentialVault bridge

Wave 02 established Android Keystore-backed `CredentialVault`. Wave 07 binds it to remote connections.

Rules:
- access tokens, refresh tokens, client-instance private keys and provider secrets live behind opaque credential references;
- model prompts/context, chat exports, normal logs, telemetry and crash text do **not** receive raw tokens;
- token resolution occurs at dispatch boundary inside trusted adapter code;
- redaction happens before observability events leave the dispatch layer;
- refresh replaces/updates vault material atomically when token rotation returns a new refresh token;
- old rotated material is invalidated after successful atomic commit;
- local disconnect invalidates the Seven credential reference immediately even when remote revocation fails or is unavailable.

## 7. Refresh, rotation and revocation

RFC 9700 requires public-client refresh tokens to use replay-protection through sender constraining or rotation. RFC 7009 defines a standardized revocation endpoint where providers support it.

Seven refresh transaction:

`read connection → resolve refresh credential → token request → validate issuer/resource response context → stage new tokens → atomically replace vault refs/state → invalidate old local material → record evidence`

Failure rules:
- network failure **before dispatch**: safe to retry within budget;
- timeout/connection loss **after token request dispatch**: treat result carefully because rotation may have occurred; avoid racing refresh requests;
- serialize refresh per connection (`single-flight` lock);
- if a rotated refresh token may have been consumed and state cannot be reconciled, transition to `REAUTH_REQUIRED` rather than repeatedly guessing;
- `invalid_grant` or equivalent is normalized separately from transient network failure.

Remote revocation:
- attempt RFC 7009/provider revocation when supported;
- regardless of remote result, disconnect can always remove/invalidate Seven's local usable credential references;
- report remote revocation outcome separately as VERIFIED / UNSUPPORTED / FAILED / UNKNOWN.

Source:
- https://www.rfc-editor.org/rfc/rfc7009.html

## 8. DPoP

RFC 9449 can sender-constrain access and refresh tokens by requiring proof of possession of a private key.

Seven classification: **SPECIALIST SECURITY**, not mandatory for every provider.

Use when:
- authorization/resource server explicitly supports DPoP;
- key lifecycle can be bound to secure local storage;
- integration/security benefit justifies additional protocol complexity.

Rules:
- DPoP private key reference stays in CredentialVault/Keystore-oriented security boundary;
- DPoP is not itself user authentication or Seven permission;
- token/key/resource binding is part of the connection record;
- losing the key can make bound tokens unusable, so recovery/reauth behavior must be explicit.

Source:
- https://www.rfc-editor.org/rfc/rfc9449.html

## 9. MCP Authorization Adapter

MCP HTTP authorization (2025-11-25 profile) uses OAuth-based authorization and requires protected-resource discovery through RFC 9728. MCP clients must support authorization-server discovery, use RFC 8707 resource indicators, bind tokens to the intended MCP resource and must not perform token passthrough.

Seven architecture:

`MCP resource → ResourceDiscovery → AuthBroker → ConnectionBroker → CredentialVault → MCP transport adapter → Seven ToolInteropGateway`

Security laws:
- MCP authorization only grants transport-level access to the MCP server;
- discovered MCP tools still enter ToolInteropGateway capability normalization/schema/security checks;
- MCP scopes never bypass Seven TaskContract or Permission System;
- token passthrough to downstream services is forbidden;
- insufficient-scope challenges produce a **step-up authorization proposal**, never an automatic authority increase;
- the user must authorize additional scope before the connection's authoritative grant record changes.

Source:
- https://modelcontextprotocol.io/specification/2025-11-25/basic/authorization

## 10. RemoteActionBroker

Every external request receives a normalized action envelope:
- connection id
- canonical capability id
- provider operation id
- target resource/origin
- read/write/side-effect class
- required scopes
- request schema/version
- idempotency semantics
- conditional-write support
- expected verification method
- timeout policy
- retry class
- rate-limit bucket key
- response limits

Dispatch flow:

`TaskContract → Permission check → Connection state → scope check → credential resolution → rate gate → request validation → dispatch → response validation → side-effect verification → ledger/lineage`

No provider SDK may bypass this envelope.

## 11. Retry safety and side-effect uncertainty

RFC 9110 states that safe methods are read-like and that PUT/DELETE plus safe methods have idempotent semantics. It also warns clients not to automatically retry a non-idempotent request unless they know the semantics are effectively idempotent or can prove the original was not applied.

Seven retry classes:

### `READ_RETRYABLE`
Examples: ordinary GET/HEAD-style reads.
- bounded retry on transient network/5xx conditions
- exponential backoff + jitter
- honor server delay signals

### `IDEMPOTENT_WRITE_RETRYABLE`
Only when provider contract + operation semantics support safe repetition.
- may include PUT/DELETE semantics
- prefer conditional requests (`If-Match`/ETag) to avoid lost updates when supported

### `PROVIDER_KEYED_WRITE`
Provider explicitly documents an idempotency-key mechanism.
- generate one stable key per Seven side-effect transaction
- reuse same key only for retries of the *same* logical action
- adapter records provider semantics/retention window

### `NON_IDEMPOTENT_WRITE`
Examples: create/send/purchase-like POST semantics unless provider contract proves otherwise.
- no blind automatic retry after ambiguous dispatch
- timeout after possible dispatch → `UNCERTAIN`
- query/verify target state using a separate read/effect check before deciding retry

### `NEVER_AUTO_RETRY`
Destructive/high-risk provider actions where provider semantics/effect verification is insufficient.

Important finding:
- the generic IETF `Idempotency-Key` work discovered during this wave is not treated as a universal finalized HTTP contract for Seven. Provider-specific documented idempotency support is authoritative for adapters.

Sources:
- https://www.rfc-editor.org/rfc/rfc9110.html

## 12. Conditional writes and concurrency

HTTP conditional requests can prevent lost updates. Seven should use provider ETags/revisions where available.

Pattern:
`read representation + ETag → propose change → send If-Match → 2xx verified or 412 conflict → refetch/reconcile`

Rules:
- a 412/428-style conflict is not a generic retryable failure;
- feed conflict into repair/replan with the new remote state;
- never overwrite concurrent changes merely to make an automation "succeed".

Sources:
- https://www.rfc-editor.org/rfc/rfc9110.html
- https://www.rfc-editor.org/rfc/rfc6585.html

## 13. RateLimitGovernor

HTTP 429 means Too Many Requests and may include `Retry-After`; RFC 9110 defines `Retry-After` as either an HTTP date or delay seconds. Provider-specific quota headers/contracts vary.

Seven rate state is keyed at least by:
`provider + connection/account + resource + capability/operation bucket`

Tracked state:
- last 429 / quota response
- `Retry-After` deadline if present
- provider-specific remaining/reset fields if documented
- local in-flight count
- transient-failure streak
- cooldown deadline
- confidence/source of rate information

Rules:
- provider quota is not a global Seven usage cap;
- honor authoritative provider `Retry-After` rather than hammering the endpoint;
- when provider exposes no reset signal, use bounded exponential backoff + jitter;
- retry budgets prevent endless loops;
- interactive user actions may surface the cooldown state instead of silently queueing for a long period;
- different user accounts/connections do not share quota state unless the provider contract says the quota is global.

Sources:
- https://www.rfc-editor.org/rfc/rfc6585.html
- https://www.rfc-editor.org/rfc/rfc9110.html

## 14. ConnectionHealth / circuit behavior

Seven should implement a small stateful health controller, not a giant networking framework.

Possible transitions:
- isolated timeout/5xx → transient failure count
- repeated transient failures → `DEGRADED` + cooldown
- cooldown elapsed → half-open probe using a low-risk read if available
- successful probe → `CONNECTED`
- auth failure/expired refresh → `REAUTH_REQUIRED`
- issuer/resource-integrity mismatch → `INVALID`

Do not use circuit breaking to suppress explicit user requests without surfacing the state. It is a resilience mechanism, not hidden policy.

## 15. HTTP caching / ETag

RFC 9111 allows reuse/revalidation of cached responses according to cache semantics. Seven can reduce network/battery by respecting validators such as ETag/Last-Modified.

Seven rules:
- cache only responses explicitly eligible under provider/HTTP semantics;
- private authenticated data is isolated per connection/account;
- never mix cached content across accounts;
- do not cache tokens/authorization responses as ordinary response cache entries;
- preserve source URL/resource, connection/account identity, ETag/Last-Modified, retrieved time and freshness in lineage;
- `304 Not Modified` revalidates the representation; it is not a new semantic source;
- cache reuse preserves original source provenance plus validation event.

Sources:
- https://www.rfc-editor.org/rfc/rfc9111.html

## 16. Offline / reconnect behavior

Remote reads:
- may use eligible cached data with explicit `STALE`/freshness metadata when provider is unavailable and task allows stale evidence.

Remote writes:
- do not enqueue arbitrary writes blindly while offline;
- an offline write queue item must preserve target, operation, user intent, permission source, base remote revision if known, idempotency semantics and expiry/reconfirmation policy;
- high-risk/destructive actions should require reconfirmation if substantial time/state drift occurred before reconnect;
- when connectivity returns, revalidate connection/scopes/resource state before dispatch.

## 17. Multi-account / multi-provider model

Do not bind tool identity to a provider account name.

Canonical hierarchy:

`ProviderAdapter → Connection → AccountBinding → ResourceBinding → CredentialRefs → GrantedScopes`

Examples of distinct connections:
- same provider, two user accounts
- same identity account, two target resources/tenants
- same resource with different permission sets

Every remote tool invocation must specify or deterministically resolve exactly one connection. Ambiguous account selection must not silently choose the last-used account for side-effecting operations.

## 18. Canonical Seven tools

### Discovery / connections
- `connection.discover`
- `connection.connect`
- `connection.list`
- `connection.status`
- `connection.scopes`
- `connection.reauthorize`
- `connection.disconnect`
- `connection.revoke_remote`

### Account/resource binding
- `account.list_bindings`
- `account.bind`
- `account.unbind`
- `resource.list_bindings`

### Authorization
- `auth.begin`
- `auth.complete`
- `auth.refresh`
- `auth.capabilities`
- `auth.step_up`

`credential.resolve_for_dispatch` is **internal-only**, not a model-callable tool.

### Remote execution
- `remote.read`
- `remote.action`
- `remote.verify_effect`
- `remote.rate_state`
- `remote.connection_health`

### MCP authorization
- `mcp.auth.discover`
- `mcp.auth.connect`
- `mcp.auth.step_up`

Provider-specific operations remain normalized capabilities behind adapters rather than becoming permanent canonical names.

## 19. Permission / authority rules

1. OAuth scope is an external-provider grant boundary, not Seven's whole permission model.
2. A Seven action requires both provider authorization **and** Seven TaskContract/Permission approval.
3. Stored permission memory references the authoritative connection/grant event, not a summary of it.
4. Refresh never adds scopes silently.
5. Insufficient-scope responses may suggest required scopes, but only a completed user authorization changes the authoritative scope set.
6. OIDC identity claims do not imply tool permissions.
7. MCP discovery cannot grant its own tools authority.
8. Disconnect/revoke events immediately affect future tool eligibility.

## 20. Security / logging rules

Never log or expose in model context:
- access tokens
- refresh tokens
- authorization codes
- PKCE verifier
- DPoP private keys
- client-instance private keys
- provider secrets

Safe observability fields include:
- connection id
- provider adapter id
- issuer/resource id
- scope names where not themselves sensitive
- expiry timestamp
- normalized error class
- retry/cooldown state
- HTTP status
- request/response size and latency
- verification state

Authorization responses/redirects should be sanitized before diagnostic logging because query parameters may contain short-lived credentials/codes/state.

## 21. Rejected / limited approaches

- embedded WebView provider login: rejected for native OAuth authorization.
- shipping a static mobile `client_secret` and treating it as confidential: rejected.
- storing tokens in localStorage/chat/session export: rejected.
- exposing raw token resolution as a model-callable tool: rejected.
- one provider SDK defining Seven's connection state model: rejected.
- auto-requesting every available OAuth scope on first connect: rejected.
- automatic scope escalation on 403/insufficient_scope: rejected.
- blind POST retries after timeout: rejected.
- treating a generic idempotency-key draft as universal HTTP semantics: rejected.
- sharing OAuth tokens between unrelated resources/MCP servers: rejected.
- MCP token passthrough to downstream APIs: rejected.
- mixing account-specific caches/rate limits: rejected.
- interpreting successful OAuth as successful business action: rejected.

## 22. Deep Polish queue

Recommended order:

`AuthBroker (RFC9700/8252/PKCE) → ConnectionBroker state model → CredentialVaultBridge → ResourceDiscovery (8414/9728/9207/OIDC) → AppAuth Android adapter audit → RemoteActionBroker → RetryController + SideEffectUncertainty → RateLimitGovernor → MCP Authorization Adapter → DPoP specialist → offline queue/caching → multi-account UX`

The first four establish security and authority boundaries before provider-specific convenience features are added.

## 23. Open gaps

- provider-by-provider OAuth quirks only after actual connectors are selected;
- final AppAuth-Android version/maintenance/security audit at implementation time;
- exact Capacitor/native bridge for external-browser callbacks;
- redirect strategy: verified App Link vs claimed HTTPS/custom scheme per provider constraints;
- whether Seven needs a small backend for providers that do not support safe public-native clients;
- secure backup/restore semantics for connection metadata without exporting credentials;
- DPoP support matrix across intended providers;
- exact provider-specific idempotency key retention/semantics;
- rate-limit header normalization remains adapter-specific because providers expose different contracts;
- remote high-frequency condition-watch service architecture remains separate from the on-device connection plane.

## Coverage statement

Wave 07 covers native OAuth security, PKCE, OIDC identity/discovery, authorization/resource metadata, issuer binding, refresh rotation/revocation, optional DPoP, Android AppAuth candidacy, MCP HTTP authorization, credential isolation, connection/account state, remote action dispatch, retry/idempotency uncertainty, conditional writes, rate limiting, caching, offline behavior and multi-account separation.

This is practical saturation for the connection/authorization/remote-action wave, not a claim that every provider-specific OAuth variation has been enumerated.

No production integration occurred in this wave. `seven_ai-final.html` was not modified, no files were deleted, and no protected branch was merged.

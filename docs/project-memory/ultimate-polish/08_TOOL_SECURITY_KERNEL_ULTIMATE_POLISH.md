# Seven AI — Capability 08 Tool Security Kernel Ultimate Polish

Status: FREEZE CANDIDATE
Implementation status: Deferred / partial foundations exist
Final target: **Seven Authority Kernel 3.0 — Intent-Bound Least-Privilege Execution Firewall**

## Prime law

> A tool call is executable only when an authoritative, current and scope-correct grant permits that exact class of action for the active principal, task and resource.

The Tool Security Kernel is the deterministic authorization boundary between a proposed tool action and execution. Models, tools, memories, summaries and remote metadata may describe or request authority, but they never create authority.

## Ground truth

Current Seven already has useful foundations:
- TaskContract allowed/denied capabilities and task scope.
- fail-closed capability checks.
- permission-grant/revocation primitives exercised by runtime smoke.
- Tool Fabric schema/risk/permission gates.

These remain partial. Seven still needs one canonical model for principals, grants, delegation, confirmation, revocation and resource/data scope.

## Pass A — maximum architecture

### 1. Separate capability, binding and authority
- `CapabilitySpec`: what may be done.
- `ToolBinding`: how that capability is implemented.
- `AuthorityGrant`: what an identified principal permits.
- `AuthorityLease`: a narrower, short-lived task/run projection of a grant.

These objects never substitute for one another.

### 2. Canonical principals
Every consequential decision binds:
- requesting principal;
- acting Seven principal;
- project/workspace;
- downstream authenticated account when relevant;
- child-agent identity when delegated.

Identity is never inferred from display text.

### 3. Authority intersection
Effective authority is the intersection of:
1. platform/system policy;
2. authenticated principal rights;
3. authoritative user grant;
4. project/workspace grant;
5. TaskContract scope;
6. capability/binding policy;
7. resource selector;
8. destination selector when relevant;
9. current policy/revocation state.

Authority can narrow through delegation but never widens automatically. Explicit deny overrides allow.

### 4. AuthorityGrant
Canonical grant fields:
- grant id;
- issuer and subject principal;
- capability/action classes;
- resource selectors;
- destination selectors where required;
- task/project binding;
- issue/expiry timestamps;
- revocation epoch;
- intent/purpose reference;
- confirmation policy;
- delegation policy;
- authoritative source-event reference.

Derived objects may reference a grant but cannot manufacture one.

### 5. AuthorityLease
A lease:
- is narrower than or equal to its source grant;
- is bound to a task/run and principal;
- expires no later than its source grant;
- checks revocation before consequential dispatch;
- cannot be converted into broader standing authority.

### 6. ActionIntent
Every consequential action is normalized into an `ActionIntent` containing:
- canonical capability;
- operation;
- target resource;
- destination when relevant;
- data category when relevant;
- side-effect class;
- expected user-visible result;
- relation to the active task goal.

### 7. ActionFingerprint
A deterministic fingerprint binds the canonical ActionIntent to:
- binding revision;
- schema fingerprint;
- principal;
- task/run;
- policy epoch.

A confirmation for one fingerprint cannot silently authorize a materially different action.

### 8. Confirmation model
Confirmation levels:
- `AUTO_ALLOWED`: low-risk action inside an existing narrow grant.
- `PLAN_ENVELOPE_APPROVAL`: bounded approval for a finite task plan.
- `JUST_IN_TIME_CONFIRMATION`: required when policy marks an action materially sensitive or irreversible.
- `PROHIBITED`: hard deny that confirmation cannot override.

Confirmation is presented in a structured UI separate from ordinary tool/model content.

### 9. ConfirmationReceipt
A receipt binds:
- action/envelope fingerprint;
- authoritative user interaction event;
- principal;
- timestamp/expiry;
- policy epoch;
- optional one-shot/repetition rule.

Plain text claiming that approval happened is not a receipt.

### 10. Resource and destination scope
Permission is checked against canonical resource identifiers and destinations, not display labels.

A grant for one project, account, file set or destination does not silently expand to another.

Material destination changes require re-authorization.

### 11. Information-flow boundary
Reading information and releasing it elsewhere are distinct authority decisions.

Seven tracks compact policy categories such as:
- PUBLIC
- USER_PRIVATE
- PROJECT_PRIVATE
- CREDENTIAL_SECRET
- SECURITY_SENSITIVE
- EXTERNAL_UNTRUSTED
- UNKNOWN_SENSITIVE

A transformation may reduce content size but does not erase its source/security category.

### 12. Origin preservation
External or lower-trust origin metadata survives:
- extraction;
- summaries;
- memory candidates;
- context compression;
- tool output;
- inter-agent messages.

Origin metadata affects authorization but does not by itself declare content bad.

### 13. Credentials
Credentials remain outside ordinary model context wherever practical.

Use opaque credential handles or dispatch-time injection through a credential broker. Credential/account changes invalidate dependent leases and authorization caches.

Final Android implementation should use platform-backed secure storage rather than localStorage for secrets.

### 14. Child agents
Child agents receive explicit subleases only.

Rules:
- no authority by default;
- scope cannot exceed the parent lease;
- delegation depth is bounded;
- credentials are not inherited implicitly;
- parent revocation/cancellation can invalidate child leases.

### 15. Security control plane
Ordinary project-write authority does not authorize changes to permission policy, credential stores, protected release metadata, authorization records or trusted adapter mappings. Those require separate stronger capabilities.

### 16. Revocation
Use versioned revocation epochs so cached authorization can be invalidated quickly after:
- explicit revoke;
- account/session switch;
- project-scope change;
- policy update;
- credential change;
- tool/binding/schema identity change.

Revocation prevents new execution. It does not rewrite historical audit records.

### 17. Authorization caching
Cache only deterministic authorization subresults and include:
- principal;
- task/project;
- capability/action;
- resource/destination scope;
- grant/lease id;
- policy/revocation epoch;
- binding/schema fingerprint.

Confirmation never outlives its envelope and expiry.

### 18. AuthorizationDecision
Canonical decisions:
- ALLOW
- ALLOW_WITH_CONFIRMATION
- DENY
- BLOCKED_NEEDS_AUTH
- BLOCKED_NEEDS_REAUTH
- BLOCKED_NEEDS_STRONGER_ISOLATION

Every decision includes machine-readable reason codes and an audit receipt without private chain-of-thought.

## Velocity assault

The ordinary low-risk path must stay cheap:
1. exact lease lookup;
2. normalized resource/destination check;
3. deterministic policy lookup;
4. cached decision under current epoch;
5. dispatch.

No LLM call is required for routine authorization. Optional heavier analysis is selective and cannot replace deterministic policy.

Unused security components impose approximately zero startup cost beyond integrity-critical metadata.

## Pass B — destroy the winner

Rejected alternatives:
- broad session-wide permissions as default;
- model/tool text defining permission;
- permission checks only during planning;
- permission by tool name without target scope;
- confirmation for every call;
- general chat model as final permission judge;
- automatic child privilege inheritance;
- authorization caches surviving account/principal changes;
- Security Kernel claiming that a real-world effect succeeded.

Reconciliation simplifications:
1. V1 uses typed deterministic policy objects instead of a general-purpose policy language.
2. Heavy semantic analysis is selective instead of always-on.

## Canonical objects
- `PrincipalRef`
- `DelegationChain`
- `AuthorityGrant`
- `AuthorityLease`
- `ResourceSelector`
- `DestinationSelector`
- `DataClassLabel`
- `OriginTaintSet`
- `ActionIntent`
- `ActionFingerprint`
- `ConfirmationChallenge`
- `ConfirmationReceipt`
- `AuthorizationRequest`
- `AuthorizationDecision`
- `AuthorizationReceipt`
- `PolicySnapshot`
- `RevocationEpoch`
- `CredentialHandle`

## Frozen invariants
1. Model output never grants permission.
2. Tool output never grants permission.
3. Memory/summary never grants permission.
4. External metadata never lowers local authorization requirements by itself.
5. Effective authority only narrows through delegation.
6. Deny dominates allow.
7. Consequential dispatch is authorized against current state.
8. Read authority and release authority are distinct.
9. Confirmation binds to a fingerprint/envelope.
10. Confirmation cannot override hard policy deny.
11. Credentials are not ordinary context data.
12. Source/origin metadata survives transformations.
13. Child agents receive explicit subleases only.
14. Revocation invalidates cached authority rapidly.
15. Authorization success is not tool/effect success.
16. Security-control-plane writes require dedicated authority.
17. Binding/schema drift invalidates sensitive authorization bindings.
18. No ambient wildcard authority in the production baseline.

## Evaluation contract

Authorization:
- exact scoped allow/deny;
- empty allow -> deny;
- expiry and revocation;
- resource/destination outside scope;
- account/principal switch;
- project isolation;
- child sublease narrowing;
- binding/schema drift.

Authority integrity:
- derived context cannot create grants;
- origin survives compression and retrieval;
- remote metadata cannot change local grant state;
- confirmation cannot authorize materially changed actions.

Mobile/performance:
- no heavy startup work;
- low-risk fast-path latency;
- large-grant-catalogue lookup;
- Lite-tier memory overhead;
- revocation latency;
- offline behavior.

## Implementation stages
- TSK-P0 typed authority schemas.
- TSK-P1 deterministic intersection/deny evaluator.
- TSK-P2 ActionIntent/fingerprint/confirmation receipts.
- TSK-P3 origin and information-flow policy.
- TSK-P4 credential/destination boundaries.
- TSK-P5 child-agent delegation.
- TSK-P6 security-control-plane protection.
- TSK-P7 revocation epochs and audit receipts.
- TSK-P8 integrations across Tool, Context, Memory, Cognitive Runtime, SideEffectLedger and Projects.
- TSK-P9 isolation, recovery and mobile-performance gates.

## Proof of improvement

This architecture upgrades Seven from partial capability-name permission gates to principal + intent + resource + destination authorization, with exact approval binding, narrowed delegation, fast revocation, auditability and deterministic mobile-friendly fast paths.

## Research references
- NIST NCCoE Software and AI Agent Identity and Authorization, 2026.
- Microsoft least-privilege guidance for AI agents, 2026.
- OWASP AI Agent Security guidance.
- Model Context Protocol tool and authorization guidance, current 2026 line.

## Freeze recommendation

**FREEZE CANDIDATE ACCEPTED.**

Final target: **Seven Authority Kernel 3.0 — Intent-Bound Least-Privilege Execution Firewall**.

Implementation remains deferred. No protected product source is modified by this document.

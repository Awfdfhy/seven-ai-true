# Seven AI — Capability 08 Tool Security Kernel Freeze Record

Status: **ARCHITECTURE FROZEN FOR ULTIMATE POLISH CAMPAIGN**
Implementation status: **Deferred / partial foundation remains**

## Frozen target

**Seven Authority Kernel 3.0 — Intent-Bound Least-Privilege Execution Firewall**

## Prime law

> A tool call is executable only when an authoritative, current and scope-correct grant permits that exact class of action for the active principal, task and resource.

## Scope of this freeze

This freezes the authorization architecture for tool/action execution.

It does not mean:
- final Android Keystore integration exists;
- every external connector has production authorization wiring;
- SideEffectLedger implementation is complete;
- every project/file capability is implemented;
- every confirmation surface has final UI;
- Tool Fabric families are individually complete.

## Final reconciled decisions

1. Capability identity, tool binding and authority are separate concepts.
2. Authority comes only from authoritative grants plus deterministic policy.
3. Model/tool/memory/summary text cannot create grants.
4. Effective authority is an intersection of system, principal, task, project, resource, destination and current policy scopes.
5. Explicit deny overrides allow.
6. `AuthorityLease` is a narrower, short-lived projection of an authoritative grant.
7. Consequential actions normalize into `ActionIntent`.
8. Approval binds to an `ActionFingerprint` or finite plan envelope.
9. Confirmation cannot silently carry to materially different actions.
10. Low-risk actions inside narrow existing authority may use a deterministic fast path.
11. Sensitive/irreversible actions may require just-in-time confirmation by policy.
12. Hard policy denial cannot be overridden by confirmation.
13. Read authority and information-release authority are distinct.
14. Resource and destination identities are canonicalized before policy evaluation.
15. Source/origin metadata survives summary, memory, context and tool transformations.
16. Credentials remain outside ordinary model context where practical.
17. Child agents receive explicit narrowed subleases only.
18. Ordinary project/file write permission does not modify the security control plane.
19. Revocation epochs invalidate cached authority quickly.
20. Authorization caches bind to principal, task/project, resource/destination, grant/lease, policy epoch and binding/schema identity.
21. Tool/binding/schema drift invalidates sensitive authorization bindings.
22. Authorization success never implies tool success or verified real-world effect.
23. Routine authorization does not require an LLM call.
24. Heavy semantic security analysis is optional/selective and cannot replace deterministic policy.
25. Unused security components impose approximately zero startup cost beyond integrity-critical metadata.

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

## Canonical decisions

- `ALLOW`
- `ALLOW_WITH_CONFIRMATION`
- `DENY`
- `BLOCKED_NEEDS_AUTH`
- `BLOCKED_NEEDS_REAUTH`
- `BLOCKED_NEEDS_STRONGER_ISOLATION`

## Delegation law

Child authority must be a subset of parent authority and must respect delegation depth, expiry and revocation.

## Confirmation law

A confirmation is authoritative only through a structured receipt bound to the exact action/envelope, principal, policy epoch and expiry.

## Information-flow law

Permission to read information is not permission to release it elsewhere.

## Revocation law

Revocation blocks future execution under the affected authority and invalidates compatible caches. It does not rewrite audit history or falsely claim already-dispatched effects disappeared.

## Velocity law

Normal low-risk authorization uses exact lease/policy lookups and canonical resource checks. No model call is required merely to authorize routine operations.

## Mandatory eval families

- scoped allow/deny;
- empty allow fail-closed;
- resource and destination isolation;
- grant expiry/revocation;
- account/principal switching;
- project isolation;
- child delegation narrowing;
- confirmation fingerprint binding;
- authorization-cache invalidation;
- origin preservation through transformations;
- binding/schema drift;
- fast-path latency and Lite-tier memory cost.

## Implementation stages

- TSK-P0 authority schemas
- TSK-P1 deterministic evaluator
- TSK-P2 intent/fingerprint/confirmation
- TSK-P3 origin and information-flow policy
- TSK-P4 credential/destination boundary
- TSK-P5 child-agent delegation
- TSK-P6 security-control-plane protection
- TSK-P7 revocation/audit
- TSK-P8 cross-system integrations
- TSK-P9 isolation/recovery/mobile gates

## Freeze decision

**FROZEN.**

No protected product source was modified. Architecture freeze is not implementation completion.

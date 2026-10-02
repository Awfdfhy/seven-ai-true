# Memory Scope Hardening — Detailed Execution Specification

Date: 2026-10-02
Status: COMPLETE — merged to main via PR #22
Parent roadmap: ../SEVEN_POLISH_ROADMAP.md

## Objective

Prevent canonical memory from leaking across unrelated Seven contexts while keeping current user-global memories backward compatible.

The runtime must distinguish four practical memory domains:
- Global
- Room
- Project
- RPG

These domains are mapped onto canonical memory scope metadata and enforced before retrieval, relation expansion, evidence expansion, and model-context compilation.

## Compatibility

Existing canonical records with no explicit scope remain readable as legacy global/user memory. They are not rewritten automatically.

New normal `addMemory()` writes are explicit global/private user memories.

No destructive migration is performed.

## Canonical additions

Add optional `scopeRef` to memory records.

Examples:
- Global: `scope="user", scopeRef="global"`
- Room: `scope="conversation", scopeRef="<room id>"`
- Project: `scope="project", scopeRef="<project/workspace id>"`
- RPG: `scope="rpg", scopeRef="<world/room id>"`

Add `rpg` to the registered scope contract.

`scopeRef` is a non-empty string when present and is preserved through updates, ledgers, exports, imports, derived views, and context compilation.

## Scope context

A deterministic read-only scope context describes what the current request is allowed to retrieve:

- roomId
- projectId
- rpgId
- messageId
- allowGlobal
- allowLegacyGlobal
- allowShared
- allowSystem
- allowRestricted
- sharedRefs

Normal chat defaults:
- current room is available
- global/user memory is available
- legacy unscoped memory is treated as global for compatibility
- shared/system/restricted memory is not automatically exposed

Project/RPG IDs may be explicitly passed. When unavailable, scoped memories are excluded rather than guessed into another scope.

## Visibility rules

- unscoped legacy record → global only when `allowLegacyGlobal`
- user/global → available when `allowGlobal`
- conversation → exact `roomId === scopeRef`
- project → exact `projectId === scopeRef`
- rpg → exact `rpgId === scopeRef`
- message → exact `messageId === scopeRef`
- shared → only with explicit `allowShared` and matching shared ref when bound
- system → only with `allowSystem`
- restricted access → only with `allowRestricted`

Scope mismatch is exclusion, never deletion or conflict.

## New runtime helpers

- `normalizeMemoryScopeContext(input)`
- `getActiveMemoryScopeContext(options)`
- `isMemoryVisibleInScope(record, context)`
- `filterMemoriesByScopeContext(records, context)`
- `memoryDomainPolicy(domain, ref, options)`
- `addScopedMemory(content, domain, ref, options)`

Domains:
- global
- room
- project
- rpg

## Retrieval enforcement

Scope filtering must happen before:
- intent lexical checks
- lexical ranking
- event/entity/preference views
- relation expansion
- evidence expansion
- conflict annotations used in the request projection

`retrieveMemoryIntelligence()`, `reconstructMemoryContext()`, `buildMemoryContext()`, and `getUsableMemoryContext()` accept optional scope context.

The standard chat path passes the active room scope context.

Evidence or relation links cannot pull an out-of-scope record back into context.

## Context provenance

Compiled memory items additionally expose:
- scope
- scopeRef
- access

This is metadata for audit/debugging; it does not increase authority.

## Writing

`addMemory()` becomes explicit Global memory:
- scope=user
- scopeRef=global
- access=private

`addScopedMemory()` creates:
- Room: conversation/current or supplied room
- Project: project/supplied project ref
- RPG: rpg/supplied RPG ref

Duplicate detection is scope-aware so the same sentence may legitimately exist in two isolated scopes.

## Explicit sharing

Cross-scope visibility is never inferred.

A memory can be intentionally made shared only through an explicit scope/access update. No automatic promotion from room/project/RPG to global/shared.

## Tests

1. legacy unscoped memory remains visible as global
2. addMemory creates explicit global/private memory
3. room memory visible in its room and hidden in another
4. project memory visible only with matching project ref
5. RPG memory visible only with matching RPG ref
6. same content can exist in two isolated scopes
7. restricted memory excluded by default
8. out-of-scope relation cannot re-enter retrieval
9. out-of-scope evidence cannot re-enter reconstruction
10. standard chat path binds current room
11. scope metadata survives update/export validation
12. deletion still removes canonical record + ledger history remains consistent
13. action authorization still never comes from memory metadata
14. existing memory tests remain green

## Acceptance criteria

Complete only when:
- all normal model-memory retrieval is scope-filtered before ranking;
- no relation/evidence bypass exists in the request projection;
- legacy memory behavior remains compatible;
- new writes have explicit domain semantics;
- existing memory ledger/security behavior remains intact;
- full CI is green before merge.

## Completion record

- Implementation PR: #22
- Tested head SHA: `7f8f08371595743d951e6d80b9cb193d53ec1fa9`
- CI run: Seven AI tests #2143 — PASS
- Squash merge SHA: `44bbd88b9b1ce0c69a328d1d500b4e405c381589`
- Result: scoped retrieval, relation isolation, evidence isolation, legacy-global compatibility, and existing memory gates all passed before merge.

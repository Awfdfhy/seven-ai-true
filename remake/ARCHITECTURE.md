# Seven Remake V3 — Architecture Blueprint

## 1. Product architecture

Seven is rebuilt as five layers with strict dependency direction:

```
UI
↓
Application Services
↓
Domain/Core
↓
Ports / Contracts
↓
Adapters (Web, Android, Providers, Storage)
```

The UI never calls a provider, IndexedDB, Capacitor plugin or GitHub API directly.

## 2. Runtime ownership

### AppKernel
The single composition root. Creates services exactly once and owns boot/shutdown.

### TaskManager
The only owner of active AI/research/file/GitHub tasks.

Task state:
`idle → starting → running → cancelling → cancelled | succeeded | failed`

Each task has:
- immutable `taskId`
- `AbortController`
- deadline
- task type
- room/workspace ownership
- structured error/result

No UI code directly manipulates an AbortController.

### ShellStore
The single source of truth for:
- active workspace
- sidebar state
- dialog state
- locale/direction
- theme preference
- viewport/keyboard state

There is no second shell implementation.

### ThemeService
Exactly one scheduler. Reconciles on:
- preference change
- visibility/resume
- clock boundary

It owns exactly one timer generation at a time.

## 3. Chat domain

### Room
Persistent aggregate:
- roomId
- title
- messages
- model preference
- mode preference
- context settings
- createdAt / updatedAt
- schemaVersion

### Message
Immutable once committed. Streaming text lives in a transient draft until finalized.

This prevents half-written assistant messages from corrupting room history.

### Composer
One controller owns:
- text
- IME composition lock
- attachments
- send eligibility
- auto-grow measurement request

Enter-to-send is disabled while composition is active.

## 4. AI runtime

### ProviderAdapter contract
Every provider implements the same interface:
- listModels
- complete
- stream
- normalizeError
- capabilities

Provider payload shaping is isolated per adapter.

### ModelRouter
Pure decision engine. Given:
- requested mode
- user model preference
- available providers/models
- health/cooldown state
- context budget

returns an explicit route plan.

### Deep Think
Two-pass orchestration is a service, not a UI patch.

Invariant:
- exactly one leading system message after final context shaping
- final payload is revalidated before provider dispatch

### Cancellation
All provider calls receive the TaskManager signal.
Android/native operations use a bridge cancellation token mapped to the same taskId.

## 5. Persistence

### StorageEngine contract
Supports:
- transaction
- get/put/delete
- atomic migration
- integrity metadata
- export/import

Persistent domains:
- rooms
- memory
- settings
- provider health
- research cache
- RPG/canon
- GitHub connection metadata (never plaintext secrets)

### Migration protocol

`read old → validate → write new temp → verify → commit → delete old`

A failed migration must leave the previous version recoverable.

### Recovery
Boot never leaves the document globally inert.
Storage failure transitions the app into an interactive recovery screen.

## 6. Android

Capacitor is an adapter layer only.

JS/native communication uses typed request/response envelopes:

```ts
type BridgeRequest<T> = {
  requestId: string;
  method: string;
  payload: T;
};

type BridgeResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: BridgeError };
```

Contract tests run both:
- JS mock bridge tests
- Android instrumented round-trip tests

SAF URI grants, GitHub native operations and file access are lifecycle-managed services.

## 7. Research

Citation schema must include:
- canonical URL
- title
- snippet/evidence
- retrievedAt
- publishedAt when known
- contentHash
- source/provider metadata

Research synthesis cannot silently convert network failure into “no evidence”.

## 8. Attachments

Single-flight runtime loader.
One ingestion pipeline:
- size budget
- MIME + content sniff validation
- explicit parse errors
- task cancellation
- attachment persistence policy

No wrapper-patching of `sendMessage`.

## 9. GitHub Self-Dev

GitHub auth lives behind `GitHubAuthService`.
Token refresh is single-flight with expiry skew.
Concurrent callers share one refresh promise.

UI observes connection state; it never caches token truth independently.

## 10. RPG / Canon

RPG is a first-class persistent domain.

Canonical snapshot includes:
- pack identity/version
- world session
- canon session
- branches
- titles
- relationships/state
- revision/checksum

Snapshots returned to UI are immutable copies.

## 11. UI

React + TypeScript.

Rules:
- components render state and emit intents
- no direct DOM mutation except dedicated measurement/focus hooks
- no inline JS event handlers
- one composer sizing hook
- RTL is derived from locale at the shell root
- accessibility state is part of component contracts

## 12. Testing pyramid

### Unit
Pure domain/state/router/migration tests.

### Contract
Provider payloads, storage adapters, JS/native bridge schemas.

### Integration
Boot, send, stop, persistence, restart, recovery.

### Android instrumented
WebView bridge, SAF, process recreation, keyboard/IME.

### E2E
Critical user journeys.

## 13. Release gates

A build cannot be called release-ready until:

1. TypeScript strict compile passes.
2. Unit + contract + integration tests pass.
3. Android bridge tests pass.
4. Built APK payload hashes are recorded.
5. Installed APK payload identity is checked.
6. Installed APK smoke test passes.
7. No BLOCKER/CRITICAL regression is open.

## 14. Implementation order

### Foundation
Kernel, errors, events, task manager, storage contracts, tests.

### Vertical Slice 1
Rooms + composer + one mock/provider adapter + streaming + stop + persistence.

### Vertical Slice 2
Model routing + provider health/fallback.

### Vertical Slice 3
Memory + context.

### Vertical Slice 4
Attachments.

### Vertical Slice 5
Research + citations.

### Vertical Slice 6
Deep Think.

### Vertical Slice 7
Android native bridge.

### Vertical Slice 8
GitHub Self-Dev.

### Vertical Slice 9
RPG / Canon.

### Product Polish
Themes, RTL, accessibility, animation, performance.

The old Seven feature set is ported only after the equivalent new subsystem passes its contract suite.

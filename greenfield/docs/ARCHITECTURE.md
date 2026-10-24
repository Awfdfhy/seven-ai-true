# Architecture Boundaries

The concrete stack is intentionally undecided pending ADR-0001 and a proof-of-concept.

## Logical layers
- **Presentation:** screens, navigation, accessibility, localization, transient UI state. Must not own game rules.
- **Application orchestration:** coordinates player commands, AI requests, cancellation, save operations, and result presentation.
- **Domain engine:** deterministic rules, validation, state transitions, typed commands/events, event identity, idempotency, and player-agency enforcement.
- **Persistence:** versioned repositories, atomic writes, migration, backup/restore, corruption recovery, import/export validation.
- **AI runtime:** provider-neutral request/response contracts, streaming, timeout, cancellation, schema validation, error classification, and secure credential boundary.
- **Canon and memory:** provenance-aware facts, event history, character knowledge, beliefs, rumors, summaries, and retrieval permissions.
- **Platform adapters:** Android lifecycle, storage/document providers, network state, and platform-specific capabilities.

## Dependency direction
UI → application → domain contracts. Infrastructure implements contracts; domain rules must not depend on a specific UI framework or provider SDK. Model output is data from an untrusted boundary.

## Required invariants
1. No direct state mutation from generated prose.
2. A command is validated against current state/revision before events are committed.
3. Events have stable IDs; duplicate application is harmless.
4. Each world/campaign has a strict data boundary.
5. Persistence changes are versioned and recoverable.
6. Provider failure does not corrupt the current save.
7. UI can represent loading, empty, offline, error, cancelled, stale, and retry states.
8. Tests can run with a deterministic mock and no API key.

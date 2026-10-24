# Data Model Requirements

This document defines required concepts, not a final stack-specific schema.

- **World:** stable ID, schema version, display metadata, current revision, settings, timestamps.
- **PlayerCharacter:** stable ID, world ID, identity, player-controlled flag, validated attributes, progression, inventory reference, current location.
- **Scene:** stable ID, world ID, participants, location, scene state, revision.
- **Command:** unique command ID, world ID, actor ID, type, validated payload, base revision, timestamp.
- **DomainEvent:** unique event ID, command ID, world ID, event type, validated payload, rules version, resulting revision, provenance.
- **SaveSnapshot:** schema version, world ID, revision, state payload, integrity metadata, timestamp.
- **CanonFact:** fact ID, world ID, source event/reference, status, confidence/provenance, temporal scope.
- **CharacterKnowledge:** character ID, world ID, claim/reference, source, confidence, when learned, access scope.
- **Belief/Rumor:** character/group scope, claim, source, confidence, status, and update history.
- **NarrativeProposal:** provider/model metadata, response schema version, text, proposed events, validation outcome; never authoritative until validated.
- **ProviderConfig:** provider ID and non-secret configuration. Secret material must use an approved secure mechanism and never be serialized into world saves.

## Data rules
- All entities use stable IDs and explicit world/campaign ownership.
- Unknown schema versions fail safely; they must not be silently interpreted as current.
- Migrations are deterministic, tested, and preserve a recoverable pre-migration copy where feasible.
- Import is validated before replacement; enforce file-size limits and explicit confirmation for destructive replacement.
- Use atomic commit/save semantics and define recovery after interruption.
- Do not persist secrets or unnecessary personal data.

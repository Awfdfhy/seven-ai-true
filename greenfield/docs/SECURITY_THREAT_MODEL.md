# Security Threat Model

## Assets
World/campaign saves, character data, credentials, provider configuration, user exports, signing material, source repository, and release artifacts.

## Threats
Prompt injection through imported or retrieved text; malformed model output; unauthorized state proposals; cross-world memory leakage; malicious imports; path traversal; oversized payloads; credential leakage; dependency compromise; unsafe logs; accidental destructive migrations.

## Controls
- Treat model output and external/imported content as untrusted data, never executable instructions.
- Validate schemas, bounds, IDs, ownership, and allowed event types at every boundary.
- Enforce world and character access scope in retrieval and persistence.
- Validate imports before mutation, limit size, reject unknown dangerous structures, and require confirmation for replacement.
- Keep credentials out of source, client bundles, exports, and logs.
- Minimize telemetry and redact sensitive values.
- Pin/review dependencies where appropriate; scan secrets and licenses.
- Provide rollback/recovery for migrations and destructive operations.
- Never execute downloaded skills/scripts without review and explicit scope.

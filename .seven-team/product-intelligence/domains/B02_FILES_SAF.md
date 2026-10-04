# B02 — Attachments / Files / SAF

Status: ACTIVE KNOWLEDGE PACK

## Mission

Make file work predictable: choose, preview, process, remove, persist permission where allowed, and keep attachment identity bound to the correct task/room.

## Deep knowledge

MIME/type detection; size limits; processing states; Android document picker/SAF; URI grants; copy-vs-reference decisions; PDF/text extraction; cancellation; privacy; filename handling; duplicate files; import/export integrity; corrupted/unsupported input.

## Failure patterns

• phantom attachment after reopen.
• file belongs to wrong room.
• processing state disappears.
• extension trusted over content.
• huge file freezes UI.
• permission grant lost silently.
• export omits provenance/version metadata.

## Required tests

TXT/PDF; unsupported type; zero-byte; huge file; duplicate name; remove during processing; room switch; app restart; revoked permission; offline; malicious filename; Arabic filename; export/import roundtrip.

## Metrics

Pick→ready latency; parse failure; room-binding defects; grant survival; cancellation correctness; memory impact; unsupported-file error quality.

## References

Capacitor Filesystem, Android SAF/platform storage guidance, OWASP storage/privacy controls.

## Evidence

### Evidence hierarchy
1. Exact installed APK journey on Android.
2. Deterministic integration/E2E evidence.
3. Browser/runtime evidence tied to exact SHA.
4. Source inspection.
5. Agent inference.
6. Aesthetic opinion.

Every material claim should identify which level supports it. Missing evidence is UNPROVEN, not PASS.

## Quality

### Quality rule
Do not optimize for feature count. Optimize for a coherent user outcome. A change is incomplete when it works technically but creates duplicated controls, unexplained states, inconsistent visual language, fragile recovery, or a worse core chat experience.

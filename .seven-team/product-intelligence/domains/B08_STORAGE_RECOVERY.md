# B08 — Storage / Recovery

Status: ACTIVE KNOWLEDGE PACK

## Mission

Preserve committed user state through restart, migration, corruption and constrained storage.

## Deep knowledge

IndexedDB transactions; schema versioning; migrations; write-ahead/event ledgers where justified; checksums; atomicity; backup/export; corruption detection; storage quotas; localStorage preferences only; process death; destructive operation recovery.

## Failure patterns

• partial multi-store write.
• migration has no rollback/forward recovery.
• corrupted JSON silently resets user data.
• storage quota causes blank app.
• canonical large state kept in synchronous localStorage.
• import overwrites without version validation.

## Required tests

Fresh DB; upgrade from old schema; interrupted migration; quota failure; corrupt record; missing index; app kill during write; backup/restore; delete/undo where supported; multi-room consistency.

## Metrics

Restore fidelity; migration success; corruption detection; data-loss incidents (zero target); write latency; quota handling; recovery time.

## References

MDN IndexedDB and Web Storage; Android state-quality expectations; Seven persistence architecture.

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

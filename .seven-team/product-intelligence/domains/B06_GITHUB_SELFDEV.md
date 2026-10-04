# B06 — GitHub Self-Development

Status: ACTIVE KNOWLEDGE PACK

## Mission

Allow controlled repository improvement without letting model text become repository authority.

## Deep knowledge

Exact SHA; branch/worktree isolation; allowed paths; protected evaluators; diff inspection; commit/PR lifecycle; rollback; conflict handling; CI evidence; least privilege; idempotency; failure recovery; self-modification boundaries.

## Failure patterns

• agent commits directly to protected branch.
• tests changed to make candidate pass.
• ambiguous base SHA.
• simultaneous agents collide in same worktree.
• failed merge leaves repository dirty.
• secrets appear in model-visible git output.

## Required tests

Protected path attempt; conflicting candidates; failed gate rollback; stale base; branch absent; interrupted push; duplicate workflow dispatch; PR creation/update; exact SHA evidence.

## Metrics

Rejected unsafe mutation count; rollback success; conflict recovery; exact-SHA coverage; CI false-green rate; protected evaluator integrity.

## References

Seven Superloop contracts, OWASP least-privilege concepts, proof-carrying engineering rules.

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

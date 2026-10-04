# A07 — Security / Credentials

Status: ACTIVE KNOWLEDGE PACK

## Mission

Ensure secrets, privileges, repository mutation and native capabilities remain outside untrusted model authority.

## Deep knowledge

Threat modeling; least privilege; credential storage; secret redaction; OAuth/app identity; path policies; native bridge allowlists; tool scopes; logging policy; dependency risk; prompt injection boundaries; GitHub mutation controls; secure update paths; privacy minimization.

## Failure patterns

• tokens in repository, logs, prompts or screenshots.
• model text treated as authorization.
• broad file/system permission for convenience.
• debug logs shipped in release.
• fallback provider receives data outside intended policy.
• self-dev modifies evaluators or protected paths.

## Required tests

Secret scanning; malicious prompt/tool arguments; path traversal; protected-file mutation; log inspection; storage inspection; auth expiry; denied permission; replay/idempotency; dependency audit.

## Metrics

Secret exposure count (must be zero); policy bypass count; protected-path attempts; auth failure handling; high-risk dependency findings; privacy data surface.

## References

OWASP MASVS/MASTG, Android platform security guidance, OpenTelemetry privacy warnings for GenAI content.

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

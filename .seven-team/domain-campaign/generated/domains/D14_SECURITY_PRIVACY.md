# D14_SECURITY_PRIVACY — Security / Credentials / Privacy / Agent Boundaries

Research audit: READY

DOMAIN_ID=D14_SECURITY_PRIVACY

SOURCE_ANALYSIS=Core evidence: **OWASP MASVS** ([SOURCE primary] https://mas.owasp.org/MASVS/, foreword/frontispiece [SOURCE primary] https://mas.owasp.org/MASVS/01-Foreword/, [SOURCE primary] https://mas.owasp.org/MASVS/02-Frontispiece/) — mobile app security verification (data storage, cryptography, network, platform interaction, secure coding) — authoritative baseline for any Android path. **MCP specification 2026-07-28** ([SOURCE primary] https://modelcontextprotocol.io/specification/2026-07-28) — protocol-level security considerations relevant to agent/tool boundaries. **OTel gen-ai attributes** ([SOURCE primary] https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/) — telemetry semantics (safe attribute naming; must not leak secrets/PII). OWASP agentic guidance (D03 sources) also directly relevant: **Top 10 for Agentic Apps 2026**, **LLM06 Excessive Agency**, and 2026 updates ([SOURCE secondary] links) — emphasize agent boundaries, excessive agency, prompt injection, and access control. 

Disagreements/limits: MCP spec gives protocol guidance but not app-level secret storage policy. MASVS is mobile-focused (Android) — apply where relevant; web-only paths still need equivalent controls. OTel gen-ai attrs moved repo (noted) — follow current semconv; ensure no secret leakage in attributes. Harvested static assets noise. Evidence must be mapped to Seven’s concrete trust boundaries.

CURRENT=Seven focus: **secret non-leakage, auth, GitHub self-dev safety, path policy, trust boundaries** (per assignment). Inspected repo for auth, credentials, secrets, tokens, keys, keychain/secure store, trust boundaries. `remake/ARCHITECTURE.md` and `remake/MILESTONES.md` treated as truth. Scanning: `rg` for secret/credential/token/key/auth/secure.*store/keychain. Also cross-cutting: tools (D03) and files (D10) can be secret exfiltration vectors. Must confirm: where secrets live (env/secure store), who can access, logging redaction, GitHub self-dev safety (tokens never logged/committed), path policy integration (D10), least privilege, and proof-carrying posture via `.seven-team/autonomy/` contracts.

TARGET=Strong trust boundaries: **secrets never exposed** (no logging, no inclusion in tool results unless strictly necessary and redacted), **explicit secret stores** (OS keychain/secure store where mobile; env with strict handling; never plaintext in repo), **authN/Z** with least privilege, **capability-based access** (tools cannot access arbitrary secrets), **GitHub self-dev safety** (token/credential handling safe by default; detection/redaction), **path policy** enforced (secrets not written to temp in unsafe forms), **input validation/sanitization** at boundaries, **auditability** without leaking sensitive data, and **MASVS-aligned** controls where Android present. Preserve architecture; no weakening guards.

NOW=First slice: **secret inventory + trust boundary map**. Identify secret types, storage locations, access paths (who/what can read), logging points. Add **logging redaction** for known secret patterns and **test for secret non-leakage** (deterministic). Enforce “no secrets in logs” invariant; document evidence. Also confirm GitHub token handling safety (self-dev) — scan for potential logging/commit patterns.

NEXT=Harden: secure store abstraction (keychain/keystore) with clear interface, rotation/expiry hooks, auth flows with least privilege, tool permissioning (D03) to prevent secret access, file policy (D10) to prevent writing secrets, and **adversarial tests** (prompt injection leading to exfiltration) with safe fixtures. Map to MASVS controls if Android build exists.

LATER=Comprehensive redaction (structured logs), secret scanning in CI, proof-carrying assertions (autonomy contracts) for secret invariants, OTel attribute safety (gen-ai attrs must not contain secrets), periodic trust boundary review.

TESTS=Deterministic: redaction tests (patterns), secret non-leakage in logs/results, boundary access checks. Negative: attempt to log secret -> redacted or blocked. Adversarial: indirect exfiltration via tool outputs. Android: secure store tests if applicable. No weakening existing security policies.

RISKS=Secret leakage via logs/tool results (highest), over-broad access (excessive agency), accidental commit (GitHub self-dev), plaintext storage, path traversal writing secrets, insecure inter-process/bridge sharing. Weak redaction can miss variants. Cross-system (tools+files) creates combined exfiltration paths.

FIRST_SLICE=**Secret inventory + trust boundary map + logging redaction + non-leakage tests**. Explicitly map accessors, enforce redaction at logging boundary, add deterministic tests proving no secret appears in log/result outputs for safe fixtures.

KNOWN_UNKNOWNS=Concrete secret stores (env vars only? keychain? keystore? config files?). Auth implementation details. GitHub integration points (self-dev). Autonomy contracts naming specific security invariants. Whether Android present (MASVS applicability). Current logging implementation points (need to inspect). Evidence level: are redaction/log controls enforced or ad hoc?

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need concrete secret inventory, logging implementation, auth flows, and relevant autonomy contracts; harvested MASVS/MCP/OTel evidence is strong but Seven-specific enforcement unknown)

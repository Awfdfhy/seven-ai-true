# Seven Domain Roadmaps — cycle evidence

Ready domains: 6/30
Only READY domains may drive implementation.

# D01_CHAT_CORE — Chat / Rooms / Composer / Streaming

Research audit: INSUFFICIENT

DOMAIN_ID=D01_CHAT_CORE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D02_MEMORY_CONTEXT — Long-Term Memory / Context Fabric

Research audit: INSUFFICIENT

DOMAIN_ID=D02_MEMORY_CONTEXT
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D03_TOOLS_CAPABILITY — Tool System / Capability Graph / Permissions

Research audit: READY

DOMAIN_ID=D03_TOOLS_CAPABILITY

SOURCE_ANALYSIS=Harvested sources collectively point to **MCP tools surface** (2026-07-28 server/tools [SOURCE primary] https://modelcontextprotocol.io/specification/2026-07-28/server/tools), **MCP tasks extension** (draft tasks [SOURCE primary] https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks), **TS SDK alignment/migration** (v2, 2026-07-28 support [SOURCE primary] https://ts.sdk.modelcontextprotocol.io/v2/, [SOURCE primary] https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28). OpenAI guidance: **function calling** and **programmatic tool calling** ([SOURCE primary] https://developers.openai.com/api/docs/guides/function-calling, [SOURCE primary] https://developers.openai.com/api/docs/guides/tools-programmatic-tool-calling) emphasize schema discipline, explicit tool choice/control, and client-owned handoff semantics. Evaluations/benchmarks surface tool-use correctness/statefulness: **BFCL V4** ([SOURCE primary] https://gorilla.cs.berkeley.edu/leaderboard), **ToolSandbox** (stateful/conversational) ([SOURCE primary] https://arxiv.org/abs/2408.04682), **τ-bench** (tool-agent-user interaction) ([SOURCE primary] https://arxiv.org/abs/2406.12045). Agentic security evals: **AgentDojo** (prompt injection/defenses) ([SOURCE primary] https://arxiv.org/abs/2406.13352), **AgentDyn** (defense deployability in dynamic env) ([SOURCE primary] https://arxiv.org/abs/2602.03117), **adaptive OOB defenses** ([SOURCE primary] https://arxiv.org/abs/2606.26479). OWASP agentic guidance: **Top 10 for Agentic Apps 2026** ([SOURCE secondary] https://genai.owasp.org/resource/owasp-top-10-for-agentic-applications-for-2026/), **LLM06:2025 Excessive Agency** ([SOURCE secondary] https://genai.owasp.org/llmrisk/llm062025-excessive-agency/), and 2026 project updates ([SOURCE secondary] https://genai.owasp.org/2026/09/01/owasp-genai-security-project-unveils-2026-top-10-for-llm-applications-new-agent-control-standard-and-sponsors-as-community-tops-30000-members/). 

Disagreements/freshness/limits: MCP 2026-07-28 is current revision snapshot in harvested notes; tasks extension is draft (evolutionary). OpenAI docs reflect current programmatic tool calling semantics (separate from legacy). Benchmarks/evals are research artifacts (BFCL V4, ToolSandbox, τ-bench, AgentDojo, AgentDyn) — useful for regression harness ideas but not deployment policy alone. OWASP GenAI guidance is actively evolving (2026 Top10/agent control). Harvested static asset URLs (fonts/css) are noise; primary technical content is the spec/docs/evals. No single canonical “capability graph” spec dominates; need to map to Seven’s concrete implementation.

CURRENT=Seven current implementation inspected (repo state). Architecture (`remake/ARCHITECTURE.md`) and milestones (`remake/MILESTONES.md`) are treated as truth. Scanning codebase for tools/capability/permissions/MCP: located relevant modules (exact paths depend on repo layout; inspected via `rg`). Need to confirm: tool registry/definitions, capability graph (nodes/edges, owners), permissions model (least privilege, per-tool scopes), approval/escalation, tool execution sandbox/trust boundaries, tool result handling, and whether MCP is implemented/bridged. Evidence must distinguish browser/mock/Android/build/installed-device contexts (not assumed). Product Intelligence corpus (`.seven-team/product-intelligence/`) and autonomy contracts (`.seven-team/autonomy/`) inspected for relevant invariants.

TARGET=Desired state aligned with harvested evidence: **capability graph** with explicit owners (preserve existing owners; no duplicate owners per rules), **least-privilege permissions per tool** with clear scopes and escalation paths, **tool schema validation** (JSON Schema) and **tool choice/programmatic control** consistent with safe patterns, **deterministic tool execution** with auditability, **prompt injection resistance** at tool boundary (input/output validation, parameterization, allowlists), **excessive agency prevention** (capability scoping, human-in-loop for high-risk actions), and **testable harness** inspired by BFCL/τ-bench/AgentDojo where useful (adversarial cases). MCP alignment (2026-07-28 tools) where adopted, but Seven identity preserved (do not blindly port). Must satisfy trust boundaries: secrets never flow to untrusted tool outputs in unsafe forms; credentials never logged.

NOW=First high-value slice: **inventory tools + capability graph** (owners, capabilities, required permissions, risk class). Map to autonomy contracts. Add **schema validation** for all tool definitions/params and **allowlist-based execution**. Introduce **deterministic regression tests** for tool registry (ownership, no duplicates, required fields). This is concrete, reviewable, evidence-backed (MCP tool schema discipline, OWASP excessive agency, OpenAI programmatic control).

NEXT=Harden boundaries: parameter allowlists per capability, **result sanitization** (prevent tool outputs from contaminating privileged contexts), **approval policy** per risk class (escalation points), **capability-based access checks** at execution time (not just registration), and **adversarial tests** (prompt injection cases modeled after AgentDojo concepts) with deterministic fixtures.

LATER=Capability provenance (signed/attested tool manifests), tool execution telemetry (OTel gen-ai attrs per [SOURCE primary] https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/), richer eval harness (BFCL-style subsets for critical tools, τ-bench-like stateful flows) integrated into CI with guardrails, and periodic review of excessive agency (LLM06 mapping).

TESTS=Deterministic unit tests: tool registry validation (owners, duplicates, schema), permission checks, escalation policy. Integration: stateful flows with fixtures. Adversarial: prompt injection, indirect prompt injection via tool results, parameter abuse. Android/build: if tools touch device storage/permissions, Android-specific checks (align with MASVS concepts where relevant). Eval: small harness subset inspired by benchmarks (deterministic seeds). No weakening existing guards.

RISKS=Excessive agency if capabilities not tightly scoped (LLM06). Prompt injection via tool outputs (AgentDojo). Capability graph drift (duplicate owners) violating rules. MCP/tasks evolution (draft) causing API drift. Cross-system coupling (bridge/routing/kernel) increasing blast radius. Over-broad permissions; secrets leakage via tool results/logs. Performance impact if validation heavy. Android ergonomics if file/system tools exposed carelessly.

FIRST_SLICE=**Tool inventory + capability graph + schema validation**: enumerate all tools, record owner/risk/permissions, enforce no-duplicate-owners and schema validity at load time; add deterministic tests. Smallest change that makes the graph explicit and enforceable.

KNOWN_UNKNOWNS=Concrete paths to tool registry/capability graph in this repo (need to confirm exact files). Whether MCP is implemented or planned. Approval/escalation policy details. Which tools access secrets/filesystem. Evidence level for current enforcement (is it declarative or runtime-enforced?). May need to inspect `.seven-team/autonomy/contracts/` for specific invariants (names unknown until read).

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (awaiting concrete inventory of tools/capability graph and autonomy contract details from repo; harvested evidence is strong but Seven-specific enforcement points not yet fully mapped)


# D04_CODING_SYSTEM — Coding Agent / Repo Map / Edit-Test-Verify

Research audit: INSUFFICIENT

DOMAIN_ID=D04_CODING_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D05_SELF_DEVELOPMENT — Self-Development / Autonomous Software Evolution

Research audit: INSUFFICIENT

DOMAIN_ID=D05_SELF_DEVELOPMENT
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D06_RPG_WORLD — RPG / World Runtime / Canon / Dialogue / Agency

Research audit: INSUFFICIENT

DOMAIN_ID=D06_RPG_WORLD
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D07_RESEARCH_WEB — Web Research / Retrieval / Citations / Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D07_RESEARCH_WEB
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D08_MODEL_ROUTING — Model Routing / Provider Health / Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D08_MODEL_ROUTING
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D09_DEEP_THINK — Deep Think / Planning / Verification / Progress

Research audit: INSUFFICIENT

DOMAIN_ID=D09_DEEP_THINK
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D10_FILES_MULTIMODAL — Files / Attachments / PDFs / Multimodal

Research audit: READY

DOMAIN_ID=D10_FILES_MULTIMODAL

SOURCE_ANALYSIS=Harvested evidence: **Capacitor Filesystem API** ([SOURCE primary] https://capacitorjs.com/docs/apis/filesystem) — NodeJS-like file ops on device, clear API surface (read/write/mkdir/rm etc.) with platform nuances. **Android Storage Access Framework (SAF)** for shared/documents files ([SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files) and localized variant ([SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files?hl=ar) — emphasizes user-mediated access to shared storage, no blanket READ/WRITE_EXTERNAL_STORAGE where avoidable, privacy-preserving. **OWASP MASVS** ([SOURCE primary] https://mas.owasp.org/MASVS/) provides mobile app security verification requirements (data storage, platform interaction). 

Freshness/limits: Capacitor docs current snapshot; Android SAF guidance is stable but API surface evolves by Android version. MASVS is authoritative mobile baseline. Harvested static assets (favicon/css/manifest/opensearch) are noise. Need to map to Seven’s actual file/multimodal implementation (is it web-only, Capacitor/Android, or native bridge?). Distinguish browser evidence (web FS), mock evidence (tests), Android build evidence, installed-device evidence — critical for any filesystem claims.

CURRENT=Seven codebase inspected for files/multimodal: `rg` for filesystem, file read/write, storage, multimodal, pdf, attachments, media. Remake architecture (`remake/ARCHITECTURE.md`) defines subsystem boundaries/ownership; milestones (`remake/MILESTONES.md`) current state. Need to confirm: file I/O abstraction (path policy, sandbox roots), multimodal ingestion (images/PDFs/attachments), storage backends (local/cache/temp), Android-specific storage handling (SAF vs direct), bridge interfaces, and security constraints (path traversal prevention, symlink handling, size limits, type validation). Product Intelligence/knowledge packs may contain UI/product guidance (density/clarity etc.) if file UI involved — compare against Seven exact-build evidence only.

TARGET=Secure, least-privilege file/multimodal handling: **path policy** (canonicalize, enforce root allowlists, reject `..` traversal, symlink escapes), **sandboxed roots** (temp/cache/user-selected via SAF), **no global FS access**, **explicit permissions per operation**, **type/size limits**, **safe temp file lifecycle** (creation/cleanup), **multimodal validation** (MIME, magic bytes) before processing, **secrets never written to logs/paths in unsafe ways**, and **Android alignment** (prefer SAF for shared content; avoid broad external storage perms). Preserve identity; no pixel-copy of competitors. MASVS-aligned storage practices where mobile path exists.

NOW=First slice: **file I/O inventory + path policy enforcement**. Document allowed roots, operations, owners. Implement canonicalization + traversal guard. Add deterministic tests (path traversal attempts, symlink cases, root escapes). If Capacitor/Android present, test against appropriate context (mock/build) with evidence labels.

NEXT=Multimodal hardening: attachment validation, PDF parsing safety (if used), image handling bounds, upload limits, and **result sanitization**. Storage lifecycle (temp cleanup, quotas). Android SAF integration correctness (if applicable) — verify with build evidence, not assumptions. Cross-system: ensure tools (D03) cannot bypass path policy.

LATER=Secure download/upload flows, file access audit, telemetry (safe), and compatibility with D14 (secrets/credentials never in file paths/logs). Consider platform-specific test matrix (browser/mock/Android build/installed-device) with clear evidence labels.

TESTS=Deterministic: path policy (traversal, absolute/relative, symlinks), root allowlists, size/type limits, lifecycle. Adversarial: path injection, archive slip (if archives supported), oversized payloads. Android: SAF flows if implemented (build evidence). No weakening guards.

RISKS=Path traversal/symlink escapes (critical), accidental broad FS access, writing secrets to temp/logs, Android storage pitfalls (shared storage vs app-private), PDF/multimodal parser vulnerabilities, cross-tool bypass (if capability graph loose). Over-permissive roots.

FIRST_SLICE=**Path policy + sandboxed roots + traversal guards** with inventory. Enforce at file I/O boundary; deterministic regression tests. Smallest enforceable security improvement.

KNOWN_UNKNOWNS=Whether Capacitor/Android is used in this repo (Capacitor mentioned in harvested sources; need to confirm). File API surface (read/write/list/delete/mkdir). Multimodal types supported. Do tools (D03) invoke file I/O directly? Autonomy contracts for filesystem invariants.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need to confirm platform (web/Cordova/Capacitor/Android) and concrete file I/O implementations/roots; harvested Capacitor+SAF+MASVS evidence is applicable but Seven-specific paths unknown)


# D11_ANDROID_NATIVE — Android / APK / Lifecycle / IME / Back / Insets

Research audit: READY

DOMAIN_ID=D11_ANDROID_NATIVE
SOURCE_ANALYSIS=Harvested sources (core app quality, architecture recommendations, edge-to-edge, predictive back, Capacitor App/Keyboard) collectively stress: stable lifecycles (ViewModel/architecture recommendations), proper inset handling for edge-to-edge (system bars/cutouts), predictive back support aligned with Android guidelines, and plugin events for app state/keyboard. No major contradictions. Freshness: Android docs current (edge-to-edge, predictive back actively documented). Limitations: Capacitor docs are framework-specific (not Android platform internals); harvested list includes localized versions (ar/bn) but content is translations of same guidance. Some seed URLs are generic docs (manifest/opensearch) not substantive domain guidance. SOURCE_ANALYSIS evidence: [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality, [SOURCE primary] https://developer.android.com/topic/architecture/recommendations, [SOURCE primary] https://developer.android.com/design/ui/mobile/guides/layout-and-content/edge-to-edge, [SOURCE primary] https://developer.android.com/design/ui/mobile/guides/patterns/predictive-back, [SOURCE primary] https://capacitorjs.com/docs/apis/app, [SOURCE primary] https://capacitorjs.com/docs/apis/keyboard.

CURRENT=Seven hybrid (Capacitor) Android platform. Inspect `android/` (Android project files: `app/src/main/AndroidManifest.xml`, `app/src/main/res/values/styles.xml`, `app/build.gradle`, `MainActivity.*`), `capacitor.config.*`, app source. Need to confirm: edge-to-edge enabled? window insets handled? predictive back configured (Android 13+ `android:enableOnBackInvokedCallback`)? Capacitor App/Keyboard plugins registered/used? Lifecycle events (pause/resume, deeplinks) wired? IME handling (adjustResize/adjustPan, keyboard events). Distinguish: browser evidence (web layout/keyboard), mock evidence (dev only), Android build evidence (compiled APK/platform config), installed-device evidence (real device behavior). Current state must be verified by inspecting actual files (not assumed). EVIDENCE LEVEL: file inspection required.

TARGET=Capacitor Android meets Android quality guidelines for lifecycle stability, correct edge-to-edge inset handling (content draws under system bars without clipping critical UI), predictive back integrated where supported (with fallback), keyboard events handled without layout jumps, and app lifecycle/deeplinks behave correctly. Preserve architecture per `remake/ARCHITECTURE.md`. No duplicate owners for bridge/routing/kernel.

NOW=Smallest high-value slice: inspect Android platform config (AndroidManifest, styles/themes, build.gradle, MainActivity) and Capacitor usage (App/Keyboard). Verify edge-to-edge setup, predictive back flag, soft keyboard mode, and whether app handles insets. Produce evidence list (files inspected). Do not edit.

NEXT=Confirm lifecycle wiring (App plugin events, back navigation), IME behavior across forms, and inset consumption in web views (safe areas). Check target SDK/compile SDK alignment with predictive back requirements.

LATER=Device testing on API levels (edge cases: cutouts, gesture nav vs 3-button, IME overlap), automated checks where possible. Consider Android core app quality checklist against app.

TESTS=Deterministic: static checks on Android config (manifest flags, styles). E2E: navigation/back flows (with/without keyboard open). Android: build-time verification (assembleDebug) if available; lint checks. Adversarial: rapid rotate + keyboard open, IME transitions, back during transitions. Eval proof: document evidence level (Android build evidence vs installed-device). No weakening guards.

RISKS=Changing Android config affects all users (edge-to-edge can clip UI if insets not handled). Predictive back behavior varies by API; incorrect flag can break back. Keyboard handling can regress on some OEMs. Cross-system: Capacitor bridge changes impact shell/kernel owners — must not duplicate owners. Security: manifest changes minimal; no secrets. Performance: minimal. RTL: insets/gestures interact with RTL layouts (overlap with D13).

FIRST_SLICE=Inspect `android/app/src/main/AndroidManifest.xml`, `android/app/src/main/res/values/styles.xml`, `android/app/build.gradle`, `android/app/src/main/java/.../MainActivity.java` (or .kt), `capacitor.config.*`. Record: targetSdk/compileSdk, `android:windowSoftInputMode`, edge-to-edge related themes (e.g. `android:windowLayoutInDisplayCutoutMode`, `fitsSystemWindows`, `enableOnBackInvokedCallback`), and whether Capacitor plugins (App, Keyboard) used. Evidence: file paths + lines.

KNOWN_UNKNOWNS=Installed-device evidence for predictive back/gestures, IME behavior on physical devices, and actual inset consumption in web CSS (safe-area-inset-*) — browser mock insufficient. Need Android build evidence (assembleDebug) and installed-device evidence to claim correctness. Also confirm API level support.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need concrete file inspection results + Android build/installed-device evidence). Current repo inspection incomplete until specific files read.


# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: INSUFFICIENT

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: READY

DOMAIN_ID=D13_ARABIC_RTL_A11Y
SOURCE_ANALYSIS=Harvested WCAG 2.x overview, Android localization guide, Android accessibility guide. Collectively: WCAG defines accessible content (perceivable, operable, understandable, robust); Android localization requires default+alternative resources and RTL support (`supportsRtl`, `ldrtl` layouts, `start/end`); accessibility requires semantics (content descriptions, focus order, touch targets, readable text, reduced motion). No contradictions. Limitations: WCAG is web-focused; Android a11y adds platform specifics. Harvested includes localized (ar) Android docs — useful for Arabic context. Some seed URLs generic (favicons, css, feed, manifest, opensearch) not domain-specific. SOURCE_ANALYSIS evidence: [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/, [SOURCE primary] https://developer.android.com/guide/topics/resources/localization, [SOURCE primary] https://developer.android.com/guide/topics/ui/accessibility, [SOURCE primary] https://developer.android.com/guide/topics/resources/localization?hl=ar, [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality?hl=ar.

CURRENT=Seven app may support i18n; need to confirm Arabic locale resources (`values-ar`, `strings.xml` in ar), RTL layout support (`android:supportsRtl="true"`, `layout-ldrtl/`), web-side RTL (html `dir="rtl"`, CSS `direction:rtl`, logical properties). A11y: check content descriptions, focus management, semantic elements, touch target sizes, color contrast considerations, reduced motion support. Distinguish browser evidence (web a11y/RTL in browser), mock evidence, Android build evidence (TalkBack on APK), installed-device evidence (real TalkBack). Product intelligence requires comparing against hierarchy/density/clarity/discoverability/feedback/response readability/motion/Android ergonomics/cohesion; aesthetic claims without runtime evidence weak.

TARGET=Arabic content correct (bidi, numerals, diacritics), RTL layouts functional (mirroring, proper alignment with start/end), meets reasonable a11y bar aligned with WCAG/Android a11y guidance. Preserve identity (don’t pixel-for-pixel imitate). Motion respects reduced motion. Focus order logical. Critical images have content descriptions; decorative marked appropriately.

NOW=Smallest slice: inspect localization (`locales/`, `i18n/`, `translations/`, Android `res/values*/strings.xml`), RTL config (`android:supportsRtl`, html dir, CSS), a11y attributes in UI. Evidence files inspected.

NEXT=Check bidi handling (dir attributes, unicode-bidi), text alignment, list/item mirroring, form fields (IME in RTL), icon mirroring needs, a11y focus/labels for Arabic strings.

LATER=TalkBack testing on Arabic locale (installed-device evidence), reduced motion verification, contrast checks, keyboard navigation in RTL.

TESTS=Deterministic: static checks (supportsRtl true if ar supported, dir set appropriately). E2E: RTL navigation, focus order. Android: a11y lint, build verification. Adversarial: mixed LTR/RTL content (numbers, URLs, emails, parentheses), long Arabic strings, nested bidi. Eval: distinguish mock vs Android build vs installed-device evidence.

RISKS=Incorrect bidi can garble text (security/readability). Missing RTL mirroring breaks layouts. Over/under-describing content for TalkBack. Reduced motion must not remove critical feedback. Cross-system: a11y touches UI across screens; ownership boundaries preserved.

FIRST_SLICE=Inspect: `android/app/src/main/AndroidManifest.xml` (`supportsRtl`), `android/app/src/main/res/values*/strings.xml` (presence of ar), web i18n files (`locales/ar/*`, `i18n/*`), UI templates/components for `dir`, `aria-*`, `lang="ar"`. Record file paths.

KNOWN_UNKNOWNS=Installed-device TalkBack behavior with Arabic, actual screen reader output semantics, device font rendering for Arabic, and motion preferences on device. Browser devtools insufficient alone for Android a11y. Need installed-device evidence to validate release blockers.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (pending concrete inspection of locale/RTL/a11y assets and runtime evidence).


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


# D15_PERSISTENCE_RECOVERY — Persistence / Migration / Corruption / Recovery

Research audit: INSUFFICIENT

DOMAIN_ID=D15_PERSISTENCE_RECOVERY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D16_NETWORK_RESILIENCE — Network / Retry / Offline / Streaming Resilience

Research audit: INSUFFICIENT

DOMAIN_ID=D16_NETWORK_RESILIENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D17_PERFORMANCE_CONCURRENCY — Performance / Concurrency / Long Chat / Races

Research audit: INSUFFICIENT

DOMAIN_ID=D17_PERFORMANCE_CONCURRENCY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D18_TESTING_EVALS — Testing / Evals / Mutation / Visual / Release Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D18_TESTING_EVALS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D19_AGENT_ORCHESTRATION — Multi-Agent Team / Manager / Strike Teams / Calibration

Research audit: INSUFFICIENT

DOMAIN_ID=D19_AGENT_ORCHESTRATION
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: INSUFFICIENT

DOMAIN_ID=D20_PRODUCT_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D21_OBSERVABILITY_WORLD_MODEL — Observability / Engineering World Model / Blast Radius

Research audit: INSUFFICIENT

DOMAIN_ID=D21_OBSERVABILITY_WORLD_MODEL
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D22_PROTOCOLS_INTEROP — MCP / Agent Protocols / Tool Interoperability

Research audit: INSUFFICIENT

DOMAIN_ID=D22_PROTOCOLS_INTEROP
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D23_IMPORT_EXPORT_BACKUP — Import / Export / Backup / Data Portability

Research audit: READY

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP

SOURCE_ANALYSIS=Harvested primary sources: (1) Android SAF shared storage (user-driven export/import of documents/files, create/open without broad permissions) [SOURCE primary] https://developer.android.com/training/data-storage/shared/documents-files (localized variants present); (2) MDN IndexedDB API (client-side structured storage, large amounts, indexes; main landing) [SOURCE primary] https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API. Disagreements: none obvious. Freshness reasonable. Limitations: harvest notes high-level; no concrete backup/export format, encryption, versioning, size limits, or Android backup constraints. MDN is web API (IndexedDB) — relevance depends on whether Seven uses web/Capacitor+IndexedDB vs native.

CURRENT=Seven current implementation and evidence: import/export/backup not fully enumerated. Quick scans show `import|export|backup` references; IndexedDB/Capacitor signals also present. Milestones/architecture under `remake/` are truth. No concrete export format, backup location (SAF vs app private), encryption, or data portability scope identified yet. Need to inspect code paths (export/import UI/actions, storage layer, backup triggers) and tests. No evidence levels assigned; treat unverified.

TARGET=Desired architecture/product behavior: user-consented import/export/backup with clear scope (what data included), portable formats, SAF-driven document creation for exports, safe import validation, and privacy/security (encryption at rest/in transit considerations as applicable). Align with Android ergonomics and PI rubric. Preserve ownership (B02/B08) and don’t weaken guards. Cross-cut with D10 (attachments/files in exports).

NOW=First high-value implementation slice: evidence-grounded inventory of current import/export/backup surface (actions, formats, storage backends including IndexedDB usage, export destinations). Confirm SAF createDocument for exports, import validation, and any existing backup policy. RESEARCH only.

NEXT=Next improvements: explicit export schemas (versioned), import validators (schema/version/size), deterministic roundtrip tests, error taxonomy, and Android SAF grants for exports. Consider data portability completeness.

LATER=Longer-term ideas: automated backups with user control, incremental exports, but only evidence-backed; avoid breaking changes to stored data. Don’t assume cloud backup unless justified.

TESTS=Deterministic, E2E, Android, adversarial and eval proof: unit tests for schema/version/validation; integration for SAF create/open flows; E2E import→export roundtrip; adversarial (malformed imports, large datasets, path/URI attacks); regression covering backup/import/export. Must state invariants touched.

RISKS=Security/privacy/performance/Android/RTL/cross-system risks: data leakage via exports (PII), unsafe import of untrusted data, IndexedDB quota/perf, SAF URI lifecycle, scoped storage, cross-system ownership (B08 boundary), RTL in filenames, no secret exposure.

FIRST_SLICE=Smallest implementation that materially improves the domain: document current import/export/backup code paths + IndexedDB/SAF usage + export formats in evidence form (files inspected, symbols). Propose versioned export schema skeleton and validation contract with test stubs — RESEARCH only.

KNOWN_UNKNOWNS=Missing evidence: export/import implementations (locations, formats), backup triggers/policy, IndexedDB schema/tables, SAF createDocument usage for exports, encryption, size/quota handling, tests, B02/B08 ownership split, installed-device behavior.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (need concrete code inspection of import/export/backup + IndexedDB usage and SAF flows). Harvested sources useful but not sufficient to ground CURRENT.


# D24_RELEASE_APK — Release / APK Identity / Signing / Installed Evidence

Research audit: INSUFFICIENT

DOMAIN_ID=D24_RELEASE_APK
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D25_HISTORY_ROOMS — Conversation History / Room Lifecycle / Search / Archive

Research audit: INSUFFICIENT

DOMAIN_ID=D25_HISTORY_ROOMS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D26_SETTINGS_CONTROLS — Settings / Model Controls / Progressive Disclosure

Research audit: INSUFFICIENT

DOMAIN_ID=D26_SETTINGS_CONTROLS
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D27_ERROR_RECOVERY_UX — Errors / Loading / Empty / Recovery UX

Research audit: INSUFFICIENT

DOMAIN_ID=D27_ERROR_RECOVERY_UX
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D28_LOCAL_INTELLIGENCE — Local Intelligence / Embeddings / Reranking / Offline Fallback

Research audit: INSUFFICIENT

DOMAIN_ID=D28_LOCAL_INTELLIGENCE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D29_REAL_WORKS_CANON — Real Works / Source Fidelity / Canon Branching

Research audit: INSUFFICIENT

DOMAIN_ID=D29_REAL_WORKS_CANON
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D30_AUTONOMOUS_QUALITY — Reality Lab / Evolution Arena / Constitution / Proof / Meta-Team

Research audit: INSUFFICIENT

DOMAIN_ID=D30_AUTONOMOUS_QUALITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.

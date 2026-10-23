# Seven Domain Roadmaps — cycle evidence

Ready domains: 4/30
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

Research audit: INSUFFICIENT

DOMAIN_ID=D03_TOOLS_CAPABILITY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


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

Research audit: INSUFFICIENT

DOMAIN_ID=D10_FILES_MULTIMODAL
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D11_ANDROID_NATIVE — Android / APK / Lifecycle / IME / Back / Insets

Research audit: INSUFFICIENT

DOMAIN_ID=D11_ANDROID_NATIVE
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: READY

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
SOURCE_ANALYSIS=Sources converge on (a) Android Core App Quality guidelines as the release bar for install/retention success, (b) WCAG 2.x as international accessibility baseline, and (c) Playwright visual comparisons for executable golden-screen regression. Harvested evidence is metadata-heavy; page bodies are thin but consistent. Limitation: no exact-build screenshot or Android installed-artifact evidence; Playwright snapshot configs were not found in repo. [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality ; [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ ; [SOURCE secondary] https://playwright.dev/docs/test-snapshots
CURRENT=Seven ships a large CSS-driven visual system in release/workspaces/seven-shell.css, seven-shell-final.css, rtl.css, ui-polish-fixes.css, hub.css. Evidence shows RTL-aware rules (dir="rtl" border-radius variants, logical properties), responsive breakpoints (820/620/380px), reduced-motion global override, and safe-area handling. rtl.css is only 1 line of actual CSS (file is 1 line but contains multiple rules). Missing: no Playwright/test snapshot config detected, no golden-screen harness, no browser evidence. Exact-build visual quality remains UNPROVEN.
TARGET=One premium, cohesive visual system with (1) executable golden-screen snapshots across themes/RTL/breakpoints, (2) Android exact-build screenshot matrix, (3) documented focus states, (4) reduced-motion compliance, (5) no horizontal overflow at 380px.
NOW=Add a minimal Playwright visual regression scaffold (config + 3 golden screens: chat, settings, workspace) capturing desktop/tablet/mobile and RTL. Wire to CI triage matrix. Document unproven items explicitly.
NEXT=Android installed-artifact screenshot gate; theme token audit; motion budget verification; accessibility focus-ring audit against WCAG 2.2.
LATER=Visual north-star stewardship: component library consolidation, design-token single source, animation budget, premium polish pass.
TESTS=Playwright test-snapshots for chat/settings/workspace at 3 breakpoints x 2 directions; Android emulator screenshot diff; reduced-motion check; axe/WCAG automated scan; horizontal-overflow assertion.
RISKS=CSS specificity wars (!important heavy), multiple shell variants (seven-shell vs seven-shell-final) risk divergence, RTL rules scattered; no single owner enforcement. Performance: backdrop-filter may degrade on low-end Android.
FIRST_SLICE=Playwright config + 3 golden screens + CI artifact upload; mark visual quality UNPROVEN until run.
KNOWN_UNKNOWNS=No browser regression PASS; no Android exact-build evidence; no live provider; no visual premium claim.
DOMAIN_VERDICT=READY_FOR_PLAN


# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: READY

DOMAIN_ID=D13_ARABIC_RTL_A11Y
SOURCE_ANALYSIS=Sources agree: WCAG 2.0/2.1/2.2 international baseline; Android localization best practices (default + alternative resources); Android accessibility (TalkBack, content descriptions). Harvested evidence is metadata-only; localization/accessibility body pages not captured. [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ ; [SOURCE primary] https://developer.android.com/guide/topics/resources/localization ; [SOURCE primary] https://developer.android.com/guide/topics/ui/accessibility
CURRENT=Seven has RTL CSS rules using logical properties and dir="rtl" overrides; rtl.css contains bidirectional isolation rules (unicode-bidi:isolate/plaintext). Arabic localization present for Android core quality page but app-level Arabic parity unknown. No evidence of TalkBack/content-description coverage or bidi string handling.
TARGET=Full Arabic/RTL parity: logical properties everywhere, bidi isolation for code/numbers, WCAG 2.2 AA, TalkBack labels, no mixed-language critical labels.
NOW=Audit all critical labels (chat, settings, composer, workspace) for Arabic parity; document missing translations; add bidi isolation to code blocks and numeric outputs.
NEXT=TalkBack content-description pass; focus order verification in RTL; keyboard navigation; screen-reader announcements for streaming.
LATER=Full i18n framework with pluralization, Arabic numeral handling, RTL icon mirroring.
TESTS=Bidi golden screenshots; axe with rtl locale; manual TalkBack checklist (documented, not yet runnable); string parity test.
RISKS=Partial translation causing mixed-language UI; code blocks breaking bidi; number formatting; icon direction.
FIRST_SLICE=String parity audit + bidi isolation rules + documented gaps.
KNOWN_UNKNOWNS=No Arabic exact-build evidence; no TalkBack test; no RTL browser regression.
DOMAIN_VERDICT=READY_FOR_PLAN


# D14_SECURITY_PRIVACY — Security / Credentials / Privacy / Agent Boundaries

Research audit: INSUFFICIENT

DOMAIN_ID=D14_SECURITY_PRIVACY
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


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

Research audit: READY

DOMAIN_ID=D20_PRODUCT_QUALITY
SOURCE_ANALYSIS=Sources converge on Android Core App Quality as long-term success driver and WCAG as accessibility baseline; Playwright visual comparisons as executable evidence. Harvested evidence is thin (metadata). Product quality is a composite requiring browser/Android/exact-build evidence, all currently UNPROVEN. [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality ; [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ ; [SOURCE secondary] https://playwright.dev/docs/test-snapshots
CURRENT=Seven has extensive CSS polish and multiple shell variants. Product quality claims are currently UNPROVEN: no browser regression PASS, no Android installed-artifact, no exact-build visual evidence, no live provider integration. Quality debt preserved as learning evidence per constitution.
TARGET=Premium AI chat product judged by rubric: hierarchy, density, clarity, discoverability, feedback, response readability, motion, Android ergonomics, cohesion. Exact-build visual evidence required for any premium claim.
NOW=Define golden-screen evaluation rubric with hard-fail list; create synthetic-user journey scripts (chat, settings, workspace, RPG) for browser harness; classify failures.
NEXT=Execute browser harness; capture screenshots; triage; fix root causes; Android emulator gate.
LATER=Synthetic user personas, UX judge automation, continuous visual regression in CI.
TESTS=Golden-screen rubric scoring; browser journey scripts; Android screenshot matrix; flake classification.
RISKS=Feature count mistaken for quality; visual claims without evidence; hard fails averaged away (forbidden). Must keep hard fails blocking.
FIRST_SLICE=Rubric + journey scripts + failure classification; no production edits this cycle.
KNOWN_UNKNOWNS=All exact-build visual evidence; all Android evidence; all browser regression.
DOMAIN_VERDICT=READY_FOR_PLAN


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

Research audit: INSUFFICIENT

DOMAIN_ID=D23_IMPORT_EXPORT_BACKUP
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT
CURRENT=No trustworthy plan block was produced in this cycle.
KNOWN_UNKNOWNS=Research agent output missing or timed out.


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

Research audit: READY

DOMAIN_ID=D26_SETTINGS_CONTROLS
SOURCE_ANALYSIS=Sources: Android Core App Quality (release bar) and ChatGPT release notes (reference for model controls UX). Harvested evidence is metadata-only; no detailed controls spec captured. [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality ; [SOURCE primary] https://help.openai.com/en/articles/6825453-chatgpt-release-notes
CURRENT=Settings/model controls exist in CSS (seven-shell-model-chip, mode menus). Progressive disclosure present via menus. No evidence of deterministic timeout/cancellation behavior or dead-request handling. A05 owns runtime/model controls; A01 owns UI surface.
TARGET=Settings/model controls with progressive disclosure, deterministic timeout/cancellation, no dead requests, clear status indicators, accessible focus states.
NOW=Audit settings surface for control density, disclosure patterns, and status feedback; document gaps; coordinate with A05 runtime.
NEXT=Add deterministic timeout/cancellation evidence; unload warnings; stale-tab behavior; durable status indicator.
LATER=Advanced controls behind progressive disclosure; per-model capability display; approval binding for high-impact actions.
TESTS=Settings golden screen; cancellation tests; stale-tab behavior; accessibility focus; model routing smoke.
RISKS=Duplicate control surfaces; runtime/store duplication; security: no sensitive action without real grant; credential exposure.
FIRST_SLICE=Settings surface audit + gap list + coordination with A05; no production edits.
KNOWN_UNKNOWNS=No runtime timeout evidence; no browser regression; no Android settings evidence.
DOMAIN_VERDICT=READY_FOR_PLAN


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

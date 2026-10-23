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
SOURCE_ANALYSIS=Harvested [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality emphasizes core app quality (install/reviews/engagement/retention), touch targets/visibility, orientation, performance, accessibility. [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ points to WCAG 2.x as the accessibility baseline. [SOURCE secondary] https://playwright.dev/docs/test-snapshots provides visual regression approach (snapshots/comparisons) but requires stable baselines and tolerance. Android localized variants (ar/bn) exist in harvest confirming i18n coverage of quality guidance. Limitation: harvested pages are mostly index/metadata; no Seven-specific visual benchmarks captured. Freshness: Android/WCAG/Playwright are current guidance. 
CURRENT=Inspected remake/: Vite app (index.html, vite.config.ts, package.json). Entry: remake/src/main.tsx. Styles: remixicon.css, index.css present. UI structure: remake/src/App.tsx exists. Theme/state: ThemeContext.tsx present. Components: many under remake/src/components/ (AttachmentButton.tsx, AttachmentChip.tsx, AudioPlayer.tsx, CodeBlock.tsx, DeepThink.tsx, FeedbackModal.tsx, FilePreview.tsx, ImagePreview.tsx, MediaViewer.tsx, MessageBubble.tsx, ModelSelector.tsx, SettingsModal.tsx, Sidebar.tsx, TerminalBlock.tsx, ThinkingBlock.tsx, ThoughtIndicator.tsx, TypingIndicator.tsx, UpgradeModal.tsx, UserAvatar.tsx, WelcomeScreen.tsx). Layout/shell: Sidebar.tsx + App.tsx likely form shell. Responsive: media queries implied by component CSS but not fully visible. Motion: animations present via CSS/classes? No explicit motion tokens file seen. Design tokens: likely in index.css or component styles. Product polish: remake/PHASE10_PRODUCT_POLISH.md exists (focus on product polish). Architecture: remake/ARCHITECTURE.md present. Tests: remake/src has .vitest and tests exist elsewhere? Evidence: components exist, theme context exists, polish phase doc exists. Gaps: no explicit design tokens file (e.g. tokens.css/variables.json) found; no visual regression harness config visible in remake root; no snapshot baselines referenced. 
TARGET=Single source of truth for design tokens (color/typography/spacing/radius/elevation/motion). Consistent shell layout with responsive breakpoints. Subtle, purposeful motion respecting prefers-reduced-motion. Theme system coherent across components. Visual regression coverage (Playwright snapshots) against stable baselines. Alignment with Android core app quality (touch targets, visibility, orientation). 
NOW=Inventory tokens: extract CSS variables from index.css and component styles into a canonical token map (remake/src/styles/tokens.css or in ThemeContext). Audit touch targets (min 44x44) on interactive elements (AttachmentButton, ModelSelector, Sidebar toggles). Add prefers-reduced-motion guard to animations. Add basic snapshot test scaffolding (Playwright) for key screens (Welcome, chat thread, sidebar). 
NEXT=Component audit for spacing consistency, unify radius/elevation, improve focus states for keyboard accessibility, add layout grid utilities, harden responsive breakpoints (mobile/tablet/desktop), document component API in a lightweight style guide. 
LATER=Motion system with durations/easing tokens, dark/light theme polish, density modes, visual regression CI integration, icon system standardization, design lint (style-dictionary or simple token checks). 
TESTS=Deterministic: unit tests for ThemeContext. E2E: Playwright visual snapshots for WelcomeScreen, MessageBubble thread, Sidebar open/closed. Android: check layout on small screens/orientation per Android core app quality. Adversarial: reduced motion, high contrast, long messages, small viewports. Eval: compare against rubric (hierarchy/density/clarity). 
RISKS=Token fragmentation (CSS scattered) causing drift. Motion without reduced-motion hurts accessibility. Visual regressions hard to catch without baselines. Over-polish without Android evidence. Theme changes may affect RPG/components. 
FIRST_SLICE=Create canonical tokens file, migrate 3-5 core variables, enforce prefers-reduced-motion in global styles, add min touch target utility, and add a simple Playwright snapshot test for WelcomeScreen. 
KNOWN_UNKNOWNS=No existing visual baselines. No design tokens source of truth. No explicit motion tokens. Exact Android build visual evidence missing (UNPROVEN). Component CSS coverage incomplete. 
DOMAIN_VERDICT=READY_FOR_PLAN


# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: READY

DOMAIN_ID=D13_ARABIC_RTL_A11Y
SOURCE_ANALYSIS=Harvested [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ (WCAG 2.x). [SOURCE primary] https://developer.android.com/guide/topics/resources/localization (localization best practices). [SOURCE primary] https://developer.android.com/guide/topics/ui/accessibility (accessible apps). Localized variants present (ar/bn). Sources emphasize text direction, resource qualifiers, accessibility services, focus/order. Limitation: no Seven RTL audit found in harvested data; need repo evidence.
CURRENT=Grep for RTL/dir/lang/ar: found no matches in remake/src (searched). No i18n framework evident (no i18next/react-intl). No dir attributes, no logical properties usage obvious. Arabic/Bengali localized Android docs referenced but app code has no RTL handling. Accessibility: aria attributes rare? Grepped aria- found none. No focus management visible. Settings/controls not audited yet. 
TARGET=RTL support for Arabic (and general RTL) via dir="rtl" or CSS logical properties (margin-inline/start/end), text alignment. Bidi awareness. i18n structure for future languages. WCAG-aligned accessibility: keyboard nav, focus visible, ARIA where needed, color contrast, touch targets. Android localization via resources if native, but web shell needs RTL. 
NOW=Add RTL detection (lang/dir) and CSS logical properties migration plan. Audit layout for physical properties (margin-left/right, padding-left/right, left/right) and replace with logical. Add dir attribute support in App/shell. Check text inputs, code blocks, message bubbles for RTL. Add basic a11y checks: focus states, alt text, button labels. 
NEXT=Implement RTL stylesheet with logical properties, test Arabic text rendering, ensure icons/images don't break, fix bidi edge cases (numbers, URLs), add lang attribute, improve keyboard navigation, add skip links. 
LATER=Full i18n framework, pluralization, RTL-specific components, screen reader testing, WCAG 2.2 audit, automated a11y tests (axe). 
TESTS=Deterministic: CSS lint for physical properties. E2E: Arabic text in message bubble, RTL layout. A11y: keyboard tab order, focus visible, screen reader labels. Android: RTL layout per localization guide. Adversarial: mixed LTR/RTL, long Arabic text, code blocks in RTL. 
RISKS=Major layout breakage if physical properties used everywhere. Code blocks/monospace need LTR direction. Icons may need mirroring. No existing RTL support = large surface area. Arabic parity required per Memory v2 notes but UI RTL separate. 
FIRST_SLICE=Audit all CSS for physical left/right/margin/padding and create migration list; add dir support in App.tsx; add CSS logical properties for top-level layout (Sidebar, main content); test with lang="ar" and dir="rtl". 
KNOWN_UNKNOWNS=Full CSS inventory not done yet. No a11y baseline. No RTL test data. Screen reader behavior unknown. 
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
SOURCE_ANALYSIS=Harvested [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality (core quality). [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ (accessibility). [SOURCE secondary] https://playwright.dev/docs/test-snapshots (visual testing). Emphasizes user reviews/engagement/retention, quality tests, accessibility. Manager notes require using product-intelligence rubric/catalog/boards; missing exact-build visual evidence = UNPROVEN. 
CURRENT=Product polish phase exists (PHASE10_PRODUCT_POLISH.md). Components polished (modals, indicators, code blocks). Theme context exists. Cohesion: architecture docs exist. Product intelligence corpus referenced in system prompt (.seven-team/product-intelligence/*) but not inspected yet (need to read). Visual boards mentioned. No explicit judge protocol run visible. 
TARGET=Premium cohesive feel. Hierarchy, density, clarity, discoverability, feedback, response readability, motion, Android ergonomics, cohesion. Hard fails block premium. Visual quality UNPROVEN without exact-build evidence. No pixel-copy of competitors. 
NOW=Read product-intelligence index/rubric/catalog/judge protocol and visual boards. Map Seven UI against rubric dimensions. Create quality checklist with evidence requirements (screenshots/runtime). Identify cohesion gaps (spacing, typography scale, feedback states). 
NEXT=Run synthetic user journey review (start chat, attach file, use model selector, deep think, feedback). Check error states, empty states, loading states. Add quality gates to tests. 
LATER=Automated rubric scoring, visual regression baselines, Android device testing, UX judge integration. 
TESTS=Deterministic: component tests. E2E: critical journeys. Visual: snapshots. Android: ergonomics. Adversarial: slow network, errors. Eval: rubric scoring with evidence. 
RISKS=Quality claims without evidence. Hard fails missed. Over-polish breaking ownership. Visual boards may show gaps. 
FIRST_SLICE=Read .seven-team/product-intelligence/README.md, PRODUCT_QUALITY_RUBRIC.json, VISUAL_REFERENCE_CATALOG.json, JUDGE_PROTOCOL.md, and visual boards. Produce rubric gap analysis with concrete file references and evidence needs. 
KNOWN_UNKNOWNS=Product intelligence files not read yet. Visual boards location unknown. No judge runs. Exact-build screenshots missing. 
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
SOURCE_ANALYSIS=Harvested [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality (settings/accessibility/ergonomics). No dedicated settings docs in harvest; relies on Android quality guidelines. Sources emphasize discoverability, progressive disclosure, touch targets. 
CURRENT=SettingsModal.tsx exists. ModelSelector.tsx exists. ThemeContext exists. UpgradeModal.tsx exists. Grepped settings/model/reasoning: found ModelSelector and SettingsModal. Need to inspect implementation. 
TARGET=Clear settings hierarchy, progressive disclosure, model controls discoverable, reasoning/deep think controls obvious, safe defaults, keyboard accessible, mobile-friendly. 
NOW=Inspect SettingsModal.tsx and ModelSelector.tsx. Map control surface (theme, model, reasoning, etc.). Check discoverability, grouping, labels. Audit touch targets. 
NEXT=Improve grouping, add descriptions, progressive disclosure for advanced, consistent styling, keyboard nav. 
LATER=Settings search, presets, sync, better model metadata. 
TESTS=Deterministic: component tests. E2E: open settings, change model, persist. A11y: keyboard. Android: ergonomics. 
RISKS=Control bloat, confusing model selection, settings hidden. 
FIRST_SLICE=Read SettingsModal.tsx and ModelSelector.tsx, produce control inventory with gaps and concrete improvements. 
KNOWN_UNKNOWNS=Actual settings content unknown. Persistence mechanism unknown. 
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

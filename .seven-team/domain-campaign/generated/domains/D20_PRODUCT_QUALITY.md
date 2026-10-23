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

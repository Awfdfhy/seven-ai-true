# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: READY

DOMAIN_ID=D20_PRODUCT_QUALITY
SOURCE_ANALYSIS=Android Core App Quality [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality and WCAG [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ establish baselines. Playwright snapshots [SOURCE secondary] https://playwright.dev/docs/test-snapshots enable deterministic visual/product regression. Emphasis on cohesion, discoverability, feedback, response readability, motion, Android ergonomics (per product intelligence requirement). Synthetic users/UX judges mentioned as concepts - need concrete harnesses. 
CURRENT=B10 core domain (product cohesion/exploratory QA). Product intelligence corpus at .seven-team/product-intelligence with quality rubric/index. Seven identity must be preserved; aesthetic claims need evidence (screenshots/runtime). 
TARGET=Measurable product quality: feature discoverability, integration seams, install/use polish, cohesion rubric with pass/fail tied to evidence. UX judge harness grounded in rubric, not vibes. 
NOW=Read .seven-team/product-intelligence/index.json and quality rubric; map rubric to testable checks. Identify critical user journeys (install/use, core flows). 
NEXT=Define journey specs with acceptance criteria, add evidence collection (screenshots/logs/commands), integrate visual regression where applicable. 
LATER=UX judge with rubric scoring, synthetic user personas running journeys deterministically. 
TESTS=Journey E2E, accessibility checks, visual regression, performance smoke tests, integration seam tests. 
RISKS=Subjective aesthetics, weak evidence claims, over-imitating competitors. 
FIRST_SLICE=Journey inventory + evidence template: list top 3-5 critical journeys, define what constitutes "done" with required evidence artifacts. 
KNOWN_UNKNOWNS=Runnable app surfaces, test infrastructure, UX judge implementation. 
DOMAIN_VERDICT=READY_FOR_PLAN (product-intelligence corpus exists; clear rubric path)

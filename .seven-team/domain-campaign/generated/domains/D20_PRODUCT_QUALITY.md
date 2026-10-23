# D20_PRODUCT_QUALITY — Product Quality / Cohesion / Synthetic Users / UX Judges

Research audit: READY

DOMAIN_ID=D20_PRODUCT_QUALITY
SOURCE_ANALYSIS=Same as D12 quality sources (Android Core App Quality, WCAG) plus Playwright. Product-intelligence requirement: compare to reference principles without pixel-for-pixel, preserve identity. Need evidence levels.
CURRENT=Product intelligence corpus at `.seven-team/product-intelligence/` - must read index and quality rubric. HTML variants suggest iteration. No visible quality gates/evals at root.
TARGET=Measurable quality: discoverability, clarity, cohesion, feedback, recovery, Android ergonomics, accessibility.
NOW=Read product-intelligence index/rubric, inspect HTML for key journeys, identify quality gaps.
NEXT=Define quality checklist per journey, evidence capture plan.
LATER=Synthetic users/judges if justified.
TESTS=Journey-based E2E, accessibility, quality rubric scoring with evidence.
RISKS=Aesthetic claims without evidence, identity drift.
FIRST_SLICE=Read `.seven-team/product-intelligence/` fully, extract rubric, apply to Seven's HTML variants.
KNOWN_UNKNOWNS=Current quality baseline.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT

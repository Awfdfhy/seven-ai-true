# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: READY

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
SOURCE_ANALYSIS=Android Core App Quality [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality sets baseline for polish, stability, accessibility. WCAG 2.x [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ for a11y. Playwright visual comparisons [SOURCE secondary] https://playwright.dev/docs/test-snapshots for regression-proof UI. ChatGPT release notes [SOURCE primary] https://help.openai.com/en/articles/6825453-chatgpt-release-notes referenced as seed - treat as product evolution reference, not prescriptive. 
CURRENT=UI/visual system/motion/responsive; owners A01,B10. Seven is CLI+agent system (Codex CLI context mentioned in instructions) but also described as "Seven Superloop Agent" with product intelligence. Need to confirm if there is web UI, terminal UI (TUI), or both. Product cohesion is B10 focus. 
TARGET=Consistent design tokens, layout density appropriate to workflow, clear hierarchy/feedback, motion that reduces cognitive load, Android ergonomics if mobile surfaces exist, accessible (WCAG-aware), cohesive with Seven identity. 
NOW=Inventory UI surfaces (TUI components, web views, any mobile). Identify design tokens, shared components, theme. 
NEXT=Establish visual regression baseline (Playwright snapshots if web; golden files if TUI), a11y checklist per surface, density/spacing scale. 
LATER=Motion guidelines, component catalog with examples. 
TESTS=Visual regression, keyboard navigation, contrast checks, responsive layout tests, reduced-motion respect. 
RISKS=Pixel-imitating competitors (explicitly forbidden), inconsistent density across surfaces, a11y debt. 
FIRST_SLICE=UI surface map + tokens: document all UI entry points, current tokens, and one critical flow’s visual contract. 
KNOWN_UNKNOWNS=Whether UI is TUI-only (CLI) or has web; Android surfaces; existing component library. 
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (unclear UI surface types)

# D12_UI_DESIGN_SYSTEM — UI / Visual System / Motion / Responsive Design

Research audit: READY

DOMAIN_ID=D12_UI_DESIGN_SYSTEM
SOURCE_ANALYSIS=Harvested: Android Core App Quality (navigation, performance, permissions, responsiveness, accessibility), WCAG 2.0/2.1/2.2, Playwright visual comparisons. Emphasis on real user impact, not just aesthetics. Seven team requires comparing to reference principles (hierarchy, density, clarity, discoverability, feedback, response readability, motion, Android ergonomics, cohesion) without pixel-for-pixel imitation, preserve identity. Aesthetic claims need screenshot/runtime evidence.
CURRENT=Main artifact `seven_ai-final.html` is a single large HTML file (842964 bytes) - suggests monolithic UI. Multiple HTML variants (`seven_ai-t150.html`, `t152.html`, `t161.html`, `seven_ai-t150.html` etc.) exist - possible snapshots/variants. No obvious CSS/JS modules. Capacitor config (`capacitor.config.json`) present - Android wrapper possible. APK dir exists.
Evidence: HTML files + Capacitor config + APK dir. No Playwright snapshots visible at root. No design tokens/stylesheets as separate files obvious.
TARGET=Cohesive design system with tokens, components, clear hierarchy/density, Android ergonomics, accessibility (WCAG), motion with reduced-motion, responsive, consistent feedback/empty/loading states.
NOW=Inspect `capacitor.config.json`, `apk/`, grep HTML for design tokens/CSS variables, compare variants for cohesion, read product-intelligence rubric.
NEXT=Extract design tokens, component inventory, accessibility audit (contrast/semantics/focus), Android-specific ergonomics, motion audit.
LATER=Component library, theme system, visual regression harness (Playwright) aligned with Seven identity.
TESTS=Visual regression (Playwright snapshots), accessibility (axe/WCAG), Android Core App Quality checks, responsive. Evidence must include screenshots/runtime or label as weak.
RISKS=Monolith makes systemization hard, variant sprawl, accessibility gaps, Android gesture/navigation issues.
FIRST_SLICE=Inventory UI patterns in `seven_ai-final.html`, identify tokens/components, check Capacitor/Android surface, read product-intelligence quality rubric for cohesion scoring.
KNOWN_UNKNOWNS=Actual rendered UI state, design tokens, accessibility compliance.
DOMAIN_VERDICT=RESEARCH_INSUFFICIENT

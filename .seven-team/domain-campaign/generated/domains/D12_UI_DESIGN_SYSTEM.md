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

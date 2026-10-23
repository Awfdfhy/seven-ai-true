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

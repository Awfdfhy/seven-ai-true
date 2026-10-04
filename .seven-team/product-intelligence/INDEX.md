# Seven Product Intelligence Encyclopedia v2

Status: ACTIVE / TEAM-WIDE

This is the team's shared operational encyclopedia. It expands product intelligence from one general document into specialized knowledge packs for every current agent plus cross-cutting pattern libraries.

## How agents use it
1. Always read PRODUCT_QUALITY_RUBRIC.json and the Product Intelligence README.
2. Read every path listed in your `knowledgePacks` field in `.seven-team/superloop/team-v1.json`.
3. Read adjacent packs when blast radius crosses domains.
4. Use `sources/OFFICIAL_SOURCE_MAP.json` to refresh unstable/current facts.
5. Evidence from the exact Seven build overrides generic benchmark advice.
6. Add durable new lessons to `learned/` only with evidence and source-quality policy compliance.

## Domain packs
- [A01 — UI / Visual System](domains/A01_UI_VISUAL.md)
- [A02 — Android / Native / APK](domains/A02_ANDROID_NATIVE.md)
- [A03 — Arabic / RTL / Accessibility](domains/A03_ARABIC_RTL_A11Y.md)
- [A04 — Architecture / Runtime](domains/A04_ARCHITECTURE_RUNTIME.md)
- [A05 — Models / Routing / Providers](domains/A05_MODELS_ROUTING.md)
- [A06 — Memory / Context](domains/A06_MEMORY_CONTEXT.md)
- [A07 — Security / Credentials](domains/A07_SECURITY_CREDENTIALS.md)
- [A08 — Testing / Release Assurance](domains/A08_TEST_RELEASE.md)
- [A09 — Performance / Concurrency](domains/A09_PERFORMANCE_CONCURRENCY.md)
- [A10 — Holistic Red-Team](domains/A10_HOLISTIC_REDTEAM.md)
- [B01 — Chat / Rooms / Composer](domains/B01_CHAT_COMPOSER.md)
- [B02 — Attachments / Files / SAF](domains/B02_FILES_SAF.md)
- [B03 — Research / Citations](domains/B03_RESEARCH_CITATIONS.md)
- [B04 — Deep Think / Reasoning](domains/B04_DEEP_THINK.md)
- [B05 — RPG / Canon](domains/B05_RPG_CANON.md)
- [B06 — GitHub Self-Development](domains/B06_GITHUB_SELFDEV.md)
- [B07 — Network / Resilience](domains/B07_NETWORK_RESILIENCE.md)
- [B08 — Storage / Recovery](domains/B08_STORAGE_RECOVERY.md)
- [B09 — Stress / Races](domains/B09_STRESS_RACES.md)
- [B10 — Product Cohesion / Exploratory QA](domains/B10_PRODUCT_COHESION.md)

## Pattern libraries
- [CHAT COMPOSER RESPONSE](patterns/CHAT_COMPOSER_RESPONSE.md)
- [NAVIGATION SURFACES](patterns/NAVIGATION_SURFACES.md)
- [EMPTY LOADING ERROR SUCCESS](patterns/EMPTY_LOADING_ERROR_SUCCESS.md)
- [VISUAL LANGUAGE](patterns/VISUAL_LANGUAGE.md)
- [ANDROID MOBILE QUALITY](patterns/ANDROID_MOBILE_QUALITY.md)
- [ARABIC BIDI](patterns/ARABIC_BIDI.md)
- [ACCESSIBILITY](patterns/ACCESSIBILITY.md)
- [PERFORMANCE OBSERVABILITY](patterns/PERFORMANCE_OBSERVABILITY.md)
- [SECURITY PRIVACY](patterns/SECURITY_PRIVACY.md)
- [TEST EVIDENCE](patterns/TEST_EVIDENCE.md)
- [PRODUCT BENCHMARKING](patterns/PRODUCT_BENCHMARKING.md)

## Shared canonical files
- PRODUCT_KNOWLEDGE_BASE.md
- PRODUCT_QUALITY_RUBRIC.json
- VISUAL_REFERENCE_CATALOG.json
- JUDGE_PROTOCOL.md
- SOURCE_QUALITY_POLICY.md
- sources/OFFICIAL_SOURCE_MAP.json
- visual/AI_CHAT_REFERENCE_BOARD.svg
- visual/QUALITY_LADDER.svg

## Rule
The encyclopedia is a starting prior, not authority over runtime evidence. When a principle conflicts with observed exact-build evidence or Seven's explicit product contract, record the conflict and test it.

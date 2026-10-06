# Chat 5 — Canonical UI Reference Database Audit

Validator branch: `ui/chat5-validation-20261006`
Validated parent: `ui/20-agent-convergence-20261006`
Requested baseline: `f86d409bcf914280246078d235e8f96ee73337a3`

## Verdict
**REFERENCE DATABASE: BLOCKED**

The repository currently has substantial research material, but it does not yet satisfy the canonical 1000+ visually validated screen requirement.

## Provenance
The current convergence branch is 46 commits ahead of the requested baseline and uses that SHA as merge-base. The wave plan contains a stale `Base SHA: 0c112b9...`; this must not be used as screenshot provenance.

## Existing corpus
### Central catalogue
- File: `UI_REFERENCE_DATABASE.jsonl`
- Rows: 1000
- Source distribution: 1000 / 1000 = Interface In Game
- Review state: 1000 / 1000 = `CATALOGUED_PENDING_SCREEN_REVIEW`
- Unique products: 8
- Mobile: 181
- PC/Console: 819
- Product counts:
  - Genshin Impact Mobile — 181
  - Destiny 2 — 135
  - Cyberpunk 2077 — 132
  - Hades — 127
  - Moonlighter — 124
  - NieR:Automata — 107
  - The Witcher 3: Wild Hunt — 99
  - Elden Ring — 95

This violates the requested product diversity cap of roughly 15–20 references per product and cannot be promoted merely because the row count is 1000.

### Chat 2 — RPG Narrative
- 260 records
- 48 unique products
- no product exceeds 20 records
- useful coverage: dialogue, narrator, character identity, relationships, journal/canon/lore

### Chat 3 — RPG Systems
- 250 records
- 12 unique products
- six products exceed 20 records
- useful coverage: battle, progression, inventory, equipment, map/world, faction/kingdom

### Chat 1 / Chat 4
No independently identifiable reference database was found at the expected branch locations during this validation pass. Their contribution must be surfaced explicitly before canonical merge.

## Required schema gap
The central 1000-row catalogue does not implement the requested canonical schema. Zero rows currently expose these exact fields:
`product`, `category`, `layout_pattern`, `information_density`, `primary_strength`, `secondary_strengths`, `rtl_score`, `accessibility_score`, `visual_polish_score`, `clarity_score`, `seven_fit_score`, `rpg_fit_score`, `originality_score`, `what_to_extract`, `notes`.

Existing near-equivalents such as `product_game_app`, `suitability_for_seven`, `suitability_for_rpg`, and `what_to_learn` may be migrated, but migration is not visual validation.

## Canonical promotion rule
A record may become `VISUALLY_REVIEWED` only when all are present:
1. screen/image evidence or a stable source page containing the exact screen;
2. source URL;
3. product, platform, year/version if knowable;
4. surface + subsurface;
5. full metadata schema;
6. 100-point score;
7. independent reviewer identity;
8. copyright-safe internal-reference status;
9. dedupe fingerprint or explicit reason for near-duplicate retention.

## Diversity rule
Before finalization:
- no product >20 records without written exception;
- no single source dominates the corpus;
- production UI must dominate concept art;
- Core App, RPG Narrative, RPG Systems, Design System must all be represented;
- 450–550 records must be RPG/narrative/game-system related;
- mobile, desktop, light, dark, minimal, dense, fantasy, modern, cinematic, tactical, narrative, strategy must all be covered.

## 100-point rubric
- Visual hierarchy — 15
- Clarity — 15
- Mobile usability — 15
- Consistency — 10
- Information density — 10
- Interaction quality — 10
- Accessibility — 10
- Originality — 5
- Seven suitability — 5
- Implementation realism — 5

RPG companion score (separate, 5 dimensions × 20): immersion, narrative clarity, character identity, world-state communication, game feel.

## Promotion status
The current 1000-row file is an **intake catalogue**, not a validated reference database. Do not use its count in READY claims.

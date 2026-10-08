# RPG_UI_B_VISUAL_ACCEPTANCE_MATRIX

## Required viewports
- 320×800 portrait
- 360×800 portrait
- 390×844 portrait
- 420×900 portrait
- 800×360 landscape

Each ×:
- LTR English
- RTL Arabic
- day
- night
- normal text
- 150% text

## Scenarios
1. Empty RPG state — no dead tabs/cards.
2. 1 ability / 1 item / 1 faction.
3. 12 abilities with long Arabic names.
4. 30 items with quantities and mixed equipped states.
5. World state with 10 active events; primary view still shows <=3.
6. Faction with 8 allies, 8 enemies, 10 territories.
7. Ability unavailable by cooldown.
8. Ability forbidden.
9. Long resource/currency names.
10. Scene with activeConflicts but no initiative/HP data.
11. No current location.
12. Reduced motion.

## Hard gates
- no horizontal overflow
- no text overlap
- no clipped Arabic glyphs
- no hidden primary action under keyboard/safe-area
- no color-only state encoding
- >=44px hard minimum target
- tab labels remain understandable
- story/composer remain visually dominant
- no invented HP/MP/XP/level/rarity/currency/trend
- logical properties survive RTL

## Screenshot names
`rpg-b_<scenario>_<width>_<dir>_<theme>_<scale>.png`

## Review scoring /10
Clarity 2, hierarchy 2, touchability 1, readability 1, immersion 1, RTL 1, accessibility 1, screen efficiency 1.
Pass: >=8.5 and zero hard-gate failures.

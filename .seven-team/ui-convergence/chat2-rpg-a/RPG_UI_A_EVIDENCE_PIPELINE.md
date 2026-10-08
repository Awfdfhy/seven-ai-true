# RPG UI A Evidence Pipeline

## Browser evidence already implemented
`release/release-verify.cjs` now prepares:
- 16 mobile screenshots: 320/360/390/420 × LTR/RTL × day/night
- 1 large-text screenshot at 150%
- 1 landscape screenshot at 800×360
- 1 keyboard-height screenshot at 390×430
- manifest JSON

Expected output:
`dist/rpg-ui-a-evidence/`

## Current artifact publication gap
`.github/workflows/seven-tests.yml` uploads:
- dist/seven_ai-release.html
- dist/release-manifest.json
- dist/static-audit.json
- dist/vendor/**
- results.json

It does **not** currently upload:
`dist/rpg-ui-a-evidence/**`

Therefore even after the browser matrix runs successfully, R04 cannot inspect the generated screenshots from CI unless the Integrator adds that path to the artifact upload (or provides another canonical visual-evidence artifact path).

## Required Integrator action
Add:
`dist/rpg-ui-a-evidence/**`
to the existing successful CI artifact upload, or route these screenshots into the canonical visual-evidence artifact selected by Chat 0/V01–V03.

Do not mark R04 visual PASS from assertions alone. The screenshots themselves must be reviewable.

## Release order
1. Fix shared hot-layer startup budget without raising it.
2. Re-run exact-head Seven AI tests.
3. Browser matrix executes and creates 19 screenshots.
4. Upload screenshots as CI evidence.
5. R04 reviews screenshots.
6. Android 14/16 exact-head evidence still required separately.

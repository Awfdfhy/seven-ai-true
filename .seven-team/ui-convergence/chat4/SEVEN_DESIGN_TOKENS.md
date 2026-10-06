# Seven Canonical Design Tokens

## Contract
Components consume semantic tokens only. Raw palette values are private implementation details. No component may introduce a new hex, radius, shadow, z-index, breakpoint, or duration without extending this contract.

## Color
Semantic surface tokens: `--seven-color-surface-0`, `surface-1`, `surface-2`, `surface-raised`; text: `text-primary`, `text-secondary`, `text-muted`; borders: `border-subtle`, `border-strong`; actions/status: `accent`, `accent-hover`, `danger`, `warning`, `success`, `info`, `focus`.

## Typography
Display 1.75rem/1.15; Title 1.375rem/1.2; Heading 1.125rem/1.3; Body .95rem/1.55; Small .84rem/1.45; Caption .75rem/1.4; Mono .84rem/1.5. Arabic body/long-form uses at least 1.6 line-height when density requires it. Avoid letter-spacing on Arabic body text.

## Spacing
2, 4, 8, 12, 16, 20, 24, 32, 40px via `--seven-space-1..9`.

## Radius
control-sm 8; control 12; card 16; dialog 20; sheet 24; pill 999px.

## Elevation
0 none; 1 subtle control/card; 2 raised menu; 3 dialog; 4 critical overlay. Elevation never substitutes for contrast/border.

## Z-index
base 0; sticky 10; dropdown 100; popover 200; sheet 300; modal 400; toast 500; critical 600. Random 999/9999/10020 values are migration defects.

## Breakpoints
320/360/390/420 are validation widths, not styling breakpoints. Canonical CSS breakpoints: compact 420, phone 720, tablet 900. Use intrinsic layout before adding new breakpoints.

## Motion
fast 120ms; normal 180ms; slow 260ms. Reduced-motion collapses non-essential transitions to near-zero and removes decorative transforms.

## Touch
Interactive controls: target 44px minimum by default; compact inline affordances may visually appear smaller only if hit area remains >=44px.

## CSS mapping
Canonical variables are implemented in `release/seven-final.css` under `:root`; compatibility aliases bridge existing `--bg/--surface/--sb-*` variables during migration. New shared components must use `--seven-color-*`, `--seven-space-*`, `--seven-radius-*`, `--seven-z-*`, and `--seven-duration-*` only.

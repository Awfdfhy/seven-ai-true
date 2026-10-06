# Seven Canonical Design Tokens

## Contract
Seven converges on the existing `--seven-*` namespace instead of creating another parallel namespace. Shared components use semantic application colors plus the canonical Seven scales below. Raw palette values stay inside theme/palette owners.

## Color
The application semantic color contract is the existing:
- `--bg`: canvas
- `--surface`: primary surface
- `--surface2`: secondary/input surface
- `--text`: primary text
- `--muted`: secondary/muted text
- `--border`: shared border
- `--accent` / `--accent-hover`: primary action/selection
- `--danger`: destructive/error
- `--seven-success`, `--seven-warning`, `--seven-info`: status roles

`release/beta-ui.css` owns palette/theme resolution and bridges its raw `--sb-*` values into the semantic application variables. Components must not consume raw `--sb-*` colors when a semantic variable exists.

## Typography
Seven roles only: Display, Title, Heading, Body, Small, Caption, Mono. Current target scale: Display 1.75rem/1.15; Title 1.375rem/1.2; Heading 1.125rem/1.3; Body .95rem/1.55; Small .84rem/1.45; Caption .75rem/1.4; Mono .84rem/1.5. Arabic long-form may use >=1.6 line-height. Do not apply Latin letter-spacing to Arabic body text.

## Spacing
`--seven-space-1..9` = 2, 4, 8, 12, 16, 20, 24, 32, 40px.

## Radius
Use the existing canonical scale:
- `--seven-radius-xs` = 8px
- `--seven-radius-sm` = 12px (controls/inputs)
- `--seven-radius-md` = 16px (cards)
- `--seven-radius-lg` = 22px (dialogs)
- `--seven-radius-xl` = 28px (large/sheet surfaces)
- `--seven-radius-pill` = 999px

## Border & elevation
`--seven-border-soft`, `--seven-border-strong`, `--seven-elev-1`, `--seven-elev-2`, and `--seven-ring` are canonical. Do not invent component-local shadows when an existing elevation role fits.

## Z-index
`--seven-z-base=0`, `sticky=10`, `dropdown=100`, `popover=200`, `sheet=300`, `modal=400`, `toast=500`, `critical=600`. Literal escalation values such as 999/9999/10020/10060 are migration defects.

## Breakpoints
320/360/390/420px are mandatory validation widths, not a reason to add four media queries. Shared styling should prefer intrinsic layout, with existing product breakpoints consolidated toward compact <=420, phone <=720, tablet <=900.

## Motion
Reuse the existing scale:
- instant 90ms
- fast 150ms
- standard 220ms
- deliberate 320ms
- signature 520ms

Most shared UI should use fast/standard/deliberate. Respect `prefers-reduced-motion`.

## Touch
`--seven-touch-min=44px`. Controls may look visually smaller only when the interactive hit area remains at least 44px.

## Actual CSS ownership
- Startup/core primitives: `release/seven-final.css`
- Theme palette + semantic color bridge: `release/beta-ui.css`
- Spacing/status/overlay ladder + settings hardening: `release/ui-hardening.css`
- Direction-only rules: `release/workspaces/rtl.css`

This split is transitional ownership, not four design systems. The token namespace and semantic meanings are singular, and legacy visual duplication must be deleted rather than outbid.

# Z-index & Motion

Official ladder: base=0, sticky=10, dropdown=100, popover=200, sheet=300, modal=400, toast=500, critical=600. No arbitrary four/five-digit values in production after migration. Motion: fast=120ms, normal=180ms, slow=260ms with shared enter/exit easing. Motion must communicate opening, closing, selection, feedback, or workspace transition. `prefers-reduced-motion: reduce` removes decorative movement and keeps state changes immediate.

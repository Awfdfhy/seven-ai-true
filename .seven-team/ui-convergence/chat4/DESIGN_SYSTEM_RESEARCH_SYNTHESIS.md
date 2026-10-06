# D01/D02 Research Synthesis

## D01 — Tokens / systems
The strongest systems separate raw/global values from semantic aliases, then let components consume semantic intent. Seven will follow that pattern, keeping compatibility aliases only during migration. The system deliberately limits typography, spacing, radii, elevation, z-index, and motion vocabularies.

## D02 — RTL / Arabic / accessibility
RTL is not a transform. Use root direction + logical CSS. Mixed Arabic/Latin/numerals require bidi-aware leaf handling. Code/hashes remain isolated LTR. Accessibility requirements are structural: visible focus, target sizing, color-independent state, text scaling, reduced motion, semantic labels/headings, and keyboard-safe dialogs.

## Application references
The database includes real-product settings/accessibility patterns (Android, iOS, Windows, Slack, GitHub, Discord, Telegram, WhatsApp, Chrome, Firefox) alongside formal design systems/specifications.

## Seven-specific conclusion
Seven must converge from five active token namespaces to one semantic contract, then migrate one surface at a time while deleting superseded declarations. This is a migration program, not a reskin.

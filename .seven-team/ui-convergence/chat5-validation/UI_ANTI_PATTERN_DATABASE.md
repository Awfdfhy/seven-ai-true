# Chat 5 — UI Anti-Pattern Database

## Architecture
- duplicate model pickers
- duplicate mode pickers
- multiple overlay/modal state owners
- multiple token namespaces for the same semantic role
- runtime CSS whose result depends on load order
- specificity wars
- new !important used to defeat old !important
- workspace-local global CSS
- z-index escalation instead of a canonical ladder
- hidden legacy DOM kept alive under new UI
- separate mobile and desktop components with divergent state
- visual patches that increase bundle budgets
- “fix” by raising budget thresholds
- native/custom picker duplication
- one-off breakpoints with no system rationale

## Mobile geometry
- desktop grid squeezed onto phone
- fixed widths wider than viewport
- 320px treated as edge case rather than baseline
- keyboard covering composer
- bottom sheets behind IME
- safe-area insets ignored
- clipped topbar title/actions
- off-screen menus
- tiny hit targets
- dense icon rows with no wrapping/overflow policy
- nested horizontal scrollers
- modal body with no scroll escape
- landscape assumptions copied into portrait

## RTL / Arabic
- physical left/right used for layout semantics
- arrows mirrored when meaning should not mirror
- arrows not mirrored when navigation direction should mirror
- Arabic labels truncated earlier than English
- mixed-direction model names breaking alignment
- punctuation/number runs rendered incoherently
- icon + label order fixed physically
- sidebar animation from wrong edge
- text-align hacks replacing logical layout
- Arabic line-height too tight
- ellipsis hiding critical Arabic nouns
- RTL tested only at normal font size

## Visual system
- inconsistent radii
- inconsistent shadows
- random spacing
- decorative gradients without hierarchy purpose
- cards inside cards inside cards
- badge overload
- every datum treated as a chip
- everything elevated
- no distinction between primary and secondary actions
- icons without labels for unfamiliar actions
- different button geometry per workspace
- different modal grammar per workspace
- different typography scale per workspace
- dark theme as simple color inversion
- day theme with washed-out borders
- low-contrast muted text used for important state
- visual hierarchy collapse under long content

## Chat / Composer
- composer controls duplicated above and below input
- attachment action far from attachment state
- stop/send state visually ambiguous
- action row visible on every message at all times
- code-copy affordance obscuring code
- long model name forcing composer overflow
- picker taller than viewport
- empty state competing with composer
- system/narrator/user/assistant roles indistinguishable
- tables forcing page-wide horizontal scroll

## RPG narrative
- RPG rendered as ordinary chat with a fantasy gradient
- permanent HUD dominating prose
- narrator presented as just another avatar
- character identity dependent on color alone
- relationship score exposed without semantic explanation
- lore/canon presented as generic settings cards
- every scene wrapped in ornamental frames
- dialogue choices mixed with system actions
- spoilers shown through omniscient character UI
- state that the runtime does not authoritatively expose
- dashboard overload during narrative
- copied franchise typography/geometry

## RPG systems
- turn order always visible when not actionable
- tiny status icons with no text fallback
- inventory grid too dense for touch
- equipment compare requiring side-by-side phone columns
- skill trees that become pan/zoom traps
- map labels smaller than touch/readability floor
- faction dashboards dominated by raw metrics
- crafting UI copied from games without corresponding mechanics
- rewards over-celebrated relative to narrative
- disabled actions without reason
- world-state alerts with no prioritization

## Accessibility
- focus removed with no replacement
- color-only state
- insufficient contrast
- large text clipped instead of reflowed
- motion ignores reduced-motion
- icon buttons without accessible names
- touch-only hover-dependent discovery
- context-menu-only critical action
- focus not returned after overlay closes
- back/escape behavior inconsistent

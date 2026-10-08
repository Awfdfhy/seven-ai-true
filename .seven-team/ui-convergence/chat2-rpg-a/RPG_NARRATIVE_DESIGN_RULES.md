# RPG Narrative Design Rules

## North star
Seven RPG must feel like **a living RPG presented through conversation**, not a chat app decorated with fantasy badges.

The two simultaneous pass conditions are:
1. It feels unmistakably like an RPG.
2. It remains as easy to operate as chat.

If either fails, the design fails.

## Runtime-grounded semantic layers
Current Seven RPG architecture supports these presentation layers:
- player-authored actions / decisions
- narrator output
- character-local knowledge
- beliefs distinct from truth
- multi-dimensional relationships
- emotions as bounded state
- character location
- quests / goals
- canon levels and provenance
- timeline / event ledger
- world/session identity

Do **not** surface HP, weather, mood labels, combat stats, or other data unless the live runtime supplies them for the current session.

## Story Chat hierarchy
1. **Narrator:** typography-led, low-card treatment; wider readable measure; visually distinct from character speech without shouting.
2. **Character:** identity line + optional portrait/avatar; speech remains the visual focus.
3. **Player:** compact, unmistakably authored-by-user treatment aligned with Seven core chat conventions.
4. **World/System event:** rare semantic divider or inline state-change callout; never a chat bubble clone.
5. **Memory/Canon:** inspectable annotation, not an ordinary message; hidden unless relevant or explicitly opened.

## Weight budget
- Ordinary turn: 1 identity cue + text.
- Important scene transition: may add scene context strip.
- Consequence/canon event: one contextual semantic accent.
- Never stack portrait + role + mood + relationship + location + chapter + badges on every message.

## Progressive disclosure
Normal → tap/focus → detail:
- Normal character identity: name + subtle role/identity cue.
- Tap: quick card with current relevant state.
- Details: full character sheet.
The same pattern applies to scene, canon, relationships, quest and memory.

## Narration readability
- Target body measure: ~48–72 characters per line on wide screens.
- Mobile uses full available width with comfortable inline padding.
- Long narration should not be trapped inside visually heavy cards.
- Paragraph rhythm and section spacing carry more weight than borders.
- Message actions remain hidden until focus/hover/long-press or explicit overflow.

## Player agency semantics
The UI must quietly distinguish:
- player-authored choice/action
- narrator-authored prose
- runtime/world-applied change
- derived summary/memory
Use typography, icon micro-signals and placement; avoid persistent badges on every turn.

## Scene context
Scene context is **conditional**, not a permanent HUD.
Show when:
- entering a new scene
- location/time/chapter meaningfully changes
- cast changes materially
- user explicitly opens scene details
Collapse after orientation has been established.

## Mobile-first constraints
Required target widths: 320 / 360 / 390 / 420 px.
At every width test:
- portrait
- landscape
- software keyboard open
- Arabic RTL
- 150%/large text
- day/night
Rules:
- no horizontal scroll
- no fixed multi-column relationship or codex layouts
- bottom sheets over side panels on phones
- touch targets target 44px
- logical CSS properties only for directional spacing
- graphs switch to focused list/edge view on narrow screens

## RTL rules
- Speaker identity order mirrors naturally.
- Timelines remain chronological; direction of decorative arrows must be semantic, not blindly mirrored.
- Numerals and mixed LTR names use bidi isolation.
- Portrait location must follow layout logic, not hard-coded left/right.
- Do not rely on indentation alone to distinguish player/narrator.

## Accessibility
- semantic headings inside sheets/panels
- keyboard focus order follows reading order
- no meaning encoded by color alone
- relationship dimensions get text labels in detail view
- reduced motion disables scene/canon transitions
- screen-reader labels describe state changes without revealing hidden spoilers

## Spoiler boundary
Knowledge UI is player-safe by default.
- "Known by" may show only information the player's current perspective is allowed to inspect.
- Unknown/hidden actors are summarized without identity where disclosure would leak plot.
- Belief and truth are visually distinct.
- Debug omniscience belongs only in advanced/dev surfaces.

## Six explored directions

| Direction | Concept | Pros | Cons | Mobile | RTL | Seven fit |
|---|---|---|---|---:|---:|---:|
| Royal Minimal | Elegant high-end editorial spacing, restrained metallic/royal accents, clear typographic hierarchy. | Low chrome; excellent narrative readability; premium identity. | Can become generic luxury UI if semantic layers are too subtle. | 5/5 | 5/5 | 5/5 |
| Arcane Mystic | Subtle runic/constellation accents used only for canon, memory and world-state semantics. | Strong Seven fantasy identity without changing interaction fundamentals. | Easy to overdecorate; effects must remain sparse and token-driven. | 4/5 | 4/5 | 4/5 |
| Ancient Codex | Modern archive hierarchy inspired by books, tabs, marginalia and provenance. | Excellent for canon/lore/journal; strong sense of accumulated history. | Needs careful mobile adaptation; parchment skeuomorphism harms dark-mode consistency. | 4/5 | 4/5 | 4/5 |
| Cinematic Narrative | Story first: quiet chrome, clear narrator rhythm, scene transitions, contextual character identity. | Best immersion/readability balance for Story Chat. | Can hide state too aggressively unless scene/context affordances remain discoverable. | 5/5 | 5/5 | 5/5 |
| Modern AI × Fantasy | Seven core shell language with semantic fantasy layers for narrator/canon/memory/relationships. | Best cross-workspace consistency and implementation realism. | Must avoid becoming ordinary AI chat with purple fantasy badges. | 5/5 | 5/5 | 5/5 |
| Living World | Progressive world-state detail, timeline, relationships, location and consequences surfaced on demand. | Best showcase of Seven persistent simulation strengths. | Highest density risk; graphs and panels cannot stay permanently open. | 4/5 | 4/5 | 5/5 |

## Recommended synthesis pending Chat 0
**Cinematic Narrative × Modern AI × Fantasy**, with **Ancient Codex** reserved for archive surfaces and **Living World** used only in progressive detail views.

This is a recommendation, not authorization to modify shared global tokens.

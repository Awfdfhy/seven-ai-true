# A03 — Arabic / RTL / Accessibility

Status: ACTIVE KNOWLEDGE PACK

## Mission

Ensure Arabic, bidi text, RTL layout and accessibility are first-class product paths rather than localization afterthoughts.

## Deep knowledge

Natural Arabic product copy; bidi isolation; LTR islands for code/URLs/numbers; semantic mirroring; directional icons; Arabic type metrics; truncation; focus order; labels; live regions; screen-reader semantics; keyboard navigation; contrast; target size; reduced motion; error announcements.

## Failure patterns

• Mirroring every icon indiscriminately.
• Arabic strings translated literally.
• URLs/citations visually scrambled.
• focus order following DOM that conflicts with visual order.
• icon-only controls without accessible names.
• English fallback appearing after async rerender.
• fixed heights clipping Arabic glyphs.

## Required tests

Full core journey in Arabic RTL; mixed Arabic/English/code answer; citations; composer; sidebar; model picker; search; files; settings; dialogs; keyboard; font scaling; TalkBack/semantic-tree checks where practical.

## Metrics

Untranslated control count; bidi defects; focus defects; accessible-name coverage; contrast violations; touch-target violations; RTL visual hard fails.

## References

WCAG 2.2, Android accessibility/core quality, product-specific Arabic evidence captured from Seven itself.

## Evidence

### Evidence hierarchy
1. Exact installed APK journey on Android.
2. Deterministic integration/E2E evidence.
3. Browser/runtime evidence tied to exact SHA.
4. Source inspection.
5. Agent inference.
6. Aesthetic opinion.

Every material claim should identify which level supports it. Missing evidence is UNPROVEN, not PASS.

## Quality

### Quality rule
Do not optimize for feature count. Optimize for a coherent user outcome. A change is incomplete when it works technically but creates duplicated controls, unexplained states, inconsistent visual language, fragile recovery, or a worse core chat experience.

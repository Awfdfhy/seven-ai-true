# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: READY

DOMAIN_ID=D13_ARABIC_RTL_A11Y
SOURCE_ANALYSIS=Harvested [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ (WCAG 2.x). [SOURCE primary] https://developer.android.com/guide/topics/resources/localization (localization best practices). [SOURCE primary] https://developer.android.com/guide/topics/ui/accessibility (accessible apps). Localized variants present (ar/bn). Sources emphasize text direction, resource qualifiers, accessibility services, focus/order. Limitation: no Seven RTL audit found in harvested data; need repo evidence.
CURRENT=Grep for RTL/dir/lang/ar: found no matches in remake/src (searched). No i18n framework evident (no i18next/react-intl). No dir attributes, no logical properties usage obvious. Arabic/Bengali localized Android docs referenced but app code has no RTL handling. Accessibility: aria attributes rare? Grepped aria- found none. No focus management visible. Settings/controls not audited yet. 
TARGET=RTL support for Arabic (and general RTL) via dir="rtl" or CSS logical properties (margin-inline/start/end), text alignment. Bidi awareness. i18n structure for future languages. WCAG-aligned accessibility: keyboard nav, focus visible, ARIA where needed, color contrast, touch targets. Android localization via resources if native, but web shell needs RTL. 
NOW=Add RTL detection (lang/dir) and CSS logical properties migration plan. Audit layout for physical properties (margin-left/right, padding-left/right, left/right) and replace with logical. Add dir attribute support in App/shell. Check text inputs, code blocks, message bubbles for RTL. Add basic a11y checks: focus states, alt text, button labels. 
NEXT=Implement RTL stylesheet with logical properties, test Arabic text rendering, ensure icons/images don't break, fix bidi edge cases (numbers, URLs), add lang attribute, improve keyboard navigation, add skip links. 
LATER=Full i18n framework, pluralization, RTL-specific components, screen reader testing, WCAG 2.2 audit, automated a11y tests (axe). 
TESTS=Deterministic: CSS lint for physical properties. E2E: Arabic text in message bubble, RTL layout. A11y: keyboard tab order, focus visible, screen reader labels. Android: RTL layout per localization guide. Adversarial: mixed LTR/RTL, long Arabic text, code blocks in RTL. 
RISKS=Major layout breakage if physical properties used everywhere. Code blocks/monospace need LTR direction. Icons may need mirroring. No existing RTL support = large surface area. Arabic parity required per Memory v2 notes but UI RTL separate. 
FIRST_SLICE=Audit all CSS for physical left/right/margin/padding and create migration list; add dir support in App.tsx; add CSS logical properties for top-level layout (Sidebar, main content); test with lang="ar" and dir="rtl". 
KNOWN_UNKNOWNS=Full CSS inventory not done yet. No a11y baseline. No RTL test data. Screen reader behavior unknown. 
DOMAIN_VERDICT=READY_FOR_PLAN

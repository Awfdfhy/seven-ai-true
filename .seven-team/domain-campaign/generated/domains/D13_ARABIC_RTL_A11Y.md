# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: READY

DOMAIN_ID=D13_ARABIC_RTL_A11Y
SOURCE_ANALYSIS=Sources agree: WCAG 2.0/2.1/2.2 international baseline; Android localization best practices (default + alternative resources); Android accessibility (TalkBack, content descriptions). Harvested evidence is metadata-only; localization/accessibility body pages not captured. [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/ ; [SOURCE primary] https://developer.android.com/guide/topics/resources/localization ; [SOURCE primary] https://developer.android.com/guide/topics/ui/accessibility
CURRENT=Seven has RTL CSS rules using logical properties and dir="rtl" overrides; rtl.css contains bidirectional isolation rules (unicode-bidi:isolate/plaintext). Arabic localization present for Android core quality page but app-level Arabic parity unknown. No evidence of TalkBack/content-description coverage or bidi string handling.
TARGET=Full Arabic/RTL parity: logical properties everywhere, bidi isolation for code/numbers, WCAG 2.2 AA, TalkBack labels, no mixed-language critical labels.
NOW=Audit all critical labels (chat, settings, composer, workspace) for Arabic parity; document missing translations; add bidi isolation to code blocks and numeric outputs.
NEXT=TalkBack content-description pass; focus order verification in RTL; keyboard navigation; screen-reader announcements for streaming.
LATER=Full i18n framework with pluralization, Arabic numeral handling, RTL icon mirroring.
TESTS=Bidi golden screenshots; axe with rtl locale; manual TalkBack checklist (documented, not yet runnable); string parity test.
RISKS=Partial translation causing mixed-language UI; code blocks breaking bidi; number formatting; icon direction.
FIRST_SLICE=String parity audit + bidi isolation rules + documented gaps.
KNOWN_UNKNOWNS=No Arabic exact-build evidence; no TalkBack test; no RTL browser regression.
DOMAIN_VERDICT=READY_FOR_PLAN

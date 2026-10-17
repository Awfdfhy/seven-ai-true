# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: READY

DOMAIN_ID=D13_ARABIC_RTL_A11Y
SOURCE_ANALYSIS=Harvested WCAG 2.x overview, Android localization guide, Android accessibility guide. Collectively: WCAG defines accessible content (perceivable, operable, understandable, robust); Android localization requires default+alternative resources and RTL support (`supportsRtl`, `ldrtl` layouts, `start/end`); accessibility requires semantics (content descriptions, focus order, touch targets, readable text, reduced motion). No contradictions. Limitations: WCAG is web-focused; Android a11y adds platform specifics. Harvested includes localized (ar) Android docs — useful for Arabic context. Some seed URLs generic (favicons, css, feed, manifest, opensearch) not domain-specific. SOURCE_ANALYSIS evidence: [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/, [SOURCE primary] https://developer.android.com/guide/topics/resources/localization, [SOURCE primary] https://developer.android.com/guide/topics/ui/accessibility, [SOURCE primary] https://developer.android.com/guide/topics/resources/localization?hl=ar, [SOURCE primary] https://developer.android.com/docs/quality-guidelines/core-app-quality?hl=ar.

CURRENT=Seven app may support i18n; need to confirm Arabic locale resources (`values-ar`, `strings.xml` in ar), RTL layout support (`android:supportsRtl="true"`, `layout-ldrtl/`), web-side RTL (html `dir="rtl"`, CSS `direction:rtl`, logical properties). A11y: check content descriptions, focus management, semantic elements, touch target sizes, color contrast considerations, reduced motion support. Distinguish browser evidence (web a11y/RTL in browser), mock evidence, Android build evidence (TalkBack on APK), installed-device evidence (real TalkBack). Product intelligence requires comparing against hierarchy/density/clarity/discoverability/feedback/response readability/motion/Android ergonomics/cohesion; aesthetic claims without runtime evidence weak.

TARGET=Arabic content correct (bidi, numerals, diacritics), RTL layouts functional (mirroring, proper alignment with start/end), meets reasonable a11y bar aligned with WCAG/Android a11y guidance. Preserve identity (don’t pixel-for-pixel imitate). Motion respects reduced motion. Focus order logical. Critical images have content descriptions; decorative marked appropriately.

NOW=Smallest slice: inspect localization (`locales/`, `i18n/`, `translations/`, Android `res/values*/strings.xml`), RTL config (`android:supportsRtl`, html dir, CSS), a11y attributes in UI. Evidence files inspected.

NEXT=Check bidi handling (dir attributes, unicode-bidi), text alignment, list/item mirroring, form fields (IME in RTL), icon mirroring needs, a11y focus/labels for Arabic strings.

LATER=TalkBack testing on Arabic locale (installed-device evidence), reduced motion verification, contrast checks, keyboard navigation in RTL.

TESTS=Deterministic: static checks (supportsRtl true if ar supported, dir set appropriately). E2E: RTL navigation, focus order. Android: a11y lint, build verification. Adversarial: mixed LTR/RTL content (numbers, URLs, emails, parentheses), long Arabic strings, nested bidi. Eval: distinguish mock vs Android build vs installed-device evidence.

RISKS=Incorrect bidi can garble text (security/readability). Missing RTL mirroring breaks layouts. Over/under-describing content for TalkBack. Reduced motion must not remove critical feedback. Cross-system: a11y touches UI across screens; ownership boundaries preserved.

FIRST_SLICE=Inspect: `android/app/src/main/AndroidManifest.xml` (`supportsRtl`), `android/app/src/main/res/values*/strings.xml` (presence of ar), web i18n files (`locales/ar/*`, `i18n/*`), UI templates/components for `dir`, `aria-*`, `lang="ar"`. Record file paths.

KNOWN_UNKNOWNS=Installed-device TalkBack behavior with Arabic, actual screen reader output semantics, device font rendering for Arabic, and motion preferences on device. Browser devtools insufficient alone for Android a11y. Need installed-device evidence to validate release blockers.

DOMAIN_VERDICT=RESEARCH_INSUFFICIENT (pending concrete inspection of locale/RTL/a11y assets and runtime evidence).

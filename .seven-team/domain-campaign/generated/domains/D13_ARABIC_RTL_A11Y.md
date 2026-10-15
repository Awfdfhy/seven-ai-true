# D13_ARABIC_RTL_A11Y — Arabic / RTL / Bidi / Accessibility

Research audit: READY

DOMAIN_ID=D13_ARABIC_RTL_A11Y

SOURCE_ANALYSIS=Harvested sources collectively point to: WCAG 2.x (POUR) for content/accessibility [SOURCE primary] https://www.w3.org/WAI/standards-guidelines/wcag/; Android localization best practices (locale resources, alternative resources, RTL/LTR) [SOURCE primary] https://developer.android.com/guide/topics/resources/localization and Arabic-localized variant [SOURCE primary] https://developer.android.com/guide/topics/resources/localization?hl=ar; Android accessibility guidance (TalkBack, focus, semantics, a11y attributes) [SOURCE primary] https://developer.android.com/guide/topics/ui/accessibility and ar variant [SOURCE primary] https://developer.android.com/topic/architecture/recommendations?hl=ar (context). Key points: direction must be set at root (html/body dir) and follow locale; bidi needs care (unicode-bidi, plaintext for user text vs LTR for code); layout mirroring via CSS logical props or dir-based rules; accessible names, focus order, keyboard operability, sufficient contrast; reduced motion considerations. Limitations: harvested pages are primarily guidelines (not Seven-specific runtime behavior). No Seven APK a11y audit in harvested set; no screen-reader traversal evidence, no IME/keyboard focus traces, no reduced motion runtime evidence. Freshness: Android/W3C guidance current; localized pages present. Disagreements: none obvious. Gaps: need concrete runtime evidence for Seven (dir state, focus trap, ARIA, keyboard) — not present in harvested web text alone.

CURRENT=Browser/WebView evidence from repo (not Android installed device, not APK instrumented). Verified: 
- isAr detected independently in >=5 bundles (`seven-shell.js`, `coding.js`, `rpg.js`, `seven-shell-final.js`, `ui-polish-fixes.js`, `github-self-dev.js`, `beta-ui-runtime.js`) — duplicated strategy, no shared catalog; runtime locale change cannot broadcast to mounted workspaces (A03 F1).
- Arabic coverage uneven: `release-verify.cjs` 30, `github-self-dev.js` 15, `seven-shell.js` 14, `seven-shell-final.js` 11, `rpg.js` 7, `beta-ui-runtime.js` 7, `ui-polish-fixes.js` 5, `attachment-runtime.js` 3, `coding.js` 1; `research.js`, `hub.js`, `ui-runtime.js` have 0 Arabic glyphs (A03 F2).
- Despite detection, Chat empty state in `seven-shell.js` hardcoded English; theme control (`beta-ui-runtime.js`) English-only ternaries (A03 F3,F7).
- RTL CSS (`rtl.css`) targets `html[dir=rtl]` but no bundle writes `document.documentElement.dir` — selectors likely never matched. Only 3 RTL overrides (letter-spacing, justify-content). Code forced `direction:ltr` unconditionally (A03 F4).
- Modal systems fragmented (4 stylesheets) and `seven-shell-final.js` conflates `.settings-modal,.settings-panel,.modal` into same surface identity (`data-seven-shell-surface="settings"`) — generic dialogs treated as settings (A03 F5). Nav state split: shell uses `data-seven-shell-workspace` + `documentElement.dataset.sevenWorkspace`; hub uses `data-ws` + module-local `S.active` — race (A03 F6).
- No shared i18n module/dictionary/catalog under `release/`. No locale persistence/switch broadcast. No observed reduced motion, no focus trap/keyboard handling evidence for modals in this audit slice. Evidence level: browser static+runtime code inspection (mock/browser evidence) — not Android build/runtime device evidence.

TARGET=Deterministic Arabic/RTL/a11y foundation: single source of truth for locale/direction (ShellStore locale + dir, persisted). Central i18n catalog with ICU-friendly keys, default 'en', 'ar' supported; all workspaces consume same catalog (not per-bundle strings). `html[dir]` set on boot and on locale change (and mirrored to body as needed). Bidi-safe CSS: use logical properties where possible; keep `direction:ltr` + `unicode-bidi:isolate` for code blocks; use `unicode-bidi:plaintext` for user-generated text; comprehensive `[dir=rtl]` mirroring (nav, sidebar, tabs, launcher grid, modals, breadcrumbs, actions). Accessibility: proper roles/aria for modals, focus trap + focus return, ESC/keyboard operability, accessible names, reduced motion respect (`prefers-reduced-motion`), focus visible states, TalkBack-friendly semantics (Android WebView). Locale switch updates mounted workspaces atomically. Eliminate modal identity conflation; unify nav state (single source). No pixel-for-pixel imitation; preserve Seven identity.

NOW=Smallest high-value slice (release-blocking):
1. **Dir/locale bootstrap**: set `document.documentElement.dir = locale==='ar' ? 'rtl' : 'ltr'` on boot and react to locale changes; persist locale. Remove assumption RTL CSS is “on” without writing dir.
2. **Central i18n**: introduce minimal shared catalog (en/ar) for critical chrome (Chat empty state, New chat, Theme labels, nav/launcher labels). Replace hardcoded English in `seven-shell.js` empty state and `beta-ui-runtime.js` theme ternaries with catalog lookups; avoid duplicating isAr in new code (phase out duplicates).
3. **Modal identity fix**: stop conflating `.modal` with settings surface; scope surface tagging to settings-only selectors (`.settings-modal,.settings-panel`) and add data attributes per surface; ensure focus trap targets correct root.
4. **Nav state unification**: single source (ShellStore or `documentElement.dataset.sevenWorkspace`) consumed by both shell nav and hub; hub updates same source (or listens) to eliminate race.

NEXT=Improvements after NOW slice:
- Extend catalog to cover untranslated surfaces (coding.js partial, research.js, hub.js, ui-runtime.js) with consistent keys; add direction change broadcaster so mounted workspaces re-render.
- RTL rule expansion: add `[dir=rtl]` rules for sidebar/nav ordering, tab strips, launcher grid, modals, breadcrumbs, action alignment, focus rings; prefer CSS logical properties.
- A11y: modal ARIA (role=dialog, aria-modal, aria-labelledby), focus trap, initial focus, focus return on close, ESC handling, keyboard navigation for nav/launcher; ensure interactive elements have accessible names.
- Bidi: audit user-generated content areas (messages, research citations, outputs) — use `unicode-bidi:plaintext` where appropriate; preserve code blocks as LTR.
- Reduced motion: respect `prefers-reduced-motion` (animations/transitions in shell/ui).
- Locale switch UX: no layout shift, persist preference.

LATER=Longer-term ideas (non-blocking):
- Locale-aware number formatting, pluralization (Arabic plural rules) if strings expand.
- BiDi text in citations/titles (mixed scripts) QA.
- Android WebView a11y integration checks (TalkBack traversal, insets don’t obscure focus targets) — requires Android build/device evidence (D11 adjacent). 
- Screen reader E2E checks for critical flows.
- LTR variants for specific embeds if needed; avoid global overrides.

TESTS=Deterministic regression proof:
- **Unit**: dir set correctly on locale change; catalog returns correct strings for ar/en; modal tagging doesn’t leak `.modal` into settings surface.
- **DOM/state**: nav state sync (shell+hub) — no race on workspace switch; locale change updates all mounted workspace roots.
- **CSS/RTL**: rtl.css selectors match when dir=rtl; code blocks remain LTR; action alignment flips under RTL.
- **A11y**: modal focus trap/return, ESC closes, focus visible; interactive controls have accessible names; keyboard operability for nav/launcher.
- **Adversarial**: rapid locale switches, modal open during switch, hub+nav clicks interleaved; bidi with mixed Arabic/English/code.
- **Android (adjacent, evidence-backed)**: WebView a11y smoke if Android build available (TalkBack labels) — label as Android build evidence (not installed-device) when run.
- **E2E/browser**: Chat empty state shows Arabic when lang=ar+dir=rtl; Theme label localized; untranslated surfaces identified (regression guard prevents new hardcoded English in critical chrome).

RISKS=Security/privacy: no credentials/tokens in i18n; catalog static. Performance: minimal string lookups, no large bundles. Android/WebView: focus/IME overlap (adj to D11 IME/insets), TalkBack verbosity. RTL: layout mirroring edge cases (icons, transforms) — avoid pixel mirroring. Cross-system: modal identity conflation could affect other surfaces; nav race could desync UI state. Bidi: mixing LTR code in RTL can cause rendering glitches if not isolated. Locale switch: broadcasting to mounted workspaces must not cause leaks. Reduced motion: ensure critical a11y not blocked.

FIRST_SLICE=Smallest implementation that materially improves: (1) dir bootstrap + locale persistence, (2) minimal catalog + localize Chat empty state + Theme labels, (3) fix modal surface tagging (exclude generic `.modal`), (4) unify nav state (shell+hub share source). Each change deterministic + regression testable. This directly addresses dead RTL CSS, uneven coverage on first screen, modal mislabeling, nav race.

KNOWN_UNKNOWNS=Missing evidence:
- No APK a11y audit (TalkBack traversal, content descriptions) — Android build evidence needed, not yet present.
- No keyboard/focus traces for modals/nav in browser runtime logs.
- No reduced motion runtime behavior observed.
- No locale switch end-to-end across all workspaces (mounted simultaneously) — need verification.
- No screen reader semantics audit for research/citations, attachments.
- Installed-device evidence absent. Also unclear if Settings modal is only surface using `.settings-*` classes (A03 notes). Harvested sources give guidance but not Seven-specific proof.

DOMAIN_VERDICT=READY_FOR_PLAN

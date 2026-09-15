(() => {
  'use strict';

  const VERSION = '2026.09-mark-v1';
  const STYLE_MARKER = '--seven-mark-polish-v1';
  const HOME_VERSION = '2026.09-launchpad-v4';

  function mark(index = 0) {
    const gradient = `sevenMarkGradient${index}`;
    const highlight = `sevenMarkHighlight${index}`;
    const edge = `sevenMarkEdge${index}`;
    return `<svg class="v4-seven-mark seven-mark-polished" data-seven-mark-version="${VERSION}" viewBox="0 0 100 78" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${gradient}" x1="8" y1="8" x2="88" y2="69" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#35E7E9"/>
          <stop offset=".30" stop-color="#1DA7F6"/>
          <stop offset=".57" stop-color="#286DFF"/>
          <stop offset=".78" stop-color="#4D55FF"/>
          <stop offset="1" stop-color="#9668EF"/>
        </linearGradient>
        <linearGradient id="${highlight}" x1="12" y1="8" x2="72" y2="24" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity=".48"/>
          <stop offset=".46" stop-color="#CFFBFF" stop-opacity=".19"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${edge}" x1="40" y1="31" x2="48" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#4FE8F0" stop-opacity="0"/>
          <stop offset=".62" stop-color="#42DBEE" stop-opacity=".20"/>
          <stop offset="1" stop-color="#48E8F1" stop-opacity=".48"/>
        </linearGradient>
      </defs>
      <path class="seven-mark-body" fill="url(#${gradient})" d="M12.4 10.7C31.2 4.4 62.6 2.8 81.5 6.9c7.2 1.6 9.8 7.3 5.3 13.4L49.9 68.2c-3.6 4.7-9.8 5.3-14 1.5-3.5-3.2-3.4-7.6-.3-11.7l31.7-39.7C52 19.7 34.8 23.4 22.6 28.6c-7.5 3.2-15.2 1.5-18-4.5-2.4-5.3.9-11.2 7.8-13.4Z"/>
      <path class="seven-mark-highlight" fill="url(#${highlight})" d="M15.1 11.9C30.7 7.2 58.6 5.1 77.7 8.2 60.2 9.2 38.3 12.9 22.3 18.8c-6 2.2-10.8-.5-7.2-6.9Z"/>
      <path class="seven-mark-edge" fill="url(#${edge})" d="M46.6 49.2 35.6 58c-3.1 4.1-3.2 8.5.3 11.7 4.2 3.8 10.4 3.2 14-1.5l7.4-9.6-10.7-9.4Z"/>
    </svg>`;
  }

  const CSS = `
:root{--seven-mark-polish-v1:1}
.seven-mark-polished{display:block;width:100%;height:100%;overflow:visible;shape-rendering:geometricPrecision;transform-origin:center}
.v4-brand-mark .seven-mark-polished{transform:translateY(.5px) rotate(-.35deg);filter:drop-shadow(0 4px 8px rgba(38,111,255,.14))}
.v4-orb-core .seven-mark-polished{transform:scale(1.06) rotate(-.35deg);filter:drop-shadow(0 3px 7px rgba(28,124,255,.24))}
.seven-mark-polished .seven-mark-highlight{opacity:.78}
.seven-mark-polished .seven-mark-edge{opacity:.92}
body.seven-day .v4-brand-mark .seven-mark-polished{filter:drop-shadow(0 3px 7px rgba(38,97,219,.10))}
body.seven-day .v4-orb-core .seven-mark-polished{filter:drop-shadow(0 3px 7px rgba(38,97,219,.17))}
body.seven-lite .seven-mark-polished,body[data-seven-performance="lite"] .seven-mark-polished{filter:none!important}
body.seven-lite .seven-mark-polished .seven-mark-highlight,body[data-seven-performance="lite"] .seven-mark-polished .seven-mark-highlight{opacity:.52}
@media(max-width:345px){.v4-brand-mark .seven-mark-polished{transform:translateY(.5px) scale(.98)}.v4-orb-core .seven-mark-polished{transform:scale(1.03)}}
@media(prefers-reduced-motion:reduce){.seven-mark-polished{transition:none!important}}
`;

  function install(editor) {
    if (!editor || editor.__sevenMarkPolishV1Installed) return;
    editor.__sevenMarkPolishV1Installed = true;

    const ensureCss = () => {
      try {
        const css = String(editor.getCss?.() || '');
        if (!css.includes(STYLE_MARKER)) editor.addStyle(CSS);
      } catch (_) {}
    };

    let busy = false;
    const apply = () => {
      if (busy) return;
      ensureCss();
      let html = '';
      try { html = String(editor.getHtml?.() || ''); } catch (_) { return; }
      if (!html.includes(`data-seven-home-version="${HOME_VERSION}"`)) return;
      if (html.includes(`data-seven-mark-version="${VERSION}"`)) return;

      const oldMark = /<svg class="v4-seven-mark"[\s\S]*?<\/svg>/g;
      if (!oldMark.test(html)) return;
      oldMark.lastIndex = 0;

      let index = 0;
      const next = html
        .replace(oldMark, () => mark(index++))
        .replace(`data-seven-home-version="${HOME_VERSION}"`, `data-seven-home-version="${HOME_VERSION}" data-seven-mark-polish="${VERSION}"`);

      busy = true;
      try {
        editor.setComponents(next);
        ensureCss();
        window.dispatchEvent(new CustomEvent('seven-mark-polish-installed', { detail: { version: VERSION, count: index } }));
      } finally {
        setTimeout(() => { busy = false; }, 120);
      }
    };

    const queue = () => setTimeout(apply, 0);
    ensureCss();
    for (const name of ['load','project:load','storage:end:load','update']) editor.on(name, queue);
    window.addEventListener('seven-home-launchpad-v4-installed', queue);
    setTimeout(apply, 140);
    setTimeout(apply, 520);
    setTimeout(apply, 1200);
  }

  if (window.__sevenDesignEditor) install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready', event => install(event.detail?.editor || window.__sevenDesignEditor), { once: true });
})();

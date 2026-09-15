(() => {
  'use strict';

  const VERSION = '2026.09-mark-v2';
  const STYLE_MARKER = '--seven-mark-polish-v2';
  const HOME_VERSION = '2026.09-launchpad-v4';

  function mark(index = 0) {
    const loop = `sevenMarkLoop${index}`;
    const tail = `sevenMarkTail${index}`;
    const sheen = `sevenMarkSheen${index}`;
    const tailSheen = `sevenMarkTailSheen${index}`;
    return `<svg class="v4-seven-mark seven-mark-polished" data-seven-mark-version="${VERSION}" viewBox="0 0 100 78" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="${loop}" x1="8" y1="13" x2="88" y2="19" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#32BECF"/>
          <stop offset=".24" stop-color="#22D3EE"/>
          <stop offset=".54" stop-color="#4166F5"/>
          <stop offset=".78" stop-color="#4D58F4"/>
          <stop offset="1" stop-color="#8265DC"/>
        </linearGradient>
        <linearGradient id="${tail}" x1="78" y1="13" x2="39" y2="70" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#8265DC"/>
          <stop offset=".26" stop-color="#5260F2"/>
          <stop offset=".58" stop-color="#4166F5"/>
          <stop offset=".82" stop-color="#168EF5"/>
          <stop offset="1" stop-color="#32BECF"/>
        </linearGradient>
        <linearGradient id="${sheen}" x1="13" y1="9" x2="71" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity=".48"/>
          <stop offset=".36" stop-color="#DBFDFF" stop-opacity=".18"/>
          <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
        </linearGradient>
        <linearGradient id="${tailSheen}" x1="71" y1="21" x2="44" y2="67" gradientUnits="userSpaceOnUse">
          <stop offset="0" stop-color="#FFFFFF" stop-opacity=".14"/>
          <stop offset=".54" stop-color="#B7F6FF" stop-opacity=".09"/>
          <stop offset="1" stop-color="#B7F6FF" stop-opacity=".34"/>
        </linearGradient>
      </defs>
      <path class="seven-mark-loop" fill="url(#${loop})" fill-rule="evenodd" clip-rule="evenodd" d="M10.8 11.8C29.4 3.7 61.2 1.8 81.6 5.6c7.8 1.5 10.7 6.8 6.7 12.8-5.1 7.6-20.7 13-41.9 16.3-19.5 3-35.8 1.7-41-6.2-3.7-5.7-.9-12.2 5.4-16.7Zm12.4 8.5c-5.2 2.2-7.2 4.3-5.8 6.4 2.1 3.2 12.5 3.7 25.9 1.6 12.8-2 22.8-5.1 28.1-9.1-14.7-.9-33.5.8-48.2 1.1Z"/>
      <path class="seven-mark-tail" fill="url(#${tail})" d="M68.2 15.5c4.3-2.7 10-2.4 14 .6 4.1 3.1 4.8 8 1.5 12.3L50 69.1c-3.5 4.3-9.6 5-13.8 1.7-4.2-3.2-4.5-7.8-1.2-12.1l33.2-43.2Z"/>
      <path class="seven-mark-fold" fill="#071B68" fill-opacity=".26" d="M67.2 16.3c5.4-3.3 11.5-2.8 15.2.2-3.6 5.7-9.3 10.7-16.8 14.9l-7.7-5.5 9.3-9.6Z"/>
      <path class="seven-mark-highlight" fill="url(#${sheen})" d="M13.5 12.4C29.6 6.6 57.7 4.7 77.4 7.9c-17.4.6-39.6 3.6-55.8 9.5-6 2.2-10.5 1.2-8.1-5Z"/>
      <path class="seven-mark-tail-highlight" fill="url(#${tailSheen})" d="M72.2 19.2 42 59.8c-2.4 3.3-2.5 6.4-.6 9 2.6-.3 4.9-1.7 6.7-4L79 27.6c2.5-3.2 2.4-6.4.4-8.7-2.2-1.5-4.8-1.4-7.2.3Z"/>
    </svg>`;
  }

  const CSS = `
:root{--seven-mark-polish-v2:1}
.seven-mark-polished{display:block;width:100%;height:100%;overflow:visible;shape-rendering:geometricPrecision;transform-origin:center}
.v4-brand-mark{width:47px;height:37px}
.v4-brand-mark .seven-mark-polished{transform:translateY(.4px) rotate(-.45deg) scale(1.01);filter:drop-shadow(0 4px 8px rgba(38,111,255,.16))}
.v4-orb-core{width:41px;height:32px}
.v4-orb-core .seven-mark-polished{transform:scale(1.06) rotate(-.35deg);filter:none}
.seven-mark-polished .seven-mark-highlight{opacity:.86}
.seven-mark-polished .seven-mark-tail-highlight{opacity:.92}
.seven-mark-polished .seven-mark-fold{opacity:.82}
body.seven-day .v4-brand-mark .seven-mark-polished{filter:drop-shadow(0 3px 7px rgba(38,97,219,.10)) saturate(1.04) contrast(1.015)}
body.seven-day .v4-orb-core .seven-mark-polished{filter:saturate(1.035) contrast(1.01)}
body.seven-lite .seven-mark-polished,body[data-seven-performance="lite"] .seven-mark-polished{filter:none!important}
body.seven-lite .seven-mark-polished .seven-mark-highlight,body[data-seven-performance="lite"] .seven-mark-polished .seven-mark-highlight{opacity:.54}
body.seven-lite .seven-mark-polished .seven-mark-tail-highlight,body[data-seven-performance="lite"] .seven-mark-polished .seven-mark-tail-highlight{opacity:.58}
@media(max-width:345px){.v4-brand-mark{width:44px;height:35px}.v4-brand-mark .seven-mark-polished{transform:translateY(.4px) scale(.99)}.v4-orb-core{width:39px;height:30px}.v4-orb-core .seven-mark-polished{transform:scale(1.04)}}
@media(prefers-reduced-motion:reduce){.seven-mark-polished{transition:none!important}}
`;

  function install(editor) {
    if (!editor || editor.__sevenMarkPolishV2Installed) return;
    editor.__sevenMarkPolishV2Installed = true;

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

      const oldMark = /<svg class="v4-seven-mark(?: seven-mark-polished)?"[\s\S]*?<\/svg>/g;
      if (!oldMark.test(html)) return;
      oldMark.lastIndex = 0;

      let index = 0;
      const next = html
        .replace(oldMark, () => mark(index++))
        .replace(/data-seven-mark-polish="[^"]*"/g, '')
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

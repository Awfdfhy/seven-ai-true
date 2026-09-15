(() => {
  'use strict';

  const VERSION = 'site-polish-v1';
  const STYLE_MARKER = '--seven-mark-site-polish-v1';

  const MARK = `<svg class="v4-seven-mark v5-seven-mark" viewBox="0 0 100 76" aria-hidden="true" focusable="false" data-seven-mark-version="${VERSION}">
    <defs>
      <linearGradient id="v5SevenGradient" x1="9" y1="10" x2="88" y2="67" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#32BECF"/>
        <stop offset=".23" stop-color="#25CFE0"/>
        <stop offset=".48" stop-color="#4166F5"/>
        <stop offset=".72" stop-color="#3158EE"/>
        <stop offset="1" stop-color="#8265DC"/>
      </linearGradient>
      <linearGradient id="v5SevenSheen" x1="13" y1="8" x2="72" y2="34" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity=".48"/>
        <stop offset=".32" stop-color="#C8FBFF" stop-opacity=".18"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="v5SevenFold" x1="65" y1="18" x2="39" y2="61" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#122C9A" stop-opacity=".56"/>
        <stop offset=".45" stop-color="#183FD0" stop-opacity=".18"/>
        <stop offset="1" stop-color="#102A9A" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <path class="v5-ribbon" fill="url(#v5SevenGradient)" d="M11.8 11.7C29.4 4.1 61.7 1.9 81.5 5.5c8.2 1.5 10.7 7.1 6.2 13.4L49.4 68.2c-3 3.9-8.1 4.9-12.2 2.2-4.5-3-5-7.4-1.8-11.8l31.2-39.5c-14.4 1.1-31.8 4.6-44.4 9.9-8.8 3.7-16.6 1.1-18.2-5.8-1.5-6.2 1.7-9.4 7.8-11.5Z"/>
    <path class="v5-sheen" fill="url(#v5SevenSheen)" d="M14.6 12.4c15.8-5.4 43.8-7 62.6-4-15.7 1.4-37 5.3-52.4 11.5-7.6 3.1-12.8.9-10.2-7.5Z"/>
    <path class="v5-fold" fill="url(#v5SevenFold)" d="M65.7 19.2c5.2-.8 10.4-1.2 15.8-1.4L48 61.5c-3 3.8-5.9 5.9-9.7 5.8 1.2-2 2.8-4.1 4.7-6.6l22.7-41.5Z"/>
    <path class="v5-tip" fill="#38D5E3" fill-opacity=".24" d="M35.4 58.5c-2.6 3.7-2.4 7.9 1.8 11.8 2.6 1.7 5.5 1.9 8.1.9-4.1-1.4-6.7-5-6-9.6l-3.9-3.1Z"/>
  </svg>`;

  const CSS = `
:root{--seven-mark-site-polish-v1:1}
.v5-seven-mark{display:block;width:100%;height:100%;overflow:visible;transform:translateZ(0);shape-rendering:geometricPrecision}
.v4-brand-mark{width:46px;height:36px}
.v4-brand-mark .v5-seven-mark{filter:drop-shadow(0 5px 9px rgba(38,103,235,.20));transform:rotate(-1deg) scale(1.01);transform-origin:50% 50%}
.v4-orb-core{width:41px;height:31px}
.v4-orb-core .v5-seven-mark{filter:none;transform:scale(1.04);transform-origin:50% 50%}
.v5-seven-mark .v5-sheen{opacity:.92}
.v5-seven-mark .v5-fold{opacity:.76}
.v5-seven-mark .v5-tip{opacity:.82}
body.seven-day .v4-brand-mark .v5-seven-mark{filter:drop-shadow(0 4px 8px rgba(44,93,191,.12)) saturate(1.04) contrast(1.015)}
body.seven-day .v4-orb-core .v5-seven-mark{filter:saturate(1.03)}
body.seven-lite .v5-seven-mark,body[data-seven-performance="lite"] .v5-seven-mark{filter:none!important}
@media(max-width:345px){.v4-brand-mark{width:43px;height:34px}.v4-orb-core{width:39px;height:30px}}
@media(prefers-reduced-motion:reduce){.v5-seven-mark{transform:none!important}}
`;

  function ensureCss(editor) {
    try {
      const current = String(editor.getCss?.() || '');
      if (!current.includes(STYLE_MARKER)) editor.addStyle(CSS);
    } catch (_) {}
  }

  function replaceMarks(editor) {
    if (!editor) return;
    ensureCss(editor);
    let marks = [];
    try { marks = editor.getWrapper().find('.v4-seven-mark') || []; } catch (_) { return; }
    for (const mark of marks) {
      try {
        const attrs = mark.getAttributes?.() || {};
        if (attrs['data-seven-mark-version'] === VERSION) continue;
        mark.replaceWith(MARK);
      } catch (_) {}
    }
  }

  function install(editor) {
    if (!editor || editor.__sevenMarkPolishV1Installed) return;
    editor.__sevenMarkPolishV1Installed = true;
    let queued = false;
    const queue = () => {
      if (queued) return;
      queued = true;
      setTimeout(() => {
        queued = false;
        replaceMarks(editor);
      }, 0);
    };
    ensureCss(editor);
    queue();
    for (const event of ['load','project:load','storage:end:load','update']) editor.on(event, queue);
    window.addEventListener('seven-home-launchpad-v4-installed', queue);
    setTimeout(queue, 120);
    setTimeout(queue, 450);
    setTimeout(queue, 1000);
  }

  if (window.__sevenDesignEditor) install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready', event => install(event.detail?.editor || window.__sevenDesignEditor));
})();

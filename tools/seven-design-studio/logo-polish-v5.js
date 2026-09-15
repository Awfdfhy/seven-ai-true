(() => {
  'use strict';

  const VERSION = '2026.09-logo-polish-v5';
  const STYLE_MARKER = '--seven-logo-polish-v5';

  const LOGO = `<svg class="v4-seven-mark v5-seven-mark" viewBox="0 0 112 92" aria-hidden="true" focusable="false" data-seven-logo-version="${VERSION}">
    <defs>
      <linearGradient id="sevenV5Main" x1="10" y1="15" x2="100" y2="84" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#32BECF"/>
        <stop offset=".22" stop-color="#29B8F4"/>
        <stop offset=".48" stop-color="#2F7EFF"/>
        <stop offset=".72" stop-color="#4166F5"/>
        <stop offset="1" stop-color="#8265DC"/>
      </linearGradient>
      <linearGradient id="sevenV5Depth" x1="79" y1="25" x2="50" y2="87" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#2B53E8" stop-opacity=".18"/>
        <stop offset=".55" stop-color="#244DE0" stop-opacity=".62"/>
        <stop offset="1" stop-color="#153BC9" stop-opacity=".18"/>
      </linearGradient>
      <linearGradient id="sevenV5Sheen" x1="14" y1="14" x2="84" y2="28" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="#FFFFFF" stop-opacity=".48"/>
        <stop offset=".28" stop-color="#FFFFFF" stop-opacity=".20"/>
        <stop offset=".72" stop-color="#FFFFFF" stop-opacity=".04"/>
        <stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/>
      </linearGradient>
      <linearGradient id="sevenV5Tip" x1="42" y1="71" x2="59" y2="89" gradientUnits="userSpaceOnUse">
        <stop stop-color="#3BD6F2" stop-opacity="0"/>
        <stop offset="1" stop-color="#49DDEC" stop-opacity=".74"/>
      </linearGradient>
    </defs>
    <path class="v5-body" fill="url(#sevenV5Main)" d="M18.8 16.8C39.9 7.5 75.8 6.2 97.2 11.4c9.9 2.4 13.3 10.4 7.4 18.8L63.5 84.4c-3.8 5-10.2 6.2-15.3 3.2-5.9-3.5-6.8-9.6-2.7-15.1l36.2-43.6c-14.7 1.7-31.8 5.6-45.8 11.3-11.8 4.8-21.8 3.3-27.1-4.1-5.7-7.9-1.2-14.7 10-19.3Z"/>
    <path class="v5-depth" fill="url(#sevenV5Depth)" d="M81.8 28.9c6.7-1.1 13.6-1.1 18.9.2L63.4 84.5c-3.8 5-10.2 6.2-15.3 3.2-1.9-1.1-3.4-2.5-4.4-4.1 2.4 1.1 5.2 1 7.4-.3 2.2-1.2 4.2-3.3 6-5.8l24.7-48.6Z"/>
    <path class="v5-sheen" fill="url(#sevenV5Sheen)" d="M20.7 18.4C40.8 10.5 72 9.4 93 13.4c-17.4.6-42.8 4.9-59.2 11.2-8.7 3.4-15 3.6-18.7 1.2-2.8-1.9-1.1-4.7 5.6-7.4Z"/>
    <path class="v5-tip" fill="url(#sevenV5Tip)" d="M45.5 72.5 57 58.7c-3.4 9.9-5.1 18.9-5.1 27.7-1.3.1-2.6-.2-3.7-.8-5.9-3.5-6.8-9.6-2.7-13.1Z"/>
  </svg>`;

  const CSS = `
:root{--seven-logo-polish-v5:1}
.v5-seven-mark{display:block;width:100%;height:100%;overflow:visible;filter:drop-shadow(0 5px 10px rgba(23,82,225,.18));shape-rendering:geometricPrecision}
.v4-brand-mark{width:46px;height:37px}
.v4-brand{gap:11px}
.v4-orb-core{width:42px;height:33px}
.v4-orb-core .v5-seven-mark{filter:none}
.v4-orb-core .v5-sheen{opacity:.48}
.v4-orb-core .v5-depth{opacity:.82}
body.seven-day .v5-seven-mark{filter:drop-shadow(0 4px 8px rgba(35,78,164,.12))}
body.seven-day .v4-orb-core .v5-seven-mark{filter:none}
body.seven-lite .v5-seven-mark,body[data-seven-performance="lite"] .v5-seven-mark{filter:none}
@media(max-width:345px){.v4-brand-mark{width:43px;height:35px}.v4-brand{gap:9px}.v4-orb-core{width:40px;height:31px}}
@media(prefers-reduced-motion:reduce){.v5-seven-mark{filter:none}}
`;

  function install(editor) {
    if (!editor || editor.__sevenLogoPolishV5Installed) return;
    editor.__sevenLogoPolishV5Installed = true;

    const cssNow = typeof editor.getCss === 'function' ? editor.getCss() : '';
    if (!String(cssNow).includes(STYLE_MARKER)) editor.addStyle(CSS);

    let busy = false;
    const apply = () => {
      if (busy || typeof editor.getHtml !== 'function') return;
      const html = String(editor.getHtml() || '');
      if (!html.includes('data-seven-home-version="2026.09-launchpad-v4"')) return;
      if (html.includes(`data-seven-logo-version="${VERSION}"`)) return;

      const replaced = html.replace(/<svg class="v4-seven-mark"[\s\S]*?<\/svg>/g, LOGO);
      if (replaced === html) return;

      busy = true;
      try {
        editor.setComponents(replaced);
        window.dispatchEvent(new CustomEvent('seven-logo-polish-v5-installed', { detail: { version: VERSION } }));
      } finally {
        setTimeout(() => { busy = false; }, 120);
      }
    };

    apply();
    editor.on('update', () => setTimeout(apply, 0));
    window.addEventListener('seven-home-launchpad-v4-installed', () => setTimeout(apply, 0));
  }

  if (window.__sevenDesignEditor) install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready', event => install(event.detail?.editor || window.__sevenDesignEditor), { once: true });
})();

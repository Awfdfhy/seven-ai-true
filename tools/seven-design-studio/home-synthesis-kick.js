(() => {
  'use strict';

  let cssPromise = null;
  const TOUCH_OVERRIDE = '.v3-circle,.v3-voice{width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important}';

  const readHomeCss = async () => {
    if (cssPromise) return cssPromise;
    cssPromise = fetch('./home-synthesis-v3.js', { cache: 'no-store' })
      .then(response => response.ok ? response.text() : '')
      .then(source => {
        const token = 'const CSS = `';
        const start = source.indexOf(token);
        if (start < 0) return '';
        const bodyStart = start + token.length;
        const end = source.indexOf('`;\n\n  function install', bodyStart);
        return end > bodyStart ? source.slice(bodyStart, end) : '';
      })
      .catch(() => '');
    return cssPromise;
  };

  const nudge = editor => {
    if (!editor) return;
    setTimeout(async () => {
      try {
        const css = await readHomeCss();
        const current = typeof editor.getCss === 'function' ? String(editor.getCss()) : '';
        if (css && !current.includes('--seven-home-synthesis-v3')) editor.addStyle(css);
        if (!String(editor.getCss?.() || '').includes('min-width:44px!important')) editor.addStyle(TOUCH_OVERRIDE);
        if (typeof editor.trigger === 'function') editor.trigger('update');
      } catch (_) {}
    }, 0);
  };

  if (window.__sevenDesignEditor) nudge(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready', event => nudge(event.detail?.editor || window.__sevenDesignEditor));
})();

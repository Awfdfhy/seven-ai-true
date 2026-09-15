(() => {
  'use strict';

  let cssPromise = null;

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
        if (css && typeof editor.getCss === 'function' && !String(editor.getCss()).includes('--seven-home-synthesis-v3')) {
          editor.addStyle(css);
        }
        if (typeof editor.trigger === 'function') editor.trigger('update');
      } catch (_) {}
    }, 0);
  };

  if (window.__sevenDesignEditor) nudge(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready', event => nudge(event.detail?.editor || window.__sevenDesignEditor));
})();

(() => {
  'use strict';

  const nudge = editor => {
    if (!editor) return;
    setTimeout(() => {
      try {
        if (typeof editor.trigger === 'function') editor.trigger('update');
      } catch (_) {}
    }, 0);
  };

  if (window.__sevenDesignEditor) nudge(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready', event => nudge(event.detail?.editor || window.__sevenDesignEditor));
})();

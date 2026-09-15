(() => {
  'use strict';
  const api = window.grapesjs;
  if (!api || api.__sevenDesignWrapped) return;

  const originalInit = api.init.bind(api);
  api.init = function sevenDesignInit(...args) {
    const editor = originalInit(...args);
    window.__sevenDesignEditor = editor;
    window.dispatchEvent(new CustomEvent('seven-design-editor-ready', { detail: { editor } }));
    return editor;
  };

  Object.defineProperty(api, '__sevenDesignWrapped', { value: true, configurable: false });
})();

/* Seven RPG standalone entrypoint. Loaded ONLY in ai.seven.rpg builds. */
(function (win, doc) {
  'use strict';
  if (!win || !doc) return;
  doc.documentElement.dataset.sevenStandaloneProfile = 'rpg';
  doc.title = 'Seven RPG';
  var busy = false;
  var ready = false;
  var tries = 0;
  function report(message) {
    doc.documentElement.dataset.sevenStandaloneError = String(message || 'unknown').slice(0, 120);
    var el = doc.getElementById('seven-rpg-standalone-status');
    if (!el) {
      el = doc.createElement('p');
      el.id = 'seven-rpg-standalone-status';
      el.setAttribute('role', 'alert');
      el.style.cssText = 'position:fixed;bottom:100px;left:10%;right:10%;padding:12px;border-radius:12px;background:#332020;color:white;z-index:2147483640';
      (doc.body || doc.documentElement).appendChild(el);
    }
    el.textContent = 'RPG failed to start: ' + message;
  }
  function boot() {
    if (busy || ready) return;
    var shell = win.SevenShellFinal;
    if (!shell || typeof shell.openWorkspace !== 'function') {
      if (++tries < 160) win.setTimeout(boot, 250);
      else report('shell-unavailable');
      return;
    }
    busy = true;
    Promise.resolve(shell.openWorkspace('rpg')).then(function () {
      var workspaces = win.SevenWorkspaces;
      if (workspaces && workspaces.active() === 'rpg' && win.SevenRpgWorkspace) {
        ready = true;
        doc.documentElement.dataset.sevenStandaloneReady = '1';
      } else {
        busy = false;
        report('rpg-workspace-unavailable');
      }
    }).catch(function (error) {
      busy = false;
      report(error && error.message || 'rpg-start-error');
    });
  }
  doc.addEventListener('seven:shellfinalready', boot);
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(typeof window !== 'undefined' ? window : null, typeof document !== 'undefined' ? document : null);

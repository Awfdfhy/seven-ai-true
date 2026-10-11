/* Seven RPG standalone entrypoint. Loaded ONLY in ai.seven.rpg builds. */
(function (win, doc) {
  'use strict';
  if (!win || !doc) return;
  doc.documentElement.dataset.sevenStandaloneProfile = 'rpg';
  // The shared chat runtime may replace document.title when a room changes.
  // Keep the Android RPG profile's actual window title stable.
  function keepRpgTitle() {
    if (doc.title !== 'Seven RPG') doc.title = 'Seven RPG';
  }
  keepRpgTitle();
  var titleNode = doc.querySelector('head title');
  if (titleNode && typeof win.MutationObserver === 'function') {
    new win.MutationObserver(keepRpgTitle).observe(titleNode, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }
  doc.addEventListener('seven:roomchange', keepRpgTitle);
  doc.addEventListener('seven:roomchange', function () { if (ready) starterPanel(); });
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
  // Fresh-install RPG experience. The world is committed through the existing
  // transactional RPG bridge; no model output is treated as authoritative state.
  function starterPanel() {
    var host = doc.querySelector('.seven-rpg-chatbar');
    var api = win.SevenRpgWorkspace;
    if (!host || !api || !api.state) return;
    var existing = doc.getElementById('seven-rpg-first-run');
    if (existing) existing.remove();
    if (api.state.worldEngine && api.state.worldSession) return;
    var panel = doc.createElement('section');
    panel.id = 'seven-rpg-first-run';
    panel.setAttribute('aria-label', 'Start RPG world');
    panel.style.cssText = 'margin:12px;padding:16px;border-radius:16px;border:1px solid var(--sb-b,#64748b);background:var(--sb-s,#15191e);color:var(--sb-t,#eee);display:grid;gap:10px;';
    var heading = doc.createElement('strong');
    heading.textContent = 'Create your first world · أنشئ عالمك الأول';
    heading.style.cssText = 'font-size:1.1rem';
    var hint = doc.createElement('p');
    hint.textContent = 'Give your story a name. Your first scene is yours to write; the narrator must not decide your character’s actions.';
    hint.style.cssText = 'margin:0;font-size:.85rem;opacity:.83';
    var worldName = doc.createElement('input');
    worldName.id = 'seven-rpg-world-name';
    worldName.setAttribute('aria-label', 'World name');
    worldName.placeholder = 'World name / اسم العالم';
    worldName.maxLength = 80;
    worldName.value = 'My World';
    worldName.style.cssText = 'width:100%;min-height:44px;border-radius:10px;padding:8px;background:var(--sb-s2,#252e31);color:inherit;border:1px solid var(--sb-b,#57616b);font:inherit';
    var premise = doc.createElement('textarea');
    premise.id = 'seven-rpg-opening-scene';
    premise.setAttribute('aria-label', 'Opening scene');
    premise.placeholder = 'Describe your opening scene / صف المشهد الأول';
    premise.maxLength = 600;
    premise.rows = 3;
    premise.style.cssText = 'width:100%;min-height:70px;border-radius:10px;padding:8px;background:var(--sb-s2,#252e31);color:inherit;border:1px solid var(--sb-b,#57616b);font:inherit';
    var button = doc.createElement('button');
    button.id = 'seven-rpg-create-world';
    button.type = 'button';
    button.textContent = 'Create World · إنشاء العالم';
    button.style.cssText = 'min-height:44px;background:#4166f5;color:white;border:0;border-radius:12px;padding:10px 16px;font:inherit;font-weight:700';
    var error = doc.createElement('p');
    error.setAttribute('role', 'status');
    error.style.cssText = 'margin:0;font-size:.8rem;min-height:1em;color:#ffb6b6';
    button.addEventListener('click', function () {
      var title = worldName.value.trim();
      if (!title) { error.textContent = 'Choose a world name first.'; return; }
      button.disabled = true;
      try {
        var world = {
          id: 'rpg-freeform-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
          title: title,
          version: '1.0.0',
          continuity: 'freeform',
          beats: [],
          sources: []
        };
        api.loadWork(world);
        // Do not send text automatically. The user controls their first action.
        var input = doc.getElementById('userInput');
        if (input && !input.value.trim()) {
          input.value = 'We are beginning a new RPG story in "' + title + '". ' +
            'Describe the opening scene and NPC actions, respecting established canon. ' +
            'Never invent dialogue, decisions or actions for my player character.' +
            (premise.value.trim() ? '\nOpening premise: ' + premise.value.trim() : '');
          input.dispatchEvent(new Event('input', {bubbles: true}));
        }
        panel.remove();
        if (input) input.focus();
        doc.documentElement.dataset.sevenStandaloneWorldCreated = '1';
      } catch (cause) {
        button.disabled = false;
        error.textContent = 'World was not saved: ' + (cause && cause.message || 'unknown error');
      }
    });
    panel.append(heading, hint, worldName, premise, button, error);
    host.parentNode.insertBefore(panel, host);
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
        starterPanel();
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

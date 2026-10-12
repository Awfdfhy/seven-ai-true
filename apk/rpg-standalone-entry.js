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
  // Let the RPG workspace finish room hydration before checking whether a world exists.
  doc.addEventListener('seven:roomchange', function () { if (ready) win.setTimeout(starterPanel, 0); });
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
  // RPG-only world inspection and portable local backup; never modify canonical state.
  function mountWorldPanel() {
    var bar=doc.querySelector('.seven-rpg-chat-actions');
    if(!bar||doc.getElementById('seven-rpg-world-button'))return;
    var button=doc.createElement('button');
    button.type='button';button.id='seven-rpg-world-button';
    button.className='seven-rpg-mini';
    button.textContent='◈ World · العالم';
    button.setAttribute('aria-expanded','false');
    button.setAttribute('aria-controls','seven-rpg-world-panel');
    var panel=doc.createElement('section');
    panel.id='seven-rpg-world-panel';
    panel.hidden=true;
    panel.setAttribute('aria-label','RPG world information');
    panel.innerHTML='<strong id="seven-rpg-world-heading"></strong><p id="seven-rpg-world-summary"></p><button type="button" id="seven-rpg-export-world">Export world backup · تصدير نسخة</button><label for="seven-rpg-import-world">Import backup · استيراد عالم</label><input id="seven-rpg-import-world" aria-label="Import RPG world backup JSON" type="file" accept=".json,application/json"><p id="seven-rpg-world-backup-status" role="status"></p>';
    var host=doc.querySelector('.seven-rpg-chatbar');
    if(!host||!host.parentNode)return;
    host.parentNode.insertBefore(panel,host.nextSibling);
    function render() {
      var api=win.SevenRpgWorkspace;
      var state=api&&api.state;
      var work=state&&state.worldEngine&&state.worldEngine.work;
      doc.getElementById('seven-rpg-world-heading').textContent=work?String(work.title||'Unnamed World'):'No active world · لا يوجد عالم';
      doc.getElementById('seven-rpg-world-summary').textContent=work?'World ID: '+String(work.id||'local')+' · Player actions remain under your control.':'Create a world first to enable backup.';
      doc.getElementById('seven-rpg-export-world').disabled=!work;
    }
    button.addEventListener('click',function(){
      panel.hidden=!panel.hidden;
      button.setAttribute('aria-expanded',String(!panel.hidden));
      if(!panel.hidden)render();
    });
    panel.querySelector('#seven-rpg-export-world').addEventListener('click',function(){
      var api=win.SevenRpgWorkspace;
      try {
        var data=api&&api.snapshot&&api.snapshot();
        if(!data||!data.work)throw Error('No world available');
        var blob=new Blob([JSON.stringify({format:'seven-rpg-world-backup',version:1,exportedAt:new Date().toISOString(),data:data},null,2)],{type:'application/json'});
        // Never offer an export which the paired importer cannot restore.
        if(blob.size>2*1024*1024)throw Error('World backup exceeds the 2 MB import limit; export was not created');
        var url=URL.createObjectURL(blob),link=doc.createElement('a');
        link.href=url;link.download='seven-rpg-world-backup.json';
        doc.body.appendChild(link);link.click();link.remove();
        win.setTimeout(function(){URL.revokeObjectURL(url)},3000);
        doc.getElementById('seven-rpg-world-backup-status').textContent='Backup exported · تم تصدير النسخة';
      }catch(err){
        doc.getElementById('seven-rpg-world-backup-status').textContent='Backup failed: '+String(err&&err.message||err);
      }
    });
    panel.querySelector('#seven-rpg-import-world').addEventListener('change',async function(event){
      var file=event.target.files&&event.target.files[0],status=doc.getElementById('seven-rpg-world-backup-status');
      event.target.value='';
      if(!file)return;
      if(file.size>2*1024*1024){status.textContent='Backup is too large (2 MB limit).';return;}
      try{
        var parsed=JSON.parse(await file.text());
        if(!parsed||parsed.format!=='seven-rpg-world-backup'||parsed.version!==1||!parsed.data||!parsed.data.work)throw Error('Unsupported RPG backup format');
        var work=parsed.data.work;
        if(!work||typeof work!=='object'||typeof work.id!=='string'||typeof work.title!=='string'||!Array.isArray(work.beats)||work.title.length>120)throw Error('Invalid world details');
        if(!win.confirm('Import "'+work.title.slice(0,80)+'"? This replaces the active RPG world in this chat. Export a backup first if needed.')){status.textContent='Import cancelled';return;}
        var api=win.SevenRpgWorkspace;
        if(!api||typeof api.loadWork!=='function')throw Error('RPG persistence unavailable');
        api.loadWork(work);
        // Canon import is a separate transaction; never silently restore half
        // of a multi-part snapshot after a successful world commit.
        status.textContent=parsed.data.canonPack
          ? 'World imported. Canon backup retained in JSON; restore canon separately. · تم استيراد العالم فقط'
          : 'World imported · تم استيراد العالم';
        render();
        starterPanel();
      }catch(error){status.textContent='Import failed: '+String(error&&error.message||error);}
    });
    bar.insertBefore(button,bar.firstChild);
  }
  // Keep model selection reachable without exposing unrelated Seven AI workspaces.
  function mountRpgModelControl() {
    var bar = doc.querySelector('.seven-rpg-chat-actions');
    if (!bar || doc.getElementById('seven-rpg-model-control')) return;
    var button = doc.createElement('button');
    button.type = 'button';
    button.id = 'seven-rpg-model-control';
    button.className = 'seven-rpg-mini';
    button.textContent = '✧ Model';
    button.setAttribute('aria-label', 'Choose RPG AI model');
    button.addEventListener('click', function () {
      if (typeof win.openSettings === 'function') win.openSettings();
      else {
        var modal = doc.getElementById('settingsModal');
        if (modal) modal.style.display = 'flex';
      }
      var select = doc.getElementById('modelSelect');
      if (select) {
        if (!select.value && select.options.length) select.selectedIndex = 0;
        var routing = doc.getElementById('routingModeSelect');
        if (routing && routing.value === 'auto') {
          // Automatic routing disables the preferred model picker by design.
          // Switch UI to manual only when the user chooses model selection.
          routing.value = 'manual';
          routing.dispatchEvent(new Event('change', {bubbles:true}));
        }
        select.disabled = false;
        select.focus();
      }
    });
    bar.insertBefore(button, bar.firstChild);
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
        mountRpgModelControl();
        mountWorldPanel();
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

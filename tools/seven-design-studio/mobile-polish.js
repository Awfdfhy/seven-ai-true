(() => {
  'use strict';

  const STORAGE_KEY = 'seven-design-studio-project-v1';
  const SETTINGS_KEY = 'seven-design-studio-settings-v1';
  const RECOVERY_KEY = 'seven-design-studio-recovery-v1';
  const GUIDE_KEY = 'seven-design-studio-guides-v1';
  const CACHE_NAME = 'seven-design-studio-v4';

  const previewFrame = document.getElementById('previewFrame');
  const previewBtn = document.getElementById('previewBtn');
  const exitPreview = document.getElementById('exitPreview');
  const previewLabel = document.getElementById('previewDeviceLabel');
  const themeBtn = document.getElementById('themeBtn');
  const dirBtn = document.getElementById('dirBtn');
  const densityBtn = document.getElementById('densityBtn');
  const sheet = document.getElementById('sheet');
  const sheetBody = document.getElementById('sheetBody');
  const closeSheet = document.getElementById('closeSheet');
  const saveState = document.getElementById('saveState');
  const phoneStage = document.getElementById('phoneStage');

  let recoveryTimer = 0;
  let recoveryDirty = false;

  const PREVIEW_GUARD_CSS = `
    :root{
      --s-bg:#0A1022;--s-surface:#111B2F;--s-surface2:#16233A;--s-text:#F4F6FB;
      --s-muted:#93A4BF;--s-line:#263653;--s-blue:#4166F5;--s-cyan:#32BECF;--s-violet:#8265DC;
      color-scheme:dark;
    }
    html,body{margin:0;min-height:100%;background:var(--s-bg);color:var(--s-text)}
    *{box-sizing:border-box}
    body:not(.seven-day){background:#0A1022!important;color:#F4F6FB!important;color-scheme:dark}
    body:not(.seven-day) .seven-screen{background:radial-gradient(circle at 78% -8%,rgba(65,102,245,.16),transparent 30%),#0A1022!important;color:#F4F6FB!important}
    body:not(.seven-day) .seven-card{background:#111B2F!important;color:#F4F6FB!important;border-color:#263653!important}
    body:not(.seven-day) .seven-composer{background:#111B2F!important;color:#F4F6FB!important;border-color:#2c3d5d!important}
    body:not(.seven-day) .seven-composer textarea{color:#F4F6FB!important;background:transparent!important}
    body:not(.seven-day) .seven-composer textarea::placeholder{color:#93A4BF!important;opacity:1}
    body:not(.seven-day) .seven-icon-btn{background:#111B2F!important;color:#F4F6FB!important;border-color:#263653!important}
    body:not(.seven-day) .seven-muted,body:not(.seven-day) .seven-eyebrow{color:#93A4BF!important}

    body.seven-day{
      --s-bg:#F4F6FB;--s-surface:#FFFFFF;--s-surface2:#EBF0F7;--s-text:#0A1022;
      --s-muted:#61708A;--s-line:#DCE3EE;color-scheme:light;
      background:#F4F6FB!important;color:#0A1022!important;
    }
    body.seven-day .seven-screen{background:radial-gradient(circle at 78% -8%,rgba(65,102,245,.08),transparent 30%),#F4F6FB!important;color:#0A1022!important}
    body.seven-day .seven-card{background:#FFFFFF!important;color:#0A1022!important;border-color:#DCE3EE!important}
    body.seven-day .seven-composer{background:#FFFFFF!important;color:#0A1022!important;border-color:#DCE3EE!important}
    body.seven-day .seven-composer textarea{color:#0A1022!important;background:transparent!important}
    body.seven-day .seven-composer textarea::placeholder{color:#61708A!important;opacity:1}
    body.seven-day .seven-icon-btn{background:#FFFFFF!important;color:#0A1022!important;border-color:#DCE3EE!important}
    body.seven-day .seven-muted,body.seven-day .seven-eyebrow{color:#61708A!important}

    button{min-width:44px;min-height:44px;touch-action:manipulation}
    button:focus-visible,textarea:focus-visible,input:focus-visible,select:focus-visible{outline:3px solid rgba(50,190,207,.72);outline-offset:2px}
    @media(max-width:340px){.seven-screen{padding-left:12px!important;padding-right:12px!important}.seven-intent{font-size:21px!important}}
    @media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
  `;

  function safeJSON(value, fallback) {
    try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
  }

  function escapeHTML(value='') {
    return String(value).replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  }

  function slug(value='seven-design') {
    return String(value).trim().toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/g,'-').replace(/^-+|-+$/g,'') || 'seven-design';
  }

  function notify(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(notify.timer);
    notify.timer = setTimeout(() => toast.classList.remove('show'), 1700);
  }

  function getSettings() {
    const saved = safeJSON(localStorage.getItem(SETTINGS_KEY), {});
    return {
      theme: saved.theme || ((themeBtn?.textContent || '').trim().toLowerCase() === 'day' ? 'day' : 'night'),
      dir: saved.dir || ((dirBtn?.textContent || '').trim().toLowerCase() === 'rtl' ? 'rtl' : 'ltr'),
      density: saved.density || (densityBtn?.textContent || 'balanced').trim().toLowerCase(),
      largeText: !!saved.largeText,
      reduced: !!saved.reduced,
      device: String(saved.device || document.getElementById('deviceSelect')?.value || '393'),
      docName: saved.docName || document.getElementById('docName')?.textContent || 'Untitled'
    };
  }

  function parsePreviewState() {
    const text = (previewLabel?.textContent || '').toLowerCase();
    return {
      theme: text.includes('· day ·') ? 'day' : 'night',
      dir: text.endsWith('rtl') ? 'rtl' : 'ltr'
    };
  }

  function guardPreview() {
    const doc = previewFrame?.contentDocument;
    if (!doc || !doc.head || !doc.body) return;
    const state = parsePreviewState();

    let style = doc.getElementById('seven-mobile-preview-guard');
    if (!style) {
      style = doc.createElement('style');
      style.id = 'seven-mobile-preview-guard';
      style.textContent = PREVIEW_GUARD_CSS;
      doc.head.appendChild(style);
    }

    doc.documentElement.style.colorScheme = state.theme === 'day' ? 'light' : 'dark';
    doc.documentElement.setAttribute('dir', state.dir);
    doc.body.classList.toggle('seven-day', state.theme === 'day');
    doc.body.classList.toggle('seven-rtl', state.dir === 'rtl');
    doc.body.setAttribute('dir', state.dir);
    doc.body.dataset.sevenPreviewTheme = state.theme;
    doc.body.dataset.sevenPreviewDirection = state.dir;

    let themeMeta = doc.querySelector('meta[name="theme-color"]');
    if (!themeMeta) {
      themeMeta = doc.createElement('meta');
      themeMeta.setAttribute('name','theme-color');
      doc.head.appendChild(themeMeta);
    }
    themeMeta.setAttribute('content', state.theme === 'day' ? '#F4F6FB' : '#0A1022');
  }

  function syncShellA11y() {
    const day = (themeBtn?.textContent || '').trim().toLowerCase() === 'day';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', '#07101F');
    document.documentElement.style.colorScheme = 'dark';
    if (themeBtn) themeBtn.setAttribute('aria-label', `Preview theme: ${day ? 'Day' : 'Night'}. Tap to switch.`);
    if (dirBtn) dirBtn.setAttribute('aria-label', `Preview direction: ${(dirBtn.textContent || 'LTR').trim()}. Tap to switch.`);
    if (densityBtn) densityBtn.setAttribute('aria-label', `Performance preview: ${(densityBtn.textContent || 'Balanced').trim()}. Tap to cycle.`);
  }

  function improveLabels() {
    document.querySelectorAll('.dock-button').forEach(btn => {
      const label = btn.querySelector('small')?.textContent?.trim();
      if (label) btn.setAttribute('aria-label', label);
    });
    const device = document.getElementById('deviceSelect');
    if (device) Array.from(device.options).forEach(option => {
      if (!/px$/i.test(option.textContent.trim())) option.textContent = `${option.value}px`;
    });
  }

  function getGuidePrefs() {
    const value = safeJSON(localStorage.getItem(GUIDE_KEY), {});
    return { grid: !!value.grid, safe: !!value.safe };
  }

  function ensureGuideOverlay() {
    if (!phoneStage) return null;
    let overlay = document.getElementById('sevenGuideOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'sevenGuideOverlay';
      overlay.className = 'seven-guide-overlay';
      overlay.setAttribute('aria-hidden','true');
      overlay.innerHTML = '<div class="seven-guide-grid" id="sevenGuideGrid"></div><div class="seven-guide-safe" id="sevenGuideSafe"><span></span></div>';
      phoneStage.appendChild(overlay);
    }
    return overlay;
  }

  function applyGuidePrefs() {
    const prefs = getGuidePrefs();
    const overlay = ensureGuideOverlay();
    if (!overlay) return;
    const grid = document.getElementById('sevenGuideGrid');
    const safe = document.getElementById('sevenGuideSafe');
    overlay.classList.toggle('on', prefs.grid || prefs.safe);
    if (grid) grid.style.display = prefs.grid ? 'block' : 'none';
    if (safe) safe.classList.toggle('on', prefs.safe);
    document.getElementById('gridGuidePolish')?.classList.toggle('guide-active', prefs.grid);
    document.getElementById('safeGuidePolish')?.classList.toggle('guide-active', prefs.safe);
  }

  function toggleGuide(type) {
    const prefs = getGuidePrefs();
    prefs[type] = !prefs[type];
    try { localStorage.setItem(GUIDE_KEY, JSON.stringify(prefs)); } catch (_) {}
    applyGuidePrefs();
    notify(`${type === 'grid' ? '8px grid' : 'Safe-area guides'} ${prefs[type] ? 'on' : 'off'}`);
  }

  function prototypeScript() {
    return `<script>(function(){document.addEventListener('click',function(e){var t=e.target.closest('[data-seven-action]');if(!t)return;var a=t.getAttribute('data-seven-action');if(a==='toast')notify('Prototype action');if(a==='open-command')notify('Command surface');if(a==='next-screen')notify('Navigate to linked screen');if(a==='toggle-state'){t.setAttribute('data-seven-state',t.getAttribute('data-seven-state')==='success'?'thinking':'success');}});function notify(m){var n=document.createElement('div');n.textContent=m;n.style='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#122039;color:white;padding:10px 14px;border-radius:12px;font:12px system-ui;z-index:9999';document.body.appendChild(n);setTimeout(function(){n.remove()},1300)}})();<\/script>`;
  }

  function buildHardenedHTML() {
    const editor = window.__sevenDesignEditor;
    if (!editor) return null;
    const settings = getSettings();
    const classes = [
      settings.theme === 'day' ? 'seven-day' : '',
      settings.dir === 'rtl' ? 'seven-rtl' : '',
      settings.largeText ? 'seven-large' : '',
      settings.density === 'lite' ? 'seven-lite' : '',
      settings.reduced ? 'seven-reduced' : ''
    ].filter(Boolean).join(' ');
    const themeColor = settings.theme === 'day' ? '#F4F6FB' : '#0A1022';
    return `<!doctype html><html lang="${settings.dir==='rtl'?'ar':'en'}" dir="${settings.dir}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content"><meta name="theme-color" content="${themeColor}"><meta name="color-scheme" content="dark light"><title>${escapeHTML(settings.docName)}</title><style>${editor.getCss()}\n${PREVIEW_GUARD_CSS}</style></head><body class="${classes}" dir="${settings.dir}" data-seven-export="hardened-v1">${editor.getHtml()}${prototypeScript()}</body></html>`;
  }

  function downloadText(name, content, type='text/plain') {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = name;
    anchor.style.display = 'none';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1800);
  }

  function flushProject() {
    const editor = window.__sevenDesignEditor;
    if (!editor) return false;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(editor.getProjectData()));
      if (saveState) saveState.textContent = 'Saved';
      return true;
    } catch (_) {
      if (saveState) saveState.textContent = 'Save failed';
      return false;
    }
  }

  function readRecovery() {
    const list = safeJSON(localStorage.getItem(RECOVERY_KEY), []);
    return Array.isArray(list) ? list : [];
  }

  function saveRecoverySnapshot({silent=false}={}) {
    const editor = window.__sevenDesignEditor;
    if (!editor) return false;
    try {
      const snapshot = { at: Date.now(), settings: getSettings(), project: editor.getProjectData() };
      const raw = JSON.stringify(snapshot);
      if (raw.length > 2400000) {
        if (!silent) notify('Project is too large for a local recovery snapshot');
        return false;
      }
      const existing = readRecovery();
      const next = [snapshot, ...existing].slice(0, 2);
      while (next.length > 1 && JSON.stringify(next).length > 3200000) next.pop();
      localStorage.setItem(RECOVERY_KEY, JSON.stringify(next));
      recoveryDirty = false;
      if (!silent) notify('Recovery snapshot saved');
      return true;
    } catch (_) {
      if (!silent) notify('Could not save recovery snapshot');
      return false;
    }
  }

  function restoreLatestRecovery() {
    const latest = readRecovery()[0];
    if (!latest) { notify('No recovery snapshot yet'); return; }
    if (!confirm('Restore the latest local recovery snapshot? Current unsaved edits will be replaced.')) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(latest.project));
      if (latest.settings) localStorage.setItem(SETTINGS_KEY, JSON.stringify(latest.settings));
      location.reload();
    } catch (_) { notify('Could not restore recovery snapshot'); }
  }

  async function copyHardenedHTML() {
    const html = buildHardenedHTML();
    if (!html) { notify('Editor is not ready'); return; }
    try {
      await navigator.clipboard.writeText(html);
      notify('Hardened HTML copied');
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = html;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      notify(ok ? 'Hardened HTML copied' : 'Clipboard unavailable');
    }
  }

  async function updateOfflineStatus() {
    const node = document.getElementById('offlineStatusPolish');
    if (!node) return;
    if (!('serviceWorker' in navigator) || !('caches' in window)) {
      node.textContent = 'Offline shell: unsupported in this browser.';
      return;
    }
    try {
      const keys = await caches.keys();
      if (!keys.includes(CACHE_NAME)) {
        node.textContent = 'Offline shell: preparing cache on this visit.';
        return;
      }
      const cache = await caches.open(CACHE_NAME);
      const core = await cache.match('https://unpkg.com/grapesjs@0.23.6/dist/grapes.min.js');
      node.textContent = core ? 'Offline shell: ready after this successful online load.' : 'Offline shell: local UI cached; GrapesJS cache still preparing.';
    } catch (_) { node.textContent = 'Offline shell: status unavailable.'; }
  }

  function augmentMorePanel() {
    const exportBtn = document.getElementById('exportHtml');
    if (!exportBtn || document.getElementById('sevenMobileReliability')) return;

    const section = document.createElement('section');
    section.className = 'section';
    section.id = 'sevenMobileReliability';
    section.innerHTML = `
      <div class="section-title"><h3>Mobile reliability</h3><span>local · unlimited</span></div>
      <div class="action-row">
        <button class="action" id="copyHtmlPolish" type="button">Copy HTML</button>
        <button class="action" id="snapshotPolish" type="button">Recovery snapshot</button>
        <button class="action ghost" id="restorePolish" type="button">Restore latest</button>
      </div>
      <div class="section-title" style="margin-top:14px"><h3>Canvas guides</h3><span>non-exported</span></div>
      <div class="action-row">
        <button class="action ghost" id="gridGuidePolish" type="button">8px grid</button>
        <button class="action ghost" id="safeGuidePolish" type="button">Safe-area guides</button>
      </div>
      <div class="hint" id="offlineStatusPolish" style="margin-top:9px">Offline shell: checking…</div>
      <div class="hint" style="margin-top:7px">HTML export is hardened with the same Night/Day contrast guard used by Prototype Preview. Recovery snapshots stay only on this device. Guides are editor-only and never enter exported UI.</div>
    `;
    sheetBody.appendChild(section);
    document.getElementById('copyHtmlPolish').onclick = copyHardenedHTML;
    document.getElementById('snapshotPolish').onclick = () => saveRecoverySnapshot();
    document.getElementById('restorePolish').onclick = restoreLatestRecovery;
    document.getElementById('gridGuidePolish').onclick = () => toggleGuide('grid');
    document.getElementById('safeGuidePolish').onclick = () => toggleGuide('safe');
    applyGuidePrefs();
    updateOfflineStatus();
  }

  function attachEditorReliability(editor) {
    if (!editor || editor.__sevenMobileReliabilityAttached) return;
    editor.__sevenMobileReliabilityAttached = true;
    editor.on('update', () => {
      recoveryDirty = true;
      clearTimeout(recoveryTimer);
      recoveryTimer = setTimeout(() => {
        if (recoveryDirty) saveRecoverySnapshot({silent:true});
      }, 45000);
    });
  }

  if (previewFrame) previewFrame.addEventListener('load', () => {
    guardPreview();
    requestAnimationFrame(guardPreview);
  });

  if (previewBtn) previewBtn.addEventListener('click', () => {
    setTimeout(guardPreview, 0);
    setTimeout(guardPreview, 60);
  }, true);

  document.addEventListener('click', event => {
    const target = event.target.closest?.('#exportHtml');
    if (!target) return;
    const html = buildHardenedHTML();
    if (!html) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    flushProject();
    const settings = getSettings();
    downloadText(`${slug(settings.docName)}.html`, html, 'text/html');
    notify('Hardened HTML exported');
  }, true);

  const shellObserver = new MutationObserver(() => {
    syncShellA11y();
    augmentMorePanel();
  });
  [themeBtn, dirBtn, densityBtn].filter(Boolean).forEach(el => shellObserver.observe(el, {childList:true,subtree:true,characterData:true}));
  if (sheetBody) shellObserver.observe(sheetBody, {childList:true,subtree:true});

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const previewShell = document.getElementById('previewShell');
    if (previewShell && !previewShell.hidden) {
      exitPreview?.click();
      return;
    }
    if (sheet?.classList.contains('open')) closeSheet?.click();
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushProject();
  });
  window.addEventListener('pagehide', () => {
    flushProject();
    if (recoveryDirty) saveRecoverySnapshot({silent:true});
  });

  window.addEventListener('seven-design-editor-ready', event => attachEditorReliability(event.detail?.editor));
  attachEditorReliability(window.__sevenDesignEditor);
  improveLabels();
  syncShellA11y();
  ensureGuideOverlay();
  applyGuidePrefs();
  augmentMorePanel();
})();

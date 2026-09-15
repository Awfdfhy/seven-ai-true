(() => {
  'use strict';

  const previewFrame = document.getElementById('previewFrame');
  const previewBtn = document.getElementById('previewBtn');
  const exitPreview = document.getElementById('exitPreview');
  const previewLabel = document.getElementById('previewDeviceLabel');
  const themeBtn = document.getElementById('themeBtn');
  const dirBtn = document.getElementById('dirBtn');
  const densityBtn = document.getElementById('densityBtn');
  const sheet = document.getElementById('sheet');
  const closeSheet = document.getElementById('closeSheet');

  const PREVIEW_GUARD_CSS = `
    :root{
      --s-bg:#0A1022;--s-surface:#111B2F;--s-surface2:#16233A;--s-text:#F4F6FB;
      --s-muted:#93A4BF;--s-line:#263653;--s-blue:#4166F5;--s-cyan:#32BECF;--s-violet:#8265DC;
      color-scheme:dark;
    }
    html,body{margin:0;min-height:100%;background:var(--s-bg);color:var(--s-text)}
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

    const themeMeta = doc.querySelector('meta[name="theme-color"]') || doc.head.appendChild(Object.assign(doc.createElement('meta'), {name:'theme-color'}));
    themeMeta.setAttribute('content', state.theme === 'day' ? '#F4F6FB' : '#0A1022');
  }

  function syncShellThemeColor() {
    const day = (themeBtn?.textContent || '').trim().toLowerCase() === 'day';
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', day ? '#F4F6FB' : '#0A1022');
    document.documentElement.style.colorScheme = day ? 'light dark' : 'dark';
    if (themeBtn) themeBtn.setAttribute('aria-label', `Theme: ${day ? 'Day' : 'Night'}. Tap to switch.`);
    if (dirBtn) dirBtn.setAttribute('aria-label', `Direction: ${(dirBtn.textContent || 'LTR').trim()}. Tap to switch.`);
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

  if (previewFrame) previewFrame.addEventListener('load', () => {
    guardPreview();
    requestAnimationFrame(guardPreview);
  });

  if (previewBtn) previewBtn.addEventListener('click', () => {
    setTimeout(guardPreview, 0);
    setTimeout(guardPreview, 60);
  }, true);

  const shellObserver = new MutationObserver(syncShellThemeColor);
  [themeBtn, dirBtn, densityBtn].filter(Boolean).forEach(el => shellObserver.observe(el, {childList:true,subtree:true,attributes:true}));

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const previewShell = document.getElementById('previewShell');
    if (previewShell && !previewShell.hidden) {
      exitPreview?.click();
      return;
    }
    if (sheet?.classList.contains('open')) closeSheet?.click();
  });

  improveLabels();
  syncShellThemeColor();
})();

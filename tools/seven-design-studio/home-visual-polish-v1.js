(() => {
  'use strict';

  const VERSION = '2026.09-visual-polish-v1';
  const HOME = '2026.09-home-v5';
  const STYLE_MARKER = '--seven-home-visual-polish-v1';

  const CSS = `
:root{--seven-home-visual-polish-v1:1}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"]{
  --vp-bg:#07101f;--vp-bg-deep:#050b16;--vp-panel:#0c182b;--vp-panel-hi:#102039;
  --vp-text:#f7f9fd;--vp-muted:#91a2bb;--vp-line:rgba(133,158,199,.13);
  --vp-line-strong:rgba(93,145,236,.28);--vp-cyan:#32becf;--vp-blue:#4166f5;--vp-violet:#8265dc;
  padding:14px 16px calc(96px + env(safe-area-inset-bottom));
  background:
    radial-gradient(82% 42% at 100% -8%,rgba(65,102,245,.13),transparent 62%),
    radial-gradient(64% 34% at -12% 36%,rgba(50,190,207,.055),transparent 68%),
    linear-gradient(180deg,#09172b 0%,var(--vp-bg) 47%,var(--vp-bg-deep) 100%);
  color:var(--vp-text);
  letter-spacing:-.006em;
}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"]::selection{background:rgba(65,102,245,.32);color:#fff}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-ambient i{width:280px;height:220px;right:-158px;top:-118px;background:radial-gradient(circle,rgba(65,102,245,.13),rgba(130,101,220,.035) 48%,transparent 72%)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-ambient b{width:230px;height:190px;left:-176px;top:390px;background:radial-gradient(circle,rgba(50,190,207,.045),transparent 72%)}

.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-header{min-height:52px;margin-bottom:31px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-brand{gap:9px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-brand-mark{width:43px;height:34px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-wordmark{font-size:14px;font-weight:780;letter-spacing:.29em}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-header-actions{gap:2px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-icon-button,
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-avatar{border-radius:15px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-icon-button{color:#b8c7db;background:transparent}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-icon-button:active{background:rgba(119,148,194,.08);transform:scale(.96)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-avatar{border-color:rgba(113,147,202,.16);background:linear-gradient(145deg,#122a49,#101d32);box-shadow:inset 0 1px 0 rgba(255,255,255,.035)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-avatar>span{width:16px;height:16px;box-shadow:0 0 12px rgba(72,122,255,.22)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-notice-dot{right:10px;top:10px;width:6px;height:6px;border-width:1.5px}

.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-intro{align-items:end;margin-bottom:19px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-eyebrow{margin-bottom:8px;font-size:10px!important;font-weight:760;letter-spacing:.18em;color:#6f86aa}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-intro h1{max-width:310px;font-size:31px;line-height:1.035;font-weight:710;letter-spacing:-.045em;text-wrap:balance}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-intro>div>p:last-child{max-width:320px;margin-top:10px;font-size:13px;line-height:1.48;color:#8294ae}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-ready{min-width:76px;height:48px;padding-inline:12px;border-color:rgba(89,133,199,.13);border-radius:15px;background:rgba(14,28,50,.58);color:#a8bad1;box-shadow:none}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-ready i{width:7px;height:7px;box-shadow:0 0 9px rgba(52,212,177,.28)}

.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer{
  min-height:206px;margin-bottom:24px;padding:15px 15px 14px;
  border:1px solid rgba(83,133,220,.25);border-radius:29px 29px 29px 10px;
  background:linear-gradient(148deg,rgba(16,32,58,.98) 0%,rgba(10,22,41,.99) 58%,rgba(11,24,45,.985) 100%);
  box-shadow:0 18px 48px rgba(0,0,0,.16),inset 0 1px 0 rgba(255,255,255,.035);
  transition:border-color .18s ease,box-shadow .18s ease,transform .18s ease;
}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer::before{background:linear-gradient(118deg,rgba(50,190,207,.27),transparent 27%,transparent 72%,rgba(130,101,220,.17))}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer:focus-within{border-color:rgba(74,139,242,.46);box-shadow:0 20px 50px rgba(0,0,0,.19),0 0 0 3px rgba(65,102,245,.055),inset 0 1px 0 rgba(255,255,255,.045);transform:translateY(-1px)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-focus-halo{width:156px;height:104px;right:-68px;bottom:-62px;background:radial-gradient(circle,rgba(65,102,245,.14),transparent 70%)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-mode,
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-context{height:48px;border-color:rgba(126,153,195,.115);border-radius:14px;background:rgba(17,33,58,.52);color:#b8c7db;box-shadow:none}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-mode{padding-inline:11px 9px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-mode>span{color:#61d0dd}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-context b{background:rgba(65,102,245,.15);color:#aebff5}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-active-chip{height:31px;border-color:rgba(86,142,235,.20);background:rgba(65,102,245,.10);color:#c7d9f0}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer textarea{min-height:75px;margin:14px 0 4px;padding:2px 1px;font-size:17px;line-height:1.5;font-weight:440;letter-spacing:-.018em;caret-color:#69dce6}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer textarea::placeholder{color:#687c9c}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-round{border-color:rgba(126,153,195,.12);border-radius:15px;background:rgba(16,31,54,.56);color:#adbed4}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-round:active{transform:scale(.95);background:rgba(25,45,75,.72)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-input-hint{color:#657997;font-size:10.5px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-send{border-radius:15px;background:linear-gradient(142deg,#39c5d4 0%,#4166f5 58%,#795fda 100%);box-shadow:0 9px 23px rgba(55,99,229,.23),inset 0 1px 0 rgba(255,255,255,.20);transition:transform .16s ease,filter .16s ease,box-shadow .16s ease}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-send:active{transform:scale(.94);filter:brightness(.96)}

.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-section-heading{min-height:44px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-section-heading h2{font-size:14px;font-weight:690;color:#e3eaf5}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-section-heading>button{color:#7185a4;font-size:11.5px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-shortcut-section{margin-bottom:20px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-shortcuts{grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-shortcut{
  height:52px;flex-direction:row;justify-content:flex-start;gap:10px;padding:0 13px;
  border-color:rgba(126,153,195,.10);border-radius:16px;background:rgba(14,28,50,.54);color:#afc0d6;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.018);
}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-shortcut>span{width:27px;height:27px;place-items:center;border-radius:10px;background:rgba(255,255,255,.026)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-shortcut svg{width:18px!important;height:18px!important}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-shortcut strong{font-size:12px;font-weight:650;letter-spacing:-.01em}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-shortcut.selected{border-color:rgba(78,139,239,.34);background:linear-gradient(100deg,rgba(31,57,95,.76),rgba(18,35,62,.62));box-shadow:inset 3px 0 0 rgba(65,102,245,.68)}
.seven-rtl .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-shortcut.selected{box-shadow:inset -3px 0 0 rgba(65,102,245,.68)}

.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-now{margin-bottom:13px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-now-surface{border-color:rgba(126,153,195,.105);border-radius:20px 20px 20px 9px;background:rgba(13,26,47,.49);box-shadow:inset 0 1px 0 rgba(255,255,255,.018)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-active-row,
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-resume-row{min-height:72px;padding:11px 12px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-state-orb,
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-resume-icon{width:36px;height:36px;border-radius:12px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-state-orb{box-shadow:0 0 14px rgba(54,139,241,.15)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-row-copy strong{font-size:12.5px;font-weight:660}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-row-copy small{color:#7185a3}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-live{background:rgba(42,188,162,.065);color:#74cdbc}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-divider{background:rgba(125,151,194,.09)}

.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-bottom-nav{
  left:0;right:0;bottom:0;height:calc(76px + env(safe-area-inset-bottom));
  align-items:start;padding:7px max(10px,env(safe-area-inset-right)) env(safe-area-inset-bottom) max(10px,env(safe-area-inset-left));
  border:0;border-top:1px solid rgba(116,145,195,.13);border-radius:24px 24px 0 0;
  background:linear-gradient(180deg,rgba(8,18,34,.985),rgba(5,12,24,.995));
  box-shadow:0 -12px 34px rgba(0,0,0,.20),inset 0 1px 0 rgba(255,255,255,.018);
}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-bottom-nav>button{min-height:58px;color:#677c9e}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-bottom-nav>button.active{color:#dbe8f8}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-bottom-nav>button.active>span:not(.v4-orb-core){position:relative}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-bottom-nav>button.active>span:not(.v4-orb-core)::after{content:"";position:absolute;left:50%;bottom:-7px;width:13px;height:2px;border-radius:2px;transform:translateX(-50%);background:linear-gradient(90deg,#32becf,#4166f5)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-bottom-nav small{font-size:10.5px;font-weight:620}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-orb-button{width:62px!important;height:62px!important;min-width:62px!important;min-height:62px!important;margin-top:-7px;border-color:rgba(82,143,247,.26)!important;border-radius:21px!important;background:linear-gradient(145deg,#132b4c,#0b1a31)!important;box-shadow:0 0 0 4px rgba(65,102,245,.045),0 10px 24px rgba(24,62,133,.22)!important}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-orb-core{width:39px;height:31px}

.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-backdrop{background:rgba(2,7,15,.72)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-sheet{max-height:min(82vh,720px);border-color:rgba(118,150,204,.13);border-radius:30px 30px 0 0;background:linear-gradient(180deg,#0f1d33 0%,#091526 100%);box-shadow:0 -18px 48px rgba(0,0,0,.34)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-handle{width:34px;height:3px;background:#344862}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-sheet>header{min-height:66px;padding:11px 16px 8px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-sheet h2{font-size:20px;font-weight:700;letter-spacing:-.03em}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-sheet-close{border-color:rgba(125,153,197,.11);border-radius:15px;background:rgba(17,33,58,.64);color:#a7b9d0}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-action-tile,
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-list-row,
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-command,
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-state-card,
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-task-controls button{border-color:rgba(121,150,198,.10);background:rgba(15,30,53,.70)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-action-tile{border-radius:16px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-list-row{border-radius:16px}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-command{border-radius:13px;background:rgba(15,30,53,.64)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-search{border-color:rgba(121,151,200,.11);background:rgba(12,25,45,.84)}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-task-hero{border-color:rgba(84,141,237,.17);background:linear-gradient(145deg,rgba(23,45,78,.82),rgba(13,28,51,.86))}
.seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-voice-orb{box-shadow:0 0 0 8px rgba(65,102,245,.045),0 0 34px rgba(64,112,241,.17)}

body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"]{
  --vp-text:#10192a;--vp-muted:#687890;--vp-line:rgba(62,82,112,.11);
  background:
    radial-gradient(78% 38% at 100% -5%,rgba(65,102,245,.055),transparent 64%),
    linear-gradient(180deg,#fbfcfe 0%,#f5f8fc 54%,#eff3f8 100%);
  color:var(--vp-text);
}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-eyebrow{color:#72839a}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-intro>div>p:last-child{color:#687991}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-ready{background:rgba(245,248,252,.92);border-color:rgba(65,88,121,.10);color:#56677e}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer{background:linear-gradient(148deg,#fff 0%,#f9fbfe 62%,#f5f8fc 100%);border-color:rgba(65,102,245,.17);box-shadow:0 18px 45px rgba(34,59,94,.075),inset 0 1px 0 #fff}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer:focus-within{border-color:rgba(65,102,245,.32);box-shadow:0 19px 46px rgba(34,59,94,.09),0 0 0 3px rgba(65,102,245,.045)}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-mode,
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-context,
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-round{background:#f5f8fc;border-color:rgba(64,85,118,.10);color:#50617a}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-shortcut{background:rgba(255,255,255,.78);border-color:rgba(64,85,118,.085);color:#52637b}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-shortcut.selected{background:linear-gradient(100deg,#f0f5ff,#f8faff);border-color:rgba(65,102,245,.22)}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-now-surface{background:rgba(255,255,255,.74);border-color:rgba(64,85,118,.09)}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-section-heading h2{color:#26364d}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-bottom-nav{background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(248,250,253,.995));border-top-color:rgba(62,82,112,.11);box-shadow:0 -10px 28px rgba(43,64,91,.07)}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-orb-button{background:linear-gradient(145deg,#fff,#eef4ff)!important;border-color:rgba(65,102,245,.16)!important;box-shadow:0 0 0 4px rgba(65,102,245,.035),0 9px 22px rgba(57,86,143,.10)!important}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-sheet{background:linear-gradient(180deg,#fff,#f4f7fb);border-color:rgba(64,85,118,.10);box-shadow:0 -18px 42px rgba(43,63,92,.12)}
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-action-tile,
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-list-row,
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-command,
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-state-card,
body.seven-day .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-task-controls button{background:#f7f9fc;border-color:rgba(64,85,118,.09)}

body.seven-lite .seven-home-v5[data-seven-home-visual-polish="${VERSION}"]{background:linear-gradient(180deg,#09162a,#07101f 54%,#050b16)}
body.seven-day.seven-lite .seven-home-v5[data-seven-home-visual-polish="${VERSION}"]{background:linear-gradient(180deg,#fafcfe,#f5f8fc 55%,#eff3f8)}
body.seven-lite .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer,
body.seven-lite .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-now-surface,
body.seven-lite .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-bottom-nav{box-shadow:none!important}

@media(max-width:345px){
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"]{padding-inline:12px}
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-header{margin-bottom:24px}
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-intro{margin-bottom:16px}
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-intro h1{font-size:28px;max-width:280px}
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer{border-radius:26px 26px 26px 9px;padding:13px}
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v4-shortcut{padding-inline:11px;gap:8px}
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-bottom-nav{padding-inline:6px}
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-bottom-nav small{font-size:10px}
}
@media(min-width:430px){
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"]{padding-inline:20px}
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-intro h1{font-size:33px;max-width:350px}
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer{padding:16px}
}
@media(prefers-reduced-motion:reduce){
  .seven-home-v5[data-seven-home-visual-polish="${VERSION}"] .v5-composer:focus-within{transform:none}
}
`;

  function mark(doc) {
    const root = doc?.querySelector(`[data-seven-home-completion="${HOME}"]`);
    if (!root) return false;
    root.setAttribute('data-seven-home-visual-polish', VERSION);
    return true;
  }

  function install(editor) {
    if (!editor || editor.__sevenHomeVisualPolishV1Installed) return;
    editor.__sevenHomeVisualPolishV1Installed = true;

    const ensureCss = () => {
      try {
        const css = String(editor.getCss?.() || '');
        if (!css.includes(STYLE_MARKER)) editor.addStyle(CSS);
      } catch (_) {}
    };

    const bindCanvas = () => {
      try {
        const frame = editor.Canvas?.getFrameEl?.();
        if (frame?.contentDocument) mark(frame.contentDocument);
      } catch (_) {}
    };

    const apply = () => { ensureCss(); bindCanvas(); };
    for (const name of ['load','project:load','storage:end:load','update']) editor.on(name, () => setTimeout(apply, 20));
    window.addEventListener('seven-home-completion-v5-installed', () => setTimeout(apply, 30));
    setTimeout(apply, 160); setTimeout(apply, 620); setTimeout(apply, 1250);

    const preview = document.getElementById('previewFrame');
    preview?.addEventListener('load', () => setTimeout(() => mark(preview.contentDocument), 40));
    document.getElementById('previewBtn')?.addEventListener('click', () => setTimeout(() => mark(preview?.contentDocument), 180));

    window.dispatchEvent(new CustomEvent('seven-home-visual-polish-v1-installed', {detail:{version:VERSION}}));
  }

  if (window.__sevenDesignEditor) install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready', event => install(event.detail?.editor || window.__sevenDesignEditor), {once:true});
})();

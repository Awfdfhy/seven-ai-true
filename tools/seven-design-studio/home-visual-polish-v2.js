(() => {
  'use strict';

  const VERSION='2026.09-visual-polish-v2';
  const HOME='2026.09-home-v5';
  const STYLE_MARKER='--seven-home-visual-polish-v2';

  const CSS=`
:root{--seven-home-visual-polish-v2:1}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"]{
  width:100%!important;max-width:none!important;min-height:100dvh!important;margin:0!important;
  padding:14px 16px calc(108px + env(safe-area-inset-bottom))!important;
  border:0!important;border-radius:0!important;box-shadow:none!important;
  background:
    radial-gradient(74% 34% at 102% -5%,rgba(65,102,245,.105),transparent 65%),
    radial-gradient(54% 30% at -12% 38%,rgba(50,190,207,.035),transparent 70%),
    linear-gradient(180deg,#081426 0%,#07101f 46%,#050b16 100%)!important;
  scroll-padding-bottom:112px;
}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-ambient i{opacity:.72}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-ambient b{opacity:.54}

.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-header{min-height:50px;margin-bottom:27px}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v4-brand-mark{width:42px;height:33px}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-wordmark{font-size:14px;font-weight:790;letter-spacing:.27em}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-header-actions{align-items:center;gap:0}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v6-status{
  width:48px;min-width:48px;height:48px;padding:0;border:0;border-radius:15px;background:transparent;color:#91a6c2;
}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v6-status span{display:none}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v6-status i{width:8px;height:8px;margin:0;background:#31d3ae;box-shadow:0 0 0 5px rgba(49,211,174,.06),0 0 12px rgba(49,211,174,.22)}

.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-intro{grid-template-columns:1fr;align-items:start;gap:0;margin-bottom:18px}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-eyebrow{margin-bottom:8px;font-size:11px!important;color:#7a8fae;letter-spacing:.15em}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-intro h1{max-width:330px;font-size:30px;line-height:1.06;font-weight:705;letter-spacing:-.043em}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-intro>div>p:last-child{max-width:330px;margin-top:9px;font-size:13.5px;line-height:1.45;color:#899bb5}

.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-composer{
  min-height:190px;margin-bottom:21px;padding:13px 14px 12px;
  border:1px solid rgba(81,137,228,.24);border-radius:27px 27px 27px 9px;
  background:linear-gradient(150deg,rgba(15,30,54,.96),rgba(9,21,39,.985) 62%,rgba(10,23,43,.97));
  box-shadow:0 14px 34px rgba(0,0,0,.14),inset 0 1px 0 rgba(255,255,255,.028);
}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-composer::before{opacity:.74;background:linear-gradient(118deg,rgba(50,190,207,.23),transparent 25%,transparent 74%,rgba(130,101,220,.13))}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-composer:focus-within{border-color:rgba(79,145,242,.40);box-shadow:0 16px 38px rgba(0,0,0,.16),0 0 0 3px rgba(65,102,245,.045),inset 0 1px 0 rgba(255,255,255,.035);transform:none}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-focus-halo{width:140px;height:90px;right:-62px;bottom:-55px;opacity:.72}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-mode,
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-context{height:46px;border-color:rgba(126,153,195,.095);border-radius:14px;background:rgba(17,33,58,.33);color:#b8c7dc}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-composer textarea{min-height:60px;margin:11px 0 3px;font-size:16.5px;line-height:1.45}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-composer textarea::placeholder{color:#71839f}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-round{border-color:rgba(126,153,195,.095);background:rgba(14,29,51,.38);box-shadow:none}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-send{box-shadow:0 7px 18px rgba(55,99,229,.19),inset 0 1px 0 rgba(255,255,255,.17)}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-input-hint{font-size:11px;color:#7588a5}

.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-section-heading{min-height:42px}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-section-heading h2{font-size:15px;font-weight:700;color:#e7edf6}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-section-heading>button{font-size:12px;font-weight:620;color:#94a7c1}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-shortcut-section{margin-bottom:18px}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-shortcuts{
  display:flex;grid-template-columns:none;gap:8px;overflow-x:auto;overflow-y:hidden;
  margin-inline:0 -16px;padding:1px 16px 3px 0;scroll-snap-type:x proximity;scrollbar-width:none;overscroll-behavior-inline:contain;
}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-shortcuts::-webkit-scrollbar{display:none}
.seven-rtl .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-shortcuts{padding:1px 0 3px 16px}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v4-shortcut{
  flex:0 0 auto;width:auto;min-width:112px;height:48px;scroll-snap-align:start;
  gap:8px;padding:0 12px;border-color:rgba(126,153,195,.075);border-radius:15px;
  background:rgba(13,27,48,.30);color:#b5c5d9;box-shadow:none;
}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v4-shortcut>span{width:25px;height:25px;border-radius:9px;background:rgba(255,255,255,.018)}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v4-shortcut strong{font-size:12px;font-weight:660}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v4-shortcut.selected{border-color:rgba(82,143,239,.29);background:rgba(26,48,81,.54);box-shadow:inset 0 -2px 0 rgba(65,102,245,.50)}
.seven-rtl .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v4-shortcut.selected{box-shadow:inset 0 -2px 0 rgba(65,102,245,.50)}

.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-now{margin-bottom:28px}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-now-surface{border:0;border-radius:0;background:transparent;box-shadow:none;overflow:visible}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-active-row{
  min-height:68px;margin-top:4px;padding:10px 11px;border:1px solid rgba(112,145,194,.09);border-radius:18px 18px 18px 7px;
  background:linear-gradient(95deg,rgba(18,37,65,.62),rgba(10,24,44,.18) 80%);
}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-resume-row{min-height:62px;padding:9px 10px;background:transparent}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-divider{margin-inline:58px 10px;background:rgba(125,151,194,.085)}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-live{border:1px solid rgba(63,196,165,.08);background:rgba(42,188,162,.045)}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-row-copy strong{font-size:13px;color:#dce6f3}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-row-copy small{font-size:11px;color:#8496b0}

.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-bottom-nav{
  left:0!important;right:0!important;bottom:0!important;height:calc(72px + env(safe-area-inset-bottom));
  grid-template-columns:1fr 1fr 62px 1fr 1fr;align-items:start;
  padding:7px max(8px,env(safe-area-inset-right)) env(safe-area-inset-bottom) max(8px,env(safe-area-inset-left));
  border:0;border-top:1px solid rgba(116,145,195,.105);border-radius:0;
  background:linear-gradient(180deg,rgba(7,16,31,.985),rgba(5,11,22,.998));
  box-shadow:0 -10px 30px rgba(0,0,0,.15);
}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-bottom-nav>button{min-height:58px;color:#8497b3}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-bottom-nav>button.active{color:#e0ebf9}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-bottom-nav small{font-size:11px;font-weight:630}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-orb-button{
  width:54px!important;height:54px!important;min-width:54px!important;min-height:54px!important;margin-top:-2px;
  border:0!important;border-radius:50%!important;background:radial-gradient(circle,rgba(65,102,245,.11),transparent 71%)!important;
  box-shadow:none!important;
}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v4-orb-core{width:45px;height:35px}
.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-bottom-nav>button.active>span:not(.v4-orb-core)::after{bottom:-6px;width:11px;height:2px}

body.seven-day .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"]{
  background:radial-gradient(70% 30% at 100% -4%,rgba(65,102,245,.065),transparent 66%),linear-gradient(180deg,#fbfcfe 0%,#f5f8fc 48%,#eff3f8 100%)!important;
}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v6-status{background:transparent}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-composer{background:linear-gradient(150deg,#fff,#f8fbff);border-color:rgba(65,102,245,.17);box-shadow:0 12px 30px rgba(39,61,92,.07),inset 0 1px 0 #fff}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v4-shortcut{background:rgba(255,255,255,.56);border-color:rgba(67,87,120,.08);color:#40516a}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-active-row{background:linear-gradient(95deg,#f9fbfe,rgba(246,249,253,.38));border-color:rgba(67,87,120,.08)}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-resume-row{color:#31435d}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-row-copy strong{color:#243750}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-bottom-nav{background:linear-gradient(180deg,rgba(255,255,255,.99),rgba(247,249,253,.998));border-top-color:rgba(61,82,116,.10);box-shadow:0 -8px 24px rgba(45,63,88,.07)}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-bottom-nav>button{color:#71819a}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-bottom-nav>button.active{color:#243958}

body.seven-lite .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-composer,
body.seven-lite .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-bottom-nav{box-shadow:none!important}
body.seven-reduced .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] *,
body.seven-lite .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] *{animation:none!important;transition-duration:0s!important}

@media(max-width:345px){
  .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"]{padding-inline:12px!important}
  .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-header{margin-bottom:22px}
  .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-intro h1{font-size:28px}
  .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-intro>div>p:last-child{font-size:13px}
  .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-composer{min-height:190px;padding:12px}
  .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-shortcuts{margin-inline:0 -12px;padding-inline-end:12px}
  .seven-rtl .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-shortcuts{padding-inline:0 0;padding-left:12px}
  .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v4-shortcut{min-width:108px;padding-inline:11px}
  .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-bottom-nav{grid-template-columns:1fr 1fr 58px 1fr 1fr}
  .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v5-orb-button{width:52px!important;height:52px!important;min-width:52px!important;min-height:52px!important}
  .seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] .v4-orb-core{width:42px;height:33px}
}
@media(prefers-reduced-motion:reduce){.seven-home-v5[data-seven-home-visual-polish-v2="${VERSION}"] *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;

  function mark(doc){
    const root=doc?.querySelector(`[data-seven-home-completion="${HOME}"]`);
    if(!root)return false;
    root.setAttribute('data-seven-home-visual-polish-v2',VERSION);
    const status=root.querySelector('.v5-ready');
    const actions=root.querySelector('.v5-header-actions');
    if(status&&actions&&!status.classList.contains('v6-status')){
      status.classList.add('v6-status');
      status.setAttribute('aria-label','Seven status: Ready');
      actions.prepend(status);
    }
    return true;
  }

  function install(editor){
    if(!editor||editor.__sevenHomeVisualPolishV2Installed)return;
    editor.__sevenHomeVisualPolishV2Installed=true;
    const ensureCss=()=>{try{const css=String(editor.getCss?.()||'');if(!css.includes(STYLE_MARKER))editor.addStyle(CSS);}catch(_){}};
    const bindCanvas=()=>{try{const frame=editor.Canvas?.getFrameEl?.();if(frame?.contentDocument)mark(frame.contentDocument);}catch(_){}};
    const apply=()=>{ensureCss();bindCanvas();};
    for(const name of ['load','project:load','storage:end:load','update'])editor.on(name,()=>setTimeout(apply,24));
    window.addEventListener('seven-home-visual-polish-v1-installed',()=>setTimeout(apply,35));
    window.addEventListener('seven-home-completion-v5-installed',()=>setTimeout(apply,55));
    setTimeout(apply,180);setTimeout(apply,680);setTimeout(apply,1320);
    const preview=document.getElementById('previewFrame');
    preview?.addEventListener('load',()=>setTimeout(()=>mark(preview.contentDocument),55));
    document.getElementById('previewBtn')?.addEventListener('click',()=>setTimeout(()=>mark(preview?.contentDocument),220));
    window.dispatchEvent(new CustomEvent('seven-home-visual-polish-v2-installed',{detail:{version:VERSION}}));
  }

  if(window.__sevenDesignEditor)install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready',e=>install(e.detail?.editor||window.__sevenDesignEditor),{once:true});
})();

(() => {
  'use strict';

  const VERSION='2026.09-visual-polish-v3';
  const HOME='2026.09-home-v5';
  const STYLE_MARKER='--seven-home-visual-polish-v3';

  const CSS=`
:root{--seven-home-visual-polish-v3:1}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"]{
  --v7-hairline:rgba(126,153,195,.075);
  --v7-soft:rgba(15,31,55,.30);
  --v7-soft-hi:rgba(20,40,69,.46);
  padding-top:12px!important;
  background:
    radial-gradient(72% 31% at 102% -5%,rgba(65,102,245,.09),transparent 66%),
    radial-gradient(48% 26% at -14% 40%,rgba(50,190,207,.026),transparent 72%),
    linear-gradient(180deg,#081426 0%,#07101f 48%,#050b16 100%)!important;
}

.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-header{margin-bottom:23px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-wordmark{letter-spacing:.255em;color:#edf4fd}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-icon-button{color:#aebed3}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-avatar{background:transparent;border-color:rgba(126,153,195,.09);box-shadow:none}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v6-status{opacity:.88}

.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-intro{margin-bottom:15px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-eyebrow{margin-bottom:6px;color:#8396b3}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-intro h1{font-size:29px;line-height:1.045;letter-spacing:-.046em;color:#f4f8fe}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-intro>div>p:last-child{margin-top:8px;max-width:320px;color:#8fa0b9}

.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer{
  min-height:190px;margin-bottom:19px;padding:12px 13px 11px;
  border-color:rgba(88,145,235,.21);border-radius:25px 25px 25px 8px;
  background:linear-gradient(151deg,rgba(14,29,52,.965),rgba(8,20,38,.985) 64%,rgba(9,22,41,.975));
  box-shadow:0 11px 27px rgba(0,0,0,.13),inset 0 1px 0 rgba(255,255,255,.023);
}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer::before{opacity:.57;background:linear-gradient(118deg,rgba(50,190,207,.19),transparent 24%,transparent 76%,rgba(130,101,220,.105))}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer:focus-within{border-color:rgba(83,151,244,.38);box-shadow:0 13px 31px rgba(0,0,0,.15),0 0 0 3px rgba(65,102,245,.038),inset 0 1px 0 rgba(255,255,255,.028)}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-focus-halo{opacity:.48}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer-top{gap:6px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-mode,
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-context{
  height:48px;border:0!important;border-radius:14px;background:rgba(20,39,66,.27);box-shadow:none!important;color:#bdcbe0;
}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-mode{padding-inline:10px 8px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-mode>span{color:#62d6df}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-context b{min-width:23px;height:23px;border-radius:999px;background:rgba(65,102,245,.13);color:#b9c8f7;font-size:11px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer textarea{min-height:62px;margin:9px 0 2px;font-size:16.5px;line-height:1.45;color:#eef4fd}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer textarea::placeholder{color:#778aa7}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer-footer{gap:4px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-round{
  width:48px;height:48px;min-width:48px;min-height:48px;border:0!important;border-radius:15px;background:transparent!important;box-shadow:none!important;color:#aebed2;
}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-round:active{background:rgba(24,43,71,.40)!important}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-input-hint{margin-inline-start:1px;color:#7185a2}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-send{
  width:48px;height:48px;min-width:48px;min-height:48px;border-radius:16px;
  background:linear-gradient(142deg,#35c2d1 0%,#4166f5 59%,#775fd7 100%);
  box-shadow:0 6px 15px rgba(55,99,229,.16),inset 0 1px 0 rgba(255,255,255,.15);
}

.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-shortcut-section{margin-bottom:17px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-section-heading{min-height:40px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-section-heading h2{font-size:14.5px;font-weight:690;color:#e9eff8}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-section-heading>button{font-size:11.5px;font-weight:570;color:#91a4bf}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-shortcuts{gap:7px;padding-top:0;padding-bottom:1px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v4-shortcut{
  min-width:108px;height:48px;padding:0 11px;gap:7px;border-color:rgba(126,153,195,.055);border-radius:14px;
  background:rgba(14,28,49,.18);box-shadow:none;color:#b9c7da;
}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v4-shortcut>span{width:24px;height:24px;background:transparent}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v4-shortcut strong{font-size:12px;font-weight:650}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v4-shortcut.selected{border-color:rgba(80,141,238,.20);background:rgba(24,46,77,.38);box-shadow:inset 0 -2px 0 rgba(65,102,245,.42)}
.seven-rtl .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v4-shortcut.selected{box-shadow:inset 0 -2px 0 rgba(65,102,245,.42)}

.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-now{margin-bottom:25px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-active-row{
  position:relative;overflow:hidden;min-height:66px;margin-top:2px;padding:9px 10px 9px 12px;border:0!important;border-radius:17px 17px 17px 6px;
  background:linear-gradient(96deg,rgba(17,35,61,.56),rgba(10,23,42,.12) 82%);box-shadow:none;
}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-active-row::before{content:"";position:absolute;inset-block:10px;inset-inline-start:0;width:2px;border-radius:0 2px 2px 0;background:linear-gradient(180deg,#32becf,#4166f5)}
.seven-rtl .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-active-row::before{border-radius:2px 0 0 2px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-state-orb{width:34px;height:34px;border-radius:11px;box-shadow:0 0 11px rgba(54,139,241,.11)}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-live{display:none}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-resume-row{min-height:58px;padding:8px 10px}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-divider{margin-inline:54px 10px;opacity:.72}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-row-copy strong{font-size:12.8px;font-weight:650}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-row-copy small{font-size:11px;color:#8598b2}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-arrow{color:#7185a5}

.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-bottom-nav{
  height:calc(70px + env(safe-area-inset-bottom));padding-top:6px;border-top-color:rgba(116,145,195,.085);
  background:linear-gradient(180deg,rgba(7,16,31,.973),rgba(5,11,22,.997));box-shadow:0 -7px 22px rgba(0,0,0,.12);
}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-bottom-nav>button{min-height:58px;color:#879ab5}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-bottom-nav>button.active{color:#e6effb}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-bottom-nav small{font-size:11px;font-weight:620}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-orb-button{
  width:54px!important;height:58px!important;min-width:54px!important;min-height:58px!important;margin-top:0!important;
  border:0!important;border-radius:18px!important;background:transparent!important;box-shadow:none!important;
}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v4-orb-core{width:48px;height:37px;filter:none}
.seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-bottom-nav>button.active>span:not(.v4-orb-core)::after{bottom:-5px;width:10px;opacity:.88}

body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"]{
  background:radial-gradient(68% 28% at 100% -4%,rgba(65,102,245,.052),transparent 66%),linear-gradient(180deg,#fbfcfe 0%,#f5f8fc 50%,#eef3f8 100%)!important;
}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-wordmark,
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-intro h1{color:#15253d}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer{background:linear-gradient(151deg,#fff,#f9fbfe);border-color:rgba(65,102,245,.14);box-shadow:0 9px 24px rgba(39,61,92,.055),inset 0 1px 0 #fff}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-mode,
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-context{background:rgba(235,241,249,.72);color:#40516a}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer textarea{color:#1b2d47}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-round{color:#536982}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v4-shortcut{background:rgba(255,255,255,.40);border-color:rgba(67,87,120,.06);color:#40516a}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-active-row{background:linear-gradient(96deg,rgba(247,250,254,.95),rgba(244,248,252,.22));color:#263b57}
body.seven-day .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-bottom-nav{background:linear-gradient(180deg,rgba(255,255,255,.985),rgba(247,249,253,.998));border-top-color:rgba(61,82,116,.075);box-shadow:0 -6px 18px rgba(45,63,88,.045)}

body.seven-lite .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer,
body.seven-lite .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-bottom-nav{box-shadow:none!important}
body.seven-reduced .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] *,
body.seven-lite .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] *{animation:none!important;transition-duration:0s!important}

@media(max-width:345px){
  .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"]{padding-top:9px!important;padding-bottom:calc(102px + env(safe-area-inset-bottom))!important}
  .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-header{margin-bottom:18px}
  .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-intro{margin-bottom:12px}
  .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-intro h1{font-size:27px;max-width:290px}
  .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-intro>div>p:last-child{display:none}
  .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-composer{min-height:188px;margin-bottom:16px;padding-inline:12px}
  .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-input-hint{display:none}
  .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v4-shortcut{min-width:104px;padding-inline:10px}
  .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] .v5-now{margin-bottom:21px}
}

@media(prefers-reduced-motion:reduce){
  .seven-home-v5[data-seven-home-visual-polish-v3="${VERSION}"] *{animation:none!important;transition:none!important;scroll-behavior:auto!important}
}
`;

  function mark(doc){
    const root=doc?.querySelector(`[data-seven-home-completion="${HOME}"]`);
    if(!root)return false;
    root.setAttribute('data-seven-home-visual-polish-v3',VERSION);
    return true;
  }

  function install(editor){
    if(!editor||editor.__sevenHomeVisualPolishV3Installed)return;
    editor.__sevenHomeVisualPolishV3Installed=true;

    const ensureCss=()=>{
      try{
        const css=String(editor.getCss?.()||'');
        if(!css.includes(STYLE_MARKER))editor.addStyle(CSS);
      }catch(_){}
    };
    const bindCanvas=()=>{
      try{mark(editor.Canvas?.getDocument?.());}catch(_){}
    };
    const apply=()=>{ensureCss();bindCanvas();};
    for(const name of ['load','project:load','storage:end:load','update'])editor.on(name,()=>setTimeout(apply,20));
    window.addEventListener('seven-home-visual-polish-v2-installed',()=>setTimeout(apply,25));
    window.addEventListener('seven-home-completion-v5-installed',()=>setTimeout(apply,35));
    setTimeout(apply,180);setTimeout(apply,720);setTimeout(apply,1320);

    const preview=document.getElementById('previewFrame');
    preview?.addEventListener('load',()=>setTimeout(()=>mark(preview.contentDocument),40));
    document.getElementById('previewBtn')?.addEventListener('click',()=>setTimeout(()=>mark(preview?.contentDocument),190));

    window.dispatchEvent(new CustomEvent('seven-home-visual-polish-v3-installed',{detail:{version:VERSION}}));
  }

  if(window.__sevenDesignEditor)install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready',e=>install(e.detail?.editor||window.__sevenDesignEditor),{once:true});
})();

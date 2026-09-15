(() => {
  'use strict';

  const VERSION='2026.09-visual-polish-v4-final';
  const HOME='2026.09-home-v5';
  const STYLE_MARKER='--seven-home-visual-polish-v4-final';

  const CSS=`
:root{--seven-home-visual-polish-v4-final:1}
.seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"]{
  padding-bottom:calc(148px + env(safe-area-inset-bottom))!important;
  scroll-padding-top:12px;
  scroll-padding-bottom:calc(112px + env(safe-area-inset-bottom));
}
.seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] .v5-shortcuts{
  margin-inline:0!important;
  padding-inline:0!important;
  scroll-padding-inline:0!important;
  scroll-behavior:auto!important;
}
.seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] .v4-shortcut:first-child{margin-inline-start:0!important}
.seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] .v5-now{margin-bottom:14px!important}
.seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] .v5-resume-row{margin-bottom:8px}
.seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] .v5-bottom-nav{z-index:30}

@media(max-width:345px){
  .seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"]{
    padding-top:12px!important;
    padding-bottom:calc(142px + env(safe-area-inset-bottom))!important;
  }
  .seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] .v5-intro{margin-top:0!important}
  .seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] .v5-intro h1{font-size:27px;line-height:1.06}
  .seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] .v5-shortcuts{padding-inline:0!important;margin-inline:0!important}
  .seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] .v4-shortcut{min-width:104px}
}

body.seven-day .seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] .v5-bottom-nav{z-index:30}
body.seven-lite .seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] *{transition-duration:0s!important}
body.seven-reduced .seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] *{animation:none!important;transition-duration:0s!important;scroll-behavior:auto!important}
@media(prefers-reduced-motion:reduce){.seven-home-v5[data-seven-home-visual-polish-v4="${VERSION}"] *{animation:none!important;transition-duration:0s!important;scroll-behavior:auto!important}}
`;

  function install(editor){
    if(!editor||editor.__sevenHomeVisualPolishV4Installed)return;
    editor.__sevenHomeVisualPolishV4Installed=true;

    const apply=()=>{
      try{
        const css=String(editor.getCss?.()||'');
        if(!css.includes(STYLE_MARKER))editor.addStyle(CSS);
        const frame=editor.Canvas?.getFrameEl?.();
        const doc=frame?.contentDocument;
        const home=doc?.querySelector?.(`[data-seven-home-completion="${HOME}"]`);
        if(home)home.setAttribute('data-seven-home-visual-polish-v4',VERSION);
      }catch(_){}
    };

    for(const name of ['load','project:load','storage:end:load','update'])editor.on(name,()=>setTimeout(apply,25));
    window.addEventListener('seven-home-visual-polish-v3-installed',()=>setTimeout(apply,35));
    setTimeout(apply,160);setTimeout(apply,650);setTimeout(apply,1250);
    window.dispatchEvent(new CustomEvent('seven-home-visual-polish-v4-installed',{detail:{version:VERSION}}));
  }

  if(window.__sevenDesignEditor)install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready',e=>install(e.detail?.editor||window.__sevenDesignEditor),{once:true});
})();

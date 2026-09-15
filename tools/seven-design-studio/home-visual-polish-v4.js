(() => {
  'use strict';

  const VERSION='2026.09-visual-polish-v4-final';
  const HOME='2026.09-home-v5';
  const STYLE_MARKER='--seven-home-visual-polish-v4-final';

  // Deliberately higher specificity than the earlier visual layers. V4 is the
  // final freeze, so its layout fixes must remain authoritative even when an
  // older layer is re-injected later by the editor lifecycle.
  const ROOT=`.seven-home-v5.seven-home-v5[data-seven-home-completion="${HOME}"][data-seven-home-visual-polish-v4="${VERSION}"]`;
  const CSS=`
:root{--seven-home-visual-polish-v4-final:1}
${ROOT}{
  padding-bottom:calc(148px + env(safe-area-inset-bottom))!important;
  scroll-padding-top:12px!important;
  scroll-padding-bottom:calc(112px + env(safe-area-inset-bottom))!important;
}
${ROOT} .v5-shortcuts{
  margin-inline:0!important;
  padding-inline:0!important;
  scroll-padding-inline:0!important;
  scroll-behavior:auto!important;
}
${ROOT} .v4-shortcut:first-child{margin-inline-start:0!important}
${ROOT} .v5-now{margin-bottom:14px!important}
${ROOT} .v5-resume-row{margin-bottom:8px!important}
${ROOT} .v5-bottom-nav{z-index:30!important}

@media(max-width:345px){
  ${ROOT}{
    padding-top:12px!important;
    padding-bottom:calc(142px + env(safe-area-inset-bottom))!important;
  }
  ${ROOT} .v5-intro{margin-top:0!important}
  ${ROOT} .v5-intro h1{font-size:27px!important;line-height:1.06!important}
  ${ROOT} .v5-shortcuts{padding-inline:0!important;margin-inline:0!important}
  ${ROOT} .v4-shortcut{min-width:104px!important}
}

body.seven-day ${ROOT} .v5-bottom-nav{z-index:30!important}
body.seven-lite ${ROOT} *{transition-duration:0s!important}
body.seven-reduced ${ROOT} *{animation:none!important;transition-duration:0s!important;scroll-behavior:auto!important}
@media(prefers-reduced-motion:reduce){${ROOT} *{animation:none!important;transition-duration:0s!important;scroll-behavior:auto!important}}
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
    setTimeout(apply,160);setTimeout(apply,650);setTimeout(apply,1250);setTimeout(apply,2100);
    window.dispatchEvent(new CustomEvent('seven-home-visual-polish-v4-installed',{detail:{version:VERSION}}));
  }

  if(window.__sevenDesignEditor)install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready',e=>install(e.detail?.editor||window.__sevenDesignEditor),{once:true});
})();

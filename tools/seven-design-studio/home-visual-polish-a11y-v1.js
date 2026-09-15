(() => {
  'use strict';
  const VERSION='2026.09-visual-polish-a11y-v1';
  const MARKER='--seven-home-visual-polish-a11y-v1';
  const CSS=`
:root{--seven-home-visual-polish-a11y-v1:1}
.seven-home-v5[data-seven-home-visual-polish="2026.09-visual-polish-v1"] .v5-eyebrow{font-size:11px!important}
.seven-home-v5[data-seven-home-visual-polish="2026.09-visual-polish-v1"] .v5-input-hint{font-size:11px}
.seven-home-v5[data-seven-home-visual-polish="2026.09-visual-polish-v1"] .v5-bottom-nav small{font-size:11px}
@media(max-width:345px){.seven-home-v5[data-seven-home-visual-polish="2026.09-visual-polish-v1"] .v5-bottom-nav small{font-size:11px}}
`;
  function install(editor){
    if(!editor||editor.__sevenHomeVisualPolishA11yV1Installed)return;
    editor.__sevenHomeVisualPolishA11yV1Installed=true;
    const apply=()=>{try{const css=String(editor.getCss?.()||'');if(!css.includes(MARKER))editor.addStyle(CSS);}catch(_){}};
    for(const name of ['load','project:load','storage:end:load','update'])editor.on(name,()=>setTimeout(apply,20));
    window.addEventListener('seven-home-visual-polish-v1-installed',()=>setTimeout(apply,25));
    setTimeout(apply,180);setTimeout(apply,700);setTimeout(apply,1300);
    window.dispatchEvent(new CustomEvent('seven-home-visual-polish-a11y-v1-installed',{detail:{version:VERSION}}));
  }
  if(window.__sevenDesignEditor)install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready',e=>install(e.detail?.editor||window.__sevenDesignEditor),{once:true});
})();

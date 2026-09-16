(() => {
  'use strict';

  const VERSION='2026.09-page-state-sync-v1';
  const SETTINGS_KEY='seven-design-studio-settings-v1';

  function readSettings(){
    let stored={};
    try{stored=JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')||{};}catch(_){}
    const themeText=(document.getElementById('themeBtn')?.textContent||'').trim().toLowerCase();
    const dirText=(document.getElementById('dirBtn')?.textContent||'').trim().toLowerCase();
    const densityText=(document.getElementById('densityBtn')?.textContent||'').trim().toLowerCase();
    return {
      theme: stored.theme || (themeText==='day'?'day':'night'),
      dir: stored.dir || (dirText==='rtl'?'rtl':'ltr'),
      density: stored.density || densityText || 'balanced',
      largeText: !!stored.largeText,
      reduced: !!stored.reduced
    };
  }

  function apply(editor){
    try{
      const body=editor?.Canvas?.getBody?.();
      if(!body)return false;
      const s=readSettings();
      body.classList.toggle('seven-day',s.theme==='day');
      body.classList.toggle('seven-rtl',s.dir==='rtl');
      body.classList.toggle('seven-large',s.largeText);
      body.classList.toggle('seven-lite',s.density==='lite');
      body.classList.toggle('seven-reduced',s.reduced);
      body.setAttribute('dir',s.dir);
      body.setAttribute('data-seven-page-state-sync',VERSION);
      return true;
    }catch(_){return false;}
  }

  function install(editor){
    if(!editor||editor.__sevenPageStateSyncInstalled)return;
    editor.__sevenPageStateSyncInstalled=true;
    const sync=()=>{apply(editor);setTimeout(()=>apply(editor),35);setTimeout(()=>apply(editor),140);};
    for(const event of ['load','project:load','storage:end:load','page:select'])editor.on(event,sync);
    for(const id of ['themeBtn','dirBtn','densityBtn'])document.getElementById(id)?.addEventListener('click',()=>setTimeout(sync,0));
    setTimeout(sync,120);setTimeout(sync,700);
    window.dispatchEvent(new CustomEvent('seven-page-state-sync-installed',{detail:{version:VERSION}}));
  }

  if(window.__sevenDesignEditor)install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready',e=>install(e.detail?.editor||window.__sevenDesignEditor));
})();

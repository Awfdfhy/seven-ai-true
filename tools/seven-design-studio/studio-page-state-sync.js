(() => {
  'use strict';

  const VERSION='2026.09-page-state-sync-v3';
  const SETTINGS_KEY='seven-design-studio-settings-v1';
  const PRODUCT_THEME_MARKER='--seven-product-theme-fallback-v1';
  const PRODUCT_THEME_CSS=`
:root{${PRODUCT_THEME_MARKER}:1}
.svx-screen[data-seven-product-suite="2026.09-product-screens-v1"]{background-color:#07101f!important;background-image:radial-gradient(74% 30% at 103% -5%,rgba(65,102,245,.12),transparent 67%),linear-gradient(180deg,#081426,#07101f 52%,#050b16)!important}
body.seven-day .svx-screen[data-seven-product-suite="2026.09-product-screens-v1"]{background-color:#f5f8fc!important;background-image:radial-gradient(70% 28% at 100% -4%,rgba(65,102,245,.055),transparent 66%),linear-gradient(180deg,#fbfcfe,#f5f8fc 55%,#eef3f8)!important}
body.seven-lite .svx-screen[data-seven-product-suite="2026.09-product-screens-v1"]{background-color:#07101f!important;background-image:none!important}
body.seven-day.seven-lite .svx-screen[data-seven-product-suite="2026.09-product-screens-v1"]{background-color:#f5f8fc!important;background-image:none!important}
`;

  function readStored(){
    try{return JSON.parse(localStorage.getItem(SETTINGS_KEY)||'{}')||{};}catch(_){return {};}
  }

  function readSettings(){
    const stored=readStored();
    const themeBtn=document.getElementById('themeBtn');
    const dirBtn=document.getElementById('dirBtn');
    const densityBtn=document.getElementById('densityBtn');
    const themeText=(themeBtn?.textContent||'').trim().toLowerCase();
    const dirText=(dirBtn?.textContent||'').trim().toLowerCase();
    const densityText=(densityBtn?.textContent||'').trim().toLowerCase();

    // The live Studio controls are authoritative during interaction. Persisted
    // settings are only a fallback because storage can trail the click that
    // immediately precedes a GrapesJS page switch.
    const theme=themeText==='day'?'day':themeText==='night'?'night':(stored.theme||'night');
    const dir=dirText==='rtl'?'rtl':dirText==='ltr'?'ltr':(stored.dir||'ltr');
    const density=['full','balanced','lite'].includes(densityText)?densityText:(stored.density||'balanced');

    return {
      theme,
      dir,
      density,
      largeText:!!stored.largeText,
      reduced:!!stored.reduced
    };
  }

  function ensureProductThemeCss(editor){
    try{
      const css=String(editor?.getCss?.()||'');
      if(!css.includes(PRODUCT_THEME_MARKER))editor?.addStyle?.(PRODUCT_THEME_CSS);
    }catch(_){}
  }

  function applyBody(body,s){
    if(!body)return false;
    body.classList.toggle('seven-day',s.theme==='day');
    body.classList.toggle('seven-rtl',s.dir==='rtl');
    body.classList.toggle('seven-large',s.largeText);
    body.classList.toggle('seven-lite',s.density==='lite');
    body.classList.toggle('seven-reduced',s.reduced);
    body.setAttribute('dir',s.dir);
    body.setAttribute('data-seven-page-state-sync',VERSION);
    body.setAttribute('data-seven-theme',s.theme);
    body.setAttribute('data-seven-density',s.density);
    return true;
  }

  function apply(editor){
    try{
      ensureProductThemeCss(editor);
      const s=readSettings();
      const body=editor?.Canvas?.getBody?.();
      const frameBody=editor?.Canvas?.getFrameEl?.()?.contentDocument?.body;
      let applied=applyBody(body,s);
      if(frameBody&&frameBody!==body)applied=applyBody(frameBody,s)||applied;
      return applied;
    }catch(_){return false;}
  }

  function install(editor){
    if(!editor||editor.__sevenPageStateSyncInstalled)return;
    editor.__sevenPageStateSyncInstalled=true;

    const sync=()=>{
      apply(editor);
      queueMicrotask(()=>apply(editor));
      requestAnimationFrame(()=>{
        apply(editor);
        requestAnimationFrame(()=>apply(editor));
      });
      for(const delay of [0,32,120,360])setTimeout(()=>apply(editor),delay);
    };

    editor.__sevenSyncPageState=sync;
    window.__sevenSyncPageState=sync;

    for(const event of ['load','project:load','storage:end:load','page:select','canvas:frame:load'])editor.on(event,sync);

    // Delegation keeps working even when the quick screen selector is created
    // after this module. The handler runs after the selector's own change
    // handler, so the newly selected page receives state in the same event.
    document.addEventListener('change',event=>{
      if(event.target?.id==='sevenScreenQuick'||event.target?.id==='deviceSelect')sync();
    });
    document.addEventListener('click',event=>{
      if(['themeBtn','dirBtn','densityBtn'].includes(event.target?.closest?.('button')?.id))sync();
    });

    setTimeout(sync,120);
    setTimeout(sync,700);
    window.dispatchEvent(new CustomEvent('seven-page-state-sync-installed',{detail:{version:VERSION}}));
  }

  if(window.__sevenDesignEditor)install(window.__sevenDesignEditor);
  window.addEventListener('seven-design-editor-ready',e=>install(e.detail?.editor||window.__sevenDesignEditor));
})();

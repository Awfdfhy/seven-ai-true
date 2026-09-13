(()=>{
  'use strict';
  const MODE_CONTEXT={
    core:['Memory','Tools','Models'],
    build:['Inspect','Edit','Test'],
    world:['Canon','Timeline','Branch'],
    research:['Claims','Sources','Verify']
  };
  let started=false;

  function activeMode(){return document.documentElement.dataset.sevenMode||'core'}

  function ensureContextRail(){
    const main=document.querySelector('.main');
    const topbar=document.querySelector('.topbar');
    if(!main||!topbar)return null;
    let rail=main.querySelector(':scope > .seven-context-rail');
    if(!rail){
      rail=document.createElement('div');
      rail.className='seven-context-rail';
      topbar.insertAdjacentElement('afterend',rail);
    }
    return rail;
  }

  function renderContextRail(){
    const rail=ensureContextRail();if(!rail)return;
    const mode=activeMode();
    const items=MODE_CONTEXT[mode]||MODE_CONTEXT.core;
    const next=`<strong>${mode[0].toUpperCase()+mode.slice(1)}</strong>${items.map(x=>`<span class="seven-context-chip">${x}</span>`).join('')}`;
    if(rail.innerHTML!==next) rail.innerHTML=next;
  }

  function upgradeThemeButtons(root=document){
    root.querySelectorAll('button[onclick*="toggleTheme"]').forEach(btn=>{
      if(btn.querySelector('.seven-celestial-toggle'))return;
      const orb=document.createElement('span');
      orb.className='seven-celestial-toggle';orb.setAttribute('aria-hidden','true');
      btn.prepend(orb);
    });
  }

  function markSaveStatus(root=document){
    root.querySelectorAll('body *').forEach(node=>{
      if(node.children.length)return;
      const text=(node.textContent||'').trim();
      if(/^Saved\s*[·•-]\s*IndexedDB$/i.test(text)&&!node.classList.contains('seven-save-toast'))node.classList.add('seven-save-toast');
    });
  }

  function syncProcessingState(){
    const stop=document.getElementById('stopBtn');
    if(!stop)return;
    const shown=getComputedStyle(stop).display!=='none';
    if(document.documentElement.classList.contains('seven-processing')!==shown)document.documentElement.classList.toggle('seven-processing',shown);
  }

  function watchProcessing(){
    const stop=document.getElementById('stopBtn');
    if(!stop||stop.dataset.sevenObserved==='1')return;
    stop.dataset.sevenObserved='1';
    new MutationObserver(syncProcessingState).observe(stop,{attributes:true,attributeFilter:['style','class','hidden']});
    syncProcessingState();
  }

  function refresh(){
    renderContextRail();
    upgradeThemeButtons();
    markSaveStatus();
    watchProcessing();
  }

  let refreshPending=false;
  function scheduleRefresh(){
    if(refreshPending)return;
    refreshPending=true;
    const schedule=window.requestAnimationFrame||((fn)=>setTimeout(fn,16));
    schedule(()=>{refreshPending=false;refresh()});
  }

  const observer=new MutationObserver(records=>{
    if(records.some(record=>record.addedNodes?.length||record.type==='attributes'))scheduleRefresh();
  });

  function start(){
    if(started)return;
    started=true;
    refresh();
    observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['style','class']});
  }

  document.addEventListener('seven:modechange',renderContextRail);
  document.addEventListener('seven:visualready',start,{once:true});
  if(window.SevenVisualShell&&document.documentElement.dataset.sevenVisual==='brand-os-v1')start();
  window.SevenVisualPolish=Object.freeze({version:1,refresh,renderContextRail,start});
})();

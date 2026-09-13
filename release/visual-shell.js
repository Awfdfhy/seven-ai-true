(()=>{
  'use strict';
  const MARK=/*__SEVEN_MARK__*/;
  const MODES={
    core:{label:'Core',short:'Core',hint:'General intelligence',placeholder:'Message Seven…',icon:'<circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/>'},
    build:{label:'Build',short:'Build',hint:'Coding and agents',placeholder:'Ask Seven to build, inspect, or debug…',icon:'<path d="M8 9 4 12l4 3M16 9l4 3-4 3M14 5l-4 14"/>'},
    world:{label:'World',short:'World',hint:'RPG and canon',placeholder:'Enter the world…',icon:'<path d="M12 3a9 9 0 1 0 9 9M3.6 9h16.8M3.6 15h10.7M12 3c2.1 2.3 3.2 5.3 3.2 9 0 1.1-.1 2.1-.3 3M12 21c-2.1-2.3-3.2-5.3-3.2-9S9.9 5.3 12 3"/>'},
    research:{label:'Research',short:'Research',hint:'Evidence and sources',placeholder:'Ask a research question…',icon:'<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5M8 10.5h5M10.5 8v5"/>'}
  };
  const MODE_KEY='seven_ui_mode_v1';
  const svgIcon=body=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;

  function mark(size='top',animate=false){
    const host=document.createElement('span');
    host.className='seven-brand-mark';
    host.dataset.size=size;
    host.dataset.animate=animate?'true':'false';
    host.innerHTML=MARK;
    const orbit=host.querySelector('ellipse');
    if(orbit) orbit.classList.add('seven-orbit');
    return host;
  }
  function currentMode(){const saved=localStorage.getItem(MODE_KEY);return MODES[saved]?saved:'core';}
  function writeText(node,value){if(node&&node.textContent!==value)node.textContent=value;}

  function setMode(mode,{persist=true,announce=true}={}){
    if(!MODES[mode])mode='core';
    if(document.documentElement.dataset.sevenMode!==mode)document.documentElement.dataset.sevenMode=mode;
    if(persist&&localStorage.getItem(MODE_KEY)!==mode)localStorage.setItem(MODE_KEY,mode);
    document.querySelectorAll('.seven-mode-button').forEach(btn=>{
      const next=btn.dataset.mode===mode?'true':'false';
      if(btn.getAttribute('aria-selected')!==next)btn.setAttribute('aria-selected',next);
    });
    document.querySelectorAll('[data-seven-mode-label]').forEach(node=>writeText(node,MODES[mode].label));
    const input=document.getElementById('userInput');
    if(input&&input.placeholder!==MODES[mode].placeholder)input.placeholder=MODES[mode].placeholder;
    decorateEmptyState();
    if(announce)document.dispatchEvent(new CustomEvent('seven:modechange',{detail:{mode}}));
  }

  function upgradeSidebar(){
    const header=document.querySelector('.sidebar-header');
    if(!header||header.dataset.sevenUpgraded==='1')return;
    header.dataset.sevenUpgraded='1';
    header.querySelector('img.app-icon')?.remove();
    header.querySelector('.app-name')?.remove();
    const lockup=document.createElement('div');lockup.className='seven-brand-lockup';lockup.append(mark('sidebar',false));
    const words=document.createElement('div');words.className='seven-brand-wordmark';words.innerHTML='<strong>Seven</strong><small>Intelligence System</small>';
    lockup.append(words);header.append(lockup);
  }

  function upgradeTopbar(){
    const topbar=document.querySelector('.topbar');
    if(!topbar||topbar.dataset.sevenUpgraded==='1')return;
    topbar.dataset.sevenUpgraded='1';
    const menu=topbar.querySelector('.menu-toggle');
    const identity=document.createElement('div');identity.className='seven-top-identity';identity.append(mark('top',false));
    const text=document.createElement('div');text.innerHTML='<strong>Seven</strong><br><span data-seven-mode-label>Core</span>';identity.append(text);
    if(menu&&menu.nextSibling)topbar.insertBefore(identity,menu.nextSibling);else topbar.prepend(identity);
    const dock=document.createElement('nav');dock.className='seven-mode-dock';dock.setAttribute('aria-label','Seven modes');
    Object.entries(MODES).forEach(([id,mode])=>{
      const btn=document.createElement('button');btn.type='button';btn.className='seven-mode-button';btn.dataset.mode=id;btn.title=mode.hint;
      btn.setAttribute('aria-selected','false');btn.setAttribute('aria-label',mode.label+' mode');btn.innerHTML=svgIcon(mode.icon)+`<span>${mode.short}</span>`;
      btn.addEventListener('click',()=>setMode(id));dock.append(btn);
    });
    const gear=topbar.querySelector('.icon-btn');if(gear)topbar.insertBefore(dock,gear);else topbar.append(dock);
  }

  function decorateEmptyState(){
    const empty=document.querySelector('.empty-state');if(!empty)return;
    let identity=empty.querySelector('.seven-empty-identity');
    if(!identity){
      identity=document.createElement('div');identity.className='seven-empty-identity';
      const stage=document.createElement('div');stage.className='seven-empty-orbit-stage';stage.append(mark('hero',true));identity.append(stage);
      const greeting=empty.querySelector('.empty-greeting');if(greeting)empty.insertBefore(identity,greeting);else empty.prepend(identity);
    }
    let kicker=empty.querySelector('.seven-mode-kicker');
    if(!kicker){kicker=document.createElement('div');kicker.className='seven-mode-kicker';kicker.innerHTML='<span data-seven-mode-label></span><span>workspace</span>';empty.append(kicker);}
    writeText(kicker.querySelector('[data-seven-mode-label]'),MODES[currentMode()].label);
  }

  function upgradeComposer(){
    const area=document.querySelector('.input-area');const composer=area?.querySelector('.composer');
    if(!area||!composer||area.querySelector('.seven-composer-meta'))return;
    const meta=document.createElement('div');meta.className='seven-composer-meta';meta.innerHTML='<span>Local state ready</span><span><b data-seven-mode-label>Core</b> · adaptive runtime</span>';
    composer.insertAdjacentElement('afterend',meta);
  }

  function sectionizeSettings(){
    const modal=document.querySelector('#settingsModal .modal-content');
    if(!modal||modal.dataset.sevenSettings==='1')return;
    modal.dataset.sevenSettings='1';
    const originalTitle=modal.querySelector(':scope > h3');const actions=modal.querySelector(':scope > .modal-buttons');
    const head=document.createElement('div');head.className='seven-settings-head';head.append(mark('modal',false));
    const headText=document.createElement('div');headText.innerHTML='<h3>Seven Settings</h3><p>Models, memory, knowledge and local runtime controls</p>';head.append(headText);modal.insertBefore(head,modal.firstChild);
    const grid=document.createElement('div');grid.className='seven-settings-grid';if(originalTitle?.nextSibling)modal.insertBefore(grid,originalTitle.nextSibling);else modal.append(grid);
    const definitions={intelligence:['Intelligence','Routing'],providers:['Providers','Free only'],generation:['Generation','Response'],memory:['Memory & Knowledge','Context'],data:['Data & Appearance','Local']};
    const sections={};
    for(const [key,[title,badge]] of Object.entries(definitions)){
      const section=document.createElement('section');section.className='seven-settings-section';section.dataset.section=key;if(key==='memory'||key==='data')section.dataset.span='2';
      const heading=document.createElement('div');heading.className='seven-settings-section-title';heading.innerHTML=`<span>${title}</span><small>${badge}</small>`;section.append(heading);sections[key]=section;grid.append(section);
    }
    const candidates=Array.from(modal.children).filter(node=>node!==head&&node!==grid&&node!==originalTitle&&node!==actions);
    let bucket='intelligence';
    for(const node of candidates){
      const value=(node.textContent||'').trim().replace(/\s+/g,' ');
      if(value==='Free Providers')bucket='providers';
      else if(node.tagName==='LABEL'&&/^Temperature\b/i.test(value))bucket='generation';
      else if(node.tagName==='LABEL'&&/^Pinned Notes/i.test(value))bucket='memory';
      else if(node.classList?.contains('settings-row')&&/Export/i.test(value))bucket='data';
      sections[bucket].append(node);
    }
    if(actions)modal.append(actions);
  }

  function upgradeNameModal(){
    const modal=document.querySelector('#nameModal .modal-content');if(!modal||modal.dataset.sevenBrand==='1')return;
    modal.dataset.sevenBrand='1';const old=modal.querySelector('img.name-modal-logo');
    if(old){const holder=mark('hero',false);holder.style.width='82px';holder.style.height='82px';holder.style.margin='0 auto 12px';old.replaceWith(holder);}
  }

  function upgradeThemeMotion(){
    if(typeof window.toggleTheme!=='function'||window.toggleTheme.__sevenWrapped)return;
    const original=window.toggleTheme;
    function wrapped(...args){document.documentElement.classList.remove('seven-theme-shift');void document.documentElement.offsetWidth;document.documentElement.classList.add('seven-theme-shift');const result=original.apply(this,args);setTimeout(()=>document.documentElement.classList.remove('seven-theme-shift'),650);return result;}
    wrapped.__sevenWrapped=true;window.toggleTheme=wrapped;
  }

  function ensureAccessibleLabels(){const sidebar=document.getElementById('sidebar');if(sidebar)sidebar.setAttribute('aria-label','Seven navigation');}

  let refreshPending=false;
  function refreshDerivedUI(){refreshPending=false;decorateEmptyState();sectionizeSettings();upgradeNameModal();}
  function scheduleRefresh(){if(refreshPending)return;refreshPending=true;(window.requestAnimationFrame||((fn)=>setTimeout(fn,16)))(refreshDerivedUI);}

  function boot(){
    if(window.SevenVisualShell)return;
    upgradeSidebar();upgradeTopbar();upgradeComposer();sectionizeSettings();upgradeNameModal();decorateEmptyState();upgradeThemeMotion();ensureAccessibleLabels();
    setMode(currentMode(),{persist:false,announce:false});
    document.documentElement.dataset.sevenVisual='brand-os-v1';document.documentElement.classList.add('seven-visual-ready');
    window.SevenVisualShell=Object.freeze({version:1,setMode,currentMode,refresh:refreshDerivedUI});
    const observer=new MutationObserver(records=>{if(records.some(record=>record.addedNodes&&record.addedNodes.length))scheduleRefresh();});
    observer.observe(document.body,{subtree:true,childList:true});
    document.dispatchEvent(new CustomEvent('seven:visualready',{detail:{version:1,mode:currentMode()}}));
  }

  function foundationState(){
    try{return typeof roomPersistence!=='undefined'?roomPersistence.status():null;}catch(_){return null;}
  }
  function hydrateAfterFoundation(){
    const state=foundationState();
    if(state&&(state.ready||state.failed)){boot();return;}
    const status=document.getElementById('persistenceStatus');
    if(!status){
      if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',hydrateAfterFoundation,{once:true});
      else setTimeout(hydrateAfterFoundation,0);
      return;
    }
    const observer=new MutationObserver(()=>{
      const next=foundationState();
      if(next&&(next.ready||next.failed)){observer.disconnect();boot();}
    });
    observer.observe(status,{childList:true,characterData:true,subtree:true});
    const raced=foundationState();
    if(raced&&(raced.ready||raced.failed)){observer.disconnect();boot();}
  }

  hydrateAfterFoundation();
})();

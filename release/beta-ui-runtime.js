(function(root){
  'use strict';
  if(!root||!root.document)return;
  const doc=root.document;
  const state={ready:false,version:'1.0.0-beta.1'};

  function ensureBadge(){
    const topbar=doc.querySelector('.topbar');
    if(!topbar||topbar.querySelector('.seven-beta-badge'))return;
    const host=topbar.querySelector('.title')||topbar;
    const badge=doc.createElement('span');
    badge.className='seven-beta-badge';
    badge.textContent='BETA';
    badge.setAttribute('aria-label','Seven beta interface');
    badge.dataset.sevenBetaBadge='1';
    host.appendChild(badge);
  }

  function decorate(){
    const html=doc.documentElement;
    html.dataset.sevenBetaUi='v1';
    html.classList.add('seven-beta-ui');
    const surfaces=[
      ['.sidebar','navigation'],
      ['.topbar','topbar'],
      ['#chat','conversation'],
      ['.composer','composer']
    ];
    for(const [selector,name] of surfaces){
      const node=doc.querySelector(selector);
      if(!node)continue;
      node.dataset.sevenBetaSurface=name;
      node.classList.add('seven-beta-surface');
    }
    ensureBadge();
  }

  function boot(){
    if(state.ready)return state;
    decorate();
    state.ready=true;
    doc.documentElement.classList.add('seven-beta-ui-ready');
    return state;
  }

  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();

  root.SevenBetaUI={state,boot,sync:decorate};
})(typeof globalThis!=='undefined'?globalThis:this);

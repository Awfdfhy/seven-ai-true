(function(root){
'use strict';
if(!root||!root.document)return;
const d=root.document,L={chat:'Chat',think:'Think',search:'Search',research:'Research'},state={ready:false,version:'1.1.0-beta.2',mode:'chat',observer:null};
function q(s){return d.querySelector(s)}
function on(id){const n=q(id);return !!(n&&n.classList.contains('active'))}
function mode(){const t=on('#deepThinkToggle'),s=on('#searchToggle');return t&&s?'research':s?'search':t?'think':'chat'}
function badge(){
 const bar=q('.topbar');if(!bar)return;
 let b=q('.seven-beta-badge');if(!b){b=d.createElement('span');b.className='seven-beta-badge';b.textContent='BETA';b.setAttribute('aria-label','Seven beta interface');b.dataset.sevenBetaBadge='1';const title=bar.querySelector('.title');title&&title.parentNode===bar?title.insertAdjacentElement('afterend',b):bar.appendChild(b)}
 let s=q('.seven-beta-status');if(!s){s=d.createElement('span');s.className='seven-beta-status';s.setAttribute('role','status');s.setAttribute('aria-live','polite');s.innerHTML='<i aria-hidden="true"></i><span class="seven-beta-status-label"></span>';b.insertAdjacentElement('afterend',s)}
}
function tools(){
 const map=[['#deepThinkToggle','think'],['#searchToggle','search'],['.composer-tools .tool-btn:not(.toggle)','knowledge'],['.input-area button.send','send'],['.input-area button.stop','stop'],['.topbar .icon-btn','settings']];
 for(const [sel,name] of map){const n=q(sel);if(!n)continue;n.dataset.sevenBetaTool=name;if(!n.getAttribute('aria-label')&&n.title)n.setAttribute('aria-label',n.title)}
}
function syncMode(){
 const m=mode();state.mode=m;d.documentElement.dataset.sevenBetaMode=m;
 const c=q('.composer');if(c)c.dataset.sevenBetaMode=m;
 const s=q('.seven-beta-status');if(s){s.dataset.mode=m;s.title=L[m];const x=s.querySelector('.seven-beta-status-label');if(x)x.textContent=L[m]}
}
function decorate(){
 const h=d.documentElement;h.dataset.sevenBetaUi='v1';h.classList.add('seven-beta-ui');
 for(const [sel,name] of [['.sidebar','navigation'],['.topbar','topbar'],['#chat','conversation'],['.composer','composer']]){const n=q(sel);if(n){n.dataset.sevenBetaSurface=name;n.classList.add('seven-beta-surface')}}
 badge();tools();syncMode();
}
function watch(){
 if(state.observer)state.observer.disconnect();
 const targets=['#deepThinkToggle','#searchToggle'].map(q).filter(Boolean);if(!targets.length)return;
 state.observer=new MutationObserver(syncMode);targets.forEach(n=>state.observer.observe(n,{attributes:true,attributeFilter:['class']}));
}
function boot(){if(state.ready)return state;decorate();watch();state.ready=true;d.documentElement.classList.add('seven-beta-ui-ready');return state}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
root.SevenBetaUI={state,boot,sync(){decorate();watch();return state},syncMode};
})(typeof globalThis!=='undefined'?globalThis:this);

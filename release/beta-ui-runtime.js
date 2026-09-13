(function(root){
'use strict';
if(!root||!root.document)return;
const d=root.document,L={chat:'Chat',think:'Think',search:'Search',research:'Research'},K='theme',state={ready:false,version:'1.2.0-beta.1',mode:'chat',theme:'night',themePreference:'auto',observer:null,themeTimer:null};
function q(s){return d.querySelector(s)}
function on(id){const n=q(id);return !!(n&&n.classList.contains('active'))}
function mode(){const t=on('#deepThinkToggle'),s=on('#searchToggle');return t&&s?'research':s?'search':t?'think':'chat'}
function pref(){try{const p=localStorage.getItem(K);return p==='light'?'day':p==='dark'?'night':/^(auto|day|night)$/.test(p||'')?p:'auto'}catch(e){return'auto'}}
function resolved(p=pref(),h=new Date().getHours()){return p==='day'||p==='night'?p:h>=6&&h<18?'day':'night'}
function themeControl(p,t){const b=q('button[onclick="toggleTheme()"]');if(!b)return;const x=(p==='auto'?'Auto · ':'')+(t==='day'?'Day':'Night');b.dataset.sevenThemeControl='1';b.dataset.sevenThemeState=x;b.title='Theme: '+x;b.setAttribute('aria-label','Theme: '+x)}
function applyTheme(emit){
 const p=pref(),t=resolved(p),old=state.theme;state.theme=t;state.themePreference=p;
 const h=d.documentElement;h.dataset.sevenTheme=t;h.dataset.sevenThemePreference=p;
 if(d.body)d.body.classList.toggle('light',t==='day');
 const m=q('meta[name="theme-color"]');if(m)m.content=t==='day'?'#f7f6fb':'#0f0d1d';
 themeControl(p,t);
 if(emit&&old!==t)d.dispatchEvent(new CustomEvent('seven:themechange',{detail:{theme:t,preference:p}}));
 return{theme:t,preference:p}
}
function planTheme(){
 if(state.themeTimer)clearTimeout(state.themeTimer);state.themeTimer=null;if(pref()!=='auto')return;
 const n=new Date(),b=new Date(n),h=n.getHours();if(h<6)b.setHours(6,0,0,250);else if(h<18)b.setHours(18,0,0,250);else{b.setDate(b.getDate()+1);b.setHours(6,0,0,250)}
 state.themeTimer=setTimeout(()=>{applyTheme(true);planTheme()},Math.max(1000,b-n));
}
function setTheme(p){p=/^(auto|day|night)$/.test(p)?p:'auto';try{localStorage.setItem(K,p)}catch(e){}const x=applyTheme(true);planTheme();return x}
function cycleTheme(){const p=pref();return setTheme(p==='auto'?'day':p==='day'?'night':'auto')}
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
 badge();tools();syncMode();applyTheme(false);
}
function watch(){
 if(state.observer)state.observer.disconnect();
 const targets=['#deepThinkToggle','#searchToggle'].map(q).filter(Boolean);if(!targets.length)return;
 state.observer=new MutationObserver(syncMode);targets.forEach(n=>state.observer.observe(n,{attributes:true,attributeFilter:['class']}));
}
function boot(){if(state.ready)return state;decorate();watch();planTheme();d.addEventListener('visibilitychange',()=>{if(!d.hidden){applyTheme(true);planTheme()}},{passive:true});root.toggleTheme=cycleTheme;state.ready=true;d.documentElement.classList.add('seven-beta-ui-ready');return state}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
root.SevenTheme={version:'1.0.0-beta.1',getPreference:pref,getResolvedTheme:()=>resolved(pref()),setPreference:setTheme,sync:()=>applyTheme(true),cycle:cycleTheme};
root.SevenBetaUI={state,boot,sync(){decorate();watch();planTheme();return state},syncMode};
})(typeof globalThis!=='undefined'?globalThis:this);

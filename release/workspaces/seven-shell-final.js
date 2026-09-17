(function(r){
'use strict';
if(!r||!r.document)return;
const d=r.document,$=s=>d.querySelector(s),qa=s=>Array.from(d.querySelectorAll(s));
const S={version:'3.0.2',ready:false,observer:null,workspaceLoading:null,attachmentWarm:false,events:false};
const AR=()=>/^ar\b/i.test(d.documentElement.lang||'');
const T=(en,ar)=>AR()?ar:en;
function visible(el){if(!el||el.hidden)return false;const c=r.getComputedStyle?r.getComputedStyle(el):null;return !c||c.display!=='none';}
function mark(){d.documentElement.dataset.sevenShellFinal='1';if(d.body)d.body.dataset.sevenShellFinal='1';}
function cleanChrome(){
  qa('.seven-beta-badge,[data-seven-beta-badge]').forEach(x=>x.remove());
  const roots=qa('.topbar,.sidebar,.settings-modal,.settings-panel,.modal,.seven-ws-launcher');
  roots.forEach(root=>qaWithin(root,'[aria-label],[title]').forEach(el=>{['aria-label','title'].forEach(a=>{const v=el.getAttribute(a);if(v&&/\bbeta\b/i.test(v))el.setAttribute(a,v.replace(/\s*beta\s*/ig,' ').replace(/\s{2,}/g,' ').trim())})}));
  qa('.app-name').forEach(el=>{if(/^seven(?:\s+ai|\.ai)?$/i.test(String(el.textContent||'').trim()))el.textContent='seven.ai'});
}
function qaWithin(root,s){try{return Array.from(root.querySelectorAll(s))}catch(_){return[]}}
function nativeNewChat(){return qa('button,[role="button"]').find(x=>!x.classList.contains('seven-shell-new')&&!x.closest('.seven-shell-primary-nav')&&/^new chat$/i.test(String(x.textContent||x.getAttribute('aria-label')||x.title||'').trim()));}
function loadWorkspaces(){
  if(r.SevenWorkspaces)return Promise.resolve(r.SevenWorkspaces);
  if(S.workspaceLoading)return S.workspaceLoading;
  S.workspaceLoading=new Promise((resolve,reject)=>{
    let s=d.getElementById('seven-workspaces-runtime');
    const done=()=>r.SevenWorkspaces?resolve(r.SevenWorkspaces):reject(Error('Workspace runtime did not register'));
    if(s){s.addEventListener('load',done,{once:true});setTimeout(()=>r.SevenWorkspaces&&resolve(r.SevenWorkspaces),0);return;}
    s=d.createElement('script');s.id='seven-workspaces-runtime';s.src='./workspaces/hub.js';s.onload=done;s.onerror=()=>reject(Error('Could not load workspaces'));d.head.appendChild(s);
  }).finally(()=>{S.workspaceLoading=null});
  return S.workspaceLoading;
}
async function openWorkspace(kind){
  kind=/^(chat|coding|research|rpg)$/.test(kind)?kind:'chat';
  try{const api=await loadWorkspaces();if(kind==='chat')api.close();else await api.open(kind);sync();}catch(_){const status=$('.seven-beta-status');if(status&&visible(status))status.click();}
}
function navButton(kind,icon,label){const b=d.createElement('button');b.type='button';b.dataset.sevenShellWorkspace=kind;b.className='seven-shell-nav-btn';b.innerHTML='<span aria-hidden="true">'+icon+'</span><span>'+label+'</span>';b.setAttribute('aria-label',label);b.onclick=()=>openWorkspace(kind);return b;}
function ensureNav(){
  const side=$('.sidebar');if(!side)return;
  let nav=$('.seven-shell-primary-nav');
  if(!nav){nav=d.createElement('nav');nav.className='seven-shell-primary-nav';nav.setAttribute('aria-label',T('Seven spaces','مساحات Seven'));
    const fresh=d.createElement('button');fresh.type='button';fresh.className='seven-shell-nav-btn seven-shell-nav-new';fresh.innerHTML='<span aria-hidden="true">＋</span><span>'+T('New chat','محادثة جديدة')+'</span>';fresh.onclick=()=>{const n=nativeNewChat();if(n)n.click();else try{if(typeof r.createNewChat==='function')r.createNewChat()}catch(_){}};nav.appendChild(fresh);
    nav.appendChild(navButton('chat','◌',T('Chat','الدردشة')));nav.appendChild(navButton('coding','⌘',T('Code','البرمجة')));nav.appendChild(navButton('research','⌕',T('Research','البحث')));nav.appendChild(navButton('rpg','✦','RPG'));
    const anchor=$('.seven-shell-section-label')||$('#roomList')||side.lastElementChild;anchor&&anchor.parentNode?anchor.parentNode.insertBefore(nav,anchor):side.appendChild(nav);
  }
  syncNav();
}
function activeWorkspace(){return d.documentElement.dataset.sevenWorkspace||'chat';}
function syncNav(){const active=activeWorkspace();qa('[data-seven-shell-workspace]').forEach(b=>{const on=b.dataset.sevenShellWorkspace===active;if(b.classList.contains('active')!==on)b.classList.toggle('active',on);const cur=on?'page':'false';if(b.getAttribute('aria-current')!==cur)b.setAttribute('aria-current',cur)});const chip=$('.seven-shell-workspace-chip');if(chip){chip.dataset.workspace=active;const label=chip.querySelector('[data-seven-shell-workspace-label]');if(label)label.textContent=active==='coding'?T('Coding','البرمجة'):active==='research'?T('Research','البحث'):active==='rpg'?'RPG':T('Chat','الدردشة')}}
function ensureWorkspaceChip(){const top=$('.topbar');if(!top)return;let b=$('.seven-shell-workspace-chip');if(!b){b=d.createElement('button');b.type='button';b.className='seven-shell-workspace-chip';b.setAttribute('aria-label',T('Switch workspace','تبديل المساحة'));b.innerHTML='<span class="seven-shell-workspace-glyph" aria-hidden="true">7</span><span data-seven-shell-workspace-label>Chat</span><span aria-hidden="true">⌄</span>';b.onclick=async()=>{try{const api=await loadWorkspaces();api.openLauncher()}catch(_){}};const model=$('.seven-shell-model-chip');model?model.insertAdjacentElement('afterend',b):top.appendChild(b)}syncNav();}
function warmAttachments(){if(S.attachmentWarm||r.SevenAttachments)return;const loader=r.SevenAttachmentLoader;if(loader&&typeof loader.load==='function'){S.attachmentWarm=true;loader.load().catch(()=>{S.attachmentWarm=false})}}
function polishComposer(){
  const tools=$('.composer-tools');if(tools){if(tools.getAttribute('role')!=='toolbar')tools.setAttribute('role','toolbar');const label=T('Message tools','أدوات الرسالة');if(tools.getAttribute('aria-label')!==label)tools.setAttribute('aria-label',label);}
  const attach=$('[data-seven-attach-trigger],.composer-tools .tool-btn:not(.toggle)');if(attach){if(!attach.classList.contains('seven-shell-attach-trigger'))attach.classList.add('seven-shell-attach-trigger');const label=T('Attach photos or files','إرفاق صور أو ملفات');if(attach.getAttribute('aria-label')!==label)attach.setAttribute('aria-label',label);if(attach.title!==label)attach.title=label;}
  const mode=$('.seven-mode-trigger');if(mode){const label=T('Response mode','نمط الإجابة');if(mode.getAttribute('aria-label')!==label)mode.setAttribute('aria-label',label);if(mode.title!==label)mode.title=label;}
  const send=$('#sendBtn,.input-area .send');if(send){const label=T('Send message','إرسال الرسالة');if(send.getAttribute('aria-label')!==label)send.setAttribute('aria-label',label);if(send.title!==label)send.title=label;}
}
function copyText(text){text=String(text||'').trim();if(!text)return Promise.resolve(false);if(r.navigator&&r.navigator.clipboard&&r.navigator.clipboard.writeText)return r.navigator.clipboard.writeText(text).then(()=>true).catch(()=>fallback(text));return Promise.resolve(fallback(text));}
function fallback(text){try{const a=d.createElement('textarea');a.value=text;a.style.cssText='position:fixed;opacity:0;pointer-events:none';d.body.appendChild(a);a.select();const ok=d.execCommand&&d.execCommand('copy');a.remove();return !!ok}catch(_){return false}}
function ensureCodeCopy(){qa('#chat .message.assistant pre').forEach(pre=>{if(pre.dataset.sevenShellCopy==='1')return;pre.dataset.sevenShellCopy='1';const b=d.createElement('button');b.type='button';b.className='seven-shell-code-copy';b.setAttribute('aria-label',T('Copy code','نسخ الكود'));b.textContent=T('Copy','نسخ');b.onclick=async e=>{e.preventDefault();e.stopPropagation();const ok=await copyText(pre.innerText||pre.textContent);b.textContent=ok?T('Copied','تم النسخ'):T('Copy','نسخ');setTimeout(()=>{if(b.isConnected)b.textContent=T('Copy','نسخ')},1000)};pre.appendChild(b)})}
function polishSettings(){
  qa('.settings-modal,.settings-panel,.modal').forEach(m=>{if(m.dataset.sevenShellSurface!=='settings')m.dataset.sevenShellSurface='settings';if(m.getAttribute('data-seven-shell-polished')!=='1')m.setAttribute('data-seven-shell-polished','1')});
  qa('.settings-modal input,.settings-modal select,.settings-modal textarea,.settings-panel input,.settings-panel select,.settings-panel textarea,.modal input,.modal select,.modal textarea').forEach(x=>{if(!x.classList.contains('seven-shell-field'))x.classList.add('seven-shell-field')});
}
function polishWorkspaces(){qa('.seven-ws-launcher,.seven-workspace-root').forEach(x=>{if(x.dataset.sevenShellIntegrated!=='1')x.dataset.sevenShellIntegrated='1'});qa('.seven-ws-choice').forEach(x=>{if(x.getAttribute('data-seven-shell-card')!=='1')x.setAttribute('data-seven-shell-card','1')});}
function isAttachIntentTarget(target){return !!(target&&target.closest&&target.closest('[data-seven-attach-trigger],.seven-shell-attach-trigger'));}
function installEvents(){if(S.events)return;S.events=true;d.addEventListener('pointerdown',e=>{if(isAttachIntentTarget(e.target))warmAttachments()},{capture:true,passive:true});d.addEventListener('focusin',e=>{if(isAttachIntentTarget(e.target))warmAttachments()},{passive:true});d.addEventListener('seven:workspacechange',()=>setTimeout(sync,0));d.addEventListener('seven:themechange',()=>setTimeout(sync,0));d.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='/'){e.preventDefault();const input=$('#userInput');input&&input.focus({preventScroll:false})}})}
let pending=false;function sync(){if(pending)return;pending=true;const run=()=>{pending=false;mark();cleanChrome();ensureNav();ensureWorkspaceChip();polishComposer();polishSettings();polishWorkspaces();ensureCodeCopy();syncNav()};if(typeof r.requestAnimationFrame==='function')r.requestAnimationFrame(run);else setTimeout(run,0)}
function boot(){if(S.ready){sync();return S}mark();installEvents();sync();if(d.body&&!S.observer){S.observer=new MutationObserver(sync);S.observer.observe(d.body,{childList:true,subtree:true})}S.ready=true;d.dispatchEvent(new CustomEvent('seven:shellfinalready',{detail:{version:S.version}}));return S}
d.readyState==='loading'?d.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
r.SevenShellFinal={version:S.version,state:S,boot,sync,openWorkspace,warmAttachments};
})(typeof globalThis!='undefined'?globalThis:this);

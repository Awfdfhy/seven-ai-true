(function(r){'use strict';if(!r||!r.document)return;
const d=r.document,pending=new Map();
function asset(global,id,file,method){
  if(r[global])return Promise.resolve(r[global]);
  if(pending.has(global))return pending.get(global);
  if(!d.getElementById(id+'-style')){const l=d.createElement('link');l.id=id+'-style';l.rel='stylesheet';l.href='./workspaces/'+file+'.css';d.head.appendChild(l)}
  const promise=new Promise((resolve,reject)=>{
    const old=d.getElementById(id+'-runtime');if(old)old.remove();
    const s=d.createElement('script');s.id=id+'-runtime';s.src='./workspaces/'+file+'.js';
    function fail(error){s.remove();pending.delete(global);reject(error)}
    s.onload=()=>{try{const api=r[global];if(!api)throw Error(global+' runtime did not register');if(typeof api[method]==='function')api[method]();resolve(api)}catch(e){fail(e)}};
    s.onerror=()=>fail(Error(global+' runtime failed to load'));d.head.appendChild(s);
  });
  pending.set(global,promise);return promise;
}
const load=()=>asset('SevenUiPolish','seven-ui-polish','ui-polish-fixes','sync');
const loadFinal=()=>asset('SevenShellFinal','seven-shell-final','seven-shell-final','boot');
function warm(){loadFinal().catch(()=>{});load().catch(()=>{})}
 d.addEventListener('click',e=>{if(e.target?.closest?.('.menu-toggle,.topbar .icon-btn,[onclick*="openSettings"],[data-seven-beta-tool="settings"]'))warm()},true);
 d.addEventListener('seven:workspacechange',warm);
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(warm),{once:true});else requestAnimationFrame(warm);
r.SevenUiPolishLoader={load,loadFinal};
})(typeof globalThis!='undefined'?globalThis:this);

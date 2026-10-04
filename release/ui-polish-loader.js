(function(r){'use strict';if(!r||!r.document)return;const d=r.document,P={},C={
p:['SevenUiPolish','seven-ui-polish-style','./workspaces/ui-polish-fixes.css','seven-ui-polish-runtime','./workspaces/ui-polish-fixes.js','sync'],
s:['SevenShell','seven-shell-style','./workspaces/seven-shell.css','seven-shell-runtime','./workspaces/seven-shell.js','boot'],
f:['SevenShellFinal','seven-shell-final-style','./workspaces/seven-shell-final.css','seven-shell-final-runtime','./workspaces/seven-shell-final.js','boot']
};
function L(k){const c=C[k],g=c[0];if(r[g])return Promise.resolve(r[g]);if(P[k])return P[k];return P[k]=new Promise((ok,no)=>{if(!d.getElementById(c[1])){const x=d.createElement('link');x.id=c[1];x.rel='stylesheet';x.href=c[2];d.head.appendChild(x)}let s=d.getElementById(c[3]);const done=()=>{const x=r[g];if(!x){P[k]=null;no(Error(g+' did not register'));return}if(typeof x[c[5]]==='function')x[c[5]]();ok(x)};if(s){s.addEventListener('load',done,{once:true});setTimeout(()=>r[g]&&done(),0);return}s=d.createElement('script');s.id=c[3];s.src=c[4];s.onload=done;s.onerror=()=>{P[k]=null;no(Error(g+' failed to load'))};d.head.appendChild(s)})}
const load=()=>L('p'),loadShell=()=>L('s'),loadFinal=()=>L('f');
function warm(){loadShell().then(loadFinal).catch(()=>{});load().catch(()=>{})}
d.addEventListener('click',e=>{const t=e.target&&e.target.closest&&e.target.closest('.menu-toggle,.topbar .icon-btn,[onclick*="openSettings"],[data-seven-beta-tool="settings"]');if(t)warm()},true);
d.addEventListener('seven:workspacechange',warm);
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(warm),{once:true});else requestAnimationFrame(warm);
r.SevenUiPolishLoader={load,loadShell,loadFinal};
})(typeof globalThis!='undefined'?globalThis:this);

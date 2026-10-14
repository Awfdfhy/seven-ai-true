/* Seven RPG: locally installed scenery library, no external requests. */
(function(win,doc){
'use strict';
if(!win||!doc)return;
const el=id=>doc.getElementById(id);
let scenes=[],index=-1,key='';
function choose(){
  if(!scenes.length)return;
  const world=win.SevenRpgWorkspace?.state?.worldEngine?.work;
  const title=String(world?.title||'Your untold story');
  const id=String(world?.id||title);
  if(key!==id){
    key=id;
    let h=2166136261;for(let i=0;i<id.length;i++){h=Math.imul(h^id.charCodeAt(i),16777619)}
    let saved=null;try{const memory=JSON.parse(localStorage.getItem('seven-rpg-world-scenery-v1')||'{}');saved=memory[id];}catch(_){}
    index=Number.isSafeInteger(saved)&&saved>=0?saved%scenes.length:(h>>>0)%scenes.length;
  }
  const chosen=scenes[index];
  const filename=String(chosen?.file||'');
  if(!/^[a-z0-9-]+\.jpg$/.test(filename))return;
  const host=el('rpg-scene-vista');
  if(host){host.style.setProperty('--rpg-vista-image','url("./rpg-scenes/'+filename+'")');host.dataset.sceneKind=chosen.kind||'story';}
  const label=el('rpg-vista-world-title');if(label)label.textContent=title;
  const count=el('rpg-scene-count');if(count)count.textContent=(index+1)+' / '+scenes.length;
}
async function setup(){
  const button=el('rpg-art-cycle');
  if(button){button.hidden=true;button.addEventListener('click',()=>{
    if(!scenes.length)return;
    index=(index+1)%scenes.length;
    try{
      const memory=JSON.parse(localStorage.getItem('seven-rpg-world-scenery-v1')||'{}');
      memory[key]=index;
      const ids=Object.keys(memory);while(ids.length>48)delete memory[ids.shift()];
      localStorage.setItem('seven-rpg-world-scenery-v1',JSON.stringify(memory));
    }catch(_){}
    choose();
  });}
  try{
    const response=await fetch('./rpg-scenes/manifest.json');
    if(!response.ok)throw Error('No scene assets');
    const json=await response.json();
    if(json.schema!=='seven-rpg-scene-pack.v1'||!Array.isArray(json.scenes))throw Error('Invalid scenery');
    scenes=json.scenes.filter(row=>/^[a-z0-9-]+\.jpg$/.test(String(row?.file||'')));
    if(!scenes.length)throw Error('Empty scenery');
    if(button)button.hidden=false;
    doc.documentElement.dataset.rpgScenePack='ready';choose();
  }catch(_){doc.documentElement.dataset.rpgScenePack='unavailable';}
  doc.addEventListener('seven:roomchange',()=>win.setTimeout(choose,80));
  doc.addEventListener('seven:rpg-world-created',choose);
  const roomTitle=el('roomTitle');
  if(roomTitle&&win.MutationObserver){
    new win.MutationObserver(()=>choose()).observe(roomTitle,{childList:true,characterData:true,subtree:true});
  }
  win.addEventListener('pageshow',choose);
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})(typeof window==='undefined'?null:window,typeof document==='undefined'?null:document);

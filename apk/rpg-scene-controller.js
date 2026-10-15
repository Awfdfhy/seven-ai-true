/* Seven RPG: offline cinematic scenery with lightweight previews and a fullscreen art gallery. */
(function(win,doc){
'use strict';
if(!win||!doc)return;
const el=id=>doc.getElementById(id);
const SAFE=/^[a-z0-9-]+\.jpg$/;
let scenes=[],index=-1,key='',lastFocus=null;
function current(){return scenes[index]||null;}
function worldId(){
 const world=win.SevenRpgWorkspace?.state?.worldEngine?.work;
 const title=String(world?.title||'Your untold story');
 return {id:String(world?.id||title),title};
}
function sceneUrl(row,preview){
 const name=String(preview?row?.preview:row?.file||'');
 if(preview&&/^previews\/[a-z0-9-]+\.jpg$/.test(name))return './rpg-scenes/'+name;
 const fallback=String(row?.file||'');
 return SAFE.test(fallback)?'./rpg-scenes/'+fallback:'';
}
function updateGallery(){
 const overlay=el('rpg-scene-gallery');
 if(!overlay||overlay.hidden)return;
 const item=current();if(!item)return;
 const image=el('rpg-gallery-image'),title=el('rpg-gallery-title');
 if(image){const url=sceneUrl(item,false);if(url&&image.getAttribute('src')!==url)image.src=url;image.alt=String(item.name||'RPG story scenery').replace(/-/g,' ');}
 if(title)title.textContent=(index+1)+' / '+scenes.length+' · '+String(item.name||'World scenery').replace(/-/g,' ');
}
function choose(){
 if(!scenes.length)return;
 const {id,title}=worldId();
 if(key!==id){
   key=id;
   let h=2166136261;for(let i=0;i<id.length;i++)h=Math.imul(h^id.charCodeAt(i),16777619);
   let saved=null;
   try{const memory=JSON.parse(localStorage.getItem('seven-rpg-world-scenery-v1')||'{}');saved=memory[id];}catch(_){}
   index=Number.isSafeInteger(saved)&&saved>=0?saved%scenes.length:(h>>>0)%scenes.length;
 }
 const chosen=current();const url=sceneUrl(chosen,true);
 const host=el('rpg-scene-vista');
 if(host&&url){host.style.setProperty('--rpg-vista-image','url("'+url+'")');host.dataset.sceneKind=chosen.kind||'story';}
 const label=el('rpg-vista-world-title');if(label)label.textContent=title;
 const count=el('rpg-scene-count');if(count)count.textContent=(index+1)+' / '+scenes.length;
 updateGallery();
}
function remember(){
 try{
   const memory=JSON.parse(localStorage.getItem('seven-rpg-world-scenery-v1')||'{}');
   memory[key]=index;
   const ids=Object.keys(memory);while(ids.length>48)delete memory[ids.shift()];
   localStorage.setItem('seven-rpg-world-scenery-v1',JSON.stringify(memory));
 }catch(_){}
}
function cycle(delta){
 if(!scenes.length)return;
 index=(index+delta+scenes.length)%scenes.length;remember();choose();
}
function closeGallery(){
 const overlay=el('rpg-scene-gallery');if(!overlay||overlay.hidden)return;
 overlay.hidden=true;doc.documentElement.classList.remove('rpg-art-open');
 const img=el('rpg-gallery-image');if(img)img.removeAttribute('src'); // release 2560px decoded texture
 if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});
 lastFocus=null;
}
function openGallery(){
 if(!current())return;
 const overlay=el('rpg-scene-gallery');if(!overlay)return;
 lastFocus=doc.activeElement;overlay.hidden=false;
 doc.documentElement.classList.add('rpg-art-open');updateGallery();
 el('rpg-gallery-close')?.focus({preventScroll:true});
}
function installGallery(){
 const host=el('rpg-scene-vista'),actions=host?.querySelector('.rpg-scene-vista-actions');
 if(!host||!actions||el('rpg-scene-gallery'))return;
 const open=doc.createElement('button');open.id='rpg-art-open';open.type='button';
 open.textContent='⤢';open.title='عرض الرسم كاملاً · Open scene art';open.setAttribute('aria-label','Open full scenery illustration');
 open.addEventListener('click',openGallery);actions.prepend(open);
 const overlay=doc.createElement('section');overlay.id='rpg-scene-gallery';
 overlay.className='rpg-scene-gallery';overlay.hidden=true;overlay.setAttribute('role','dialog');
 overlay.setAttribute('aria-modal','true');overlay.setAttribute('aria-label','Full-screen RPG world illustration');
 overlay.innerHTML='<div class="rpg-gallery-toolbar"><strong id="rpg-gallery-title">World art</strong><button id="rpg-gallery-close" type="button" aria-label="Close illustration">✕</button></div><div class="rpg-gallery-canvas"><img id="rpg-gallery-image" alt="" decoding="async"></div><div class="rpg-gallery-controls"><button type="button" id="rpg-gallery-prev" aria-label="Previous scenery">‹ Previous</button><button type="button" id="rpg-gallery-next" aria-label="Next scenery">Next ›</button></div>';
 doc.body.appendChild(overlay);
 el('rpg-gallery-close').addEventListener('click',closeGallery);
 el('rpg-gallery-prev').addEventListener('click',()=>cycle(-1));
 el('rpg-gallery-next').addEventListener('click',()=>cycle(1));
 overlay.addEventListener('click',event=>{if(event.target===overlay)closeGallery();});
 doc.addEventListener('keydown',event=>{
   if(overlay.hidden)return;
   if(event.key==='Escape'){event.preventDefault();closeGallery();}
   else if(event.key==='ArrowLeft'){event.preventDefault();cycle(-1);}
   else if(event.key==='ArrowRight'){event.preventDefault();cycle(1);}
   else if(event.key==='Tab'){
     const controls=[el('rpg-gallery-close'),el('rpg-gallery-prev'),el('rpg-gallery-next')];
     const at=controls.indexOf(doc.activeElement);
     if(event.shiftKey&&at===0){event.preventDefault();controls[2].focus();}
     else if(!event.shiftKey&&at===2){event.preventDefault();controls[0].focus();}
   }
 },true);
}
async function setup(){
 const button=el('rpg-art-cycle');
 installGallery();
 if(button){button.hidden=true;button.addEventListener('click',()=>cycle(1));}
 try{
   const response=await fetch('./rpg-scenes/manifest.json');
   if(!response.ok)throw Error('No scene assets');
   const json=await response.json();
   if(json.schema!=='seven-rpg-scene-pack.v1'||!Array.isArray(json.scenes))throw Error('Invalid scenery');
   scenes=json.scenes.filter(row=>SAFE.test(String(row?.file||'')));
   if(!scenes.length)throw Error('Empty scenery');
   if(button)button.hidden=false;
   const open=el('rpg-art-open');if(open)open.hidden=false;
   doc.documentElement.dataset.rpgScenePack='ready';choose();
 }catch(_){doc.documentElement.dataset.rpgScenePack='unavailable';const open=el('rpg-art-open');if(open)open.hidden=true;}
 doc.addEventListener('seven:roomchange',()=>win.setTimeout(choose,80));
 doc.addEventListener('seven:rpg-world-created',choose);
 const roomTitle=el('roomTitle');
 if(roomTitle&&win.MutationObserver)new win.MutationObserver(choose).observe(roomTitle,{childList:true,characterData:true,subtree:true});
 win.addEventListener('pageshow',choose);
}
if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',setup,{once:true});else setup();
})(typeof window==='undefined'?null:window,typeof document==='undefined'?null:document);

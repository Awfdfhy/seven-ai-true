(function(r){
'use strict';
if(!r||!r.document)return;
const d=r.document,$=s=>d.querySelector(s);const AR=()=>String(d.documentElement.lang||'').toLowerCase().startsWith('ar');const T=(en,ar)=>AR()?ar:en;
function setText(el,value){if(el&&el.textContent!==value)el.textContent=value}
function brand(){d.querySelectorAll('.seven-beta-badge,[data-seven-beta-badge]').forEach(x=>x.remove());d.querySelectorAll('.app-name').forEach(x=>{const current=String(x.textContent||'').trim();if(/^Seven(?:\s+AI|\.ai)?$/i.test(current)&&current!=='Seven.ai')setText(x,'Seven.ai')});const title=d.querySelector('title');if(title&&/Seven\s*AI/i.test(title.textContent)){const next=title.textContent.replace(/Seven\s*AI/ig,'Seven.ai');if(next!==title.textContent)setText(title,next)}d.querySelectorAll('[aria-label],[title]').forEach(x=>{for(const a of['aria-label','title']){const v=x.getAttribute(a);if(v&&/\bbeta\b/i.test(v)){const next=v.replace(/\s*beta\s*/ig,' ').replace(/\s{2,}/g,' ').trim();if(next!==v)x.setAttribute(a,next)}}})}
function cleanRpgCopy(){d.querySelectorAll('.seven-rpg-copy').forEach(b=>{const message=b.closest('.message'),hidden=!message;if(b.hidden!==hidden)b.hidden=hidden;if(!message){if(b.tabIndex!==-1)b.tabIndex=-1;if(b.getAttribute('aria-hidden')!=='true')b.setAttribute('aria-hidden','true')}else{if(b.hasAttribute('tabindex'))b.removeAttribute('tabindex');if(b.hasAttribute('aria-hidden'))b.removeAttribute('aria-hidden')}})}
function roomItems(list){return[...list.children].filter(x=>x.classList&&x.classList.contains('room-item'))}
function rooms(){const list=$('#roomList');if(!list)return;if(!$('#seven-room-search')){const box=d.createElement('div');box.className='seven-room-search-wrap';box.innerHTML='<span aria-hidden="true">⌕</span><input id="seven-room-search" type="search" autocomplete="off">';list.parentNode.insertBefore(box,list);box.querySelector('input').addEventListener('input',()=>filterRooms(list))}const search=$('#seven-room-search');if(search){const label=T('Search rooms','بحث المحادثات');search.placeholder=label;search.setAttribute('aria-label',label)}if(!list.dataset.sevenRoomObserved){list.dataset.sevenRoomObserved='1';new MutationObserver(()=>filterRooms(list)).observe(list,{childList:true})}filterRooms(list)}
function filterRooms(list){const input=$('#seven-room-search'),term=String(input&&input.value||'').trim().toLocaleLowerCase();roomItems(list).forEach(row=>{const hidden=!!term&&!String(row.textContent||'').toLocaleLowerCase().includes(term);if(row.hidden!==hidden)row.hidden=hidden})}
function markCanonicalModelPicker(){
  const select=$('#modelSelect'),chip=$('.seven-shell-model-chip');
  if(!select)return;
  if(chip)select.dataset.sevenPicker='shell';
  else if(select.dataset.sevenPicker==='shell')delete select.dataset.sevenPicker;
}
function installZeroRoomFacade(){
if(r.__sevenZeroRoomFacade)return;
try{
if(typeof deleteRoomById!=='function'||typeof createNewChat!=='function'||typeof sendMessage!=='function'||typeof updateRoomListUI!=='function'||typeof updateRoomTitle!=='function'||typeof renderChatHistory!=='function')return;
const EMPTY='\u200b';
const oldDelete=deleteRoomById,oldNew=createNewChat,oldSend=sendMessage,oldList=updateRoomListUI,oldTitle=updateRoomTitle,oldRender=renderChatHistory;
const emptyId=()=>typeof currentRoom==='string'&&currentRoom&&typeof rooms==='object'&&rooms&&Object.prototype.hasOwnProperty.call(rooms,currentRoom)&&roomTitles&&roomTitles[currentRoom]===EMPTY?currentRoom:null;
updateRoomListUI=function(){const id=emptyId();if(!id)return oldList();const room=rooms[id],title=roomTitles[id];delete rooms[id];delete roomTitles[id];try{return oldList()}finally{rooms[id]=room;roomTitles[id]=title}};
updateRoomTitle=function(){if(emptyId()){const el=d.getElementById('roomTitle');if(el)setText(el,T('New Chat','محادثة جديدة'));return}return oldTitle()};
renderChatHistory=function(){if(emptyId()){const chat=d.getElementById('chat');if(chat){chat.innerHTML='';if(typeof renderEmptyState==='function')renderEmptyState(chat)}return}return oldRender()};
deleteRoomById=function(id){if(!rooms||!Object.prototype.hasOwnProperty.call(rooms,id))return;if(Object.keys(rooms).length>1)return oldDelete(id);if(typeof activeGenerationRoomId!=='undefined'&&id===activeGenerationRoomId&&typeof isGenerating!=='undefined'&&isGenerating){alert(T('Stop the current generation before deleting this room.','أوقف التوليد الحالي قبل حذف هذه المحادثة.'));return}if(!confirm(T('Delete this room?','حذف هذه المحادثة؟')))return;rooms[id]=typeof createEmptyRoom==='function'?createEmptyRoom():{history:[],knowledgeBase:'',summary:'',pinned:''};roomTitles[id]=EMPTY;currentRoom=id;if(typeof saveRooms==='function')saveRooms();updateRoomTitle();renderChatHistory();updateRoomListUI()};
createNewChat=function(){const id=emptyId();if(!id)return oldNew();roomTitles[id]='New Chat';if(typeof saveRooms==='function')saveRooms();updateRoomTitle();renderChatHistory();updateRoomListUI();return id};
sendMessage=async function(){const id=emptyId();if(id){roomTitles[id]='New Chat';if(typeof saveRooms==='function')saveRooms();updateRoomTitle();updateRoomListUI()}return oldSend.apply(this,arguments)};
r.__sevenZeroRoomFacade=true;
}catch(_){ }
}
let scheduled=false;function syncDynamic(){if(scheduled)return;scheduled=true;queueMicrotask(()=>{scheduled=false;brand();cleanRpgCopy();rooms();markCanonicalModelPicker();installZeroRoomFacade()})}
function boot(){brand();cleanRpgCopy();rooms();markCanonicalModelPicker();installZeroRoomFacade();if(!d.body.dataset.sevenPolishObserved){d.body.dataset.sevenPolishObserved='1';new MutationObserver(syncDynamic).observe(d.body,{childList:true,subtree:true})}}
d.readyState==='loading'?d.addEventListener('DOMContentLoaded',boot,{once:true}):boot();d.addEventListener('seven:workspacechange',syncDynamic);
r.SevenUiPolish={version:'1.0.4',sync:boot};
})(typeof globalThis!='undefined'?globalThis:this);

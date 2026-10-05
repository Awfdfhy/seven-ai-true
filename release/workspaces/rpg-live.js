(function(r){'use strict';if(!r)return;
let orchestrator=null,guardBridge=null;
const PREFIX='seven_rpg_session_v3',POINTER='seven_rpg_session_v3:active';
function text(v){return typeof v==='string'?v.trim():''}
function roomId(){try{if(typeof currentRoom==='string'&&currentRoom)return currentRoom}catch(_){}try{const s=typeof r.getConversationState==='function'?r.getConversationState():null;if(s&&s.roomId)return String(s.roomId)}catch(_){}return null}
function memoryWriter(m){
 try{
  if(typeof addScopedMemory!=='function')return null;
  const rec=addScopedMemory(m.content,'rpg',m.scopeRef,{access:'private'});if(!rec)return null;
  if(typeof setMemoryEpistemicStatus==='function')setMemoryEpistemicStatus(rec.id,m.epistemicStatus||'EPISODE');
  if(typeof setMemoryProvenance==='function')setMemoryProvenance(rec.id,{source:m.provenanceSource||'SYSTEM',sourceRef:m.eventId||null});
  if(typeof setMemoryTemporal==='function')setMemoryTemporal(rec.id,{observedAt:Date.now()});
  return rec;
 }catch(_){return null}
}
function guard(){
 if(guardBridge)return guardBridge;
 if(!r.SevenRpgLiveIntegration||!r.SevenRpgState||!r.SevenRpgSession||!r.SevenRuntime)throw Error('RPG persistence dependencies unavailable');
 guardBridge=r.SevenRpgLiveIntegration.createBridge({stateApi:r.SevenRpgState,sessionApi:r.SevenRpgSession,runtime:r.SevenRuntime,storage:r.localStorage,prefix:PREFIX});
 return guardBridge;
}
function runtime(){
 if(orchestrator)return orchestrator;
 if(!r.SevenRpgState||!r.SevenRpgSession||!r.SevenRpgContext||!r.SevenRpgOrchestrator)throw Error('RPG runtime dependencies unavailable');
 orchestrator=r.SevenRpgOrchestrator.createRuntime({
   stateApi:r.SevenRpgState,sessionApi:r.SevenRpgSession,contextApi:r.SevenRpgContext,plannerApi:r.SevenRpgPlanner||null,
   storage:r.localStorage,memoryWriter,prefix:PREFIX,pointerPrefix:POINTER
 });
 return orchestrator;
}
function ensureRoom(targetRoom){
 const id=text(targetRoom)||roomId();if(!id)return{ok:false,status:'BLOCKED',reason:'no-active-room'};
 const g=guard(),recovery=g.recoveryStatus?g.recoveryStatus(id):null;if(recovery&&recovery.blocked)return{ok:false,status:'BLOCKED',reason:recovery.reason||'recovery-required'};
 let latest=g.loadLatest(id);
 if(!latest.ok&&latest.status==='MISSING'){
   const worldId='freeform:'+id;
   const init=g.sync({roomId:id,worldId,legacy:{},reason:'freeform-init'});
   if(!init.ok)return init;
   latest=g.loadLatest(id);
 }
 if(!latest.ok)return latest;
 const ready=runtime().ensure(id,latest.session.worldId);
 if(!ready.ok)return ready;
 return{ok:true,status:'READY',roomId:id,worldId:latest.session.worldId,session:ready.session};
}
function contextSource(req){
 const o=req&&typeof req==='object'?req:{},ready=ensureRoom(o.roomId);if(!ready.ok)return null;
 const maxChars=Math.max(4000,Math.min(9500,Number(o.maxChars)||9000));
 const view=runtime().generationContext(ready.roomId,{maxChars:Math.max(3000,maxChars-800),canonLimit:Math.max(4,Math.min(24,Number(o.canonLimit)||14)),characterLimit:Math.max(1,Math.min(16,Number(o.characterLimit)||12))});
 if(!view||!view.ok)return null;
 let content=JSON.stringify({scene:view.view});
 if(content.length>maxChars){
   const tighter=runtime().generationContext(ready.roomId,{maxChars:Math.max(2800,maxChars-300),canonLimit:8,characterLimit:8});
   if(!tighter||!tighter.ok)return null;
   content=JSON.stringify({scene:tighter.view});
 }
 if(content.length>maxChars)return null;
 return{content,priority:92,provenance:'rpg_runtime',metadata:{worldId:ready.worldId,turn:view.view.turn,bounded:true,serializedChars:content.length}};
}
async function processGeneratedTurn(input){
 const x=input&&typeof input==='object'?input:{},ready=ensureRoom(x.roomId);if(!ready.ok)return ready;
 const out=await runtime().processTurn(Object.assign({},x,{roomId:ready.roomId,applyWorldTick:x.applyWorldTick===true}));
 if(!out||!out.ok)return out;
 let projection=null;try{projection=guard().publishCurrent(ready.roomId,ready.worldId,'structured-turn')}catch(_){}
 return Object.assign({},out,{projectionStatus:projection&&projection.ok?'published':(projection&&projection.reason)||'unavailable'});
}
function snapshot(targetRoom){
 const ready=ensureRoom(targetRoom);if(!ready.ok)return null;const s=runtime().activeSession(ready.roomId)||runtime().ensure(ready.roomId,ready.worldId).session;return s?JSON.parse(JSON.stringify(s)):null
}
function plan(targetRoom){
 const ready=ensureRoom(targetRoom);if(!ready.ok)return ready;return runtime().plan(ready.roomId,{limit:12})
}
function memoryScopeRef(targetRoom){
 const ready=ensureRoom(targetRoom);return ready.ok?'rpg:'+ready.worldId:null
}
function newWorld(label,targetRoom){
 const id=text(targetRoom)||roomId();if(!id)return{ok:false,status:'BLOCKED',reason:'no-active-room'};
 const g=guard(),recovery=g.recoveryStatus?g.recoveryStatus(id):null;if(recovery&&recovery.blocked)return{ok:false,status:'BLOCKED',reason:recovery.reason||'recovery-required'};
 const worldId='world:'+Date.now().toString(36),init=g.sync({roomId:id,worldId,legacy:{},reason:'new-world'});if(!init.ok)return init;
 const title=String(label||'New World').slice(0,120);
 const out=runtime().commitEvents(id,[{id:'new-world-title-'+Date.now().toString(36),type:'world.set',source:'user',countsAsTurn:false,payload:{path:['flags','title'],value:title},summary:'New world title.'}]);
 if(out&&out.ok){try{g.publishCurrent(id,worldId,'new-world-title')}catch(_){}}
 return out&&out.ok?{ok:true,status:'CREATED',worldId,session:out.session}:out;
}
function mount(){return ensureRoom()}
function unmount(){return true}
r.SevenRpgLive=Object.freeze({version:'2.0.0',mount,unmount,ensure:ensureRoom,contextSource,processGeneratedTurn,snapshot,plan,memoryScopeRef,newWorld});
})(typeof globalThis!=='undefined'?globalThis:this);
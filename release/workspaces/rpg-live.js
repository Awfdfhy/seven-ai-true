(function(r){'use strict';if(!r)return;
let runtime=null,registered=false;
function roomId(){try{if(typeof currentRoom==='string'&&currentRoom)return currentRoom}catch(_){}return null}
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
function ensureRuntime(){
 if(runtime)return runtime;
 if(!r.SevenRpgState||!r.SevenRpgSession||!r.SevenRpgContext||!r.SevenRpgOrchestrator)throw Error('RPG runtime dependencies unavailable');
 runtime=r.SevenRpgOrchestrator.createRuntime({stateApi:r.SevenRpgState,sessionApi:r.SevenRpgSession,contextApi:r.SevenRpgContext,plannerApi:r.SevenRpgPlanner||null,storage:r.localStorage,memoryWriter});
 return runtime;
}
function ensure(){const id=roomId();return id?ensureRuntime().ensure(id):{ok:false,status:'BLOCKED',reason:'no-active-room'}}
function contextSource(req){
 const id=req&&req.roomId?String(req.roomId):roomId();if(!id)return null;
 const rt=ensureRuntime(),view=rt.generationContext(id,{maxChars:18000,canonLimit:18,characterLimit:16});if(!view||!view.ok)return null;
 const planned=rt.plan(id,{limit:10});
 const payload={scene:view.view,plan:planned&&planned.ok?planned.plan:null};
 return {content:JSON.stringify(payload),priority:92,provenance:'rpg_runtime',metadata:{worldId:view.view.worldId,turn:view.view.turn,bounded:view.view._diagnostics&&view.view._diagnostics.bounded===true}};
}
function mount(){
 const ready=ensure();
 if(!registered&&r.SevenContextBridge&&typeof r.SevenContextBridge.registerSource==='function'){
  r.SevenContextBridge.registerSource('seven-rpg-live','rpg',contextSource,{priority:92});registered=true;
 }
 return ready;
}
function unmount(){
 if(registered&&r.SevenContextBridge&&typeof r.SevenContextBridge.unregisterSource==='function')r.SevenContextBridge.unregisterSource('seven-rpg-live');
 registered=false;
}
async function processGeneratedTurn(input){
 const id=input&&input.roomId?String(input.roomId):roomId();if(!id)return{ok:false,status:'BLOCKED',reason:'no-active-room'};
 return ensureRuntime().processTurn(Object.assign({},input,{roomId:id,applyWorldTick:true}));
}
function snapshot(){const id=roomId();return id?ensureRuntime().snapshot(id):null}
function plan(){const id=roomId();return id?ensureRuntime().plan(id,{limit:12}):null}
function newWorld(label){
 const id=roomId();if(!id)return{ok:false,status:'BLOCKED',reason:'no-active-room'};
 const worldId='world:'+Date.now().toString(36);const seed={worldId,world:{flags:{title:String(label||'New World').slice(0,120)}}};
 return ensureRuntime().selectWorld(id,worldId,seed);
}
r.SevenRpgLive=Object.freeze({version:'1.0.0',mount,unmount,ensure,contextSource,processGeneratedTurn,snapshot,plan,newWorld});
})(typeof globalThis!=='undefined'?globalThis:this);
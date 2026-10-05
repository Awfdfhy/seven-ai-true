(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SevenRpgLiveIntegration=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function text(v){return typeof v==='string'?v.trim():''}
function createBridge(options){
  const o=options&&typeof options==='object'?options:{},stateApi=o.stateApi,sessionApi=o.sessionApi,runtime=o.runtime;
  if(!stateApi||typeof stateApi.createState!=='function'||typeof stateApi.applyEvent!=='function'||typeof stateApi.buildContextPacket!=='function')throw Error('SevenRpgState-compatible stateApi required');
  if(!sessionApi||typeof sessionApi.createManager!=='function')throw Error('SevenRpgSession-compatible sessionApi required');
  if(!runtime||typeof runtime.createMemory!=='function'||typeof runtime.commitMemory!=='function'||typeof runtime.readMemory!=='function'||typeof runtime.hash!=='function')throw Error('SevenRuntime memory API required');
  const storage=o.storage||root.localStorage,manager=sessionApi.createManager({stateApi,storage,prefix:o.prefix||'seven_rpg_session_v3'}),INDEX_PREFIX=(o.prefix||'seven_rpg_session_v3')+':active:';
  function ids(input){const roomId=text(input&&input.roomId),worldId=text(input&&input.worldId);if(!roomId||!worldId)throw Error('roomId/worldId required');return{roomId,worldId}}
  function indexKey(roomId){return INDEX_PREFIX+encodeURIComponent(roomId)}
  function pendingKey(roomId){return INDEX_PREFIX.replace(':active:',':pending:')+encodeURIComponent(roomId)}
  function pending(roomId){try{return storage.getItem(pendingKey(roomId))!==null}catch(_){return true}}
  function blocked(){return{ok:false,status:'BLOCKED',reason:'recovery-required'}}
  function readIndex(roomId){try{return text(storage.getItem(indexKey(roomId)))}catch(_){return''}}
  function writeIndex(roomId,worldId){try{storage.setItem(indexKey(roomId),worldId);return true}catch(_){return false}}
  function restoreIndex(roomId,worldId){try{worldId?storage.setItem(indexKey(roomId),worldId):storage.removeItem(indexKey(roomId));return true}catch(_){return false}}
  function getSession(roomId,worldId){
    const loaded=manager.load(roomId,worldId);if(loaded.ok)return loaded;
    if(loaded.status!=='MISSING')return loaded;
    return manager.start({roomId,worldId,state:{sessionId:'rpg:'+roomId+':'+worldId,worldId},legacy:null});
  }
  function projectionContent(session,legacy,reason){
    const packet=stateApi.buildContextPacket(session.state,{maxChars:6000,recentEventLimit:6,canonLimit:12,threadLimit:8});
    const world=legacy&&legacy.work?{id:legacy.work.id||null,title:legacy.work.title||null}:null;
    const worldSession=legacy&&legacy.worldSession?{position:legacy.worldSession.position??null,branchId:legacy.worldSession.branchId||null,titleCount:Array.isArray(legacy.worldSession.titles)?legacy.worldSession.titles.length:0}:null;
    const canon=legacy&&legacy.canonSession?{position:legacy.canonSession.position??null,branchId:legacy.canonSession.branchId||null,ledgerCount:Array.isArray(legacy.canonSession.ledger)?legacy.canonSession.ledger.length:0}:null;
    return JSON.stringify({schema:'seven-rpg-memory-projection',version:1,roomId:session.roomId,worldId:session.worldId,revision:session.state.revision,reason:text(reason)||'sync',world,worldSession,canon,context:packet});
  }
  function publish(session,legacy,reason){
    const id='rpg-'+runtime.hash(session.roomId+'\n'+session.worldId),content=projectionContent(session,legacy,reason),bundle=runtime.readMemory(),existing=bundle.objects.find(x=>x.id===id);
    if(existing){
      const next=Object.assign({},existing,{content,type:'RpgStateSnapshot',version:Number(existing.version||1)+1,scope:'rpg',source:'rpg'});
      if(runtime.lineage)next.provenance=runtime.lineage('rpg','projection_update',[existing.id]);
      return runtime.commitMemory(next,'UPDATE');
    }
    const created=runtime.createMemory(content,'RpgStateSnapshot',{id,scope:'rpg',source:'rpg',authority:'derived'});
    return runtime.commitMemory(created,'CREATE');
  }
  function rollback(roomId,worldId,previous){
    if(previous&&previous.ok)return manager.persist(previous.session,{force:true});
    return manager.remove(roomId,worldId);
  }
  function sync(input){
    let id;try{id=ids(input)}catch(e){return{ok:false,status:'BLOCKED',reason:'invalid-identity',error:String(e&&e.message||e)}}
    if(pending(id.roomId))return blocked();
    const legacy=clone(input&&input.legacy||{}),previous=manager.load(id.roomId,id.worldId),previousIndex=readIndex(id.roomId);
    try{storage.setItem(pendingKey(id.roomId),JSON.stringify({version:1,...id,previous:previous.ok?previous.session:null,previousIndex}))}catch(_){return{ok:false,status:'BLOCKED',reason:'journal-write-failed'}}
    function abort(reason){const r=rollback(id.roomId,id.worldId,previous);if(r.ok&&(readIndex(id.roomId)===previousIndex||restoreIndex(id.roomId,previousIndex)))try{storage.removeItem(pendingKey(id.roomId))}catch(_){}return pending(id.roomId)?blocked():{ok:false,status:'BLOCKED',reason}}
    const base=getSession(id.roomId,id.worldId);
    if(!base.ok)return abort(base.reason);
    const event={id:'legacy-sync-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8),type:'world.set',source:'runtime',authority:'runtime',countsAsTurn:false,summary:text(input&&input.reason)||'live-rpg-sync',payload:{path:['integration','legacySnapshot'],value:legacy}};
    const applied=stateApi.applyEvent(base.session.state,event);
    if(!applied||applied.ok!==true)return abort('state-rejected');
    const saved=manager.persist({roomId:id.roomId,worldId:id.worldId,state:applied.state,legacy,persistedRevision:base.session.persistedRevision});
    if(!saved.ok)return abort(saved.reason);
    if(!writeIndex(id.roomId,id.worldId))return abort('active-index-write-failed');
    let memoryOk=false;try{memoryOk=publish(saved.session,legacy,input&&input.reason)}catch(_){memoryOk=false}
    if(!memoryOk)return abort('memory-projection-failed');
    try{storage.removeItem(pendingKey(id.roomId))}catch(_){return blocked()}
    return{ok:true,status:'SYNCED',session:saved.session,record:applied.record,memoryId:'rpg-'+runtime.hash(id.roomId+'\n'+id.worldId)};
  }
  function load(roomId,worldId){return pending(text(roomId))?blocked():manager.load(text(roomId),text(worldId))}
  function loadLatest(roomIdInput){const roomId=text(roomIdInput);if(pending(roomId))return blocked();const worldId=readIndex(roomId);if(!roomId||!worldId)return{ok:false,status:'MISSING',reason:'no-active-world'};return manager.load(roomId,worldId)}
  function context(roomIdInput,worldIdInput,options){const out=load(roomIdInput,worldIdInput);return out.ok?stateApi.buildContextPacket(out.session.state,options||{}):null}
  function inspect(roomId,worldId){return manager.inspect(text(roomId),text(worldId))}
  return{version:1,sync,load,loadLatest,context,inspect,manager};
}
return{createBridge};
});

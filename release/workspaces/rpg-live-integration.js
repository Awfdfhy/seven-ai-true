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
  function blocked(extra){return Object.assign({ok:false,status:'BLOCKED',reason:'recovery-required'},extra||{})}
  function readIndex(roomId){try{return text(storage.getItem(indexKey(roomId)))}catch(_){return''}}
  function readJournal(roomId){
    let raw;try{raw=storage.getItem(pendingKey(roomId))}catch(_){return{ok:false,status:'BLOCKED',reason:'journal-read-failed'}}
    if(raw==null)return{ok:true,status:'CLEAN',journal:null};
    try{
      const journal=JSON.parse(raw);
      if(!journal||journal.version!==1||text(journal.roomId)!==text(roomId)||!text(journal.worldId))return{ok:false,status:'BLOCKED',reason:'journal-corrupt',journalStatus:'corrupt'};
      const status=text(journal.status)||'pending';
      if(!['pending','committed','rolled_back','corrupt','abandoned'].includes(status))return{ok:false,status:'BLOCKED',reason:'journal-corrupt',journalStatus:'corrupt'};
      journal.status=status;return{ok:true,status:'FOUND',journal};
    }catch(_){return{ok:false,status:'BLOCKED',reason:'journal-corrupt',journalStatus:'corrupt'}}
  }
  function sameSnapshot(a,b){return JSON.stringify(a&&a.state||null)===JSON.stringify(b&&b.state||null)&&JSON.stringify(a&&a.legacy||null)===JSON.stringify(b&&b.legacy||null)}
  function markJournal(roomId,journal,status,reason){
    const next=Object.assign({},journal,{status,reason:text(reason)||null});
    try{storage.setItem(pendingKey(roomId),JSON.stringify(next));return true}catch(_){return false}
  }
  function publishedRevision(roomId,worldId){
    try{
      const id='rpg-'+runtime.hash(roomId+'\n'+worldId),bundle=runtime.readMemory(),record=bundle&&Array.isArray(bundle.objects)?bundle.objects.find(x=>x&&x.id===id):null;
      if(!record||typeof record.content!=='string')return null;
      const value=JSON.parse(record.content);
      if(value&&value.schema==='seven-rpg-memory-projection'&&value.roomId===roomId&&value.worldId===worldId&&Number.isFinite(Number(value.revision)))return Number(value.revision);
    }catch(_){}
    return null;
  }
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
    try{storage.setItem(pendingKey(id.roomId),JSON.stringify({version:1,status:'pending',...id,previous:previous.ok?previous.session:null,previousIndex,baseRevision:previous.ok?Number(previous.session.state.revision):null,candidateRevision:previous.ok?Number(previous.session.state.revision)+1:1}))}catch(_){return{ok:false,status:'BLOCKED',reason:'journal-write-failed'}}
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
    if(!markJournal(id.roomId,{version:1,status:'pending',...id,previous:previous.ok?previous.session:null,previousIndex,baseRevision:previous.ok?Number(previous.session.state.revision):null,candidateRevision:Number(saved.session.state.revision)},'committed','memory-projection-committed'))return blocked({journalStatus:'pending',recoveryDetail:'commit-marker-write-failed'});
    try{storage.removeItem(pendingKey(id.roomId))}catch(_){return blocked({journalStatus:'committed'})}
    return{ok:true,status:'SYNCED',session:saved.session,record:applied.record,memoryId:'rpg-'+runtime.hash(id.roomId+'\n'+id.worldId)};
  }
  function recover(roomIdInput){
    const roomId=text(roomIdInput);if(!roomId)return{ok:false,status:'BLOCKED',reason:'invalid-identity'};
    const jr=readJournal(roomId);if(!jr.ok)return jr;if(!jr.journal)return{ok:true,status:'CLEAN',journalStatus:null};
    const j=jr.journal,worldId=text(j.worldId);
    if(j.status==='committed'||j.status==='rolled_back'){try{storage.removeItem(pendingKey(roomId));return{ok:true,status:'RECOVERED',journalStatus:j.status,action:'finalized-journal-cleared'}}catch(_){return blocked({journalStatus:j.status})}}
    if(j.status==='corrupt'||j.status==='abandoned')return blocked({journalStatus:j.status});
    const current=manager.load(roomId,worldId),previous=j.previous||null,previousRevision=previous&&previous.state?Number(previous.state.revision):null;
    if(!current.ok&&current.status!=='MISSING')return blocked({journalStatus:'pending',recoveryDetail:current.reason||current.status});
    if(current.ok&&Number.isFinite(Number(j.candidateRevision))&&Number(current.session.state.revision)===Number(j.candidateRevision)&&publishedRevision(roomId,worldId)===Number(j.candidateRevision)){
      if(!markJournal(roomId,j,'committed','memory-projection-evidence'))return blocked({journalStatus:'pending',recoveryDetail:'commit-marker-write-failed'});
      try{storage.removeItem(pendingKey(roomId))}catch(_){return blocked({journalStatus:'committed'})}
      return{ok:true,status:'RECOVERED',journalStatus:'committed',action:'commit-finalized',roomId,worldId};
    }
    if(previous){
      if(current.ok){
        const currentRevision=Number(current.session.state.revision);
        if(currentRevision>previousRevision+1){markJournal(roomId,j,'abandoned','newer-valid-state');return blocked({journalStatus:'abandoned',recoveryDetail:'newer-valid-state'})}
        if(currentRevision<previousRevision){markJournal(roomId,j,'abandoned','revision-regressed');return blocked({journalStatus:'abandoned',recoveryDetail:'revision-regressed'})}
        if(currentRevision===previousRevision&&!sameSnapshot(current.session,previous)){markJournal(roomId,j,'abandoned','same-revision-diverged');return blocked({journalStatus:'abandoned',recoveryDetail:'same-revision-diverged'})}
      }
      const restored=manager.persist(previous,{force:true});if(!restored.ok)return blocked({journalStatus:'pending',recoveryDetail:restored.reason||restored.status});
    }else if(current.ok){
      const rev=Number(current.session.state.revision),ledger=Array.isArray(current.session.state.ledger)?current.session.state.ledger:[];
      const onlyCandidate=rev===1&&ledger.length===1&&text(ledger[0].type)==='world.set'&&current.session.state.integration&&current.session.state.integration.legacySnapshot!==undefined;
      if(!onlyCandidate){markJournal(roomId,j,'abandoned','newer-valid-state');return blocked({journalStatus:'abandoned',recoveryDetail:'newer-valid-state'})}
      const removed=manager.remove(roomId,worldId);if(!removed.ok)return blocked({journalStatus:'pending',recoveryDetail:removed.reason||removed.status});
    }
    if(!restoreIndex(roomId,text(j.previousIndex)))return blocked({journalStatus:'pending',recoveryDetail:'index-restore-failed'});
    if(!markJournal(roomId,j,'rolled_back','automatic-recovery'))return blocked({journalStatus:'pending',recoveryDetail:'journal-finalize-failed'});
    try{storage.removeItem(pendingKey(roomId))}catch(_){return blocked({journalStatus:'rolled_back'})}
    return{ok:true,status:'RECOVERED',journalStatus:'rolled_back',action:'rollback',roomId,worldId};
  }
  function transact(input){
    let id;try{id=ids(input)}catch(e){return{ok:false,status:'BLOCKED',reason:'invalid-identity',error:String(e&&e.message||e)}}
    if(pending(id.roomId))return blocked();
    const events=Array.isArray(input&&input.events)?clone(input.events):[];
    if(!events.length)return{ok:false,status:'BLOCKED',reason:'empty-transaction'};
    const previous=manager.load(id.roomId,id.worldId),previousIndex=readIndex(id.roomId),base=getSession(id.roomId,id.worldId);
    if(!base.ok)return base;
    const legacy=input&&Object.prototype.hasOwnProperty.call(input,'legacy')?clone(input.legacy):clone(base.session.legacy||null);
    const journal={version:1,status:'pending',...id,previous:previous.ok?previous.session:null,previousIndex,baseRevision:previous.ok?Number(previous.session.state.revision):null,candidateRevision:Number(base.session.state.revision)+events.length};
    try{storage.setItem(pendingKey(id.roomId),JSON.stringify(journal))}catch(_){if(!previous.ok)manager.remove(id.roomId,id.worldId);return{ok:false,status:'BLOCKED',reason:'journal-write-failed'}}
    function abort(reason,details){
      const r=rollback(id.roomId,id.worldId,previous);
      if(r.ok&&(readIndex(id.roomId)===previousIndex||restoreIndex(id.roomId,previousIndex)))try{storage.removeItem(pendingKey(id.roomId))}catch(_){}
      return pending(id.roomId)?blocked():Object.assign({ok:false,status:'BLOCKED',reason},details||{});
    }
    const committed=manager.commitEvents({roomId:id.roomId,worldId:id.worldId,state:base.session.state,legacy,persistedRevision:base.session.persistedRevision},events);
    if(!committed.ok)return abort(committed.reason||'event-rejected',{eventReason:committed.eventReason||null,eventId:committed.eventId||null,index:committed.index??null});
    if(!writeIndex(id.roomId,id.worldId))return abort('active-index-write-failed');
    let memoryOk=false;try{memoryOk=publish(committed.session,legacy,input&&input.reason||'turn-transaction')}catch(_){memoryOk=false}
    if(!memoryOk)return abort('memory-projection-failed');
    const committedJournal=Object.assign({},journal,{candidateRevision:Number(committed.session.state.revision)});
    if(!markJournal(id.roomId,committedJournal,'committed','memory-projection-committed'))return blocked({journalStatus:'pending',recoveryDetail:'commit-marker-write-failed'});
    try{storage.removeItem(pendingKey(id.roomId))}catch(_){return blocked({journalStatus:'committed'})}
    return{ok:true,status:'COMMITTED',session:committed.session,records:committed.records,memoryId:'rpg-'+runtime.hash(id.roomId+'\n'+id.worldId)};
  }
  function load(roomId,worldId){return pending(text(roomId))?blocked():manager.load(text(roomId),text(worldId))}
  function loadLatest(roomIdInput){const roomId=text(roomIdInput);if(pending(roomId))return blocked();const worldId=readIndex(roomId);if(!roomId||!worldId)return{ok:false,status:'MISSING',reason:'no-active-world'};return manager.load(roomId,worldId)}
  function context(roomIdInput,worldIdInput,options){const out=load(roomIdInput,worldIdInput);return out.ok?stateApi.buildContextPacket(out.session.state,options||{}):null}
  function inspect(roomId,worldId){return manager.inspect(text(roomId),text(worldId))}
  function inspectRecovery(roomIdInput){const roomId=text(roomIdInput),jr=readJournal(roomId);if(!jr.ok)return jr;return jr.journal?{ok:true,status:'FOUND',journalStatus:jr.journal.status,roomId,worldId:jr.journal.worldId,baseRevision:jr.journal.baseRevision??null,candidateRevision:jr.journal.candidateRevision??null}:{ok:true,status:'CLEAN',journalStatus:null}}
  return{version:1,sync,transact,recover,load,loadLatest,context,inspect,inspectRecovery,manager};
}
return{createBridge};
});

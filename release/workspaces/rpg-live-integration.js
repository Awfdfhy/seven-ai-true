(function(root,factory){
  const api=factory(root);
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SevenRpgLiveIntegration=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(root){
'use strict';
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v))}
function text(v){return typeof v==='string'?v.trim():''}

/* ---------------------------------------------------------------------------
 * Durable storage layer.
 *
 * Android 16 WebView localStorage is committed asynchronously and is NOT
 * fsync'd, so `adb shell am force-stop` (SIGKILL) can discard the unflushed
 * tail of a write batch. That used to lose the authoritative RPG session and
 * the `:active:` index (CI run 38374095509, verifyRpgState -> no-active-world).
 * The main app already solved this by persisting authoritative state in
 * IndexedDB (fsync'd on transaction oncomplete) and treating localStorage only
 * as a fast hint. We mirror that here: every authoritative write is written
 * through to IndexedDB, and on startup we hydrate any localStorage key that
 * was lost back from IndexedDB. localStorage remains the synchronous fast path
 * so all existing behaviour is unchanged and backward compatible.
 * ------------------------------------------------------------------------- */
var DURABLE_NAME='seven_rpg_durable_v1';
var durableStore=null;
var durablePending=new Set();
function trackDurable(p){var x=Promise.resolve(p).catch(function(){});durablePending.add(x);x.then(function(){durablePending.delete(x)},function(){durablePending.delete(x)});return x}
function drainDurable(){if(!durablePending.size)return Promise.resolve(true);var batch=Array.from(durablePending);return Promise.all(batch).then(function(){return durablePending.size?drainDurable():true})}
function inertStore(){return{put:function(){return Promise.resolve(true)},del:function(){return Promise.resolve(true)},get:function(){return Promise.resolve(null)},all:function(){return Promise.resolve({})}}}
function createIdbStore(name){
  var dbp=null;
  function open(){
    if(dbp)return dbp;
    dbp=new Promise(function(res,rej){
      var req;try{req=root.indexedDB.open(name,1)}catch(e){rej(e);return}
      req.onupgradeneeded=function(){var db=req.result;if(!db.objectStoreNames.contains('kv'))db.createObjectStore('kv')};
      req.onsuccess=function(){res(req.result)};
      req.onerror=function(){rej(req.error||Error('idb-open-failed'))};
    });
    return dbp;
  }
  function run(mode,fn){
    return open().then(function(db){return new Promise(function(res,rej){
      var result,t;try{t=db.transaction('kv',mode)}catch(e){rej(e);return}
      var st=t.objectStore('kv'),settled=false;
      function done(v){if(!settled){settled=true;res(v)}}
      t.oncomplete=function(){done(result)};
      t.onerror=function(){if(!settled){settled=true;rej(t.error||Error('idb-tx-failed'))}};
      t.onabort=t.onerror;
      try{fn(st,done)}catch(e){rej(e)}
    })});
  }
  return{
    put:function(k,v){return run('readwrite',function(st){st.put(String(v),String(k))})},
    del:function(k){return run('readwrite',function(st){st.delete(String(k))})},
    get:function(k){return run('readonly',function(st,done){var r=st.get(String(k));r.onsuccess=function(){done(r.result==null?null:String(r.result))};r.onerror=function(){done(null)}})},
    all:function(){return run('readonly',function(st,done){var o={},r=st.openCursor();r.onsuccess=function(){var c=r.result;if(c){o[String(c.key)]=String(c.value);c.continue()}else done(o)};r.onerror=function(){done(o)}})}
  };
}
function moduleDurable(){
  if(durableStore)return durableStore;
  durableStore=(root&&root.indexedDB)?createIdbStore(DURABLE_NAME):inertStore();
  return durableStore;
}
function hydrateInto(base,d){
  return Promise.resolve().then(function(){return d&&d.all?d.all():{}}).then(function(entries){
    if(!entries||!base)return true;
    for(var k in entries){try{if(base.getItem(k)===null)base.setItem(k,entries[k])}catch(_){}}
    return true;
  })['catch'](function(){return true});
}
function markReady(){try{if(root)root.SevenRpgDurableReady=true}catch(_){}}
// Kick off durable hydration at module load (browser) so the active-world index
// and session are restored into localStorage before any consumer reads them.
if(root&&root.document){
  var ls=null;try{ls=root.localStorage}catch(_){}
  hydrateInto(ls,moduleDurable()).then(markReady,markReady);
}else{markReady()}

function createBridge(options){
  const o=options&&typeof options==='object'?options:{},stateApi=o.stateApi,sessionApi=o.sessionApi,runtime=o.runtime;
  if(!stateApi||typeof stateApi.createState!=='function'||typeof stateApi.applyEvent!=='function'||typeof stateApi.buildContextPacket!=='function')throw Error('SevenRpgState-compatible stateApi required');
  if(!sessionApi||typeof sessionApi.createManager!=='function')throw Error('SevenRpgSession-compatible sessionApi required');
  if(!runtime||typeof runtime.createMemory!=='function'||typeof runtime.commitMemory!=='function'||typeof runtime.readMemory!=='function'||typeof runtime.hash!=='function')throw Error('SevenRuntime memory API required');
  const PREFIX=o.prefix||'seven_rpg_session_v3';
  // `storage` stays the synchronous fast path (localStorage in the browser). The
  // pending journal is transient and intentionally NOT made durable (a durable
  // journal would produce false `recovery-required` after a force-stop).
  const storage=o.storage||root.localStorage;
  // Authoritative session writes are mirrored to the durable store; reads still
  // come synchronously from localStorage (restored by hydration after a kill).
  const d=o.durable||moduleDurable();
  function durableSet(k,v){try{trackDurable(d.put(k,v))}catch(_){}}
  function durableDel(k){try{trackDurable(d.del(k))}catch(_){}}
  const dstore={getItem:k=>storage.getItem(k),setItem:(k,v)=>{storage.setItem(k,v);durableSet(k,v)},removeItem:k=>{storage.removeItem(k);durableDel(k)}};
  const manager=sessionApi.createManager({stateApi,storage:dstore,prefix:PREFIX}),INDEX_PREFIX=PREFIX+':active:';
  const readyPromise=hydrateInto(storage,d);
  function ids(input){const roomId=text(input&&input.roomId),worldId=text(input&&input.worldId);if(!roomId||!worldId)throw Error('roomId/worldId required');return{roomId,worldId}}
  function indexKey(roomId){return INDEX_PREFIX+encodeURIComponent(roomId)}
  function pendingKey(roomId){return INDEX_PREFIX.replace(':active:',':pending:')+encodeURIComponent(roomId)}
  function pending(roomId){try{return storage.getItem(pendingKey(roomId))!==null}catch(_){return true}}
  function blocked(){return{ok:false,status:'BLOCKED',reason:'recovery-required'}}
  function readIndex(roomId){try{return text(storage.getItem(indexKey(roomId)))}catch(_){return''}}
  function writeIndex(roomId,worldId){try{storage.setItem(indexKey(roomId),worldId);durableSet(indexKey(roomId),worldId);return true}catch(_){return false}}
  function restoreIndex(roomId,worldId){try{worldId?storage.setItem(indexKey(roomId),worldId):storage.removeItem(indexKey(roomId));worldId?durableSet(indexKey(roomId),worldId):durableDel(indexKey(roomId));return true}catch(_){return false}}
  // Synchronous self-heal: if the volatile `:active:` index is missing, derive it
  // from the most recent surviving session envelope for the room and re-write it.
  function rebuildIndex(roomId){
    try{
      if(typeof storage.key!=='function'||typeof storage.length!=='number')return'';
      const head=PREFIX+':'+encodeURIComponent(roomId)+':',found=[];
      for(let i=0;i<storage.length;i++){
        const k=storage.key(i);
        if(typeof k!=='string'||k.indexOf(head)!==0)continue;
        if(k.indexOf(':quarantine')>=0)continue;
        const worldId=decodeURIComponent(k.slice(head.length));
        if(!worldId)continue;
        const loaded=manager.load(roomId,worldId);
        if(loaded.ok&&loaded.envelope)found.push({worldId,updatedAt:text(loaded.envelope.updatedAt),revision:Number(loaded.session&&loaded.session.state&&loaded.session.state.revision||0)});
      }
      if(!found.length)return'';
      found.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt))||(b.revision-a.revision));
      return found[0].worldId;
    }catch(_){return''}
  }
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
  function loadLatest(roomIdInput){
    const roomId=text(roomIdInput);
    if(pending(roomId))return blocked();
    let worldId=readIndex(roomId);
    if(roomId&&!worldId){worldId=rebuildIndex(roomId);if(worldId)writeIndex(roomId,worldId)}
    if(!roomId||!worldId)return{ok:false,status:'MISSING',reason:'no-active-world'};
    return manager.load(roomId,worldId);
  }
  function context(roomIdInput,worldIdInput,options){const out=load(roomIdInput,worldIdInput);return out.ok?stateApi.buildContextPacket(out.session.state,options||{}):null}
  function inspect(roomId,worldId){return manager.inspect(text(roomId),text(worldId))}
  return{version:1,sync,load,loadLatest,context,inspect,manager,ready:()=>readyPromise,flushDurable:()=>Promise.resolve(readyPromise).then(()=>drainDurable())};
}
return{createBridge,flushDurable:drainDurable,_durableName:DURABLE_NAME};
});

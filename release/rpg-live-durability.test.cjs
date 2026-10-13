'use strict';
// Proves the RPG live-integration bridge survives an Android-style force-stop:
// WebView localStorage is committed asynchronously and can be discarded on
// SIGKILL (CI run 38374095509 -> Android 16 verifyRpgState no-active-world).
// We mirror the main app's IndexedDB durability: authoritative writes are
// written through to a durable store, and on restart localStorage is hydrated
// back from it. This test simulates a kill by throwing away localStorage while
// keeping the durable store, then asserts the active world is recovered.
const assert=require('assert/strict');
const State=require('./workspaces/rpg-state.js');
const Session=require('./workspaces/rpg-session.js');
const Live=require('./workspaces/rpg-live-integration.js');

const mem={objects:[]};
const runtime={
  hash:s=>{let h=2166136261;for(const c of String(s)){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return(h>>>0).toString(16)},
  lineage:(source,transformation,parentRefs=[])=>({source,transformation,parentRefs}),
  readMemory:()=>({version:1,objects:mem.objects.map(x=>JSON.parse(JSON.stringify(x))),events:[]}),
  createMemory:(content,type,opts)=>({id:opts.id,content,type,version:1,scope:opts.scope,source:opts.source,authority:opts.authority}),
  commitMemory:(obj)=>{const i=mem.objects.findIndex(x=>x.id===obj.id);if(i>=0)mem.objects[i]=obj;else mem.objects.push(obj);return{ok:true}}
};
function makeDurable(){
  const m=new Map();
  return{
    put:(k,v)=>{m.set(String(k),String(v));return Promise.resolve(true)},
    del:k=>{m.delete(String(k));return Promise.resolve(true)},
    get:k=>Promise.resolve(m.has(String(k))?m.get(String(k)):null),
    all:()=>Promise.resolve(Object.fromEntries(m)),
    _map:m
  };
}
const legacy={work:{id:'valen',title:'Valen'},worldSession:{position:7,titles:[]},canonPack:null,canonSession:{position:7,ledger:[{id:'canon-1'}]}};

(async()=>{
  // 1) Normal path (same process): sync then loadLatest works, and is written through to durable.
  {
    const durable=makeDurable(),storage=Session.memoryStorage();
    const b=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage,durable});
    const r=b.sync({roomId:'room-a',worldId:'valen',legacy,reason:'seed'});
    assert.equal(r.ok,true,'sync must succeed');
    assert.equal(b.loadLatest('room-a').session.legacy.worldSession.position,7,'same-process loadLatest');
    await b.flushDurable();
    assert.ok(durable._map.size>=2,'session + index must be written through to the durable store');
    assert.ok([...durable._map.keys()].some(k=>k.includes(':active:')),'active index must be durable');
  }
  // 2) Force-stop simulation: localStorage wiped, durable store survives -> recovery.
  {
    const durable=makeDurable();
    const storage1=Session.memoryStorage();
    const b1=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage:storage1,durable});
    assert.equal(b1.sync({roomId:'rpg-force-stop-ci',worldId:'valen-force-stop',legacy,reason:'seed'}).ok,true);
    await b1.flushDurable();
    // SIGKILL: the process's localStorage is gone; only the durable store survives.
    const storage2=Session.memoryStorage();
    const b2=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage:storage2,durable});
    await b2.ready(); // hydrate localStorage back from durable (what awaitRuntime gates on)
    const x=b2.loadLatest('rpg-force-stop-ci');
    assert.equal(x.ok,true,'loadLatest must recover the active world after force-stop, got: '+x.reason);
    const s=x.session;
    assert.equal(s.worldId,'valen-force-stop');
    assert.equal(s.legacy.worldSession.position,7);
    assert.equal(s.legacy.canonSession.ledger[0].id,'canon-1');
    assert.ok(s.state.revision>=1,'revision must survive');
  }
  // 3) No durable data (fresh install / nothing synced): legitimately no-active-world.
  {
    const durable=makeDurable(),storage=Session.memoryStorage();
    const b=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage,durable});
    await b.ready();
    const x=b.loadLatest('never-synced');
    assert.equal(x.ok,false);
    assert.equal(x.reason,'no-active-world');
  }
  // 4) Synchronous self-heal: index lost but session envelope survived in localStorage.
  {
    const durable=makeDurable(),storage=Session.memoryStorage();
    const b=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage,durable});
    assert.equal(b.sync({roomId:'room-b',worldId:'valen',legacy,reason:'seed'}).ok,true);
    // Simulate losing only the volatile index key (partial loss / legacy data).
    const idx=[...storage.keys()].find(k=>k.includes(':active:'));
    assert.ok(idx,'index key present after sync');
    storage.removeItem(idx);
    const x=b.loadLatest('room-b');
    assert.equal(x.ok,true,'loadLatest must self-heal the index from surviving session envelopes, got: '+x.reason);
    assert.equal(x.session.worldId,'valen');
    // The index was rebuilt.
    assert.equal(storage.getItem(idx),'valen','rebuildIndex must re-write the active index');
  }
  // 5) Backward compatibility: bridge without an explicit durable store still works (Node -> inert).
  {
    const storage=Session.memoryStorage();
    const b=Live.createBridge({stateApi:State,sessionApi:Session,runtime,storage});
    assert.equal(b.sync({roomId:'room-c',worldId:'valen',legacy,reason:'seed'}).ok,true);
    assert.equal(b.loadLatest('room-c').session.legacy.worldSession.position,7);
    await b.flushDurable();
  }
  console.log('RPG live force-stop durability recovery: PASS');
  process.exit(0);
})().catch(e=>{console.error('FAIL',e);process.exit(1)});

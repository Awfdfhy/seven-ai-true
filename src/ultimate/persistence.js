(function(root,factory){
  const core=(typeof module==='object'&&module.exports)?require('./core.js'):(root&&root.SevenUltimateCore);
  const api=factory(core);
  if(typeof module==='object'&&module.exports) module.exports=api;
  if(root) root.SevenUltimatePersistence=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(Core){
  'use strict';
  if(!Core) throw new Error('SEVEN_ULTIMATE_CORE_REQUIRED');
  const SCHEMA='seven.ultimate.backup';
  const SCHEMA_VERSION=3;
  const clone=v=>v==null?v:JSON.parse(JSON.stringify(v));
  const check=(v,m)=>{if(!v) throw new Error(m)};
  const objFromMap=m=>Object.fromEntries([...m.entries()].map(([k,v])=>[k,clone(v)]));
  const mapFromObj=o=>new Map(Object.entries(o||{}).map(([k,v])=>[k,clone(v)]));
  const stable=v=>{
    if(Array.isArray(v)) return '['+v.map(stable).join(',')+']';
    if(v&&typeof v==='object') return '{'+Object.keys(v).sort().map(k=>JSON.stringify(k)+':'+stable(v[k])).join(',')+'}';
    return JSON.stringify(v);
  };
  const hash=v=>{
    const s=stable(v);let h=0x811c9dc5;
    for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
    return h.toString(16).padStart(8,'0');
  };

  function serializeRuntime(rt){
    check(rt&&rt.games instanceof Map,'INVALID_RUNTIME');
    const games=[];
    for(const g of rt.games.values()){
      const campaigns=[];
      for(const c of g.campaigns.values()){
        const timelines=[];
        for(const t of c.timelines.values()){
          timelines.push({
            id:t.id,name:t.name,parentTimelineId:t.parentTimelineId||null,
            inheritedEvents:[...t.inheritedEvents],localEvents:[...t.localEvents],
            inheritedMemories:objFromMap(t.inheritedMemories),memories:objFromMap(t.memories),
            tracks:[...t.tracks.entries()].map(([id,tr])=>[id,clone(tr)]),flashbacks:clone(t.flashbacks)
          });
        }
        campaigns.push({id:c.id,name:c.name,createdAt:c.createdAt,timelines});
      }
      games.push({
        id:g.id,name:g.name,createdAt:g.createdAt,rules:clone(g.rules),tone:clone(g.tone),eventSeq:g.eventSeq,
        entities:[...g.entities.entries()].map(([id,e])=>[id,clone(e)]),
        events:[...g.events.entries()].map(([ref,e])=>[ref,clone(e)]),campaigns
      });
    }
    return {runtimeVersion:rt.version,games};
  }

  function validatePayload(payload){
    check(payload&&Array.isArray(payload.games),'BACKUP_GAMES_REQUIRED');
    const gameIds=new Set();
    for(const g of payload.games){
      check(g&&typeof g.id==='string'&&g.id,'BACKUP_GAME_ID');check(!gameIds.has(g.id),'BACKUP_DUPLICATE_GAME');gameIds.add(g.id);
      const entityIds=new Set((g.entities||[]).map(x=>x[0]));
      const eventRefs=new Set((g.events||[]).map(x=>x[0]));
      check(entityIds.size===(g.entities||[]).length,'BACKUP_DUPLICATE_ENTITY');
      check(eventRefs.size===(g.events||[]).length,'BACKUP_DUPLICATE_EVENT');
      const campaignIds=new Set();
      for(const c of g.campaigns||[]){
        check(c&&c.id&&!campaignIds.has(c.id),'BACKUP_DUPLICATE_CAMPAIGN');campaignIds.add(c.id);
        const timelineIds=new Set((c.timelines||[]).map(t=>t.id));
        check(timelineIds.size===(c.timelines||[]).length,'BACKUP_DUPLICATE_TIMELINE');
        for(const t of c.timelines||[]){
          if(t.parentTimelineId) check(timelineIds.has(t.parentTimelineId),'BACKUP_PARENT_TIMELINE_MISSING');
          const visible=new Set([...(t.inheritedEvents||[]),...(t.localEvents||[])]);
          for(const ref of visible) check(eventRefs.has(ref),'BACKUP_EVENT_REF_MISSING');
          const trackIds=new Set((t.tracks||[]).map(x=>x[0]));
          check(trackIds.size===(t.tracks||[]).length,'BACKUP_DUPLICATE_TRACK');
          for(const fb of t.flashbacks||[]) check(trackIds.has(fb.trackId),'BACKUP_FLASHBACK_TRACK_MISSING');
          for(const bucketName of ['inheritedMemories','memories']){
            const bucket=t[bucketName]||{};
            for(const [entityId,list] of Object.entries(bucket)){
              check(entityIds.has(entityId),'BACKUP_MEMORY_ENTITY_MISSING');
              const ids=new Set();
              for(const m of list||[]){check(m&&m.id&&!ids.has(m.id),'BACKUP_DUPLICATE_MEMORY');ids.add(m.id);check(visible.has(m.sourceEventRef),'BACKUP_MEMORY_SOURCE_MISSING');}
            }
          }
        }
      }
    }
    return true;
  }

  function createBackup(rt,meta={}){
    const payload=serializeRuntime(rt);validatePayload(payload);
    const base={schema:SCHEMA,schemaVersion:SCHEMA_VERSION,createdAt:meta.createdAt||new Date().toISOString(),payload};
    return {...base,integrity:{algorithm:'fnv1a32-stable-json',digest:hash(base)}};
  }

  function validateBackup(backup){
    check(backup&&backup.schema===SCHEMA,'BACKUP_SCHEMA');
    check(backup.schemaVersion===SCHEMA_VERSION,'BACKUP_VERSION');
    check(backup.integrity&&backup.integrity.algorithm==='fnv1a32-stable-json','BACKUP_INTEGRITY');
    const base={schema:backup.schema,schemaVersion:backup.schemaVersion,createdAt:backup.createdAt,payload:backup.payload};
    check(hash(base)===backup.integrity.digest,'BACKUP_CORRUPT');
    return validatePayload(backup.payload);
  }

  function restoreBackup(backup,opts={}){
    validateBackup(backup);
    const rt=new Core.SevenUltimateRuntime({clock:opts.clock});
    rt.games.clear();
    for(const sg of backup.payload.games){
      const g={id:sg.id,name:sg.name,createdAt:sg.createdAt,rules:clone(sg.rules||{}),tone:clone(sg.tone||{}),entities:new Map(),campaigns:new Map(),events:new Map(),eventSeq:Number(sg.eventSeq||0)};
      for(const [id,e] of sg.entities||[]) g.entities.set(id,Object.freeze(clone(e)));
      for(const [ref,e] of sg.events||[]) g.events.set(ref,Object.freeze(clone(e)));
      for(const sc of sg.campaigns||[]){
        const c={id:sc.id,name:sc.name,createdAt:sc.createdAt,timelines:new Map()};
        for(const st of sc.timelines||[]){
          c.timelines.set(st.id,{id:st.id,name:st.name,parentTimelineId:st.parentTimelineId||null,inheritedEvents:[...(st.inheritedEvents||[])],localEvents:[...(st.localEvents||[])],inheritedMemories:mapFromObj(st.inheritedMemories),memories:mapFromObj(st.memories),tracks:new Map((st.tracks||[]).map(([id,tr])=>[id,clone(tr)])),flashbacks:clone(st.flashbacks||[])});
        }
        g.campaigns.set(c.id,c);
      }
      rt.games.set(g.id,g);
    }
    return rt;
  }

  class RevisionedMemoryStore{
    constructor(){this.rows=new Map();}
    async load(key){const r=this.rows.get(key);return r?clone(r):null;}
    async save(key,value,expectedRevision=null){
      const current=this.rows.get(key);const revision=current?current.revision:0;
      if(expectedRevision!=null&&expectedRevision!==revision) throw new Error('STALE_REVISION');
      const next={revision:revision+1,value:clone(value)};this.rows.set(key,next);return clone(next);
    }
    async remove(key,expectedRevision=null){const current=this.rows.get(key);const revision=current?current.revision:0;if(expectedRevision!=null&&expectedRevision!==revision) throw new Error('STALE_REVISION');this.rows.delete(key);return revision+1;}
  }

  class IndexedDBStore{
    constructor(opts={}){this.dbName=opts.dbName||'seven-ultimate';this.storeName=opts.storeName||'canonical';this.version=1;}
    open(){
      check(typeof indexedDB!=='undefined','INDEXEDDB_UNAVAILABLE');
      return new Promise((resolve,reject)=>{const req=indexedDB.open(this.dbName,this.version);req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(this.storeName)) db.createObjectStore(this.storeName);};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error('INDEXEDDB_OPEN_FAILED'));});
    }
    async load(key){const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction(this.storeName,'readonly');const req=tx.objectStore(this.storeName).get(key);req.onsuccess=()=>resolve(req.result?clone(req.result):null);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();});}
    async save(key,value,expectedRevision=null){
      const db=await this.open();return new Promise((resolve,reject)=>{const tx=db.transaction(this.storeName,'readwrite'),store=tx.objectStore(this.storeName),get=store.get(key);let result;get.onsuccess=()=>{const current=get.result,revision=current?current.revision:0;if(expectedRevision!=null&&expectedRevision!==revision){tx.abort();reject(new Error('STALE_REVISION'));return;}result={revision:revision+1,value:clone(value)};store.put(result,key);};get.onerror=()=>reject(get.error);tx.oncomplete=()=>{db.close();resolve(clone(result));};tx.onerror=()=>{db.close();reject(tx.error||new Error('INDEXEDDB_SAVE_FAILED'));};tx.onabort=()=>db.close();});
    }
  }

  async function persistRuntime(store,key,rt,expectedRevision=null,meta={}){return store.save(key,createBackup(rt,meta),expectedRevision);}
  async function loadRuntime(store,key,opts={}){const row=await store.load(key);return row?{revision:row.revision,runtime:restoreBackup(row.value,opts)}:null;}

  return {SCHEMA,SCHEMA_VERSION,serializeRuntime,validatePayload,createBackup,validateBackup,restoreBackup,RevisionedMemoryStore,IndexedDBStore,persistRuntime,loadRuntime};
});

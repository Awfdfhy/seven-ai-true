(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.SevenRpgSession=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';

const FORMAT='seven-rpg-session';
const VERSION=1;
const DEFAULT_PREFIX='seven_rpg_session_v3';
const MIN_SUPPORTED_SCHEMA_VERSION=1;

// Forward-only migration ladder. Key = source schemaVersion; value = (envelope) => envelope at
// version+1. Empty at version 1 (nothing to upgrade yet), but it is the seam that makes a future
// VERSION bump non-destructive: an older save is walked up this ladder on load instead of being
// rejected, so shipping v2 cannot strand every campaign a player already has.
//
// Integrity is always verified against the envelope AS STORED before a step runs, because the
// digest was computed over the stored schemaVersion. A step therefore never gets to see or
// rewrite unverified bytes.
const MIGRATIONS=Object.freeze({});

function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function text(v){return typeof v==='string'?v.trim():'';}
function obj(v){return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}
function validId(v){return text(v).length>0&&text(v).length<=240;}
function stableStringify(v){
  if(v===null||typeof v!=='object')return JSON.stringify(v);
  if(Array.isArray(v))return '['+v.map(stableStringify).join(',')+']';
  const keys=Object.keys(v).filter(k=>v[k]!==undefined).sort();
  return '{'+keys.map(k=>JSON.stringify(k)+':'+stableStringify(v[k])).join(',')+'}';
}
function checksum(value){
  const s=typeof value==='string'?value:stableStringify(value);let h=0x811c9dc5;
  for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,0x01000193)>>>0;}
  return h.toString(16).padStart(8,'0');
}
function sessionKey(prefix,roomId,worldId){
  if(!validId(roomId)||!validId(worldId))throw Error('invalid RPG session identity');
  return String(prefix||DEFAULT_PREFIX)+':'+encodeURIComponent(text(roomId))+':'+encodeURIComponent(text(worldId));
}
function memoryStorage(){
  const m=new Map();
  return {getItem:k=>m.has(k)?m.get(k):null,setItem:(k,v)=>{m.set(k,String(v));},removeItem:k=>{m.delete(k);},keys:()=>Array.from(m.keys()),
    get length(){return m.size;},key:i=>{const a=Array.from(m.keys());return (i>=0&&i<a.length)?a[i]:null;}};
}
function createManager(options){
  const o=options&&typeof options==='object'?options:{};
  const stateApi=o.stateApi;
  if(!stateApi||typeof stateApi.createState!=='function'||typeof stateApi.validateState!=='function'||typeof stateApi.applyEvent!=='function')throw Error('SevenRpgState-compatible stateApi required');
  const storage=o.storage||((typeof localStorage!=='undefined')?localStorage:null);
  if(!storage||typeof storage.getItem!=='function'||typeof storage.setItem!=='function'||typeof storage.removeItem!=='function')throw Error('storage adapter required');
  const prefix=text(o.prefix)||DEFAULT_PREFIX;
  const clock=typeof o.clock==='function'?o.clock:()=>new Date().toISOString();
  // A manager may be pinned to a newer schema (rolling upgrade / test) and may be given its own
  // ladder; both default to the shipped pair.
  const targetVersion=Number.isInteger(o.schemaVersion)&&o.schemaVersion>=MIN_SUPPORTED_SCHEMA_VERSION?o.schemaVersion:VERSION;
  const migrationSteps=(o.migrations&&typeof o.migrations==='object'&&!Array.isArray(o.migrations))?o.migrations:MIGRATIONS;

  // Walk a verified envelope forward to targetVersion. Returns {ok:true,envelope,fromVersion} or
  // {ok:false,reason,fromVersion} when a step for some intermediate version is missing.
  function migrateEnvelope(envelope){
    let current=clone(envelope);const fromVersion=Number(current.schemaVersion);
    if(fromVersion>targetVersion)return {ok:false,reason:'future-envelope',fromVersion};
    while(Number(current.schemaVersion)<targetVersion){
      const step=typeof migrationSteps[Number(current.schemaVersion)]==='function'?migrationSteps[Number(current.schemaVersion)]:null;
      if(!step)return {ok:false,reason:'unsupported-envelope',fromVersion};
      let next=null;
      try{next=step(current);}catch(e){return {ok:false,reason:'unsupported-envelope',fromVersion,details:String(e&&e.message||e)};}
      if(!next||typeof next!=='object'||Array.isArray(next))return {ok:false,reason:'unsupported-envelope',fromVersion};
      if(Number(next.schemaVersion)!==Number(current.schemaVersion)+1)return {ok:false,reason:'unsupported-envelope',fromVersion};
      current=next;
    }
    return {ok:true,envelope:current,fromVersion};
  }

  function bodyFor(session){
    return {format:FORMAT,schemaVersion:targetVersion,roomId:session.roomId,worldId:session.worldId,revision:session.state.revision,state:clone(session.state),legacy:clone(session.legacy||null),updatedAt:String(clock())};
  }
  function envelopeFor(session){const body=bodyFor(session);return Object.assign(body,{integrity:{algorithm:'fnv1a32',digest:checksum(body)}});}
  function validateEnvelope(envelope,roomId,worldId){
    if(!envelope||typeof envelope!=='object'||Array.isArray(envelope))return {valid:false,reason:'invalid-envelope'};
    if(envelope.format!==FORMAT)return {valid:false,reason:'invalid-envelope'};
    const storedVersion=Number(envelope.schemaVersion);
    if(!Number.isInteger(storedVersion)||storedVersion<MIN_SUPPORTED_SCHEMA_VERSION)return {valid:false,reason:'invalid-envelope'};
    // Written by a NEWER build: the bytes are valid, we simply cannot interpret them. This is
    // reported as its own outcome so callers leave the save alone instead of destroying it.
    if(storedVersion>targetVersion)return {valid:false,reason:'future-envelope',storedVersion};
    if(envelope.roomId!==roomId||envelope.worldId!==worldId)return {valid:false,reason:'identity-mismatch'};
    const integrity=envelope.integrity;
    if(!integrity||integrity.algorithm!=='fnv1a32'||typeof integrity.digest!=='string')return {valid:false,reason:'missing-integrity'};
    const body=clone(envelope);delete body.integrity;
    if(checksum(body)!==integrity.digest)return {valid:false,reason:'integrity-mismatch'};
    // Integrity is proven against the stored bytes; only now may an older shape be upgraded.
    const lifted=migrateEnvelope(envelope);
    if(!lifted.ok)return {valid:false,reason:lifted.reason,details:lifted.fromVersion==null?null:{fromVersion:lifted.fromVersion}};
    let current=lifted.envelope;
    if(lifted.fromVersion<targetVersion){
      // A migrated body no longer matches the digest that was computed for the pre-migration
      // bytes. Re-stamp it so the envelope handed back is a VALID envelope at the new version
      // and can be re-validated (or re-persisted) without a spurious integrity-mismatch.
      const rebased=clone(current);delete rebased.integrity;
      current=Object.assign(rebased,{integrity:{algorithm:'fnv1a32',digest:checksum(rebased)}});
    }
    const state=stateApi.createState(current.state);
    const validation=stateApi.validateState(state);
    if(!validation||validation.valid!==true)return {valid:false,reason:'invalid-state',details:validation};
    if(Number(current.revision)!==Number(state.revision))return {valid:false,reason:'revision-mismatch'};
    return {valid:true,state,legacy:clone(current.legacy||null),revision:state.revision,envelope:clone(current),migratedFrom:lifted.fromVersion<targetVersion?lifted.fromVersion:null};
  }
  function parseRaw(raw,roomId,worldId){
    if(typeof raw!=='string'||!raw)return {valid:false,reason:'missing'};
    try{return validateEnvelope(JSON.parse(raw),roomId,worldId);}catch(e){return {valid:false,reason:'invalid-json',details:String(e&&e.message||e)};}
  }
  function quarantine(key,raw,reason){
    try{if(typeof raw==='string'&&raw)storage.setItem(key+':quarantine',JSON.stringify({reason:String(reason||'corrupt'),raw}));}catch(_){}
    try{storage.removeItem(key);}catch(_){}
  }
  function create(input){
    const x=input&&typeof input==='object'?input:{};const roomId=text(x.roomId),worldId=text(x.worldId);
    if(!validId(roomId)||!validId(worldId))return {ok:false,status:'BLOCKED',reason:'invalid-session-identity'};
    const state=stateApi.createState(Object.assign({},x.state||{},{worldId}));
    const validation=stateApi.validateState(state);if(!validation.valid)return {ok:false,status:'BLOCKED',reason:'invalid-initial-state',details:validation};
    return {ok:true,status:'CREATED',session:{roomId,worldId,state,legacy:clone(x.legacy||null),persistedRevision:null}};
  }
  function load(roomIdInput,worldIdInput){
    const roomId=text(roomIdInput),worldId=text(worldIdInput);if(!validId(roomId)||!validId(worldId))return {ok:false,status:'BLOCKED',reason:'invalid-session-identity'};
    const key=sessionKey(prefix,roomId,worldId);let raw;
    try{raw=storage.getItem(key);}catch(e){return {ok:false,status:'STORAGE_ERROR',reason:'storage-read-failed',error:String(e&&e.message||e)};}
    if(raw==null)return {ok:false,status:'MISSING',reason:'missing'};
    const parsed=parseRaw(raw,roomId,worldId);
    if(!parsed.valid){
      // A save from a newer build is not damage -- we just cannot read it. Leave the bytes in
      // place so a corrected build, or the player themselves, can still recover the campaign.
      // Quarantine stays reserved for data that is genuinely corrupt.
      if(parsed.reason!=='future-envelope')quarantine(key,raw,parsed.reason);
      return {ok:false,status:parsed.reason==='future-envelope'?'UNSUPPORTED':'CORRUPT',reason:parsed.reason,details:parsed.details||null,storedVersion:parsed.storedVersion||null};
    }
    return {ok:true,status:'LOADED',session:{roomId,worldId,state:parsed.state,legacy:parsed.legacy,persistedRevision:parsed.revision},envelope:parsed.envelope,migratedFrom:parsed.migratedFrom||null};
  }
  function persist(session,options){
    const opts=options&&typeof options==='object'?options:{};
    if(!session||!validId(session.roomId)||!validId(session.worldId))return {ok:false,status:'BLOCKED',reason:'invalid-session'};
    const state=stateApi.createState(session.state),validation=stateApi.validateState(state);if(!validation.valid)return {ok:false,status:'BLOCKED',reason:'invalid-state',details:validation};
    const key=sessionKey(prefix,session.roomId,session.worldId);let currentRaw=null;
    try{currentRaw=storage.getItem(key);}catch(e){return {ok:false,status:'STORAGE_ERROR',reason:'storage-read-failed',error:String(e&&e.message||e)};}
    if(currentRaw!=null&&!opts.force){
      const current=parseRaw(currentRaw,session.roomId,session.worldId);
      if(!current.valid){
        if(current.reason!=='future-envelope')quarantine(key,currentRaw,current.reason);
        return {ok:false,status:current.reason==='future-envelope'?'UNSUPPORTED':'CORRUPT',reason:current.reason,storedVersion:current.storedVersion||null};
      }
      const expected=session.persistedRevision;
      if(expected==null||Number(current.revision)!==Number(expected))return {ok:false,status:'CONFLICT',reason:'stale-session',currentRevision:current.revision,expectedRevision:expected};
    }
    const nextSession={roomId:session.roomId,worldId:session.worldId,state,legacy:clone(session.legacy||null),persistedRevision:state.revision};
    const envelope=envelopeFor(nextSession),raw=JSON.stringify(envelope);
    try{storage.setItem(key,raw);}catch(e){return {ok:false,status:'STORAGE_ERROR',reason:'storage-write-failed',error:String(e&&e.message||e)};}
    return {ok:true,status:'PERSISTED',session:nextSession,envelope,key};
  }
  function start(input){const made=create(input);if(!made.ok)return made;return persist(made.session,{force:input&&input.force===true});}
  function commitEvents(session,events,options){
    if(!session)return {ok:false,status:'BLOCKED',reason:'invalid-session'};
    const list=Array.isArray(events)?events:[];if(!list.length)return {ok:false,status:'BLOCKED',reason:'empty-transaction'};
    let candidate=stateApi.createState(session.state);const records=[];
    for(const event of list){const out=stateApi.applyEvent(candidate,event);if(!out||out.ok!==true)return {ok:false,status:'BLOCKED',reason:'event-rejected',eventReason:out&&out.reason||'unknown',eventId:event&&event.id||null,index:records.length,session};candidate=out.state;records.push(out.record);}
    const validation=stateApi.validateState(candidate);if(!validation.valid)return {ok:false,status:'BLOCKED',reason:'transaction-validation-failed',details:validation,session};
    const saved=persist({roomId:session.roomId,worldId:session.worldId,state:candidate,legacy:clone(session.legacy||null),persistedRevision:session.persistedRevision},options);
    if(!saved.ok)return Object.assign({},saved,{session});
    return {ok:true,status:'COMMITTED',session:saved.session,records,envelope:saved.envelope};
  }
  function remove(roomIdInput,worldIdInput){
    const roomId=text(roomIdInput),worldId=text(worldIdInput);if(!validId(roomId)||!validId(worldId))return {ok:false,status:'BLOCKED',reason:'invalid-session-identity'};
    const key=sessionKey(prefix,roomId,worldId);try{storage.removeItem(key);return {ok:true,status:'REMOVED',key};}catch(e){return {ok:false,status:'STORAGE_ERROR',reason:'storage-remove-failed',error:String(e&&e.message||e)};}
  }
  function inspect(roomIdInput,worldIdInput){
    const roomId=text(roomIdInput),worldId=text(worldIdInput);if(!validId(roomId)||!validId(worldId))return {status:'INVALID'};
    const key=sessionKey(prefix,roomId,worldId);let raw=null;try{raw=storage.getItem(key);}catch(e){return {status:'STORAGE_ERROR'};}if(raw==null)return {status:'MISSING',key};const p=parseRaw(raw,roomId,worldId);return p.valid?{status:'VALID',key,revision:p.revision,digest:p.envelope.integrity.digest}:{status:'CORRUPT',key,reason:p.reason};
  }
  // Persistence seam. This manager holds no in-process collections: every
  // durable record already lives in the injected `storage` adapter under
  // `sessionKey(prefix,roomId,worldId)`, and `prefix` is fixed at construction.
  // exportState therefore reports the storage namespace plus the keys it
  // currently owns, and importState is a validating no-op that never throws.
  function exportState(){return {version:1,state:{prefix,storageKeys:typeof storage.keys==='function'?storage.keys():[]}};}
  function importState(data){
    const d=obj(data);const want=String(obj(d.state).prefix||prefix);
    return {ok:true,restored:0,appliedPrefix:want===prefix,prefix:prefix};
  }
  return {format:FORMAT,version:VERSION,prefix,key:(r,w)=>sessionKey(prefix,r,w),create,start,load,persist,commitEvents,remove,inspect,validateEnvelope,exportState,importState};
}

return {FORMAT,VERSION,DEFAULT_PREFIX,stableStringify,checksum,sessionKey,memoryStorage,createManager};
});

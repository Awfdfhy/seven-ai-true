import { SevenError } from "../core/errors";
import { cloneMemoryFact, isMemoryFact, isMemoryWriteEvent, type MemoryFact, type MemoryWriteEvent } from "../domain/memory/fabric";

export const MEMORY_FABRIC_LIMITS = Object.freeze({
  facts: 10_000,
  events: 100_000,
});

export type MemoryFabricRepositoryLimits = Readonly<{
  maxFacts?: number;
  maxEvents?: number;
}>;

function validateLimits(limits: MemoryFabricRepositoryLimits = {}): Readonly<{facts:number;events:number}> {
  const facts=limits.maxFacts??MEMORY_FABRIC_LIMITS.facts;
  const events=limits.maxEvents??MEMORY_FABRIC_LIMITS.events;
  if(!Number.isSafeInteger(facts)||facts<1||facts>MEMORY_FABRIC_LIMITS.facts||
     !Number.isSafeInteger(events)||events<1||events>MEMORY_FABRIC_LIMITS.events){
    throw new SevenError({code:"VALIDATION",message:"Memory Fabric limits are invalid."});
  }
  return Object.freeze({facts,events});
}

function capacityError(kind:"facts"|"events"):SevenError{
  return new SevenError({code:"STORAGE",message:`Memory Fabric ${kind} capacity reached.`});
}

export interface MemoryFabricRepository {
  listForRoom(roomId: string, signal?: AbortSignal): Promise<readonly MemoryFact[]>;
  listAll(signal?: AbortSignal): Promise<readonly MemoryFact[]>;
  listEvents(signal?: AbortSignal): Promise<readonly MemoryWriteEvent[]>;
  findActiveByCanonicalKey(scope: "global"|"room", roomId: string | null, canonicalKey: string, signal?: AbortSignal): Promise<readonly MemoryFact[]>;
  commit(facts: readonly MemoryFact[], events: readonly MemoryWriteEvent[], signal?: AbortSignal): Promise<void>;
  replaceAll(facts: readonly MemoryFact[], events: readonly MemoryWriteEvent[], signal?: AbortSignal): Promise<void>;
  clearAll(signal?: AbortSignal): Promise<void>;
  deleteFact(memoryId: string, event: MemoryWriteEvent, signal?: AbortSignal): Promise<void>;
}

type StoredFact = MemoryFact & { scopeRoom: string };

function abortError(): DOMException { return new DOMException("Aborted","AbortError"); }
function throwIfAborted(signal?: AbortSignal): void { if (signal?.aborted) throw abortError(); }
function scopeRoom(fact: Pick<MemoryFact,"scope"|"roomId">): string { return fact.scope==="global" ? "global" : `room:${fact.roomId}`; }
function canonical(value: string, field: string): string {
  if (typeof value!=="string" || !value.trim() || value!==value.trim()) throw new SevenError({code:"VALIDATION",message:`${field} must be canonical.`});
  return value;
}

export class InMemoryMemoryFabricRepository implements MemoryFabricRepository {
  private readonly facts=new Map<string,MemoryFact>();
  private readonly events: MemoryWriteEvent[]=[];
  private readonly limits:Readonly<{facts:number;events:number}>;
  constructor(limits:MemoryFabricRepositoryLimits={}){this.limits=validateLimits(limits);}
  async listForRoom(roomId:string, signal?:AbortSignal):Promise<readonly MemoryFact[]> {
    throwIfAborted(signal); canonical(roomId,"roomId");
    return Object.freeze([...this.facts.values()].filter(f=>f.scope==="global" || f.roomId===roomId).map(cloneMemoryFact));
  }
  async listAll(signal?:AbortSignal):Promise<readonly MemoryFact[]>{
    throwIfAborted(signal);
    return Object.freeze([...this.facts.values()].map(cloneMemoryFact));
  }
  async listEvents(signal?:AbortSignal):Promise<readonly MemoryWriteEvent[]>{
    throwIfAborted(signal);
    return Object.freeze(this.events.map(event=>Object.freeze({...event})));
  }
  async findActiveByCanonicalKey(scope:"global"|"room",roomId:string|null,key:string,signal?:AbortSignal):Promise<readonly MemoryFact[]> {
    throwIfAborted(signal); canonical(key,"canonicalKey");
    return Object.freeze([...this.facts.values()].filter(f=>f.status==="active" && f.scope===scope && f.roomId===roomId && f.canonicalKey===key).map(cloneMemoryFact));
  }
  async commit(facts:readonly MemoryFact[],events:readonly MemoryWriteEvent[],signal?:AbortSignal):Promise<void>{
    throwIfAborted(signal);
    for(const fact of facts){ if(!isMemoryFact(fact)) throw new SevenError({code:"VALIDATION",message:"Invalid memory fact."}); }
    for(const event of events){ if(!isMemoryWriteEvent(event)) throw new SevenError({code:"VALIDATION",message:"Invalid memory event."}); }
    const newFactIds=new Set(facts.filter(f=>!this.facts.has(f.id)).map(f=>f.id));
    const newEventIds=new Set(events.map(e=>e.id));
    if(this.facts.size+newFactIds.size>this.limits.facts)throw capacityError("facts");
    if(this.events.length+newEventIds.size>this.limits.events)throw capacityError("events");
    for(const fact of facts)this.facts.set(fact.id,cloneMemoryFact(fact));
    const knownEvents=new Set(this.events.map(event=>event.id));
    for(const event of events){if(!knownEvents.has(event.id)){this.events.push(Object.freeze({...event}));knownEvents.add(event.id);}}
    throwIfAborted(signal);
  }
  async replaceAll(facts:readonly MemoryFact[],events:readonly MemoryWriteEvent[],signal?:AbortSignal):Promise<void>{
    throwIfAborted(signal);
    for(const fact of facts)if(!isMemoryFact(fact))throw new SevenError({code:"VALIDATION",message:"Invalid memory fact."});
    for(const event of events)if(!isMemoryWriteEvent(event))throw new SevenError({code:"VALIDATION",message:"Invalid memory event."});
    if(facts.length>this.limits.facts)throw capacityError("facts");
    if(events.length>this.limits.events)throw capacityError("events");
    const nextFacts=new Map<string,MemoryFact>();
    for(const fact of facts){
      if(nextFacts.has(fact.id))throw new SevenError({code:"VALIDATION",message:"Duplicate memory fact id in replacement."});
      nextFacts.set(fact.id,cloneMemoryFact(fact));
    }
    const nextEvents:MemoryWriteEvent[]=[];
    const eventIds=new Set<string>();
    for(const event of events){
      if(eventIds.has(event.id))throw new SevenError({code:"VALIDATION",message:"Duplicate memory event id in replacement."});
      eventIds.add(event.id);nextEvents.push(Object.freeze({...event}));
    }
    this.facts.clear();for(const [id,fact] of nextFacts)this.facts.set(id,fact);
    this.events.length=0;this.events.push(...nextEvents);
    throwIfAborted(signal);
  }
  async clearAll(signal?:AbortSignal):Promise<void>{
    throwIfAborted(signal);this.facts.clear();this.events.length=0;throwIfAborted(signal);
  }
  async deleteFact(memoryId:string,event:MemoryWriteEvent,signal?:AbortSignal):Promise<void>{
    throwIfAborted(signal); canonical(memoryId,"memoryId");
    this.facts.delete(memoryId);
    this.events.push(Object.freeze({...event}));
    throwIfAborted(signal);
  }
}

export class IndexedDbMemoryFabricRepository implements MemoryFabricRepository {
  private dbPromise:Promise<IDBDatabase>|null=null;
  private readonly limits:Readonly<{facts:number;events:number}>;
  constructor(
    private readonly databaseName="seven_remake_memory_fabric_v2",
    limits:MemoryFabricRepositoryLimits={},
  ) { this.limits=validateLimits(limits); }

  async listForRoom(roomId:string, signal?:AbortSignal):Promise<readonly MemoryFact[]>{
    throwIfAborted(signal); canonical(roomId,"roomId");
    const global=await this.getAllByIndex("facts","scopeRoom","global",signal);
    const room=await this.getAllByIndex("facts","scopeRoom",`room:${roomId}`,signal);
    const decoded=await this.decodeFactsAndQuarantine([...global,...room],"scoped-read");
    return Object.freeze(decoded);
  }

  async listAll(signal?:AbortSignal):Promise<readonly MemoryFact[]>{
    throwIfAborted(signal);
    const db=await this.open();
    const rows=await new Promise<unknown[]>((resolve,reject)=>{
      const tx=db.transaction("facts","readonly");
      const request=tx.objectStore("facts").getAll();
      request.onsuccess=()=>resolve(request.result as unknown[]);
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Memory full-store read failed.",cause:request.error}));
    });
    return Object.freeze(await this.decodeFactsAndQuarantine(rows,"full-read"));
  }

  async listEvents(signal?:AbortSignal):Promise<readonly MemoryWriteEvent[]>{
    throwIfAborted(signal);
    const db=await this.open();
    const rows=await new Promise<unknown[]>((resolve,reject)=>{
      const tx=db.transaction("events","readonly");
      const request=tx.objectStore("events").getAll();
      request.onsuccess=()=>resolve(request.result as unknown[]);
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Memory event read failed.",cause:request.error}));
    });
    const out:MemoryWriteEvent[]=[];
    for(const row of rows){
      if(!row || typeof row!=="object" || Array.isArray(row))throw new SevenError({code:"STORAGE",message:"Stored memory event is malformed."});
      const event=row as MemoryWriteEvent;
      if(event.schemaVersion!==1 || typeof event.id!=="string" || typeof event.factId!=="string" ||
         !["add","supersede","forget"].includes(event.type) || typeof event.at!=="number" ||
         typeof event.sourceRoomId!=="string" || typeof event.sourceMessageId!=="string"){
        throw new SevenError({code:"STORAGE",message:"Stored memory event failed schema validation."});
      }
      out.push(Object.freeze({...event}));
    }
    return Object.freeze(out);
  }

  async findActiveByCanonicalKey(scope:"global"|"room",roomId:string|null,key:string,signal?:AbortSignal):Promise<readonly MemoryFact[]>{
    throwIfAborted(signal); canonical(key,"canonicalKey");
    const rows=await this.getAllByIndex("facts","canonicalKey",key,signal);
    return Object.freeze((await this.decodeFactsAndQuarantine(rows,"canonical-key-read")).filter(f=>f.status==="active" && f.scope===scope && f.roomId===roomId));
  }

  async commit(facts:readonly MemoryFact[],events:readonly MemoryWriteEvent[],signal?:AbortSignal):Promise<void>{
    throwIfAborted(signal);
    for(const fact of facts) if(!isMemoryFact(fact)) throw new SevenError({code:"VALIDATION",message:"Invalid memory fact."});
    for(const event of events) if(!isMemoryWriteEvent(event)) throw new SevenError({code:"VALIDATION",message:"Invalid memory event."});
    const db=await this.open();
    await new Promise<void>((resolve,reject)=>{
      let tx:IDBTransaction;
      try{ tx=db.transaction(["facts","events"],"readwrite"); }catch(error){ reject(new SevenError({code:"STORAGE",message:"Could not start memory transaction.",cause:error})); return; }
      let failed:unknown=null;
      const fail=(error:unknown)=>{if(failed)return;failed=error;try{tx.abort();}catch{}};
      const onAbort=()=>fail(abortError());
      signal?.addEventListener("abort",onAbort,{once:true});
      tx.oncomplete=()=>{ signal?.removeEventListener("abort",onAbort); failed?reject(failed):resolve(); };
      tx.onerror=()=>{ if(!failed)failed=new SevenError({code:"STORAGE",message:"Memory transaction failed.",cause:tx.error}); };
      tx.onabort=()=>{ signal?.removeEventListener("abort",onAbort); reject(failed??(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Memory transaction aborted.",cause:tx.error}))); };
      const fs=tx.objectStore("facts"), es=tx.objectStore("events");
      const factCount=fs.count(), eventCount=es.count();
      let factsReady=false,eventsReady=false;
      const maybeWrite=()=>{
        if(!factsReady||!eventsReady||failed)return;
        const factKeys=facts.map(f=>fs.getKey(f.id));
        let pending=factKeys.length;
        let existingFacts=0;
        const write=()=>{
          if(failed)return;
          const newFacts=facts.length-existingFacts;
          if(factCount.result+newFacts>this.limits.facts){fail(capacityError("facts"));return;}
          if(eventCount.result+events.length>this.limits.events){fail(capacityError("events"));return;}
          for(const fact of facts)fs.put({...fact,scopeRoom:scopeRoom(fact)} satisfies StoredFact);
          for(const event of events)es.put(event);
        };
        if(pending===0){write();return;}
        for(const request of factKeys){
          request.onsuccess=()=>{if(request.result!==undefined)existingFacts+=1;pending-=1;if(pending===0)write();};
          request.onerror=()=>fail(new SevenError({code:"STORAGE",message:"Memory capacity existence check failed.",cause:request.error}));
        }
      };
      factCount.onsuccess=()=>{factsReady=true;maybeWrite();};
      factCount.onerror=()=>fail(new SevenError({code:"STORAGE",message:"Memory fact count failed.",cause:factCount.error}));
      eventCount.onsuccess=()=>{eventsReady=true;maybeWrite();};
      eventCount.onerror=()=>fail(new SevenError({code:"STORAGE",message:"Memory event count failed.",cause:eventCount.error}));
      if(signal?.aborted) onAbort();
    });
  }

  async replaceAll(facts:readonly MemoryFact[],events:readonly MemoryWriteEvent[],signal?:AbortSignal):Promise<void>{
    throwIfAborted(signal);
    for(const fact of facts)if(!isMemoryFact(fact))throw new SevenError({code:"VALIDATION",message:"Invalid memory fact."});
    for(const event of events)if(!isMemoryWriteEvent(event))throw new SevenError({code:"VALIDATION",message:"Invalid memory event."});
    if(facts.length>this.limits.facts)throw capacityError("facts");
    if(events.length>this.limits.events)throw capacityError("events");
    if(new Set(facts.map(f=>f.id)).size!==facts.length)throw new SevenError({code:"VALIDATION",message:"Duplicate memory fact id in replacement."});
    if(new Set(events.map(e=>e.id)).size!==events.length)throw new SevenError({code:"VALIDATION",message:"Duplicate memory event id in replacement."});
    const db=await this.open();
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction(["facts","events","quarantine"],"readwrite");
      const onAbort=()=>{try{tx.abort();}catch{}};
      signal?.addEventListener("abort",onAbort,{once:true});
      const fs=tx.objectStore("facts"), es=tx.objectStore("events"), qs=tx.objectStore("quarantine");
      fs.clear();es.clear();qs.clear();
      for(const fact of facts)fs.put({...fact,scopeRoom:scopeRoom(fact)} satisfies StoredFact);
      for(const event of events)es.put(event);
      tx.oncomplete=()=>{signal?.removeEventListener("abort",onAbort);resolve();};
      tx.onerror=()=>{signal?.removeEventListener("abort",onAbort);reject(new SevenError({code:"STORAGE",message:"Memory replacement transaction failed.",cause:tx.error}));};
      tx.onabort=()=>{signal?.removeEventListener("abort",onAbort);reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Memory replacement transaction aborted.",cause:tx.error}));};
      if(signal?.aborted)onAbort();
    });
  }

  async clearAll(signal?:AbortSignal):Promise<void>{
    throwIfAborted(signal);
    const db=await this.open();
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction(["facts","events","quarantine"],"readwrite");
      const onAbort=()=>{try{tx.abort();}catch{}};
      signal?.addEventListener("abort",onAbort,{once:true});
      tx.objectStore("facts").clear();
      tx.objectStore("events").clear();
      tx.objectStore("quarantine").clear();
      tx.oncomplete=()=>{signal?.removeEventListener("abort",onAbort);resolve();};
      tx.onerror=()=>{signal?.removeEventListener("abort",onAbort);reject(new SevenError({code:"STORAGE",message:"Memory clear transaction failed.",cause:tx.error}));};
      tx.onabort=()=>{signal?.removeEventListener("abort",onAbort);reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Memory clear transaction aborted.",cause:tx.error}));};
      if(signal?.aborted)onAbort();
    });
  }

  async deleteFact(memoryId:string,event:MemoryWriteEvent,signal?:AbortSignal):Promise<void>{
    throwIfAborted(signal); canonical(memoryId,"memoryId");
    const db=await this.open();
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction(["facts","events"],"readwrite");
      const onAbort=()=>{try{tx.abort();}catch{}};
      signal?.addEventListener("abort",onAbort,{once:true});
      tx.objectStore("facts").delete(memoryId);
      tx.objectStore("events").put(event);
      tx.oncomplete=()=>{signal?.removeEventListener("abort",onAbort);resolve();};
      tx.onerror=()=>{signal?.removeEventListener("abort",onAbort);reject(new SevenError({code:"STORAGE",message:"Memory delete transaction failed.",cause:tx.error}));};
      tx.onabort=()=>{signal?.removeEventListener("abort",onAbort);reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Memory delete transaction aborted.",cause:tx.error}));};
      if(signal?.aborted)onAbort();
    });
  }

  private decodeFact=(raw:unknown):MemoryFact=>{
    if(!raw || typeof raw!=="object") throw new SevenError({code:"STORAGE",message:"Stored memory fact is malformed."});
    const {scopeRoom:_scopeRoom,...candidate}=raw as StoredFact;
    if(!isMemoryFact(candidate)) throw new SevenError({code:"STORAGE",message:"Stored memory fact failed schema validation."});
    return cloneMemoryFact(candidate);
  };

  private async decodeFactsAndQuarantine(rows:readonly unknown[],reason:string):Promise<MemoryFact[]>{
    const good:MemoryFact[]=[];
    const corrupt:Array<{id:string;reason:string;at:number}>=[];
    for(const raw of rows){
      try{good.push(this.decodeFact(raw));}
      catch{
        const id=raw&&typeof raw==="object"&&typeof (raw as {id?:unknown}).id==="string"
          ? (raw as {id:string}).id
          : "";
        if(id.trim())corrupt.push({id,reason,at:Date.now()});
      }
    }
    if(corrupt.length>0)await this.quarantineCorruptFacts(corrupt);
    return good;
  }

  private async quarantineCorruptFacts(items:readonly {id:string;reason:string;at:number}[]):Promise<void>{
    const db=await this.open();
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction(["facts","quarantine"],"readwrite");
      const facts=tx.objectStore("facts"), quarantine=tx.objectStore("quarantine");
      for(const item of items){
        facts.delete(item.id);
        quarantine.put({
          id:`fact:${item.id}`,
          recordType:"fact",
          recordId:item.id,
          reason:item.reason,
          quarantinedAt:item.at,
        });
      }
      tx.oncomplete=()=>resolve();
      tx.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Memory corruption quarantine failed.",cause:tx.error}));
      tx.onabort=()=>reject(new SevenError({code:"STORAGE",message:"Memory corruption quarantine aborted.",cause:tx.error}));
    });
  }

  async close():Promise<void>{
    const pending=this.dbPromise;
    this.dbPromise=null;
    if(!pending)return;
    try{(await pending).close();}catch{}
  }

  private async getAllByIndex(storeName:string,indexName:string,key:string,signal?:AbortSignal):Promise<unknown[]>{
    throwIfAborted(signal);
    const db=await this.open();
    return new Promise<unknown[]>((resolve,reject)=>{
      const tx=db.transaction(storeName,"readonly"), store=tx.objectStore(storeName), request=store.index(indexName).getAll(key);
      const onAbort=()=>{try{tx.abort();}catch{}};
      signal?.addEventListener("abort",onAbort,{once:true});
      request.onsuccess=()=>resolve(request.result as unknown[]);
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Memory index read failed.",cause:request.error}));
      tx.oncomplete=()=>signal?.removeEventListener("abort",onAbort);
      tx.onabort=()=>reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Memory read aborted.",cause:tx.error}));
      if(signal?.aborted)onAbort();
    });
  }

  private open():Promise<IDBDatabase>{
    if(this.dbPromise)return this.dbPromise;
    this.dbPromise=new Promise<IDBDatabase>((resolve,reject)=>{
      if(typeof indexedDB==="undefined"){reject(new SevenError({code:"STORAGE",message:"IndexedDB is unavailable."}));return;}
      const request=indexedDB.open(this.databaseName,2);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains("facts")){
          const store=db.createObjectStore("facts",{keyPath:"id"});
          store.createIndex("scopeRoom","scopeRoom",{unique:false});
          store.createIndex("canonicalKey","canonicalKey",{unique:false});
        }
        if(!db.objectStoreNames.contains("events")){
          const store=db.createObjectStore("events",{keyPath:"id"});
          store.createIndex("factId","factId",{unique:false});
          store.createIndex("sourceRoomId","sourceRoomId",{unique:false});
        }
        if(!db.objectStoreNames.contains("quarantine")){
          const store=db.createObjectStore("quarantine",{keyPath:"id"});
          store.createIndex("recordType","recordType",{unique:false});
          store.createIndex("recordId","recordId",{unique:false});
        }
      };
      request.onsuccess=()=>{ const db=request.result; db.onversionchange=()=>{db.close();this.dbPromise=null;}; resolve(db); };
      request.onerror=()=>{this.dbPromise=null;reject(new SevenError({code:"STORAGE",message:"Failed to open Memory Fabric.",cause:request.error}));};
      request.onblocked=()=>{this.dbPromise=null;reject(new SevenError({code:"STORAGE",message:"Memory Fabric upgrade is blocked.",retryable:true}));};
    });
    return this.dbPromise;
  }
}

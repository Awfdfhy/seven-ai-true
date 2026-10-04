import { SevenError } from "../core/errors";
import { cloneMemoryFact, isMemoryFact, type MemoryFact, type MemoryWriteEvent } from "../domain/memory/fabric";

export interface MemoryFabricRepository {
  listForRoom(roomId: string, signal?: AbortSignal): Promise<readonly MemoryFact[]>;
  findActiveByCanonicalKey(scope: "global"|"room", roomId: string | null, canonicalKey: string, signal?: AbortSignal): Promise<readonly MemoryFact[]>;
  commit(facts: readonly MemoryFact[], events: readonly MemoryWriteEvent[], signal?: AbortSignal): Promise<void>;
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
  async listForRoom(roomId:string, signal?:AbortSignal):Promise<readonly MemoryFact[]> {
    throwIfAborted(signal); canonical(roomId,"roomId");
    return Object.freeze([...this.facts.values()].filter(f=>f.scope==="global" || f.roomId===roomId).map(cloneMemoryFact));
  }
  async findActiveByCanonicalKey(scope:"global"|"room",roomId:string|null,key:string,signal?:AbortSignal):Promise<readonly MemoryFact[]> {
    throwIfAborted(signal); canonical(key,"canonicalKey");
    return Object.freeze([...this.facts.values()].filter(f=>f.status==="active" && f.scope===scope && f.roomId===roomId && f.canonicalKey===key).map(cloneMemoryFact));
  }
  async commit(facts:readonly MemoryFact[],events:readonly MemoryWriteEvent[],signal?:AbortSignal):Promise<void>{
    throwIfAborted(signal);
    for(const fact of facts){ if(!isMemoryFact(fact)) throw new SevenError({code:"VALIDATION",message:"Invalid memory fact."}); }
    for(const fact of facts)this.facts.set(fact.id,cloneMemoryFact(fact));
    this.events.push(...events.map(e=>Object.freeze({...e})));
    throwIfAborted(signal);
  }
}

export class IndexedDbMemoryFabricRepository implements MemoryFabricRepository {
  private dbPromise:Promise<IDBDatabase>|null=null;
  constructor(private readonly databaseName="seven_remake_memory_fabric_v2") {}

  async listForRoom(roomId:string, signal?:AbortSignal):Promise<readonly MemoryFact[]>{
    throwIfAborted(signal); canonical(roomId,"roomId");
    const global=await this.getAllByIndex("facts","scopeRoom","global",signal);
    const room=await this.getAllByIndex("facts","scopeRoom",`room:${roomId}`,signal);
    const decoded=[...global,...room].map(this.decodeFact);
    return Object.freeze(decoded);
  }

  async findActiveByCanonicalKey(scope:"global"|"room",roomId:string|null,key:string,signal?:AbortSignal):Promise<readonly MemoryFact[]>{
    throwIfAborted(signal); canonical(key,"canonicalKey");
    const rows=await this.getAllByIndex("facts","canonicalKey",key,signal);
    return Object.freeze(rows.map(this.decodeFact).filter(f=>f.status==="active" && f.scope===scope && f.roomId===roomId));
  }

  async commit(facts:readonly MemoryFact[],events:readonly MemoryWriteEvent[],signal?:AbortSignal):Promise<void>{
    throwIfAborted(signal);
    for(const fact of facts) if(!isMemoryFact(fact)) throw new SevenError({code:"VALIDATION",message:"Invalid memory fact."});
    const db=await this.open();
    await new Promise<void>((resolve,reject)=>{
      let tx:IDBTransaction;
      try{ tx=db.transaction(["facts","events"],"readwrite"); }catch(error){ reject(new SevenError({code:"STORAGE",message:"Could not start memory transaction.",cause:error})); return; }
      const onAbort=()=>{ try{tx.abort();}catch{} };
      signal?.addEventListener("abort",onAbort,{once:true});
      tx.oncomplete=()=>{ signal?.removeEventListener("abort",onAbort); resolve(); };
      tx.onerror=()=>{ signal?.removeEventListener("abort",onAbort); reject(new SevenError({code:"STORAGE",message:"Memory transaction failed.",cause:tx.error})); };
      tx.onabort=()=>{ signal?.removeEventListener("abort",onAbort); reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Memory transaction aborted.",cause:tx.error})); };
      const fs=tx.objectStore("facts"), es=tx.objectStore("events");
      for(const fact of facts) fs.put({...fact,scopeRoom:scopeRoom(fact)} satisfies StoredFact);
      for(const event of events) es.put(event);
      if(signal?.aborted) onAbort();
    });
  }

  private decodeFact=(raw:unknown):MemoryFact=>{
    if(!raw || typeof raw!=="object") throw new SevenError({code:"STORAGE",message:"Stored memory fact is malformed."});
    const {scopeRoom:_scopeRoom,...candidate}=raw as StoredFact;
    if(!isMemoryFact(candidate)) throw new SevenError({code:"STORAGE",message:"Stored memory fact failed schema validation."});
    return cloneMemoryFact(candidate);
  };

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
      const request=indexedDB.open(this.databaseName,1);
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
      };
      request.onsuccess=()=>{ const db=request.result; db.onversionchange=()=>{db.close();this.dbPromise=null;}; resolve(db); };
      request.onerror=()=>{this.dbPromise=null;reject(new SevenError({code:"STORAGE",message:"Failed to open Memory Fabric.",cause:request.error}));};
      request.onblocked=()=>{this.dbPromise=null;reject(new SevenError({code:"STORAGE",message:"Memory Fabric upgrade is blocked.",retryable:true}));};
    });
    return this.dbPromise;
  }
}

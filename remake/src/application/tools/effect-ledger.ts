import { SevenError } from "../../core/errors";
import type { ToolResult } from "./contracts";

export type ToolLedgerState = "prepared" | "effect_started" | "finished";

export type ToolLedgerEntry = Readonly<{
  idempotencyKey: string;
  fingerprint: string;
  callId: string;
  toolId: string;
  roomId: string;
  taskId: string;
  state: ToolLedgerState;
  preparedAt: number;
  effectStartedAt?: number;
  completedAt?: number;
  result?: ToolResult;
}>;

export interface ToolEffectLedger {
  get(idempotencyKey:string):Promise<ToolLedgerEntry|undefined>;
  prepare(entry:ToolLedgerEntry):Promise<void>;
  markEffectStarted(idempotencyKey:string,fingerprint:string,at:number):Promise<void>;
  complete(idempotencyKey:string,fingerprint:string,result:ToolResult):Promise<void>;
}

function canonical(value:unknown,field:string):string{
  if(typeof value!=="string"||!value.trim()||value!==value.trim()){
    throw new SevenError({code:"VALIDATION",message:`${field} is invalid.`});
  }
  return value;
}
function timestamp(value:unknown,field:string):number{
  if(typeof value!=="number"||!Number.isFinite(value)||value<0){
    throw new SevenError({code:"VALIDATION",message:`${field} is invalid.`});
  }
  return value;
}
function cloneResult(result:ToolResult):ToolResult{
  return Object.freeze({
    ...result,
    ...(result.output!==undefined?{output:structuredClone(result.output)}:{}),
  });
}
function cloneEntry(entry:ToolLedgerEntry):ToolLedgerEntry{
  return Object.freeze({
    ...entry,
    ...(entry.result?{result:cloneResult(entry.result)}:{}),
  });
}
function validatePrepared(entry:ToolLedgerEntry):void{
  canonical(entry.idempotencyKey,"Tool ledger idempotencyKey");
  canonical(entry.fingerprint,"Tool ledger fingerprint");
  canonical(entry.callId,"Tool ledger callId");
  canonical(entry.toolId,"Tool ledger toolId");
  canonical(entry.roomId,"Tool ledger roomId");
  canonical(entry.taskId,"Tool ledger taskId");
  timestamp(entry.preparedAt,"Tool ledger preparedAt");
  if(entry.state!=="prepared"){
    throw new SevenError({code:"VALIDATION",message:"New tool ledger entry must be prepared."});
  }
  if(entry.result!==undefined||entry.effectStartedAt!==undefined||entry.completedAt!==undefined){
    throw new SevenError({code:"VALIDATION",message:"Prepared tool ledger entry contains terminal fields."});
  }
}

export class InMemoryToolEffectLedger implements ToolEffectLedger {
  private readonly entries=new Map<string,ToolLedgerEntry>();
  constructor(private readonly maxEntries=2048){
    if(!Number.isSafeInteger(maxEntries)||maxEntries<1||maxEntries>20_000){
      throw new SevenError({code:"VALIDATION",message:"Tool ledger capacity is invalid."});
    }
  }

  async get(key:string):Promise<ToolLedgerEntry|undefined>{
    const entry=this.entries.get(canonical(key,"Tool ledger idempotencyKey"));
    return entry?cloneEntry(entry):undefined;
  }

  async prepare(entry:ToolLedgerEntry):Promise<void>{
    validatePrepared(entry);
    const prior=this.entries.get(entry.idempotencyKey);
    if(prior){
      if(prior.fingerprint!==entry.fingerprint){
        throw new SevenError({code:"VALIDATION",message:"Idempotency key already belongs to another invocation."});
      }
      return;
    }
    if(this.entries.size>=this.maxEntries){
      throw new SevenError({code:"STORAGE",message:"Tool effect ledger capacity reached."});
    }
    this.entries.set(entry.idempotencyKey,cloneEntry(entry));
  }

  async markEffectStarted(key:string,fingerprint:string,at:number):Promise<void>{
    const id=canonical(key,"Tool ledger idempotencyKey");
    const fp=canonical(fingerprint,"Tool ledger fingerprint");
    const time=timestamp(at,"Tool effect timestamp");
    const entry=this.entries.get(id);
    if(!entry||entry.fingerprint!==fp){
      throw new SevenError({code:"STORAGE",message:"Tool effect ledger entry is missing or mismatched."});
    }
    if(entry.state==="finished")return;
    if(entry.state==="effect_started")return;
    this.entries.set(id,Object.freeze({...entry,state:"effect_started" as const,effectStartedAt:time}));
  }

  async complete(key:string,fingerprint:string,result:ToolResult):Promise<void>{
    const id=canonical(key,"Tool ledger idempotencyKey");
    const fp=canonical(fingerprint,"Tool ledger fingerprint");
    const entry=this.entries.get(id);
    if(!entry||entry.fingerprint!==fp){
      throw new SevenError({code:"STORAGE",message:"Tool effect ledger entry is missing or mismatched."});
    }
    if(entry.state==="finished")return;
    this.entries.set(id,Object.freeze({
      ...entry,
      state:"finished" as const,
      ...(entry.effectStartedAt!==undefined?{effectStartedAt:entry.effectStartedAt}:{}),
      completedAt:result.completedAt,
      result:cloneResult(result),
    }));
  }
}

export class IndexedDbToolEffectLedger implements ToolEffectLedger {
  private dbPromise:Promise<IDBDatabase>|null=null;
  constructor(
    private readonly databaseName="seven_remake_tool_effect_ledger_v1",
    private readonly maxEntries=2048,
  ){
    if(!Number.isSafeInteger(maxEntries)||maxEntries<1||maxEntries>20_000){
      throw new SevenError({code:"VALIDATION",message:"Tool ledger capacity is invalid."});
    }
  }

  async get(key:string):Promise<ToolLedgerEntry|undefined>{
    const id=canonical(key,"Tool ledger idempotencyKey");
    const db=await this.open();
    const raw=await new Promise<unknown>((resolve,reject)=>{
      const tx=db.transaction("entries","readonly");
      const request=tx.objectStore("entries").get(id);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Tool ledger read failed.",cause:request.error}));
    });
    if(raw===undefined)return undefined;
    return this.decode(raw);
  }

  async prepare(entry:ToolLedgerEntry):Promise<void>{
    validatePrepared(entry);
    const db=await this.open();
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction("entries","readwrite");
      const store=tx.objectStore("entries");
      let failure:unknown=null;
      const fail=(error:unknown)=>{if(failure)return;failure=error;try{tx.abort();}catch{}};
      const existing=store.get(entry.idempotencyKey);
      existing.onsuccess=()=>{
        if(existing.result!==undefined){
          const prior=this.decode(existing.result);
          if(prior.fingerprint!==entry.fingerprint){
            fail(new SevenError({code:"VALIDATION",message:"Idempotency key already belongs to another invocation."}));
          }
          return;
        }
        const count=store.count();
        count.onsuccess=()=>{
          if(count.result>=this.maxEntries){
            fail(new SevenError({code:"STORAGE",message:"Tool effect ledger capacity reached."}));
            return;
          }
          store.put(entry);
        };
        count.onerror=()=>fail(new SevenError({code:"STORAGE",message:"Tool ledger count failed.",cause:count.error}));
      };
      existing.onerror=()=>fail(new SevenError({code:"STORAGE",message:"Tool ledger lookup failed.",cause:existing.error}));
      tx.oncomplete=()=>failure?reject(failure):resolve();
      tx.onerror=()=>{if(!failure)failure=new SevenError({code:"STORAGE",message:"Tool ledger prepare failed.",cause:tx.error});};
      tx.onabort=()=>reject(failure??new SevenError({code:"STORAGE",message:"Tool ledger prepare aborted.",cause:tx.error}));
    });
  }

  async markEffectStarted(key:string,fingerprint:string,at:number):Promise<void>{
    const id=canonical(key,"Tool ledger idempotencyKey");
    const fp=canonical(fingerprint,"Tool ledger fingerprint");
    const time=timestamp(at,"Tool effect timestamp");
    await this.mutate(id,fp,(entry)=>{
      if(entry.state==="finished"||entry.state==="effect_started")return entry;
      return Object.freeze({...entry,state:"effect_started" as const,effectStartedAt:time});
    });
  }

  async complete(key:string,fingerprint:string,result:ToolResult):Promise<void>{
    const id=canonical(key,"Tool ledger idempotencyKey");
    const fp=canonical(fingerprint,"Tool ledger fingerprint");
    await this.mutate(id,fp,(entry)=>{
      if(entry.state==="finished")return entry;
      return Object.freeze({
        ...entry,
        state:"finished" as const,
        completedAt:result.completedAt,
        result:cloneResult(result),
      });
    });
  }

  async close():Promise<void>{
    const pending=this.dbPromise;
    this.dbPromise=null;
    if(!pending)return;
    try{(await pending).close();}catch{}
  }

  private async mutate(
    id:string,
    fingerprint:string,
    updater:(entry:ToolLedgerEntry)=>ToolLedgerEntry,
  ):Promise<void>{
    const db=await this.open();
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction("entries","readwrite");
      const store=tx.objectStore("entries");
      const request=store.get(id);
      let failure:unknown=null;
      request.onsuccess=()=>{
        if(request.result===undefined){
          failure=new SevenError({code:"STORAGE",message:"Tool effect ledger entry is missing."});
          try{tx.abort();}catch{}
          return;
        }
        const entry=this.decode(request.result);
        if(entry.fingerprint!==fingerprint){
          failure=new SevenError({code:"STORAGE",message:"Tool effect ledger fingerprint mismatch."});
          try{tx.abort();}catch{}
          return;
        }
        store.put(updater(entry));
      };
      request.onerror=()=>{
        failure=new SevenError({code:"STORAGE",message:"Tool ledger update read failed.",cause:request.error});
        try{tx.abort();}catch{}
      };
      tx.oncomplete=()=>failure?reject(failure):resolve();
      tx.onerror=()=>{if(!failure)failure=new SevenError({code:"STORAGE",message:"Tool ledger update failed.",cause:tx.error});};
      tx.onabort=()=>reject(failure??new SevenError({code:"STORAGE",message:"Tool ledger update aborted.",cause:tx.error}));
    });
  }

  private decode(raw:unknown):ToolLedgerEntry{
    if(!raw||typeof raw!=="object"||Array.isArray(raw)){
      throw new SevenError({code:"STORAGE",message:"Stored tool ledger entry is malformed."});
    }
    const entry=raw as ToolLedgerEntry;
    canonical(entry.idempotencyKey,"Stored tool idempotencyKey");
    canonical(entry.fingerprint,"Stored tool fingerprint");
    canonical(entry.callId,"Stored tool callId");
    canonical(entry.toolId,"Stored tool toolId");
    canonical(entry.roomId,"Stored tool roomId");
    canonical(entry.taskId,"Stored tool taskId");
    timestamp(entry.preparedAt,"Stored tool preparedAt");
    if(!["prepared","effect_started","finished"].includes(entry.state)){
      throw new SevenError({code:"STORAGE",message:"Stored tool ledger state is invalid."});
    }
    if(entry.state==="effect_started"&&entry.effectStartedAt===undefined){
      throw new SevenError({code:"STORAGE",message:"Stored effect-started entry lacks timestamp."});
    }
    if(entry.state==="finished"&&(!entry.result||entry.completedAt===undefined)){
      throw new SevenError({code:"STORAGE",message:"Stored finished entry lacks result."});
    }
    return cloneEntry(entry);
  }

  private open():Promise<IDBDatabase>{
    if(this.dbPromise)return this.dbPromise;
    this.dbPromise=new Promise<IDBDatabase>((resolve,reject)=>{
      if(typeof indexedDB==="undefined"){
        reject(new SevenError({code:"STORAGE",message:"IndexedDB is unavailable for tool ledger."}));
        return;
      }
      const request=indexedDB.open(this.databaseName,1);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains("entries")){
          const store=db.createObjectStore("entries",{keyPath:"idempotencyKey"});
          store.createIndex("fingerprint","fingerprint",{unique:false});
          store.createIndex("state","state",{unique:false});
          store.createIndex("toolId","toolId",{unique:false});
        }
      };
      request.onsuccess=()=>{
        const db=request.result;
        db.onversionchange=()=>{db.close();this.dbPromise=null;};
        resolve(db);
      };
      request.onerror=()=>{this.dbPromise=null;reject(new SevenError({code:"STORAGE",message:"Failed to open tool effect ledger.",cause:request.error}));};
      request.onblocked=()=>{this.dbPromise=null;reject(new SevenError({code:"STORAGE",message:"Tool effect ledger upgrade is blocked.",retryable:true}));};
    });
    return this.dbPromise;
  }
}

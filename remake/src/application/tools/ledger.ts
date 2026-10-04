import { SevenError } from "../../core/errors";
import type { ToolResult } from "./contracts";

export type ToolReplayRecord = Readonly<{
  schemaVersion: 1;
  idempotencyKey: string;
  invocationFingerprint: string;
  state: "reserved" | "completed";
  reservedAt: number;
  completedAt?: number;
  result?: ToolResult;
}>;

export interface ToolExecutionLedger {
  getReplay(idempotencyKey:string,signal?:AbortSignal):Promise<ToolReplayRecord|undefined>;
  reserveReplay(
    idempotencyKey:string,
    invocationFingerprint:string,
    reservedAt:number,
    signal?:AbortSignal,
  ):Promise<Readonly<{claimed:boolean;record:ToolReplayRecord}>>;
  completeReplay(
    idempotencyKey:string,
    invocationFingerprint:string,
    result:ToolResult,
    persistOutput:boolean,
    signal?:AbortSignal,
  ):Promise<void>;
  consumeApproval(
    approvalId:string,
    invocationFingerprint:string,
    consumedAt:number,
    signal?:AbortSignal,
  ):Promise<boolean>;
}

function canonical(value:unknown,field:string):string{
  if(typeof value!=="string"||!value.trim()||value!==value.trim()||value.length>256){
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
function cloneResult(result:ToolResult,persistOutput=true):ToolResult{
  return Object.freeze({
    callId:result.callId,
    toolId:result.toolId,
    status:result.status,
    ...(persistOutput&&result.output!==undefined?{output:structuredClone(result.output)}:{}),
    ...(result.errorCode!==undefined?{errorCode:result.errorCode}:{}),
    retryable:result.retryable,
    effectStarted:result.effectStarted,
    startedAt:result.startedAt,
    completedAt:result.completedAt,
    invocationFingerprint:result.invocationFingerprint,
  });
}
function cloneRecord(record:ToolReplayRecord):ToolReplayRecord{
  return Object.freeze({
    ...record,
    ...(record.result?{result:cloneResult(record.result,true)}:{}),
  });
}
function abortError():DOMException{return new DOMException("Aborted","AbortError");}
function throwIfAborted(signal?:AbortSignal):void{if(signal?.aborted)throw abortError();}

export class InMemoryToolExecutionLedger implements ToolExecutionLedger {
  private readonly replay=new Map<string,ToolReplayRecord>();
  private readonly approvals=new Map<string,string>();

  async getReplay(key:string,signal?:AbortSignal):Promise<ToolReplayRecord|undefined>{
    throwIfAborted(signal);
    const value=this.replay.get(canonical(key,"idempotencyKey"));
    return value?cloneRecord(value):undefined;
  }

  async reserveReplay(key:string,fingerprint:string,reservedAt:number,signal?:AbortSignal){
    throwIfAborted(signal);
    const idempotencyKey=canonical(key,"idempotencyKey");
    const invocationFingerprint=canonical(fingerprint,"invocationFingerprint");
    timestamp(reservedAt,"reservedAt");
    const existing=this.replay.get(idempotencyKey);
    if(existing)return Object.freeze({claimed:false,record:cloneRecord(existing)});
    const record=Object.freeze({
      schemaVersion:1 as const,idempotencyKey,invocationFingerprint,
      state:"reserved" as const,reservedAt,
    });
    this.replay.set(idempotencyKey,record);
    return Object.freeze({claimed:true,record:cloneRecord(record)});
  }

  async completeReplay(
    key:string,
    fingerprint:string,
    result:ToolResult,
    persistOutput:boolean,
    signal?:AbortSignal,
  ):Promise<void>{
    throwIfAborted(signal);
    const idempotencyKey=canonical(key,"idempotencyKey");
    const invocationFingerprint=canonical(fingerprint,"invocationFingerprint");
    const existing=this.replay.get(idempotencyKey);
    if(!existing||existing.invocationFingerprint!==invocationFingerprint){
      throw new SevenError({code:"TOOL",message:"Replay completion does not match its reservation."});
    }
    const stored=cloneResult(result,persistOutput);
    this.replay.set(idempotencyKey,Object.freeze({
      schemaVersion:1 as const,idempotencyKey,invocationFingerprint,
      state:"completed" as const,reservedAt:existing.reservedAt,
      completedAt:result.completedAt,result:stored,
    }));
  }

  async consumeApproval(
    approvalId:string,
    fingerprint:string,
    consumedAt:number,
    signal?:AbortSignal,
  ):Promise<boolean>{
    throwIfAborted(signal);
    const id=canonical(approvalId,"approvalId");
    const fp=canonical(fingerprint,"invocationFingerprint");
    timestamp(consumedAt,"consumedAt");
    const existing=this.approvals.get(id);
    if(existing!==undefined)return existing===fp ? false : false;
    this.approvals.set(id,fp);
    return true;
  }
}

type StoredReplay = ToolReplayRecord;
type StoredApproval = Readonly<{
  approvalId:string;
  invocationFingerprint:string;
  consumedAt:number;
}>;

export class IndexedDbToolExecutionLedger implements ToolExecutionLedger {
  private dbPromise:Promise<IDBDatabase>|null=null;

  constructor(private readonly databaseName="seven_remake_tool_ledger_v1"){}

  async getReplay(key:string,signal?:AbortSignal):Promise<ToolReplayRecord|undefined>{
    throwIfAborted(signal);
    const idempotencyKey=canonical(key,"idempotencyKey");
    const db=await this.open();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction("replay","readonly");
      const request=tx.objectStore("replay").get(idempotencyKey);
      const onAbort=()=>{try{tx.abort();}catch{}};
      signal?.addEventListener("abort",onAbort,{once:true});
      request.onsuccess=()=>{
        const value=request.result as StoredReplay|undefined;
        resolve(value?cloneRecord(value):undefined);
      };
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Tool replay read failed.",cause:request.error}));
      tx.oncomplete=()=>signal?.removeEventListener("abort",onAbort);
      tx.onabort=()=>reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Tool replay read aborted.",cause:tx.error}));
      if(signal?.aborted)onAbort();
    });
  }

  async reserveReplay(key:string,fingerprint:string,reservedAt:number,signal?:AbortSignal){
    throwIfAborted(signal);
    const idempotencyKey=canonical(key,"idempotencyKey");
    const invocationFingerprint=canonical(fingerprint,"invocationFingerprint");
    timestamp(reservedAt,"reservedAt");
    const db=await this.open();
    return new Promise<Readonly<{claimed:boolean;record:ToolReplayRecord}>>((resolve,reject)=>{
      const tx=db.transaction("replay","readwrite");
      const store=tx.objectStore("replay");
      let outcome:Readonly<{claimed:boolean;record:ToolReplayRecord}>|undefined;
      const request=store.get(idempotencyKey);
      const onAbort=()=>{try{tx.abort();}catch{}};
      signal?.addEventListener("abort",onAbort,{once:true});
      request.onsuccess=()=>{
        const existing=request.result as StoredReplay|undefined;
        if(existing){
          outcome=Object.freeze({claimed:false,record:cloneRecord(existing)});
          return;
        }
        const record=Object.freeze({
          schemaVersion:1 as const,idempotencyKey,invocationFingerprint,
          state:"reserved" as const,reservedAt,
        });
        store.add(record);
        outcome=Object.freeze({claimed:true,record:cloneRecord(record)});
      };
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Tool replay reservation read failed.",cause:request.error}));
      tx.oncomplete=()=>{
        signal?.removeEventListener("abort",onAbort);
        if(!outcome){reject(new SevenError({code:"STORAGE",message:"Tool replay reservation produced no result."}));return;}
        resolve(outcome);
      };
      tx.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Tool replay reservation failed.",cause:tx.error}));
      tx.onabort=()=>reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Tool replay reservation aborted.",cause:tx.error}));
      if(signal?.aborted)onAbort();
    });
  }

  async completeReplay(
    key:string,
    fingerprint:string,
    result:ToolResult,
    persistOutput:boolean,
    signal?:AbortSignal,
  ):Promise<void>{
    throwIfAborted(signal);
    const idempotencyKey=canonical(key,"idempotencyKey");
    const invocationFingerprint=canonical(fingerprint,"invocationFingerprint");
    const db=await this.open();
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction("replay","readwrite");
      const store=tx.objectStore("replay");
      const request=store.get(idempotencyKey);
      const onAbort=()=>{try{tx.abort();}catch{}};
      signal?.addEventListener("abort",onAbort,{once:true});
      request.onsuccess=()=>{
        const existing=request.result as StoredReplay|undefined;
        if(!existing||existing.invocationFingerprint!==invocationFingerprint){
          try{tx.abort();}catch{}
          return;
        }
        store.put(Object.freeze({
          schemaVersion:1 as const,idempotencyKey,invocationFingerprint,
          state:"completed" as const,reservedAt:existing.reservedAt,
          completedAt:result.completedAt,
          result:cloneResult(result,persistOutput),
        }));
      };
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Tool replay completion read failed.",cause:request.error}));
      tx.oncomplete=()=>{signal?.removeEventListener("abort",onAbort);resolve();};
      tx.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Tool replay completion failed.",cause:tx.error}));
      tx.onabort=()=>reject(signal?.aborted?abortError():new SevenError({code:"TOOL",message:"Replay completion does not match its reservation."}));
      if(signal?.aborted)onAbort();
    });
  }

  async consumeApproval(
    approvalId:string,
    fingerprint:string,
    consumedAt:number,
    signal?:AbortSignal,
  ):Promise<boolean>{
    throwIfAborted(signal);
    const id=canonical(approvalId,"approvalId");
    const fp=canonical(fingerprint,"invocationFingerprint");
    timestamp(consumedAt,"consumedAt");
    const db=await this.open();
    return new Promise<boolean>((resolve,reject)=>{
      const tx=db.transaction("approvals","readwrite");
      const store=tx.objectStore("approvals");
      const request=store.get(id);
      let consumed=false;
      const onAbort=()=>{try{tx.abort();}catch{}};
      signal?.addEventListener("abort",onAbort,{once:true});
      request.onsuccess=()=>{
        if(request.result){consumed=false;return;}
        const record:StoredApproval=Object.freeze({approvalId:id,invocationFingerprint:fp,consumedAt});
        store.add(record);consumed=true;
      };
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Approval ledger read failed.",cause:request.error}));
      tx.oncomplete=()=>{signal?.removeEventListener("abort",onAbort);resolve(consumed);};
      tx.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Approval ledger write failed.",cause:tx.error}));
      tx.onabort=()=>reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Approval ledger aborted.",cause:tx.error}));
      if(signal?.aborted)onAbort();
    });
  }

  async close():Promise<void>{
    const pending=this.dbPromise;this.dbPromise=null;
    if(!pending)return;
    try{(await pending).close();}catch{}
  }

  private open():Promise<IDBDatabase>{
    if(this.dbPromise)return this.dbPromise;
    this.dbPromise=new Promise((resolve,reject)=>{
      if(typeof indexedDB==="undefined"){
        reject(new SevenError({code:"STORAGE",message:"IndexedDB is unavailable."}));return;
      }
      const request=indexedDB.open(this.databaseName,1);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains("replay")){
          const store=db.createObjectStore("replay",{keyPath:"idempotencyKey"});
          store.createIndex("invocationFingerprint","invocationFingerprint",{unique:false});
          store.createIndex("state","state",{unique:false});
        }
        if(!db.objectStoreNames.contains("approvals")){
          db.createObjectStore("approvals",{keyPath:"approvalId"});
        }
      };
      request.onsuccess=()=>{
        const db=request.result;
        db.onversionchange=()=>{db.close();this.dbPromise=null;};
        resolve(db);
      };
      request.onerror=()=>{this.dbPromise=null;reject(new SevenError({code:"STORAGE",message:"Tool ledger open failed.",cause:request.error}));};
      request.onblocked=()=>{this.dbPromise=null;reject(new SevenError({code:"STORAGE",message:"Tool ledger upgrade blocked.",retryable:true}));};
    });
    return this.dbPromise;
  }
}

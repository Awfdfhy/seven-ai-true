import { SevenError } from "../core/errors";
import type { ToolResult } from "../application/tools/contracts";
import type {
  ToolExecutionLedger,
  ToolInvocationClaim,
  ToolReplayRecord,
} from "../application/tools/ledger";

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
    callId:result.callId,toolId:result.toolId,status:result.status,
    ...(persistOutput&&result.output!==undefined?{output:structuredClone(result.output)}:{}),
    ...(result.errorCode!==undefined?{errorCode:result.errorCode}:{}),
    retryable:result.retryable,effectStarted:result.effectStarted,
    startedAt:result.startedAt,completedAt:result.completedAt,
    invocationFingerprint:result.invocationFingerprint,
  });
}
function cloneRecord(record:ToolReplayRecord):ToolReplayRecord{
  return Object.freeze({...record,...(record.result?{result:cloneResult(record.result,true)}:{})});
}
function abortError():DOMException{return new DOMException("Aborted","AbortError");}
function throwIfAborted(signal?:AbortSignal):void{if(signal?.aborted)throw abortError();}

type StoredApproval=Readonly<{
  approvalId:string;
  invocationFingerprint:string;
  consumedAt:number;
}>;

export class IndexedDbToolExecutionLedger implements ToolExecutionLedger {
  private dbPromise:Promise<IDBDatabase>|null=null;
  constructor(private readonly databaseName="seven_remake_tool_ledger_v2"){}

  async getReplay(key:string,signal?:AbortSignal):Promise<ToolReplayRecord|undefined>{
    throwIfAborted(signal);
    const id=canonical(key,"idempotencyKey");
    const db=await this.open();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction("replay","readonly");
      const request=tx.objectStore("replay").get(id);
      const onAbort=()=>{try{tx.abort();}catch{}};
      signal?.addEventListener("abort",onAbort,{once:true});
      request.onsuccess=()=>resolve(request.result?this.decode(request.result):undefined);
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Tool replay read failed.",cause:request.error}));
      tx.oncomplete=()=>signal?.removeEventListener("abort",onAbort);
      tx.onabort=()=>reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Tool replay read aborted.",cause:tx.error}));
      if(signal?.aborted)onAbort();
    });
  }

  async claimInvocation(input:Readonly<{
    idempotencyKey:string;invocationFingerprint:string;ownerCallId:string;preparedAt:number;oneShotApprovalId?:string;
  }>,signal?:AbortSignal):Promise<ToolInvocationClaim>{
    throwIfAborted(signal);
    const key=canonical(input.idempotencyKey,"idempotencyKey");
    const fp=canonical(input.invocationFingerprint,"invocationFingerprint");
    const owner=canonical(input.ownerCallId,"ownerCallId");
    timestamp(input.preparedAt,"preparedAt");
    const approvalId=input.oneShotApprovalId?canonical(input.oneShotApprovalId,"approvalId"):undefined;
    const db=await this.open();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction(["replay","approvals"],"readwrite");
      const replay=tx.objectStore("replay");
      const approvals=tx.objectStore("approvals");
      let outcome:ToolInvocationClaim|undefined;
      let failed:unknown=null;
      const onAbort=()=>{try{tx.abort();}catch{}};
      signal?.addEventListener("abort",onAbort,{once:true});
      const existing=replay.get(key);
      existing.onsuccess=()=>{
        if(existing.result){
          outcome=Object.freeze({status:"existing" as const,record:this.decode(existing.result)});
          return;
        }
        const create=()=>{
          if(approvalId){
            approvals.add(Object.freeze({
              approvalId,invocationFingerprint:fp,consumedAt:input.preparedAt,
            }) satisfies StoredApproval);
          }
          const record=Object.freeze({
            schemaVersion:2 as const,idempotencyKey:key,invocationFingerprint:fp,
            ownerCallId:owner,state:"prepared" as const,preparedAt:input.preparedAt,
          });
          replay.add(record);
          outcome=Object.freeze({status:"claimed" as const,record:cloneRecord(record)});
        };
        if(!approvalId){create();return;}
        const approval=approvals.get(approvalId);
        approval.onsuccess=()=>{
          if(approval.result){
            outcome=Object.freeze({status:"approval_used" as const});
            return;
          }
          create();
        };
        approval.onerror=()=>{failed=new SevenError({code:"STORAGE",message:"Approval lookup failed.",cause:approval.error});try{tx.abort();}catch{}};
      };
      existing.onerror=()=>{failed=new SevenError({code:"STORAGE",message:"Replay claim lookup failed.",cause:existing.error});try{tx.abort();}catch{}};
      tx.oncomplete=()=>{
        signal?.removeEventListener("abort",onAbort);
        if(failed){reject(failed);return;}
        if(!outcome){reject(new SevenError({code:"STORAGE",message:"Tool invocation claim produced no outcome."}));return;}
        resolve(outcome);
      };
      tx.onerror=()=>{if(!failed)failed=new SevenError({code:"STORAGE",message:"Tool invocation claim failed.",cause:tx.error});};
      tx.onabort=()=>reject(signal?.aborted?abortError():(failed??new SevenError({code:"STORAGE",message:"Tool invocation claim aborted.",cause:tx.error})));
      if(signal?.aborted)onAbort();
    });
  }

  async takeoverPrepared(input:Readonly<{
    idempotencyKey:string;invocationFingerprint:string;ownerCallId:string;preparedAt:number;staleBefore:number;
  }>,signal?:AbortSignal):Promise<boolean>{
    throwIfAborted(signal);
    const key=canonical(input.idempotencyKey,"idempotencyKey");
    const fp=canonical(input.invocationFingerprint,"invocationFingerprint");
    const owner=canonical(input.ownerCallId,"ownerCallId");
    timestamp(input.preparedAt,"preparedAt");timestamp(input.staleBefore,"staleBefore");
    const db=await this.open();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction("replay","readwrite");
      const store=tx.objectStore("replay");
      let taken=false;
      const request=store.get(key);
      request.onsuccess=()=>{
        if(!request.result)return;
        const current=this.decode(request.result);
        if(current.invocationFingerprint!==fp||current.state!=="prepared"||current.preparedAt>input.staleBefore)return;
        store.put(Object.freeze({...current,ownerCallId:owner,preparedAt:input.preparedAt}));
        taken=true;
      };
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Prepared takeover lookup failed.",cause:request.error}));
      tx.oncomplete=()=>resolve(taken);
      tx.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Prepared takeover failed.",cause:tx.error}));
      tx.onabort=()=>reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Prepared takeover aborted.",cause:tx.error}));
    });
  }

  async markEffectStarted(
    key:string,fingerprint:string,ownerCallId:string,at:number,signal?:AbortSignal,
  ):Promise<void>{
    throwIfAborted(signal);
    const id=canonical(key,"idempotencyKey");
    const fp=canonical(fingerprint,"invocationFingerprint");
    const owner=canonical(ownerCallId,"ownerCallId");
    const time=timestamp(at,"effectStartedAt");
    await this.update(id,signal,(current)=>{
      if(current.invocationFingerprint!==fp||current.ownerCallId!==owner){
        throw new SevenError({code:"TOOL",message:"Effect start does not match its durable invocation lease."});
      }
      if(current.state==="completed"||current.state==="effect_started")return current;
      return Object.freeze({...current,state:"effect_started" as const,effectStartedAt:time});
    });
  }

  async releasePrepared(
    key:string,fingerprint:string,ownerCallId:string,signal?:AbortSignal,
  ):Promise<boolean>{
    throwIfAborted(signal);
    const id=canonical(key,"idempotencyKey");
    const fp=canonical(fingerprint,"invocationFingerprint");
    const owner=canonical(ownerCallId,"ownerCallId");
    const db=await this.open();
    return new Promise<boolean>((resolve,reject)=>{
      const tx=db.transaction("replay","readwrite");
      const store=tx.objectStore("replay");
      let released=false;
      const request=store.get(id);
      request.onsuccess=()=>{
        if(!request.result)return;
        const current=this.decode(request.result);
        if(current.invocationFingerprint!==fp||current.ownerCallId!==owner||current.state!=="prepared")return;
        store.delete(id);
        released=true;
      };
      request.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Prepared replay release lookup failed.",cause:request.error}));
      tx.oncomplete=()=>resolve(released);
      tx.onerror=()=>reject(new SevenError({code:"STORAGE",message:"Prepared replay release failed.",cause:tx.error}));
      tx.onabort=()=>reject(signal?.aborted?abortError():new SevenError({code:"STORAGE",message:"Prepared replay release aborted.",cause:tx.error}));
    });
  }

  async completeReplay(
    key:string,fingerprint:string,result:ToolResult,persistOutput:boolean,signal?:AbortSignal,
  ):Promise<void>{
    throwIfAborted(signal);
    const id=canonical(key,"idempotencyKey");
    const fp=canonical(fingerprint,"invocationFingerprint");
    await this.update(id,signal,(current)=>{
      if(current.invocationFingerprint!==fp){
        throw new SevenError({code:"TOOL",message:"Replay completion does not match its durable invocation."});
      }
      if(current.state==="completed")return current;
      return Object.freeze({
        ...current,state:"completed" as const,completedAt:result.completedAt,
        result:cloneResult(result,persistOutput),
      });
    });
  }

  async close():Promise<void>{
    const pending=this.dbPromise;this.dbPromise=null;
    if(!pending)return;
    try{(await pending).close();}catch{}
  }

  private async update(
    key:string,signal:AbortSignal|undefined,
    updater:(current:ToolReplayRecord)=>ToolReplayRecord,
  ):Promise<void>{
    const db=await this.open();
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction("replay","readwrite");
      const store=tx.objectStore("replay");
      let failure:unknown=null;
      const request=store.get(key);
      request.onsuccess=()=>{
        if(!request.result){failure=new SevenError({code:"STORAGE",message:"Tool replay record is missing."});try{tx.abort();}catch{};return;}
        try{store.put(updater(this.decode(request.result)));}catch(error){failure=error;try{tx.abort();}catch{}}
      };
      request.onerror=()=>{failure=new SevenError({code:"STORAGE",message:"Tool replay update read failed.",cause:request.error});try{tx.abort();}catch{}};
      tx.oncomplete=()=>failure?reject(failure):resolve();
      tx.onerror=()=>{if(!failure)failure=new SevenError({code:"STORAGE",message:"Tool replay update failed.",cause:tx.error});};
      tx.onabort=()=>reject(signal?.aborted?abortError():(failure??new SevenError({code:"STORAGE",message:"Tool replay update aborted.",cause:tx.error})));
    });
  }

  private decode(raw:unknown):ToolReplayRecord{
    if(!raw||typeof raw!=="object"||Array.isArray(raw)){
      throw new SevenError({code:"STORAGE",message:"Stored tool replay record is malformed."});
    }
    const record=raw as ToolReplayRecord;
    if(record.schemaVersion!==2)throw new SevenError({code:"STORAGE",message:"Stored tool replay schema is unsupported."});
    canonical(record.idempotencyKey,"stored idempotencyKey");
    canonical(record.invocationFingerprint,"stored invocationFingerprint");
    canonical(record.ownerCallId,"stored ownerCallId");
    timestamp(record.preparedAt,"stored preparedAt");
    if(!["prepared","effect_started","completed"].includes(record.state)){
      throw new SevenError({code:"STORAGE",message:"Stored replay state is invalid."});
    }
    if(record.state==="effect_started"&&record.effectStartedAt===undefined){
      throw new SevenError({code:"STORAGE",message:"Stored effect-started replay lacks timestamp."});
    }
    if(record.state==="completed"&&(!record.result||record.completedAt===undefined)){
      throw new SevenError({code:"STORAGE",message:"Stored completed replay lacks result."});
    }
    return cloneRecord(record);
  }

  private open():Promise<IDBDatabase>{
    if(this.dbPromise)return this.dbPromise;
    this.dbPromise=new Promise((resolve,reject)=>{
      if(typeof indexedDB==="undefined"){reject(new SevenError({code:"STORAGE",message:"IndexedDB is unavailable."}));return;}
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

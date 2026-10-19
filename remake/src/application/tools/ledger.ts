import { SevenError } from "../../core/errors";
import type { ToolResult } from "./contracts";

export const TOOL_PREPARED_LEASE_MS = 120_000;

export type ToolReplayRecord = Readonly<{
  schemaVersion: 2;
  idempotencyKey: string;
  invocationFingerprint: string;
  ownerCallId: string;
  state: "prepared" | "effect_started" | "completed";
  preparedAt: number;
  effectStartedAt?: number;
  completedAt?: number;
  result?: ToolResult;
}>;

export type ToolInvocationClaim = Readonly<
  | { status:"claimed"; record:ToolReplayRecord }
  | { status:"existing"; record:ToolReplayRecord }
  | { status:"approval_used"; record?:undefined }
>;

export interface ToolExecutionLedger {
  getReplay(idempotencyKey:string,signal?:AbortSignal):Promise<ToolReplayRecord|undefined>;
  claimInvocation(input:Readonly<{
    idempotencyKey:string;
    invocationFingerprint:string;
    ownerCallId:string;
    preparedAt:number;
    oneShotApprovalId?:string;
  }>,signal?:AbortSignal):Promise<ToolInvocationClaim>;
  takeoverPrepared(input:Readonly<{
    idempotencyKey:string;
    invocationFingerprint:string;
    ownerCallId:string;
    preparedAt:number;
    staleBefore:number;
  }>,signal?:AbortSignal):Promise<boolean>;
  markEffectStarted(
    idempotencyKey:string,
    invocationFingerprint:string,
    ownerCallId:string,
    at:number,
    signal?:AbortSignal,
  ):Promise<void>;
  releasePrepared(
    idempotencyKey:string,
    invocationFingerprint:string,
    ownerCallId:string,
    signal?:AbortSignal,
  ):Promise<boolean>;
  completeReplay(
    idempotencyKey:string,
    invocationFingerprint:string,
    result:ToolResult,
    persistOutput:boolean,
    signal?:AbortSignal,
  ):Promise<void>;
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

  async claimInvocation(input:Readonly<{
    idempotencyKey:string;invocationFingerprint:string;ownerCallId:string;preparedAt:number;oneShotApprovalId?:string;
  }>,signal?:AbortSignal):Promise<ToolInvocationClaim>{
    throwIfAborted(signal);
    const key=canonical(input.idempotencyKey,"idempotencyKey");
    const fp=canonical(input.invocationFingerprint,"invocationFingerprint");
    const owner=canonical(input.ownerCallId,"ownerCallId");
    timestamp(input.preparedAt,"preparedAt");
    const existing=this.replay.get(key);
    if(existing)return Object.freeze({status:"existing" as const,record:cloneRecord(existing)});
    if(input.oneShotApprovalId){
      const approval=canonical(input.oneShotApprovalId,"approvalId");
      if(this.approvals.has(approval))return Object.freeze({status:"approval_used" as const});
      this.approvals.set(approval,fp);
    }
    const record=Object.freeze({
      schemaVersion:2 as const,idempotencyKey:key,invocationFingerprint:fp,
      ownerCallId:owner,state:"prepared" as const,preparedAt:input.preparedAt,
    });
    this.replay.set(key,record);
    return Object.freeze({status:"claimed" as const,record:cloneRecord(record)});
  }

  async takeoverPrepared(input:Readonly<{
    idempotencyKey:string;invocationFingerprint:string;ownerCallId:string;preparedAt:number;staleBefore:number;
  }>,signal?:AbortSignal):Promise<boolean>{
    throwIfAborted(signal);
    const key=canonical(input.idempotencyKey,"idempotencyKey");
    const fp=canonical(input.invocationFingerprint,"invocationFingerprint");
    const owner=canonical(input.ownerCallId,"ownerCallId");
    timestamp(input.preparedAt,"preparedAt");timestamp(input.staleBefore,"staleBefore");
    const current=this.replay.get(key);
    if(!current||current.invocationFingerprint!==fp||current.state!=="prepared"||current.preparedAt>input.staleBefore){
      return false;
    }
    this.replay.set(key,Object.freeze({...current,ownerCallId:owner,preparedAt:input.preparedAt}));
    return true;
  }

  async markEffectStarted(
    key:string,fingerprint:string,ownerCallId:string,at:number,signal?:AbortSignal,
  ):Promise<void>{
    throwIfAborted(signal);
    const id=canonical(key,"idempotencyKey");
    const fp=canonical(fingerprint,"invocationFingerprint");
    const owner=canonical(ownerCallId,"ownerCallId");
    const time=timestamp(at,"effectStartedAt");
    const current=this.replay.get(id);
    if(!current||current.invocationFingerprint!==fp||current.ownerCallId!==owner){
      throw new SevenError({code:"TOOL",message:"Effect start does not match its durable invocation lease."});
    }
    if(current.state==="completed")return;
    if(current.state==="effect_started")return;
    this.replay.set(id,Object.freeze({...current,state:"effect_started" as const,effectStartedAt:time}));
  }

  async releasePrepared(
    key:string,fingerprint:string,ownerCallId:string,signal?:AbortSignal,
  ):Promise<boolean>{
    throwIfAborted(signal);
    const id=canonical(key,"idempotencyKey");
    const fp=canonical(fingerprint,"invocationFingerprint");
    const owner=canonical(ownerCallId,"ownerCallId");
    const current=this.replay.get(id);
    if(!current||current.invocationFingerprint!==fp||current.ownerCallId!==owner||current.state!=="prepared"){
      return false;
    }
    this.replay.delete(id);
    return true;
  }

  async completeReplay(
    key:string,fingerprint:string,result:ToolResult,persistOutput:boolean,signal?:AbortSignal,
  ):Promise<void>{
    throwIfAborted(signal);
    const id=canonical(key,"idempotencyKey");
    const fp=canonical(fingerprint,"invocationFingerprint");
    const current=this.replay.get(id);
    if(!current||current.invocationFingerprint!==fp){
      throw new SevenError({code:"TOOL",message:"Replay completion does not match its durable invocation."});
    }
    if(current.state==="completed")return;
    const stored=cloneResult(result,persistOutput);
    this.replay.set(id,Object.freeze({
      ...current,state:"completed" as const,completedAt:result.completedAt,result:stored,
    }));
  }
}

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

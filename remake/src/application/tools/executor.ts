import { SevenError, toSevenError } from "../../core/errors";
import { TaskManager } from "../../core/task-manager";
import { canonicalJson, invocationFingerprint } from "./canonical";
import {
  type ToolApproval,
  type ToolAuditEvent,
  type ToolAuditSink,
  type ToolExecutionRequest,
  type ToolGrant,
  type ToolInvocation,
  type ToolResult,
} from "./contracts";
import { ToolReferenceMonitor } from "./policy";
import { ToolRegistry } from "./registry";

type ReplayEntry = Readonly<{
  fingerprint:string;
  result:Promise<ToolResult>;
}>;

function nowMs():number{return Date.now();}

function resultBytes(value:unknown):number{
  return new TextEncoder().encode(canonicalJson(value)).byteLength;
}

export class ToolExecutor {
  private readonly replay=new Map<string,ReplayEntry>();
  private readonly activeGroups=new Set<string>();
  private readonly usedApprovals=new Set<string>();

  constructor(
    private readonly registry:ToolRegistry,
    private readonly tasks:TaskManager,
    private readonly monitor=new ToolReferenceMonitor(),
    private readonly audit?:ToolAuditSink,
    private readonly maxReplayEntries=256,
  ){
    if(!Number.isSafeInteger(maxReplayEntries)||maxReplayEntries<1||maxReplayEntries>4096){
      throw new SevenError({code:"VALIDATION",message:"Tool replay capacity is invalid."});
    }
  }

  execute(request:ToolExecutionRequest):Promise<ToolResult>{
    const invocation=this.validateInvocation(request.invocation);
    const definition=this.registry.require(invocation.toolId);

    return this.prepareAndRun(definition,invocation,request.grants,request.approval);
  }

  private async prepareAndRun(
    definition:ReturnType<ToolRegistry["require"]>,
    invocation:ToolInvocation,
    grants:readonly ToolGrant[],
    approval:ToolApproval|undefined,
  ):Promise<ToolResult>{
    const parsed=definition.inputSchema.safeParse(invocation.args);
    if(!parsed.success){
      return this.finishedResult({
        invocation,
        fingerprint:await invocationFingerprint({
          toolId:definition.id,version:definition.version,
          roomId:invocation.roomId,taskId:invocation.taskId,args:invocation.args,
        }),
        status:"invalid",
        retryable:false,
        effectStarted:false,
        startedAt:nowMs(),
        errorCode:"INVALID_ARGUMENTS",
      });
    }

    const fingerprint=await invocationFingerprint({
      toolId:definition.id,version:definition.version,
      roomId:invocation.roomId,taskId:invocation.taskId,args:parsed.data,
    });

    const replayKey=invocation.idempotencyKey;
    const prior=this.replay.get(replayKey);
    if(prior){
      if(prior.fingerprint!==fingerprint){
        return this.finishedResult({
          invocation,fingerprint,status:"invalid",retryable:false,effectStarted:false,
          startedAt:nowMs(),errorCode:"IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_INVOCATION",
        });
      }
      return prior.result;
    }

    try{
      this.monitor.authorize({
        definition,invocation,invocationFingerprint:fingerprint,
        grants,approval,now:invocation.requestedAt,
      });
      if(approval?.oneShot){
        if(this.usedApprovals.has(approval.approvalId)){
          throw new SevenError({code:"PERMISSION",message:"One-shot tool approval was already used."});
        }
        this.usedApprovals.add(approval.approvalId);
      }
    }catch(error){
      const normalized=toSevenError(error);
      return this.finishedResult({
        invocation,fingerprint,status:"denied",retryable:false,effectStarted:false,
        startedAt:nowMs(),errorCode:normalized.code,
      });
    }

    const promise=this.runHandler(definition,invocation,parsed.data,fingerprint);
    this.replay.set(replayKey,Object.freeze({fingerprint,result:promise}));
    while(this.replay.size>this.maxReplayEntries){
      const oldest=this.replay.keys().next().value as string|undefined;
      if(oldest)this.replay.delete(oldest); else break;
    }
    return promise;
  }

  private async runHandler(
    definition:ReturnType<ToolRegistry["require"]>,
    invocation:ToolInvocation,
    parsedInput:unknown,
    fingerprint:string,
  ):Promise<ToolResult>{
    const startedAt=nowMs();
    let effectStarted=false;
    const group=definition.concurrencyGroup;
    if(group&&this.activeGroups.has(group)){
      return this.finishedResult({
        invocation,fingerprint,status:"failed",retryable:true,effectStarted:false,
        startedAt,errorCode:"CONCURRENCY_GROUP_BUSY",
      });
    }
    if(group)this.activeGroups.add(group);
    try{
      const run=this.tasks.run({
        kind:"system",
        ownerId:`tool:${invocation.callId}`,
        timeoutMs:definition.timeoutMs,
      },async({signal})=>{
        const output=await definition.handler({
          callId:invocation.callId,
          roomId:invocation.roomId,
          taskId:invocation.taskId,
          signal,
          markEffectStarted:()=>{effectStarted=true;},
        },parsedInput);
        const validated=definition.outputSchema.safeParse(output);
        if(!validated.success){
          throw new SevenError({code:"TOOL",message:"Tool output failed its schema."});
        }
        if(resultBytes(validated.data)>definition.maxResultBytes){
          throw new SevenError({code:"TOOL",message:"Tool result exceeded its bounded size."});
        }
        return validated.data;
      });

      try{
        const output=await run.result;
        return this.finishedResult({
          invocation,fingerprint,status:"succeeded",retryable:false,effectStarted,
          startedAt,output,
        });
      }catch(error){
        const normalized=toSevenError(error);
        const cancelled=normalized.code==="CANCELLED"||normalized.code==="DEADLINE_EXCEEDED";
        return this.finishedResult({
          invocation,fingerprint,
          status:cancelled?(effectStarted?"effect_unknown":"cancelled"):(effectStarted?"effect_unknown":"failed"),
          retryable:!effectStarted&&normalized.retryable,
          effectStarted,startedAt,errorCode:normalized.code,
        });
      }
    }finally{
      if(group)this.activeGroups.delete(group);
    }
  }

  private validateInvocation(invocation:ToolInvocation):ToolInvocation{
    if(!invocation||typeof invocation!=="object"){
      throw new SevenError({code:"VALIDATION",message:"Tool invocation is invalid."});
    }
    for(const field of ["callId","taskId","roomId","toolId","idempotencyKey"] as const){
      const value=invocation[field];
      if(typeof value!=="string"||!value.trim()||value!==value.trim()){
        throw new SevenError({code:"VALIDATION",message:`Tool invocation ${field} is invalid.`});
      }
    }
    if(!Number.isFinite(invocation.requestedAt)||invocation.requestedAt<0){
      throw new SevenError({code:"VALIDATION",message:"Tool invocation timestamp is invalid."});
    }
    return Object.freeze({...invocation});
  }

  private async finishedResult(input:{
    invocation:ToolInvocation;
    fingerprint:string;
    status:ToolResult["status"];
    retryable:boolean;
    effectStarted:boolean;
    startedAt:number;
    errorCode?:string;
    output?:unknown;
  }):Promise<ToolResult>{
    const result=Object.freeze({
      callId:input.invocation.callId,
      toolId:input.invocation.toolId,
      status:input.status,
      ...(input.output!==undefined?{output:input.output}:{}),
      ...(input.errorCode?{errorCode:input.errorCode}:{}),
      retryable:input.retryable,
      effectStarted:input.effectStarted,
      startedAt:input.startedAt,
      completedAt:Math.max(input.startedAt,nowMs()),
      invocationFingerprint:input.fingerprint,
    });
    try{
      const event:ToolAuditEvent=Object.freeze({
        callId:result.callId,toolId:result.toolId,
        roomId:input.invocation.roomId,taskId:input.invocation.taskId,
        status:result.status,invocationFingerprint:result.invocationFingerprint,
        effectStarted:result.effectStarted,startedAt:result.startedAt,completedAt:result.completedAt,
      });
      await this.audit?.record(event);
    }catch{
      // Audit observers cannot corrupt tool execution.
    }
    return result;
  }
}

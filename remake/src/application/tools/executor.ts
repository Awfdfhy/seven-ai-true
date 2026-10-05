import { SevenError, toSevenError } from "../../core/errors";
import { TaskManager } from "../../core/task-manager";
import { canonicalJson, invocationFingerprint } from "./canonical";
import {
  type ToolApproval,
  type ToolAuditEvent,
  type ToolAuditSink,
  type ToolAuthoritySource,
  type ToolInvocation,
  type ToolResult,
} from "./contracts";
import {
  InMemoryToolExecutionLedger,
  TOOL_PREPARED_LEASE_MS,
  type ToolExecutionLedger,
  type ToolReplayRecord,
} from "./ledger";
import { ToolReferenceMonitor } from "./policy";
import { ToolRegistry } from "./registry";

type ReplayEntry=Readonly<{fingerprint:string;result:Promise<ToolResult>}>;
function nowMs():number{return Date.now();}
function resultBytes(value:unknown):number{
  return new TextEncoder().encode(canonicalJson(value)).byteLength;
}

export class ToolExecutor {
  private readonly replay=new Map<string,ReplayEntry>();
  private readonly activeGroups=new Set<string>();

  constructor(
    private readonly registry:ToolRegistry,
    private readonly tasks:TaskManager,
    private readonly authority:ToolAuthoritySource,
    private readonly monitor=new ToolReferenceMonitor(),
    private readonly audit?:ToolAuditSink,
    private readonly maxReplayEntries=256,
    private readonly ledger:ToolExecutionLedger=new InMemoryToolExecutionLedger(),
  ){
    if(!Number.isSafeInteger(maxReplayEntries)||maxReplayEntries<1||maxReplayEntries>4096){
      throw new SevenError({code:"VALIDATION",message:"Tool replay capacity is invalid."});
    }
  }

  execute(rawInvocation:ToolInvocation, externalSignal?:AbortSignal):Promise<ToolResult>{
    const invocation=this.validateInvocation(rawInvocation);
    const definition=this.registry.require(invocation.toolId);
    if(externalSignal!==undefined && (!externalSignal || typeof externalSignal.aborted!=="boolean" || typeof externalSignal.addEventListener!=="function")){
      throw new SevenError({code:"VALIDATION",message:"Tool external cancellation signal is invalid."});
    }
    return this.prepareAndRun(definition,invocation,externalSignal);
  }

  private async prepareAndRun(
    definition:ReturnType<ToolRegistry["require"]>,
    invocation:ToolInvocation,
    externalSignal?:AbortSignal,
  ):Promise<ToolResult>{
    const parsed=definition.inputSchema.safeParse(invocation.args);
    if(!parsed.success){
      return this.finishedResult({
        invocation,
        fingerprint:await invocationFingerprint({
          toolId:definition.id,version:definition.version,
          roomId:invocation.roomId,taskId:invocation.taskId,args:invocation.args,
        }),
        status:"invalid",retryable:false,effectStarted:false,
        startedAt:nowMs(),errorCode:"INVALID_ARGUMENTS",
      });
    }

    const fingerprint=await invocationFingerprint({
      toolId:definition.id,version:definition.version,
      roomId:invocation.roomId,taskId:invocation.taskId,args:parsed.data,
    });
    const key=invocation.idempotencyKey;
    const prior=this.replay.get(key);
    const durable=await this.ledger.getReplay(key);

    if((prior&&prior.fingerprint!==fingerprint)||(durable&&durable.invocationFingerprint!==fingerprint)){
      return this.finishedResult({
        invocation,fingerprint,status:"invalid",retryable:false,effectStarted:false,
        startedAt:nowMs(),errorCode:"IDEMPOTENCY_KEY_REUSED_WITH_DIFFERENT_INVOCATION",
      });
    }

    let snapshot;
    try{
      snapshot=await this.authority.resolve(invocation,fingerprint);
      if(!snapshot||!Array.isArray(snapshot.grants)){
        throw new SevenError({code:"PERMISSION",message:"Tool authority source returned an invalid snapshot."});
      }
      const authorizationNow=nowMs();

      if(prior){
        this.monitor.authorizeCapabilities({
          definition,invocation,grants:snapshot.grants,now:authorizationNow,
        });
        return prior.result;
      }

      if(durable){
        this.monitor.authorizeCapabilities({
          definition,invocation,grants:snapshot.grants,now:authorizationNow,
        });
        const recovered=await this.resolveDurableReplay(
          definition,invocation,parsed.data,fingerprint,durable,authorizationNow,
        );
        if(recovered)return recovered;
      }else{
        const approval=snapshot.approval;
        this.monitor.authorize({
          definition,invocation,invocationFingerprint:fingerprint,
          grants:snapshot.grants,now:authorizationNow,
          ...(approval!==undefined?{approval}:{}),
        });
        const claim=await this.ledger.claimInvocation({
          idempotencyKey:key,
          invocationFingerprint:fingerprint,
          ownerCallId:invocation.callId,
          preparedAt:authorizationNow,
          ...(approval?.oneShot?{oneShotApprovalId:approval.approvalId}:{}),
        });
        if(claim.status==="approval_used"){
          throw new SevenError({code:"PERMISSION",message:"One-shot tool approval was already consumed."});
        }
        if(claim.status==="existing"){
          const recovered=await this.resolveDurableReplay(
            definition,invocation,parsed.data,fingerprint,claim.record,authorizationNow,
          );
          if(recovered)return recovered;
        }
      }
    }catch(error){
      const normalized=toSevenError(error);
      return this.finishedResult({
        invocation,fingerprint,
        status:normalized.code==="PERMISSION"?"denied":"failed",
        retryable:normalized.retryable,effectStarted:false,
        startedAt:nowMs(),errorCode:normalized.code,
      });
    }

    return this.startRun(definition,invocation,parsed.data,fingerprint,externalSignal);
  }

  private async resolveDurableReplay(
    definition:ReturnType<ToolRegistry["require"]>,
    invocation:ToolInvocation,
    parsedInput:unknown,
    fingerprint:string,
    durable:ToolReplayRecord,
    authorizationNow:number,
  ):Promise<ToolResult|null>{
    if(durable.state==="completed"&&durable.result)return durable.result;
    if(durable.state==="effect_started"){
      const result=await this.finishedResult({
        invocation,fingerprint,status:"effect_unknown",retryable:false,effectStarted:true,
        startedAt:durable.preparedAt,errorCode:"RECOVERED_UNCERTAIN_EXTERNAL_EFFECT",
      });
      await this.ledger.completeReplay(
        invocation.idempotencyKey,fingerprint,result,
        definition.annotations.sensitivity!=="secret-adjacent",
      );
      return result;
    }
    if(durable.state==="prepared"){
      if(authorizationNow-durable.preparedAt<TOOL_PREPARED_LEASE_MS){
        return this.finishedResult({
          invocation,fingerprint,status:"failed",retryable:true,effectStarted:false,
          startedAt:durable.preparedAt,errorCode:"INVOCATION_IN_PROGRESS",
        });
      }
      const taken=await this.ledger.takeoverPrepared({
        idempotencyKey:invocation.idempotencyKey,
        invocationFingerprint:fingerprint,
        ownerCallId:invocation.callId,
        preparedAt:authorizationNow,
        staleBefore:authorizationNow-TOOL_PREPARED_LEASE_MS,
      });
      if(!taken){
        return this.finishedResult({
          invocation,fingerprint,status:"failed",retryable:true,effectStarted:false,
          startedAt:durable.preparedAt,errorCode:"INVOCATION_LEASE_CHANGED",
        });
      }
      return this.startRun(definition,invocation,parsedInput,fingerprint);
    }
    return null;
  }

  private startRun(
    definition:ReturnType<ToolRegistry["require"]>,
    invocation:ToolInvocation,
    parsedInput:unknown,
    fingerprint:string,
    externalSignal?:AbortSignal,
  ):Promise<ToolResult>{
    const promise=this.runHandler(definition,invocation,parsedInput,fingerprint,externalSignal);
    this.replay.set(invocation.idempotencyKey,Object.freeze({fingerprint,result:promise}));
    void promise.then((result)=>{
      if(
        !result.effectStarted &&
        (result.status==="failed"||result.status==="cancelled")
      ){
        const current=this.replay.get(invocation.idempotencyKey);
        if(current?.result===promise)this.replay.delete(invocation.idempotencyKey);
      }
    });
    while(this.replay.size>this.maxReplayEntries){
      const oldest=this.replay.keys().next().value as string|undefined;
      if(oldest)this.replay.delete(oldest);else break;
    }
    return promise;
  }

  private async runHandler(
    definition:ReturnType<ToolRegistry["require"]>,
    invocation:ToolInvocation,
    parsedInput:unknown,
    fingerprint:string,
    externalSignal?:AbortSignal,
  ):Promise<ToolResult>{
    const startedAt=nowMs();
    let effectStarted=false;
    const group=definition.concurrencyGroup;
    if(group&&this.activeGroups.has(group)){
      const result=await this.finishedResult({
        invocation,fingerprint,status:"failed",retryable:true,effectStarted:false,
        startedAt,errorCode:"CONCURRENCY_GROUP_BUSY",
      });
      await this.ledger.releasePrepared(
        invocation.idempotencyKey,fingerprint,invocation.callId,
      );
      return result;
    }
    if(group)this.activeGroups.add(group);
    try{
      const run=this.tasks.run({
        kind:"system",ownerId:`tool:${invocation.callId}`,timeoutMs:definition.timeoutMs,
      },async({signal})=>{
        const output=await definition.handler({
          callId:invocation.callId,roomId:invocation.roomId,taskId:invocation.taskId,signal,
          markEffectStarted:async()=>{
            if(effectStarted)return;
            await this.ledger.markEffectStarted(
              invocation.idempotencyKey,fingerprint,invocation.callId,nowMs(),signal,
            );
            effectStarted=true;
          },
        },parsedInput);
        const validated=definition.outputSchema.safeParse(output);
        if(!validated.success)throw new SevenError({code:"TOOL",message:"Tool output failed its schema."});
        if(resultBytes(validated.data)>definition.maxResultBytes){
          throw new SevenError({code:"TOOL",message:"Tool result exceeded its bounded size."});
        }
        return validated.data;
      });

      const cancelFromExternal=()=>run.cancel("external");
      if(externalSignal?.aborted)cancelFromExternal();
      else externalSignal?.addEventListener("abort",cancelFromExternal,{once:true});
      let result:ToolResult;
      try{
        const output=await run.result;
        const effectful=
          definition.annotations.risk==="write" ||
          definition.annotations.risk==="destructive" ||
          definition.annotations.risk==="external";
        result=effectful&&!effectStarted
          ? await this.finishedResult({
              invocation,fingerprint,status:"effect_unknown",retryable:false,effectStarted:true,
              startedAt,errorCode:"EFFECT_MARKER_REQUIRED",
            })
          : await this.finishedResult({
              invocation,fingerprint,status:"succeeded",retryable:false,effectStarted,startedAt,output,
            });
      }catch(error){
        const normalized=toSevenError(error);
        const cancelled=normalized.code==="CANCELLED"||normalized.code==="DEADLINE_EXCEEDED";
        result=await this.finishedResult({
          invocation,fingerprint,
          status:cancelled?(effectStarted?"effect_unknown":"cancelled"):(effectStarted?"effect_unknown":"failed"),
          retryable:!effectStarted&&normalized.retryable,
          effectStarted,startedAt,errorCode:normalized.code,
        });
      }

      externalSignal?.removeEventListener("abort",cancelFromExternal);
      if(
        result.status==="succeeded" ||
        result.status==="effect_unknown" ||
        (result.status==="failed"&&!result.retryable)
      ){
        try{
          await this.ledger.completeReplay(
            invocation.idempotencyKey,fingerprint,result,
            definition.annotations.sensitivity!=="secret-adjacent",
          );
        }catch{
          if(result.status==="succeeded"&&effectStarted){
            return this.finishedResult({
              invocation,fingerprint,status:"effect_unknown",retryable:false,effectStarted:true,
              startedAt,errorCode:"RESULT_PERSISTENCE_UNCERTAIN",
            });
          }
        }
      }else if(!result.effectStarted){
        try{
          await this.ledger.releasePrepared(
            invocation.idempotencyKey,fingerprint,invocation.callId,
          );
        }catch{
          // A stale pre-effect reservation is safe to leave for lease recovery.
        }
      }
      return result;
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
    invocation:ToolInvocation;fingerprint:string;status:ToolResult["status"];
    retryable:boolean;effectStarted:boolean;startedAt:number;errorCode?:string;output?:unknown;
  }):Promise<ToolResult>{
    const result=Object.freeze({
      callId:input.invocation.callId,toolId:input.invocation.toolId,status:input.status,
      ...(input.output!==undefined?{output:input.output}:{}),
      ...(input.errorCode?{errorCode:input.errorCode}:{}),
      retryable:input.retryable,effectStarted:input.effectStarted,
      startedAt:input.startedAt,completedAt:Math.max(input.startedAt,nowMs()),
      invocationFingerprint:input.fingerprint,
    });
    try{
      const event:ToolAuditEvent=Object.freeze({
        callId:result.callId,toolId:result.toolId,roomId:input.invocation.roomId,taskId:input.invocation.taskId,
        status:result.status,invocationFingerprint:result.invocationFingerprint,
        effectStarted:result.effectStarted,startedAt:result.startedAt,completedAt:result.completedAt,
      });
      await this.audit?.record(event);
    }catch{}
    return result;
  }
}

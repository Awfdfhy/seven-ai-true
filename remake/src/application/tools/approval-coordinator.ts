import { SevenError } from "../../core/errors";
import { canonicalJson, invocationFingerprint, sha256Hex } from "./canonical";
import type { InMemoryToolAuthoritySource } from "./authority";
import type { ToolExecutor } from "./executor";
import type { ToolRegistry } from "./registry";
import type { ToolInvocation, ToolResult } from "./contracts";
import type { LocalMemoryMutationProposer } from "./memory-mutation-proposer";

export type PendingToolAction=Readonly<{
  actionId:string;
  toolId:string;
  title:string;
  memoryPreview:string;
  args:Readonly<Record<string,unknown>>;
  risk:"write"|"destructive";
  invocationFingerprint:string;
  createdAt:number;
  expiresAt:number;
}>;

type InternalPending=Readonly<{
  public:PendingToolAction;
  invocation:ToolInvocation;
}>;

export class ToolApprovalCoordinator {
  private readonly pending=new Map<string,InternalPending>();

  constructor(
    private readonly proposer:LocalMemoryMutationProposer,
    private readonly registry:ToolRegistry,
    private readonly executor:ToolExecutor,
    private readonly authority:InMemoryToolAuthoritySource,
    private readonly now:()=>number=Date.now,
    private readonly ttlMs=5*60_000,
  ){
    if(!Number.isSafeInteger(ttlMs)||ttlMs<30_000||ttlMs>30*60_000){
      throw new SevenError({code:"VALIDATION",message:"Tool approval TTL is invalid."});
    }
  }

  async propose(input:Readonly<{
    roomId:string;
    taskId:string;
    query:string;
    signal?:AbortSignal;
  }>):Promise<PendingToolAction|null>{
    this.prune();
    const proposed=await this.proposer.propose({
      roomId:input.roomId,
      query:input.query,
      ...(input.signal!==undefined?{signal:input.signal}:{}),
    });
    if(!proposed)return null;

    const definition=this.registry.require(proposed.toolId);
    if(definition.annotations.approval!=="always"){
      throw new SevenError({code:"VALIDATION",message:"Mutating chat action must always require approval."});
    }
    const args=definition.inputSchema.parse(proposed.args);
    const createdAt=this.now();
    const digest=await sha256Hex(canonicalJson({
      roomId:input.roomId,
      taskId:input.taskId,
      toolId:definition.id,
      version:definition.version,
      args,
    }));
    const invocation:ToolInvocation = Object.freeze({
      callId:crypto.randomUUID(),
      taskId:input.taskId,
      roomId:input.roomId,
      toolId:definition.id,
      args,
      idempotencyKey:`approval:${digest}`,
      requestedAt:createdAt,
    });
    const fingerprint=await invocationFingerprint({
      toolId:definition.id,
      version:definition.version,
      roomId:input.roomId,
      taskId:input.taskId,
      args,
    });
    const actionId=crypto.randomUUID();
    const view:PendingToolAction=Object.freeze({
      actionId,
      toolId:definition.id,
      title:proposed.actionLabel,
      memoryPreview:proposed.memoryPreview,
      args:Object.freeze(structuredClone(args) as Record<string,unknown>),
      risk:definition.annotations.risk==="destructive"?"destructive":"write",
      invocationFingerprint:fingerprint,
      createdAt,
      expiresAt:createdAt+this.ttlMs,
    });
    this.pending.set(actionId,Object.freeze({public:view,invocation}));
    return view;
  }

  listPending():readonly PendingToolAction[]{
    this.prune();
    return Object.freeze([...this.pending.values()].map(item=>item.public));
  }

  reject(actionId:string):boolean{
    return this.pending.delete(actionId);
  }

  async approve(actionId:string):Promise<ToolResult>{
    this.prune();
    const item=this.pending.get(actionId);
    if(!item)throw new SevenError({code:"VALIDATION",message:"Pending tool action is missing or expired."});
    const now=this.now();
    const approvalId=crypto.randomUUID();
    this.authority.setApproval(Object.freeze({
      approvalId,
      invocationFingerprint:item.public.invocationFingerprint,
      issuedAt:now,
      expiresAt:Math.min(item.public.expiresAt,now+60_000),
      oneShot:true,
    }));
    this.pending.delete(actionId);
    try{
      return await this.executor.execute(item.invocation);
    }finally{
      this.authority.removeApproval(approvalId);
    }
  }

  private prune():void{
    const now=this.now();
    for(const [id,item] of this.pending){
      if(item.public.expiresAt<=now)this.pending.delete(id);
    }
  }
}

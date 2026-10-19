import { canonicalJson, sha256Hex } from "./canonical";
import type { ToolDiscovery } from "./discovery";
import type { ToolExecutor } from "./executor";
import type { ToolPlanner } from "./planner";
import type { ToolCapabilityPolicy } from "./read-capability-policy";
import type { ToolResult } from "./contracts";

export type ToolOrchestrationResult =
  | Readonly<{ kind:"answer" }>
  | Readonly<{ kind:"tool"; toolId:string; result:ToolResult }>;

export class ToolOrchestrator {
  constructor(
    private readonly discovery:ToolDiscovery,
    private readonly planner:ToolPlanner,
    private readonly executor:ToolExecutor,
    private readonly capabilityPolicy:ToolCapabilityPolicy,
  ){}

  async run(input:Readonly<{
    query:string;
    roomId:string;
    taskId:string;
    signal:AbortSignal;
  }>):Promise<ToolOrchestrationResult>{
    const query=input.query.trim();
    if(!query)return Object.freeze({kind:"answer" as const});

    const capabilities=this.capabilityPolicy.capabilitiesFor({
      query,
      roomId:input.roomId,
      taskId:input.taskId,
    });
    const candidates=this.discovery.discover({
      query,
      availableCapabilities:capabilities,
      allowedRisks:["pure","read"],
      maxTools:6,
    });
    if(candidates.length===0)return Object.freeze({kind:"answer" as const});

    const plan=await this.planner.plan({
      query,
      candidates,
      signal:input.signal,
    });
    if(plan.action==="answer")return Object.freeze({kind:"answer" as const});

    const candidate=candidates.find(item=>item.tool.id===plan.toolId);
    if(!candidate)return Object.freeze({kind:"answer" as const});
    if(candidate.tool.annotations.risk!=="pure"&&candidate.tool.annotations.risk!=="read"){
      return Object.freeze({kind:"answer" as const});
    }

    const args=candidate.tool.inputSchema.safeParse(plan.args);
    if(!args.success)return Object.freeze({kind:"answer" as const});

    const digest=await sha256Hex(canonicalJson({
      roomId:input.roomId,
      taskId:input.taskId,
      toolId:candidate.tool.id,
      args:args.data,
    }));
    const result=await this.executor.execute({
      callId:crypto.randomUUID(),
      taskId:input.taskId,
      roomId:input.roomId,
      toolId:candidate.tool.id,
      args:args.data,
      idempotencyKey:`plan:${digest}`,
      requestedAt:Date.now(),
    });
    return Object.freeze({
      kind:"tool" as const,
      toolId:candidate.tool.id,
      result,
    });
  }
}

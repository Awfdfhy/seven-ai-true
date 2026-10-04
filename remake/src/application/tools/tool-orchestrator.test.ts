import { describe, expect, it } from "vitest";
import { z } from "zod";
import { TaskManager } from "../../core/task-manager";
import { InMemoryToolAuthoritySource } from "./authority";
import { ToolDiscovery } from "./discovery";
import { ToolExecutor } from "./executor";
import { ToolOrchestrator } from "./orchestrator";
import type { ToolPlanner, ToolPlan } from "./planner";
import { DefaultReadToolCapabilityPolicy } from "./read-capability-policy";
import { ToolRegistry } from "./registry";

function authority(capabilities:readonly string[]){
  const source=new InMemoryToolAuthoritySource();
  source.setGrant({
    grantId:"g",capabilities,scope:{roomId:"room"},
    issuedAt:Date.now()-1000,expiresAt:Date.now()+60_000,source:"system",
  });
  return source;
}
function planner(plan:ToolPlan):ToolPlanner{
  return {async plan(){return plan;}};
}

describe("Tool orchestrator",()=>{
  it("allows memory read by default but not cross-room history without explicit user intent",async()=>{
    const policy=new DefaultReadToolCapabilityPolicy();
    expect(policy.capabilitiesFor({query:"What do you remember about my theme?",roomId:"r",taskId:"t"}))
      .toEqual(["memory.read"]);
    expect(policy.capabilitiesFor({query:"Search my previous chat about calculus",roomId:"r",taskId:"t"}))
      .toEqual(["memory.read","rooms.read"]);
  });

  it("executes only a discovered read-only proposal through the executor",async()=>{
    const registry=new ToolRegistry();
    let calls=0;
    registry.register({
      id:"memory.search",version:"1.0.0",title:"Search memory",description:"Search saved memory.",
      inputSchema:z.object({query:z.string()}).strict(),
      outputSchema:z.object({found:z.boolean()}).strict(),
      requiredCapabilities:["memory.read"],
      annotations:{risk:"read",idempotency:"idempotent",approval:"never",sensitivity:"user-data",reversibility:"reversible"},
      timeoutMs:500,maxResultBytes:512,
      async handler(){calls+=1;return {found:true};},
    });
    const executor=new ToolExecutor(registry,new TaskManager(),authority(["memory.read"]));
    const orchestrator=new ToolOrchestrator(
      new ToolDiscovery(registry),
      planner({action:"tool",toolId:"memory.search",args:{query:"theme"}}),
      executor,
      new DefaultReadToolCapabilityPolicy(),
    );
    const input={query:"What do you remember about my theme?",roomId:"room",taskId:"task",signal:new AbortController().signal};
    const first=await orchestrator.run(input);
    const second=await orchestrator.run(input);
    expect(first.kind).toBe("tool");
    expect(second.kind).toBe("tool");
    expect(calls).toBe(1);
  });

  it("cannot execute a planner-selected tool that discovery did not expose",async()=>{
    const registry=new ToolRegistry();
    let calls=0;
    registry.register({
      id:"rooms.search",version:"1.0.0",title:"Search rooms",description:"Search older chats.",
      inputSchema:z.object({query:z.string()}).strict(),
      outputSchema:z.object({ok:z.boolean()}).strict(),
      requiredCapabilities:["rooms.read"],
      annotations:{risk:"read",idempotency:"idempotent",approval:"never",sensitivity:"user-data",reversibility:"reversible"},
      timeoutMs:500,maxResultBytes:512,
      async handler(){calls+=1;return {ok:true};},
    });
    const executor=new ToolExecutor(registry,new TaskManager(),authority(["rooms.read"]));
    const orchestrator=new ToolOrchestrator(
      new ToolDiscovery(registry),
      planner({action:"tool",toolId:"rooms.search",args:{query:"secret"}}),
      executor,
      new DefaultReadToolCapabilityPolicy(),
    );
    const result=await orchestrator.run({
      query:"What do you remember about me?",
      roomId:"room",taskId:"task",signal:new AbortController().signal,
    });
    expect(result).toEqual({kind:"answer"});
    expect(calls).toBe(0);
  });

  it("never exposes write tools through the default read capability policy",async()=>{
    const registry=new ToolRegistry();
    registry.register({
      id:"files.delete",version:"1.0.0",title:"Delete file",description:"Delete a local file.",
      inputSchema:z.object({path:z.string()}).strict(),
      outputSchema:z.object({ok:z.boolean()}).strict(),
      requiredCapabilities:["files.delete"],
      annotations:{risk:"destructive",idempotency:"non-idempotent",approval:"always",sensitivity:"user-data",reversibility:"irreversible"},
      timeoutMs:500,maxResultBytes:512,
      async handler(){return {ok:true};},
    });
    const orchestrator=new ToolOrchestrator(
      new ToolDiscovery(registry),
      planner({action:"tool",toolId:"files.delete",args:{path:"x"}}),
      new ToolExecutor(registry,new TaskManager(),authority(["files.delete"])),
      new DefaultReadToolCapabilityPolicy(),
    );
    expect(await orchestrator.run({
      query:"delete my file",roomId:"room",taskId:"task",signal:new AbortController().signal,
    })).toEqual({kind:"answer"});
  });
});

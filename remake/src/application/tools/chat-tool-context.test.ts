import { describe, expect, it } from "vitest";
import { z } from "zod";
import { TaskManager } from "../../core/task-manager";
import { InMemoryToolAuthoritySource } from "./authority";
import { ToolDiscovery } from "./discovery";
import { ToolExecutor } from "./executor";
import { ToolOrchestrator } from "./orchestrator";
import type { ToolPlanner } from "./planner";
import { DefaultReadToolCapabilityPolicy } from "./read-capability-policy";
import { ToolRegistry } from "./registry";
import { OrchestratedReadToolContextSource } from "./chat-tool-context";

describe("OrchestratedReadToolContextSource",()=>{
  it("returns a bounded untrusted evidence envelope after a read-only tool executes",async()=>{
    const registry=new ToolRegistry();
    registry.register({
      id:"memory.search",version:"1.0.0",title:"Search memory",description:"Recall saved memory.",
      inputSchema:z.object({query:z.string()}).strict(),
      outputSchema:z.object({content:z.string()}).strict(),
      requiredCapabilities:["memory.read"],
      annotations:{risk:"read",idempotency:"idempotent",approval:"never",sensitivity:"user-data",reversibility:"reversible"},
      timeoutMs:500,maxResultBytes:1024,
      async handler(){return {content:"dark mode"};},
    });
    const authority=new InMemoryToolAuthoritySource();
    authority.setGrant({
      grantId:"read",capabilities:["memory.read"],scope:{},
      issuedAt:0,expiresAt:Number.MAX_SAFE_INTEGER,source:"system",
    });
    const planner:ToolPlanner={
      async plan(){return {action:"tool",toolId:"memory.search",args:{query:"theme"}};},
    };
    const orchestrator=new ToolOrchestrator(
      new ToolDiscovery(registry),
      planner,
      new ToolExecutor(registry,new TaskManager(),authority),
      new DefaultReadToolCapabilityPolicy(),
    );
    const source=new OrchestratedReadToolContextSource(orchestrator,registry,2000);
    const text=await source.contextForTurn({
      roomId:"r",taskId:"t",query:"What do you remember about my theme?",
      signal:new AbortController().signal,
    });
    expect(text).toContain("UNTRUSTED_TOOL_DATA");
    expect(text).toContain('"content":"dark mode"');
    expect(text).not.toContain("SYSTEM");
  });
});

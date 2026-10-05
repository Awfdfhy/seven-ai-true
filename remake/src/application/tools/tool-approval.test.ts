import { describe, expect, it } from "vitest";
import { TaskManager } from "../../core/task-manager";
import { createMemoryFact, createMemoryWriteEvent } from "../../domain/memory/fabric";
import { MemoryFabricService } from "../memory/memory-fabric-service";
import { InMemoryMemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { InMemoryToolAuthoritySource } from "./authority";
import { ToolExecutor } from "./executor";
import { ToolRegistry } from "./registry";
import { registerBuiltinMemoryMutationTools } from "./mutation-builtins";
import { LocalMemoryMutationProposer } from "./memory-mutation-proposer";
import { ToolApprovalCoordinator } from "./approval-coordinator";

async function setup(){
  const repo=new InMemoryMemoryFabricRepository();
  const memory=new MemoryFabricService(repo);
  const fact=createMemoryFact({
    id:"theme-memory",kind:"preference",tier:"recall",scope:"global",
    canonicalKey:"preference:theme",content:"I prefer dark mode",
    tags:["theme","dark"],importance:.9,confidence:.99,observedAt:100,
    sourceRoomId:"r1",sourceMessageId:"m1",
  });
  await repo.commit([fact],[createMemoryWriteEvent(fact,"add",100)]);
  const registry=new ToolRegistry();
  registerBuiltinMemoryMutationTools(registry,memory);
  const authority=new InMemoryToolAuthoritySource();
  authority.setGrant({
    grantId:"local-memory-mutations",
    capabilities:["memory.write","memory.delete"],
    toolIds:["memory.set_tier","memory.forget"],
    scope:{},
    issuedAt:0,expiresAt:Number.MAX_SAFE_INTEGER,source:"system",
  });
  const executor=new ToolExecutor(registry,new TaskManager(),authority);
  const proposer=new LocalMemoryMutationProposer(memory,registry);
  const coordinator=new ToolApprovalCoordinator(proposer,registry,executor,authority,Date.now,300_000);
  return {repo,memory,registry,authority,executor,coordinator};
}

describe("Tool approval coordinator",()=>{
  it("creates an exact pending pin action but does not mutate before approval",async()=>{
    const {memory,coordinator}=await setup();
    const pending=await coordinator.propose({
      roomId:"r2",taskId:"t1",query:"Pin my dark mode memory",
    });
    expect(pending).not.toBeNull();
    expect(pending?.roomId).toBe("r2");
    expect(pending?.toolId).toBe("memory.set_tier");
    expect(pending?.memoryPreview).toBe("I prefer dark mode");
    expect((await memory.listActive("r2"))[0]?.tier).toBe("recall");
    expect((await coordinator.approve(pending!.actionId)).status).toBe("succeeded");
    expect((await memory.listActive("r2"))[0]?.tier).toBe("core");
  });

  it("reject leaves memory unchanged",async()=>{
    const {memory,coordinator}=await setup();
    const pending=await coordinator.propose({
      roomId:"r2",taskId:"t1",query:"Delete this from memory: dark mode",
    });
    expect(pending?.risk).toBe("destructive");
    expect(coordinator.reject(pending!.actionId)).toBe(true);
    expect((await memory.listActive("r2")).some(f=>f.id==="theme-memory")).toBe(true);
  });

  it("fails closed if the memory changed after the approval card was created",async()=>{
    const {memory,coordinator}=await setup();
    const pending=await coordinator.propose({
      roomId:"r2",taskId:"t1",query:"Delete this from memory: dark mode",
    });
    await memory.updateMemory("theme-memory","r2",{content:"I prefer midnight mode"},undefined,2_000);
    const result=await coordinator.approve(pending!.actionId);
    expect(result.status).toBe("failed");
    expect((await memory.listActive("r2")).some(f=>f.content==="I prefer midnight mode")).toBe(true);
  });

  it("does not create destructive action for ambiguous matches",async()=>{
    const {repo,memory,registry,authority,executor}=await setup();
    const other=createMemoryFact({
      id:"theme-memory-2",kind:"preference",tier:"recall",scope:"global",
      canonicalKey:"preference:secondary-theme",content:"I prefer dark theme for code",
      tags:["theme","dark"],importance:.8,confidence:.95,observedAt:101,
      sourceRoomId:"r1",sourceMessageId:"m2",
    });
    await repo.commit([other],[createMemoryWriteEvent(other,"add",101)]);
    const coordinator=new ToolApprovalCoordinator(
      new LocalMemoryMutationProposer(memory,registry),registry,executor,authority,Date.now,300_000,
    );
    expect(await coordinator.propose({
      roomId:"r2",taskId:"t1",query:"Delete dark theme from memory",
    })).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { createMemoryFact, createMemoryWriteEvent } from "../../domain/memory/fabric";
import { createRoom, commitMessage } from "../../domain/chat";
import { InMemoryMemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { InMemoryRoomRepository } from "../../storage/room-repository";
import { MemoryFabricService } from "../memory/memory-fabric-service";
import { InMemoryToolAuthoritySource } from "./authority";
import { registerBuiltinReadTools } from "./builtins";
import { ToolExecutor } from "./executor";
import { ToolRegistry } from "./registry";
import { TaskManager } from "../../core/task-manager";

function authority(){
  const source=new InMemoryToolAuthoritySource();
  source.setGrant({
    grantId:"read-tools",
    capabilities:["memory.read","rooms.read"],
    scope:{roomId:"room-current"},
    issuedAt:Date.now()-1000,
    expiresAt:Date.now()+60_000,
    source:"user",
  });
  return source;
}

describe("Seven built-in read tools",()=>{
  it("searches local memory without requiring semantic rewrite/network fallback",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const fact=createMemoryFact({
      id:"theme",kind:"preference",tier:"recall",scope:"global",
      canonicalKey:"preference:theme",content:"I prefer dark mode",
      tags:["preference","theme","dark"],importance:.9,confidence:.99,
      observedAt:1,sourceRoomId:"old-room",sourceMessageId:"m1",
    });
    await repo.commit([fact],[createMemoryWriteEvent(fact,"add",1)]);
    let rewriteCalls=0;
    const memory=new MemoryFabricService(repo,undefined,{async rewrite(){rewriteCalls+=1;return ["dark theme"]; }});
    const registry=new ToolRegistry();
    registerBuiltinReadTools(registry,{memory,rooms:new InMemoryRoomRepository()});
    const executor=new ToolExecutor(registry,new TaskManager(),authority());
    const result=await executor.execute({
      callId:"c1",taskId:"t1",roomId:"room-current",toolId:"memory.search",
      args:{query:"dark theme",maxResults:5},idempotencyKey:"memory-search-1",requestedAt:Date.now(),
    });
    expect(result.status).toBe("succeeded");
    expect((result.output as {items:Array<{id:string}>}).items[0]?.id).toBe("theme");
    expect(rewriteCalls).toBe(0);
  });

  it("lists only bounded active memory and respects tier filters",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const core=createMemoryFact({
      id:"name",kind:"profile",tier:"core",scope:"global",canonicalKey:"profile:name",
      content:"My name is Ali",tags:["name"],importance:1,confidence:1,
      observedAt:1,sourceRoomId:"r",sourceMessageId:"m1",
    });
    const recall=createMemoryFact({
      id:"food",kind:"preference",tier:"recall",scope:"global",canonicalKey:"pref:food",
      content:"I like mango",tags:["food"],importance:.6,confidence:.9,
      observedAt:2,sourceRoomId:"r",sourceMessageId:"m2",
    });
    await repo.commit([core,recall],[createMemoryWriteEvent(core,"add",1),createMemoryWriteEvent(recall,"add",2)]);
    const memory=new MemoryFabricService(repo);
    const registry=new ToolRegistry();registerBuiltinReadTools(registry,{memory,rooms:new InMemoryRoomRepository()});
    const result=await new ToolExecutor(registry,new TaskManager(),authority()).execute({
      callId:"c2",taskId:"t2",roomId:"room-current",toolId:"memory.list",
      args:{tier:"core",maxResults:10},idempotencyKey:"memory-list-1",requestedAt:Date.now(),
    });
    expect(result.status).toBe("succeeded");
    expect((result.output as {items:Array<{id:string}>}).items.map(item=>item.id)).toEqual(["name"]);
  });

  it("searches room titles and bounded message snippets without write access",async()=>{
    let room=createRoom({id:"room-current",title:"Seven Tools",now:1});
    room=commitMessage(room,{id:"m1",role:"user",content:"We discussed capability graphs and approvals",now:2});
    const rooms=new InMemoryRoomRepository([room,createRoom({id:"other",title:"Cooking",now:3})]);
    const memory=new MemoryFabricService(new InMemoryMemoryFabricRepository());
    const registry=new ToolRegistry();registerBuiltinReadTools(registry,{memory,rooms});
    const result=await new ToolExecutor(registry,new TaskManager(),authority()).execute({
      callId:"c3",taskId:"t3",roomId:"room-current",toolId:"rooms.search",
      args:{query:"capability approvals",maxResults:5},idempotencyKey:"rooms-search-1",requestedAt:Date.now(),
    });
    expect(result.status).toBe("succeeded");
    const output=result.output as {rooms:Array<{id:string;snippet?:string}>};
    expect(output.rooms[0]?.id).toBe("room-current");
    expect(output.rooms[0]?.snippet).toContain("capability graphs");
  });
});

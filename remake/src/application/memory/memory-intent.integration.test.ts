import { describe, expect, it } from "vitest";
import { InMemoryMemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { MemoryFabricService } from "./memory-fabric-service";

describe("MemoryFabricService intent gating",()=>{
  it("does not inject core memory into self-contained questions",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const memory=new MemoryFabricService(repo);
    await memory.observeUserMessage({roomId:"r1",messageId:"m1",content:"My name is Ali",createdAt:1});
    expect(await memory.contextForRoom("r2","Explain the water cycle")).toBe("");
  });

  it("does inject durable memory for personal questions",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const memory=new MemoryFabricService(repo);
    await memory.observeUserMessage({roomId:"r1",messageId:"m1",content:"My name is Ali",createdAt:1});
    const context=await memory.contextForRoom("r2","What is my name?");
    expect(context).toContain("My name is Ali");
  });
});

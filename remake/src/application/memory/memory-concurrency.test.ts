import { describe, expect, it } from "vitest";
import { InMemoryMemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { MemoryFabricService } from "./memory-fabric-service";

describe("Memory Fabric canonical-write serialization",()=>{
  it("keeps one active canonical fact under concurrent updates",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const memory=new MemoryFabricService(repo);
    await Promise.all([
      memory.observeUserMessage({roomId:"r1",messageId:"m1",content:"I prefer light mode",createdAt:100}),
      memory.observeUserMessage({roomId:"r2",messageId:"m2",content:"I prefer dark mode",createdAt:200}),
    ]);
    const theme=(await repo.listForRoom("r3")).filter(f=>f.canonicalKey==="preference:theme");
    expect(theme.filter(f=>f.status==="active")).toHaveLength(1);
    expect(theme.find(f=>f.status==="active")?.content).toBe("I prefer dark mode");
    expect(theme.find(f=>f.content==="I prefer light mode")?.validUntil).toBe(200);
  });

  it("does not let a late-arriving older observation overwrite newer truth",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const memory=new MemoryFabricService(repo);
    await memory.observeUserMessage({roomId:"new",messageId:"m-new",content:"I prefer dark mode",createdAt:300});
    await memory.observeUserMessage({roomId:"old",messageId:"m-old",content:"I prefer light mode",createdAt:100});
    const theme=(await repo.listForRoom("r")).filter(f=>f.canonicalKey==="preference:theme");
    expect(theme.filter(f=>f.status==="active").map(f=>f.content)).toEqual(["I prefer dark mode"]);
    const old=theme.find(f=>f.content==="I prefer light mode");
    expect(old?.status).toBe("superseded");
    expect(old?.validUntil).toBe(300);
  });

  it("deduplicates punctuation/case-only repeats for a canonical key",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const memory=new MemoryFabricService(repo);
    await memory.observeUserMessage({roomId:"r1",messageId:"m1",content:"I prefer dark mode",createdAt:100});
    await memory.observeUserMessage({roomId:"r2",messageId:"m2",content:"i prefer dark mode.",createdAt:200});
    const active=(await repo.listForRoom("r3")).filter(f=>f.canonicalKey==="preference:theme"&&f.status==="active");
    expect(active).toHaveLength(1);
  });
});

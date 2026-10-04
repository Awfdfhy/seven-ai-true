import { describe, expect, it } from "vitest";
import { createMemoryFact } from "../../domain/memory/fabric";
import { InMemoryMemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { MemoryFabricService } from "./memory-fabric-service";
import type { MemoryQueryRewriter } from "./memory-query-rewriter";

describe("Memory semantic rewrite fallback",()=>{
  it("recovers a paraphrased memory only when multiple rewrites agree",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const pet=createMemoryFact({
      id:"pet",kind:"fact",tier:"recall",scope:"global",canonicalKey:"pet:name",
      content:"My dog's name is Max",tags:["dog","name","max"],importance:.8,confidence:.99,
      observedAt:1,sourceRoomId:"r1",sourceMessageId:"m1",
    });
    await repo.commit([pet],[]);
    const rewriter:MemoryQueryRewriter={
      async rewrite(){return ["pet dog name","dog called name"];},
    };
    const memory=new MemoryFabricService(repo,undefined,rewriter);
    const hits=await memory.search("r2","What is my pet called?");
    expect(hits.some(hit=>hit.fact.id==="pet"&&hit.reason==="rewritten")).toBe(true);
  });

  it("rejects a one-off hallucinated rewrite candidate",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const noise=createMemoryFact({
      id:"noise",kind:"fact",tier:"recall",scope:"global",canonicalKey:"noise",
      content:"Blue notebook",tags:["blue","notebook"],importance:.9,confidence:.99,
      observedAt:1,sourceRoomId:"r1",sourceMessageId:"m1",
    });
    await repo.commit([noise],[]);
    const rewriter:MemoryQueryRewriter={
      async rewrite(){return ["blue notebook","pet animal name"];},
    };
    const memory=new MemoryFabricService(repo,undefined,rewriter);
    const hits=await memory.search("r2","What is my pet called?");
    expect(hits.some(hit=>hit.fact.id==="noise")).toBe(false);
  });

  it("does not invoke semantic rewrite for self-contained questions",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    let calls=0;
    const rewriter:MemoryQueryRewriter={async rewrite(){calls+=1;return ["anything"]; }};
    const memory=new MemoryFabricService(repo,undefined,rewriter);
    expect(await memory.search("r","Explain quantum tunneling")).toEqual([]);
    expect(calls).toBe(0);
  });
});

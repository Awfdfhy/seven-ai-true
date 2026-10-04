import { describe, expect, it } from "vitest";
import { extractMemoryCandidates } from "./memory-extractor";
import { formatMemoryContext, MemoryRetrievalEngine } from "./memory-retrieval";
import { createMemoryFact } from "../../domain/memory/fabric";

function fact(input: Partial<Parameters<typeof createMemoryFact>[0]> & Pick<Parameters<typeof createMemoryFact>[0],"canonicalKey"|"content">) {
  return createMemoryFact({
    kind:"preference",tier:"recall",scope:"global",importance:.8,confidence:.95,observedAt:1000,
    sourceRoomId:"r1",sourceMessageId:crypto.randomUUID(),tags:["preference"],...input,
  });
}

describe("Memory Fabric extraction",()=>{
  it("extracts durable English and Arabic facts conservatively",()=>{
    expect(extractMemoryCandidates("My name is Ali")[0]).toMatchObject({kind:"profile",tier:"core",canonicalKey:"profile:name"});
    expect(extractMemoryCandidates("أنا أفضل الوضع الداكن")[0]).toMatchObject({kind:"preference",canonicalKey:"preference:theme"});
    expect(extractMemoryCandidates("هدفي هو تعلم TypeScript")[0]).toMatchObject({kind:"goal"});
  });
  it("refuses secret-like memory candidates",()=>{
    expect(extractMemoryCandidates("remember that my API key is sk_example_123456789012345")).toHaveLength(0);
    expect(extractMemoryCandidates("تذكر أن رمز OTP هو 123456")).toHaveLength(0);
  });
});

describe("Memory Fabric retrieval",()=>{
  it("keeps core memory visible and retrieves relevant recall memory",()=>{
    const core=createMemoryFact({kind:"profile",tier:"core",scope:"global",canonicalKey:"profile:name",content:"My name is Ali",tags:["profile","name"],importance:1,confidence:.99,observedAt:1000,sourceRoomId:"r1",sourceMessageId:"m1"});
    const relevant=fact({canonicalKey:"preference:theme",content:"I prefer dark mode",tags:["preference","theme"],observedAt:2000});
    const noise=fact({canonicalKey:"preference:food",content:"I like mango",tags:["preference","food"],observedAt:3000});
    const hits=new MemoryRetrievalEngine().search([core,relevant,noise],"use my preferred theme",{now:4000});
    expect(hits[0]?.fact.id).toBe(core.id);
    expect(hits.some(h=>h.fact.id===relevant.id)).toBe(true);
    expect(hits.some(h=>h.fact.id===noise.id)).toBe(false);
  });
  it("keeps the bounded memory payload valid JSON instead of truncating an item",()=>{
    const one=fact({canonicalKey:"fact:one",content:"one ".repeat(120).trim(),tags:["one"]});
    const two=fact({canonicalKey:"fact:two",content:"two ".repeat(120).trim(),tags:["two"]});
    const hits=new MemoryRetrievalEngine().search([one,two],"one two",{now:4000});
    const rendered=formatMemoryContext(hits,1200);
    const json=rendered.slice(rendered.indexOf("\n")+1);
    expect(()=>JSON.parse(json)).not.toThrow();
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThanOrEqual(1200);
    const tooSmall=formatMemoryContext(hits,256);
    expect(tooSmall).toBe("");
  });

  it("abstains from unrelated recall instead of forcing a memory",()=>{
    const only=fact({canonicalKey:"preference:food",content:"I like mango",tags:["preference","food"]});
    const hits=new MemoryRetrievalEngine().search([only],"explain quantum tunneling",{now:4000});
    expect(hits).toHaveLength(0);
  });
});

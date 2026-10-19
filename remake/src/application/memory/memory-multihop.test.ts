import { describe, expect, it } from "vitest";
import { createMemoryFact } from "../../domain/memory/fabric";
import { MemoryRetrievalEngine } from "./memory-retrieval";

function fact(id:string,content:string,tags:readonly string[],key:string){
  return createMemoryFact({
    id,kind:"fact",tier:"recall",scope:"global",canonicalKey:key,content,tags,
    importance:.75,confidence:.98,observedAt:100,sourceRoomId:"r",sourceMessageId:`m-${id}`,
  });
}

describe("Memory multi-hop retrieval",()=>{
  it("adds an associated fact when direct lexical retrieval exposes a rare bridge entity",()=>{
    const project=fact("project","My current project is Seven",["profile","project","seven"],"profile:project");
    const framework=fact("framework","Seven uses React for its interface",["seven","react","interface"],"project:seven:framework");
    const unrelated=fact("food","Mango is my favorite fruit",["food","mango"],"preference:food");
    const hits=new MemoryRetrievalEngine().search(
      [project,framework,unrelated],
      "What framework does my project use?",
      {now:200,maxCore:0,maxRecall:4,includeCore:false,includeRecall:true},
    );
    expect(hits.some(hit=>hit.fact.id==="project")).toBe(true);
    expect(hits.some(hit=>hit.fact.id==="framework" && hit.reason==="associated")).toBe(true);
    expect(hits.some(hit=>hit.fact.id==="food")).toBe(false);
  });
});

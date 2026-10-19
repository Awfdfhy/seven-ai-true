import { describe, expect, it } from "vitest";
import { createMemoryFact } from "../../domain/memory/fabric";
import { InMemoryMemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { MemoryFabricService } from "./memory-fabric-service";
import type { MemoryQueryRewriter } from "./memory-query-rewriter";

type EvalCase = Readonly<{
  name: string;
  query: string;
  expectedId: string | null;
  rewrites: readonly string[];
}>;

function memory(
  id:string,
  content:string,
  tags:readonly string[],
  key:string,
){
  return createMemoryFact({
    id,
    kind:"fact",
    tier:"recall",
    scope:"global",
    canonicalKey:key,
    content,
    tags,
    importance:.8,
    confidence:.98,
    observedAt:100,
    sourceRoomId:"seed-room",
    sourceMessageId:`seed-${id}`,
  });
}

const facts=[
  memory("pet","My dog's name is Max",["dog","name","max"],"pet:name"),
  memory("city","I currently live in Basra",["city","basra","location"],"profile:city"),
  memory("study","My current study project is calculus",["study","calculus","project"],"profile:study"),
  memory("arabic-pet","اسم قطتي لولو",["قطتي","اسم","لولو"],"pet:cat:name"),
  memory("food","I like mango juice",["food","mango","juice"],"preference:food"),
] as const;

const cases:readonly EvalCase[]=[
  {
    name:"English canine paraphrase",
    query:"How should I address my canine?",
    expectedId:"pet",
    rewrites:["dog name","what dog is called","pet canine name"],
  },
  {
    name:"English residence paraphrase",
    query:"Where am I based these days?",
    expectedId:"city",
    rewrites:["current city location","where I live","home city"],
  },
  {
    name:"English study paraphrase",
    query:"What subject am I focusing on for school?",
    expectedId:"study",
    rewrites:["current study subject","school project topic","learning calculus subject"],
  },
  {
    name:"Arabic pet paraphrase",
    query:"بأي اسم أنادي حيواني الأليف؟",
    expectedId:"arabic-pet",
    rewrites:["اسم القطه","اسم قطتي","الحيوان الاليف اسمه"],
  },
  {
    name:"Arabic unrelated",
    query:"اشرح لي كيف يعمل البرق",
    expectedId:null,
    rewrites:[],
  },
  {
    name:"English unrelated",
    query:"Explain plate tectonics",
    expectedId:null,
    rewrites:[],
  },
  {
    name:"Hallucinated single rewrite must abstain",
    query:"What instrument do I play?",
    expectedId:null,
    rewrites:["mango juice","musical instrument"],
  },
] as const;

describe("Memory semantic challenger promotion matrix",()=>{
  it("improves hard paraphrases without sacrificing abstention",async()=>{
    let expectedRewrites:readonly string[]=[];
    const rewriter:MemoryQueryRewriter={
      async rewrite(){return expectedRewrites;},
    };

    let baselineCorrect=0;
    let challengerCorrect=0;
    for(const test of cases){
      const baselineRepo=new InMemoryMemoryFabricRepository();
      await baselineRepo.commit(facts,[]);
      const baseline=new MemoryFabricService(baselineRepo);
      const baselineHits=await baseline.search("eval-room",test.query);
      const baselineFound=test.expectedId===null
        ? baselineHits.filter(hit=>hit.reason!=="core").length===0
        : baselineHits.some(hit=>hit.fact.id===test.expectedId);
      if(baselineFound)baselineCorrect+=1;

      const challengeRepo=new InMemoryMemoryFabricRepository();
      await challengeRepo.commit(facts,[]);
      expectedRewrites=test.rewrites;
      const challenger=new MemoryFabricService(challengeRepo,undefined,rewriter);
      const hits=await challenger.search("eval-room",test.query);
      const challengerFound=test.expectedId===null
        ? hits.filter(hit=>hit.reason!=="core").length===0
        : hits.some(hit=>hit.fact.id===test.expectedId);
      if(challengerFound)challengerCorrect+=1;
    }

    expect(challengerCorrect).toBeGreaterThan(baselineCorrect);
    expect(challengerCorrect).toBe(cases.length);
  });
});

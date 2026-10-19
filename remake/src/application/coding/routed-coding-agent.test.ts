import { describe, expect, it } from "vitest";
import type { ProviderAdapter, ProviderStreamRequest } from "../../providers/contracts";
import { ModelRegistry, ModelRouter, ProviderHealthTracker } from "../../routing/model-router";
import { createRepositorySnapshot } from "./workspace-truth";
import { buildRepositoryMap } from "./repo-intelligence";
import { RoutedCodingAgent } from "./routed-coding-agent";

function provider(id:string,fail:boolean,calls:{count:number}):ProviderAdapter{
  return {
    id,
    async listModels(){return[]},
    async *stream(_request:ProviderStreamRequest){
      calls.count+=1;
      if(fail)throw new Error("provider failed");
      yield {delta:JSON.stringify({
        summary:"understood",
        acceptanceCriteria:["tests pass"],
        researchQueries:[],
        inspectHints:[],
      })};
    },
  };
}

describe("routed coding agent",()=>{
  it("falls back through Seven ModelRouter and records provider health",async()=>{
    const registry=new ModelRegistry();
    registry.replaceProviderModels("p1",[{
      id:"m1",providerId:"p1",displayName:"M1",contextWindow:100000,
      qualityScore:100,speedScore:100,capabilities:{streaming:true,tools:true,vision:false},
    }]);
    registry.replaceProviderModels("p2",[{
      id:"m2",providerId:"p2",displayName:"M2",contextWindow:100000,
      qualityScore:90,speedScore:90,capabilities:{streaming:true,tools:true,vision:false},
    }]);
    const c1={count:0},c2={count:0};
    const health=new ProviderHealthTracker();
    const agent=new RoutedCodingAgent(
      [provider("p1",true,c1),provider("p2",false,c2)],
      registry,
      new ModelRouter(),
      health,
      {maxAttempts:2,now:()=>1000},
    );
    const snapshot=await createRepositorySnapshot({
      repository:"owner/repo",branch:"main",headSha:"a".repeat(40),
      files:[{path:"src/a.ts",content:"export const a=1;\n"}],
    });
    const understanding=await agent.understand({
      task:"fix a",
      repoMap:buildRepositoryMap(snapshot,"fix a"),
      snapshot,
      signal:new AbortController().signal,
    });
    expect(understanding.summary).toBe("understood");
    expect(c1.count).toBe(1);
    expect(c2.count).toBe(1);
    expect(health.snapshot(["p1"])[0]?.penalty).toBeGreaterThan(0);
  });
});

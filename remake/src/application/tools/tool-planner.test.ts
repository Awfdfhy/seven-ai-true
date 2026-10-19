import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { ProviderAdapter, ProviderStreamRequest } from "../../providers/contracts";
import { ProviderToolPlanner, parseToolPlan } from "./planner";
import type { ToolDefinition } from "./contracts";
import type { ToolDiscoveryCandidate } from "./discovery";

function candidate(
  id:string,
  risk:ToolDefinition["annotations"]["risk"]="read",
):ToolDiscoveryCandidate{
  const tool:ToolDefinition<{query:string},{ok:boolean}>={
    id,version:"1.0.0",title:id,description:`Read-only ${id} tool.`,
    inputSchema:z.object({query:z.string().min(1)}).strict(),
    outputSchema:z.object({ok:z.boolean()}).strict(),
    requiredCapabilities:[`${id}.cap`],
    annotations:{
      risk,idempotency:"idempotent",approval:"never",
      sensitivity:"user-data",reversibility:"reversible",
    },
    timeoutMs:500,maxResultBytes:1024,
    async handler(){return {ok:true};},
  };
  return {tool,score:10,reasons:["test"]};
}

describe("Tool planner",()=>{
  it("parses a valid read-only tool proposal and validates args",()=>{
    const c=[candidate("memory.search")];
    expect(parseToolPlan('{"action":"tool","toolId":"memory.search","args":{"query":"dark mode"}}',c))
      .toEqual({action:"tool",toolId:"memory.search",args:{query:"dark mode"}});
  });

  it("fails closed for unknown tools, malformed args, or mutating tools",()=>{
    const read=[candidate("memory.search")];
    expect(parseToolPlan('{"action":"tool","toolId":"files.delete","args":{"query":"x"}}',read))
      .toEqual({action:"answer"});
    expect(parseToolPlan('{"action":"tool","toolId":"memory.search","args":{"bad":1}}',read))
      .toEqual({action:"answer"});
    expect(parseToolPlan('{"action":"tool","toolId":"files.delete","args":{"query":"x"}}',[candidate("files.delete","destructive")]))
      .toEqual({action:"answer"});
  });

  it("extracts the first complete JSON object and ignores surrounding prose",()=>{
    expect(parseToolPlan('note\n{"action":"answer"}\nextra',[candidate("memory.search")]))
      .toEqual({action:"answer"});
  });

  it("sends only read-only candidates to the provider and accepts a bounded proposal",async()=>{
    const captured:{ value?: ProviderStreamRequest }={};
    const provider:ProviderAdapter={
      id:"fake",
      async listModels(){return [];},
      async *stream(request){
        captured.value=request;
        yield {delta:'{"action":"tool","toolId":"memory.search","args":{"query":"Seven"}}'};
      },
    };
    const planner=new ProviderToolPlanner(provider,"model");
    const plan=await planner.plan({
      query:"What do you remember about Seven?",
      candidates:[candidate("memory.search"),candidate("files.delete","destructive")],
      signal:new AbortController().signal,
    });
    expect(plan).toEqual({action:"tool",toolId:"memory.search",args:{query:"Seven"}});
    const prompt=captured.value?.messages[0]?.content??"";
    expect(prompt).toContain("memory.search");
    expect(prompt).not.toContain("files.delete");
    expect(prompt).toContain('"query"');
  });

  it("returns answer when provider output is malformed",async()=>{
    const provider:ProviderAdapter={
      id:"fake",
      async listModels(){return [];},
      async *stream(){yield {delta:"not json"};},
    };
    const planner=new ProviderToolPlanner(provider,"model");
    expect(await planner.plan({
      query:"hello",candidates:[candidate("memory.search")],signal:new AbortController().signal,
    })).toEqual({action:"answer"});
  });
});

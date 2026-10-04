import { describe, expect, it } from "vitest";
import { parseRewritePayload, ProviderMemoryQueryRewriter } from "./memory-query-rewriter";
import type { ProviderAdapter } from "../../providers/contracts";

describe("ProviderMemoryQueryRewriter",()=>{
  it("parses only a bounded JSON array and removes the original query",()=>{
    expect(parseRewritePayload(
      '["pet dog name","dog called","what is my pet called","original"]',
      "original",
    )).toEqual(["pet dog name","dog called","what is my pet called"]);
    expect(parseRewritePayload("not-json","q")).toEqual([]);
  });

  it("never sends stored memory content to the rewrite provider",async()=>{
    let captured="";
    const provider:ProviderAdapter={
      id:"fake",
      async listModels(){return [];},
      async *stream(request){
        captured=JSON.stringify(request);
        yield {delta:'["pet dog name","dog called"]'};
      },
    };
    const rewriter=new ProviderMemoryQueryRewriter(provider,"free");
    const out=await rewriter.rewrite("What is my pet called?",new AbortController().signal);
    expect(out).toEqual(["pet dog name","dog called"]);
    expect(captured).toContain("What is my pet called?");
    expect(captured).not.toContain("Max");
  });
});

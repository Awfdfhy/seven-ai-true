import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { TaskManager } from "../../core/task-manager";
import { SevenError } from "../../core/errors";
import { InMemoryToolAuthoritySource } from "./authority";
import type { ToolDefinition, ToolInvocation } from "./contracts";
import { ToolExecutor } from "./executor";
import { ToolRegistry } from "./registry";
import { IndexedDbToolExecutionLedger } from "../../storage/tool-execution-ledger";

function authority(capability:string){
  const source=new InMemoryToolAuthoritySource();
  source.setGrant({
    grantId:"grant",capabilities:[capability],scope:{roomId:"room"},
    issuedAt:0,expiresAt:Number.MAX_SAFE_INTEGER,source:"system",
  });
  return source;
}
function invocation(toolId:string,key:string):ToolInvocation{
  return {
    callId:crypto.randomUUID(),taskId:"task",roomId:"room",toolId,
    args:{value:"x"},idempotencyKey:key,requestedAt:Date.now(),
  };
}
function readDefinition(handler:ToolDefinition<{value:string},{ok:boolean}>["handler"]):ToolDefinition<{value:string},{ok:boolean}>{
  return {
    id:"read.demo",version:"1.0.0",title:"Read demo",description:"Read-only retry test.",
    inputSchema:z.object({value:z.string()}).strict(),
    outputSchema:z.object({ok:z.boolean()}).strict(),
    requiredCapabilities:["read.demo"],
    annotations:{risk:"read",idempotency:"idempotent",approval:"never",sensitivity:"public",reversibility:"reversible"},
    timeoutMs:500,maxResultBytes:512,handler,
  };
}

describe("Tool kernel post-merge hardening",()=>{
  it("releases a pre-effect retryable failure so the same idempotency key can retry",async()=>{
    const db=`tool-release-${crypto.randomUUID()}`;
    let calls=0;
    const registry=new ToolRegistry();
    registry.register(readDefinition(async()=>{
      calls+=1;
      if(calls===1)throw new SevenError({code:"NETWORK",message:"temporary",retryable:true});
      return {ok:true};
    }));
    const ledger=new IndexedDbToolExecutionLedger(db);
    const executor=new ToolExecutor(registry,new TaskManager(),authority("read.demo"),undefined,undefined,256,ledger);
    const first=await executor.execute(invocation("read.demo","same"));
    expect(first.status).toBe("failed");
    const second=await executor.execute(invocation("read.demo","same"));
    expect(second.status).toBe("succeeded");
    expect(calls).toBe(2);
    await ledger.close();
  });

  it("requires effectful handlers to durably mark effect start before reporting success",async()=>{
    const registry=new ToolRegistry();
    registry.register({
      id:"write.demo",version:"1.0.0",title:"Write demo",description:"Effect marker contract test.",
      inputSchema:z.object({value:z.string()}).strict(),
      outputSchema:z.object({ok:z.boolean()}).strict(),
      requiredCapabilities:["write.demo"],
      annotations:{risk:"write",idempotency:"non-idempotent",approval:"never",sensitivity:"user-data",reversibility:"irreversible"},
      timeoutMs:500,maxResultBytes:512,
      async handler(){return {ok:true};},
    });
    const result=await new ToolExecutor(
      registry,new TaskManager(),authority("write.demo"),
    ).execute(invocation("write.demo","marker"));
    expect(result.status).toBe("effect_unknown");
    expect(result.errorCode).toBe("EFFECT_MARKER_REQUIRED");
    expect(result.effectStarted).toBe(true);
  });

  it("preserves prepared lease safety if ledger release itself cannot complete",async()=>{
    const registry=new ToolRegistry();
    registry.register(readDefinition(async()=>{throw new SevenError({code:"NETWORK",message:"temporary",retryable:true});}));
    const result=await new ToolExecutor(
      registry,new TaskManager(),authority("read.demo"),
    ).execute(invocation("read.demo","release-safe"));
    expect(result.status).toBe("failed");
    expect(result.effectStarted).toBe(false);
  });
});

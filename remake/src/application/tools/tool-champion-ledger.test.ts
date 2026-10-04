import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { TaskManager } from "../../core/task-manager";
import { InMemoryToolAuthoritySource } from "./authority";
import { invocationFingerprint } from "./canonical";
import type { ToolApproval, ToolDefinition, ToolGrant, ToolInvocation } from "./contracts";
import { ToolExecutor } from "./executor";
import { ToolRegistry } from "./registry";
import { TOOL_PREPARED_LEASE_MS } from "./ledger";
import { IndexedDbToolExecutionLedger } from "../../storage/tool-execution-ledger";

function grant():ToolGrant{
  const now=Date.now();
  return {
    grantId:"g",capabilities:["write.demo"],scope:{roomId:"room"},
    issuedAt:now-1000,expiresAt:now+60_000,source:"user",
  };
}
function inv(key:string,callId=crypto.randomUUID()):ToolInvocation{
  return {
    callId,taskId:"task",roomId:"room",toolId:"demo.write",
    args:{value:"x"},idempotencyKey:key,requestedAt:Date.now(),
  };
}
function definition(counter:{value:number},approval:"never"|"always"="never"):ToolDefinition<{value:string},{done:boolean}>{
  return {
    id:"demo.write",version:"1.0.0",title:"Demo write",description:"Test durable side effect.",
    inputSchema:z.object({value:z.string()}).strict(),
    outputSchema:z.object({done:z.boolean()}).strict(),
    requiredCapabilities:["write.demo"],
    annotations:{risk:"write",idempotency:"non-idempotent",approval,sensitivity:"user-data",reversibility:"irreversible"},
    timeoutMs:1000,maxResultBytes:256,
    async handler(ctx){
      await ctx.markEffectStarted();
      counter.value+=1;
      return {done:true};
    },
  };
}
function authority(approval?:ToolApproval){
  const source=new InMemoryToolAuthoritySource();source.setGrant(grant());
  if(approval)source.setApproval(approval);
  return source;
}

describe("Tools v1 champion durable ledger",()=>{
  it("replays a completed side effect after restart without executing twice",async()=>{
    const name=`tool-ledger-${crypto.randomUUID()}`;
    const counter={value:0};const registry=new ToolRegistry();registry.register(definition(counter));
    const firstInvocation=inv("persisted");
    const ledger1=new IndexedDbToolExecutionLedger(name);
    expect((await new ToolExecutor(registry,new TaskManager(),authority(),undefined,undefined,256,ledger1).execute(firstInvocation)).status).toBe("succeeded");
    expect(counter.value).toBe(1);await ledger1.close();

    const ledger2=new IndexedDbToolExecutionLedger(name);
    const replay=await new ToolExecutor(registry,new TaskManager(),authority(),undefined,undefined,256,ledger2)
      .execute({...firstInvocation,callId:crypto.randomUUID()});
    expect(replay.status).toBe("succeeded");
    expect(counter.value).toBe(1);await ledger2.close();
  });

  it("recovers post-effect crashes as effect_unknown and never repeats the handler",async()=>{
    const name=`tool-uncertain-${crypto.randomUUID()}`;
    const counter={value:0};const registry=new ToolRegistry();const def=definition(counter);registry.register(def);
    const invocation=inv("uncertain","owner-old");
    const fp=await invocationFingerprint({toolId:def.id,version:def.version,roomId:"room",taskId:"task",args:{value:"x"}});
    const ledger=new IndexedDbToolExecutionLedger(name);
    await ledger.claimInvocation({
      idempotencyKey:"uncertain",invocationFingerprint:fp,ownerCallId:"owner-old",preparedAt:Date.now()-1000,
    });
    await ledger.markEffectStarted("uncertain",fp,"owner-old",Date.now()-900);
    await ledger.close();

    const reopened=new IndexedDbToolExecutionLedger(name);
    const result=await new ToolExecutor(registry,new TaskManager(),authority(),undefined,undefined,256,reopened)
      .execute({...invocation,callId:crypto.randomUUID()});
    expect(result.status).toBe("effect_unknown");
    expect(counter.value).toBe(0);await reopened.close();
  });

  it("blocks a fresh prepared lease but safely takes over a stale pre-effect lease",async()=>{
    const name=`tool-prepared-${crypto.randomUUID()}`;
    const counter={value:0};const registry=new ToolRegistry();const def=definition(counter);registry.register(def);
    const fp=await invocationFingerprint({toolId:def.id,version:def.version,roomId:"room",taskId:"task",args:{value:"x"}});
    const ledger=new IndexedDbToolExecutionLedger(name);
    await ledger.claimInvocation({
      idempotencyKey:"lease",invocationFingerprint:fp,ownerCallId:"old",preparedAt:Date.now(),
    });
    const executor=new ToolExecutor(registry,new TaskManager(),authority(),undefined,undefined,256,ledger);
    const fresh=await executor.execute(inv("lease"));
    expect(fresh.status).toBe("failed");
    expect(fresh.errorCode).toBe("INVOCATION_IN_PROGRESS");
    expect(counter.value).toBe(0);
    await ledger.close();

    const name2=`tool-stale-${crypto.randomUUID()}`;
    const ledger2=new IndexedDbToolExecutionLedger(name2);
    await ledger2.claimInvocation({
      idempotencyKey:"stale",invocationFingerprint:fp,ownerCallId:"old",
      preparedAt:Date.now()-TOOL_PREPARED_LEASE_MS-5000,
    });
    const recovered=await new ToolExecutor(registry,new TaskManager(),authority(),undefined,undefined,256,ledger2)
      .execute(inv("stale"));
    expect(recovered.status).toBe("succeeded");
    expect(counter.value).toBe(1);await ledger2.close();
  });

  it("consumes one-shot approval atomically with the invocation claim",async()=>{
    const name=`tool-approval-${crypto.randomUUID()}`;
    const counter={value:0};const registry=new ToolRegistry();const def=definition(counter,"always");registry.register(def);
    const first=inv("first","call-first");
    const fp=await invocationFingerprint({toolId:def.id,version:def.version,roomId:"room",taskId:"task",args:{value:"x"}});
    const approval:ToolApproval={
      approvalId:"one-shot",invocationFingerprint:fp,
      issuedAt:Date.now()-1000,expiresAt:Date.now()+60_000,oneShot:true,
    };
    const ledger=new IndexedDbToolExecutionLedger(name);
    expect((await new ToolExecutor(registry,new TaskManager(),authority(approval),undefined,undefined,256,ledger).execute(first)).status).toBe("succeeded");
    const second=await new ToolExecutor(registry,new TaskManager(),authority(approval),undefined,undefined,256,ledger)
      .execute(inv("second","call-second"));
    expect(second.status).toBe("denied");
    expect(counter.value).toBe(1);await ledger.close();
  });
});

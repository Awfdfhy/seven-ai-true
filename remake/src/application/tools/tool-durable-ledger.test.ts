import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { TaskManager } from "../../core/task-manager";
import { InMemoryToolAuthoritySource } from "./authority";
import { ToolExecutor } from "./executor";
import { IndexedDbToolExecutionLedger } from "./ledger";
import { ToolRegistry } from "./registry";
import type { ToolGrant, ToolInvocation } from "./contracts";

function grant():ToolGrant{
  const now=Date.now();
  return {
    grantId:"g",capabilities:["write.demo"],scope:{roomId:"room"},
    issuedAt:now-1000,expiresAt:now+60_000,source:"user",
  };
}
function inv(key:string):ToolInvocation{
  return {
    callId:crypto.randomUUID(),taskId:"task",roomId:"room",
    toolId:"demo.write",args:{value:"x"},idempotencyKey:key,requestedAt:Date.now(),
  };
}
function registry(counter:{value:number}):ToolRegistry{
  const r=new ToolRegistry();
  r.register({
    id:"demo.write",version:"1.0.0",title:"Demo write",description:"Test side effect.",
    inputSchema:z.object({value:z.string()}).strict(),
    outputSchema:z.object({done:z.boolean()}).strict(),
    requiredCapabilities:["write.demo"],
    annotations:{risk:"write",idempotency:"non-idempotent",approval:"never",sensitivity:"user-data",reversibility:"irreversible"},
    timeoutMs:1000,maxResultBytes:256,
    async handler(ctx){ctx.markEffectStarted();counter.value+=1;return {done:true};},
  });
  return r;
}

describe("durable tool replay ledger",()=>{
  it("replays completed result after executor restart without repeating the side effect",async()=>{
    const name=`tool-ledger-${crypto.randomUUID()}`;
    const ledger1=new IndexedDbToolExecutionLedger(name);
    const authority=new InMemoryToolAuthoritySource();authority.setGrant(grant());
    const counter={value:0};
    const firstInv=inv("persisted");
    const first=new ToolExecutor(registry(counter),new TaskManager(),authority,undefined,undefined,256,ledger1);
    expect((await first.execute(firstInv)).status).toBe("succeeded");
    expect(counter.value).toBe(1);
    await ledger1.close();

    const ledger2=new IndexedDbToolExecutionLedger(name);
    const second=new ToolExecutor(registry(counter),new TaskManager(),authority,undefined,undefined,256,ledger2);
    const replay=await second.execute({...firstInv,callId:crypto.randomUUID()});
    expect(replay.status).toBe("succeeded");
    expect(counter.value).toBe(1);
    await ledger2.close();
  });

  it("fails safe after restart if a reservation exists without a completion",async()=>{
    const name=`tool-ledger-uncertain-${crypto.randomUUID()}`;
    const ledger=new IndexedDbToolExecutionLedger(name);
    const authority=new InMemoryToolAuthoritySource();authority.setGrant(grant());
    const counter={value:0};
    const invocation=inv("uncertain");
    const { invocationFingerprint }=await import("./canonical");
    const fingerprint=await invocationFingerprint({
      toolId:"demo.write",version:"1.0.0",roomId:"room",taskId:"task",args:{value:"x"},
    });
    await ledger.reserveReplay("uncertain",fingerprint,Date.now()-1000);
    const executor=new ToolExecutor(registry(counter),new TaskManager(),authority,undefined,undefined,256,ledger);
    const result=await executor.execute(invocation);
    expect(result.status).toBe("effect_unknown");
    expect(counter.value).toBe(0);
    await ledger.close();
  });

  it("persists one-shot approval consumption across restarts",async()=>{
    const name=`tool-ledger-approval-${crypto.randomUUID()}`;
    const ledger1=new IndexedDbToolExecutionLedger(name);
    expect(await ledger1.consumeApproval("approval","fp",Date.now())).toBe(true);
    await ledger1.close();
    const ledger2=new IndexedDbToolExecutionLedger(name);
    expect(await ledger2.consumeApproval("approval","fp",Date.now())).toBe(false);
    await ledger2.close();
  });
});

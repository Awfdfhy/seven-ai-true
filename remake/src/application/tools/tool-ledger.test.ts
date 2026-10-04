import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { TaskManager } from "../../core/task-manager";
import { InMemoryToolAuthoritySource } from "./authority";
import { invocationFingerprint } from "./canonical";
import type { ToolDefinition, ToolInvocation } from "./contracts";
import { IndexedDbToolEffectLedger } from "./effect-ledger";
import { ToolExecutor } from "./executor";
import { ToolRegistry } from "./registry";

function def(calls:{value:number}):ToolDefinition<{message:string},{ok:boolean}>{
  return {
    id:"external.send",version:"1.0.0",title:"Send",description:"Send an external message.",
    inputSchema:z.object({message:z.string().min(1)}).strict(),
    outputSchema:z.object({ok:z.boolean()}).strict(),
    requiredCapabilities:["external.send"],
    annotations:{
      risk:"external",idempotency:"replay-guarded",approval:"never",
      sensitivity:"user-data",reversibility:"irreversible",
    },
    timeoutMs:500,maxResultBytes:512,
    async handler(ctx){
      await ctx.markEffectStarted();
      calls.value+=1;
      return {ok:true};
    },
  };
}
function inv(key="send-1"):ToolInvocation{
  return {
    callId:crypto.randomUUID(),taskId:"t1",roomId:"r1",
    toolId:"external.send",args:{message:"hello"},
    idempotencyKey:key,requestedAt:1,
  };
}
function authority(){
  const source=new InMemoryToolAuthoritySource();
  source.setGrant({
    grantId:"g1",capabilities:["external.send"],scope:{roomId:"r1"},
    issuedAt:1,expiresAt:9_999_999_999_999,source:"user",
  });
  return source;
}

describe("Durable Tool Effect Ledger",()=>{
  it("replays a completed external effect across executor restarts without executing twice",async()=>{
    const db=`tool-ledger-${crypto.randomUUID()}`;
    const calls={value:0};
    const registry=new ToolRegistry();registry.register(def(calls));
    const ledger1=new IndexedDbToolEffectLedger(db);
    const firstInvocation=inv("stable-key");
    const first=await new ToolExecutor(
      registry,new TaskManager(),authority(),undefined,undefined,256,ledger1,
    ).execute(firstInvocation);
    expect(first.status).toBe("succeeded");
    expect(calls.value).toBe(1);
    await ledger1.close();

    const ledger2=new IndexedDbToolEffectLedger(db);
    const second=await new ToolExecutor(
      registry,new TaskManager(),authority(),undefined,undefined,256,ledger2,
    ).execute({...firstInvocation,callId:crypto.randomUUID()});
    expect(second.status).toBe("succeeded");
    expect(calls.value).toBe(1);
    await ledger2.close();
  });

  it("recovers an interrupted post-effect invocation as effect_unknown instead of retrying",async()=>{
    const db=`tool-ledger-uncertain-${crypto.randomUUID()}`;
    const calls={value:0};
    const registry=new ToolRegistry();const definition=def(calls);registry.register(definition);
    const ledger=new IndexedDbToolEffectLedger(db);
    const invocation=inv("uncertain-key");
    const fingerprint=await invocationFingerprint({
      toolId:definition.id,version:definition.version,
      roomId:invocation.roomId,taskId:invocation.taskId,args:invocation.args,
    });
    await ledger.prepare({
      idempotencyKey:invocation.idempotencyKey,fingerprint,
      callId:invocation.callId,toolId:invocation.toolId,
      roomId:invocation.roomId,taskId:invocation.taskId,
      state:"prepared",preparedAt:10,
    });
    await ledger.markEffectStarted(invocation.idempotencyKey,fingerprint,11);
    await ledger.close();

    const reopened=new IndexedDbToolEffectLedger(db);
    const result=await new ToolExecutor(
      registry,new TaskManager(),authority(),undefined,undefined,256,reopened,
    ).execute({...invocation,callId:crypto.randomUUID()});
    expect(result.status).toBe("effect_unknown");
    expect(result.errorCode).toBe("RECOVERED_UNCERTAIN_EXTERNAL_EFFECT");
    expect(calls.value).toBe(0);
    await reopened.close();
  });

  it("rejects changed arguments that reuse a durable idempotency key",async()=>{
    const db=`tool-ledger-mismatch-${crypto.randomUUID()}`;
    const calls={value:0};
    const registry=new ToolRegistry();registry.register(def(calls));
    const ledger=new IndexedDbToolEffectLedger(db);
    const executor=new ToolExecutor(
      registry,new TaskManager(),authority(),undefined,undefined,256,ledger,
    );
    const original=inv("same-key");
    expect((await executor.execute(original)).status).toBe("succeeded");
    const changed=await executor.execute({
      ...original,callId:crypto.randomUUID(),args:{message:"different"},
    });
    expect(changed.status).toBe("invalid");
    expect(calls.value).toBe(1);
    await ledger.close();
  });
});

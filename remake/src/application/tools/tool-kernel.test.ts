import { beforeEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { TaskManager } from "../../core/task-manager";
import { invocationFingerprint } from "./canonical";
import { ToolExecutor } from "./executor";
import { ToolRegistry } from "./registry";
import { InMemoryToolAuthoritySource } from "./authority";
import type { ToolApproval, ToolAuditEvent, ToolDefinition, ToolGrant, ToolInvocation } from "./contracts";

function definition(
  handler:ToolDefinition<{value:string},{ok:boolean;value:string}>["handler"],
  overrides:Partial<ToolDefinition<{value:string},{ok:boolean;value:string}>>={},
):ToolDefinition<{value:string},{ok:boolean;value:string}>{
  return {
    id:"test.echo",
    version:"1.0.0",
    title:"Echo",
    description:"Echo a bounded test value.",
    inputSchema:z.object({value:z.string().min(1).max(50)}).strict(),
    outputSchema:z.object({ok:z.boolean(),value:z.string()}).strict(),
    requiredCapabilities:["test.read"],
    annotations:{
      risk:"read",idempotency:"idempotent",approval:"never",
      sensitivity:"public",reversibility:"reversible",
    },
    timeoutMs:500,
    maxResultBytes:1024,
    handler,
    ...overrides,
  };
}

function invocation(args:unknown={value:"hello"},key="idem-1"):ToolInvocation{
  return {
    callId:crypto.randomUUID(),taskId:"task-1",roomId:"room-1",
    toolId:"test.echo",args,idempotencyKey:key,requestedAt:Date.now(),
  };
}

function grant(overrides:Partial<ToolGrant>={}):ToolGrant{
  const now=Date.now();
  return {
    grantId:"grant-1",capabilities:["test.read"],scope:{roomId:"room-1"},
    issuedAt:now-60_000,expiresAt:now+60_000,source:"user",...overrides,
  };
}

describe("Tool capability kernel",()=>{
  let authority:InMemoryToolAuthoritySource;

  beforeEach(()=>{
    authority=new InMemoryToolAuthoritySource();
    authority.setGrant(grant());
  });
  it("rejects invalid arguments before handler execution",async()=>{
    let calls=0;
    const registry=new ToolRegistry();
    registry.register(definition(async(_ctx,input)=>{calls++;return {ok:true,value:input.value};}));
    const result=await new ToolExecutor(registry,new TaskManager(),authority).execute(
      invocation({value:"",extra:true}),
    );
    expect(result.status).toBe("invalid");
    expect(calls).toBe(0);
  });

  it("fails closed without required capability",async()=>{
    let calls=0;
    const registry=new ToolRegistry();
    registry.register(definition(async(_ctx,input)=>{calls++;return {ok:true,value:input.value};}));
    authority=new InMemoryToolAuthoritySource();
    authority.setGrant(grant({capabilities:["other.read"]}));
    const result=await new ToolExecutor(registry,new TaskManager(),authority).execute(invocation());
    expect(result.status).toBe("denied");
    expect(calls).toBe(0);
  });

  it("binds approval to exact tool arguments and scope",async()=>{
    let calls=0;
    const def=definition(async(_ctx,input)=>{calls++;return {ok:true,value:input.value};},{
      annotations:{risk:"write",idempotency:"replay-guarded",approval:"always",sensitivity:"user-data",reversibility:"reversible"},
      requiredCapabilities:["test.write"],
    });
    const registry=new ToolRegistry();registry.register(def);
    const inv=invocation({value:"approved"},"approval-key");
    const fingerprint=await invocationFingerprint({
      toolId:def.id,version:def.version,roomId:inv.roomId,taskId:inv.taskId,args:{value:"approved"},
    });
    const now=Date.now();
    const approval:ToolApproval={
      approvalId:"approval-1",invocationFingerprint:fingerprint,
      issuedAt:now-1_000,expiresAt:now+60_000,oneShot:true,
    };
    const writeGrant=grant({capabilities:["test.write"]});
    authority=new InMemoryToolAuthoritySource();
    authority.setGrant(writeGrant);
    authority.setApproval(approval);
    const executor=new ToolExecutor(registry,new TaskManager(),authority);
    expect((await executor.execute(inv)).status).toBe("succeeded");
    expect(calls).toBe(1);
    const mutated={...inv,callId:crypto.randomUUID(),idempotencyKey:"mutated",args:{value:"changed"}} as ToolInvocation;
    expect((await executor.execute(mutated)).status).toBe("denied");
    expect(calls).toBe(1);
  });

  it("replays the same idempotency key exactly once and rejects changed args",async()=>{
    let calls=0;
    const registry=new ToolRegistry();
    registry.register(definition(async(_ctx,input)=>{
      calls++;await new Promise(resolve=>setTimeout(resolve,10));return {ok:true,value:input.value};
    }));
    const executor=new ToolExecutor(registry,new TaskManager(),authority);
    const inv=invocation({value:"once"},"same");
    const [a,b]=await Promise.all([
      executor.execute(inv),
      executor.execute({...inv,callId:inv.callId}),
    ]);
    expect(a.status).toBe("succeeded");
    expect(b.status).toBe("succeeded");
    expect(calls).toBe(1);
    const changed=await executor.execute({
      ...inv,callId:crypto.randomUUID(),args:{value:"twice"},
    });
    expect(changed.status).toBe("invalid");
    expect(calls).toBe(1);
  });

  it("classifies timeout after effect start as effect_unknown",async()=>{
    const registry=new ToolRegistry();
    registry.register(definition(async(ctx)=>{
      ctx.markEffectStarted();
      await new Promise<void>((resolve,reject)=>{
        const timer=setTimeout(resolve,500);
        ctx.signal.addEventListener("abort",()=>{clearTimeout(timer);reject(new DOMException("Aborted","AbortError"));},{once:true});
      });
      return {ok:true,value:"late"};
    },{timeoutMs:60,annotations:{risk:"write",idempotency:"non-idempotent",approval:"never",sensitivity:"public",reversibility:"irreversible"}}));
    const result=await new ToolExecutor(registry,new TaskManager(),authority).execute(invocation());
    expect(result.status).toBe("effect_unknown");
    expect(result.effectStarted).toBe(true);
  });

  it("keeps audit metadata content-free",async()=>{
    const events:ToolAuditEvent[]=[];
    const registry=new ToolRegistry();
    registry.register(definition(async(_ctx,input)=>({ok:true,value:input.value})));
    const executor=new ToolExecutor(registry,new TaskManager(),authority,undefined,{record(event){events.push(event);}});
    const secretText="do-not-log-this-value";
    await executor.execute(invocation({value:secretText}));
    expect(events).toHaveLength(1);
    expect(JSON.stringify(events)).not.toContain(secretText);
    expect(events[0]?.invocationFingerprint).toMatch(/^[a-f0-9]{64}$/);
  });

  it("uses runtime time rather than caller-controlled requestedAt for grant expiry",async()=>{
    const registry=new ToolRegistry();
    let calls=0;
    registry.register(definition(async(_ctx,input)=>{calls++;return {ok:true,value:input.value};}));
    authority=new InMemoryToolAuthoritySource();
    authority.setGrant(grant({issuedAt:1,expiresAt:2}));
    const forged={...invocation(),requestedAt:1};
    const result=await new ToolExecutor(registry,new TaskManager(),authority).execute(forged);
    expect(result.status).toBe("denied");
    expect(calls).toBe(0);
  });

  it("rejects duplicate registry identities",()=>{
    const registry=new ToolRegistry();
    registry.register(definition(async(_ctx,input)=>({ok:true,value:input.value})));
    expect(()=>registry.register(definition(async(_ctx,input)=>({ok:true,value:input.value})))).toThrow();
  });
});

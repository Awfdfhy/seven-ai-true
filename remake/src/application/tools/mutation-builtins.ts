import { z } from "zod";
import { SevenError } from "../../core/errors";
import type { MemoryFabricService } from "../memory/memory-fabric-service";
import { ToolRegistry } from "./registry";

export function registerBuiltinMemoryMutationTools(
  registry:ToolRegistry,
  memory:MemoryFabricService,
):void{
  registry.register({
    id:"memory.set_tier",
    version:"1.0.0",
    title:"Pin or unpin memory",
    description:"Change one exact saved memory between Core (pinned) and Recall (retrieved when relevant).",
    inputSchema:z.object({
      memoryId:z.string().min(1).max(256),
      expectedUpdatedAt:z.number().finite().nonnegative(),
      tier:z.enum(["core","recall"]),
    }).strict(),
    outputSchema:z.object({
      memoryId:z.string(),
      tier:z.enum(["core","recall"]),
      updatedAt:z.number(),
    }).strict(),
    requiredCapabilities:["memory.write"],
    annotations:{
      risk:"write",
      idempotency:"replay-guarded",
      approval:"always",
      sensitivity:"user-data",
      reversibility:"reversible",
    },
    timeoutMs:5_000,
    maxResultBytes:2_048,
    concurrencyGroup:"memory.write",
    async handler(ctx,input){
      const active=await memory.listActive(ctx.roomId,ctx.signal);
      const current=active.find(fact=>fact.id===input.memoryId);
      if(!current){
        throw new SevenError({code:"VALIDATION",message:"The approved memory no longer exists."});
      }
      if(current.updatedAt!==input.expectedUpdatedAt){
        throw new SevenError({code:"VALIDATION",message:"The approved memory changed before execution."});
      }
      await ctx.markEffectStarted();
      const updated=await memory.updateMemory(
        input.memoryId,
        ctx.roomId,
        {tier:input.tier},
        ctx.signal,
      );
      return {memoryId:updated.id,tier:updated.tier,updatedAt:updated.updatedAt};
    },
  });

  registry.register({
    id:"memory.forget",
    version:"1.0.0",
    title:"Forget saved memory",
    description:"Permanently remove one exact saved memory from Seven's active memory.",
    inputSchema:z.object({
      memoryId:z.string().min(1).max(256),
      expectedUpdatedAt:z.number().finite().nonnegative(),
    }).strict(),
    outputSchema:z.object({
      memoryId:z.string(),
      forgotten:z.boolean(),
    }).strict(),
    requiredCapabilities:["memory.delete"],
    annotations:{
      risk:"destructive",
      idempotency:"replay-guarded",
      approval:"always",
      sensitivity:"user-data",
      reversibility:"irreversible",
    },
    timeoutMs:5_000,
    maxResultBytes:1_024,
    concurrencyGroup:"memory.write",
    async handler(ctx,input){
      const active=await memory.listActive(ctx.roomId,ctx.signal);
      const current=active.find(fact=>fact.id===input.memoryId);
      if(!current){
        throw new SevenError({code:"VALIDATION",message:"The approved memory no longer exists."});
      }
      if(current.updatedAt!==input.expectedUpdatedAt){
        throw new SevenError({code:"VALIDATION",message:"The approved memory changed before execution."});
      }
      await ctx.markEffectStarted();
      const forgotten=await memory.forget(input.memoryId,ctx.roomId,ctx.signal);
      return {memoryId:input.memoryId,forgotten};
    },
  });
}

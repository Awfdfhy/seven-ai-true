import { z } from "zod";
import { SevenError } from "../../core/errors";
import type { ToolRegistry } from "../tools/registry";
import type { CodingRepositoryPort, RepositoryCommitChange } from "./repository-port";

const repo=z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);
const sha=z.string().regex(/^[a-f0-9]{40}$/i);
const path=z.string().min(1).max(2048);
const branch=z.string().min(1).max(256);
const change=z.discriminatedUnion("kind",[
  z.object({kind:z.literal("upsert"),path,content:z.string().max(2_000_000)}).strict(),
  z.object({kind:z.literal("delete"),path}).strict(),
]);

export function registerCodingRepositoryTools(
  registry:ToolRegistry,
  backend:CodingRepositoryPort,
):void{
  registry.register({
    id:"coding.repo.head",version:"1.0.0",title:"Coding repository head",
    description:"Read the exact commit SHA at a repository branch head.",
    inputSchema:z.object({repository:repo,branch}).strict(),
    outputSchema:z.object({headSha:sha}).strict(),
    requiredCapabilities:["coding.repo.read"],
    annotations:{risk:"read",idempotency:"idempotent",approval:"never",sensitivity:"user-data",reversibility:"reversible"},
    timeoutMs:30_000,maxResultBytes:1024,
    handler:async(ctx,input)=>({headSha:await backend.getHead({...input,signal:ctx.signal})}),
  });
  registry.register({
    id:"coding.repo.list",version:"1.0.0",title:"Coding repository tree",
    description:"List repository blob paths at an exact commit SHA.",
    inputSchema:z.object({repository:repo,commitSha:sha}).strict(),
    outputSchema:z.object({entries:z.array(z.object({
      path,blobSha:sha,bytes:z.number().int().nonnegative(),mode:z.string().optional(),
    }).strict()).max(100_000)}).strict(),
    requiredCapabilities:["coding.repo.read"],
    annotations:{risk:"read",idempotency:"idempotent",approval:"never",sensitivity:"user-data",reversibility:"reversible"},
    timeoutMs:60_000,maxResultBytes:1_000_000,
    handler:async(ctx,input)=>({entries:[...await backend.listFiles({...input,signal:ctx.signal})]}),
  });
  registry.register({
    id:"coding.repo.read",version:"1.0.0",title:"Coding repository read",
    description:"Read selected UTF-8 repository files from an exact commit SHA.",
    inputSchema:z.object({repository:repo,commitSha:sha,paths:z.array(path).min(1).max(256)}).strict(),
    outputSchema:z.object({files:z.array(z.object({path,content:z.string().max(2_000_000)}).strict()).max(256)}).strict(),
    requiredCapabilities:["coding.repo.read"],
    annotations:{risk:"read",idempotency:"idempotent",approval:"never",sensitivity:"user-data",reversibility:"reversible"},
    timeoutMs:120_000,maxResultBytes:1_000_000,
    handler:async(ctx,input)=>{
      const files=await backend.readFiles({...input,signal:ctx.signal});
      const bytes=files.reduce((sum,file)=>sum+new TextEncoder().encode(file.content).byteLength,0);
      if(bytes>900_000)throw new SevenError({code:"TOOL",message:"Coding repository read exceeds tool result budget."});
      return {files:[...files]};
    },
  });
  registry.register({
    id:"coding.repo.commit",version:"1.0.0",title:"Coding repository commit",
    description:"Atomically create a Git commit from an exact base SHA and advance the branch without force.",
    inputSchema:z.object({
      repository:repo,branch,baseSha:sha,message:z.string().min(1).max(512),
      changes:z.array(change).min(1).max(24),
    }).strict(),
    outputSchema:z.object({commitSha:sha,changedPaths:z.array(path).min(1).max(24)}).strict(),
    requiredCapabilities:["coding.repo.write"],
    annotations:{risk:"write",idempotency:"replay-guarded",approval:"if-mutating",sensitivity:"user-data",reversibility:"compensatable"},
    timeoutMs:120_000,maxResultBytes:16_384,concurrencyGroup:"coding.repo.mutation",
    handler:async(ctx,input)=>{
      const total=input.changes.reduce((sum,item)=>sum+(item.kind==="upsert"?new TextEncoder().encode(item.content).byteLength:0),0);
      if(total>2_000_000)throw new SevenError({code:"VALIDATION",message:"Coding commit exceeds write budget."});
      const current=await backend.getHead({repository:input.repository,branch:input.branch,signal:ctx.signal});
      if(current.toLowerCase()!==input.baseSha.toLowerCase())throw new SevenError({code:"VALIDATION",message:"Coding commit base is stale."});
      await ctx.markEffectStarted();
      const result=await backend.commit({
        repository:input.repository,branch:input.branch,baseSha:input.baseSha,
        message:input.message,changes:input.changes as readonly RepositoryCommitChange[],signal:ctx.signal,
      });
      return {commitSha:result.commitSha,changedPaths:[...result.changedPaths]};
    },
  });
}

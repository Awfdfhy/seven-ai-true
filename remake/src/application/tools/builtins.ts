import { z } from "zod";
import type { MemoryFabricService } from "../memory/memory-fabric-service";
import type { RoomRepository } from "../../storage/room-repository";
import { ToolRegistry } from "./registry";

const memoryItemSchema=z.object({
  id:z.string(),
  content:z.string(),
  kind:z.string(),
  tier:z.enum(["core","recall"]),
  scope:z.enum(["global","room"]),
  updatedAt:z.number(),
  score:z.number(),
}).strict();

const roomItemSchema=z.object({
  id:z.string(),
  title:z.string(),
  updatedAt:z.number(),
  snippet:z.string().optional(),
}).strict();

function normalized(value:string):string{
  return value.normalize("NFKC").toLocaleLowerCase("en-US")
    .replace(/[\u064B-\u065F\u0670]/g,"")
    .replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه");
}
function terms(value:string):readonly string[]{
  return Object.freeze([...new Set(normalized(value).match(/[\p{L}\p{N}_-]{2,}/gu)??[])]);
}
function boundedSnippet(value:string,max=240):string{
  const clean=value.replace(/[\s\u00A0]+/g," ").trim();
  return clean.length<=max?clean:`${clean.slice(0,max-1)}…`;
}

export type BuiltinReadToolDependencies=Readonly<{
  memory:MemoryFabricService;
  rooms:RoomRepository;
}>;

export function registerBuiltinReadTools(
  registry:ToolRegistry,
  deps:BuiltinReadToolDependencies,
):void{
  registry.register({
    id:"memory.search",
    version:"1.0.0",
    title:"Search memory",
    description:"Search Seven's local durable memory for information relevant to the current room.",
    inputSchema:z.object({
      query:z.string().trim().min(2).max(300),
      maxResults:z.number().int().min(1).max(12).default(6),
    }).strict(),
    outputSchema:z.object({
      items:z.array(memoryItemSchema).max(12),
    }).strict(),
    requiredCapabilities:["memory.read"],
    annotations:{
      risk:"read",idempotency:"idempotent",approval:"never",
      sensitivity:"user-data",reversibility:"reversible",
    },
    timeoutMs:4_000,
    maxResultBytes:16_384,
    concurrencyGroup:"memory.read",
    async handler(ctx,input){
      const hits=await deps.memory.searchLocal(
        ctx.roomId,input.query,ctx.signal,{maxCore:2,maxRecall:input.maxResults},
      );
      return {
        items:hits.slice(0,input.maxResults).map(hit=>({
          id:hit.fact.id,
          content:boundedSnippet(hit.fact.content,600),
          kind:hit.fact.kind,
          tier:hit.fact.tier,
          scope:hit.fact.scope,
          updatedAt:hit.fact.updatedAt,
          score:hit.score,
        })),
      };
    },
  });

  registry.register({
    id:"memory.list",
    version:"1.0.0",
    title:"List saved memory",
    description:"List a bounded set of active local memories available to the current room.",
    inputSchema:z.object({
      tier:z.enum(["core","recall"]).optional(),
      maxResults:z.number().int().min(1).max(20).default(10),
    }).strict(),
    outputSchema:z.object({
      items:z.array(memoryItemSchema.omit({score:true})).max(20),
    }).strict(),
    requiredCapabilities:["memory.read"],
    annotations:{
      risk:"read",idempotency:"idempotent",approval:"never",
      sensitivity:"user-data",reversibility:"reversible",
    },
    timeoutMs:3_000,
    maxResultBytes:24_000,
    concurrencyGroup:"memory.read",
    async handler(ctx,input){
      const facts=await deps.memory.listActive(ctx.roomId,ctx.signal);
      const items=facts
        .filter(fact=>input.tier===undefined||fact.tier===input.tier)
        .sort((a,b)=>(b.importance*b.confidence)-(a.importance*a.confidence)||b.updatedAt-a.updatedAt)
        .slice(0,input.maxResults)
        .map(fact=>({
          id:fact.id,
          content:boundedSnippet(fact.content,600),
          kind:fact.kind,
          tier:fact.tier,
          scope:fact.scope,
          updatedAt:fact.updatedAt,
        }));
      return {items};
    },
  });

  registry.register({
    id:"rooms.search",
    version:"1.0.0",
    title:"Search conversation rooms",
    description:"Search local conversation titles and message text without modifying conversation history.",
    inputSchema:z.object({
      query:z.string().trim().min(2).max(300),
      maxResults:z.number().int().min(1).max(12).default(6),
    }).strict(),
    outputSchema:z.object({
      rooms:z.array(roomItemSchema).max(12),
    }).strict(),
    requiredCapabilities:["rooms.read"],
    annotations:{
      risk:"read",idempotency:"idempotent",approval:"never",
      sensitivity:"user-data",reversibility:"reversible",
    },
    timeoutMs:4_000,
    maxResultBytes:16_384,
    concurrencyGroup:"rooms.read",
    async handler(ctx,input){
      const queryTerms=terms(input.query);
      const rooms=await deps.rooms.list(ctx.signal);
      const ranked=rooms.map(room=>{
        const title=normalized(room.title);
        let score=0;
        for(const term of queryTerms){
          if(title.includes(term))score+=6;
          for(const message of room.messages){
            if(normalized(message.content).includes(term))score+=1;
          }
        }
        const matchingMessage=room.messages.find(message=>
          queryTerms.some(term=>normalized(message.content).includes(term)),
        );
        return {
          score,
          item:{
            id:room.id,
            title:room.title,
            updatedAt:room.updatedAt,
            ...(matchingMessage?{snippet:boundedSnippet(matchingMessage.content)}:{}),
          },
        };
      }).filter(entry=>entry.score>0)
        .sort((a,b)=>b.score-a.score||b.item.updatedAt-a.item.updatedAt||a.item.id.localeCompare(b.item.id))
        .slice(0,input.maxResults)
        .map(entry=>entry.item);
      return {rooms:ranked};
    },
  });
}

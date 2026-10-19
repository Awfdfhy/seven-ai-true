import type { MemoryFabricService } from "../memory/memory-fabric-service";
import type { ToolRegistry } from "./registry";

export type LocalMemoryMutationProposal = Readonly<{
  toolId:"memory.set_tier"|"memory.forget";
  args:Readonly<Record<string,unknown>>;
  memoryPreview:string;
  actionLabel:string;
  destructive:boolean;
}>;

function normalize(value:string):string{
  return value.normalize("NFKC").toLocaleLowerCase("en-US")
    .replace(/[\u064B-\u065F\u0670]/g,"")
    .replace(/[أإآٱ]/g,"ا").replace(/ى/g,"ي").replace(/ة/g,"ه");
}

function intent(query:string):
  | Readonly<{kind:"forget";target:string}>
  | Readonly<{kind:"tier";tier:"core"|"recall";target:string}>
  | null{
  const original=query.trim();
  const q=normalize(original);
  if(!q)return null;

  const forget =
    /\b(forget|delete|remove|erase)\b/.test(q) ||
    /(?:احذف|امسح|انس|انسى|نسيان)/.test(q);
  const memoryWord=
    /\b(memory|remembered|saved)\b/.test(q) ||
    /ذاكر|محفوظ/.test(q);
  if(forget&&memoryWord){
    const target=original
      .replace(/\b(?:please\s+)?(?:forget|delete|remove|erase)\b/ig," ")
      .replace(/\b(?:this|that|the|from|my|your|saved|memory|remembered)\b/ig," ")
      .replace(/(?:رجاء|من فضلك|احذف|امسح|انس|انسى|هذه|هذا|ذلك|تلك|من|ذاكرتك|ذاكره|الذاكره|محفوظ[هة]?)/g," ")
      .replace(/\s+/g," ").trim();
    if(target.length>=2)return Object.freeze({kind:"forget" as const,target});
  }

  const unpin =
    /\b(unpin|move to recall|recall only)\b/.test(q) ||
    /الغاء تثبيت|إلغاء تثبيت|اجعلها recall|حولها recall/.test(q);
  if(unpin){
    const target=original
      .replace(/\b(?:please\s+)?(?:unpin|move to recall|recall only)\b/ig," ")
      .replace(/(?:الغاء تثبيت|إلغاء تثبيت|اجعلها recall|حولها recall)/g," ")
      .replace(/\s+/g," ").trim();
    if(target.length>=2)return Object.freeze({kind:"tier" as const,tier:"recall" as const,target});
  }

  const pin =
    /\b(pin|keep pinned|make core|core memory)\b/.test(q) ||
    /(?:ثبت|ثبّت|تثبيت|اجعلها core|ذاكره اساسيه|ذاكرة أساسية)/.test(q);
  if(pin){
    const target=original
      .replace(/\b(?:please\s+)?(?:pin|keep pinned|make core|core memory)\b/ig," ")
      .replace(/(?:ثبت|ثبّت|تثبيت|اجعلها core|ذاكره اساسيه|ذاكرة أساسية)/g," ")
      .replace(/\s+/g," ").trim();
    if(target.length>=2)return Object.freeze({kind:"tier" as const,tier:"core" as const,target});
  }

  return null;
}

export class LocalMemoryMutationProposer {
  constructor(
    private readonly memory:MemoryFabricService,
    private readonly registry:ToolRegistry,
  ){}

  async propose(input:Readonly<{
    roomId:string;
    query:string;
    signal?:AbortSignal;
  }>):Promise<LocalMemoryMutationProposal|null>{
    const parsed=intent(input.query);
    if(!parsed)return null;

    const hits=await this.memory.searchLocal(
      input.roomId,
      parsed.target,
      input.signal,
      {maxCore:8,maxRecall:8},
    );
    const candidates=hits
      .filter(hit=>hit.fact.status==="active"&&hit.lexical>0)
      .sort((a,b)=>b.lexical-a.lexical||b.score-a.score||b.fact.updatedAt-a.fact.updatedAt);
    const top=candidates[0];
    if(!top)return null;
    const second=candidates[1];
    if(second&&second.lexical>=top.lexical*.85)return null;

    const preview=top.fact.content.length<=320
      ? top.fact.content
      : `${top.fact.content.slice(0,319)}…`;

    if(parsed.kind==="forget"){
      this.registry.require("memory.forget");
      return Object.freeze({
        toolId:"memory.forget" as const,
        args:Object.freeze({
          memoryId:top.fact.id,
          expectedUpdatedAt:top.fact.updatedAt,
        }),
        memoryPreview:preview,
        actionLabel:"Forget memory",
        destructive:true,
      });
    }

    this.registry.require("memory.set_tier");
    return Object.freeze({
      toolId:"memory.set_tier" as const,
      args:Object.freeze({
        memoryId:top.fact.id,
        expectedUpdatedAt:top.fact.updatedAt,
        tier:parsed.tier,
      }),
      memoryPreview:preview,
      actionLabel:parsed.tier==="core"?"Pin memory":"Unpin memory",
      destructive:false,
    });
  }
}

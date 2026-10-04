import { SevenError } from "../../core/errors";
import { createMemoryFact, createMemoryWriteEvent, supersedeMemoryFact, type MemoryFact, type MemoryTier } from "../../domain/memory/fabric";
import type { MemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { extractMemoryCandidates, isSafeMemoryContent } from "./memory-extractor";
import { formatMemoryContext, MemoryRetrievalEngine, type MemoryHit } from "./memory-retrieval";
import { classifyMemoryIntent, type MemoryIntent } from "./memory-intent";
import { exportMemoryArchive, importMemoryArchive, type MemoryArchiveV1 } from "./memory-archive";
import type { MemoryQueryRewriter } from "./memory-query-rewriter";

export class MemoryFabricService {
  private readonly canonicalLocks = new Map<string, Promise<void>>();

  private readonly rewriteCache = new Map<string, readonly string[]>();

  constructor(
    private readonly repository: MemoryFabricRepository,
    private readonly retrieval = new MemoryRetrievalEngine(),
    private readonly queryRewriter?: MemoryQueryRewriter,
  ) {}

  async observeUserMessage(input: Readonly<{roomId:string;messageId:string;content:string;createdAt:number}>, signal?:AbortSignal):Promise<readonly MemoryFact[]> {
    const candidates=extractMemoryCandidates(input.content);
    const written:MemoryFact[]=[];
    for(const c of candidates){
      const roomId=c.scope==="room"?input.roomId:null;
      const lockKey=`${c.scope}:${roomId??"*"}:${c.canonicalKey}`;
      const result=await this.withCanonicalLock(lockKey,async()=>{
        const existing=[...(await this.repository.findActiveByCanonicalKey(c.scope,roomId,c.canonicalKey,signal))]
          .sort((a,b)=>a.validFrom-b.validFrom || a.id.localeCompare(b.id));
        if(existing.some(f=>this.sameContent(f.content,c.content))) return null;

        const repairFacts:MemoryFact[]=[];
        const repairEvents:ReturnType<typeof createMemoryWriteEvent>[]=[];
        // Defensive repair: legacy/racy stores may already contain multiple active facts.
        // Convert all but the newest one into a chronological chain before inserting.
        for(let index=0;index<existing.length-1;index+=1){
          const current=existing[index]!;
          const next=existing[index+1]!;
          const ended=supersedeMemoryFact(current,Math.max(current.validFrom,next.validFrom));
          repairFacts.push(ended);
          repairEvents.push(createMemoryWriteEvent(ended,"supersede",ended.validUntil??ended.updatedAt));
        }
        const current=existing.at(-1)??null;
        const baseFact=createMemoryFact({
          kind:c.kind,tier:c.tier,scope:c.scope,roomId,canonicalKey:c.canonicalKey,content:c.content,tags:c.tags,
          importance:c.importance,confidence:c.confidence,observedAt:input.createdAt,
          sourceRoomId:input.roomId,sourceMessageId:input.messageId,supersedes:current && current.validFrom<=input.createdAt?[current.id]:[],
        });

        if(current && current.validFrom>=input.createdAt){
          // An older observation arrived after a newer one. Preserve it as history
          // without allowing it to replace the current fact.
          const historical=supersedeMemoryFact(baseFact,current.validFrom);
          await this.repository.commit(
            [...repairFacts,historical],
            [...repairEvents,createMemoryWriteEvent(historical,"add",input.createdAt)],
            signal,
          );
          return historical;
        }

        const ended=current?supersedeMemoryFact(current,input.createdAt):null;
        await this.repository.commit(
          [...repairFacts,...(ended?[ended]:[]),baseFact],
          [
            ...repairEvents,
            ...(ended?[createMemoryWriteEvent(ended,"supersede",input.createdAt)]:[]),
            createMemoryWriteEvent(baseFact,"add",input.createdAt),
          ],
          signal,
        );
        return baseFact;
      });
      if(result) written.push(result);
    }
    return Object.freeze(written);
  }

  async exportArchive(signal?:AbortSignal):Promise<MemoryArchiveV1>{
    return exportMemoryArchive(this.repository,Date.now(),signal);
  }

  async restoreArchive(value:unknown,signal?:AbortSignal):Promise<Readonly<{facts:number;events:number}>>{
    return importMemoryArchive(this.repository,value,signal);
  }

  async clearAll(signal?:AbortSignal):Promise<void>{
    await this.repository.clearAll(signal);
  }

  async listActive(roomId:string,signal?:AbortSignal):Promise<readonly MemoryFact[]>{
    const facts=await this.repository.listForRoom(roomId,signal);
    return Object.freeze(facts.filter(f=>f.status==="active"));
  }

  async updateMemory(
    memoryId:string,
    roomId:string,
    patch:Readonly<{content?:string;tier?:MemoryTier}>,
    signal?:AbortSignal,
    now=Date.now(),
  ):Promise<MemoryFact>{
    const facts=await this.repository.listForRoom(roomId,signal);
    const fact=facts.find(item=>item.id===memoryId && item.status==="active");
    if(!fact)throw new SevenError({code:"VALIDATION",message:"Memory is missing or no longer active."});
    const content=patch.content===undefined?fact.content:patch.content.trim();
    const tier=patch.tier??fact.tier;
    if(!isSafeMemoryContent(content)){
      throw new SevenError({code:"VALIDATION",message:"Edited memory is empty, sensitive, or instruction-like."});
    }
    if(tier!=="core"&&tier!=="recall"){
      throw new SevenError({code:"VALIDATION",message:"Edited memory tier is invalid."});
    }
    if(this.sameContent(content,fact.content)&&tier===fact.tier)return fact;

    const lockKey=`${fact.scope}:${fact.roomId??"*"}:${fact.canonicalKey}`;
    return this.withCanonicalLock(lockKey,async()=>{
      const latest=[...(await this.repository.findActiveByCanonicalKey(fact.scope,fact.roomId,fact.canonicalKey,signal))]
        .sort((a,b)=>b.validFrom-a.validFrom || b.updatedAt-a.updatedAt)[0];
      if(!latest || latest.id!==fact.id){
        throw new SevenError({code:"VALIDATION",message:"Memory changed before this edit could be saved.",retryable:true});
      }
      const timestamp=Math.max(now,fact.validFrom);
      const ended=supersedeMemoryFact(fact,timestamp);
      const replacement=createMemoryFact({
        kind:fact.kind,
        tier,
        scope:fact.scope,
        roomId:fact.roomId,
        canonicalKey:fact.canonicalKey,
        content,
        tags:fact.tags,
        importance:Math.max(fact.importance,.95),
        confidence:1,
        observedAt:timestamp,
        sourceRoomId:roomId,
        sourceMessageId:`memory-inspector:${crypto.randomUUID()}`,
        sourceOrigin:"memory-inspector",
        supersedes:[fact.id],
      });
      await this.repository.commit(
        [ended,replacement],
        [
          createMemoryWriteEvent(ended,"supersede",timestamp),
          createMemoryWriteEvent(replacement,"add",timestamp),
        ],
        signal,
      );
      return replacement;
    });
  }

  async forget(memoryId:string,roomId:string,signal?:AbortSignal):Promise<boolean>{
    const facts=await this.repository.listForRoom(roomId,signal);
    const fact=facts.find(item=>item.id===memoryId && item.status==="active");
    if(!fact)return false;
    await this.repository.deleteFact(memoryId,createMemoryWriteEvent(fact,"forget",Date.now()),signal);
    return true;
  }

  private sameContent(a:string,b:string):boolean{
    const normalize=(value:string)=>value.normalize("NFKC").toLocaleLowerCase("en-US").replace(/[\s.,!?؟،؛;:]+/gu," ").trim();
    return normalize(a)===normalize(b);
  }

  private async withCanonicalLock<T>(key:string,work:()=>Promise<T>):Promise<T>{
    const previous=this.canonicalLocks.get(key)??Promise.resolve();
    let release!:()=>void;
    const gate=new Promise<void>(resolve=>{release=resolve;});
    const tail=previous.then(()=>gate);
    this.canonicalLocks.set(key,tail);
    await previous;
    try{
      return await work();
    }finally{
      release();
      if(this.canonicalLocks.get(key)===tail)this.canonicalLocks.delete(key);
    }
  }

  intentForQuery(query:string):MemoryIntent{
    return classifyMemoryIntent(query);
  }

  async search(roomId:string,query:string,signal?:AbortSignal,excludeMessageId?:string):Promise<readonly MemoryHit[]>{
    const intent=classifyMemoryIntent(query);
    if(intent.mode==="none") return Object.freeze([]);
    const facts=await this.repository.listForRoom(roomId,signal);
    const filtered=excludeMessageId?facts.filter(f=>f.source.messageId!==excludeMessageId):facts;
    const options={
      includeCore:intent.mode==="core" || intent.mode==="recall" || intent.mode==="history",
      includeRecall:intent.mode==="recall" || intent.mode==="history" || intent.mode==="core",
      historical:intent.mode==="history",
    };
    const direct=this.retrieval.search(filtered,query,options);
    const hasRelevantLocal=direct.some(hit=>hit.reason==="retrieved" || hit.reason==="associated");
    if(hasRelevantLocal || !this.queryRewriter || filtered.length===0){
      return direct;
    }

    const rewrites=await this.rewriteQuery(query,signal);
    if(rewrites.length<2)return direct;

    const support=new Map<string,{fact:MemoryFact;count:number;score:number;lexical:number}>();
    for(const rewrite of rewrites){
      const hits=this.retrieval.search(filtered,rewrite,{
        ...options,
        includeCore:false,
        maxRecall:8,
      }).filter(hit=>hit.reason!=="core");
      const seen=new Set<string>();
      hits.forEach((hit,index)=>{
        if(seen.has(hit.fact.id))return;
        seen.add(hit.fact.id);
        const current=support.get(hit.fact.id)??{fact:hit.fact,count:0,score:0,lexical:0};
        current.count+=1;
        current.score+=1/(60+index+1);
        current.lexical=Math.max(current.lexical,hit.lexical);
        support.set(hit.fact.id,current);
      });
    }

    const directIds=new Set(direct.map(hit=>hit.fact.id));
    const rewritten=[...support.values()]
      .filter(item=>item.count>=2 && !directIds.has(item.fact.id))
      .sort((a,b)=>b.count-a.count || b.score-a.score || b.fact.updatedAt-a.fact.updatedAt)
      .slice(0,6)
      .map(item=>Object.freeze({
        fact:item.fact,
        score:item.score,
        lexical:item.lexical,
        reason:"rewritten" as const,
      }));

    return Object.freeze([...direct,...rewritten].slice(0,12));
  }

  private async rewriteQuery(query:string,signal?:AbortSignal):Promise<readonly string[]>{
    const key=query.normalize("NFKC").toLocaleLowerCase("en-US").trim();
    const cached=this.rewriteCache.get(key);
    if(cached)return cached;
    if(!this.queryRewriter)return Object.freeze([]);

    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),2_500);
    const onAbort=()=>controller.abort();
    signal?.addEventListener("abort",onAbort,{once:true});
    try{
      const rewrites=await this.queryRewriter.rewrite(query,controller.signal);
      const safe=Object.freeze(rewrites.filter(item=>typeof item==="string"&&item.trim()).slice(0,4));
      this.rewriteCache.set(key,safe);
      if(this.rewriteCache.size>32){
        const oldest=this.rewriteCache.keys().next().value as string|undefined;
        if(oldest)this.rewriteCache.delete(oldest);
      }
      return safe;
    }catch(error){
      if(signal?.aborted)throw error;
      return Object.freeze([]);
    }finally{
      clearTimeout(timeout);
      signal?.removeEventListener("abort",onAbort);
    }
  }

  async contextForRoom(roomId:string,query:string,signal?:AbortSignal,excludeMessageId?:string):Promise<string>{
    const intent=classifyMemoryIntent(query);
    if(intent.mode==="none") return "";
    return formatMemoryContext(await this.search(roomId,query,signal,excludeMessageId));
  }
}

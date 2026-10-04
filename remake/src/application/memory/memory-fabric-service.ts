import { createMemoryFact, createMemoryWriteEvent, supersedeMemoryFact, type MemoryFact } from "../../domain/memory/fabric";
import type { MemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { extractMemoryCandidates } from "./memory-extractor";
import { formatMemoryContext, MemoryRetrievalEngine, type MemoryHit } from "./memory-retrieval";
import { classifyMemoryIntent, type MemoryIntent } from "./memory-intent";

export class MemoryFabricService {
  private readonly canonicalLocks = new Map<string, Promise<void>>();

  constructor(
    private readonly repository: MemoryFabricRepository,
    private readonly retrieval = new MemoryRetrievalEngine(),
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

  async listActive(roomId:string,signal?:AbortSignal):Promise<readonly MemoryFact[]>{
    const facts=await this.repository.listForRoom(roomId,signal);
    return Object.freeze(facts.filter(f=>f.status==="active"));
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
    return this.retrieval.search(filtered,query,{
      includeCore:intent.mode==="core" || intent.mode==="recall" || intent.mode==="history",
      includeRecall:intent.mode==="recall" || intent.mode==="history" || intent.mode==="core",
      historical:intent.mode==="history",
    });
  }

  async contextForRoom(roomId:string,query:string,signal?:AbortSignal,excludeMessageId?:string):Promise<string>{
    const intent=classifyMemoryIntent(query);
    if(intent.mode==="none") return "";
    return formatMemoryContext(await this.search(roomId,query,signal,excludeMessageId));
  }
}

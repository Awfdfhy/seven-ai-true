import { createMemoryFact, createMemoryWriteEvent, supersedeMemoryFact, type MemoryFact } from "../../domain/memory/fabric";
import type { MemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { extractMemoryCandidates } from "./memory-extractor";
import { formatMemoryContext, MemoryRetrievalEngine, type MemoryHit } from "./memory-retrieval";
import { classifyMemoryIntent, type MemoryIntent } from "./memory-intent";

export class MemoryFabricService {
  constructor(
    private readonly repository: MemoryFabricRepository,
    private readonly retrieval = new MemoryRetrievalEngine(),
  ) {}

  async observeUserMessage(input: Readonly<{roomId:string;messageId:string;content:string;createdAt:number}>, signal?:AbortSignal):Promise<readonly MemoryFact[]> {
    const candidates=extractMemoryCandidates(input.content);
    const written:MemoryFact[]=[];
    for(const c of candidates){
      const roomId=c.scope==="room"?input.roomId:null;
      const existing=await this.repository.findActiveByCanonicalKey(c.scope,roomId,c.canonicalKey,signal);
      if(existing.some(f=>f.content===c.content)) continue;
      const superseded=existing.map(f=>supersedeMemoryFact(f,input.createdAt));
      const fact=createMemoryFact({
        kind:c.kind,tier:c.tier,scope:c.scope,roomId,canonicalKey:c.canonicalKey,content:c.content,tags:c.tags,
        importance:c.importance,confidence:c.confidence,observedAt:input.createdAt,
        sourceRoomId:input.roomId,sourceMessageId:input.messageId,supersedes:existing.map(f=>f.id),
      });
      const events=[
        ...superseded.map(f=>createMemoryWriteEvent(f,"supersede",input.createdAt)),
        createMemoryWriteEvent(fact,"add",input.createdAt),
      ];
      await this.repository.commit([...superseded,fact],events,signal);
      written.push(fact);
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

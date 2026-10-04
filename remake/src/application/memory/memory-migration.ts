import { createMemoryFact, type MemoryFact } from "../../domain/memory/fabric";
import { isMemoryRecord, type MemoryRecord } from "../../domain/memory";

function stableHash(value:string):string{
  let h=2166136261;
  for(const ch of value){
    h^=ch.codePointAt(0)??0;
    h=Math.imul(h,16777619);
  }
  return (h>>>0).toString(36);
}

export function migrateLegacyMemoryRecord(record: MemoryRecord): MemoryFact {
  if(!isMemoryRecord(record))throw new TypeError("Legacy memory record is invalid.");
  const suffix=stableHash(record.id);
  return createMemoryFact({
    id:`legacy-v1-${suffix}`,
    kind:"fact",
    tier:record.priority>=85?"core":"recall",
    scope:record.scope,
    roomId:record.roomId,
    canonicalKey:`legacy:v1:${suffix}`,
    content:record.content,
    tags:["legacy-v1","migrated"],
    importance:Math.max(.05,Math.min(1,record.priority/100)),
    confidence:.7,
    observedAt:record.createdAt,
    sourceRoomId:record.roomId??"legacy-global",
    sourceMessageId:`legacy-memory-${suffix}`,
  });
}

export function migrateLegacyMemoryRecords(records:readonly MemoryRecord[]):readonly MemoryFact[]{
  if(!Array.isArray(records))throw new TypeError("Legacy memory records must be an array.");
  const ids=new Set<string>();
  const out:MemoryFact[]=[];
  for(const record of records){
    const fact=migrateLegacyMemoryRecord(record);
    if(ids.has(fact.id))continue;
    ids.add(fact.id);out.push(fact);
  }
  return Object.freeze(out);
}

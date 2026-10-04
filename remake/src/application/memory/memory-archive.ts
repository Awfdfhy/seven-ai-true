import { SevenError } from "../../core/errors";
import {
  cloneMemoryFact,
  isMemoryFact,
  isMemoryWriteEvent,
  type MemoryFact,
  type MemoryWriteEvent,
} from "../../domain/memory/fabric";
import type { MemoryFabricRepository } from "../../storage/memory-fabric-repository";

export type MemoryArchiveV1 = Readonly<{
  schemaVersion: 1;
  exportedAt: number;
  facts: readonly MemoryFact[];
  events: readonly MemoryWriteEvent[];
}>;

const MAX_ARCHIVE_FACTS = 50_000;
const MAX_ARCHIVE_EVENTS = 200_000;

export async function exportMemoryArchive(
  repository: MemoryFabricRepository,
  now = Date.now(),
  signal?: AbortSignal,
): Promise<MemoryArchiveV1> {
  if (!Number.isFinite(now) || now < 0) {
    throw new SevenError({ code: "VALIDATION", message: "Memory archive timestamp is invalid." });
  }
  const [facts, events] = await Promise.all([
    repository.listAll(signal),
    repository.listEvents(signal),
  ]);
  if (facts.length > MAX_ARCHIVE_FACTS || events.length > MAX_ARCHIVE_EVENTS) {
    throw new SevenError({ code: "STORAGE", message: "Memory archive exceeds the bounded export limit." });
  }
  return Object.freeze({
    schemaVersion: 1 as const,
    exportedAt: now,
    facts: Object.freeze(facts.map(cloneMemoryFact)),
    events: Object.freeze(events.map(event => Object.freeze({ ...event }))),
  });
}

export function parseMemoryArchive(value: unknown): MemoryArchiveV1 {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SevenError({ code: "VALIDATION", message: "Memory archive must be an object." });
  }
  const archive=value as Partial<MemoryArchiveV1>;
  if (archive.schemaVersion!==1 || typeof archive.exportedAt!=="number" || !Number.isFinite(archive.exportedAt) ||
      archive.exportedAt<0 || !Array.isArray(archive.facts) || !Array.isArray(archive.events)) {
    throw new SevenError({ code: "VALIDATION", message: "Memory archive header is invalid." });
  }
  if(archive.facts.length>MAX_ARCHIVE_FACTS || archive.events.length>MAX_ARCHIVE_EVENTS){
    throw new SevenError({ code: "VALIDATION", message: "Memory archive exceeds bounded import limits." });
  }
  const ids=new Set<string>();
  const facts:MemoryFact[]=[];
  for(const raw of archive.facts){
    if(!isMemoryFact(raw))throw new SevenError({code:"VALIDATION",message:"Memory archive contains an invalid fact."});
    if(ids.has(raw.id))throw new SevenError({code:"VALIDATION",message:"Memory archive contains duplicate fact IDs."});
    ids.add(raw.id);facts.push(cloneMemoryFact(raw));
  }
  const eventIds=new Set<string>();
  const events:MemoryWriteEvent[]=[];
  for(const raw of archive.events){
    if(!isMemoryWriteEvent(raw))throw new SevenError({code:"VALIDATION",message:"Memory archive contains an invalid event."});
    if(eventIds.has(raw.id))throw new SevenError({code:"VALIDATION",message:"Memory archive contains duplicate event IDs."});
    eventIds.add(raw.id);events.push(Object.freeze({...raw}));
  }
  return Object.freeze({
    schemaVersion:1,
    exportedAt:archive.exportedAt,
    facts:Object.freeze(facts),
    events:Object.freeze(events),
  });
}

export async function importMemoryArchive(
  repository: MemoryFabricRepository,
  value: unknown,
  signal?: AbortSignal,
): Promise<Readonly<{ facts: number; events: number }>> {
  const archive=parseMemoryArchive(value);
  // Merge by immutable IDs. Repository transactions make the fact/event bundle
  // durable together; a malformed archive is rejected before any write begins.
  await repository.commit(archive.facts,archive.events,signal);
  return Object.freeze({facts:archive.facts.length,events:archive.events.length});
}

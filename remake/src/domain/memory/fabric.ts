import { SevenError } from "../../core/errors";

export type MemoryKind = "profile" | "preference" | "goal" | "decision" | "event" | "fact" | "procedure";
export type MemoryTier = "core" | "recall";
export type MemoryScope = "global" | "room";
export type MemoryStatus = "active" | "superseded";

export type MemorySourceRef = Readonly<{
  roomId: string;
  messageId: string;
  observedAt: number;
}>;

export type MemoryFact = Readonly<{
  schemaVersion: 2;
  id: string;
  kind: MemoryKind;
  tier: MemoryTier;
  scope: MemoryScope;
  roomId: string | null;
  canonicalKey: string;
  content: string;
  tags: readonly string[];
  importance: number;
  confidence: number;
  status: MemoryStatus;
  validFrom: number;
  validUntil: number | null;
  createdAt: number;
  updatedAt: number;
  source: MemorySourceRef;
  supersedes: readonly string[];
}>;

export type MemoryWriteEvent = Readonly<{
  schemaVersion: 1;
  id: string;
  factId: string;
  type: "add" | "supersede" | "forget";
  at: number;
  sourceRoomId: string;
  sourceMessageId: string;
}>;

export type CreateMemoryFactInput = Readonly<{
  id?: string;
  kind: MemoryKind;
  tier: MemoryTier;
  scope: MemoryScope;
  roomId?: string | null;
  canonicalKey: string;
  content: string;
  tags?: readonly string[];
  importance: number;
  confidence: number;
  observedAt: number;
  sourceRoomId: string;
  sourceMessageId: string;
  supersedes?: readonly string[];
}>;

const MAX_CONTENT = 4096;
const MAX_KEY = 256;
const MAX_TAGS = 16;

function canonical(value: unknown, field: string, max = MAX_KEY): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim() || value.length > max) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be a canonical non-empty string.` });
  }
  return value;
}

function bounded01(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0 || value > 1) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be between 0 and 1.` });
  }
  return value;
}

function time(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be a non-negative finite timestamp.` });
  }
  return value;
}

function normalizeTags(tags: readonly string[] = []): readonly string[] {
  if (!Array.isArray(tags) || tags.length > MAX_TAGS) {
    throw new SevenError({ code: "VALIDATION", message: "Memory tags exceed the bounded limit." });
  }
  const out = [...new Set(tags.map(tag => canonical(tag.trim().toLocaleLowerCase("en-US"), "Memory tag", 64)))];
  return Object.freeze(out);
}

export function createMemoryFact(input: CreateMemoryFactInput): MemoryFact {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new SevenError({ code: "VALIDATION", message: "Memory fact input must be an object." });
  }
  if (!["profile","preference","goal","decision","event","fact","procedure"].includes(input.kind)) {
    throw new SevenError({ code: "VALIDATION", message: "Memory kind is invalid." });
  }
  if (input.tier !== "core" && input.tier !== "recall") {
    throw new SevenError({ code: "VALIDATION", message: "Memory tier is invalid." });
  }
  if (input.scope !== "global" && input.scope !== "room") {
    throw new SevenError({ code: "VALIDATION", message: "Memory scope is invalid." });
  }
  const sourceRoomId = canonical(input.sourceRoomId, "Memory source roomId");
  const roomId = input.scope === "room"
    ? canonical(input.roomId, "Memory roomId")
    : null;
  if (input.scope === "global" && input.roomId != null) {
    throw new SevenError({ code: "VALIDATION", message: "Global memory cannot have a roomId." });
  }
  const observedAt = time(input.observedAt, "Memory observedAt");
  const content = canonical(input.content, "Memory content", MAX_CONTENT);
  const supersedes = Object.freeze([...(input.supersedes ?? [])].map(id => canonical(id, "Superseded memory id")));
  return Object.freeze({
    schemaVersion: 2 as const,
    id: input.id ? canonical(input.id, "Memory id") : crypto.randomUUID(),
    kind: input.kind,
    tier: input.tier,
    scope: input.scope,
    roomId,
    canonicalKey: canonical(input.canonicalKey, "Memory canonicalKey"),
    content,
    tags: normalizeTags(input.tags),
    importance: bounded01(input.importance, "Memory importance"),
    confidence: bounded01(input.confidence, "Memory confidence"),
    status: "active" as const,
    validFrom: observedAt,
    validUntil: null,
    createdAt: observedAt,
    updatedAt: observedAt,
    source: Object.freeze({
      roomId: sourceRoomId,
      messageId: canonical(input.sourceMessageId, "Memory source messageId"),
      observedAt,
    }),
    supersedes,
  });
}

export function supersedeMemoryFact(fact: MemoryFact, at: number): MemoryFact {
  if (!isMemoryFact(fact)) throw new SevenError({ code: "VALIDATION", message: "Memory fact is invalid." });
  const timestamp = time(at, "Memory supersession timestamp");
  if (timestamp < fact.validFrom) throw new SevenError({ code: "VALIDATION", message: "Memory cannot be invalidated before it became valid." });
  return Object.freeze({ ...fact, status: "superseded" as const, validUntil: timestamp, updatedAt: Math.max(fact.updatedAt, timestamp) });
}

export function isMemoryFact(value: unknown): value is MemoryFact {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const f = value as Partial<MemoryFact>;
  return f.schemaVersion === 2 &&
    typeof f.id === "string" && f.id.trim() === f.id && !!f.id &&
    ["profile","preference","goal","decision","event","fact","procedure"].includes(String(f.kind)) &&
    (f.tier === "core" || f.tier === "recall") &&
    (f.scope === "global" || f.scope === "room") &&
    ((f.scope === "global" && f.roomId === null) || (f.scope === "room" && typeof f.roomId === "string" && !!f.roomId.trim())) &&
    typeof f.canonicalKey === "string" && !!f.canonicalKey.trim() &&
    typeof f.content === "string" && !!f.content.trim() && f.content.length <= MAX_CONTENT &&
    Array.isArray(f.tags) && f.tags.length <= MAX_TAGS &&
    typeof f.importance === "number" && f.importance >= 0 && f.importance <= 1 &&
    typeof f.confidence === "number" && f.confidence >= 0 && f.confidence <= 1 &&
    (f.status === "active" || f.status === "superseded") &&
    typeof f.validFrom === "number" && Number.isFinite(f.validFrom) &&
    (f.validUntil === null || (typeof f.validUntil === "number" && Number.isFinite(f.validUntil) && f.validUntil >= f.validFrom)) &&
    typeof f.createdAt === "number" && typeof f.updatedAt === "number" &&
    !!f.source && typeof f.source.roomId === "string" && typeof f.source.messageId === "string" &&
    typeof f.source.observedAt === "number" && Array.isArray(f.supersedes);
}

export function cloneMemoryFact(fact: MemoryFact): MemoryFact {
  if (!isMemoryFact(fact)) throw new SevenError({ code: "VALIDATION", message: "Memory fact is invalid." });
  return Object.freeze({
    ...fact,
    tags: Object.freeze([...fact.tags]),
    source: Object.freeze({ ...fact.source }),
    supersedes: Object.freeze([...fact.supersedes]),
  });
}

export function createMemoryWriteEvent(fact: MemoryFact, type: "add" | "supersede" | "forget", at = fact.updatedAt): MemoryWriteEvent {
  return Object.freeze({
    schemaVersion: 1 as const,
    id: crypto.randomUUID(),
    factId: fact.id,
    type,
    at: time(at, "Memory event timestamp"),
    sourceRoomId: fact.source.roomId,
    sourceMessageId: fact.source.messageId,
  });
}


export function isMemoryWriteEvent(value: unknown): value is MemoryWriteEvent {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const event=value as Partial<MemoryWriteEvent>;
  return event.schemaVersion===1 &&
    typeof event.id==="string" && !!event.id.trim() &&
    typeof event.factId==="string" && !!event.factId.trim() &&
    (event.type==="add" || event.type==="supersede" || event.type==="forget") &&
    typeof event.at==="number" && Number.isFinite(event.at) && event.at>=0 &&
    typeof event.sourceRoomId==="string" && !!event.sourceRoomId.trim() &&
    typeof event.sourceMessageId==="string" && !!event.sourceMessageId.trim();
}

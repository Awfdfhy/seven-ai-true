import { SevenError } from "../../core/errors";

export const MEMORY_LIMITS = Object.freeze({
  idCharacters: 512,
  contentCharacters: 32_768,
  summaryCharacters: 65_536,
  records: 10_000,
  summaries: 10_000,
});

export type MemoryScope = "global" | "room";

export type MemoryRecord = Readonly<{
  schemaVersion: 1;
  id: string;
  scope: MemoryScope;
  roomId: string | null;
  content: string;
  priority: number;
  createdAt: number;
  updatedAt: number;
}>;

export type ContextSummary = Readonly<{
  schemaVersion: 1;
  roomId: string;
  content: string;
  throughMessageId: string;
  createdAt: number;
  updatedAt: number;
}>;

export type CreateMemoryOptions = Readonly<{
  id?: string;
  scope: MemoryScope;
  roomId?: string | null;
  content: string;
  priority?: number;
  now?: number;
}>;

export type CreateSummaryOptions = Readonly<{
  roomId: string;
  content: string;
  throughMessageId: string;
  createdAt?: number;
  now?: number;
}>;

function canonicalText(value: unknown, field: string): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > MEMORY_LIMITS.idCharacters
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must be a canonical non-empty string.`,
    });
  }
  return value;
}

function contentText(value: unknown, field: string, limit: number = MEMORY_LIMITS.contentCharacters): string {
  if (typeof value !== "string" || !value.trim() || value.length > limit) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must be non-empty and at most ${limit} characters.`,
    });
  }
  return value;
}

function timestamp(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must be a non-negative finite timestamp.`,
    });
  }
  return value;
}

function priority(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0 || (value as number) > 100) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Memory priority must be an integer from 0 through 100.",
    });
  }
  return value as number;
}

export function createMemoryRecord(options: CreateMemoryOptions): MemoryRecord {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Memory options must be an object.",
    });
  }
  if (options.scope !== "global" && options.scope !== "room") {
    throw new SevenError({
      code: "VALIDATION",
      message: "Memory scope must be global or room.",
    });
  }

  const roomId =
    options.scope === "global"
      ? null
      : canonicalText(options.roomId, "Memory roomId");
  if (options.scope === "global" && options.roomId != null) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Global memory cannot have a roomId.",
    });
  }

  const now = timestamp(options.now ?? Date.now(), "Memory timestamp");
  return Object.freeze({
    schemaVersion: 1 as const,
    id:
      options.id === undefined
        ? crypto.randomUUID()
        : canonicalText(options.id, "Memory id"),
    scope: options.scope,
    roomId,
    content: contentText(options.content, "Memory content"),
    priority: priority(options.priority ?? 50),
    createdAt: now,
    updatedAt: now,
  });
}

export function updateMemoryRecord(
  record: MemoryRecord,
  patch: Readonly<{ content?: string; priority?: number; now?: number }>,
): MemoryRecord {
  if (!isMemoryRecord(record)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Memory record is invalid.",
    });
  }
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Memory patch must be an object.",
    });
  }

  const now = timestamp(patch.now ?? Date.now(), "Memory timestamp");
  return Object.freeze({
    ...record,
    content:
      patch.content === undefined
        ? record.content
        : contentText(patch.content, "Memory content"),
    priority:
      patch.priority === undefined
        ? record.priority
        : priority(patch.priority),
    updatedAt: Math.max(record.updatedAt, now),
  });
}

export function createContextSummary(
  options: CreateSummaryOptions,
): ContextSummary {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Context summary options must be an object.",
    });
  }
  const now = timestamp(options.now ?? Date.now(), "Summary timestamp");
  const createdAt = timestamp(
    options.createdAt ?? now,
    "Summary creation timestamp",
  );
  return Object.freeze({
    schemaVersion: 1 as const,
    roomId: canonicalText(options.roomId, "Summary roomId"),
    content: contentText(options.content, "Summary content", MEMORY_LIMITS.summaryCharacters),
    throughMessageId: canonicalText(
      options.throughMessageId,
      "Summary throughMessageId",
    ),
    createdAt,
    updatedAt: Math.max(createdAt, now),
  });
}

export function cloneMemoryRecord(record: MemoryRecord): MemoryRecord {
  if (!isMemoryRecord(record)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Memory record is invalid.",
    });
  }
  return Object.freeze({
    schemaVersion: 1, id: record.id, scope: record.scope, roomId: record.roomId,
    content: record.content, priority: record.priority,
    createdAt: record.createdAt, updatedAt: record.updatedAt,
  });
}

export function cloneContextSummary(summary: ContextSummary): ContextSummary {
  if (!isContextSummary(summary)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Context summary is invalid.",
    });
  }
  return Object.freeze({
    schemaVersion: 1, roomId: summary.roomId, content: summary.content,
    throughMessageId: summary.throughMessageId,
    createdAt: summary.createdAt, updatedAt: summary.updatedAt,
  });
}

export function isMemoryRecord(value: unknown): value is MemoryRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<MemoryRecord>;
  return (
    item.schemaVersion === 1 &&
    typeof item.id === "string" &&
    item.id.trim().length > 0 &&
    item.id.length <= MEMORY_LIMITS.idCharacters &&
    item.id === item.id.trim() &&
    (item.scope === "global" || item.scope === "room") &&
    ((item.scope === "global" && item.roomId === null) ||
      (item.scope === "room" &&
        typeof item.roomId === "string" &&
        item.roomId.trim().length > 0 &&
        item.roomId.length <= MEMORY_LIMITS.idCharacters &&
        item.roomId === item.roomId.trim())) &&
    typeof item.content === "string" &&
    item.content.trim().length > 0 &&
    item.content.length <= MEMORY_LIMITS.contentCharacters &&
    Number.isSafeInteger(item.priority) &&
    (item.priority as number) >= 0 &&
    (item.priority as number) <= 100 &&
    typeof item.createdAt === "number" &&
    Number.isFinite(item.createdAt) &&
    item.createdAt >= 0 &&
    typeof item.updatedAt === "number" &&
    Number.isFinite(item.updatedAt) &&
    item.updatedAt >= item.createdAt
  );
}

export function isContextSummary(value: unknown): value is ContextSummary {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<ContextSummary>;
  return (
    item.schemaVersion === 1 &&
    typeof item.roomId === "string" &&
    item.roomId.trim().length > 0 &&
        item.roomId.length <= MEMORY_LIMITS.idCharacters &&
    item.roomId === item.roomId.trim() &&
    typeof item.content === "string" &&
    item.content.trim().length > 0 &&
    item.content.length <= MEMORY_LIMITS.summaryCharacters &&
    typeof item.throughMessageId === "string" &&
    item.throughMessageId.trim().length > 0 &&
    item.throughMessageId.length <= MEMORY_LIMITS.idCharacters &&
    item.throughMessageId === item.throughMessageId.trim() &&
    typeof item.createdAt === "number" &&
    Number.isFinite(item.createdAt) &&
    item.createdAt >= 0 &&
    typeof item.updatedAt === "number" &&
    Number.isFinite(item.updatedAt) &&
    item.updatedAt >= item.createdAt
  );
}

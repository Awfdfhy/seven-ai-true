import { describe, expect, it } from "vitest";
import { MEMORY_LIMITS, createMemoryRecord, createContextSummary, isMemoryRecord, isContextSummary, updateMemoryRecord } from "./index";
import { InMemoryMemoryRepository } from "../../storage/memory-repository";

describe("memory domain limits and identity", () => {
  it("rejects oversized content and identifiers at creation and validation", () => {
    const record = createMemoryRecord({ id: "id", scope: "global", content: "fact", now: 1 });
    const tooLong = "x".repeat(MEMORY_LIMITS.contentCharacters + 1);
    expect(() => createMemoryRecord({ scope: "global", content: tooLong })).toThrow();
    expect(isMemoryRecord({ ...record, content: tooLong })).toBe(false);
    expect(isMemoryRecord({ ...record, id: "x".repeat(MEMORY_LIMITS.idCharacters + 1) })).toBe(false);
    expect(() => updateMemoryRecord(record, { content: tooLong })).toThrow();
    const summary = createContextSummary({ roomId: "r", content: "summary", throughMessageId: "m" });
    expect(isContextSummary({ ...summary, content: "x".repeat(MEMORY_LIMITS.summaryCharacters + 1) })).toBe(false);
    expect(() => createContextSummary({ roomId: "r", throughMessageId: "m", content: "x".repeat(MEMORY_LIMITS.summaryCharacters + 1) })).toThrow();
  });
  it("keeps timestamps monotonic during memory edits", () => {
    const record = createMemoryRecord({ id: "id", scope: "global", content: "fact", now: 10 });
    expect(updateMemoryRecord(record, { content: "New fact", now: 2 }).updatedAt).toBe(10);
    const summary = createContextSummary({ roomId: "r", content: "fact", throughMessageId: "m", createdAt: 10, now: 2 });
    expect(summary.createdAt).toBe(10);
    expect(summary.updatedAt).toBe(10);
  });
  it("rejects seeds beyond capacity and duplicate identities", () => {
    const record = createMemoryRecord({ id: "id", scope: "global", content: "fact" });
    expect(() => new InMemoryMemoryRepository([record, { ...record, id: "other" }], [], { maxRecords: 1 })).toThrow();
    expect(() => new InMemoryMemoryRepository([record, record])).toThrow();
    expect(() => new InMemoryMemoryRepository([], [], { maxRecords: Infinity })).toThrow();
  });
});

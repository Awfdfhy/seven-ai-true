import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createContextSummary, createMemoryRecord, updateMemoryRecord } from "../domain/memory";
import { IndexedDbMemoryRepository, InMemoryMemoryRepository, type MemoryRepository } from "./memory-repository";

const openRepositories: IndexedDbMemoryRepository[] = [];
const memory = (id: string, roomId?: string) => createMemoryRecord({
  id, scope: roomId ? "room" : "global", ...(roomId ? { roomId } : {}), content: `Fact ${id}`, now: 1,
});
const summary = (roomId: string) => createContextSummary({ roomId, content: "Earlier facts", throughMessageId: "m1", now: 1 });
function disk(databaseName = crypto.randomUUID(), limits = {}) {
  const repository = new IndexedDbMemoryRepository({ databaseName, ...limits });
  openRepositories.push(repository);
  return repository;
}
afterEach(async () => {
  vi.restoreAllMocks();
  await Promise.all(openRepositories.splice(0).map((repository) => repository.close()));
});

for (const backend of ["memory", "indexeddb"] as const) {
  describe(`${backend} memory repository contract`, () => {
    const make = (limits = {}): MemoryRepository => backend === "memory" ? new InMemoryMemoryRepository([], [], limits) : disk(undefined, limits);
    it("isolates room facts, includes global facts and orders priority deterministically", async () => {
      const repo = make();
      await repo.put(memory("z-global"));
      await repo.put(memory("a-room", "room"));
      await repo.put(memory("other", "different"));
      await repo.put(updateMemoryRecord(memory("important", "room"), { priority: 100, now: 2 }));
      const found = await repo.listForRoom("room");
      expect(found.map((record) => record.id)).toEqual(["important", "a-room", "z-global"]);
      expect(Object.isFrozen(found)).toBe(true);
      expect(found.every(Object.isFrozen)).toBe(true);
      await repo.delete("important");
      expect((await repo.listForRoom("room")).length).toBe(2);
    });
    it("limits additions, permits replacement at capacity, and recovers after deletion", async () => {
      const repo = make({ maxRecords: 1, maxSummaries: 1 });
      await repo.put(memory("one"));
      await expect(repo.put(memory("two"))).rejects.toMatchObject({ code: "STORAGE" });
      await repo.put(updateMemoryRecord(memory("one"), { content: "Updated", now: 2 }));
      expect((await repo.listForRoom("room"))[0]?.content).toBe("Updated");
      await repo.delete("one");
      await repo.put(memory("two"));
      await repo.putSummary(summary("room"));
      await expect(repo.putSummary(summary("other"))).rejects.toMatchObject({ code: "STORAGE" });
      await repo.putSummary({ ...summary("room"), content: "Updated summary" });
      expect((await repo.getSummary("room"))?.content).toBe("Updated summary");
      await repo.deleteSummary("room");
      await repo.putSummary(summary("other"));
      expect(await repo.getSummary("room")).toBeNull();
    });
    it("rejects malformed values and invalid signals with structured errors", async () => {
      const repo = make();
      await expect(repo.put({ ...memory("id"), priority: NaN })).rejects.toMatchObject({ code: "VALIDATION" });
      await expect(repo.putSummary({ ...summary("room"), content: " " })).rejects.toMatchObject({ code: "VALIDATION" });
      await expect(repo.listForRoom(" room ")).rejects.toMatchObject({ code: "VALIDATION" });
      await expect(repo.getSummary("room", {} as AbortSignal)).rejects.toMatchObject({ code: "VALIDATION" });
    });
    it("rejects every already-cancelled operation without mutating state", async () => {
      const repo = make();
      await repo.put(memory("keep"));
      await repo.putSummary(summary("room"));
      const signal = AbortSignal.abort();
      const operations = [
        () => repo.put(memory("new"), signal), () => repo.delete("keep", signal),
        () => repo.listForRoom("room", signal), () => repo.getSummary("room", signal),
        () => repo.putSummary({ ...summary("room"), content: "Changed" }, signal),
        () => repo.deleteSummary("room", signal),
      ];
      for (const operation of operations) await expect(operation()).rejects.toMatchObject({ name: "AbortError" });
      expect((await repo.listForRoom("room")).map((item) => item.id)).toEqual(["keep"]);
      expect((await repo.getSummary("room"))?.content).toBe("Earlier facts");
    });
    it("snapshots caller data and strips non-schema properties before persistence", async () => {
      const repo = make();
      const mutable = { ...memory("fact"), extra: () => "non-cloneable" };
      const pending = repo.put(mutable);
      mutable.content = "Caller changed this";
      await pending;
      expect((await repo.listForRoom("room"))[0]).toEqual(memory("fact"));
    });
  });
}

async function rawDb(name: string, seed?: (db: IDBDatabase) => void): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => seed?.(request.result);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function rawPut(db: IDBDatabase, store: string, value: unknown) {
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
}

describe("IndexedDB durability and corrupt storage", () => {
  it("restores memory and summary after closing and constructing a fresh repository", async () => {
    const name = crypto.randomUUID();
    const first = disk(name);
    await first.put(memory("global"));
    await first.put(memory("local", "room"));
    await first.putSummary(summary("room"));
    await first.close();
    const restarted = disk(name);
    expect((await restarted.listForRoom("room")).map((item) => item.id)).toEqual(["global", "local"]);
    expect(await restarted.getSummary("room")).toEqual(summary("room"));
  });
  it("serializes concurrent writes across repositories without exceeding capacity", async () => {
    const name = crypto.randomUUID();
    const first = disk(name, { maxRecords: 1, maxSummaries: 1 });
    const second = disk(name, { maxRecords: 1, maxSummaries: 1 });
    const writes = await Promise.allSettled([first.put(memory("a")), second.put(memory("b"))]);
    expect(writes.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(writes.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(await first.listForRoom("room")).toHaveLength(1);
  });
  it("fails closed on corrupted records and summaries", async () => {
    const name = crypto.randomUUID();
    const repo = disk(name);
    await repo.put(memory("fact"));
    const db = await rawDb(name);
    try {
      await rawPut(db, "memories", { ...memory("bad"), schemaVersion: 999 });
      await rawPut(db, "summaries", { ...summary("room"), updatedAt: -1 });
      await expect(repo.listForRoom("room")).rejects.toMatchObject({ code: "STORAGE" });
      await expect(repo.getSummary("room")).rejects.toMatchObject({ code: "STORAGE" });
    } finally { db.close(); }
  });
  it("bounds retrieval even when storage was populated outside this repository", async () => {
    const name = crypto.randomUUID();
    const repo = disk(name, { maxRecords: 1 });
    await repo.put(memory("a"));
    const db = await rawDb(name);
    try {
      await rawPut(db, "memories", memory("b"));
      await expect(repo.listForRoom("room")).rejects.toMatchObject({ code: "STORAGE" });
    } finally { db.close(); }
  });
  it("returns a structured failure for incompatible storage schema", async () => {
    const name = crypto.randomUUID();
    const db = await rawDb(name, (database) => { database.createObjectStore("wrong"); });
    db.close();
    await expect(disk(name).listForRoom("room")).rejects.toMatchObject({ code: "STORAGE" });
  });
  it("does not open IndexedDB for already-cancelled requests", async () => {
    const open = vi.spyOn(indexedDB, "open");
    await expect(disk().listForRoom("room", AbortSignal.abort())).rejects.toMatchObject({ name: "AbortError" });
    expect(open).not.toHaveBeenCalled();
  });
  it("rolls back cancellation during a write before transaction commit", async () => {
    const repo = disk();
    await repo.put(memory("keep"));
    const controller = new AbortController();
    const original = IDBObjectStore.prototype.put;
    const put = vi.spyOn(IDBObjectStore.prototype, "put").mockImplementation(function (this: IDBObjectStore, ...args: Parameters<IDBObjectStore["put"]>) {
      const request = original.apply(this, args);
      if (args[0]?.id === "cancelled") controller.abort();
      return request;
    });
    await expect(repo.put(memory("cancelled"), controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    put.mockRestore();
    expect((await repo.listForRoom("room")).map((item) => item.id)).toEqual(["keep"]);
  });
  it("cancels a blocked open promptly and retries when the blocker closes", async () => {
    const name = crypto.randomUUID();
    const db = await rawDb(name, (database) => {
      database.createObjectStore("memories", { keyPath: "id" });
      database.createObjectStore("summaries", { keyPath: "roomId" });
    });
    const repo = new IndexedDbMemoryRepository({ databaseName: name, version: 2 });
    openRepositories.push(repo);
    const controller = new AbortController();
    const pending = repo.listForRoom("room", controller.signal);
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    db.close();
    // close waits for the abandoned opening attempt, ensuring the next call starts fresh.
    await repo.close();
    expect(await repo.listForRoom("room")).toEqual([]);
  });
});

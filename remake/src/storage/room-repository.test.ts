import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createRoom, type Room } from "../domain/chat";
import { IndexedDbRoomRepository, type RoomRepository } from "./room-repository";

const openRepositories: IndexedDbRoomRepository[] = [];
const disk = (databaseName = crypto.randomUUID()) => {
  const repository = new IndexedDbRoomRepository({ databaseName });
  openRepositories.push(repository);
  return repository;
};
afterEach(async () => {
  await Promise.all(openRepositories.splice(0).map((repository) => repository.close()));
});

async function rawDb(name: string, seed?: (db: IDBDatabase) => void): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(name, 1);
    request.onupgradeneeded = () => seed?.(request.result);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function rawPut(db: IDBDatabase, store: string, value: unknown): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onabort = () => reject(tx.error);
  });
}

describe("IndexedDbRoomRepository storage failure containment", () => {
  it("retries the open path after a blocked upgrade once the blocker closes", async () => {
    const name = crypto.randomUUID();
    const blocker = await rawDb(name, (db) =>
      db.createObjectStore("rooms", { keyPath: "id" }),
    );
    // Intentionally keep the old connection open through versionchange.
    blocker.onversionchange = () => {};

    const repository = new IndexedDbRoomRepository({ databaseName: name, version: 2 });
    openRepositories.push(repository);
    await expect(repository.list()).rejects.toMatchObject({
      code: "STORAGE",
      retryable: true,
      message: "Room storage upgrade is blocked.",
    });

    blocker.close();
    // The failed open must not poison the cached dbPromise: the next call
    // has to start a fresh upgrade attempt.
    await expect(repository.list()).resolves.toEqual([]);
    await repository.close();
  });

  it("fails closed with a structured STORAGE error on an incompatible store schema", async () => {
    const name = crypto.randomUUID();
    const db = await rawDb(name, (database) => {
      database.createObjectStore("rooms", { keyPath: "query" });
    });
    db.close();
    await expect(disk(name).list()).rejects.toMatchObject({
      code: "STORAGE",
      message: "Room storage schema is incompatible.",
    });
  });

  it("fails closed with a structured STORAGE error when the rooms store is missing", async () => {
    const name = crypto.randomUUID();
    const db = await rawDb(name, (database) => {
      database.createObjectStore("wrong", { keyPath: "id" });
    });
    db.close();
    await expect(disk(name).list()).rejects.toMatchObject({ code: "STORAGE" });
    await expect(disk(name).get("any")).rejects.toMatchObject({ code: "STORAGE" });
    await expect(disk(name).put(createRoom({ id: "any", now: 1 }))).rejects.toMatchObject({
      code: "STORAGE",
    });
    await expect(disk(name).delete("any")).rejects.toMatchObject({ code: "STORAGE" });
  });

  it("fails closed with a structured STORAGE error on corrupted stored rooms", async () => {
    const name = crypto.randomUUID();
    const repository = disk(name);
    await repository.put(createRoom({ id: "good", now: 1 }));
    const db = await rawDb(name);
    try {
      const corrupted = { ...createRoom({ id: "bad", now: 2 }), updatedAt: Number.NaN };
      await rawPut(db, "rooms", corrupted);
      await expect(repository.list()).rejects.toMatchObject({ code: "STORAGE" });
      await expect(repository.get("bad")).rejects.toMatchObject({ code: "STORAGE" });
    } finally {
      db.close();
    }
  });

  it("rolls back a cancelled write and keeps later operations healthy", async () => {
    const repository = disk();
    await repository.put(createRoom({ id: "keep", now: 1 }));
    const controller = new AbortController();
    const original = IDBObjectStore.prototype.put;
    const put = vi.spyOn(IDBObjectStore.prototype, "put").mockImplementation(
      function (this: IDBObjectStore, ...args: Parameters<IDBObjectStore["put"]>) {
        const request = original.apply(this, args);
        if ((args[0] as Room | undefined)?.id === "cancelled") controller.abort();
        return request;
      },
    );
    await expect(
      repository.put(createRoom({ id: "cancelled", now: 2 }), controller.signal),
    ).rejects.toMatchObject({ name: "AbortError" });
    put.mockRestore();
    expect((await repository.list()).map((room) => room.id)).toEqual(["keep"]);
    await repository.put(createRoom({ id: "after", now: 3 }));
    expect((await repository.list()).map((room) => room.id)).toEqual(["after", "keep"]);
  });

  it("serializes concurrent writers across repository instances", async () => {
    const name = crypto.randomUUID();
    const first = disk(name);
    const second = disk(name);
    await Promise.all([
      first.put(createRoom({ id: "a", now: 1 })),
      second.put(createRoom({ id: "b", now: 2 })),
    ]);
    expect((await first.list()).map((room) => room.id).sort()).toEqual(["a", "b"]);
  });

  it("restores persisted rooms after close and repository reconstruction", async () => {
    const name = crypto.randomUUID();
    const first = new IndexedDbRoomRepository({ databaseName: name });
    await first.put(createRoom({ id: "persisted", now: 1 }));
    await first.close();
    const reopened = disk(name);
    expect((await reopened.list()).map((room) => room.id)).toEqual(["persisted"]);
  });
});

describe("IndexedDbRoomRepository contract", () => {
  const repository: RoomRepository = {
    async get() {
      return null;
    },
    async put() {},
    async list() {
      return Object.freeze([]);
    },
    async delete() {},
  };

  it("freezes returned room lists and clones stored rooms", async () => {
    const repo = disk();
    const room = createRoom({ id: "frozen", now: 1 });
    await repo.put(room);
    const rooms = await repo.list();
    expect(Object.isFrozen(rooms)).toBe(true);
    expect(rooms[0]).not.toBe(room);
    const fetched = await repo.get("frozen");
    expect(fetched).toEqual(room);
    expect(fetched).not.toBe(room);
  });

  it("sorts rooms by recency with deterministic id tie-break", async () => {
    const repo = disk();
    await repo.put(createRoom({ id: "b", now: 1 }));
    await repo.put(createRoom({ id: "B", now: 1 }));
    await repo.put(createRoom({ id: "a", now: 2 }));
    expect((await repo.list()).map((room) => room.id)).toEqual(["a", "B", "b"]);
  });

  it("deletes rooms idempotently", async () => {
    const repo = disk();
    await repo.put(createRoom({ id: "gone", now: 1 }));
    await repo.delete("gone");
    await expect(repo.delete("gone")).resolves.toBeUndefined();
    expect(await repo.get("gone")).toBeNull();
  });

  it("rejects non-canonical room ids with structured validation errors", async () => {
    const repo = disk();
    await expect(repo.get(" room ")).rejects.toMatchObject({ code: "VALIDATION" });
    await expect(repo.delete(" ")).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("rejects invalid signals before touching storage", async () => {
    const repo = disk();
    await expect(repo.list({} as AbortSignal)).rejects.toMatchObject({ code: "VALIDATION" });
    await expect(repo.get("a", {} as AbortSignal)).rejects.toMatchObject({
      code: "VALIDATION",
    });
  });

  it("rejects pre-cancelled operations without opening storage", async () => {
    const repo = disk();
    await expect(repo.list(AbortSignal.abort())).rejects.toMatchObject({ name: "AbortError" });
    await expect(repo.get("a", AbortSignal.abort())).rejects.toMatchObject({
      name: "AbortError",
    });
  });

  it("rejects rooms that fail schema validation before persistence", async () => {
    const repo = disk();
    const invalid = { ...createRoom({ id: "bad", now: 1 }), updatedAt: Number.NaN } as Room;
    await expect(repo.put(invalid)).rejects.toMatchObject({ code: "VALIDATION" });
    expect(await repo.list()).toEqual([]);
  });
});

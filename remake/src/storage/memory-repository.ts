import { SevenError } from "../core/errors";
import {
  MEMORY_LIMITS,
  cloneContextSummary,
  cloneMemoryRecord,
  isContextSummary,
  isMemoryRecord,
  migrateContextSummary,
  type ContextSummary,
  type MemoryRecord,
} from "../domain/memory";

export interface MemoryRepository {
  listForRoom(roomId: string, signal?: AbortSignal): Promise<readonly MemoryRecord[]>;
  listAll(signal?: AbortSignal): Promise<readonly MemoryRecord[]>;
  put(record: MemoryRecord, signal?: AbortSignal): Promise<void>;
  delete(memoryId: string, signal?: AbortSignal): Promise<void>;
  getSummary(roomId: string, signal?: AbortSignal): Promise<ContextSummary | null>;
  putSummary(summary: ContextSummary, signal?: AbortSignal): Promise<void>;
  deleteSummary(roomId: string, signal?: AbortSignal): Promise<void>;
  compareAndSwapSummary(
    roomId: string,
    expected: ContextSummary | null,
    next: ContextSummary | null,
    signal?: AbortSignal,
  ): Promise<boolean>;
}

function abortError(): DOMException {
  return new DOMException("Aborted", "AbortError");
}

function validateSignal(signal?: AbortSignal): void {
  if (
    signal !== undefined &&
    (!signal ||
      typeof signal !== "object" ||
      typeof signal.aborted !== "boolean" ||
      typeof signal.addEventListener !== "function" ||
      typeof signal.removeEventListener !== "function")
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "AbortSignal is malformed.",
    });
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  validateSignal(signal);
  if (signal?.aborted) throw abortError();
}

function canonicalId(value: unknown, field: string): string {
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

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function sortMemories(records: MemoryRecord[]): readonly MemoryRecord[] {
  return Object.freeze(
    records.sort(
      (a, b) =>
        b.priority - a.priority ||
        b.updatedAt - a.updatedAt ||
        compareText(a.id, b.id),
    ),
  );
}

export type MemoryRepositoryLimits = Readonly<{
  maxRecords?: number;
  maxSummaries?: number;
}>;

function repositoryLimits(options: MemoryRepositoryLimits): { records: number; summaries: number } {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new SevenError({ code: "VALIDATION", message: "Memory limits must be an object." });
  }
  const records = options.maxRecords ?? MEMORY_LIMITS.records;
  const summaries = options.maxSummaries ?? MEMORY_LIMITS.summaries;
  if (!Number.isSafeInteger(records) || records < 1 || records > MEMORY_LIMITS.records ||
      !Number.isSafeInteger(summaries) || summaries < 1 || summaries > MEMORY_LIMITS.summaries) {
    throw new SevenError({ code: "VALIDATION", message: "Memory repository limits must be positive integers within the hard limits." });
  }
  return { records, summaries };
}

function capacityError(): SevenError {
  return new SevenError({ code: "STORAGE", message: "Memory storage capacity reached. Delete an existing item before adding another." });
}

function sameSummary(a: ContextSummary | null, b: ContextSummary | null): boolean {
  if (a === null || b === null) return a === b;
  return (
    a.schemaVersion === b.schemaVersion &&
    a.roomId === b.roomId &&
    a.content === b.content &&
    a.throughMessageId === b.throughMessageId &&
    a.sourceFingerprint === b.sourceFingerprint &&
    a.createdAt === b.createdAt &&
    a.updatedAt === b.updatedAt
  );
}

export class InMemoryMemoryRepository implements MemoryRepository {
  private readonly records = new Map<string, MemoryRecord>();
  private readonly summaries = new Map<string, ContextSummary>();
  private readonly limits: { records: number; summaries: number };

  constructor(
    seed: readonly MemoryRecord[] = [],
    summaries: readonly ContextSummary[] = [],
    options: MemoryRepositoryLimits = {},
  ) {
    this.limits = repositoryLimits(options);
    if (!Array.isArray(seed) || !Array.isArray(summaries)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Memory repository seeds must be arrays.",
      });
    }
    if (seed.length > this.limits.records || summaries.length > this.limits.summaries) throw capacityError();
    for (const record of seed) {
      if (!isMemoryRecord(record)) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Memory repository seed is invalid.",
        });
      }
      if (this.records.has(record.id)) {
        throw new SevenError({
          code: "VALIDATION",
          message: `Duplicate memory id ${record.id}.`,
        });
      }
      this.records.set(record.id, cloneMemoryRecord(record));
    }
    for (const summary of summaries) {
      if (!isContextSummary(summary)) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Context summary seed is invalid.",
        });
      }
      if (this.summaries.has(summary.roomId)) {
        throw new SevenError({
          code: "VALIDATION",
          message: `Duplicate summary roomId ${summary.roomId}.`,
        });
      }
      this.summaries.set(summary.roomId, cloneContextSummary(summary));
    }
  }

  async listForRoom(
    roomId: string,
    signal?: AbortSignal,
  ): Promise<readonly MemoryRecord[]> {
    throwIfAborted(signal);
    const id = canonicalId(roomId, "roomId");
    const records = [...this.records.values()]
      .filter(
        (record) =>
          record.scope === "global" ||
          (record.scope === "room" && record.roomId === id),
      )
      .map(cloneMemoryRecord);
    throwIfAborted(signal);
    return sortMemories(records);
  }

  async listAll(signal?: AbortSignal): Promise<readonly MemoryRecord[]> {
    throwIfAborted(signal);
    return sortMemories([...this.records.values()].map(cloneMemoryRecord));
  }

  async put(record: MemoryRecord, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    if (!isMemoryRecord(record)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Memory record is invalid.",
      });
    }
    if (!this.records.has(record.id) && this.records.size >= this.limits.records) throw capacityError();
    this.records.set(record.id, cloneMemoryRecord(record));
    throwIfAborted(signal);
  }

  async delete(memoryId: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    this.records.delete(canonicalId(memoryId, "memoryId"));
    throwIfAborted(signal);
  }

  async getSummary(
    roomId: string,
    signal?: AbortSignal,
  ): Promise<ContextSummary | null> {
    throwIfAborted(signal);
    const summary = this.summaries.get(canonicalId(roomId, "roomId"));
    throwIfAborted(signal);
    return summary ? cloneContextSummary(summary) : null;
  }

  async putSummary(
    summary: ContextSummary,
    signal?: AbortSignal,
  ): Promise<void> {
    throwIfAborted(signal);
    if (!isContextSummary(summary)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context summary is invalid.",
      });
    }
    if (!this.summaries.has(summary.roomId) && this.summaries.size >= this.limits.summaries) throw capacityError();
    this.summaries.set(summary.roomId, cloneContextSummary(summary));
    throwIfAborted(signal);
  }

  async deleteSummary(roomId: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    this.summaries.delete(canonicalId(roomId, "roomId"));
    throwIfAborted(signal);
  }

  async compareAndSwapSummary(
    roomId: string,
    expected: ContextSummary | null,
    next: ContextSummary | null,
    signal?: AbortSignal,
  ): Promise<boolean> {
    throwIfAborted(signal);
    const id = canonicalId(roomId, "roomId");
    if (expected !== null && (!isContextSummary(expected) || expected.roomId !== id)) {
      throw new SevenError({ code: "VALIDATION", message: "Expected context summary is invalid." });
    }
    if (next !== null && (!isContextSummary(next) || next.roomId !== id)) {
      throw new SevenError({ code: "VALIDATION", message: "Next context summary is invalid." });
    }
    const current = this.summaries.get(id) ?? null;
    if (!sameSummary(current, expected)) return false;
    if (next === null) this.summaries.delete(id);
    else {
      if (current === null && this.summaries.size >= this.limits.summaries) throw capacityError();
      this.summaries.set(id, cloneContextSummary(next));
    }
    throwIfAborted(signal);
    return true;
  }
}

type IndexedDbMemoryRepositoryOptions = MemoryRepositoryLimits & Readonly<{
  databaseName?: string;
  version?: number;
}>;

export class IndexedDbMemoryRepository implements MemoryRepository {
  private readonly databaseName: string;
  private readonly version: number;
  private readonly limits: { records: number; summaries: number };
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(options: IndexedDbMemoryRepositoryOptions = {}) {
    this.limits = repositoryLimits(options);
    this.databaseName = options.databaseName === undefined
      ? "seven-remake-memory" : canonicalId(options.databaseName, "Memory databaseName");
    this.version = options.version ?? 1;
    if (!Number.isSafeInteger(this.version) || this.version <= 0 || this.version > 0xffff_ffff) {
      throw new SevenError({ code: "VALIDATION", message: "Memory IndexedDB version must be a positive 32-bit integer." });
    }
  }

  async listForRoom(roomId: string, signal?: AbortSignal): Promise<readonly MemoryRecord[]> {
    throwIfAborted(signal);
    const id = canonicalId(roomId, "roomId");
    const raw = await this.read<unknown[]>("memories", (store) => store.getAll(undefined, this.limits.records + 1), signal);
    throwIfAborted(signal);
    if (raw.length > this.limits.records) throw capacityError();
    const records: MemoryRecord[] = [];
    for (const value of raw) {
      if (!isMemoryRecord(value)) throw this.storageError("Stored memory failed schema validation.");
      if (value.scope === "global" || value.roomId === id) records.push(cloneMemoryRecord(value));
    }
    return sortMemories(records);
  }

  async listAll(signal?: AbortSignal): Promise<readonly MemoryRecord[]> {
    throwIfAborted(signal);
    const raw = await this.read<unknown[]>("memories", (store) => store.getAll(undefined, this.limits.records + 1), signal);
    throwIfAborted(signal);
    if (raw.length > this.limits.records) throw capacityError();
    const records: MemoryRecord[] = [];
    for (const value of raw) {
      if (!isMemoryRecord(value)) throw this.storageError("Stored memory failed schema validation.");
      records.push(cloneMemoryRecord(value));
    }
    return sortMemories(records);
  }

  async put(record: MemoryRecord, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const snapshot = cloneMemoryRecord(record);
    await this.putBounded("memories", snapshot.id, snapshot, this.limits.records, signal);
  }

  async delete(memoryId: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const id = canonicalId(memoryId, "memoryId");
    await this.run("memories", "readwrite", (store) => { store.delete(id); }, signal);
  }

  async getSummary(roomId: string, signal?: AbortSignal): Promise<ContextSummary | null> {
    throwIfAborted(signal);
    const id = canonicalId(roomId, "roomId");
    const raw = await this.read<unknown>("summaries", (store) => store.get(id), signal);
    throwIfAborted(signal);
    if (raw === undefined) return null;
    const migrated = migrateContextSummary(raw);
    if (migrated === null || migrated.roomId !== id) {
      throw this.storageError("Stored context summary failed schema validation.");
    }
    if (!isContextSummary(raw)) {
      const upgraded = await this.compareAndSwapSummary(id, migrated, migrated, signal);
      if (!upgraded) {
        const latestRaw = await this.read<unknown>("summaries", (store) => store.get(id), signal);
        if (latestRaw === undefined) return null;
        const latest = migrateContextSummary(latestRaw);
        if (latest === null || latest.roomId !== id) {
          throw this.storageError("Stored context summary failed schema validation.");
        }
        return cloneContextSummary(latest);
      }
    }
    return cloneContextSummary(migrated);
  }

  async putSummary(summary: ContextSummary, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const snapshot = cloneContextSummary(summary);
    await this.putBounded("summaries", snapshot.roomId, snapshot, this.limits.summaries, signal);
  }

  async deleteSummary(roomId: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const id = canonicalId(roomId, "roomId");
    await this.run("summaries", "readwrite", (store) => { store.delete(id); }, signal);
  }

  async compareAndSwapSummary(
    roomId: string,
    expected: ContextSummary | null,
    next: ContextSummary | null,
    signal?: AbortSignal,
  ): Promise<boolean> {
    throwIfAborted(signal);
    const id = canonicalId(roomId, "roomId");
    if (expected !== null && (!isContextSummary(expected) || expected.roomId !== id)) {
      throw new SevenError({ code: "VALIDATION", message: "Expected context summary is invalid." });
    }
    if (next !== null && (!isContextSummary(next) || next.roomId !== id)) {
      throw new SevenError({ code: "VALIDATION", message: "Next context summary is invalid." });
    }
    const snapshot = next === null ? null : cloneContextSummary(next);
    let swapped = false;
    await this.run("summaries", "readwrite", (store, fail) => {
      const request = store.get(id);
      request.onsuccess = () => {
        const raw = request.result as unknown;
        let current: ContextSummary | null = null;
        if (raw !== undefined) {
          current = migrateContextSummary(raw);
          if (current === null || current.roomId !== id) {
            fail(this.storageError("Stored context summary failed schema validation."));
            return;
          }
        }
        if (!sameSummary(current, expected)) return;
        if (snapshot === null) {
          store.delete(id);
          swapped = true;
          return;
        }
        if (current !== null) {
          store.put(snapshot);
          swapped = true;
          return;
        }
        const count = store.count();
        count.onsuccess = () => {
          if (count.result >= this.limits.summaries) {
            fail(capacityError());
            return;
          }
          store.put(snapshot);
          swapped = true;
        };
      };
    }, signal);
    throwIfAborted(signal);
    return swapped;
  }

  async close(): Promise<void> {
    const pending = this.dbPromise;
    this.dbPromise = null;
    if (!pending) return;
    try { (await pending).close(); } catch { /* Failed opens have no usable connection. */ }
  }

  private storageError(message: string, cause?: unknown): SevenError {
    return new SevenError({ code: "STORAGE", message, cause });
  }

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    let settled = false;
    const promise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(this.storageError("IndexedDB is unavailable."));
        return;
      }
      let request: IDBOpenDBRequest;
      try { request = indexedDB.open(this.databaseName, this.version); }
      catch (error) { reject(this.storageError("Failed to open memory storage.", error)); return; }
      request.onupgradeneeded = () => {
        if (settled) { request.transaction?.abort(); return; }
        const db = request.result;
        if (!db.objectStoreNames.contains("memories")) db.createObjectStore("memories", { keyPath: "id" });
        if (!db.objectStoreNames.contains("summaries")) db.createObjectStore("summaries", { keyPath: "roomId" });
      };
      request.onsuccess = () => {
        const db = request.result;
        if (settled) { db.close(); return; }
        settled = true;
        try {
          const tx = db.transaction(["memories", "summaries"], "readonly");
          if (tx.objectStore("memories").keyPath !== "id" || tx.objectStore("summaries").keyPath !== "roomId") {
            throw this.storageError("Memory storage schema is incompatible.");
          }
        } catch (error) {
          db.close();
          reject(this.storageError("Memory storage schema is incompatible.", error));
          return;
        }
        const invalidate = () => { if (this.dbPromise === promise) this.dbPromise = null; };
        db.onversionchange = () => { db.close(); invalidate(); };
        db.onclose = invalidate;
        resolve(db);
      };
      request.onerror = () => {
        if (settled) return;
        settled = true;
        reject(this.storageError("Failed to open memory storage.", request.error));
      };
      request.onblocked = () => {
        if (settled) return;
        settled = true;
        reject(new SevenError({ code: "STORAGE", message: "Memory storage upgrade is blocked.", retryable: true }));
      };
    }).catch((error: unknown) => {
      if (this.dbPromise === promise) this.dbPromise = null;
      throw error;
    });
    this.dbPromise = promise;
    return promise;
  }

  private withSignal<T>(promise: Promise<T>, signal?: AbortSignal): Promise<T> {
    if (!signal) return promise;
    return new Promise<T>((resolve, reject) => {
      const onAbort = () => { cleanup(); reject(abortError()); };
      const cleanup = () => signal.removeEventListener("abort", onAbort);
      signal.addEventListener("abort", onAbort, { once: true });
      // Always attach both handlers, including when already aborted, to consume open failures.
      promise.then((value) => { cleanup(); resolve(value); }, (error: unknown) => { cleanup(); reject(error); });
      if (signal.aborted) onAbort();
    });
  }

  private async read<T>(store: string, request: (store: IDBObjectStore) => IDBRequest<T>, signal?: AbortSignal): Promise<T> {
    let value!: T;
    await this.run(store, "readonly", (objectStore) => {
      request(objectStore).onsuccess = (event) => { value = (event.target as IDBRequest<T>).result; };
    }, signal);
    return value;
  }

  private async putBounded(store: string, key: string, value: MemoryRecord | ContextSummary, limit: number, signal?: AbortSignal): Promise<void> {
    await this.run(store, "readwrite", (objectStore, fail) => {
      // The existence check, count and put share one transaction, so concurrent writers cannot overrun the limit.
      const existing = objectStore.getKey(key);
      existing.onsuccess = () => {
        if (existing.result !== undefined) { objectStore.put(value); return; }
        const count = objectStore.count();
        count.onsuccess = () => {
          if (count.result >= limit) { fail(capacityError()); return; }
          objectStore.put(value);
        };
      };
    }, signal);
  }

  private async run(
    store: string,
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore, fail: (error: unknown) => void) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    throwIfAborted(signal);
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    let tx: IDBTransaction;
    try { tx = db.transaction(store, mode); }
    catch (error) { throw this.storageError("Could not start memory storage transaction.", error); }
    await new Promise<void>((resolve, reject) => {
      let failure: unknown;
      let failed = false;
      const cleanup = () => signal?.removeEventListener("abort", onAbort);
      const fail = (error: unknown) => {
        if (failed) return;
        failed = true;
        failure = error;
        try { tx.abort(); } catch { cleanup(); reject(error); }
      };
      const onAbort = () => fail(abortError());
      tx.oncomplete = () => { cleanup(); failed ? reject(failure) : resolve(); };
      tx.onabort = () => {
        cleanup();
        reject(failed ? failure : this.storageError("Memory storage transaction was aborted.", tx.error));
      };
      // Let IndexedDB abort on request errors. Resolution/rejection is tied to the durable transaction boundary.
      tx.onerror = () => {
        if (!failed) { failure = this.storageError("Memory storage transaction failed.", tx.error); failed = true; }
      };
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) { onAbort(); return; }
      try { action(tx.objectStore(store), fail); }
      catch (error) { fail(error instanceof SevenError ? error : this.storageError("Memory storage operation failed.", error)); }
    });
  }
}

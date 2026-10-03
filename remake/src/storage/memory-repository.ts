import { SevenError } from "../core/errors";
import {
  cloneContextSummary,
  cloneMemoryRecord,
  isContextSummary,
  isMemoryRecord,
  type ContextSummary,
  type MemoryRecord,
} from "../domain/memory";

export interface MemoryRepository {
  listForRoom(roomId: string, signal?: AbortSignal): Promise<readonly MemoryRecord[]>;
  put(record: MemoryRecord, signal?: AbortSignal): Promise<void>;
  delete(memoryId: string, signal?: AbortSignal): Promise<void>;
  getSummary(roomId: string, signal?: AbortSignal): Promise<ContextSummary | null>;
  putSummary(summary: ContextSummary, signal?: AbortSignal): Promise<void>;
  deleteSummary(roomId: string, signal?: AbortSignal): Promise<void>;
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
    value !== value.trim()
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

export class InMemoryMemoryRepository implements MemoryRepository {
  private readonly records = new Map<string, MemoryRecord>();
  private readonly summaries = new Map<string, ContextSummary>();

  constructor(
    seed: readonly MemoryRecord[] = [],
    summaries: readonly ContextSummary[] = [],
  ) {
    if (!Array.isArray(seed) || !Array.isArray(summaries)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Memory repository seeds must be arrays.",
      });
    }
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

  async put(record: MemoryRecord, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    if (!isMemoryRecord(record)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Memory record is invalid.",
      });
    }
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
    this.summaries.set(summary.roomId, cloneContextSummary(summary));
    throwIfAborted(signal);
  }

  async deleteSummary(roomId: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    this.summaries.delete(canonicalId(roomId, "roomId"));
    throwIfAborted(signal);
  }
}

type IndexedDbMemoryRepositoryOptions = Readonly<{
  databaseName?: string;
  version?: number;
}>;

export class IndexedDbMemoryRepository implements MemoryRepository {
  private readonly databaseName: string;
  private readonly version: number;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(options: IndexedDbMemoryRepositoryOptions = {}) {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Memory IndexedDB options must be an object.",
      });
    }
    if (
      options.databaseName !== undefined &&
      (typeof options.databaseName !== "string" ||
        !options.databaseName.trim() ||
        options.databaseName !== options.databaseName.trim())
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Memory databaseName must be a canonical non-empty string.",
      });
    }
    const version = options.version ?? 1;
    if (!Number.isSafeInteger(version) || version <= 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Memory IndexedDB version must be a positive safe integer.",
      });
    }
    this.databaseName = options.databaseName ?? "seven-remake-memory";
    this.version = version;
  }

  async listForRoom(
    roomId: string,
    signal?: AbortSignal,
  ): Promise<readonly MemoryRecord[]> {
    const id = canonicalId(roomId, "roomId");
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    const tx = db.transaction("memories", "readonly");
    const raw = await this.request(
      tx.objectStore("memories").getAll(),
      tx,
      signal,
    );
    const records = raw
      .map((value) => {
        if (!isMemoryRecord(value)) {
          throw new SevenError({
            code: "STORAGE",
            message: "Stored memory failed schema validation.",
          });
        }
        return cloneMemoryRecord(value);
      })
      .filter(
        (record) =>
          record.scope === "global" ||
          (record.scope === "room" && record.roomId === id),
      );
    return sortMemories(records);
  }

  async put(record: MemoryRecord, signal?: AbortSignal): Promise<void> {
    if (!isMemoryRecord(record)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Memory record is invalid.",
      });
    }
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    const tx = db.transaction("memories", "readwrite");
    tx.objectStore("memories").put(cloneMemoryRecord(record));
    await this.transaction(tx, signal);
  }

  async delete(memoryId: string, signal?: AbortSignal): Promise<void> {
    const id = canonicalId(memoryId, "memoryId");
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    const tx = db.transaction("memories", "readwrite");
    tx.objectStore("memories").delete(id);
    await this.transaction(tx, signal);
  }

  async getSummary(
    roomId: string,
    signal?: AbortSignal,
  ): Promise<ContextSummary | null> {
    const id = canonicalId(roomId, "roomId");
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    const tx = db.transaction("summaries", "readonly");
    const raw = await this.request(
      tx.objectStore("summaries").get(id),
      tx,
      signal,
    );
    if (raw === undefined) return null;
    if (!isContextSummary(raw)) {
      throw new SevenError({
        code: "STORAGE",
        message: "Stored context summary failed schema validation.",
      });
    }
    return cloneContextSummary(raw);
  }

  async putSummary(
    summary: ContextSummary,
    signal?: AbortSignal,
  ): Promise<void> {
    if (!isContextSummary(summary)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context summary is invalid.",
      });
    }
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    const tx = db.transaction("summaries", "readwrite");
    tx.objectStore("summaries").put(cloneContextSummary(summary));
    await this.transaction(tx, signal);
  }

  async deleteSummary(roomId: string, signal?: AbortSignal): Promise<void> {
    const id = canonicalId(roomId, "roomId");
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    const tx = db.transaction("summaries", "readwrite");
    tx.objectStore("summaries").delete(id);
    await this.transaction(tx, signal);
  }

  async close(): Promise<void> {
    const pending = this.dbPromise;
    this.dbPromise = null;
    if (!pending) return;
    try {
      const db = await pending;
      db.close();
    } catch {
      // No usable connection exists after a failed open.
    }
  }

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    if (typeof indexedDB === "undefined") {
      throw new SevenError({
        code: "STORAGE",
        message: "IndexedDB is unavailable.",
      });
    }

    let settled = false;
    const promise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, this.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("memories")) {
          db.createObjectStore("memories", { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains("summaries")) {
          db.createObjectStore("summaries", { keyPath: "roomId" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        if (settled) {
          db.close();
          return;
        }
        settled = true;
        db.onversionchange = () => {
          db.close();
          if (this.dbPromise === promise) this.dbPromise = null;
        };
        resolve(db);
      };
      request.onerror = () => {
        if (settled) return;
        settled = true;
        reject(
          new SevenError({
            code: "STORAGE",
            message: "Failed to open memory storage.",
          }),
        );
      };
      request.onblocked = () => {
        if (settled) return;
        settled = true;
        reject(
          new SevenError({
            code: "STORAGE",
            message: "Memory storage upgrade is blocked.",
            retryable: true,
          }),
        );
      };
    }).catch((error: unknown) => {
      if (this.dbPromise === promise) this.dbPromise = null;
      throw error;
    });
    this.dbPromise = promise;
    return promise;
  }

  private withSignal<T>(
    promise: Promise<T>,
    signal?: AbortSignal,
  ): Promise<T> {
    validateSignal(signal);
    if (!signal) return promise;
    if (signal.aborted) return Promise.reject(abortError());

    return new Promise<T>((resolve, reject) => {
      let settled = false;
      const cleanup = () => signal.removeEventListener("abort", onAbort);
      const onAbort = () => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(abortError());
      };
      signal.addEventListener("abort", onAbort, { once: true });
      promise.then(
        (value) => {
          if (settled) return;
          settled = true;
          cleanup();
          resolve(value);
        },
        (error: unknown) => {
          if (settled) return;
          settled = true;
          cleanup();
          reject(error);
        },
      );
    });
  }

  private request<T>(
    request: IDBRequest<T>,
    tx: IDBTransaction,
    signal?: AbortSignal,
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      let settled = false;
      const cleanup = () => signal?.removeEventListener("abort", onAbort);
      const finishResolve = (value: T) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };
      const finishReject = (error: unknown) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      };
      const onAbort = () => {
        if (settled) return;
        try {
          tx.abort();
        } catch {
          // Transaction may already be completing.
        }
        finishReject(abortError());
      };
      if (signal?.aborted) {
        onAbort();
        return;
      }
      signal?.addEventListener("abort", onAbort, { once: true });
      request.onsuccess = () => finishResolve(request.result);
      request.onerror = () =>
        finishReject(
          new SevenError({
            code: "STORAGE",
            message: "Memory storage request failed.",
          }),
        );
      tx.onabort = () =>
        finishReject(
          signal?.aborted
            ? abortError()
            : new SevenError({
                code: "STORAGE",
                message: "Memory storage transaction was aborted.",
              }),
        );
    });
  }

  private transaction(
    tx: IDBTransaction,
    signal?: AbortSignal,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      let settled = false;
      const cleanup = () => signal?.removeEventListener("abort", onAbort);
      const finishResolve = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve();
      };
      const finishReject = (error: unknown) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      };
      const onAbort = () => {
        if (settled) return;
        try {
          tx.abort();
        } catch {
          // Transaction may already be completing.
        }
        finishReject(abortError());
      };
      if (signal?.aborted) {
        onAbort();
        return;
      }
      signal?.addEventListener("abort", onAbort, { once: true });
      tx.oncomplete = finishResolve;
      tx.onerror = () =>
        finishReject(
          new SevenError({
            code: "STORAGE",
            message: "Memory storage transaction failed.",
          }),
        );
      tx.onabort = () =>
        finishReject(
          signal?.aborted
            ? abortError()
            : new SevenError({
                code: "STORAGE",
                message: "Memory storage transaction was aborted.",
              }),
        );
    });
  }
}

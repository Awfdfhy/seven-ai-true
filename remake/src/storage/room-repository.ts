import { SevenError } from "../core/errors";
import { cloneRoom, isRoom, type Room } from "../domain/chat";

export interface RoomRepository {
  get(roomId: string, signal?: AbortSignal): Promise<Room | null>;
  put(room: Room, signal?: AbortSignal): Promise<void>;
  list(signal?: AbortSignal): Promise<readonly Room[]>;
  delete(roomId: string, signal?: AbortSignal): Promise<void>;
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

function requireRoomId(roomId: string): string {
  if (typeof roomId !== "string" || !roomId.trim() || roomId !== roomId.trim()) {
    throw new SevenError({
      code: "VALIDATION",
      message: "roomId must be a canonical non-empty string.",
    });
  }
  return roomId;
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function assertRoom(room: Room): void {
  if (!isRoom(room)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Room failed schema validation before persistence.",
    });
  }
}

export class InMemoryRoomRepository implements RoomRepository {
  private readonly rooms = new Map<string, Room>();

  constructor(seed: readonly Room[] = []) {
    if (!Array.isArray(seed)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Room repository seed must be an array.",
      });
    }
    for (const room of seed) {
      assertRoom(room);
      if (this.rooms.has(room.id)) {
        throw new SevenError({
          code: "VALIDATION",
          message: `Duplicate seed room id ${room.id}.`,
        });
      }
      this.rooms.set(room.id, cloneRoom(room));
    }
  }

  async get(roomId: string, signal?: AbortSignal): Promise<Room | null> {
    throwIfAborted(signal);
    const id = requireRoomId(roomId);
    const room = this.rooms.get(id);
    throwIfAborted(signal);
    return room ? cloneRoom(room) : null;
  }

  async put(room: Room, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    assertRoom(room);
    this.rooms.set(room.id, cloneRoom(room));
    throwIfAborted(signal);
  }

  async list(signal?: AbortSignal): Promise<readonly Room[]> {
    throwIfAborted(signal);
    const result = Object.freeze(
      [...this.rooms.values()]
        .map(cloneRoom)
        .sort((a, b) => b.updatedAt - a.updatedAt || compareText(a.id, b.id)),
    );
    throwIfAborted(signal);
    return result;
  }

  async delete(roomId: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    this.rooms.delete(requireRoomId(roomId));
    throwIfAborted(signal);
  }
}

type IndexedDbRoomRepositoryOptions = Readonly<{
  databaseName?: string;
  version?: number;
}>;

export class IndexedDbRoomRepository implements RoomRepository {
  private readonly databaseName: string;
  private readonly version: number;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(options: IndexedDbRoomRepositoryOptions = {}) {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "IndexedDB repository options must be an object.",
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
        message: "databaseName must be a canonical non-empty string.",
      });
    }
    this.databaseName = options.databaseName ?? "seven-remake";
    const version = options.version ?? 1;
    if (!Number.isSafeInteger(version) || version <= 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "IndexedDB version must be a positive integer.",
      });
    }
    this.version = version;
  }

  async get(roomId: string, signal?: AbortSignal): Promise<Room | null> {
    const id = requireRoomId(roomId);
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    const tx = this.startTransaction(db, "readonly");
    const raw = await this.request(
      tx.objectStore("rooms").get(id),
      tx,
      signal,
    );
    if (raw === undefined) return null;
    if (!isRoom(raw)) {
      throw new SevenError({
        code: "STORAGE",
        message: `Room ${id} failed schema validation.`,
        details: { roomId: id },
      });
    }
    return cloneRoom(raw);
  }

  async put(room: Room, signal?: AbortSignal): Promise<void> {
    assertRoom(room);
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    const tx = this.startTransaction(db, "readwrite");
    tx.objectStore("rooms").put(cloneRoom(room));
    await this.transaction(tx, signal);
  }

  async list(signal?: AbortSignal): Promise<readonly Room[]> {
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    const tx = this.startTransaction(db, "readonly");
    const raw = await this.request(
      tx.objectStore("rooms").getAll(),
      tx,
      signal,
    );
    const rooms = raw.map((value) => {
      if (!isRoom(value)) {
        throw new SevenError({
          code: "STORAGE",
          message: "Stored room failed schema validation.",
        });
      }
      return cloneRoom(value);
    });
    return Object.freeze(
      rooms.sort(
        (a, b) => b.updatedAt - a.updatedAt || compareText(a.id, b.id),
      ),
    );
  }

  async delete(roomId: string, signal?: AbortSignal): Promise<void> {
    const id = requireRoomId(roomId);
    const db = await this.withSignal(this.open(), signal);
    throwIfAborted(signal);
    const tx = this.startTransaction(db, "readwrite");
    tx.objectStore("rooms").delete(id);
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
      // A failed/blocked open has no usable database handle to close.
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
        if (!db.objectStoreNames.contains("rooms")) {
          db.createObjectStore("rooms", { keyPath: "id" });
        }
      };

      request.onsuccess = () => {
        const db = request.result;
        if (settled) {
          db.close();
          return;
        }

        // Fail closed when another writer created an incompatible "rooms" store.
        try {
          const probe = db.transaction("rooms", "readonly");
          if (probe.objectStore("rooms").keyPath !== "id") {
            throw new Error("unexpected rooms keyPath");
          }
        } catch (error) {
          db.close();
          reject(
            new SevenError({
              code: "STORAGE",
              message: "Room storage schema is incompatible.",
              cause: error,
            }),
          );
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
            message: "Failed to open room storage.",
            cause: request.error,
          }),
        );
      };

      request.onblocked = () => {
        if (settled) return;
        settled = true;
        reject(
          new SevenError({
            code: "STORAGE",
            message: "Room storage upgrade is blocked.",
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

  private startTransaction(db: IDBDatabase, mode: IDBTransactionMode): IDBTransaction {
    try {
      return db.transaction("rooms", mode);
    } catch (error) {
      throw new SevenError({
        code: "STORAGE",
        message: "Room storage transaction could not be started.",
        cause: error,
      });
    }
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
          // The transaction may already be completing.
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
            message: "Room storage request failed.",
            cause: request.error,
          }),
        );
      tx.onabort = () => {
        if (signal?.aborted) {
          finishReject(abortError());
          return;
        }
        finishReject(
          new SevenError({
            code: "STORAGE",
            message: "Room storage transaction was aborted.",
            cause: tx.error,
          }),
        );
      };
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
          // The transaction may already be completing.
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
            message: "Room storage transaction failed.",
            cause: tx.error,
          }),
        );
      tx.onabort = () => {
        if (signal?.aborted) {
          finishReject(abortError());
          return;
        }
        finishReject(
          new SevenError({
            code: "STORAGE",
            message: "Room storage transaction was aborted.",
            cause: tx.error,
          }),
        );
      };
    });
  }
}

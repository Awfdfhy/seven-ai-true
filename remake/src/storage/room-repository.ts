import { SevenError } from "../core/errors";
import { cloneRoom, isRoom, type Room } from "../domain/chat";

export interface RoomRepository {
  get(roomId: string): Promise<Room | null>;
  put(room: Room): Promise<void>;
  list(): Promise<readonly Room[]>;
  delete(roomId: string): Promise<void>;
}

export class InMemoryRoomRepository implements RoomRepository {
  private readonly rooms = new Map<string, Room>();

  constructor(seed: readonly Room[] = []) {
    for (const room of seed) this.rooms.set(room.id, cloneRoom(room));
  }

  async get(roomId: string): Promise<Room | null> {
    const room = this.rooms.get(roomId);
    return room ? cloneRoom(room) : null;
  }

  async put(room: Room): Promise<void> {
    this.rooms.set(room.id, cloneRoom(room));
  }

  async list(): Promise<readonly Room[]> {
    return [...this.rooms.values()]
      .map(cloneRoom)
      .sort((a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id));
  }

  async delete(roomId: string): Promise<void> {
    this.rooms.delete(roomId);
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
    this.databaseName = options.databaseName ?? "seven-remake";
    this.version = options.version ?? 1;
  }

  async get(roomId: string): Promise<Room | null> {
    const db = await this.open();
    const raw = await this.request<unknown>(
      db.transaction("rooms", "readonly").objectStore("rooms").get(roomId),
    );
    if (raw === undefined) return null;
    if (!isRoom(raw)) {
      throw new SevenError({
        code: "STORAGE",
        message: `Room ${roomId} failed schema validation.`,
        details: { roomId },
      });
    }
    return cloneRoom(raw);
  }

  async put(room: Room): Promise<void> {
    const db = await this.open();
    const tx = db.transaction("rooms", "readwrite");
    tx.objectStore("rooms").put(cloneRoom(room));
    await this.transaction(tx);
  }

  async list(): Promise<readonly Room[]> {
    const db = await this.open();
    const raw = await this.request<unknown[]>(
      db.transaction("rooms", "readonly").objectStore("rooms").getAll(),
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
    return rooms.sort(
      (a, b) => b.updatedAt - a.updatedAt || a.id.localeCompare(b.id),
    );
  }

  async delete(roomId: string): Promise<void> {
    const db = await this.open();
    const tx = db.transaction("rooms", "readwrite");
    tx.objectStore("rooms").delete(roomId);
    await this.transaction(tx);
  }

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    if (typeof indexedDB === "undefined") {
      throw new SevenError({
        code: "STORAGE",
        message: "IndexedDB is unavailable.",
      });
    }

    this.dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, this.version);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("rooms")) {
          db.createObjectStore("rooms", { keyPath: "id" });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(
          new SevenError({
            code: "STORAGE",
            message: "Failed to open room storage.",
            cause: request.error,
          }),
        );
      request.onblocked = () =>
        reject(
          new SevenError({
            code: "STORAGE",
            message: "Room storage upgrade is blocked.",
            retryable: true,
          }),
        );
    }).catch((error: unknown) => {
      this.dbPromise = null;
      throw error;
    });

    return this.dbPromise;
  }

  private request<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () =>
        reject(
          new SevenError({
            code: "STORAGE",
            message: "Room storage request failed.",
            cause: request.error,
          }),
        );
    });
  }

  private transaction(tx: IDBTransaction): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () =>
        reject(
          new SevenError({
            code: "STORAGE",
            message: "Room storage transaction failed.",
            cause: tx.error,
          }),
        );
      tx.onabort = () =>
        reject(
          new SevenError({
            code: "STORAGE",
            message: "Room storage transaction was aborted.",
            cause: tx.error,
          }),
        );
    });
  }
}

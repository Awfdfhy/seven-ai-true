import { SevenError } from "../core/errors";
import { cloneRpgSnapshot, type RpgCanonSnapshot } from "../rpg/domain";

export interface RpgRepository {
  get(id: string, signal?: AbortSignal): Promise<RpgCanonSnapshot | null>;
  compareAndSwap(
    id: string,
    expectedRevision: number | null,
    next: RpgCanonSnapshot,
    signal?: AbortSignal,
  ): Promise<boolean>;
}

function canonicalId(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim()) {
    throw new SevenError({ code: "VALIDATION", message: "RPG repository id must be canonical." });
  }
  return value;
}

function throwIfAborted(signal?: AbortSignal): void {
  if (signal !== undefined && (
    !signal ||
    typeof signal !== "object" ||
    typeof signal.aborted !== "boolean" ||
    typeof signal.addEventListener !== "function"
  )) {
    throw new SevenError({ code: "VALIDATION", message: "AbortSignal is malformed." });
  }
  if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
}

export class InMemoryRpgRepository implements RpgRepository {
  private readonly values = new Map<string, RpgCanonSnapshot>();

  async get(id: string, signal?: AbortSignal): Promise<RpgCanonSnapshot | null> {
    throwIfAborted(signal);
    const value = this.values.get(canonicalId(id));
    return value ? cloneRpgSnapshot(value) : null;
  }

  async compareAndSwap(
    id: string,
    expectedRevision: number | null,
    next: RpgCanonSnapshot,
    signal?: AbortSignal,
  ): Promise<boolean> {
    throwIfAborted(signal);
    const key = canonicalId(id);
    const snapshot = cloneRpgSnapshot(next);
    if (snapshot.id !== key) {
      throw new SevenError({ code: "VALIDATION", message: "RPG snapshot id does not match repository key." });
    }
    const current = this.values.get(key);
    const actual = current?.revision ?? null;
    if (actual !== expectedRevision) return false;
    this.values.set(key, snapshot);
    throwIfAborted(signal);
    return true;
  }
}

export class IndexedDbRpgRepository implements RpgRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(
    private readonly databaseName = "seven-remake-rpg",
    private readonly version = 1,
  ) {
    canonicalId(databaseName);
    if (!Number.isSafeInteger(version) || version <= 0 || version > 0xffff_ffff) {
      throw new SevenError({ code: "VALIDATION", message: "RPG database version is invalid." });
    }
  }

  async get(id: string, signal?: AbortSignal): Promise<RpgCanonSnapshot | null> {
    throwIfAborted(signal);
    const key = canonicalId(id);
    let raw: unknown;
    await this.run("readonly", (store) => {
      const request = store.get(key);
      request.onsuccess = () => { raw = request.result; };
    }, signal);
    if (raw === undefined) return null;
    try { return cloneRpgSnapshot(raw as RpgCanonSnapshot); }
    catch (error) {
      throw new SevenError({ code: "STORAGE", message: "Stored RPG snapshot failed schema validation.", cause: error });
    }
  }

  async compareAndSwap(
    id: string,
    expectedRevision: number | null,
    next: RpgCanonSnapshot,
    signal?: AbortSignal,
  ): Promise<boolean> {
    throwIfAborted(signal);
    const key = canonicalId(id);
    const snapshot = cloneRpgSnapshot(next);
    if (snapshot.id !== key) {
      throw new SevenError({ code: "VALIDATION", message: "RPG snapshot id does not match repository key." });
    }
    let swapped = false;
    await this.run("readwrite", (store, fail) => {
      const request = store.get(key);
      request.onsuccess = () => {
        let currentRevision: number | null = null;
        if (request.result !== undefined) {
          try { currentRevision = cloneRpgSnapshot(request.result as RpgCanonSnapshot).revision; }
          catch (error) { fail(new SevenError({ code: "STORAGE", message: "Stored RPG snapshot failed schema validation.", cause: error })); return; }
        }
        if (currentRevision !== expectedRevision) return;
        store.put(snapshot);
        swapped = true;
      };
    }, signal);
    return swapped;
  }

  async close(): Promise<void> {
    const pending = this.dbPromise;
    this.dbPromise = null;
    if (!pending) return;
    try { (await pending).close(); } catch { /* no usable database */ }
  }

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    let settled = false;
    const promise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new SevenError({ code: "STORAGE", message: "IndexedDB is unavailable." }));
        return;
      }
      const request = indexedDB.open(this.databaseName, this.version);
      request.onupgradeneeded = () => {
        if (!request.result.objectStoreNames.contains("snapshots")) {
          request.result.createObjectStore("snapshots", { keyPath: "id" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        if (settled) { db.close(); return; }
        settled = true;
        try {
          if (db.transaction("snapshots", "readonly").objectStore("snapshots").keyPath !== "id") {
            throw new Error("incompatible keyPath");
          }
        } catch (error) {
          db.close();
          reject(new SevenError({ code: "STORAGE", message: "RPG storage schema is incompatible.", cause: error }));
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
        reject(new SevenError({ code: "STORAGE", message: "Failed to open RPG storage.", cause: request.error }));
      };
      request.onblocked = () => {
        if (settled) return;
        settled = true;
        reject(new SevenError({ code: "STORAGE", message: "RPG storage upgrade is blocked.", retryable: true }));
      };
    }).catch((error: unknown) => {
      if (this.dbPromise === promise) this.dbPromise = null;
      throw error;
    });
    this.dbPromise = promise;
    return promise;
  }

  private async run(
    mode: IDBTransactionMode,
    action: (store: IDBObjectStore, fail: (error: unknown) => void) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    throwIfAborted(signal);
    const db = await this.open();
    throwIfAborted(signal);
    const tx = db.transaction("snapshots", mode);
    await new Promise<void>((resolve, reject) => {
      let failure: unknown;
      const cleanup = () => signal?.removeEventListener("abort", onAbort);
      const fail = (error: unknown) => {
        failure = error;
        try { tx.abort(); } catch { cleanup(); reject(error); }
      };
      const onAbort = () => fail(new DOMException("Aborted", "AbortError"));
      tx.oncomplete = () => { cleanup(); resolve(); };
      tx.onabort = () => { cleanup(); reject(failure ?? new SevenError({ code: "STORAGE", message: "RPG transaction aborted.", cause: tx.error })); };
      tx.onerror = () => { if (failure === undefined) failure = new SevenError({ code: "STORAGE", message: "RPG transaction failed.", cause: tx.error }); };
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) { onAbort(); return; }
      try { action(tx.objectStore("snapshots"), fail); }
      catch (error) { fail(error); }
    });
  }
}

import { SevenError } from "../core/errors";
import { cloneResearchResult, type ResearchResult } from "../domain/research";

export interface ResearchRepository {
  get(query: string, signal?: AbortSignal): Promise<ResearchResult | null>;
  put(result: ResearchResult, signal?: AbortSignal): Promise<void>;
  delete(query: string, signal?: AbortSignal): Promise<void>;
}

function canonicalQuery(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim()) {
    throw new SevenError({ code: "VALIDATION", message: "Research query must be canonical." });
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

export class InMemoryResearchRepository implements ResearchRepository {
  private readonly values = new Map<string, ResearchResult>();

  async get(query: string, signal?: AbortSignal): Promise<ResearchResult | null> {
    throwIfAborted(signal);
    const value = this.values.get(canonicalQuery(query));
    return value ? cloneResearchResult(value) : null;
  }

  async put(result: ResearchResult, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const snapshot = cloneResearchResult(result);
    this.values.set(snapshot.query, snapshot);
    throwIfAborted(signal);
  }

  async delete(query: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    this.values.delete(canonicalQuery(query));
  }
}

export class IndexedDbResearchRepository implements ResearchRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(
    private readonly databaseName = "seven-remake-research",
    private readonly version = 1,
  ) {
    if (typeof databaseName !== "string" || !databaseName.trim() || databaseName !== databaseName.trim()) {
      throw new SevenError({ code: "VALIDATION", message: "Research databaseName must be canonical." });
    }
    if (!Number.isSafeInteger(version) || version <= 0 || version > 0xffff_ffff) {
      throw new SevenError({ code: "VALIDATION", message: "Research database version is invalid." });
    }
  }

  async get(query: string, signal?: AbortSignal): Promise<ResearchResult | null> {
    throwIfAborted(signal);
    const key = canonicalQuery(query);
    let raw: unknown;
    await this.run("readonly", (store) => {
      const request = store.get(key);
      request.onsuccess = () => { raw = request.result; };
    }, signal);
    if (raw === undefined) return null;
    try { return cloneResearchResult(raw as ResearchResult); }
    catch (error) {
      throw new SevenError({ code: "STORAGE", message: "Stored research result failed schema validation.", cause: error });
    }
  }

  async put(result: ResearchResult, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const snapshot = cloneResearchResult(result);
    await this.run("readwrite", (store) => { store.put(snapshot); }, signal);
  }

  async delete(query: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    await this.run("readwrite", (store) => { store.delete(canonicalQuery(query)); }, signal);
  }

  async close(): Promise<void> {
    const pending = this.dbPromise;
    this.dbPromise = null;
    if (!pending) return;
    try { (await pending).close(); } catch { /* no usable db */ }
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
        if (!request.result.objectStoreNames.contains("research")) {
          request.result.createObjectStore("research", { keyPath: "query" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        if (settled) { db.close(); return; }
        settled = true;
        try {
          if (db.transaction("research", "readonly").objectStore("research").keyPath !== "query") {
            throw new Error("incompatible keyPath");
          }
        } catch (error) {
          db.close();
          reject(new SevenError({ code: "STORAGE", message: "Research storage schema is incompatible.", cause: error }));
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
        reject(new SevenError({ code: "STORAGE", message: "Failed to open research storage.", cause: request.error }));
      };
      request.onblocked = () => {
        if (settled) return;
        settled = true;
        reject(new SevenError({ code: "STORAGE", message: "Research storage upgrade is blocked.", retryable: true }));
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
    action: (store: IDBObjectStore) => void,
    signal?: AbortSignal,
  ): Promise<void> {
    throwIfAborted(signal);
    const db = await this.open();
    throwIfAborted(signal);
    const tx = db.transaction("research", mode);
    await new Promise<void>((resolve, reject) => {
      let failure: unknown;
      const cleanup = () => signal?.removeEventListener("abort", onAbort);
      const onAbort = () => {
        failure = new DOMException("Aborted", "AbortError");
        try { tx.abort(); } catch { cleanup(); reject(failure); }
      };
      tx.oncomplete = () => { cleanup(); resolve(); };
      tx.onabort = () => { cleanup(); reject(failure ?? new SevenError({ code: "STORAGE", message: "Research transaction aborted.", cause: tx.error })); };
      tx.onerror = () => { failure = new SevenError({ code: "STORAGE", message: "Research transaction failed.", cause: tx.error }); };
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) { onAbort(); return; }
      try { action(tx.objectStore("research")); }
      catch (error) {
        failure = error;
        try { tx.abort(); } catch { cleanup(); reject(error); }
      }
    });
  }
}

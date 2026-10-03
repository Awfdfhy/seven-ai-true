import { SevenError } from "../core/errors";
import {
  normalizeContextPolicy,
  type ContextPolicy,
} from "../context/context-builder";

const POLICY_KEY = "context-policy";

type StoredContextPolicy = Readonly<{
  schemaVersion: 1;
  key: typeof POLICY_KEY;
  policy: ContextPolicy;
  updatedAt: number;
}>;

export interface ContextPolicyRepository {
  get(signal?: AbortSignal): Promise<ContextPolicy | null>;
  put(policy: Partial<ContextPolicy>, signal?: AbortSignal): Promise<ContextPolicy>;
  clear(signal?: AbortSignal): Promise<void>;
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
    throw new SevenError({ code: "VALIDATION", message: "AbortSignal is malformed." });
  }
}

function throwIfAborted(signal?: AbortSignal): void {
  validateSignal(signal);
  if (signal?.aborted) throw abortError();
}

function clonePolicy(policy: ContextPolicy): ContextPolicy {
  return Object.freeze({ ...policy });
}

function policyRecord(value: unknown): StoredContextPolicy | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Partial<StoredContextPolicy>;
  if (
    item.schemaVersion !== 1 ||
    item.key !== POLICY_KEY ||
    typeof item.updatedAt !== "number" ||
    !Number.isFinite(item.updatedAt) ||
    item.updatedAt < 0 ||
    !item.policy ||
    typeof item.policy !== "object" ||
    Array.isArray(item.policy)
  ) return null;
  try {
    const normalized = normalizeContextPolicy(item.policy);
    return Object.freeze({
      schemaVersion: 1,
      key: POLICY_KEY,
      policy: normalized,
      updatedAt: item.updatedAt as number,
    });
  } catch {
    return null;
  }
}

export class InMemoryContextPolicyRepository implements ContextPolicyRepository {
  private value: ContextPolicy | null;

  constructor(seed: Partial<ContextPolicy> | null = null) {
    this.value = seed === null ? null : normalizeContextPolicy(seed);
  }

  async get(signal?: AbortSignal): Promise<ContextPolicy | null> {
    throwIfAborted(signal);
    return this.value === null ? null : clonePolicy(this.value);
  }

  async put(policy: Partial<ContextPolicy>, signal?: AbortSignal): Promise<ContextPolicy> {
    throwIfAborted(signal);
    const normalized = normalizeContextPolicy(policy);
    this.value = normalized;
    throwIfAborted(signal);
    return clonePolicy(normalized);
  }

  async clear(signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    this.value = null;
    throwIfAborted(signal);
  }
}

type IndexedDbContextPolicyRepositoryOptions = Readonly<{
  databaseName?: string;
  version?: number;
  now?: () => number;
}>;

export class IndexedDbContextPolicyRepository implements ContextPolicyRepository {
  private readonly databaseName: string;
  private readonly version: number;
  private readonly now: () => number;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(options: IndexedDbContextPolicyRepositoryOptions = {}) {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new SevenError({ code: "VALIDATION", message: "Context policy repository options must be an object." });
    }
    this.databaseName = options.databaseName ?? "seven-remake-context-policy";
    if (typeof this.databaseName !== "string" || !this.databaseName.trim() || this.databaseName !== this.databaseName.trim()) {
      throw new SevenError({ code: "VALIDATION", message: "Context policy databaseName must be canonical." });
    }
    this.version = options.version ?? 1;
    if (!Number.isSafeInteger(this.version) || this.version <= 0 || this.version > 0xffff_ffff) {
      throw new SevenError({ code: "VALIDATION", message: "Context policy IndexedDB version must be a positive 32-bit integer." });
    }
    this.now = options.now ?? Date.now;
    if (typeof this.now !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "Context policy clock must be a function." });
    }
  }

  async get(signal?: AbortSignal): Promise<ContextPolicy | null> {
    throwIfAborted(signal);
    let raw: unknown;
    await this.run("readonly", (store) => {
      const request = store.get(POLICY_KEY);
      request.onsuccess = () => { raw = request.result; };
    }, signal);
    throwIfAborted(signal);
    if (raw === undefined) return null;
    const record = policyRecord(raw);
    if (!record) {
      throw new SevenError({ code: "STORAGE", message: "Stored context policy failed schema validation." });
    }
    return clonePolicy(record.policy);
  }

  async put(policy: Partial<ContextPolicy>, signal?: AbortSignal): Promise<ContextPolicy> {
    throwIfAborted(signal);
    const normalized = normalizeContextPolicy(policy);
    const now = this.now();
    if (!Number.isFinite(now) || now < 0) {
      throw new SevenError({ code: "VALIDATION", message: "Context policy clock returned an invalid timestamp." });
    }
    const record: StoredContextPolicy = Object.freeze({
      schemaVersion: 1,
      key: POLICY_KEY,
      policy: normalized,
      updatedAt: now,
    });
    await this.run("readwrite", (store) => { store.put(record); }, signal);
    throwIfAborted(signal);
    return clonePolicy(normalized);
  }

  async clear(signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    await this.run("readwrite", (store) => { store.delete(POLICY_KEY); }, signal);
  }

  async close(): Promise<void> {
    const pending = this.dbPromise;
    this.dbPromise = null;
    if (!pending) return;
    try { (await pending).close(); } catch { /* no usable connection */ }
  }

  private open(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;
    let settled = false;
    const promise = new Promise<IDBDatabase>((resolve, reject) => {
      if (typeof indexedDB === "undefined") {
        reject(new SevenError({ code: "STORAGE", message: "IndexedDB is unavailable." }));
        return;
      }
      let request: IDBOpenDBRequest;
      try { request = indexedDB.open(this.databaseName, this.version); }
      catch (error) {
        reject(new SevenError({ code: "STORAGE", message: "Failed to open context policy storage.", cause: error }));
        return;
      }
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        if (settled) { db.close(); return; }
        settled = true;
        try {
          if (db.transaction("settings", "readonly").objectStore("settings").keyPath !== "key") {
            throw new Error("wrong keyPath");
          }
        } catch (error) {
          db.close();
          reject(new SevenError({ code: "STORAGE", message: "Context policy storage schema is incompatible.", cause: error }));
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
        reject(new SevenError({ code: "STORAGE", message: "Failed to open context policy storage.", cause: request.error }));
      };
      request.onblocked = () => {
        if (settled) return;
        settled = true;
        reject(new SevenError({ code: "STORAGE", message: "Context policy storage upgrade is blocked.", retryable: true }));
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
    let tx: IDBTransaction;
    try { tx = db.transaction("settings", mode); }
    catch (error) {
      throw new SevenError({ code: "STORAGE", message: "Could not start context policy transaction.", cause: error });
    }
    await new Promise<void>((resolve, reject) => {
      let abortReason: unknown;
      const cleanup = () => signal?.removeEventListener("abort", onAbort);
      const onAbort = () => {
        abortReason = abortError();
        try { tx.abort(); } catch { cleanup(); reject(abortReason); }
      };
      tx.oncomplete = () => { cleanup(); resolve(); };
      tx.onabort = () => {
        cleanup();
        reject(abortReason ?? new SevenError({ code: "STORAGE", message: "Context policy transaction was aborted.", cause: tx.error }));
      };
      tx.onerror = () => {
        // Let the transaction abort; onabort supplies the durable boundary.
      };
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) { onAbort(); return; }
      try { action(tx.objectStore("settings")); }
      catch (error) {
        abortReason = error instanceof SevenError ? error : new SevenError({ code: "STORAGE", message: "Context policy operation failed.", cause: error });
        try { tx.abort(); } catch { cleanup(); reject(abortReason); }
      }
    });
  }
}

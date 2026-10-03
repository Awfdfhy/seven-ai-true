import { SevenError } from "../core/errors";
import {
  ATTACHMENT_LIMITS,
  cloneAttachmentRecord,
  isAttachmentRecord,
  type AttachmentRecord,
} from "../domain/attachments";

export interface AttachmentRepository {
  list(roomId: string, signal?: AbortSignal): Promise<readonly AttachmentRecord[]>;
  get(roomId: string, attachmentId: string, signal?: AbortSignal): Promise<AttachmentRecord | null>;
  put(roomId: string, attachment: AttachmentRecord, signal?: AbortSignal): Promise<void>;
  delete(roomId: string, attachmentId: string, signal?: AbortSignal): Promise<void>;
}

function canonical(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim()) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be canonical.` });
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

type StoredAttachment = Readonly<{
  key: string;
  roomId: string;
  attachment: AttachmentRecord;
}>;

function key(roomId: string, attachmentId: string): string {
  return `${roomId}\u0000${attachmentId}`;
}

function cloneStored(roomId: string, attachment: AttachmentRecord): StoredAttachment {
  return Object.freeze({
    key: key(roomId, attachment.id),
    roomId,
    attachment: cloneAttachmentRecord(attachment),
  });
}

function validateStored(value: unknown): StoredAttachment {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SevenError({ code: "STORAGE", message: "Stored attachment is malformed." });
  }
  const item = value as Partial<StoredAttachment>;
  if (
    typeof item.key !== "string" ||
    typeof item.roomId !== "string" ||
    !item.roomId.trim() ||
    item.roomId !== item.roomId.trim() ||
    !isAttachmentRecord(item.attachment) ||
    item.key !== key(item.roomId, item.attachment.id)
  ) {
    throw new SevenError({ code: "STORAGE", message: "Stored attachment failed schema validation." });
  }
  return cloneStored(item.roomId, item.attachment);
}

export class InMemoryAttachmentRepository implements AttachmentRepository {
  private readonly values = new Map<string, StoredAttachment>();

  async list(roomId: string, signal?: AbortSignal): Promise<readonly AttachmentRecord[]> {
    throwIfAborted(signal);
    const id = canonical(roomId, "roomId");
    return Object.freeze([...this.values.values()]
      .filter((value) => value.roomId === id)
      .map((value) => cloneAttachmentRecord(value.attachment))
      .sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id)));
  }

  async get(roomId: string, attachmentId: string, signal?: AbortSignal): Promise<AttachmentRecord | null> {
    throwIfAborted(signal);
    const stored = this.values.get(key(canonical(roomId, "roomId"), canonical(attachmentId, "attachmentId")));
    return stored ? cloneAttachmentRecord(stored.attachment) : null;
  }

  async put(roomId: string, attachment: AttachmentRecord, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const id = canonical(roomId, "roomId");
    const snapshot = cloneAttachmentRecord(attachment);
    const storageKey = key(id, snapshot.id);
    if (!this.values.has(storageKey)) {
      const count = [...this.values.values()].filter((value) => value.roomId === id).length;
      if (count >= ATTACHMENT_LIMITS.recordsPerRoom) {
        throw new SevenError({ code: "STORAGE", message: "Attachment capacity reached for this room." });
      }
    }
    this.values.set(storageKey, cloneStored(id, snapshot));
    throwIfAborted(signal);
  }

  async delete(roomId: string, attachmentId: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    this.values.delete(key(canonical(roomId, "roomId"), canonical(attachmentId, "attachmentId")));
  }
}

export class IndexedDbAttachmentRepository implements AttachmentRepository {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor(
    private readonly databaseName = "seven-remake-attachments",
    private readonly version = 1,
  ) {
    canonical(databaseName, "databaseName");
    if (!Number.isSafeInteger(version) || version <= 0 || version > 0xffff_ffff) {
      throw new SevenError({ code: "VALIDATION", message: "Attachment database version is invalid." });
    }
  }

  async list(roomId: string, signal?: AbortSignal): Promise<readonly AttachmentRecord[]> {
    throwIfAborted(signal);
    const id = canonical(roomId, "roomId");
    let raw: unknown[] = [];
    await this.run("readonly", (store) => {
      const request = store.getAll();
      request.onsuccess = () => { raw = request.result as unknown[]; };
    }, signal);
    const result: AttachmentRecord[] = [];
    for (const value of raw) {
      const stored = validateStored(value);
      if (stored.roomId === id) result.push(cloneAttachmentRecord(stored.attachment));
    }
    if (result.length > ATTACHMENT_LIMITS.recordsPerRoom) {
      throw new SevenError({ code: "STORAGE", message: "Stored attachment capacity is inconsistent." });
    }
    return Object.freeze(result.sort((a, b) => a.createdAt - b.createdAt || a.id.localeCompare(b.id)));
  }

  async get(roomId: string, attachmentId: string, signal?: AbortSignal): Promise<AttachmentRecord | null> {
    throwIfAborted(signal);
    const id = canonical(roomId, "roomId");
    const attachment = canonical(attachmentId, "attachmentId");
    let raw: unknown;
    await this.run("readonly", (store) => {
      const request = store.get(key(id, attachment));
      request.onsuccess = () => { raw = request.result; };
    }, signal);
    if (raw === undefined) return null;
    return cloneAttachmentRecord(validateStored(raw).attachment);
  }

  async put(roomId: string, attachment: AttachmentRecord, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const id = canonical(roomId, "roomId");
    const snapshot = cloneAttachmentRecord(attachment);
    await this.run("readwrite", (store, fail) => {
      const existing = store.get(key(id, snapshot.id));
      existing.onsuccess = () => {
        if (existing.result !== undefined) {
          store.put(cloneStored(id, snapshot));
          return;
        }
        const all = store.getAll();
        all.onsuccess = () => {
          const count = (all.result as unknown[])
            .map(validateStored)
            .filter((value) => value.roomId === id).length;
          if (count >= ATTACHMENT_LIMITS.recordsPerRoom) {
            fail(new SevenError({ code: "STORAGE", message: "Attachment capacity reached for this room." }));
            return;
          }
          store.put(cloneStored(id, snapshot));
        };
      };
    }, signal);
  }

  async delete(roomId: string, attachmentId: string, signal?: AbortSignal): Promise<void> {
    throwIfAborted(signal);
    const storageKey = key(canonical(roomId, "roomId"), canonical(attachmentId, "attachmentId"));
    await this.run("readwrite", (store) => { store.delete(storageKey); }, signal);
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
        if (!request.result.objectStoreNames.contains("attachments")) {
          request.result.createObjectStore("attachments", { keyPath: "key" });
        }
      };
      request.onsuccess = () => {
        const db = request.result;
        if (settled) { db.close(); return; }
        settled = true;
        try {
          if (db.transaction("attachments", "readonly").objectStore("attachments").keyPath !== "key") {
            throw new Error("incompatible keyPath");
          }
        } catch (error) {
          db.close();
          reject(new SevenError({ code: "STORAGE", message: "Attachment storage schema is incompatible.", cause: error }));
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
        reject(new SevenError({ code: "STORAGE", message: "Failed to open attachment storage.", cause: request.error }));
      };
      request.onblocked = () => {
        if (settled) return;
        settled = true;
        reject(new SevenError({ code: "STORAGE", message: "Attachment storage upgrade is blocked.", retryable: true }));
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
    const tx = db.transaction("attachments", mode);
    await new Promise<void>((resolve, reject) => {
      let failure: unknown;
      const cleanup = () => signal?.removeEventListener("abort", onAbort);
      const fail = (error: unknown) => {
        failure = error;
        try { tx.abort(); } catch { cleanup(); reject(error); }
      };
      const onAbort = () => fail(new DOMException("Aborted", "AbortError"));
      tx.oncomplete = () => { cleanup(); resolve(); };
      tx.onabort = () => { cleanup(); reject(failure ?? new SevenError({ code: "STORAGE", message: "Attachment transaction aborted.", cause: tx.error })); };
      tx.onerror = () => { if (failure === undefined) failure = new SevenError({ code: "STORAGE", message: "Attachment transaction failed.", cause: tx.error }); };
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) { onAbort(); return; }
      try { action(tx.objectStore("attachments"), fail); }
      catch (error) { fail(error); }
    });
  }
}

import { SevenError } from "../core/errors";
import { TaskManager } from "../core/task-manager";
import {
  applyRpgChangeSet,
  canonicalRpgChecksumPayload,
  cloneRpgSnapshot,
  createInitialRpgSnapshot,
  type RpgCanonSnapshot,
  type RpgChangeSet,
} from "./domain";
import type { RpgRepository } from "./repository";

export type RpgRun = Readonly<{
  taskId: string;
  result: Promise<RpgCanonSnapshot>;
  cancel(reason?: string): boolean;
}>;

async function sha256(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function checksumWithoutChecksum(snapshot: Omit<RpgCanonSnapshot, "checksum">): Promise<string> {
  return sha256(canonicalRpgChecksumPayload(snapshot));
}

async function verifyChecksum(snapshot: RpgCanonSnapshot): Promise<RpgCanonSnapshot> {
  const clone = cloneRpgSnapshot(snapshot);
  const { checksum, ...withoutChecksum } = clone;
  const expected = await checksumWithoutChecksum(withoutChecksum);
  if (checksum !== expected) {
    throw new SevenError({ code: "STORAGE", message: "RPG snapshot checksum verification failed." });
  }
  return clone;
}

export class RpgCanonService {
  constructor(
    private readonly tasks: TaskManager,
    private readonly repository: RpgRepository,
    private readonly now: () => number = Date.now,
  ) {
    if (!tasks || typeof tasks !== "object" || typeof tasks.run !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "RpgCanonService requires TaskManager." });
    }
    if (!repository || typeof repository !== "object" || typeof repository.get !== "function" || typeof repository.compareAndSwap !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "RpgCanonService requires RpgRepository." });
    }
    if (typeof now !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "RPG clock must be a function." });
    }
  }

  create(input: Readonly<{
    id: string;
    packId: string;
    packVersion: string;
    worldSessionId: string;
    canonSessionId: string;
    rootBranchId: string;
    rootBranchLabel?: string;
  }>): RpgRun {
    const run = this.tasks.run(
      { kind: "rpg", ownerId: `rpg:${input.id}`, timeoutMs: 30_000 },
      async ({ signal }) => {
        const now = this.now();
        const placeholder = createInitialRpgSnapshot({
          ...input,
          checksum: "0".repeat(64),
          now,
        });
        const { checksum: _ignored, ...withoutChecksum } = placeholder;
        const checksum = await checksumWithoutChecksum(withoutChecksum);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        const snapshot = cloneRpgSnapshot({ ...placeholder, checksum });
        const created = await this.repository.compareAndSwap(snapshot.id, null, snapshot, signal);
        if (!created) {
          throw new SevenError({ code: "STORAGE", message: "RPG snapshot already exists.", retryable: false });
        }
        return snapshot;
      },
    );
    return Object.freeze({ taskId: run.taskId, result: run.result, cancel: run.cancel });
  }

  async load(id: string, signal?: AbortSignal): Promise<RpgCanonSnapshot | null> {
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    const snapshot = await this.repository.get(id, signal);
    if (!snapshot) return null;
    if (signal?.aborted) throw new DOMException("Aborted", "AbortError");
    return verifyChecksum(snapshot);
  }

  apply(id: string, changeSet: RpgChangeSet): RpgRun {
    const run = this.tasks.run(
      { kind: "rpg", ownerId: `rpg:${id}`, timeoutMs: 30_000 },
      async ({ signal }) => {
        const currentRaw = await this.repository.get(id, signal);
        if (!currentRaw) {
          throw new SevenError({ code: "VALIDATION", message: "RPG snapshot does not exist." });
        }
        const current = await verifyChecksum(currentRaw);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const now = this.now();
        const provisional = applyRpgChangeSet(current, changeSet, "0".repeat(64), now);
        const { checksum: _ignored, ...withoutChecksum } = provisional;
        const checksum = await checksumWithoutChecksum(withoutChecksum);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        const next = cloneRpgSnapshot({ ...provisional, checksum });

        const swapped = await this.repository.compareAndSwap(id, current.revision, next, signal);
        if (!swapped) {
          throw new SevenError({
            code: "STORAGE",
            message: "RPG snapshot changed concurrently; reload before retrying.",
            retryable: true,
          });
        }
        return next;
      },
    );
    return Object.freeze({ taskId: run.taskId, result: run.result, cancel: run.cancel });
  }
}

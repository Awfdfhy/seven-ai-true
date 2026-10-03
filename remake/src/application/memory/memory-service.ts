import { SevenError } from "../../core/errors";
import {
  createMemoryRecord,
  type CreateMemoryOptions,
  type MemoryRecord,
} from "../../domain/memory";
import type { MemoryRepository } from "../../storage/memory-repository";

export type RememberInput = Omit<CreateMemoryOptions, "now">;

export class MemoryService {
  constructor(
    private readonly repository: MemoryRepository,
    private readonly now: () => number = Date.now,
  ) {
    if (
      !repository ||
      typeof repository !== "object" ||
      typeof repository.listForRoom !== "function" ||
      typeof repository.put !== "function" ||
      typeof repository.delete !== "function"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "MemoryService requires a MemoryRepository.",
      });
    }
    if (typeof now !== "function") {
      throw new SevenError({
        code: "VALIDATION",
        message: "MemoryService clock must be a function.",
      });
    }
  }

  async remember(
    input: RememberInput,
    signal?: AbortSignal,
  ): Promise<MemoryRecord> {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Remember input must be an object.",
      });
    }
    const now = this.now();
    if (!Number.isFinite(now) || now < 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "MemoryService clock returned an invalid timestamp.",
      });
    }
    const record = createMemoryRecord({
      ...input,
      now,
    });
    await this.repository.put(record, signal);
    return record;
  }

  async list(
    roomId: string,
    signal?: AbortSignal,
  ): Promise<readonly MemoryRecord[]> {
    return this.repository.listForRoom(roomId, signal);
  }

  async forget(memoryId: string, signal?: AbortSignal): Promise<void> {
    await this.repository.delete(memoryId, signal);
  }
}

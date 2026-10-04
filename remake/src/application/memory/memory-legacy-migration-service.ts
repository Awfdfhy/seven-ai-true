import { createMemoryWriteEvent, type MemoryFact } from "../../domain/memory/fabric";
import type { MemoryRepository } from "../../storage/memory-repository";
import type { MemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { migrateLegacyMemoryRecords } from "./memory-migration";

export type LegacyMigrationResult = Readonly<{
  scanned: number;
  migrated: number;
  skippedExisting: number;
}>;

export class MemoryLegacyMigrationService {
  constructor(
    private readonly legacy: MemoryRepository,
    private readonly fabric: MemoryFabricRepository,
  ) {}

  async migrate(signal?: AbortSignal): Promise<LegacyMigrationResult> {
    const records = await this.legacy.listAll(signal);
    if (records.length === 0) {
      return Object.freeze({ scanned: 0, migrated: 0, skippedExisting: 0 });
    }

    const existing = await this.fabric.listAll(signal);
    const existingIds = new Set(existing.map(fact => fact.id));
    const candidates = migrateLegacyMemoryRecords(records);
    const pending: MemoryFact[] = [];
    let skippedExisting = 0;

    for (const fact of candidates) {
      if (existingIds.has(fact.id)) {
        skippedExisting += 1;
        continue;
      }
      pending.push(fact);
    }

    if (pending.length > 0) {
      await this.fabric.commit(
        pending,
        pending.map(fact => createMemoryWriteEvent(fact, "add", fact.createdAt)),
        signal,
      );
    }

    return Object.freeze({
      scanned: records.length,
      migrated: pending.length,
      skippedExisting,
    });
  }
}

import { describe, expect, it } from "vitest";
import { createMemoryRecord } from "../../domain/memory";
import { InMemoryMemoryRepository } from "../../storage/memory-repository";
import { InMemoryMemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { MemoryLegacyMigrationService } from "./memory-legacy-migration-service";

describe("MemoryLegacyMigrationService",()=>{
  it("migrates global and room memories exactly once",async()=>{
    const legacy=new InMemoryMemoryRepository([
      createMemoryRecord({id:"g",scope:"global",content:"Global memory",priority:90,now:10}),
      createMemoryRecord({id:"r",scope:"room",roomId:"room-1",content:"Room memory",priority:50,now:20}),
    ]);
    const fabric=new InMemoryMemoryFabricRepository();
    const migration=new MemoryLegacyMigrationService(legacy,fabric);

    expect(await migration.migrate()).toEqual({scanned:2,migrated:2,skippedExisting:0});
    expect(await migration.migrate()).toEqual({scanned:2,migrated:0,skippedExisting:2});

    const all=await fabric.listAll();
    expect(all).toHaveLength(2);
    expect(all.find(f=>f.content==="Global memory")?.scope).toBe("global");
    expect(all.find(f=>f.content==="Room memory")?.roomId).toBe("room-1");
  });

  it("leaves an empty legacy store as a no-op",async()=>{
    const legacy=new InMemoryMemoryRepository();
    const fabric=new InMemoryMemoryFabricRepository();
    expect(await new MemoryLegacyMigrationService(legacy,fabric).migrate())
      .toEqual({scanned:0,migrated:0,skippedExisting:0});
  });
});

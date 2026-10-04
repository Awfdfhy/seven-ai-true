import { describe, expect, it } from "vitest";
import { createMemoryRecord } from "../../domain/memory";
import { migrateLegacyMemoryRecord } from "./memory-migration";

describe("Memory v1 to v2 migration",()=>{
  it("preserves content scope timestamps and maps priority conservatively",()=>{
    const legacy=createMemoryRecord({
      id:"old-name",scope:"global",content:"My name is Ali",priority:95,now:100,
    });
    const next=migrateLegacyMemoryRecord(legacy);
    expect(next).toMatchObject({
      schemaVersion:2,kind:"fact",tier:"core",scope:"global",roomId:null,
      content:"My name is Ali",importance:.95,confidence:.7,validFrom:100,
    });
    expect(next.tags).toContain("legacy-v1");
    expect(next.source.roomId).toBe("legacy-global");
  });

  it("preserves room isolation for legacy records",()=>{
    const legacy=createMemoryRecord({
      id:"room-note",scope:"room",roomId:"room-7",content:"Room-only note",priority:50,now:5,
    });
    const next=migrateLegacyMemoryRecord(legacy);
    expect(next.scope).toBe("room");
    expect(next.roomId).toBe("room-7");
    expect(next.tier).toBe("recall");
  });
});

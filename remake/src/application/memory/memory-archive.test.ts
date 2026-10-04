import { describe, expect, it } from "vitest";
import { createMemoryFact, createMemoryWriteEvent } from "../../domain/memory/fabric";
import { InMemoryMemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { exportMemoryArchive, importMemoryArchive, parseMemoryArchive } from "./memory-archive";

describe("Memory archive",()=>{
  it("round-trips facts and content-free event provenance",async()=>{
    const source=new InMemoryMemoryFabricRepository();
    const fact=createMemoryFact({
      id:"archive-fact",kind:"preference",tier:"recall",scope:"global",
      canonicalKey:"preference:theme",content:"I prefer dark mode",tags:["theme"],
      importance:.9,confidence:.99,observedAt:10,sourceRoomId:"r1",sourceMessageId:"m1",
    });
    const event=createMemoryWriteEvent(fact,"add",10);
    await source.commit([fact],[event]);
    const archive=await exportMemoryArchive(source,20);
    const target=new InMemoryMemoryFabricRepository();
    expect(await importMemoryArchive(target,archive)).toEqual({facts:1,events:1});
    expect((await target.listAll())[0]).toEqual(fact);
    expect((await target.listEvents())[0]).toEqual(event);
  });

  it("restores a snapshot by replacement instead of unsafe merge",async()=>{
    const source=new InMemoryMemoryFabricRepository();
    const restored=createMemoryFact({
      id:"restored",kind:"fact",tier:"recall",scope:"global",canonicalKey:"restored:key",
      content:"Restored memory",tags:["restored"],importance:.7,confidence:.9,observedAt:5,
      sourceRoomId:"r",sourceMessageId:"m",
    });
    await source.commit([restored],[createMemoryWriteEvent(restored,"add",5)]);
    const archive=await exportMemoryArchive(source,6);
    const target=new InMemoryMemoryFabricRepository();
    const stale=createMemoryFact({
      id:"stale",kind:"fact",tier:"recall",scope:"global",canonicalKey:"stale:key",
      content:"Stale memory",tags:["stale"],importance:.7,confidence:.9,observedAt:1,
      sourceRoomId:"old",sourceMessageId:"old",
    });
    await target.commit([stale],[createMemoryWriteEvent(stale,"add",1)]);
    await importMemoryArchive(target,archive);
    expect((await target.listAll()).map(f=>f.id)).toEqual(["restored"]);
  });

  it("rejects malformed archives before writing",async()=>{
    const target=new InMemoryMemoryFabricRepository();
    expect(()=>parseMemoryArchive({schemaVersion:1,exportedAt:1,facts:[{bad:true}],events:[]})).toThrow();
    expect(await target.listAll()).toHaveLength(0);
  });
});

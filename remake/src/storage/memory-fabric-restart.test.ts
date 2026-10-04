import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { createMemoryFact, createMemoryWriteEvent } from "../domain/memory/fabric";
import { IndexedDbMemoryFabricRepository } from "./memory-fabric-repository";
import { MemoryFabricService } from "../application/memory/memory-fabric-service";

describe("Memory Fabric restart durability",()=>{
  it("preserves facts and provenance across a fresh repository instance",async()=>{
    const db=`memory-restart-${crypto.randomUUID()}`;
    const first=new IndexedDbMemoryFabricRepository(db);
    const fact=createMemoryFact({
      id:"restart-fact",kind:"profile",tier:"core",scope:"global",
      canonicalKey:"profile:name",content:"My name is Ali",tags:["profile","name"],
      importance:1,confidence:.99,observedAt:100,sourceRoomId:"room-a",sourceMessageId:"message-a",
    });
    await first.commit([fact],[createMemoryWriteEvent(fact,"add",100)]);

    const reopened=new IndexedDbMemoryFabricRepository(db);
    const all=await reopened.listAll();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({
      id:"restart-fact",content:"My name is Ali",
      source:{roomId:"room-a",messageId:"message-a",observedAt:100},
    });
  });

  it("hard forget remains deleted after reopen and leaves content-free audit history",async()=>{
    const db=`memory-forget-${crypto.randomUUID()}`;
    const repository=new IndexedDbMemoryFabricRepository(db);
    const service=new MemoryFabricService(repository);
    const [fact]=await service.observeUserMessage({
      roomId:"room-a",messageId:"message-a",content:"My name is Ali",createdAt:100,
    });
    expect(fact).toBeDefined();
    expect(await service.forget(fact!.id,"room-a")).toBe(true);

    const reopened=new IndexedDbMemoryFabricRepository(db);
    expect(await reopened.listAll()).toHaveLength(0);
    const events=await reopened.listEvents();
    expect(events.some(event=>event.type==="forget" && event.factId===fact!.id)).toBe(true);
    expect(JSON.stringify(events)).not.toContain("My name is Ali");
  });
});

import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { createMemoryFact, createMemoryWriteEvent, supersedeMemoryFact } from "../domain/memory/fabric";
import { IndexedDbMemoryFabricRepository } from "./memory-fabric-repository";

describe("IndexedDbMemoryFabricRepository",()=>{
  it("commits temporal supersession atomically and scopes room memory",async()=>{
    const db=`memory-fabric-test-${crypto.randomUUID()}`;
    const repo=new IndexedDbMemoryFabricRepository(db);
    const first=createMemoryFact({kind:"preference",tier:"recall",scope:"global",canonicalKey:"preference:theme",content:"I prefer light mode",tags:["preference","theme"],importance:.8,confidence:.95,observedAt:100,sourceRoomId:"r1",sourceMessageId:"m1"});
    await repo.commit([first],[createMemoryWriteEvent(first,"add",100)]);
    const old=supersedeMemoryFact(first,200);
    const next=createMemoryFact({kind:"preference",tier:"recall",scope:"global",canonicalKey:"preference:theme",content:"I prefer dark mode",tags:["preference","theme"],importance:.8,confidence:.95,observedAt:200,sourceRoomId:"r2",sourceMessageId:"m2",supersedes:[first.id]});
    await repo.commit([old,next],[createMemoryWriteEvent(old,"supersede",200),createMemoryWriteEvent(next,"add",200)]);
    const active=await repo.findActiveByCanonicalKey("global",null,"preference:theme");
    expect(active.map(x=>x.content)).toEqual(["I prefer dark mode"]);
    const list=await repo.listForRoom("r9");
    expect(list.some(x=>x.id===old.id && x.status==="superseded")).toBe(true);
    expect(list.some(x=>x.id===next.id && x.status==="active")).toBe(true);
  });
});

import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { createMemoryFact, createMemoryWriteEvent } from "../domain/memory/fabric";
import { IndexedDbMemoryFabricRepository, InMemoryMemoryFabricRepository } from "./memory-fabric-repository";

function fact(id:string){
  return createMemoryFact({
    id,kind:"fact",tier:"recall",scope:"global",canonicalKey:`k:${id}`,
    content:`memory ${id}`,tags:["test"],importance:.5,confidence:.9,observedAt:1,
    sourceRoomId:"r",sourceMessageId:`m-${id}`,
  });
}

describe("Memory Fabric storage hardening",()=>{
  it("enforces bounded facts/events atomically in memory",async()=>{
    const repo=new InMemoryMemoryFabricRepository({maxFacts:1,maxEvents:2});
    const one=fact("one");
    await repo.commit([one],[createMemoryWriteEvent(one,"add",1)]);
    const two=fact("two");
    await expect(repo.commit([two],[createMemoryWriteEvent(two,"add",2)])).rejects.toThrow(/capacity/i);
    expect((await repo.listAll()).map(x=>x.id)).toEqual(["one"]);
  });

  it("upgrades a v1 database to v2 without losing facts/events",async()=>{
    const dbName=`memory-upgrade-${crypto.randomUUID()}`;
    const seed=fact("seed");
    const event=createMemoryWriteEvent(seed,"add",1);
    await new Promise<void>((resolve,reject)=>{
      const request=indexedDB.open(dbName,1);
      request.onupgradeneeded=()=>{
        const db=request.result;
        const fs=db.createObjectStore("facts",{keyPath:"id"});
        fs.createIndex("scopeRoom","scopeRoom",{unique:false});
        fs.createIndex("canonicalKey","canonicalKey",{unique:false});
        const es=db.createObjectStore("events",{keyPath:"id"});
        es.createIndex("factId","factId",{unique:false});
        es.createIndex("sourceRoomId","sourceRoomId",{unique:false});
        fs.put({...seed,scopeRoom:"global"});
        es.put(event);
      };
      request.onsuccess=()=>{request.result.close();resolve();};
      request.onerror=()=>reject(request.error);
    });
    const repo=new IndexedDbMemoryFabricRepository(dbName);
    expect((await repo.listAll()).map(x=>x.id)).toEqual(["seed"]);
    expect((await repo.listEvents()).map(x=>x.id)).toEqual([event.id]);
    await repo.close();
  });

  it("quarantines a corrupt fact without leaking its content into quarantine metadata",async()=>{
    const dbName=`memory-corrupt-${crypto.randomUUID()}`;
    const repo=new IndexedDbMemoryFabricRepository(dbName);
    const good=fact("good");
    await repo.commit([good],[createMemoryWriteEvent(good,"add",1)]);
    await repo.close();

    const db=await new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open(dbName,2);
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
    });
    await new Promise<void>((resolve,reject)=>{
      const tx=db.transaction("facts","readwrite");
      tx.objectStore("facts").put({
        id:"corrupt",schemaVersion:999,scopeRoom:"global",
        content:"SENSITIVE CORRUPT CONTENT SHOULD NOT SURVIVE",
      });
      tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);
    });
    db.close();

    const reopened=new IndexedDbMemoryFabricRepository(dbName);
    expect((await reopened.listAll()).map(x=>x.id)).toEqual(["good"]);
    await reopened.close();

    const inspect=await new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open(dbName,2);
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    });
    const rows=await new Promise<unknown[]>((resolve,reject)=>{
      const tx=inspect.transaction("quarantine","readonly");
      const request=tx.objectStore("quarantine").getAll();
      request.onsuccess=()=>resolve(request.result as unknown[]);request.onerror=()=>reject(request.error);
    });
    expect(JSON.stringify(rows)).toContain("corrupt");
    expect(JSON.stringify(rows)).not.toContain("SENSITIVE CORRUPT CONTENT");
    inspect.close();
  });
});

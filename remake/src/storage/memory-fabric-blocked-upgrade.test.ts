import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { IndexedDbMemoryFabricRepository } from "./memory-fabric-repository";

describe("Memory Fabric blocked upgrades",()=>{
  it("reports a retryable storage error while an old database connection blocks upgrade",async()=>{
    const dbName=`memory-blocked-${crypto.randomUUID()}`;
    const old=await new Promise<IDBDatabase>((resolve,reject)=>{
      const request=indexedDB.open(dbName,1);
      request.onupgradeneeded=()=>{
        const db=request.result;
        const fs=db.createObjectStore("facts",{keyPath:"id"});
        fs.createIndex("scopeRoom","scopeRoom",{unique:false});
        fs.createIndex("canonicalKey","canonicalKey",{unique:false});
        const es=db.createObjectStore("events",{keyPath:"id"});
        es.createIndex("factId","factId",{unique:false});
        es.createIndex("sourceRoomId","sourceRoomId",{unique:false});
      };
      request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    });
    old.onversionchange=()=>{};
    const repo=new IndexedDbMemoryFabricRepository(dbName);
    await expect(repo.listAll()).rejects.toMatchObject({code:"STORAGE",retryable:true});
    old.close();
  });
});

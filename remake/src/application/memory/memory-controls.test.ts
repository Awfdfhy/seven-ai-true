import { describe, expect, it } from "vitest";
import { InMemoryMemoryFabricRepository } from "../../storage/memory-fabric-repository";
import { MemoryFabricService } from "./memory-fabric-service";

describe("Memory backup and reset controls",()=>{
  it("exports restores and fully resets durable memory",async()=>{
    const repo=new InMemoryMemoryFabricRepository();
    const memory=new MemoryFabricService(repo);
    await memory.observeUserMessage({roomId:"r1",messageId:"m1",content:"My name is Ali",createdAt:10});
    const archive=await memory.exportArchive();
    expect(archive.facts).toHaveLength(1);
    await memory.clearAll();
    expect(await repo.listAll()).toHaveLength(0);
    expect(await repo.listEvents()).toHaveLength(0);
    await memory.restoreArchive(archive);
    expect((await repo.listAll()).map(f=>f.content)).toEqual(["My name is Ali"]);
  });
});

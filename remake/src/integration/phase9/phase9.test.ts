import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { TaskManager } from "../../core/task-manager";
import { RpgCanonService } from "../../rpg/rpg-canon-service";
import { IndexedDbRpgRepository, InMemoryRpgRepository } from "../../rpg/repository";

function create(service: RpgCanonService) {
  return service.create({
    id: "valen",
    packId: "valen-pack",
    packVersion: "33",
    worldSessionId: "world-1",
    canonSessionId: "canon-1",
    rootBranchId: "main",
  }).result;
}

describe("Phase 9 RPG / Canon", () => {
  it("creates an immutable authoritative snapshot with independent world/canon identities and checksum", async () => {
    const service = new RpgCanonService(new TaskManager(), new InMemoryRpgRepository(), () => 10);
    const snapshot = await create(service);
    expect(snapshot.worldSessionId).toBe("world-1");
    expect(snapshot.canonSessionId).toBe("canon-1");
    expect(snapshot.revision).toBe(0);
    expect(snapshot.checksum).toMatch(/^[a-f0-9]{64}$/);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.branches)).toBe(true);
  });

  it("commits state, relationship, title and branch changes as one revision", async () => {
    const service = new RpgCanonService(new TaskManager(), new InMemoryRpgRepository(), () => 20);
    const initial = await create(service);
    const next = await service.apply("valen", {
      expectedRevision: initial.revision,
      state: { location: "Royal Academy", day: "48" },
      upsertRelationships: [
        { fromId: "Ali", toId: "Aria", label: "bond", value: "trusted partner" },
      ],
      addTitles: [
        { id: "ep34", namespace: "episode", value: "Tournament Begins" },
      ],
      createBranch: { id: "tournament", label: "Tournament Arc", activate: true },
    }).result;

    expect(next.revision).toBe(1);
    expect(next.activeBranchId).toBe("tournament");
    expect(next.state.location).toBe("Royal Academy");
    expect(next.relationships).toHaveLength(1);
    expect(next.titles[0]?.id).toBe("ep34");
    expect(next.checksum).not.toBe(initial.checksum);
  });

  it("rejects stale change sets rather than silently overwriting canon", async () => {
    const repository = new InMemoryRpgRepository();
    const service = new RpgCanonService(new TaskManager(), repository, () => 30);
    await create(service);
    await service.apply("valen", {
      expectedRevision: 0,
      state: { day: "49" },
    }).result;
    await expect(service.apply("valen", {
      expectedRevision: 0,
      state: { day: "50" },
    }).result).rejects.toMatchObject({ code: "STORAGE" });
    expect((await service.load("valen"))?.state.day).toBe("49");
  });

  it("detects concurrent repository writes with CAS", async () => {
    const repository = new InMemoryRpgRepository();
    const setup = new RpgCanonService(new TaskManager(), repository, () => 40);
    const initial = await create(setup);
    const one = new RpgCanonService(new TaskManager(), repository, () => 41);
    const two = new RpgCanonService(new TaskManager(), repository, () => 42);
    const results = await Promise.allSettled([
      one.apply("valen", { expectedRevision: initial.revision, state: { winner: "one" } }).result,
      two.apply("valen", { expectedRevision: initial.revision, state: { winner: "two" } }).result,
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    const durable = await setup.load("valen");
    expect(durable?.revision).toBe(1);
    expect(["one", "two"]).toContain(durable?.state.winner);
  });

  it("persists and verifies the canonical snapshot across IndexedDB restart", async () => {
    const name = `rpg-${crypto.randomUUID()}`;
    const firstRepo = new IndexedDbRpgRepository(name);
    const first = new RpgCanonService(new TaskManager(), firstRepo, () => 50);
    await create(first);
    const expected = await first.apply("valen", {
      expectedRevision: 0,
      state: { arc: "ROYAL ONE" },
    }).result;
    await firstRepo.close();

    const secondRepo = new IndexedDbRpgRepository(name);
    const second = new RpgCanonService(new TaskManager(), secondRepo, () => 60);
    expect(await second.load("valen")).toEqual(expected);
    await secondRepo.close();
  });

  it("checksum verification detects durable corruption before state is trusted", async () => {
    const repository = new InMemoryRpgRepository();
    const service = new RpgCanonService(new TaskManager(), repository, () => 70);
    const snapshot = await create(service);
    await repository.compareAndSwap("valen", 0, {
      ...snapshot,
      state: { forged: "true" },
    });
    await expect(service.load("valen")).rejects.toMatchObject({ code: "STORAGE" });
  });
});

import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import {
  InMemoryContextPolicyRepository,
  IndexedDbContextPolicyRepository,
} from "./context-policy-repository";

const open: IndexedDbContextPolicyRepository[] = [];
afterEach(async () => {
  await Promise.all(open.splice(0).map((repository) => repository.close()));
});

describe("ContextPolicyRepository", () => {
  it("normalizes complete defaults in memory and supports clear", async () => {
    const repository = new InMemoryContextPolicyRepository();
    expect(await repository.get()).toBeNull();
    const saved = await repository.put({ memoryTokenBudget: 321 });
    expect(saved).toEqual({
      reservedOutputTokens: 1024,
      memoryTokenBudget: 321,
      summaryTokenBudget: 1024,
      maxMemoryItems: 24,
    });
    expect(await repository.get()).toEqual(saved);
    await repository.clear();
    expect(await repository.get()).toBeNull();
  });

  it("persists policy across IndexedDB repository restart", async () => {
    const databaseName = `context-policy-${crypto.randomUUID()}`;
    const first = new IndexedDbContextPolicyRepository({ databaseName, now: () => 10 });
    open.push(first);
    const expected = await first.put({
      reservedOutputTokens: 256,
      memoryTokenBudget: 111,
      summaryTokenBudget: 222,
      maxMemoryItems: 7,
    });
    await first.close();

    const second = new IndexedDbContextPolicyRepository({ databaseName });
    open.push(second);
    expect(await second.get()).toEqual(expected);
  });

  it("rejects malformed values before persistence and honors cancellation", async () => {
    const repository = new InMemoryContextPolicyRepository();
    await expect(repository.put({ reservedOutputTokens: 0 })).rejects.toMatchObject({ code: "VALIDATION" });
    await expect(repository.put({ memoryTokenBudget: -1 })).rejects.toMatchObject({ code: "VALIDATION" });
    await expect(repository.get({} as AbortSignal)).rejects.toMatchObject({ code: "VALIDATION" });
    await expect(repository.put({}, AbortSignal.abort())).rejects.toMatchObject({ name: "AbortError" });
  });

  it("does not open IndexedDB for already-cancelled reads", async () => {
    const repository = new IndexedDbContextPolicyRepository({ databaseName: crypto.randomUUID() });
    open.push(repository);
    await expect(repository.get(AbortSignal.abort())).rejects.toMatchObject({ name: "AbortError" });
  });
});

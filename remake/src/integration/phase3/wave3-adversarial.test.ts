import "fake-indexeddb/auto";
import { expect, it } from "vitest";
import { commitMessage, createRoom } from "../../domain/chat";
import { createMemoryRecord } from "../../domain/memory";
import { MemoryContextService } from "../../application/context/memory-context-service";
import { IndexedDbMemoryRepository } from "../../storage/memory-repository";
import { IndexedDbContextPolicyRepository } from "../../storage/context-policy-repository";

function longRoom() {
  let room = createRoom({ id: "wave3-race", now: 1 });
  room = commitMessage(room, {
    id: "old-user",
    role: "user",
    content: "Earlier context ".repeat(120),
    now: 2,
  });
  room = commitMessage(room, {
    id: "old-answer",
    role: "assistant",
    content: "Earlier answer ".repeat(120),
    now: 3,
  });
  return commitMessage(room, {
    id: "latest",
    role: "user",
    content: "Keep the latest request exactly.",
    now: 4,
  });
}

it("prevents cross-instance lost updates when two tabs summarize the same room", async () => {
  const databaseName = `wave3-cas-${crypto.randomUUID()}`;
  const firstRepository = new IndexedDbMemoryRepository({ databaseName });
  const secondRepository = new IndexedDbMemoryRepository({ databaseName });
  let started = 0;
  let release!: () => void;
  const bothStarted = new Promise<void>((resolve) => { release = resolve; });
  const makeService = (repository: IndexedDbMemoryRepository, label: string) =>
    new MemoryContextService(repository, {
      async summarize() {
        started += 1;
        if (started === 2) release();
        await bothStarted;
        return `${label} summary`;
      },
    });

  const request = {
    room: longRoom(),
    systemPrompt: "You are Seven.",
    contextWindow: 650,
    signal: new AbortController().signal,
    policy: {
      reservedOutputTokens: 100,
      memoryTokenBudget: 0,
      summaryTokenBudget: 200,
      maxMemoryItems: 0,
    },
  };

  try {
    const results = await Promise.allSettled([
      makeService(firstRepository, "first").prepare(request),
      makeService(secondRepository, "second").prepare({
        ...request,
        signal: new AbortController().signal,
      }),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    const rejected = results.find((result) => result.status === "rejected");
    expect(rejected).toMatchObject({
      status: "rejected",
      reason: { code: "STORAGE", retryable: true },
    });

    const durable = await firstRepository.getSummary("wave3-race");
    expect(durable?.sourceFingerprint).toMatch(/^v1:/);
    expect(["first summary", "second summary"]).toContain(durable?.content);
  } finally {
    await firstRepository.close();
    await secondRepository.close();
  }
});

it("restores persisted context settings and applies them to real context shaping", async () => {
  const suffix = crypto.randomUUID();
  const policyName = `wave3-policy-${suffix}`;
  const memoryName = `wave3-memory-${suffix}`;
  const firstPolicy = new IndexedDbContextPolicyRepository({ databaseName: policyName });
  await firstPolicy.put({
    reservedOutputTokens: 100,
    memoryTokenBudget: 1000,
    summaryTokenBudget: 200,
    maxMemoryItems: 0,
  });
  await firstPolicy.close();

  const policy = new IndexedDbContextPolicyRepository({ databaseName: policyName });
  const memory = new IndexedDbMemoryRepository({ databaseName: memoryName });
  await memory.put(createMemoryRecord({
    id: "marker",
    scope: "global",
    content: "PERSISTED_POLICY_MEMORY_MARKER",
    priority: 100,
    now: 1,
  }));
  const service = new MemoryContextService(
    memory,
    { async summarize() { return "unused"; } },
    undefined,
    { policyRepository: policy },
  );
  const room = commitMessage(
    createRoom({ id: "policy-room", now: 1 }),
    { id: "latest", role: "user", content: "hello", now: 2 },
  );

  try {
    const persisted = await service.prepare({
      room,
      systemPrompt: "You are Seven.",
      contextWindow: 1200,
      signal: new AbortController().signal,
    });
    expect(persisted.selectedMemoryIds).toEqual([]);

    const overridden = await service.prepare({
      room,
      systemPrompt: "You are Seven.",
      contextWindow: 1200,
      signal: new AbortController().signal,
      policy: { maxMemoryItems: 1 },
    });
    expect(overridden.selectedMemoryIds).toEqual(["marker"]);
  } finally {
    await memory.close();
    await policy.close();
  }
});

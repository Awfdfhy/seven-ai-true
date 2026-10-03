import { describe, expect, it, vi } from "vitest";
import { commitMessage, createRoom, type Room } from "../../domain/chat";
import { createContextSummary, createMemoryRecord } from "../../domain/memory";
import { InMemoryMemoryRepository } from "../../storage/memory-repository";
import { InMemoryContextPolicyRepository } from "../../storage/context-policy-repository";
import { MemoryContextService, type ContextPrepareInput } from "./memory-context-service";

function history(): Room {
  let room = createRoom({ id: "room", now: 1 });
  room = commitMessage(room, { id: "old-user", role: "user", content: "a".repeat(1200), now: 2 });
  room = commitMessage(room, { id: "old-answer", role: "assistant", content: "b".repeat(1200), now: 3 });
  return commitMessage(room, { id: "latest", role: "user", content: "Keep this exact user turn", now: 4 });
}
function input(room = history(), signal = new AbortController().signal): ContextPrepareInput {
  return { room, signal, systemPrompt: "You are Seven.", contextWindow: 600,
    policy: { reservedOutputTokens: 100, summaryTokenBudget: 350, memoryTokenBudget: 0 } };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const prior = () => createContextSummary({ roomId: "room", content: "Earlier topic.", throughMessageId: "old-user", now: 2 });

describe("MemoryContextService", () => {
  it("persists a prefix summary and reuses it after restart without mutating history", async () => {
    const repository = new InMemoryMemoryRepository();
    const summarize = vi.fn(async (_request: unknown) => "The earlier topic was discussed.");
    const room = history();
    const original = JSON.stringify(room);
    const result = await new MemoryContextService(repository, { summarize }).prepare(input(room));
    expect(result.summaryUsed).toBe(true);
    expect(result.omittedMessages).toEqual([]);
    expect(result.messages.filter(m => m.role === "system")).toHaveLength(1);
    expect(result.messages.at(-1)?.content).toBe("Keep this exact user turn");
    expect(JSON.stringify(room)).toBe(original);
    expect(summarize.mock.calls[0]?.[0]).toMatchObject({ previousSummary: null });
    expect((await repository.getSummary(room.id))?.throughMessageId).toBe("old-answer");
    await new MemoryContextService(repository, { summarize }).prepare(input(room));
    expect(summarize).toHaveBeenCalledTimes(1);
  });
  it("adds only the uncovered prefix to an existing summary", async () => {
    const repository = new InMemoryMemoryRepository([], [prior()]);
    const summarize = vi.fn(async (_request: unknown) => "Earlier topic and its answer.");
    await new MemoryContextService(repository, { summarize }).prepare(input());
    expect(summarize.mock.calls[0]?.[0]).toMatchObject({ previousSummary: "Earlier topic.", messages: [{ id: "old-answer" }] });
  });
  it("does not double-count an excluded old summary with its raw prefix", async () => {
    const repository = new InMemoryMemoryRepository([], [createContextSummary({ roomId: "room", content: "x".repeat(1800), throughMessageId: "old-user", now: 2 })]);
    const summarize = vi.fn(async (_request: unknown) => "Both older turns.");
    await new MemoryContextService(repository, { summarize }).prepare(input());
    expect(summarize.mock.calls[0]?.[0]).toMatchObject({ previousSummary: null, messages: [{ id: "old-user" }, { id: "old-answer" }] });
  });
  it("does not overwrite durable truth with an oversized provider summary", async () => {
    const repository = new InMemoryMemoryRepository([], [prior()]);
    const put = vi.spyOn(repository, "compareAndSwapSummary");
    await expect(new MemoryContextService(repository, { summarize: async () => "x".repeat(5000) }).prepare(input())).rejects.toMatchObject({ code: "PROVIDER" });
    expect(put).not.toHaveBeenCalled();
    expect(await repository.getSummary("room")).toEqual(prior());
  });
  it("awaits durable write completion before returning the candidate payload", async () => {
    const repository = new InMemoryMemoryRepository();
    const started = deferred<void>();
    const write = deferred<void>();
    const original = repository.compareAndSwapSummary.bind(repository);
    vi.spyOn(repository, "compareAndSwapSummary").mockImplementation(async (roomId, expected, next, signal) => {
      started.resolve(); await write.promise; return original(roomId, expected, next, signal);
    });
    let complete = false;
    const result = new MemoryContextService(repository, { summarize: async () => "Prior discussion." }).prepare(input()).then(value => { complete = true; return value; });
    await started.promise;
    expect(complete).toBe(false);
    expect(await repository.getSummary("room")).toBe(null);
    write.resolve();
    expect((await result).summaryUsed).toBe(true);
  });
  it("propagates write failure without returning unpersisted truth", async () => {
    const repository = new InMemoryMemoryRepository();
    vi.spyOn(repository, "compareAndSwapSummary").mockRejectedValue(new Error("disk full"));
    await expect(new MemoryContextService(repository, { summarize: async () => "Prior discussion." }).prepare(input())).rejects.toThrow("disk full");
    expect(await repository.getSummary("room")).toBe(null);
  });
  it.each([false, true])("handles a zero summary budget with overflowing history=%s", async overflow => {
    const summarize = vi.fn(async () => "unused");
    const request = input(overflow ? history() : createRoom({ id: "room", now: 1 }));
    const result = new MemoryContextService(new InMemoryMemoryRepository(), { summarize }).prepare({ ...request, policy: { ...request.policy, summaryTokenBudget: 0 } });
    if (overflow) await expect(result).rejects.toMatchObject({ code: "VALIDATION" });
    else expect((await result).omittedMessages).toEqual([]);
    expect(summarize).not.toHaveBeenCalled();
  });
  it.each(["read", "summarize", "write"])("cancels promptly during an uncooperative %s port", async stage => {
    const repository = new InMemoryMemoryRepository();
    const started = deferred<void>();
    const pending = deferred<never>();
    const summarize = vi.fn(async () => "Prior discussion.");
    const hang = () => { started.resolve(); return pending.promise; };
    if (stage === "read") vi.spyOn(repository, "getSummary").mockImplementation(hang);
    if (stage === "summarize") summarize.mockImplementation(hang);
    if (stage === "write") vi.spyOn(repository, "compareAndSwapSummary").mockImplementation(hang);
    const controller = new AbortController();
    const result = new MemoryContextService(repository, { summarize }).prepare(input(history(), controller.signal));
    const assertion = expect(result).rejects.toMatchObject({ name: "AbortError" });
    await started.promise;
    controller.abort();
    await assertion;
    pending.reject(new Error("late ignored port failure"));
  });
  it("does not let late summarizer completion write after cancellation", async () => {
    const repository = new InMemoryMemoryRepository();
    const started = deferred<void>();
    const pending = deferred<string>();
    const put = vi.spyOn(repository, "compareAndSwapSummary");
    const controller = new AbortController();
    const result = new MemoryContextService(repository, { summarize: async () => { started.resolve(); return pending.promise; } }).prepare(input(history(), controller.signal));
    const assertion = expect(result).rejects.toMatchObject({ name: "AbortError" });
    await started.promise;
    controller.abort();
    await assertion;
    pending.resolve("late output");
    await Promise.resolve();
    expect(put).not.toHaveBeenCalled();
  });
  it("removes a stale through-message summary and rebuilds instead of failing the request", async () => {
    const repository = new InMemoryMemoryRepository([], [createContextSummary({ roomId: "room", content: "Stale history.", throughMessageId: "deleted-message", now: 2 })]);
    const summarize = vi.fn(async () => "Recovered earlier history.");
    const result = await new MemoryContextService(repository, { summarize }).prepare(input());
    expect(result.summaryUsed).toBe(true);
    expect(summarize).toHaveBeenCalledTimes(1);
    expect((await repository.getSummary("room"))?.throughMessageId).toBe("old-answer");
  });

  it("detects edited history by source fingerprint and rebuilds the summary", async () => {
    const repository = new InMemoryMemoryRepository();
    const firstSummarize = vi.fn(async () => "Original compact history.");
    const firstService = new MemoryContextService(repository, { summarize: firstSummarize });
    const original = history();
    await firstService.prepare(input(original));
    const durable = await repository.getSummary("room");
    expect(durable?.sourceFingerprint).toMatch(/^v1:/);

    const edited = {
      ...original,
      messages: original.messages.map((message, index) =>
        index === 0 ? Object.freeze({ ...message, content: "edited source ".repeat(100) }) : message),
    } as Room;
    const rebuilt = vi.fn(async () => "Rebuilt after edit.");
    const result = await new MemoryContextService(repository, { summarize: rebuilt }).prepare(input(edited));
    expect(result.summaryUsed).toBe(true);
    expect(rebuilt).toHaveBeenCalledTimes(1);
    expect((await repository.getSummary("room"))?.content).toBe("Rebuilt after edit.");
  });
  it("keeps summary timestamps monotonic if the clock moves backward", async () => {
    const repository = new InMemoryMemoryRepository([], [createContextSummary({ roomId: "room", content: "Earlier topic.", throughMessageId: "old-user", now: 100 })]);
    await new MemoryContextService(repository, { summarize: async () => "Earlier topic and answer." }, undefined, { now: () => 3 }).prepare(input());
    expect(await repository.getSummary("room")).toMatchObject({ createdAt: 100, updatedAt: 100 });
  });
  it.each([null, [], "bad", 42])("rejects malformed policy %j before snapshotting", async policy => {
    const repository = new InMemoryMemoryRepository();
    const reads = vi.spyOn(repository, "getSummary");
    await expect(new MemoryContextService(repository, { summarize: async () => "unused" })
      .prepare({ ...input(), policy } as unknown as ContextPrepareInput)).rejects.toMatchObject({ code: "VALIDATION" });
    expect(reads).not.toHaveBeenCalled();
  });

  it("rejects overlapping same-room writes across service instances and releases the guard", async () => {
    const repository = new InMemoryMemoryRepository();
    const started = deferred<void>();
    const pending = deferred<string>();
    const first = new MemoryContextService(repository, { summarize: async () => {
      started.resolve(); return pending.promise;
    } }).prepare(input());
    await started.promise;
    const second = new MemoryContextService(repository, { summarize: async () => "Unused." });
    await expect(second.prepare(input())).rejects.toMatchObject({ code: "VALIDATION", retryable: true });
    pending.resolve("Prior discussion.");
    await first;
    expect((await second.prepare(input())).summaryUsed).toBe(true);
  });

  it("keeps a canceled waiter behind the active writer without skipping the lock", async () => {
    const repository = new InMemoryMemoryRepository();
    const started = deferred<void>();
    const pending = deferred<string>();
    const summarize = vi.fn(async () => { started.resolve(); return pending.promise; });
    const service = new MemoryContextService(repository, { summarize });
    const first = service.prepare(input());
    await started.promise;
    const controller = new AbortController();
    const canceled = service.prepare(input(history(), controller.signal));
    const canceledCheck = expect(canceled).rejects.toMatchObject({ name: "AbortError" });
    controller.abort();
    await canceledCheck;
    const last = service.prepare(input());
    await Promise.resolve();
    expect(summarize).toHaveBeenCalledTimes(1);
    pending.resolve("Earlier topic.");
    expect((await first).summaryUsed).toBe(true);
    expect((await last).summaryUsed).toBe(true);
    expect(summarize).toHaveBeenCalledTimes(1);
  });

  it("bounds pending work including canceled waiters until the queue drains", async () => {
    const started = deferred<void>();
    const pending = deferred<string>();
    const service = new MemoryContextService(new InMemoryMemoryRepository(), {
      summarize: async () => { started.resolve(); return pending.promise; },
    });
    const first = service.prepare(input());
    await started.promise;
    const controller = new AbortController();
    const checks = Array.from({ length: 63 }, () =>
      expect(service.prepare(input(history(), controller.signal))).rejects.toMatchObject({ name: "AbortError" }));
    controller.abort();
    await Promise.all(checks);
    await expect(service.prepare(input())).rejects.toMatchObject({ code: "VALIDATION", retryable: true });
    pending.resolve("Earlier topic.");
    await first;
  });

  it("applies persisted context policy and lets explicit request policy override it", async () => {
    const repository = new InMemoryMemoryRepository([
      createMemoryRecord({ id: "saved", scope: "global", content: "PERSISTED_MEMORY_MARKER", now: 1 }),
    ]);
    const settings = new InMemoryContextPolicyRepository({
      reservedOutputTokens: 100,
      memoryTokenBudget: 1000,
      summaryTokenBudget: 350,
      maxMemoryItems: 0,
    });
    const service = new MemoryContextService(
      repository,
      { summarize: async () => "Earlier history." },
      undefined,
      { policyRepository: settings },
    );
    const base = input();
    const withoutInlinePolicy = {
      room: base.room,
      signal: base.signal,
      systemPrompt: base.systemPrompt,
      contextWindow: base.contextWindow,
    };
    const persisted = await service.prepare(withoutInlinePolicy);
    expect(persisted.selectedMemoryIds).toEqual([]);

    const overridden = await service.prepare({
      ...withoutInlinePolicy,
      policy: { maxMemoryItems: 1, memoryTokenBudget: 1000 },
    });
    expect(overridden.selectedMemoryIds).toEqual(["saved"]);
  });

});

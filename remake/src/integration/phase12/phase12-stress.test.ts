import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { ChatService, type ChatTransport } from "../../application/chat/chat-service";
import { TaskManager } from "../../core/task-manager";
import { createRoom } from "../../domain/chat";
import type {
  ModelDescriptor,
  ProviderAdapter,
} from "../../providers/contracts";
import {
  ModelRouter,
  ProviderHealthTracker,
} from "../../routing/model-router";
import {
  InMemoryRoomRepository,
  IndexedDbRoomRepository,
} from "../../storage/room-repository";
import { RoutedChatTransport } from "./index";

function descriptor(
  providerId: string,
  id: string,
  qualityScore: number,
  speedScore: number,
): ModelDescriptor {
  return Object.freeze({
    providerId,
    id,
    displayName: id,
    contextWindow: 16_384,
    qualityScore,
    speedScore,
    capabilities: Object.freeze({
      streaming: true,
      tools: false,
      vision: false,
    }),
  });
}

function deterministicShuffle<T>(input: readonly T[], seed: number): T[] {
  const output = [...input];
  let state = seed >>> 0;
  for (let index = output.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const swap = state % (index + 1);
    [output[index], output[swap]] = [output[swap]!, output[index]!];
  }
  return output;
}

describe("Phase 1-2 deterministic stress", () => {
  it("runs and prunes 500 tasks without leaking active work", async () => {
    const manager = new TaskManager({ maxRetainedCompleted: 32 });
    let notifications = 0;
    manager.subscribe(() => {
      notifications += 1;
      if (notifications % 17 === 0) throw new Error("hostile observer");
    });

    const ids: string[] = [];
    for (let index = 0; index < 500; index += 1) {
      const run = manager.run(
        { kind: "system", ownerId: `owner-${index % 7}` },
        async () => index,
      );
      ids.push(run.taskId);
      await expect(run.result).resolves.toBe(index);
    }

    expect(manager.listActive()).toHaveLength(0);
    expect(manager.get(ids[0]!)).toBeUndefined();
    expect(manager.get(ids.at(-1)!)).toMatchObject({ status: "succeeded" });
  });

  it("cancels 100 independent tasks without zombie activity", async () => {
    const manager = new TaskManager({ maxRetainedCompleted: 128 });
    const runs = Array.from({ length: 100 }, (_, index) =>
      manager.run(
        { kind: "chat", ownerId: `cancel-${index}`, timeoutMs: 10_000 },
        ({ signal }) =>
          new Promise<number>((_resolve, reject) => {
            signal.addEventListener(
              "abort",
              () => reject(new DOMException("Aborted", "AbortError")),
              { once: true },
            );
          }),
      ),
    );

    await Promise.resolve();
    expect(manager.listActive()).toHaveLength(100);
    for (const run of runs) expect(run.cancel("stress")).toBe(true);
    await Promise.allSettled(runs.map((run) => run.result));
    expect(manager.listActive()).toHaveLength(0);
  });

  it("isolates 40 concurrent rooms through one TaskManager", async () => {
    const rooms = Array.from({ length: 40 }, (_, index) =>
      createRoom({ id: `room-${index}`, now: 1 }),
    );
    const repository = new InMemoryRoomRepository(rooms);
    const manager = new TaskManager();
    const chat = new ChatService(manager, repository);

    const sends = rooms.map(async (room, index) => {
      const transport: ChatTransport = {
        async *stream() {
          await Promise.resolve();
          yield `answer-${index}`;
        },
      };
      const run = await chat.send(room.id, `question-${index}`, transport);
      return run.result;
    });

    const completed = await Promise.all(sends);
    expect(manager.listActive()).toHaveLength(0);

    for (let index = 0; index < completed.length; index += 1) {
      expect(completed[index]!.messages.map((m) => m.content)).toEqual([
        `question-${index}`,
        `answer-${index}`,
      ]);
    }
  });

  it("keeps 50 sequential turns in one room without duplicate message ids", async () => {
    const repository = new InMemoryRoomRepository([
      createRoom({ id: "long-room", now: 1 }),
    ]);
    const chat = new ChatService(new TaskManager(), repository);

    for (let index = 0; index < 50; index += 1) {
      const run = await chat.send(
        "long-room",
        `q-${index}`,
        {
          async *stream() {
            yield `a-${index}`;
          },
        },
      );
      await run.result;
    }

    const room = await repository.get("long-room");
    expect(room?.messages).toHaveLength(100);
    const ids = room?.messages.map((message) => message.id) ?? [];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("produces the same route order across 50 input permutations", () => {
    const models = Array.from({ length: 20 }, (_, index) =>
      descriptor(
        `p-${index % 5}`,
        `m-${index}`,
        50 + (index % 7),
        70 + (index % 3),
      ),
    );
    const router = new ModelRouter();
    const preferences = {
      mode: "balanced" as const,
      preferredModelId: null,
      requireStreaming: true,
      now: 100,
      maxAttempts: 20,
    };

    const expected = router
      .plan(models, [], preferences)
      .candidates.map((item) => `${item.providerId}/${item.modelId}`);

    for (let seed = 1; seed <= 50; seed += 1) {
      const actual = router
        .plan(deterministicShuffle(models, seed), [], preferences)
        .candidates.map((item) => `${item.providerId}/${item.modelId}`);
      expect(actual).toEqual(expected);
    }
  });

  it("caps repeated provider penalties and preserves the furthest cooldown", () => {
    const health = new ProviderHealthTracker();
    for (let index = 0; index < 50; index += 1) {
      health.recordFailure("p", 100 + index, {
        penalty: 100,
        retryAfterMs: index * 10,
      });
    }

    expect(health.snapshot(["p"])[0]).toEqual({
      providerId: "p",
      penalty: 1000,
      cooldownUntil: 149 + 490,
    });

    health.recordSuccess("p", 50);
    expect(health.snapshot(["p"])[0]?.penalty).toBe(1000);
  });

  it("falls through a long chain of pre-token provider failures", async () => {
    const models = Array.from({ length: 16 }, (_, index) =>
      descriptor(`provider-${index}`, `model-${index}`, 100 - index, 50),
    );
    const adapters = new Map<string, ProviderAdapter>();

    for (let index = 0; index < models.length; index += 1) {
      const model = models[index]!;
      adapters.set(model.providerId, {
        id: model.providerId,
        async listModels() {
          return [model];
        },
        async *stream() {
          if (index < models.length - 1) throw new Error("fail");
          yield { delta: "eventual-success" };
        },
      });
    }

    const plan = new ModelRouter().plan(
      models,
      [],
      {
        mode: "deep",
        preferredModelId: null,
        requireStreaming: true,
        now: 1,
        maxAttempts: models.length,
      },
    );

    let output = "";
    for await (const chunk of new RoutedChatTransport(
      plan,
      adapters,
    ).stream({
      room: createRoom({ id: "fallback-chain", now: 1 }),
      signal: new AbortController().signal,
    })) {
      output += chunk;
    }
    expect(output).toBe("eventual-success");
  });
});

describe("IndexedDB deterministic stress", () => {
  const names: string[] = [];

  function nextName(): string {
    const name = `seven-idb-stress-${crypto.randomUUID()}`;
    names.push(name);
    return name;
  }

  afterEach(async () => {
    for (const name of names.splice(0)) {
      await new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase(name);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      });
    }
  });

  it("persists 40 concurrent room transactions and restores all of them", async () => {
    const name = nextName();
    const repository = new IndexedDbRoomRepository({ databaseName: name });
    const rooms = Array.from({ length: 40 }, (_, index) =>
      createRoom({ id: `idb-${index}`, now: index + 1 }),
    );

    await Promise.all(rooms.map((room) => repository.put(room)));
    const listed = await repository.list();
    expect(listed).toHaveLength(40);
    expect(new Set(listed.map((room) => room.id)).size).toBe(40);

    await repository.close();
    const reopened = new IndexedDbRoomRepository({ databaseName: name });
    await expect(reopened.list()).resolves.toHaveLength(40);
    await reopened.close();
  });

  it("survives repeated close/reopen cycles without blocked handles", async () => {
    const name = nextName();
    for (let cycle = 0; cycle < 10; cycle += 1) {
      const repository = new IndexedDbRoomRepository({ databaseName: name });
      await repository.put(
        createRoom({ id: `cycle-${cycle}`, now: cycle + 1 }),
      );
      await repository.close();
    }

    const finalRepository = new IndexedDbRoomRepository({
      databaseName: name,
    });
    await expect(finalRepository.list()).resolves.toHaveLength(10);
    await finalRepository.close();
  });
});

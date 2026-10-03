import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { ChatService, type ChatTransport } from "../../application/chat/chat-service";
import { TaskManager } from "../../core/task-manager";
import {
  createRoom,
  isRoom,
  type Room,
} from "../../domain/chat";
import {
  type ModelDescriptor,
  type ProviderAdapter,
  type ProviderStreamRequest,
} from "../../providers/contracts";
import {
  ModelRegistry,
  ModelRouter,
} from "../../routing/model-router";
import {
  InMemoryRoomRepository,
  IndexedDbRoomRepository,
  type RoomRepository,
} from "../../storage/room-repository";
import { RoutedChatTransport } from "./index";

function model(
  providerId: string,
  id: string,
  overrides: Partial<ModelDescriptor> = {},
): ModelDescriptor {
  return Object.freeze({
    id,
    providerId,
    displayName: id,
    contextWindow: 8192,
    qualityScore: 80,
    speedScore: 80,
    capabilities: Object.freeze({
      streaming: true,
      tools: false,
      vision: false,
    }),
    ...overrides,
  });
}

function provider(
  id: string,
  models: readonly ModelDescriptor[],
  streamImpl: (
    request: ProviderStreamRequest,
    signal: AbortSignal,
  ) => AsyncIterable<{ delta: string }>,
): ProviderAdapter {
  return {
    id,
    async listModels() {
      return models;
    },
    stream: streamImpl,
  };
}

class CountingRepository implements RoomRepository {
  readonly inner: InMemoryRoomRepository;
  puts = 0;

  constructor(room: Room) {
    this.inner = new InMemoryRoomRepository([room]);
  }

  async get(roomId: string) {
    return this.inner.get(roomId);
  }

  async put(room: Room) {
    this.puts += 1;
    return this.inner.put(room);
  }

  async list() {
    return this.inner.list();
  }

  async delete(roomId: string) {
    return this.inner.delete(roomId);
  }
}

describe("Zero-bug regressions", () => {
  it("rejects an invalid timeout before mutating persisted room history", async () => {
    const room = createRoom({ id: "timeout-room", now: 1 });
    const repository = new CountingRepository(room);
    const chat = new ChatService(new TaskManager(), repository);

    await expect(
      chat.send(
        "timeout-room",
        "must not persist",
        {
          async *stream() {
            yield "unused";
          },
        },
        { timeoutMs: 0 },
      ),
    ).rejects.toMatchObject({ code: "VALIDATION" });

    expect(repository.puts).toBe(0);
    expect((await repository.get("timeout-room"))?.messages).toHaveLength(0);
  });

  it("isolates a throwing draft observer from generation", async () => {
    const repository = new InMemoryRoomRepository([
      createRoom({ id: "observer-room", now: 1 }),
    ]);
    const chat = new ChatService(new TaskManager(), repository);

    const run = await chat.send(
      "observer-room",
      "hello",
      {
        async *stream() {
          yield "safe";
        },
      },
      {
        onDraft() {
          throw new Error("UI observer exploded");
        },
      },
    );

    await expect(run.result).resolves.toMatchObject({
      messages: [
        expect.objectContaining({ role: "user", content: "hello" }),
        expect.objectContaining({ role: "assistant", content: "safe" }),
      ],
    });
  });

  it("does not allow cancellation after the assistant commit boundary is sealed", async () => {
    const initial = createRoom({ id: "seal-room", now: 1 });
    let state = initial;
    let releaseFinalWrite: (() => void) | undefined;
    let finalWriteStarted: (() => void) | undefined;
    const finalWriteGate = new Promise<void>((resolve) => {
      finalWriteStarted = resolve;
    });
    const releaseGate = new Promise<void>((resolve) => {
      releaseFinalWrite = resolve;
    });
    let putCount = 0;

    const repository: RoomRepository = {
      async get() {
        return state;
      },
      async put(room) {
        putCount += 1;
        if (putCount === 2) {
          finalWriteStarted?.();
          await releaseGate;
        }
        state = room;
      },
      async list() {
        return [state];
      },
      async delete() {},
    };

    const chat = new ChatService(new TaskManager(), repository);
    const run = await chat.send("seal-room", "hello", {
      async *stream() {
        yield "done";
      },
    });

    await finalWriteGate;
    expect(run.cancel("too-late")).toBe(false);
    releaseFinalWrite?.();

    const completed = await run.result;
    expect(completed.messages.at(-1)).toMatchObject({
      role: "assistant",
      content: "done",
    });
  });

  it("falls back when a provider emits only whitespace then fails", async () => {
    const firstModel = model("first", "m1");
    const secondModel = model("second", "m2");

    const first = provider(
      "first",
      [firstModel],
      async function* () {
        yield { delta: "   " };
        throw new Error("failed after meaningless output");
      },
    );
    const second = provider(
      "second",
      [secondModel],
      async function* () {
        yield { delta: "real" };
      },
    );

    const plan = new ModelRouter().plan(
      [firstModel, secondModel],
      [],
      {
        mode: "balanced",
        preferredModelId: "first::m1",
        requireStreaming: true,
        now: 1,
        maxAttempts: 2,
      },
    );

    const transport = new RoutedChatTransport(
      plan,
      new Map([
        ["first", first],
        ["second", second],
      ]),
    );

    const chunks: string[] = [];
    for await (const chunk of transport.stream({
      room: createRoom({ id: "r", now: 1 }),
      signal: new AbortController().signal,
    })) {
      chunks.push(chunk);
    }

    expect(chunks.join("")).toBe("real");
  });

  it("rejects provider map identity mismatches instead of dispatching to the wrong adapter", async () => {
    const descriptor = model("expected", "m");
    const wrong = provider(
      "wrong",
      [descriptor],
      async function* () {
        yield { delta: "must-not-run" };
      },
    );
    const plan = new ModelRouter().plan(
      [descriptor],
      [],
      {
        mode: "balanced",
        preferredModelId: null,
        requireStreaming: true,
        now: 1,
        maxAttempts: 1,
      },
    );

    const transport = new RoutedChatTransport(
      plan,
      new Map([["expected", wrong]]),
    );

    const consume = async () => {
      for await (const _chunk of transport.stream({
        room: createRoom({ id: "r2", now: 1 }),
        signal: new AbortController().signal,
      })) {
        // no-op
      }
    };

    await expect(consume()).rejects.toMatchObject({ code: "PROVIDER" });
  });

  it("rejects invalid model numbers and ambiguous bare preferred model ids", () => {
    const registry = new ModelRegistry();
    expect(() =>
      registry.replaceProviderModels("p", [
        model("p", "bad", { qualityScore: Number.NaN }),
      ]),
    ).toThrow();

    const router = new ModelRouter();
    expect(() =>
      router.plan(
        [model("a", "shared"), model("b", "shared")],
        [],
        {
          mode: "balanced",
          preferredModelId: "shared",
          requireStreaming: true,
          now: 1,
          maxAttempts: 2,
        },
      ),
    ).toThrow(/ambiguous/);
  });

  it("rejects malformed persisted room shapes including NaN timestamps and duplicate message ids", () => {
    expect(
      isRoom({
        schemaVersion: 1,
        id: "x",
        title: "x",
        modelId: null,
        createdAt: Number.NaN,
        updatedAt: 1,
        messages: [],
      }),
    ).toBe(false);

    expect(
      isRoom({
        schemaVersion: 1,
        id: "x",
        title: "x",
        modelId: null,
        createdAt: 1,
        updatedAt: 2,
        messages: [
          { id: "same", role: "user", content: "a", createdAt: 1 },
          { id: "same", role: "assistant", content: "b", createdAt: 2 },
        ],
      }),
    ).toBe(false);
  });

  it("isolates task listeners and bounds completed task retention", async () => {
    const manager = new TaskManager({ maxRetainedCompleted: 2 });
    manager.subscribe(() => {
      throw new Error("observer failure");
    });

    const ids: string[] = [];
    for (let index = 0; index < 3; index += 1) {
      const run = manager.run(
        { kind: "system", ownerId: "owner" },
        async () => index,
      );
      ids.push(run.taskId);
      await expect(run.result).resolves.toBe(index);
    }

    expect(manager.get(ids[0]!)).toBeUndefined();
    expect(manager.get(ids[1]!)).toBeDefined();
    expect(manager.get(ids[2]!)).toBeDefined();
  });
});

describe("IndexedDB lifecycle regressions", () => {
  const databaseNames: string[] = [];

  function dbName(label: string): string {
    const name = `seven-zero-bug-${label}-${crypto.randomUUID()}`;
    databaseNames.push(name);
    return name;
  }

  afterEach(async () => {
    for (const name of databaseNames.splice(0)) {
      await new Promise<void>((resolve) => {
        const request = indexedDB.deleteDatabase(name);
        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
        request.onblocked = () => resolve();
      });
    }
  });

  it("closes an existing connection on versionchange so a later upgrade is not blocked", async () => {
    const name = dbName("upgrade");
    const v1 = new IndexedDbRoomRepository({
      databaseName: name,
      version: 1,
    });
    await v1.put(createRoom({ id: "persisted", now: 1 }));

    const v2 = new IndexedDbRoomRepository({
      databaseName: name,
      version: 2,
    });
    await expect(v2.list()).resolves.toHaveLength(1);
    await v2.close();
    await v1.close();
  });

  it("validates rooms before writing them to IndexedDB", async () => {
    const name = dbName("invalid-write");
    const repository = new IndexedDbRoomRepository({ databaseName: name });

    const invalid = {
      ...createRoom({ id: "bad", now: 1 }),
      updatedAt: Number.NaN,
    } as Room;

    await expect(repository.put(invalid)).rejects.toMatchObject({
      code: "VALIDATION",
    });
    await repository.close();
  });
});

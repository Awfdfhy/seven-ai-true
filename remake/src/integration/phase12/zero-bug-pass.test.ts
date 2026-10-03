import "fake-indexeddb/auto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ChatService, type ChatTransport } from "../../application/chat/chat-service";
import { SevenError, toSevenError } from "../../core/errors";
import { TaskManager } from "../../core/task-manager";
import {
  commitMessage,
  createRoom,
  isRoom,
  type Room,
} from "../../domain/chat";
import {
  assertValidProviderMessages,
  modelKey,
  type ModelDescriptor,
  type ProviderAdapter,
  type ProviderStreamRequest,
} from "../../providers/contracts";
import {
  ModelRegistry,
  ModelRouter,
  ProviderHealthTracker,
} from "../../routing/model-router";
import {
  InMemoryRoomRepository,
  IndexedDbRoomRepository,
  type RoomRepository,
} from "../../storage/room-repository";
import { RoutedChatTransport, roomConversationText } from "./index";

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

function immediateTransportForTest(): ChatTransport {
  return {
    async *stream() {
      yield "ok";
    },
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

  it("keeps the deadline active after cancellation is sealed and aborts a blocked final write", async () => {
    vi.useFakeTimers();
    const initial = createRoom({ id: "sealed-deadline-room", now: 1 });
    let state = initial;
    let putCount = 0;
    let finalWriteStarted: (() => void) | undefined;
    const finalWriteGate = new Promise<void>((resolve) => {
      finalWriteStarted = resolve;
    });

    const repository: RoomRepository = {
      async get() {
        return state;
      },
      async put(room, signal) {
        putCount += 1;
        if (putCount === 2) {
          finalWriteStarted?.();
          await new Promise<void>((_resolve, reject) => {
            const fail = () =>
              reject(new DOMException("Aborted", "AbortError"));
            if (signal?.aborted) {
              fail();
              return;
            }
            signal?.addEventListener("abort", fail, { once: true });
          });
        }
        state = room;
      },
      async list() {
        return [state];
      },
      async delete() {},
    };

    const chat = new ChatService(new TaskManager(), repository);
    const run = await chat.send(
      "sealed-deadline-room",
      "hello",
      {
        async *stream() {
          yield "done";
        },
      },
      { timeoutMs: 50 },
    );

    const captured = run.result.catch((error: unknown) => error);
    await finalWriteGate;
    expect(run.cancel("too-late")).toBe(false);
    await vi.advanceTimersByTimeAsync(50);

    await expect(captured).resolves.toMatchObject({
      code: "DEADLINE_EXCEEDED",
    });
    expect(state.messages.map((message) => message.role)).toEqual(["user"]);
    vi.useRealTimers();
  });

  it("seals and clears the deadline after the final assistant write succeeds", async () => {
    vi.useFakeTimers();
    const repository = new InMemoryRoomRepository([
      createRoom({ id: "deadline-success-room", now: 1 }),
    ]);
    const tasks = new TaskManager();
    const chat = new ChatService(tasks, repository);

    const run = await chat.send(
      "deadline-success-room",
      "hello",
      {
        async *stream() {
          yield "done";
        },
      },
      { timeoutMs: 50 },
    );

    await expect(run.result).resolves.toMatchObject({
      messages: [
        expect.objectContaining({ role: "user", content: "hello" }),
        expect.objectContaining({ role: "assistant", content: "done" }),
      ],
    });
    expect(tasks.get(run.taskId)).toMatchObject({
      status: "succeeded",
      deadlineSealed: true,
    });

    await vi.advanceTimersByTimeAsync(100);
    expect(tasks.get(run.taskId)?.status).toBe("succeeded");
    vi.useRealTimers();
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

  it("rejects provider map identity mismatches before dispatch", () => {
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

    expect(
      () =>
        new RoutedChatTransport(
          plan,
          new Map([["expected", wrong]]),
        ),
    ).toThrow(/Provider adapter expected is malformed/);
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

  it("preserves exact message content while still rejecting blank messages and invalid roles", () => {
    const room = createRoom({ id: "fidelity", now: 1 });
    const content = "  keep leading and trailing whitespace  \n";
    const updated = commitMessage(room, {
      id: "m1",
      role: "user",
      content,
      now: 2,
    });

    expect(updated.messages[0]?.content).toBe(content);
    expect(() =>
      commitMessage(updated, {
        id: "m2",
        role: "user",
        content: "   ",
        now: 3,
      }),
    ).toThrow();

    expect(() =>
      commitMessage(updated, {
        id: "m3",
        role: "tool" as never,
        content: "bad role",
        now: 3,
      }),
    ).toThrow();
  });

  it("rejects invalid provider roles at runtime", () => {
    expect(() =>
      assertValidProviderMessages([
        { role: "system", content: "system" },
        { role: "tool" as never, content: "not supported" },
      ]),
    ).toThrow(/invalid role/);
  });

  it("ignores stale provider successes that began before a newer failure", () => {
    const health = new ProviderHealthTracker();
    health.recordFailure("p", 100, {
      retryAfterMs: 1000,
      penalty: 100,
    });

    health.recordSuccess("p", 50);
    expect(health.snapshot(["p"])[0]).toEqual({
      providerId: "p",
      penalty: 100,
      cooldownUntil: 1100,
    });

    health.recordSuccess("p", 101);
    expect(health.snapshot(["p"])[0]).toEqual({
      providerId: "p",
      penalty: 75,
      cooldownUntil: null,
    });
  });

  it("ignores a late failure from an older provider attempt after a newer success", () => {
    const health = new ProviderHealthTracker();

    health.recordSuccess("p", 200);
    health.recordFailure("p", 300, {
      attemptStartedAt: 100,
      penalty: 100,
      retryAfterMs: 1000,
    });

    expect(health.snapshot(["p"])[0]).toEqual({
      providerId: "p",
      penalty: 0,
      cooldownUntil: null,
    });
  });

  it("orders concurrent provider health updates with monotonic attempt tokens", () => {
    const health = new ProviderHealthTracker();
    const older = health.beginAttempt("p");
    const newer = health.beginAttempt("p");

    health.recordAttemptSuccess("p", newer);
    health.recordAttemptFailure("p", older, 100, {
      penalty: 100,
      retryAfterMs: 1000,
    });

    expect(health.snapshot(["p"])[0]).toEqual({
      providerId: "p",
      penalty: 0,
      cooldownUntil: null,
    });
  });

  it("ignores a stale success after a newer provider failure even when timestamps collide", () => {
    const health = new ProviderHealthTracker();
    const older = health.beginAttempt("p");
    const newer = health.beginAttempt("p");

    health.recordAttemptFailure("p", newer, 100, {
      penalty: 100,
      retryAfterMs: 1000,
    });
    health.recordAttemptSuccess("p", older);

    expect(health.snapshot(["p"])[0]).toEqual({
      providerId: "p",
      penalty: 100,
      cooldownUntil: 1100,
    });
  });

  it("rejects forged or cross-provider health attempt tokens", () => {
    const health = new ProviderHealthTracker();
    const token = health.beginAttempt("provider-a");

    expect(() =>
      health.recordAttemptSuccess("provider-b", token),
    ).toThrow(/attempt token/);

    expect(() =>
      health.recordAttemptFailure(
        "provider-a",
        { providerId: "provider-a", sequence: token.sequence } as never,
        100,
      ),
    ).toThrow(/attempt token/);
  });

  it("rejects non-canonical model keys and preferred model ids", () => {
    expect(() =>
      modelKey({ providerId: " provider ", id: "model" }),
    ).toThrow(/Model key/);
    expect(() =>
      modelKey({ providerId: "provider", id: " model " }),
    ).toThrow(/Model key/);

    const descriptor = model("provider", "model");
    expect(() =>
      new ModelRouter().plan(
        [descriptor],
        [],
        {
          mode: "balanced",
          preferredModelId: " model ",
          requireStreaming: true,
          now: 1,
          maxAttempts: 1,
        },
      ),
    ).toThrow(/preferredModelId/);
  });

  it("rejects non-string stream deltas and falls back before meaningful output", async () => {
    const badModel = model("bad", "m1");
    const goodModel = model("good", "m2");

    const bad: ProviderAdapter = {
      id: "bad",
      async listModels() {
        return [badModel];
      },
      async *stream() {
        yield { delta: 123 as never };
      },
    };
    const good = provider(
      "good",
      [goodModel],
      async function* () {
        yield { delta: "valid" };
      },
    );

    const plan = new ModelRouter().plan(
      [badModel, goodModel],
      [],
      {
        mode: "balanced",
        preferredModelId: "bad::m1",
        requireStreaming: true,
        now: 1,
        maxAttempts: 2,
      },
    );
    const transport = new RoutedChatTransport(
      plan,
      new Map([
        ["bad", bad],
        ["good", good],
      ]),
    );

    let output = "";
    for await (const chunk of transport.stream({
      room: createRoom({ id: "invalid-chunk", now: 1 }),
      signal: new AbortController().signal,
    })) {
      output += chunk;
    }
    expect(output).toBe("valid");
  });

  it("bounds meaningless provider prelude and falls back instead of accumulating forever", async () => {
    const badModel = model("spaces", "m1");
    const goodModel = model("good", "m2");
    const spaces = provider(
      "spaces",
      [badModel],
      async function* () {
        yield { delta: " ".repeat(20_000) };
      },
    );
    const good = provider(
      "good",
      [goodModel],
      async function* () {
        yield { delta: "fallback" };
      },
    );

    const plan = new ModelRouter().plan(
      [badModel, goodModel],
      [],
      {
        mode: "balanced",
        preferredModelId: "spaces::m1",
        requireStreaming: true,
        now: 1,
        maxAttempts: 2,
      },
    );
    const transport = new RoutedChatTransport(
      plan,
      new Map([
        ["spaces", spaces],
        ["good", good],
      ]),
    );

    let output = "";
    for await (const chunk of transport.stream({
      room: createRoom({ id: "prelude-bound", now: 1 }),
      signal: new AbortController().signal,
    })) {
      output += chunk;
    }
    expect(output).toBe("fallback");
  });

  it("updates provider health automatically from routed execution", async () => {
    const primaryModel = model("primary-health", "m1");
    const fallbackModel = model("fallback-health", "m2");
    const health = new ProviderHealthTracker();
    let clock = 100;

    const primary = provider(
      "primary-health",
      [primaryModel],
      async function* () {
        throw new Error("upstream");
      },
    );
    const fallback = provider(
      "fallback-health",
      [fallbackModel],
      async function* () {
        yield { delta: "ok" };
      },
    );

    const plan = new ModelRouter().plan(
      [primaryModel, fallbackModel],
      health.snapshot(["primary-health", "fallback-health"]),
      {
        mode: "balanced",
        preferredModelId: "primary-health::m1",
        requireStreaming: true,
        now: clock,
        maxAttempts: 2,
      },
    );

    const transport = new RoutedChatTransport(
      plan,
      new Map([
        ["primary-health", primary],
        ["fallback-health", fallback],
      ]),
      "system",
      health,
      () => clock++,
    );

    let output = "";
    for await (const chunk of transport.stream({
      room: createRoom({ id: "health-room", now: 1 }),
      signal: new AbortController().signal,
    })) {
      output += chunk;
    }

    expect(output).toBe("ok");
    expect(health.snapshot(["primary-health", "fallback-health"])).toEqual([
      {
        providerId: "fallback-health",
        penalty: 0,
        cooldownUntil: null,
      },
      {
        providerId: "primary-health",
        penalty: 50,
        cooldownUntil: null,
      },
    ]);
  });

  it("uses retryAfterMs from structured provider failures to create cooldown", async () => {
    const descriptor = model("rate-limited", "m1");
    const health = new ProviderHealthTracker();
    let clock = 1000;

    const limited = provider(
      "rate-limited",
      [descriptor],
      async function* () {
        throw Object.assign(
          new (await import("../../core/errors")).SevenError({
            code: "PROVIDER",
            message: "rate limited",
            retryable: true,
            details: { retryAfterMs: 5000 },
          }),
        );
      },
    );

    const plan = new ModelRouter().plan(
      [descriptor],
      health.snapshot(["rate-limited"]),
      {
        mode: "balanced",
        preferredModelId: null,
        requireStreaming: true,
        now: clock,
        maxAttempts: 1,
      },
    );

    const transport = new RoutedChatTransport(
      plan,
      new Map([["rate-limited", limited]]),
      "system",
      health,
      () => clock,
    );

    const consume = async () => {
      for await (const _chunk of transport.stream({
        room: createRoom({ id: "rate-room", now: 1 }),
        signal: new AbortController().signal,
      })) {
        // no-op
      }
    };

    await expect(consume()).rejects.toMatchObject({ code: "PROVIDER" });
    expect(health.snapshot(["rate-limited"])[0]).toEqual({
      providerId: "rate-limited",
      penalty: 50,
      cooldownUntil: 6000,
    });
  });

  it("rejects malformed TaskManager runtime contracts before creating tasks", () => {
    const manager = new TaskManager();

    expect(() =>
      manager.run(
        { kind: "chat", ownerId: "" },
        async () => "no",
      ),
    ).toThrow(/ownerId/);

    expect(() =>
      manager.run(
        { kind: "invalid" as never, ownerId: "owner" },
        async () => "no",
      ),
    ).toThrow(/kind/);

    expect(manager.listActive()).toHaveLength(0);
  });

  it("prevents two ChatService instances from racing on the same room", async () => {
    const initial = createRoom({ id: "shared-manager-room", now: 1 });
    let state = initial;
    let releaseRead: (() => void) | undefined;
    const readGate = new Promise<void>((resolve) => {
      releaseRead = resolve;
    });

    const repository: RoomRepository = {
      async get(roomId) {
        if (roomId !== state.id) return null;
        await readGate;
        return state;
      },
      async put(room) {
        state = room;
      },
      async list() {
        return [state];
      },
      async delete() {},
    };

    const manager = new TaskManager();
    const firstService = new ChatService(manager, repository);
    const secondService = new ChatService(manager, repository);
    const transport: ChatTransport = {
      async *stream() {
        yield "answer";
      },
    };

    const firstPending = firstService.send(
      "shared-manager-room",
      "first",
      transport,
    );

    await expect(
      secondService.send("shared-manager-room", "second", transport),
    ).rejects.toMatchObject({
      code: "VALIDATION",
    });

    releaseRead?.();
    const firstRun = await firstPending;
    const completed = await firstRun.result;

    expect(completed.messages.map((message) => message.content)).toEqual([
      "first",
      "answer",
    ]);
  });

  it("rejects timer values that overflow browser timeout semantics", () => {
    const manager = new TaskManager();
    expect(() =>
      manager.run(
        {
          kind: "system",
          ownerId: "timer-owner",
          timeoutMs: 2_147_483_648,
        },
        async () => "never",
      ),
    ).toThrow(/timer-safe/);
    expect(manager.listActive()).toHaveLength(0);
  });

  it("keeps appended message timestamps monotonic if the wall clock moves backward", () => {
    const room = createRoom({ id: "clock-room", now: 100 });
    const first = commitMessage(room, {
      id: "first",
      role: "user",
      content: "one",
      now: 200,
    });
    const second = commitMessage(first, {
      id: "second",
      role: "assistant",
      content: "two",
      now: 150,
    });

    expect(second.messages[0]?.createdAt).toBe(200);
    expect(second.messages[1]?.createdAt).toBe(200);
    expect(second.updatedAt).toBe(200);
  });

  it("uses collision-safe model keys even when provider and model ids contain delimiters", () => {
    const left = model("a::b", "c");
    const right = model("a", "b::c");
    expect(modelKey(left)).not.toBe(modelKey(right));

    const router = new ModelRouter();
    const plan = router.plan(
      [left, right],
      [],
      {
        mode: "balanced",
        preferredModelId: modelKey(right),
        requireStreaming: true,
        now: 1,
        maxAttempts: 2,
      },
    );

    expect(plan.candidates[0]).toMatchObject({
      providerId: "a",
      modelId: "b::c",
    });
  });

  it("registers chat ownership before storage preflight and can cancel a blocked room load", async () => {
    const room = createRoom({ id: "blocked-load", now: 1 });
    let releaseGet: (() => void) | undefined;
    const getGate = new Promise<void>((resolve) => {
      releaseGet = resolve;
    });
    let putCount = 0;

    const repository: RoomRepository = {
      async get(roomId) {
        await getGate;
        return roomId === room.id ? room : null;
      },
      async put() {
        putCount += 1;
      },
      async list() {
        return [room];
      },
      async delete() {},
    };

    const tasks = new TaskManager();
    const chat = new ChatService(tasks, repository);
    const run = await chat.send("blocked-load", "hello", immediateTransportForTest());

    expect(tasks.listActive("blocked-load")).toHaveLength(1);
    expect(run.cancel("user")).toBe(true);
    releaseGet?.();

    await expect(run.result).rejects.toMatchObject({ code: "CANCELLED" });
    expect(putCount).toBe(0);
  });

  it("treats executor AbortError without TaskManager cancellation as failure, not cancellation", async () => {
    const manager = new TaskManager();
    const run = manager.run(
      { kind: "system", ownerId: "abort-mismatch" },
      async () => {
        throw new DOMException("provider aborted internally", "AbortError");
      },
    );

    await expect(run.result).rejects.toMatchObject({
      code: "UNKNOWN",
    });
    expect(manager.get(run.taskId)).toMatchObject({
      status: "failed",
      error: { code: "UNKNOWN" },
    });
  });

  it("turns malformed provider descriptors and messages into structured validation errors", () => {
    const registry = new ModelRegistry();

    expect(() =>
      registry.replaceProviderModels("p", [null as never]),
    ).toThrow(/descriptor/);

    expect(() =>
      assertValidProviderMessages([
        { role: "system", content: "system" },
        { role: "user", content: 42 as never },
      ]),
    ).toThrow(/empty/);
  });

  it("snapshots the provider map so mid-generation registry mutation cannot swap adapters", async () => {
    const descriptor = model("stable-provider", "m1");
    const first = provider(
      "stable-provider",
      [descriptor],
      async function* () {
        yield { delta: "first" };
      },
    );
    const replacement = provider(
      "stable-provider",
      [descriptor],
      async function* () {
        yield { delta: "replacement" };
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
    const mutableProviders = new Map<string, ProviderAdapter>([
      ["stable-provider", first],
    ]);
    const transport = new RoutedChatTransport(plan, mutableProviders);
    mutableProviders.set("stable-provider", replacement);

    let output = "";
    for await (const chunk of transport.stream({
      room: createRoom({ id: "provider-snapshot", now: 1 }),
      signal: new AbortController().signal,
    })) {
      output += chunk;
    }

    expect(output).toBe("first");
  });

  it("rejects an unbounded assistant stream before it can exhaust room memory", async () => {
    const repository = new InMemoryRoomRepository([
      createRoom({ id: "bounded-draft", now: 1 }),
    ]);
    const chat = new ChatService(new TaskManager(), repository);
    const transport: ChatTransport = {
      async *stream() {
        yield "a".repeat(600_000);
        yield "b".repeat(500_001);
      },
    };

    const run = await chat.send("bounded-draft", "hello", transport);
    await expect(run.result).rejects.toMatchObject({
      code: "PROVIDER",
    });

    const persisted = await repository.get("bounded-draft");
    expect(persisted?.messages.map((message) => message.role)).toEqual([
      "user",
    ]);
  });

  it("rejects malformed routing and chat runtime inputs with structured validation errors", async () => {
    const router = new ModelRouter();
    const descriptor = model("runtime", "m1");

    expect(() =>
      router.plan(
        [descriptor],
        [],
        {
          mode: "invalid" as never,
          preferredModelId: null,
          requireStreaming: true,
          now: 1,
          maxAttempts: 1,
        },
      ),
    ).toThrow(/mode/);

    expect(() =>
      router.plan(
        [descriptor],
        [],
        {
          mode: "balanced",
          preferredModelId: null,
          requireStreaming: "yes" as never,
          now: 1,
          maxAttempts: 1,
        },
      ),
    ).toThrow(/requireStreaming/);

    const registry = new ModelRegistry();
    expect(() =>
      registry.replaceProviderModels("runtime", null as never),
    ).toThrow(/array/);

    const chat = new ChatService(
      new TaskManager(),
      new InMemoryRoomRepository([
        createRoom({ id: "bad-chat-input", now: 1 }),
      ]),
    );

    await expect(
      chat.send(
        "bad-chat-input",
        "hello",
        null as never,
      ),
    ).rejects.toMatchObject({ code: "VALIDATION" });

    await expect(
      chat.send(
        "bad-chat-input",
        "hello",
        immediateTransportForTest(),
        { onDraft: "bad" as never },
      ),
    ).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("rejects non-canonical or non-monotonic persisted room state", () => {
    expect(
      isRoom({
        schemaVersion: 1,
        id: " room ",
        title: "Room",
        modelId: null,
        createdAt: 1,
        updatedAt: 2,
        messages: [],
      }),
    ).toBe(false);

    expect(
      isRoom({
        schemaVersion: 1,
        id: "room",
        title: "Room",
        modelId: null,
        createdAt: 1,
        updatedAt: 10,
        messages: [
          { id: "m1", role: "user", content: "one", createdAt: 8 },
          { id: "m2", role: "assistant", content: "two", createdAt: 7 },
        ],
      }),
    ).toBe(false);
  });

  it("uses locale-independent deterministic route tie breaking", () => {
    const router = new ModelRouter();
    const plan = router.plan(
      [
        model("a", "same"),
        model("Z", "same"),
      ],
      [],
      {
        mode: "balanced",
        preferredModelId: null,
        requireStreaming: true,
        now: 1,
        maxAttempts: 2,
      },
    );

    expect(plan.candidates.map((candidate) => candidate.providerId)).toEqual([
      "Z",
      "a",
    ]);
  });

  it("validates ProviderHealthTracker public runtime inputs", () => {
    const health = new ProviderHealthTracker();

    expect(() => health.snapshot("bad" as never)).toThrow(/array/);
    expect(() =>
      health.recordFailure("provider", 1, null as never),
    ).toThrow(/options/);
  });

  it("rejects malformed routed system prompts before dispatch", () => {
    const descriptor = model("prompt-provider", "m1");
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

    expect(
      () =>
        new RoutedChatTransport(
          plan,
          new Map(),
          42 as never,
        ),
    ).toThrow(/System prompt/);
  });

  it("rejects a single oversized assistant chunk before concatenating it", async () => {
    const repository = new InMemoryRoomRepository([
      createRoom({ id: "single-huge-chunk", now: 1 }),
    ]);
    const chat = new ChatService(new TaskManager(), repository);
    const run = await chat.send("single-huge-chunk", "hello", {
      async *stream() {
        yield "x".repeat(1_000_001);
      },
    });

    await expect(run.result).rejects.toMatchObject({ code: "PROVIDER" });
    const saved = await repository.get("single-huge-chunk");
    expect(saved?.messages.map((message) => message.role)).toEqual(["user"]);
  });

  it("validates repository identifiers and IndexedDB version bounds", async () => {
    const memory = new InMemoryRoomRepository([
      createRoom({ id: "canonical-room", now: 1 }),
    ]);

    await expect(memory.get(" canonical-room ")).rejects.toMatchObject({
      code: "VALIDATION",
    });
    await expect(memory.delete(" ")).rejects.toMatchObject({
      code: "VALIDATION",
    });

    expect(
      () =>
        new IndexedDbRoomRepository({
          version: Number.MAX_SAFE_INTEGER + 1,
        }),
    ).toThrow(/positive integer/);
  });

  it("validates TaskManager constructor and subscription runtime inputs", () => {
    expect(() => new TaskManager(null as never)).toThrow(/options/);

    const manager = new TaskManager();
    expect(() => manager.subscribe("bad" as never)).toThrow(/listener/);
    expect(() =>
      manager.run(null as never, async () => "no"),
    ).toThrow(/specification/);
  });

  it("rejects non-string custom transport deltas instead of coercing them", async () => {
    const repository = new InMemoryRoomRepository([
      createRoom({ id: "bad-custom-delta", now: 1 }),
    ]);
    const chat = new ChatService(new TaskManager(), repository);
    const run = await chat.send("bad-custom-delta", "hello", {
      async *stream() {
        yield 42 as never;
      },
    });

    await expect(run.result).rejects.toMatchObject({
      code: "PROVIDER",
    });
    const saved = await repository.get("bad-custom-delta");
    expect(saved?.messages.map((message) => message.role)).toEqual(["user"]);
  });

  it("validates public chat-domain inputs instead of leaking TypeError", () => {
    expect(() => createRoom(null as never)).toThrow(/options/);
    expect(() =>
      commitMessage(
        null as never,
        { role: "user", content: "hello", now: 1 },
      ),
    ).toThrow(/Room failed schema/);
    expect(() => roomConversationText(null as never)).toThrow(/schema/);
  });

  it("orders equal-time rooms deterministically without locale-sensitive comparison", async () => {
    const repository = new InMemoryRoomRepository([
      createRoom({ id: "a", now: 1 }),
      createRoom({ id: "Z", now: 1 }),
    ]);
    const rooms = await repository.list();
    expect(rooms.map((room) => room.id)).toEqual(["Z", "a"]);
  });

  it("rejects malformed repository construction inputs and duplicate seed ids", () => {
    expect(() => new InMemoryRoomRepository(null as never)).toThrow(/seed/);
    expect(() =>
      new InMemoryRoomRepository([
        createRoom({ id: "dup", now: 1 }),
        createRoom({ id: "dup", now: 1 }),
      ]),
    ).toThrow(/Duplicate seed room id/);
    expect(() => new IndexedDbRoomRepository(null as never)).toThrow(/options/);
    expect(() =>
      new IndexedDbRoomRepository({ databaseName: " bad " }),
    ).toThrow(/databaseName/);
  });

  it("validates task lookup and cancellation identities and reasons", () => {
    const manager = new TaskManager();
    expect(() => manager.get(" ")).toThrow(/taskId/);
    expect(() => manager.cancel(" ")).toThrow(/taskId/);
    expect(() => manager.cancel("missing", " ")).toThrow(/reason/);
  });

  it("rejects malformed routed constructor inputs and stream contexts", async () => {
    const descriptor = model("provider", "model");
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

    expect(() =>
      new RoutedChatTransport(plan, null as never),
    ).toThrow(/Provider map/);

    expect(() =>
      new RoutedChatTransport(
        { ...plan, candidates: [] } as never,
        new Map(),
      ),
    ).toThrow(/candidate/);

    const transport = new RoutedChatTransport(
      plan,
      new Map([
        [
          "provider",
          provider(
            "provider",
            [descriptor],
            async function* () {
              yield { delta: "ok" };
            },
          ),
        ],
      ]),
    );

    const consume = async () => {
      for await (const _chunk of transport.stream(null as never)) {
        // no-op
      }
    };
    await expect(consume()).rejects.toMatchObject({ code: "VALIDATION" });
  });

  it("allows a large meaningful first provider chunk that exceeds only the whitespace-prelude cap", async () => {
    const descriptor = model("large-first", "m1");
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
      new Map([
        [
          "large-first",
          provider(
            "large-first",
            [descriptor],
            async function* () {
              yield { delta: "x".repeat(20_000) };
            },
          ),
        ],
      ]),
    );

    let output = "";
    for await (const chunk of transport.stream({
      room: createRoom({ id: "large-first-room", now: 1 }),
      signal: new AbortController().signal,
    })) {
      output += chunk;
    }
    expect(output).toHaveLength(20_000);
  });

  it("enforces deadlines even when the executor ignores AbortSignal", async () => {
    vi.useFakeTimers();
    const manager = new TaskManager();
    const never = new Promise<string>(() => {});

    const run = manager.run(
      {
        kind: "system",
        ownerId: "uncooperative-deadline",
        timeoutMs: 25,
      },
      async () => never,
    );
    const rejection = expect(run.result).rejects.toMatchObject({
      code: "DEADLINE_EXCEEDED",
    });

    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(25);
    await rejection;

    expect(manager.listActive("uncooperative-deadline")).toHaveLength(0);
    expect(manager.get(run.taskId)).toMatchObject({
      status: "cancelled",
      error: { code: "DEADLINE_EXCEEDED" },
    });
    vi.useRealTimers();
  });

  it("enforces user cancellation even when the executor ignores AbortSignal", async () => {
    const manager = new TaskManager();
    const never = new Promise<string>(() => {});
    const run = manager.run(
      { kind: "system", ownerId: "uncooperative-user-cancel" },
      async () => never,
    );

    await Promise.resolve();
    expect(run.cancel("user")).toBe(true);
    await expect(run.result).rejects.toMatchObject({ code: "CANCELLED" });
    expect(manager.listActive("uncooperative-user-cancel")).toHaveLength(0);
  });

  it("does not let callers spoof the internal deadline cancellation path", async () => {
    const manager = new TaskManager();
    let sealed: (() => boolean) | undefined;
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const run = manager.run(
      { kind: "system", ownerId: "deadline-spoof", timeoutMs: 10_000 },
      async ({ sealCancellation }) => {
        sealed = sealCancellation;
        await gate;
        return "done";
      },
    );

    await Promise.resolve();
    expect(sealed?.()).toBe(true);
    expect(() => run.cancel("deadline")).toThrow(/reserved internally/);
    expect(manager.get(run.taskId)).toMatchObject({
      status: "running",
      cancellationSealed: true,
    });

    release?.();
    await expect(run.result).resolves.toBe("done");
  });

  it("validates cancellation reasons through the TaskRun handle too", async () => {
    const manager = new TaskManager();
    const run = manager.run(
      { kind: "system", ownerId: "cancel-handle" },
      async ({ signal }) => {
        await new Promise<void>((_resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        });
        return "unreachable";
      },
    );

    expect(() => run.cancel(" ")).toThrow(/reason/);
    expect(run.cancel("user")).toBe(true);
    await expect(run.result).rejects.toMatchObject({ code: "CANCELLED" });
  });

  it("copies and freezes error details and never retains raw unknown thrown values", () => {
    const details = { retryAfterMs: 1000 };
    const error = new SevenError({
      code: "PROVIDER",
      message: "limited",
      details,
    });
    details.retryAfterMs = 2000;
    expect(error.details).toEqual({ retryAfterMs: 1000 });
    expect(Object.isFrozen(error.details)).toBe(true);

    const secret = { token: "must-not-be-retained" };
    const normalized = toSevenError(secret);
    expect(normalized.details).toEqual({ valueType: "object" });
    expect(normalized.details).not.toHaveProperty("value");
  });

  it("rejects non-canonical provider and model identities", () => {
    const registry = new ModelRegistry();
    expect(() =>
      registry.replaceProviderModels(" provider ", [
        model(" provider ", "m1"),
      ]),
    ).toThrow();

    expect(() =>
      registry.replaceProviderModels("provider", [
        model("provider", " model "),
      ]),
    ).toThrow();
  });

  it("does not expose provider-controlled Error.name in fallback diagnostics", async () => {
    const descriptor = model("privacy-provider", "m1");
    const adapter = provider(
      "privacy-provider",
      [descriptor],
      async function* () {
        const error = new Error("sensitive upstream detail");
        error.name = "SECRET_PROVIDER_NAME";
        throw error;
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
      new Map([["privacy-provider", adapter]]),
    );

    const consume = async () => {
      for await (const _chunk of transport.stream({
        room: createRoom({ id: "privacy-room", now: 1 }),
        signal: new AbortController().signal,
      })) {
        // no-op
      }
    };

    try {
      await consume();
      throw new Error("expected provider failure");
    } catch (error) {
      expect(error).toBeInstanceOf(SevenError);
      const seven = error as SevenError;
      expect(seven.details?.failures).toEqual([
        "privacy-provider:Error",
      ]);
      expect(JSON.stringify(seven.details)).not.toContain("SECRET_PROVIDER_NAME");
      expect(JSON.stringify(seven.details)).not.toContain("sensitive upstream detail");
    }
  });

  it("sanitizes raw task error causes from public task snapshots", async () => {
    const manager = new TaskManager();
    const raw = new Error("private provider detail");
    const run = manager.run(
      { kind: "system", ownerId: "snapshot-privacy" },
      async () => {
        throw raw;
      },
    );

    await expect(run.result).rejects.toMatchObject({ code: "UNKNOWN" });
    const snapshot = manager.get(run.taskId);
    expect(snapshot?.error).toBeInstanceOf(SevenError);
    expect((snapshot?.error as Error & { cause?: unknown }).cause).toBeUndefined();
    expect(snapshot?.error?.message).toBe("Task failed.");
    expect(snapshot?.error?.details).toBeUndefined();
    expect(snapshot?.error?.message).not.toContain("private provider detail");
  });

  it("sanitizes TaskRun rejection payloads, not only task snapshots", async () => {
    const manager = new TaskManager();
    const raw = new Error("private provider token=secret");
    const run = manager.run(
      { kind: "system", ownerId: "result-privacy" },
      async () => {
        throw raw;
      },
    );

    const publicError = await run.result.catch((error: unknown) => error);
    expect(publicError).toBeInstanceOf(SevenError);
    const seven = publicError as SevenError;
    expect(seven.code).toBe("UNKNOWN");
    expect(seven.message).toBe("Task failed.");
    expect((seven as Error & { cause?: unknown }).cause).toBeUndefined();
    expect(seven.details).toBeUndefined();
    expect(JSON.stringify(seven)).not.toContain("secret");
  });

  it("snapshots ChatService transport and draft callback before task execution", async () => {
    const repository = new InMemoryRoomRepository([
      createRoom({ id: "chat-binding-snapshot", now: 1 }),
    ]);
    const chat = new ChatService(new TaskManager(), repository);
    let originalDrafts = 0;
    let replacementDrafts = 0;

    const transport: ChatTransport = {
      async *stream() {
        yield "original";
      },
    };
    const options = {
      onDraft() {
        originalDrafts += 1;
      },
    };

    const runPromise = chat.send(
      "chat-binding-snapshot",
      "hello",
      transport,
      options,
    );

    (transport as { stream: ChatTransport["stream"] }).stream =
      async function* () {
        yield "replacement";
      };
    options.onDraft = () => {
      replacementDrafts += 1;
    };

    const run = await runPromise;
    const completed = await run.result;
    expect(completed.messages.at(-1)?.content).toBe("original");
    expect(originalDrafts).toBe(1);
    expect(replacementDrafts).toBe(0);
  });

  it("snapshots route candidates and provider method bindings at transport construction", async () => {
    const adapter = provider(
      "bound-provider",
      [model("bound-provider", "original-model")],
      async function* (request) {
        yield { delta: `original:${request.modelId}` };
      },
    );
    const mutablePlan = {
      createdAt: 1,
      mode: "balanced" as const,
      candidates: [
        {
          providerId: "bound-provider",
          modelId: "original-model",
          score: 1,
        },
      ],
    };

    const transport = new RoutedChatTransport(
      mutablePlan,
      new Map([["bound-provider", adapter]]),
    );

    mutablePlan.candidates[0]!.modelId = "mutated-model";
    (adapter as { stream: ProviderAdapter["stream"] }).stream =
      async function* () {
        yield { delta: "replacement-provider" };
      };

    let output = "";
    for await (const chunk of transport.stream({
      room: createRoom({ id: "binding-room", now: 1 }),
      signal: new AbortController().signal,
    })) {
      output += chunk;
    }

    expect(output).toBe("original:original-model");
  });

  it("does not expose raw provider causes after output has begun", async () => {
    const descriptor = model("post-output-privacy", "m1");
    const adapter = provider(
      "post-output-privacy",
      [descriptor],
      async function* () {
        yield { delta: "started" };
        throw new Error("secret upstream response body");
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
      new Map([["post-output-privacy", adapter]]),
    );

    const consume = async () => {
      for await (const _chunk of transport.stream({
        room: createRoom({ id: "post-output-room", now: 1 }),
        signal: new AbortController().signal,
      })) {
        // no-op
      }
    };

    const error = await consume().catch((caught: unknown) => caught);
    expect(error).toBeInstanceOf(SevenError);
    const seven = error as SevenError;
    expect(seven.code).toBe("PROVIDER");
    expect((seven as Error & { cause?: unknown }).cause).toBeUndefined();
    expect(seven.message).not.toContain("secret upstream response body");
  });

  it("rejects malformed ChatService composition dependencies", () => {
    expect(() =>
      new ChatService(null as never, new InMemoryRoomRepository()),
    ).toThrow(/TaskManager/);

    expect(() =>
      new ChatService(new TaskManager(), null as never),
    ).toThrow(/RoomRepository/);
  });

  it("rejects a transport that does not return an AsyncIterable", async () => {
    const repository = new InMemoryRoomRepository([
      createRoom({ id: "bad-stream-shape", now: 1 }),
    ]);
    const chat = new ChatService(new TaskManager(), repository);
    const badTransport = {
      stream() {
        return Promise.resolve(["not", "an", "async", "iterable"]);
      },
    } as never;

    const run = await chat.send(
      "bad-stream-shape",
      "hello",
      badTransport,
    );
    await expect(run.result).rejects.toMatchObject({
      code: "PROVIDER",
    });

    const saved = await repository.get("bad-stream-shape");
    expect(saved?.messages.map((message) => message.role)).toEqual(["user"]);
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

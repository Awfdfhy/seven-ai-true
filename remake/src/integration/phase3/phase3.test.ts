import "fake-indexeddb/auto";
import { afterEach, describe, expect, it } from "vitest";
import { MemoryContextService, type ContextSummarizer } from "../../application/context/memory-context-service";
import { ContextBuilder } from "../../context/context-builder";
import { commitMessage, createRoom } from "../../domain/chat";
import {
  createContextSummary,
  createMemoryRecord,
} from "../../domain/memory";
import type {
  ModelDescriptor,
  ProviderAdapter,
  ProviderStreamRequest,
} from "../../providers/contracts";
import { ModelRouter } from "../../routing/model-router";
import {
  InMemoryMemoryRepository,
  IndexedDbMemoryRepository,
} from "../../storage/memory-repository";
import { RoutedChatTransport } from "../phase12";

function addTurn(
  room: ReturnType<typeof createRoom>,
  id: string,
  role: "user" | "assistant",
  content: string,
  now: number,
) {
  return commitMessage(room, { id, role, content, now });
}

function model(
  providerId: string,
  id: string,
  contextWindow: number,
): ModelDescriptor {
  return Object.freeze({
    id,
    providerId,
    displayName: id,
    contextWindow,
    qualityScore: 80,
    speedScore: 80,
    capabilities: Object.freeze({
      streaming: true,
      tools: false,
      vision: false,
    }),
  });
}

function adapter(
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

describe("Phase 3 memory + context", () => {
  it("filters global and room memory deterministically", async () => {
    const repository = new InMemoryMemoryRepository([
      createMemoryRecord({
        id: "global",
        scope: "global",
        content: "The user prefers concise answers.",
        priority: 80,
        now: 1,
      }),
      createMemoryRecord({
        id: "room-a",
        scope: "room",
        roomId: "room-a",
        content: "This room is about astronomy.",
        priority: 90,
        now: 2,
      }),
      createMemoryRecord({
        id: "room-b",
        scope: "room",
        roomId: "room-b",
        content: "This belongs elsewhere.",
        priority: 100,
        now: 3,
      }),
    ]);

    await expect(repository.listForRoom("room-a")).resolves.toMatchObject([
      { id: "room-a" },
      { id: "global" },
    ]);
  });

  it("persists memory and summary across IndexedDB repository restart", async () => {
    const databaseName = `seven-phase3-${crypto.randomUUID()}`;
    const first = new IndexedDbMemoryRepository({ databaseName });
    const memory = createMemoryRecord({
      id: "durable",
      scope: "room",
      roomId: "room-persist",
      content: "Durable memory survives restart.",
      priority: 70,
      now: 1,
    });
    const summary = createContextSummary({
      roomId: "room-persist",
      content: "Earlier conversation summarized.",
      throughMessageId: "m1",
      now: 2,
    });

    await first.put(memory);
    await first.putSummary(summary);
    await first.close();

    const second = new IndexedDbMemoryRepository({ databaseName });
    await expect(second.listForRoom("room-persist")).resolves.toEqual([
      memory,
    ]);
    await expect(second.getSummary("room-persist")).resolves.toEqual(summary);
    await second.close();

    await new Promise<void>((resolve) => {
      const request = indexedDB.deleteDatabase(databaseName);
      request.onsuccess = () => resolve();
      request.onerror = () => resolve();
      request.onblocked = () => resolve();
    });
  });

  it("keeps one leading system message, relevant memory, and a contiguous recent history suffix", () => {
    let room = createRoom({ id: "context-room", now: 1 });
    room = addTurn(
      room,
      "m1",
      "user",
      "Old unrelated history ".repeat(80),
      2,
    );
    room = addTurn(
      room,
      "m2",
      "assistant",
      "Old assistant response ".repeat(80),
      3,
    );
    room = addTurn(
      room,
      "m3",
      "user",
      "Tell me more about astronomy and stars.",
      4,
    );

    const relevant = createMemoryRecord({
      id: "astronomy",
      scope: "room",
      roomId: "context-room",
      content: "The user is studying astronomy and stellar evolution.",
      priority: 70,
      now: 4,
    });
    const irrelevant = createMemoryRecord({
      id: "cooking",
      scope: "global",
      content: "The user once discussed a cooking recipe.",
      priority: 10,
      now: 4,
    });

    const result = new ContextBuilder().build({
      room,
      systemPrompt: "You are Seven.",
      contextWindow: 1300,
      memories: [irrelevant, relevant],
      summary: null,
      policy: {
        reservedOutputTokens: 300,
        memoryTokenBudget: 120,
        summaryTokenBudget: 160,
        maxMemoryItems: 1,
      },
    });

    expect(result.messages[0]?.role).toBe("system");
    expect(result.messages.filter((message) => message.role === "system")).toHaveLength(1);
    expect(result.messages[0]?.content).toContain("stellar evolution");
    expect(result.selectedMemoryIds).toEqual(["astronomy"]);
    expect(result.messages.at(-1)).toMatchObject({
      role: "user",
      content: "Tell me more about astronomy and stars.",
    });
    expect(result.omittedMessages.map((message) => message.id)).toEqual([
      "m1",
    ]);
    expect(result.estimatedInputTokens).toBeLessThanOrEqual(
      result.maxInputTokens,
    );
  });

  it("summarizes an omitted prefix, persists it, and reuses it after restart", async () => {
    let room = createRoom({ id: "summary-room", now: 1 });
    for (let index = 0; index < 6; index += 1) {
      room = addTurn(
        room,
        `m${index + 1}`,
        index % 2 === 0 ? "user" : "assistant",
        `Turn ${index + 1}: ${"context ".repeat(120)}`,
        index + 2,
      );
    }
    room = addTurn(
      room,
      "m7",
      "user",
      "What did we establish and what comes next?",
      8,
    );

    const repository = new InMemoryMemoryRepository([
      createMemoryRecord({
        id: "project",
        scope: "room",
        roomId: "summary-room",
        content: "The current project is Seven Remake V3.",
        priority: 100,
        now: 1,
      }),
    ]);

    let calls = 0;
    const summarizer: ContextSummarizer = {
      async summarize(input) {
        calls += 1;
        expect(input.messages.length).toBeGreaterThan(0);
        expect(input.signal.aborted).toBe(false);
        return `Compact summary pass ${calls}: earlier project decisions are preserved.`;
      },
    };

    const service = new MemoryContextService(
      repository,
      summarizer,
      new ContextBuilder(),
      { now: () => 100 },
    );

    const first = await service.prepare({
      room,
      systemPrompt: "You are Seven.",
      contextWindow: 1350,
      signal: new AbortController().signal,
      policy: {
        reservedOutputTokens: 300,
        memoryTokenBudget: 120,
        summaryTokenBudget: 180,
        maxMemoryItems: 4,
      },
    });

    expect(calls).toBeGreaterThan(0);
    expect(first.omittedMessages).toHaveLength(0);
    expect(first.summaryUsed).toBe(true);
    expect(first.messages[0]?.content).toContain("Compact summary pass");
    expect(first.messages[0]?.content).toContain("Seven Remake V3");

    const durable = await repository.getSummary("summary-room");
    expect(durable).not.toBeNull();

    const restartedRepository = new InMemoryMemoryRepository(
      await repository.listForRoom("summary-room"),
      durable ? [durable] : [],
    );
    const noResummarize: ContextSummarizer = {
      async summarize() {
        throw new Error("summary should have been reusable");
      },
    };
    const restarted = new MemoryContextService(
      restartedRepository,
      noResummarize,
    );

    const second = await restarted.prepare({
      room,
      systemPrompt: "You are Seven.",
      contextWindow: 1350,
      signal: new AbortController().signal,
      policy: {
        reservedOutputTokens: 300,
        memoryTokenBudget: 120,
        summaryTokenBudget: 180,
        maxMemoryItems: 4,
      },
    });

    expect(second.omittedMessages).toHaveLength(0);
    expect(second.summaryUsed).toBe(true);
  });

  it("rejects an oversized generated summary before it becomes durable", async () => {
    let room = createRoom({ id: "oversized-summary", now: 1 });
    room = addTurn(room, "m1", "user", "old ".repeat(900), 2);
    room = addTurn(room, "m2", "user", "latest", 3);

    const repository = new InMemoryMemoryRepository();
    const service = new MemoryContextService(repository, {
      async summarize() {
        return "summary ".repeat(500);
      },
    });

    await expect(
      service.prepare({
        room,
        systemPrompt: "You are Seven.",
        contextWindow: 1200,
        signal: new AbortController().signal,
        policy: {
          reservedOutputTokens: 300,
          memoryTokenBudget: 0,
          summaryTokenBudget: 50,
          maxMemoryItems: 0,
        },
      }),
    ).rejects.toMatchObject({
      code: "PROVIDER",
      message: "Context summarizer exceeded the summary token budget.",
    });

    await expect(repository.getSummary("oversized-summary")).resolves.toBeNull();
  });

  it("does not persist a summary after cancellation", async () => {
    let room = createRoom({ id: "cancel-summary", now: 1 });
    room = addTurn(
      room,
      "m1",
      "user",
      "old ".repeat(900),
      2,
    );
    room = addTurn(room, "m2", "user", "latest", 3);

    const repository = new InMemoryMemoryRepository();
    const controller = new AbortController();
    const summarizer: ContextSummarizer = {
      async summarize() {
        controller.abort();
        return "must not persist";
      },
    };
    const service = new MemoryContextService(repository, summarizer);

    await expect(
      service.prepare({
        room,
        systemPrompt: "You are Seven.",
        contextWindow: 1200,
        signal: controller.signal,
        policy: {
          reservedOutputTokens: 300,
          memoryTokenBudget: 0,
          summaryTokenBudget: 100,
          maxMemoryItems: 0,
        },
      }),
    ).rejects.toMatchObject({ name: "AbortError" });

    await expect(repository.getSummary("cancel-summary")).resolves.toBeNull();
  });

  it("serializes concurrent summary mutation for the same room", async () => {
    let room = createRoom({ id: "summary-race", now: 1 });
    room = addTurn(room, "m1", "user", "old ".repeat(900), 2);
    room = addTurn(room, "m2", "user", "latest", 3);

    const repository = new InMemoryMemoryRepository();
    let calls = 0;
    let active = 0;
    let maxActive = 0;
    let releaseFirst!: () => void;
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve;
    });
    let firstStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      firstStarted = resolve;
    });

    const service = new MemoryContextService(repository, {
      async summarize() {
        calls += 1;
        active += 1;
        maxActive = Math.max(maxActive, active);
        if (calls === 1) {
          firstStarted();
          await firstGate;
        }
        active -= 1;
        return "Serialized compact summary.";
      },
    });

    const makeInput = () => ({
      room,
      systemPrompt: "You are Seven.",
      contextWindow: 1200,
      signal: new AbortController().signal,
      policy: {
        reservedOutputTokens: 300,
        memoryTokenBudget: 0,
        summaryTokenBudget: 100,
        maxMemoryItems: 0,
      },
    });

    const first = service.prepare(makeInput());
    await started;
    const second = service.prepare(makeInput());
    await Promise.resolve();

    expect(calls).toBe(1);
    expect(maxActive).toBe(1);

    releaseFirst();
    const [a, b] = await Promise.all([first, second]);

    expect(a.omittedMessages).toHaveLength(0);
    expect(b.omittedMessages).toHaveLength(0);
    expect(maxActive).toBe(1);
    expect(calls).toBe(1);
  });

  it("rejects malformed prepared context before provider dispatch", async () => {
    const descriptor = model("context-guard", "m1", 4000);
    let providerCalled = false;
    const guarded = adapter(
      "context-guard",
      [descriptor],
      async function* () {
        providerCalled = true;
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
      new Map([["context-guard", guarded]]),
      "system",
      undefined,
      () => 1,
      {
        async prepare() {
          return {
            messages: [
              { role: "system", content: "system" },
              { role: "user", content: "hello" },
            ],
            estimatedInputTokens: 5000,
            maxInputTokens: 3000,
            selectedMemoryIds: [],
            omittedMessages: [],
            summaryUsed: false,
          } as never;
        },
      },
    );

    const consume = async () => {
      for await (const _chunk of transport.stream({
        room: addTurn(
          createRoom({ id: "guard-room", now: 1 }),
          "u1",
          "user",
          "hello",
          2,
        ),
        signal: new AbortController().signal,
      })) {
        // no-op
      }
    };

    await expect(consume()).rejects.toMatchObject({
      code: "VALIDATION",
      message: "Prepared context token budget is invalid.",
    });
    expect(providerCalled).toBe(false);
  });

  it("rebuilds context for each fallback model using that model's context window", async () => {
    const large = model("large", "large-model", 16_000);
    const small = model("small", "small-model", 4_000);
    const plan = new ModelRouter().plan(
      [large, small],
      [],
      {
        mode: "balanced",
        preferredModelId: "large::large-model",
        requireStreaming: true,
        now: 1,
        maxAttempts: 2,
      },
    );

    const first = adapter(
      "large",
      [large],
      async function* () {
        throw new Error("first provider unavailable");
      },
    );
    const second = adapter(
      "small",
      [small],
      async function* (request) {
        expect(request.messages[0]?.content).toContain("window=4000");
        yield { delta: "fallback-ok" };
      },
    );

    const seen: number[] = [];
    const contextSource = {
      async prepare(input: {
        room: ReturnType<typeof createRoom>;
        systemPrompt: string;
        contextWindow: number;
        signal: AbortSignal;
      }) {
        seen.push(input.contextWindow);
        return Object.freeze({
          messages: Object.freeze([
            Object.freeze({
              role: "system" as const,
              content: `${input.systemPrompt} window=${input.contextWindow}`,
            }),
            Object.freeze({
              role: "user" as const,
              content: "hello",
            }),
          ]),
          estimatedInputTokens: 10,
          maxInputTokens: input.contextWindow - 100,
          selectedMemoryIds: Object.freeze([]),
          omittedMessages: Object.freeze([]),
          summaryUsed: false,
        });
      },
    };

    const transport = new RoutedChatTransport(
      plan,
      new Map([
        ["large", first],
        ["small", second],
      ]),
      "system",
      undefined,
      () => 1,
      contextSource,
    );

    let output = "";
    for await (const chunk of transport.stream({
      room: addTurn(
        createRoom({ id: "fallback-context", now: 1 }),
        "u1",
        "user",
        "hello",
        2,
      ),
      signal: new AbortController().signal,
    })) {
      output += chunk;
    }

    expect(output).toBe("fallback-ok");
    expect(seen).toEqual([16_000, 4_000]);
  });
});

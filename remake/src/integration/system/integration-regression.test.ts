import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { ChatService } from "../../application/chat/chat-service";
import { RoutingChatTransport } from "../../application/chat/routed-chat-transport";
import { AttachmentService, SingleFlightPdfParserLoader } from "../../application/attachments/attachment-service";
import { ResearchService } from "../../application/research/research-service";
import { ContextBuilder } from "../../context/context-builder";
import { SevenError } from "../../core/errors";
import { TaskManager } from "../../core/task-manager";
import { createRoom, type Room } from "../../domain/chat";
import { createResearchCitation } from "../../domain/research";
import type { ModelDescriptor, ProviderAdapter } from "../../providers/contracts";
import { RpgCanonService } from "../../rpg/rpg-canon-service";
import { ModelRegistry, ModelRouter, ProviderHealthTracker } from "../../routing/model-router";
import { InMemoryAttachmentRepository } from "../../storage/attachment-repository";
import { InMemoryResearchRepository } from "../../storage/research-repository";
import { IndexedDbRoomRepository, InMemoryRoomRepository } from "../../storage/room-repository";
import { InMemoryRpgRepository } from "../../storage/rpg-repository";

function model(providerId: string, id: string, quality = 80, speed = 80): ModelDescriptor {
  return Object.freeze({
    id,
    providerId,
    displayName: id,
    contextWindow: 16_384,
    qualityScore: quality,
    speedScore: speed,
    capabilities: Object.freeze({ streaming: true, tools: false, vision: false }),
  });
}

function provider(id: string, descriptor: ModelDescriptor, response: string | Error): ProviderAdapter {
  return {
    id,
    async listModels() { return [descriptor]; },
    async *stream() {
      if (response instanceof Error) throw response;
      yield Object.freeze({ delta: response });
    },
  };
}

describe("Integration + Verification permanent regression scenarios", () => {
  it("Scenario A — normal chat preserves follow-up order and topic changes", async () => {
    const repository = new InMemoryRoomRepository([createRoom({ id: "normal", now: 1 })]);
    const chat = new ChatService(new TaskManager(), repository);
    const transport = {
      async *stream() { yield "assistant"; },
    };

    await chat.send("normal", "first question", transport).then((run) => run.result);
    const completed = await chat.send("normal", "different topic", transport).then((run) => run.result);
    expect(completed.messages.map((message) => message.role)).toEqual([
      "user", "assistant", "user", "assistant",
    ]);
    expect(completed.messages.at(-2)?.content).toBe("different topic");
  });

  it("Scenario B/H — research keeps useful evidence when one source loses network", async () => {
    const citation = createResearchCitation({
      canonicalUrl: "https://example.com/fresh",
      title: "Fresh source",
      snippet: "Evidence",
      retrievedAt: 100,
      publishedAt: 90,
      contentHash: "a".repeat(64),
      providerId: "good",
    });
    const service = new ResearchService(
      new TaskManager(),
      [
        {
          id: "offline",
          async search() {
            throw new SevenError({ code: "NETWORK", message: "offline", retryable: true });
          },
        },
        { id: "good", async search() { return [citation]; } },
      ],
      {
        async synthesize({ citations }) {
          return `answer from ${citations.length} citation`;
        },
      },
      new InMemoryResearchRepository(),
      () => 100,
    );

    const result = await service.run("current question", { bypassCache: true }).result;
    expect(result.answer).toBe("answer from 1 citation");
    expect(result.citations).toHaveLength(1);
    expect(result.sourceFailures).toEqual([{ sourceId: "offline", code: "NETWORK" }]);
  });

  it("Failure injection — total research network loss is explicit and retryable", async () => {
    const service = new ResearchService(
      new TaskManager(),
      [{
        id: "offline",
        async search() {
          throw new SevenError({ code: "NETWORK", message: "offline", retryable: true });
        },
      }],
      { async synthesize() { return "must not run"; } },
      new InMemoryResearchRepository(),
    );
    await expect(service.run("network failure", { bypassCache: true }).result)
      .rejects.toMatchObject({ code: "NETWORK", retryable: true });
  });

  it("Scenario C — text attachment ingestion is room-scoped and content-addressed", async () => {
    const repository = new InMemoryAttachmentRepository();
    const service = new AttachmentService(
      new TaskManager(),
      repository,
      new SingleFlightPdfParserLoader(async () => ({
        async parse() { return "pdf"; },
      })),
      () => 123,
    );
    const record = await service.ingest({
      roomId: "room-file",
      id: "file-1",
      name: "notes.txt",
      declaredMimeType: "text/plain",
      bytes: new TextEncoder().encode("Seven integration notes"),
    }).result;
    expect(record.extractedText).toBe("Seven integration notes");
    expect(record.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(await repository.list("room-file")).toHaveLength(1);
    expect(await repository.list("other-room")).toHaveLength(0);
  });

  it("Scenario G — provider failure falls back only before meaningful output", async () => {
    const primaryModel = model("primary", "p", 100, 100);
    const fallbackModel = model("fallback", "f", 80, 80);
    const registry = new ModelRegistry();
    registry.replaceProviderModels("primary", [primaryModel]);
    registry.replaceProviderModels("fallback", [fallbackModel]);
    const transport = new RoutingChatTransport(
      registry,
      new ModelRouter(),
      new ProviderHealthTracker(),
      new Map([
        ["primary", provider("primary", primaryModel, new Error("down"))],
        ["fallback", provider("fallback", fallbackModel, "recovered")],
      ]),
      { mode: "balanced", maxAttempts: 2, now: () => 10 },
    );
    let output = "";
    for await (const chunk of transport.stream({
      room: createRoom({ id: "route", now: 1 }),
      signal: new AbortController().signal,
      taskId: "route-task",
    })) output += chunk;
    expect(output).toBe("recovered");
  });

  it("Scenario I — room state survives an IndexedDB restart", async () => {
    const databaseName = `integration-room-${crypto.randomUUID()}`;
    const first = new IndexedDbRoomRepository({ databaseName });
    const room = createRoom({ id: "restart", title: "Restart", mode: "deep", now: 1 });
    await first.put(room);
    await first.close();

    const second = new IndexedDbRoomRepository({ databaseName });
    const restored = await second.get("restart");
    expect(restored).toMatchObject({ id: "restart", title: "Restart", mode: "deep" });
    await second.close();
  });

  it("Scenario E — long RPG state evolution remains revision-safe and isolated", async () => {
    let clock = 100;
    const service = new RpgCanonService(new TaskManager(), new InMemoryRpgRepository(), () => ++clock);
    let snapshot = await service.create({
      id: "world-a",
      packId: "pack",
      packVersion: "1",
      worldSessionId: "world-session-a",
      canonSessionId: "canon-session-a",
      rootBranchId: "main",
    }).result;

    for (let index = 0; index < 100; index += 1) {
      snapshot = await service.apply("world-a", {
        expectedRevision: snapshot.revision,
        state: { turn: String(index + 1) },
      }).result;
    }
    expect(snapshot.revision).toBe(100);
    expect(snapshot.state.turn).toBe("100");
    await expect(service.load("world-b")).resolves.toBeNull();
  });

  it("Scenario J — a 2,000-message session is reduced to the model context budget", () => {
    const messages = Object.freeze(Array.from({ length: 2000 }, (_, index) => Object.freeze({
      id: `m-${index}`,
      role: index % 2 === 0 ? "user" as const : "assistant" as const,
      content: `message ${index} ${"context ".repeat(12)}`,
      createdAt: index + 1,
    })));
    const room: Room = Object.freeze({
      schemaVersion: 1,
      id: "long-room",
      title: "Long",
      modelId: null,
      mode: "balanced",
      messages,
      createdAt: 0,
      updatedAt: 2000,
    });
    const result = new ContextBuilder().build({
      room,
      systemPrompt: "Seven",
      contextWindow: 8192,
      memories: [],
      summary: null,
      policy: { reservedOutputTokens: 1024 },
    });
    expect(result.estimatedInputTokens).toBeLessThanOrEqual(result.maxInputTokens);
    expect(result.messages.at(-1)?.content).toContain("message 1999");
    expect(result.omittedMessages.length).toBeGreaterThan(0);
  });

  it("Concurrency — cancelling one owner does not cancel an independent research task", async () => {
    const tasks = new TaskManager();
    let releaseResearch!: () => void;
    const researchGate = new Promise<void>((resolve) => { releaseResearch = resolve; });
    const citation = createResearchCitation({
      canonicalUrl: "https://example.com/concurrent",
      title: "Concurrent",
      snippet: "Evidence",
      retrievedAt: 1,
      publishedAt: null,
      contentHash: "b".repeat(64),
      providerId: "source",
    });
    const research = new ResearchService(
      tasks,
      [{ id: "source", async search() { await researchGate; return [citation]; } }],
      { async synthesize() { return "ok"; } },
      new InMemoryResearchRepository(),
      () => 1,
    );
    const rooms = new InMemoryRoomRepository([createRoom({ id: "chat-owner", now: 1 })]);
    const chat = new ChatService(tasks, rooms);
    const chatRun = await chat.send("chat-owner", "cancel me", {
      async *stream({ signal }) {
        await new Promise<void>((_resolve, reject) => {
          signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
        });
      },
    });
    const researchRun = research.run("concurrent query", { bypassCache: true });
    chatRun.cancel("user");
    releaseResearch();

    await expect(chatRun.result).rejects.toMatchObject({ code: "CANCELLED" });
    await expect(researchRun.result).resolves.toMatchObject({ answer: "ok" });
    expect(tasks.listActive()).toEqual([]);
  });
});

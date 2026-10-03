import { describe, expect, it } from "vitest";
import { TaskManager } from "../../core/task-manager";
import { createRoom } from "../../domain/chat";
import {
  ChatService,
  type AssistantDraft,
} from "../../application/chat/chat-service";
import {
  InMemoryRoomRepository,
} from "../../storage/room-repository";
import {
  ModelRegistry,
  ModelRouter,
} from "../../routing/model-router";
import type {
  ModelDescriptor,
  ProviderAdapter,
  ProviderStreamRequest,
} from "../../providers/contracts";
import { RoutedChatTransport } from "./index";

function model(
  providerId: string,
  id: string,
  qualityScore: number,
  speedScore: number,
): ModelDescriptor {
  return Object.freeze({
    id,
    providerId,
    displayName: id,
    contextWindow: 32_000,
    qualityScore,
    speedScore,
    capabilities: Object.freeze({
      streaming: true,
      tools: false,
      vision: false,
    }),
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

describe("Seven Remake Phase 1-2 vertical slice", () => {
  it("routes, falls back before first token, commits once, and restores the room", async () => {
    const repository = new InMemoryRoomRepository();
    const room = createRoom({ id: "room-1", now: 1 });
    await repository.put(room);

    const primaryModel = model("primary", "strong", 100, 60);
    const fallbackModel = model("fallback", "fast", 80, 90);

    const primary = provider(
      "primary",
      [primaryModel],
      async function* () {
        throw new Error("temporary upstream failure");
      },
    );
    const fallback = provider(
      "fallback",
      [fallbackModel],
      async function* (_request, signal) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        yield { delta: "hel" };
        yield { delta: "lo" };
      },
    );

    const registry = new ModelRegistry();
    registry.replaceProviderModels("primary", await primary.listModels(new AbortController().signal));
    registry.replaceProviderModels("fallback", await fallback.listModels(new AbortController().signal));

    const plan = new ModelRouter().plan(
      registry.list(),
      [
        { providerId: "primary", penalty: 0, cooldownUntil: null },
        { providerId: "fallback", penalty: 0, cooldownUntil: null },
      ],
      {
        mode: "deep",
        preferredModelId: "strong",
        requireStreaming: true,
        now: 10,
        maxAttempts: 2,
      },
    );

    expect(plan.candidates.map((candidate) => candidate.providerId)).toEqual([
      "primary",
      "fallback",
    ]);

    const transport = new RoutedChatTransport(
      plan,
      new Map([
        ["primary", primary],
        ["fallback", fallback],
      ]),
    );
    const chat = new ChatService(new TaskManager(), repository);
    const run = await chat.send("room-1", "Hi", transport);
    const completed = await run.result;

    expect(completed.messages.map((message) => [message.role, message.content])).toEqual([
      ["user", "Hi"],
      ["assistant", "hello"],
    ]);

    const diskImage = await repository.list();
    const restartedRepository = new InMemoryRoomRepository(diskImage);
    const restored = await restartedRepository.get("room-1");
    expect(restored?.messages).toEqual(completed.messages);
  });

  it("cancels streaming without committing a partial assistant message", async () => {
    const repository = new InMemoryRoomRepository([
      createRoom({ id: "room-stop", now: 1 }),
    ]);

    const slowModel = model("slow", "slow-model", 90, 20);
    const slow = provider(
      "slow",
      [slowModel],
      async function* (_request, signal) {
        yield { delta: "partial" };
        await new Promise<void>((_resolve, reject) => {
          if (signal.aborted) {
            reject(new DOMException("Aborted", "AbortError"));
            return;
          }
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        });
      },
    );

    const registry = new ModelRegistry();
    registry.replaceProviderModels(
      "slow",
      await slow.listModels(new AbortController().signal),
    );
    const plan = new ModelRouter().plan(
      registry.list(),
      [{ providerId: "slow", penalty: 0, cooldownUntil: null }],
      {
        mode: "balanced",
        preferredModelId: null,
        requireStreaming: true,
        now: 1,
        maxAttempts: 1,
      },
    );

    let draftResolve: ((draft: AssistantDraft) => void) | null = null;
    const draftSeen = new Promise<AssistantDraft>((resolve) => {
      draftResolve = resolve;
    });

    const tasks = new TaskManager();
    const chat = new ChatService(tasks, repository);
    const run = await chat.send(
      "room-stop",
      "Stop me",
      new RoutedChatTransport(plan, new Map([["slow", slow]])),
      {
        onDraft(draft) {
          draftResolve?.(draft);
        },
      },
    );

    await expect(draftSeen).resolves.toMatchObject({ content: "partial" });
    expect(run.cancel("user")).toBe(true);
    expect(run.cancel("again")).toBe(false);
    await expect(run.result).rejects.toMatchObject({ code: "CANCELLED" });

    const restored = await repository.get("room-stop");
    expect(restored?.messages.map((message) => message.role)).toEqual(["user"]);
  });

  it("excludes providers that are still in cooldown", () => {
    const router = new ModelRouter();
    const plan = router.plan(
      [model("bad", "m1", 100, 100), model("good", "m2", 70, 70)],
      [
        { providerId: "bad", penalty: 0, cooldownUntil: 5000 },
        { providerId: "good", penalty: 0, cooldownUntil: null },
      ],
      {
        mode: "balanced",
        preferredModelId: null,
        requireStreaming: true,
        now: 1000,
        maxAttempts: 2,
      },
    );

    expect(plan.candidates.map((candidate) => candidate.providerId)).toEqual([
      "good",
    ]);
  });
});

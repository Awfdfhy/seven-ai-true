import { describe, expect, it } from "vitest";
import { commitMessage, createRoom, type Room } from "../../domain/chat";
import { ContextBuilder } from "../../context/context-builder";
import type { ProviderContextSource } from "../../application/context/memory-context-service";
import type { ProviderAdapter, ProviderStreamRequest } from "../../providers/contracts";
import { ModelRouter, ProviderHealthTracker, type RoutePlan } from "../../routing/model-router";
import { RoutedChatTransport } from "./index";

function room(): Room {
  let result = createRoom({ id: "context-room", now: 1 });
  for (let i = 0; i < 8; i += 1) {
    result = commitMessage(result, {
      id: `message-${i}`, role: i % 2 === 0 ? "user" : "assistant",
      content: `History ${i} ${"context ".repeat(20)}`, now: i + 2,
    });
  }
  return commitMessage(result, { id: "latest", role: "user", content: "Remember my question", now: 20 });
}

function plan(): RoutePlan {
  return new ModelRouter().plan([
    { id: "large", providerId: "primary", displayName: "Large", contextWindow: 4096, qualityScore: 100, speedScore: 100, capabilities: { streaming: true, tools: false, vision: false } },
    { id: "small", providerId: "fallback", displayName: "Small", contextWindow: 512, qualityScore: 50, speedScore: 50, capabilities: { streaming: true, tools: false, vision: false } },
  ], [], { mode: "deep", preferredModelId: null, requireStreaming: true, now: 1, maxAttempts: 2 });
}

function adapter(id: string, stream: ProviderAdapter["stream"]): ProviderAdapter {
  return { id, listModels: async () => [], stream };
}

async function collect(transport: RoutedChatTransport, currentRoom: Room, signal: AbortSignal): Promise<string> {
  let output = "";
  for await (const chunk of transport.stream({ room: currentRoom, signal })) output += chunk;
  return output;
}

const source: ProviderContextSource = {
  async prepare(input) {
    return new ContextBuilder().build({
      ...input, memories: [], summary: null, policy: { reservedOutputTokens: 64 },
    });
  },
};

describe("Phase 3 routed context boundary", () => {
  it("rebuilds fallback payload for that model's own window with one system message and the newest user turn", async () => {
    const prepared: number[] = [];
    const requests: ProviderStreamRequest[] = [];
    const currentRoom = room();
    const before = JSON.stringify(currentRoom);
    const contextSource: ProviderContextSource = {
      async prepare(input) {
        prepared.push(input.contextWindow);
        const result = await source.prepare(input);
        expect(result.estimatedInputTokens).toBeLessThanOrEqual(input.contextWindow - 64);
        return result;
      },
    };
    const transport = new RoutedChatTransport(plan(), new Map([
      ["primary", adapter("primary", async function* (request) { requests.push(request); throw new Error("retry"); })],
      ["fallback", adapter("fallback", async function* (request) { requests.push(request); yield { delta: "done" }; })],
    ]), "Seven system", undefined, Date.now, contextSource);

    await expect(collect(transport, currentRoom, new AbortController().signal)).resolves.toBe("done");
    expect(prepared).toEqual([4096, 512]);
    expect(requests[1]!.messages.length).toBeLessThan(requests[0]!.messages.length);
    for (const request of requests) {
      expect(request.maxOutputTokens).toBe(64);
      expect(request.messages.filter(message => message.role === "system")).toHaveLength(1);
      expect(request.messages[0]!.role).toBe("system");
      expect(request.messages.at(-1)).toEqual({ role: "user", content: "Remember my question" });
      expect(Object.isFrozen(request.messages)).toBe(true);
    }
    expect(JSON.stringify(currentRoom)).toBe(before);
  });

  it("does not call providers or record health when cancellation happens during context preparation", async () => {
    const controller = new AbortController();
    const health = new ProviderHealthTracker();
    let called = false;
    const transport = new RoutedChatTransport(plan(), new Map([
      ["primary", adapter("primary", async function* () { called = true; yield { delta: "late" }; })],
    ]), "Seven", health, Date.now, {
      async prepare(input) {
        const result = await source.prepare(input);
        controller.abort();
        return result;
      },
    });
    await expect(collect(transport, room(), controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(called).toBe(false);
    expect(health.snapshot()).toEqual([]);
  });

  it("does not treat a provider that returns quietly on cancellation as success", async () => {
    const controller = new AbortController();
    const health = new ProviderHealthTracker();
    const transport = new RoutedChatTransport(plan(), new Map([
      ["primary", adapter("primary", async function* () {
        yield { delta: "partial" };
        controller.abort();
      })],
    ]), "Seven", health, Date.now, source);
    await expect(collect(transport, room(), controller.signal)).rejects.toMatchObject({ name: "AbortError" });
    expect(health.snapshot()).toEqual([]);
  });

  it("snapshots mutable caller history before context preparation and fallback", async () => {
    const currentRoom = JSON.parse(JSON.stringify(room())) as Room;
    const seen: string[] = [];
    const transport = new RoutedChatTransport(plan(), new Map([
      ["primary", adapter("primary", async function* () { throw new Error("retry"); })],
      ["fallback", adapter("fallback", async function* () { yield { delta: "done" }; })],
    ]), "Seven", undefined, Date.now, {
      async prepare(input) {
        expect(Object.isFrozen(input.room)).toBe(true);
        expect(Object.isFrozen(input.room.messages)).toBe(true);
        seen.push(input.room.messages.at(-1)!.content);
        (currentRoom.messages.at(-1) as { content: string }).content = "changed outside transport";
        return source.prepare(input);
      },
    });
    await expect(collect(transport, currentRoom, new AbortController().signal)).resolves.toBe("done");
    expect(seen).toEqual(["Remember my question", "Remember my question"]);
  });

  it("rejects a context source that injects a second system message before provider dispatch", async () => {
    let called = false;
    const transport = new RoutedChatTransport(plan(), new Map([
      ["primary", adapter("primary", async function* () { called = true; yield { delta: "bad" }; })],
    ]), "Seven", undefined, Date.now, {
      async prepare(input) {
        const result = await source.prepare(input);
        return { ...result, messages: [...result.messages, { role: "system", content: "extra" }] };
      },
    });
    await expect(collect(transport, room(), new AbortController().signal)).rejects.toMatchObject({ code: "VALIDATION" });
    expect(called).toBe(false);
  });

  it("skips a model whose window cannot fit the user turn without penalizing its provider", async () => {
    let primaryCalled = false;
    const health = new ProviderHealthTracker();
    const route = plan();
    const transport = new RoutedChatTransport({ ...route, candidates: [
      { ...route.candidates[0]!, contextWindow: 32 },
      route.candidates[1]!,
    ] }, new Map([
      ["primary", adapter("primary", async function* () { primaryCalled = true; yield { delta: "wrong" }; })],
      ["fallback", adapter("fallback", async function* () { yield { delta: "fits" }; })],
    ]), "Seven", health, Date.now, source);
    await expect(collect(transport, room(), new AbortController().signal)).resolves.toBe("fits");
    expect(primaryCalled).toBe(false);
    expect(health.snapshot(["primary"])).toEqual([{ providerId: "primary", penalty: 0, cooldownUntil: null }]);
  });

  it("rejects invalid prepared input budgets before provider dispatch", async () => {
    let called = false;
    const transport = new RoutedChatTransport(plan(), new Map([
      ["primary", adapter("primary", async function* () { called = true; yield { delta: "wrong" }; })],
    ]), "Seven", undefined, Date.now, {
      async prepare(input) {
        const result = await source.prepare(input);
        return { ...result, maxInputTokens: input.contextWindow + 1 };
      },
    });
    await expect(collect(transport, room(), new AbortController().signal)).rejects.toMatchObject({ code: "VALIDATION" });
    expect(called).toBe(false);
  });
});

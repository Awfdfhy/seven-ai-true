import { describe, expect, it } from "vitest";
import { createRoom } from "../../domain/chat";
import type { ModelDescriptor, ProviderAdapter } from "../../providers/contracts";
import { ModelRegistry, ModelRouter, ProviderHealthTracker } from "../../routing/model-router";
import { RoutingChatTransport, type RoutingTraceEvent } from "./routed-chat-transport";

function model(providerId: string, id: string, quality: number, speed: number): ModelDescriptor {
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

function provider(id: string, models: readonly ModelDescriptor[], output: string | Error): ProviderAdapter {
  return {
    id,
    async listModels() { return models; },
    async *stream() {
      if (output instanceof Error) throw output;
      yield Object.freeze({ delta: output });
    },
  };
}

async function collect(transport: RoutingChatTransport): Promise<string> {
  let text = "";
  for await (const chunk of transport.stream({
    room: createRoom({ id: "room", modelId: null, now: 1 }),
    signal: new AbortController().signal,
    taskId: "task-route",
  })) text += chunk;
  return text;
}

describe("production routing chat transport", () => {
  it("uses mode scoring and falls back before output", async () => {
    const fastModel = model("fast", "fast", 60, 100);
    const deepModel = model("deep", "deep", 100, 50);
    const fast = provider("fast", [fastModel], new Error("upstream"));
    const deep = provider("deep", [deepModel], "answer");
    const registry = new ModelRegistry();
    registry.replaceProviderModels("fast", [fastModel]);
    registry.replaceProviderModels("deep", [deepModel]);
    const events: string[] = [];
    const transport = new RoutingChatTransport(
      registry,
      new ModelRouter(),
      new ProviderHealthTracker(),
      new Map([["fast", fast], ["deep", deep]]),
      {
        mode: "quick",
        maxAttempts: 2,
        now: () => 10,
        observer: { record(event) { events.push(event.type + ":" + (event.providerId ?? "")); } },
      },
    );
    await expect(collect(transport)).resolves.toBe("answer");
    expect(events).toContain("attempt_start:fast");
    expect(events).toContain("attempt_failure:fast");
    expect(events).toContain("attempt_success:deep");
  });

  it("replans against provider cooldown state on every turn", async () => {
    const firstModel = model("first", "a", 100, 100);
    const secondModel = model("second", "b", 80, 80);
    const registry = new ModelRegistry();
    registry.replaceProviderModels("first", [firstModel]);
    registry.replaceProviderModels("second", [secondModel]);
    const health = new ProviderHealthTracker();
    health.recordFailure("first", 100, { retryAfterMs: 10_000 });
    const transport = new RoutingChatTransport(
      registry,
      new ModelRouter(),
      health,
      new Map([
        ["first", provider("first", [firstModel], "wrong")],
        ["second", provider("second", [secondModel], "healthy")],
      ]),
      { mode: "balanced", maxAttempts: 2, now: () => 101 },
    );
    await expect(collect(transport)).resolves.toBe("healthy");
  });

  it("records deterministic provider TTFT and total attempt duration", async () => {
    const descriptor = model("timed", "timed-model", 90, 90);
    const registry = new ModelRegistry();
    registry.replaceProviderModels("timed", [descriptor]);
    const events: RoutingTraceEvent[] = [];
    let now = 100;

    const transport = new RoutingChatTransport(
      registry,
      new ModelRouter(),
      new ProviderHealthTracker(),
      new Map([["timed", provider("timed", [descriptor], "answer")]]),
      {
        mode: "balanced",
        maxAttempts: 1,
        now: () => {
          now += 10;
          return now;
        },
        observer: { record(event) { events.push(event); } },
      },
    );

    await expect(collect(transport)).resolves.toBe("answer");
    const success = events.find((event) => event.type === "attempt_success");
    expect(success).toMatchObject({
      providerId: "timed",
      modelId: "timed-model",
      ttftMs: 10,
      durationMs: 20,
    });
  });

});

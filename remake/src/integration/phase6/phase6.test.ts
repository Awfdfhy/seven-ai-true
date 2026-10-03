import { describe, expect, it } from "vitest";
import { commitMessage, createRoom } from "../../domain/chat";
import type { ProviderAdapter, ProviderStreamRequest } from "../../providers/contracts";
import { MemoryContextService } from "../../application/context/memory-context-service";
import { InMemoryMemoryRepository } from "../../storage/memory-repository";
import { DeepThinkTransport } from "../../application/deep-think/deep-think-transport";

function room() {
  return commitMessage(
    createRoom({ id: "deep-room", now: 1 }),
    { id: "u1", role: "user", content: "Solve this carefully.", now: 2 },
  );
}

function provider(
  id: string,
  requests: ProviderStreamRequest[],
  output: string,
  onStream?: (signal: AbortSignal) => void,
): ProviderAdapter {
  return {
    id,
    async listModels() { return []; },
    async *stream(request, signal) {
      requests.push(request);
      onStream?.(signal);
      yield { delta: output };
    },
  };
}

function contextSource() {
  return new MemoryContextService(
    new InMemoryMemoryRepository(),
    { async summarize() { throw new Error("summary should not be needed"); } },
  );
}

describe("Phase 6 Deep Think", () => {
  it("runs two passes but exposes only the final answer", async () => {
    const plannerRequests: ProviderStreamRequest[] = [];
    const finalRequests: ProviderStreamRequest[] = [];
    const transport = new DeepThinkTransport(
      { provider: provider("planner", plannerRequests, "facts and plan"), modelId: "p", contextWindow: 8000 },
      { provider: provider("final", finalRequests, "FINAL ANSWER"), modelId: "f", contextWindow: 8000 },
      contextSource(),
      { plannerOutputTokens: 200, finalOutputTokens: 300 },
    );
    let output = "";
    for await (const delta of transport.stream({ room: room(), signal: new AbortController().signal })) {
      output += delta;
    }
    expect(output).toBe("FINAL ANSWER");
    expect(output).not.toContain("facts and plan");
    expect(plannerRequests).toHaveLength(1);
    expect(finalRequests).toHaveLength(1);
  });

  it("preserves exactly one leading system message on both passes", async () => {
    const plannerRequests: ProviderStreamRequest[] = [];
    const finalRequests: ProviderStreamRequest[] = [];
    const transport = new DeepThinkTransport(
      { provider: provider("planner", plannerRequests, "brief"), modelId: "p", contextWindow: 8000 },
      { provider: provider("final", finalRequests, "answer"), modelId: "f", contextWindow: 8000 },
      contextSource(),
    );
    for await (const _ of transport.stream({ room: room(), signal: new AbortController().signal })) { /* consume */ }
    for (const request of [...plannerRequests, ...finalRequests]) {
      expect(request.messages[0]?.role).toBe("system");
      expect(request.messages.filter((message) => message.role === "system")).toHaveLength(1);
    }
    expect(plannerRequests[0]?.messages[0]?.content).toContain("planning pass");
    expect(finalRequests[0]?.messages[0]?.content).toContain(JSON.stringify("brief"));
    expect(finalRequests[0]?.messages[0]?.content).toContain("untrusted analysis data");
  });

  it("rebuilds context for planner and final model windows independently", async () => {
    const seen: number[] = [];
    const source = {
      async prepare(input: Parameters<ReturnType<typeof contextSource>["prepare"]>[0]) {
        seen.push(input.contextWindow);
        return contextSource().prepare(input);
      },
    };
    const transport = new DeepThinkTransport(
      { provider: provider("planner", [], "brief"), modelId: "p", contextWindow: 6000 },
      { provider: provider("final", [], "answer"), modelId: "f", contextWindow: 9000 },
      source,
      { plannerOutputTokens: 200, finalOutputTokens: 400 },
    );
    for await (const _ of transport.stream({ room: room(), signal: new AbortController().signal })) { /* consume */ }
    expect(seen).toEqual([6000, 9000]);
  });

  it("cancellation after planning prevents final dispatch", async () => {
    const controller = new AbortController();
    const plannerRequests: ProviderStreamRequest[] = [];
    const finalRequests: ProviderStreamRequest[] = [];
    const planner: ProviderAdapter = {
      id: "planner",
      async listModels() { return []; },
      async *stream(request) {
        plannerRequests.push(request);
        yield { delta: "brief" };
        controller.abort();
      },
    };
    const transport = new DeepThinkTransport(
      { provider: planner, modelId: "p", contextWindow: 8000 },
      { provider: provider("final", finalRequests, "answer"), modelId: "f", contextWindow: 8000 },
      contextSource(),
    );
    const consume = async () => {
      for await (const _ of transport.stream({ room: room(), signal: controller.signal })) { /* consume */ }
    };
    await expect(consume()).rejects.toMatchObject({ name: "AbortError" });
    expect(plannerRequests).toHaveLength(1);
    expect(finalRequests).toHaveLength(0);
  });

  it("rejects oversized planning output before the final pass", async () => {
    const finalRequests: ProviderStreamRequest[] = [];
    const transport = new DeepThinkTransport(
      { provider: provider("planner", [], "x".repeat(200)), modelId: "p", contextWindow: 8000 },
      { provider: provider("final", finalRequests, "answer"), modelId: "f", contextWindow: 8000 },
      contextSource(),
      { plannerOutputTokens: 50, maxPlanCharacters: 1000 },
    );
    const consume = async () => {
      for await (const _ of transport.stream({ room: room(), signal: new AbortController().signal })) { /* consume */ }
    };
    await expect(consume()).rejects.toMatchObject({ code: "PROVIDER" });
    expect(finalRequests).toHaveLength(0);
  });
});

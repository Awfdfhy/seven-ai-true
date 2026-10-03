import { describe, expect, it } from "vitest";
import { commitMessage, createRoom } from "../src/domain/chat";
import type { ProviderAdapter } from "../src/providers/contracts";
import { MemoryContextService } from "../src/application/context/memory-context-service";
import { InMemoryMemoryRepository } from "../src/storage/memory-repository";
import { DeepThinkTransport } from "../src/application/deep-think/deep-think-transport";

function room() {
  return commitMessage(createRoom({ id: "r", now: 1 }), { id: "u1", role: "user", content: "hi", now: 2 });
}
function src() {
  return new MemoryContextService(new InMemoryMemoryRepository(), { async summarize() { throw new Error("no"); } });
}
function stalled(id: string): ProviderAdapter {
  return {
    id,
    async listModels() { return []; },
    stream() {
      const iterable: AsyncIterable<{ delta: string }> = {
        [Symbol.asyncIterator]() { return this; },
        async next() { return new Promise<IteratorResult<{ delta: string }>>(() => undefined); },
        async return() { return { done: true, value: undefined }; },
      };
      return iterable;
    },
  } as ProviderAdapter;
}
function scripted(id: string, text: string): ProviderAdapter {
  return { id, async listModels() { return []; }, async *stream() { yield { delta: text }; } };
}

describe("deep think probes", () => {
  it("abort unblocks stalled planner?", async () => {
    const controller = new AbortController();
    const t = new DeepThinkTransport(
      { provider: stalled("p"), modelId: "p", contextWindow: 8000 },
      { provider: stalled("f"), modelId: "f", contextWindow: 8000 },
      src(),
    );
    const consume = (async () => {
      for await (const _ of t.stream({ room: room(), signal: controller.signal })) { /* */ }
    })();
    setTimeout(() => controller.abort(), 30);
    const raced = await Promise.race([
      consume.then(() => "resolved", (e) => `rejected:${(e as Error).name}`),
      new Promise((r) => setTimeout(() => r("still-hanging"), 500)),
    ]);
    console.log("stalled planner abort ->", raced);
    expect(true).toBe(true);
  }, 5000);

  it("realistic planner brief", async () => {
    const brief = "Goal: explain the failure. ".repeat(48);
    const t = new DeepThinkTransport(
      { provider: scripted("p", brief), modelId: "p", contextWindow: 8000 },
      { provider: scripted("f", "FINAL"), modelId: "f", contextWindow: 8000 },
      src(),
    );
    let out = "";
    let failure: unknown = null;
    try {
      for await (const d of t.stream({ room: room(), signal: new AbortController().signal })) out += d;
    } catch (error) { failure = error; }
    console.log("planner brief chars:", brief.length, "out:", JSON.stringify(out), "failure:", failure && (failure as Error).message);
    expect(true).toBe(true);
  }, 5000);
});

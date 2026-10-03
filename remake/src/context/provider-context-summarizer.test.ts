import { expect, it } from "vitest";
import { ProviderContextSummarizer } from "./provider-context-summarizer";
import type { ProviderAdapter, ProviderStreamRequest } from "../providers/contracts";
import { ConservativeTokenEstimator } from "./token-estimator";

const message = { id: "u1", role: "user" as const, content: "Remember this", createdAt: 1 };
it("passes the summary output limit and rejects cancellation on provider completion", async () => {
  const controller = new AbortController();
  const provider: ProviderAdapter = {
    id: "summary", async listModels() { return []; },
    async *stream(request) {
      expect(request.maxOutputTokens).toBe(100);
      yield { delta: "Summary" };
      controller.abort();
    },
  };
  await expect(new ProviderContextSummarizer(provider, "model").summarize({
    roomId: "room", messages: [message], previousSummary: null,
    targetTokens: 100, signal: controller.signal,
  })).rejects.toMatchObject({ name: "AbortError" });
});

it("rejects malformed source records before contacting a provider", async () => {
  let calls = 0;
  const provider: ProviderAdapter = {
    id: "summary", async listModels() { return []; },
    async *stream() { calls++; yield { delta: "Summary" }; },
  };
  const source = new ProviderContextSummarizer(provider, "model");
  await expect(source.summarize({
    roomId: "room", messages: [{ ...message, role: "system" } as unknown as typeof message],
    previousSummary: null, targetTokens: 100, signal: new AbortController().signal,
  })).rejects.toMatchObject({ code: "VALIDATION" });
  expect(calls).toBe(0);
});


it("chunks oversized source context within the configured model window and carries summaries forward", async () => {
  const requests: ProviderStreamRequest[] = [];
  let call = 0;
  const provider: ProviderAdapter = {
    id: "chunked-summary",
    async listModels() { return []; },
    async *stream(request) {
      requests.push(request);
      call += 1;
      yield { delta: `S${call}` };
    },
  };
  const source = new ProviderContextSummarizer(provider, "model", {
    contextWindowTokens: 600,
    maxChunks: 32,
  });
  const output = await source.summarize({
    roomId: "room",
    messages: [{ ...message, content: "long-source ".repeat(180) }],
    previousSummary: null,
    targetTokens: 100,
    signal: new AbortController().signal,
  });
  expect(requests.length).toBeGreaterThan(1);
  expect(output).toBe(`S${requests.length}`);
  const estimator = new ConservativeTokenEstimator();
  for (const request of requests) {
    expect(estimator.estimateMessages(request.messages)).toBeLessThanOrEqual(500);
    expect(request.maxOutputTokens).toBe(100);
  }
  expect(requests[1]?.messages[1]?.content).toContain("Previous summary:\nS1");
});

it("fails closed when output reserve leaves no summarizer input window", async () => {
  let calls = 0;
  const provider: ProviderAdapter = {
    id: "summary",
    async listModels() { return []; },
    async *stream() { calls += 1; yield { delta: "unused" }; },
  };
  await expect(new ProviderContextSummarizer(provider, "model", {
    contextWindowTokens: 100,
  }).summarize({
    roomId: "room",
    messages: [message],
    previousSummary: null,
    targetTokens: 100,
    signal: new AbortController().signal,
  })).rejects.toMatchObject({ code: "VALIDATION", details: { reason: "CONTEXT_CAPACITY" } });
  expect(calls).toBe(0);
});

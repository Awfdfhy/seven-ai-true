import { expect, it } from "vitest";
import { ProviderContextSummarizer } from "./provider-context-summarizer";
import type { ProviderAdapter } from "../providers/contracts";

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

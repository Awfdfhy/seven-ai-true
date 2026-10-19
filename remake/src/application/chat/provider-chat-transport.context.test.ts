import { describe, expect, it } from "vitest";
import { commitMessage, createRoom } from "../../domain/chat";
import type { ContextBuildResult } from "../../context/context-builder";
import type { ProviderContextSource } from "../context/memory-context-service";
import type { ProviderAdapter, ProviderStreamRequest } from "../../providers/contracts";
import { ProviderChatTransport } from "./provider-chat-transport";

describe("ProviderChatTransport bounded context", () => {
  it("uses prepared bounded context instead of replaying the full room", async () => {
    const captured: { value?: ProviderStreamRequest } = {};
    const provider: ProviderAdapter = {
      id: "test",
      async listModels() { return []; },
      async *stream(request) {
        captured.value = request;
        yield { delta: "ok" };
      },
    };
    const contextSource: ProviderContextSource = {
      async prepare(input): Promise<ContextBuildResult> {
        expect(input.contextWindow).toBe(32_768);
        expect(input.policy).toMatchObject({
          reservedOutputTokens: 4096,
          summaryTokenBudget: 1200,
          memoryTokenBudget: 0,
          maxMemoryItems: 0,
        });
        return Object.freeze({
          messages: Object.freeze([
            Object.freeze({ role: "system" as const, content: "SYSTEM + MEMORY + SUMMARY" }),
            Object.freeze({ role: "user" as const, content: "latest" }),
          ]),
          estimatedInputTokens: 20,
          maxInputTokens: 28_672,
          selectedMemoryIds: Object.freeze([]),
          omittedMessages: Object.freeze([]),
          summaryUsed: true,
        });
      },
    };

    let room = createRoom({ id: "room", modelId: "model", now: 1 });
    room = commitMessage(room, { id: "old", role: "user", content: "old ".repeat(1000), now: 2 });
    room = commitMessage(room, { id: "latest", role: "user", content: "latest", now: 3 });

    const transport = new ProviderChatTransport(
      provider,
      "model",
      "SYSTEM",
      undefined,
      contextSource,
      32_768,
    );
    const output: string[] = [];
    for await (const delta of transport.stream({ room, signal: new AbortController().signal })) output.push(delta);

    expect(output).toEqual(["ok"]);
    expect(captured.value).toBeDefined();
    expect(captured.value?.messages).toHaveLength(2);
    expect(captured.value?.messages[0]?.content).toBe("SYSTEM + MEMORY + SUMMARY");
    expect(captured.value?.messages.some(message => message.content.startsWith("old "))).toBe(false);
  });
});

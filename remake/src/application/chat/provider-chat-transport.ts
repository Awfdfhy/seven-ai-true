import type { ChatStreamContext, ChatTransport } from "./chat-service";
import type { ProviderAdapter, ProviderMessage } from "../../providers/contracts";
import type { ProviderContextSource } from "../context/memory-context-service";

export interface MemoryContextSource {
  contextForRoom(
    roomId: string,
    query: string,
    signal?: AbortSignal,
    excludeMessageId?: string,
  ): Promise<string>;
}

export class ProviderChatTransport implements ChatTransport {
  constructor(
    private readonly provider: ProviderAdapter,
    private readonly modelId: string,
    private readonly systemPrompt = "You are Seven, a precise and helpful AI assistant.",
    private readonly memory?: MemoryContextSource,
    private readonly contextSource?: ProviderContextSource,
    private readonly contextWindow = 32_768,
  ) {
    if (!Number.isSafeInteger(contextWindow) || contextWindow < 8_192) {
      throw new TypeError("Chat context window must be at least 8192 tokens.");
    }
  }

  async *stream(context: ChatStreamContext): AsyncIterable<string> {
    const latestUser = [...context.room.messages].reverse().find(message => message.role === "user");
    let memoryContext = "";
    if (latestUser && this.memory) {
      try {
        memoryContext = await this.memory.contextForRoom(
          context.room.id,
          latestUser.content,
          context.signal,
          latestUser.id,
        );
      } catch (error) {
        if (context.signal.aborted) throw error;
        // Retrieval failure degrades to stateless chat; it must not break the turn.
      }
    }

    const system = memoryContext
      ? `${this.systemPrompt}\n\n${memoryContext}`
      : this.systemPrompt;
    let messages: readonly ProviderMessage[];
    if (this.contextSource) {
      const prepared = await this.contextSource.prepare({
        room: context.room,
        systemPrompt: system,
        contextWindow: this.contextWindow,
        signal: context.signal,
        policy: {
          reservedOutputTokens: 4096,
          memoryTokenBudget: 0,
          summaryTokenBudget: 1200,
          maxMemoryItems: 0,
        },
      });
      messages = prepared.messages;
    } else {
      messages = [
        { role: "system", content: system },
        ...context.room.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ];
    }
    for await (const chunk of this.provider.stream(
      {
        modelId: context.room.modelId ?? this.modelId,
        messages,
        maxOutputTokens: 4096,
      },
      context.signal,
    )) {
      if (chunk.delta) yield chunk.delta;
    }
  }
}

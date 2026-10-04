import type { ChatStreamContext, ChatTransport } from "./chat-service";
import type { ProviderAdapter, ProviderMessage } from "../../providers/contracts";

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
  ) {}

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
    const messages: ProviderMessage[] = [
      { role: "system", content: system },
      ...context.room.messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    ];
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

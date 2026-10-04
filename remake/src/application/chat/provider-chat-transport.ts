import type { ChatStreamContext, ChatTransport } from "./chat-service";
import type { ProviderAdapter, ProviderMessage } from "../../providers/contracts";

export class ProviderChatTransport implements ChatTransport {
  constructor(
    private readonly provider: ProviderAdapter,
    private readonly modelId: string,
    private readonly systemPrompt = "You are Seven, a precise and helpful AI assistant.",
  ) {}

  async *stream(context: ChatStreamContext): AsyncIterable<string> {
    const messages: ProviderMessage[] = [
      { role: "system", content: this.systemPrompt },
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

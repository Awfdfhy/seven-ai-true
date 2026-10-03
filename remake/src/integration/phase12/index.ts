import { SevenError } from "../../core/errors";
import type { Room } from "../../domain/chat";
import {
  assertValidProviderMessages,
  type ProviderAdapter,
  type ProviderMessage,
} from "../../providers/contracts";
import type { RoutePlan } from "../../routing/model-router";
import type {
  ChatStreamContext,
  ChatTransport,
} from "../../application/chat/chat-service";

export type ProviderMap = ReadonlyMap<string, ProviderAdapter>;

export class RoutedChatTransport implements ChatTransport {
  constructor(
    private readonly plan: RoutePlan,
    private readonly providers: ProviderMap,
    private readonly systemPrompt = "You are Seven, a precise and helpful AI assistant.",
  ) {}

  async *stream(context: ChatStreamContext): AsyncIterable<string> {
    const messages: ProviderMessage[] = [
      Object.freeze({ role: "system", content: this.systemPrompt }),
      ...context.room.messages.map((message) =>
        Object.freeze({
          role: message.role,
          content: message.content,
        }),
      ),
    ];
    assertValidProviderMessages(messages);

    const failures: string[] = [];

    for (const candidate of this.plan.candidates) {
      if (context.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }

      const provider = this.providers.get(candidate.providerId);
      if (!provider) {
        failures.push(`${candidate.providerId}:missing`);
        continue;
      }

      let emitted = false;
      try {
        for await (const chunk of provider.stream(
          {
            modelId: candidate.modelId,
            messages,
          },
          context.signal,
        )) {
          if (context.signal.aborted) {
            throw new DOMException("Aborted", "AbortError");
          }
          if (!chunk.delta) continue;
          emitted = true;
          yield chunk.delta;
        }
        if (emitted) return;
        failures.push(`${candidate.providerId}:empty`);
      } catch (error) {
        if (context.signal.aborted) throw error;
        if (emitted) throw error;
        failures.push(
          `${candidate.providerId}:${error instanceof Error ? error.message : "failed"}`,
        );
      }
    }

    throw new SevenError({
      code: "PROVIDER",
      message: "All planned provider routes failed before producing output.",
      retryable: true,
      details: { failures },
    });
  }
}

export function roomConversationText(room: Room): string {
  return room.messages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
}

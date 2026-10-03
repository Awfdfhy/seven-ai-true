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

const MAX_PRELUDE_CHARS = 16_384;

function failureLabel(error: unknown): string {
  if (error instanceof SevenError) return error.code;
  if (error instanceof Error) return error.name || "Error";
  return "failed";
}

export class RoutedChatTransport implements ChatTransport {
  constructor(
    private readonly plan: RoutePlan,
    private readonly providers: ProviderMap,
    private readonly systemPrompt = "You are Seven, a precise and helpful AI assistant.",
  ) {
    if (!systemPrompt.trim()) {
      throw new SevenError({
        code: "VALIDATION",
        message: "System prompt must not be empty.",
      });
    }
  }

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
      if (provider.id !== candidate.providerId) {
        failures.push(`${candidate.providerId}:provider-id-mismatch`);
        continue;
      }

      let meaningfulOutputStarted = false;
      let prelude = "";

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

          if (
            !chunk ||
            typeof chunk !== "object" ||
            typeof chunk.delta !== "string"
          ) {
            throw new SevenError({
              code: "PROVIDER",
              message: "Provider emitted an invalid streaming chunk.",
            });
          }

          if (!chunk.delta) continue;

          if (!meaningfulOutputStarted) {
            prelude += chunk.delta;
            if (prelude.length > MAX_PRELUDE_CHARS) {
              throw new SevenError({
                code: "PROVIDER",
                message: "Provider emitted excessive non-content prelude.",
              });
            }
            if (!prelude.trim()) continue;
            meaningfulOutputStarted = true;
            yield prelude;
            prelude = "";
            continue;
          }

          yield chunk.delta;
        }

        if (meaningfulOutputStarted) return;
        failures.push(`${candidate.providerId}:empty`);
      } catch (error) {
        if (context.signal.aborted) throw error;

        if (meaningfulOutputStarted) {
          if (error instanceof SevenError) throw error;
          throw new SevenError({
            code: "PROVIDER",
            message: "Provider stream failed after output began.",
            cause: error,
          });
        }

        failures.push(`${candidate.providerId}:${failureLabel(error)}`);
      }
    }

    throw new SevenError({
      code: "PROVIDER",
      message: "All planned provider routes failed before producing output.",
      retryable: true,
      details: { failures: Object.freeze([...failures]) },
    });
  }
}

export function roomConversationText(room: Room): string {
  return room.messages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
}

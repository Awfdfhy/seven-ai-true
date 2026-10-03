import { SevenError } from "../../core/errors";
import { isRoom, type Room } from "../../domain/chat";
import {
  assertValidProviderMessages,
  type ProviderAdapter,
  type ProviderMessage,
} from "../../providers/contracts";
import {
  ProviderHealthTracker,
  type RoutePlan,
} from "../../routing/model-router";
import type {
  ChatStreamContext,
  ChatTransport,
} from "../../application/chat/chat-service";

export type ProviderMap = ReadonlyMap<string, ProviderAdapter>;

const MAX_PRELUDE_CHARS = 16_384;
const MAX_PROVIDER_CHUNK_CHARS = 1_000_000;

function failureLabel(error: unknown): string {
  if (error instanceof SevenError) return error.code;
  if (error instanceof Error) return error.name || "Error";
  return "failed";
}

function retryAfterMs(error: unknown): number | undefined {
  if (!(error instanceof SevenError)) return undefined;
  const value = error.details?.retryAfterMs;
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : undefined;
}

function isCanonicalId(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value === value.trim()
  );
}

function validatePlan(plan: RoutePlan): void {
  if (!plan || typeof plan !== "object" || Array.isArray(plan)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Route plan must be an object.",
    });
  }
  if (
    plan.mode !== "quick" &&
    plan.mode !== "balanced" &&
    plan.mode !== "deep"
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Route plan mode is invalid.",
    });
  }
  if (!Number.isFinite(plan.createdAt) || plan.createdAt < 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Route plan timestamp is invalid.",
    });
  }
  if (!Array.isArray(plan.candidates) || plan.candidates.length === 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Route plan must contain at least one candidate.",
    });
  }

  const keys = new Set<string>();
  for (const candidate of plan.candidates) {
    if (!candidate || typeof candidate !== "object") {
      throw new SevenError({
        code: "VALIDATION",
        message: "Route candidate must be an object.",
      });
    }
    if (
      !isCanonicalId(candidate.providerId) ||
      !isCanonicalId(candidate.modelId) ||
      typeof candidate.score !== "number" ||
      !Number.isFinite(candidate.score)
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Route candidate is malformed.",
      });
    }
    const key = `${candidate.providerId}\u0000${candidate.modelId}`;
    if (keys.has(key)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Route plan contains duplicate candidates.",
      });
    }
    keys.add(key);
  }
}

function snapshotProviders(providers: ProviderMap): ReadonlyMap<string, ProviderAdapter> {
  if (
    !providers ||
    typeof providers !== "object" ||
    typeof (providers as { entries?: unknown }).entries !== "function"
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Provider map must expose iterable entries.",
    });
  }

  let snapshot: Map<string, ProviderAdapter>;
  try {
    snapshot = new Map(providers);
  } catch (error) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Provider map could not be materialized.",
      cause: error,
    });
  }

  for (const [key, provider] of snapshot) {
    if (!isCanonicalId(key)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider map keys must be canonical non-empty strings.",
      });
    }
    if (
      !provider ||
      typeof provider !== "object" ||
      provider.id !== key ||
      typeof provider.listModels !== "function" ||
      typeof provider.stream !== "function"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: `Provider adapter ${key} is malformed.`,
      });
    }
  }

  return snapshot;
}

function validateContext(context: ChatStreamContext): void {
  if (!context || typeof context !== "object" || Array.isArray(context)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Chat stream context must be an object.",
    });
  }
  if (!isRoom(context.room)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Chat stream room is malformed.",
    });
  }
  if (
    !context.signal ||
    typeof context.signal !== "object" ||
    typeof context.signal.aborted !== "boolean" ||
    typeof context.signal.addEventListener !== "function"
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Chat stream signal is malformed.",
    });
  }
}

export class RoutedChatTransport implements ChatTransport {
  private readonly providers: ReadonlyMap<string, ProviderAdapter>;

  constructor(
    private readonly plan: RoutePlan,
    providers: ProviderMap,
    private readonly systemPrompt = "You are Seven, a precise and helpful AI assistant.",
    private readonly health?: ProviderHealthTracker,
    private readonly now: () => number = Date.now,
  ) {
    validatePlan(plan);
    this.providers = snapshotProviders(providers);

    if (typeof systemPrompt !== "string" || !systemPrompt.trim()) {
      throw new SevenError({
        code: "VALIDATION",
        message: "System prompt must not be empty.",
      });
    }
    if (
      health !== undefined &&
      (!health ||
        typeof health !== "object" ||
        typeof health.recordSuccess !== "function" ||
        typeof health.recordFailure !== "function")
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider health tracker is malformed.",
      });
    }
    if (typeof now !== "function") {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider clock must be a function.",
      });
    }
  }

  async *stream(context: ChatStreamContext): AsyncIterable<string> {
    validateContext(context);

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

      const attemptStartedAt = this.now();
      if (!Number.isFinite(attemptStartedAt) || attemptStartedAt < 0) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Provider attempt clock returned an invalid timestamp.",
        });
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
          if (chunk.delta.length > MAX_PROVIDER_CHUNK_CHARS) {
            throw new SevenError({
              code: "PROVIDER",
              message: "Provider emitted an oversized streaming chunk.",
            });
          }

          if (!meaningfulOutputStarted) {
            if (!chunk.delta.trim()) {
              if (chunk.delta.length > MAX_PRELUDE_CHARS - prelude.length) {
                throw new SevenError({
                  code: "PROVIDER",
                  message: "Provider emitted excessive non-content prelude.",
                });
              }
              prelude += chunk.delta;
              continue;
            }

            if (prelude.length > MAX_PROVIDER_CHUNK_CHARS - chunk.delta.length) {
              throw new SevenError({
                code: "PROVIDER",
                message: "Provider emitted an oversized initial streaming chunk.",
              });
            }

            meaningfulOutputStarted = true;
            yield prelude + chunk.delta;
            prelude = "";
            continue;
          }

          yield chunk.delta;
        }

        if (meaningfulOutputStarted) {
          this.health?.recordSuccess(provider.id, attemptStartedAt);
          return;
        }

        this.health?.recordFailure(provider.id, this.now(), {
          attemptStartedAt,
        });
        failures.push(`${candidate.providerId}:empty`);
      } catch (error) {
        if (context.signal.aborted) throw error;

        const failedAt = this.now();
        if (!Number.isFinite(failedAt) || failedAt < 0) {
          throw new SevenError({
            code: "VALIDATION",
            message: "Provider health clock returned an invalid timestamp.",
          });
        }

        const retryAfter = retryAfterMs(error);
        this.health?.recordFailure(provider.id, failedAt, {
          attemptStartedAt,
          ...(retryAfter === undefined ? {} : { retryAfterMs: retryAfter }),
        });

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
  if (!isRoom(room)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Room failed schema validation before serialization.",
    });
  }
  return room.messages
    .map((message) => `${message.role}: ${message.content}`)
    .join("\n");
}

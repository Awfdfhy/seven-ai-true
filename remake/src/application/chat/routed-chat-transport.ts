import { SevenError } from "../../core/errors";
import { cloneRoom, isRoom, type Room } from "../../domain/chat";
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
} from "./chat-service";
import type { ProviderContextSource } from "../context/memory-context-service";
import type { ContextBuildResult } from "../../context/context-builder";

export type ProviderMap = ReadonlyMap<string, ProviderAdapter>;

export type RoutingTraceEvent = Readonly<{
  type: "plan" | "attempt_start" | "attempt_success" | "attempt_failure";
  taskId: string | null;
  mode: "quick" | "balanced" | "deep";
  providerId?: string;
  modelId?: string;
  reason?: string;
  candidateCount?: number;
  durationMs?: number;
  ttftMs?: number;
}>;

export interface RoutingTraceObserver {
  record(event: RoutingTraceEvent): void;
}

function emitTrace(observer: RoutingTraceObserver | undefined, event: RoutingTraceEvent): void {
  if (!observer) return;
  try { observer.record(Object.freeze({ ...event })); } catch { /* observability never owns control flow */ }
}

const MAX_PRELUDE_CHARS = 16_384;
const MAX_PROVIDER_CHUNK_CHARS = 1_000_000;

function failureLabel(error: unknown): string {
  if (error instanceof SevenError) return error.code;
  if (error instanceof Error) return "Error";
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
      typeof candidate.contextWindow !== "number" ||
      !Number.isSafeInteger(candidate.contextWindow) ||
      candidate.contextWindow <= 0 ||
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

function snapshotPlan(plan: RoutePlan): RoutePlan {
  validatePlan(plan);
  return Object.freeze({
    createdAt: plan.createdAt,
    mode: plan.mode,
    candidates: Object.freeze(
      plan.candidates.map((candidate) =>
        Object.freeze({
          providerId: candidate.providerId,
          modelId: candidate.modelId,
          contextWindow: candidate.contextWindow,
          score: candidate.score,
        }),
      ),
    ),
  });
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

  let entries: Array<readonly [string, ProviderAdapter]>;
  try {
    entries = [...providers.entries()];
  } catch {
    throw new SevenError({
      code: "VALIDATION",
      message: "Provider map could not be materialized.",
    });
  }

  const snapshot = new Map<string, ProviderAdapter>();
  for (const [key, provider] of entries) {
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

    snapshot.set(
      key,
      Object.freeze({
        id: key,
        listModels: provider.listModels.bind(provider),
        stream: provider.stream.bind(provider),
      }),
    );
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
    typeof context.signal.addEventListener !== "function" ||
    typeof context.signal.removeEventListener !== "function"
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Chat stream signal is malformed.",
    });
  }
}

function validatePreparedContext(
  value: ContextBuildResult,
  contextWindow: number,
): readonly ProviderMessage[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Prepared context must be an object.",
    });
  }
  if (!Array.isArray(value.messages)) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Prepared context messages must be an array.",
    });
  }
  if (
    !Number.isSafeInteger(value.estimatedInputTokens) ||
    value.estimatedInputTokens <= 0 ||
    !Number.isSafeInteger(value.maxInputTokens) ||
    value.maxInputTokens <= 0 ||
    value.maxInputTokens >= contextWindow ||
    value.estimatedInputTokens > value.maxInputTokens
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Prepared context token budget is invalid.",
    });
  }
  if (
    !Array.isArray(value.selectedMemoryIds) ||
    !Array.isArray(value.omittedMessages) ||
    typeof value.summaryUsed !== "boolean"
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Prepared context metadata is malformed.",
    });
  }
  const ids = new Set<string>();
  for (const id of value.selectedMemoryIds) {
    if (
      typeof id !== "string" ||
      !id.trim() ||
      id !== id.trim() ||
      ids.has(id)
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Prepared context memory ids are malformed.",
      });
    }
    ids.add(id);
  }
  assertValidProviderMessages(value.messages);
  return value.messages;
}

export class RoutedChatTransport implements ChatTransport {
  private readonly plan: RoutePlan;
  private readonly providers: ReadonlyMap<string, ProviderAdapter>;

  constructor(
    plan: RoutePlan,
    providers: ProviderMap,
    private readonly systemPrompt = "You are Seven, a precise and helpful AI assistant.",
    private readonly health?: ProviderHealthTracker,
    private readonly now: () => number = Date.now,
    private readonly contextSource?: ProviderContextSource,
    private readonly observer?: RoutingTraceObserver,
  ) {
    this.plan = snapshotPlan(plan);
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
        typeof health.beginAttempt !== "function" ||
        typeof health.recordAttemptSuccess !== "function" ||
        typeof health.recordAttemptFailure !== "function")
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
    if (
      contextSource !== undefined &&
      (!contextSource ||
        typeof contextSource !== "object" ||
        typeof contextSource.prepare !== "function")
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider context source is malformed.",
      });
    }
    if (
      observer !== undefined &&
      (!observer || typeof observer !== "object" || typeof observer.record !== "function")
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Routing trace observer is malformed.",
      });
    }
  }

  async *stream(context: ChatStreamContext): AsyncIterable<string> {
    validateContext(context);

    const room = cloneRoom(context.room);
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

      let preparedMessages: readonly ProviderMessage[];
      let maxOutputTokens: number | undefined;
      if (this.contextSource === undefined) {
        preparedMessages = [
          { role: "system", content: this.systemPrompt },
          ...room.messages.map((message) => ({
            role: message.role,
            content: message.content,
          })),
        ];
      } else {
        try {
          const prepared = await this.contextSource.prepare({
            room,
            systemPrompt: this.systemPrompt,
            contextWindow: candidate.contextWindow,
            signal: context.signal,
          });
          if (context.signal.aborted) {
            throw new DOMException("Aborted", "AbortError");
          }
          preparedMessages = validatePreparedContext(prepared, candidate.contextWindow);
          maxOutputTokens = candidate.contextWindow - prepared.maxInputTokens;
        } catch (error) {
          if (context.signal.aborted) {
            throw new DOMException("Aborted", "AbortError");
          }
          // A larger fallback may fit a turn that this model cannot. Data or
          // storage failures stay fatal rather than being hidden by retries.
          if (
            error instanceof SevenError &&
            error.code === "VALIDATION" &&
            error.details?.reason === "CONTEXT_CAPACITY"
          ) {
            failures.push(`${candidate.providerId}:CONTEXT_CAPACITY`);
            continue;
          }
          throw error;
        }
      }

      // Context work can finish after the user cancels, even when a custom
      // source does not cooperate with AbortSignal. Never dispatch that result.
      if (context.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      assertValidProviderMessages(preparedMessages);
      const messages = Object.freeze(
        preparedMessages.map((message) => Object.freeze({ ...message })),
      );

      const attemptToken = this.health?.beginAttempt(provider.id);
      const timingEnabled = this.health !== undefined || this.observer !== undefined;
      const attemptStartedAt = timingEnabled ? this.now() : null;
      if (
        attemptStartedAt !== null &&
        (!Number.isFinite(attemptStartedAt) || attemptStartedAt < 0)
      ) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Provider timing clock returned an invalid timestamp.",
        });
      }
      emitTrace(this.observer, {
        type: "attempt_start",
        taskId: context.taskId ?? null,
        mode: this.plan.mode,
        providerId: provider.id,
        modelId: candidate.modelId,
      });

      let meaningfulOutputStarted = false;
      let firstMeaningfulAt: number | null = null;
      let prelude = "";

      try {
        for await (const chunk of provider.stream(
          {
            modelId: candidate.modelId,
            messages,
            ...(maxOutputTokens !== undefined ? { maxOutputTokens } : {}),
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
            firstMeaningfulAt = timingEnabled ? this.now() : null;
            if (
              firstMeaningfulAt !== null &&
              (!Number.isFinite(firstMeaningfulAt) || firstMeaningfulAt < 0)
            ) {
              throw new SevenError({
                code: "VALIDATION",
                message: "Provider timing clock returned an invalid timestamp.",
              });
            }
            yield prelude + chunk.delta;
            prelude = "";
            continue;
          }

          yield chunk.delta;
        }

        // A provider may complete quietly on abort instead of rejecting.
        if (context.signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        if (meaningfulOutputStarted) {
          if (this.health !== undefined && attemptToken !== undefined) {
            this.health.recordAttemptSuccess(provider.id, attemptToken);
          }
          const succeededAt = timingEnabled ? this.now() : null;
          if (
            succeededAt !== null &&
            (!Number.isFinite(succeededAt) || succeededAt < 0)
          ) {
            throw new SevenError({
              code: "VALIDATION",
              message: "Provider timing clock returned an invalid timestamp.",
            });
          }
          emitTrace(this.observer, {
            type: "attempt_success",
            taskId: context.taskId ?? null,
            mode: this.plan.mode,
            providerId: provider.id,
            modelId: candidate.modelId,
            ...(succeededAt !== null && attemptStartedAt !== null
              ? { durationMs: Math.max(0, succeededAt - attemptStartedAt) }
              : {}),
            ...(firstMeaningfulAt !== null && attemptStartedAt !== null
              ? { ttftMs: Math.max(0, firstMeaningfulAt - attemptStartedAt) }
              : {}),
          });
          return;
        }

        const failedAt = timingEnabled ? this.now() : null;
        if (
          failedAt !== null &&
          (!Number.isFinite(failedAt) || failedAt < 0)
        ) {
          throw new SevenError({
            code: "VALIDATION",
            message: "Provider timing clock returned an invalid timestamp.",
          });
        }
        if (this.health !== undefined && attemptToken !== undefined) {
          if (failedAt === null) {
            throw new SevenError({
              code: "UNKNOWN",
              message: "Provider health timing was unexpectedly disabled.",
            });
          }
          this.health.recordAttemptFailure(
            provider.id,
            attemptToken,
            failedAt,
          );
        }
        failures.push(`${candidate.providerId}:empty`);
        emitTrace(this.observer, {
          type: "attempt_failure",
          taskId: context.taskId ?? null,
          mode: this.plan.mode,
          providerId: provider.id,
          modelId: candidate.modelId,
          reason: "empty",
          ...(failedAt !== null && attemptStartedAt !== null
            ? { durationMs: Math.max(0, failedAt - attemptStartedAt) }
            : {}),
        });
      } catch (error) {
        if (context.signal.aborted) throw error;

        const failedAt = timingEnabled ? this.now() : null;
        if (
          failedAt !== null &&
          (!Number.isFinite(failedAt) || failedAt < 0)
        ) {
          throw new SevenError({
            code: "VALIDATION",
            message: "Provider timing clock returned an invalid timestamp.",
          });
        }

        if (this.health !== undefined && attemptToken !== undefined) {
          if (failedAt === null) {
            throw new SevenError({
              code: "UNKNOWN",
              message: "Provider health timing was unexpectedly disabled.",
            });
          }
          const retryAfter = retryAfterMs(error);
          this.health.recordAttemptFailure(
            provider.id,
            attemptToken,
            failedAt,
            retryAfter === undefined ? {} : { retryAfterMs: retryAfter },
          );
        }

        if (meaningfulOutputStarted) {
          if (error instanceof SevenError) throw error;
          throw new SevenError({
            code: "PROVIDER",
            message: "Provider stream failed after output began.",
          });
        }

        const reason = failureLabel(error);
        failures.push(`${candidate.providerId}:${reason}`);
        emitTrace(this.observer, {
          type: "attempt_failure",
          taskId: context.taskId ?? null,
          mode: this.plan.mode,
          providerId: provider.id,
          modelId: candidate.modelId,
          reason,
          ...(failedAt !== null && attemptStartedAt !== null
            ? { durationMs: Math.max(0, failedAt - attemptStartedAt) }
            : {}),
        });
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


export type RoutingModeSource =
  | "quick"
  | "balanced"
  | "deep"
  | ((room: Room) => "quick" | "balanced" | "deep");

export type RoutingChatTransportOptions = Readonly<{
  systemPrompt?: string;
  mode?: RoutingModeSource;
  maxAttempts?: number;
  now?: () => number;
  contextSource?: ProviderContextSource;
  observer?: RoutingTraceObserver;
}>;

export class RoutingChatTransport implements ChatTransport {
  private readonly providers: ReadonlyMap<string, ProviderAdapter>;
  private readonly systemPrompt: string;
  private readonly mode: RoutingModeSource;
  private readonly maxAttempts: number;
  private readonly now: () => number;
  private readonly contextSource: ProviderContextSource | undefined;
  private readonly observer: RoutingTraceObserver | undefined;

  constructor(
    private readonly registry: import("../../routing/model-router").ModelRegistry,
    private readonly router: import("../../routing/model-router").ModelRouter,
    private readonly health: ProviderHealthTracker,
    providers: ProviderMap,
    options: RoutingChatTransportOptions = {},
  ) {
    if (!registry || typeof registry !== "object" || typeof registry.list !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "Routing transport requires a model registry." });
    }
    if (!router || typeof router !== "object" || typeof router.plan !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "Routing transport requires a model router." });
    }
    if (!health || typeof health !== "object" || typeof health.snapshot !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "Routing transport requires provider health." });
    }
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new SevenError({ code: "VALIDATION", message: "Routing transport options must be an object." });
    }
    this.providers = snapshotProviders(providers);
    this.systemPrompt = options.systemPrompt ?? "You are Seven, a precise and helpful AI assistant.";
    if (typeof this.systemPrompt !== "string" || !this.systemPrompt.trim()) {
      throw new SevenError({ code: "VALIDATION", message: "Routing system prompt must not be empty." });
    }
    this.mode = options.mode ?? "balanced";
    if (
      typeof this.mode !== "function" &&
      this.mode !== "quick" &&
      this.mode !== "balanced" &&
      this.mode !== "deep"
    ) {
      throw new SevenError({ code: "VALIDATION", message: "Routing mode source is invalid." });
    }
    this.maxAttempts = options.maxAttempts ?? 3;
    if (!Number.isSafeInteger(this.maxAttempts) || this.maxAttempts <= 0 || this.maxAttempts > 16) {
      throw new SevenError({ code: "VALIDATION", message: "Routing maxAttempts must be 1-16." });
    }
    this.now = options.now ?? Date.now;
    if (typeof this.now !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "Routing clock must be a function." });
    }
    this.contextSource = options.contextSource;
    this.observer = options.observer;
  }

  async *stream(context: ChatStreamContext): AsyncIterable<string> {
    validateContext(context);
    const room = cloneRoom(context.room);
    const now = this.now();
    if (!Number.isFinite(now) || now < 0) {
      throw new SevenError({ code: "VALIDATION", message: "Routing clock returned an invalid timestamp." });
    }
    const mode = typeof this.mode === "function" ? this.mode(room) : this.mode;
    if (mode !== "quick" && mode !== "balanced" && mode !== "deep") {
      throw new SevenError({ code: "VALIDATION", message: "Routing mode resolver returned an invalid mode." });
    }
    const providerIds = Object.freeze([...this.providers.keys()]);
    const plan = this.router.plan(
      this.registry.list(),
      this.health.snapshot(providerIds),
      {
        mode,
        preferredModelId: room.modelId,
        requireStreaming: true,
        now,
        maxAttempts: this.maxAttempts,
      },
    );
    emitTrace(this.observer, {
      type: "plan",
      taskId: context.taskId ?? null,
      mode,
      candidateCount: plan.candidates.length,
    });

    const routed = new RoutedChatTransport(
      plan,
      this.providers,
      this.systemPrompt,
      this.health,
      this.now,
      this.contextSource,
      this.observer,
    );
    for await (const chunk of routed.stream({ ...context, room })) yield chunk;
  }
}

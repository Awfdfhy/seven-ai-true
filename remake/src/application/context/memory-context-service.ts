import { SevenError } from "../../core/errors";
import { isRoom, type ChatMessage, type Room } from "../../domain/chat";
import {
  createContextSummary,
  type ContextSummary,
} from "../../domain/memory";
import type { MemoryRepository } from "../../storage/memory-repository";
import {
  ContextBuilder,
  type ContextBuildResult,
  type ContextPolicy,
} from "../../context/context-builder";

export type ContextPrepareInput = Readonly<{
  room: Room;
  systemPrompt: string;
  contextWindow: number;
  signal: AbortSignal;
  policy?: Partial<ContextPolicy>;
}>;

export type SummarizeContextInput = Readonly<{
  roomId: string;
  previousSummary: string | null;
  messages: readonly ChatMessage[];
  targetTokens: number;
  signal: AbortSignal;
}>;

export interface ContextSummarizer {
  summarize(input: SummarizeContextInput): Promise<string>;
}

export interface ProviderContextSource {
  prepare(input: ContextPrepareInput): Promise<ContextBuildResult>;
}

export type MemoryContextServiceOptions = Readonly<{
  maxSummaryPasses?: number;
  now?: () => number;
}>;

function validateSignal(signal: AbortSignal): void {
  if (
    !signal ||
    typeof signal !== "object" ||
    typeof signal.aborted !== "boolean" ||
    typeof signal.addEventListener !== "function" ||
    typeof signal.removeEventListener !== "function"
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Context AbortSignal is malformed.",
    });
  }
}

function throwIfAborted(signal: AbortSignal): void {
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
}

function targetSummaryTokens(policy?: Partial<ContextPolicy>): number {
  const value = policy?.summaryTokenBudget ?? 1024;
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: "summaryTokenBudget must be a positive safe integer for summarization.",
    });
  }
  return value;
}

export class MemoryContextService implements ProviderContextSource {
  private readonly maxSummaryPasses: number;
  private readonly now: () => number;

  constructor(
    private readonly repository: MemoryRepository,
    private readonly summarizer: ContextSummarizer,
    private readonly builder = new ContextBuilder(),
    options: MemoryContextServiceOptions = {},
  ) {
    if (
      !repository ||
      typeof repository !== "object" ||
      typeof repository.listForRoom !== "function" ||
      typeof repository.getSummary !== "function" ||
      typeof repository.putSummary !== "function"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "MemoryContextService requires a MemoryRepository.",
      });
    }
    if (
      !summarizer ||
      typeof summarizer !== "object" ||
      typeof summarizer.summarize !== "function"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "MemoryContextService requires a ContextSummarizer.",
      });
    }
    if (
      !builder ||
      typeof builder !== "object" ||
      typeof builder.build !== "function"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "MemoryContextService requires a ContextBuilder.",
      });
    }
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "MemoryContextService options must be an object.",
      });
    }

    const passes = options.maxSummaryPasses ?? 8;
    if (!Number.isSafeInteger(passes) || passes <= 0 || passes > 64) {
      throw new SevenError({
        code: "VALIDATION",
        message: "maxSummaryPasses must be an integer from 1 through 64.",
      });
    }
    const now = options.now ?? Date.now;
    if (typeof now !== "function") {
      throw new SevenError({
        code: "VALIDATION",
        message: "MemoryContextService clock must be a function.",
      });
    }

    this.maxSummaryPasses = passes;
    this.now = now;
  }

  async prepare(input: ContextPrepareInput): Promise<ContextBuildResult> {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context prepare input must be an object.",
      });
    }
    if (!isRoom(input.room)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context prepare room is invalid.",
      });
    }
    validateSignal(input.signal);
    throwIfAborted(input.signal);

    const [memories, initialSummary] = await Promise.all([
      this.repository.listForRoom(input.room.id, input.signal),
      this.repository.getSummary(input.room.id, input.signal),
    ]);
    throwIfAborted(input.signal);

    let summary: ContextSummary | null = initialSummary;
    let result = this.builder.build({
      room: input.room,
      systemPrompt: input.systemPrompt,
      contextWindow: input.contextWindow,
      memories,
      summary,
      ...(input.policy !== undefined ? { policy: input.policy } : {}),
    });

    const targetTokens = targetSummaryTokens(input.policy);
    let pass = 0;

    while (result.omittedMessages.length > 0) {
      if (pass >= this.maxSummaryPasses) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Context summarization exceeded the bounded pass limit.",
        });
      }
      throwIfAborted(input.signal);

      const omitted = result.omittedMessages;
      const lastOmitted = omitted.at(-1);
      if (!lastOmitted) break;

      const previousThrough = summary?.throughMessageId ?? null;
      const summaryText = await this.summarizer.summarize({
        roomId: input.room.id,
        previousSummary: summary?.content ?? null,
        messages: omitted,
        targetTokens,
        signal: input.signal,
      });
      throwIfAborted(input.signal);

      if (typeof summaryText !== "string" || !summaryText.trim()) {
        throw new SevenError({
          code: "PROVIDER",
          message: "Context summarizer returned an empty summary.",
        });
      }

      const now = this.now();
      if (!Number.isFinite(now) || now < 0) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Context clock returned an invalid timestamp.",
        });
      }

      const nextSummary = createContextSummary({
        roomId: input.room.id,
        content: summaryText,
        throughMessageId: lastOmitted.id,
        ...(summary !== null ? { createdAt: summary.createdAt } : {}),
        now,
      });

      await this.repository.putSummary(nextSummary, input.signal);
      throwIfAborted(input.signal);
      summary = nextSummary;

      const next = this.builder.build({
        room: input.room,
        systemPrompt: input.systemPrompt,
        contextWindow: input.contextWindow,
        memories,
        summary,
        ...(input.policy !== undefined ? { policy: input.policy } : {}),
      });

      if (
        next.omittedMessages.length >= result.omittedMessages.length &&
        (!next.summaryUsed || previousThrough === nextSummary.throughMessageId)
      ) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Context summarization made no forward progress.",
        });
      }

      result = next;
      pass += 1;
    }

    return result;
  }
}

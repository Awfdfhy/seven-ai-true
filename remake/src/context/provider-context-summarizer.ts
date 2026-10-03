import { SevenError } from "../core/errors";
import type { ChatMessage } from "../domain/chat";
import { MEMORY_LIMITS } from "../domain/memory";
import {
  assertValidProviderMessages,
  type ProviderAdapter,
  type ProviderMessage,
} from "../providers/contracts";
import type {
  ContextSummarizer,
  SummarizeContextInput,
} from "../application/context/memory-context-service";
import { ConservativeTokenEstimator } from "./token-estimator";

const MAX_SUMMARY_STREAM_CHARS = 200_000;
const SYSTEM_PROMPT =
  "Compress earlier conversation into a factual continuation summary. Preserve user preferences, decisions, constraints, named entities, unresolved tasks, and important results. Do not invent facts or add instructions. Output only the compact summary.";

export type ProviderContextSummarizerOptions = Readonly<{
  contextWindowTokens?: number;
  maxChunks?: number;
}>;

function canonicalId(value: unknown, field: string): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim()
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must be a canonical non-empty string.`,
    });
  }
  return value;
}

function transcript(messages: readonly ChatMessage[]): string {
  return messages
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");
}

function splitPoint(value: string, requested: number): number {
  let end = Math.max(0, Math.min(value.length, requested));
  if (
    end > 0 &&
    end < value.length &&
    value.charCodeAt(end - 1) >= 0xd800 &&
    value.charCodeAt(end - 1) <= 0xdbff
  ) {
    end -= 1;
  }
  return end;
}

export class ProviderContextSummarizer implements ContextSummarizer {
  private readonly providerId: string;
  private readonly stream: ProviderAdapter["stream"];
  private readonly modelId: string;
  private readonly contextWindowTokens: number;
  private readonly maxChunks: number;
  private readonly estimator = new ConservativeTokenEstimator();

  constructor(
    provider: ProviderAdapter,
    modelId: string,
    options: ProviderContextSummarizerOptions = {},
  ) {
    if (
      !provider ||
      typeof provider !== "object" ||
      typeof provider.id !== "string" ||
      typeof provider.stream !== "function"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "ProviderContextSummarizer requires a ProviderAdapter.",
      });
    }
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "ProviderContextSummarizer options must be an object.",
      });
    }
    const contextWindowTokens = options.contextWindowTokens ?? 8192;
    const maxChunks = options.maxChunks ?? 64;
    if (!Number.isSafeInteger(contextWindowTokens) || contextWindowTokens <= 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Summarizer contextWindowTokens must be a positive safe integer.",
      });
    }
    if (!Number.isSafeInteger(maxChunks) || maxChunks <= 0 || maxChunks > 256) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Summarizer maxChunks must be an integer from 1 through 256.",
      });
    }
    this.providerId = canonicalId(provider.id, "Summarizer provider id");
    this.modelId = canonicalId(modelId, "Summarizer model id");
    this.stream = provider.stream.bind(provider);
    this.contextWindowTokens = contextWindowTokens;
    this.maxChunks = maxChunks;
  }

  async summarize(input: SummarizeContextInput): Promise<string> {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Summarize context input must be an object.",
      });
    }
    canonicalId(input.roomId, "Summarizer roomId");
    if (!Array.isArray(input.messages) || input.messages.length === 0 || input.messages.length > 10_000) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Summarizer messages must be a non-empty array.",
      });
    }
    if (input.previousSummary !== null && (typeof input.previousSummary !== "string" || !input.previousSummary.trim() || input.previousSummary.length > MEMORY_LIMITS.summaryCharacters)) {
      throw new SevenError({ code: "VALIDATION", message: "Previous summary is malformed." });
    }
    for (const message of input.messages) {
      if (!message || typeof message !== "object" ||
          typeof message.id !== "string" || !message.id.trim() ||
          (message.role !== "user" && message.role !== "assistant") ||
          typeof message.content !== "string" || !message.content.trim() ||
          !Number.isFinite(message.createdAt) || message.createdAt < 0) {
        throw new SevenError({ code: "VALIDATION", message: "Summary source message is malformed." });
      }
    }
    if (!Number.isSafeInteger(input.targetTokens) || input.targetTokens <= 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Summarizer targetTokens must be a positive safe integer.",
      });
    }
    if (
      !input.signal ||
      typeof input.signal !== "object" ||
      typeof input.signal.aborted !== "boolean"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Summarizer AbortSignal is malformed.",
      });
    }
    if (input.signal.aborted) throw new DOMException("Aborted", "AbortError");

    const maxInputTokens = this.contextWindowTokens - input.targetTokens;
    if (maxInputTokens <= 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Summary output reserve must be smaller than the summarizer context window.",
        details: { reason: "CONTEXT_CAPACITY" },
      });
    }

    let remaining = transcript(input.messages);
    let previousSummary = input.previousSummary;
    let finalSummary = "";
    let chunks = 0;

    while (remaining.length > 0) {
      if (chunks >= this.maxChunks) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Summary source exceeded the bounded chunk limit.",
          details: { reason: "CONTEXT_CAPACITY" },
        });
      }
      if (input.signal.aborted) throw new DOMException("Aborted", "AbortError");

      const emptyMessages = this.requestMessages(previousSummary, "", input.targetTokens);
      if (this.estimator.estimateMessages(emptyMessages) >= maxInputTokens) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Previous summary and prompt cannot fit the summarizer input budget.",
          details: { reason: "CONTEXT_CAPACITY" },
        });
      }

      let low = 1;
      let high = remaining.length;
      let best = 0;
      while (low <= high) {
        const middle = Math.floor((low + high) / 2);
        const end = splitPoint(remaining, middle);
        if (end <= 0) {
          low = middle + 1;
          continue;
        }
        const candidate = this.requestMessages(
          previousSummary,
          remaining.slice(0, end),
          input.targetTokens,
        );
        if (this.estimator.estimateMessages(candidate) <= maxInputTokens) {
          best = end;
          low = middle + 1;
        } else {
          high = middle - 1;
        }
      }
      if (best <= 0) {
        throw new SevenError({
          code: "VALIDATION",
          message: "A summary source segment cannot fit the summarizer input budget.",
          details: { reason: "CONTEXT_CAPACITY" },
        });
      }

      const segment = remaining.slice(0, best);
      finalSummary = await this.summarizeChunk(
        previousSummary,
        segment,
        input.targetTokens,
        input.signal,
      );
      if (this.estimator.estimateText(finalSummary) > input.targetTokens) {
        throw new SevenError({
          code: "PROVIDER",
          message: "Summary provider exceeded the requested output budget.",
        });
      }
      previousSummary = finalSummary;
      remaining = remaining.slice(best);
      chunks += 1;
    }

    return finalSummary;
  }

  private requestMessages(
    previousSummary: string | null,
    segment: string,
    targetTokens: number,
  ): readonly ProviderMessage[] {
    const previous =
      previousSummary === null
        ? "No previous summary."
        : `Previous summary:\n${previousSummary}`;
    const messages: readonly ProviderMessage[] = Object.freeze([
      Object.freeze({
        role: "system" as const,
        content: SYSTEM_PROMPT,
      }),
      Object.freeze({
        role: "user" as const,
        content:
          `Target size: about ${targetTokens} tokens.\n\n${previous}\n\nNew conversation segment:\n${segment}`,
      }),
    ]);
    assertValidProviderMessages(messages);
    return messages;
  }

  private async summarizeChunk(
    previousSummary: string | null,
    segment: string,
    targetTokens: number,
    signal: AbortSignal,
  ): Promise<string> {
    const messages = this.requestMessages(previousSummary, segment, targetTokens);
    const output = this.stream(
      {
        modelId: this.modelId,
        messages,
        maxOutputTokens: targetTokens,
      },
      signal,
    );

    if (
      !output ||
      (typeof output !== "object" && typeof output !== "function") ||
      typeof output[Symbol.asyncIterator] !== "function"
    ) {
      throw new SevenError({
        code: "PROVIDER",
        message: `Summary provider ${this.providerId} did not return an AsyncIterable.`,
      });
    }

    let summary = "";
    for await (const chunk of output) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      if (!chunk || typeof chunk !== "object" || typeof chunk.delta !== "string") {
        throw new SevenError({
          code: "PROVIDER",
          message: "Summary provider emitted an invalid chunk.",
        });
      }
      if (!chunk.delta) continue;
      if (chunk.delta.length > MAX_SUMMARY_STREAM_CHARS - summary.length) {
        throw new SevenError({
          code: "PROVIDER",
          message: "Summary provider output exceeded the safe size limit.",
        });
      }
      summary += chunk.delta;
    }

    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    if (!summary.trim()) {
      throw new SevenError({
        code: "PROVIDER",
        message: "Summary provider completed without summary content.",
      });
    }
    return summary.trim();
  }
}

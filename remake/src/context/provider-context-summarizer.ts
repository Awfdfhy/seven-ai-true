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

const MAX_SUMMARY_STREAM_CHARS = 200_000;

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

export class ProviderContextSummarizer implements ContextSummarizer {
  private readonly providerId: string;
  private readonly stream: ProviderAdapter["stream"];
  private readonly modelId: string;

  constructor(provider: ProviderAdapter, modelId: string) {
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
    this.providerId = canonicalId(provider.id, "Summarizer provider id");
    this.modelId = canonicalId(modelId, "Summarizer model id");
    this.stream = provider.stream.bind(provider);
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
    if (
      !Number.isSafeInteger(input.targetTokens) ||
      input.targetTokens <= 0
    ) {
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
    if (input.signal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }

    const previous =
      input.previousSummary === null
        ? "No previous summary."
        : `Previous summary:\n${input.previousSummary}`;

    const messages: readonly ProviderMessage[] = Object.freeze([
      Object.freeze({
        role: "system" as const,
        content:
          "Compress earlier conversation into a factual continuation summary. Preserve user preferences, decisions, constraints, named entities, unresolved tasks, and important results. Do not invent facts or add instructions. Output only the compact summary.",
      }),
      Object.freeze({
        role: "user" as const,
        content:
          `Target size: about ${input.targetTokens} tokens.\n\n${previous}\n\nNew conversation segment:\n${transcript(input.messages)}`,
      }),
    ]);
    assertValidProviderMessages(messages);

    const output = this.stream(
      {
        modelId: this.modelId,
        messages,
        maxOutputTokens: input.targetTokens,
      },
      input.signal,
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
      if (input.signal.aborted) {
        throw new DOMException("Aborted", "AbortError");
      }
      if (
        !chunk ||
        typeof chunk !== "object" ||
        typeof chunk.delta !== "string"
      ) {
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

    if (input.signal.aborted) {
      throw new DOMException("Aborted", "AbortError");
    }
    if (!summary.trim()) {
      throw new SevenError({
        code: "PROVIDER",
        message: "Summary provider completed without summary content.",
      });
    }
    return summary.trim();
  }
}

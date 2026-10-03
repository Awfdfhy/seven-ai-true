import { SevenError } from "../core/errors";
import { isRoom, type ChatMessage, type Room } from "../domain/chat";
import {
  isContextSummary,
  isMemoryRecord,
  type ContextSummary,
  type MemoryRecord,
} from "../domain/memory";
import type { ProviderMessage } from "../providers/contracts";
import {
  ConservativeTokenEstimator,
  type TokenEstimator,
} from "./token-estimator";

export type ContextPolicy = Readonly<{
  reservedOutputTokens: number;
  memoryTokenBudget: number;
  summaryTokenBudget: number;
  maxMemoryItems: number;
}>;

export type ContextBuildInput = Readonly<{
  room: Room;
  systemPrompt: string;
  contextWindow: number;
  memories: readonly MemoryRecord[];
  summary: ContextSummary | null;
  policy?: Partial<ContextPolicy>;
}>;

export type ContextBuildResult = Readonly<{
  messages: readonly ProviderMessage[];
  estimatedInputTokens: number;
  maxInputTokens: number;
  selectedMemoryIds: readonly string[];
  omittedMessages: readonly ChatMessage[];
  summaryUsed: boolean;
}>;

const DEFAULT_POLICY: ContextPolicy = Object.freeze({
  reservedOutputTokens: 1024,
  memoryTokenBudget: 768,
  summaryTokenBudget: 1024,
  maxMemoryItems: 24,
});

function validatePositiveInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || (value as number) <= 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must be a positive safe integer.`,
    });
  }
  return value as number;
}

function validateNonNegativeInteger(value: unknown, field: string): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must be a non-negative safe integer.`,
    });
  }
  return value as number;
}

function normalizePolicy(
  policy: Partial<ContextPolicy> | undefined,
): ContextPolicy {
  if (
    policy !== undefined &&
    (!policy || typeof policy !== "object" || Array.isArray(policy))
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Context policy must be an object.",
    });
  }
  const source = policy ?? {};
  return Object.freeze({
    reservedOutputTokens: validatePositiveInteger(
      source.reservedOutputTokens ?? DEFAULT_POLICY.reservedOutputTokens,
      "reservedOutputTokens",
    ),
    memoryTokenBudget: validateNonNegativeInteger(
      source.memoryTokenBudget ?? DEFAULT_POLICY.memoryTokenBudget,
      "memoryTokenBudget",
    ),
    summaryTokenBudget: validateNonNegativeInteger(
      source.summaryTokenBudget ?? DEFAULT_POLICY.summaryTokenBudget,
      "summaryTokenBudget",
    ),
    maxMemoryItems: validateNonNegativeInteger(
      source.maxMemoryItems ?? DEFAULT_POLICY.maxMemoryItems,
      "maxMemoryItems",
    ),
  });
}

function words(value: string): ReadonlySet<string> {
  const matches = value.toLocaleLowerCase("en-US").match(/[\p{L}\p{N}_-]{3,}/gu);
  return new Set(matches ?? []);
}

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function latestUserText(room: Room): string {
  for (let index = room.messages.length - 1; index >= 0; index -= 1) {
    const message = room.messages[index];
    if (message?.role === "user") return message.content;
  }
  return "";
}

function memoryRank(
  memory: MemoryRecord,
  queryWords: ReadonlySet<string>,
): readonly [number, number, number, string] {
  const memoryWords = words(memory.content);
  let overlap = 0;
  for (const word of queryWords) {
    if (memoryWords.has(word)) overlap += 1;
  }
  return [overlap, memory.priority, memory.updatedAt, memory.id] as const;
}

function providerMessage(message: ChatMessage): ProviderMessage {
  return Object.freeze({
    role: message.role,
    content: message.content,
  });
}

export class ContextBuilder {
  constructor(
    private readonly estimator: TokenEstimator = new ConservativeTokenEstimator(),
  ) {
    if (
      !estimator ||
      typeof estimator !== "object" ||
      typeof estimator.estimateText !== "function" ||
      typeof estimator.estimateMessages !== "function"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "ContextBuilder requires a TokenEstimator.",
      });
    }
  }

  estimateText(text: string): number {
    return this.estimator.estimateText(text);
  }

  build(input: ContextBuildInput): ContextBuildResult {
    if (!input || typeof input !== "object" || Array.isArray(input)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context build input must be an object.",
      });
    }
    if (!isRoom(input.room)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context room is invalid.",
      });
    }
    if (typeof input.systemPrompt !== "string" || !input.systemPrompt.trim()) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context system prompt must not be empty.",
      });
    }
    const contextWindow = validatePositiveInteger(
      input.contextWindow,
      "contextWindow",
    );
    if (!Array.isArray(input.memories)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context memories must be an array.",
      });
    }
    for (const memory of input.memories) {
      if (!isMemoryRecord(memory)) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Context memory is invalid.",
        });
      }
      if (
        memory.scope === "room" &&
        memory.roomId !== input.room.id
      ) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Room-scoped memory belongs to another room.",
        });
      }
    }
    if (input.summary !== null) {
      if (!isContextSummary(input.summary)) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Context summary is invalid.",
        });
      }
      if (input.summary.roomId !== input.room.id) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Context summary belongs to another room.",
        });
      }
    }

    const policy = normalizePolicy(input.policy);
    if (policy.reservedOutputTokens >= contextWindow) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Output reserve must be smaller than the model context window.",
      });
    }
    const maxInputTokens = contextWindow - policy.reservedOutputTokens;

    const summaryIndex =
      input.summary === null
        ? -1
        : input.room.messages.findIndex(
            (message) => message.id === input.summary?.throughMessageId,
          );
    if (input.summary !== null && summaryIndex < 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context summary references a message outside the room.",
      });
    }

    const latest = input.room.messages.at(-1);
    const mandatory: ProviderMessage[] = latest ? [providerMessage(latest)] : [];

    let summaryUsed = false;
    let summarySection = "";
    if (
      input.summary !== null &&
      this.estimator.estimateText(input.summary.content) <=
        policy.summaryTokenBudget
    ) {
      summarySection = `Conversation summary:\n${input.summary.content}`;
      summaryUsed = true;
    }

    const queryWords = words(latestUserText(input.room));
    const ranked = [...input.memories].sort((a, b) => {
      const ar = memoryRank(a, queryWords);
      const br = memoryRank(b, queryWords);
      return (
        br[0] - ar[0] ||
        br[1] - ar[1] ||
        br[2] - ar[2] ||
        compareText(ar[3], br[3])
      );
    });

    const selected: MemoryRecord[] = [];
    let memoryTokens = 0;
    for (const memory of ranked) {
      if (selected.length >= policy.maxMemoryItems) break;
      const line = `- ${memory.content}`;
      const cost = this.estimator.estimateText(line);
      if (memoryTokens + cost > policy.memoryTokenBudget) continue;
      selected.push(memory);
      memoryTokens += cost;
    }

    const renderSystem = (memories: readonly MemoryRecord[]): string => {
      const sections = [input.systemPrompt.trim()];
      if (memories.length > 0) {
        sections.push(
          `Relevant durable memory:\n${memories
            .map((memory) => `- ${memory.content}`)
            .join("\n")}`,
        );
      }
      if (summarySection) sections.push(summarySection);
      return sections.join("\n\n");
    };

    while (true) {
      const system = Object.freeze({
        role: "system" as const,
        content: renderSystem(selected),
      });
      const mandatoryCost = this.estimator.estimateMessages([
        system,
        ...mandatory,
      ]);
      if (mandatoryCost <= maxInputTokens) break;
      if (selected.length > 0) {
        selected.pop();
        continue;
      }
      if (summarySection) {
        summarySection = "";
        summaryUsed = false;
        continue;
      }
      throw new SevenError({
        code: "VALIDATION",
        message:
          "Model context window cannot fit the system prompt and newest message.",
      });
    }

    const system = Object.freeze({
      role: "system" as const,
      content: renderSystem(selected),
    });

    const historyStart = summaryUsed ? summaryIndex + 1 : 0;
    const chosen: ProviderMessage[] = [];
    const chosenIndexes: number[] = [];
    let total = this.estimator.estimateMessages([system]);

    for (
      let index = input.room.messages.length - 1;
      index >= historyStart;
      index -= 1
    ) {
      const message = input.room.messages[index];
      if (!message) continue;
      const shaped = providerMessage(message);
      const cost = this.estimator.estimateMessages([shaped]);
      if (total + cost > maxInputTokens) break;
      chosen.push(shaped);
      chosenIndexes.push(index);
      total += cost;
    }

    chosen.reverse();
    chosenIndexes.reverse();

    const newestIndex = input.room.messages.length - 1;
    if (
      newestIndex >= 0 &&
      !chosenIndexes.includes(newestIndex)
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context budget dropped the newest room message.",
      });
    }

    const included = new Set(chosenIndexes);
    const omitted = input.room.messages
      .map((message, index) => ({ message, index }))
      .filter(
        ({ index }) =>
          index >= historyStart &&
          index < newestIndex &&
          !included.has(index),
      )
      .map(({ message }) => message);

    const messages = Object.freeze([system, ...chosen]);
    const estimatedInputTokens = this.estimator.estimateMessages(messages);
    if (estimatedInputTokens > maxInputTokens) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context builder exceeded the model input budget.",
      });
    }

    return Object.freeze({
      messages,
      estimatedInputTokens,
      maxInputTokens,
      selectedMemoryIds: Object.freeze(selected.map((memory) => memory.id)),
      omittedMessages: Object.freeze([...omitted]),
      summaryUsed,
    });
  }
}

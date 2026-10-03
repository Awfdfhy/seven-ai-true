import { SevenError } from "../../core/errors";
import { cloneRoom, isRoom, type ChatMessage, type Room } from "../../domain/chat";
import {
  createContextSummary,
  type ContextSummary,
} from "../../domain/memory";
import type { MemoryRepository } from "../../storage/memory-repository";
import type { ContextPolicyRepository } from "../../storage/context-policy-repository";
import {
  ContextBuilder,
  normalizeContextPolicy,
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
  policyRepository?: ContextPolicyRepository;
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

// Ports receive the same signal, but an adapter that ignores it must not keep the
// caller waiting or allow a late completion to continue the write pipeline.
function abortable<T>(operation: Promise<T>, signal: AbortSignal): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };
    const cleanup = () => signal.removeEventListener("abort", onAbort);
    signal.addEventListener("abort", onAbort, { once: true });
    operation.then(
      (value) => {
        cleanup();
        if (signal.aborted) onAbort();
        else resolve(value);
      },
      (error: unknown) => {
        cleanup();
        if (signal.aborted) onAbort();
        else reject(error);
      },
    );
    if (signal.aborted) onAbort();
  });
}

function targetSummaryTokens(policy?: Partial<ContextPolicy>): number {
  const value = policy?.summaryTokenBudget ?? 1024;
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new SevenError({
      code: "VALIDATION",
      message:
        "summaryTokenBudget must be a positive safe integer for summarization.",
    });
  }
  return value;
}

function summaryFingerprint(room: Room, throughMessageId: string): string | null {
  const end = room.messages.findIndex((message) => message.id === throughMessageId);
  if (end < 0) return null;
  let first = 0x811c9dc5;
  let second = 0x9e3779b9;
  let length = 0;
  for (let index = 0; index <= end; index += 1) {
    const message = room.messages[index];
    if (!message) continue;
    const source = `${message.id}\u0000${message.role}\u0000${message.createdAt}\u0000${message.content}\u0001`;
    length += source.length;
    for (let offset = 0; offset < source.length; offset += 1) {
      const code = source.charCodeAt(offset);
      first ^= code;
      first = Math.imul(first, 0x01000193) >>> 0;
      second = (second + code + Math.imul(second ^ code, 0x85ebca6b)) >>> 0;
    }
  }
  return `v1:${end + 1}:${length}:${first.toString(16).padStart(8, "0")}:${second.toString(16).padStart(8, "0")}`;
}

function summaryConflict(): SevenError {
  return new SevenError({
    code: "STORAGE",
    message: "Context summary changed concurrently. Retry with fresh durable state.",
    retryable: true,
  });
}

// Fail fast instead of accumulating an unbounded queue or letting two service
// instances overwrite each other's summaries on the same repository connection.
const activeRooms = new WeakMap<MemoryRepository, Set<string>>();

export class MemoryContextService implements ProviderContextSource {
  private readonly maxSummaryPasses: number;
  private readonly now: () => number;
  private readonly policyRepository: ContextPolicyRepository | null;
  private readonly roomTails = new Map<string, Promise<void>>();
  private readonly roomPending = new Map<string, number>();

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
      typeof repository.putSummary !== "function" ||
      typeof repository.compareAndSwapSummary !== "function"
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
      typeof builder.build !== "function" ||
      typeof builder.estimateText !== "function"
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

    const policyRepository = options.policyRepository ?? null;
    if (
      policyRepository !== null &&
      (!policyRepository ||
        typeof policyRepository !== "object" ||
        typeof policyRepository.get !== "function" ||
        typeof policyRepository.put !== "function" ||
        typeof policyRepository.clear !== "function")
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "MemoryContextService policyRepository is malformed.",
      });
    }

    this.maxSummaryPasses = passes;
    this.now = now;
    this.policyRepository = policyRepository;
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

    if (
      input.policy !== undefined &&
      (!input.policy || typeof input.policy !== "object" || Array.isArray(input.policy))
    ) {
      throw new SevenError({ code: "VALIDATION", message: "Context policy must be an object." });
    }

    // Capture mutable JavaScript callers before crossing any asynchronous port.
    input = Object.freeze({
      ...input,
      room: cloneRoom(input.room),
      ...(input.policy !== undefined
        ? { policy: Object.freeze({ ...input.policy }) }
        : {}),
    });
    return this.withRoomLock(input.room.id, input.signal, () => this.prepareExclusive(input));
  }

  private async prepareExclusive(input: ContextPrepareInput): Promise<ContextBuildResult> {
    let active = activeRooms.get(this.repository);
    if (!active) {
      active = new Set();
      activeRooms.set(this.repository, active);
    }
    if (active.has(input.room.id)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context preparation is already active for this room.",
        retryable: true,
      });
    }
    active.add(input.room.id);
    try {
      return await this.prepareSnapshot(input);
    } finally {
      active.delete(input.room.id);
      if (active.size === 0) activeRooms.delete(this.repository);
    }
  }

  private async prepareSnapshot(input: ContextPrepareInput): Promise<ContextBuildResult> {
    const [memories, initialSummary, persistedPolicy] = await abortable(Promise.all([
      this.repository.listForRoom(input.room.id, input.signal),
      this.repository.getSummary(input.room.id, input.signal),
      this.policyRepository === null
        ? Promise.resolve(null)
        : this.policyRepository.get(input.signal),
    ]), input.signal);
    throwIfAborted(input.signal);

    const effectivePolicy = normalizeContextPolicy({
      ...(persistedPolicy ?? {}),
      ...(input.policy ?? {}),
    });

    let summary: ContextSummary | null = initialSummary;
    if (summary !== null) {
      const fingerprint = summaryFingerprint(input.room, summary.throughMessageId);
      if (fingerprint === null || (summary.sourceFingerprint !== null && summary.sourceFingerprint !== fingerprint)) {
        const removed = await abortable(
          this.repository.compareAndSwapSummary(input.room.id, summary, null, input.signal),
          input.signal,
        );
        if (!removed) throw summaryConflict();
        summary = null;
      } else if (summary.sourceFingerprint === null) {
        const upgraded = createContextSummary({
          roomId: summary.roomId,
          content: summary.content,
          throughMessageId: summary.throughMessageId,
          sourceFingerprint: fingerprint,
          createdAt: summary.createdAt,
          now: summary.updatedAt,
        });
        const migrated = await abortable(
          this.repository.compareAndSwapSummary(input.room.id, summary, upgraded, input.signal),
          input.signal,
        );
        if (!migrated) throw summaryConflict();
        summary = upgraded;
      }
    }

    let result = this.builder.build({
      room: input.room,
      systemPrompt: input.systemPrompt,
      contextWindow: input.contextWindow,
      memories,
      summary,
      policy: effectivePolicy,
    });

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

      const targetTokens = targetSummaryTokens(effectivePolicy);
      // If the old summary did not fit this model, omittedMessages already
      // includes its original source prefix. Combining both would double count.
      const previousSummary = result.summaryUsed ? summary : null;
      const summaryText = await abortable(this.summarizer.summarize({
        roomId: input.room.id,
        previousSummary: previousSummary?.content ?? null,
        messages: omitted,
        targetTokens,
        signal: input.signal,
      }), input.signal);
      throwIfAborted(input.signal);

      if (typeof summaryText !== "string" || !summaryText.trim()) {
        throw new SevenError({
          code: "PROVIDER",
          message: "Context summarizer returned an empty summary.",
        });
      }
      if (this.builder.estimateText(summaryText) > targetTokens) {
        throw new SevenError({
          code: "PROVIDER",
          message: "Context summarizer exceeded the summary token budget.",
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
        sourceFingerprint: summaryFingerprint(input.room, lastOmitted.id),
        ...(summary !== null ? { createdAt: summary.createdAt } : {}),
        now: Math.max(now, summary?.updatedAt ?? 0),
      });

      // Validate the candidate before changing durable truth. A provider may
      // ignore targetTokens or produce a summary too large for this model.
      const next = this.builder.build({
        room: input.room,
        systemPrompt: input.systemPrompt,
        contextWindow: input.contextWindow,
        memories,
        summary: nextSummary,
        policy: effectivePolicy,
      });

      if (!next.summaryUsed) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Context summarization made no forward progress.",
        });
      }

      throwIfAborted(input.signal);
      const written = await abortable(
        this.repository.compareAndSwapSummary(
          input.room.id,
          summary,
          nextSummary,
          input.signal,
        ),
        input.signal,
      );
      if (!written) throw summaryConflict();
      throwIfAborted(input.signal);
      summary = nextSummary;
      result = next;
      pass += 1;
    }

    return result;
  }

  private async withRoomLock<T>(
    roomId: string,
    signal: AbortSignal,
    operation: () => Promise<T>,
  ): Promise<T> {
    throwIfAborted(signal);
    const pending = this.roomPending.get(roomId) ?? 0;
    if (pending >= 64 || (pending === 0 && this.roomPending.size >= 1024)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Context preparation queue capacity was reached.",
        retryable: true,
      });
    }
    this.roomPending.set(roomId, pending + 1);
    const previous = this.roomTails.get(roomId) ?? Promise.resolve();
    const safePrevious = previous.catch(() => undefined);

    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const tail = safePrevious.then(() => gate);
    this.roomTails.set(roomId, tail);
    // A canceled waiter may finish before its predecessor. Keep its tail until
    // the chain really drains, or another caller could skip the active writer.
    void tail.then(() => {
      if (this.roomTails.get(roomId) === tail) this.roomTails.delete(roomId);
      const remaining = (this.roomPending.get(roomId) ?? 1) - 1;
      if (remaining === 0) this.roomPending.delete(roomId);
      else this.roomPending.set(roomId, remaining);
    });

    try {
      await abortable(safePrevious, signal);
      throwIfAborted(signal);
      return await operation();
    } finally {
      release();
    }
  }

}

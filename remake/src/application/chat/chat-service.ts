import { SevenError } from "../../core/errors";
import { TaskManager, type TaskRun } from "../../core/task-manager";
import { commitMessage, type Room } from "../../domain/chat";
import type { RoomRepository } from "../../storage/room-repository";

export type ChatStreamContext = Readonly<{
  room: Room;
  signal: AbortSignal;
}>;

export interface ChatTransport {
  stream(context: ChatStreamContext): AsyncIterable<string>;
}

export type AssistantDraft = Readonly<{
  roomId: string;
  taskId: string;
  content: string;
}>;

export type ChatSendOptions = Readonly<{
  timeoutMs?: number;
  onDraft?: (draft: AssistantDraft) => void;
}>;

export type ChatRun = Readonly<{
  taskId: string;
  result: Promise<Room>;
  cancel: (reason?: string) => boolean;
}>;

const DEFAULT_CHAT_DEADLINE_MS = 60_000;
const MAX_ASSISTANT_DRAFT_CHARS = 1_000_000;

function normalizeTimeout(timeoutMs: number | undefined): number {
  const value = timeoutMs ?? DEFAULT_CHAT_DEADLINE_MS;
  if (
    !Number.isFinite(value) ||
    value <= 0 ||
    value > 2_147_483_647
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "timeoutMs must be a positive finite timer-safe number.",
    });
  }
  return value;
}

export class ChatService {
  constructor(
    private readonly tasks: TaskManager,
    private readonly rooms: RoomRepository,
  ) {}

  async send(
    roomId: string,
    content: string,
    transport: ChatTransport,
    options: ChatSendOptions = {},
  ): Promise<ChatRun> {
    if (!options || typeof options !== "object") {
      throw new SevenError({
        code: "VALIDATION",
        message: "Chat options must be an object.",
      });
    }
    if (
      !transport ||
      typeof transport !== "object" ||
      typeof transport.stream !== "function"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Chat transport must provide a stream function.",
      });
    }
    if (
      options.onDraft !== undefined &&
      typeof options.onDraft !== "function"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "onDraft must be a function when provided.",
      });
    }

    const timeoutMs = normalizeTimeout(options.timeoutMs);

    if (this.tasks.listActive(roomId).length > 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "A chat task is already active for this room.",
        details: { roomId },
      });
    }

    const run: TaskRun<Room> = this.tasks.run(
      {
        kind: "chat",
        ownerId: roomId,
        timeoutMs,
      },
      async ({ taskId, signal, sealCancellation, sealDeadline }) => {
        const current = await this.rooms.get(roomId, signal);
        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
        if (!current) {
          throw new SevenError({
            code: "VALIDATION",
            message: "Room does not exist.",
            details: { roomId },
          });
        }

        const withUser = commitMessage(current, {
          role: "user",
          content,
        });
        await this.rooms.put(withUser, signal);

        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }

        let draft = "";

        for await (const delta of transport.stream({
          room: withUser,
          signal,
        })) {
          if (signal.aborted) {
            throw new DOMException("Aborted", "AbortError");
          }
          if (typeof delta !== "string") {
            throw new SevenError({
              code: "PROVIDER",
              message: "Chat transport emitted a non-string delta.",
            });
          }
          if (!delta) continue;
          if (delta.length > MAX_ASSISTANT_DRAFT_CHARS - draft.length) {
            throw new SevenError({
              code: "PROVIDER",
              message: "Assistant response exceeded the safe draft size limit.",
            });
          }
          draft += delta;

          if (options.onDraft) {
            try {
              options.onDraft(
                Object.freeze({
                  roomId,
                  taskId,
                  content: draft,
                }),
              );
            } catch {
              // UI/observer callbacks are intentionally isolated from generation.
            }
          }
        }

        if (signal.aborted) {
          throw new DOMException("Aborted", "AbortError");
        }
        if (!draft.trim()) {
          throw new SevenError({
            code: "PROVIDER",
            message: "Provider completed without assistant content.",
            retryable: true,
          });
        }

        if (!sealCancellation()) {
          throw new DOMException("Aborted", "AbortError");
        }

        const completed = commitMessage(withUser, {
          role: "assistant",
          content: draft,
        });
        await this.rooms.put(completed, signal);
        if (!sealDeadline()) {
          throw new DOMException("Aborted", "AbortError");
        }
        return completed;
      },
    );

    return Object.freeze({
      taskId: run.taskId,
      result: run.result,
      cancel: run.cancel,
    });
  }
}

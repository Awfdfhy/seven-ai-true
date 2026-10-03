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
      async ({ taskId, signal, sealCancellation }) => {
        const current = await this.rooms.get(roomId);
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
        await this.rooms.put(withUser);

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
          if (!delta) continue;
          draft += delta;
          if (draft.length > MAX_ASSISTANT_DRAFT_CHARS) {
            throw new SevenError({
              code: "PROVIDER",
              message: "Assistant response exceeded the safe draft size limit.",
            });
          }

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
        await this.rooms.put(completed);
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

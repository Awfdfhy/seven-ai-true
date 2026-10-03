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

export class ChatService {
  private readonly startingRooms = new Set<string>();

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
    if (
      this.startingRooms.has(roomId) ||
      this.tasks.listActive(roomId).length > 0
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "A chat task is already active for this room.",
        details: { roomId },
      });
    }

    this.startingRooms.add(roomId);
    try {
      const current = await this.rooms.get(roomId);
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

      const timeoutMs = options.timeoutMs ?? DEFAULT_CHAT_DEADLINE_MS;
      const run: TaskRun<Room> = this.tasks.run(
        {
          kind: "chat",
          ownerId: roomId,
          timeoutMs,
        },
        async ({ taskId, signal }) => {
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
            options.onDraft?.(
              Object.freeze({
                roomId,
                taskId,
                content: draft,
              }),
            );
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
    } finally {
      this.startingRooms.delete(roomId);
    }
  }
}

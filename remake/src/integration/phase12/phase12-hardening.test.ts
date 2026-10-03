import { describe, expect, it } from "vitest";
import { ChatService, type ChatTransport } from "../../application/chat/chat-service";
import { TaskManager } from "../../core/task-manager";
import { cloneRoom, createRoom, type Room } from "../../domain/chat";
import type { RoomRepository } from "../../storage/room-repository";
import {
  ModelRouter,
  ProviderHealthTracker,
} from "../../routing/model-router";
import type { ModelDescriptor } from "../../providers/contracts";

class BlockingRoomRepository implements RoomRepository {
  private room: Room;
  private readonly gate: Promise<void>;
  private releaseGate: (() => void) | null = null;

  constructor(room: Room) {
    this.room = cloneRoom(room);
    this.gate = new Promise<void>((resolve) => {
      this.releaseGate = resolve;
    });
  }

  release(): void {
    this.releaseGate?.();
    this.releaseGate = null;
  }

  async get(roomId: string): Promise<Room | null> {
    await this.gate;
    return roomId === this.room.id ? cloneRoom(this.room) : null;
  }

  async put(room: Room): Promise<void> {
    this.room = cloneRoom(room);
  }

  async list(): Promise<readonly Room[]> {
    return [cloneRoom(this.room)];
  }

  async delete(roomId: string): Promise<void> {
    if (roomId === this.room.id) {
      this.room = createRoom({ id: "__deleted__", now: this.room.updatedAt });
    }
  }
}

const immediateTransport: ChatTransport = {
  async *stream() {
    yield "ok";
  },
};

function model(providerId: string, id: string): ModelDescriptor {
  return Object.freeze({
    id,
    providerId,
    displayName: id,
    contextWindow: 8_000,
    qualityScore: 80,
    speedScore: 80,
    capabilities: Object.freeze({
      streaming: true,
      tools: false,
      vision: false,
    }),
  });
}

describe("Phase 1-2 hardening", () => {
  it("reserves a room before the first async storage boundary", async () => {
    const repository = new BlockingRoomRepository(
      createRoom({ id: "race-room", now: 1 }),
    );
    const chat = new ChatService(new TaskManager(), repository);

    const firstSend = chat.send("race-room", "first", immediateTransport);

    await expect(
      chat.send("race-room", "second", immediateTransport),
    ).rejects.toMatchObject({
      code: "VALIDATION",
      message: "A chat task is already active for this room.",
    });

    repository.release();
    const firstRun = await firstSend;
    const completed = await firstRun.result;

    expect(completed.messages.map((message) => message.content)).toEqual([
      "first",
      "ok",
    ]);
  });

  it("assigns every chat task a deadline even when the caller omits one", async () => {
    const room = createRoom({ id: "deadline-room", now: 1 });
    let roomState = cloneRoom(room);
    const repository: RoomRepository = {
      async get() {
        return cloneRoom(roomState);
      },
      async put(next) {
        roomState = cloneRoom(next);
      },
      async list() {
        return [cloneRoom(roomState)];
      },
      async delete() {},
    };

    const transport: ChatTransport = {
      async *stream({ signal }) {
        await new Promise<void>((_resolve, reject) => {
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Aborted", "AbortError")),
            { once: true },
          );
        });
      },
    };

    const tasks = new TaskManager();
    const chat = new ChatService(tasks, repository);
    const run = await chat.send("deadline-room", "hello", transport);

    const snapshot = tasks.get(run.taskId);
    expect(snapshot?.deadlineAt).toBeTypeOf("number");
    expect((snapshot?.deadlineAt ?? 0) - (snapshot?.startedAt ?? 0)).toBe(
      60_000,
    );

    run.cancel();
    await expect(run.result).rejects.toMatchObject({ code: "CANCELLED" });
  });

  it("turns provider failures into penalties and cooldowns used by routing", () => {
    const health = new ProviderHealthTracker();
    health.recordFailure("provider-a", 1_000, {
      retryAfterMs: 5_000,
      penalty: 120,
    });

    expect(health.snapshot(["provider-a"])).toEqual([
      {
        providerId: "provider-a",
        penalty: 120,
        cooldownUntil: 6_000,
      },
    ]);

    const router = new ModelRouter();
    const plan = router.plan(
      [model("provider-a", "a"), model("provider-b", "b")],
      health.snapshot(["provider-a", "provider-b"]),
      {
        mode: "balanced",
        preferredModelId: null,
        requireStreaming: true,
        now: 2_000,
        maxAttempts: 2,
      },
    );

    expect(plan.candidates.map((candidate) => candidate.providerId)).toEqual([
      "provider-b",
    ]);

    health.recordSuccess("provider-a");
    expect(health.snapshot(["provider-a"])[0]).toEqual({
      providerId: "provider-a",
      penalty: 95,
      cooldownUntil: null,
    });
  });
});

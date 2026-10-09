import { describe, it } from "vitest";
import { ChatService } from "../../application/chat/chat-service";
import { TaskManager } from "../../core/task-manager";
import { createRoom } from "../../domain/chat";
import type { RoomRepository } from "../../storage/room-repository";

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

describe("probe: cancel BEFORE the assistant commit", () => {
  it("cancel during streaming discards the assistant turn", async () => {
    const room = createRoom({ id: "race-room-2", now: 1 });
    let state = room;
    const repository: RoomRepository = {
      async get() { return state; },
      async put(next) { state = next; },
      async list() { return [state]; },
      async delete() {},
    };
    const tasks = new TaskManager();
    const chat = new ChatService(tasks, repository);
    const run = await chat.send("race-room-2", "hello", {
      async *stream({ signal }) {
        await new Promise<void>((_r, reject) => {
          signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
        });
        yield "never";
      },
    });
    for (let i = 0; i < 20; i += 1) await tick();
    const accepted = run.cancel("user");
    const res = await run.result.then(
      (v) => ({ ok: true, last: v.messages.at(-1)?.content }),
      (e) => ({ err: e.code }),
    );
    console.log("BEFORE-CANCEL accepted:", accepted, "result:", JSON.stringify(res));
    console.log("BEFORE-CANCEL persisted roles:", JSON.stringify(state.messages.map((m) => m.role)));
    console.log("BEFORE-CANCEL task:", tasks.get(run.taskId)?.status);
  });
});

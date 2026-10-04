import { describe, it } from "vitest";
import { ChatService } from "../../application/chat/chat-service";
import { TaskManager } from "../../core/task-manager";
import { createRoom } from "../../domain/chat";
import type { RoomRepository } from "../../storage/room-repository";

const tick = () => new Promise<void>((r) => setTimeout(r, 0));

describe("probe: cancel AFTER the assistant commit has been persisted", () => {
  it("shows what the UI sees when cancel races the durable write", async () => {
    const room = createRoom({ id: "race-room", now: 1 });
    let state = room;
    let releaseWrite: (() => void) | undefined;
    const writeGate = new Promise<void>((r) => { releaseWrite = r; });
    let putCount = 0;
    const repository: RoomRepository = {
      async get() { return state; },
      async put(next) {
        putCount += 1;
        if (putCount === 2) { await writeGate; }
        state = next;
      },
      async list() { return [state]; },
      async delete() {},
    };
    const tasks = new TaskManager();
    const chat = new ChatService(tasks, repository);
    const run = await chat.send("race-room", "hello", { async *stream() { yield "the answer"; } });
    // Block the second (assistant) put, then hit stop from the UI.
    for (let i = 0; i < 50 && putCount < 2; i += 1) await tick();
    console.log("putCount at cancel:", putCount, "status:", tasks.get(run.taskId)?.status);
    const accepted = run.cancel("user");
    const pending = run.result.then((v) => ({ ok: true, last: v.messages.at(-1)?.content }), (e) => ({ err: e.code }));
    releaseWrite!();
    const res = await pending;
    console.log("cancelAccepted:", accepted, "result:", JSON.stringify(res));
    console.log("persisted roles:", JSON.stringify(state.messages.map((m) => m.role)));
    console.log("task snapshot:", JSON.stringify(tasks.get(run.taskId)));
  });
});

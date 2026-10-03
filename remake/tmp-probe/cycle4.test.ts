import { describe, expect, it } from "vitest";
import { AttachmentService } from "../src/application/attachments/attachment-service";
import { TaskManager } from "../src/core/task-manager";
import { InMemoryAttachmentRepository } from "../src/storage/attachment-repository";

describe("attachment double ingest same id", () => {
  it("probe", async () => {
    const tasks = new TaskManager();
    const repo = new InMemoryAttachmentRepository();
    const service = new AttachmentService(tasks, repo, { load: async () => ({ parse: async () => "t" }) } as any);
    const bytes = new TextEncoder().encode("hello");
    const first = service.ingest({ roomId: "r", id: "same", name: "a.txt", declaredMimeType: "text/plain", bytes });
    const second = service.ingest({ roomId: "r", id: "same", name: "a.txt", declaredMimeType: "text/plain", bytes });
    const settled = await Promise.allSettled([first.result, second.result]);
    console.log("outcomes:", settled.map((s) => s.status).join(","));
    console.log("records:", (await repo.list("r")).length);
    console.log("active:", tasks.listActive("r").length);
    expect(true).toBe(true);
  });
});

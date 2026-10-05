import { describe, expect, it } from "vitest";
import { createAttachmentRecord } from "../../domain/attachments";
import { InMemoryAttachmentRepository } from "../../storage/attachment-repository";
import { StoredAttachmentContextSource } from "./attachment-context-source";

describe("StoredAttachmentContextSource", () => {
  it("keeps file evidence room-scoped, relevance-ranked and bounded", async () => {
    const repository = new InMemoryAttachmentRepository();
    await repository.put("room-a", createAttachmentRecord({
      id: "a",
      name: "alpha.txt",
      mimeType: "text/plain",
      sizeBytes: 10,
      contentHash: "a".repeat(64),
      extractedText: "unrelated notes",
      now: 1,
    }));
    await repository.put("room-a", createAttachmentRecord({
      id: "b",
      name: "network.txt",
      mimeType: "text/plain",
      sizeBytes: 20,
      contentHash: "b".repeat(64),
      extractedText: "network timeout recovery procedure",
      now: 2,
    }));
    await repository.put("room-b", createAttachmentRecord({
      id: "secret",
      name: "other.txt",
      mimeType: "text/plain",
      sizeBytes: 20,
      contentHash: "c".repeat(64),
      extractedText: "must never leak",
      now: 3,
    }));
    const source = new StoredAttachmentContextSource(repository, 4096, 2);
    const context = await source.contextForRoom("room-a", "network recovery", new AbortController().signal);
    expect(context.indexOf("network.txt")).toBeLessThan(context.indexOf("alpha.txt"));
    expect(context).not.toContain("must never leak");
    expect(context.length).toBeLessThanOrEqual(4096);
  });
});

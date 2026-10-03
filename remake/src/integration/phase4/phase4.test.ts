import "fake-indexeddb/auto";
import { describe, expect, it, vi } from "vitest";
import { TaskManager } from "../../core/task-manager";
import { AttachmentService, SingleFlightPdfParserLoader } from "../../application/attachments/attachment-service";
import { IndexedDbAttachmentRepository, InMemoryAttachmentRepository } from "../../storage/attachment-repository";

function service(repository = new InMemoryAttachmentRepository(), parserText = "PDF text") {
  const parser = { parse: vi.fn(async () => parserText) };
  const factory = vi.fn(async () => parser);
  return {
    repository,
    parser,
    factory,
    service: new AttachmentService(new TaskManager(), repository, new SingleFlightPdfParserLoader(factory), () => 10),
  };
}

describe("Phase 4 attachments", () => {
  it("ingests UTF-8 text with content sniffing, hashing, persistence and immutable output", async () => {
    const setup = service();
    const bytes = new TextEncoder().encode("مرحبا Seven");
    const run = setup.service.ingest({
      roomId: "room",
      id: "txt",
      name: "notes.txt",
      declaredMimeType: "text/plain",
      bytes,
    });
    bytes.fill(0);
    const record = await run.result;
    expect(record).toMatchObject({
      id: "txt",
      mimeType: "text/plain",
      extractedText: "مرحبا Seven",
      createdAt: 10,
    });
    expect(record.contentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(Object.isFrozen(record)).toBe(true);
    expect(await setup.repository.get("room", "txt")).toEqual(record);
  });

  it("rejects MIME spoofing before PDF parser invocation", async () => {
    const setup = service();
    await expect(setup.service.ingest({
      roomId: "room",
      name: "fake.txt",
      declaredMimeType: "text/plain",
      bytes: new TextEncoder().encode("%PDF-1.7 fake"),
    }).result).rejects.toMatchObject({ code: "VALIDATION" });
    expect(setup.factory).not.toHaveBeenCalled();
  });

  it("loads the PDF parser single-flight for concurrent ingests", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const parser = { parse: vi.fn(async () => "Parsed") };
    const factory = vi.fn(async () => { await gate; return parser; });
    const repository = new InMemoryAttachmentRepository();
    const attachmentService = new AttachmentService(
      new TaskManager(),
      repository,
      new SingleFlightPdfParserLoader(factory),
      () => 1,
    );
    const pdf = new TextEncoder().encode("%PDF-1.7\nbody");
    const first = attachmentService.ingest({ roomId: "a", id: "1", name: "a.pdf", declaredMimeType: "application/pdf", bytes: pdf });
    const second = attachmentService.ingest({ roomId: "b", id: "2", name: "b.pdf", declaredMimeType: "application/pdf", bytes: pdf });
    await Promise.resolve();
    release();
    await Promise.all([first.result, second.result]);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(parser.parse).toHaveBeenCalledTimes(2);
  });

  it("cancellation prevents a late PDF parse from becoming durable", async () => {
    let release!: (value: string) => void;
    const pending = new Promise<string>((resolve) => { release = resolve; });
    const repository = new InMemoryAttachmentRepository();
    const attachmentService = new AttachmentService(
      new TaskManager(),
      repository,
      new SingleFlightPdfParserLoader(async () => ({ parse: async () => pending })),
    );
    const run = attachmentService.ingest({
      roomId: "room",
      id: "cancel",
      name: "cancel.pdf",
      declaredMimeType: "application/pdf",
      bytes: new TextEncoder().encode("%PDF-1.7\nbody"),
    });
    await Promise.resolve();
    run.cancel();
    release("late");
    await expect(run.result).rejects.toMatchObject({ code: "CANCELLED" });
    expect(await repository.get("room", "cancel")).toBeNull();
  });

  it("persists attachments across IndexedDB restart and isolates rooms", async () => {
    const name = `attachments-${crypto.randomUUID()}`;
    const first = new IndexedDbAttachmentRepository(name);
    const setup = service(first);
    const record = await setup.service.ingest({
      roomId: "room-a",
      id: "persist",
      name: "notes.txt",
      declaredMimeType: "text/plain",
      bytes: new TextEncoder().encode("persistent"),
    }).result;
    await first.close();

    const second = new IndexedDbAttachmentRepository(name);
    expect(await second.get("room-a", "persist")).toEqual(record);
    expect(await second.list("room-b")).toEqual([]);
    await second.close();
  });
});

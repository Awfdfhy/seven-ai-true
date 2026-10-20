import { describe, expect, it } from "vitest";
import { createAttachmentRecord } from "../../domain/attachments";
import { createAttachmentBundle, verifyAttachmentBundle, containsSecret } from "./attachment-bundle";
import { InMemorySafConsentAdapter, assertSafConsent } from "./saf-adapter";

describe("D23 attachment bundle", () => {
  it("creates and verifies a bundle", async () => {
    const record = createAttachmentRecord({
      name: "note.txt",
      mimeType: "text/plain",
      sizeBytes: 5,
      contentHash: "a".repeat(64),
      extractedText: "hello",
      now: 10,
    });
    const bundle = await createAttachmentBundle("room-1", [record], () => 20);
    expect(await verifyAttachmentBundle(bundle)).toBe(true);
  });

  it("detects tampering", async () => {
    const record = createAttachmentRecord({
      name: "note.txt",
      mimeType: "text/plain",
      sizeBytes: 5,
      contentHash: "a".repeat(64),
      extractedText: "hello",
      now: 10,
    });
    const bundle = await createAttachmentBundle("room-1", [record], () => 20);
    const tampered = { ...bundle, attachments: [{ ...record, name: "evil.txt" }] };
    expect(await verifyAttachmentBundle(tampered as any)).toBe(false);
  });

  it("rejects secret-like values", async () => {
    const record = createAttachmentRecord({
      name: "note.txt",
      mimeType: "text/plain",
      sizeBytes: 5,
      contentHash: "a".repeat(64),
      extractedText: "api_key=secret",
      now: 10,
    });
    await expect(createAttachmentBundle("room-1", [record])).rejects.toThrow();
    expect(containsSecret("token=abc")).toBe(true);
  });
});

describe("D10 SAF consent adapter", () => {
  it("accepts granted consent", async () => {
    const adapter = new InMemorySafConsentAdapter({ granted: true, uri: "content://tree", cancelled: false });
    const result = await adapter.requestDirectoryAccess("export");
    expect(assertSafConsent(result)).toBe("content://tree");
  });

  it("rejects cancelled consent", async () => {
    const adapter = new InMemorySafConsentAdapter({ granted: false, uri: null, cancelled: true });
    const result = await adapter.requestDirectoryAccess("export");
    expect(() => assertSafConsent(result)).toThrow();
  });
});

import { SevenError } from "../../core/errors";

export const ATTACHMENT_LIMITS = Object.freeze({
  nameCharacters: 512,
  textCharacters: 1_000_000,
  bytes: 10 * 1024 * 1024,
  recordsPerRoom: 128,
});

export type AttachmentMimeType = "text/plain" | "application/pdf";

export type AttachmentRecord = Readonly<{
  schemaVersion: 1;
  id: string;
  name: string;
  mimeType: AttachmentMimeType;
  sizeBytes: number;
  contentHash: string;
  extractedText: string;
  createdAt: number;
}>;

export type CreateAttachmentRecordOptions = Readonly<{
  id?: string;
  name: string;
  mimeType: AttachmentMimeType;
  sizeBytes: number;
  contentHash: string;
  extractedText: string;
  now?: number;
}>;

function canonical(value: unknown, field: string, max: number): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > max
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must be a canonical non-empty string.`,
    });
  }
  return value;
}

export function createAttachmentRecord(
  options: CreateAttachmentRecordOptions,
): AttachmentRecord {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    throw new SevenError({ code: "VALIDATION", message: "Attachment options must be an object." });
  }
  if (options.mimeType !== "text/plain" && options.mimeType !== "application/pdf") {
    throw new SevenError({ code: "VALIDATION", message: "Attachment MIME type is unsupported." });
  }
  if (
    !Number.isSafeInteger(options.sizeBytes) ||
    options.sizeBytes <= 0 ||
    options.sizeBytes > ATTACHMENT_LIMITS.bytes
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Attachment size is outside the safe limit." });
  }
  if (
    typeof options.contentHash !== "string" ||
    !/^[a-f0-9]{64}$/.test(options.contentHash)
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Attachment contentHash must be a SHA-256 hex digest." });
  }
  if (
    typeof options.extractedText !== "string" ||
    !options.extractedText.trim() ||
    options.extractedText.length > ATTACHMENT_LIMITS.textCharacters
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Attachment extracted text is invalid or too large." });
  }
  const now = options.now ?? Date.now();
  if (!Number.isFinite(now) || now < 0) {
    throw new SevenError({ code: "VALIDATION", message: "Attachment timestamp is invalid." });
  }

  return Object.freeze({
    schemaVersion: 1 as const,
    id: options.id === undefined ? crypto.randomUUID() : canonical(options.id, "Attachment id", 512),
    name: canonical(options.name, "Attachment name", ATTACHMENT_LIMITS.nameCharacters),
    mimeType: options.mimeType,
    sizeBytes: options.sizeBytes,
    contentHash: options.contentHash,
    extractedText: options.extractedText,
    createdAt: now,
  });
}

export function isAttachmentRecord(value: unknown): value is AttachmentRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<AttachmentRecord>;
  return (
    item.schemaVersion === 1 &&
    typeof item.id === "string" &&
    item.id.trim().length > 0 &&
    item.id === item.id.trim() &&
    typeof item.name === "string" &&
    item.name.trim().length > 0 &&
    item.name === item.name.trim() &&
    item.name.length <= ATTACHMENT_LIMITS.nameCharacters &&
    (item.mimeType === "text/plain" || item.mimeType === "application/pdf") &&
    Number.isSafeInteger(item.sizeBytes) &&
    (item.sizeBytes as number) > 0 &&
    (item.sizeBytes as number) <= ATTACHMENT_LIMITS.bytes &&
    typeof item.contentHash === "string" &&
    /^[a-f0-9]{64}$/.test(item.contentHash) &&
    typeof item.extractedText === "string" &&
    item.extractedText.trim().length > 0 &&
    item.extractedText.length <= ATTACHMENT_LIMITS.textCharacters &&
    typeof item.createdAt === "number" &&
    Number.isFinite(item.createdAt) &&
    item.createdAt >= 0
  );
}

export function cloneAttachmentRecord(record: AttachmentRecord): AttachmentRecord {
  if (!isAttachmentRecord(record)) {
    throw new SevenError({ code: "VALIDATION", message: "Attachment record is invalid." });
  }
  return Object.freeze({ ...record });
}

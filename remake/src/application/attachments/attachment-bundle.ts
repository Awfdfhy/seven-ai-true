import { SevenError } from "../../core/errors";
import { isAttachmentRecord, type AttachmentRecord } from "../../domain/attachments";

export const ATTACHMENT_BUNDLE_SCHEMA_VERSION = 1 as const;

export type AttachmentBundle = Readonly<{
  schemaVersion: typeof ATTACHMENT_BUNDLE_SCHEMA_VERSION;
  createdAt: number;
  roomId: string;
  attachments: readonly AttachmentRecord[];
  contentHash: string;
}>;

const SECRET_PATTERNS = [
  /api[_-]?key/i,
  /token/i,
  /secret/i,
  /password/i,
  /bearer\s+[a-z0-9._-]+/i,
];

export function containsSecret(value: unknown): boolean {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "");
  return SECRET_PATTERNS.some((pattern) => pattern.test(text));
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return [...new Uint8Array(digest)].map((v) => v.toString(16).padStart(2, "0")).join("");
}

function canonicalRoomId(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim()) {
    throw new SevenError({ code: "VALIDATION", message: "Bundle roomId must be canonical." });
  }
  return value;
}

export async function createAttachmentBundle(
  roomId: string,
  attachments: readonly AttachmentRecord[],
  now: () => number = Date.now,
): Promise<AttachmentBundle> {
  const id = canonicalRoomId(roomId);
  const list = [...attachments];
  if (!Array.isArray(attachments) || list.some((item) => !isAttachmentRecord(item))) {
    throw new SevenError({ code: "VALIDATION", message: "Bundle attachments must be valid records." });
  }
  if (containsSecret(list)) {
    throw new SevenError({ code: "VALIDATION", message: "Bundle contains a secret-like value." });
  }
  const timestamp = now();
  if (!Number.isFinite(timestamp) || timestamp < 0) {
    throw new SevenError({ code: "VALIDATION", message: "Bundle timestamp is invalid." });
  }
  const payload = JSON.stringify({ roomId: id, attachments: list });
  const contentHash = await sha256Hex(payload);
  return Object.freeze({
    schemaVersion: ATTACHMENT_BUNDLE_SCHEMA_VERSION,
    createdAt: timestamp,
    roomId: id,
    attachments: Object.freeze(list.map((record) => Object.freeze({ ...record }))),
    contentHash,
  });
}

export function isAttachmentBundle(value: unknown): value is AttachmentBundle {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<AttachmentBundle>;
  return (
    item.schemaVersion === ATTACHMENT_BUNDLE_SCHEMA_VERSION &&
    typeof item.roomId === "string" &&
    item.roomId.trim().length > 0 &&
    item.roomId === item.roomId.trim() &&
    Array.isArray(item.attachments) &&
    item.attachments.every(isAttachmentRecord) &&
    typeof item.contentHash === "string" &&
    /^[a-f0-9]{64}$/.test(item.contentHash) &&
    typeof item.createdAt === "number" &&
    Number.isFinite(item.createdAt) &&
    item.createdAt >= 0
  );
}

export async function verifyAttachmentBundle(bundle: AttachmentBundle): Promise<boolean> {
  if (!isAttachmentBundle(bundle)) return false;
  if (containsSecret(bundle.attachments)) return false;
  const payload = JSON.stringify({ roomId: bundle.roomId, attachments: bundle.attachments });
  const hash = await sha256Hex(payload);
  return hash === bundle.contentHash;
}

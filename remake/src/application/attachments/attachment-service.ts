import { SevenError } from "../../core/errors";
import { TaskManager } from "../../core/task-manager";
import {
  ATTACHMENT_LIMITS,
  createAttachmentRecord,
  type AttachmentMimeType,
  type AttachmentRecord,
} from "../../domain/attachments";
import type { AttachmentRepository } from "../../storage/attachment-repository";

export interface PdfTextParser {
  parse(bytes: Uint8Array, signal: AbortSignal): Promise<string>;
}

export class SingleFlightPdfParserLoader {
  private pending: Promise<PdfTextParser> | null = null;

  constructor(private readonly factory: () => Promise<PdfTextParser>) {
    if (typeof factory !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "PDF parser factory must be a function." });
    }
  }

  load(): Promise<PdfTextParser> {
    if (this.pending) return this.pending;
    const pending = Promise.resolve()
      .then(this.factory)
      .then((parser) => {
        if (!parser || typeof parser !== "object" || typeof parser.parse !== "function") {
          throw new SevenError({ code: "VALIDATION", message: "PDF parser loader returned an invalid parser." });
        }
        return parser;
      })
      .catch((error: unknown) => {
        if (this.pending === pending) this.pending = null;
        throw error;
      });
    this.pending = pending;
    return pending;
  }
}

export type AttachmentIngestOptions = Readonly<{
  roomId: string;
  id?: string;
  name: string;
  declaredMimeType: AttachmentMimeType;
  bytes: Uint8Array;
  timeoutMs?: number;
}>;

export type AttachmentRun = Readonly<{
  taskId: string;
  result: Promise<AttachmentRecord>;
  cancel(reason?: string): boolean;
}>;

function canonical(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim()) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be canonical.` });
  }
  return value;
}

function sniff(bytes: Uint8Array): AttachmentMimeType {
  if (
    bytes.length >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  ) return "application/pdf";
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return "text/plain";
  } catch {
    throw new SevenError({ code: "VALIDATION", message: "Attachment content is neither supported UTF-8 text nor a PDF." });
  }
}

async function sha256(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

export class AttachmentService {
  constructor(
    private readonly tasks: TaskManager,
    private readonly repository: AttachmentRepository,
    private readonly pdfLoader: SingleFlightPdfParserLoader,
    private readonly now: () => number = Date.now,
  ) {
    if (!tasks || typeof tasks !== "object" || typeof tasks.run !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "AttachmentService requires TaskManager." });
    }
    if (!repository || typeof repository !== "object" || typeof repository.put !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "AttachmentService requires AttachmentRepository." });
    }
    if (!pdfLoader || typeof pdfLoader !== "object" || typeof pdfLoader.load !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "AttachmentService requires a PDF parser loader." });
    }
    if (typeof now !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "Attachment clock must be a function." });
    }
  }

  ingest(options: AttachmentIngestOptions): AttachmentRun {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new SevenError({ code: "VALIDATION", message: "Attachment ingest options must be an object." });
    }
    const roomId = canonical(options.roomId, "roomId");
    const name = canonical(options.name, "Attachment name");
    if (name.length > ATTACHMENT_LIMITS.nameCharacters) {
      throw new SevenError({ code: "VALIDATION", message: "Attachment name is too long." });
    }
    if (options.declaredMimeType !== "text/plain" && options.declaredMimeType !== "application/pdf") {
      throw new SevenError({ code: "VALIDATION", message: "Declared attachment MIME type is unsupported." });
    }
    if (!(options.bytes instanceof Uint8Array) || options.bytes.byteLength === 0 || options.bytes.byteLength > ATTACHMENT_LIMITS.bytes) {
      throw new SevenError({ code: "VALIDATION", message: "Attachment bytes are empty or exceed the safe limit." });
    }
    if (options.id !== undefined) canonical(options.id, "Attachment id");
    const bytes = options.bytes.slice();
    const declaredMimeType = options.declaredMimeType;
    const id = options.id;

    const run = this.tasks.run(
      {
        kind: "attachment",
        ownerId: roomId,
        ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
      },
      async ({ signal }) => {
        const detected = sniff(bytes);
        if (detected !== declaredMimeType) {
          throw new SevenError({
            code: "VALIDATION",
            message: `Attachment MIME mismatch: declared ${declaredMimeType}, detected ${detected}.`,
          });
        }
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        let text: string;
        if (detected === "text/plain") {
          text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
        } else {
          const parser = await this.pdfLoader.load();
          if (signal.aborted) throw new DOMException("Aborted", "AbortError");
          text = await parser.parse(bytes.slice(), signal);
        }

        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (typeof text !== "string" || !text.trim()) {
          throw new SevenError({ code: "VALIDATION", message: "Attachment parser produced no usable text." });
        }
        if (text.length > ATTACHMENT_LIMITS.textCharacters) {
          throw new SevenError({ code: "VALIDATION", message: "Extracted attachment text exceeds the safe limit." });
        }

        const contentHash = await sha256(bytes);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        const timestamp = this.now();
        const record = createAttachmentRecord({
          ...(id !== undefined ? { id } : {}),
          name,
          mimeType: detected,
          sizeBytes: bytes.byteLength,
          contentHash,
          extractedText: text,
          now: timestamp,
        });
        await this.repository.put(roomId, record, signal);
        return record;
      },
    );

    return Object.freeze({ taskId: run.taskId, result: run.result, cancel: run.cancel });
  }
}

import { SevenError } from "../../core/errors";
import type { AttachmentRepository } from "../../storage/attachment-repository";

export interface AttachmentContextSource {
  contextForRoom(
    roomId: string,
    query: string,
    signal: AbortSignal,
  ): Promise<string>;
}

function normalize(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase("en-US");
}

function terms(value: string): readonly string[] {
  return Object.freeze([...new Set(normalize(value).match(/[\p{L}\p{N}_-]{2,}/gu) ?? [])]);
}

export class StoredAttachmentContextSource implements AttachmentContextSource {
  constructor(
    private readonly repository: AttachmentRepository,
    private readonly maxCharacters = 32_000,
    private readonly maxAttachments = 8,
  ) {
    if (!repository || typeof repository !== "object" || typeof repository.list !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "Attachment context source requires a repository." });
    }
    if (!Number.isSafeInteger(maxCharacters) || maxCharacters < 1024 || maxCharacters > 256_000) {
      throw new SevenError({ code: "VALIDATION", message: "Attachment context character budget is invalid." });
    }
    if (!Number.isSafeInteger(maxAttachments) || maxAttachments <= 0 || maxAttachments > 32) {
      throw new SevenError({ code: "VALIDATION", message: "Attachment context count is invalid." });
    }
  }

  async contextForRoom(roomId: string, query: string, signal: AbortSignal): Promise<string> {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    const queryTerms = terms(query);
    const records = await this.repository.list(roomId, signal);
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    if (records.length === 0) return "";

    const ranked = [...records]
      .map((record) => {
        const haystack = normalize(`${record.name}\n${record.extractedText.slice(0, 64_000)}`);
        let score = 0;
        for (const term of queryTerms) if (haystack.includes(term)) score += 1;
        return { record, score };
      })
      .sort((a, b) => b.score - a.score || b.record.createdAt - a.record.createdAt || a.record.id.localeCompare(b.record.id))
      .slice(0, this.maxAttachments);

    const sections: string[] = [];
    let used = 0;
    for (const { record } of ranked) {
      const header = `FILE name=${JSON.stringify(record.name)} id=${record.id} sha256=${record.contentHash}\n`;
      if (used + header.length >= this.maxCharacters) break;
      const available = this.maxCharacters - used - header.length;
      const text = record.extractedText.slice(0, Math.max(0, available));
      sections.push(header + text);
      used += header.length + text.length;
      if (used >= this.maxCharacters) break;
    }
    return sections.join("\n\n");
  }
}

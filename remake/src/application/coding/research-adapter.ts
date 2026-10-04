import type { ResearchService } from "../research/research-service";
import type { CodingResearchPort } from "./coding-agent-service";

export class ResearchServiceCodingAdapter implements CodingResearchPort {
  constructor(private readonly researchService: ResearchService) {}

  async research(query: string, signal: AbortSignal) {
    const run = this.researchService.run(query, { timeoutMs: 60_000, maxAgeMs: 6 * 60 * 60 * 1000 });
    const abort = () => run.cancel("coding-research-cancelled");
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
    try {
      const result = await run.result;
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      return Object.freeze({
        text: [
          result.answer,
          ...result.citations.map((citation) => `[${citation.id}] ${citation.title} — ${citation.canonicalUrl}`),
        ].join("\n"),
        sourceIds: Object.freeze(result.citations.map((citation) => citation.id)),
      });
    } finally {
      signal.removeEventListener("abort", abort);
    }
  }
}

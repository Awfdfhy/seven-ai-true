import { SevenError } from "../../core/errors";
import { TaskManager } from "../../core/task-manager";
import {
  RESEARCH_LIMITS,
  cloneResearchCitation,
  createResearchResult,
  isResearchCitation,
  type ResearchCitation,
  type ResearchResult,
  type ResearchSourceFailure,
} from "../../domain/research";
import type { ResearchRepository } from "../../storage/research-repository";

export interface ResearchSource {
  readonly id: string;
  search(query: string, signal: AbortSignal): Promise<readonly ResearchCitation[]>;
}

export interface ResearchSynthesizer {
  synthesize(input: Readonly<{
    query: string;
    citations: readonly ResearchCitation[];
    signal: AbortSignal;
  }>): Promise<string>;
}

export type ResearchRun = Readonly<{
  taskId: string;
  result: Promise<ResearchResult>;
  cancel(reason?: string): boolean;
}>;

export type ResearchOptions = Readonly<{
  timeoutMs?: number;
  maxAgeMs?: number;
  bypassCache?: boolean;
}>;

function canonicalQuery(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > RESEARCH_LIMITS.queryCharacters
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Research query must be canonical and bounded." });
  }
  return value;
}

function sourceFailure(sourceId: string, error: unknown): ResearchSourceFailure {
  let code: ResearchSourceFailure["code"] = "UNKNOWN";
  if (error instanceof SevenError) {
    if (error.code === "NETWORK") code = "NETWORK";
    else if (error.code === "PROVIDER") code = "PROVIDER";
  }
  return Object.freeze({ sourceId, code });
}

export class ResearchService {
  private readonly sources: readonly ResearchSource[];

  constructor(
    private readonly tasks: TaskManager,
    sources: readonly ResearchSource[],
    private readonly synthesizer: ResearchSynthesizer,
    private readonly repository: ResearchRepository,
    private readonly now: () => number = Date.now,
  ) {
    if (!tasks || typeof tasks !== "object" || typeof tasks.run !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "ResearchService requires TaskManager." });
    }
    if (!Array.isArray(sources) || sources.length === 0 || sources.length > 16) {
      throw new SevenError({ code: "VALIDATION", message: "ResearchService requires 1-16 sources." });
    }
    const ids = new Set<string>();
    this.sources = Object.freeze(sources.map((source) => {
      if (
        !source ||
        typeof source !== "object" ||
        typeof source.id !== "string" ||
        !source.id.trim() ||
        source.id !== source.id.trim() ||
        ids.has(source.id) ||
        typeof source.search !== "function"
      ) {
        throw new SevenError({ code: "VALIDATION", message: "Research source is malformed or duplicated." });
      }
      ids.add(source.id);
      return Object.freeze({ id: source.id, search: source.search.bind(source) });
    }));
    if (!synthesizer || typeof synthesizer !== "object" || typeof synthesizer.synthesize !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "ResearchService requires a synthesizer." });
    }
    if (!repository || typeof repository !== "object" || typeof repository.get !== "function" || typeof repository.put !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "ResearchService requires a repository." });
    }
    if (typeof now !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "Research clock must be a function." });
    }
  }

  run(query: string, options: ResearchOptions = {}): ResearchRun {
    const normalized = canonicalQuery(query);
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new SevenError({ code: "VALIDATION", message: "Research options must be an object." });
    }
    if (options.maxAgeMs !== undefined && (!Number.isFinite(options.maxAgeMs) || options.maxAgeMs < 0)) {
      throw new SevenError({ code: "VALIDATION", message: "Research maxAgeMs must be non-negative." });
    }

    const run = this.tasks.run(
      {
        kind: "research",
        ownerId: `research:${normalized}`,
        ...(options.timeoutMs !== undefined ? { timeoutMs: options.timeoutMs } : {}),
      },
      async ({ signal }) => {
        const now = this.now();
        if (!Number.isFinite(now) || now < 0) {
          throw new SevenError({ code: "VALIDATION", message: "Research clock returned an invalid timestamp." });
        }
        if (!options.bypassCache) {
          const cached = await this.repository.get(normalized, signal);
          if (
            cached !== null &&
            (options.maxAgeMs === undefined || now - cached.createdAt <= options.maxAgeMs)
          ) {
            return cached;
          }
        }

        const settled = await Promise.allSettled(
          this.sources.map((source) => source.search(normalized, signal)),
        );
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");

        const failures: ResearchSourceFailure[] = [];
        const citations: ResearchCitation[] = [];
        const seenUrls = new Set<string>();
        for (let index = 0; index < settled.length; index += 1) {
          const source = this.sources[index];
          const result = settled[index];
          if (!source || !result) continue;
          if (result.status === "rejected") {
            failures.push(sourceFailure(source.id, result.reason));
            continue;
          }
          if (!Array.isArray(result.value) || result.value.length > RESEARCH_LIMITS.citations) {
            failures.push(Object.freeze({ sourceId: source.id, code: "PROVIDER" as const }));
            continue;
          }
          for (const citation of result.value) {
            if (!isResearchCitation(citation) || citation.providerId !== source.id) {
              throw new SevenError({ code: "PROVIDER", message: `Research source ${source.id} returned an invalid citation.` });
            }
            if (seenUrls.has(citation.canonicalUrl)) continue;
            seenUrls.add(citation.canonicalUrl);
            citations.push(cloneResearchCitation(citation));
            if (citations.length >= RESEARCH_LIMITS.citations) break;
          }
          if (citations.length >= RESEARCH_LIMITS.citations) break;
        }

        if (citations.length === 0 && failures.length > 0) {
          throw new SevenError({
            code: failures.every((failure) => failure.code === "NETWORK") ? "NETWORK" : "PROVIDER",
            message: "Research sources failed before trustworthy evidence was available.",
            retryable: true,
            details: { failedSources: failures.length },
          });
        }
        if (citations.length === 0) {
          throw new SevenError({
            code: "PROVIDER",
            message: "Research completed with no evidence.",
            retryable: true,
          });
        }

        const answer = await this.synthesizer.synthesize({
          query: normalized,
          citations: Object.freeze(citations.map(cloneResearchCitation)),
          signal,
        });
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        const result = createResearchResult({
          query: normalized,
          answer,
          citations,
          sourceFailures: failures,
          createdAt: now,
        });
        await this.repository.put(result, signal);
        return result;
      },
    );
    return Object.freeze({ taskId: run.taskId, result: run.result, cancel: run.cancel });
  }
}

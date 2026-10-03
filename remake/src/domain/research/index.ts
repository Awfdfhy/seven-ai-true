import { SevenError } from "../../core/errors";

export const RESEARCH_LIMITS = Object.freeze({
  queryCharacters: 4096,
  titleCharacters: 512,
  snippetCharacters: 8192,
  answerCharacters: 1_000_000,
  citations: 64,
});

export type ResearchCitation = Readonly<{
  schemaVersion: 1;
  canonicalUrl: string;
  title: string;
  snippet: string;
  retrievedAt: number;
  publishedAt: number | null;
  contentHash: string;
  providerId: string;
}>;

export type ResearchSourceFailure = Readonly<{
  sourceId: string;
  code: "NETWORK" | "PROVIDER" | "UNKNOWN";
}>;

export type ResearchResult = Readonly<{
  schemaVersion: 1;
  query: string;
  answer: string;
  citations: readonly ResearchCitation[];
  sourceFailures: readonly ResearchSourceFailure[];
  createdAt: number;
}>;

function canonicalText(value: unknown, field: string, max: number): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > max
  ) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be a canonical non-empty string.` });
  }
  return value;
}

export function canonicalResearchUrl(value: unknown): string {
  if (typeof value !== "string" || !value.trim() || value !== value.trim()) {
    throw new SevenError({ code: "VALIDATION", message: "Citation URL must be canonical input text." });
  }
  let url: URL;
  try { url = new URL(value); }
  catch (error) {
    throw new SevenError({ code: "VALIDATION", message: "Citation URL is invalid.", cause: error });
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new SevenError({ code: "VALIDATION", message: "Citation URL must use http or https." });
  }
  url.hash = "";
  return url.href;
}

export function createResearchCitation(input: Omit<ResearchCitation, "schemaVersion" | "canonicalUrl"> & { canonicalUrl: string }): ResearchCitation {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new SevenError({ code: "VALIDATION", message: "Research citation must be an object." });
  }
  const retrievedAt = input.retrievedAt;
  if (!Number.isFinite(retrievedAt) || retrievedAt < 0) {
    throw new SevenError({ code: "VALIDATION", message: "Citation retrievedAt is invalid." });
  }
  if (input.publishedAt !== null && (!Number.isFinite(input.publishedAt) || input.publishedAt < 0)) {
    throw new SevenError({ code: "VALIDATION", message: "Citation publishedAt is invalid." });
  }
  if (typeof input.contentHash !== "string" || !/^[a-f0-9]{64}$/.test(input.contentHash)) {
    throw new SevenError({ code: "VALIDATION", message: "Citation contentHash must be SHA-256 hex." });
  }
  return Object.freeze({
    schemaVersion: 1 as const,
    canonicalUrl: canonicalResearchUrl(input.canonicalUrl),
    title: canonicalText(input.title, "Citation title", RESEARCH_LIMITS.titleCharacters),
    snippet: canonicalText(input.snippet, "Citation snippet", RESEARCH_LIMITS.snippetCharacters),
    retrievedAt,
    publishedAt: input.publishedAt,
    contentHash: input.contentHash,
    providerId: canonicalText(input.providerId, "Citation providerId", 256),
  });
}

export function isResearchCitation(value: unknown): value is ResearchCitation {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const item = value as Partial<ResearchCitation>;
  try {
    return (
      item.schemaVersion === 1 &&
      canonicalResearchUrl(item.canonicalUrl) === item.canonicalUrl &&
      typeof item.title === "string" &&
      item.title.trim().length > 0 &&
      item.title === item.title.trim() &&
      item.title.length <= RESEARCH_LIMITS.titleCharacters &&
      typeof item.snippet === "string" &&
      item.snippet.trim().length > 0 &&
      item.snippet === item.snippet.trim() &&
      item.snippet.length <= RESEARCH_LIMITS.snippetCharacters &&
      typeof item.retrievedAt === "number" &&
      Number.isFinite(item.retrievedAt) &&
      item.retrievedAt >= 0 &&
      (item.publishedAt === null || (
        typeof item.publishedAt === "number" &&
        Number.isFinite(item.publishedAt) &&
        item.publishedAt >= 0
      )) &&
      typeof item.contentHash === "string" &&
      /^[a-f0-9]{64}$/.test(item.contentHash) &&
      typeof item.providerId === "string" &&
      item.providerId.trim().length > 0 &&
      item.providerId === item.providerId.trim()
    );
  } catch {
    return false;
  }
}

export function cloneResearchCitation(value: ResearchCitation): ResearchCitation {
  if (!isResearchCitation(value)) {
    throw new SevenError({ code: "VALIDATION", message: "Research citation is invalid." });
  }
  return Object.freeze({ ...value });
}

export function createResearchResult(input: Omit<ResearchResult, "schemaVersion">): ResearchResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new SevenError({ code: "VALIDATION", message: "Research result must be an object." });
  }
  const query = canonicalText(input.query, "Research query", RESEARCH_LIMITS.queryCharacters);
  if (typeof input.answer !== "string" || !input.answer.trim() || input.answer.length > RESEARCH_LIMITS.answerCharacters) {
    throw new SevenError({ code: "VALIDATION", message: "Research answer is invalid or too large." });
  }
  if (!Array.isArray(input.citations) || input.citations.length > RESEARCH_LIMITS.citations) {
    throw new SevenError({ code: "VALIDATION", message: "Research citations exceed the safe limit." });
  }
  const citations = Object.freeze(input.citations.map(cloneResearchCitation));
  if (!Array.isArray(input.sourceFailures)) {
    throw new SevenError({ code: "VALIDATION", message: "Research sourceFailures must be an array." });
  }
  const failures = Object.freeze(input.sourceFailures.map((failure) => {
    if (
      !failure ||
      typeof failure !== "object" ||
      typeof failure.sourceId !== "string" ||
      !failure.sourceId.trim() ||
      failure.sourceId !== failure.sourceId.trim() ||
      (failure.code !== "NETWORK" && failure.code !== "PROVIDER" && failure.code !== "UNKNOWN")
    ) {
      throw new SevenError({ code: "VALIDATION", message: "Research source failure is invalid." });
    }
    return Object.freeze({ sourceId: failure.sourceId, code: failure.code });
  }));
  if (!Number.isFinite(input.createdAt) || input.createdAt < 0) {
    throw new SevenError({ code: "VALIDATION", message: "Research result timestamp is invalid." });
  }
  return Object.freeze({
    schemaVersion: 1 as const,
    query,
    answer: input.answer,
    citations,
    sourceFailures: failures,
    createdAt: input.createdAt,
  });
}

export function cloneResearchResult(value: ResearchResult): ResearchResult {
  return createResearchResult({
    query: value.query,
    answer: value.answer,
    citations: value.citations,
    sourceFailures: value.sourceFailures,
    createdAt: value.createdAt,
  });
}

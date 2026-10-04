import { SevenError } from "../core/errors";
import { TaskManager } from "../core/task-manager";
import { GitHubAuthService } from "./github-auth-service";

export type SelfDevFileChange = Readonly<{
  path: string;
  content: string;
}>;

export type SelfDevChangeSet = Readonly<{
  repository: string;
  baseSha: string;
  message: string;
  files: readonly SelfDevFileChange[];
}>;

export type GitHubMutationResult = Readonly<{
  commitSha: string;
  changedPaths: readonly string[];
}>;

export interface GitHubMutationPort {
  apply(
    input: SelfDevChangeSet,
    accessToken: string,
    signal: AbortSignal,
  ): Promise<GitHubMutationResult>;
}

export type CodingVerificationEvidence = Readonly<{
  approved: boolean;
  repository: string;
  baseSha: string;
  verifiedPaths: readonly string[];
  checks: readonly string[];
  evidenceId: string;
}>;

export interface CodingVerificationPort {
  verify(
    input: SelfDevChangeSet,
    signal: AbortSignal,
  ): Promise<CodingVerificationEvidence>;
}

export type SelfDevRun = Readonly<{
  taskId: string;
  result: Promise<GitHubMutationResult>;
  cancel(reason?: string): boolean;
}>;

const BLOCKED_PATH_PATTERNS = [
  /(^|\/)\.env(?:\.|$)/i,
  /(^|\/)secrets?(?:\.|\/|$)/i,
  /(^|\/)credentials?(?:\.|\/|$)/i,
  /(^|\/)keystore(?:\.|\/|$)/i,
  /(^|\/)id_rsa(?:\.|$)/i,
];

function canonical(value: unknown, field: string, max = 4096): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > max
  ) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be canonical.` });
  }
  return value;
}

function normalizePath(path: string): string {
  const value = canonical(path, "Self-dev file path", 1024).replace(/\\/g, "/");
  if (
    value.startsWith("/") ||
    value.includes("\u0000") ||
    value.split("/").some((segment) => segment === ".." || segment === ".")
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Self-dev path escapes repository scope." });
  }
  if (BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(value))) {
    throw new SevenError({ code: "VALIDATION", message: "Self-dev cannot mutate credential or secret paths." });
  }
  return value;
}

function normalizeChangeSet(input: SelfDevChangeSet): SelfDevChangeSet {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new SevenError({ code: "VALIDATION", message: "Self-dev change set must be an object." });
  }
  const repository = canonical(input.repository, "GitHub repository", 256);
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new SevenError({ code: "VALIDATION", message: "GitHub repository must use owner/name format." });
  }
  const baseSha = canonical(input.baseSha, "Self-dev base SHA", 128);
  if (!/^[a-f0-9]{40}$/i.test(baseSha)) {
    throw new SevenError({ code: "VALIDATION", message: "Self-dev base SHA must be a full 40-character commit SHA." });
  }
  const message = canonical(input.message, "Self-dev commit message", 512);
  if (!Array.isArray(input.files) || input.files.length === 0 || input.files.length > 64) {
    throw new SevenError({ code: "VALIDATION", message: "Self-dev change set must contain 1-64 files." });
  }
  const seen = new Set<string>();
  let totalCharacters = 0;
  const files = input.files.map((file) => {
    if (!file || typeof file !== "object" || Array.isArray(file)) {
      throw new SevenError({ code: "VALIDATION", message: "Self-dev file change is malformed." });
    }
    const path = normalizePath(file.path);
    if (seen.has(path)) {
      throw new SevenError({ code: "VALIDATION", message: "Self-dev change set contains duplicate paths." });
    }
    seen.add(path);
    if (typeof file.content !== "string" || file.content.length > 2_000_000) {
      throw new SevenError({ code: "VALIDATION", message: "Self-dev file content exceeds the safe size limit." });
    }
    totalCharacters += file.content.length;
    if (totalCharacters > 8_000_000) {
      throw new SevenError({ code: "VALIDATION", message: "Self-dev change set exceeds the total size limit." });
    }
    return Object.freeze({ path, content: file.content });
  });
  return Object.freeze({
    repository,
    baseSha: baseSha.toLowerCase(),
    message,
    files: Object.freeze(files),
  });
}

function validateCodingEvidence(
  evidence: CodingVerificationEvidence,
  expected: SelfDevChangeSet,
): CodingVerificationEvidence {
  if (!evidence || typeof evidence !== "object" || Array.isArray(evidence)) {
    throw new SevenError({ code: "TOOL", message: "Coding verification evidence is malformed." });
  }
  if (evidence.approved !== true) {
    throw new SevenError({
      code: "TOOL",
      message: "Coding verification rejected the self-development change set.",
      details: { stage: "coding_verification" },
    });
  }
  if (evidence.repository !== expected.repository || evidence.baseSha.toLowerCase() !== expected.baseSha) {
    throw new SevenError({ code: "TOOL", message: "Coding verification evidence does not match the requested repository/base." });
  }
  if (
    !Array.isArray(evidence.verifiedPaths) ||
    evidence.verifiedPaths.length !== expected.files.length ||
    !Array.isArray(evidence.checks) ||
    evidence.checks.length === 0 ||
    evidence.checks.length > 64
  ) {
    throw new SevenError({ code: "TOOL", message: "Coding verification evidence is incomplete." });
  }
  const expectedPaths = new Set(expected.files.map((file) => file.path));
  const seen = new Set<string>();
  for (const path of evidence.verifiedPaths) {
    const normalized = normalizePath(path);
    if (!expectedPaths.has(normalized) || seen.has(normalized)) {
      throw new SevenError({ code: "TOOL", message: "Coding verification paths do not exactly match the change set." });
    }
    seen.add(normalized);
  }
  for (const check of evidence.checks) canonical(check, "Coding verification check", 256);
  const evidenceId = canonical(evidence.evidenceId, "Coding verification evidence id", 512);
  return Object.freeze({
    approved: true,
    repository: expected.repository,
    baseSha: expected.baseSha,
    verifiedPaths: Object.freeze([...seen]),
    checks: Object.freeze([...evidence.checks]),
    evidenceId,
  });
}

function validateMutationResult(
  result: GitHubMutationResult,
  expected: SelfDevChangeSet,
): GitHubMutationResult {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    throw new SevenError({ code: "PROVIDER", message: "GitHub mutation result is malformed." });
  }
  if (typeof result.commitSha !== "string" || !/^[a-f0-9]{40}$/i.test(result.commitSha)) {
    throw new SevenError({ code: "PROVIDER", message: "GitHub mutation result has an invalid commit SHA." });
  }
  if (!Array.isArray(result.changedPaths)) {
    throw new SevenError({ code: "PROVIDER", message: "GitHub mutation result paths are malformed." });
  }
  const allowed = new Set(expected.files.map((file) => file.path));
  const seen = new Set<string>();
  const changed = result.changedPaths.map((path) => {
    const normalized = normalizePath(path);
    if (!allowed.has(normalized) || seen.has(normalized)) {
      throw new SevenError({ code: "PROVIDER", message: "GitHub mutation changed an unexpected or duplicated path." });
    }
    seen.add(normalized);
    return normalized;
  });
  if (changed.length === 0) {
    throw new SevenError({ code: "PROVIDER", message: "GitHub mutation reported no changed paths." });
  }
  return Object.freeze({
    commitSha: result.commitSha.toLowerCase(),
    changedPaths: Object.freeze(changed),
  });
}

export class GitHubSelfDevService {
  constructor(
    private readonly tasks: TaskManager,
    private readonly auth: GitHubAuthService,
    private readonly mutation: GitHubMutationPort,
    private readonly codingVerification?: CodingVerificationPort,
  ) {
    if (!tasks || typeof tasks !== "object" || typeof tasks.run !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "GitHubSelfDevService requires TaskManager." });
    }
    if (!auth || typeof auth !== "object" || typeof auth.withAccessToken !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "GitHubSelfDevService requires GitHubAuthService." });
    }
    if (!mutation || typeof mutation !== "object" || typeof mutation.apply !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "GitHubSelfDevService requires a mutation port." });
    }
    if (
      codingVerification !== undefined &&
      (!codingVerification ||
        typeof codingVerification !== "object" ||
        typeof codingVerification.verify !== "function")
    ) {
      throw new SevenError({ code: "VALIDATION", message: "GitHubSelfDevService coding verification port is malformed." });
    }
  }

  apply(changeSet: SelfDevChangeSet, timeoutMs = 60_000): SelfDevRun {
    const normalized = normalizeChangeSet(changeSet);
    const run = this.tasks.run(
      {
        kind: "github",
        ownerId: `github:${normalized.repository}`,
        timeoutMs,
      },
      async ({ signal }) => {
        if (!this.codingVerification) {
          throw new SevenError({
            code: "TOOL",
            message: "Self-development is blocked until Coding System verification is available.",
            details: { stage: "coding_verification", reason: "MISSING_VERIFIER" },
          });
        }
        const evidence = await this.codingVerification.verify(normalized, signal);
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        validateCodingEvidence(evidence, normalized);
        return this.auth.withAccessToken(signal, async (accessToken, innerSignal) => {
          if (innerSignal.aborted) throw new DOMException("Aborted", "AbortError");
          const result = await this.mutation.apply(normalized, accessToken, innerSignal);
          if (innerSignal.aborted) throw new DOMException("Aborted", "AbortError");
          return validateMutationResult(result, normalized);
        });
      },
    );
    return Object.freeze({ taskId: run.taskId, result: run.result, cancel: run.cancel });
  }
}

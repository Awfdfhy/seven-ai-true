import { SevenError } from "../core/errors";
import type { GitHubAuthService } from "./github-auth-service";
import type {
  CodingRepositoryPort,
  RepositoryCommitChange,
  RepositoryCommitResult,
  RepositoryEntry,
} from "../application/coding/repository-port";
import { canonicalRepositoryPath } from "../application/coding/workspace-truth";

const COMMIT_SHA = /^[a-f0-9]{40}$/i;
const BLOB_SHA = /^[a-f0-9]{40}$/i;

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

type GitTreeItem = Readonly<{ path?: unknown; mode?: unknown; type?: unknown; sha?: unknown; size?: unknown }>;

function canonicalRepository(repository: string): string {
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
    throw new SevenError({ code: "VALIDATION", message: "GitHub repository must use owner/name form." });
  }
  return repository;
}

function canonicalBranch(branch: string): string {
  if (
    typeof branch !== "string" ||
    !branch ||
    branch !== branch.trim() ||
    branch.length > 256 ||
    branch.includes("..") ||
    branch.includes("@{")
  ) {
    throw new SevenError({ code: "VALIDATION", message: "GitHub branch is invalid." });
  }
  return branch;
}

function canonicalCommitSha(sha: string, field: string): string {
  if (!COMMIT_SHA.test(sha)) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be a full commit SHA.` });
  }
  return sha.toLowerCase();
}

function decodeUtf8Base64(value: string): string {
  const binary = atob(value.replace(/[\r\n\s]/g, ""));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Repository blob is not valid UTF-8 text.",
      cause: error,
    });
  }
}

export class GitHubCodingRepositoryPort implements CodingRepositoryPort {
  constructor(
    private readonly auth: GitHubAuthService,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly apiBase = "https://api.github.com",
  ) {}

  async getHead(input: Readonly<{
    repository: string;
    branch: string;
    signal: AbortSignal;
  }>): Promise<string> {
    const repository = canonicalRepository(input.repository);
    const branch = canonicalBranch(input.branch);
    return this.auth.withAccessToken(input.signal, async (token, signal) =>
      this.refSha(repository, branch, token, signal),
    );
  }

  async listFiles(input: Readonly<{
    repository: string;
    commitSha: string;
    signal: AbortSignal;
  }>): Promise<readonly RepositoryEntry[]> {
    const repository = canonicalRepository(input.repository);
    const commitSha = canonicalCommitSha(input.commitSha, "Commit SHA");
    return this.auth.withAccessToken(input.signal, async (token, signal) => {
      const tree = await this.loadTree(repository, commitSha, token, signal);
      return Object.freeze(
        tree.map((item) =>
          Object.freeze({
            path: item.path,
            blobSha: item.sha,
            bytes: item.bytes,
            ...(item.mode ? { mode: item.mode } : {}),
          }),
        ),
      );
    });
  }

  async readFiles(input: Readonly<{
    repository: string;
    commitSha: string;
    paths: readonly string[];
    signal: AbortSignal;
  }>) {
    const repository = canonicalRepository(input.repository);
    const commitSha = canonicalCommitSha(input.commitSha, "Commit SHA");
    const paths = Object.freeze([...new Set(input.paths.map(canonicalRepositoryPath))].sort());
    if (paths.length === 0 || paths.length > 256) {
      throw new SevenError({ code: "VALIDATION", message: "GitHub coding read requires 1-256 paths." });
    }

    return this.auth.withAccessToken(input.signal, async (token, signal) => {
      const tree = await this.loadTree(repository, commitSha, token, signal);
      const byPath = new Map(tree.map((entry) => [entry.path, entry]));
      const output = [];
      for (const path of paths) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        const entry = byPath.get(path);
        if (!entry) {
          throw new SevenError({
            code: "VALIDATION",
            message: `Repository path does not exist at inspected commit: ${path}`,
          });
        }
        if (entry.bytes > 2_000_000) {
          throw new SevenError({
            code: "VALIDATION",
            message: `Repository text file exceeds Coding read limit: ${path}`,
          });
        }
        const blob = await this.requestJson(
          `/repos/${repository}/git/blobs/${entry.sha}`,
          token,
          signal,
        );
        const encoded = (blob as { content?: unknown }).content;
        const encoding = (blob as { encoding?: unknown }).encoding;
        if (encoding !== "base64" || typeof encoded !== "string") {
          throw new SevenError({ code: "PROVIDER", message: "GitHub blob response is malformed." });
        }
        output.push(Object.freeze({ path, content: decodeUtf8Base64(encoded) }));
      }
      return Object.freeze(output);
    });
  }

  async commit(input: Readonly<{
    repository: string;
    branch: string;
    baseSha: string;
    message: string;
    changes: readonly RepositoryCommitChange[];
    signal: AbortSignal;
  }>): Promise<RepositoryCommitResult> {
    const repository = canonicalRepository(input.repository);
    const branch = canonicalBranch(input.branch);
    const baseSha = canonicalCommitSha(input.baseSha, "Base SHA");
    if (
      typeof input.message !== "string" ||
      !input.message.trim() ||
      input.message !== input.message.trim() ||
      input.message.length > 512
    ) {
      throw new SevenError({ code: "VALIDATION", message: "Commit message is invalid." });
    }
    if (!Array.isArray(input.changes) || input.changes.length === 0 || input.changes.length > 24) {
      throw new SevenError({ code: "VALIDATION", message: "Coding commit must contain 1-24 changes." });
    }

    const normalized = input.changes.map((change) => {
      const path = canonicalRepositoryPath(change.path);
      if (change.kind === "upsert") {
        if (
          typeof change.content !== "string" ||
          new TextEncoder().encode(change.content).byteLength > 2_000_000
        ) {
          throw new SevenError({
            code: "VALIDATION",
            message: `Coding commit content is invalid: ${path}`,
          });
        }
        return Object.freeze({ kind: "upsert" as const, path, content: change.content });
      }
      if (change.kind === "delete") return Object.freeze({ kind: "delete" as const, path });
      throw new SevenError({ code: "VALIDATION", message: "Coding commit change kind is invalid." });
    });
    if (new Set(normalized.map((change) => change.path)).size !== normalized.length) {
      throw new SevenError({ code: "VALIDATION", message: "Coding commit contains duplicate paths." });
    }

    return this.auth.withAccessToken(input.signal, async (token, signal) => {
      const head = await this.refSha(repository, branch, token, signal);
      if (head !== baseSha) {
        throw new SevenError({
          code: "VALIDATION",
          message: "GitHub branch changed before Coding commit.",
        });
      }

      const baseCommit = await this.requestJson(
        `/repos/${repository}/git/commits/${baseSha}`,
        token,
        signal,
      );
      const baseTreeSha = (baseCommit as { tree?: { sha?: unknown } }).tree?.sha;
      if (typeof baseTreeSha !== "string" || !COMMIT_SHA.test(baseTreeSha)) {
        throw new SevenError({ code: "PROVIDER", message: "GitHub base commit response is malformed." });
      }

      const existing = new Map(
        (await this.loadTree(repository, baseSha, token, signal)).map((entry) => [entry.path, entry]),
      );
      const tree: Array<Record<string, unknown>> = [];

      for (const change of normalized) {
        if (signal.aborted) throw new DOMException("Aborted", "AbortError");
        if (change.kind === "delete") {
          if (!existing.has(change.path)) {
            throw new SevenError({
              code: "VALIDATION",
              message: `Cannot delete missing path: ${change.path}`,
            });
          }
          tree.push({
            path: change.path,
            mode: existing.get(change.path)?.mode ?? "100644",
            type: "blob",
            sha: null,
          });
          continue;
        }

        const blob = await this.requestJson(`/repos/${repository}/git/blobs`, token, signal, {
          method: "POST",
          body: JSON.stringify({ content: change.content, encoding: "utf-8" }),
        });
        const blobSha = (blob as { sha?: unknown }).sha;
        if (typeof blobSha !== "string" || !BLOB_SHA.test(blobSha)) {
          throw new SevenError({
            code: "PROVIDER",
            message: "GitHub blob creation response is malformed.",
          });
        }
        tree.push({
          path: change.path,
          mode: existing.get(change.path)?.mode ?? "100644",
          type: "blob",
          sha: blobSha,
        });
      }

      const createdTree = await this.requestJson(`/repos/${repository}/git/trees`, token, signal, {
        method: "POST",
        body: JSON.stringify({ base_tree: baseTreeSha, tree }),
      });
      const treeSha = (createdTree as { sha?: unknown }).sha;
      if (typeof treeSha !== "string" || !COMMIT_SHA.test(treeSha)) {
        throw new SevenError({ code: "PROVIDER", message: "GitHub tree creation response is malformed." });
      }

      const createdCommit = await this.requestJson(
        `/repos/${repository}/git/commits`,
        token,
        signal,
        {
          method: "POST",
          body: JSON.stringify({ message: input.message, tree: treeSha, parents: [baseSha] }),
        },
      );
      const commitSha = (createdCommit as { sha?: unknown }).sha;
      if (typeof commitSha !== "string" || !COMMIT_SHA.test(commitSha)) {
        throw new SevenError({
          code: "PROVIDER",
          message: "GitHub commit creation response is malformed.",
        });
      }

      await this.requestJson(
        `/repos/${repository}/git/refs/heads/${encodeURIComponent(branch)}`,
        token,
        signal,
        {
          method: "PATCH",
          body: JSON.stringify({ sha: commitSha, force: false }),
        },
      );
      const finalHead = await this.refSha(repository, branch, token, signal);
      if (finalHead !== commitSha.toLowerCase()) {
        throw new SevenError({
          code: "PROVIDER",
          message: "GitHub branch did not advance to the created commit.",
        });
      }
      return Object.freeze({
        commitSha: commitSha.toLowerCase(),
        changedPaths: Object.freeze(normalized.map((change) => change.path).sort()),
      });
    });
  }

  private async refSha(
    repository: string,
    branch: string,
    token: string,
    signal: AbortSignal,
  ): Promise<string> {
    const data = await this.requestJson(
      `/repos/${repository}/git/ref/heads/${encodeURIComponent(branch)}`,
      token,
      signal,
    );
    const sha = (data as { object?: { sha?: unknown } }).object?.sha;
    if (typeof sha !== "string" || !COMMIT_SHA.test(sha)) {
      throw new SevenError({ code: "PROVIDER", message: "GitHub ref response is malformed." });
    }
    return sha.toLowerCase();
  }

  private async loadTree(
    repository: string,
    commitSha: string,
    token: string,
    signal: AbortSignal,
  ): Promise<
    readonly Readonly<{ path: string; sha: string; bytes: number; mode?: string }>[]
  > {
    const commit = await this.requestJson(
      `/repos/${repository}/git/commits/${commitSha}`,
      token,
      signal,
    );
    const treeSha = (commit as { tree?: { sha?: unknown } }).tree?.sha;
    if (typeof treeSha !== "string" || !COMMIT_SHA.test(treeSha)) {
      throw new SevenError({ code: "PROVIDER", message: "GitHub commit tree response is malformed." });
    }

    const tree = await this.requestJson(
      `/repos/${repository}/git/trees/${treeSha}?recursive=1`,
      token,
      signal,
    );
    if ((tree as { truncated?: unknown }).truncated === true) {
      throw new SevenError({
        code: "PROVIDER",
        message: "GitHub repository tree is truncated; Coding refuses incomplete repository truth.",
      });
    }
    const raw = (tree as { tree?: unknown }).tree;
    if (!Array.isArray(raw)) {
      throw new SevenError({ code: "PROVIDER", message: "GitHub tree response is malformed." });
    }

    const output = [];
    for (const item of raw as GitTreeItem[]) {
      if (item.type !== "blob") continue;
      if (
        typeof item.path !== "string" ||
        typeof item.sha !== "string" ||
        !BLOB_SHA.test(item.sha)
      ) {
        throw new SevenError({
          code: "PROVIDER",
          message: "GitHub tree blob entry is malformed.",
        });
      }
      const path = canonicalRepositoryPath(item.path);
      const size = Number(item.size ?? 0);
      if (!Number.isSafeInteger(size) || size < 0) {
        throw new SevenError({
          code: "PROVIDER",
          message: "GitHub tree blob size is malformed.",
        });
      }
      output.push(
        Object.freeze({
          path,
          sha: item.sha.toLowerCase(),
          bytes: size,
          ...(typeof item.mode === "string" ? { mode: item.mode } : {}),
        }),
      );
    }
    output.sort((a, b) => a.path.localeCompare(b.path));
    return Object.freeze(output);
  }

  private async requestJson(
    path: string,
    token: string,
    signal: AbortSignal,
    init: RequestInit = {},
  ): Promise<unknown> {
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    let response: Response;
    try {
      response = await this.fetchImpl(`${this.apiBase}${path}`, {
        ...init,
        signal,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          ...(init.body ? { "Content-Type": "application/json" } : {}),
          ...(init.headers ?? {}),
        },
      });
    } catch (error) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      throw new SevenError({
        code: "NETWORK",
        message: "GitHub Coding request failed.",
        retryable: true,
        cause: error,
      });
    }

    const text = await response.text();
    if (!response.ok) {
      throw new SevenError({
        code:
          response.status === 401 || response.status === 403
            ? "PERMISSION"
            : response.status === 409 || response.status === 422
              ? "VALIDATION"
              : "PROVIDER",
        message: `GitHub Coding request failed with HTTP ${response.status}.`,
        retryable: response.status >= 500 || response.status === 429,
        details: {
          httpStatus: response.status,
          rateLimited: response.status === 429,
        },
      });
    }
    try {
      return text ? JSON.parse(text) : {};
    } catch (error) {
      throw new SevenError({
        code: "PROVIDER",
        message: "GitHub Coding response is not valid JSON.",
        cause: error,
      });
    }
  }
}

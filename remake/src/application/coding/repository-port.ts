import type {
  PatchPlan,
  PatchTransactionResult,
  RepositorySnapshot,
  SourceFileInput,
} from "./contracts";
import { applyPatchPlan, DEFAULT_CODING_PATH_POLICY } from "./patch-transaction";
import { sha256Text } from "./hash";
import { canonicalRepositoryPath, createRepositorySnapshot } from "./workspace-truth";

export type RepositoryEntry = Readonly<{
  path: string;
  blobSha: string;
  bytes: number;
  mode?: string;
}>;

export type RepositoryCommitChange =
  | Readonly<{ kind: "upsert"; path: string; content: string }>
  | Readonly<{ kind: "delete"; path: string }>;

export type RepositoryCommitResult = Readonly<{
  commitSha: string;
  changedPaths: readonly string[];
}>;

export interface CodingRepositoryPort {
  getHead(input: Readonly<{
    repository: string;
    branch: string;
    signal: AbortSignal;
  }>): Promise<string>;

  listFiles(input: Readonly<{
    repository: string;
    commitSha: string;
    signal: AbortSignal;
  }>): Promise<readonly RepositoryEntry[]>;

  readFiles(input: Readonly<{
    repository: string;
    commitSha: string;
    paths: readonly string[];
    signal: AbortSignal;
  }>): Promise<readonly SourceFileInput[]>;

  commit(input: Readonly<{
    repository: string;
    branch: string;
    baseSha: string;
    message: string;
    changes: readonly RepositoryCommitChange[];
    signal: AbortSignal;
  }>): Promise<RepositoryCommitResult>;
}

export type WorkspaceApplyResult =
  | Readonly<{
      status: "COMMITTED";
      baseSha: string;
      commitSha: string;
      changedPaths: readonly string[];
      candidateFingerprint: string;
      verifiedFingerprint: string;
      patch: Extract<PatchTransactionResult, { status: "APPLIED" }>;
    }>
  | Readonly<{
      status: "REJECTED";
      code:
        | "STALE_REMOTE_HEAD"
        | "PATCH_REJECTED"
        | "MUTATION_RESULT_MISMATCH"
        | "POST_COMMIT_HEAD_MISMATCH"
        | "POST_COMMIT_CONTENT_MISMATCH";
      message: string;
      patch?: Extract<PatchTransactionResult, { status: "REJECTED" }>;
    }>;

const COMMIT_SHA = /^[a-f0-9]{40}$/i;

function ensureSignal(signal: AbortSignal): void {
  if (!signal || typeof signal.aborted !== "boolean") throw new Error("Coding repository operation requires AbortSignal.");
  if (signal.aborted) throw new DOMException("Aborted", "AbortError");
}

function canonicalMessage(message: string): string {
  if (typeof message !== "string" || !message.trim() || message !== message.trim() || message.length > 512) {
    throw new Error("Commit message must be canonical text.");
  }
  return message;
}

function sortedUniquePaths(paths: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(paths.map(canonicalRepositoryPath))].sort((a, b) => a.localeCompare(b)));
}

export class CodingWorkspaceService {
  constructor(private readonly repository: CodingRepositoryPort) {
    if (!repository || typeof repository !== "object") throw new Error("CodingWorkspaceService requires a repository port.");
  }

  async inspect(input: Readonly<{
    repository: string;
    branch: string;
    paths: readonly string[];
    signal: AbortSignal;
  }>): Promise<RepositorySnapshot> {
    ensureSignal(input.signal);
    const paths = sortedUniquePaths(input.paths);
    if (paths.length === 0 || paths.length > 256) throw new Error("Coding inspection requires 1-256 explicit paths.");
    const headSha = (await this.repository.getHead(input)).toLowerCase();
    if (!COMMIT_SHA.test(headSha)) throw new Error("Repository port returned an invalid head SHA.");
    ensureSignal(input.signal);
    const files = await this.repository.readFiles({
      repository: input.repository,
      commitSha: headSha,
      paths,
      signal: input.signal,
    });
    const returned = sortedUniquePaths(files.map((file) => file.path));
    if (returned.length !== paths.length || returned.some((path, index) => path !== paths[index])) {
      throw new Error("Repository port did not return the exact requested inspection set.");
    }
    return createRepositorySnapshot({
      repository: input.repository,
      branch: input.branch,
      headSha,
      files,
    });
  }

  async apply(input: Readonly<{
    snapshot: RepositorySnapshot;
    plan: PatchPlan;
    message: string;
    signal: AbortSignal;
    explicitlyAuthorizedCriticalPaths?: readonly string[];
  }>): Promise<WorkspaceApplyResult> {
    ensureSignal(input.signal);
    const message = canonicalMessage(input.message);
    const currentHead = (await this.repository.getHead({
      repository: input.snapshot.repository,
      branch: input.snapshot.branch,
      signal: input.signal,
    })).toLowerCase();
    if (currentHead !== input.snapshot.headSha) {
      return Object.freeze({
        status: "REJECTED",
        code: "STALE_REMOTE_HEAD",
        message: "Repository head changed after inspection.",
      });
    }

    const patch = await applyPatchPlan(input.snapshot, input.plan, {
      ...DEFAULT_CODING_PATH_POLICY,
      explicitlyAuthorizedCriticalPaths: Object.freeze([
        ...(input.explicitlyAuthorizedCriticalPaths ?? []),
      ]),
    });
    if (patch.status === "REJECTED") {
      return Object.freeze({
        status: "REJECTED",
        code: "PATCH_REJECTED",
        message: patch.message,
        patch,
      });
    }

    ensureSignal(input.signal);
    const secondHead = (await this.repository.getHead({
      repository: input.snapshot.repository,
      branch: input.snapshot.branch,
      signal: input.signal,
    })).toLowerCase();
    if (secondHead !== input.snapshot.headSha) {
      return Object.freeze({
        status: "REJECTED",
        code: "STALE_REMOTE_HEAD",
        message: "Repository head changed immediately before commit.",
      });
    }

    const candidateFiles = new Map(patch.candidate.files.map((file) => [file.path, file]));
    const changes: RepositoryCommitChange[] = patch.candidate.changes.map((change) => {
      if (change.kind === "delete") return Object.freeze({ kind: "delete" as const, path: change.path });
      const file = candidateFiles.get(change.path);
      if (!file) throw new Error(`Candidate content is missing for ${change.path}.`);
      return Object.freeze({ kind: "upsert" as const, path: change.path, content: file.content });
    });
    const intendedPaths = sortedUniquePaths(changes.map((change) => change.path));

    const mutation = await this.repository.commit({
      repository: input.snapshot.repository,
      branch: input.snapshot.branch,
      baseSha: input.snapshot.headSha,
      message,
      changes: Object.freeze(changes),
      signal: input.signal,
    });
    const commitSha = String(mutation.commitSha || "").toLowerCase();
    const actualPaths = sortedUniquePaths(mutation.changedPaths ?? []);
    if (
      !COMMIT_SHA.test(commitSha) ||
      actualPaths.length !== intendedPaths.length ||
      actualPaths.some((path, index) => path !== intendedPaths[index])
    ) {
      return Object.freeze({
        status: "REJECTED",
        code: "MUTATION_RESULT_MISMATCH",
        message: "Repository mutation result does not match the intended transaction.",
      });
    }

    ensureSignal(input.signal);
    const postHead = (await this.repository.getHead({
      repository: input.snapshot.repository,
      branch: input.snapshot.branch,
      signal: input.signal,
    })).toLowerCase();
    if (postHead !== commitSha) {
      return Object.freeze({
        status: "REJECTED",
        code: "POST_COMMIT_HEAD_MISMATCH",
        message: "Repository head does not match the created commit.",
      });
    }

    const survivingPaths = patch.candidate.changes
      .filter((change) => change.kind !== "delete")
      .map((change) => change.path);
    const verifiedFiles = survivingPaths.length
      ? await this.repository.readFiles({
          repository: input.snapshot.repository,
          commitSha,
          paths: survivingPaths,
          signal: input.signal,
        })
      : [];
    const verifiedByPath = new Map(verifiedFiles.map((file) => [file.path, file.content]));
    for (const path of survivingPaths) {
      const expected = candidateFiles.get(path);
      const actual = verifiedByPath.get(path);
      if (!expected || actual === undefined || (await sha256Text(actual)) !== expected.sha256) {
        return Object.freeze({
          status: "REJECTED",
          code: "POST_COMMIT_CONTENT_MISMATCH",
          message: `Committed content failed verification for ${path}.`,
        });
      }
    }

    const entries = await this.repository.listFiles({
      repository: input.snapshot.repository,
      commitSha,
      signal: input.signal,
    });
    const existing = new Set(entries.map((entry) => canonicalRepositoryPath(entry.path)));
    for (const change of patch.candidate.changes) {
      if (change.kind === "delete" && existing.has(change.path)) {
        return Object.freeze({
          status: "REJECTED",
          code: "POST_COMMIT_CONTENT_MISMATCH",
          message: `Deleted path still exists after commit: ${change.path}.`,
        });
      }
    }

    const verificationMaterial = intendedPaths
      .map((path) => {
        const file = candidateFiles.get(path);
        return file ? `${path}\u0000${file.sha256}` : `${path}\u0000<deleted>`;
      })
      .join("\n");
    const verifiedFingerprint = await sha256Text(`${commitSha}\u0000${verificationMaterial}`);
    return Object.freeze({
      status: "COMMITTED",
      baseSha: input.snapshot.headSha,
      commitSha,
      changedPaths: intendedPaths,
      candidateFingerprint: patch.candidate.candidateFingerprint,
      verifiedFingerprint,
      patch,
    });
  }
}

import type { RepositoryFile, RepositorySnapshot, SourceFileInput } from "./contracts";
import { sha256Text, utf8Bytes } from "./hash";

const COMMIT_SHA = /^[a-f0-9]{40}$/i;
const REPOSITORY = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export function canonicalRepositoryPath(raw: string): string {
  if (typeof raw !== "string" || !raw || raw !== raw.trim() || raw.length > 2048) {
    throw new Error("Repository path must be canonical text.");
  }
  const path = raw.replace(/\\/g, "/");
  if (
    path.startsWith("/") ||
    (path.length >= 3 && /^[A-Za-z]$/.test(path[0]!) && path[1] === ":" && path[2] === "/") ||
    path.endsWith("/") ||
    path.includes("\u0000") ||
    path.split("/").some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new Error(`Unsafe repository path: ${raw}`);
  }
  return path;
}

function canonicalBranch(branch: string): string {
  if (typeof branch !== "string" || !branch || branch !== branch.trim() || branch.length > 256) {
    throw new Error("Branch must be canonical text.");
  }
  if (
    branch.startsWith("/") ||
    branch.endsWith("/") ||
    branch.includes("//") ||
    branch.includes("..") ||
    branch.includes("@{") ||
    /[\u0000-\u0020~^:?*\[\]\\]/.test(branch) ||
    branch.split("/").some((part) => !part || part.startsWith(".") || part.endsWith(".lock"))
  ) {
    throw new Error("Branch is not a safe Git reference name.");
  }
  return branch;
}

function canonicalRepository(repository: string): string {
  if (!REPOSITORY.test(repository)) throw new Error("Repository must use owner/name form.");
  return repository;
}

function canonicalHeadSha(headSha: string): string {
  if (!COMMIT_SHA.test(headSha)) throw new Error("Repository head must be a full 40-character commit SHA.");
  return headSha.toLowerCase();
}

export async function fingerprintFiles(files: readonly RepositoryFile[]): Promise<string> {
  const material = files
    .slice()
    .sort((left, right) => left.path.localeCompare(right.path))
    .map((file) => `${file.path}\u0000${file.sha256}\u0000${file.bytes}`)
    .join("\n");
  return sha256Text(material);
}

export async function normalizeRepositoryFiles(inputs: readonly SourceFileInput[]): Promise<readonly RepositoryFile[]> {
  if (!Array.isArray(inputs)) throw new Error("Repository files must be an array.");
  const seen = new Set<string>();
  const normalized: RepositoryFile[] = [];
  for (const input of inputs) {
    if (!input || typeof input !== "object" || typeof input.content !== "string") {
      throw new Error("Repository file is malformed.");
    }
    const path = canonicalRepositoryPath(input.path);
    if (seen.has(path)) throw new Error(`Duplicate repository path: ${path}`);
    seen.add(path);
    normalized.push(
      Object.freeze({
        path,
        content: input.content,
        sha256: await sha256Text(input.content),
        bytes: utf8Bytes(input.content),
      }),
    );
  }
  normalized.sort((left, right) => left.path.localeCompare(right.path));
  return Object.freeze(normalized);
}

export async function createRepositorySnapshot(input: Readonly<{
  repository: string;
  branch: string;
  headSha: string;
  files: readonly SourceFileInput[];
  capturedAt?: string;
}>): Promise<RepositorySnapshot> {
  const repository = canonicalRepository(input.repository);
  const branch = canonicalBranch(input.branch);
  const headSha = canonicalHeadSha(input.headSha);
  const files = await normalizeRepositoryFiles(input.files);
  const fileFingerprint = await fingerprintFiles(files);
  const fingerprint = await sha256Text(`${repository}\u0000${branch}\u0000${headSha}\u0000${fileFingerprint}`);
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  if (!Number.isFinite(Date.parse(capturedAt))) throw new Error("capturedAt must be an ISO-compatible timestamp.");
  return Object.freeze({
    version: 1,
    repository,
    branch,
    headSha,
    capturedAt,
    files,
    fingerprint,
  });
}

export function repositoryFile(snapshot: RepositorySnapshot, path: string): RepositoryFile | undefined {
  const canonical = canonicalRepositoryPath(path);
  return snapshot.files.find((file) => file.path === canonical);
}

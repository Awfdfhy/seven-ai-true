import type {
  CandidateWorkspace,
  ChangeEvidence,
  PatchOperation,
  PatchPlan,
  PatchTransactionResult,
  PathPolicy,
  RepositoryFile,
  RepositorySnapshot,
  RollbackSnapshot,
} from "./contracts";
import { sha256Text, utf8Bytes } from "./hash";
import { canonicalRepositoryPath, fingerprintFiles } from "./workspace-truth";

export const DEFAULT_CODING_PATH_POLICY: PathPolicy = Object.freeze({
  forbidden: Object.freeze([
    /(^|\/)\.git(?:\/|$)/i,
    /(^|\/)node_modules(?:\/|$)/i,
    /(^|\/)\.env(?:\.|$)/i,
    /(^|\/)secrets?(?:\/|\.|$)/i,
    /(^|\/)credentials?(?:\/|\.|$)/i,
    /(^|\/)keystore(?:\/|\.|$)/i,
    /(^|\/)id_rsa(?:\.|$)/i,
  ]),
  critical: Object.freeze([
    /^\.github\/workflows\//i,
    /^docs\/seven-master\/INTEGRATION_CONTRACTS\.md$/i,
    /^eval\//i,
    /^verify\.cjs$/i,
  ]),
  explicitlyAuthorizedCriticalPaths: Object.freeze([]),
  maxChangedFiles: 24,
  maxTotalWrittenBytes: 2_000_000,
});

function rejected(
  code: Extract<PatchTransactionResult, { status: "REJECTED" }>["code"],
  message: string,
  path?: string,
): PatchTransactionResult {
  return Object.freeze({ status: "REJECTED", code, message, ...(path ? { path } : {}) });
}

const SHA256 = /^[a-f0-9]{64}$/i;

function canonicalPlanId(value: unknown): boolean {
  return typeof value === "string" && value.length > 0 && value.length <= 256 && value === value.trim();
}

function assertPlanShape(plan: PatchPlan): string | null {
  if (!plan || typeof plan !== "object" || plan.version !== 1) return "Patch plan version is invalid.";
  if (
    !canonicalPlanId(plan.planId) ||
    !canonicalPlanId(plan.taskId) ||
    typeof plan.baseSha !== "string" ||
    !/^[a-f0-9]{40}$/i.test(plan.baseSha)
  ) {
    return "Patch plan identity is invalid.";
  }
  if (typeof plan.snapshotFingerprint !== "string" || !SHA256.test(plan.snapshotFingerprint)) {
    return "Patch plan snapshot fingerprint is invalid.";
  }
  if (!Array.isArray(plan.operations) || plan.operations.length === 0) return "Patch plan has no operations.";
  return null;
}

function normalizeOperation(raw: unknown): PatchOperation | string {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return "Patch operation is malformed.";
  const operation = raw as Record<string, unknown>;
  if (typeof operation.path !== "string") return "Patch operation path is malformed.";
  if (!["patch", "replace", "create", "delete"].includes(String(operation.kind))) {
    return "Patch operation kind is invalid.";
  }

  const kind = operation.kind as PatchOperation["kind"];
  if (kind === "create") {
    return typeof operation.content === "string"
      ? ({ kind, path: operation.path, content: operation.content } as PatchOperation)
      : "Create operation content is malformed.";
  }
  if (typeof operation.expectedSha256 !== "string" || !SHA256.test(operation.expectedSha256)) {
    return "Patch operation source fingerprint is invalid.";
  }
  if (kind === "delete") {
    return { kind, path: operation.path, expectedSha256: operation.expectedSha256 };
  }
  if (kind === "replace") {
    return typeof operation.content === "string"
      ? { kind, path: operation.path, expectedSha256: operation.expectedSha256, content: operation.content }
      : "Replace operation content is malformed.";
  }
  if (!Array.isArray(operation.edits) || operation.edits.length === 0) {
    return "Patch operation edits are malformed.";
  }
  const edits = [];
  for (const rawEdit of operation.edits) {
    if (!rawEdit || typeof rawEdit !== "object" || Array.isArray(rawEdit)) {
      return "Patch edit is malformed.";
    }
    const edit = rawEdit as Record<string, unknown>;
    if (typeof edit.find !== "string" || !edit.find || typeof edit.replace !== "string") {
      return "Patch edit is malformed.";
    }
    edits.push(Object.freeze({ find: edit.find, replace: edit.replace }));
  }
  return { kind, path: operation.path, expectedSha256: operation.expectedSha256, edits: Object.freeze(edits) };
}

function findCount(content: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let offset = 0;
  while (offset <= content.length) {
    const index = content.indexOf(needle, offset);
    if (index < 0) break;
    count += 1;
    offset = index + Math.max(1, needle.length);
  }
  return count;
}

function authorizedCritical(path: string, policy: PathPolicy): boolean {
  return (policy.explicitlyAuthorizedCriticalPaths ?? []).includes(path);
}

function policyViolation(path: string, policy: PathPolicy): PatchTransactionResult | null {
  if (policy.forbidden.some((pattern) => pattern.test(path))) {
    return rejected("UNSAFE_PATH", `Path is forbidden by coding policy: ${path}`, path);
  }
  if (policy.critical.some((pattern) => pattern.test(path)) && !authorizedCritical(path, policy)) {
    return rejected(
      "CRITICAL_PATH_REQUIRES_AUTHORITY",
      `Critical path requires non-model authority: ${path}`,
      path,
    );
  }
  return null;
}

async function toRepositoryFile(path: string, content: string): Promise<RepositoryFile> {
  return Object.freeze({ path, content, sha256: await sha256Text(content), bytes: utf8Bytes(content) });
}

function cloneRollback(snapshot: RepositorySnapshot): RollbackSnapshot {
  return Object.freeze({
    version: 1,
    baseSha: snapshot.headSha,
    fingerprint: snapshot.fingerprint,
    files: Object.freeze(snapshot.files.map((file) => Object.freeze({ ...file }))),
  });
}

export async function applyPatchPlan(
  snapshot: RepositorySnapshot,
  plan: PatchPlan,
  policy: PathPolicy = DEFAULT_CODING_PATH_POLICY,
): Promise<PatchTransactionResult> {
  const invalid = assertPlanShape(plan);
  if (invalid) return rejected("INVALID_PLAN", invalid);
  if (snapshot.headSha !== plan.baseSha.toLowerCase()) {
    return rejected("STALE_HEAD", `Plan base ${plan.baseSha} no longer matches workspace head ${snapshot.headSha}.`);
  }
  if (snapshot.fingerprint !== plan.snapshotFingerprint.toLowerCase()) {
    return rejected("STALE_SNAPSHOT", "Workspace fingerprint changed after planning.");
  }
  if (plan.operations.length > policy.maxChangedFiles) {
    return rejected("BLAST_RADIUS_EXCEEDED", "Patch plan exceeds changed-file budget.");
  }

  const operations = new Map<string, PatchOperation>();
  for (const rawOperation of plan.operations as readonly unknown[]) {
    const normalized = normalizeOperation(rawOperation);
    if (typeof normalized === "string") return rejected("INVALID_PLAN", normalized);
    let path: string;
    try {
      path = canonicalRepositoryPath(normalized.path);
    } catch (error) {
      return rejected("UNSAFE_PATH", String((error as Error).message || error), normalized.path);
    }
    if (operations.has(path)) return rejected("INVALID_PLAN", `Multiple operations target ${path}.`, path);
    const violation = policyViolation(path, policy);
    if (violation) return violation;
    operations.set(path, Object.freeze({ ...normalized, path }) as PatchOperation);
  }

  const original = new Map(snapshot.files.map((file) => [file.path, file]));
  const candidate = new Map(snapshot.files.map((file) => [file.path, file]));
  const changes: ChangeEvidence[] = [];
  let actualWrittenBytes = 0;

  const accountWrite = (bytes: number): PatchTransactionResult | null => {
    actualWrittenBytes += bytes;
    return actualWrittenBytes > policy.maxTotalWrittenBytes
      ? rejected("BLAST_RADIUS_EXCEEDED", "Patch plan exceeds written-byte budget.")
      : null;
  };

  for (const [path, operation] of operations) {
    const before = original.get(path);
    if (operation.kind === "create") {
      if (before) return rejected("INVALID_PLAN", `Create target already exists: ${path}`, path);
      const after = await toRepositoryFile(path, operation.content);
      const writeViolation = accountWrite(after.bytes);
      if (writeViolation) return writeViolation;
      candidate.set(path, after);
      changes.push(Object.freeze({ path, kind: "create", afterSha256: after.sha256, beforeBytes: 0, afterBytes: after.bytes }));
      continue;
    }

    if (!before) return rejected("INVALID_PLAN", `Patch target does not exist: ${path}`, path);
    if (before.sha256 !== operation.expectedSha256.toLowerCase()) {
      return rejected("STALE_FILE", `File changed after inspection: ${path}`, path);
    }

    if (operation.kind === "delete") {
      candidate.delete(path);
      changes.push(Object.freeze({ path, kind: "delete", beforeSha256: before.sha256, beforeBytes: before.bytes, afterBytes: 0 }));
      continue;
    }

    let content = operation.kind === "replace" ? operation.content : before.content;
    if (operation.kind === "patch") {
      if (!Array.isArray(operation.edits) || operation.edits.length === 0) {
        return rejected("INVALID_PLAN", `Patch operation has no edits: ${path}`, path);
      }
      for (const edit of operation.edits) {
        if (!edit || typeof edit.find !== "string" || !edit.find || typeof edit.replace !== "string") {
          return rejected("INVALID_PLAN", `Patch edit is malformed: ${path}`, path);
        }
        const count = findCount(content, edit.find);
        if (count === 0) return rejected("PATCH_ANCHOR_MISSING", `Patch anchor not found: ${path}`, path);
        if (count > 1) return rejected("PATCH_ANCHOR_AMBIGUOUS", `Patch anchor is ambiguous: ${path}`, path);
        const index = content.indexOf(edit.find);
        content = content.slice(0, index) + edit.replace + content.slice(index + edit.find.length);
      }
    }
    const after = await toRepositoryFile(path, content);
    const writeViolation = accountWrite(after.bytes);
    if (writeViolation) return writeViolation;
    candidate.set(path, after);
    changes.push(
      Object.freeze({
        path,
        kind: operation.kind,
        beforeSha256: before.sha256,
        afterSha256: after.sha256,
        beforeBytes: before.bytes,
        afterBytes: after.bytes,
      }),
    );
  }

  const files = Object.freeze([...candidate.values()].sort((left, right) => left.path.localeCompare(right.path)));
  const candidateFingerprint = await fingerprintFiles(files);
  const workspace: CandidateWorkspace = Object.freeze({
    version: 1,
    baseSha: snapshot.headSha,
    sourceSnapshotFingerprint: snapshot.fingerprint,
    candidateFingerprint,
    files,
    changes: Object.freeze(changes),
  });
  return Object.freeze({ status: "APPLIED", candidate: workspace, rollback: cloneRollback(snapshot) });
}

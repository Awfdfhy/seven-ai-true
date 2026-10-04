export const CODING_STAGES = [
  "UNDERSTAND",
  "INSPECT",
  "RESEARCH",
  "PLAN",
  "EDIT",
  "TEST",
  "DEBUG",
  "VERIFY",
  "REVIEW",
  "DOCUMENT",
  "COMPLETE",
  "BLOCKED",
  "FAILED",
] as const;

export type CodingStage = (typeof CODING_STAGES)[number];

export type SourceFileInput = Readonly<{
  path: string;
  content: string;
}>;

export type RepositoryFile = Readonly<{
  path: string;
  content: string;
  sha256: string;
  bytes: number;
}>;

export type RepositorySnapshot = Readonly<{
  version: 1;
  repository: string;
  branch: string;
  headSha: string;
  capturedAt: string;
  files: readonly RepositoryFile[];
  fingerprint: string;
}>;

export type ExactEdit = Readonly<{
  find: string;
  replace: string;
}>;

export type FilePatchOperation = Readonly<{
  kind: "patch";
  path: string;
  expectedSha256: string;
  edits: readonly ExactEdit[];
}>;

export type FileReplaceOperation = Readonly<{
  kind: "replace";
  path: string;
  expectedSha256: string;
  content: string;
}>;

export type FileCreateOperation = Readonly<{
  kind: "create";
  path: string;
  content: string;
}>;

export type FileDeleteOperation = Readonly<{
  kind: "delete";
  path: string;
  expectedSha256: string;
}>;

export type PatchOperation =
  | FilePatchOperation
  | FileReplaceOperation
  | FileCreateOperation
  | FileDeleteOperation;

export type PatchPlan = Readonly<{
  version: 1;
  planId: string;
  taskId: string;
  baseSha: string;
  snapshotFingerprint: string;
  operations: readonly PatchOperation[];
}>;

export type PathPolicy = Readonly<{
  forbidden: readonly RegExp[];
  critical: readonly RegExp[];
  explicitlyAuthorizedCriticalPaths?: readonly string[];
  maxChangedFiles: number;
  maxTotalWrittenBytes: number;
}>;

export type ChangeEvidence = Readonly<{
  path: string;
  kind: PatchOperation["kind"];
  beforeSha256?: string;
  afterSha256?: string;
  beforeBytes: number;
  afterBytes: number;
}>;

export type CandidateWorkspace = Readonly<{
  version: 1;
  baseSha: string;
  sourceSnapshotFingerprint: string;
  candidateFingerprint: string;
  files: readonly RepositoryFile[];
  changes: readonly ChangeEvidence[];
}>;

export type RollbackSnapshot = Readonly<{
  version: 1;
  baseSha: string;
  fingerprint: string;
  files: readonly RepositoryFile[];
}>;

export type PatchTransactionResult =
  | Readonly<{
      status: "APPLIED";
      candidate: CandidateWorkspace;
      rollback: RollbackSnapshot;
    }>
  | Readonly<{
      status: "REJECTED";
      code:
        | "STALE_HEAD"
        | "STALE_SNAPSHOT"
        | "STALE_FILE"
        | "UNSAFE_PATH"
        | "CRITICAL_PATH_REQUIRES_AUTHORITY"
        | "INVALID_PLAN"
        | "PATCH_ANCHOR_MISSING"
        | "PATCH_ANCHOR_AMBIGUOUS"
        | "BLAST_RADIUS_EXCEEDED";
      message: string;
      path?: string;
    }>;

export type VerificationCommand = Readonly<{
  id: string;
  cwd: string;
  command: string;
  phase: "targeted" | "mandatory" | "regression";
  reason: string;
}>;

export type VerificationRule = Readonly<{
  id: string;
  when: (path: string) => boolean;
  command: VerificationCommand;
}>;

export type VerificationPlan = Readonly<{
  changedPaths: readonly string[];
  commands: readonly VerificationCommand[];
  mandatoryCommandIds: readonly string[];
}>;

export type CodingEvidenceEvent = Readonly<{
  stage: CodingStage;
  at: string;
  kind: string;
  summary: string;
  data?: Readonly<Record<string, unknown>>;
}>;

export type CodingRun = Readonly<{
  version: 1;
  runId: string;
  taskId: string;
  stage: CodingStage;
  acceptanceCriteria: readonly string[];
  history: readonly CodingEvidenceEvent[];
}>;

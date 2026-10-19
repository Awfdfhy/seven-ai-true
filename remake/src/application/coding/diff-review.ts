import type { CandidateWorkspace, RepositorySnapshot } from "./contracts";

export type DiffFinding = Readonly<{
  severity: "BLOCKER" | "HIGH" | "MEDIUM" | "LOW";
  code: string;
  path: string;
  message: string;
}>;

export type DiffReview = Readonly<{
  version: 1;
  status: "PASS" | "REJECT";
  findings: readonly DiffFinding[];
}>;

function assertionCount(content: string): number {
  return (content.match(/\b(?:expect|assert(?:\.\w+)?)\s*\(/g) ?? []).length;
}

function isTest(path: string): boolean {
  return /(^|\/)(?:test|tests|__tests__)(\/|$)/i.test(path) || /\.(?:test|spec)\.[^.]+$/i.test(path);
}

export function reviewCandidateDiff(snapshot: RepositorySnapshot, candidate: CandidateWorkspace): DiffReview {
  const before = new Map(snapshot.files.map((file) => [file.path, file.content]));
  const after = new Map(candidate.files.map((file) => [file.path, file.content]));
  const findings: DiffFinding[] = [];
  for (const change of candidate.changes) {
    const oldContent = before.get(change.path) ?? "";
    const newContent = after.get(change.path) ?? "";
    if (isTest(change.path) && change.kind !== "create") {
      const oldAssertions = assertionCount(oldContent);
      const newAssertions = assertionCount(newContent);
      if (newAssertions < oldAssertions) {
        findings.push(Object.freeze({ severity: "HIGH", code: "TEST_ASSERTION_REDUCTION", path: change.path, message: "Candidate reduces test assertions." }));
      }
      if (/\b(?:it|test|describe)\.skip\s*\(/.test(newContent) && !/\b(?:it|test|describe)\.skip\s*\(/.test(oldContent)) {
        findings.push(Object.freeze({ severity: "BLOCKER", code: "TEST_DISABLED", path: change.path, message: "Candidate introduces a skipped test/suite." }));
      }
    }
    if (/\b(?:@ts-ignore|@ts-nocheck)\b/.test(newContent) && !/\b(?:@ts-ignore|@ts-nocheck)\b/.test(oldContent)) {
      findings.push(Object.freeze({ severity: "HIGH", code: "TYPECHECK_BYPASS", path: change.path, message: "Candidate introduces a TypeScript checking bypass." }));
    }
    if (/\beslint-disable(?:-next-line|-line)?\b/.test(newContent) && !/\beslint-disable(?:-next-line|-line)?\b/.test(oldContent)) {
      findings.push(Object.freeze({ severity: "MEDIUM", code: "LINT_BYPASS", path: change.path, message: "Candidate introduces an ESLint bypass." }));
    }
  }
  const status = findings.some((finding) => finding.severity === "BLOCKER" || finding.severity === "HIGH") ? "REJECT" : "PASS";
  return Object.freeze({ version: 1, status, findings: Object.freeze(findings) });
}

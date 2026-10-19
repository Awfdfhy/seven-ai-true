import { describe, expect, it } from "vitest";
import type {
  CodingRepositoryPort,
  RepositoryCommitChange,
  RepositoryEntry,
} from "./repository-port";
import { CodingWorkspaceService } from "./repository-port";
import { buildRepositoryIntelligence, buildRepositoryMap } from "./repo-intelligence";
import { createRepositorySnapshot } from "./workspace-truth";
import { runVerificationPlan } from "./verification-runner";
import { reviewCandidateDiff } from "./diff-review";
import { applyPatchPlan } from "./patch-transaction";

const HEAD = "a".repeat(40);
const NEXT = "b".repeat(40);

class FakeRepository implements CodingRepositoryPort {
  head = HEAD;
  files = new Map<string, string>([
    ["src/math.ts", "export function add(a:number,b:number){return a+b}\n"],
    ["src/math.test.ts", "import {add} from './math';\nexpect(add(1,2)).toBe(3);\n"],
    ["AGENTS.md", "Run tests before completion.\n"],
  ]);

  async getHead(): Promise<string> {
    return this.head;
  }

  async listFiles(): Promise<readonly RepositoryEntry[]> {
    return [...this.files.entries()].map(([path, content]) => ({
      path,
      blobSha: "c".repeat(40),
      bytes: content.length,
    }));
  }

  async readFiles(input: { paths: readonly string[] }) {
    return input.paths.map((path) => {
      const content = this.files.get(path);
      if (content === undefined) throw new Error("missing");
      return { path, content };
    });
  }

  async commit(input: {
    baseSha: string;
    changes: readonly RepositoryCommitChange[];
  }) {
    if (this.head !== input.baseSha) throw new Error("stale");
    for (const change of input.changes) {
      if (change.kind === "delete") this.files.delete(change.path);
      else this.files.set(change.path, change.content);
    }
    this.head = NEXT;
    return {
      commitSha: NEXT,
      changedPaths: input.changes.map((change) => change.path),
    };
  }
}

describe("repository workspace service", () => {
  it("commits and post-verifies an exact-SHA patch", async () => {
    const repo = new FakeRepository();
    const service = new CodingWorkspaceService(repo);
    const signal = new AbortController().signal;
    const snapshot = await service.inspect({
      repository: "owner/repo",
      branch: "main",
      paths: ["src/math.ts"],
      signal,
    });
    const file = snapshot.files[0]!;
    const result = await service.apply({
      snapshot,
      signal,
      message: "Fix add",
      plan: {
        version: 1,
        planId: "p1",
        taskId: "t1",
        baseSha: snapshot.headSha,
        snapshotFingerprint: snapshot.fingerprint,
        operations: [{
          kind: "patch",
          path: file.path,
          expectedSha256: file.sha256,
          edits: [{ find: "return a+b", replace: "return Number(a)+Number(b)" }],
        }],
      },
    });
    expect(result.status).toBe("COMMITTED");
    if (result.status !== "COMMITTED") return;
    expect(result.commitSha).toBe(NEXT);
    expect(repo.files.get("src/math.ts")).toContain("Number(a)");
  });

  it("fails closed when remote head drifts before application", async () => {
    const repo = new FakeRepository();
    const service = new CodingWorkspaceService(repo);
    const signal = new AbortController().signal;
    const snapshot = await service.inspect({
      repository: "owner/repo",
      branch: "main",
      paths: ["src/math.ts"],
      signal,
    });
    repo.head = "d".repeat(40);
    const file = snapshot.files[0]!;
    const result = await service.apply({
      snapshot,
      signal,
      message: "Fix",
      plan: {
        version: 1,
        planId: "p",
        taskId: "t",
        baseSha: snapshot.headSha,
        snapshotFingerprint: snapshot.fingerprint,
        operations: [{
          kind: "replace",
          path: file.path,
          expectedSha256: file.sha256,
          content: "x",
        }],
      },
    });
    expect(result).toMatchObject({
      status: "REJECTED",
      code: "STALE_REMOTE_HEAD",
    });
  });
});

describe("repository intelligence", () => {
  it("extracts symbols, imports, tests and instructions and ranks relevant files", async () => {
    const snapshot = await createRepositorySnapshot({
      repository: "owner/repo",
      branch: "main",
      headSha: HEAD,
      files: [
        {
          path: "src/math.ts",
          content: "export function add(a:number,b:number){return a+b}\n",
        },
        {
          path: "src/math.test.ts",
          content: "import { add } from './math';\nexpect(add(1,2)).toBe(3);\n",
        },
        { path: "AGENTS.md", content: "Run tests.\n" },
      ],
    });

    const intel = buildRepositoryIntelligence(snapshot);
    expect(intel.symbols.some((symbol) => symbol.name === "add")).toBe(true);
    expect(intel.testPaths).toContain("src/math.test.ts");
    expect(intel.instructionPaths).toContain("AGENTS.md");

    const map = buildRepositoryMap(snapshot, "fix add math tests");
    expect(map.entries[0]?.path).toContain("math");
    expect(map.headSha).toBe(HEAD);
  });
});

describe("verification runner", () => {
  it("fails when any selected gate fails and hashes command output", async () => {
    const plan = {
      changedPaths: ["src/a.ts"],
      commands: [
        {
          id: "typecheck",
          cwd: ".",
          command: "tsc",
          phase: "mandatory" as const,
          reason: "types",
        },
        {
          id: "tests",
          cwd: ".",
          command: "test",
          phase: "regression" as const,
          reason: "regression",
        },
      ],
      mandatoryCommandIds: ["typecheck"],
    };

    const evidence = await runVerificationPlan(
      plan,
      {
        async execute(command) {
          return {
            commandId: command.id,
            exitCode: command.id === "tests" ? 1 : 0,
            stdout: command.id,
            stderr: "",
            startedAt: 1,
            completedAt: 2,
          };
        },
      },
      new AbortController().signal,
    );

    expect(evidence.status).toBe("FAIL");
    expect(evidence.failedCommandIds).toEqual(["tests"]);
    expect(evidence.results[0]?.outputSha256).toMatch(/^[a-f0-9]{64}$/);
  });
});

describe("diff review", () => {
  it("rejects disabling tests and reducing assertions", async () => {
    const snapshot = await createRepositorySnapshot({
      repository: "owner/repo",
      branch: "main",
      headSha: HEAD,
      files: [{
        path: "src/a.test.ts",
        content: "expect(a()).toBe(1);\nexpect(b()).toBe(2);\n",
      }],
    });
    const file = snapshot.files[0]!;
    const patch = await applyPatchPlan(snapshot, {
      version: 1,
      planId: "p",
      taskId: "t",
      baseSha: HEAD,
      snapshotFingerprint: snapshot.fingerprint,
      operations: [{
        kind: "replace",
        path: file.path,
        expectedSha256: file.sha256,
        content: "test.skip('x',()=>{});\nexpect(a()).toBe(1);\n",
      }],
    });

    expect(patch.status).toBe("APPLIED");
    if (patch.status !== "APPLIED") return;
    const review = reviewCandidateDiff(snapshot, patch.candidate);
    expect(review.status).toBe("REJECT");
    expect(review.findings.map((finding) => finding.code)).toEqual(
      expect.arrayContaining(["TEST_DISABLED", "TEST_ASSERTION_REDUCTION"]),
    );
  });
});

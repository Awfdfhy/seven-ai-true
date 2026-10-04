import { describe, expect, it } from "vitest";
import {
  DEFAULT_CODING_PATH_POLICY,
  applyPatchPlan,
  createCodingRun,
  createRepositorySnapshot,
  selectVerificationPlan,
  transitionCodingRun,
} from "./index";

const HEAD = "a".repeat(40);

async function fixture() {
  return createRepositorySnapshot({
    repository: "Awfdfhy/seven-ai-true",
    branch: "coding-system-v1",
    headSha: HEAD,
    capturedAt: "2026-10-05T00:50:00+03:00",
    files: [
      { path: "remake/src/a.ts", content: "export const value = 1;\n" },
      { path: "remake/src/b.ts", content: "export const second = 2;\n" },
    ],
  });
}

describe("coding workspace truth", () => {
  it("fingerprints a stable exact-SHA snapshot", async () => {
    const first = await fixture();
    const second = await fixture();
    expect(first.headSha).toBe(HEAD);
    expect(first.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(first.fingerprint).toBe(second.fingerprint);
  });

  it("rejects unsafe repository paths", async () => {
    await expect(
      createRepositorySnapshot({
        repository: "Awfdfhy/seven-ai-true",
        branch: "x",
        headSha: HEAD,
        files: [{ path: "../secret", content: "x" }],
      }),
    ).rejects.toThrow(/unsafe repository path/i);
  });
});

describe("transactional patching", () => {
  it("applies a multi-file plan atomically and emits rollback evidence", async () => {
    const snapshot = await fixture();
    const a = snapshot.files.find((file) => file.path.endsWith("a.ts"))!;
    const b = snapshot.files.find((file) => file.path.endsWith("b.ts"))!;
    const result = await applyPatchPlan(snapshot, {
      version: 1,
      planId: "plan-1",
      taskId: "task-1",
      baseSha: snapshot.headSha,
      snapshotFingerprint: snapshot.fingerprint,
      operations: [
        { kind: "patch", path: a.path, expectedSha256: a.sha256, edits: [{ find: "value = 1", replace: "value = 3" }] },
        { kind: "replace", path: b.path, expectedSha256: b.sha256, content: "export const second = 4;\n" },
      ],
    });
    expect(result.status).toBe("APPLIED");
    if (result.status !== "APPLIED") return;
    expect(result.candidate.changes).toHaveLength(2);
    expect(result.rollback.fingerprint).toBe(snapshot.fingerprint);
    expect(result.candidate.candidateFingerprint).not.toBe(snapshot.fingerprint);
  });

  it("rejects stale head before any edit", async () => {
    const snapshot = await fixture();
    const file = snapshot.files[0]!;
    const result = await applyPatchPlan(snapshot, {
      version: 1,
      planId: "plan-stale",
      taskId: "task-1",
      baseSha: "b".repeat(40),
      snapshotFingerprint: snapshot.fingerprint,
      operations: [{ kind: "replace", path: file.path, expectedSha256: file.sha256, content: "changed" }],
    });
    expect(result).toMatchObject({ status: "REJECTED", code: "STALE_HEAD" });
  });

  it("rejects source-file drift even when the plan head is unchanged", async () => {
    const snapshot = await fixture();
    const file = snapshot.files[0]!;
    const result = await applyPatchPlan(snapshot, {
      version: 1,
      planId: "plan-file-stale",
      taskId: "task-1",
      baseSha: snapshot.headSha,
      snapshotFingerprint: snapshot.fingerprint,
      operations: [{ kind: "replace", path: file.path, expectedSha256: "0".repeat(64), content: "changed" }],
    });
    expect(result).toMatchObject({ status: "REJECTED", code: "STALE_FILE", path: file.path });
  });

  it("enforces the byte budget against resulting file bytes, not only replacement text", async () => {
    const snapshot = await createRepositorySnapshot({
      repository: "Awfdfhy/seven-ai-true",
      branch: "x",
      headSha: HEAD,
      files: [{ path: "remake/src/large.ts", content: "x".repeat(64) }],
    });
    const file = snapshot.files[0]!;
    const result = await applyPatchPlan(snapshot, {
      version: 1,
      planId: "plan-budget",
      taskId: "task-1",
      baseSha: snapshot.headSha,
      snapshotFingerprint: snapshot.fingerprint,
      operations: [{ kind: "patch", path: file.path, expectedSha256: file.sha256, edits: [{ find: "x", replace: "y" }] }],
    }, { ...DEFAULT_CODING_PATH_POLICY, maxTotalWrittenBytes: 32 });
    expect(result).toMatchObject({ status: "REJECTED", code: "PATCH_ANCHOR_AMBIGUOUS" });

    const singleAnchor = await createRepositorySnapshot({
      repository: "Awfdfhy/seven-ai-true",
      branch: "x",
      headSha: HEAD,
      files: [{ path: "remake/src/large.ts", content: `anchor${"x".repeat(64)}` }],
    });
    const target = singleAnchor.files[0]!;
    const oversized = await applyPatchPlan(singleAnchor, {
      version: 1,
      planId: "plan-budget-2",
      taskId: "task-1",
      baseSha: singleAnchor.headSha,
      snapshotFingerprint: singleAnchor.fingerprint,
      operations: [{ kind: "patch", path: target.path, expectedSha256: target.sha256, edits: [{ find: "anchor", replace: "a" }] }],
    }, { ...DEFAULT_CODING_PATH_POLICY, maxTotalWrittenBytes: 32 });
    expect(oversized).toMatchObject({ status: "REJECTED", code: "BLAST_RADIUS_EXCEEDED" });
  });

  it("rejects ambiguous exact-edit anchors", async () => {
    const snapshot = await createRepositorySnapshot({
      repository: "Awfdfhy/seven-ai-true",
      branch: "x",
      headSha: HEAD,
      files: [{ path: "remake/src/a.ts", content: "same\nsame\n" }],
    });
    const file = snapshot.files[0]!;
    const result = await applyPatchPlan(snapshot, {
      version: 1,
      planId: "plan-ambiguous",
      taskId: "task-1",
      baseSha: snapshot.headSha,
      snapshotFingerprint: snapshot.fingerprint,
      operations: [{ kind: "patch", path: file.path, expectedSha256: file.sha256, edits: [{ find: "same", replace: "new" }] }],
    });
    expect(result).toMatchObject({ status: "REJECTED", code: "PATCH_ANCHOR_AMBIGUOUS" });
  });

  it("requires external authority for integration contracts", async () => {
    const snapshot = await createRepositorySnapshot({
      repository: "Awfdfhy/seven-ai-true",
      branch: "x",
      headSha: HEAD,
      files: [{ path: "docs/seven-master/INTEGRATION_CONTRACTS.md", content: "contract" }],
    });
    const file = snapshot.files[0]!;
    const result = await applyPatchPlan(snapshot, {
      version: 1,
      planId: "plan-contract",
      taskId: "task-1",
      baseSha: snapshot.headSha,
      snapshotFingerprint: snapshot.fingerprint,
      operations: [{ kind: "replace", path: file.path, expectedSha256: file.sha256, content: "changed" }],
    }, DEFAULT_CODING_PATH_POLICY);
    expect(result).toMatchObject({ status: "REJECTED", code: "CRITICAL_PATH_REQUIRES_AUTHORITY" });
  });
});

describe("deterministic verification policy", () => {
  it("adds mandatory typecheck/build and regression tests for coding runtime changes", () => {
    const plan = selectVerificationPlan(["remake/src/application/coding/patch-transaction.ts"]);
    expect(plan.commands.map((command) => command.id)).toEqual([
      "repository-diff-check",
      "coding-unit",
      "remake-typecheck",
      "remake-tests",
      "remake-build",
    ]);
    expect(plan.mandatoryCommandIds).toEqual(["repository-diff-check", "remake-typecheck", "remake-build"]);
  });

  it("covers documentation-only changes with a deterministic diff gate", () => {
    const plan = selectVerificationPlan(["docs/coding-system/ARCHITECTURE.md"]);
    expect(plan.commands.map((command) => command.id)).toEqual(["repository-diff-check"]);
    expect(plan.mandatoryCommandIds).toEqual(["repository-diff-check"]);
  });

  it("does not let supplemental model choices remove mandatory gates", () => {
    const plan = selectVerificationPlan(
      ["remake/src/application/coding/index.ts"],
      undefined,
      [{ id: "model-smoke", cwd: "remake", command: "echo smoke", phase: "targeted", reason: "supplemental" }],
    );
    expect(plan.mandatoryCommandIds).toContain("remake-typecheck");
    expect(plan.mandatoryCommandIds).toContain("remake-build");
    expect(plan.commands.map((command) => command.id)).toContain("model-smoke");
  });
});

describe("coding lifecycle", () => {
  it("enforces Understand -> Inspect -> Research -> Plan -> Edit -> Test -> Verify -> Review -> Document", () => {
    let run = createCodingRun({ runId: "run-1", taskId: "task-1", acceptanceCriteria: ["tests pass"] });
    for (const stage of ["INSPECT", "RESEARCH", "PLAN", "EDIT", "TEST", "VERIFY", "REVIEW", "DOCUMENT", "COMPLETE"] as const) {
      run = transitionCodingRun(run, stage, { kind: `entered-${stage.toLowerCase()}`, summary: `Entered ${stage}.` });
    }
    expect(run.stage).toBe("COMPLETE");
    expect(run.history).toHaveLength(10);
  });

  it("rejects skipping directly from PLAN to VERIFY", () => {
    let run = createCodingRun({ runId: "run-2", taskId: "task-2", acceptanceCriteria: ["verified"] });
    run = transitionCodingRun(run, "INSPECT", { kind: "inspect", summary: "Inspected." });
    run = transitionCodingRun(run, "PLAN", { kind: "plan", summary: "Planned." });
    expect(() => transitionCodingRun(run, "VERIFY", { kind: "skip", summary: "Invalid skip." })).toThrow(/illegal coding transition/i);
  });
});

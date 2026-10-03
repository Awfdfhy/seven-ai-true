import { describe, expect, it } from "vitest";
import {
  canonicalPayloadDescriptor,
  createReleasePayloadManifest,
  evaluateReleaseGates,
  passGate,
  verifyInstalledArtifactIdentity,
  type ReleaseGateEvidence,
} from "../../release/release-assurance";
import { evaluateFinalClosure } from "../../release/final-closure";

const hashA = "a".repeat(64);
const hashB = "b".repeat(64);

function allPassing(identity: ReleaseGateEvidence): ReleaseGateEvidence[] {
  return [
    passGate("strict-compile", "ci:typecheck", "Strict TypeScript passed."),
    passGate("automated-tests", "ci:tests", "Automated tests passed."),
    passGate("android-bridge", "android:bridge", "Android bridge contract/device gate passed."),
    passGate("built-payload-hash", "sha256:built", "Built payload hash recorded."),
    identity,
    passGate("installed-smoke", "android:smoke", "Installed APK smoke passed."),
    passGate("critical-regressions", "bugs:none-open", "No blocker/critical regression is open."),
  ];
}

describe("Phase 12 release assurance / final closure", () => {
  it("builds a deterministic payload manifest independent of input file order", async () => {
    const one = await createReleasePayloadManifest({
      artifactId: "seven.ai",
      version: "3.0.0",
      files: [
        { path: "assets/b.js", sha256: hashB, sizeBytes: 20 },
        { path: "index.html", sha256: hashA, sizeBytes: 10 },
      ],
    });
    const two = await createReleasePayloadManifest({
      artifactId: "seven.ai",
      version: "3.0.0",
      files: [
        { path: "index.html", sha256: hashA, sizeBytes: 10 },
        { path: "assets/b.js", sha256: hashB, sizeBytes: 20 },
      ],
    });
    expect(one).toEqual(two);
    expect(one.files.map((file) => file.path)).toEqual(["assets/b.js", "index.html"]);
    expect(one.payloadSha256).toMatch(/^[a-f0-9]{64}$/);
    expect(Object.isFrozen(one.files)).toBe(true);
  });

  it("rejects unsafe or duplicated payload paths before a release hash is created", () => {
    expect(() => canonicalPayloadDescriptor({
      artifactId: "seven.ai",
      version: "3",
      files: [{ path: "../outside", sha256: hashA, sizeBytes: 1 }],
    })).toThrow();

    expect(() => canonicalPayloadDescriptor({
      artifactId: "seven.ai",
      version: "3",
      files: [
        { path: "index.html", sha256: hashA, sizeBytes: 1 },
        { path: "index.html", sha256: hashB, sizeBytes: 2 },
      ],
    })).toThrow();
  });

  it("requires exact installed artifact identity instead of trusting version labels alone", async () => {
    const manifest = await createReleasePayloadManifest({
      artifactId: "seven.ai",
      version: "3.0.0",
      files: [{ path: "index.html", sha256: hashA, sizeBytes: 10 }],
    });
    const pass = verifyInstalledArtifactIdentity(manifest, {
      artifactId: "seven.ai",
      version: "3.0.0",
      payloadSha256: manifest.payloadSha256,
    });
    expect(pass.state).toBe("PASS");

    const fail = verifyInstalledArtifactIdentity(manifest, {
      artifactId: "seven.ai",
      version: "3.0.0",
      payloadSha256: hashB,
    });
    expect(fail.state).toBe("FAIL");
  });

  it("never manufactures PASS when required release evidence is missing", () => {
    const report = evaluateReleaseGates([
      passGate("strict-compile", "ci:typecheck", "ok"),
      passGate("automated-tests", "ci:tests", "ok"),
    ]);
    expect(report.state).toBe("INCONCLUSIVE");
    expect(report.releaseReady).toBe(false);
    expect(report.gates.filter((gate) => gate.state === "INCONCLUSIVE").length).toBe(5);
  });

  it("FAIL outranks BLOCKED/INCONCLUSIVE and prevents release readiness", () => {
    const report = evaluateReleaseGates([
      { id: "strict-compile", state: "PASS", evidenceId: "a", detail: "ok" },
      { id: "automated-tests", state: "FAIL", evidenceId: "b", detail: "tests failed" },
      { id: "android-bridge", state: "BLOCKED", evidenceId: "c", detail: "device offline" },
    ]);
    expect(report.state).toBe("FAIL");
    expect(report.releaseReady).toBe(false);
  });

  it("marks release ready only when every required gate has explicit PASS evidence", async () => {
    const manifest = await createReleasePayloadManifest({
      artifactId: "seven.ai",
      version: "3.0.0",
      files: [{ path: "index.html", sha256: hashA, sizeBytes: 10 }],
    });
    const identity = verifyInstalledArtifactIdentity(manifest, {
      artifactId: manifest.artifactId,
      version: manifest.version,
      payloadSha256: manifest.payloadSha256,
    });
    const report = evaluateReleaseGates(allPassing(identity));
    expect(report.state).toBe("PASS");
    expect(report.releaseReady).toBe(true);
    expect(report.gates).toHaveLength(7);
  });

  it("final closure requires evidence-bearing COMPLETE records for all twelve phases", async () => {
    const manifest = await createReleasePayloadManifest({
      artifactId: "seven.ai",
      version: "3.0.0",
      files: [{ path: "index.html", sha256: hashA, sizeBytes: 10 }],
    });
    const identity = verifyInstalledArtifactIdentity(manifest, {
      artifactId: manifest.artifactId,
      version: manifest.version,
      payloadSha256: manifest.payloadSha256,
    });
    const phases = Array.from({ length: 12 }, (_, index) => ({
      phase: index + 1,
      state: "COMPLETE" as const,
      evidenceId: `phase-${index + 1}`,
    }));
    const pass = evaluateFinalClosure(phases, allPassing(identity));
    expect(pass.phasesComplete).toBe(true);
    expect(pass.state).toBe("PASS");

    const incomplete = evaluateFinalClosure(
      phases.map((phase) => phase.phase === 11 ? { ...phase, evidenceId: null } : phase),
      allPassing(identity),
    );
    expect(incomplete.phasesComplete).toBe(false);
    expect(incomplete.state).toBe("INCONCLUSIVE");
  });
});

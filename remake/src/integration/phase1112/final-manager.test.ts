import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { createSevenRuntime } from "../../kernel/seven-runtime";
import type { ThemeScheduler } from "../../ui/system/theme-service";
import {
  createReleasePayloadManifest,
  passGate,
  verifyInstalledArtifactIdentity,
  type ReleaseGateEvidence,
} from "../../release/release-assurance";
import { evaluateFinalClosure } from "../../release/final-closure";

const here = dirname(fileURLToPath(import.meta.url));
const srcRoot = resolve(here, "../..");
const hash = "a".repeat(64);

function phaseRecords() {
  return Array.from({ length: 12 }, (_, index) => ({
    phase: index + 1,
    state: "COMPLETE" as const,
    evidenceId: `phase-${index + 1}`,
  }));
}

function fullReleaseEvidence(identity: ReleaseGateEvidence): ReleaseGateEvidence[] {
  return [
    passGate("strict-compile", "ci:typecheck", "Strict compile passed."),
    passGate("automated-tests", "ci:tests", "Automated suite passed."),
    passGate("android-bridge", "android:bridge-device", "Android bridge device gate passed."),
    passGate("built-payload-hash", "artifact:payload-sha256", "Built payload hash recorded."),
    identity,
    passGate("installed-smoke", "android:installed-smoke", "Installed artifact smoke passed."),
    passGate("critical-regressions", "bugs:none-critical", "No BLOCKER/CRITICAL regression is open."),
  ];
}

describe("Final manager — Phases 11 + 12", () => {
  it("boots the normal runtime through one AppKernel and one ThemeService timer", async () => {
    const timers = new Map<number, () => void>();
    let nextId = 1;
    const scheduler: ThemeScheduler = {
      setTimeout(callback) {
        const id = nextId++;
        timers.set(id, callback);
        return id;
      },
      clearTimeout(handle) {
        timers.delete(handle as number);
      },
    };

    const runtime = createSevenRuntime({
      initialShell: { themePreference: "auto" },
      themeNow: () => new Date(2026, 9, 4, 12, 0, 0),
      themeScheduler: scheduler,
      diagnosticsNow: () => 100,
    });

    const first = runtime.kernel.start();
    const second = runtime.kernel.start();
    expect(first).toBe(second);
    expect((await first).status).toBe("running");
    expect(timers.size).toBe(1);
    expect(runtime.shell.getSnapshot().effectiveTheme).toBe("light");

    await runtime.kernel.start();
    expect(timers.size).toBe(1);
    expect(runtime.diagnostics.list().some((event) => event.name === "start_complete")).toBe(true);

    await runtime.kernel.shutdown();
    expect(timers.size).toBe(0);
    expect(runtime.kernel.snapshot().status).toBe("stopped");
  });

  it("supports interactive recovery after a normal-path theme boot failure", async () => {
    let valid = false;
    const runtime = createSevenRuntime({
      themeNow: () => valid ? new Date(2026, 9, 4, 12, 0, 0) : new Date(Number.NaN),
      themeScheduler: {
        setTimeout() { return 1; },
        clearTimeout() {},
      },
    });

    await expect(runtime.kernel.start()).rejects.toMatchObject({ code: "VALIDATION" });
    expect(runtime.kernel.snapshot().status).toBe("failed");

    valid = true;
    expect((await runtime.kernel.start()).status).toBe("running");
  });

  it("keeps React UI free of duplicate runtime-owner construction", () => {
    const app = readFileSync(resolve(srcRoot, "ui/App.tsx"), "utf8");
    const main = readFileSync(resolve(srcRoot, "main.tsx"), "utf8");

    expect(app).not.toMatch(/new\s+(TaskManager|ShellStore|ThemeService|AppKernel)\s*\(/);
    expect(main).toContain("createSevenRuntime");
    expect(main).toContain("runtime.kernel.start()");
    expect(main).toContain("<App runtime={runtime}");
  });

  it("keeps 12/12 implementation completion separate from missing real release evidence", async () => {
    const phases = phaseRecords();
    const incompleteRelease = [
      passGate("strict-compile", "ci:typecheck", "ok"),
      passGate("automated-tests", "ci:tests", "ok"),
      {
        id: "android-bridge" as const,
        state: "INCONCLUSIVE" as const,
        evidenceId: null,
        detail: "No installed remake Android bridge round-trip evidence.",
      },
      {
        id: "critical-regressions" as const,
        state: "PASS" as const,
        evidenceId: "ci:no-known-critical",
        detail: "No current CI blocker/critical regression.",
      },
    ];

    const current = evaluateFinalClosure(phases, incompleteRelease);
    expect(current.phasesComplete).toBe(true);
    expect(current.state).toBe("INCONCLUSIVE");
    expect(current.release.releaseReady).toBe(false);

    const manifest = await createReleasePayloadManifest({
      artifactId: "seven.remake",
      version: "3.0.0",
      files: [{ path: "index.html", sha256: hash, sizeBytes: 10 }],
    });
    const identity = verifyInstalledArtifactIdentity(manifest, {
      artifactId: manifest.artifactId,
      version: manifest.version,
      payloadSha256: manifest.payloadSha256,
    });
    const proven = evaluateFinalClosure(phases, fullReleaseEvidence(identity));
    expect(proven.state).toBe("PASS");
    expect(proven.release.releaseReady).toBe(true);
  });
});

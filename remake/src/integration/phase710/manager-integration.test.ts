import "fake-indexeddb/auto";
import { describe, expect, it } from "vitest";
import { TaskManager } from "../../core/task-manager";
import { AndroidBridgeClient } from "../../platform/android/android-bridge";
import { MockAndroidNativeTransport } from "../../platform/android/mock-android-transport";
import { AndroidPlatformService } from "../../application/android/android-platform-service";
import { GitHubAuthService } from "../../github/github-auth-service";
import { GitHubSelfDevService } from "../../github/self-dev-service";
import { RpgCanonService } from "../../rpg/rpg-canon-service";
import { IndexedDbRpgRepository, InMemoryRpgRepository } from "../../storage/rpg-repository";
import { ShellStore } from "../../ui/shell/shell-store";
import { ThemeService, type ThemeScheduler } from "../../ui/system/theme-service";

const baseSha = "a".repeat(40);
const commitSha = "b".repeat(40);

const codingVerification = {
  async verify(input: { repository: string; baseSha: string; files: readonly { path: string }[] }) {
    return {
      approved: true as const,
      repository: input.repository,
      baseSha: input.baseSha,
      verifiedPaths: input.files.map((file) => file.path),
      checks: ["typecheck", "tests"],
      evidenceId: "manager-evidence",
    };
  },
};

describe("Waves 7-10 manager integration", () => {
  it("isolates Android cancellation from concurrent GitHub and RPG work on one TaskManager", async () => {
    const tasks = new TaskManager();

    let releaseAndroid!: (value: unknown) => void;
    const androidPending = new Promise<unknown>((resolve) => { releaseAndroid = resolve; });
    const native = new MockAndroidNativeTransport(async () => androidPending);
    const android = new AndroidPlatformService(tasks, new AndroidBridgeClient(native));

    const auth = new GitHubAuthService({
      async refresh() {
        return { accessToken: "secret-token", expiresAt: 10_000, scopes: ["repo"] };
      },
    }, () => 100, 100);
    const github = new GitHubSelfDevService(tasks, auth, {
      async apply() {
        return { commitSha, changedPaths: ["src/a.ts"] };
      },
    }, codingVerification);

    const rpg = new RpgCanonService(tasks, new InMemoryRpgRepository(), () => 100);

    const androidRun = android.negotiateCapabilities();
    const githubRun = github.apply({
      repository: "owner/repo",
      baseSha,
      message: "Update",
      files: [{ path: "src/a.ts", content: "export const a = 1;" }],
    });
    const rpgRun = rpg.create({
      id: "world",
      packId: "pack",
      packVersion: "1",
      worldSessionId: "world-session",
      canonSessionId: "canon-session",
      rootBranchId: "main",
    });

    for (let index = 0; index < 12 && native.requests.length === 0; index += 1) {
      await Promise.resolve();
    }
    expect(native.requests).toHaveLength(1);
    const nativeRequestId = native.requests[0]?.requestId;
    androidRun.cancel("user");
    releaseAndroid({
      requestId: nativeRequestId,
      result: { ok: true, value: { schemaVersion: 1, capabilities: ["saf"] } },
    });

    await expect(androidRun.result).rejects.toMatchObject({ code: "CANCELLED" });
    expect(await githubRun.result).toEqual({ commitSha, changedPaths: ["src/a.ts"] });
    expect((await rpgRun.result).revision).toBe(0);
    expect(native.cancellations).toEqual([nativeRequestId]);
    expect(tasks.listActive()).toEqual([]);
  });

  it("keeps GitHub secret material out of public auth and task snapshots", async () => {
    const tasks = new TaskManager();
    const auth = new GitHubAuthService({
      async refresh() {
        return {
          accessToken: "ghp_extremely_secret_value",
          expiresAt: 10_000,
          scopes: ["repo"],
        };
      },
    }, () => 100, 100);
    let observedToken = "";
    const service = new GitHubSelfDevService(tasks, auth, {
      async apply(_input, accessToken) {
        observedToken = accessToken;
        return { commitSha, changedPaths: ["src/a.ts"] };
      },
    }, codingVerification);

    const run = service.apply({
      repository: "owner/repo",
      baseSha,
      message: "Safe change",
      files: [{ path: "src/a.ts", content: "x" }],
    });
    await run.result;

    expect(observedToken).toBe("ghp_extremely_secret_value");
    expect(JSON.stringify(auth.snapshot())).not.toContain(observedToken);
    expect(JSON.stringify(tasks.get(run.taskId))).not.toContain(observedToken);
  });

  it("preserves authoritative RPG state across restart while shell UI state remains separate", async () => {
    const databaseName = `waves710-rpg-${crypto.randomUUID()}`;
    const firstRepo = new IndexedDbRpgRepository(databaseName);
    const first = new RpgCanonService(new TaskManager(), firstRepo, () => 200);
    await first.create({
      id: "valen",
      packId: "valen-pack",
      packVersion: "33",
      worldSessionId: "world-1",
      canonSessionId: "canon-1",
      rootBranchId: "main",
    }).result;
    const durable = await first.apply("valen", {
      expectedRevision: 0,
      state: { location: "Royal Academy" },
      createBranch: { id: "tournament", label: "Tournament", activate: true },
    }).result;
    await firstRepo.close();

    const shell = new ShellStore();
    shell.setWorkspace("world");
    shell.setLocale("ar");
    shell.setThemePreference("light");

    const secondRepo = new IndexedDbRpgRepository(databaseName);
    const second = new RpgCanonService(new TaskManager(), secondRepo, () => 300);
    const restored = await second.load("valen");

    expect(restored).toEqual(durable);
    expect(restored?.state.location).toBe("Royal Academy");
    expect(restored?.activeBranchId).toBe("tournament");
    expect(shell.getSnapshot()).toMatchObject({
      activeWorkspace: "world",
      locale: "ar",
      direction: "rtl",
      themePreference: "light",
    });
    expect(JSON.stringify(shell.getSnapshot())).not.toContain("Royal Academy");
    await secondRepo.close();
  });

  it("theme scheduler remains single-owner while platform capability truth changes independently", async () => {
    const shell = new ShellStore({ themePreference: "auto" });
    const scheduled = new Map<number, () => void>();
    let nextId = 1;
    const scheduler: ThemeScheduler = {
      setTimeout(callback) {
        const id = nextId++;
        scheduled.set(id, callback);
        return id;
      },
      clearTimeout(handle) {
        scheduled.delete(handle as number);
      },
    };
    const theme = new ThemeService(shell, () => new Date(2026, 9, 3, 12, 0, 0), scheduler);
    theme.start();
    expect(scheduled.size).toBe(1);

    const native = new MockAndroidNativeTransport(async (request) => ({
      requestId: request.requestId,
      result: {
        ok: true,
        value: { schemaVersion: 1, capabilities: ["saf", "lifecycle"] },
      },
    }));
    const android = new AndroidPlatformService(new TaskManager(), new AndroidBridgeClient(native));
    expect((await android.negotiateCapabilities().result).capabilities).toEqual(["saf", "lifecycle"]);

    theme.onVisibilityResume();
    expect(scheduled.size).toBe(1);
    expect(shell.getSnapshot().effectiveTheme).toBe("light");
    theme.stop();
    expect(scheduled.size).toBe(0);
  });
});

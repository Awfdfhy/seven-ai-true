import { describe, expect, it, vi } from "vitest";
import { TaskManager } from "../../core/task-manager";
import { GitHubAuthService } from "../../github/github-auth-service";
import { GitHubSelfDevService } from "../../github/self-dev-service";

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
      evidenceId: "test-evidence",
    };
  },
};

describe("Phase 8 GitHub Self-Dev", () => {
  it("shares one refresh across concurrent callers and never exposes the token in snapshots", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const refresh = vi.fn(async () => {
      await gate;
      return {
        accessToken: "ghp_super_secret_token",
        expiresAt: 10_000,
        scopes: ["repo"],
      };
    });
    const auth = new GitHubAuthService({ refresh }, () => 100, 100);
    const c1 = new AbortController();
    const c2 = new AbortController();
    const one = auth.withAccessToken(c1.signal, async (token) => token.length);
    const two = auth.withAccessToken(c2.signal, async (token) => token.slice(0, 3));
    await Promise.resolve();
    expect(refresh).toHaveBeenCalledTimes(1);
    release();
    expect(await one).toBe("ghp_super_secret_token".length);
    expect(await two).toBe("ghp");
    const snapshot = auth.snapshot();
    expect(snapshot.status).toBe("connected");
    expect(JSON.stringify(snapshot)).not.toContain("ghp_super_secret_token");
    expect(snapshot.scopes).toEqual(["repo"]);
  });

  it("refreshes before expiry skew instead of using a nearly expired token", async () => {
    let now = 100;
    let index = 0;
    const refresh = vi.fn(async () => {
      index += 1;
      return {
        accessToken: `token-${index}`,
        expiresAt: index === 1 ? 1_000 : 5_000,
        scopes: ["repo"],
      };
    });
    const auth = new GitHubAuthService({ refresh }, () => now, 200);
    const signal = new AbortController().signal;
    expect(await auth.withAccessToken(signal, async (token) => token)).toBe("token-1");
    now = 850;
    expect(await auth.withAccessToken(signal, async (token) => token)).toBe("token-2");
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("isolates caller cancellation from a shared credential refresh", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const refresh = vi.fn(async () => {
      await gate;
      return { accessToken: "token", expiresAt: 5_000, scopes: ["repo"] };
    });
    const auth = new GitHubAuthService({ refresh }, () => 100, 100);
    const first = new AbortController();
    const second = new AbortController();
    const one = auth.withAccessToken(first.signal, async () => "one");
    const two = auth.withAccessToken(second.signal, async () => "two");
    first.abort();
    release();
    await expect(one).rejects.toMatchObject({ name: "AbortError" });
    expect(await two).toBe("two");
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("applies an exact-SHA bounded change set and rejects unexpected changed paths", async () => {
    const auth = new GitHubAuthService({
      async refresh() {
        return { accessToken: "token", expiresAt: 10_000, scopes: ["repo"] };
      },
    }, () => 100, 100);

    const mutation = {
      apply: vi.fn(async () => ({
        commitSha,
        changedPaths: ["src/a.ts"],
      })),
    };
    const service = new GitHubSelfDevService(new TaskManager(), auth, mutation, codingVerification);
    const result = await service.apply({
      repository: "owner/repo",
      baseSha,
      message: "Update a",
      files: [{ path: "src/a.ts", content: "export const a = 1;" }],
    }).result;
    expect(result).toEqual({ commitSha, changedPaths: ["src/a.ts"] });
    expect(mutation.apply).toHaveBeenCalledTimes(1);

    const hostile = new GitHubSelfDevService(new TaskManager(), auth, {
      async apply() {
        return { commitSha, changedPaths: ["src/a.ts", "src/injected.ts"] };
      },
    }, codingVerification);
    await expect(hostile.apply({
      repository: "owner/repo",
      baseSha,
      message: "Update a",
      files: [{ path: "src/a.ts", content: "x" }],
    }).result).rejects.toMatchObject({ code: "PROVIDER" });
  });

  it("blocks repository escape and credential/secret paths before token acquisition", () => {
    const refresh = vi.fn(async () => ({
      accessToken: "token",
      expiresAt: 10_000,
      scopes: ["repo"],
    }));
    const auth = new GitHubAuthService({ refresh }, () => 100, 100);
    const service = new GitHubSelfDevService(new TaskManager(), auth, {
      async apply() { return { commitSha, changedPaths: ["x"] }; },
    }, codingVerification);

    expect(() => service.apply({
      repository: "owner/repo",
      baseSha,
      message: "bad",
      files: [{ path: "../outside", content: "x" }],
    })).toThrow();

    expect(() => service.apply({
      repository: "owner/repo",
      baseSha,
      message: "bad",
      files: [{ path: ".env.production", content: "SECRET=x" }],
    })).toThrow();

    expect(refresh).not.toHaveBeenCalled();
  });

  it("fails closed before credentials or mutation when Coding verification is missing or rejects", async () => {
    const refresh = vi.fn(async () => ({ accessToken: "token", expiresAt: 10_000, scopes: ["repo"] }));
    const auth = new GitHubAuthService({ refresh }, () => 100, 100);
    const mutation = { apply: vi.fn(async () => ({ commitSha, changedPaths: ["src/a.ts"] })) };
    const input = {
      repository: "owner/repo",
      baseSha,
      message: "Update",
      files: [{ path: "src/a.ts", content: "x" }],
    };

    const missing = new GitHubSelfDevService(new TaskManager(), auth, mutation);
    await expect(missing.apply(input).result).rejects.toMatchObject({ code: "TOOL" });
    expect(refresh).not.toHaveBeenCalled();
    expect(mutation.apply).not.toHaveBeenCalled();

    const rejected = new GitHubSelfDevService(new TaskManager(), auth, mutation, {
      async verify(value) {
        return {
          approved: false,
          repository: value.repository,
          baseSha: value.baseSha,
          verifiedPaths: value.files.map((file) => file.path),
          checks: ["tests"],
          evidenceId: "rejected",
        };
      },
    });
    await expect(rejected.apply(input).result).rejects.toMatchObject({ code: "TOOL" });
    expect(refresh).not.toHaveBeenCalled();
    expect(mutation.apply).not.toHaveBeenCalled();
  });

  it("normalizes malformed Coding identity evidence before credentials are touched", async () => {
    const refresh = vi.fn(async () => ({
      accessToken: "token",
      expiresAt: 10_000,
      scopes: ["repo"],
    }));
    const auth = new GitHubAuthService({ refresh }, () => 100, 100);
    const mutation = { apply: vi.fn(async () => ({ commitSha, changedPaths: ["src/a.ts"] })) };
    const service = new GitHubSelfDevService(new TaskManager(), auth, mutation, {
      async verify(input) {
        return {
          approved: true,
          repository: input.repository,
          baseSha: undefined as unknown as string,
          verifiedPaths: input.files.map((file) => file.path),
          checks: ["tests"],
          evidenceId: "malformed",
        };
      },
    });

    await expect(service.apply({
      repository: "owner/repo",
      baseSha,
      message: "Update",
      files: [{ path: "src/a.ts", content: "x" }],
    }).result).rejects.toMatchObject({
      code: "TOOL",
    });
    expect(refresh).not.toHaveBeenCalled();
    expect(mutation.apply).not.toHaveBeenCalled();
  });

  it("cancellation prevents a late GitHub mutation from becoming successful task truth", async () => {
    const auth = new GitHubAuthService({
      async refresh() {
        return { accessToken: "token", expiresAt: 10_000, scopes: ["repo"] };
      },
    }, () => 100, 100);
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const service = new GitHubSelfDevService(new TaskManager(), auth, {
      async apply() {
        await gate;
        return { commitSha, changedPaths: ["src/a.ts"] };
      },
    }, codingVerification);
    const run = service.apply({
      repository: "owner/repo",
      baseSha,
      message: "Update",
      files: [{ path: "src/a.ts", content: "x" }],
    });
    await Promise.resolve();
    run.cancel();
    release();
    await expect(run.result).rejects.toMatchObject({ code: "CANCELLED" });
  });
});

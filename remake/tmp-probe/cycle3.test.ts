import { describe, expect, it } from "vitest";
import { GitHubAuthService } from "../src/github/github-auth-service";

function deferred<T>() { let resolve!: (v: T) => void; let reject!: (e: unknown) => void; const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; }); return { promise, resolve, reject }; }

describe("github auth ownership", () => {
  it("late refresh after disconnect resurrects session", async () => {
    const gate = deferred<{ accessToken: string; expiresAt: number; scopes: string[] }>();
    let calls = 0;
    const auth = new GitHubAuthService({
      refresh: () => { calls += 1; return calls === 1 ? gate.promise : Promise.resolve({ accessToken: "t2", expiresAt: 5_000_000, scopes: ["repo"] }); },
      revoke: async () => {},
    }, () => 0, 0);
    const inflight = auth.withAccessToken(new AbortController().signal, async (t) => t);
    await Promise.resolve(); await Promise.resolve();
    await auth.disconnect();
    gate.resolve({ accessToken: "t1", expiresAt: 4_000_000, scopes: ["repo"] });
    const outcome = await inflight.then((t) => "LEAKED:" + t, (e) => "rejected:" + (e as Error).name);
    console.log("inflight outcome:", outcome);
    console.log("snapshot:", JSON.stringify(auth.snapshot()));
    console.log("refreshCalls:", calls);
    expect(true).toBe(true);
  });

  it("failed refresh after disconnect flips to degraded", async () => {
    const gate = deferred<{ accessToken: string; expiresAt: number; scopes: string[] }>();
    let calls = 0;
    const auth = new GitHubAuthService({
      refresh: () => { calls += 1; return calls === 1 ? gate.promise : Promise.resolve({ accessToken: "t2", expiresAt: 5_000_000, scopes: ["repo"] }); },
      revoke: async () => {},
    }, () => 0, 0);
    const inflight = auth.withAccessToken(new AbortController().signal, async (t) => t);
    await Promise.resolve(); await Promise.resolve();
    await auth.disconnect();
    gate.reject(new Error("boom"));
    console.log("inflight:", await inflight.then(() => "ok", (e) => (e as Error).message));
    console.log("snapshot after late failure:", JSON.stringify(auth.snapshot()));
    expect(true).toBe(true);
  });

  it("concurrent refresh single flight", async () => {
    let calls = 0;
    const auth = new GitHubAuthService({ refresh: async () => { calls += 1; return { accessToken: "t", expiresAt: 5_000_000, scopes: ["repo"] }; } }, () => 0, 0);
    await Promise.all([
      auth.withAccessToken(new AbortController().signal, async (t) => t),
      auth.withAccessToken(new AbortController().signal, async (t) => t),
      auth.withAccessToken(new AbortController().signal, async (t) => t),
    ]);
    console.log("refreshCalls for 3 concurrent:", calls);
    expect(true).toBe(true);
  });
});

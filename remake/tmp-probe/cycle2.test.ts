import { describe, expect, it } from "vitest";
import { AndroidPlatformService } from "../src/application/android/android-platform-service";
import { AndroidBridgeClient } from "../src/platform/android/android-bridge";
import { TaskManager } from "../src/core/task-manager";

function deferred<T>() { let resolve!: (v: T) => void; const promise = new Promise<T>((r) => { resolve = r; }); return { promise, resolve }; }

describe("SAF ordering", () => {
  it("both concurrent, no waiting", async () => {
    const tasks = new TaskManager();
    const calls: string[] = [];
    const transport = {
      invoke(request: { requestId: string; method: string; payload: unknown }) {
        calls.push(request.method);
        return Promise.resolve({ requestId: request.requestId, result: { ok: true as const, value: { released: true } } });
      },
      cancel: () => {},
    };
    const service = new AndroidPlatformService(tasks, new AndroidBridgeClient(transport as any));
    const uri = "content://x/1";
    const p = service.persistSafGrant({ uri, read: true, write: false, persisted: false, issuedAt: 1 });
    const r = service.releaseSafGrant(uri);
    const out = await Promise.allSettled([p.result, r.result]);
    console.log("concurrent both:", out.map((x) => x.status).join(","));
    console.log("calls:", calls.join(","));
    expect(true).toBe(true);
  });

  it("release after persist (sequential)", async () => {
    const tasks = new TaskManager();
    const calls: string[] = [];
    const transport = {
      invoke(request: { requestId: string; method: string; payload: unknown }) {
        calls.push(request.method);
        return Promise.resolve({ requestId: request.requestId, result: { ok: true as const, value: { released: true } } });
      },
      cancel: () => {},
    };
    const service = new AndroidPlatformService(tasks, new AndroidBridgeClient(transport as any));
    const uri = "content://x/2";
    const p = await service.persistSafGrant({ uri, read: true, write: false, persisted: false, issuedAt: 1 }).result.catch((e) => "persist-err:" + (e as Error).name);
    const r = await service.releaseSafGrant(uri).result.catch((e) => "release-err:" + (e as Error).name);
    console.log("sequential persist:", JSON.stringify(p), "release:", JSON.stringify(r));
    console.log("calls:", calls.join(","));
    expect(true).toBe(true);
  });
});

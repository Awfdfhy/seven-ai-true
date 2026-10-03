import { describe, expect, it } from "vitest";
import { TaskManager } from "../../core/task-manager";
import { AndroidBridgeClient } from "../../platform/android/android-bridge";
import { MockAndroidNativeTransport } from "../../platform/android/mock-android-transport";
import { AndroidPlatformService } from "../../application/android/android-platform-service";

describe("Phase 7 Android bridge", () => {
  it("correlates typed capability responses to the exact request id", async () => {
    const transport = new MockAndroidNativeTransport(async (request) => ({
      requestId: request.requestId,
      result: {
        ok: true,
        value: {
          schemaVersion: 1,
          capabilities: ["saf", "secure-storage", "lifecycle"],
        },
      },
    }));
    const service = new AndroidPlatformService(new TaskManager(), new AndroidBridgeClient(transport));
    const result = await service.negotiateCapabilities().result;
    expect(result.capabilities).toEqual(["saf", "secure-storage", "lifecycle"]);
    expect(transport.requests[0]?.method).toBe("platform.capabilities");
  });

  it("rejects a response wired to another request id", async () => {
    const transport = new MockAndroidNativeTransport(async () => ({
      requestId: "wrong-request",
      result: { ok: true, value: { schemaVersion: 1, capabilities: [] } },
    }));
    const bridge = new AndroidBridgeClient(transport);
    await expect(
      bridge.invoke("platform.capabilities", {}, new AbortController().signal),
    ).rejects.toMatchObject({ code: "BRIDGE" });
  });

  it("maps structured native failure without exposing a raw transport exception", async () => {
    const transport = new MockAndroidNativeTransport(async (request) => ({
      requestId: request.requestId,
      result: {
        ok: false,
        error: {
          code: "SEVEN_SAF_DENIED",
          message: "Permission denied.",
          retryable: false,
        },
      },
    }));
    const bridge = new AndroidBridgeClient(transport);
    await expect(
      bridge.invoke("saf.persistGrant", {}, new AbortController().signal),
    ).rejects.toMatchObject({
      code: "BRIDGE",
      message: "Permission denied.",
      retryable: false,
    });
  });

  it("maps JS cancellation to the exact native request token and ignores late success", async () => {
    let release!: (value: unknown) => void;
    const pending = new Promise<unknown>((resolve) => { release = resolve; });
    const transport = new MockAndroidNativeTransport(async () => pending);
    const service = new AndroidPlatformService(new TaskManager(), new AndroidBridgeClient(transport));
    const run = service.negotiateCapabilities();
    for (let index = 0; index < 12 && transport.requests.length === 0; index += 1) {
      await Promise.resolve();
    }
    expect(transport.requests).toHaveLength(1);
    const requestId = transport.requests[0]?.requestId;
    expect(requestId).toBeTruthy();
    run.cancel("user");
    release({
      requestId,
      result: { ok: true, value: { schemaVersion: 1, capabilities: [] } },
    });
    await expect(run.result).rejects.toMatchObject({ code: "CANCELLED" });
    expect(transport.cancellations).toEqual([requestId]);
  });

  it("validates SAF grants as content URIs and verifies native grant truth", async () => {
    const transport = new MockAndroidNativeTransport(async (request) => ({
      requestId: request.requestId,
      result: {
        ok: true,
        value: {
          schemaVersion: 1,
          uri: (request.payload as { uri: string }).uri,
          read: true,
          write: true,
          persisted: true,
          issuedAt: 50,
        },
      },
    }));
    const service = new AndroidPlatformService(new TaskManager(), new AndroidBridgeClient(transport));
    const grant = await service.persistSafGrant({
      uri: "content://com.android.providers.downloads.documents/tree/primary%3ADownload",
      read: true,
      write: true,
      persisted: false,
      issuedAt: 10,
    }).result;
    expect(grant.persisted).toBe(true);
    expect(grant.uri).toContain("content://");
    expect(() => service.persistSafGrant({
      uri: "file:///sdcard/private.txt",
      read: true,
      write: false,
      persisted: false,
      issuedAt: 1,
    })).toThrow();
  });

  it("rejects malformed native capability lists instead of trusting transport payloads", async () => {
    const transport = new MockAndroidNativeTransport(async (request) => ({
      requestId: request.requestId,
      result: {
        ok: true,
        value: {
          schemaVersion: 1,
          capabilities: ["saf", "saf"],
        },
      },
    }));
    const service = new AndroidPlatformService(new TaskManager(), new AndroidBridgeClient(transport));
    await expect(service.negotiateCapabilities().result).rejects.toMatchObject({ code: "BRIDGE" });
  });
});

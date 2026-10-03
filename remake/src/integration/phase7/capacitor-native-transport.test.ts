import { afterEach, describe, expect, it, vi } from "vitest";
import {
  CapacitorAndroidNativeTransport,
  createCapacitorAndroidNativeTransport,
  type SevenRemakeNativePlugin,
} from "../../platform/android/capacitor-native-transport";
import { createBridgeRequest } from "../../platform/android/contracts";

describe("Capacitor Android native transport", () => {
  afterEach(() => {
    delete (globalThis as typeof globalThis & { Capacitor?: unknown }).Capacitor;
  });

  it("forwards the exact typed request envelope to the native plugin", async () => {
    const dispatch = vi.fn(async ({ request }: { request: unknown }) => ({
      requestId: (request as { requestId: string }).requestId,
      result: { ok: true, value: { schemaVersion: 1, capabilities: ["saf"] } },
    }));
    const cancel = vi.fn(async () => undefined);
    const plugin: SevenRemakeNativePlugin = { dispatch, cancel };
    const transport = new CapacitorAndroidNativeTransport(plugin);
    const request = createBridgeRequest("platform.capabilities", {}, "request-1");

    const response = await transport.invoke(request);

    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith({ request });
    expect(response).toMatchObject({ requestId: "request-1", result: { ok: true } });
  });

  it("forwards cancellation using the exact request id", async () => {
    const plugin: SevenRemakeNativePlugin = {
      dispatch: vi.fn(async () => ({})),
      cancel: vi.fn(async () => undefined),
    };
    const transport = new CapacitorAndroidNativeTransport(plugin);

    await transport.cancel("request-2");

    expect(plugin.cancel).toHaveBeenCalledWith({ requestId: "request-2" });
  });

  it("creates a transport only for an Android native Capacitor runtime with the plugin", () => {
    const plugin: SevenRemakeNativePlugin = {
      dispatch: vi.fn(async () => ({})),
      cancel: vi.fn(async () => undefined),
    };
    (globalThis as typeof globalThis & { Capacitor?: unknown }).Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => "android",
      Plugins: { SevenRemakeNative: plugin },
    };

    expect(createCapacitorAndroidNativeTransport()).toBeInstanceOf(
      CapacitorAndroidNativeTransport,
    );
  });

  it("does not invent Android availability in browser or missing-plugin environments", () => {
    (globalThis as typeof globalThis & { Capacitor?: unknown }).Capacitor = {
      isNativePlatform: () => false,
      getPlatform: () => "web",
      Plugins: {},
    };
    expect(createCapacitorAndroidNativeTransport()).toBeNull();

    (globalThis as typeof globalThis & { Capacitor?: unknown }).Capacitor = {
      isNativePlatform: () => true,
      getPlatform: () => "android",
      Plugins: {},
    };
    expect(createCapacitorAndroidNativeTransport()).toBeNull();
  });
});

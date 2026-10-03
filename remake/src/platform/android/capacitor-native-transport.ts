import { SevenError } from "../../core/errors";
import type { AndroidNativeTransport } from "./android-bridge";
import type {
  BridgeRequest,
  BridgeResponse,
} from "./contracts";

export type SevenRemakeNativePlugin = Readonly<{
  dispatch(options: Readonly<{ request: BridgeRequest<unknown> }>): Promise<unknown>;
  cancel(options: Readonly<{ requestId: string }>): Promise<unknown>;
}>;

type CapacitorGlobal = Readonly<{
  Plugins?: Readonly<Record<string, unknown>>;
  getPlatform?: () => string;
  isNativePlatform?: () => boolean;
}>;

function isPlugin(value: unknown): value is SevenRemakeNativePlugin {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as SevenRemakeNativePlugin).dispatch === "function" &&
    typeof (value as SevenRemakeNativePlugin).cancel === "function"
  );
}

function capacitorGlobal(): CapacitorGlobal | null {
  const value = (globalThis as typeof globalThis & { Capacitor?: CapacitorGlobal }).Capacitor;
  return value && typeof value === "object" ? value : null;
}

export class CapacitorAndroidNativeTransport implements AndroidNativeTransport {
  constructor(private readonly plugin: SevenRemakeNativePlugin) {
    if (!isPlugin(plugin)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Seven Remake native Capacitor plugin is malformed.",
      });
    }
  }

  async invoke<TPayload, TResult>(
    request: BridgeRequest<TPayload>,
  ): Promise<BridgeResponse<TResult> | unknown> {
    return this.plugin.dispatch({
      request: request as BridgeRequest<unknown>,
    });
  }

  async cancel(requestId: string): Promise<void> {
    if (typeof requestId !== "string" || !requestId.trim() || requestId !== requestId.trim()) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Native cancellation requestId must be canonical.",
      });
    }
    await this.plugin.cancel({ requestId });
  }
}

export function createCapacitorAndroidNativeTransport(): AndroidNativeTransport | null {
  const capacitor = capacitorGlobal();
  if (
    capacitor?.isNativePlatform?.() !== true ||
    capacitor.getPlatform?.() !== "android"
  ) {
    return null;
  }
  const plugin = capacitor.Plugins?.SevenRemakeNative;
  return isPlugin(plugin) ? new CapacitorAndroidNativeTransport(plugin) : null;
}

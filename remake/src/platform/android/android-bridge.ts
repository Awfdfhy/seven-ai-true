import { SevenError } from "../../core/errors";
import {
  assertBridgeResponse,
  createBridgeRequest,
  type BridgeRequest,
  type BridgeResponse,
} from "./contracts";

export interface AndroidNativeTransport {
  invoke<TPayload, TResult>(
    request: BridgeRequest<TPayload>,
  ): Promise<BridgeResponse<TResult> | unknown>;
  cancel(requestId: string): Promise<void> | void;
}

function assertSignal(signal: AbortSignal): void {
  if (
    !signal ||
    typeof signal !== "object" ||
    typeof signal.aborted !== "boolean" ||
    typeof signal.addEventListener !== "function" ||
    typeof signal.removeEventListener !== "function"
  ) {
    throw new SevenError({ code: "VALIDATION", message: "Android bridge requires a valid AbortSignal." });
  }
}

export class AndroidBridgeClient {
  constructor(private readonly transport: AndroidNativeTransport) {
    if (
      !transport ||
      typeof transport !== "object" ||
      typeof transport.invoke !== "function" ||
      typeof transport.cancel !== "function"
    ) {
      throw new SevenError({ code: "VALIDATION", message: "Android bridge transport is malformed." });
    }
  }

  async invoke<TPayload, TResult>(
    method: string,
    payload: TPayload,
    signal: AbortSignal,
  ): Promise<TResult> {
    assertSignal(signal);
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");

    const request = createBridgeRequest(method, payload);
    let settled = false;

    return new Promise<TResult>((resolve, reject) => {
      const cleanup = () => signal.removeEventListener("abort", onAbort);
      const finishResolve = (value: TResult) => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(value);
      };
      const finishReject = (error: unknown) => {
        if (settled) return;
        settled = true;
        cleanup();
        reject(error);
      };
      const onAbort = () => {
        try {
          const cancellation = this.transport.cancel(request.requestId);
          if (cancellation && typeof (cancellation as Promise<void>).catch === "function") {
            void (cancellation as Promise<void>).catch(() => undefined);
          }
        } catch {
          // Native cancellation is best-effort. JS cancellation remains authoritative.
        }
        finishReject(new DOMException("Aborted", "AbortError"));
      };

      signal.addEventListener("abort", onAbort, { once: true });
      if (signal.aborted) {
        onAbort();
        return;
      }

      Promise.resolve()
        .then(() => this.transport.invoke<TPayload, TResult>(request))
        .then(
          (raw) => {
            if (signal.aborted) {
              onAbort();
              return;
            }
            try {
              assertBridgeResponse<TResult>(raw, request.requestId);
              if (raw.result.ok) {
                finishResolve(raw.result.value);
                return;
              }
              finishReject(
                new SevenError({
                  code: "BRIDGE",
                  message: raw.result.error.message,
                  retryable: raw.result.error.retryable,
                  details: { nativeCode: raw.result.error.code },
                }),
              );
            } catch (error) {
              finishReject(error);
            }
          },
          (error: unknown) => {
            if (signal.aborted) {
              onAbort();
              return;
            }
            finishReject(
              error instanceof SevenError
                ? error
                : new SevenError({
                    code: "BRIDGE",
                    message: "Native bridge transport invocation failed.",
                    retryable: true,
                    cause: error,
                  }),
            );
          },
        );
    });
  }
}

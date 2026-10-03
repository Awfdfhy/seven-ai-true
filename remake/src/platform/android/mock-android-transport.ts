import type {
  BridgeRequest,
  BridgeResponse,
} from "./contracts";
import type { AndroidNativeTransport } from "./android-bridge";

export type AndroidMockHandler = (
  request: BridgeRequest<unknown>,
) => Promise<unknown> | unknown;

export class MockAndroidNativeTransport implements AndroidNativeTransport {
  readonly requests: BridgeRequest<unknown>[] = [];
  readonly cancellations: string[] = [];

  constructor(private readonly handler: AndroidMockHandler) {}

  async invoke<TPayload, TResult>(
    request: BridgeRequest<TPayload>,
  ): Promise<BridgeResponse<TResult> | unknown> {
    this.requests.push(request as BridgeRequest<unknown>);
    return this.handler(request as BridgeRequest<unknown>) as Promise<BridgeResponse<TResult> | unknown>;
  }

  cancel(requestId: string): void {
    this.cancellations.push(requestId);
  }
}

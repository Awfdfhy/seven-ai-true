import { SevenError } from "../../core/errors";

export type SafConsentResult = Readonly<{
  granted: boolean;
  uri: string | null;
  cancelled: boolean;
}>;

export interface SafConsentAdapter {
  requestDirectoryAccess(reason: string): Promise<SafConsentResult>;
}

export class InMemorySafConsentAdapter implements SafConsentAdapter {
  private queue: SafConsentResult[] = [];

  constructor(initial?: SafConsentResult) {
    if (initial) this.queue.push(initial);
  }

  enqueue(result: SafConsentResult): void {
    this.queue.push(result);
  }

  async requestDirectoryAccess(reason: string): Promise<SafConsentResult> {
    if (typeof reason !== "string" || !reason.trim()) {
      throw new SevenError({ code: "VALIDATION", message: "SAF consent reason must be canonical." });
    }
    const next = this.queue.shift();
    if (!next) {
      return Object.freeze({ granted: false, uri: null, cancelled: true });
    }
    return Object.freeze({ ...next });
  }
}

export function assertSafConsent(result: SafConsentResult): string {
  if (!result || typeof result !== "object") {
    throw new SevenError({ code: "VALIDATION", message: "SAF consent result is malformed." });
  }
  if (result.cancelled) {
    throw new SevenError({ code: "VALIDATION", message: "SAF consent was cancelled." });
  }
  if (!result.granted || typeof result.uri !== "string" || !result.uri.trim()) {
    throw new SevenError({ code: "VALIDATION", message: "SAF consent was denied." });
  }
  return result.uri.trim();
}

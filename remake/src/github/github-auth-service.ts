import { SevenError } from "../core/errors";

export type GitHubConnectionStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "degraded";

export type GitHubConnectionSnapshot = Readonly<{
  status: GitHubConnectionStatus;
  expiresAt: number | null;
  scopes: readonly string[];
  lastErrorCode: string | null;
}>;

export type GitHubCredentialLease = Readonly<{
  accessToken: string;
  expiresAt: number;
  scopes: readonly string[];
}>;

export interface GitHubCredentialProvider {
  refresh(): Promise<GitHubCredentialLease>;
  revoke?(): Promise<void>;
}

type Listener = (snapshot: GitHubConnectionSnapshot) => void;

function canonical(value: unknown, field: string, max = 512): string {
  if (
    typeof value !== "string" ||
    !value.trim() ||
    value !== value.trim() ||
    value.length > max
  ) {
    throw new SevenError({ code: "VALIDATION", message: `${field} must be canonical.` });
  }
  return value;
}

function normalizeLease(value: GitHubCredentialLease): GitHubCredentialLease {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new SevenError({ code: "VALIDATION", message: "GitHub credential lease is malformed." });
  }
  const token = canonical(value.accessToken, "GitHub access token", 16_384);
  if (!Number.isFinite(value.expiresAt) || value.expiresAt <= 0) {
    throw new SevenError({ code: "VALIDATION", message: "GitHub credential expiry is invalid." });
  }
  if (!Array.isArray(value.scopes) || value.scopes.length > 64) {
    throw new SevenError({ code: "VALIDATION", message: "GitHub credential scopes are invalid." });
  }
  const seen = new Set<string>();
  const scopes = value.scopes.map((scope) => {
    const normalized = canonical(scope, "GitHub scope", 256);
    if (seen.has(normalized)) {
      throw new SevenError({ code: "VALIDATION", message: "GitHub credential scopes must be unique." });
    }
    seen.add(normalized);
    return normalized;
  });
  return Object.freeze({
    accessToken: token,
    expiresAt: value.expiresAt,
    scopes: Object.freeze(scopes),
  });
}

export class GitHubAuthService {
  private current: GitHubCredentialLease | null = null;
  private refreshPromise: Promise<GitHubCredentialLease> | null = null;
  private readonly listeners = new Set<Listener>();
  private snapshotValue: GitHubConnectionSnapshot = Object.freeze({
    status: "disconnected",
    expiresAt: null,
    scopes: Object.freeze([]),
    lastErrorCode: null,
  });

  constructor(
    private readonly provider: GitHubCredentialProvider,
    private readonly now: () => number = Date.now,
    private readonly expirySkewMs = 60_000,
  ) {
    if (!provider || typeof provider !== "object" || typeof provider.refresh !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "GitHubAuthService requires a credential provider." });
    }
    if (typeof now !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "GitHubAuthService clock must be a function." });
    }
    if (!Number.isFinite(expirySkewMs) || expirySkewMs < 0) {
      throw new SevenError({ code: "VALIDATION", message: "GitHub expiry skew must be non-negative." });
    }
  }

  snapshot(): GitHubConnectionSnapshot {
    return Object.freeze({
      status: this.snapshotValue.status,
      expiresAt: this.snapshotValue.expiresAt,
      scopes: Object.freeze([...this.snapshotValue.scopes]),
      lastErrorCode: this.snapshotValue.lastErrorCode,
    });
  }

  subscribe(listener: Listener): () => void {
    if (typeof listener !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "GitHub auth listener must be a function." });
    }
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  async withAccessToken<T>(
    signal: AbortSignal,
    action: (accessToken: string, signal: AbortSignal) => Promise<T>,
  ): Promise<T> {
    if (
      !signal ||
      typeof signal !== "object" ||
      typeof signal.aborted !== "boolean" ||
      typeof signal.addEventListener !== "function"
    ) {
      throw new SevenError({ code: "VALIDATION", message: "GitHub operation requires AbortSignal." });
    }
    if (typeof action !== "function") {
      throw new SevenError({ code: "VALIDATION", message: "GitHub token action must be a function." });
    }
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");

    const lease = await this.ensureLease();
    if (signal.aborted) throw new DOMException("Aborted", "AbortError");
    return action(lease.accessToken, signal);
  }

  async disconnect(): Promise<void> {
    this.current = null;
    this.refreshPromise = null;
    try {
      await this.provider.revoke?.();
    } finally {
      this.setSnapshot({
        status: "disconnected",
        expiresAt: null,
        scopes: Object.freeze([]),
        lastErrorCode: null,
      });
    }
  }

  private async ensureLease(): Promise<GitHubCredentialLease> {
    const now = this.now();
    if (!Number.isFinite(now) || now < 0) {
      throw new SevenError({ code: "VALIDATION", message: "GitHub auth clock returned an invalid timestamp." });
    }
    if (this.current && this.current.expiresAt - this.expirySkewMs > now) {
      return this.current;
    }
    if (this.refreshPromise) return this.refreshPromise;

    this.setSnapshot({
      status: "connecting",
      expiresAt: this.current?.expiresAt ?? null,
      scopes: Object.freeze([...(this.current?.scopes ?? [])]),
      lastErrorCode: null,
    });

    const pending = Promise.resolve()
      .then(() => this.provider.refresh())
      .then((lease) => {
        const normalized = normalizeLease(lease);
        const observedNow = this.now();
        if (
          !Number.isFinite(observedNow) ||
          observedNow < 0 ||
          normalized.expiresAt - this.expirySkewMs <= observedNow
        ) {
          throw new SevenError({
            code: "PROVIDER",
            message: "GitHub credential provider returned an already-expired lease.",
            retryable: true,
          });
        }
        this.current = normalized;
        this.setSnapshot({
          status: "connected",
          expiresAt: normalized.expiresAt,
          scopes: Object.freeze([...normalized.scopes]),
          lastErrorCode: null,
        });
        return normalized;
      })
      .catch((error: unknown) => {
        this.current = null;
        this.setSnapshot({
          status: "degraded",
          expiresAt: null,
          scopes: Object.freeze([]),
          lastErrorCode: error instanceof SevenError ? error.code : "UNKNOWN",
        });
        throw error instanceof SevenError
          ? error
          : new SevenError({
              code: "NETWORK",
              message: "GitHub credential refresh failed.",
              retryable: true,
              cause: error,
            });
      })
      .finally(() => {
        if (this.refreshPromise === pending) this.refreshPromise = null;
      });

    this.refreshPromise = pending;
    return pending;
  }

  private setSnapshot(snapshot: GitHubConnectionSnapshot): void {
    this.snapshotValue = Object.freeze({
      status: snapshot.status,
      expiresAt: snapshot.expiresAt,
      scopes: Object.freeze([...snapshot.scopes]),
      lastErrorCode: snapshot.lastErrorCode,
    });
    for (const listener of [...this.listeners]) {
      try { listener(this.snapshot()); } catch { /* observers cannot break auth */ }
    }
  }
}

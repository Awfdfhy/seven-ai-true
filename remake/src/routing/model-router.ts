import { SevenError } from "../core/errors";
import {
  assertValidModelDescriptor,
  modelKey,
  type ModelDescriptor,
} from "../providers/contracts";

export type RouteMode = "quick" | "balanced" | "deep";

export type ProviderHealth = Readonly<{
  providerId: string;
  penalty: number;
  cooldownUntil: number | null;
}>;

export type ProviderFailureOptions = Readonly<{
  retryAfterMs?: number;
  penalty?: number;
  attemptStartedAt?: number;
}>;

export type RoutePreferences = Readonly<{
  mode: RouteMode;
  preferredModelId: string | null;
  requireStreaming: boolean;
  now: number;
  maxAttempts: number;
}>;

export type RouteCandidate = Readonly<{
  providerId: string;
  modelId: string;
  score: number;
}>;

export type RoutePlan = Readonly<{
  createdAt: number;
  mode: RouteMode;
  candidates: readonly RouteCandidate[];
}>;

function compareText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function requireFiniteNonNegative(value: number, field: string): number {
  if (!Number.isFinite(value) || value < 0) {
    throw new SevenError({
      code: "VALIDATION",
      message: `${field} must be a non-negative finite number.`,
    });
  }
  return value;
}

function freezeModel(model: ModelDescriptor): ModelDescriptor {
  return Object.freeze({
    ...model,
    capabilities: Object.freeze({ ...model.capabilities }),
  });
}

function validateHealth(entry: ProviderHealth): void {
  if (
    !entry ||
    typeof entry !== "object" ||
    typeof entry.providerId !== "string" ||
    !entry.providerId.trim() ||
    entry.providerId !== entry.providerId.trim()
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Provider health providerId must not be empty.",
    });
  }
  requireFiniteNonNegative(entry.penalty, "Provider health penalty");
  if (
    entry.cooldownUntil !== null &&
    (!Number.isFinite(entry.cooldownUntil) || entry.cooldownUntil < 0)
  ) {
    throw new SevenError({
      code: "VALIDATION",
      message: "Provider cooldownUntil must be null or a non-negative finite timestamp.",
    });
  }
}

export class ModelRegistry {
  private readonly models = new Map<string, ModelDescriptor>();

  replaceProviderModels(
    providerId: string,
    models: readonly ModelDescriptor[],
  ): void {
    if (typeof providerId !== "string" || !providerId.trim() || providerId !== providerId.trim()) {
      throw new SevenError({
        code: "VALIDATION",
        message: "providerId must not be empty.",
      });
    }

    if (!Array.isArray(models)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider models must be an array.",
      });
    }

    const incoming = new Map<string, ModelDescriptor>();
    for (const model of models) {
      assertValidModelDescriptor(model);
      if (model.providerId !== providerId) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Model provider does not match registry update provider.",
        });
      }
      const key = modelKey(model);
      if (incoming.has(key)) {
        throw new SevenError({
          code: "VALIDATION",
          message: `Duplicate model descriptor ${key}.`,
        });
      }
      incoming.set(key, freezeModel(model));
    }

    for (const [key, model] of this.models) {
      if (model.providerId === providerId) this.models.delete(key);
    }
    for (const [key, model] of incoming) this.models.set(key, model);
  }

  list(): readonly ModelDescriptor[] {
    return Object.freeze([...this.models.values()].map(freezeModel));
  }
}

type InternalHealth = ProviderHealth &
  Readonly<{
    revision: number;
    lastFailureAt: number | null;
    latestAttemptStartedAt: number | null;
    latestAppliedAttemptToken: number | null;
  }>;

export class ProviderHealthTracker {
  private readonly states = new Map<string, InternalHealth>();
  private nextAttemptToken = 1;

  snapshot(providerIds: readonly string[] = []): readonly ProviderHealth[] {
    if (!Array.isArray(providerIds)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "providerIds must be an array.",
      });
    }
    const ids =
      providerIds.length > 0
        ? [...new Set(providerIds)]
        : [...this.states.keys()];

    return Object.freeze(
      ids
        .sort()
        .map((providerId) => {
          this.validateProviderId(providerId);
          const state = this.states.get(providerId);
          return Object.freeze({
            providerId,
            penalty: state?.penalty ?? 0,
            cooldownUntil: state?.cooldownUntil ?? null,
          });
        }),
    );
  }

  beginAttempt(providerId: string): number {
    this.validateProviderId(providerId);
    if (!Number.isSafeInteger(this.nextAttemptToken)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider attempt token space is exhausted.",
      });
    }
    const token = this.nextAttemptToken;
    this.nextAttemptToken += 1;
    return token;
  }

  recordAttemptSuccess(providerId: string, attemptToken: number): void {
    this.validateProviderId(providerId);
    this.validateAttemptToken(attemptToken);
    const current = this.states.get(providerId);
    if (
      current?.latestAppliedAttemptToken !== null &&
      current?.latestAppliedAttemptToken !== undefined &&
      attemptToken <= current.latestAppliedAttemptToken
    ) {
      return;
    }

    const nextPenalty = Math.max(0, (current?.penalty ?? 0) - 25);
    this.states.set(
      providerId,
      Object.freeze({
        providerId,
        penalty: nextPenalty,
        cooldownUntil: null,
        revision: (current?.revision ?? 0) + 1,
        lastFailureAt: current?.lastFailureAt ?? null,
        latestAttemptStartedAt: current?.latestAttemptStartedAt ?? null,
        latestAppliedAttemptToken: attemptToken,
      }),
    );
  }

  recordAttemptFailure(
    providerId: string,
    attemptToken: number,
    now: number,
    options: Omit<ProviderFailureOptions, "attemptStartedAt"> = {},
  ): void {
    this.validateProviderId(providerId);
    this.validateAttemptToken(attemptToken);
    this.validateFailureOptions(options);
    requireFiniteNonNegative(now, "Provider failure timestamp");

    const current = this.states.get(providerId);
    if (
      current?.latestAppliedAttemptToken !== null &&
      current?.latestAppliedAttemptToken !== undefined &&
      attemptToken <= current.latestAppliedAttemptToken
    ) {
      return;
    }

    const addedPenalty =
      options.penalty === undefined
        ? 50
        : requireFiniteNonNegative(options.penalty, "Provider failure penalty");
    const retryAfterMs =
      options.retryAfterMs === undefined
        ? 0
        : requireFiniteNonNegative(options.retryAfterMs, "retryAfterMs");
    const requestedCooldown =
      retryAfterMs > 0 ? now + retryAfterMs : null;
    if (requestedCooldown !== null && !Number.isFinite(requestedCooldown)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider cooldown timestamp overflowed.",
      });
    }

    const previousCooldown = current?.cooldownUntil ?? null;
    const cooldownUntil =
      requestedCooldown === null
        ? previousCooldown
        : Math.max(previousCooldown ?? 0, requestedCooldown);

    this.states.set(
      providerId,
      Object.freeze({
        providerId,
        penalty: Math.min(1000, (current?.penalty ?? 0) + addedPenalty),
        cooldownUntil,
        revision: (current?.revision ?? 0) + 1,
        lastFailureAt: Math.max(current?.lastFailureAt ?? 0, now),
        latestAttemptStartedAt: current?.latestAttemptStartedAt ?? null,
        latestAppliedAttemptToken: attemptToken,
      }),
    );
  }

  recordSuccess(providerId: string, attemptStartedAt = Date.now()): void {
    this.validateProviderId(providerId);
    requireFiniteNonNegative(attemptStartedAt, "Provider attempt start timestamp");
    const current = this.states.get(providerId);

    if (
      current?.latestAttemptStartedAt !== null &&
      current?.latestAttemptStartedAt !== undefined &&
      attemptStartedAt < current.latestAttemptStartedAt
    ) {
      return;
    }

    const token = this.beginAttempt(providerId);
    const nextPenalty = Math.max(0, (current?.penalty ?? 0) - 25);
    this.states.set(
      providerId,
      Object.freeze({
        providerId,
        penalty: nextPenalty,
        cooldownUntil: null,
        revision: (current?.revision ?? 0) + 1,
        lastFailureAt: current?.lastFailureAt ?? null,
        latestAttemptStartedAt: attemptStartedAt,
        latestAppliedAttemptToken: token,
      }),
    );
  }

  recordFailure(
    providerId: string,
    now: number,
    options: ProviderFailureOptions = {},
  ): void {
    this.validateProviderId(providerId);
    this.validateFailureOptions(options);
    requireFiniteNonNegative(now, "Provider failure timestamp");

    const current = this.states.get(providerId);
    const attemptStartedAt =
      options.attemptStartedAt === undefined
        ? now
        : requireFiniteNonNegative(
            options.attemptStartedAt,
            "Provider attempt start timestamp",
          );

    if (
      current?.latestAttemptStartedAt !== null &&
      current?.latestAttemptStartedAt !== undefined &&
      attemptStartedAt < current.latestAttemptStartedAt
    ) {
      return;
    }

    const token = this.beginAttempt(providerId);
    const addedPenalty =
      options.penalty === undefined
        ? 50
        : requireFiniteNonNegative(options.penalty, "Provider failure penalty");
    const retryAfterMs =
      options.retryAfterMs === undefined
        ? 0
        : requireFiniteNonNegative(options.retryAfterMs, "retryAfterMs");
    const requestedCooldown =
      retryAfterMs > 0 ? now + retryAfterMs : null;
    if (requestedCooldown !== null && !Number.isFinite(requestedCooldown)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider cooldown timestamp overflowed.",
      });
    }

    const previousCooldown = current?.cooldownUntil ?? null;
    const cooldownUntil =
      requestedCooldown === null
        ? previousCooldown
        : Math.max(previousCooldown ?? 0, requestedCooldown);

    this.states.set(
      providerId,
      Object.freeze({
        providerId,
        penalty: Math.min(1000, (current?.penalty ?? 0) + addedPenalty),
        cooldownUntil,
        revision: (current?.revision ?? 0) + 1,
        lastFailureAt: Math.max(current?.lastFailureAt ?? 0, now),
        latestAttemptStartedAt: attemptStartedAt,
        latestAppliedAttemptToken: token,
      }),
    );
  }

  private validateProviderId(providerId: string): void {
    if (
      typeof providerId !== "string" ||
      !providerId.trim() ||
      providerId !== providerId.trim()
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "providerId must be a canonical non-empty string.",
      });
    }
  }

  private validateAttemptToken(attemptToken: number): void {
    if (!Number.isSafeInteger(attemptToken) || attemptToken <= 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider attempt token must be a positive safe integer.",
      });
    }
  }

  private validateFailureOptions(
    options: Omit<ProviderFailureOptions, "attemptStartedAt"> | ProviderFailureOptions,
  ): void {
    if (!options || typeof options !== "object" || Array.isArray(options)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Provider failure options must be an object.",
      });
    }
  }
}

export class ModelRouter {
  plan(
    models: readonly ModelDescriptor[],
    health: readonly ProviderHealth[],
    preferences: RoutePreferences,
  ): RoutePlan {
    if (!preferences || typeof preferences !== "object") {
      throw new SevenError({
        code: "VALIDATION",
        message: "Route preferences must be an object.",
      });
    }
    if (
      preferences.mode !== "quick" &&
      preferences.mode !== "balanced" &&
      preferences.mode !== "deep"
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Route mode must be quick, balanced, or deep.",
      });
    }
    if (typeof preferences.requireStreaming !== "boolean") {
      throw new SevenError({
        code: "VALIDATION",
        message: "requireStreaming must be a boolean.",
      });
    }
    if (
      preferences.preferredModelId !== null &&
      (typeof preferences.preferredModelId !== "string" ||
        !preferences.preferredModelId.trim())
    ) {
      throw new SevenError({
        code: "VALIDATION",
        message: "preferredModelId must be a non-empty string or null.",
      });
    }
    if (!Array.isArray(models) || !Array.isArray(health)) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Models and provider health must be arrays.",
      });
    }
    if (!Number.isSafeInteger(preferences.maxAttempts) || preferences.maxAttempts <= 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "maxAttempts must be a positive integer.",
      });
    }
    if (!Number.isFinite(preferences.now) || preferences.now < 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "Route time must be a non-negative finite timestamp.",
      });
    }

    const modelKeys = new Set<string>();
    for (const model of models) {
      assertValidModelDescriptor(model);
      const key = modelKey(model);
      if (modelKeys.has(key)) {
        throw new SevenError({
          code: "VALIDATION",
          message: `Duplicate route model ${key}.`,
        });
      }
      modelKeys.add(key);
    }

    const healthByProvider = new Map<string, ProviderHealth>();
    for (const entry of health) {
      validateHealth(entry);
      if (healthByProvider.has(entry.providerId)) {
        throw new SevenError({
          code: "VALIDATION",
          message: `Duplicate provider health entry ${entry.providerId}.`,
        });
      }
      healthByProvider.set(entry.providerId, entry);
    }

    const preferred = preferences.preferredModelId;
    let resolvedPreferredKey: string | null = null;

    if (preferred !== null) {
      const exactQualified = models.find(
        (model) => modelKey(model) === preferred,
      );
      if (exactQualified) {
        resolvedPreferredKey = modelKey(exactQualified);
      } else {
        const bareMatches = models.filter((model) => model.id === preferred);
        if (bareMatches.length > 1) {
          throw new SevenError({
            code: "VALIDATION",
            message:
              "preferredModelId is ambiguous across providers; use modelKey(model).",
          });
        }
        if (bareMatches.length === 1) {
          resolvedPreferredKey = modelKey(bareMatches[0]!);
        }
      }
    }

    const candidates = models
      .filter(
        (model) =>
          !preferences.requireStreaming || model.capabilities.streaming,
      )
      .filter((model) => {
        const state = healthByProvider.get(model.providerId);
        return (
          state?.cooldownUntil === null ||
          state?.cooldownUntil === undefined ||
          state.cooldownUntil <= preferences.now
        );
      })
      .map((model): RouteCandidate => {
        const state = healthByProvider.get(model.providerId);
        const penalty = state?.penalty ?? 0;
        const modeWeight =
          preferences.mode === "quick"
            ? model.speedScore * 1.35 + model.qualityScore * 0.65
            : preferences.mode === "deep"
              ? model.qualityScore * 1.5 + model.speedScore * 0.5
              : model.qualityScore + model.speedScore;
        if (!Number.isFinite(modeWeight)) {
          throw new SevenError({
            code: "VALIDATION",
            message: "Model route score overflowed.",
          });
        }
        const isPreferred =
          resolvedPreferredKey !== null &&
          modelKey(model) === resolvedPreferredKey;
        const preferredBonus = isPreferred ? 10_000 : 0;

        return Object.freeze({
          providerId: model.providerId,
          modelId: model.id,
          score: preferredBonus + modeWeight - penalty,
        });
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          compareText(a.providerId, b.providerId) ||
          compareText(a.modelId, b.modelId),
      )
      .slice(0, preferences.maxAttempts);

    if (candidates.length === 0) {
      throw new SevenError({
        code: "PROVIDER",
        message: "No healthy model route is currently available.",
        retryable: true,
      });
    }

    return Object.freeze({
      createdAt: preferences.now,
      mode: preferences.mode,
      candidates: Object.freeze(candidates),
    });
  }
}

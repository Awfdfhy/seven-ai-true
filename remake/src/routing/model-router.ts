import { SevenError } from "../core/errors";
import type { ModelDescriptor } from "../providers/contracts";

export type RouteMode = "quick" | "balanced" | "deep";

export type ProviderHealth = Readonly<{
  providerId: string;
  penalty: number;
  cooldownUntil: number | null;
}>;

export type ProviderFailureOptions = Readonly<{
  retryAfterMs?: number;
  penalty?: number;
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

function freezeModel(model: ModelDescriptor): ModelDescriptor {
  return Object.freeze({
    ...model,
    capabilities: Object.freeze({ ...model.capabilities }),
  });
}

export class ModelRegistry {
  private readonly models = new Map<string, ModelDescriptor>();

  replaceProviderModels(
    providerId: string,
    models: readonly ModelDescriptor[],
  ): void {
    for (const [key, model] of this.models) {
      if (model.providerId === providerId) this.models.delete(key);
    }

    for (const model of models) {
      if (model.providerId !== providerId) {
        throw new SevenError({
          code: "VALIDATION",
          message: "Model provider does not match registry update provider.",
        });
      }
      this.models.set(
        `${model.providerId}::${model.id}`,
        freezeModel(model),
      );
    }
  }

  list(): readonly ModelDescriptor[] {
    return Object.freeze([...this.models.values()].map(freezeModel));
  }
}

export class ProviderHealthTracker {
  private readonly states = new Map<string, ProviderHealth>();

  snapshot(providerIds: readonly string[] = []): readonly ProviderHealth[] {
    const ids =
      providerIds.length > 0
        ? [...new Set(providerIds)]
        : [...this.states.keys()];

    return Object.freeze(
      ids
        .sort()
        .map((providerId) => {
          const state = this.states.get(providerId);
          return Object.freeze({
            providerId,
            penalty: state?.penalty ?? 0,
            cooldownUntil: state?.cooldownUntil ?? null,
          });
        }),
    );
  }

  recordSuccess(providerId: string): void {
    const current = this.states.get(providerId);
    const nextPenalty = Math.max(0, (current?.penalty ?? 0) - 25);
    this.states.set(
      providerId,
      Object.freeze({
        providerId,
        penalty: nextPenalty,
        cooldownUntil: null,
      }),
    );
  }

  recordFailure(
    providerId: string,
    now: number,
    options: ProviderFailureOptions = {},
  ): void {
    const current = this.states.get(providerId);
    const addedPenalty = Math.max(1, options.penalty ?? 50);
    const retryAfterMs = Math.max(0, options.retryAfterMs ?? 0);
    const requestedCooldown =
      retryAfterMs > 0 ? now + retryAfterMs : null;
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
      }),
    );
  }
}

export class ModelRouter {
  plan(
    models: readonly ModelDescriptor[],
    health: readonly ProviderHealth[],
    preferences: RoutePreferences,
  ): RoutePlan {
    if (preferences.maxAttempts <= 0) {
      throw new SevenError({
        code: "VALIDATION",
        message: "maxAttempts must be greater than zero.",
      });
    }

    const healthByProvider = new Map(
      health.map((entry) => [entry.providerId, entry] as const),
    );

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
        const penalty = Math.max(0, state?.penalty ?? 0);
        const modeWeight =
          preferences.mode === "quick"
            ? model.speedScore * 1.35 + model.qualityScore * 0.65
            : preferences.mode === "deep"
              ? model.qualityScore * 1.5 + model.speedScore * 0.5
              : model.qualityScore + model.speedScore;
        const preferred =
          model.id === preferences.preferredModelId ? 10_000 : 0;

        return Object.freeze({
          providerId: model.providerId,
          modelId: model.id,
          score: preferred + modeWeight - penalty,
        });
      })
      .sort(
        (a, b) =>
          b.score - a.score ||
          a.providerId.localeCompare(b.providerId) ||
          a.modelId.localeCompare(b.modelId),
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

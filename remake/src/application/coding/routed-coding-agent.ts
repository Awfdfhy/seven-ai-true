import type { ProviderAdapter } from "../../providers/contracts";
import {
  ModelRegistry,
  ModelRouter,
  ProviderHealthTracker,
} from "../../routing/model-router";
import {
  ProviderCodingAgent,
  type CodingAgentModel,
  type CodingDiagnosis,
  type CodingReviewVerdict,
  type CodingUnderstanding,
  type ModelPatchProposal,
} from "./provider-coding-agent";
import type { RepositoryMap } from "./repo-intelligence";
import type { RepositorySnapshot } from "./contracts";
import type { VerificationEvidence } from "./verification-runner";
import type { DiffReview } from "./diff-review";

type AgentCall<T> = (agent: ProviderCodingAgent) => Promise<T>;

export class RoutedCodingAgent implements CodingAgentModel {
  private readonly providers = new Map<string, ProviderAdapter>();

  constructor(
    providers: readonly ProviderAdapter[],
    private readonly registry: ModelRegistry,
    private readonly router: ModelRouter,
    private readonly health: ProviderHealthTracker,
    private readonly options: Readonly<{
      preferredModelId?: string | null;
      maxAttempts?: number;
      candidateOffset?: number;
      maxOutputTokens?: number;
      now?: () => number;
    }> = {},
  ) {
    if (!Array.isArray(providers) || providers.length === 0) throw new Error("RoutedCodingAgent requires providers.");
    for (const provider of providers) {
      if (!provider?.id || this.providers.has(provider.id)) throw new Error("Coding providers must have unique ids.");
      this.providers.set(provider.id, provider);
    }
  }

  understand(input: Readonly<{task:string;repoMap:RepositoryMap;snapshot:RepositorySnapshot;signal:AbortSignal}>): Promise<CodingUnderstanding> {
    return this.run((agent) => agent.understand(input), input.signal);
  }

  proposePatch(input: Readonly<{task:string;understanding:CodingUnderstanding;repoMap:RepositoryMap;snapshot:RepositorySnapshot;research:readonly string[];repairInstruction?:string;signal:AbortSignal}>): Promise<ModelPatchProposal> {
    return this.run((agent) => agent.proposePatch(input), input.signal);
  }

  diagnose(input: Readonly<{task:string;verification:VerificationEvidence;diffReview:DiffReview;signal:AbortSignal}>): Promise<CodingDiagnosis> {
    return this.run((agent) => agent.diagnose(input), input.signal);
  }

  review(input: Readonly<{task:string;snapshot:RepositorySnapshot;proposal:ModelPatchProposal;verification:VerificationEvidence;diffReview:DiffReview;signal:AbortSignal}>): Promise<CodingReviewVerdict> {
    return this.run((agent) => agent.review(input), input.signal);
  }

  private async run<T>(call: AgentCall<T>, signal: AbortSignal): Promise<T> {
    const now = this.options.now ?? Date.now;
    const maxAttempts = Math.max(1, Math.min(8, this.options.maxAttempts ?? 3));
    const offset = Math.max(0, Math.min(4, this.options.candidateOffset ?? 0));
    const models = this.registry.list();
    const health = this.health.snapshot([...new Set(models.map((model) => model.providerId))]);
    const plan = this.router.plan(models, health, {
      mode: "deep",
      preferredModelId: this.options.preferredModelId ?? null,
      requireStreaming: true,
      now: now(),
      maxAttempts: Math.min(models.length, maxAttempts + offset),
    });
    let candidates: readonly (typeof plan.candidates[number])[] = plan.candidates.slice(offset);
    if (candidates.length === 0) candidates = plan.candidates;
    let lastError: unknown = null;
    for (const candidate of candidates.slice(0, maxAttempts)) {
      if (signal.aborted) throw new DOMException("Aborted", "AbortError");
      const provider = this.providers.get(candidate.providerId);
      if (!provider) continue;
      const token = this.health.beginAttempt(candidate.providerId);
      try {
        const result = await call(new ProviderCodingAgent(
          provider,
          candidate.modelId,
          this.options.maxOutputTokens ?? 8192,
        ));
        this.health.recordAttemptSuccess(candidate.providerId, token);
        return result;
      } catch (error) {
        if (signal.aborted || (error instanceof DOMException && error.name === "AbortError")) throw error;
        lastError = error;
        this.health.recordAttemptFailure(candidate.providerId, token, now(), { penalty: 75 });
      }
    }
    if (lastError instanceof Error) throw lastError;
    throw new Error("No routed coding model completed the request.");
  }
}

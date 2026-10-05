import type { ResearchService } from "../application/research/research-service";
import type { ToolExecutor } from "../application/tools/executor";
import type { ToolRegistry } from "../application/tools/registry";
import {
  CodingAgentService,
  CodingWorkspaceService,
  ResearchServiceCodingAdapter,
  ToolBackedCodingRepositoryPort,
  registerCodingRepositoryTools,
  type CodingAgentModel,
} from "../application/coding";
import { GitHubAuthService } from "./github-auth-service";
import { GitHubCodingRepositoryPort } from "./coding-repository-port";
import { GitHubActionsVerificationFactory } from "./github-actions-verification-port";

export function registerGitHubCodingTools(input: Readonly<{
  auth: GitHubAuthService;
  registry: ToolRegistry;
}>): void {
  registerCodingRepositoryTools(
    input.registry,
    new GitHubCodingRepositoryPort(input.auth),
  );
}

export function createGitHubCodingRuntime(input: Readonly<{
  auth: GitHubAuthService;
  executor: ToolExecutor;
  roomId: string;
  taskId: string;
  editor: CodingAgentModel;
  reviewer?: CodingAgentModel;
  research?: ResearchService;
}>): CodingAgentService {
  const workspace = new CodingWorkspaceService(
    new ToolBackedCodingRepositoryPort(input.executor, {
      roomId: input.roomId,
      taskId: input.taskId,
    }),
  );
  const verification = new GitHubActionsVerificationFactory(input.auth);
  const research = input.research
    ? new ResearchServiceCodingAdapter(input.research)
    : undefined;
  return new CodingAgentService(
    workspace,
    input.editor,
    verification,
    research,
    input.reviewer,
  );
}

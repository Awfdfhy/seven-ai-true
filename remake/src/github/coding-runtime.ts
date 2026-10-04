import type { ResearchService } from "../application/research/research-service";
import {
  CodingAgentService,
  CodingWorkspaceService,
  ResearchServiceCodingAdapter,
  type CodingAgentModel,
} from "../application/coding";
import { GitHubAuthService } from "./github-auth-service";
import { GitHubCodingRepositoryPort } from "./coding-repository-port";
import { GitHubActionsVerificationFactory } from "./github-actions-verification-port";

export function createGitHubCodingRuntime(input: Readonly<{
  auth: GitHubAuthService;
  editor: CodingAgentModel;
  reviewer?: CodingAgentModel;
  research?: ResearchService;
}>): CodingAgentService {
  const workspace = new CodingWorkspaceService(new GitHubCodingRepositoryPort(input.auth));
  const verification = new GitHubActionsVerificationFactory(input.auth);
  const research = input.research ? new ResearchServiceCodingAdapter(input.research) : undefined;
  return new CodingAgentService(
    workspace,
    input.editor,
    verification,
    research,
    input.reviewer,
  );
}

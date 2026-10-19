import type { ToolOrchestrator } from "./orchestrator";
import type { ToolRegistry } from "./registry";
import { buildToolEvidence } from "./evidence";

export interface ChatToolContextSource {
  contextForTurn(input:Readonly<{
    roomId:string;
    taskId:string;
    query:string;
    signal:AbortSignal;
  }>):Promise<string>;
}

export class OrchestratedReadToolContextSource implements ChatToolContextSource {
  constructor(
    private readonly orchestrator:ToolOrchestrator,
    private readonly registry:ToolRegistry,
    private readonly maxEvidenceCharacters=6_000,
  ){
    if(
      !Number.isSafeInteger(maxEvidenceCharacters) ||
      maxEvidenceCharacters<512 ||
      maxEvidenceCharacters>24_000
    ){
      throw new TypeError("Tool evidence budget is invalid.");
    }
  }

  async contextForTurn(input:Readonly<{
    roomId:string;
    taskId:string;
    query:string;
    signal:AbortSignal;
  }>):Promise<string>{
    const outcome=await this.orchestrator.run(input);
    if(outcome.kind==="answer")return "";
    const definition=this.registry.require(outcome.toolId);
    const evidence=await buildToolEvidence(
      outcome.result,
      definition.annotations.sensitivity,
      this.maxEvidenceCharacters,
    );
    return evidence.text;
  }
}

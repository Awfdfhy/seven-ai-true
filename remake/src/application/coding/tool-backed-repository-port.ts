import { SevenError } from "../../core/errors";
import type { ToolExecutor } from "../tools/executor";
import type { ToolResult } from "../tools/contracts";
import type {
  CodingRepositoryPort,
  RepositoryCommitChange,
  RepositoryCommitResult,
  RepositoryEntry,
} from "./repository-port";
import { sha256Text } from "./hash";

type Scope=Readonly<{roomId:string;taskId:string}>;

function canonical(value:string,field:string):string{
  if(typeof value!=="string"||!value.trim()||value!==value.trim())throw new SevenError({code:"VALIDATION",message:`${field} is invalid.`});
  return value;
}
function toolFailure(result:ToolResult):never{
  throw new SevenError({
    code:result.status==="denied"?"PERMISSION":result.status==="cancelled"?"CANCELLED":"TOOL",
    message:result.status==="effect_unknown"?"Coding repository effect is uncertain.":"Coding repository tool failed.",
    retryable:result.retryable,
    details:{toolId:result.toolId,status:result.status,errorCode:result.errorCode??null},
  });
}

export class ToolBackedCodingRepositoryPort implements CodingRepositoryPort{
  constructor(private readonly executor:ToolExecutor,private readonly scope:Scope){
    canonical(scope.roomId,"Coding room id");canonical(scope.taskId,"Coding task id");
  }

  async getHead(input:Readonly<{repository:string;branch:string;signal:AbortSignal}>):Promise<string>{
    const output=await this.call<{headSha:string}>("coding.repo.head",{repository:input.repository,branch:input.branch},input.signal);
    return output.headSha;
  }
  async listFiles(input:Readonly<{repository:string;commitSha:string;signal:AbortSignal}>):Promise<readonly RepositoryEntry[]>{
    const output=await this.call<{entries:readonly RepositoryEntry[]}>("coding.repo.list",{repository:input.repository,commitSha:input.commitSha},input.signal);
    return Object.freeze(output.entries.map(entry=>Object.freeze({...entry})));
  }
  async readFiles(input:Readonly<{repository:string;commitSha:string;paths:readonly string[];signal:AbortSignal}>){
    const output=await this.call<{files:readonly Readonly<{path:string;content:string}>[]}>("coding.repo.read",{repository:input.repository,commitSha:input.commitSha,paths:input.paths},input.signal);
    return Object.freeze(output.files.map(file=>Object.freeze({...file})));
  }
  async commit(input:Readonly<{repository:string;branch:string;baseSha:string;message:string;changes:readonly RepositoryCommitChange[];signal:AbortSignal}>):Promise<RepositoryCommitResult>{
    const args={repository:input.repository,branch:input.branch,baseSha:input.baseSha,message:input.message,changes:input.changes};
    const key=await sha256Text(JSON.stringify(args));
    const output=await this.call<RepositoryCommitResult>("coding.repo.commit",args,input.signal,`coding-commit:${key}`);
    return Object.freeze({commitSha:output.commitSha,changedPaths:Object.freeze([...output.changedPaths])});
  }

  private async call<T>(toolId:string,args:unknown,signal:AbortSignal,idempotencyKey?:string):Promise<T>{
    if(signal.aborted)throw new DOMException("Aborted","AbortError");
    const callId=crypto.randomUUID();
    const result=await this.executor.execute({
      callId,taskId:this.scope.taskId,roomId:this.scope.roomId,toolId,args,
      idempotencyKey:idempotencyKey??`coding-read:${callId}`,
      requestedAt:Date.now(),
    },signal);
    if(result.status!=="succeeded")toolFailure(result);
    return result.output as T;
  }
}

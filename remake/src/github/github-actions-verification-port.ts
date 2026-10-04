import { SevenError } from "../core/errors";
import type { GitHubAuthService } from "./github-auth-service";
import type { VerificationCommand } from "../application/coding/contracts";
import type { VerificationExecution, VerificationExecutionPort } from "../application/coding/verification-runner";

type FetchLike=(input:RequestInfo|URL,init?:RequestInit)=>Promise<Response>;
const COMMAND_STEP:Readonly<Record<string,string>>=Object.freeze({
  "coding-unit":"Tests",
  "remake-typecheck":"Typecheck",
  "remake-tests":"Tests",
  "remake-build":"Build",
});
function sleep(ms:number,signal:AbortSignal):Promise<void>{return new Promise((resolve,reject)=>{if(signal.aborted)return reject(new DOMException("Aborted","AbortError"));const id=setTimeout(()=>{cleanup();resolve()},ms);const onAbort=()=>{cleanup();reject(new DOMException("Aborted","AbortError"))};const cleanup=()=>{clearTimeout(id);signal.removeEventListener("abort",onAbort)};signal.addEventListener("abort",onAbort,{once:true})})}
function canonicalRepo(v:string):string{if(!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(v))throw new Error("Invalid repository.");return v}
function sha(v:string):string{if(!/^[a-f0-9]{40}$/i.test(v))throw new Error("Invalid commit SHA.");return v.toLowerCase()}

export class GitHubActionsVerificationPort implements VerificationExecutionPort{
 constructor(private readonly auth:GitHubAuthService,private readonly input:Readonly<{repository:string;baseSha:string;commitSha:string}>,private readonly fetchImpl:FetchLike=fetch,private readonly maxWaitMs=12*60*1000){canonicalRepo(input.repository);sha(input.baseSha);sha(input.commitSha)}
 async execute(command:VerificationCommand,signal:AbortSignal):Promise<VerificationExecution>{
  const startedAt=Date.now();
  if(command.id==="repository-diff-check")return this.diffCheck(command,signal,startedAt);
  const step=COMMAND_STEP[command.id];
  if(!step)throw new SevenError({code:"VALIDATION",message:`GitHub verification has no fixed mapping for ${command.id}.`});
  const conclusion=await this.waitForStep(step,signal);
  const completedAt=Date.now();
  return Object.freeze({commandId:command.id,exitCode:conclusion==="success"?0:1,stdout:`Seven Remake V3 CI step ${step}: ${conclusion}`,stderr:conclusion==="success"?"":`CI step ${step} concluded ${conclusion}.`,startedAt,completedAt});
 }
 private async diffCheck(command:VerificationCommand,signal:AbortSignal,startedAt:number):Promise<VerificationExecution>{
  const repository=canonicalRepo(this.input.repository),base=sha(this.input.baseSha),head=sha(this.input.commitSha);
  return this.auth.withAccessToken(signal,async(token,inner)=>{
   const data=await this.json(`/repos/${repository}/compare/${base}...${head}`,token,inner);
   const files=(data as {files?:unknown}).files;if(!Array.isArray(files))throw new SevenError({code:"PROVIDER",message:"GitHub compare response is malformed."});
   const bad:string[]=[];
   for(const raw of files){const f=raw as {filename?:unknown;patch?:unknown};if(typeof f.filename!=="string")continue;if(typeof f.patch!=="string")continue;for(const line of f.patch.split("\n")){if(!line.startsWith("+")||line.startsWith("+++"))continue;const added=line.slice(1);if(/[ \t]+$/.test(added)||/^(?:<<<<<<<|=======|>>>>>>>)/.test(added))bad.push(f.filename);}}
   return Object.freeze({commandId:command.id,exitCode:bad.length?1:0,stdout:bad.length?"":`Git diff check passed across ${files.length} changed files.`,stderr:bad.length?`Diff check failed: ${[...new Set(bad)].join(", ")}`:"",startedAt,completedAt:Date.now()});
  });
 }
 private async waitForStep(stepName:string,signal:AbortSignal):Promise<string>{
  const deadline=Date.now()+this.maxWaitMs;
  while(Date.now()<deadline){
   const result=await this.auth.withAccessToken(signal,(token,inner)=>this.json(`/repos/${canonicalRepo(this.input.repository)}/actions/runs?head_sha=${sha(this.input.commitSha)}&per_page=50`,token,inner));
   const runs=(result as {workflow_runs?:unknown}).workflow_runs;
   if(Array.isArray(runs)){
    const run=(runs as Array<Record<string,unknown>>).find(r=>r.name==="Seven Remake V3 CI");
    if(run&&typeof run.id==="number"){
     const jobs=await this.auth.withAccessToken(signal,(token,inner)=>this.json(`/repos/${canonicalRepo(this.input.repository)}/actions/runs/${run.id}/jobs?per_page=100`,token,inner));
     const list=(jobs as {jobs?:unknown}).jobs;
     if(Array.isArray(list))for(const rawJob of list){const job=rawJob as {steps?:unknown};if(!Array.isArray(job.steps))continue;const step=(job.steps as Array<Record<string,unknown>>).find(s=>s.name===stepName);if(step&&typeof step.conclusion==="string")return step.conclusion;}
    }
   }
   await sleep(2000,signal);
  }
  return "timed_out";
 }
 private async json(path:string,token:string,signal:AbortSignal):Promise<unknown>{
  let response:Response;try{response=await this.fetchImpl(`https://api.github.com${path}`,{signal,headers:{Accept:"application/vnd.github+json",Authorization:`Bearer ${token}`,"X-GitHub-Api-Version":"2022-11-28"}})}catch(error){if(signal.aborted)throw new DOMException("Aborted","AbortError");throw new SevenError({code:"NETWORK",message:"GitHub Actions verification request failed.",retryable:true,cause:error})}
  const body=await response.text();if(!response.ok)throw new SevenError({code:response.status===401||response.status===403?"PERMISSION":"PROVIDER",message:`GitHub Actions verification HTTP ${response.status}.`,retryable:response.status>=500||response.status===429});try{return body?JSON.parse(body):{}}catch(error){throw new SevenError({code:"PROVIDER",message:"GitHub Actions verification returned invalid JSON.",cause:error})}
 }
}

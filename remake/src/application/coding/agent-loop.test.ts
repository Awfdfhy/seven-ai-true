import { describe, expect, it } from "vitest";
import { CodingAgentService } from "./coding-agent-service";
import { CodingWorkspaceService, type CodingRepositoryPort, type RepositoryCommitChange } from "./repository-port";
import type { CodingAgentModel } from "./provider-coding-agent";

class Repo implements CodingRepositoryPort{
 head="a".repeat(40); files=new Map([["remake/src/a.ts","export const a=1;\n"]]); count=0;
 async getHead(){return this.head}
 async listFiles(){return [...this.files].map(([path,content])=>({path,blobSha:"c".repeat(40),bytes:content.length}))}
 async readFiles(i:{paths:readonly string[]}){return i.paths.map(path=>({path,content:this.files.get(path)!}))}
 async commit(i:{baseSha:string;changes:readonly RepositoryCommitChange[]}){if(i.baseSha!==this.head)throw Error("stale");for(const c of i.changes){if(c.kind==="delete")this.files.delete(c.path);else this.files.set(c.path,c.content)}this.count+=1;this.head=this.count.toString(16).padStart(40,"b").slice(-40);return{commitSha:this.head,changedPaths:i.changes.map(c=>c.path)}}
}
const model:CodingAgentModel={
 async understand(){return{summary:"fix",acceptanceCriteria:["works"],researchQueries:[],inspectHints:[]}},
 async proposePatch(i){return{summary:"patch",operations:[{kind:"replace",path:"remake/src/a.ts",content:i.repairInstruction?"export const a=3;\n":"export const a=2;\n"}]}},
 async diagnose(){return{classification:"test",summary:"repair",inspectHints:[],repairInstruction:"use 3"}},
 async review(){return{verdict:"PASS",summary:"good",findings:[]}},
};

describe("coding agent bounded repair loop",()=>{
 it("repairs one failed verification then completes",async()=>{
  const repo=new Repo();let executions=0;
  const service=new CodingAgentService(new CodingWorkspaceService(repo),model,{create(){return{async execute(command){executions+=1;const fail=repo.count===1&&command.id==="remake-tests";return{commandId:command.id,exitCode:fail?1:0,stdout:"",stderr:"",startedAt:1,completedAt:2}}}}});
  const result=await service.run({taskId:"t",runId:"r",task:"fix a",repository:"owner/repo",branch:"work",inspectionPaths:["remake/src/a.ts"],acceptanceCriteria:["tests pass"],signal:new AbortController().signal,maxRepairAttempts:3});
  expect(result.status).toBe("PASS");expect(result.attempts).toBe(2);expect(repo.files.get("remake/src/a.ts")).toContain("3");expect(executions).toBeGreaterThan(1);
 });
});

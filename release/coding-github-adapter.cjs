"use strict";
const {selectTests}=require("./coding-test-selector.cjs");
const {createVerifiedProposalPort}=require("./coding-proposal-policy.cjs");
function requireApi(api){for(const k of ["repositoryTree","readFile","atomicCommit","dispatchWorkflow"]){if(!api||typeof api[k]!=="function")throw Error("github-api-missing:"+k)}return api}
function createGithubCodingAdapter(api,options={}){
 api=requireApi(api);const branch=String(options.branch||"").trim();if(!branch)throw Error("branch-required");
 const verifiedProposal=options.propose||(api.openPullRequest&&options.ciForSha?createVerifiedProposalPort(api,{branch,base:options.base||"main",currentHead:async()=>{const t=await api.repositoryTree(branch);return t.head.sha},ciForSha:options.ciForSha}):null);
 const readLimit=Math.max(1,Math.min(50,Number(options.readLimit||20)));
 return {
  async snapshot(){const t=await api.repositoryTree(branch);return{sha:t.head.sha,treeSha:t.head.treeSha,truncated:!!t.truncated}},
  async inspect({task,snapshot}){const t=await api.repositoryTree(branch);if(t.head.sha!==snapshot.sha)throw Error("inspection-stale");if(t.truncated)throw Error("truncated-tree");const tokens=String(task).toLowerCase().match(/[a-z0-9_.-]{3,}/g)||[];const rows=t.items.filter(x=>x.type==="blob").map(x=>({path:x.path,score:tokens.reduce((n,z)=>n+(x.path.toLowerCase().includes(z)?1:0),0)})).sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path)).slice(0,readLimit);const files=[];for(const row of rows)files.push(await api.readFile(row.path,branch));return{filesRead:files.map(x=>x.path),files,tree:t.items}},
  async research({task,inspection}){const files=Array.isArray(inspection&&inspection.files)?inspection.files:[];const notes=[];if(files.length)notes.push("Inspected "+files.length+" bounded repository files before planning.");const manifests=files.filter(x=>/(^|\/)(package\.json|pyproject\.toml|requirements\.txt|Cargo\.toml|go\.mod)$/i.test(x.path||"")).map(x=>x.path);if(manifests.length)notes.push("Dependency manifests in inspected set: "+manifests.slice(0,10).join(", "));const tests=files.filter(x=>/(test|spec)/i.test(x.path||"")).map(x=>x.path);if(tests.length)notes.push("Nearby test evidence: "+tests.slice(0,10).join(", "));return{notes}},
  async applyAtomic({baseSha,changes}){const t=await api.repositoryTree(branch);if(t.head.sha!==baseSha)throw Error("stale-write");return api.atomicCommit(branch,changes.map(c=>({path:c.path,content:c.content})),"Seven Coding verified candidate")},
  async runTests({candidateSha,changed}){const selection=selectTests(changed);await api.dispatchWorkflow(options.workflow||"seven-tests.yml",branch);if(typeof options.waitForExactRun!=="function")return{ok:false,tests:selection.tests,failures:["exact-ci-wait-adapter-required"]};const run=await options.waitForExactRun(branch,candidateSha);return{ok:run&&run.conclusion==="success",tests:selection.tests,failures:run&&run.conclusion==="success"?[]:["ci:"+String(run&&run.conclusion||"unknown")],run}},
  async diff({baseSha,headSha}){if(typeof options.diff!=="function")throw Error("diff-adapter-required");const out=await options.diff(baseSha,headSha);if(!out||typeof out.text!=="string"||!Array.isArray(out.files))throw Error("authoritative-diff-required");return out},
  async verify(ctx){if(typeof options.verify!=="function")throw Error("verify-adapter-required");const live=await api.repositoryTree(branch);if(!live.head||live.head.sha!==ctx.candidateSha)return{ok:false,failures:["candidate-sha-moved"]};const out=await options.verify(ctx);if(!out||out.ok!==true)return out||{ok:false,failures:["verification-empty"]};return out},
  async propose(ctx){if(typeof verifiedProposal!=="function")throw Error("proposal-adapter-required");return verifiedProposal(ctx)}
 };
}
module.exports={createGithubCodingAdapter};

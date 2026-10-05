"use strict";
const {selectTests}=require("./coding-test-selector.cjs");
function requireApi(api){for(const k of ["repositoryTree","readFile","atomicCommit","dispatchWorkflow"]){if(!api||typeof api[k]!=="function")throw Error("github-api-missing:"+k)}return api}
function createGithubCodingAdapter(api,options={}){
 api=requireApi(api);const branch=String(options.branch||"").trim();if(!branch)throw Error("branch-required");
 const readLimit=Math.max(1,Math.min(50,Number(options.readLimit||20)));
 return {
  async snapshot(){const t=await api.repositoryTree(branch);return{sha:t.head.sha,treeSha:t.head.treeSha,truncated:!!t.truncated}},
  async inspect({task,snapshot}){const t=await api.repositoryTree(branch);if(t.head.sha!==snapshot.sha)throw Error("inspection-stale");if(t.truncated)throw Error("truncated-tree");const tokens=String(task).toLowerCase().match(/[a-z0-9_.-]{3,}/g)||[];const rows=t.items.filter(x=>x.type==="blob").map(x=>({path:x.path,score:tokens.reduce((n,z)=>n+(x.path.toLowerCase().includes(z)?1:0),0)})).sort((a,b)=>b.score-a.score||a.path.localeCompare(b.path)).slice(0,readLimit);const files=[];for(const row of rows)files.push(await api.readFile(row.path,branch));return{filesRead:files.map(x=>x.path),files,tree:t.items}},
  async applyAtomic({baseSha,changes}){const t=await api.repositoryTree(branch);if(t.head.sha!==baseSha)throw Error("stale-write");return api.atomicCommit(branch,changes.map(c=>({path:c.path,content:c.content})),"Seven Coding verified candidate")},
  async runTests({candidateSha,changed}){const selection=selectTests(changed);await api.dispatchWorkflow(options.workflow||"seven-tests.yml",branch);if(typeof options.waitForExactRun!=="function")return{ok:false,tests:selection.tests,failures:["exact-ci-wait-adapter-required"]};const run=await options.waitForExactRun(branch,candidateSha);return{ok:run&&run.conclusion==="success",tests:selection.tests,failures:run&&run.conclusion==="success"?[]:["ci:"+String(run&&run.conclusion||"unknown")],run}},
  async diff({baseSha,headSha}){if(typeof options.diff!=="function")throw Error("diff-adapter-required");return options.diff(baseSha,headSha)},
  async verify(ctx){if(typeof options.verify!=="function")throw Error("verify-adapter-required");return options.verify(ctx)},
  async propose(ctx){if(typeof options.propose!=="function")throw Error("proposal-adapter-required");return options.propose(ctx)}
 };
}
module.exports={createGithubCodingAdapter};
